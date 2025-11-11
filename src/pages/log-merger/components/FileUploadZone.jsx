import React, { useState, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FileUploadZone = ({ 
  files, 
  onFilesSelected, 
  onRemoveFile, 
  onProcessFiles, 
  isProcessing, 
  className = '' 
}) => {
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

    const droppedFiles = Array.from(e.dataTransfer.files);
    const logFiles = droppedFiles.filter(file => 
      file.type === 'text/plain' || file.name.endsWith('.log') || 
      file.name.endsWith('.txt')
    );

    if (logFiles.length > 0) {
      onFilesSelected(logFiles);
    }
  }, [onFilesSelected]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
    e.target.value = '';
  }, [onFilesSelected]);

  const handleBrowseClick = useCallback(() => {
    document.getElementById('file-input').click();
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${isDragOver 
            ? 'border-primary bg-primary-50' :'border-border hover:border-primary hover:bg-surface-hover'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
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

        <div className="space-y-3">
          <div className={`
            w-12 h-12 mx-auto rounded-full flex items-center justify-center
            ${isDragOver ? 'bg-primary text-primary-foreground' : 'bg-surface text-text-secondary'}
          `}>
            <Icon 
              name={isDragOver ? "Upload" : "FileText"} 
              size={24} 
              color="currentColor" 
            />
          </div>
          
          <div>
            <p className="text-sm text-text-primary font-medium">
              {isDragOver ? 'Drop files here' : 'Drop log files or click to browse'}
            </p>
            <p className="text-sm text-text-secondary">
              Supports .log and .txt files
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-primary">
              Uploaded Files ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              iconSize={14}
              onClick={() => files.forEach(f => onRemoveFile(f.id))}
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-background border border-border rounded-md"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center
                    ${file.processed 
                      ? 'bg-success-100 text-success-700' 
                      : file.error 
                        ? 'bg-error-100 text-error-700' :'bg-accent-100 text-accent-700'
                    }
                  `}>
                    <Icon 
                      name={file.processed ? "CheckCircle" : file.error ? "AlertCircle" : "FileText"} 
                      size={14} 
                    />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatFileSize(file.size)}
                      {file.processed && file.lineCount && (
                        <span className="ml-2">• {file.lineCount.toLocaleString()} lines</span>
                      )}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  iconSize={12}
                  onClick={() => onRemoveFile(file.id)}
                  className="flex-shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;