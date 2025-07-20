import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const WorkflowProgress = ({ className = '' }) => {
  const location = useLocation();

  const workflowSteps = [
    {
      id: 'upload',
      label: 'Upload Files',
      path: '/file-upload-dashboard',
      icon: 'Upload',
      stage: 1
    },
    {
      id: 'configure',
      label: 'Configure Patterns',
      path: '/regex-pattern-configuration',
      icon: 'Settings',
      stage: 2
    },
    {
      id: 'process',
      label: 'Process Files',
      path: '/file-processing-status',
      icon: 'Activity',
      stage: 3
    },
    {
      id: 'analyze',
      label: 'Analyze Results',
      path: '/log-analysis-workspace',
      icon: 'BarChart3',
      stage: 4
    }
  ];

  const currentStep = workflowSteps.find(step => step.path === location.pathname);
  const currentStage = currentStep?.stage || 1;

  return (
    <div className={`bg-surface border border-border rounded-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-text-primary">Workflow Progress</h3>
        <span className="text-xs text-text-secondary">
          Step {currentStage} of {workflowSteps.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {workflowSteps.map((step, index) => {
          const isActive = step.path === location.pathname;
          const isCompleted = step.stage < currentStage;
          const isUpcoming = step.stage > currentStage;
          
          return (
            <div key={step.id} className="flex items-center space-x-3">
              {/* Step Icon */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                ${isCompleted 
                  ? 'bg-success border-success text-success-foreground' 
                  : isActive 
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border text-text-muted'
                }
              `}>
                {isCompleted ? (
                  <Icon name="Check" size={14} color="currentColor" />
                ) : (
                  <Icon name={step.icon} size={14} color="currentColor" />
                )}
              </div>
              
              {/* Step Label */}
              <div className="flex-1">
                <div className={`
                  text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-primary' 
                    : isCompleted 
                      ? 'text-success' :'text-text-secondary'
                  }
                `}>
                  {step.label}
                </div>
                {isActive && (
                  <div className="text-xs text-text-muted mt-0.5">
                    Currently active
                  </div>
                )}
              </div>
              
              {/* Progress Indicator */}
              <div className="w-2 h-2 rounded-full">
                <div className={`
                  w-full h-full rounded-full transition-all duration-200
                  ${isCompleted 
                    ? 'bg-success' 
                    : isActive 
                      ? 'bg-primary animate-pulse' :'bg-border'
                  }
                `} />
              </div>
              
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-7 mt-8 w-0.5 h-6 bg-border" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">Overall Progress</span>
          <span className="text-xs font-medium text-text-primary">
            {Math.round((currentStage / workflowSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStage / workflowSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgress;