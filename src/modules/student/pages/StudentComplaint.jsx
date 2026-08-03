/**
 * ============================================
 * STUDENT COMPLAINT COMPONENT
 * ============================================
 * 
 * Purpose: Student complaint page wrapper
 * Used by: Student module routes
 * 
 * Features:
 * - Wraps the common Complaint component
 * - Passes student role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Complaint
 * 
 * Usage:
 * <Route path="/student/complaints" element={<StudentComplaint />} />
 * ============================================
 */

import Complaint from "@/modules/common/pages/Complaint";

const StudentComplaint = () => {
  return <Complaint role="student" />;
};

export default StudentComplaint;