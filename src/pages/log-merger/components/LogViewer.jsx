import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const LogViewer = ({ 
  groups, 
  searchQuery, 
  onSearchChange, 
  collapsedGroups, 
  onGroupToggle,
  onScroll,
  isLoadingMore
}) => {
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const scrollContainerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  // Auto-scroll when current record changes
  useEffect(() => {
    if (groups.length > 0 && !isNavigating) {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      const scrollToRecord = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        console.log(`Looking for record: group ${currentGroupIndex}, record ${currentRecordIndex}`);
        
        // Find the selected record element
        const selectedElement = container.querySelector(`[data-record-id="${currentGroupIndex}-${currentRecordIndex}"]`);
        
        if (selectedElement) {
          console.log('Found element, scrolling to center...');
          
          // Reset retry count on success
          retryCountRef.current = 0;
          
          // Use scrollIntoView with instant behavior to reduce interference
          try {
            selectedElement.scrollIntoView({
              behavior: 'instant', // Changed from 'smooth' to 'instant'
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
  }, [currentGroupIndex, currentRecordIndex, groups, collapsedGroups, isNavigating]);
  const getGroupColor = (groupName) => {
    if (groupName.includes('ERROR')) return '#ef4444';
    if (groupName.includes('WARN')) return '#f59e0b';
    if (groupName.includes('INFO')) return '#10b981';
    if (groupName.includes('DEBUG')) return '#8b5cf6';
    return '#6b7280';
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



  // Navigation functions
  const navigateToPreviousRecord = () => {
    if (groups.length === 0 || isNavigating) return;
    
    setIsNavigating(true);
    
    let newGroupIndex = currentGroupIndex;
    let newRecordIndex = currentRecordIndex - 1;
    
    // If we're at the first record of the current group, go to previous group
    if (newRecordIndex < 0) {
      newGroupIndex = Math.max(0, currentGroupIndex - 1);
      newRecordIndex = groups[newGroupIndex]?.entries.length - 1 || 0;
    }
    
    // Ensure the target group is expanded first
    const targetGroup = groups[newGroupIndex];
    if (targetGroup && collapsedGroups.has(targetGroup.id)) {
      console.log(`Expanding group ${targetGroup.id} before navigation`);
      onGroupToggle(targetGroup.id);
      // Wait a bit for the group to expand
      setTimeout(() => {
        setCurrentGroupIndex(newGroupIndex);
        setCurrentRecordIndex(newRecordIndex);
        setIsNavigating(false);
      }, 200);
    } else {
      setCurrentGroupIndex(newGroupIndex);
      setCurrentRecordIndex(newRecordIndex);
      setIsNavigating(false);
    }
  };

  const navigateToNextRecord = () => {
    if (groups.length === 0 || isNavigating) return;
    
    setIsNavigating(true);
    
    let newGroupIndex = currentGroupIndex;
    let newRecordIndex = currentRecordIndex + 1;
    
    // If we're at the last record of the current group, go to next group
    if (newRecordIndex >= groups[currentGroupIndex]?.entries.length) {
      newGroupIndex = Math.min(groups.length - 1, currentGroupIndex + 1);
      newRecordIndex = 0;
    }
    
    // Ensure the target group is expanded first
    const targetGroup = groups[newGroupIndex];
    if (targetGroup && collapsedGroups.has(targetGroup.id)) {
      console.log(`Expanding group ${targetGroup.id} before navigation`);
      onGroupToggle(targetGroup.id);
      // Wait a bit for the group to expand
      setTimeout(() => {
        setCurrentGroupIndex(newGroupIndex);
        setCurrentRecordIndex(newRecordIndex);
        setIsNavigating(false);
      }, 200);
    } else {
      setCurrentGroupIndex(newGroupIndex);
      setCurrentRecordIndex(newRecordIndex);
      setIsNavigating(false);
    }
  };

  // Check if navigation buttons should be disabled
  const isPreviousDisabled = groups.length === 0 || (currentGroupIndex === 0 && currentRecordIndex === 0);
  const isNextDisabled = groups.length === 0 || (currentGroupIndex === groups.length - 1 && currentRecordIndex === groups[currentGroupIndex]?.entries.length - 1);

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

  // Flatten all entries for continuous scrolling
  const allEntries = useMemo(() => {
    const entries = [];
    groups.forEach((group) => {
      if (!collapsedGroups.has(group.id)) {
        // Add group header
        entries.push({
          type: 'group-header',
          id: `group-${group.id}`,
          group: group
        });
        
        // Add all group entries
        group.entries.forEach((entry) => {
          entries.push({
            type: 'entry',
            id: entry.id,
            entry: entry,
            group: group
          });
        });
      } else {
        // Add collapsed group header only
        entries.push({
          type: 'group-header',
          id: `group-${group.id}`,
          group: group
        });
      }
    });
    return entries;
  }, [groups, collapsedGroups]);

  const totalVisibleEntries = useMemo(() => {
    return groups.reduce((total, group) => total + group.entries.length, 0);
  }, [groups]);

  // Render group header
  const renderGroupHeader = (group, isCollapsed) => {
    const groupColor = getGroupColor(group.name);
    const isLogLevelGroup = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'].includes(group.name);
    const logLevelBadgeClass = isLogLevelGroup ? getLogLevelColor(`[${group.name}]`) : null;
    
    return (
      <button
        key={`group-${group.id}`}
        onClick={() => onGroupToggle(group.id)}
        className="w-full px-6 py-4 text-left hover:bg-surface-hover transition-colors duration-150 bg-background border-b border-border"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon 
              name={isCollapsed ? "ChevronRight" : "ChevronDown"} 
              size={16} 
              color="var(--color-text-secondary)" 
            />
            
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: groupColor }}
            />
            
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-text-primary">{group.name}</h4>
              {isLogLevelGroup && logLevelBadgeClass && (
                <div className={`px-2 py-1 rounded text-xs font-medium border ${logLevelBadgeClass}`}>
                  {group.name}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-text-secondary">
                {group.entries.length} entries
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-muted">
              {isCollapsed ? 'Show' : 'Hide'}
            </span>
          </div>
        </div>
      </button>
    );
  };

  // Render log entry
  const renderLogEntry = (entry, index, groupIndex) => {
    const isEven = index % 2 === 0;
    const logLevel = extractLogLevel(entry.content);
    const logLevelColor = getLogLevelColor(entry.content);
    const logLevelBackground = getLogLevelBackgroundColor(entry.content);
    const isCurrentRecord = groupIndex === currentGroupIndex && index === currentRecordIndex;
    
    return (
      <div
        key={entry.id}
        data-record-id={`${groupIndex}-${index}`}
        className={`
          p-3 border-b border-border hover:bg-surface-hover transition-colors duration-150
          ${isCurrentRecord 
            ? 'bg-blue-200 border-l-4 border-l-blue-600 shadow-md' 
            : `${logLevelBackground || (isEven ? 'bg-background' : 'bg-surface')} ${entry.isPreview ? 'border-l-4 border-l-blue-500' : ''}`
          }
        `}
      >
        <div className="flex items-start space-x-3">
          {/* File Badge */}
          <div className="flex-shrink-0">
            <div className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium">
              {entry.fileName}
            </div>
          </div>
          
          {/* Line Number */}
          <div className="flex-shrink-0 w-12 text-right">
            <span className="text-xs text-text-muted font-mono">
              {entry.lineNumber}
            </span>
          </div>
          
          {/* Timestamp */}
          <div className="flex-shrink-0 w-40">
            <span className={`text-xs font-mono ${entry.timestamp ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
              {getOriginalTimestamp(entry.timestamp)}
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
              {totalVisibleEntries.toLocaleString()} entries across {groups.length} groups
              {isLoadingMore && (
                <span className="ml-2 text-primary">
                  • Loading more...
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
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
            
            {(
              <Button
                variant="outline"
                size="sm"
                iconName={groups.some(g => collapsedGroups.has(g.id)) ? "Expand" : "Minimize"}
                iconSize={16}
                onClick={() => {
                  if (groups.some(g => collapsedGroups.has(g.id))) {
                    // Expand all
                    groups.forEach(g => {
                      if (collapsedGroups.has(g.id)) {
                        onGroupToggle(g.id);
                      }
                    });
                  } else {
                    // Collapse all
                    groups.forEach(g => onGroupToggle(g.id));
                  }
                }}
              >
                {groups.some(g => collapsedGroups.has(g.id)) ? 'Expand All' : 'Collapse All'}
              </Button>
            )}
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
          
          // Call onScroll when user scrolls to 80% of content
          if (scrollPercentage > 0.8 && onScroll) {
            onScroll({ scrollOffset: scrollTop, scrollUpdateWasRequested: false });
          }
        }}
      >
        {groups.length > 0 ? (
          <div>
            {groups.map((group, groupIndex) => {
              const isCollapsed = collapsedGroups.has(group.id);
              
              return (
                <div key={group.id}>
                  {renderGroupHeader(group, isCollapsed)}
                  
                  {!isCollapsed && (
                    <div>
                      {group.entries.map((entry, index) => 
                        renderLogEntry(entry, index, groupIndex)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
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
                No groups found
              </h4>
              <p className="text-text-secondary">
                Upload and process log files to see grouped content here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;