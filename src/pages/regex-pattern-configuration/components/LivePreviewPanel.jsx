import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LivePreviewPanel = ({ 
  pattern, 
  flags = 'gm', 
  isPatternValid = true,
  className = '' 
}) => {
  const [sampleLogs, setSampleLogs] = useState([]);
  const [selectedSample, setSelectedSample] = useState('mixed');
  const [showMatches, setShowMatches] = useState(true);
  const [showGroups, setShowGroups] = useState(true);

  const sampleLogSets = {
    mixed: [
      '2023-12-25 10:00:00 INFO [main] com.example.Service: Application started successfully',
      '192.168.1.1 - - [25/Dec/2023:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1234',
      '2023-12-25 10:00:02 ERROR [worker-1] com.example.Database: Connection failed to mysql://localhost:3306',
      'Dec 25 10:00:03 server01 sshd[1234]: Accepted password for user from 192.168.1.100',
      '2023-12-25T10:00:04.123456789Z stdout Application processing request ID: req_12345',
      '10.0.0.1 - user [25/Dec/2023:10:00:05 +0000] "POST /api/data HTTP/1.1" 201 567',
      '2023-12-25 10:00:06 WARN [scheduler] com.example.Task: Task execution delayed by 5 seconds',
      '2023-12-25 10:00:07.456 INFO Query 67890 SELECT * FROM users WHERE active = 1'
    ],
    apache: [
      '192.168.1.1 - - [25/Dec/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1234 "http://example.com" "Mozilla/5.0"',
      '10.0.0.1 - user [25/Dec/2023:10:00:01 +0000] "POST /api/login HTTP/1.1" 200 567 "-" "curl/7.68.0"',
      '172.16.0.1 - - [25/Dec/2023:10:00:02 +0000] "GET /assets/style.css HTTP/1.1" 304 0 "http://example.com/index.html" "Mozilla/5.0"',
      '192.168.1.100 - admin [25/Dec/2023:10:00:03 +0000] "DELETE /api/users/123 HTTP/1.1" 204 0 "-" "PostmanRuntime/7.29.0"'
    ],
    application: [
      '2023-12-25 10:00:00 INFO [main] com.example.Application: Starting application version 1.2.3',
      '2023-12-25 10:00:01 DEBUG [main] com.example.Config: Loading configuration from /etc/app/config.yml',
      '2023-12-25 10:00:02 ERROR [worker-1] com.example.Service: Failed to process request: NullPointerException',
      '2023-12-25 10:00:03 WARN [scheduler] com.example.Task: Task queue is 90% full, consider scaling',
      '2023-12-25 10:00:04 INFO [http-nio-8080-exec-1] com.example.Controller: Processing GET /api/health'
    ],
    system: [
      'Dec 25 10:00:00 server01 kernel: [12345.678901] Out of memory: Kill process 1234 (java) score 900',
      'Dec 25 10:00:01 server01 systemd[1]: Started Apache HTTP Server',
      'Dec 25 10:00:02 server01 sshd[5678]: Accepted publickey for root from 192.168.1.50 port 22 ssh2',
      'Dec 25 10:00:03 server01 cron[9012]: (root) CMD (/usr/bin/backup.sh)',
      'Dec 25 10:00:04 server01 NetworkManager[3456]: <info> device (eth0): carrier is ON'
    ]
  };

  useEffect(() => {
    setSampleLogs(sampleLogSets[selectedSample] || sampleLogSets.mixed);
  }, [selectedSample]);

  const previewResults = useMemo(() => {
    if (!pattern || !isPatternValid) {
      return sampleLogs.map((log, index) => ({
        id: index,
        original: log,
        matches: [],
        groups: [],
        hasMatch: false
      }));
    }

    try {
      const regex = new RegExp(pattern, flags);
      
      return sampleLogs.map((log, index) => {
        const matches = [...log.matchAll(regex)];
        const hasMatch = matches.length > 0;
        
        return {
          id: index,
          original: log,
          matches: matches.map(match => ({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1)
          })),
          groups: hasMatch ? matches[0].slice(1) : [],
          hasMatch
        };
      });
    } catch (error) {
      return sampleLogs.map((log, index) => ({
        id: index,
        original: log,
        matches: [],
        groups: [],
        hasMatch: false,
        error: error.message
      }));
    }
  }, [pattern, flags, sampleLogs, isPatternValid]);

  const highlightMatches = (text, matches) => {
    if (!matches || matches.length === 0) return text;
    
    let result = text;
    let offset = 0;
    
    matches.forEach(match => {
      const start = match.index + offset;
      const end = start + match.fullMatch.length;
      const highlighted = `<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${match.fullMatch}</mark>`;
      result = result.slice(0, start) + highlighted + result.slice(end);
      offset += highlighted.length - match.fullMatch.length;
    });
    
    return result;
  };

  const matchCount = previewResults.filter(result => result.hasMatch).length;
  const totalCount = previewResults.length;

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Eye" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Live Preview</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-text-secondary">
            {matchCount}/{totalCount} matches
          </div>
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${matchCount > 0 
              ? 'bg-success-50 text-success-700' :'bg-gray-100 text-gray-600'
            }
          `}>
            {matchCount > 0 ? 'Active' : 'No Matches'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-border space-y-4">
        {/* Sample Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Sample Log Set</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sampleLogSets).map(([key, logs]) => (
              <button
                key={key}
                onClick={() => setSelectedSample(key)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium capitalize
                  transition-all duration-150 ease-out
                  ${selectedSample === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }
                `}
              >
                {key} ({logs.length})
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMatches}
              onChange={(e) => setShowMatches(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Highlight Matches</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGroups}
              onChange={(e) => setShowGroups(e.target.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <span className="text-sm text-text-primary">Show Groups</span>
          </label>
        </div>
      </div>

      {/* Preview Results */}
      <div className="max-h-96 overflow-y-auto">
        {!pattern || !isPatternValid ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="AlertCircle" size={48} color="var(--color-text-muted)" className="mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">
              {!pattern ? 'Enter a pattern to see preview' : 'Fix pattern errors to see preview'}
            </h4>
            <p className="text-text-secondary">
              {!pattern 
                ? 'Type a regular expression in the editor to test it against sample logs' :'Correct the syntax errors in your pattern to enable live preview'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {previewResults.map((result, index) => (
              <div key={result.id} className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Line Number */}
                  <div className="flex-shrink-0 w-8 text-xs text-text-muted font-mono text-right">
                    {index + 1}
                  </div>
                  
                  {/* Match Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`
                      w-2 h-2 rounded-full
                      ${result.hasMatch ? 'bg-success' : 'bg-border'}
                    `} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Original Log */}
                    <div className="font-mono text-sm">
                      {showMatches && result.hasMatch ? (
                        <div 
                          className="text-text-primary"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatches(result.original, result.matches) 
                          }}
                        />
                      ) : (
                        <div className={`
                          ${result.hasMatch ? 'text-text-primary' : 'text-text-muted'}
                        `}>
                          {result.original}
                        </div>
                      )}
                    </div>
                    
                    {/* Groups */}
                    {showGroups && result.hasMatch && result.groups.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-text-secondary">Captured Groups:</div>
                        <div className="flex flex-wrap gap-1">
                          {result.groups.map((group, groupIndex) => (
                            <span 
                              key={groupIndex}
                              className="px-2 py-0.5 text-xs bg-accent-50 text-accent-700 rounded border border-accent-200 font-mono"
                              title={`Group ${groupIndex + 1}`}
                            >
                              {groupIndex + 1}: {group || '(empty)'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Error */}
                    {result.error && (
                      <div className="flex items-center space-x-2 text-sm text-error">
                        <Icon name="AlertTriangle" size={14} color="var(--color-error)" />
                        <span>{result.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {pattern && isPatternValid && (
        <div className="p-4 border-t border-border bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span>Pattern: <code className="font-mono">/{pattern}/{flags}</code></span>
              <span>•</span>
              <span>{matchCount} of {totalCount} logs matched</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                iconName="RefreshCw"
                iconSize={14}
                onClick={() => setSampleLogs([...sampleLogs])}
              >
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconName="Download"
                iconSize={14}
              >
                Export Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreviewPanel;