import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simplified navigation - core features only
  const navigationItems = [
    {
      label: 'Upload',
      path: '/file-upload-dashboard',
      icon: 'Upload',
      tooltip: 'Upload and manage log files'
    },
    {
      label: 'View Logs',
      path: '/log-viewer',
      icon: 'FileText',
      tooltip: 'View merged log content'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-100">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
              <Icon name="Merge" size={20} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-text-primary">LogMerger</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-all duration-150 ease-out hover-lift
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }
                  `}
                  title={item.tooltip}
                >
                  <Icon 
                    name={item.icon} 
                    size={16} 
                    color={isActive ? 'currentColor' : 'var(--color-text-secondary)'} 
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            iconName={isMobileMenuOpen ? "X" : "Menu"}
            iconSize={20}
            onClick={toggleMobileMenu}
            className="lg:hidden text-text-secondary hover:text-text-primary"
          />
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-surface">
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      flex items-center justify-between w-full px-4 py-3 text-left
                      transition-all duration-150 ease-out
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        name={item.icon} 
                        size={18} 
                        color={isActive ? 'currentColor' : 'var(--color-text-secondary)'} 
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Icon name="ChevronRight" size={14} color="currentColor" />
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;