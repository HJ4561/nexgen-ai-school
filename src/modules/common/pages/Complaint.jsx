/**
 * ============================================
 * COMPLAINT COMPONENT
 * ============================================
 * 
 * Purpose: Shared complaint management page for all roles
 * Used by: Admin, Teacher, Student, Parent modules
 * 
 * Features:
 * - Role-based theming (admin, teacher, student, parent)
 * - Complaint header with role-specific styling
 * - Complaint statistics overview
 * - Complaint form for submitting new complaints
 * - Complaint list with filtering and sorting
 * - Data fetching on mount
 * - Responsive grid layout (1 column mobile, 12 columns desktop)
 * - Shared across all user roles
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/modules/common/store/complaintThunks for data fetching
 * - Various complaint components
 * 
 * Usage:
 * <Complaint role="admin" />
 * <Complaint role="teacher" />
 * <Complaint role="student" />
 * <Complaint role="parent" />
 * ============================================
 */

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchComplaints } from "@/modules/common/store/complaintThunks";

import ComplaintHeader from "@/components/admin/ComplaintHeader";
import ComplaintStats from "@/components/admin/ComplaintStats";
import ComplaintForm from "@/components/admin/ComplaintForm";
import ComplaintList from "@/components/admin/ComplaintList";

/**
 * ============================================
 * COMPLAINT COMPONENT
 * ============================================
 * 
 * Renders the complaint management page for any role
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for theming ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Complaint management page
 * 
 * @example
 * // Admin complaint management
 * <Complaint role="admin" />
 * 
 * // Teacher complaint management
 * <Complaint role="teacher" />
 * 
 * // Student complaint management
 * <Complaint role="student" />
 * 
 * // Parent complaint management
 * <Complaint role="parent" />
 * ============================================
 */
const Complaint = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * FETCH COMPLAINTS ON MOUNT
   * ============================================
   * 
   * Dispatches action to fetch complaints for the current role
   * Re-fetches when role changes
   */
  useEffect(() => {
    dispatch(fetchComplaints(role));
  }, [dispatch, role]);

  return (
    <div className="mx-auto w-full max-w-full space-y-4 px-2">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      {/* Displays page title, description, and role-based styling */}
      <ComplaintHeader role={role} />

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      {/* Shows complaint statistics (total, pending, resolved, open) */}
      <ComplaintStats role={role} />

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* ─── Left Column (4/12) ─────────────────────────────────────── */}
        {/* Complaint form for submitting new complaints */}
        <div className="xl:col-span-4">
          <ComplaintForm role={role} />
        </div>

        {/* ─── Right Column (8/12) ────────────────────────────────────── */}
        {/* Complaint list with filtering, sorting, and details modal */}
        <div className="xl:col-span-8">
          <ComplaintList role={role} />
        </div>
      </div>
    </div>
  );
};

export default Complaint;