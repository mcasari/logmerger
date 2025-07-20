import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RegexInputEditor = ({ 
  pattern, 
  onPatternChange, 
  onValidationChange, 
  onTestPattern,
  className = '' 
}) => {
  const [localPattern, setLocalPattern] = useState(pattern || '');
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: true,
    dotAll: false
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validatePattern = useCallback((patternStr) => {
    if (!patternStr.trim()) {
      return { isValid: false, error: 'Pattern cannot be empty' };
    }

    try {
      const flagStr = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => {
          switch (flag) {
            case 'global': return 'g';
            case 'ignoreCase': return 'i';
            case 'multiline': return 'm';
            case 'dotAll': return 's';
            default: return '';
          }
        })
        .join('');

      new RegExp(patternStr, flagStr);
      return { isValid: true, error: null };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Invalid regex: ${error.message}` 
      };
    }
  }, [flags]);

  useEffect(() => {
    const validationResult = validatePattern(localPattern);
    setValidation(validationResult);
    onValidationChange?.(validationResult);
  }, [localPattern, validatePattern, onValidationChange]);

  const handlePatternChange = (e) => {
    const newPattern = e.target.value;
    setLocalPattern(newPattern);
    onPatternChange?.(newPattern);
  };

  const handleFlagChange = (flagName) => {
    setFlags(prev => ({
      ...prev,
      [flagName]: !prev[flagName]
    }));
  };

  const handleTestPattern = () => {
    if (validation.isValid) {
      const flagStr = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag, _]) => {
          switch (flag) {
            case 'global': return 'g';
            case 'ignoreCase': return 'i';
            case 'multiline': return 'm';
            case 'dotAll': return 's';
            default: return '';
          }
        })
        .join('');
      
      onTestPattern?.({ pattern: localPattern, flags: flagStr });
    }
  };

  const insertCommonPattern = (patternType) => {
    const patterns = {
      timestamp: '\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}',
      ipAddress: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
      logLevel: '\\b(DEBUG|INFO|WARN|ERROR|FATAL)\\b',
      httpStatus: '\\b[1-5]\\d{2}\\b',
      email: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      uuid: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
    };

    const newPattern = localPattern + (localPattern ? '|' : '') + patterns[patternType];
    setLocalPattern(newPattern);
    onPatternChange?.(newPattern);
  };

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Code" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Regex Pattern Editor</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName={showAdvanced ? "ChevronUp" : "ChevronDown"}
          iconSize={16}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Advanced
        </Button>
      </div>

      {/* Pattern Input */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Regular Expression Pattern
          </label>
          <div className="relative">
            <textarea
              value={localPattern}
              onChange={handlePatternChange}
              placeholder="Enter your regex pattern here... e.g., \\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}"
              className={`
                w-full h-32 px-3 py-2 text-sm font-mono border rounded-md resize-none
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                ${validation.isValid 
                  ? 'border-border bg-background text-text-primary' :'border-error bg-error-50 text-error-700'
                }
              `}
            />
            <div className="absolute top-2 right-2">
              <Icon 
                name={validation.isValid ? "CheckCircle" : "AlertCircle"} 
                size={16} 
                color={validation.isValid ? "var(--color-success)" : "var(--color-error)"}
              />
            </div>
          </div>
          
          {/* Validation Feedback */}
          {!validation.isValid && (
            <div className="flex items-center space-x-2 text-sm text-error">
              <Icon name="AlertTriangle" size={14} color="var(--color-error)" />
              <span>{validation.error}</span>
            </div>
          )}
        </div>

        {/* Quick Pattern Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            Quick Insert Common Patterns
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'timestamp', label: 'Timestamp', icon: 'Clock' },
              { key: 'ipAddress', label: 'IP Address', icon: 'Globe' },
              { key: 'logLevel', label: 'Log Level', icon: 'AlertCircle' },
              { key: 'httpStatus', label: 'HTTP Status', icon: 'Hash' },
              { key: 'email', label: 'Email', icon: 'Mail' },
              { key: 'uuid', label: 'UUID', icon: 'Key' }
            ].map(({ key, label, icon }) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                iconName={icon}
                iconSize={14}
                onClick={() => insertCommonPattern(key)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Regex Flags
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'global', label: 'Global (g)', desc: 'Find all matches' },
                  { key: 'ignoreCase', label: 'Ignore Case (i)', desc: 'Case insensitive' },
                  { key: 'multiline', label: 'Multiline (m)', desc: '^$ match line breaks' },
                  { key: 'dotAll', label: 'Dot All (s)', desc: '. matches newlines' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flags[key]}
                      onChange={() => handleFlagChange(key)}
                      className="mt-0.5 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary">{label}</div>
                      <div className="text-xs text-text-secondary">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Pattern Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Pattern Preview
              </label>
              <div className="p-3 bg-surface border border-border rounded-md">
                <code className="text-sm font-mono text-text-primary">
                  /{localPattern || 'pattern'}/{Object.entries(flags)
                    .filter(([_, enabled]) => enabled)
                    .map(([flag, _]) => {
                      switch (flag) {
                        case 'global': return 'g';
                        case 'ignoreCase': return 'i';
                        case 'multiline': return 'm';
                        case 'dotAll': return 's';
                        default: return '';
                      }
                    })
                    .join('')}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              iconName="Play"
              iconSize={16}
              onClick={handleTestPattern}
              disabled={!validation.isValid || !localPattern.trim()}
            >
              Test Pattern
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconName="Save"
              iconSize={16}
              disabled={!validation.isValid || !localPattern.trim()}
            >
              Save Pattern
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="RotateCcw"
              iconSize={16}
              onClick={() => {
                setLocalPattern('');
                onPatternChange?.('');
              }}
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="HelpCircle"
              iconSize={16}
            >
              Help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexInputEditor;