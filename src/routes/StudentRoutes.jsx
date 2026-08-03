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
 * 
 * Dependencies:
 * - react-router-dom for routing
 * - RoleRoute for role-based protection
 * - Student module page components
 * 
 * Routes:
 * - /student/dashboard       → Student dashboard overview
 * - /student/attendance      → View personal attendance
 * - /student/assignments     → View and submit assignments
 * - /student/events          → View events and participations
 * - /student/fees            → View fees and payments
 * - /student/report-card     → View academic performance
 * - /student/timetable       → View class schedule
 * - /student/complaints      → Submit and track complaints
 * - /student/notifications   → View notifications
 * - /student/settings        → Student account settings
 * ============================================
 */


import { Route } from "react-router-dom";
import RoleRoute from "./RolesRoutes";

// ─── Student Pages ──────────────────────────────────────────────────────
import StudentDashboard from "@/modules/student/pages/StudentDashboard";
import Attendance from "@/modules/student/pages/Attendance";
import Assignments from "@/modules/student/pages/Assignments";
import Events from "@/modules/student/pages/Events";
import FeesPayments from "@/modules/student/pages/FeesPayments";
import ReportCard from "@/modules/student/pages/ReportCard";
import Timetable from "@/modules/student/pages/Timetable";
import StudentComplaint from "@/modules/student/pages/StudentComplaint";
import StudentNotification from "@/modules/student/pages/StudentNotification";
import StudentSettings from "@/modules/student/pages/StudentSettings";

const StudentRoutes = (
  <Route
    element={
      // Only users with 'Student' role can access these routes
      <RoleRoute allowedRoles={["Student"]} />
    }
  >
    {/* Dashboard */}
    <Route path="/student/dashboard" element={<StudentDashboard />} />
    
    {/* Academic */}
    <Route path="/student/attendance" element={<Attendance />} />
    <Route path="/student/assignments" element={<Assignments />} />
    <Route path="/student/report-card" element={<ReportCard />} />
    <Route path="/student/timetable" element={<Timetable />} />
    
    {/* Financial */}
    <Route path="/student/fees" element={<FeesPayments />} />
    
    {/* Communication */}
    <Route path="/student/complaints" element={<StudentComplaint />} />
    <Route path="/student/notifications" element={<StudentNotification />} />
    
    {/* Events & Settings */}
    <Route path="/student/events" element={<Events />} />
    <Route path="/student/settings" element={<StudentSettings />} />
  </Route>
);

export default StudentRoutes;