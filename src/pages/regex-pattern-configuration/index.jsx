import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import ProcessingStatusBadge from '../../components/ui/ProcessingStatusBadge';
import RegexInputEditor from './components/RegexInputEditor';
import PatternLibrary from './components/PatternLibrary';
import LivePreviewPanel from './components/LivePreviewPanel';
import PatternTester from './components/PatternTester';
import SavedPatternsManager from './components/SavedPatternsManager';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const RegexPatternConfiguration = () => {
  const navigate = useNavigate();
  const [currentPattern, setCurrentPattern] = useState('');
  const [patternValidation, setPatternValidation] = useState({ isValid: true, error: null });
  const [patternFlags, setPatternFlags] = useState('gm');
  const [activeTab, setActiveTab] = useState('editor');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(currentPattern.trim() !== '');
  }, [currentPattern]);

  const handlePatternChange = (pattern) => {
    setCurrentPattern(pattern);
  };

  const handleValidationChange = (validation) => {
    setPatternValidation(validation);
  };

  const handleTestPattern = (patternData) => {
    console.log('Testing pattern:', patternData);
    // Pattern testing logic would go here
  };

  const handlePatternSelect = (pattern) => {
    setCurrentPattern(pattern.pattern);
    setActiveTab('editor');
  };

  const handlePatternLoad = (pattern) => {
    setCurrentPattern(pattern.pattern);
    setPatternFlags(pattern.flags || 'gm');
    setActiveTab('editor');
  };

  const handlePatternSave = (pattern) => {
    console.log('Pattern saved:', pattern);
    setHasUnsavedChanges(false);
  };

  const handleApplyToFiles = () => {
    if (patternValidation.isValid && currentPattern.trim()) {
      // Navigate to processing status or analysis workspace
      navigate('/file-processing-status');
    }
  };

  const handleTestComplete = (results) => {
    console.log('Test completed:', results);
  };

  const tabs = [
    { id: 'editor', label: 'Pattern Editor', icon: 'Code' },
    { id: 'library', label: 'Pattern Library', icon: 'Library' },
    { id: 'tester', label: 'Pattern Tester', icon: 'TestTube' },
    { id: 'saved', label: 'Saved Patterns', icon: 'Bookmark' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <QuickActionToolbar />
      
      <div className="pt-16">
        <div className="px-4 lg:px-6 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Icon name="Settings" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Regex Pattern Configuration</h1>
                <p className="text-text-secondary">Create and test regular expressions for intelligent log grouping</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ProcessingStatusBadge />
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-warning-50 text-warning-700 border border-warning-200 rounded-md">
                  <Icon name="AlertCircle" size={14} color="var(--color-warning)" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
              <Button
                variant="primary"
                iconName="Play"
                iconSize={16}
                onClick={handleApplyToFiles}
                disabled={!patternValidation.isValid || !currentPattern.trim()}
              >
                Apply to Files
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          {!isMobileView ? (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Panel - Configuration */}
              <div className="col-span-7 space-y-6">
                {/* Workflow Progress */}
                <WorkflowProgress />
                
                {/* Tab Navigation */}
                <div className="bg-background border border-border rounded-lg">
                  <div className="flex items-center border-b border-border">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center space-x-2 px-4 py-3 text-sm font-medium
                          transition-all duration-150 ease-out border-b-2
                          ${activeTab === tab.id
                            ? 'border-primary text-primary bg-primary-50' :'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          }
                        `}
                      >
                        <Icon name={tab.icon} size={16} color="currentColor" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-0">
                    {activeTab === 'editor' && (
                      <RegexInputEditor
                        pattern={currentPattern}
                        onPatternChange={handlePatternChange}
                        onValidationChange={handleValidationChange}
                        onTestPattern={handleTestPattern}
                        className="border-0 rounded-none"
                      />
                    )}
                    
                    {activeTab === 'library' && (
                      <PatternLibrary
                        onPatternSelect={handlePatternSelect}
                        className="border-0 rounded-none"
                      />
                    )}
                    
                    {activeTab === 'tester' && (
                      <PatternTester
                        pattern={currentPattern}
                        flags={patternFlags}
                        isPatternValid={patternValidation.isValid}
                        onTestComplete={handleTestComplete}
                        className="border-0 rounded-none"
                      />
                    )}
                    
                    {activeTab === 'saved' && (
                      <SavedPatternsManager
                        onPatternLoad={handlePatternLoad}
                        currentPattern={currentPattern}
                        onPatternSave={handlePatternSave}
                        className="border-0 rounded-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Live Preview */}
              <div className="col-span-5">
                <div className="sticky top-24 space-y-6">
                  {/* Preview Toggle */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Live Preview</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName={showPreview ? "EyeOff" : "Eye"}
                      iconSize={16}
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </Button>
                  </div>
                  
                  {showPreview && (
                    <LivePreviewPanel
                      pattern={currentPattern}
                      flags={patternFlags}
                      isPatternValid={patternValidation.isValid}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mobile Layout */
            <div className="space-y-6">
              {/* Workflow Progress */}
              <WorkflowProgress />
              
              {/* Mobile Tab Navigation */}
              <div className="bg-background border border-border rounded-lg">
                <div className="flex overflow-x-auto border-b border-border">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                        transition-all duration-150 ease-out border-b-2
                        ${activeTab === tab.id
                          ? 'border-primary text-primary bg-primary-50' :'border-transparent text-text-secondary hover:text-text-primary'
                        }
                      `}
                    >
                      <Icon name={tab.icon} size={16} color="currentColor" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="p-0">
                  {activeTab === 'editor' && (
                    <RegexInputEditor
                      pattern={currentPattern}
                      onPatternChange={handlePatternChange}
                      onValidationChange={handleValidationChange}
                      onTestPattern={handleTestPattern}
                      className="border-0 rounded-none"
                    />
                  )}
                  
                  {activeTab === 'library' && (
                    <PatternLibrary
                      onPatternSelect={handlePatternSelect}
                      className="border-0 rounded-none"
                    />
                  )}
                  
                  {activeTab === 'tester' && (
                    <PatternTester
                      pattern={currentPattern}
                      flags={patternFlags}
                      isPatternValid={patternValidation.isValid}
                      onTestComplete={handleTestComplete}
                      className="border-0 rounded-none"
                    />
                  )}
                  
                  {activeTab === 'saved' && (
                    <SavedPatternsManager
                      onPatternLoad={handlePatternLoad}
                      currentPattern={currentPattern}
                      onPatternSave={handlePatternSave}
                      className="border-0 rounded-none"
                    />
                  )}
                </div>
              </div>
              
              {/* Mobile Preview Panel */}
              {showPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-primary">Live Preview</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="EyeOff"
                      iconSize={16}
                      onClick={() => setShowPreview(false)}
                    >
                      Hide Preview
                    </Button>
                  </div>
                  
                  <LivePreviewPanel
                    pattern={currentPattern}
                    flags={patternFlags}
                    isPatternValid={patternValidation.isValid}
                  />
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ArrowLeft"
                  iconSize={16}
                  onClick={() => navigate('/file-upload-dashboard')}
                >
                  Back
                </Button>
                {!showPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Eye"
                    iconSize={16}
                    onClick={() => setShowPreview(true)}
                  >
                    Preview
                  </Button>
                )}
              </div>
              
              <Button
                variant="primary"
                size="sm"
                iconName="Play"
                iconSize={16}
                onClick={handleApplyToFiles}
                disabled={!patternValidation.isValid || !currentPattern.trim()}
              >
                Apply to Files
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexPatternConfiguration;