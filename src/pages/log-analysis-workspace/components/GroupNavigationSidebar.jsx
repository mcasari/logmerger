import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const GroupNavigationSidebar = ({ 
  groups, 
  selectedGroups, 
  onGroupToggle, 
  onGroupSelect,
  searchQuery,
  className = '' 
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  const filteredGroups = useMemo(() => {
    if (!sidebarSearchQuery.trim()) return groups;
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) ||
      group.pattern.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
    );
  }, [groups, sidebarSearchQuery]);

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleAllGroups = () => {
    const allSelected = selectedGroups.length === groups.length;
    if (allSelected) {
      onGroupSelect([]);
    } else {
      onGroupSelect(groups.map(g => g.id));
    }
  };

  const getTotalEntries = () => {
    return groups.reduce((total, group) => total + group.entries.length, 0);
  };

  const getSelectedEntries = () => {
    return groups
      .filter(group => selectedGroups.includes(group.id))
      .reduce((total, group) => total + group.entries.length, 0);
  };

  return (
    <div className={`bg-background border-r border-border h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Groups</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleAllGroups}
              className="p-1.5 rounded-md hover:bg-surface-hover transition-colors duration-150"
              title={selectedGroups.length === groups.length ? "Deselect all" : "Select all"}
            >
              <Icon 
                name={selectedGroups.length === groups.length ? "CheckSquare" : "Square"} 
                size={16} 
                color="var(--color-text-secondary)" 
              />
            </button>
            <button
              onClick={() => setExpandedGroups(new Set(groups.map(g => g.id)))}
              className="p-1.5 rounded-md hover:bg-surface-hover transition-colors duration-150"
              title="Expand all groups"
            >
              <Icon name="ChevronDown" size={16} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon 
            name="Search" 
            size={16} 
            color="var(--color-text-muted)" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Search groups..."
            value={sidebarSearchQuery}
            onChange={(e) => setSidebarSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Summary */}
        <div className="mt-3 text-xs text-text-muted">
          <div className="flex justify-between">
            <span>Total Entries:</span>
            <span className="font-mono">{getTotalEntries().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected:</span>
            <span className="font-mono">{getSelectedEntries().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredGroups.map((group) => {
            const isSelected = selectedGroups.includes(group.id);
            const isExpanded = expandedGroups.has(group.id);
            
            return (
              <div key={group.id} className="group">
                {/* Group Header */}
                <div className={`
                  flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-150
                  ${isSelected 
                    ? 'bg-primary-50 border border-primary-200' :'hover:bg-surface-hover'
                  }
                `}>
                  <button
                    onClick={() => toggleGroupExpansion(group.id)}
                    className="p-0.5 rounded hover:bg-surface-hover"
                  >
                    <Icon 
                      name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                      size={14} 
                      color="var(--color-text-secondary)"
                    />
                  </button>
                  
                  <button
                    onClick={() => onGroupToggle(group.id)}
                    className="flex-1 flex items-center space-x-2 text-left"
                  >
                    <Icon 
                      name={isSelected ? "CheckSquare" : "Square"} 
                      size={14} 
                      color={isSelected ? "var(--color-primary)" : "var(--color-text-secondary)"}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        isSelected ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {group.name}
                      </div>
                      <div className="text-xs text-text-muted truncate">
                        {group.entries.length} entries
                      </div>
                    </div>
                  </button>
                  
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-surface text-text-secondary'
                    }
                  `}>
                    {group.entries.length}
                  </div>
                </div>

                {/* Group Details */}
                {isExpanded && (
                  <div className="ml-6 mt-1 p-2 bg-surface rounded-md border border-border">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-text-secondary">Pattern:</span>
                        <code className="ml-2 px-1.5 py-0.5 bg-background rounded font-mono text-text-primary">
                          {group.pattern}
                        </code>
                      </div>
                      <div>
                        <span className="text-text-secondary">Files:</span>
                        <div className="ml-2 mt-1 space-y-1">
                          {group.sourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: file.color }}
                              />
                              <span className="text-text-primary font-mono truncate">
                                {file.name}
                              </span>
                              <span className="text-text-muted">
                                ({file.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {group.lastMatch && (
                        <div>
                          <span className="text-text-secondary">Last Match:</span>
                          <div className="ml-2 mt-1 text-text-muted">
                            {new Date(group.lastMatch).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredGroups.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="Search" size={32} color="var(--color-text-muted)" className="mx-auto mb-2" />
            <p className="text-text-muted">No groups found</p>
            {sidebarSearchQuery && (
              <button
                onClick={() => setSidebarSearchQuery('')}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-text-muted">
          <div className="flex justify-between mb-1">
            <span>Groups:</span>
            <span>{filteredGroups.length} of {groups.length}</span>
          </div>
          {searchQuery && (
            <div className="flex justify-between">
              <span>Search Results:</span>
              <span className="text-accent font-medium">Active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupNavigationSidebar;