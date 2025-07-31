import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const SimpleLogViewer = () => {
  const navigate = useNavigate();
  const [mergedFiles, setMergedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState([]);

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

  // Generate mock log content for selected file
  useEffect(() => {
    if (!selectedFile) return;

    // Generate mock log entries based on file
    const mockEntries = Array.from({ length: Math.min(selectedFile.lineCount || 100, 1000) }, (_, i) => {
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
      
      // Keep original timestamp format as it would appear in actual log files
      const originalTimestampFormat = (date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };
      
      // Store the original timestamp string format
      const originalTimestamp = originalTimestampFormat(timestamp);
      
      return {
        id: `log-${i}`,
        line: i + 1,
        timestamp: originalTimestamp, // Keep as original string format
        level: level,
        message: `[${level}] ${originalTimestamp} - ${messages[Math.floor(Math.random() * messages.length)]} (${selectedFile.name}:${i + 1})`,
        source: selectedFile.name
      };
    }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    setLogContent(mockEntries);
  }, [selectedFile]);

  // Filter log content based on search
  const filteredLogContent = useMemo(() => {
    if (!searchQuery.trim()) return logContent;
    
    return logContent.filter(entry => 
      entry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logContent, searchQuery]);

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
                    <div>Total entries: {logContent.length}</div>
                    <div>Filtered: {filteredLogContent.length}</div>
                    {searchQuery && (
                      <div>Matches: {filteredLogContent.length}</div>
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
                      {filteredLogContent.length} entries
                    </span>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {filteredLogContent.length > 0 ? (
                    <div className="divide-y divide-border">
                      {filteredLogContent.map((entry) => {
                        const getLogLevelBackground = (level) => {
                          switch (level) {
                            case 'ERROR':
                              return 'bg-red-50 border-l-4 border-l-red-400';
                            case 'WARN':
                              return 'bg-yellow-50 border-l-4 border-l-yellow-400';
                            case 'INFO':
                              return 'bg-blue-50 border-l-4 border-l-blue-400';
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
                            key={entry.id}
                            className={`p-3 hover:bg-surface-hover transition-colors ${getLogLevelBackground(entry.level)}`}
                          >
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
                                        entry.level === 'INFO'? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                      }
                                    `}
                                  >
                                    {entry.level}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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