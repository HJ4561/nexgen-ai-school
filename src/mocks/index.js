/**
 * ============================================
 * MOCK DATA CENTRAL EXPORT
 * ============================================
 * 
 * Purpose: Central export point for all mock data
 * Provides a single import source for mock data across the application
 * 
 * Usage:
 * import { Adminmock, studentmock, parentMock } from '@/mocks';
 * 
 * Or with aliased imports:
 * import { mockUsers, MOCK_DASHBOARD_STATS } from '@/mocks/Adminmock';
 * ============================================
 */

// --- Auth Mock Data ----------------------------------------------------------
// User authentication and role management
export { default as authmock } from './authmock';

// --- Admin Mock Data ---------------------------------------------------------
// Admin dashboard, users, complaints, notifications, behavior logs, inventory
export { default as Adminmock } from './Adminmock';

// --- Admin Fee Desk Mock Data ----------------------------------------------
// Fee structures, fee records, class options, status options, scholarship options
export { default as adminFeeDesk } from './adminFeeDesk';

// --- Admin Events Mock Data ------------------------------------------------
// Events, event participants, certificates
export { default as adminevents } from './adminevents';

// --- Campaign Logs Mock Data -----------------------------------------------
// Social media campaigns, platform config, status config
export { default as campaignLogs } from './campaignLogs';

// --- Timetable Management Mock Data ----------------------------------------
// Class sections, rooms, teachers, subjects, timetable entries
export { default as Timetablemanagement } from './Timetablemanagement';

// --- Teacher Mock Data ------------------------------------------------------
// Teacher-specific data for assignments, attendance, etc.
export { default as Teachermock } from './Teachermock';

// --- Student Mock Data ------------------------------------------------------
// Student-specific data for grades, attendance, assignments, etc.
export { default as studentmock } from './studentMock';

// --- Parent Mock Data -------------------------------------------------------
// Parent-specific data for child management, attendance, grades, etc.
export { default as parentMock } from './parentMock';
