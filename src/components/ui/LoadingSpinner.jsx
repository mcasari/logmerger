import React from 'react';
import Icon from '../AppIcon';

// Reusable loading spinner component with various sizes and styles
const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  showText = false,
  text = 'Loading...',
  centered = false,
  fullScreen = false,
  className = ''
}) => {
  // Size configurations
  const sizes = {
    xs: { spinner: 12, icon: 12, text: 'text-xs' },
    sm: { spinner: 16, icon: 16, text: 'text-sm' },
    md: { spinner: 24, icon: 24, text: 'text-base' },
    lg: { spinner: 32, icon: 32, text: 'text-lg' },
    xl: { spinner: 48, icon: 48, text: 'text-xl' }
  };

  // Color variants
  const variants = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
    gray: 'text-gray-500',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  const config = sizes[size];
  const colorClass = variants[variant];

  // Base spinner component
  const SpinnerContent = () => (
    <div className={`flex items-center space-x-2 ${colorClass}`}>
      {/* Rotating spinner icon */}
      <Icon 
        name="Loader2" 
        size={config.icon} 
        className="animate-spin"
      />
      
      {/* Optional text */}
      {showText && (
        <span className={`${config.text} font-medium`}>
          {text}
        </span>
      )}
    </div>
  );

  // Circular progress spinner (alternative style)
  const CircularSpinner = () => (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        className="animate-spin" 
        width={config.spinner} 
        height={config.spinner} 
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      {showText && (
        <span className={`ml-2 ${config.text} font-medium ${colorClass}`}>
          {text}
        </span>
      )}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <CircularSpinner />
            {showText && (
              <p className={`${config.text} font-medium text-gray-700`}>
                {text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Centered in container
  if (centered) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <CircularSpinner />
          {showText && (
            <p className={`${config.text} font-medium ${colorClass}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline spinner
  return (
    <div className={className}>
      <SpinnerContent />
    </div>
  );
};

// Pre-configured spinner variants for common use cases
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner 
    size={size} 
    variant="white" 
    className={className}
  />
);

export const PageSpinner = ({ text = 'Loading content...', className = '' }) => (
  <LoadingSpinner 
    size="lg" 
    variant="primary" 
    showText={true}
    text={text}
    centered={true}
    className={className}
  />
);

export const FullPageSpinner = ({ text = 'Processing...', className = '' }) => (
  <LoadingSpinner 
    size="xl" 
    variant="primary" 
    showText={true}
    text={text}
    fullScreen={true}
    className={className}
  />
);

export const InlineSpinner = ({ size = 'sm', text, className = '' }) => (
  <LoadingSpinner 
    size={size} 
    variant="primary" 
    showText={!!text}
    text={text}
    className={className}
  />
);

// Progress spinner with percentage
export const ProgressSpinner = ({ 
  progress = 0, 
  size = 'lg', 
  showPercentage = true,
  className = '' 
}) => {
  const config = { lg: 48, md: 32, sm: 24 };
  const spinnerSize = config[size];
  const radius = (spinnerSize - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={spinnerSize} height={spinnerSize} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={spinnerSize / 2}
          cy={spinnerSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={spinnerSize / 2}
          cy={spinnerSize / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-300 ease-out"
          strokeLinecap="round"
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
