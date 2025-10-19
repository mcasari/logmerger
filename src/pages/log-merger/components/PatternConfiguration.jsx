import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';

import Input from '../../../components/ui/Input';

const PatternConfiguration = ({ 
  sampleEntries = [],
  selectedLogLevels = [],
  onLogLevelToggle,
  onSelectAllLogLevels,
  onClearAllLogLevels,
  logLevelCounts = {},
  dateTimeFilter = {},
  onDateTimeFilterChange,
  onDateTimeFilterToggle,
  onClearDateTimeFilter
}) => {
  const [isLogLevelFilterOpen, setIsLogLevelFilterOpen] = useState(false);


  return (
    <div className="space-y-6">
      {/* Date/Time Filter - Always visible */}
      <div className="mb-6">
        <div className="bg-background border border-border rounded-lg">
          {/* Toggle Header */}
          <button
            onClick={onDateTimeFilterToggle}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-surface-hover transition-colors duration-150"
          >
            <div className="flex items-center space-x-2">
              <Icon 
                name="Clock" 
                size={16} 
                color="var(--color-primary)" 
              />
              <span className="text-sm font-medium text-text-primary">
                Date/Time Filter
              </span>
              {dateTimeFilter.enabled && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                  Active
                </span>
              )}
            </div>
            <Icon 
              name={dateTimeFilter.enabled ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              color="var(--color-text-secondary)" 
              className="transition-transform duration-150"
            />
          </button>

          {/* Collapsible Content */}
          {dateTimeFilter.enabled && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4 space-y-4">
                {/* Start Date/Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateTimeFilter.startDate || ''}
                      onChange={(e) => onDateTimeFilterChange('startDate', e.target.value)}
                      max={dateTimeFilter.endDate || undefined}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={dateTimeFilter.startTime || ''}
                      onChange={(e) => onDateTimeFilterChange('startTime', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* End Date/Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateTimeFilter.endDate || ''}
                      onChange={(e) => onDateTimeFilterChange('endDate', e.target.value)}
                      min={dateTimeFilter.startDate || undefined}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={dateTimeFilter.endTime || ''}
                      onChange={(e) => onDateTimeFilterChange('endTime', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Clear Filter Button */}
                <div className="flex justify-end">
                  <button
                    onClick={onClearDateTimeFilter}
                    className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface text-text-secondary hover:text-text-primary border border-border"
                  >
                    Clear Filter
                  </button>
                </div>

                {/* Filter Status */}
                {(dateTimeFilter.startDate || dateTimeFilter.endDate) && (
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name="Clock" 
                        size={16} 
                        color="var(--color-primary)" 
                      />
                      <span className="text-sm font-medium text-primary-700">
                        Date/Time Filter Active
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-text-secondary space-y-1">
                      {dateTimeFilter.startDate && (
                        <div className="flex items-center space-x-2">
                          <span className="text-primary-600">From:</span>
                          <span className="font-mono">{dateTimeFilter.startDate}</span>
                          {dateTimeFilter.startTime && (
                            <>
                              <span className="text-primary-600">at</span>
                              <span className="font-mono">{dateTimeFilter.startTime}</span>
                            </>
                          )}
                        </div>
                      )}
                      {dateTimeFilter.endDate && (
                        <div className="flex items-center space-x-2">
                          <span className="text-primary-600">To:</span>
                          <span className="font-mono">{dateTimeFilter.endDate}</span>
                          {dateTimeFilter.endTime && (
                            <>
                              <span className="text-primary-600">at</span>
                              <span className="font-mono">{dateTimeFilter.endTime}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Level Filter - Always visible */}
      <div className="mb-6">
        <div className="bg-background border border-border rounded-lg">
          {/* Toggle Header */}
          <button
            onClick={() => setIsLogLevelFilterOpen(!isLogLevelFilterOpen)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-surface-hover transition-colors duration-150"
          >
            <div className="flex items-center space-x-2">
              <Icon 
                name="Filter" 
                size={16} 
                color="var(--color-primary)" 
              />
              <span className="text-sm font-medium text-text-primary">
                Log Level Filter
              </span>
              {selectedLogLevels.length > 0 && (
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                  {selectedLogLevels.length} selected
                </span>
              )}
            </div>
            <Icon 
              name={isLogLevelFilterOpen ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              color="var(--color-text-secondary)" 
              className="transition-transform duration-150"
            />
          </button>

          {/* Collapsible Content */}
          {isLogLevelFilterOpen && (
            <div className="px-4 pb-4 border-t border-border">
              <div className="pt-4 space-y-3">
                {[
                  { key: 'ERROR', label: 'ERROR', color: 'bg-error-100 text-error-800 border-error-200' },
                  { key: 'WARN', label: 'WARN', color: 'bg-warning-100 text-warning-800 border-warning-200' },
                  { key: 'INFO', label: 'INFO', color: 'bg-green-100 text-green-800 border-green-200' },
                  { key: 'DEBUG', label: 'DEBUG', color: 'bg-secondary-100 text-secondary-700 border-secondary-200' },
                  { key: 'TRACE', label: 'TRACE', color: 'bg-secondary-100 text-secondary-700 border-secondary-200' }
                ].map(level => {
                  const isSelected = selectedLogLevels.includes(level.key);
                  const count = logLevelCounts[level.key] || 0;
                  
                  return (
                    <label key={level.key} className="flex items-center space-x-3 cursor-pointer hover:bg-surface-hover p-2 rounded-md transition-colors duration-150">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onLogLevelToggle(level.key)}
                        className="rounded border-border text-primary-600 focus:ring-primary-500 focus:ring-2 focus:ring-offset-0"
                      />
                      <div className={`px-2 py-1 rounded text-xs font-medium border ${level.color}`}>
                        {level.label}
                      </div>
                      <div className="text-xs text-text-secondary flex-1">
                        {count.toLocaleString()} entries
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {/* Select All / Clear All buttons */}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={onSelectAllLogLevels}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface text-text-secondary hover:text-text-primary border border-border"
                >
                  Select All
                </button>
                <button
                  onClick={onClearAllLogLevels}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-surface text-text-secondary hover:text-text-primary border border-border"
                >
                  Clear All
                </button>
              </div>
              
              {selectedLogLevels.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name="Filter" 
                      size={16} 
                      color="var(--color-primary)" 
                    />
                    <span className="text-sm font-medium text-primary-700">
                      Showing {selectedLogLevels.length} of 5 log levels
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedLogLevels.map(level => (
                      <span 
                        key={level}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>




    </div>
  );
};

export default PatternConfiguration;