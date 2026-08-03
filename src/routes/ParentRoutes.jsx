/**
 * ============================================
 * PARENT ROUTES
 * ============================================
 * 
 * Role-based routes for Parent users
 * All routes are protected by RoleRoute guard
 * 
 * @see src/modules/parent/pages/ for page components
 * ============================================
 */

import { Route } from "react-router-dom";
import RoleRoute from "./RolesRoutes";

// ─── Parent Pages ──────────────────────────────────────────────────────
import ParentDashboard from "@/modules/parent/pages/ParentDashboard";
import Attendance from "@/modules/parent/pages/Attendance";
import Grades from "@/modules/parent/pages/Grades";
import ParentComplaint from "@/modules/parent/pages/ParentComplaint";
import ParentNotification from "@/modules/parent/pages/ParentNotification";
import ParentSettings from "@/modules/parent/pages/ParentSettings";
import BehaviorLogs from "@/modules/parent/pages/BehaviorLogs";
import Events from "@/modules/parent/pages/Events";
import FeesPayments from "@/modules/parent/pages/FeesPayments";

const ParentRoutes = (
  <Route
    element={
      // Only users with 'Parent' role can access these routes
      <RoleRoute allowedRoles={["Parent"]} />
    }
  >
    {/* Dashboard */}
    <Route path="/parent/dashboard" element={<ParentDashboard />} />
    
    {/* Child Management */}
    <Route path="/parent/attendance" element={<Attendance />} />
    <Route path="/parent/grades" element={<Grades />} />
    <Route path="/parent/behavior-logs" element={<BehaviorLogs />} />
    
    {/* Communication */}
    <Route path="/parent/complaints" element={<ParentComplaint />} />
    <Route path="/parent/notifications" element={<ParentNotification />} />
    
    {/* Financial */}
    <Route path="/parent/fees" element={<FeesPayments />} />
    
    {/* Events & Settings */}
    <Route path="/parent/events" element={<Events />} />
    <Route path="/parent/settings" element={<ParentSettings />} />
  </Route>
);

export default ParentRoutes;