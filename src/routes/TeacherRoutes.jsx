// src/routes/TeacherRoutes.jsx

/**
 * ============================================
 * TEACHER ROUTES - COMPLETE
 * ============================================
 */

import { Route } from "react-router-dom";
import RoleRoute from "./RolesRoutes.jsx";

// ─── Existing Teacher Pages ────────────────────────────────────────────
import TeacherDashboard from "@/modules/teacher/pages/TeacherDashboard.jsx";
import TeacherAttendance from "@/modules/teacher/pages/TeacherAttendance.jsx";
import TeacherAssignments from "@/modules/teacher/pages/TeacherAssignments.jsx";
import TeacherGrades from "@/modules/teacher/pages/TeacherGrades.jsx";
import TeacherTimetable from "@/modules/teacher/pages/TeacherTimetable.jsx";
import TeacherStudents from "@/modules/teacher/pages/TeacherStudents.jsx";
import TeacherExams from "@/modules/teacher/pages/TeacherExams.jsx";
import TeacherBehaviorLogs from "@/modules/teacher/pages/TeacherBehaviorLogs.jsx";
import TeacherPTM from "@/modules/teacher/pages/TeacherPTM.jsx";
import TeacherComplaints from "@/modules/teacher/pages/TeacherComplaints.jsx";
import TeacherMessages from "@/modules/teacher/pages/TeacherMessages.jsx";
import TeacherNotifications from "@/modules/teacher/pages/TeacherNotifications.jsx";
import TeacherEvents from "@/modules/teacher/pages/TeacherEvents.jsx";
import TeacherProfile from "@/modules/teacher/pages/TeacherProfile.jsx";
import TeacherSettings from "@/modules/teacher/pages/TeacherSettings.jsx";

// ─── New Teacher Pages ──────────────────────────────────────────────────
import TeacherSubmissions from "@/modules/teacher/pages/TeacherSubmissions.jsx";
import TeacherLeaves from "@/modules/teacher/pages/TeacherLeaves.jsx"; // ✅ Actual component
import TeacherPayroll from "@/modules/teacher/pages/TeacherPayroll.jsx";     
import TeacherPredictions from "@/modules/teacher/pages/TeacherPredictions.jsx"; 
import TeacherRecommendations from "@/modules/teacher/pages/TeacherRecommendations.jsx"; 

// ─── Placeholder Components for Missing Pages ──────────────────────────

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
      <p className="text-gray-500 mt-2">This page is under development</p>
    </div>
  </div>
);

// Placeholders for pages not yet created
// ✅ REMOVED: const TeacherLeaves = () => <PlaceholderPage title="Leave Management" />;
// const TeacherPayroll = () => <PlaceholderPage title="Payroll" />;
// const TeacherPredictions = () => <PlaceholderPage title="Predictions" />;
// const TeacherRecommendations = () => <PlaceholderPage title="Recommendations" />;

const TeacherRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["Teacher"]} />
    }
  >
    {/* ─── Dashboard ────────────────────────────────────────────────── */}
    <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

    {/* ─── Academic Management ────────────────────────────────────── */}
    <Route path="/teacher/attendance" element={<TeacherAttendance />} />
    <Route path="/teacher/assignments" element={<TeacherAssignments />} />
    <Route path="/teacher/marks-entry" element={<TeacherGrades />} />
    <Route path="/teacher/timetable" element={<TeacherTimetable />} />
    <Route path="/teacher/students" element={<TeacherStudents />} />
    <Route path="/teacher/exams" element={<TeacherExams />} />
    <Route path="/teacher/behavior-logs" element={<TeacherBehaviorLogs />} />
    <Route path="/teacher/ptm" element={<TeacherPTM />} />

    {/* ─── Submissions ────────────────────────────────────────────── */}
    <Route path="/teacher/submissions" element={<TeacherSubmissions />} />

    {/* ─── Communication ────────────────────────────────────────────── */}
    <Route path="/teacher/complaints" element={<TeacherComplaints />} />
    <Route path="/teacher/messages" element={<TeacherMessages />} />
    <Route path="/teacher/notifications" element={<TeacherNotifications />} />

    {/* ─── Events ────────────────────────────────────────────────────── */}
    <Route path="/teacher/events" element={<TeacherEvents />} />

    {/* ─── HR ────────────────────────────────────────────────────────── */}
    <Route path="/teacher/leaves" element={<TeacherLeaves />} />
    <Route path="/teacher/payroll" element={<TeacherPayroll />} />

    {/* ─── Analytics ────────────────────────────────────────────────── */}
    <Route path="/teacher/predictions" element={<TeacherPredictions />} />
    <Route path="/teacher/recommendations" element={<TeacherRecommendations />} />

    {/* ─── Profile & Settings ────────────────────────────────────── */}
    <Route path="/teacher/profile" element={<TeacherProfile />} />
    <Route path="/teacher/settings" element={<TeacherSettings />} />
  </Route>
);

export default TeacherRoutes;