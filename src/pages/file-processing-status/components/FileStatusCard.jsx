import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FileStatusCard = ({ file }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      case 'processing':
        return { name: 'Loader2', color: 'var(--color-primary)', className: 'animate-spin' };
      case 'failed':
        return { name: 'XCircle', color: 'var(--color-error)' };
      case 'queued':
        return { name: 'Clock', color: 'var(--color-text-muted)' };
      default:
        return { name: 'File', color: 'var(--color-text-secondary)' };
    }
  };

  const getStatusColor = () => {
    switch (file.status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'failed':
        return 'error';
      case 'queued':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const statusIcon = getStatusIcon();
  const statusColor = getStatusColor();

  return (
    <div className="bg-background border border-border rounded-lg p-4 hover-lift">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            <Icon 
              name={statusIcon.name} 
              size={20} 
              color={statusIcon.color}
              className={statusIcon.className || ''}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-text-primary truncate" title={file.name}>
              {file.name}
            </h3>
            <div className="flex items-center space-x-4 mt-1 text-xs text-text-secondary">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span className="capitalize">{file.status}</span>
              {file.processingTime && (
                <>
                  <span>•</span>
                  <span>{formatDuration(file.processingTime)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {file.error && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-surface-hover transition-colors duration-150"
            title="View error details"
          >
            <Icon 
              name={isExpanded ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              color="var(--color-text-secondary)" 
            />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-secondary">Progress</span>
          <span className="text-xs font-medium text-text-primary">{file.progress}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              statusColor === 'error' ? 'bg-error' : 
              statusColor === 'primary' ? 'bg-primary' : 
              statusColor === 'success' ? 'bg-success' : 'bg-secondary'
            }`}
            style={{ width: `${file.progress}%` }}
          />
        </div>
      </div>

      {/* Processing Stages */}
      <div className="flex items-center space-x-4 mb-3">
        {file.stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              stage.status === 'completed' ? 'bg-success' :
              stage.status === 'processing' ? 'bg-primary animate-pulse' :
              stage.status === 'failed' ? 'bg-error' : 'bg-border'
            }`} />
            <span className={`text-xs ${
              stage.status === 'completed' ? 'text-success' :
              stage.status === 'processing' ? 'text-primary' :
              stage.status === 'failed' ? 'text-error' : 'text-text-muted'
            }`}>
              {stage.name}
            </span>
          </div>
        ))}
      </div>

      {/* Current Operation */}
      {file.currentOperation && file.status === 'processing' && (
        <div className="bg-surface rounded-md p-2 mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={12} color="var(--color-primary)" />
            <span className="text-xs text-text-secondary">{file.currentOperation}</span>
          </div>
        </div>
      )}

      {/* Error Details */}
      {file.error && isExpanded && (
        <div className="bg-error-50 border border-error-200 rounded-md p-3 mt-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-error mb-1">Error Details</h4>
              <p className="text-xs text-error-600 break-words">{file.error}</p>
              {file.errorCode && (
                <p className="text-xs text-error-500 mt-1">Error Code: {file.errorCode}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Details */}
      {file.status === 'completed' && file.results && (
        <div className="bg-success-50 border border-success-200 rounded-md p-3 mt-3">
          <div className="flex items-start space-x-2">
            <Icon name="CheckCircle" size={16} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-success mb-1">Processing Complete</h4>
              <div className="text-xs text-success-600 space-y-1">
                <div>Lines processed: {file.results.linesProcessed?.toLocaleString()}</div>
                <div>Groups created: {file.results.groupsCreated}</div>
                <div>Matches found: {file.results.matchesFound?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileStatusCard;