import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

const ActivityLog = ({ logs, isProcessing }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'info':
        return { name: 'Info', color: 'var(--color-primary)' };
      case 'success':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      case 'warning':
        return { name: 'AlertTriangle', color: 'var(--color-warning)' };
      case 'error':
        return { name: 'XCircle', color: 'var(--color-error)' };
      default:
        return { name: 'Circle', color: 'var(--color-text-muted)' };
    }
  };

  const getLogTextColor = (type) => {
    switch (type) {
      case 'info':
        return 'text-primary';
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Terminal" size={20} color="var(--color-text-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Activity Log</h3>
          <span className="text-sm text-text-secondary">({logs.length} entries)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-2 text-sm text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          )}
          
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-md transition-colors duration-150 ${
              autoScroll 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-surface hover:bg-surface-hover text-text-secondary'
            }`}
            title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
          >
            <Icon name="ArrowDown" size={16} color="currentColor" />
          </button>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-md bg-surface hover:bg-surface-hover text-text-secondary transition-colors duration-150"
            title={isExpanded ? 'Collapse log' : 'Expand log'}
          >
            <Icon 
              name={isExpanded ? "Minimize2" : "Maximize2"} 
              size={16} 
              color="currentColor" 
            />
          </button>
        </div>
      </div>

      <div 
        ref={logContainerRef}
        onScroll={handleScroll}
        className={`overflow-y-auto font-mono text-sm ${
          isExpanded ? 'h-96' : 'h-48'
        }`}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            <div className="text-center">
              <Icon name="FileText" size={32} color="var(--color-text-muted)" className="mx-auto mb-2" />
              <p>No activity logs yet</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {logs.map((log, index) => {
              const logIcon = getLogIcon(log.type);
              const textColor = getLogTextColor(log.type);
              
              return (
                <div key={index} className="flex items-start space-x-3 py-1">
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon 
                      name={logIcon.name} 
                      size={14} 
                      color={logIcon.color} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-text-muted">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.fileName && (
                        <>
                          <span className="text-xs text-text-muted">•</span>
                          <span className="text-xs text-text-secondary font-medium">
                            {log.fileName}
                          </span>
                        </>
                      )}
                    </div>
                    <p className={`text-sm ${textColor} break-words`}>
                      {log.message}
                    </p>
                    {log.details && (
                      <p className="text-xs text-text-muted mt-1 pl-2 border-l-2 border-border">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && logs.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
              }
            }}
            className="flex items-center space-x-1"
          >
            <Icon name="ArrowDown" size={12} color="currentColor" />
            <span>Scroll to bottom</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;