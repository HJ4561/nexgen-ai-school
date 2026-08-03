/**
 * ============================================
 * COMPLAINT DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Displays detailed information about a complaint in a modal
 * Features:
 * - Modal overlay with backdrop
 * - Complaint type display
 * - Status badge with color coding
 * - Full description with whitespace preservation
 * - Optional attachment link
 * - Submission date/time display
 * - Role-based styling (admin, teacher, student, parent)
 * - Responsive size (lg)
 * 
 * Dependencies:
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for close action
 * - @/components/composite/StatusBadge for status indicator
 * 
 * Usage:
 * <ComplaintDetailsModal
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   complaint={selectedComplaint}
 *   role="admin"
 * />
 * ============================================
 */

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/composite/StatusBadge";

/**
 * ============================================
 * COMPLAINT DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal with detailed complaint information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Object} props.complaint - Complaint object with all details
 * @param {string} props.complaint.complaint_type - Type/category of the complaint
 * @param {string} props.complaint.status - Current status of the complaint
 * @param {string} props.complaint.description - Full complaint description
 * @param {string} props.complaint.attachment_url - Optional attachment URL
 * @param {string} props.complaint.created_at - Creation date of the complaint
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element|null} Complaint details modal or null if no complaint
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedComplaint, setSelectedComplaint] = useState(null);
 * 
 * <ComplaintDetailsModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   complaint={selectedComplaint}
 *   role="admin"
 * />
 * ============================================
 */
const ComplaintDetailsModal = ({
  open,
  onClose,
  complaint,
  role,
}) => {
  // Return null if no complaint is selected
  if (!complaint) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Complaint Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* ─── Complaint Type ─── */}
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Complaint Type
          </p>

          <p className="mt-1 text-base font-semibold text-text-primary">
            {complaint.complaint_type}
          </p>
        </div>

        {/* ─── Status ─── */}
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Status
          </p>

          <div className="mt-2">
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* ─── Description ─── */}
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Description
          </p>

          {/* Description container with preserved whitespace */}
          <div className="mt-2 rounded-lg bg-surface-muted p-4">
            <p className="whitespace-pre-line text-text-primary">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* ─── Attachment (Conditional) ─── */}
        {complaint.attachment_url && (
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Attachment
            </p>

            <a
              href={complaint.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-brand-primary hover:underline"
            >
              View Attachment
            </a>
          </div>
        )}

        {/* ─── Submitted Date ─── */}
        <div>
          <p className="text-sm font-medium text-text-secondary">
            Submitted On
          </p>

          <p className="mt-1 text-text-primary">
            {new Date(complaint.created_at).toLocaleString()}
          </p>
        </div>

        {/* ─── Footer with Close Button ─── */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            tone={role}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComplaintDetailsModal;
