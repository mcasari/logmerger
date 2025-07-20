import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import Icon from '../../../components/AppIcon';

const LogContentViewer = ({ 
  logEntries, 
  selectedGroups, 
  searchQuery, 
  highlightMatches,
  onEntrySelect,
  selectedEntries = [],
  className = '' 
}) => {
  const [sortBy, setSortBy] = useState('timestamp'); // timestamp, line, source
  const [sortOrder, setSortOrder] = useState('asc');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showSourceBadges, setShowSourceBadges] = useState(true);

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = logEntries;

    // Filter by selected groups
    if (selectedGroups.length > 0) {
      filtered = filtered.filter(entry => selectedGroups.includes(entry.groupId));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(query) ||
        entry.source.toLowerCase().includes(query)
      );
    }

    // Sort entries
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
        case 'line':
          comparison = a.lineNumber - b.lineNumber;
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [logEntries, selectedGroups, searchQuery, sortBy, sortOrder]);

  const highlightText = useCallback((text, query) => {
    if (!query.trim() || !highlightMatches) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-warning-100 text-warning-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  }, [highlightMatches]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const LogEntryRow = ({ index, style }) => {
    const entry = filteredAndSortedEntries[index];
    const isSelected = selectedEntries.includes(entry.id);
    const isEven = index % 2 === 0;

    return (
      <div 
        style={style}
        className={`
          flex items-start space-x-3 px-4 py-2 border-b border-border cursor-pointer
          transition-colors duration-150
          ${isEven ? 'bg-background' : 'bg-surface'}
          ${isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-surface-hover'}
        `}
        onClick={() => onEntrySelect && onEntrySelect(entry.id)}
      >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEntrySelect && onEntrySelect(entry.id);
            }}
            className="p-0.5 rounded hover:bg-surface-hover"
          >
            <Icon 
              name={isSelected ? "CheckSquare" : "Square"} 
              size={14} 
              color={isSelected ? "var(--color-primary)" : "var(--color-text-secondary)"}
            />
          </button>
        </div>

        {/* Line Number */}
        {showLineNumbers && (
          <div className="flex-shrink-0 w-12 text-right">
            <span className="text-xs text-text-muted font-mono">
              {entry.lineNumber}
            </span>
          </div>
        )}

        {/* Source Badge */}
        {showSourceBadges && (
          <div className="flex-shrink-0">
            <div 
              className="px-2 py-1 rounded-md text-xs font-medium"
              style={{ 
                backgroundColor: entry.sourceColor + '20',
                color: entry.sourceColor,
                border: `1px solid ${entry.sourceColor}40`
              }}
            >
              {entry.source}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex-shrink-0 w-32">
          <span className="text-xs text-text-muted font-mono">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Log Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-mono text-text-primary whitespace-pre-wrap break-words">
            {highlightText(entry.content, searchQuery)}
          </div>
          {entry.level && (
            <div className="mt-1">
              <span className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${entry.level === 'ERROR' ? 'bg-error-100 text-error-800' :
                  entry.level === 'WARN' ? 'bg-warning-100 text-warning-800' :
                  entry.level === 'INFO'? 'bg-accent-100 text-accent-800' : 'bg-surface text-text-secondary'
                }
              `}>
                {entry.level}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(entry.content);
              }}
              className="p-1 rounded hover:bg-surface-hover"
              title="Copy to clipboard"
            >
              <Icon name="Copy" size={12} color="var(--color-text-secondary)" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('View entry details:', entry);
              }}
              className="p-1 rounded hover:bg-surface-hover"
              title="View details"
            >
              <Icon name="Eye" size={12} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-background border border-border rounded-md h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-text-primary">Log Entries</h3>
          <span className="text-sm text-text-muted">
            {filteredAndSortedEntries.length.toLocaleString()} entries
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Options */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`
                p-1.5 rounded-md text-xs font-medium transition-colors duration-150
                ${showLineNumbers 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
                }
              `}
              title="Toggle line numbers"
            >
              <Icon name="Hash" size={14} />
            </button>
            <button
              onClick={() => setShowSourceBadges(!showSourceBadges)}
              className={`
                p-1.5 rounded-md text-xs font-medium transition-colors duration-150
                ${showSourceBadges 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-surface text-text-secondary hover:bg-surface-hover'
                }
              `}
              title="Toggle source badges"
            >
              <Icon name="Tag" size={14} />
            </button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-1 border-l border-border pl-2">
            <button
              onClick={() => handleSort('timestamp')}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium
                transition-colors duration-150
                ${sortBy === 'timestamp' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:bg-surface-hover'
                }
              `}
            >
              <Icon name="Clock" size={12} />
              <span>Time</span>
              {sortBy === 'timestamp' && (
                <Icon 
                  name={sortOrder === 'asc' ? "ChevronUp" : "ChevronDown"} 
                  size={12} 
                />
              )}
            </button>
            <button
              onClick={() => handleSort('line')}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium
                transition-colors duration-150
                ${sortBy === 'line' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:bg-surface-hover'
                }
              `}
            >
              <Icon name="Hash" size={12} />
              <span>Line</span>
              {sortBy === 'line' && (
                <Icon 
                  name={sortOrder === 'asc' ? "ChevronUp" : "ChevronDown"} 
                  size={12} 
                />
              )}
            </button>
            <button
              onClick={() => handleSort('source')}
              className={`
                flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium
                transition-colors duration-150
                ${sortBy === 'source' ?'bg-primary text-primary-foreground' :'text-text-secondary hover:bg-surface-hover'
                }
              `}
            >
              <Icon name="File" size={12} />
              <span>Source</span>
              {sortBy === 'source' && (
                <Icon 
                  name={sortOrder === 'asc' ? "ChevronUp" : "ChevronDown"} 
                  size={12} 
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredAndSortedEntries.length > 0 ? (
          <List
            height={600}
            itemCount={filteredAndSortedEntries.length}
            itemSize={80}
            className="scrollbar-thin scrollbar-thumb-border scrollbar-track-surface"
          >
            {LogEntryRow}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">No entries found</h4>
              <p className="text-text-muted">
                {searchQuery 
                  ? "Try adjusting your search query or filters" :"Select groups from the sidebar to view log entries"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogContentViewer;