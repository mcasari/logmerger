# Chunked File Loading Implementation

This project now supports efficient handling of large log files through chunked loading and virtualized scrolling.

## Features


### 🚀 Chunked File Loading
- **Memory Efficient**: Files are loaded in chunks of 1,000 lines each
- **Lazy Loading**: New chunks are loaded only when the user scrolls near the bottom
- **Progress Tracking**: Real-time progress indicators during file processing
- **Cancellation Support**: Users can cancel file processing at any time

### 📊 Virtualized Scrolling
- **React Window Integration**: Uses `react-window` for efficient rendering
- **Fixed Item Heights**: Each log entry has a consistent height for optimal performance
- **Smooth Scrolling**: Only visible items are rendered, ensuring smooth performance with large datasets

### 🔍 Smart Log Parsing
- **Automatic Level Detection**: Automatically detects log levels (ERROR, WARN, INFO, DEBUG, TRACE)
- **Multiple Timestamp Formats**: Supports various timestamp formats commonly found in log files
- **JSON Log Support**: Handles structured JSON log formats
- **Fallback Parsing**: Gracefully handles unknown log formats

## Components

### 1. ChunkedFileReader.jsx
Utility hooks for handling file processing:
- `useChunkedFileReader()`: Manages file reading in chunks
- `useLogParser()`: Parses log lines with automatic level detection

### 2. SimpleLogViewer (Enhanced)
- **Mock Data**: Generates large datasets for testing
- **Chunked Loading**: Loads data in chunks as user scrolls
- **Virtualized Rendering**: Uses react-window for performance
- **Search Functionality**: Real-time filtering of log entries

### 3. RealFileLogViewer
- **Real File Upload**: Handles actual log file uploads
- **Progress Tracking**: Shows file processing progress
- **Multiple File Support**: Can handle multiple uploaded files
- **Export Functionality**: Export filtered results

## Configuration

### Chunk Sizes
```javascript
const CHUNK_SIZE = 1000; // Lines per chunk
const ITEM_HEIGHT = 80; // Pixels per log entry
const INITIAL_CHUNKS = 3; // Initial chunks to load
```

### File Reading
```javascript
const CHUNK_SIZE = 1024 * 1024; // 1MB file chunks
const LINE_BUFFER_SIZE = 1000; // Lines per processing chunk
```

## Usage

### For Mock Data Testing
Navigate to `/simple-log-viewer` to test with generated data.

### For Real File Processing
Navigate to `/real-file-log-viewer` to upload and process actual log files.

## Performance Benefits

1. **Memory Usage**: Only loads visible data + buffer
2. **Initial Load Time**: Fast initial rendering with progressive loading
3. **Scroll Performance**: Smooth scrolling regardless of file size
4. **Search Performance**: Efficient filtering on loaded data
5. **Browser Stability**: Prevents browser crashes with large files

## Technical Implementation

### File Processing Flow
1. **File Upload**: User selects log files
2. **Chunk Reading**: File is read in 1MB chunks
3. **Line Processing**: Each chunk is split into lines
4. **Log Parsing**: Lines are parsed with automatic level detection
5. **Initial Display**: First 3,000 lines are displayed
6. **Lazy Loading**: Additional chunks loaded on scroll

### Virtualization Strategy
1. **Fixed Heights**: Each log entry has consistent 80px height
2. **Window Rendering**: Only visible items are rendered
3. **Scroll Detection**: Monitors scroll position for lazy loading
4. **Buffer Management**: Maintains small buffer for smooth scrolling

### Search Implementation
1. **Real-time Filtering**: Filters loaded data instantly
2. **Case-insensitive**: Searches across message, level, and timestamp
3. **Performance Optimized**: Uses React.useMemo for efficient filtering

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **File API Support**: Requires FileReader API
- **Memory Considerations**: Handles files up to several GB efficiently

## Future Enhancements

1. **Indexed Search**: Implement search indexing for faster queries
2. **Streaming Processing**: Real-time log streaming capabilities
3. **Advanced Filtering**: Date range, log level, and regex filtering
4. **Export Options**: Multiple export formats (JSON, CSV, etc.)
5. **Collaborative Features**: Share filtered views and bookmarks

## Troubleshooting

### Common Issues

1. **Large Files Not Loading**: Check browser memory limits
2. **Slow Performance**: Reduce chunk sizes for better performance
3. **Search Not Working**: Ensure file format is supported
4. **Export Issues**: Check browser download permissions

### Performance Tips

1. **Chunk Size**: Adjust based on file size and browser performance
2. **Item Height**: Keep consistent for optimal virtualization
3. **Search Debouncing**: Implement debouncing for large datasets
4. **Memory Monitoring**: Monitor memory usage with large files 
