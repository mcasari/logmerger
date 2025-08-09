import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const CHUNK_SIZE = 200; // Even smaller chunks for ultra-fast loading
const ITEM_HEIGHT = 80; // Height of each log entry in pixels
const INITIAL_CHUNKS = 1; // Just one chunk for instant start
const PREVIEW_LINES = 50; // Show only 50 lines immediately

const SimpleLogViewer = () => {
  const navigate = useNavigate();
  const [mergedFiles, setMergedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState([]);
  const [loadedChunks, setLoadedChunks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLines, setTotalLines] = useState(0);
  const listRef = useRef(null);

  // Load merged files from localStorage
  useEffect(() => {
    const storedFiles = localStorage.getItem('mergedLogFiles');
    if (storedFiles) {
      const files = JSON.parse(storedFiles);
      setMergedFiles(files);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    }
  }, []);

  // Generate log content in chunks
  const generateLogChunk = useCallback((startIndex, chunkSize, fileName) => {
    const chunk = [];
    const endIndex = Math.min(startIndex + chunkSize, totalLines);
    
    for (let i = startIndex; i < endIndex; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7);
      const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const messages = [
        'User authentication successful',
        'Database connection established',
        'Cache invalidated for user session',
        'API request processed successfully',
        'Memory usage within normal limits',
        'Service startup completed',
        'Configuration loaded from file',
        'Background task executed'
      ];
      
      const originalTimestampFormat = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      const originalTimestamp = originalTimestampFormat(timestamp);
      
      chunk.push({
        id: `log-${i}`,
        line: i + 1,
        timestamp: originalTimestamp,
        level: level,
        message: `[${level}] ${originalTimestamp} - ${messages[Math.floor(Math.random() * messages.length)]} (${fileName}:${i + 1})`,
        source: fileName
      });
    }
    
    return chunk;
  }, [totalLines]);

  // Initialize log content when file changes
  useEffect(() => {
    if (!selectedFile) return;

    setIsLoading(true);
    const fileLineCount = selectedFile.lineCount || 100000; // Simulate large file
    setTotalLines(fileLineCount);
    setLoadedChunks(0);
    setLogContent([]);

    // Load initial chunks - ultra fast with minimal content
    const loadInitialChunks = async () => {
      // Show just a preview first for instant feedback
      const previewContent = generateLogChunk(0, PREVIEW_LINES, selectedFile.name);
      setLogContent(previewContent);
      setLoadedChunks(1);
      setIsLoading(false);
      
      // Load remaining content in background
      setTimeout(() => {
        const remainingContent = generateLogChunk(PREVIEW_LINES, CHUNK_SIZE - PREVIEW_LINES, selectedFile.name);
        setLogContent(prev => [...prev, ...remainingContent]);
      }, 50);
    };

    loadInitialChunks();
  }, [selectedFile, generateLogChunk]);

  // Load more chunks when needed
  const loadMoreChunks = useCallback(async () => {
    if (isLoading || loadedChunks * CHUNK_SIZE >= totalLines) return;

    setIsLoading(true);
    const newChunks = [];
    const chunksToLoad = Math.min(2, Math.ceil((totalLines - loadedChunks * CHUNK_SIZE) / CHUNK_SIZE));
    
    for (let i = 0; i < chunksToLoad; i++) {
      const chunkIndex = loadedChunks + i;
      const chunk = generateLogChunk(chunkIndex * CHUNK_SIZE, CHUNK_SIZE, selectedFile.name);
      newChunks.push(...chunk);
    }
    
    setLogContent(prev => [...prev, ...newChunks]);
    setLoadedChunks(prev => prev + chunksToLoad);
    setIsLoading(false);
  }, [isLoading, loadedChunks, totalLines, generateLogChunk, selectedFile]);

  // Handle scroll to load more data
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }) => {
    if (scrollUpdateWasRequested) return;
    
    const listHeight = 600; // Height of the list container
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
      entry.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logContent, searchQuery]);

  // Virtualized row renderer
  const Row = useCallback(({ index, style }) => {
    const entry = filteredLogContent[index];
    if (!entry) return null;

    const getLogLevelBackground = (level) => {
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
        default:
          return '';
      }
    };

    return (
      <div
        style={style}
        className={`hover:bg-surface-hover transition-colors ${getLogLevelBackground(entry.level)}`}
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
              <div className="flex items-center space-x-2 mt-1 text-xs text-text-muted">
                <span>
                  {entry.timestamp}
                </span>
                <span>•</span>
                <span
                  className={`
                    px-2 py-0.5 rounded text-xs font-medium
                    ${entry.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                      entry.level === 'WARN' ? 'bg-yellow-100 text-yellow-700' :
                      entry.level === 'INFO'? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }
                  `}
                >
                  {entry.level}
                </span>
              </div>
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
    a.download = `merged-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (mergedFiles.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 text-center">
            <div className="mb-8">
              <Icon name="FileText" size={64} color="var(--color-text-secondary)" className="mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">No Log Files</h1>
              <p className="text-text-secondary">Upload some log files first to view them here.</p>
            </div>
            <Button
              variant="primary"
              iconName="Upload"
              onClick={handleBackToUpload}
            >
              Upload Log Files
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-text-primary">Log Viewer</h1>
                <p className="text-text-secondary">
                  Viewing merged content from {mergedFiles.length} files
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                iconName="Download"
                onClick={handleExport}
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* File Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-surface border border-border rounded-lg p-4">
                <h3 className="font-medium text-text-primary mb-3">Source Files</h3>
                <div className="space-y-2">
                  {mergedFiles.map((file, index) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
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
                      </div>
                    </button>
                  ))}
                </div>

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
                          <p>Select a file to view its content</p>
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

export default SimpleLogViewer;