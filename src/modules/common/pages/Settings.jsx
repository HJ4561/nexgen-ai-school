/**
 * ============================================
 * SETTINGS COMPONENT
 * ============================================
 * 
 * Purpose: Shared settings management page for all roles
 * Used by: Admin, Teacher, Student, Parent modules
 * 
 * Features:
 * - Role-based theming (admin, teacher, student, parent)
 * - Settings header with role-specific styling
 * - Profile information form with edit functionality
 * - Change password form with validation
 * - Danger zone for account actions (logout, delete)
 * - Data fetching on mount
 * - Responsive grid layout (1 column mobile, 2 columns desktop)
 * - Shared across all user roles
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/modules/common/store/settingThunks for data fetching
 * - Various settings components
 * 
 * Usage:
 * <Settings role="admin" />
 * <Settings role="teacher" />
 * <Settings role="student" />
 * <Settings role="parent" />
 * ============================================
 */

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchProfile } from "@/modules/common/store/settingThunks";

import SettingsHeader from "@/components/admin/SettingsHeader";
import ProfileForm from "@/components/admin/ProfileForm";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import DangerZone from "@/components/admin/DangerZone";

/**
 * ============================================
 * SETTINGS COMPONENT
 * ============================================
 * 
 * Renders the settings management page for any role
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for theming ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Settings management page
 * 
 * @example
 * // Admin settings
 * <Settings role="admin" />
 * 
 * // Teacher settings
 * <Settings role="teacher" />
 * 
 * // Student settings
 * <Settings role="student" />
 * 
 * // Parent settings
 * <Settings role="parent" />
 * ============================================
 */
const Settings = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * FETCH PROFILE ON MOUNT
   * ============================================
   * 
   * Dispatches action to fetch user profile for the current role
   * Re-fetches when role changes
   */
  useEffect(() => {
    dispatch(fetchProfile(role));
  }, [dispatch, role]);

  return (
    <div className="mx-auto max-w-full space-y-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      {/* Displays page title, description, and role-based styling */}
      <SettingsHeader role={role} />

      {/* ─── Profile Information ──────────────────────────────────────── */}
      {/* Profile form with editable fields (name, phone, email) */}
      <ProfileForm role={role} />

      {/* ─── Security & Danger Zone ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* ─── Change Password Form ──────────────────────────────────── */}
        {/* Form for changing user password with validation */}
        <ChangePasswordForm role={role} />

        {/* ─── Danger Zone ───────────────────────────────────────────── */}
        {/* Account actions: logout, delete account (coming soon) */}
        <DangerZone role={role} />
      </div>
    </div>
  );
};

export default Settings;