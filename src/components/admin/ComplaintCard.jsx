/**
 * ============================================
 * COMPLAINT CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a single complaint in a card format
 * Features:
 * - Role-based styling (admin, teacher, student, parent)
 * - Complaint type as title with icon
 * - Status badge with color coding
 * - Description with line clamping
 * - Creation date display
 * - View details action button
 * - Hover effects with smooth transitions
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays, ArrowRight, FileText)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action button
 * - @/components/composite/StatusBadge for status indicator
 * 
 * Usage:
 * <ComplaintCard
 *   complaint={complaintObject}
 *   role="admin"
 *   onView={(complaint) => openDetails(complaint)}
 * />
 * ============================================
 */

import {
  CalendarDays,
  ArrowRight,
  FileText,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/composite/StatusBadge";

/**
 * ============================================
 * COMPLAINT CARD COMPONENT
 * ============================================
 * 
 * Renders a complaint item in a card layout with role-based styling
 * 
 * @param {Object} props - Component props
 * @param {Object} props.complaint - Complaint object containing complaint data
 * @param {string} props.complaint.complaint_type - Type/category of the complaint
 * @param {string} props.complaint.description - Complaint description text
 * @param {string} props.complaint.status - Current status ('pending', 'in-progress', 'resolved', 'rejected')
 * @param {string} props.complaint.created_at - Creation date of the complaint
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @param {Function} props.onView - Callback function when "View Details" is clicked
 * @returns {JSX.Element} Complaint card UI
 * 
 * @example
 * const complaint = {
 *   id: 1,
 *   complaint_type: 'Behavior Issue',
 *   description: 'Student was disruptive during class...',
 *   status: 'pending',
 *   created_at: '2024-01-15T10:30:00Z'
 * };
 * 
 * <ComplaintCard
 *   complaint={complaint}
 *   role="admin"
 *   onView={(c) => console.log('Viewing:', c)}
 * />
 * ============================================
 */
const ComplaintCard = ({
  complaint,
  role,
  onView,
}) => {
  /**
   * ============================================
   * COMPLAINT DATA DESTRUCTURING
   * ============================================
   * 
   * Extracts relevant fields from the complaint object
   */
  const {
    complaint_type,
    description,
    status,
    created_at,
  } = complaint;

  return (
    <Card
      tone={role}
      hover={false}
      className="
        border
        transition-all
        duration-200
        hover:border-student-primary/30
        hover:shadow-md
      "
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* =====================================
            LEFT SECTION
            Complaint details with icon
        ===================================== */}

        <div className="flex flex-1 gap-4">
          {/* ─── Complaint Type Icon ─── */}
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-student-primary/10
            "
          >
            <FileText
              size={22}
              className="text-student-primary"
            />
          </div>

          {/* ─── Complaint Details ─── */}
          <div className="flex-1">
            {/* Header: Type + Status Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-text-primary">
                {complaint_type}
              </h3>

              <StatusBadge status={status} />
            </div>

            {/* Description with line clamping */}
            <p className="mt-3 line-clamp-2 text-sm text-text-secondary">
              {description}
            </p>

            {/* Creation date */}
            <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
              <CalendarDays size={16} />
              <span>
                {new Date(created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* =====================================
            RIGHT SECTION
            View Details action button
        ===================================== */}

        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            tone={role}
            rightIcon={<ArrowRight size={16} />}
            onClick={() => onView(complaint)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ComplaintCard;
