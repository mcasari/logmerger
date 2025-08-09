import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Simplified imports for core functionality only
import LogMerger from "pages/log-merger";
import NotFound from "pages/NotFound";
import SimpleLogViewer from "pages/simple-log-viewer";
import RealFileLogViewer from "pages/simple-log-viewer/RealFileLogViewer";
import UltraSimpleLogViewer from "pages/simple-log-viewer/UltraSimpleLogViewer";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Simplified routing - single main page */}
        <Route path="/" element={<LogMerger />} />
        <Route path="/log-merger" element={<LogMerger />} />
        <Route path="/simple-log-viewer" element={<SimpleLogViewer />} />
        <Route path="/real-file-log-viewer" element={<RealFileLogViewer />} />
        <Route path="/ultra-simple-log-viewer" element={<UltraSimpleLogViewer />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;