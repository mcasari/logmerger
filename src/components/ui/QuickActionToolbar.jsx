import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';

const QuickActionToolbar = ({ className = '' }) => {
  const location = useLocation();
  const [hasFiles, setHasFiles] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [hasConfiguration, setHasConfiguration] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const mockHasFiles = Math.random() > 0.3;
    const mockHasResults = Math.random() > 0.4;
    const mockHasConfiguration = Math.random() > 0.5;
    
    setHasFiles(mockHasFiles);
    setHasResults(mockHasResults);
    setHasConfiguration(mockHasConfiguration);
  }, [location.pathname]);

  const getContextualActions = () => {
    const baseActions = [];
    
    switch (location.pathname) {
      case '/file-upload-dashboard':
        baseActions.push(
          { id: 'clear-files', label: 'Clear Files', icon: 'Trash2', variant: 'ghost', enabled: hasFiles },
          { id: 'import-config', label: 'Import Config', icon: 'Upload', variant: 'ghost', enabled: true },
          { id: 'bulk-upload', label: 'Bulk Upload', icon: 'FolderOpen', variant: 'secondary', enabled: true }
        );
        break;
        
      case '/regex-pattern-configuration':
        baseActions.push(
          { id: 'test-pattern', label: 'Test Pattern', icon: 'Play', variant: 'primary', enabled: true },
          { id: 'save-config', label: 'Save Config', icon: 'Save', variant: 'secondary', enabled: hasConfiguration },
          { id: 'load-preset', label: 'Load Preset', icon: 'FileText', variant: 'ghost', enabled: true }
        );
        break;
        
      case '/log-analysis-workspace':
        baseActions.push(
          { id: 'export-results', label: 'Export Results', icon: 'Download', variant: 'primary', enabled: hasResults },
          { id: 'filter-logs', label: 'Filter', icon: 'Filter', variant: 'ghost', enabled: hasResults },
          { id: 'search-logs', label: 'Search', icon: 'Search', variant: 'ghost', enabled: hasResults }
        );
        break;
        
      case '/grouped-content-viewer':
        baseActions.push(
          { id: 'export-groups', label: 'Export Groups', icon: 'Download', variant: 'primary', enabled: hasResults },
          { id: 'merge-groups', label: 'Merge Groups', icon: 'Merge', variant: 'secondary', enabled: hasResults },
          { id: 'group-settings', label: 'Group Settings', icon: 'Settings', variant: 'ghost', enabled: true }
        );
        break;
        
      case '/file-processing-status':
        baseActions.push(
          { id: 'retry-failed', label: 'Retry Failed', icon: 'RotateCcw', variant: 'secondary', enabled: true },
          { id: 'cancel-processing', label: 'Cancel All', icon: 'X', variant: 'ghost', enabled: true },
          { id: 'view-logs', label: 'View Logs', icon: 'FileText', variant: 'ghost', enabled: true }
        );
        break;
        
      default:
        baseActions.push(
          { id: 'refresh', label: 'Refresh', icon: 'RefreshCw', variant: 'ghost', enabled: true }
        );
    }
    
    return baseActions;
  };

  const handleAction = (actionId) => {
    console.log(`Executing action: ${actionId}`);
    setIsDropdownOpen(false);
    
    switch (actionId) {
      case 'clear-files': console.log('Clearing all files...');
        break;
      case 'export-results':
        console.log('Exporting results...');
        break;
      case 'save-config': console.log('Saving configuration...');
        break;
      case 'test-pattern': console.log('Testing regex pattern...');
        break;
      default:
        console.log(`Action ${actionId} not implemented`);
    }
  };

  const actions = getContextualActions();
  const primaryActions = actions.slice(0, 3);
  const secondaryActions = actions.slice(3);

  if (actions.length === 0) return null;

  return (
    <div className={`bg-surface border-b border-border ${className}`}>
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Context Label */}
          <div className="flex items-center space-x-2">
            <Icon name="Zap" size={16} color="var(--color-accent)" />
            <span className="text-sm font-medium text-text-primary">Quick Actions</span>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {primaryActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                size="sm"
                iconName={action.icon}
                iconSize={16}
                disabled={!action.enabled}
                onClick={() => handleAction(action.id)}
                className={!action.enabled ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {action.label}
              </Button>
            ))}
            
            {secondaryActions.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="MoreHorizontal"
                  iconSize={16}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />
                
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-md z-200">
                    <div className="py-1">
                      {secondaryActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleAction(action.id)}
                          disabled={!action.enabled}
                          className={`
                            flex items-center space-x-2 w-full px-3 py-2 text-left text-sm
                            transition-colors duration-150
                            ${action.enabled 
                              ? 'text-text-primary hover:bg-surface-hover' :'text-text-muted cursor-not-allowed'
                            }
                          `}
                        >
                          <Icon name={action.icon} size={14} color="currentColor" />
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Mobile Actions Dropdown */}
          <div className="md:hidden relative">
            <Button
              variant="ghost"
              size="sm"
              iconName="MoreVertical"
              iconSize={16}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            />
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-md shadow-md z-200">
                <div className="py-1">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action.id)}
                      disabled={!action.enabled}
                      className={`
                        flex items-center space-x-3 w-full px-4 py-3 text-left
                        transition-colors duration-150
                        ${action.enabled 
                          ? 'text-text-primary hover:bg-surface-hover' :'text-text-muted cursor-not-allowed'
                        }
                      `}
                    >
                      <Icon name={action.icon} size={16} color="currentColor" />
                      <span className="font-medium">{action.label}</span>
                      {!action.enabled && (
                        <Icon name="Lock" size={12} color="var(--color-text-muted)" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Keyboard Shortcuts Hint */}
        <div className="hidden lg:flex items-center justify-end mt-2 space-x-4 text-xs text-text-muted">
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">S</kbd>
            <span>Save</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-border rounded text-xs">E</kbd>
            <span>Export</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionToolbar;