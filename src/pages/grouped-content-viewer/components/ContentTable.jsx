import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContentTable = ({ 
  group, 
  entries, 
  onEntrySelect,
  selectedEntries,
  onBulkAction,
  className = '' 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredAndSortedEntries = useMemo(() => {
    let filtered = entries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.sourceFile.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [entries, sortConfig, searchTerm, dateRange]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const handleEntrySelection = (entry, isSelected) => {
    const newSelected = new Set(selectedEntries);
    if (isSelected) {
      newSelected.add(entry.id);
    } else {
      newSelected.delete(entry.id);
    }
    onEntrySelect(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === filteredAndSortedEntries.length) {
      onEntrySelect([]);
    } else {
      onEntrySelect(filteredAndSortedEntries.map(entry => entry.id));
    }
  };

  const getSourceFileColor = (sourceFile) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800'];
    const hash = sourceFile.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const EntryRow = useCallback(({ index, style }) => {
    const entry = filteredAndSortedEntries[index];
    const isExpanded = expandedEntries.has(entry.id);
    const isSelected = selectedEntries.includes(entry.id);

    return (
      <div style={style} className="border-b border-border">
        <div className="flex items-center px-4 py-3 hover:bg-surface-hover transition-colors duration-150">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => handleEntrySelection(entry, e.target.checked)}
            className="mr-3 rounded border-border focus:ring-primary"
          />
          
          {/* Expand Button */}
          <button
            onClick={() => toggleEntryExpansion(entry.id)}
            className="mr-3 p-1 rounded hover:bg-surface-hover"
          >
            <Icon 
              name={isExpanded ? "ChevronDown" : "ChevronRight"} 
              size={14} 
              color="var(--color-text-muted)"
            />
          </button>
          
          {/* Timestamp */}
          <div className="w-32 text-sm text-text-secondary font-mono">
            {formatTimestamp(entry.timestamp)}
          </div>
          
          {/* Source File */}
          <div className="w-40 mx-4">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSourceFileColor(entry.sourceFile)}`}>
              {entry.sourceFile}
            </span>
          </div>
          
          {/* Line Number */}
          <div className="w-16 text-sm text-text-muted font-mono">
            {entry.lineNumber}
          </div>
          
          {/* Content Preview */}
          <div className="flex-1 mx-4">
            <div className="text-sm text-text-primary truncate">
              {entry.content}
            </div>
          </div>
          
          {/* Level Badge */}
          <div className="w-20">
            <span className={`
              inline-block px-2 py-1 rounded-full text-xs font-medium
              ${entry.level === 'ERROR' ? 'bg-error-100 text-error-800' :
                entry.level === 'WARN' ? 'bg-warning-100 text-warning-800' :
                entry.level === 'INFO'? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'
              }
            `}>
              {entry.level}
            </span>
          </div>
        </div>
        
        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 bg-surface">
            <div className="bg-background border border-border rounded-md p-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-text-secondary">Source:</span>
                  <span className="ml-2 text-text-primary">{entry.sourceFile}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Line:</span>
                  <span className="ml-2 text-text-primary font-mono">{entry.lineNumber}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Timestamp:</span>
                  <span className="ml-2 text-text-primary font-mono">{new Date(entry.timestamp).toISOString()}</span>
                </div>
                <div>
                  <span className="font-medium text-text-secondary">Level:</span>
                  <span className="ml-2 text-text-primary">{entry.level}</span>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="font-medium text-text-secondary">Full Content:</span>
              </div>
              <div className="bg-slate-50 border border-border rounded p-3 font-mono text-sm text-text-primary whitespace-pre-wrap">
                {entry.fullContent || entry.content}
              </div>
              
              {entry.metadata && (
                <div className="mt-3">
                  <span className="font-medium text-text-secondary">Metadata:</span>
                  <div className="mt-1 bg-slate-50 border border-border rounded p-2 text-xs">
                    <pre className="text-text-muted">{JSON.stringify(entry.metadata, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [filteredAndSortedEntries, expandedEntries, selectedEntries, handleEntrySelection]);

  if (!group) {
    return (
      <div className={`flex-1 flex items-center justify-center bg-background ${className}`}>
        <div className="text-center">
          <Icon name="Layers" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Select a Group</h3>
          <p className="text-text-secondary">Choose a content group from the sidebar to view its entries</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-background ${className}`}>
      {/* Toolbar */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{group.name}</h2>
              <p className="text-sm text-text-secondary mt-1">
                {filteredAndSortedEntries.length} entries • Pattern: {group.pattern}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                iconName="Download"
                iconSize={16}
                onClick={() => onBulkAction('export', selectedEntries)}
                disabled={selectedEntries.length === 0}
              >
                Export Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="MoreHorizontal"
                iconSize={16}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Icon 
                name="Search" 
                size={16} 
                color="var(--color-text-muted)" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search within group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-text-muted">to</span>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || dateRange.start || dateRange.end) && (
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                iconSize={16}
                onClick={() => {
                  setSearchTerm('');
                  setDateRange({ start: '', end: '' });
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-surface border-b border-border">
        <div className="flex items-center px-4 py-3 text-sm font-medium text-text-secondary">
          <input
            type="checkbox"
            checked={selectedEntries.length === filteredAndSortedEntries.length && filteredAndSortedEntries.length > 0}
            onChange={handleSelectAll}
            className="mr-3 rounded border-border focus:ring-primary"
          />
          <div className="w-6 mr-3" /> {/* Expand button space */}
          
          <button
            onClick={() => handleSort('timestamp')}
            className="w-32 text-left flex items-center space-x-1 hover:text-text-primary"
          >
            <span>Timestamp</span>
            {sortConfig.key === 'timestamp' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? "ChevronUp" : "ChevronDown"} 
                size={14} 
                color="currentColor"
              />
            )}
          </button>
          
          <button
            onClick={() => handleSort('sourceFile')}
            className="w-40 mx-4 text-left flex items-center space-x-1 hover:text-text-primary"
          >
            <span>Source File</span>
            {sortConfig.key === 'sourceFile' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? "ChevronUp" : "ChevronDown"} 
                size={14} 
                color="currentColor"
              />
            )}
          </button>
          
          <button
            onClick={() => handleSort('lineNumber')}
            className="w-16 text-left flex items-center space-x-1 hover:text-text-primary"
          >
            <span>Line</span>
            {sortConfig.key === 'lineNumber' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? "ChevronUp" : "ChevronDown"} 
                size={14} 
                color="currentColor"
              />
            )}
          </button>
          
          <div className="flex-1 mx-4">Content</div>
          <div className="w-20">Level</div>
        </div>
      </div>

      {/* Virtualized Table Content */}
      <div className="flex-1">
        {filteredAndSortedEntries.length > 0 ? (
          <List
            height={600}
            itemCount={filteredAndSortedEntries.length}
            itemSize={60}
            className="scrollbar-thin scrollbar-thumb-secondary-300 scrollbar-track-transparent"
          >
            {EntryRow}
          </List>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Entries Found</h3>
              <p className="text-text-secondary">
                {searchTerm || dateRange.start || dateRange.end 
                  ? 'Try adjusting your filters' :'This group contains no log entries'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentTable;