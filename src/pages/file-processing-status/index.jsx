import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import WorkflowProgress from '../../components/ui/WorkflowProgress';
import ProcessingOverview from './components/ProcessingOverview';
import FileStatusCard from './components/FileStatusCard';
import ActivityLog from './components/ActivityLog';
import SystemResourceMonitor from './components/SystemResourceMonitor';
import ActionControls from './components/ActionControls';

const FileProcessingStatus = () => {
  const [processingState, setProcessingState] = useState({
    isProcessing: true,
    overallProgress: 0,
    currentOperation: '',
    estimatedTimeRemaining: 0
  });

  const [files, setFiles] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Mock data initialization
  useEffect(() => {
    const mockFiles = [
      {
        id: 1,
        name: "application.log",
        size: 2048576,
        status: "completed",
        progress: 100,
        processingTime: 3200,
        stages: [
          { name: "Upload", status: "completed" },
          { name: "Parse", status: "completed" },
          { name: "Analyze", status: "completed" },
          { name: "Group", status: "completed" }
        ],
        results: {
          linesProcessed: 15420,
          groupsCreated: 8,
          matchesFound: 1240
        }
      },
      {
        id: 2,
        name: "error.log",
        size: 1536000,
        status: "processing",
        progress: 65,
        processingTime: 2100,
        currentOperation: "Applying regex patterns to group content...",
        stages: [
          { name: "Upload", status: "completed" },
          { name: "Parse", status: "completed" },
          { name: "Analyze", status: "processing" },
          { name: "Group", status: "pending" }
        ]
      },
      {
        id: 3,
        name: "access.log",
        size: 5242880,
        status: "failed",
        progress: 25,
        processingTime: 1800,
        error: "Failed to parse log format. Invalid timestamp format detected on line 1247.",
        errorCode: "PARSE_ERROR_001",
        stages: [
          { name: "Upload", status: "completed" },
          { name: "Parse", status: "failed" },
          { name: "Analyze", status: "pending" },
          { name: "Group", status: "pending" }
        ]
      },
      {
        id: 4,
        name: "debug.log",
        size: 3145728,
        status: "queued",
        progress: 0,
        stages: [
          { name: "Upload", status: "completed" },
          { name: "Parse", status: "pending" },
          { name: "Analyze", status: "pending" },
          { name: "Group", status: "pending" }
        ]
      },
      {
        id: 5,
        name: "system.log",
        size: 4194304,
        status: "processing",
        progress: 35,
        processingTime: 1200,
        currentOperation: "Parsing log entries and extracting metadata...",
        stages: [
          { name: "Upload", status: "completed" },
          { name: "Parse", status: "processing" },
          { name: "Analyze", status: "pending" },
          { name: "Group", status: "pending" }
        ]
      }
    ];

    const mockLogs = [
      {
        timestamp: Date.now() - 300000,
        type: "info",
        message: "Processing started for 5 files",
        fileName: null,
        details: "Total size: 16.0 MB"
      },
      {
        timestamp: Date.now() - 280000,
        type: "success",
        message: "File upload completed successfully",
        fileName: "application.log",
        details: "2.0 MB uploaded in 1.2s"
      },
      {
        timestamp: Date.now() - 260000,
        type: "info",
        message: "Starting regex pattern analysis",
        fileName: "application.log",
        details: "Applying 3 configured patterns"
      },
      {
        timestamp: Date.now() - 240000,
        type: "success",
        message: "Content grouping completed",
        fileName: "application.log",
        details: "Created 8 groups with 1,240 matches"
      },
      {
        timestamp: Date.now() - 220000,
        type: "warning",
        message: "Large file detected, enabling streaming mode",
        fileName: "access.log",
        details: "File size: 5.0 MB, switching to chunk processing"
      },
      {
        timestamp: Date.now() - 200000,
        type: "error",
        message: "Parse error encountered",
        fileName: "access.log",
        details: "Invalid timestamp format on line 1247: \'2024-13-45 25:70:90'"
      },
      {
        timestamp: Date.now() - 180000,
        type: "info",
        message: "Retrying failed file with alternative parser",
        fileName: "access.log",
        details: "Attempting recovery with flexible timestamp parsing"
      },
      {
        timestamp: Date.now() - 160000,
        type: "info",
        message: "Processing queued file",
        fileName: "debug.log",
        details: "Position 4 of 5 in processing queue"
      }
    ];

    setFiles(mockFiles);
    setActivityLogs(mockLogs);

    // Simulate processing updates
    const processingInterval = setInterval(() => {
      setProcessingState(prev => {
        const newProgress = Math.min(100, prev.overallProgress + Math.random() * 5);
        const operations = [
          "Parsing log entries and extracting metadata...",
          "Applying regex patterns to group content...",
          "Analyzing file structure and format...",
          "Creating content groups and indexing...",
          "Finalizing processing and generating results..."
        ];
        
        return {
          ...prev,
          overallProgress: newProgress,
          currentOperation: operations[Math.floor(Math.random() * operations.length)],
          estimatedTimeRemaining: Math.max(0, Math.floor((100 - newProgress) * 2.5)),
          isProcessing: newProgress < 100
        };
      });

      // Update file progress
      setFiles(prevFiles => 
        prevFiles.map(file => {
          if (file.status === 'processing') {
            const newProgress = Math.min(100, file.progress + Math.random() * 8);
            return {
              ...file,
              progress: newProgress,
              status: newProgress >= 100 ? 'completed' : 'processing'
            };
          }
          return file;
        })
      );

      // Add new log entries occasionally
      if (Math.random() > 0.7) {
        const newLogMessages = [
          "Memory usage optimized for large file processing",
          "Regex pattern matching in progress",
          "Content indexing completed for current batch",
          "File validation passed all checks",
          "Processing queue updated with new priority"
        ];
        
        const newLog = {
          timestamp: Date.now(),
          type: "info",
          message: newLogMessages[Math.floor(Math.random() * newLogMessages.length)],
          fileName: files[Math.floor(Math.random() * files.length)]?.name || null,
          details: `Operation completed in ${(Math.random() * 2 + 0.5).toFixed(1)}s`
        };

        setActivityLogs(prev => [...prev, newLog].slice(-50)); // Keep last 50 logs
      }
    }, 3000);

    return () => clearInterval(processingInterval);
  }, []);

  const handleCancelProcessing = () => {
    setProcessingState(prev => ({ ...prev, isProcessing: false }));
    setFiles(prevFiles => 
      prevFiles.map(file => ({
        ...file,
        status: file.status === 'processing' ? 'cancelled' : file.status
      }))
    );
    
    const cancelLog = {
      timestamp: Date.now(),
      type: "warning",
      message: "Processing cancelled by user",
      fileName: null,
      details: "All active operations have been stopped"
    };
    setActivityLogs(prev => [...prev, cancelLog]);
  };

  const handleRetryFailed = () => {
    setFiles(prevFiles => 
      prevFiles.map(file => ({
        ...file,
        status: file.status === 'failed' ? 'queued' : file.status,
        progress: file.status === 'failed' ? 0 : file.progress,
        error: file.status === 'failed' ? null : file.error
      }))
    );
    
    const retryLog = {
      timestamp: Date.now(),
      type: "info",
      message: "Retrying failed files",
      fileName: null,
      details: "Failed files have been added back to processing queue"
    };
    setActivityLogs(prev => [...prev, retryLog]);
  };

  const handleClearAll = () => {
    setFiles([]);
    setActivityLogs([]);
    setProcessingState({
      isProcessing: false,
      overallProgress: 0,
      currentOperation: '',
      estimatedTimeRemaining: 0
    });
  };

  const completedFiles = files.filter(file => file.status === 'completed').length;
  const failedFiles = files.filter(file => file.status === 'failed').length;
  const hasResults = completedFiles > 0;
  const hasErrors = failedFiles > 0;

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* Processing Overview */}
              <ProcessingOverview
                overallProgress={processingState.overallProgress}
                totalFiles={files.length}
                completedFiles={completedFiles}
                failedFiles={failedFiles}
                currentOperation={processingState.currentOperation}
                estimatedTimeRemaining={processingState.estimatedTimeRemaining}
                isProcessing={processingState.isProcessing}
              />

              {/* File Status Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">File Processing Status</h2>
                  <span className="text-sm text-text-secondary">
                    {files.length} file{files.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {files.map(file => (
                    <FileStatusCard key={file.id} file={file} />
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <ActivityLog 
                logs={activityLogs} 
                isProcessing={processingState.isProcessing} 
              />
            </div>

            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              {/* Workflow Progress */}
              <WorkflowProgress />

              {/* System Resource Monitor */}
              <SystemResourceMonitor isProcessing={processingState.isProcessing} />

              {/* Action Controls */}
              <ActionControls
                isProcessing={processingState.isProcessing}
                hasResults={hasResults}
                hasErrors={hasErrors}
                processingProgress={processingState.overallProgress}
                onCancelProcessing={handleCancelProcessing}
                onRetryFailed={handleRetryFailed}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileProcessingStatus;