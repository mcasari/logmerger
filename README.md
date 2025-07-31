# LogMerger - Advanced Log Analysis Tool


A powerful web application for efficient log file analysis with pattern-based grouping and visual log level identification. LogMerger allows you to upload multiple log files simultaneously, treat them as a single logical dataset, organize content using configurable patterns, and quickly identify log levels through intelligent color coding.

## 🚀 Key Features

- **Multi-File Upload**: Upload one or more log files at once with drag-and-drop support
- **Unified Log Processing**: Treat multiple files as a single logical file for analysis
- **Pattern-Based Grouping**: Configure custom regex patterns to automatically group log entries
- **Log Level Color Coding**: Automatic visual identification of ERROR, WARN, INFO, DEBUG, TRACE levels
- **Collapsible Groups**: Expand/collapse content groups for better organization
- **Advanced Search**: Search across merged log lines with real-time highlighting
- **Configurable Pagination**: Display all entries with customizable items per page (10, 25, 50, 100, 200)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Export Capabilities**: Export grouped results in JSON format

## 📋 Current Application State

### Implemented Features

**File Upload & Processing**:
- ✅ Multi-file drag-and-drop upload zone
- ✅ File validation and error handling
- ✅ Real-time processing status
- ✅ File management (add/remove files)

**Log Merging & Analysis**:
- ✅ Merge multiple log files into single logical view
- ✅ Automatic timestamp extraction and chronological sorting
- ✅ Pattern-based content grouping with configurable regex
- ✅ Three grouping modes: Log Level, Hour-based, Custom Pattern
- ✅ Log level color coding for enhanced visual identification

**Content Viewing**:
- ✅ Collapsible group interface
- ✅ Group-specific pagination with configurable items per page
- ✅ Search functionality with text highlighting
- ✅ File source tracking for each log entry
- ✅ Color-coded group identification
- ✅ Log level badges and background color coding

**User Interface**:
- ✅ Clean, responsive three-column layout
- ✅ Real-time statistics dashboard
- ✅ Quick action toolbar
- ✅ Mobile-optimized group viewer

### Pagination Implementation

The application features sophisticated pagination controls:
- **Configurable Items Per Page**: Choose from 10, 25, 50, 100, or 200 entries per page
- **Group-Specific Pagination**: Each content group maintains its own pagination state
- **Smart Page Navigation**: Intelligent page number display with ellipsis for large datasets
- **Entry Range Display**: Shows current viewing range (e.g., "Showing 1-50 of 1,247 entries")
- **Keyboard Navigation**: Previous/Next buttons for easy navigation

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 18.0 or higher)
- npm or yarn package manager
- Modern web browser

### Installation Steps

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd logmerger
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   Navigate to `http://localhost:5173`

## 🎯 Quick Start Guide

### Step 1: Upload Log Files
1. Navigate to the **LogMerger** page
2. Use the drag-and-drop zone or file browser to upload one or more log files
3. Supported formats: `.log`, `.txt` files
4. View uploaded files in the file list with size and status information

### Step 2: Configure Grouping Patterns
1. **Built-in Patterns**:
   - **Log Level**: Groups by ERROR, WARN, INFO, DEBUG, TRACE levels with color coding
   - **Hour-based**: Groups entries by hour timestamps
   - **Custom Pattern**: Define your own regex pattern

2. **Pattern Examples**:
   - Error logs: `\[ERROR\]|ERROR:|Exception`
   - Database queries: `SELECT|INSERT|UPDATE|DELETE`
   - User activities: `login|logout|authentication`
   - Log levels: `\[(ERROR|WARN|INFO|DEBUG|TRACE)\]` (automatically color-coded)

### Step 3: Process and View Results
1. Click "Process Files" to merge and analyze log content
2. View real-time statistics: files, total lines, filtered lines, groups
3. Use search to filter across all merged content
4. Expand/collapse groups as needed for focused analysis
5. **Note**: All entries are automatically sorted chronologically by timestamp within each group

### Step 4: Navigate with Pagination
1. **Set Items Per Page**: Choose your preferred page size from the dropdown
2. **Navigate Pages**: Use Previous/Next buttons or click specific page numbers
3. **View Entry Ranges**: See exactly which entries are currently displayed
4. **Group-Specific Navigation**: Each group maintains independent pagination

### Step 5: Export Results
1. Click "Export Results" to download grouped content
2. Exports include group information, entry counts, and full log data
3. JSON format with structured group and entry data

## 📚 Technical Architecture

