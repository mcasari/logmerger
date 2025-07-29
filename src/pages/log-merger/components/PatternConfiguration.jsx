import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

import Input from '../../../components/ui/Input';

const PatternConfiguration = ({ 
  groupingPattern, 
  groupingType, 
  onPatternChange, 
  onTypeChange, 
  sampleEntries = [] 
}) => {
  const [isPatternValid, setIsPatternValid] = useState(true);
  const [patternError, setPatternError] = useState('');

  const predefinedPatterns = [
    {
      id: 'chronological',
      name: 'Chronological Order',
      description: 'Show entries with timestamps in chronological order',
      pattern: '',
      example: 'Log entries with timestamps sorted chronologically'
    },
    {
      id: 'log-level',
      name: 'Log Level',
      description: 'Group by ERROR, WARN, INFO, DEBUG',
      pattern: '\\[(ERROR|WARN|INFO|DEBUG)\\]',
      example: '[ERROR] Database connection failed'
    },
    {
      id: 'hour',
      name: 'Hour',
      description: 'Group by hour of the day',
      pattern: '',
      example: 'Groups entries by timestamp hour'
    },
    {
      id: 'custom',
      name: 'Custom Pattern',
      description: 'Use custom RegExp pattern',
      pattern: '',
      example: 'Enter your own regular expression'
    }
  ];

  const commonPatterns = [
    {
      name: 'HTTP Status',
      pattern: '(\\d{3})',
      description: 'Group by HTTP status codes'
    },
    {
      name: 'IP Address',
      pattern: '(\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})',
      description: 'Group by IP addresses'
    },
    {
      name: 'Thread ID',
      pattern: '\\[([^\\]]+)\\]',
      description: 'Group by thread identifiers'
    },
    {
      name: 'Service Name',
      pattern: '(\\w+Service)',
      description: 'Group by service names'
    }
  ];

  const validatePattern = (pattern) => {
    if (!pattern.trim()) {
      setIsPatternValid(true);
      setPatternError('');
      return;
    }

    try {
      new RegExp(pattern);
      setIsPatternValid(true);
      setPatternError('');
    } catch (error) {
      setIsPatternValid(false);
      setPatternError(error.message);
    }
  };

  const handlePatternChange = (value) => {
    onPatternChange(value);
    validatePattern(value);
  };

  const testPatternResults = useMemo(() => {
    if (!sampleEntries.length || groupingType !== 'custom' || !groupingPattern || !isPatternValid) {
      return [];
    }

    try {
      const regex = new RegExp(groupingPattern, 'i');
      return sampleEntries.map(entry => {
        const match = entry.content.match(regex);
        return {
          content: entry.content,
          match: match ? (match[1] || match[0]) : 'No match',
          hasMatch: !!match
        };
      });
    } catch (error) {
      return [];
    }
  }, [sampleEntries, groupingPattern, groupingType, isPatternValid]);

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Pattern Configuration</h3>
      
      {/* Pattern Type Selection */}
      <div className="space-y-3 mb-6">
        <label className="text-sm font-medium text-text-primary">Grouping Method</label>
        <div className="grid grid-cols-1 gap-2">
          {predefinedPatterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => {
                onTypeChange(pattern.id);
                if (pattern.pattern) {
                  onPatternChange(pattern.pattern);
                  validatePattern(pattern.pattern);
                }
              }}
              className={`
                p-3 text-left rounded-lg border transition-all duration-150
                ${groupingType === pattern.id
                  ? 'border-primary bg-primary-50 text-primary-700' :'border-border bg-background hover:bg-surface-hover text-text-primary'
                }
              `}
            >
              <div className="font-medium">{pattern.name}</div>
              <div className="text-xs text-current opacity-70 mt-1">
                {pattern.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Pattern Input */}
      {groupingType === 'custom' && (
        <div className="mb-6">
          <Input
            label="Regular Expression Pattern"
            value={groupingPattern}
            onChange={handlePatternChange}
            placeholder="Enter regex pattern (e.g., \[(ERROR|WARN)\])"
            error={!isPatternValid}
            helperText={patternError || 'Use parentheses () to capture the group value'}
          />
        </div>
      )}

      {/* Common Patterns */}
      {groupingType === 'custom' && (
        <div className="mb-6">
          <label className="text-sm font-medium text-text-primary block mb-2">
            Common Patterns
          </label>
          <div className="grid grid-cols-1 gap-2">
            {commonPatterns.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => {
                  handlePatternChange(pattern.pattern);
                }}
                className="p-2 text-left rounded-md border border-border bg-background hover:bg-surface-hover text-text-primary transition-colors duration-150"
              >
                <div className="text-sm font-medium">{pattern.name}</div>
                <div className="text-xs text-text-secondary">{pattern.description}</div>
                <div className="text-xs font-mono text-accent-600 mt-1">{pattern.pattern}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Test Results */}
      {testPatternResults.length > 0 && (
        <div>
          <label className="text-sm font-medium text-text-primary block mb-2">
            Pattern Test Results
          </label>
          <div className="bg-background border border-border rounded-md p-3 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {testPatternResults.map((result, index) => (
                <div key={index} className="text-xs">
                  <div className="font-mono text-text-primary mb-1 truncate">
                    {result.content}
                  </div>
                  <div className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs
                    ${result.hasMatch 
                      ? 'bg-success-100 text-success-800' :'bg-warning-100 text-warning-800'
                    }
                  `}>
                    <Icon 
                      name={result.hasMatch ? "CheckCircle" : "AlertCircle"} 
                      size={10} 
                      className="mr-1" 
                    />
                    Group: {result.match}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pattern Status */}
      <div className="mt-6 p-3 rounded-lg bg-background border border-border">
        <div className="flex items-center space-x-2">
          <Icon 
            name={isPatternValid ? "CheckCircle" : "AlertCircle"} 
            size={16} 
            color={isPatternValid ? "var(--color-success)" : "var(--color-error)"} 
          />
          <span className={`text-sm font-medium ${
            isPatternValid ? 'text-success-700' : 'text-error-700'
          }`}>
            {isPatternValid 
              ? `Pattern is valid - Grouping by ${predefinedPatterns.find(p => p.id === groupingType)?.name || 'custom pattern'}`
              : 'Invalid pattern'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default PatternConfiguration;