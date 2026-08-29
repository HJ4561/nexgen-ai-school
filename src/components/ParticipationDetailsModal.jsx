/**
 * ============================================
 * PARTICIPATION DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Displays detailed event participation information in a modal
 * Features:
 * - Event name and participation details
 * - Student name, event date, role, position
 * - Certificate status display
 * - Color-coded detail rows with icons
 * - Keyboard accessibility (Escape to close)
 * - Body scroll locking when open
 * - Responsive modal layout
 * - Parent role theming
 * 
 * Dependencies:
 * - lucide-react for icons (X, Trophy, CalendarDays, User, Medal, Award)
 * - @/components/ui/Button for action buttons
 * 
 * Usage:
 * <ParticipationDetailsModal
 *   open={isOpen}
 *   participation={selectedParticipation}
 *   onClose={() => setIsOpen(false)}
 * />
 * ============================================
 */

import { useEffect } from "react";

import {
  X,
  Trophy,
  CalendarDays,
  User,
  Medal,
  Award,
} from "lucide-react";

import Button from '@/components/ui/Button';

/**
 * ============================================
 * DETAIL ROW SUB-COMPONENT
 * ============================================
 * 
 * Renders a labeled detail item with icon
 * 
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.label - Detail label
 * @param {string} props.value - Detail value
 * @returns {JSX.Element} Detail row UI
 */
const DetailRow = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
    <div className="rounded-lg bg-parent-light p-2">
      <Icon size={18} className="text-parent-primary" />
    </div>

    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </p>
      <p className="mt-1 font-medium text-text-primary">
        {value}
      </p>
    </div>
  </div>
);

/**
 * ============================================
 * PARTICIPATION DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal with detailed event participation information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Object} props.participation - Participation object with all details
 * @param {string} props.participation.event_name - Name of the event
 * @param {string} props.participation.student_name - Name of the student
 * @param {string} props.participation.event_date - Date of the event
 * @param {string} props.participation.role - Role in the event
 * @param {string} props.participation.position - Position achieved (1st, 2nd, 3rd)
 * @param {string} props.participation.certificate - Certificate status
 * @param {Function} props.onClose - Callback function to close the modal
 * @returns {JSX.Element|null} Participation details modal or null if not open
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedParticipation, setSelectedParticipation] = useState(null);
 * 
 * <ParticipationDetailsModal
 *   open={isOpen}
 *   participation={selectedParticipation}
 *   onClose={() => setIsOpen(false)}
 * />
 * ============================================
 */
const ParticipationDetailsModal = ({
  open,
  participation,
  onClose,
}) => {
  /**
   * ============================================
   * ESCAPE KEY HANDLER & SCROLL LOCK
   * ============================================
   * 
   * - Closes modal when Escape key is pressed
   * - Locks body scroll when modal is open
   * - Restores scroll when modal closes
   * - Cleanup on unmount
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Lock body scroll
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Restore body scroll
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Return null if modal is not open or no participation is selected
  if (!open || !participation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* ─── Modal Container ─── */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="bg-parent-primary px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              {/* Badge */}
              <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                Event Participation
              </div>

              {/* Event Name */}
              <h2 className="mt-3 text-2xl font-bold">
                {participation.event_name}
              </h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────── */}
        <div className="grid gap-4 p-4 md:grid-cols-2">
          {/* Student */}
          <DetailRow
            icon={User}
            label="Student"
            value={participation.student_name}
          />

          {/* Event Date */}
          <DetailRow
            icon={CalendarDays}
            label="Event Date"
            value={new Date(participation.event_date).toLocaleDateString()}
          />

          {/* Role */}
          <DetailRow
            icon={Medal}
            label="Role"
            value={participation.role}
          />

          {/* Position */}
          <DetailRow
            icon={Trophy}
            label="Position"
            value={participation.position || "Not Awarded"}
          />

          {/* Certificate Status */}
          <DetailRow
            icon={Award}
            label="Certificate"
            value={participation.certificate ? "Certificate Earned" : "Not Available"}
          />
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="flex justify-end border-t px-6 py-4">
          <Button
            tone="parent"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipationDetailsModal;