import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SystemResourceMonitor = ({ isProcessing }) => {
  const [resources, setResources] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0,
    networkActivity: 0
  });

  useEffect(() => {
    const updateResources = () => {
      if (isProcessing) {
        setResources({
          memoryUsage: Math.min(85, Math.random() * 60 + 25),
          cpuUsage: Math.min(90, Math.random() * 70 + 20),
          diskUsage: Math.min(75, Math.random() * 40 + 15),
          networkActivity: Math.min(60, Math.random() * 50 + 10)
        });
      } else {
        setResources({
          memoryUsage: Math.random() * 20 + 5,
          cpuUsage: Math.random() * 15 + 3,
          diskUsage: Math.random() * 10 + 2,
          networkActivity: Math.random() * 5 + 1
        });
      }
    };

    updateResources();
    const interval = setInterval(updateResources, 2000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const getUsageColor = (usage) => {
    if (usage >= 80) return 'error';
    if (usage >= 60) return 'warning';
    return 'success';
  };

  const formatBytes = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const resourceItems = [
    {
      label: 'Memory Usage',
      value: resources.memoryUsage,
      icon: 'HardDrive',
      unit: '%',
      details: `${formatBytes(resources.memoryUsage * 1024 * 1024 * 50)} / ${formatBytes(8 * 1024 * 1024 * 1024)}`
    },
    {
      label: 'CPU Usage',
      value: resources.cpuUsage,
      icon: 'Cpu',
      unit: '%',
      details: `${Math.floor(resources.cpuUsage / 25)} cores active`
    },
    {
      label: 'Disk I/O',
      value: resources.diskUsage,
      icon: 'Database',
      unit: '%',
      details: `${formatBytes(resources.diskUsage * 1024 * 1024)}/s`
    },
    {
      label: 'Network',
      value: resources.networkActivity,
      icon: 'Wifi',
      unit: '%',
      details: `${formatBytes(resources.networkActivity * 1024 * 100)}/s`
    }
  ];

  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} color="var(--color-text-primary)" />
          <h3 className="text-lg font-semibold text-text-primary">System Resources</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            isProcessing ? 'bg-primary animate-pulse' : 'bg-success'
          }`} />
          <span className="text-sm text-text-secondary">
            {isProcessing ? 'Active' : 'Idle'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceItems.map((item) => {
          const usageColor = getUsageColor(item.value);
          
          return (
            <div key={item.label} className="bg-surface rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon name={item.icon} size={16} color="var(--color-text-secondary)" />
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                </div>
                <span className={`text-sm font-bold ${
                  usageColor === 'error' ? 'text-error' :
                  usageColor === 'warning' ? 'text-warning' : 'text-success'
                }`}>
                  {Math.round(item.value)}{item.unit}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="w-full bg-border rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                      usageColor === 'error' ? 'bg-error' :
                      usageColor === 'warning' ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-text-muted">{item.details}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Warning */}
      {(resources.memoryUsage > 80 || resources.cpuUsage > 85) && (
        <div className="mt-4 bg-warning-50 border border-warning-200 rounded-md p-3">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning mb-1">High Resource Usage</h4>
              <p className="text-xs text-warning-600">
                System resources are running high. Consider closing other applications or reducing file processing batch size.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemResourceMonitor;