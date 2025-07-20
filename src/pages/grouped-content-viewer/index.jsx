import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import GroupSidebar from './components/GroupSidebar';
import ContentTable from './components/ContentTable';
import ExportModal from './components/ExportModal';
import MobileGroupViewer from './components/MobileGroupViewer';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const GroupedContentViewer = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for grouped content
  const mockGroups = [
    {
      id: 'error-group',
      name: 'Error Messages',
      pattern: '\\[ERROR\\]|ERROR:|Exception',
      type: 'error',
      status: 'processed',
      entries: [
        {
          id: 'entry-1',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          sourceFile: 'app.log',
          lineNumber: 1245,
          level: 'ERROR',
          content: 'Database connection failed: Connection timeout after 30 seconds',
          fullContent: `[ERROR] 2024-01-15 10:30:00 - Database connection failed: Connection timeout after 30 seconds\nStack trace:\n  at DatabaseManager.connect(DatabaseManager.java:45)\n  at ApplicationService.initialize(ApplicationService.java:23)`,
          metadata: { thread: 'main', module: 'database' }
        },
        {
          id: 'entry-2',
          timestamp: new Date('2024-01-15T10:32:15Z'),
          sourceFile: 'app.log',
          lineNumber: 1267,
          level: 'ERROR',
          content: 'Failed to process user request: Invalid authentication token',
          fullContent: `[ERROR] 2024-01-15 10:32:15 - Failed to process user request: Invalid authentication token\nUser ID: 12345\nRequest: POST /api/users/profile`,
          metadata: { userId: '12345', endpoint: '/api/users/profile' }
        },
        {
          id: 'entry-3',
          timestamp: new Date('2024-01-15T10:35:42Z'),
          sourceFile: 'service.log',
          lineNumber: 892,
          level: 'ERROR',
          content: 'Memory allocation failed: Out of heap space',
          fullContent: `[ERROR] 2024-01-15 10:35:42 - Memory allocation failed: Out of heap space\nHeap usage: 98.5%\nGC attempts: 15`,
          metadata: { heapUsage: '98.5%', gcAttempts: 15 }
        }
      ],
      subgroups: [
        {
          id: 'db-errors',
          name: 'Database Errors',
          entries: [
            {
              id: 'entry-4',
              timestamp: new Date('2024-01-15T11:15:30Z'),
              sourceFile: 'db.log',
              lineNumber: 445,
              level: 'ERROR',
              content: 'SQL query execution failed: Table users does not exist',
              fullContent: `[ERROR] 2024-01-15 11:15:30 - SQL query execution failed: Table 'users' does not exist\nQuery: SELECT * FROM users WHERE id = ?`,
              metadata: { query: 'SELECT * FROM users WHERE id = ?', table: 'users' }
            }
          ]
        }
      ]
    },
    {
      id: 'warning-group',
      name: 'Warning Messages',
      pattern: '\\[WARN\\]|WARNING:|WARN:',
      type: 'warning',
      status: 'processed',
      entries: [
        {
          id: 'entry-5',
          timestamp: new Date('2024-01-15T09:45:12Z'),
          sourceFile: 'app.log',
          lineNumber: 1123,
          level: 'WARN',
          content: 'High memory usage detected: 85% of heap space used',
          fullContent: `[WARN] 2024-01-15 09:45:12 - High memory usage detected: 85% of heap space used\nRecommendation: Consider increasing heap size or optimizing memory usage`,
          metadata: { heapUsage: '85%', recommendation: 'increase_heap' }
        },
        {
          id: 'entry-6',
          timestamp: new Date('2024-01-15T09:50:33Z'),
          sourceFile: 'security.log',
          lineNumber: 234,
          level: 'WARN',
          content: 'Multiple failed login attempts detected for user: admin',
          fullContent: `[WARN] 2024-01-15 09:50:33 - Multiple failed login attempts detected for user: admin\nAttempts: 5\nSource IP: 192.168.1.100`,
          metadata: { username: 'admin', attempts: 5, sourceIp: '192.168.1.100' }
        }
      ]
    },
    {
      id: 'info-group',
      name: 'Information Messages',
      pattern: '\\[INFO\\]|INFO:|Information',
      type: 'info',
      status: 'processed',
      entries: [
        {
          id: 'entry-7',
          timestamp: new Date('2024-01-15T08:00:00Z'),
          sourceFile: 'app.log',
          lineNumber: 1,
          level: 'INFO',
          content: 'Application started successfully on port 8080',
          fullContent: `[INFO] 2024-01-15 08:00:00 - Application started successfully on port 8080\nVersion: 2.1.0\nEnvironment: production`,
          metadata: { port: 8080, version: '2.1.0', environment: 'production' }
        },
        {
          id: 'entry-8',
          timestamp: new Date('2024-01-15T08:05:15Z'),
          sourceFile: 'app.log',
          lineNumber: 45,
          level: 'INFO',
          content: 'Database connection established successfully',
          fullContent: `[INFO] 2024-01-15 08:05:15 - Database connection established successfully\nHost: localhost:5432\nDatabase: production_db`,
          metadata: { host: 'localhost:5432', database: 'production_db' }
        }
      ]
    },
    {
      id: 'debug-group',
      name: 'Debug Messages',
      pattern: '\\[DEBUG\\]|DEBUG:|Debug',
      type: 'debug',
      status: 'processing',
      entries: [
        {
          id: 'entry-9',
          timestamp: new Date('2024-01-15T10:15:22Z'),
          sourceFile: 'debug.log',
          lineNumber: 1567,
          level: 'DEBUG',
          content: 'Processing user authentication request',
          fullContent: `[DEBUG] 2024-01-15 10:15:22 - Processing user authentication request\nUser: john.doe@example.com\nMethod: JWT token validation`,
          metadata: { user: 'john.doe@example.com', method: 'jwt' }
        }
      ]
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Auto-select first group
      if (mockGroups.length > 0) {
        setSelectedGroup(mockGroups[0]);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedEntries([]);
  };

  const handleEntrySelect = (entryIds) => {
    setSelectedEntries(entryIds);
  };

  const handleExportGroup = (group) => {
    setIsExportModalOpen(true);
  };

  const handleBulkAction = (action, entryIds) => {
    console.log(`Bulk action: ${action}`, entryIds);
    
    switch (action) {
      case 'export':
        setIsExportModalOpen(true);
        break;
      case 'delete':
        console.log('Deleting entries:', entryIds);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleExport = async (exportData) => {
    console.log('Exporting data:', exportData);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would trigger a file download
    const filename = `${selectedGroup?.name || 'content'}_export.${exportData.format}`;
    console.log(`Export completed: ${filename}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Icon name="Loader2" size={48} color="var(--color-primary)" className="mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-text-primary mb-2">Loading Grouped Content</h3>
              <p className="text-text-secondary">Organizing log entries by patterns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 h-screen">
          <MobileGroupViewer
            groups={mockGroups}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            entries={selectedGroup?.entries || []}
            onExport={handleExportGroup}
            className="h-full"
          />
        </div>
        
        {isExportModalOpen && (
          <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            group={selectedGroup}
            selectedEntries={selectedEntries}
            onExport={handleExport}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickActionToolbar />
      
      <div className="pt-16">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <GroupSidebar
            groups={mockGroups}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            onExportGroup={handleExportGroup}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Workflow Progress */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <WorkflowProgress className="flex-1 max-w-md" />
                
                {/* Navigation Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ArrowLeft"
                    iconSize={16}
                    onClick={() => handleNavigation('/log-analysis-workspace')}
                  >
                    Back to Analysis
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    iconName="Settings"
                    iconSize={16}
                    onClick={() => handleNavigation('/regex-pattern-configuration')}
                  >
                    Configure Patterns
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content Table */}
            <ContentTable
              group={selectedGroup}
              entries={selectedGroup?.entries || []}
              onEntrySelect={handleEntrySelect}
              selectedEntries={selectedEntries}
              onBulkAction={handleBulkAction}
              className="flex-1"
            />
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          group={selectedGroup}
          selectedEntries={selectedEntries}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

export default GroupedContentViewer;