/**
 * ============================================
 * TEACHER NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Teacher notification page wrapper
 * Used by: Teacher module routes
 * 
 * Features:
 * - Wraps the common Notification component
 * - Forces light mode for the notification page
 * - Passes teacher role for theming
 * - Inherits all notification functionality from common Notification component
 * 
 * Dependencies:
 * - @/modules/common/pages/Notification for notification UI
 * - @/hooks for useForceLightMode hook
 * 
 * Usage:
 * <Route path="/teacher/notifications" element={<TeacherNotification />} />
 * ============================================
 */

import Notification from "@/modules/common/pages/Notification";
import { useForceLightMode } from "@/hooks";

/**
 * ============================================
 * TEACHER NOTIFICATION COMPONENT
 * ============================================
 * 
 * Renders the notification page with teacher role theming
 * Forces light mode to ensure notifications are readable
 * 
 * @returns {JSX.Element} Teacher notification page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/notifications" element={<TeacherNotification />} />
 * ============================================
 */
const TeacherNotification = () => {
  // ─── Force light mode for notification page ──────────────────────────
  // Ensures notifications are always readable regardless of user preference
  useForceLightMode();

  // ─── Render common notification with teacher role ────────────────────
  return <Notification role="teacher" />;
};

export default TeacherNotification;