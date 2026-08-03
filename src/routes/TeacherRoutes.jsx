/**
 * ============================================
 * TEACHER ROUTES
 * ============================================
 * 
 * Purpose: Teacher module route definitions
 * Used by: Main App Router
 * 
 * Features:
 * - Role-based access control (Teacher only)
 * - Nested routes under teacher dashboard
 * - All teacher-facing pages and features
 * 
 * Dependencies:
 * - react-router-dom for routing
 * - RoleRoute for role-based protection
 * - Teacher module page components
 * 
 * Routes:
 * - /teacher/dashboard        → Teacher dashboard overview
 * - /teacher/attendance       → Mark and view attendance
 * - /teacher/assignments      → Create and manage assignments
 * - /teacher/marks-entry      → Enter and manage grades
 * - /teacher/timetable        → View and manage timetable
 * - /teacher/complaints       → View and manage complaints
 * - /teacher/notifications    → View notifications
 * - /teacher/settings         → Teacher account settings
 * - /teacher/events           → View and manage events
 * ============================================
 */

import { Route } from "react-router-dom";

// ─── Role-Based Route Guard ──────────────────────────────────────────
import RoleRoute from "./RolesRoutes";

// ─── Teacher Pages ────────────────────────────────────────────────────
import TeacherDashboard from "@/modules/teacher/pages/TeacherDashboard";
import AttendanceRegister from "@/modules/teacher/pages/AttendanceRegister";
import AssignmentManagement from "@/modules/teacher/pages/AssignmentManagement";
import GradeManagement from "@/modules/teacher/pages/GradeManagement";
import TimetableManagement from "@/modules/teacher/pages/Timetable";
import TeacherComplaint from "@/modules/teacher/pages/TeacherComplaints";
import TeacherNotification from "@/modules/teacher/pages/TeacherNotification";
import TeacherSettings from "@/modules/teacher/pages/TeacherSettings";
import TeacherEvents from "@/modules/teacher/pages/Events";

const TeacherRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["Teacher"]} />
    }
  >
    {/* Dashboard */}
    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

    {/* Academic Management */}
    <Route path="/teacher/attendance" element={<AttendanceRegister />} />
    <Route path="/teacher/assignments" element={<AssignmentManagement />} />
    <Route path="/teacher/marks-entry" element={<GradeManagement />} />
    <Route path="/teacher/timetable" element={<TimetableManagement />} />

    {/* Communication */}
    <Route path="/teacher/complaints" element={<TeacherComplaint />} />
    <Route path="/teacher/notifications" element={<TeacherNotification />} />

    {/* Events & Settings */}
    <Route path="/teacher/events" element={<TeacherEvents />} />
    <Route path="/teacher/settings" element={<TeacherSettings />} />
  </Route>
);

export default TeacherRoutes;