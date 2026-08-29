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

// ✅ CORRECT: No .jsx extension for package imports
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "@/layouts/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoutes.jsx";
import AiWorkspacePage from "@/modules/chat/pages/AiWorkspacePage/AiWorkspacePage.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import AdminRoutesComponent from "./AdminRoutes.jsx";
import TeacherRoutes from "./TeacherRoutes.jsx";
import StudentRoutes from "./StudentRoutes.jsx";
import ParentRoutes from "./ParentRoutes.jsx";

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
          {AdminRoutesComponent}
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