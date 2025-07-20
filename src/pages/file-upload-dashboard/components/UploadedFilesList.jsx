import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UploadedFilesList = ({ files, onRemoveFile, onClearAll, className = '' }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUploadTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileName) => {
    if (fileName.endsWith('.log')) return 'FileText';
    if (fileName.endsWith('.txt')) return 'FileText';
    return 'File';
  };

  const getFileStatus = (file) => {
    if (file.error) return { status: 'error', icon: 'AlertCircle', color: 'var(--color-error)' };
    if (file.processing) return { status: 'processing', icon: 'Loader2', color: 'var(--color-accent)' };
    return { status: 'ready', icon: 'CheckCircle', color: 'var(--color-success)' };
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Icon name="Inbox" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
        <p className="text-text-muted">No files uploaded yet</p>
        <p className="text-sm text-text-muted mt-1">
          Upload log files to get started with analysis
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          Uploaded Files ({files.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="Trash2"
          iconPosition="left"
          onClick={onClearAll}
          className="text-error hover:text-error hover:bg-error-50"
        >
          Clear All
        </Button>
      </div>

      <div className="space-y-3">
        {files.map((file, index) => {
          const fileStatus = getFileStatus(file);
          
          return (
            <div
              key={`${file.name}-${index}`}
              className="bg-surface border border-border rounded-lg p-4 hover-lift"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    <Icon 
                      name={getFileIcon(file.name)} 
                      size={20} 
                      color="var(--color-text-secondary)" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-text-primary truncate">
                        {file.name}
                      </h4>
                      <div className="flex-shrink-0">
                        <Icon 
                          name={fileStatus.icon} 
                          size={16} 
                          color={fileStatus.color}
                          className={fileStatus.status === 'processing' ? 'animate-spin' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-text-secondary">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatUploadTime(file.uploadTime)}</span>
                      {file.lineCount && (
                        <>
                          <span>•</span>
                          <span>{file.lineCount.toLocaleString()} lines</span>
                        </>
                      )}
                    </div>
                    
                    {file.error && (
                      <div className="mt-2 p-2 bg-error-50 border border-error-200 rounded text-sm text-error-700">
                        <div className="flex items-center space-x-2">
                          <Icon name="AlertTriangle" size={14} color="var(--color-error)" />
                          <span>{file.error}</span>
                        </div>
                      </div>
                    )}
                    
                    {file.processing && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm text-accent-700 mb-1">
                          <span>Processing...</span>
                          <span>{file.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-accent-100 rounded-full h-1.5">
                          <div 
                            className="bg-accent h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    onClick={() => onRemoveFile(index)}
                    className="text-text-muted hover:text-error hover:bg-error-50"
                    title="Remove file"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Files" size={16} color="var(--color-text-secondary)" />
              <span className="text-text-secondary">Total Files:</span>
              <span className="font-medium text-text-primary">{files.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="HardDrive" size={16} color="var(--color-text-secondary)" />
              <span className="text-text-secondary">Total Size:</span>
              <span className="font-medium text-text-primary">
                {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-xs text-text-muted">
                {files.filter(f => !f.error && !f.processing).length} Ready
              </span>
            </div>
            {files.some(f => f.processing) && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                <span className="text-xs text-text-muted">
                  {files.filter(f => f.processing).length} Processing
                </span>
              </div>
            )}
            {files.some(f => f.error) && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-error rounded-full"></div>
                <span className="text-xs text-text-muted">
                  {files.filter(f => f.error).length} Error
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedFilesList;