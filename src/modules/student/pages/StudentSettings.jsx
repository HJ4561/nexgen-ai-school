/**
 * ============================================
 * STUDENT SETTINGS COMPONENT
 * ============================================
 * 
 * Purpose: Student settings page wrapper
 * Used by: Student module routes
 * 
 * Features:
 * - Wraps the common Settings component
 * - Passes student role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Settings
 * 
 * Usage:
 * <Route path="/student/settings" element={<StudentSettings />} />
 * ============================================
 */

import Settings from "@/modules/common/pages/Settings";

const StudentSettings = () => {
  return <Settings role="student" />;
};

export default StudentSettings;