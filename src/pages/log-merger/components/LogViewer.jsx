import React, { useMemo, useState, useEffect } from 'react';
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
  // Pagination state
  const [groupPagination, setGroupPagination] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const getGroupColor = (groupName) => {
    if (groupName.includes('ERROR')) return '#ef4444';
    if (groupName.includes('WARN')) return '#f59e0b';
    if (groupName.includes('INFO')) return '#10b981';
    if (groupName.includes('DEBUG')) return '#8b5cf6';
    return '#6b7280';
  };

  // Reset pagination when search query changes
  useEffect(() => {
    setGroupPagination({});
  }, [searchQuery]);

  // Get current page for a group
  const getCurrentPage = (groupId) => {
    return groupPagination[groupId] || 1;
  };

  // Set current page for a group
  const setCurrentPage = (groupId, page) => {
    setGroupPagination(prev => ({
      ...prev,
      [groupId]: page
    }));
  };

  // Get paginated entries for a group
  const getPaginatedEntries = (entries, groupId) => {
    const currentPage = getCurrentPage(groupId);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return entries.slice(startIndex, endIndex);
  };

  // Get total pages for a group
  const getTotalPages = (entriesLength) => {
    return Math.ceil(entriesLength / itemsPerPage);
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

  const totalVisibleEntries = useMemo(() => {
    return groups.reduce((total, group) => total + group.entries.length, 0);
  }, [groups]);

  // Items per page options
  const itemsPerPageOptions = [10, 25, 50, 100, 200];

  // Pagination controls component
  const PaginationControls = ({ groupId, totalEntries }) => {
    const currentPage = getCurrentPage(groupId);
    const totalPages = getTotalPages(totalEntries);
    
    if (totalPages <= 1) return null;

    const startEntry = (currentPage - 1) * itemsPerPage + 1;
    const endEntry = Math.min(currentPage * itemsPerPage, totalEntries);

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(groupId, newPage);
      }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 7;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border">
        <div className="text-sm text-text-secondary">
          Showing {startEntry.toLocaleString()}-{endEntry.toLocaleString()} of {totalEntries.toLocaleString()} entries
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            iconName="ChevronLeft"
            iconSize={14}
          >
            Previous
          </Button>
          
          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-text-muted">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`
                      px-3 py-1 text-sm rounded transition-colors duration-150
                      ${currentPage === page
                        ? 'bg-primary text-white' :'text-text-secondary hover:bg-surface-hover'
                      }
                    `}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            iconName="ChevronRight"
            iconSize={14}
          >
            Next
          </Button>
        </div>
      </div>
    );
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
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setGroupPagination({}); // Reset all pagination
                }}
                className="px-3 py-1 text-sm border border-border rounded-md bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {itemsPerPageOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
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

      {/* Groups */}
      <div className="max-h-96 overflow-y-auto">
        {groups.length > 0 ? (
          <div className="divide-y divide-border">
            {groups.map((group) => {
              const isCollapsed = collapsedGroups.has(group.id);
              const groupColor = getGroupColor(group.name);
              const paginatedEntries = getPaginatedEntries(group.entries, group.id);
              
              return (
                <div key={group.id} className="bg-background">
                  {/* Group Header */}
                  <button
                    onClick={() => onGroupToggle(group.id)}
                    className="w-full px-6 py-4 text-left hover:bg-surface-hover transition-colors duration-150"
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
                  
                  {/* Group Entries */}
                  {!isCollapsed && group.entries.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="bg-surface border border-border rounded-md">
                        <div className="max-h-80 overflow-y-auto">
                          {paginatedEntries.map((entry, index) => (
                            <div
                              key={entry.id}
                              className={`
                                p-3 border-b border-border last:border-b-0 hover:bg-surface-hover
                                ${index % 2 === 0 ? 'bg-background' : 'bg-surface'}
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
                                    {formatTimestamp(entry.timestamp)}
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
                          ))}
                        </div>
                        
                        {/* Pagination Controls */}
                        <PaginationControls 
                          groupId={group.id} 
                          totalEntries={group.entries.length}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Icon name="Search" size={48} color="var(--color-text-muted)" className="mx-auto mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">No groups found</h4>
            <p className="text-text-secondary">
              Upload and process log files to see grouped content here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;