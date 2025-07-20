import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const ProcessingStatusBadge = ({ className = '' }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    isProcessing: false,
    filesCount: 0,
    completedCount: 0,
    errorCount: 0,
    currentFile: '',
    progress: 0
  });

  useEffect(() => {
    const statusTimer = setInterval(() => {
      const mockProcessing = Math.random() > 0.6;
      const filesCount = Math.floor(Math.random() * 10) + 1;
      const completedCount = mockProcessing ? Math.floor(Math.random() * filesCount) : filesCount;
      const errorCount = Math.floor(Math.random() * 2);
      
      setStatus({
        isProcessing: mockProcessing,
        filesCount,
        completedCount,
        errorCount,
        currentFile: mockProcessing ? `log_file_${Math.floor(Math.random() * 100)}.txt` : '',
        progress: (completedCount / filesCount) * 100
      });
    }, 2000);

    return () => clearInterval(statusTimer);
  }, []);

  const handleClick = () => {
    navigate('/file-processing-status');
  };

  const getStatusColor = () => {
    if (status.errorCount > 0) return 'error';
    if (status.isProcessing) return 'accent';
    return 'success';
  };

  const getStatusIcon = () => {
    if (status.errorCount > 0) return 'AlertCircle';
    if (status.isProcessing) return 'Loader2';
    return 'CheckCircle';
  };

  const getStatusText = () => {
    if (status.errorCount > 0) {
      return `${status.errorCount} Error${status.errorCount > 1 ? 's' : ''}`;
    }
    if (status.isProcessing) {
      return `Processing ${status.completedCount}/${status.filesCount}`;
    }
    return `${status.completedCount} Complete`;
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();
  const statusText = getStatusText();

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
        transition-all duration-150 ease-out hover-lift cursor-pointer
        ${statusColor === 'error' ?'bg-error-50 text-error-700 border border-error-200 hover:bg-error-100' 
          : statusColor === 'accent' ?'bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100' :'bg-success-50 text-success-700 border border-success-200 hover:bg-success-100'
        }
        ${className}
      `}
      title="Click to view detailed processing status"
    >
      {/* Status Icon */}
      <Icon 
        name={statusIcon} 
        size={16} 
        className={status.isProcessing ? "animate-spin" : ""}
        color={`var(--color-${statusColor})`}
      />
      
      {/* Status Text */}
      <span className="hidden sm:inline">{statusText}</span>
      
      {/* Mobile: Show only count */}
      <span className="sm:hidden">
        {status.isProcessing ? status.completedCount : status.filesCount}
      </span>
      
      {/* Progress Indicator */}
      {status.isProcessing && (
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-16 h-1.5 bg-accent-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <span className="text-xs text-accent-600 font-mono">
            {Math.round(status.progress)}%
          </span>
        </div>
      )}
      
      {/* Current File Indicator */}
      {status.isProcessing && status.currentFile && (
        <div className="hidden lg:flex items-center space-x-1 max-w-32">
          <Icon name="File" size={12} color="var(--color-accent)" />
          <span className="text-xs text-accent-600 truncate font-mono">
            {status.currentFile}
          </span>
        </div>
      )}
      
      {/* Chevron */}
      <Icon name="ChevronRight" size={14} color="currentColor" className="opacity-60" />
    </button>
  );
};

export default ProcessingStatusBadge;