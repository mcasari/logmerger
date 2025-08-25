import React, { useState, useCallback, useMemo, useRef } from 'react';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import PatternConfiguration from './components/PatternConfiguration';
import LogViewer from './components/LogViewer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';

// Performance configuration for lazy loading
const CHUNK_SIZE = 256 * 1024; // 256KB chunks for processing
const DISPLAY_CHUNK_SIZE = 100; // Show 100 lines per chunk
const PREVIEW_BYTES = 4096; // 4KB for instant preview
const SCROLL_THRESHOLD = 0.8; // Load more when 80% scrolled

const LogMerger = () => {
  const [files, setFiles] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [groupingPattern, setGroupingPattern] = useState('\\[(ERROR|WARN|INFO|DEBUG)\\]');
  const [groupingType, setGroupingType] = useState('log-level'); // 'log-level', 'hour', 'custom'
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedLogLevels, setSelectedLogLevels] = useState(['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [entriesWithoutTimestamp, setEntriesWithoutTimestamp] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [fileChunks, setFileChunks] = useState(new Map()); // Store file chunks for lazy loading
  const [loadedChunks, setLoadedChunks] = useState(0);
  const abortControllerRef = useRef(null);

  // Handle file selection
  const handleFilesSelected = useCallback((selectedFiles) => {
    const newFiles = selectedFiles.map((file, index) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      id: `${file.name}-${Date.now()}-${index}`,
      processed: false,
      error: null,
      lineCount: 0
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((fileId) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    // Also remove entries from removed file
    setLogEntries(prevEntries => prevEntries.filter(entry => entry.fileId !== fileId));
    // Remove file chunks
    setFileChunks(prev => {
      const newChunks = new Map(prev);
      newChunks.delete(fileId);
      return newChunks;
    });
  }, []);

  // Extract timestamp from log line (preserve original format)
  const extractTimestamp = (line) => {
    // Try to extract common timestamp formats, return the original string
    const patterns = [
      /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?)/,
      /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}(?:\.\d{3})?)/,
      /(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)/,
      /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{3})?)/,
      /(\w{3} \d{1,2} \d{2}:\d{2}:\d{2})/,
      /(\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2})/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        // Return the original timestamp string exactly as it appears
        return match[1];
      }
    }
    return null; // Return null instead of generating random timestamps
  };

  // Process a single file and store chunks for lazy loading
  const processFileForLazyLoading = useCallback(async (file, fileInfo, previewLineCount, onProgress) => {
    if (!file) return [];

    try {
      const reader = new FileReader();
      let offset = 0;
      let remainingBuffer = '';
      let lineNumber = previewLineCount + 1; // Start after the preview lines
      let totalProcessed = 0;
      const allChunks = [];
      let currentChunk = [];

      const processChunk = async (chunk) => {
        const text = remainingBuffer + chunk;
        const lines = text.split('\n');
        
        // Keep the last line as it might be incomplete
        remainingBuffer = lines.pop() || '';
        
        const validLines = lines.filter(line => line.trim().length > 0);
        
        for (const line of validLines) {
          const entry = {
            id: `${fileInfo.id}-${lineNumber}`,
            fileId: fileInfo.id,
            fileName: fileInfo.name,
            lineNumber: lineNumber,
            content: line,
            timestamp: extractTimestamp(line),
            originalIndex: lineNumber - 1,
            sortableTimestamp: extractTimestamp(line) ? new Date(extractTimestamp(line)) : new Date(0)
          };

          currentChunk.push(entry);
          lineNumber++;
          totalProcessed++;

          // When we have enough entries for a display chunk, store it
          if (currentChunk.length >= DISPLAY_CHUNK_SIZE) {
            allChunks.push([...currentChunk]);
            currentChunk = [];
            
            // Update progress
            const progress = Math.min((offset / file.size) * 100, 100);
            onProgress?.(progress, totalProcessed);
          }
        }
      };

      const readNextChunk = async () => {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        
        if (chunk.size === 0) {
          // Process any remaining buffer
          if (remainingBuffer.trim()) {
            await processChunk('');
          }
          
          // Add any remaining entries in the current chunk
          if (currentChunk.length > 0) {
            allChunks.push([...currentChunk]);
          }
          
          return allChunks;
        }

        return new Promise((resolve, reject) => {
          reader.onload = async (e) => {
            try {
              const chunk = e.target.result;
              await processChunk(chunk);
              
              offset += CHUNK_SIZE;
              const progress = Math.min((offset / file.size) * 100, 100);
              onProgress?.(progress, totalProcessed);
              
              // Continue reading next chunk
              const result = await readNextChunk();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('Failed to read file chunk'));
          };

          reader.readAsText(chunk);
        });
      };

      return await readNextChunk();

    } catch (error) {
      console.error('Error processing file for lazy loading:', error);
      return [];
    }
  }, []);

  // Process uploaded files with lazy loading
  const handleProcessFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessedFiles(0);
    setLogEntries([]);
    setEntriesWithoutTimestamp(0);
    setLoadedChunks(0);
    setHasMoreData(false);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    const allFileChunks = new Map();
    let processedFileCount = 0;

    try {
      for (const file of files) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        // Show instant preview first (first 4KB)
        const previewChunk = file.file.slice(0, PREVIEW_BYTES);
        const previewText = await previewChunk.text();
        const previewLines = previewText.split('\n').slice(0, 50); // First 50 lines
        
        const previewEntries = previewLines
          .filter(line => line.trim())
          .map((line, index) => ({
            id: `${file.id}-preview-${index}`,
            fileId: file.id,
            fileName: file.name,
            lineNumber: index + 1,
            content: line,
            timestamp: extractTimestamp(line),
            originalIndex: index,
            sortableTimestamp: extractTimestamp(line) ? new Date(extractTimestamp(line)) : new Date(0),
            isPreview: true
          }));

        // Show preview immediately
        setLogEntries(prev => [...prev, ...previewEntries]);

        // Process the rest of the file and store chunks for lazy loading
        console.log(`Processing file: ${file.name}, preview lines: ${previewEntries.length}`);
        const fileChunks = await processFileForLazyLoading(
          file.file.slice(PREVIEW_BYTES),
          file,
          previewEntries.length, // Pass the number of preview lines
          (progress, totalProcessed) => {
            setProcessingProgress(progress);
          }
        );
        console.log(`File ${file.name} processed, chunks:`, fileChunks?.length || 0);

        // Store chunks for this file (ensure it's an array)
        allFileChunks.set(file.id, Array.isArray(fileChunks) ? fileChunks : []);
        
        // Calculate total line count from chunks
        const totalLineCount = (Array.isArray(fileChunks) ? fileChunks.reduce((sum, chunk) => sum + chunk.length, 0) : 0) + previewEntries.length;
        
        processedFileCount++;
        setProcessedFiles(processedFileCount);
        
        // Update file as processed
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id ? { ...f, processed: true, lineCount: totalLineCount } : f
          )
        );

        // Small delay between files to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Store all file chunks for lazy loading
      setFileChunks(allFileChunks);
      
      // Set flag to indicate there's more data to load
      const totalChunks = Array.from(allFileChunks.values()).reduce((sum, chunks) => sum + chunks.length, 0);
      setHasMoreData(totalChunks > 0);

    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      abortControllerRef.current = null;
    }
  }, [files, processFileForLazyLoading]);

  // Load next chunk when user scrolls
  const loadNextChunk = useCallback(async () => {
    if (isLoadingMore || !hasMoreData) return;

    setIsLoadingMore(true);

    try {
      const allChunks = [];
      
      // Get next chunk from each file
      for (const [fileId, chunks] of fileChunks.entries()) {
        if (chunks.length > loadedChunks) {
          allChunks.push(...chunks[loadedChunks]);
        }
      }

      if (allChunks.length > 0) {
        // Add new entries to the list
        setLogEntries(prev => {
          const newEntries = [...prev, ...allChunks];
          
          // Sort only the valid entries with timestamps
          const validEntries = newEntries.filter(entry => 
            entry.timestamp && entry.sortableTimestamp && !isNaN(entry.sortableTimestamp.getTime())
          );
          
          const invalidEntries = newEntries.length - validEntries.length;
          setEntriesWithoutTimestamp(invalidEntries);
          
          // Sort by timestamp
          validEntries.sort((a, b) => a.sortableTimestamp - b.sortableTimestamp);
          
          return validEntries;
        });

        const newLoadedChunks = loadedChunks + 1;
        setLoadedChunks(newLoadedChunks);
        
        // Check if we have more chunks to load
        const maxChunks = Math.max(...Array.from(fileChunks.values()).map(chunks => chunks.length));
        setHasMoreData(newLoadedChunks < maxChunks);
      }
    } catch (error) {
      console.error('Error loading next chunk:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreData, fileChunks, loadedChunks]);

  // Handle scroll to load more data
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested) return;
    
    // Load more when user scrolls to 80% of content
    if (scrollOffset > 0 && hasMoreData && !isLoadingMore) {
      loadNextChunk();
    }
  }, [hasMoreData, isLoadingMore, loadNextChunk]);

  // Cancel processing
  const handleCancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, []);

  // Extract log level from entry content
  const extractLogLevel = useCallback((content) => {
    const patterns = [
      /\[(ERROR|WARN|INFO|DEBUG|TRACE)\]/i,  // [ERROR], [INFO], etc.
      /\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/i,  // ERROR, INFO, etc. (word boundaries)
      /^(ERROR|WARN|INFO|DEBUG|TRACE):/i,    // ERROR:, INFO:, etc. (start of line)
      /(ERROR|WARN|INFO|DEBUG|TRACE)\s+/i    // ERROR , INFO , etc. (followed by space)
    ];
    
    for (const pattern of patterns) {
      const levelMatch = content.match(pattern);
      if (levelMatch) {
        const level = levelMatch[1] || levelMatch[0];
        return level.toUpperCase();
      }
    }
    return null;
  }, []);

  // Filter entries by selected log levels
  const filteredByLogLevel = useMemo(() => {
    if (selectedLogLevels.length === 0) return logEntries;
    
    return logEntries.filter(entry => {
      const level = extractLogLevel(entry.content);
      return level && selectedLogLevels.includes(level);
    });
  }, [logEntries, selectedLogLevels, extractLogLevel]);

  // Calculate log level counts for the selector
  const logLevelCounts = useMemo(() => {
    const counts = {};
    logEntries.forEach(entry => {
      const level = extractLogLevel(entry.content);
      if (level) {
        counts[level] = (counts[level] || 0) + 1;
      }
    });
    return counts;
  }, [logEntries, extractLogLevel]);

  // Group log entries based on the selected pattern
  const groupedEntries = useMemo(() => {
    if (filteredByLogLevel.length === 0) return [];

    const groups = new Map();

    filteredByLogLevel.forEach(entry => {
      let groupKey = 'Other';

      try {
        if (groupingType === 'log-level') {
          const level = extractLogLevel(entry.content);
          groupKey = level || 'Other';
        } else if (groupingType === 'hour') {
          const hour = new Date(entry.timestamp).getHours();
          groupKey = `Hour ${hour.toString().padStart(2, '0')}:00`;
        } else if (groupingType === 'custom' && groupingPattern) {
          const regex = new RegExp(groupingPattern, 'i');
          const match = entry.content.match(regex);
          groupKey = match ? (match[1] || match[0]) : 'Other';
        }
      } catch (error) {
        console.error('Pattern matching error:', error);
        groupKey = 'Other';
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey.toLowerCase().replace(/\s+/g, '-'),
          name: groupKey,
          entries: [],
          count: 0
        });
      }

      groups.get(groupKey).entries.push(entry);
      groups.get(groupKey).count++;
    });

    return Array.from(groups.values()).sort((a, b) => b.count - a.count);
  }, [filteredByLogLevel, groupingPattern, groupingType, extractLogLevel]);

  // Filter entries based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedEntries;

    const query = searchQuery.toLowerCase();
    return groupedEntries.map(group => ({
      ...group,
      entries: group.entries.filter(entry => 
        entry.content.toLowerCase().includes(query) ||
        entry.fileName.toLowerCase().includes(query)
      )
    })).filter(group => group.entries.length > 0);
  }, [groupedEntries, searchQuery]);

  // Handle log level selection
  const handleLogLevelToggle = useCallback((level) => {
    setSelectedLogLevels(prev => {
      if (prev.includes(level)) {
        return prev.filter(l => l !== level);
      } else {
        return [...prev, level];
      }
    });
  }, []);

  const handleSelectAllLogLevels = useCallback(() => {
    setSelectedLogLevels(['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']);
  }, []);

  const handleClearAllLogLevels = useCallback(() => {
    setSelectedLogLevels([]);
  }, []);

  // Handle group collapse/expand
  const handleGroupToggle = useCallback((groupId) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Clear all data
  const handleClearAll = useCallback(() => {
    setFiles([]);
    setLogEntries([]);
    setCollapsedGroups(new Set());
    setSearchQuery('');
    setSelectedLogLevels(['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']);
    setEntriesWithoutTimestamp(0);
  }, []);

  const totalEntries = logEntries.length;
  const filteredEntries = filteredGroups.reduce((total, group) => total + group.entries.length, 0);
  
  // Count entries that match the grouping pattern (excluding "Other" group)
  const patternMatchedEntries = groupedEntries
    .filter(group => group.name !== 'Other')
    .reduce((total, group) => total + group.entries.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-text-primary">
                  Log Analysis
                </h1>
                <p className="text-text-secondary">
                  Upload, merge, and view log files with automatic grouping and chronological sorting
                </p>
              </div>
              
              {totalEntries > 0 && (
                <Button
                  variant="outline"
                  iconName="Trash2"
                  iconSize={16}
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </div>
            
            {/* Stats */}
            {totalEntries > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Files" size={20} color="var(--color-primary)" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{files.length}</div>
                      <div className="text-sm text-text-secondary">Files</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="List" size={20} color="var(--color-accent)" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{totalEntries.toLocaleString()}</div>
                      <div className="text-sm text-text-secondary">Total Lines Processed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Filter" size={20} color="var(--color-success)" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{filteredEntries.toLocaleString()}</div>
                      <div className="text-sm text-text-secondary">Filtered Lines</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Layers" size={20} color="var(--color-warning)" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{filteredGroups.length}</div>
                      <div className="text-sm text-text-secondary">Groups</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Activity" size={20} color="var(--color-accent)" />
                    <div>
                      <div className="text-2xl font-bold text-text-primary">{selectedLogLevels.length}/5</div>
                      <div className="text-sm text-text-secondary">Log Levels Active</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <FileUploadZone
                files={files}
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                onProcessFiles={handleProcessFiles}
                isProcessing={isProcessing}
              />
            </div>

            {/* Middle Column - Pattern Configuration */}
            <div className="space-y-6">
              <PatternConfiguration
                groupingPattern={groupingPattern}
                groupingType={groupingType}
                onPatternChange={setGroupingPattern}
                onTypeChange={setGroupingType}
                sampleEntries={logEntries.slice(0, 3)}
                selectedLogLevels={selectedLogLevels}
                onLogLevelToggle={handleLogLevelToggle}
                onSelectAllLogLevels={handleSelectAllLogLevels}
                onClearAllLogLevels={handleClearAllLogLevels}
                logLevelCounts={logLevelCounts}
              />
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Actions */}
              <div className="bg-surface border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant={files.length > 0 && !isProcessing ? "primary" : "secondary"}
                    disabled={files.length === 0 || isProcessing}
                    onClick={handleProcessFiles}
                    fullWidth
                    className="flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <ButtonSpinner />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Play" size={16} />
                        <span>Process Files</span>
                      </>
                    )}
                  </Button>
                  
                  {isProcessing && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-text-secondary">
                          <span>Progress: {Math.round(processingProgress)}%</span>
                          <span>Files: {processedFiles}/{files.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        iconName="X"
                        iconSize={16}
                        onClick={handleCancelProcessing}
                        fullWidth
                        className="flex items-center justify-center space-x-2"
                      >
                        Cancel Processing
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconSize={16}
                    disabled={totalEntries === 0}
                    onClick={() => {
                      // Simple export functionality
                      const exportData = filteredGroups.map(group => ({
                        group: group.name,
                        count: group.count,
                        entries: group.entries.map(e => ({
                          file: e.fileName,
                          line: e.lineNumber,
                          content: e.content,
                          timestamp: e.timestamp
                        }))
                      }));
                      
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                        type: 'application/json' 
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `log-export-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    fullWidth
                  >
                    Export Results
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Log Viewer - Full Width */}
          {totalEntries > 0 && (
            <div className="mt-8">
              <LogViewer
                groups={filteredGroups}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                collapsedGroups={collapsedGroups}
                onGroupToggle={handleGroupToggle}
                onScroll={handleScroll}
                isLoadingMore={isLoadingMore}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LogMerger;