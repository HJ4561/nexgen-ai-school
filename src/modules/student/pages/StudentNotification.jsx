/**
 * ============================================
 * STUDENT NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Student notification page wrapper
 * Used by: Student module routes
 * 
 * Features:
 * - Wraps the common Notification component
 * - Passes student role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Notification
 * 
 * Usage:
 * <Route path="/student/notifications" element={<StudentNotification />} />
 * ============================================
 */

import Notification from "@/modules/common/pages/Notification";

const StudentNotification = () => {
  return <Notification role="student" />;
};

export default StudentNotification;