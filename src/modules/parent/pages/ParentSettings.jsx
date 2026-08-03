/**
 * ============================================
 * PARENT SETTINGS COMPONENT
 * ============================================
 * 
 * Purpose: Parent settings page wrapper
 * Used by: Parent module routes
 * 
 * Features:
 * - Wraps the common Settings component
 * - Passes parent role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Settings
 * 
 * Usage:
 * <Route path="/parent/settings" element={<ParentSettings />} />
 * ============================================
 */

import Settings from "@/modules/common/pages/Settings";

const ParentSettings = () => {
  return <Settings role="parent" />;
};

export default ParentSettings;