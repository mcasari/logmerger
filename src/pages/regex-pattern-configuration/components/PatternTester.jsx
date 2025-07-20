import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PatternTester = ({ 
  pattern, 
  flags = 'gm', 
  isPatternValid = true,
  onTestComplete,
  className = '' 
}) => {
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedResults, setShowAdvancedResults] = useState(false);

  const sampleInputs = [
    {
      name: 'Apache Access Log',
      content: `192.168.1.1 - - [25/Dec/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1234
10.0.0.1 - user [25/Dec/2023:10:00:01 +0000] "POST /api/login HTTP/1.1" 200 567
172.16.0.1 - - [25/Dec/2023:10:00:02 +0000] "GET /assets/style.css HTTP/1.1" 304 0`
    },
    {
      name: 'Application Logs',
      content: `2023-12-25 10:00:00 INFO [main] com.example.Application: Starting application
2023-12-25 10:00:01 DEBUG [main] com.example.Config: Loading configuration
2023-12-25 10:00:02 ERROR [worker-1] com.example.Service: Connection failed`
    },
    {
      name: 'System Logs',
      content: `Dec 25 10:00:00 server01 kernel: Out of memory: Kill process 1234
Dec 25 10:00:01 server01 systemd[1]: Started Apache HTTP Server
Dec 25 10:00:02 server01 sshd[5678]: Accepted publickey for root`
    }
  ];

  const runTest = async () => {
    if (!pattern || !isPatternValid || !testInput.trim()) return;

    setIsLoading(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const regex = new RegExp(pattern, flags);
      const lines = testInput.split('\n').filter(line => line.trim());
      
      const results = {
        totalLines: lines.length,
        matchedLines: 0,
        matches: [],
        groups: [],
        performance: {
          executionTime: Math.random() * 50 + 10, // Mock execution time
          memoryUsage: Math.random() * 100 + 50   // Mock memory usage
        }
      };

      lines.forEach((line, lineIndex) => {
        const matches = [...line.matchAll(regex)];
        if (matches.length > 0) {
          results.matchedLines++;
          matches.forEach(match => {
            results.matches.push({
              lineNumber: lineIndex + 1,
              line: line,
              match: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups || {}
            });
          });
        }
      });

      // Extract unique groups for analysis
      const groupAnalysis = {};
      results.matches.forEach(match => {
        match.groups.forEach((group, index) => {
          if (!groupAnalysis[index]) {
            groupAnalysis[index] = { values: new Set(), count: 0 };
          }
          if (group) {
            groupAnalysis[index].values.add(group);
            groupAnalysis[index].count++;
          }
        });
      });

      results.groupAnalysis = Object.entries(groupAnalysis).map(([index, data]) => ({
        groupIndex: parseInt(index) + 1,
        uniqueValues: Array.from(data.values),
        totalMatches: data.count,
        coverage: (data.count / results.matches.length * 100).toFixed(1)
      }));

      setTestResults(results);
      onTestComplete?.(results);
    } catch (error) {
      setTestResults({
        error: error.message,
        totalLines: 0,
        matchedLines: 0,
        matches: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleInput = (sample) => {
    setTestInput(sample.content);
  };

  const clearResults = () => {
    setTestResults(null);
    setTestInput('');
  };

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="TestTube" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Pattern Tester</h3>
        </div>
        <div className="flex items-center space-x-2">
          {testResults && (
            <div className="text-sm text-text-secondary">
              {testResults.matchedLines}/{testResults.totalLines} lines matched
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            iconName="RotateCcw"
            iconSize={16}
            onClick={clearResults}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Test Input */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">
              Test Input
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary">Load sample:</span>
              {sampleInputs.map((sample, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSampleInput(sample)}
                  className="text-xs"
                >
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>
          
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Paste your log content here to test the pattern..."
            className="w-full h-32 px-3 py-2 text-sm font-mono border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
          />
        </div>

        {/* Test Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              iconName="Play"
              iconSize={16}
              onClick={runTest}
              disabled={!pattern || !isPatternValid || !testInput.trim() || isLoading}
              loading={isLoading}
            >
              {isLoading ? 'Testing...' : 'Run Test'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              iconName="Save"
              iconSize={16}
              disabled={!testResults || testResults.error}
            >
              Save Test
            </Button>
          </div>
          
          {testResults && !testResults.error && (
            <Button
              variant="ghost"
              size="sm"
              iconName={showAdvancedResults ? "ChevronUp" : "ChevronDown"}
              iconSize={16}
              onClick={() => setShowAdvancedResults(!showAdvancedResults)}
            >
              Advanced Results
            </Button>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="border-t border-border">
          {testResults.error ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 text-error mb-2">
                <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                <span className="font-medium">Test Failed</span>
              </div>
              <p className="text-sm text-error">{testResults.error}</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="p-4 bg-surface">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{testResults.matchedLines}</div>
                    <div className="text-sm text-text-secondary">Matched Lines</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary">{testResults.matches.length}</div>
                    <div className="text-sm text-text-secondary">Total Matches</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                      {((testResults.matchedLines / testResults.totalLines) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-text-secondary">Match Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">
                      {testResults.performance.executionTime.toFixed(1)}ms
                    </div>
                    <div className="text-sm text-text-secondary">Execution Time</div>
                  </div>
                </div>
              </div>

              {/* Advanced Results */}
              {showAdvancedResults && (
                <div className="p-4 space-y-4">
                  {/* Group Analysis */}
                  {testResults.groupAnalysis && testResults.groupAnalysis.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-text-primary">Capture Group Analysis</h4>
                      <div className="space-y-2">
                        {testResults.groupAnalysis.map(group => (
                          <div key={group.groupIndex} className="p-3 bg-surface border border-border rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-text-primary">
                                Group {group.groupIndex}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {group.totalMatches} matches ({group.coverage}% coverage)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {group.uniqueValues.slice(0, 10).map((value, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-0.5 text-xs bg-accent-50 text-accent-700 rounded border border-accent-200 font-mono"
                                >
                                  {value}
                                </span>
                              ))}
                              {group.uniqueValues.length > 10 && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{group.uniqueValues.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-text-primary">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-surface border border-border rounded-md">
                        <div className="text-sm text-text-secondary">Execution Time</div>
                        <div className="text-lg font-semibold text-text-primary">
                          {testResults.performance.executionTime.toFixed(2)}ms
                        </div>
                      </div>
                      <div className="p-3 bg-surface border border-border rounded-md">
                        <div className="text-sm text-text-secondary">Memory Usage</div>
                        <div className="text-lg font-semibold text-text-primary">
                          {testResults.performance.memoryUsage.toFixed(1)}KB
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Match Details */}
              {testResults.matches.length > 0 && (
                <div className="max-h-64 overflow-y-auto border-t border-border">
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-text-primary mb-3">
                      Match Details ({testResults.matches.length} matches)
                    </h4>
                    <div className="space-y-2">
                      {testResults.matches.slice(0, 20).map((match, index) => (
                        <div key={index} className="p-2 bg-surface border border-border rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-text-secondary">
                              Line {match.lineNumber}, Position {match.index}
                            </span>
                            <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-1 rounded">
                              {match.match}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-text-muted truncate">
                            {match.line}
                          </div>
                          {match.groups.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {match.groups.map((group, groupIndex) => (
                                <span 
                                  key={groupIndex}
                                  className="px-1 py-0.5 text-xs bg-accent-50 text-accent-700 rounded font-mono"
                                >
                                  {groupIndex + 1}: {group || '(empty)'}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {testResults.matches.length > 20 && (
                        <div className="text-center py-2 text-sm text-text-secondary">
                          ... and {testResults.matches.length - 20} more matches
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PatternTester;