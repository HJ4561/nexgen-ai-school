/**
 * ============================================
 * DANGER ZONE COMPONENT
 * ============================================
 * 
 * Purpose: Displays sensitive account actions in a prominent warning section
 * Features:
 * - Danger-themed visual design with warning icon
 * - Logout functionality with localStorage cleanup
 * - Future feature placeholder for account deletion
 * - Role-based styling
 * - Responsive layout
 * - Warning color scheme (red/danger)
 * 
 * Dependencies:
 * - lucide-react for icons (LogOut, TriangleAlert)
 * - react-router-dom for navigation
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action buttons
 * 
 * Usage:
 * <DangerZone role="admin" />
 * ============================================
 */

import { LogOut, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

/**
 * ============================================
 * DANGER ZONE COMPONENT
 * ============================================
 * 
 * Renders a warning section for sensitive account actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Danger zone UI
 * 
 * @example
 * // Admin user
 * <DangerZone role="admin" />
 * 
 * // Student user
 * <DangerZone role="student" />
 * ============================================
 */
const DangerZone = ({ role }) => {
  const navigate = useNavigate();

  /**
   * ============================================
   * HANDLE LOGOUT
   * ============================================
   * 
   * Performs logout by:
   * 1. Removing authentication tokens from localStorage
   * 2. Removing user data from localStorage
   * 3. Redirecting to login page
   * 
   * @description
   * Future enhancement: Can be extended to dispatch Redux logout action
   * and make API call to invalidate tokens on server.
   */
  const handleLogout = () => {
    // Remove stored authentication
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // If using Redux auth slice later:
    // dispatch(logout());

    navigate("/login");
  };

  return (
    <Card tone={role}>
      {/* ─── Header Section ─── */}
      <div className="mb-6 flex items-center gap-3">
        {/* Warning icon container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
          <TriangleAlert
            size={24}
            className="text-danger"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-danger">
            Danger Zone
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Actions performed here may affect your account and
            cannot be easily undone.
          </p>
        </div>
      </div>

      {/* ─── Logout Section ─── */}
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-text-primary">
              Logout
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Sign out of your account on this device.
            </p>
          </div>

          <Button
            variant="danger"
            tone={role}
            leftIcon={<LogOut size={18} />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* ─── Delete Account (Future Feature) ─── */}
      <div className="mt-5 rounded-xl border border-border border-dashed p-5">
        <h3 className="font-semibold text-text-primary">
          Delete Account
        </h3>

        <p className="mt-1 text-sm text-text-secondary">
          This feature is not available yet. It will allow users
          to permanently delete their account after confirmation.
        </p>

        <Button
          className="mt-4"
          variant="outline"
          disabled
        >
          Delete Account (Coming Soon)
        </Button>
      </div>
    </Card>
  );
};

export default DangerZone;