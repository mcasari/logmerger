import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const LogViewer = ({ 
  entries, 
  searchQuery, 
  onSearchChange, 
  onScroll,
  isLoadingMore
}) => {
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'detailed'
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const scrollThrottleRef = useRef(null);

  // Auto-scroll when current record changes (only when explicitly navigating)
  useEffect(() => {
    if (entries.length > 0 && !isNavigating && shouldAutoScroll) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      const scrollToRecord = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        console.log(`Looking for record: ${currentRecordIndex}`);
        
        // Find the selected record element
        const selectedElement = container.querySelector(`[data-record-id="${currentRecordIndex}"]`);
        
        if (selectedElement) {
          console.log('Found element, scrolling to center...');
          
          // Reset retry count on success
          retryCountRef.current = 0;
          
          // Use scrollIntoView with instant behavior to reduce interference
          try {
            selectedElement.scrollIntoView({
              behavior: 'instant',
              block: 'center',
              inline: 'nearest'
            });
          } catch (error) {
            console.warn('Scroll error (likely Chrome extension interference):', error);
            // Fallback to simple scroll
            try {
              selectedElement.scrollIntoView();
            } catch (fallbackError) {
              console.warn('Fallback scroll also failed:', fallbackError);
            }
          }
          
          // Add visual feedback with reduced animation duration
          try {
            selectedElement.style.animation = 'pulse 0.3s ease-in-out';
            setTimeout(() => {
              if (selectedElement.style) {
                selectedElement.style.animation = '';
              }
            }, 300);
          } catch (animationError) {
            console.warn('Animation error:', animationError);
          }
          
        } else {
          console.log('Element not found, retrying...');
          retryCountRef.current++;
          
          // Limit retries to prevent infinite loops
          if (retryCountRef.current < 5) {
            // Increase delay between retries to reduce interference
            scrollTimeoutRef.current = setTimeout(scrollToRecord, 200);
          } else {
            console.log('Max retries reached, stopping scroll attempts');
            retryCountRef.current = 0;
          }
        }
      };
      
      // Start the scroll process with a longer initial delay
      scrollTimeoutRef.current = setTimeout(scrollToRecord, 150);
    }
    
    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentRecordIndex, entries, isNavigating, shouldAutoScroll]);

  // Cleanup throttle timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, []);

  // Reset current record index when entries change
  useEffect(() => {
    if (entries.length > 0 && currentRecordIndex >= entries.length) {
      setCurrentRecordIndex(0);
    }
  }, [entries.length, currentRecordIndex]);

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };


  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-100 text-warning-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getOriginalTimestamp = (timestamp) => {
    // Preserve original timestamp exactly as it appears in source files
    if (timestamp === null || timestamp === undefined) {
      return 'No timestamp';
    }
    if (typeof timestamp === 'string') {
      return timestamp; // Return the exact original string
    }
    // Fallback for any unexpected cases
    return String(timestamp);
  };

  const getCompactTimestamp = (timestamp) => {
    if (!timestamp) return 'No timestamp';
    
    // If timestamp is already a string, try to extract just the time part
    if (typeof timestamp === 'string') {
      // Try to extract time from common formats
      const timeMatch = timestamp.match(/(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)/);
      if (timeMatch) {
        return timeMatch[1];
      }
      
      // If no time pattern found, return the original string (truncated if too long)
      return timestamp.length > 20 ? timestamp.substring(0, 20) + '...' : timestamp;
    }
    
    // For Date objects, use local time instead of UTC
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Navigation functions
  const navigateToPreviousRecord = () => {
    if (entries.length === 0 || isNavigating) return;
    
    setIsNavigating(true);
    setShouldAutoScroll(true);
    setCurrentRecordIndex(Math.max(0, currentRecordIndex - 1));
    setIsNavigating(false);
  };

  const navigateToNextRecord = () => {
    if (entries.length === 0 || isNavigating) return;
    
    setIsNavigating(true);
    setShouldAutoScroll(true);
    setCurrentRecordIndex(Math.min(entries.length - 1, currentRecordIndex + 1));
    setIsNavigating(false);
  };

  // Check if navigation buttons should be disabled
  const isPreviousDisabled = entries.length === 0 || currentRecordIndex === 0;
  const isNextDisabled = entries.length === 0 || currentRecordIndex === entries.length - 1;

  const getLogLevelColor = (content) => {
    // Try multiple patterns for log level detection
    const patterns = [
      /\[(ERROR|WARN|INFO|DEBUG|TRACE)\]/i,  // [ERROR], [INFO], etc.
      /\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/i,  // ERROR, INFO, etc. (word boundaries)
      /^(ERROR|WARN|INFO|DEBUG|TRACE):/i,    // ERROR:, INFO:, etc. (start of line)
      /(ERROR|WARN|INFO|DEBUG|TRACE)\s+/i    // ERROR , INFO , etc. (followed by space)
    ];
    
    for (const pattern of patterns) {
      const levelMatch = content.match(pattern);
      if (levelMatch) {
        const level = levelMatch[1] || levelMatch[0];
        switch (level.toUpperCase()) {
          case 'ERROR':
            return 'bg-error-100 text-error-800 border-error-200';
          case 'WARN':
            return 'bg-warning-100 text-warning-800 border-warning-200';
          case 'INFO':
            return 'bg-green-100 text-green-800 border-green-200';
          case 'DEBUG':
            return 'bg-secondary-100 text-secondary-700 border-secondary-200';
          case 'TRACE':
            return 'bg-secondary-100 text-secondary-700 border-secondary-200';
          default:
            continue;
        }
      }
    }
    return null;
  };

  const getLogLevelBackgroundColor = (content) => {
    // Try multiple patterns for log level detection
    const patterns = [
      /\[(ERROR|WARN|INFO|DEBUG|TRACE)\]/i,  // [ERROR], [INFO], etc.
      /\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/i,  // ERROR, INFO, etc. (word boundaries)
      /^(ERROR|WARN|INFO|DEBUG|TRACE):/i,    // ERROR:, INFO:, etc. (start of line)
      /(ERROR|WARN|INFO|DEBUG|TRACE)\s+/i    // ERROR , INFO , etc. (followed by space)
    ];
    
    for (const pattern of patterns) {
      const levelMatch = content.match(pattern);
      if (levelMatch) {
        const level = levelMatch[1] || levelMatch[0];
        switch (level.toUpperCase()) {
          case 'ERROR':
            return 'bg-error-50 border-l-4 border-l-error-500';
          case 'WARN':
            return 'bg-warning-50 border-l-4 border-l-warning-500';
          case 'INFO':
            return 'bg-green-50 border-l-4 border-l-green-500';
          case 'DEBUG':
            return 'bg-secondary-50 border-l-4 border-l-secondary-400';
          case 'TRACE':
            return 'bg-secondary-50 border-l-4 border-l-secondary-400';
          default:
            continue;
        }
      }
    }
    return null;
  };

  const extractLogLevel = (content) => {
    // Try multiple patterns for log level detection
    const patterns = [
      /\[(ERROR|WARN|INFO|DEBUG|TRACE)\]/i,  // [ERROR], [INFO], etc.
      /\b(ERROR|WARN|INFO|DEBUG|TRACE)\b/i,  // ERROR, INFO, etc. (word boundaries)
      /^(ERROR|WARN|INFO|DEBUG|TRACE):/i,    // ERROR:, INFO:, etc. (start of line)
      /(ERROR|WARN|INFO|DEBUG|TRACE)\s+/i    // ERROR , INFO , etc. (followed by space)
    ];
    
    for (const pattern of patterns) {
      const levelMatch = content.match(pattern);
      if (levelMatch) {
        const level = levelMatch[1] || levelMatch[0];
        return level.toUpperCase();
      }
    }
    return null;
  };

  const totalVisibleEntries = entries.length;

  // Handle manual scrolling to disable auto-scroll and update selected row
  const handleManualScroll = useCallback(() => {
    setShouldAutoScroll(false);
    
    // Throttle the row selection update to avoid performance issues
    if (scrollThrottleRef.current) {
      clearTimeout(scrollThrottleRef.current);
    }
    
    scrollThrottleRef.current = setTimeout(() => {
      // Find which row is currently most visible in the viewport
      const container = scrollContainerRef.current;
      if (!container || entries.length === 0) return;
      
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      // Check each visible row to find the one closest to the center
      entries.forEach((entry, index) => {
        const element = container.querySelector(`[data-record-id="${index}"]`);
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const elementCenter = elementRect.top + elementRect.height / 2;
          const distance = Math.abs(elementCenter - containerCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });
      
      // Update the current record index if it's different
      if (closestIndex !== currentRecordIndex) {
        setCurrentRecordIndex(closestIndex);
      }
    }, 50); // Throttle to 50ms for smooth performance
  }, [entries, currentRecordIndex]);


  // Render compact log entry
  const renderCompactLogEntry = (entry, index) => {
    const isEven = index % 2 === 0;
    const logLevel = extractLogLevel(entry.content);
    const logLevelColor = getLogLevelColor(entry.content);
    const logLevelBackground = getLogLevelBackgroundColor(entry.content);
    const isCurrentRecord = index === currentRecordIndex;
    const isExpanded = expandedEntries.has(entry.id);
    
    return (
      <div
        key={entry.id}
        data-record-id={`${index}`}
        className={`
          border-b border-border hover:bg-surface-hover transition-colors duration-150
          ${isCurrentRecord 
            ? 'bg-blue-200 border-l-4 border-l-blue-600 shadow-md' 
            : `${logLevelBackground || (isEven ? 'bg-background' : 'bg-surface')} ${entry.isPreview ? 'border-l-4 border-l-blue-500' : ''}`
          }
        `}
      >
        {/* Compact Row */}
        <div className="flex items-start px-4 py-4 h-20 overflow-hidden">
          {/* Toggle Button */}
          <button
            onClick={() => toggleEntryExpansion(entry.id)}
            className="mr-3 p-1 rounded hover:bg-surface-hover"
          >
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={12} 
              color="var(--color-text-muted)"
            />
          </button>
          
          {/* File Badge (Compact) */}
          <div className="flex-shrink-0 mr-2">
            <div className="px-1.5 py-0.5 bg-accent-100 text-accent-700 rounded text-xs font-medium">
              {entry.fileName.split('/').pop()}
            </div>
          </div>
          
          {/* Line Number (Compact) */}
          <div className="flex-shrink-0 w-8 text-right mr-2">
            <span className="text-xs text-text-muted font-mono">
              {entry.lineNumber}
            </span>
          </div>
          
          {/* Log Level Badge (Compact) */}
          {logLevel && (
            <div className="flex-shrink-0 mr-2">
              <div className={`px-1.5 py-0.5 rounded text-xs font-medium border ${logLevelColor}`}>
                {logLevel}
              </div>
            </div>
          )}
          
          {/* Preview Indicator (Compact) */}
          {entry.isPreview && (
            <div className="flex-shrink-0 mr-2">
              <div className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200">
                PREVIEW
              </div>
            </div>
          )}
          
          {/* Content (Compact) */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-text-primary break-words line-clamp-3">
              {entry.content.length > 500 ? `${entry.content.substring(0, 500)}...` : entry.content}
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 bg-surface">
            <div className="bg-background border border-border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-text-secondary">Source:</span>
                  <span className="ml-2 text-text-primary">{entry.fileName}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Line:</span>
                  <span className="ml-2 text-text-primary font-mono">{entry.lineNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Timestamp:</span>
                  <span className="ml-2 text-text-primary font-mono">
                    {getOriginalTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Level:</span>
                  <span className="ml-2 text-text-primary">{logLevel || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="font-medium text-text-secondary">Full Content:</span>
              </div>
              <div className="bg-slate-50 border border-border rounded p-3 font-mono text-sm text-text-primary whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render detailed log entry (Original)
  const renderDetailedLogEntry = (entry, index) => {
    const isEven = index % 2 === 0;
    const logLevel = extractLogLevel(entry.content);
    const logLevelColor = getLogLevelColor(entry.content);
    const logLevelBackground = getLogLevelBackgroundColor(entry.content);
    const isCurrentRecord = index === currentRecordIndex;
    const isExpanded = expandedEntries.has(entry.id);
    
    return (
      <div
        key={entry.id}
        data-record-id={`${index}`}
        className={`
          p-3 border-b border-border hover:bg-surface-hover transition-colors duration-150
          ${isCurrentRecord 
            ? 'bg-blue-200 border-l-4 border-l-blue-600 shadow-md' 
            : `${logLevelBackground || (isEven ? 'bg-background' : 'bg-surface')} ${entry.isPreview ? 'border-l-4 border-l-blue-500' : ''}`
          }
        `}
      >
        <div className="flex items-start space-x-3">
          {/* Toggle Button */}
          <button
            onClick={() => toggleEntryExpansion(entry.id)}
            className="p-1 rounded hover:bg-surface-hover"
          >
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              color="var(--color-text-muted)"
            />
          </button>
          
          {/* File Badge */}
          <div className="flex-shrink-0">
            <div className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium">
              {entry.fileName}
            </div>
          </div>
          
          {/* Line Number */}
          <div className="flex-shrink-0 w-10 text-right">
            <span className="text-xs text-text-muted font-mono">
              {entry.lineNumber}
            </span>
          </div>
          
          {/* Log Level Badge */}
          {logLevel && (
            <div className="flex-shrink-0">
              <div className={`px-2 py-1 rounded text-xs font-medium border ${logLevelColor}`}>
                {logLevel}
              </div>
            </div>
          )}
          
          {/* Preview Indicator */}
          {entry.isPreview && (
            <div className="flex-shrink-0">
              <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200">
                PREVIEW
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-mono text-text-primary whitespace-pre-wrap break-words leading-relaxed">
              {highlightText(entry.content, searchQuery)}
            </div>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="bg-background border border-border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-text-secondary">Source:</span>
                  <span className="ml-2 text-text-primary">{entry.fileName}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Line:</span>
                  <span className="ml-2 text-text-primary font-mono">{entry.lineNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Timestamp:</span>
                  <span className="ml-2 text-text-primary font-mono">
                    {getOriginalTimestamp(entry.timestamp)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Level:</span>
                  <span className="ml-2 text-text-primary">{logLevel || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="font-medium text-text-secondary">Full Content:</span>
              </div>
              <div className="bg-slate-50 border border-border rounded p-3 font-mono text-sm text-text-primary whitespace-pre-wrap">
                {entry.content}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Merged Log View
            </h3>
            <p className="text-sm text-text-secondary">
              {totalVisibleEntries.toLocaleString()} entries
              {isLoadingMore && (
                <span className="ml-2 text-primary">
                  • Loading more...
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-surface rounded-md p-1">
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'compact' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  viewMode === 'detailed' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Detailed
              </button>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronLeft"
                iconSize={16}
                onClick={navigateToPreviousRecord}
                disabled={isPreviousDisabled}
                title="Previous Record"
              />
              
              <Button
                variant="outline"
                size="sm"
                iconName="ChevronRight"
                iconSize={16}
                onClick={navigateToNextRecord}
                disabled={isNextDisabled}
                title="Next Record"
              />
            </div>
            
            <div className="w-64">
              <Input
                placeholder="Search log entries..."
                value={searchQuery}
                onChange={onSearchChange}
                icon="Search"
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Dynamic Height Content */}
      <div 
        ref={scrollContainerRef}
        className="h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-transparent"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
          
          // Update selected row based on scroll position and disable auto-scroll
          handleManualScroll();
          
          // Call onScroll when user scrolls to 80% of content
          if (scrollPercentage > 0.8 && onScroll) {
            onScroll({ scrollOffset: scrollTop, scrollUpdateWasRequested: false });
          }
        }}
      >
        {entries.length > 0 ? (
          <div>
            {entries.map((entry, index) => 
              viewMode === 'compact' 
                ? renderCompactLogEntry(entry, index)
                : renderDetailedLogEntry(entry, index)
            )}
            
            {/* Loading More Indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4 border-t border-border">
                <div className="flex items-center space-x-2 text-text-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Loading more entries...</span>
                </div>
              </div>
            )}
            
            {/* Load More Button */}
            {!isLoadingMore && onScroll && (
              <div className="flex items-center justify-center py-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onScroll({ scrollOffset: 0, scrollUpdateWasRequested: true })}
                  className="flex items-center space-x-2"
                >
                  <Icon name="Download" size={16} />
                  <span>Load More Entries</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">
                No entries found
              </h4>
              <p className="text-text-secondary">
                Upload and process log files to see content here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;