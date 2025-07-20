import React from 'react';
import Icon from '../../../components/AppIcon';

const ProcessingOverview = ({ 
  overallProgress, 
  totalFiles, 
  completedFiles, 
  failedFiles, 
  currentOperation, 
  estimatedTimeRemaining,
  isProcessing 
}) => {
  const getProgressColor = () => {
    if (failedFiles > 0) return 'error';
    if (isProcessing) return 'primary';
    return 'success';
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Calculating...';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const progressColor = getProgressColor();

  return (
    <div className="bg-background border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-text-primary">Processing Overview</h2>
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <Icon name="Loader2" size={20} className="animate-spin" color="var(--color-primary)" />
          ) : failedFiles > 0 ? (
            <Icon name="AlertCircle" size={20} color="var(--color-error)" />
          ) : (
            <Icon name="CheckCircle" size={20} color="var(--color-success)" />
          )}
          <span className={`text-sm font-medium ${
            failedFiles > 0 ? 'text-error' : isProcessing ? 'text-primary' : 'text-success'
          }`}>
            {failedFiles > 0 ? 'Issues Detected' : isProcessing ? 'Processing' : 'Complete'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Overall Progress</span>
          <span className="text-sm font-medium text-text-primary">{overallProgress}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ease-out ${
              progressColor === 'error' ? 'bg-error' : 
              progressColor === 'primary' ? 'bg-primary' : 'bg-success'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-surface rounded-md p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Files" size={16} color="var(--color-text-secondary)" />
            <span className="text-sm text-text-secondary">Total Files</span>
          </div>
          <span className="text-2xl font-bold text-text-primary">{totalFiles}</span>
        </div>

        <div className="bg-surface rounded-md p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            <span className="text-sm text-text-secondary">Completed</span>
          </div>
          <span className="text-2xl font-bold text-success">{completedFiles}</span>
        </div>

        <div className="bg-surface rounded-md p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="AlertCircle" size={16} color="var(--color-error)" />
            <span className="text-sm text-text-secondary">Failed</span>
          </div>
          <span className="text-2xl font-bold text-error">{failedFiles}</span>
        </div>

        <div className="bg-surface rounded-md p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
            <span className="text-sm text-text-secondary">Time Left</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">
            {formatTime(estimatedTimeRemaining)}
          </span>
        </div>
      </div>

      {/* Current Operation */}
      {currentOperation && (
        <div className="bg-surface border-l-4 border-primary rounded-md p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={16} color="var(--color-primary)" />
            <span className="text-sm font-medium text-text-primary">Current Operation:</span>
          </div>
          <p className="text-sm text-text-secondary mt-1">{currentOperation}</p>
        </div>
      )}
    </div>
  );
};

export default ProcessingOverview;