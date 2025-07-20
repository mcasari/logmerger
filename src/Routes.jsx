import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Simplified imports - only core features
import FileUploadDashboard from "pages/file-upload-dashboard";
import SimpleLogViewer from "pages/simple-log-viewer";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Simplified routes - core features only */}
        <Route path="/" element={<FileUploadDashboard />} />
        <Route path="/file-upload-dashboard" element={<FileUploadDashboard />} />
        <Route path="/log-viewer" element={<SimpleLogViewer />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;