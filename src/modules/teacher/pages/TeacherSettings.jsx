/**
 * ============================================
 * TEACHER SETTINGS COMPONENT
 * ============================================
 * 
 * Purpose: Teacher settings page wrapper
 * Used by: Teacher module routes
 * 
 * Features:
 * - Wraps the common Settings component
 * - Forces light mode for the settings page
 * - Passes teacher role for theming
 * - Inherits all settings functionality from common Settings component
 * 
 * Dependencies:
 * - @/modules/common/pages/Settings for settings UI
 * - @/hooks for useForceLightMode hook
 * 
 * Usage:
 * <Route path="/teacher/settings" element={<TeacherSettings />} />
 * ============================================
 */

import Settings from "@/modules/common/pages/Settings";
import { useForceLightMode } from "@/hooks";

/**
 * ============================================
 * TEACHER SETTINGS COMPONENT
 * ============================================
 * 
 * Renders the settings page with teacher role theming
 * Forces light mode to ensure settings are readable
 * 
 * @returns {JSX.Element} Teacher settings page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/settings" element={<TeacherSettings />} />
 * ============================================
 */
const TeacherSettings = () => {
  // ─── Force light mode for settings page ──────────────────────────────
  // Ensures settings are always readable regardless of user preference
  useForceLightMode();

  // ─── Render common settings with teacher role ────────────────────────
  return <Settings role="teacher" />;
};

export default TeacherSettings;