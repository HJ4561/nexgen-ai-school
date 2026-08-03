/**
 * ============================================
 * REDUX STORE CONFIGURATION
 * ============================================
 * 
 * Purpose: Central state management for the entire application
 * 
 * Architecture:
 * - Uses Redux Toolkit for modern Redux patterns
 * - Each module adds its own slice
 * - All reducers are combined here into a single store
 * 
 * Module Structure:
 * Each module's state is organized by feature/role:
 * 
 * 1. Core Auth: User authentication and session
 * 2. Admin: Admin dashboard and management features
 * 3. Teacher: Teacher-specific features
 * 4. Student: Student-specific features  
 * 5. Parent: Parent-specific features
 * 6. Common: Shared features (complaints, notifications, settings)
 * 7. Chat: Real-time messaging
 * 
 * State Shape:
 * {
 *   auth: { user, token, isLoading, error },
 *   admin: { dashboard, users, academic },
 *   teacher: { classes, assignments, grades },
 *   student: { profile, attendance, grades },
 *   parent: { children, communications },
 *   complaints: { list, status, filters },
 *   notifications: { items, unreadCount },
 *   settings: { theme, preferences },
 *   chat: { messages, users, rooms }
 * }
 * 
 * @see https://redux-toolkit.js.org/
 * @see https://react-redux.js.org/
 * ============================================
 */

import { configureStore } from "@reduxjs/toolkit";

// ============================================
// CORE AUTHENTICATION
// ============================================
// Handles user login, registration, session management
// State: { user, token, isAuthenticated, isLoading, error }
import authReducer from "@/modules/auth/store/authSlice";

// ============================================
// ADMIN MODULE SLICES
// ============================================
// All admin-related state management
// - adminReducer: Main admin state (dashboard, users, settings)
// - adminEventReducer: Event management for admin
// - adminComplaintReducer: Complaint management for admin
// - adminNotificationReducer: Notification management for admin
// - academicsReducer: Academic structure management (classes, subjects)
import adminEventReducer from "@/modules/admin/store/adminEventSlice";
import adminComplaintReducer from "@/modules/admin/store/adminComplaintSlice";
import adminReducer from "@/modules/admin/store/adminSlice";
import academicsReducer from "@/modules/admin/store/academicsSlice";
import adminNotificationReducer from "@/modules/admin/store/adminNotificationSlice";

// ============================================
// ROLE-BASED MODULE SLICES
// ============================================
// Each role has its own state slice
// - studentReducer: Student dashboard, attendance, grades
// - parentReducer: Parent dashboard, children management
// - teacherReducer: Teacher dashboard, assignments, grades
import studentReducer from "@/modules/student/store/studentSlice";   
import parentReducer from "@/modules/parent/store/parentSlice";     
import teacherReducer from "@/modules/teacher/store/teacherSlice";

// ============================================
// COMMON FEATURE SLICES
// ============================================
// Features shared across all roles
// - complaintReducer: Submit and track complaints
// - notificationReducer: System notifications
// - settingsReducer: User preferences and app settings
import complaintReducer from "@/modules/common/store/complaintSlice";
import notificationReducer from "@/modules/common/store/notificationSlice";
import settingsReducer from "@/modules/common/store/settingSlice";

// ============================================
// CHAT MODULE SLICE
// ============================================
// Real-time messaging between users
// State: { messages, users, activeRooms, unreadCount }
import chatReducer from "@/modules/chat/store/chatSlice";

/*
======================================================
Redux Store Configuration
- Registers all feature reducers to create the global state tree.
- Provides a single source of truth for the entire application.
======================================================
*/

/**
 * Root Redux Store
 * 
 * Combines all feature reducers into a single store
 * Provides centralized state management for the entire app
 * 
 * Reducer Groups:
 * 1. Authentication - auth
 * 2. Admin Module - admin, adminEvent, adminComplaint, adminNotification, academics
 * 3. Role Modules - student, parent, teacher
 * 4. Common Features - complaints, notifications, settings
 * 5. Chat Module - chat
 * 
 * @returns {Object} Configured Redux store instance
 */
const store = configureStore({
  reducer: {
    // ----- Authentication -----
    // Manages user login state, token, and session
    auth: authReducer,
    
    // ----- Admin Module Reducers -----
    // All admin-related state grouped together
    adminComplaint: adminComplaintReducer,  // Admin complaint management
    admin: adminReducer,                    // Main admin state
    academics: academicsReducer,            // Academic structure
    adminEvent: adminEventReducer,          // Event management
    adminNotification: adminNotificationReducer, // Admin notifications
    
    // ----- Role-Based Module Reducers -----
    student: studentReducer,    // Student-specific state
    parent: parentReducer,      // Parent-specific state
    teacher: teacherReducer,    // Teacher-specific state
    
    // ----- Common Feature Reducers -----
    complaints: complaintReducer,       // Complaint system
    notifications: notificationReducer,  // Notification system
    settings: settingsReducer,          // User/app settings
    
    // ----- Chat Module Reducer -----
    chat: chatReducer,  // Real-time messaging
  },
});

export default store;






