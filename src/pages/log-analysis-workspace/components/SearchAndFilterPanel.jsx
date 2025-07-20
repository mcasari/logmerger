import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchAndFilterPanel = ({ 
  onSearchChange, 
  onFilterChange, 
  searchQuery = '', 
  filters = {},
  logStats = {},
  className = '' 
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dateRange: { start: '', end: '' },
    logLevels: [],
    sourceFiles: [],
    regexPattern: '',
    caseSensitive: false,
    wholeWord: false,
    ...filters
  });

  const logLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
  const sourceFiles = [
    { name: 'application.log', color: '#3b82f6', count: 1250 },
    { name: 'error.log', color: '#ef4444', count: 89 },
    { name: 'access.log', color: '#10b981', count: 2340 },
    { name: 'system.log', color: '#f59e0b', count: 567 },
    { name: 'debug.log', color: '#8b5cf6', count: 890 }
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localSearchQuery, onSearchChange]);

  useEffect(() => {
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogLevelToggle = (level) => {
    const newLevels = localFilters.logLevels.includes(level)
      ? localFilters.logLevels.filter(l => l !== level)
      : [...localFilters.logLevels, level];
    
    handleFilterChange('logLevels', newLevels);
  };

  const handleSourceFileToggle = (fileName) => {
    const newFiles = localFilters.sourceFiles.includes(fileName)
      ? localFilters.sourceFiles.filter(f => f !== fileName)
      : [...localFilters.sourceFiles, fileName];
    
    handleFilterChange('sourceFiles', newFiles);
  };

  const clearAllFilters = () => {
    setLocalSearchQuery('');
    setLocalFilters({
      dateRange: { start: '', end: '' },
      logLevels: [],
      sourceFiles: [],
      regexPattern: '',
      caseSensitive: false,
      wholeWord: false
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localSearchQuery.trim()) count++;
    if (localFilters.logLevels.length > 0) count++;
    if (localFilters.sourceFiles.length > 0) count++;
    if (localFilters.regexPattern.trim()) count++;
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
    return count;
  };

  return (
    <div className={`bg-background border border-border rounded-md h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">Search & Filter</h3>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <div className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                {getActiveFilterCount()}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              iconName="RotateCcw"
              iconSize={14}
              onClick={clearAllFilters}
              disabled={getActiveFilterCount() === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Icon 
            name="Search" 
            size={16} 
            color="var(--color-text-muted)" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          <Input
            type="text"
            placeholder="Search log content..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchQuery && (
            <button
              onClick={() => setLocalSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-surface-hover"
            >
              <Icon name="X" size={14} color="var(--color-text-muted)" />
            </button>
          )}
        </div>

        {/* Search Options */}
        <div className="flex items-center space-x-4 mt-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={localFilters.caseSensitive}
              onChange={(e) => handleFilterChange('caseSensitive', e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-text-secondary">Case sensitive</span>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={localFilters.wholeWord}
              onChange={(e) => handleFilterChange('wholeWord', e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-text-secondary">Whole word</span>
          </label>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-border bg-surface">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-secondary">Total Entries:</span>
            <div className="font-mono font-medium text-text-primary">
              {(logStats.totalEntries || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-text-secondary">Filtered:</span>
            <div className="font-mono font-medium text-text-primary">
              {(logStats.filteredEntries || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-text-secondary">Time Range:</span>
            <div className="text-xs text-text-muted">
              {logStats.timeRange || 'N/A'}
            </div>
          </div>
          <div>
            <span className="text-text-secondary">Files:</span>
            <div className="text-xs text-text-muted">
              {logStats.fileCount || 0} sources
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Date Range</h4>
            <div className="space-y-2">
              <Input
                type="datetime-local"
                value={localFilters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...localFilters.dateRange,
                  start: e.target.value
                })}
                className="text-sm"
              />
              <Input
                type="datetime-local"
                value={localFilters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...localFilters.dateRange,
                  end: e.target.value
                })}
                className="text-sm"
              />
            </div>
          </div>

          {/* Log Levels */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Log Levels</h4>
            <div className="space-y-2">
              {logLevels.map(level => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.logLevels.includes(level)}
                    onChange={() => handleLogLevelToggle(level)}
                    className="rounded border-border"
                  />
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${level === 'ERROR' ? 'bg-error-100 text-error-800' :
                      level === 'WARN' ? 'bg-warning-100 text-warning-800' :
                      level === 'INFO'? 'bg-accent-100 text-accent-800' : 'bg-surface text-text-secondary'
                    }
                  `}>
                    {level}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({Math.floor(Math.random() * 1000)})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Source Files */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Source Files</h4>
            <div className="space-y-2">
              {sourceFiles.map(file => (
                <label key={file.name} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.sourceFiles.includes(file.name)}
                    onChange={() => handleSourceFileToggle(file.name)}
                    className="rounded border-border"
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: file.color }}
                  />
                  <span className="text-sm text-text-primary font-mono flex-1 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({file.count.toLocaleString()})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div>
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center space-x-2 text-sm font-medium text-text-primary hover:text-primary transition-colors duration-150"
            >
              <Icon 
                name={isAdvancedOpen ? "ChevronDown" : "ChevronRight"} 
                size={14} 
              />
              <span>Advanced Filters</span>
            </button>
            
            {isAdvancedOpen && (
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Regex Pattern
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter regex pattern..."
                    value={localFilters.regexPattern}
                    onChange={(e) => handleFilterChange('regexPattern', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Use regular expressions for advanced pattern matching
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <Button
            variant="ghost"
            size="sm"
            iconName="RefreshCw"
            iconSize={12}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterPanel;