/**
 * ============================================
 * PARENT ROUTES - UPDATED WITH COMBINED PAGES
 * ============================================
 */

import { Route } from "react-router-dom";
import RoleRoute from "./RolesRoutes.jsx";

// ─── Parent Pages ──────────────────────────────────────────────────────
// Core Pages
import ParentDashboard from "@/modules/parent/pages/ParentDashboard.jsx";
import Attendance from "@/modules/parent/pages/Attendance.jsx";
import Grades from "@/modules/parent/pages/Grades.jsx";
import BehaviorLogs from "@/modules/parent/pages/BehaviorLogs.jsx";
import ParentComplaint from "@/modules/parent/pages/ParentComplaint.jsx";
import ParentNotification from "@/modules/parent/pages/ParentNotification.jsx";
import FeesPayments from "@/modules/parent/pages/FeesPayments.jsx";
import Events from "@/modules/parent/pages/Events.jsx";
import ParentSettings from "@/modules/parent/pages/ParentSettings.jsx";

// Combined Pages (New)
import ParentStudentDetails from "@/modules/parent/pages/ParentStudentDetails.jsx";
import ParentSecurity from "@/modules/parent/pages/ParentSecurity.jsx";
import ParentFinance from "@/modules/parent/pages/ParentFinance.jsx";
import ParentAnalytics from "@/modules/parent/pages/ParentAnalytics.jsx";

// Optional Pages
import ParentProfile from "@/modules/parent/pages/ParentProfile.jsx";
import ParentMessages from "@/modules/parent/pages/ParentMessages.jsx";
import ParentCalendar from "@/modules/parent/pages/ParentCalendar.jsx";
import ParentTransport from "@/modules/parent/pages/ParentTransport.jsx";
import ParentLibrary from "@/modules/parent/pages/ParentLibrary.jsx";
import ParentCanteen from "@/modules/parent/pages/ParentCanteen.jsx";
import ParentPTM from "@/modules/parent/pages/ParentPTM.jsx";
import ParentCertificates from "@/modules/parent/pages/ParentCertificates.jsx";
import ParentSubmissions from "@/modules/parent/pages/ParentSubmissions.jsx";
import ParentChat from "@/modules/parent/pages/ParentChat.jsx";

const ParentRoutes = (
  <Route
    element={
      <RoleRoute allowedRoles={["Parent"]} />
    }
  >
    {/* ─── Dashboard ────────────────────────────────────────────────── */}
    <Route path="/parent/dashboard" element={<ParentDashboard />} />

    {/* ─── Child Management ────────────────────────────────────────── */}
    <Route path="/parent/attendance" element={<Attendance />} />
    <Route path="/parent/grades" element={<Grades />} />
    <Route path="/parent/behavior-logs" element={<BehaviorLogs />} />
    <Route path="/parent/student-details" element={<ParentStudentDetails />} />

    {/* ─── Communication ────────────────────────────────────────────── */}
    <Route path="/parent/complaints" element={<ParentComplaint />} />
    <Route path="/parent/notifications" element={<ParentNotification />} />
    <Route path="/parent/messages" element={<ParentMessages />} />

    {/* ─── Financial ────────────────────────────────────────────────── */}
    <Route path="/parent/fees" element={<FeesPayments />} />
    <Route path="/parent/finance" element={<ParentFinance />} />

    {/* ─── Security ────────────────────────────────────────────────── */}
    <Route path="/parent/security" element={<ParentSecurity />} />

    {/* ─── Analytics ────────────────────────────────────────────────── */}
    <Route path="/parent/analytics" element={<ParentAnalytics />} />

    {/* ─── Events ────────────────────────────────────────────────────── */}
    <Route path="/parent/events" element={<Events />} />
    <Route path="/parent/calendar" element={<ParentCalendar />} />

    {/* ─── Transport ────────────────────────────────────────────────── */}
    <Route path="/parent/transport" element={<ParentTransport />} />

    {/* ─── Library ──────────────────────────────────────────────────── */}
    <Route path="/parent/library" element={<ParentLibrary />} />

    {/* ─── Canteen ────────────────────────────────────────────────── */}
    <Route path="/parent/canteen" element={<ParentCanteen />} />

    {/* ─── PTM ────────────────────────────────────────────────────── */}
    <Route path="/parent/ptm" element={<ParentPTM />} />

    {/* ─── Certificates ────────────────────────────────────────────── */}
    <Route path="/parent/certificates" element={<ParentCertificates />} />

    {/* ─── Submissions ────────────────────────────────────────────── */}
    <Route path="/parent/submissions" element={<ParentSubmissions />} />

    {/* ─── Chat ────────────────────────────────────────────────────── */}
    <Route path="/parent/chat" element={<ParentChat />} />

    {/* ─── Profile & Settings ────────────────────────────────────── */}
    <Route path="/parent/profile" element={<ParentProfile />} />
    <Route path="/parent/settings" element={<ParentSettings />} />
  </Route>
);

export default ParentRoutes;