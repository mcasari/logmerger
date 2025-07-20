import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  group, 
  selectedEntries, 
  onExport,
  className = '' 
}) => {
  const [exportFormat, setExportFormat] = useState('json');
  const [exportScope, setExportScope] = useState('selected');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeSourceInfo, setIncludeSourceInfo] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    { id: 'json', name: 'JSON', description: 'Structured data format', icon: 'FileText' },
    { id: 'csv', name: 'CSV', description: 'Comma-separated values', icon: 'Table' },
    { id: 'txt', name: 'Plain Text', description: 'Simple text format', icon: 'FileText' },
    { id: 'xml', name: 'XML', description: 'Extensible markup language', icon: 'Code' }
  ];

  const exportScopes = [
    { id: 'selected', name: 'Selected Entries', count: selectedEntries.length },
    { id: 'group', name: 'Entire Group', count: group?.entries?.length || 0 },
    { id: 'filtered', name: 'Filtered Results', count: group?.entries?.length || 0 }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        format: exportFormat,
        scope: exportScope,
        options: {
          includeMetadata,
          includeTimestamps,
          includeSourceInfo
        },
        group: group,
        selectedEntries: selectedEntries
      };
      
      await onExport(exportData);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewData = () => {
    const sampleEntry = group?.entries?.[0];
    if (!sampleEntry) return '';

    switch (exportFormat) {
      case 'json':
        return JSON.stringify({
          timestamp: includeTimestamps ? sampleEntry.timestamp : undefined,
          sourceFile: includeSourceInfo ? sampleEntry.sourceFile : undefined,
          lineNumber: includeSourceInfo ? sampleEntry.lineNumber : undefined,
          level: sampleEntry.level,
          content: sampleEntry.content,
          metadata: includeMetadata ? sampleEntry.metadata : undefined
        }, null, 2);
      
      case 'csv':
        const headers = [
          includeTimestamps && 'Timestamp',
          includeSourceInfo && 'Source File',
          includeSourceInfo && 'Line Number',
          'Level',
          'Content',
          includeMetadata && 'Metadata'
        ].filter(Boolean).join(',');
        
        const row = [
          includeTimestamps && sampleEntry.timestamp,
          includeSourceInfo && sampleEntry.sourceFile,
          includeSourceInfo && sampleEntry.lineNumber,
          sampleEntry.level,
          `"${sampleEntry.content.replace(/"/g, '""')}"`,
          includeMetadata && JSON.stringify(sampleEntry.metadata || {})
        ].filter(Boolean).join(',');
        
        return `${headers}\n${row}`;
      
      case 'txt':
        return [
          includeTimestamps && `[${sampleEntry.timestamp}]`,
          includeSourceInfo && `${sampleEntry.sourceFile}:${sampleEntry.lineNumber}`,
          `${sampleEntry.level}:`,
          sampleEntry.content
        ].filter(Boolean).join(' ');
      
      case 'xml':
        return `<entry>
  ${includeTimestamps ? `<timestamp>${sampleEntry.timestamp}</timestamp>` : ''}
  ${includeSourceInfo ? `<source file="${sampleEntry.sourceFile}" line="${sampleEntry.lineNumber}" />` : ''}
  <level>${sampleEntry.level}</level>
  <content><![CDATA[${sampleEntry.content}]]></content>
  ${includeMetadata ? `<metadata>${JSON.stringify(sampleEntry.metadata || {})}</metadata>` : ''}
</entry>`;
      
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200">
      <div className={`bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Export Content</h2>
            <p className="text-sm text-text-secondary mt-1">
              Export {group?.name} entries in your preferred format
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconSize={20}
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Export Format Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setExportFormat(format.id)}
                  className={`
                    flex items-center space-x-3 p-3 rounded-md border transition-all duration-150
                    ${exportFormat === format.id 
                      ? 'border-primary bg-primary-50 text-primary' :'border-border bg-surface hover:bg-surface-hover text-text-primary'
                    }
                  `}
                >
                  <Icon name={format.icon} size={20} color="currentColor" />
                  <div className="text-left">
                    <div className="font-medium">{format.name}</div>
                    <div className="text-xs opacity-75">{format.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Export Scope */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">Export Scope</h3>
            <div className="space-y-2">
              {exportScopes.map((scope) => (
                <label
                  key={scope.id}
                  className={`
                    flex items-center justify-between p-3 rounded-md border cursor-pointer transition-all duration-150
                    ${exportScope === scope.id 
                      ? 'border-primary bg-primary-50' :'border-border bg-surface hover:bg-surface-hover'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="exportScope"
                      value={scope.id}
                      checked={exportScope === scope.id}
                      onChange={(e) => setExportScope(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-text-primary">{scope.name}</span>
                  </div>
                  <span className="text-sm text-text-secondary">{scope.count} entries</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeTimestamps}
                  onChange={(e) => setIncludeTimestamps(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Include timestamps</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeSourceInfo}
                  onChange={(e) => setIncludeSourceInfo(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Include source file information</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary">Include metadata</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-primary mb-3">Preview</h3>
            <div className="bg-slate-50 border border-border rounded-md p-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-text-primary font-mono whitespace-pre-wrap">
                {getPreviewData()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-surface">
          <div className="text-sm text-text-secondary">
            Ready to export {exportScope === 'selected' ? selectedEntries.length : group?.entries?.length || 0} entries
          </div>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              loading={isExporting}
              iconName="Download"
              iconSize={16}
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;