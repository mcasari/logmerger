import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ onFilesSelected, isProcessing, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    const logFiles = files.filter(file => 
      file.type === 'text/plain' || file.name.endsWith('.log') || 
      file.name.endsWith('.txt')
    );

    if (logFiles.length > 0) {
      onFilesSelected(logFiles);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = '';
  }, [onFilesSelected]);

  const handleBrowseClick = useCallback(() => {
    document.getElementById('file-input').click();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary-50 scale-105' :'border-border hover:border-primary hover:bg-surface'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".log,.txt,text/plain"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-200
            ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary'}
          `}>
            <Icon 
              name={isDragOver ? "Upload" : "FileText"} 
              size={32} 
              color="currentColor" 
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {isDragOver ? 'Drop files here' : 'Upload Log Files'}
            </h3>
            <p className="text-text-secondary max-w-md">
              Drag and drop your log files here, or click to browse. 
              Supports .log and .txt files up to 100MB each.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="primary"
              iconName="FolderOpen"
              iconPosition="left"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              Browse Files
            </Button>
            <span className="text-sm text-text-muted">
              or drag files here
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-text-muted">
            <div className="flex items-center space-x-1">
              <Icon name="FileText" size={14} color="currentColor" />
              <span>TXT, LOG</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="HardDrive" size={14} color="currentColor" />
              <span>Max 100MB</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Files" size={14} color="currentColor" />
              <span>Multiple files</span>
            </div>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2 text-primary">
            <Icon name="Loader2" size={20} className="animate-spin" color="currentColor" />
            <span className="font-medium">Processing files...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;