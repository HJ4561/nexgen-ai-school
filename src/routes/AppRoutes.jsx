/**
 * ============================================
 * APP ROUTES
 * ============================================
 * 
 * Purpose: Main application routing configuration
 * Used by: App component
 * 
 * Features:
 * - Public routes (login, register, forgot password)
 * - Protected routes (requires authentication)
 * - Role-based routes (admin, teacher, student, parent)
 * - Dashboard layout wrapper
 * - AI workspace route
 * - Catch-all redirect to login
 * 
 * Route Structure:
 * ┌─────────────────────────────────────────────────────┐
 * │ PublicRoutes (login, register, forgot-password)   │
 * ├─────────────────────────────────────────────────────┤
 * │ ProtectedRoute (requires auth)                    │
 * │   └── DashboardLayout                            │
 * │         ├── AdminRoutes                          │
 * │         ├── TeacherRoutes                       │
 * │         ├── StudentRoutes                       │
 * │         ├── ParentRoutes                        │
 * │         └── /ai-workspace                       │
 * ├─────────────────────────────────────────────────────┤
 * │ * → redirect to /login                           │
 * └─────────────────────────────────────────────────────┘
 * 
 * Dependencies:
 * - React Router for routing
 * - DashboardLayout for authenticated pages
 * - ProtectedRoute for authentication guard
 * - Role-based route configurations
 * ============================================
 */

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoutes";
import AiWorkspacePage from "@/modules/chat/pages/AiWorkspacePage/AiWorkspacePage";
import PublicRoutes from "./PublicRoutes";
import AdminRoutes from "./AdminRoutes";
import TeacherRoutes from "./TeacherRoutes";
import StudentRoutes from "./StudentRoutes";
import ParentRoutes from "./ParentRoutes";

/**
 * AppRoutes Component
 * 
 * Main routing configuration for the entire application
 * 
 * @returns {JSX.Element} Route configuration with all app routes
 * 
 * @example
 * // In App.jsx:
 * <BrowserRouter>
 *   <AppRoutes />
 * </BrowserRouter>
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes (login, register, forgot-password) */}
      {PublicRoutes}

      {/* Protected routes (requires authentication) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Role-based routes */}
          {AdminRoutes}
          {TeacherRoutes}
          {StudentRoutes}
          {ParentRoutes}
          
          {/* AI Workspace - accessible to all authenticated users */}
          <Route path="/ai-workspace" element={<AiWorkspacePage />} />
        </Route>
      </Route>

      {/* Catch-all redirect to login */}
      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;










