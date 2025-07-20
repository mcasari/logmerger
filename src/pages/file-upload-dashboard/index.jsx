import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import UploadedFilesList from './components/UploadedFilesList';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const FileUploadDashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFilesSelected = useCallback((selectedFiles) => {
    const newFiles = selectedFiles.map((file, index) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: Date.now(),
      file: file,
      id: `${file.name}-${Date.now()}-${index}`,
      error: null,
      lineCount: Math.floor(Math.random() * 10000) + 100,
    }));

    // Basic file validation
    const validatedFiles = newFiles.map(file => {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        return { ...file, error: 'File size exceeds 100MB limit' };
      }
      if (!file.name.match(/\.(log|txt)$/i)) {
        return { ...file, error: 'Only .log and .txt files are supported' };
      }
      return file;
    });

    setFiles(prevFiles => [...prevFiles, ...validatedFiles]);
  }, []);

  // Handle file removal
  const handleRemoveFile = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }, []);

  // Handle clear all files
  const handleClearAll = useCallback(() => {
    setFiles([]);
  }, []);

  // Handle merge and view logs
  const handleMergeLogs = useCallback(() => {
    if (files.length === 0) return;

    const validFiles = files.filter(f => !f.error);
    if (validFiles.length === 0) return;

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Store merged files in localStorage for simple log viewer
      localStorage.setItem('mergedLogFiles', JSON.stringify(validFiles));
      navigate('/log-viewer');
    }, 2000);
  }, [files, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Icon name="Upload" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Upload Log Files
                </h1>
                <p className="text-text-secondary">
                  Upload and merge your log files for simple viewing
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* File Upload Zone */}
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              isProcessing={isProcessing}
            />

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <UploadedFilesList
                files={files}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />
            )}

            {/* Action Controls */}
            {files.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-text-primary mb-1">
                      Ready to merge logs
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {files.filter(f => !f.error).length} files ready for merging
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      onClick={handleClearAll}
                      disabled={isProcessing}
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="primary"
                      iconName={isProcessing ? "Loader2" : "Eye"}
                      iconClassName={isProcessing ? "animate-spin" : ""}
                      onClick={handleMergeLogs}
                      disabled={isProcessing || files.filter(f => !f.error).length === 0}
                    >
                      {isProcessing ? 'Processing...' : 'Merge & View Logs'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simple Stats */}
          {files.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <Icon name="Files" size={24} color="var(--color-primary)" className="mx-auto mb-2" />
                <div className="text-xl font-bold text-text-primary">{files.length}</div>
                <div className="text-sm text-text-secondary">Files Uploaded</div>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <Icon name="HardDrive" size={24} color="var(--color-accent)" className="mx-auto mb-2" />
                <div className="text-xl font-bold text-text-primary">
                  {(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)}
                </div>
                <div className="text-sm text-text-secondary">MB Total Size</div>
              </div>
              
              <div className="bg-surface border border-border rounded-lg p-4 text-center">
                <Icon name="CheckCircle" size={24} color="var(--color-success)" className="mx-auto mb-2" />
                <div className="text-xl font-bold text-text-primary">
                  {files.filter(f => !f.error).length}
                </div>
                <div className="text-sm text-text-secondary">Ready to Process</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FileUploadDashboard;