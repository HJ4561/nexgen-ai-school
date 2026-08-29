// src/routes/RolesRoutes.jsx
// ? CORRECT: No .jsx for package imports
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleRoute({ allowedRoles }) {
  // Get user from Redux
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  // Also check localStorage directly as fallback
  const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
  const userRole = authData.role || user?.role_name || user?.role || localStorage.getItem("user_role");
  
  console.log("?? RoleRoute Debug:", {
    allowedRoles,
    userRole,
    isAuthenticated,
    hasAccess: !!authData.access,
    authData,
    user
  });

  // Check if user is authenticated
  const isLoggedIn = isAuthenticated || !!authData.access;
  
  if (!isLoggedIn) {
    console.log("? Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(
    (role) => role.toLowerCase() === userRole?.toLowerCase()
  );

  if (!hasAllowedRole) {
    console.log(`? Role "${userRole}" not allowed. Allowed:`, allowedRoles);
    return <Navigate to="/login" replace />;
  }

  console.log(`? Role "${userRole}" allowed, rendering outlet`);
  return <Outlet />;
}

export default RoleRoute;