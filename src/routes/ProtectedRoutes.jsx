/**
 * ============================================
 * PROTECTED ROUTE
 * ============================================
 * 
 * Route guard that checks authentication and approval status
 * 
 * Conditions:
 * 1. Loading → Show loading screen
 * 2. Not authenticated → Redirect to /login
 * 3. Pending approval → Redirect to /pending-approval
 * 4. Authenticated & Approved → Render child routes
 * ============================================
 */

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  // ─── Authentication State ──────────────────────────────────────────
  const { isAuthenticated, user, loading } = useSelector(
    (state) => state.auth
  );

  // ─── Loading ──────────────────────────────────────────────────────
  // Show loading while checking auth state
  if (loading) {
    return <div className="flex flex-col md:flex-row items-center justify-center h-screen px-4 sm:px-6 lg:px-8">Loading...</div>;
  }

  // ─── Not Authenticated ────────────────────────────────────────────
  // Redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ─── Pending Approval ─────────────────────────────────────────────
  // User registered but not yet approved by admin
  if (user?.status === 'Pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  // ─── Authenticated & Approved ─────────────────────────────────────
  // Render child routes
  return <Outlet />;
}

export default ProtectedRoute;