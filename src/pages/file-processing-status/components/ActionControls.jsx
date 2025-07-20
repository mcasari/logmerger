import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ActionControls = ({ 
  isProcessing, 
  hasResults, 
  hasErrors, 
  onCancelProcessing, 
  onRetryFailed, 
  onClearAll,
  processingProgress 
}) => {
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate('/log-analysis-workspace');
  };

  const handleViewGroups = () => {
    navigate('/grouped-content-viewer');
  };

  const handleBackToUpload = () => {
    navigate('/file-upload-dashboard');
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">Actions</h3>
        {isProcessing && (
          <div className="flex items-center space-x-2 text-sm text-primary">
            <Icon name="Loader2" size={16} className="animate-spin" color="var(--color-primary)" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {isProcessing ? (
            <Button
              variant="danger"
              iconName="X"
              iconSize={16}
              onClick={onCancelProcessing}
              className="flex-1"
            >
              Cancel Processing
            </Button>
          ) : hasResults ? (
            <Button
              variant="primary"
              iconName="BarChart3"
              iconSize={16}
              onClick={handleViewResults}
              className="flex-1"
            >
              View Analysis Results
            </Button>
          ) : (
            <Button
              variant="secondary"
              iconName="Upload"
              iconSize={16}
              onClick={handleBackToUpload}
              className="flex-1"
            >
              Back to Upload
            </Button>
          )}

          {hasResults && !isProcessing && (
            <Button
              variant="secondary"
              iconName="Layers"
              iconSize={16}
              onClick={handleViewGroups}
              className="flex-1"
            >
              View Groups
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        {!isProcessing && (
          <div className="flex flex-col sm:flex-row gap-2">
            {hasErrors && (
              <Button
                variant="warning"
                iconName="RotateCcw"
                iconSize={16}
                onClick={onRetryFailed}
                size="sm"
              >
                Retry Failed Files
              </Button>
            )}
            
            <Button
              variant="ghost"
              iconName="Trash2"
              iconSize={16}
              onClick={onClearAll}
              size="sm"
            >
              Clear All Files
            </Button>
            
            <Button
              variant="ghost"
              iconName="Download"
              iconSize={16}
              onClick={() => console.log('Export processing log')}
              size="sm"
            >
              Export Log
            </Button>
          </div>
        )}

        {/* Progress Indicator for Mobile */}
        {isProcessing && (
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-secondary">Processing Progress</span>
              <span className="text-sm font-medium text-text-primary">{processingProgress}%</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      <div className="mt-4 pt-4 border-t border-border">
        {isProcessing && (
          <div className="flex items-start space-x-2 text-sm">
            <Icon name="Info" size={16} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-primary font-medium">Processing in progress</p>
              <p className="text-text-secondary text-xs mt-1">
                You can safely navigate away from this page. Processing will continue in the background.
              </p>
            </div>
          </div>
        )}

        {!isProcessing && hasResults && (
          <div className="flex items-start space-x-2 text-sm">
            <Icon name="CheckCircle" size={16} color="var(--color-success)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-success font-medium">Processing completed successfully</p>
              <p className="text-text-secondary text-xs mt-1">
                Your files have been processed and are ready for analysis.
              </p>
            </div>
          </div>
        )}

        {!isProcessing && hasErrors && !hasResults && (
          <div className="flex items-start space-x-2 text-sm">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-error font-medium">Processing completed with errors</p>
              <p className="text-text-secondary text-xs mt-1">
                Some files failed to process. Check the error details above and retry if needed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionControls;