/**
 * ============================================
 * PARTICIPATION CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a single event participation in a card format
 * Features:
 * - Event name with position badge (1st, 2nd, 3rd)
 * - Student name and role
 * - Event date display
 * - Certificate earned status with color coding
 * - Color-coded position badges
 * - View Details action button
 * - Role-based theming (parent)
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays, User, Trophy, Award, Eye, Medal)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action button
 * 
 * Usage:
 * <ParticipationCard
 *   participation={participationData}
 *   certificates={certificatesList}
 *   onView={handleView}
 * />
 * ============================================
 */

import {
  CalendarDays,
  User,
  Trophy,
  Award,
  Eye,
  Medal,
} from "lucide-react";

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * ============================================
 * POSITION COLOR MAPPING
 * ============================================
 * 
 * Maps position to badge color classes
 * - 1st: Yellow (Gold)
 * - 2nd: Slate (Silver)
 * - 3rd: Orange (Bronze)
 * 
 * @constant {Object} positionColor
 */
const positionColor = {
  "1st": "bg-yellow-100 text-yellow-700",
  "2nd": "bg-slate-100 text-slate-700",
  "3rd": "bg-orange-100 text-orange-700",
};

/**
 * ============================================
 * PARTICIPATION CARD COMPONENT
 * ============================================
 * 
 * Renders an event participation in a card format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.participation - Participation object
 * @param {string} props.participation.event_name - Name of the event
 * @param {string} props.participation.position - Position achieved (1st, 2nd, 3rd)
 * @param {string} props.participation.student_name - Name of the student
 * @param {string} props.participation.event_date - Date of the event
 * @param {string} props.participation.role - Role in the event
 * @param {Array} props.certificates - List of certificates for certificate check
 * @param {Function} props.onView - Callback when View Details is clicked
 * @returns {JSX.Element} Participation card UI
 * 
 * @example
 * const participation = {
 *   event_name: 'Science Fair',
 *   position: '1st',
 *   student_name: 'John Doe',
 *   event_date: '2024-01-15',
 *   role: 'Team Leader'
 * };
 * 
 * <ParticipationCard
 *   participation={participation}
 *   certificates={certificates}
 *   onView={(p) => openDetailsModal(p)}
 * />
 * ============================================
 */
const ParticipationCard = ({
  participation,
  certificates,
  onView,
}) => {
  /**
   * ============================================
   * CERTIFICATE CHECK
   * ============================================
   * 
   * Checks if the student has a certificate for this event
   * Looks for matching student_name in certificates list
   */
  const hasCertificate = certificates.some(
    (certificate) => certificate.student_name === participation.student_name
  );

  return (
    <Card hover={false}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* ============================================
            LEFT SECTION
            Icon, event details, and metadata
            ============================================ */}

        <div className="flex flex-1 gap-4">
          {/* ─── Trophy Icon ─── */}
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-parent-light">
            <Trophy size={26} className="text-parent-primary" />
          </div>

          {/* ─── Event Details ─── */}
          <div className="flex-1">
            {/* Header: Event Name + Position Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-text-primary">
                {participation.event_name}
              </h3>

              {participation.position && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    positionColor[participation.position] ||
                    "bg-parent-light text-parent-primary"
                  }`}
                >
                  {participation.position}
                </span>
              )}
            </div>

            {/* ─── Metadata Grid ─── */}
            <div className="mt-4 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
              {/* Student Name */}
              <div className="flex items-center gap-2">
                <User size={16} className="text-parent-primary" />
                {participation.student_name}
              </div>

              {/* Event Date */}
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-parent-primary" />
                {new Date(participation.event_date).toLocaleDateString()}
              </div>

              {/* Role */}
              <div className="flex items-center gap-2">
                <Medal size={16} className="text-parent-primary" />
                Role:
                <span className="font-medium text-text-primary">
                  {participation.role}
                </span>
              </div>

              {/* Certificate Status */}
              <div className="flex items-center gap-2">
                <Award
                  size={16}
                  className={hasCertificate ? "text-green-600" : "text-slate-400"}
                />
                <span className={hasCertificate ? "font-medium text-green-600" : ""}>
                  {hasCertificate ? "Certificate Earned" : "No Certificate"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            RIGHT SECTION
            Action button
            ============================================ */}

        <div className="flex items-center">
          <Button
            tone="parent"
            size="sm"
            leftIcon={<Eye size={16} />}
            onClick={() => onView(participation)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ParticipationCard;