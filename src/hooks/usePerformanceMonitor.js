import { useState, useCallback, useRef } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fileProcessingTime: 0,
    linesProcessed: 0,
    averageProcessingRate: 0,
    memoryUsage: 0,
    isUsingWorker: false
  });
  
  const startTimeRef = useRef(null);
  const processedLinesRef = useRef(0);
  
  const startMonitoring = useCallback((filename) => {
    startTimeRef.current = performance.now();
    processedLinesRef.current = 0;
    
    setMetrics(prev => ({
      ...prev,
      fileProcessingTime: 0,
      linesProcessed: 0,
      averageProcessingRate: 0
    }));
    
    console.log(`🚀 Starting performance monitoring for: ${filename}`);
  }, []);
  
  const updateProgress = useCallback((linesProcessed, isUsingWorker = false) => {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTimeRef.current;
    const processingRate = linesProcessed / (elapsedTime / 1000); // lines per second
    
    processedLinesRef.current = linesProcessed;
    
    setMetrics(prev => ({
      ...prev,
      fileProcessingTime: elapsedTime,
      linesProcessed,
      averageProcessingRate: processingRate,
      isUsingWorker
    }));
  }, []);
  
  const endMonitoring = useCallback((filename) => {
    const endTime = performance.now();
    const totalTime = endTime - startTimeRef.current;
    const finalRate = processedLinesRef.current / (totalTime / 1000);
    
    // Get memory usage if available
    let memoryUsage = 0;
    if (performance.memory) {
      memoryUsage = performance.memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    
    const finalMetrics = {
      fileProcessingTime: totalTime,
      linesProcessed: processedLinesRef.current,
      averageProcessingRate: finalRate,
      memoryUsage,
      isUsingWorker: metrics.isUsingWorker
    };
    
    setMetrics(finalMetrics);
    
    console.log(`📊 Performance Summary for ${filename}:`, {
      'Processing Time': `${(totalTime / 1000).toFixed(2)}s`,
      'Lines Processed': processedLinesRef.current.toLocaleString(),
      'Processing Rate': `${Math.round(finalRate).toLocaleString()} lines/sec`,
      'Memory Usage': `${memoryUsage.toFixed(1)} MB`,
      'Using Web Worker': finalMetrics.isUsingWorker ? '✅' : '❌'
    });
    
    return finalMetrics;
  }, [metrics.isUsingWorker]);
  
  const getPerformanceReport = useCallback(() => {
    const { fileProcessingTime, linesProcessed, averageProcessingRate, memoryUsage, isUsingWorker } = metrics;
    
    return {
      summary: {
        processingTimeSeconds: (fileProcessingTime / 1000).toFixed(2),
        linesProcessed: linesProcessed.toLocaleString(),
        processingRate: `${Math.round(averageProcessingRate).toLocaleString()} lines/sec`,
        memoryUsageMB: memoryUsage.toFixed(1),
        usingWebWorker: isUsingWorker
      },
      recommendations: getPerformanceRecommendations(averageProcessingRate, memoryUsage, isUsingWorker),
      raw: metrics
    };
  }, [metrics]);
  
  return {
    metrics,
    startMonitoring,
    updateProgress,
    endMonitoring,
    getPerformanceReport
  };
};

const getPerformanceRecommendations = (processingRate, memoryUsage, isUsingWorker) => {
  const recommendations = [];
  
  if (processingRate < 1000) {
    recommendations.push('⚠️ Low processing rate detected. Consider using a modern browser with Web Worker support.');
  }
  
  if (memoryUsage > 500) {
    recommendations.push('🧠 High memory usage detected. Consider processing smaller file chunks or closing other browser tabs.');
  }
  
  if (!isUsingWorker) {
    recommendations.push('🔧 Web Workers not available. Consider upgrading to a modern browser for better performance.');
  }
  
  if (processingRate > 5000 && memoryUsage < 200 && isUsingWorker) {
    recommendations.push('✨ Excellent performance! Your setup is optimized for large file processing.');
  }
  
  return recommendations;
};
