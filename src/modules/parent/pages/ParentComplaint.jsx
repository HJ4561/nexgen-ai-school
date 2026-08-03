/**
 * ============================================
 * PARENT COMPLAINT COMPONENT
 * ============================================
 * 
 * Purpose: Parent complaint page wrapper
 * Used by: Parent module routes
 * 
 * Features:
 * - Wraps the common Complaint component
 * - Passes parent role for theming
 * 
 * Dependencies:
 * - @/modules/common/pages/Complaint
 * 
 * Usage:
 * <Route path="/parent/complaints" element={<ParentComplaint />} />
 * ============================================
 */

import Complaint from "@/modules/common/pages/Complaint";

const ParentComplaint = () => {
  return <Complaint role="parent" />;
};

export default ParentComplaint;