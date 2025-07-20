# LogMerger Pro

A powerful web application for intelligent log file analysis, pattern matching, and content grouping. LogMerger Pro helps you upload multiple log files, configure custom regex patterns, and view organized content groups for efficient log analysis.

## 🚀 Features

- **Multi-File Upload**: Upload multiple log files simultaneously with drag-and-drop support
- **Regex Pattern Configuration**: Create and test custom regular expressions for intelligent content grouping
- **Real-time Processing**: Monitor file processing status with live progress tracking
- **Content Grouping**: Automatically group log entries based on configured patterns
- **Advanced Search & Filtering**: Search through grouped content with powerful filters
- **Export Capabilities**: Export grouped content in multiple formats (JSON, CSV, TXT)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Pattern Library**: Access pre-built regex patterns for common log formats

## 📋 Prerequisites

- Node.js (version 18.0 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logmerger_pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

## 🎯 Quick Start Guide

### Step 1: Upload Log Files

1. Navigate to the **File Upload Dashboard** (home page)
2. **Upload files** using one of these methods:
   - Drag and drop files into the upload zone
   - Click "Choose Files" to browse and select files
   - Use the "Upload Multiple Files" button for batch uploads

3. **Supported file formats**:
   - `.log` files
   - `.txt` files
   - Maximum file size: 100MB per file

### Step 2: Configure Regex Patterns

1. **Basic Pattern Configuration**:
   - Enter your regex pattern in the "Regex Pattern" field
   - The pattern will be validated in real-time
   - Example patterns:
     - Error logs: `\[ERROR\]|ERROR:|Exception`
     - Warning logs: `\[WARN\]|WARNING:|WARN:`
     - Info logs: `\[INFO\]|INFO:|Information`

2. **Advanced Pattern Configuration**:
   - Click "Advanced Settings" to access the **Regex Pattern Configuration** page
   - Use the **Pattern Editor** for complex regex creation
   - Test patterns with the **Pattern Tester**
   - Save frequently used patterns with **Saved Patterns Manager**
   - Browse **Pattern Library** for common log formats

### Step 3: Process Files

1. **Start Processing**:
   - Click "Process Files" button on the dashboard
   - Ensure you have valid regex patterns configured
   - Monitor progress in real-time

2. **Processing Status**:
   - Navigate to **File Processing Status** page
   - View individual file processing progress
   - Monitor system resources and activity logs
   - Handle any processing errors

### Step 4: View Grouped Content

1. **Access Grouped Content**:
   - Navigate to **Grouped Content Viewer** after processing
   - Browse groups created by your regex patterns
   - View individual log entries within each group

2. **Content Navigation**:
   - Use the sidebar to navigate between groups
   - Filter content by date, source file, or log level
   - Search within groups using the search functionality

### Step 5: Analyze and Export

1. **Log Analysis Workspace**:
   - Access advanced analysis tools
   - Search across all grouped content
   - Apply filters for specific time ranges or sources
   - View content in different formats (list, table, detailed)

2. **Export Options**:
   - Export individual groups or selected entries
   - Choose from multiple formats: JSON, CSV, TXT
   - Configure export settings (date range, fields, etc.)

## 📚 Detailed Usage Instructions

### File Upload Dashboard

The main dashboard provides several key functions:

**Upload Zone Features**:
- Drag and drop multiple files simultaneously
- Real-time file validation
- Progress tracking for each file
- Error handling for unsupported formats

**File Management**:
- View uploaded files list with details (name, size, type, upload time)
- Remove individual files or clear all files
- View file processing status

**Quick Stats**:
- Total files uploaded
- Combined file size
- Pattern configuration status
- Files ready for processing

### Regex Pattern Configuration

**Pattern Editor**:
- Syntax highlighting for regex patterns
- Real-time pattern validation
- Error messages for invalid patterns
- Pattern flags configuration (global, multiline, etc.)

**Pattern Library**:
- Pre-built patterns for common log formats:
  - Apache/Nginx access logs
  - Application error logs
  - System event logs
  - Database logs
  - Security logs

**Pattern Tester**:
- Test patterns against sample log content
- View match results in real-time
- Validate pattern effectiveness before processing

**Saved Patterns Manager**:
- Save frequently used patterns
- Organize patterns by category
- Load saved patterns for reuse
- Export/import pattern collections

### File Processing Status

**Processing Overview**:
- Overall processing progress
- Estimated time remaining
- Current operation status
- Total files processed vs. remaining

**Individual File Status**:
- Processing stages: Upload → Parse → Analyze → Group
- Progress percentage for each file
- Processing time and performance metrics
- Error details for failed files

**System Monitoring**:
- Memory usage tracking
- CPU utilization
- Processing queue status
- System resource optimization

**Activity Log**:
- Real-time processing events
- Error messages and warnings
- Performance metrics
- System notifications

### Grouped Content Viewer

**Group Navigation**:
- Sidebar with all created groups
- Group statistics (entry count, last match time)
- Group type indicators (error, warning, info, debug)
- Search and filter groups

**Content Display**:
- Tabular view of grouped entries
- Sortable columns (timestamp, source, level, content)
- Expandable entries for full content view
- Bulk selection for mass operations

**Export Options**:
- Export entire groups or selected entries
- Multiple format support (JSON, CSV, TXT)
- Custom field selection
- Date range filtering

### Log Analysis Workspace

**Advanced Search**:
- Full-text search across all grouped content
- Regular expression search support
- Search within specific groups
- Search history and saved searches

**Filtering Options**:
- Date range filtering
- Source file filtering
- Log level filtering
- Custom metadata filtering

**View Modes**:
- List view for quick browsing
- Table view for structured data
- Detailed view for comprehensive analysis
- Timeline view for chronological analysis

## 🔧 Configuration Options

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
HOST=localhost

# File Upload Configuration
MAX_FILE_SIZE=104857600  # 100MB in bytes
ALLOWED_EXTENSIONS=.log,.txt

# Processing Configuration
MAX_CONCURRENT_PROCESSES=4
PROCESSING_TIMEOUT=300000  # 5 minutes in milliseconds

# Export Configuration
EXPORT_FORMATS=json,csv,txt
MAX_EXPORT_SIZE=1000000  # 1MB in bytes
```

### Customization Options

**Theme Configuration**:
- Light/dark mode support
- Custom color schemes
- Font size adjustments
- Layout preferences

**Performance Settings**:
- Chunk size for large files
- Concurrent processing limits
- Memory usage optimization
- Cache configuration

## 🚨 Troubleshooting

### Common Issues

**File Upload Problems**:
- **Issue**: Files not uploading
- **Solution**: Check file size (max 100MB) and format (.log, .txt only)
- **Solution**: Ensure stable internet connection
- **Solution**: Clear browser cache and cookies

**Pattern Configuration Issues**:
- **Issue**: Regex pattern not matching expected content
- **Solution**: Use the Pattern Tester to validate patterns
- **Solution**: Check regex syntax and escape special characters
- **Solution**: Test with sample log content first

**Processing Errors**:
- **Issue**: Files failing to process
- **Solution**: Check file format and encoding (UTF-8 recommended)
- **Solution**: Verify regex patterns are valid
- **Solution**: Retry processing with smaller file chunks

**Performance Issues**:
- **Issue**: Slow processing or browser freezing
- **Solution**: Process files in smaller batches
- **Solution**: Close unnecessary browser tabs
- **Solution**: Use a more powerful device for large files

**Export Problems**:
- **Issue**: Export failing or incomplete
- **Solution**: Select smaller data ranges
- **Solution**: Choose appropriate export format
- **Solution**: Check available disk space

### Browser Compatibility

**Supported Browsers**:
- Chrome 90+
- Firefox 85+
- Safari 14+
- Edge 90+

**Required Features**:
- JavaScript enabled
- Local storage support
- File API support
- WebSocket support (for real-time updates)

## 🎨 User Interface Guide

### Navigation

**Header Navigation**:
- Logo/Home link
- Main navigation menu
- User profile (if authentication enabled)
- Settings and preferences

**Workflow Progress**:
- Visual progress indicator
- Current step highlighting
- Navigation between workflow steps
- Completion status tracking

**Quick Action Toolbar**:
- Frequently used actions
- Keyboard shortcuts
- Context-sensitive options
- Help and documentation links

### Mobile Experience

**Responsive Design**:
- Optimized for mobile devices
- Touch-friendly interface
- Collapsible navigation
- Swipe gestures support

**Mobile-Specific Features**:
- Bottom navigation bar
- Drawer-style menus
- Thumb-friendly button sizes
- Optimized file upload interface

## 📊 Best Practices

### File Organization

1. **Use descriptive filenames** that indicate content type and date
2. **Group related files** by application or system
3. **Maintain consistent naming conventions**
4. **Include timestamps** in filenames when possible

### Pattern Creation

1. **Start with simple patterns** and gradually add complexity
2. **Test patterns thoroughly** before processing large files
3. **Use the Pattern Library** for common log formats
4. **Save successful patterns** for future use
5. **Document pattern purposes** with clear names and descriptions

### Performance Optimization

1. **Process files in batches** rather than all at once
2. **Use specific patterns** instead of overly broad ones
3. **Monitor system resources** during processing
4. **Close unnecessary applications** while processing large files
5. **Use appropriate file sizes** for your system capabilities

## 🔐 Security Considerations

- **Local Processing**: All file processing happens locally in your browser
- **No Server Upload**: Files are not uploaded to external servers
- **Privacy Protection**: Log content remains on your device
- **Secure Patterns**: Regex patterns are validated to prevent injection attacks

## 🤝 Support and Contributing

### Getting Help

- Check the troubleshooting section above
- Review the detailed usage instructions
- Search for similar issues in the documentation
- Contact support through the application's help menu

### Feature Requests

- Submit feature requests through the application
- Provide detailed use cases and examples
- Include mockups or descriptions of desired functionality

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🔄 Updates and Changelog

### Version 0.1.0
- Initial release
- Core file upload and processing functionality
- Regex pattern configuration
- Basic content grouping and viewing
- Export capabilities
- Responsive design implementation

---

**Happy Log Analysis!** 🎉

For technical support or questions, please refer to the help documentation within the application or contact the development team.