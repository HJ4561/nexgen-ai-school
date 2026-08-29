/**
 * ============================================
 * STUDENT PAGES EXPORT
 * ============================================
 * 
 * Purpose: Export all student pages for routes
 * Used by: Student module routes configuration
 * 
 * All pages are exported as named exports and defaults
 * for flexibility in route configuration.
 * ============================================
 */

// --- Core Pages ------------------------------------------------------
export { default as StudentDashboard } from './Dashboard';
export { default as Profile } from './Profile';

// --- Academic Pages --------------------------------------------------
export { default as Attendance } from './Attendance';
export { default as ReportCard } from './ReportCard';
export { default as Timetable } from './Timetable';
export { default as Assignments } from './Assignments';
export { default as Submissions } from './Submissions';
export { default as Exams } from './Exams';

// --- Finance Pages ---------------------------------------------------
export { default as FeesPayments } from './FeesPayments';

// --- Extracurricular Pages ------------------------------------------
export { default as Events } from './Events';
export { default as Transport } from './Transport';
export { default as Library } from './Library';
export { default as Canteen } from './Canteen';

// --- Communication Pages --------------------------------------------
export { default as StudentNotification } from './StudentNotification';
export { default as StudentComplaint } from './StudentComplaint';

// --- Settings & Security ---------------------------------------------
export { default as StudentSettings } from './StudentSettings';
export { default as Security } from './Security';

// --- Documents & Analytics ------------------------------------------
export { default as Documents } from './Documents';
export { default as Analytics } from './Analytics';

// --- AI Chat ---------------------------------------------------------
export { default as Chat } from './Chat';

// --- Default Export for Convenience ---------------------------------
// This allows importing all pages at once: import * as StudentPages from './pages'
const StudentPages = {
  StudentDashboard: StudentDashboard,
  Profile: Profile,
  Attendance: Attendance,
  ReportCard: ReportCard,
  Timetable: Timetable,
  Assignments: Assignments,
  Submissions: Submissions,
  Exams: Exams,
  FeesPayments: FeesPayments,
  Events: Events,
  Transport: Transport,
  Library: Library,
  Canteen: Canteen,
  StudentNotification: StudentNotification,
  StudentComplaint: StudentComplaint,
  StudentSettings: StudentSettings,
  Security: Security,
  Documents: Documents,
  Analytics: Analytics,
  Chat: Chat,
};

export default StudentPages;