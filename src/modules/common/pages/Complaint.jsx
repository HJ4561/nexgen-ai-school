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
 * ============================================
 */

import React, { useEffect } from "react";
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
    <div className="mx-auto w-full max-w-full space-y-4 sm:space-y-5 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      {/* Displays page title, description, and role-based styling */}
      <ComplaintHeader role={role} />

      {/* ─── Stats ────────────────────────────────────────────────────── */}
      {/* Shows complaint statistics (total, pending, resolved, open) */}
      <ComplaintStats role={role} />

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:grid xl:grid-cols-12 gap-4 sm:gap-5">
        {/* ─── Left Column (4/12 on desktop, full width on mobile) ─── */}
        {/* Complaint form for submitting new complaints */}
        <div className="xl:col-span-4 order-2 xl:order-1">
          <ComplaintForm role={role} />
        </div>

        {/* ─── Right Column (8/12 on desktop, full width on mobile) ── */}
        {/* Complaint list with filtering, sorting, and details modal */}
        <div className="xl:col-span-8 order-1 xl:order-2">
          <ComplaintList role={role} />
        </div>
      </div>
    </div>
  );
};

export default Complaint;