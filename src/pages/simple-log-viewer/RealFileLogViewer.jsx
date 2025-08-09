import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useLogParser } from '../../components/ChunkedFileReader';

const CHUNK_SIZE = 500; // Smaller chunks for faster initial display
const ITEM_HEIGHT = 80; // Height of each log entry in pixels
const INITIAL_CHUNKS = 1; // Only 1 chunk for ultra-fast start
const PROGRESSIVE_CHUNK_SIZE = 100; // Much smaller increments for instant feedback
const PREVIEW_SIZE = 50; // Show first 50 lines instantly as preview
const PREVIEW_BYTES = 4096; // Read only first 4KB for instant preview

const RealFileLogViewer = () => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedChunks, setLoadedChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLines, setTotalLines] = useState(0);
  const [fileProcessingProgress, setFileProcessingProgress] = useState(0);
  const listRef = useRef(null);
  const fileInputRef = useRef(null);

  const { parseLogLine } = useLogParser();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // ULTRA-SIMPLE: Just read first few lines immediately
  const showSimplePreview = useCallback(async (file) => {
    try {
      // Read ONLY first 2KB - tiny amount for instant display
      const previewChunk = file.slice(0, 2048);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').slice(0, 20); // ONLY 20 lines
        
        // NO PARSING AT ALL - just display raw
        const previewEntries = lines
          .filter(line => line.trim())
          .map((line, index) => ({
            id: `simple-${index}`,
            line: index + 1,
            timestamp: '',
            level: 'PREVIEW',
            message: line,
            originalMessage: line
          }));
        
        setLogContent(previewEntries);
        setLoadedChunks(1);
        setTotalLines(previewEntries.length);
        setIsLoading(false);
      };
      
      reader.readAsText(previewChunk);
    } catch (error) {
      console.error('Simple preview failed:', error);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      file: file,
      lineCount: 0,
      processed: false
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // SIMPLE: Just show preview immediately, that's it!
    if (newFiles.length > 0) {
      const firstFile = newFiles[0];
      setSelectedFile(firstFile);
      setIsLoading(true);
      
      // Show simple preview immediately
      await showSimplePreview(firstFile.file);
    }
  }, [showSimplePreview]);

  // REVOLUTIONARY: Process file instantly without blocking parsing
  const processFileInstantly = useCallback(async (fileInfo) => {
    if (!fileInfo.file) return;

    setSelectedFile(fileInfo);
    setLogContent([]);
    setLoadedChunks(0);
    setTotalLines(0);
    setIsLoading(false); // No loading state - instant display!

    const onContentDisplay = (entries, isInstant) => {
      if (isInstant) {
        // Replace content for instant display
        setLogContent(entries);
        setLoadedChunks(1);
        setTotalLines(entries.length);
      } else {
        // Append content as it streams in
        setLogContent(prev => [...prev, ...entries]);
        setTotalLines(prev => prev + entries.length);
        setLoadedChunks(prev => Math.ceil((prev * CHUNK_SIZE + entries.length) / CHUNK_SIZE));
      }
    };

    const onComplete = () => {
      setIsLoading(false);
      
      // Update file info
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileInfo.id 
          ? { ...f, processed: true, lineCount: totalLines }
          : f
      ));
    };

    const onError = (error) => {
      console.error('Error processing file instantly:', error);
      setIsLoading(false);
      // Fallback to regular processing
      setUseInstantMode(false);
      processFile(fileInfo);
    };

    await readFileInstantly(fileInfo.file, onContentDisplay, onComplete, onError);
  }, [readFileInstantly, totalLines, processFile]);

  // Process a single file with progressive rendering
  const processFile = useCallback(async (fileInfo) => {
    if (!fileInfo.file) return;

    // Don't clear content if we're already showing preview
    if (!isShowingPreview) {
      setSelectedFile(fileInfo);
      setLogContent([]);
      setLoadedChunks(0);
      setTotalLines(0);
    }
    
    setIsLoading(true);
    setIsShowingPreview(false); // No longer just preview

    const allLines = [];
    let lineNumber = 1;
    let displayedLines = 0;

    const onChunkProcessed = (lines, totalProcessed) => {
      const parsedLines = lines.map(line => parseLogLine(line, lineNumber++));
      allLines.push(...parsedLines);
      
      // Progressive rendering: show content as it's being processed
      if (allLines.length - displayedLines >= PROGRESSIVE_CHUNK_SIZE || 
          allLines.length >= INITIAL_CHUNKS * CHUNK_SIZE) {
        
        const newDisplayLines = Math.min(
          allLines.length, 
          displayedLines + PROGRESSIVE_CHUNK_SIZE
        );
        
        setLogContent(allLines.slice(0, newDisplayLines));
        setLoadedChunks(Math.ceil(newDisplayLines / CHUNK_SIZE));
        displayedLines = newDisplayLines;
      }
      
      setFileProcessingProgress((totalProcessed / (fileInfo.size / 1024)) * 100);
    };

    const onComplete = () => {
      setTotalLines(allLines.length);
      setLogContent(allLines);
      setLoadedChunks(Math.ceil(allLines.length / CHUNK_SIZE));
      setIsLoading(false);
      setFileProcessingProgress(0);
      
      // Store processed data for future access
      const processedFileInfo = {
        ...fileInfo,
        lineCount: allLines.length,
        processed: true,
        logContent: allLines
      };
      
      // Update file info
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileInfo.id ? processedFileInfo : f
      ));
    };

    const onError = (error) => {
      console.error('Error processing file:', error);
      setIsLoading(false);
      setFileProcessingProgress(0);
    };

    await readFileInChunks(fileInfo.file, onChunkProcessed, onComplete, onError);
  }, [readFileInChunks, parseLogLine]);

  // Load more chunks when needed
  const loadMoreChunks = useCallback(async () => {
    if (isLoading || loadedChunks * CHUNK_SIZE >= totalLines) return;

    setIsLoading(true);
    const startIndex = loadedChunks * CHUNK_SIZE;
    const endIndex = Math.min(startIndex + CHUNK_SIZE, totalLines);
    const newChunk = logContent.slice(startIndex, endIndex);
    
    setLogContent(prev => [...prev, ...newChunk]);
    setLoadedChunks(prev => prev + 1);
    setIsLoading(false);
  }, [isLoading, loadedChunks, totalLines, logContent]);

  // Handle scroll to load more data
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested) return;
    
    const listHeight = 600;
    const scrollPosition = scrollOffset + listHeight;
    const totalHeight = logContent.length * ITEM_HEIGHT;
    
    // Load more when user scrolls to 80% of loaded content
    if (scrollPosition > totalHeight * 0.8) {
      loadMoreChunks();
    }
  }, [logContent.length, loadMoreChunks]);

  // Filter log content based on search
  const filteredLogContent = useMemo(() => {
    if (!searchQuery.trim()) return logContent;
    
    return logContent.filter(entry => 
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.timestamp.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logContent, searchQuery]);

  // Virtualized row renderer
  const Row = useCallback(({ index, style }) => {
    const entry = filteredLogContent[index];
    if (!entry) return null;

    const getLogLevelBackground = (level, isRaw = false) => {
      if (isRaw) {
        return 'bg-blue-25 border-l-4 border-l-blue-300'; // Special styling for raw content
      }
      
      switch (level) {
        case 'ERROR':
          return 'bg-red-50 border-l-4 border-l-red-400';
        case 'WARN':
          return 'bg-yellow-50 border-l-4 border-l-yellow-400';
        case 'INFO':
          return 'bg-green-50 border-l-4 border-l-green-400';
        case 'DEBUG':
          return 'bg-purple-50 border-l-4 border-l-purple-400';
        case 'TRACE':
          return 'bg-gray-50 border-l-4 border-l-gray-400';
        case 'RAW':
          return 'bg-blue-25 border-l-4 border-l-blue-300';
        default:
          return '';
      }
    };

    return (
      <div
        style={style}
        className={`hover:bg-surface-hover transition-colors ${getLogLevelBackground(entry.level, entry.isRaw)}`}
      >
        <div className="p-3">
          <div className="flex items-start space-x-3">
            <span className="text-xs text-text-muted font-mono bg-background px-2 py-1 rounded">
              {entry.line}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-text-primary break-all">
                {entry.message}
              </div>
              {!entry.isRaw && (
                <div className="flex items-center space-x-2 mt-1 text-xs text-text-muted">
                  {entry.timestamp && (
                    <>
                      <span>{entry.timestamp}</span>
                      <span>•</span>
                    </>
                  )}
                  <span
                    className={`
                      px-2 py-0.5 rounded text-xs font-medium
                      ${entry.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                        entry.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                        entry.level === 'INFO'? 'bg-green-100 text-green-700' : 
                        entry.level === 'RAW' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }
                    `}
                  >
                    {entry.level}
                  </span>
                </div>
              )}
              {entry.isRaw && (
                <div className="text-xs text-blue-600 mt-1">
                  Raw content - parsing in background...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [filteredLogContent]);

  const handleBackToUpload = () => {
    navigate('/file-upload-dashboard');
  };

  const handleExport = () => {
    const content = filteredLogContent.map(entry => entry.message).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (fileInfo) => {
    if (fileInfo.processed) {
      setSelectedFile(fileInfo);
      setLogContent(fileInfo.logContent || []);
      setLoadedChunks(INITIAL_CHUNKS);
      setTotalLines(fileInfo.lineCount || 0);
    } else {
      processFile(fileInfo);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Icon name="FileText" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Real File Log Viewer</h1>
                <p className="text-text-secondary">
                  Upload and view large log files with chunked loading
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={useInstantMode ? "primary" : "outline"}
                iconName="Zap"
                onClick={() => setUseInstantMode(!useInstantMode)}
                size="sm"
              >
                {useInstantMode ? 'Instant Mode' : 'Standard Mode'}
              </Button>
              <Button
                variant="ghost"
                iconName="Download"
                onClick={handleExport}
                disabled={filteredLogContent.length === 0}
              >
                Export
              </Button>
              <Button
                variant="ghost"
                iconName="ArrowLeft"
                onClick={handleBackToUpload}
              >
                Back to Upload
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            <div className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".log,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  iconName="Upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReading}
                >
                  Upload Log Files
                </Button>
                {isReading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-text-secondary">
                      Processing... {Math.round(progress)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* File Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-3">Uploaded Files</h3>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary">
                    <Icon name="Upload" size={32} color="currentColor" className="mx-auto mb-2" />
                    <p>No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`
                          w-full text-left p-3 rounded-md transition-colors
                          ${selectedFile?.id === file.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background hover:bg-surface-hover'
                          }
                        `}
                      >
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs opacity-75">
                          {(file.size / 1024).toFixed(1)} KB
                          {file.processed && ` • ${file.lineCount?.toLocaleString()} lines`}
                        </div>
                        {file.id === selectedFile?.id && isReading && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-primary h-1 rounded-full transition-all duration-300"
                                style={{ width: `${fileProcessingProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="mt-4">
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon="Search"
                  />
                </div>

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-text-secondary space-y-1">
                    <div>Total entries: {totalLines.toLocaleString()}</div>
                    <div>Loaded: {logContent.length.toLocaleString()}</div>
                    <div>Filtered: {filteredLogContent.length.toLocaleString()}</div>
                    {searchQuery && (
                      <div>Matches: {filteredLogContent.length.toLocaleString()}</div>
                    )}
                    {isLoading && (
                      <div className="text-primary">Loading more data...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Log Content */}
            <div className="lg:col-span-3">
              <div className="bg-surface border border-border rounded-lg">
                <div className="border-b border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="FileText" size={16} color="var(--color-primary)" />
                      <span className="font-medium text-text-primary">
                        {selectedFile?.name || 'Select a file'}
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {filteredLogContent.length.toLocaleString()} entries
                    </span>
                  </div>
                </div>

                <div className="h-[600px]">
                  {filteredLogContent.length > 0 ? (
                    <List
                      ref={listRef}
                      height={600}
                      itemCount={filteredLogContent.length}
                      itemSize={ITEM_HEIGHT}
                      onScroll={handleScroll}
                      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                      {Row}
                    </List>
                  ) : (
                    <div className="p-8 text-center text-text-secondary">
                      {searchQuery ? (
                        <>
                          <Icon name="Search" size={32} color="currentColor" className="mx-auto mb-2" />
                          <p>No matches found for "{searchQuery}"</p>
                        </>
                      ) : (
                        <>
                          <Icon name="FileText" size={32} color="currentColor" className="mx-auto mb-2" />
                          <p>Upload a log file to view its content</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RealFileLogViewer; 