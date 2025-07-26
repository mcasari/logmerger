import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const LogViewer = ({ 
  groups, 
  searchQuery, 
  onSearchChange, 
  collapsedGroups, 
  onGroupToggle 
}) => {
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

  // Row renderer for virtual scrolling
  const Row = ({ index, style }) => {
    const item = allEntries[index];
    
    if (!item) return null;

    if (item.type === 'group-header') {
      const group = item.group;
      const isCollapsed = collapsedGroups.has(group.id);
      const groupColor = getGroupColor(group.name);
      
      return (
        <div style={style}>
          <button
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
                
                <div>
                  <h4 className="font-semibold text-text-primary">{group.name}</h4>
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
        </div>
      );
    }

    if (item.type === 'entry') {
      const entry = item.entry;
      const isEven = index % 2 === 0;
      
      return (
        <div style={style}>
          <div
            className={`
              p-3 border-b border-border hover:bg-surface-hover transition-colors duration-150
              ${isEven ? 'bg-background' : 'bg-surface'}
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
              <div className="flex-shrink-0 w-32">
                <span className="text-xs text-text-muted font-mono">
                  {getOriginalTimestamp(entry.timestamp)}
                </span>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-text-primary whitespace-pre-wrap break-words">
                  {highlightText(entry.content, searchQuery)}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Merged Log View</h3>
            <p className="text-sm text-text-secondary">
              {totalVisibleEntries.toLocaleString()} entries across {groups.length} groups
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-64">
              <Input
                placeholder="Search log entries..."
                value={searchQuery}
                onChange={onSearchChange}
                icon="Search"
              />
            </div>
            
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
          </div>
        </div>
      </div>

      {/* Continuous Scrolling Content */}
      <div className="h-96">
        {groups.length > 0 ? (
          <List
            height={384} // 24rem in pixels
            itemCount={allEntries.length}
            itemSize={80} // Approximate height per row
            className="scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-transparent"
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h4 className="text-lg font-medium text-text-primary mb-2">No groups found</h4>
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