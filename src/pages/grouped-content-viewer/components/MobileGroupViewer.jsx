import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MobileGroupViewer = ({ 
  groups, 
  selectedGroup, 
  onGroupSelect, 
  entries,
  onExport,
  className = '' 
}) => {
  const [isGroupSelectorOpen, setIsGroupSelectorOpen] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntries = entries.filter(entry => 
    !searchTerm || entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEntryExpansion = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceFileColor = (sourceFile) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    const hash = sourceFile.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background border-b border-border z-10">
        <div className="p-4">
          {/* Group Selector */}
          <div className="mb-4">
            <button
              onClick={() => setIsGroupSelectorOpen(!isGroupSelectorOpen)}
              className="w-full flex items-center justify-between p-3 bg-surface border border-border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  name={selectedGroup ? "Folder" : "FolderOpen"} 
                  size={20} 
                  color="var(--color-primary)"
                />
                <div className="text-left">
                  <div className="font-medium text-text-primary">
                    {selectedGroup ? selectedGroup.name : 'Select Group'}
                  </div>
                  {selectedGroup && (
                    <div className="text-xs text-text-secondary">
                      {selectedGroup.entries.length} entries
                    </div>
                  )}
                </div>
              </div>
              <Icon 
                name={isGroupSelectorOpen ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                color="var(--color-text-secondary)"
              />
            </button>
            
            {/* Group Dropdown */}
            {isGroupSelectorOpen && (
              <div className="absolute left-4 right-4 mt-1 bg-background border border-border rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      onGroupSelect(group);
                      setIsGroupSelectorOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between p-3 text-left border-b border-border last:border-b-0
                      ${selectedGroup?.id === group.id ? 'bg-primary-50 text-primary' : 'hover:bg-surface-hover'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name="Folder" 
                        size={16} 
                        color={selectedGroup?.id === group.id ? 'currentColor' : 'var(--color-text-secondary)'}
                      />
                      <div>
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs opacity-75">{group.pattern}</div>
                      </div>
                    </div>
                    <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      {group.entries.length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Search and Actions */}
          {selectedGroup && (
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Icon 
                  name="Search" 
                  size={16} 
                  color="var(--color-text-muted)" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                iconName="Download"
                iconSize={16}
                onClick={() => onExport(selectedGroup)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedGroup ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Icon name="Layers" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Select a Group</h3>
              <p className="text-text-secondary">Choose a content group to view its entries</p>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No Entries Found</h3>
              <p className="text-text-secondary">
                {searchTerm ? 'Try adjusting your search' : 'This group contains no entries'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedEntries.has(entry.id);
              
              return (
                <div key={entry.id} className="bg-surface border border-border rounded-md overflow-hidden">
                  {/* Entry Header */}
                  <button
                    onClick={() => toggleEntryExpansion(entry.id)}
                    className="w-full p-4 text-left hover:bg-surface-hover transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`
                          inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${entry.level === 'ERROR' ? 'bg-error-100 text-error-800' :
                            entry.level === 'WARN' ? 'bg-warning-100 text-warning-800' :
                            entry.level === 'INFO'? 'bg-accent-100 text-accent-800' : 'bg-secondary-100 text-secondary-800'
                          }
                        `}>
                          {entry.level}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSourceFileColor(entry.sourceFile)}`}>
                          {entry.sourceFile}
                        </span>
                      </div>
                      <Icon 
                        name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                        color="var(--color-text-muted)"
                      />
                    </div>
                    
                    <div className="text-sm text-text-primary mb-2 line-clamp-2">
                      {entry.content}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span className="font-mono">{formatTimestamp(entry.timestamp)}</span>
                      <span className="font-mono">Line {entry.lineNumber}</span>
                    </div>
                  </button>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 bg-background">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-text-secondary">Source:</span>
                            <div className="text-text-primary mt-1">{entry.sourceFile}</div>
                          </div>
                          <div>
                            <span className="font-medium text-text-secondary">Line:</span>
                            <div className="text-text-primary mt-1 font-mono">{entry.lineNumber}</div>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-text-secondary text-sm">Timestamp:</span>
                          <div className="text-text-primary mt-1 font-mono text-sm">
                            {new Date(entry.timestamp).toISOString()}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-text-secondary text-sm">Full Content:</span>
                          <div className="bg-slate-50 border border-border rounded p-3 mt-1 font-mono text-sm text-text-primary whitespace-pre-wrap">
                            {entry.fullContent || entry.content}
                          </div>
                        </div>
                        
                        {entry.metadata && (
                          <div>
                            <span className="font-medium text-text-secondary text-sm">Metadata:</span>
                            <div className="bg-slate-50 border border-border rounded p-2 mt-1 text-xs">
                              <pre className="text-text-muted">{JSON.stringify(entry.metadata, null, 2)}</pre>
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
        )}
      </div>
    </div>
  );
};

export default MobileGroupViewer;