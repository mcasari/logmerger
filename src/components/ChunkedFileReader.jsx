import { useState, useCallback, useRef, useEffect } from 'react';

const CHUNK_SIZE = 256 * 1024; // 256KB chunks for ultra-fast initial response
const LINE_BUFFER_SIZE = 200; // Even smaller batches for instant feedback
const PROCESSING_DELAY = 0; // Minimal delay between chunks for UI responsiveness
const INITIAL_CHUNK_SIZE = 64 * 1024; // First chunk is even smaller (64KB)

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
      
      const processChunk = async (chunk) => {
        const text = remainingBuffer + chunk;
        const lines = text.split('\n');
        
        // Keep the last line as it might be incomplete
        remainingBuffer = lines.pop() || '';
        
        const processedLines = lines.filter(line => line.trim().length > 0);
        lineCount += processedLines.length;
        
        if (processedLines.length > 0) {
          // Process lines in smaller batches to avoid blocking UI
          const batchSize = LINE_BUFFER_SIZE;
          for (let i = 0; i < processedLines.length; i += batchSize) {
            const batch = processedLines.slice(i, i + batchSize);
            await new Promise(resolve => {
              setTimeout(() => {
                onChunkProcessed(batch, lineCount);
                resolve();
              }, PROCESSING_DELAY);
            });
            
            // Check for cancellation
            if (abortControllerRef.current?.signal.aborted) {
              return;
            }
          }
        }
      };
      
      const readNextChunk = async () => {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }
        
        // Use smaller chunk size for first chunk for faster initial response
        const chunkSize = offset === 0 ? INITIAL_CHUNK_SIZE : CHUNK_SIZE;
        const chunk = file.slice(offset, offset + chunkSize);
        
        if (chunk.size === 0) {
          // Process any remaining buffer
          if (remainingBuffer.trim()) {
            await processChunk('');
          }
          onComplete();
          setIsReading(false);
          return;
        }
        
        reader.onload = async (e) => {
          const chunk = e.target.result;
          await processChunk(chunk);
          
          offset += chunkSize;
          const newProgress = Math.min((offset / file.size) * 100, 100);
          setProgress(newProgress);
          setProcessedLines(lineCount);
          
          // Continue reading next chunk with minimal delay for UI responsiveness
          setTimeout(readNextChunk, PROCESSING_DELAY);
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

// Memoization cache for pattern matching
const patternCache = new Map();
const levelCache = new Map();

export const useLogParser = () => {
  // Pre-compiled patterns for better performance
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

  const detectLogLevel = useCallback((level) => {
    // Use cache for frequently occurring levels
    if (levelCache.has(level)) {
      return levelCache.get(level);
    }
    
    let detectedLevel = 'INFO';
    const lowerLevel = level.toLowerCase();
    
    if (lowerLevel.includes('error') || lowerLevel.includes('fail') || lowerLevel.includes('exception')) {
      detectedLevel = 'ERROR';
    } else if (lowerLevel.includes('warn')) {
      detectedLevel = 'WARN';
    } else if (lowerLevel.includes('debug')) {
      detectedLevel = 'DEBUG';
    } else if (lowerLevel.includes('trace')) {
      detectedLevel = 'TRACE';
    } else if (lowerLevel.includes('info')) {
      detectedLevel = 'INFO';
    }
    
    // Cache the result
    levelCache.set(level, detectedLevel);
    return detectedLevel;
  }, []);

  const parseLogLine = useCallback((line, lineNumber) => {
    // Quick cache check for identical lines
    if (patternCache.has(line)) {
      const cached = patternCache.get(line);
      return {
        ...cached,
        id: `log-${lineNumber}`,
        line: lineNumber
      };
    }

    let parseResult = null;
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const timestamp = match[1] || '';
        const level = match[2] || 'INFO';
        const message = match[3] || match[1] || line;
        
        const detectedLevel = detectLogLevel(level);
        
        parseResult = {
          id: `log-${lineNumber}`,
          line: lineNumber,
          timestamp: timestamp,
          level: detectedLevel,
          message: line,
          originalMessage: message
        };
        break;
      }
    }
    
    if (!parseResult) {
      // Fallback for unmatched lines
      parseResult = {
        id: `log-${lineNumber}`,
        line: lineNumber,
        timestamp: '',
        level: 'INFO',
        message: line,
        originalMessage: line
      };
    }
    
    // Cache the result (limit cache size to prevent memory issues)
    if (patternCache.size < 1000) {
      patternCache.set(line, {
        timestamp: parseResult.timestamp,
        level: parseResult.level,
        message: parseResult.message,
        originalMessage: parseResult.originalMessage
      });
    }
    
    return parseResult;
  }, [detectLogLevel]);

  return { parseLogLine };
};

// Web Worker based log parser for better performance
export const useWorkerLogParser = () => {
  const workerRef = useRef(null);
  const [isWorkerSupported, setIsWorkerSupported] = useState(true);
  
  const parseLogLinesWithWorker = useCallback((lines, startingLineNumber) => {
    return new Promise((resolve, reject) => {
      if (!isWorkerSupported) {
        // Fallback to main thread parsing
        const { parseLogLine } = useLogParser();
        const parsedLines = lines.map((line, index) => 
          parseLogLine(line, startingLineNumber + index)
        );
        resolve(parsedLines);
        return;
      }
      
      try {
        if (!workerRef.current) {
          workerRef.current = new Worker('/logParserWorker.js');
        }
        
        const worker = workerRef.current;
        
        const handleMessage = (e) => {
          const { parsedLines } = e.data;
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          resolve(parsedLines);
        };
        
        const handleError = (error) => {
          console.warn('Worker failed, falling back to main thread:', error);
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          setIsWorkerSupported(false);
          
          // Fallback to main thread
          const { parseLogLine } = useLogParser();
          const parsedLines = lines.map((line, index) => 
            parseLogLine(line, startingLineNumber + index)
          );
          resolve(parsedLines);
        };
        
        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);
        
        worker.postMessage({
          lines,
          startingLineNumber
        });
        
      } catch (error) {
        console.warn('Web Worker not supported, using main thread:', error);
        setIsWorkerSupported(false);
        
        // Fallback to main thread
        const { parseLogLine } = useLogParser();
        const parsedLines = lines.map((line, index) => 
          parseLogLine(line, startingLineNumber + index)
        );
        resolve(parsedLines);
      }
    });
  }, [isWorkerSupported]);
  
  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);
  
  return { parseLogLinesWithWorker, isWorkerSupported };
}; 