/**
 * ============================================
 * PARENT NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Parent notification page wrapper
 * Used by: Parent module routes
 * 
 * Features:
 * - Wraps the common Notification component
 * - Passes parent role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Notification
 * 
 * Usage:
 * <Route path="/parent/notifications" element={<ParentNotification />} />
 * ============================================
 */

import Notification from "@/modules/common/pages/Notification";

const ParentNotification = () => {
  return <Notification role="parent" />;
};

export default ParentNotification;