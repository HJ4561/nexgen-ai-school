/**
 * ============================================
 * APPLICATION ENTRY POINT
 * ============================================
 * 
 * Purpose: Root entry point for the React application
 * Sets up:
 * - React Strict Mode for development checks
 * - Redux Provider for state management
 * - Global CSS styles
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/app/App as the main application component
 * - @/app/store as the Redux store configuration
 * ============================================
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "@/app/App";  // Changed from "./App"
import store from "@/app/store";  // Changed from "./store"
import "../index.css";

/**
 * ============================================
 * ROOT RENDER
 * ============================================
 * 
 * Creates and renders the React application into the DOM
 * 
 * @description
 * - Uses ReactDOM.createRoot for React 18+ concurrent features
 * - Wraps App with Redux Provider for global state access
 * - Enables React Strict Mode for identifying potential problems
 * 
 * @example
 * // Application mounts to element with id "root"
 * // All components have access to Redux store via Provider
 * ============================================
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);