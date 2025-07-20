import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GroupSidebar = ({ 
  groups, 
  selectedGroup, 
  onGroupSelect, 
  onExportGroup,
  isCollapsed,
  onToggleCollapse,
  className = '' 
}) => {
  const [expandedGroups, setExpandedGroups] = useState(new Set(['all']));
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups;
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.pattern.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-success';
      case 'processing': return 'text-accent';
      case 'error': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  const getGroupIcon = (type) => {
    switch (type) {
      case 'error': return 'AlertCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
      case 'debug': return 'Bug';
      default: return 'Folder';
    }
  };

  if (isCollapsed) {
    return (
      <div className={`w-12 bg-surface border-r border-border flex flex-col items-center py-4 space-y-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          iconName="ChevronRight"
          iconSize={16}
          onClick={onToggleCollapse}
          className="text-text-secondary hover:text-text-primary"
        />
        <div className="w-6 h-px bg-border" />
        {filteredGroups.slice(0, 5).map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupSelect(group)}
            className={`
              w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium
              transition-all duration-150 ease-out
              ${selectedGroup?.id === group.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }
            `}
            title={group.name}
          >
            {group.entries.length}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-80 bg-surface border-r border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text-primary">Content Groups</h2>
          <Button
            variant="ghost"
            size="sm"
            iconName="ChevronLeft"
            iconSize={16}
            onClick={onToggleCollapse}
            className="text-text-secondary hover:text-text-primary"
          />
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const isSelected = selectedGroup?.id === group.id;
            
            return (
              <div key={group.id} className="space-y-1">
                {/* Main Group */}
                <div
                  className={`
                    flex items-center space-x-2 p-3 rounded-md cursor-pointer
                    transition-all duration-150 ease-out hover-lift
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-text-primary hover:bg-surface-hover'
                    }
                  `}
                  onClick={() => onGroupSelect(group)}
                >
                  {/* Expand/Collapse Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroupExpansion(group.id);
                    }}
                    className="p-0.5 rounded hover:bg-black/10"
                  >
                    <Icon 
                      name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                      size={14} 
                      color="currentColor"
                    />
                  </button>
                  
                  {/* Group Icon */}
                  <Icon 
                    name={getGroupIcon(group.type)} 
                    size={16} 
                    color={isSelected ? 'currentColor' : `var(--color-${group.type === 'error' ? 'error' : group.type === 'warning' ? 'warning' : 'accent'})`}
                  />
                  
                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{group.name}</span>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${isSelected 
                          ? 'bg-white/20 text-current' :'bg-secondary-100 text-secondary-700'
                        }
                      `}>
                        {group.entries.length}
                      </span>
                    </div>
                    <div className="text-xs opacity-75 truncate mt-0.5">
                      {group.pattern}
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(group.status).replace('text-', 'bg-')}`} />
                </div>
                
                {/* Subgroups */}
                {isExpanded && group.subgroups && group.subgroups.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {group.subgroups.map((subgroup) => (
                      <div
                        key={subgroup.id}
                        className={`
                          flex items-center space-x-2 p-2 rounded-md cursor-pointer text-sm
                          transition-all duration-150 ease-out
                          ${selectedGroup?.id === subgroup.id 
                            ? 'bg-accent text-accent-foreground' 
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                          }
                        `}
                        onClick={() => onGroupSelect(subgroup)}
                      >
                        <Icon name="FileText" size={14} color="currentColor" />
                        <span className="flex-1 truncate">{subgroup.name}</span>
                        <span className="text-xs opacity-75">{subgroup.entries.length}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-text-muted mb-3">
          <span>Total Groups: {filteredGroups.length}</span>
          <span>
            Entries: {filteredGroups.reduce((sum, group) => sum + group.entries.length, 0)}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            iconName="Download"
            iconSize={14}
            onClick={() => selectedGroup && onExportGroup(selectedGroup)}
            disabled={!selectedGroup}
            className="flex-1"
          >
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreHorizontal"
            iconSize={14}
            className="px-3"
          />
        </div>
      </div>
    </div>
  );
};

export default GroupSidebar;