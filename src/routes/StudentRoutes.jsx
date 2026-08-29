// src/routes/StudentRoutes.jsx
/**
 * ============================================
 * STUDENT ROUTES
 * ============================================
 * 
 * Purpose: Student module route definitions
 * Used by: Main App Router
 * 
 * Features:
 * - Role-based access control (Student only)
 * - Nested routes under student dashboard
 * - All student-facing pages and features
 * - Routes array for better maintainability
 * 
 * Dependencies:
 * - react-router-dom for routing
 * - RoleRoute for role-based protection
 * - Student module page components
 * 
 * Routes:
 * - /student/dashboard       → Student dashboard overview
 * - /student/profile         → View and edit profile
 * - /student/attendance      → View personal attendance
 * - /student/assignments     → View and submit assignments
 * - /student/submissions     → View submission history
 * - /student/exams           → View exam results
 * - /student/events          → View events and participations
 * - /student/fees            → View fees and payments
 * - /student/report-card     → View academic performance
 * - /student/timetable       → View class schedule
 * - /student/transport       → View bus and transport info
 * - /student/library         → View book issues
 * - /student/canteen         → View menu and orders
 * - /student/complaints      → Submit and track complaints
 * - /student/notifications   → View notifications
 * - /student/settings        → Student account settings
 * - /student/security        → View behavior logs
 * - /student/documents       → View uploaded documents
 * - /student/analytics       → View predictions & recommendations
 * - /student/chat            → AI Chat Assistant
 * ============================================
 */

import { Route } from "react-router-dom";
import RoleRoute from "@/routes/RolesRoutes.jsx";

// ─── Student Pages ──────────────────────────────────────────────────────
import StudentDashboard from "@/modules/student/pages/StudentDashboard.jsx";
import Profile from "@/modules/student/pages/Profile.jsx";
import Attendance from "@/modules/student/pages/Attendance.jsx";
import Assignments from "@/modules/student/pages/Assignments.jsx";
import Submissions from "@/modules/student/pages/Submissions.jsx";
import Exams from "@/modules/student/pages/Exams.jsx";
import Events from "@/modules/student/pages/Events.jsx";
import FeesPayments from "@/modules/student/pages/FeesPayments.jsx";
import ReportCard from "@/modules/student/pages/ReportCard.jsx";
import Timetable from "@/modules/student/pages/Timetable.jsx";
import Transport from "@/modules/student/pages/Transport.jsx";
import Library from "@/modules/student/pages/Library.jsx";
import Canteen from "@/modules/student/pages/Canteen.jsx";
import StudentComplaint from "@/modules/student/pages/StudentComplaint.jsx";
import StudentNotification from "@/modules/student/pages/StudentNotification.jsx";
import StudentSettings from "@/modules/student/pages/StudentSettings.jsx";
// Import BehaviorLogs from Security.jsx (the component is exported as BehaviorLogs)
import BehaviorLogs from "@/modules/student/pages/Security.jsx";
import Documents from "@/modules/student/pages/Documents.jsx";
import Analytics from "@/modules/student/pages/Analytics.jsx";
import Chat from "@/modules/student/pages/Chat.jsx";

// ─── Routes Configuration ──────────────────────────────────────────────

/**
 * ============================================
 * STUDENT ROUTES CONFIGURATION
 * ============================================
 * 
 * Array of route objects for easier maintenance
 * Add new routes here and they'll be automatically included
 * 
 * @type {Array<{path: string, element: JSX.Element}>}
 */
const studentRouteConfig = [
  // ─── Dashboard ────────────────────────────────────────────────────
  { path: "/student/dashboard", element: <StudentDashboard /> },
  
  // ─── Profile ──────────────────────────────────────────────────────
  { path: "/student/profile", element: <Profile /> },
  
  // ─── Academic ─────────────────────────────────────────────────────
  { path: "/student/attendance", element: <Attendance /> },
  { path: "/student/assignments", element: <Assignments /> },
  { path: "/student/submissions", element: <Submissions /> },
  { path: "/student/exams", element: <Exams /> },
  { path: "/student/report-card", element: <ReportCard /> },
  { path: "/student/timetable", element: <Timetable /> },
  
  // ─── Financial ────────────────────────────────────────────────────
  { path: "/student/fees", element: <FeesPayments /> },
  
  // ─── Extracurricular ──────────────────────────────────────────────
  { path: "/student/events", element: <Events /> },
  { path: "/student/transport", element: <Transport /> },
  { path: "/student/library", element: <Library /> },
  { path: "/student/canteen", element: <Canteen /> },
  
  // ─── Communication ────────────────────────────────────────────────
  { path: "/student/complaints", element: <StudentComplaint /> },
  { path: "/student/notifications", element: <StudentNotification /> },
  
  // ─── Settings & Security ──────────────────────────────────────────
  { path: "/student/settings", element: <StudentSettings /> },
  // Keep the route as /student/security but render BehaviorLogs component
  { path: "/student/security", element: <BehaviorLogs /> },
  
  // ─── Documents & Analytics ────────────────────────────────────────
  { path: "/student/documents", element: <Documents /> },
  { path: "/student/analytics", element: <Analytics /> },
  
  // ─── AI Chat ──────────────────────────────────────────────────────
  { path: "/student/chat", element: <Chat /> },
];

/**
 * ============================================
 * STUDENT ROUTES
 * ============================================
 * 
 * Generates Route elements from the configuration array
 * All routes are wrapped with RoleRoute for protection
 * 
 * ⚠️ NOTE: Layout is handled by AppRoutes.jsx
 * DO NOT add DashboardLayout here - it will cause double sidebar!
 * 
 * @returns {JSX.Element} Student route configuration
 * ============================================
 */
const StudentRoutes = (
  <Route
    element={
      // Only users with 'Student' role can access these routes
      <RoleRoute allowedRoles={["Student"]} />
    }
  >
    {studentRouteConfig.map(({ path, element }) => (
      <Route key={path} path={path} element={element} />
    ))}
  </Route>
);

export default StudentRoutes;