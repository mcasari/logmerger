// Web Worker for log parsing to avoid blocking the main thread
self.onmessage = function(e) {
  const { lines, startingLineNumber } = e.data;
  
  // Pattern cache for better performance
  const patternCache = new Map();
  const levelCache = new Map();
  
  // Pre-compiled patterns
  const patterns = [
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    /^(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
    /^(\w{3} \d{2} \d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+(.+)$/,
    /^(\d{2}:\d{2}:\d{2})\s+(\w+)\s+(.+)$/,
    /^(.+)$/
  ];
  
  const detectLogLevel = (level) => {
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
    
    levelCache.set(level, detectedLevel);
    return detectedLevel;
  };
  
  const parseLogLine = (line, lineNumber) => {
    // Quick cache check
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
      parseResult = {
        id: `log-${lineNumber}`,
        line: lineNumber,
        timestamp: '',
        level: 'INFO',
        message: line,
        originalMessage: line
      };
    }
    
    // Cache the result (limit cache size)
    if (patternCache.size < 1000) {
      patternCache.set(line, {
        timestamp: parseResult.timestamp,
        level: parseResult.level,
        message: parseResult.message,
        originalMessage: parseResult.originalMessage
      });
    }
    
    return parseResult;
  };
  
  // Process lines
  const parsedLines = lines.map((line, index) => 
    parseLogLine(line, startingLineNumber + index)
  );
  
  // Send result back to main thread
  self.postMessage({
    parsedLines,
    processed: lines.length
  });
};
