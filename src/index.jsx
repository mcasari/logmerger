import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

// Global error handler to suppress Chrome extension errors
window.addEventListener('error', (event) => {
  // Suppress Chrome extension errors that don't affect functionality
  if (event.error && event.error.message && 
      (event.error.message.includes('runtime/sendMessage') || 
       event.error.message.includes('message port closed'))) {
    event.preventDefault();
    console.warn('Suppressed Chrome extension error:', event.error.message);
    return false;
  }
});

// Also handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && 
      (event.reason.message.includes('runtime/sendMessage') || 
       event.reason.message.includes('message port closed'))) {
    event.preventDefault();
    console.warn('Suppressed Chrome extension promise rejection:', event.reason.message);
    return false;
  }
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
