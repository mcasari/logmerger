import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProcessingControls = ({ 
  files, 
  regexPattern, 
  isRegexValid, 
  isProcessing, 
  onProcessFiles, 
  onClearAll, 
  onAdvancedSettings,
  className = '' 
}) => {
  const hasFiles = files.length > 0;
  const hasValidPattern = regexPattern && isRegexValid;
  const canProcess = hasFiles && hasValidPattern && !isProcessing;
  const readyFiles = files.filter(f => !f.error && !f.processing).length;
  const processingFiles = files.filter(f => f.processing).length;
  const errorFiles = files.filter(f => f.error).length;

  const getProcessButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (!hasFiles) return 'Upload Files First';
    if (!hasValidPattern) return 'Configure Pattern';
    return `Process ${readyFiles} File${readyFiles !== 1 ? 's' : ''}`;
  };

  const getProcessButtonIcon = () => {
    if (isProcessing) return 'Loader2';
    if (!hasFiles || !hasValidPattern) return 'AlertCircle';
    return 'Play';
  };

  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Processing Controls
          </h3>
          <p className="text-sm text-text-secondary">
            Configure and start the log file analysis process
          </p>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Files" size={16} color="var(--color-text-secondary)" />
              <span className="text-sm text-text-secondary">Files</span>
            </div>
            <div className="mt-1">
              <span className="text-2xl font-bold text-text-primary">{files.length}</span>
              <span className="text-sm text-text-muted ml-1">uploaded</span>
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Settings" size={16} color="var(--color-text-secondary)" />
              <span className="text-sm text-text-secondary">Pattern</span>
            </div>
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${
                  hasValidPattern ? 'text-success' : 'text-text-muted'
                }`}>
                  {hasValidPattern ? 'Valid' : 'Not Set'}
                </span>
                <Icon 
                  name={hasValidPattern ? "CheckCircle" : "Circle"} 
                  size={14} 
                  color={hasValidPattern ? "var(--color-success)" : "var(--color-text-muted)"}
                />
              </div>
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Icon name="Activity" size={16} color="var(--color-text-secondary)" />
              <span className="text-sm text-text-secondary">Status</span>
            </div>
            <div className="mt-1">
              <span className={`text-sm font-medium ${
                isProcessing ? 'text-accent' : canProcess ? 'text-success' : 'text-text-muted'
              }`}>
                {isProcessing ? 'Processing' : canProcess ? 'Ready' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* File Status Breakdown */}
        {hasFiles && (
          <div className="bg-background border border-border rounded-lg p-4">
            <h4 className="font-medium text-text-primary mb-3">File Status</h4>
            <div className="flex items-center space-x-6">
              {readyFiles > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm text-text-secondary">
                    {readyFiles} Ready
                  </span>
                </div>
              )}
              {processingFiles > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="text-sm text-text-secondary">
                    {processingFiles} Processing
                  </span>
                </div>
              )}
              {errorFiles > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-error rounded-full"></div>
                  <span className="text-sm text-text-secondary">
                    {errorFiles} Error
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            iconName={getProcessButtonIcon()}
            iconPosition="left"
            onClick={onProcessFiles}
            disabled={!canProcess}
            fullWidth
            className={`${isProcessing ? 'animate-pulse' : ''}`}
          >
            {getProcessButtonText()}
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="md"
              iconName="Trash2"
              iconPosition="left"
              onClick={onClearAll}
              disabled={!hasFiles || isProcessing}
              className="flex-1"
            >
              Clear All Files
            </Button>

            <Button
              variant="ghost"
              size="md"
              iconName="Settings"
              iconPosition="left"
              onClick={onAdvancedSettings}
              disabled={isProcessing}
              className="flex-1"
            >
              Advanced Settings
            </Button>
          </div>
        </div>

        {/* Processing Requirements */}
        {!canProcess && (
          <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="AlertTriangle" size={16} color="var(--color-warning)" className="mt-0.5" />
              <div>
                <h4 className="font-medium text-warning-700 mb-1">
                  Requirements Not Met
                </h4>
                <ul className="text-sm text-warning-700 space-y-1">
                  {!hasFiles && (
                    <li>• Upload at least one log file</li>
                  )}
                  {!hasValidPattern && (
                    <li>• Configure a valid regex pattern</li>
                  )}
                  {errorFiles > 0 && (
                    <li>• Resolve file errors before processing</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Processing Info */}
        {canProcess && !isProcessing && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="CheckCircle" size={16} color="var(--color-success)" className="mt-0.5" />
              <div>
                <h4 className="font-medium text-success-700 mb-1">
                  Ready to Process
                </h4>
                <p className="text-sm text-success-700">
                  All requirements met. Click "Process Files" to start analysis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessingControls;