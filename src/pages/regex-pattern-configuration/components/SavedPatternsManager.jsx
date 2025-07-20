import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedPatternsManager = ({ 
  onPatternLoad, 
  currentPattern,
  onPatternSave,
  className = '' 
}) => {
  const [savedPatterns, setSavedPatterns] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock saved patterns
  useEffect(() => {
    const mockPatterns = [
      {
        id: 'custom-1',
        name: 'My Apache Pattern',
        description: 'Custom Apache log pattern for our server setup',
        pattern: '^(\\S+)\\s+(\\S+)\\s+(\\S+)\\s+\\[([^\\]]+)\\]\\s+"([^"]*)"\\s+(\\d+)\\s+(\\d+)',
        flags: 'gm',
        category: 'custom',
        tags: ['apache', 'web-server', 'access-log'],
        createdAt: new Date('2023-12-20'),
        lastUsed: new Date('2023-12-24'),
        useCount: 15
      },
      {
        id: 'custom-2',
        name: 'Application Error Pattern',
        description: 'Pattern to catch application errors and stack traces',
        pattern: '^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2})\\s+(ERROR|FATAL)\\s+\\[([^\\]]+)\\]\\s+([^:]+):\\s*(.*)',
        flags: 'gm',
        category: 'custom',
        tags: ['error', 'application', 'debugging'],
        createdAt: new Date('2023-12-18'),
        lastUsed: new Date('2023-12-23'),
        useCount: 8
      },
      {
        id: 'custom-3',
        name: 'Database Query Logger',
        description: 'Pattern for database query execution logs',
        pattern: '^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d{3})\\s+(\\w+)\\s+Query\\s+(\\d+)\\s+(.*)',
        flags: 'gm',
        category: 'database',
        tags: ['database', 'query', 'performance'],
        createdAt: new Date('2023-12-15'),
        lastUsed: new Date('2023-12-22'),
        useCount: 12
      }
    ];
    setSavedPatterns(mockPatterns);
  }, []);

  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid3X3' },
    { id: 'custom', name: 'Custom', icon: 'User' },
    { id: 'web-server', name: 'Web Server', icon: 'Server' },
    { id: 'application', name: 'Application', icon: 'Code' },
    { id: 'database', name: 'Database', icon: 'Database' },
    { id: 'system', name: 'System', icon: 'Monitor' }
  ];

  const filteredPatterns = savedPatterns.filter(pattern => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || pattern.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSavePattern = () => {
    if (!currentPattern || !saveForm.name.trim()) return;

    const newPattern = {
      id: `custom-${Date.now()}`,
      name: saveForm.name.trim(),
      description: saveForm.description.trim(),
      pattern: currentPattern,
      flags: 'gm',
      category: saveForm.category,
      tags: saveForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    };

    setSavedPatterns(prev => [newPattern, ...prev]);
    onPatternSave?.(newPattern);
    setShowSaveDialog(false);
    setSaveForm({ name: '', description: '', category: 'custom', tags: '' });
  };

  const handleLoadPattern = (pattern) => {
    // Update last used
    setSavedPatterns(prev => prev.map(p => 
      p.id === pattern.id 
        ? { ...p, lastUsed: new Date(), useCount: p.useCount + 1 }
        : p
    ));
    
    onPatternLoad?.(pattern);
  };

  const handleDeletePattern = (patternId) => {
    setSavedPatterns(prev => prev.filter(p => p.id !== patternId));
  };

  const handleDuplicatePattern = (pattern) => {
    const duplicatedPattern = {
      ...pattern,
      id: `custom-${Date.now()}`,
      name: `${pattern.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    };
    
    setSavedPatterns(prev => [duplicatedPattern, ...prev]);
  };

  return (
    <div className={`bg-background border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Bookmark" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">Saved Patterns</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">
            {filteredPatterns.length} patterns
          </span>
          <Button
            variant="primary"
            size="sm"
            iconName="Plus"
            iconSize={16}
            onClick={() => setShowSaveDialog(true)}
            disabled={!currentPattern}
          >
            Save Current
          </Button>
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
            <Icon name="Bookmark" size={48} color="var(--color-text-muted)" className="mb-4" />
            <h4 className="text-lg font-medium text-text-primary mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No patterns found' : 'No saved patterns'}
            </h4>
            <p className="text-text-secondary mb-4">
              {searchTerm || selectedCategory !== 'all' ?'Try adjusting your search or filter criteria' :'Save your first pattern to get started'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button
                variant="primary"
                size="sm"
                iconName="Plus"
                iconSize={16}
                onClick={() => setShowSaveDialog(true)}
                disabled={!currentPattern}
              >
                Save Current Pattern
              </Button>
            )}
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
                        ${pattern.category === 'custom' ? 'bg-purple-100 text-purple-700' :
                          pattern.category === 'web-server' ? 'bg-blue-100 text-blue-700' :
                          pattern.category === 'application' ? 'bg-green-100 text-green-700' :
                          pattern.category === 'database'? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {categories.find(c => c.id === pattern.category)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mb-2">{pattern.description}</p>
                    
                    {/* Tags */}
                    {pattern.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pattern.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-0.5 text-xs bg-accent-50 text-accent-700 rounded border border-accent-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Usage Stats */}
                    <div className="flex items-center space-x-4 text-xs text-text-muted">
                      <span>Used {pattern.useCount} times</span>
                      <span>•</span>
                      <span>Last used {pattern.lastUsed.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Created {pattern.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Pattern Preview */}
                <div className="mb-3">
                  <code className="text-xs bg-surface border border-border rounded px-2 py-1 font-mono text-text-primary block overflow-x-auto">
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
                      onClick={() => handleLoadPattern(pattern)}
                    >
                      Load Pattern
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconName="Copy"
                      iconSize={14}
                      onClick={() => handleDuplicatePattern(pattern)}
                    >
                      Duplicate
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
                    iconName="Trash2"
                    iconSize={14}
                    onClick={() => handleDeletePattern(pattern.id)}
                    className="text-error hover:text-error hover:bg-error-50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-200">
          <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">Save Pattern</h3>
              <Button
                variant="ghost"
                size="sm"
                iconName="X"
                iconSize={16}
                onClick={() => setShowSaveDialog(false)}
              />
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Pattern Name *</label>
                <Input
                  type="text"
                  placeholder="Enter pattern name..."
                  value={saveForm.name}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Description</label>
                <textarea
                  placeholder="Describe what this pattern matches..."
                  value={saveForm.description}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-20 px-3 py-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Category</label>
                <select
                  value={saveForm.category}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
                >
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tags</label>
                <Input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  value={saveForm.tags}
                  onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
                />
                <p className="text-xs text-text-muted">Separate multiple tags with commas</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconName="Save"
                iconSize={16}
                onClick={handleSavePattern}
                disabled={!saveForm.name.trim()}
              >
                Save Pattern
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPatternsManager;