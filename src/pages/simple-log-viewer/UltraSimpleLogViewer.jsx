import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ITEM_HEIGHT = 80;

const UltraSimpleLogViewer = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [logContent, setLogContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ULTRA-SIMPLE: Just read first part of file and display immediately
  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0];
    setSelectedFile({ name: file.name, size: file.size });
    setIsLoading(true);
    
    try {
      // Read ONLY first 10KB for instant display
      const chunk = file.slice(0, 10240);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        
        // Create entries with ZERO processing
        const entries = lines
          .filter(line => line.trim())
          .slice(0, 100) // Only first 100 lines
          .map((line, index) => ({
            id: index,
            line: index + 1,
            message: line,
            level: 'RAW'
          }));
        
        setLogContent(entries);
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        setIsLoading(false);
        console.error('Failed to read file');
      };
      
      reader.readAsText(chunk);
      
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  }, []);

  // Simple search filter
  const filteredLogContent = useMemo(() => {
    if (!searchQuery.trim()) return logContent;
    return logContent.filter(entry => 
      entry.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [logContent, searchQuery]);

  // Simple row renderer
  const Row = useCallback(({ index, style }) => {
    const entry = filteredLogContent[index];
    if (!entry) return null;

    return (
      <div style={style} className="hover:bg-surface-hover transition-colors bg-background">
        <div className="p-3">
          <div className="flex items-start space-x-3">
            <span className="text-xs text-text-muted font-mono bg-surface px-2 py-1 rounded">
              {entry.line}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-sm text-text-primary break-all">
                {entry.message}
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
                <h1 className="text-2xl font-bold text-text-primary">Ultra-Simple Log Viewer</h1>
                <p className="text-text-secondary">
                  Instant file preview - first 100 lines only
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
                  accept=".log,.txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  iconName="Upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Upload Log File'}
                </Button>
                {selectedFile && (
                  <span className="text-sm text-text-secondary">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search in first 100 lines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon="Search"
            />
          </div>

          {/* Content */}
          <div className="bg-surface border border-border rounded-lg">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="FileText" size={16} color="var(--color-primary)" />
                  <span className="font-medium text-text-primary">
                    {selectedFile?.name || 'No file selected'}
                  </span>
                </div>
                <span className="text-sm text-text-secondary">
                  {filteredLogContent.length} lines
                </span>
              </div>
            </div>

            <div className="h-[600px]">
              {filteredLogContent.length > 0 ? (
                <List
                  height={600}
                  itemCount={filteredLogContent.length}
                  itemSize={ITEM_HEIGHT}
                >
                  {Row}
                </List>
              ) : (
                <div className="p-8 text-center text-text-secondary">
                  {isLoading ? (
                    <>
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p>Loading first 100 lines...</p>
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={32} color="currentColor" className="mx-auto mb-2" />
                      <p>Upload a file to see instant preview</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UltraSimpleLogViewer;
