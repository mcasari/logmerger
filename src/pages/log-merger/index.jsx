import React, { useState, useCallback, useMemo } from 'react';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import PatternConfiguration from './components/PatternConfiguration';
import LogViewer from './components/LogViewer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const LogMerger = () => {
  const [files, setFiles] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  const [groupingPattern, setGroupingPattern] = useState('\\[(ERROR|WARN|INFO|DEBUG)\\]');
  const [groupingType, setGroupingType] = useState('log-level'); // 'log-level', 'hour', 'custom'
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [entriesWithoutTimestamp, setEntriesWithoutTimestamp] = useState(0);

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
  }, []);

  // Process uploaded files and merge log lines
  const handleProcessFiles = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    const allEntries = [];

    try {
      for (const file of files) {
        const text = await file.file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        const fileEntries = lines.map((line, index) => ({
          id: `${file.id}-${index}`,
          fileId: file.id,
          fileName: file.name,
          lineNumber: index + 1,
          content: line,
          timestamp: extractTimestamp(line), // Keep original timestamp string or null
          originalIndex: index,
          sortableTimestamp: extractTimestamp(line) ? new Date(extractTimestamp(line)) : new Date(0) // For sorting only
        }));

        allEntries.push(...fileEntries);

        // Update file as processed
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id ? { ...f, processed: true, lineCount: lines.length } : f
          )
        );
      }

      // Filter out entries without valid timestamps and sort by timestamp
      const validEntries = allEntries.filter(entry => 
        entry.timestamp && entry.sortableTimestamp && !isNaN(entry.sortableTimestamp.getTime())
      );
      
      const invalidEntries = allEntries.length - validEntries.length;
      setEntriesWithoutTimestamp(invalidEntries);
      
      validEntries.sort((a, b) => a.sortableTimestamp - b.sortableTimestamp);
      setLogEntries(validEntries);

    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

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

  // Group log entries based on the selected pattern
  const groupedEntries = useMemo(() => {
    if (logEntries.length === 0) return [];

    const groups = new Map();

    logEntries.forEach(entry => {
      let groupKey = 'Other';

      try {
        if (groupingType === 'log-level') {
          const levelMatch = entry.content.match(/\[(ERROR|WARN|INFO|DEBUG)\]/i);
          groupKey = levelMatch ? levelMatch[1].toUpperCase() : 'Other';
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
  }, [logEntries, groupingPattern, groupingType]);

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
    setEntriesWithoutTimestamp(0);
  }, []);

  const totalEntries = logEntries.length;
  const filteredEntries = filteredGroups.reduce((total, group) => total + group.entries.length, 0);

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
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      <div className="text-sm text-text-secondary">Total Lines</div>
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
                
                {entriesWithoutTimestamp > 0 && (
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="Clock" size={20} color="var(--color-error)" />
                      <div>
                        <div className="text-2xl font-bold text-text-primary">{entriesWithoutTimestamp.toLocaleString()}</div>
                        <div className="text-sm text-text-secondary">No Timestamp</div>
                      </div>
                    </div>
                  </div>
                )}
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
              />
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    variant={files.length > 0 && !isProcessing ? "primary" : "secondary"}
                    disabled={files.length === 0 || isProcessing}
                    onClick={handleProcessFiles}
                    iconName={isProcessing ? "Loader2" : "Play"}
                    iconSize={16}
                    className={isProcessing ? "animate-spin" : ""}
                    fullWidth
                  >
                    {isProcessing ? 'Processing...' : 'Process Files'}
                  </Button>
                  
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
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LogMerger;