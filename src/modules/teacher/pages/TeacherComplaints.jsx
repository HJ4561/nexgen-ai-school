/**
 * ============================================
 * TEACHER COMPLAINT COMPONENT
 * ============================================
 * 
 * Purpose: Teacher complaint page wrapper
 * Used by: Teacher module routes
 * 
 * Features:
 * - Wraps the common Complaint component
 * - Forces light mode for the complaint page
 * - Passes teacher role for theming
 * - Inherits all complaint functionality from common Complaint component
 * 
 * Dependencies:
 * - @/modules/common/pages/Complaint for complaint UI
 * - @/hooks for useForceLightMode hook
 * 
 * Usage:
 * <Route path="/teacher/complaints" element={<TeacherComplaint />} />
 * ============================================
 */

import Complaint from "@/modules/common/pages/Complaint";
import { useForceLightMode } from "@/hooks";

/**
 * ============================================
 * TEACHER COMPLAINT COMPONENT
 * ============================================
 * 
 * Renders the complaint page with teacher role theming
 * Forces light mode to ensure complaint form is readable
 * 
 * @returns {JSX.Element} Teacher complaint page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/complaints" element={<TeacherComplaint />} />
 * ============================================
 */
const TeacherComplaint = () => {
  // ─── Force light mode for complaint page ─────────────────────────────
  // Ensures complaint form is always readable regardless of user preference
  useForceLightMode();

  // ─── Render common complaint with teacher role ───────────────────────
  return <Complaint role="teacher" />;
};

export default TeacherComplaint;