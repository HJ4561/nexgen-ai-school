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
 * - @/components/common/StatusBadge for status indicator
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
import StatusBadge from "@/components/common/StatusBadge";

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
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* â”€â”€â”€ Complaint Type â”€â”€â”€ */}
        <div>
          <p className="text-sm md:text-base md:text-base font-medium text-text-secondary px-4 sm:px-6 lg:px-8">
            Complaint Type
          </p>

          <p className="mt-1 text-base font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
            {complaint.complaint_type}
          </p>
        </div>

        {/* â”€â”€â”€ Status â”€â”€â”€ */}
        <div>
          <p className="text-sm md:text-base md:text-base font-medium text-text-secondary px-4 sm:px-6 lg:px-8">
            Status
          </p>

          <div className="mt-2 px-4 sm:px-6 lg:px-8">
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* â”€â”€â”€ Description â”€â”€â”€ */}
        <div>
          <p className="text-sm md:text-base md:text-base font-medium text-text-secondary px-4 sm:px-6 lg:px-8">
            Description
          </p>

          {/* Description container with preserved whitespace */}
          <div className="mt-2 rounded-lg bg-surface-muted p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
            <p className="whitespace-pre-line text-text-primary px-4 sm:px-6 lg:px-8">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* â”€â”€â”€ Attachment (Conditional) â”€â”€â”€ */}
        {complaint.attachment_url && (
          <div>
            <p className="text-sm md:text-base md:text-base font-medium text-text-secondary px-4 sm:px-6 lg:px-8">
              Attachment
            </p>

            <a
              href={complaint.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block md:hidden text-brand-primary hover:underline px-4 sm:px-6 lg:px-8"
            >
              View Attachment
            </a>
          </div>
        )}

        {/* â”€â”€â”€ Submitted Date â”€â”€â”€ */}
        <div>
          <p className="text-sm md:text-base md:text-base font-medium text-text-secondary px-4 sm:px-6 lg:px-8">
            Submitted On
          </p>

          <p className="mt-1 text-text-primary px-4 sm:px-6 lg:px-8">
            {new Date(complaint.created_at).toLocaleString()}
          </p>
        </div>

        {/* â”€â”€â”€ Footer with Close Button â”€â”€â”€ */}
        <div className="flex flex-col md:flex-row justify-end pt-2 px-4 sm:px-6 lg:px-8">
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="primary"
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
