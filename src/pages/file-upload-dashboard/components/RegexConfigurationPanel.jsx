import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RegexConfigurationPanel = ({ 
  regexPattern, 
  onPatternChange, 
  onTestPattern, 
  isValid, 
  validationMessage,
  className = '' 
}) => {
  const [showExamples, setShowExamples] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState(null);

  const examplePatterns = [
    {
      name: 'Timestamp Extraction',
      pattern: '\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}',
      description: 'Matches YYYY-MM-DD HH:MM:SS format',
      example: '2024-01-15 14:30:25'
    },
    {
      name: 'Log Level',
      pattern: '\\b(DEBUG|INFO|WARN|ERROR|FATAL)\\b',
      description: 'Matches common log levels',
      example: 'INFO Application started'
    },
    {
      name: 'IP Address',
      pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b',
      description: 'Matches IPv4 addresses',
      example: '192.168.1.100'
    },
    {
      name: 'Error Messages',
      pattern: '(?i)\\b(error|exception|failed|failure)\\b.*',
      description: 'Matches lines containing error keywords',
      example: 'Error: Connection timeout'
    },
    {
      name: 'HTTP Status Codes',
      pattern: '\\b[1-5]\\d{2}\\b',
      description: 'Matches HTTP status codes (100-599)',
      example: '404 Not Found'
    },
    {
      name: 'Session IDs',
      pattern: '[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}',
      description: 'Matches UUID/GUID patterns',
      example: '550e8400-e29b-41d4-a716-446655440000'
    }
  ];

  const handlePatternSelect = (pattern) => {
    onPatternChange(pattern);
    setShowExamples(false);
  };

  const handleTestPattern = () => {
    if (regexPattern && testInput) {
      try {
        const regex = new RegExp(regexPattern, 'gi');
        const matches = testInput.match(regex);
        setTestResults({
          success: true,
          matches: matches || [],
          matchCount: matches ? matches.length : 0
        });
        onTestPattern(regexPattern, testInput);
      } catch (error) {
        setTestResults({
          success: false,
          error: error.message
        });
      }
    }
  };

  const clearTest = () => {
    setTestInput('');
    setTestResults(null);
  };

  useEffect(() => {
    if (testResults && regexPattern && testInput) {
      const timeoutId = setTimeout(() => {
        handleTestPattern();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [regexPattern, testInput]);

  return (
    <div className={`bg-surface border border-border rounded-lg p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Regex Configuration
          </h3>
          <Button
            variant="ghost"
            size="sm"
            iconName="HelpCircle"
            onClick={() => setShowExamples(!showExamples)}
            className="text-text-secondary hover:text-text-primary"
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Regular Expression Pattern
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter regex pattern (e.g., \\d{4}-\\d{2}-\\d{2})"
                value={regexPattern}
                onChange={(e) => onPatternChange(e.target.value)}
                className={`font-mono ${
                  regexPattern && !isValid ? 'border-error focus:border-error' : regexPattern && isValid ?'border-success focus:border-success' : ''
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {regexPattern && (
                  <Icon 
                    name={isValid ? "CheckCircle" : "AlertCircle"} 
                    size={16} 
                    color={isValid ? "var(--color-success)" : "var(--color-error)"}
                  />
                )}
              </div>
            </div>
            {validationMessage && (
              <p className={`text-sm mt-1 ${
                isValid ? 'text-success' : 'text-error'
              }`}>
                {validationMessage}
              </p>
            )}
          </div>

          {showExamples && (
            <div className="bg-background border border-border rounded-lg p-4">
              <h4 className="font-medium text-text-primary mb-3">Example Patterns</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {examplePatterns.map((example, index) => (
                  <div
                    key={index}
                    className="p-3 bg-surface rounded-md hover-lift cursor-pointer"
                    onClick={() => handlePatternSelect(example.pattern)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-text-primary text-sm">
                          {example.name}
                        </h5>
                        <p className="text-xs text-text-secondary mt-1">
                          {example.description}
                        </p>
                        <code className="text-xs bg-background px-2 py-1 rounded mt-2 inline-block font-mono text-accent">
                          {example.pattern}
                        </code>
                        <p className="text-xs text-text-muted mt-1">
                          Example: {example.example}
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={16} color="var(--color-text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              Test Your Pattern
            </label>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter test text to match against your pattern..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="font-mono"
              />
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  iconName="Play"
                  onClick={handleTestPattern}
                  disabled={!regexPattern || !testInput || !isValid}
                >
                  Test Pattern
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={clearTest}
                  disabled={!testInput && !testResults}
                >
                  Clear
                </Button>
              </div>
            </div>

            {testResults && (
              <div className={`p-3 rounded-lg border ${
                testResults.success 
                  ? 'bg-success-50 border-success-200' :'bg-error-50 border-error-200'
              }`}>
                {testResults.success ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="CheckCircle" size={16} color="var(--color-success)" />
                      <span className="text-sm font-medium text-success-700">
                        Pattern matched successfully
                      </span>
                    </div>
                    <div className="text-sm text-success-700">
                      <p>Found {testResults.matchCount} match{testResults.matchCount !== 1 ? 'es' : ''}</p>
                      {testResults.matches.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Matches:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {testResults.matches.slice(0, 5).map((match, index) => (
                              <li key={index} className="font-mono text-xs bg-success-100 px-2 py-1 rounded">
                                "{match}"
                              </li>
                            ))}
                            {testResults.matches.length > 5 && (
                              <li className="text-xs text-success-600">
                                ... and {testResults.matches.length - 5} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                      <span className="text-sm font-medium text-error-700">
                        Pattern test failed
                      </span>
                    </div>
                    <p className="text-sm text-error-700">{testResults.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <h4 className="font-medium text-text-primary mb-2 flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-accent)" />
            <span>Pattern Tips</span>
          </h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Use \\d for digits, \\w for word characters, \\s for whitespace</li>
            <li>• Add (?i) at the start for case-insensitive matching</li>
            <li>• Use parentheses () to create capture groups</li>
            <li>• Test your pattern before processing large files</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegexConfigurationPanel;