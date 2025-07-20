import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import GroupNavigationSidebar from './components/GroupNavigationSidebar';
import LogContentViewer from './components/LogContentViewer';
import SearchAndFilterPanel from './components/SearchAndFilterPanel';
import AnalysisToolbar from './components/AnalysisToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const LogAnalysisWorkspace = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Mock data for log groups
  const mockGroups = [
    {
      id: 'error-group',
      name: 'Error Logs',
      pattern: '\\[ERROR\\]',
      entries: Array.from({ length: 89 }, (_, i) => ({
        id: `error-${i}`,
        groupId: 'error-group',
        content: `[ERROR] ${new Date(Date.now() - Math.random() * 86400000).toISOString()} - Database connection failed: Connection timeout after 30 seconds\n    at DatabaseManager.connect(DatabaseManager.java:45)\n    at ApplicationService.initialize(ApplicationService.java:23)`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        lineNumber: Math.floor(Math.random() * 10000) + 1,
        source: 'error.log',
        sourceColor: '#ef4444',
        level: 'ERROR'
      })),
      sourceFiles: [
        { name: 'error.log', color: '#ef4444', count: 89 }
      ],
      lastMatch: new Date(Date.now() - 300000)
    },
    {
      id: 'warning-group',
      name: 'Warning Logs',
      pattern: '\\[WARN\\]',
      entries: Array.from({ length: 234 }, (_, i) => ({
        id: `warn-${i}`,
        groupId: 'warning-group',
        content: `[WARN] ${new Date(Date.now() - Math.random() * 86400000).toISOString()} - Memory usage is above 80% threshold (current: ${85 + Math.floor(Math.random() * 10)}%)`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        lineNumber: Math.floor(Math.random() * 10000) + 1,
        source: 'application.log',
        sourceColor: '#3b82f6',
        level: 'WARN'
      })),
      sourceFiles: [
        { name: 'application.log', color: '#3b82f6', count: 234 }
      ],
      lastMatch: new Date(Date.now() - 120000)
    },
    {
      id: 'info-group',
      name: 'Info Logs',
      pattern: '\\[INFO\\]',
      entries: Array.from({ length: 1567 }, (_, i) => ({
        id: `info-${i}`,
        groupId: 'info-group',
        content: `[INFO] ${new Date(Date.now() - Math.random() * 86400000).toISOString()} - User authentication successful for user: user${Math.floor(Math.random() * 1000)}@example.com`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        lineNumber: Math.floor(Math.random() * 10000) + 1,
        source: 'access.log',
        sourceColor: '#10b981',
        level: 'INFO'
      })),
      sourceFiles: [
        { name: 'access.log', color: '#10b981', count: 1567 }
      ],
      lastMatch: new Date(Date.now() - 60000)
    },
    {
      id: 'debug-group',
      name: 'Debug Logs',
      pattern: '\\[DEBUG\\]',
      entries: Array.from({ length: 890 }, (_, i) => ({
        id: `debug-${i}`,
        groupId: 'debug-group',
        content: `[DEBUG] ${new Date(Date.now() - Math.random() * 86400000).toISOString()} - Processing request with parameters: {userId: ${Math.floor(Math.random() * 1000)}, action: 'getData', timestamp: ${Date.now()}}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        lineNumber: Math.floor(Math.random() * 10000) + 1,
        source: 'debug.log',
        sourceColor: '#8b5cf6',
        level: 'DEBUG'
      })),
      sourceFiles: [
        { name: 'debug.log', color: '#8b5cf6', count: 890 }
      ],
      lastMatch: new Date(Date.now() - 30000)
    },
    {
      id: 'system-group',
      name: 'System Events',
      pattern: 'SYSTEM:',
      entries: Array.from({ length: 456 }, (_, i) => ({
        id: `system-${i}`,
        groupId: 'system-group',
        content: `SYSTEM: ${new Date(Date.now() - Math.random() * 86400000).toISOString()} - Service ${['UserService', 'PaymentService', 'NotificationService'][Math.floor(Math.random() * 3)]} ${['started', 'stopped', 'restarted'][Math.floor(Math.random() * 3)]} successfully`,
        timestamp: new Date(Date.now() - Math.random() * 86400000),
        lineNumber: Math.floor(Math.random() * 10000) + 1,
        source: 'system.log',
        sourceColor: '#f59e0b',
        level: 'INFO'
      })),
      sourceFiles: [
        { name: 'system.log', color: '#f59e0b', count: 456 }
      ],
      lastMatch: new Date(Date.now() - 180000)
    }
  ];

  // Flatten all log entries
  const allLogEntries = useMemo(() => {
    return mockGroups.flatMap(group => group.entries);
  }, []);

  // Calculate log statistics
  const logStats = useMemo(() => {
    const totalEntries = allLogEntries.length;
    const filteredEntries = selectedGroups.length > 0 
      ? allLogEntries.filter(entry => selectedGroups.includes(entry.groupId)).length
      : totalEntries;
    
    const timestamps = allLogEntries.map(entry => entry.timestamp);
    const minTime = new Date(Math.min(...timestamps));
    const maxTime = new Date(Math.max(...timestamps));
    
    return {
      totalEntries,
      filteredEntries,
      timeRange: `${minTime.toLocaleDateString()} - ${maxTime.toLocaleDateString()}`,
      fileCount: mockGroups.reduce((acc, group) => acc + group.sourceFiles.length, 0)
    };
  }, [allLogEntries, selectedGroups]);

  // Initialize with all groups selected
  useEffect(() => {
    setSelectedGroups(mockGroups.map(group => group.id));
  }, []);

  const handleGroupToggle = useCallback((groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  const handleGroupSelect = useCallback((groupIds) => {
    setSelectedGroups(groupIds);
  }, []);

  const handleEntrySelect = useCallback((entryId) => {
    setSelectedEntries(prev => 
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleExport = useCallback((format) => {
    console.log(`Exporting ${format}:`, {
      selectedGroups,
      selectedEntries,
      searchQuery,
      filters
    });
    
    // Mock export functionality
    const exportData = {
      format,
      timestamp: new Date().toISOString(),
      totalEntries: logStats.filteredEntries,
      selectedEntries: selectedEntries.length,
      groups: selectedGroups.length,
      searchQuery,
      filters
    };
    
    console.log('Export data:', exportData);
  }, [selectedGroups, selectedEntries, searchQuery, filters, logStats]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickActionToolbar />
      
      <div className="pt-16">
        {/* Analysis Toolbar */}
        <AnalysisToolbar
          onExport={handleExport}
          onSearch={handleSearchChange}
          searchQuery={searchQuery}
          selectedCount={selectedEntries.length}
          totalCount={logStats.filteredEntries}
          onViewModeChange={handleViewModeChange}
          viewMode={viewMode}
        />

        {/* Main Content */}
        <div className="flex h-[calc(100vh-8rem)]">
          {/* Left Sidebar - Group Navigation */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <GroupNavigationSidebar
              groups={mockGroups}
              selectedGroups={selectedGroups}
              onGroupToggle={handleGroupToggle}
              onGroupSelect={handleGroupSelect}
              searchQuery={searchQuery}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 p-4">
              <LogContentViewer
                logEntries={allLogEntries}
                selectedGroups={selectedGroups}
                searchQuery={searchQuery}
                highlightMatches={true}
                onEntrySelect={handleEntrySelect}
                selectedEntries={selectedEntries}
              />
            </div>
          </div>

          {/* Right Panel - Search & Filters */}
          <div className={`
            w-80 flex-shrink-0 border-l border-border transition-all duration-300
            ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
            hidden lg:block
          `}>
            <SearchAndFilterPanel
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              searchQuery={searchQuery}
              filters={filters}
              logStats={logStats}
            />
          </div>

          {/* Right Panel Toggle Button */}
          <button
            onClick={toggleRightPanel}
            className={`
              fixed right-0 top-1/2 transform -translate-y-1/2 z-50
              bg-primary text-primary-foreground p-2 rounded-l-md shadow-md
              transition-all duration-300 hidden lg:block
              ${isRightPanelOpen ? 'translate-x-0' : '-translate-x-80'}
            `}
            title={isRightPanelOpen ? 'Hide filters' : 'Show filters'}
          >
            <Icon 
              name={isRightPanelOpen ? "ChevronRight" : "ChevronLeft"} 
              size={16} 
            />
          </button>
        </div>

        {/* Mobile Group Navigation */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-background border border-border rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary">Groups</h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="Filter"
                iconSize={16}
                onClick={toggleMobileFilters}
              >
                Filters
              </Button>
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {mockGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleGroupToggle(group.id)}
                  className={`
                    flex-shrink-0 px-3 py-2 rounded-md text-sm font-medium
                    transition-colors duration-150
                    ${selectedGroups.includes(group.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                    }
                  `}
                >
                  {group.name}
                  <span className="ml-2 text-xs opacity-75">
                    {group.entries.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {isMobileFiltersOpen && (
          <div className="lg:hidden fixed inset-0 z-100">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleMobileFilters} />
            <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="X"
                    iconSize={16}
                    onClick={toggleMobileFilters}
                  />
                </div>
              </div>
              <div className="overflow-y-auto">
                <SearchAndFilterPanel
                  onSearchChange={handleSearchChange}
                  onFilterChange={handleFilterChange}
                  searchQuery={searchQuery}
                  filters={filters}
                  logStats={logStats}
                />
              </div>
            </div>
          </div>
        )}

        {/* Workflow Progress - Desktop Only */}
        <div className="hidden xl:block fixed bottom-4 left-4 w-64">
          <WorkflowProgress />
        </div>
      </div>
    </div>
  );
};

export default LogAnalysisWorkspace;