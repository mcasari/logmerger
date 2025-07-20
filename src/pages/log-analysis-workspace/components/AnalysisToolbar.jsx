import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnalysisToolbar = ({ 
  onExport, 
  onSearch, 
  searchQuery = '', 
  selectedCount = 0,
  totalCount = 0,
  onViewModeChange,
  viewMode = 'list',
  className = '' 
}) => {
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  const exportOptions = [
    { id: 'selected', label: 'Export Selected', icon: 'CheckSquare', disabled: selectedCount === 0 },
    { id: 'filtered', label: 'Export Filtered', icon: 'Filter', disabled: false },
    { id: 'all', label: 'Export All', icon: 'Database', disabled: totalCount === 0 },
    { id: 'groups', label: 'Export by Groups', icon: 'Layers', disabled: false },
    { id: 'summary', label: 'Export Summary', icon: 'FileText', disabled: false }
  ];

  const viewModes = [
    { id: 'list', label: 'List View', icon: 'List' },
    { id: 'table', label: 'Table View', icon: 'Table' },
    { id: 'timeline', label: 'Timeline View', icon: 'Clock' },
    { id: 'grouped', label: 'Grouped View', icon: 'Layers' }
  ];

  const handleExport = (format) => {
    onExport(format);
    setIsExportDropdownOpen(false);
  };

  const handleViewModeChange = (mode) => {
    onViewModeChange(mode);
    setIsViewDropdownOpen(false);
  };

  return (
    <div className={`bg-surface border-b border-border sticky top-0 z-10 ${className}`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Icon 
                name="Search" 
                size={16} 
                color="var(--color-text-muted)" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search in current view..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-surface-hover"
                >
                  <Icon name="X" size={14} color="var(--color-text-muted)" />
                </button>
              )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-text-muted">
              {selectedCount > 0 && (
                <span className="text-primary font-medium">
                  {selectedCount.toLocaleString()} selected
                </span>
              )}
              {selectedCount > 0 && totalCount > 0 && <span className="mx-2">•</span>}
              {totalCount > 0 && (
                <span>
                  {totalCount.toLocaleString()} total entries
                </span>
              )}
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                iconName={viewModes.find(v => v.id === viewMode)?.icon || 'List'}
                iconSize={16}
                onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                className="hidden md:flex"
              >
                {viewModes.find(v => v.id === viewMode)?.label || 'List View'}
                <Icon name="ChevronDown" size={14} className="ml-1" />
              </Button>

              {isViewDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-md z-200">
                  <div className="py-1">
                    {viewModes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => handleViewModeChange(mode.id)}
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-left text-sm
                          transition-colors duration-150
                          ${viewMode === mode.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-text-primary hover:bg-surface-hover'
                          }
                        `}
                      >
                        <Icon name={mode.icon} size={14} color="currentColor" />
                        <span>{mode.label}</span>
                        {viewMode === mode.id && (
                          <Icon name="Check" size={12} color="currentColor" className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <Button
              variant="ghost"
              size="sm"
              iconName="RefreshCw"
              iconSize={16}
              onClick={() => window.location.reload()}
              title="Refresh data"
            />

            <Button
              variant="ghost"
              size="sm"
              iconName="Settings"
              iconSize={16}
              onClick={() => console.log('Open settings')}
              title="View settings"
            />

            {/* Export Dropdown */}
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                iconName="Download"
                iconSize={16}
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              >
                Export
                <Icon name="ChevronDown" size={14} className="ml-1" />
              </Button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-md shadow-md z-200">
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-medium text-text-muted border-b border-border">
                      Export Options
                    </div>
                    {exportOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleExport(option.id)}
                        disabled={option.disabled}
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-left text-sm
                          transition-colors duration-150
                          ${option.disabled 
                            ? 'text-text-muted cursor-not-allowed' :'text-text-primary hover:bg-surface-hover'
                          }
                        `}
                      >
                        <Icon 
                          name={option.icon} 
                          size={14} 
                          color={option.disabled ? "var(--color-text-muted)" : "currentColor"} 
                        />
                        <span>{option.label}</span>
                        {option.id === 'selected' && selectedCount > 0 && (
                          <span className="ml-auto text-xs text-primary">
                            ({selectedCount})
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <div className="px-3 py-2 text-xs text-text-muted">
                        Formats: CSV, JSON, TXT
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Toolbar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          {/* Filter Indicators */}
          <div className="flex items-center space-x-2">
            {searchQuery && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-accent-50 text-accent-700 rounded-md text-xs">
                <Icon name="Search" size={12} />
                <span>Search: "{searchQuery}"</span>
                <button
                  onClick={() => onSearch('')}
                  className="ml-1 hover:bg-accent-100 rounded p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}
            
            {selectedCount > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs">
                <Icon name="CheckSquare" size={12} />
                <span>{selectedCount} selected</span>
              </div>
            )}
          </div>

          {/* Performance Indicator */}
          <div className="flex items-center space-x-2 text-xs text-text-muted">
            <Icon name="Zap" size={12} color="var(--color-success)" />
            <span>Virtualized rendering active</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisToolbar;