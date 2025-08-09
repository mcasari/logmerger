// Performance optimization configuration for ultra-fast loading

export const PERFORMANCE_CONFIG = {
  // File reading optimization
  FILE_READING: {
    INITIAL_CHUNK_SIZE: 32 * 1024, // 32KB - Ultra fast first read
    STANDARD_CHUNK_SIZE: 256 * 1024, // 256KB - Standard chunk size
    PREVIEW_BYTES: 4096, // 4KB - Instant preview size
    MAX_PREVIEW_LINES: 50, // Show only 50 lines in preview
  },
  
  // Display optimization
  DISPLAY: {
    CHUNK_SIZE: 100, // Only 100 lines per display chunk
    INITIAL_CHUNKS: 1, // Show only 1 chunk initially
    PROGRESSIVE_INCREMENT: 50, // Add 50 lines at a time
    ITEM_HEIGHT: 80, // Height of each log entry
  },
  
  // Processing optimization
  PROCESSING: {
    BATCH_SIZE: 100, // Process 100 lines at a time
    PROCESSING_DELAY: 0, // No delay for instant feedback
    BACKGROUND_DELAY: 16, // 16ms delay for background processing
    WORKER_THRESHOLD: 1000, // Use worker for files > 1000 lines
  },
  
  // Memory optimization
  MEMORY: {
    CACHE_SIZE: 500, // Smaller cache for faster startup
    MAX_DISPLAYED_LINES: 10000, // Limit displayed lines to prevent memory issues
    CLEANUP_THRESHOLD: 50000, // Clean up when exceeding this many lines
  },
  
  // UI optimization
  UI: {
    LOADING_TIMEOUT: 100, // Show loading after 100ms
    PREVIEW_TIMEOUT: 50, // Switch to preview after 50ms
    SCROLL_THRESHOLD: 0.9, // Load more at 90% scroll
    DEBOUNCE_DELAY: 150, // Debounce search input
  }
};

// Dynamic configuration based on file size
export const getOptimizedConfig = (fileSize) => {
  const sizeMB = fileSize / (1024 * 1024);
  
  if (sizeMB < 1) {
    // Small files - instant loading
    return {
      ...PERFORMANCE_CONFIG,
      DISPLAY: {
        ...PERFORMANCE_CONFIG.DISPLAY,
        CHUNK_SIZE: 500,
        INITIAL_CHUNKS: 2,
      }
    };
  } else if (sizeMB < 10) {
    // Medium files - fast loading
    return {
      ...PERFORMANCE_CONFIG,
      DISPLAY: {
        ...PERFORMANCE_CONFIG.DISPLAY,
        CHUNK_SIZE: 200,
        INITIAL_CHUNKS: 1,
      }
    };
  } else {
    // Large files - ultra-optimized
    return {
      ...PERFORMANCE_CONFIG,
      DISPLAY: {
        ...PERFORMANCE_CONFIG.DISPLAY,
        CHUNK_SIZE: 50,
        INITIAL_CHUNKS: 1,
        PROGRESSIVE_INCREMENT: 25,
      }
    };
  }
};

// Performance monitoring utilities
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: {
    INITIAL_LOAD_MS: 500,
    PROCESSING_RATE_LPS: 5000, // Lines per second
    MEMORY_MB: 100,
  },
  GOOD: {
    INITIAL_LOAD_MS: 1500,
    PROCESSING_RATE_LPS: 2000,
    MEMORY_MB: 250,
  },
  POOR: {
    INITIAL_LOAD_MS: 5000,
    PROCESSING_RATE_LPS: 500,
    MEMORY_MB: 500,
  }
};
