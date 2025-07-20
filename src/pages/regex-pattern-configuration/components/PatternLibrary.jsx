import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PatternLibrary = ({ onPatternSelect, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const patternLibrary = [
    {
      id: 'apache-access',
      name: 'Apache Access Log',
      category: 'web-server',
      description: 'Standard Apache access log format',
      pattern: '^(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+\\[([^\\]]+)\\]\\s+"([^"]*)"\\s+(\\d+)\\s+(\\d+|-)\\s*"([^"]*)"\\s*"([^"]*)"',
      example: '192.168.1.1 - - [25/Dec/2023:10:00:00 +0000] "GET /index.html HTTP/1.1" 200 1234',
      groups: ['IP Address', 'User', 'Auth User', 'Timestamp', 'Request', 'Status', 'Size', 'Referer', 'User Agent']
    },
    {
      id: 'nginx-access',
      name: 'Nginx Access Log',
      category: 'web-server',
      description: 'Standard Nginx access log format',
      pattern: '^(\\S+)\\s+-\\s+(\\S+)\\s+\\[([^\\]]+)\\]\\s+"([^"]*)"\\s+(\\d+)\\s+(\\d+)\\s+"([^"]*)"\\s+"([^"]*)"',
      example: '10.0.0.1 - user [25/Dec/2023:10:00:00 +0000] "POST /api/data HTTP/1.1" 201 567',
      groups: ['IP Address', 'User', 'Timestamp', 'Request', 'Status', 'Size', 'Referer', 'User Agent']
    },
    {
      id: 'java-exception',
      name: 'Java Exception Stack Trace',
      category: 'application',
      description: 'Java application exception patterns',
      pattern: '^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2})\\s+(ERROR|WARN|INFO|DEBUG)\\s+\\[([^\\]]+)\\]\\s+([^:]+):\\s*(.*)',
      example: '2023-12-25 10:00:00 ERROR [main] com.example.Service: NullPointerException occurred',
      groups: ['Timestamp', 'Level', 'Thread', 'Class', 'Message']
    },
    {
      id: 'syslog',
      name: 'Syslog Format',
      category: 'system',
      description: 'Standard syslog message format',
      pattern: '^(\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+(\\S+)\\s+(\\S+)\\[?(\\d+)?\\]?:\\s*(.*)',
      example: 'Dec 25 10:00:00 server01 sshd[1234]: Accepted password for user from 192.168.1.100',
      groups: ['Timestamp', 'Hostname', 'Process', 'PID', 'Message']
    },
    {
      id: 'iis-log',
      name: 'IIS Web Server Log',
      category: 'web-server',
      description: 'Microsoft IIS log format',
      pattern: '^(\\d{4}-\\d{2}-\\d{2})\\s+(\\d{2}:\\d{2}:\\d{2})\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)',
      example: '2023-12-25 10:00:00 192.168.1.1 GET /page.html - 200 0 1234 567',
      groups: ['Date', 'Time', 'Client IP', 'Method', 'URI', 'Query', 'Status', 'Substatus', 'Bytes Sent', 'Bytes Received']
    },
    {
      id: 'database-query',
      name: 'Database Query Log',
      category: 'database',
      description: 'SQL query execution logs',
      pattern: '^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d{3})\\s+(\\w+)\\s+Query\\s+(\\d+)\\s+(.*)',
      example: '2023-12-25 10:00:00.123 INFO Query 12345 SELECT * FROM users WHERE id = 1',
      groups: ['Timestamp', 'Level', 'Query ID', 'SQL Statement']
    },
    {
      id: 'docker-container',
      name: 'Docker Container Log',
      category: 'container',
      description: 'Docker container log format',
      pattern: '^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{9}Z)\\s+(\\w+)\\s+(.*)',
      example: '2023-12-25T10:00:00.123456789Z stdout Application started successfully',
      groups: ['Timestamp', 'Stream', 'Message']
    },
    {
      id: 'kubernetes-pod',
      name: 'Kubernetes Pod Log',
      category: 'container',
      description: 'Kubernetes pod log format',
      pattern: '^(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{9}Z)\\s+(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+(.*)',
      example: '2023-12-25T10:00:00.123456789Z stderr F [ERROR] Failed to connect to database',
      groups: ['Timestamp', 'Stream', 'Flags', 'Container', 'Message']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid3X3' },
    { id: 'web-server', name: 'Web Server', icon: 'Server' },
    { id: 'application', name: 'Application', icon: 'Code' },
    { id: 'system', name: 'System', icon: 'Monitor' },
    { id: 'database', name: 'Database', icon: 'Database' },
    { id: 'container', name: 'Container', icon: 'Package' }
  ];

  const filteredPatterns = patternLibrary.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePatternSelect = (pattern) => {
    onPatternSelect?.(pattern);
  };

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Library" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Pattern Library</h3>
        </div>
        <div className="text-sm text-text-secondary">
          {filteredPatterns.length} patterns
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 space-y-4 border-b border-border">
        <div className="relative">
          <Input
            type="search"
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Icon 
            name="Search" 
            size={16} 
            color="var(--color-text-muted)"
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium
                transition-all duration-150 ease-out
                ${selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }
              `}
            >
              <Icon name={category.icon} size={14} color="currentColor" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pattern List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPatterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="Search" size={48} color="var(--color-text-muted)" className="mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">No patterns found</h4>
            <p className="text-text-secondary">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPatterns.map(pattern => (
              <div key={pattern.id} className="p-4 hover:bg-surface-hover transition-colors duration-150">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-text-primary">{pattern.name}</h4>
                      <span className={`
                        px-2 py-0.5 text-xs font-medium rounded-full
                        ${pattern.category === 'web-server' ? 'bg-blue-100 text-blue-700' :
                          pattern.category === 'application' ? 'bg-green-100 text-green-700' :
                          pattern.category === 'system' ? 'bg-purple-100 text-purple-700' :
                          pattern.category === 'database'? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {categories.find(c => c.id === pattern.category)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{pattern.description}</p>
                    
                    {/* Example */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-text-secondary mb-1">Example:</div>
                      <code className="text-xs bg-surface border border-border rounded px-2 py-1 font-mono text-text-primary block overflow-x-auto">
                        {pattern.example}
                      </code>
                    </div>

                    {/* Groups */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-text-secondary mb-1">Capture Groups:</div>
                      <div className="flex flex-wrap gap-1">
                        {pattern.groups.map((group, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 text-xs bg-accent-50 text-accent-700 rounded border border-accent-200"
                          >
                            {index + 1}. {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pattern Code */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-text-secondary mb-1">Pattern:</div>
                  <code className="text-xs bg-gray-50 border border-border rounded px-2 py-1 font-mono text-text-primary block overflow-x-auto">
                    {pattern.pattern}
                  </code>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      iconName="Download"
                      iconSize={14}
                      onClick={() => handlePatternSelect(pattern)}
                    >
                      Use Pattern
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Copy"
                      iconSize={14}
                      onClick={() => navigator.clipboard.writeText(pattern.pattern)}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="ExternalLink"
                    iconSize={14}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatternLibrary;