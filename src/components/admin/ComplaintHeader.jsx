/**
 * ============================================
 * COMPLAINT HEADER COMPONENT
 * ============================================
 * 
 * Purpose: Page header component for Complaint Management
 * Features:
 * - Role-based color theming (admin, teacher, student, parent)
 * - Icon with dynamic role-based styling
 * - Page title and description
 * - Accent left border via Card component
 * - Responsive layout (flex column on mobile, row on desktop)
 * 
 * Dependencies:
 * - lucide-react for icons (MessageSquareWarning)
 * - @/components/ui/Card for container with accent
 * 
 * Usage:
 * <ComplaintHeader role="admin" />
 * ============================================
 */

import { MessageSquareWarning } from "lucide-react";

import Card from "@/components/ui/Card";

/**
 * ============================================
 * COMPLAINT HEADER COMPONENT
 * ============================================
 * 
 * Renders a styled page header for complaint management
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Complaint header UI
 * 
 * @example
 * // Admin view
 * <ComplaintHeader role="admin" />
 * 
 * // Student view
 * <ComplaintHeader role="student" />
 * ============================================
 */
const ComplaintHeader = ({ role }) => {
  /**
   * ============================================
   * ROLE-BASED COLOR MAPPING
   * ============================================
   * 
   * Determines color scheme based on user role
   * - admin: Admin primary color
   * - teacher: Teacher primary color
   * - student: Student primary color
   * - parent: Parent primary color
   * - default: Brand primary color
   * 
   * @constant {string} primaryColor - Primary text/icon color
   * @constant {string} lightColor - Light background color
   */
  const primaryColor = `var(--color-${role?.toLowerCase() || 'brand'}-primary)`;
  const lightColor = `var(--color-${role?.toLowerCase() || 'brand'}-light)`;

  return (
    <Card tone={role} accentLeft hover={false}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* =====================================
            LEFT SECTION
            Icon + Title + Description
        ===================================== */}

        <div className="flex items-start gap-4">
          {/* ─── Role-Based Icon ─── */}
          <div 
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ background: lightColor }}
          >
            <MessageSquareWarning
              size={28}
              style={{ color: primaryColor }}
            />
          </div>

          {/* ─── Title and Description ─── */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Complaint Management
            </h1>

            <p className="mt-2 max-w-2xl text-text-secondary">
              Submit complaints, monitor their progress,
              and keep track of resolutions in one place.
            </p>
          </div>
        </div>

        {/* =====================================
            RIGHT SECTION
            (Reserved for future actions/buttons)
        ===================================== */}
      </div>
    </Card>
  );
};

export default ComplaintHeader;