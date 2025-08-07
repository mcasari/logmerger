import { useState, useCallback, useRef } from 'react';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks for file reading
const LINE_BUFFER_SIZE = 1000; // Number of lines to process per chunk

export const useChunkedFileReader = () => {
  const [isReading, setIsReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [processedLines, setProcessedLines] = useState(0);
  const abortControllerRef = useRef(null);

  const readFileInChunks = useCallback(async (file, onChunkProcessed, onComplete, onError) => {
    if (!file) return;

    setIsReading(true);
    setProgress(0);
    setTotalSize(file.size);
    setProcessedLines(0);
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    try {
      const reader = new FileReader();
      let offset = 0;
      let remainingBuffer = '';
      let lineCount = 0;
      
      const processChunk = (chunk) => {
        const text = remainingBuffer + chunk;
        const lines = text.split('\n');
        
        // Keep the last line as it might be incomplete
        remainingBuffer = lines.pop() || '';
        
        const processedLines = lines.filter(line => line.trim().length > 0);
        lineCount += processedLines.length;
        
        if (processedLines.length > 0) {
          onChunkProcessed(processedLines, lineCount);
        }
      };
      
      const readNextChunk = () => {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        
        if (chunk.size === 0) {
          // Process any remaining buffer
          if (remainingBuffer.trim()) {
            processChunk('');
          }
          onComplete();
          setIsReading(false);
          return;
        }
        
        reader.onload = (e) => {
          const chunk = e.target.result;
          processChunk(chunk);
          
          offset += CHUNK_SIZE;
          const newProgress = Math.min((offset / file.size) * 100, 100);
          setProgress(newProgress);
          setProcessedLines(lineCount);
          
          // Continue reading next chunk
          readNextChunk();
        };
        
        reader.onerror = () => {
          onError(new Error('Failed to read file chunk'));
          setIsReading(false);
        };
        
        reader.readAsText(chunk);
      };
      
      readNextChunk();
      
    } catch (error) {
      onError(error);
      setIsReading(false);
    }
  }, []);

  const cancelReading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsReading(false);
    }
  }, []);

  return {
    readFileInChunks,
    cancelReading,
    isReading,
    progress,
    totalSize,
    processedLines
  };
};

export const useLogParser = () => {
  const parseLogLine = useCallback((line, lineNumber) => {
    // Common log patterns
    const patterns = [
      // Standard timestamp patterns
      /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
      /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
      /^(\w{3} \d{2} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
      // JSON log patterns
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+(.+)$/,
      // Simple timestamp patterns
      /^(\d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
      // Generic pattern for any line
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const timestamp = match[1] || '';
        const level = match[2] || 'INFO';
        const message = match[3] || match[1] || line;
        
        // Determine log level
        let detectedLevel = 'INFO';
        if (level.match(/error|fail|exception/i)) detectedLevel = 'ERROR';
        else if (level.match(/warn|warning/i)) detectedLevel = 'WARN';
        else if (level.match(/debug/i)) detectedLevel = 'DEBUG';
        else if (level.match(/trace/i)) detectedLevel = 'TRACE';
        else if (level.match(/info/i)) detectedLevel = 'INFO';
        
        return {
          id: `log-${lineNumber}`,
          line: lineNumber,
          timestamp: timestamp,
          level: detectedLevel,
          message: line,
          originalMessage: message
        };
      }
    }
    
    // Fallback for unmatched lines
    return {
      id: `log-${lineNumber}`,
      line: lineNumber,
      timestamp: '',
      level: 'INFO',
      message: line,
      originalMessage: line
    };
  }, []);

  return { parseLogLine };
}; 