### Component Structure
```
src/pages/log-merger/
├── index.jsx                 # Main LogMerger page component
├── components/
│   ├── FileUploadZone.jsx    # File upload and management
│   ├── PatternConfiguration.jsx # Regex pattern configuration
│   └── LogViewer.jsx         # Log content display with pagination
```

### Key Technologies
- **React 18+**: Functional components with hooks
- **Vite**: Development server and build tool
- **Tailwind CSS**: Styling and responsive design
- **Lucide React**: Icon library
- **Local Storage**: File metadata persistence

### Data Flow
1. Files uploaded → FileUploadZone
2. Content parsed → LogMerger state
3. Patterns applied → Content grouping
4. Groups rendered → LogViewer with pagination
5. User interactions → State updates and re-rendering

## 🔧 Configuration Options

### Pattern Configuration
- **Log Level Matching**: Built-in patterns for common log levels
- **Custom Regex**: Define complex patterns for specific log formats
- **Pattern Testing**: Real-time pattern validation with sample content
- **Multiple Patterns**: Support for various log formats simultaneously

### Pagination Settings
- **Items Per Page**: 10, 25, 50, 100, 200 options
- **Auto-Reset**: Pagination resets when search query changes
- **Memory Efficient**: Only renders visible entries to handle large datasets
- **Smooth Navigation**: Intelligent page number display for large page counts

### Performance Optimization
- **Incremental Processing**: Files processed sequentially to prevent browser freezing
- **Virtual Scrolling**: Efficient rendering of large log datasets
- **Search Optimization**: Debounced search to prevent excessive filtering
- **Memory Management**: Automatic cleanup of processed file references

### Log Level Color Coding
- **Automatic Detection**: Recognizes log levels in format `[ERROR]`, `[WARN]`, `[INFO]`, `[DEBUG]`, `[TRACE]`
- **Background Colors**: Subtle background colors for each log level (red for errors, yellow for warnings, etc.)
- **Left Border Indicators**: Colored left borders provide additional visual distinction
- **Log Level Badges**: Prominent badges show the log level with appropriate colors
- **Group Header Enhancement**: Log level groups display colored badges in headers

## 🎨 User Interface Features

### Responsive Design
- **Desktop**: Three-column layout with full feature access
- **Tablet**: Collapsible sidebars with touch-friendly controls
- **Mobile**: Stacked layout optimized for touch interaction

### Visual Indicators
- **Group Colors**: Color-coded groups based on content type
- **Log Level Colors**: Automatic color coding for ERROR (red), WARN (yellow), INFO (blue), DEBUG (purple), TRACE (gray)
- **Processing States**: Real-time visual feedback during file processing
- **Search Highlighting**: Matched text highlighted in search results
- **Status Badges**: File processing status and group entry counts

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **High Contrast**: Clear visual hierarchy and readable text
- **Focus Management**: Logical tab order and focus indicators

## 🚨 Current Limitations

### Known Constraints
- **Browser-Based Processing**: All processing happens locally in the browser
- **Memory Limitations**: Large files may impact browser performance
- **File Size Limits**: Recommended maximum of 100MB per file
- **Pattern Complexity**: Very complex regex patterns may slow processing

### Recommended Usage
- **File Sizes**: Best performance with files under 50MB
- **Batch Processing**: Process files in smaller groups for optimal performance
- **Pattern Testing**: Always test custom patterns with sample data first
- **Browser Requirements**: Modern browsers with JavaScript enabled

## 🔄 Recent Updates (v1.1.0)

### Core Features
- ✅ **Multi-file upload system** with drag-and-drop support
- ✅ **Unified log processing** treating multiple files as single dataset
- ✅ **Pattern-based grouping** with configurable regex patterns
- ✅ **Advanced pagination system** with customizable items per page
- ✅ **Search functionality** with real-time text highlighting
- ✅ **Collapsible group interface** for organized content viewing
- ✅ **Export capabilities** for processed log data
- ✅ **Log level color coding** for enhanced visual identification

### User Experience
- ✅ **Responsive design** optimized for all device sizes
- ✅ **Real-time statistics** showing processing progress
- ✅ **Visual feedback** throughout the workflow
- ✅ **Intuitive navigation** with clear action buttons
- ✅ **Enhanced log level visualization** with background colors and badges

---

**Start analyzing your logs today!** 🎉

Upload your log files, configure your patterns, and discover insights in your data with powerful pagination, search capabilities, and intelligent log level color coding.
