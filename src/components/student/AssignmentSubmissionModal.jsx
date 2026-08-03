/**
 * ============================================
 * ASSIGNMENT SUBMISSION MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Modal for submitting or replacing assignment files via URL
 * Features:
 * - URL input with validation
 * - Clear button for URL field
 * - URL preview with link
 * - Submit/Replace mode switching
 * - Loading state during submission
 * - Form validation with error messages
 * - Accessibility with proper labels
 * - Close on success or cancel
 * 
 * Dependencies:
 * - lucide-react for icons (Link, X)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Modal for modal container
 * 
 * Usage:
 * <AssignmentSubmissionModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleSubmit}
 *   fileUrl={fileUrl}
 *   setFileUrl={setFileUrl}
 *   loading={isSubmitting}
 *   isReplace={false}
 * />
 * ============================================
 */

import { Link, X } from "lucide-react";

import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal';

/**
 * ============================================
 * ASSIGNMENT SUBMISSION MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal for submitting assignment file URLs
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Function} props.onSubmit - Callback function to submit the assignment
 * @param {string} props.fileUrl - Current file URL value
 * @param {Function} props.setFileUrl - Setter function for file URL
 * @param {boolean} props.loading - Loading state for submission (default: false)
 * @param {boolean} props.isReplace - Whether this is a replacement submission (default: false)
 * @returns {JSX.Element} Assignment submission modal UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [fileUrl, setFileUrl] = useState('');
 * const [isSubmitting, setIsSubmitting] = useState(false);
 * 
 * const handleSubmit = async (data) => {
 *   setIsSubmitting(true);
 *   await submitAssignment(data.file_url);
 *   setIsSubmitting(false);
 *   setIsOpen(false);
 * };
 * 
 * <AssignmentSubmissionModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSubmit={handleSubmit}
 *   fileUrl={fileUrl}
 *   setFileUrl={setFileUrl}
 *   loading={isSubmitting}
 *   isReplace={false}
 * />
 * ============================================
 */
function AssignmentSubmissionModal({
  open,
  onClose,
  onSubmit,
  fileUrl,
  setFileUrl,
  loading = false,
  isReplace = false,
}) {
  /**
   * ============================================
   * URL VALIDATION
   * ============================================
   * 
   * Checks if the provided string is a valid URL
   * Uses the URL constructor to validate
   * 
   * @param {string} url - URL string to validate
   * @returns {boolean} True if valid URL, false otherwise
   */
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * ============================================
   * HANDLE SUBMIT
   * ============================================
   * 
   * Validates URL and triggers submit callback
   * Only submits if URL is valid
   */
  const handleSubmit = () => {
    if (!isValidUrl(fileUrl)) return;

    onSubmit({
      file_url: fileUrl.trim(),
    });
  };

  /**
   * ============================================
   * HANDLE CLOSE
   * ============================================
   * 
   * Resets file URL and closes the modal
   */
  const handleClose = () => {
    setFileUrl("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isReplace
          ? "Replace Submission"
          : "Submit Assignment"
      }
    >
      <div className="space-y-6">
        {/* ─── URL Input ────────────────────────────────────────── */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Assignment File URL
          </label>

          <div className="relative">
            {/* URL Icon */}
            <Link
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />

            {/* Input Field */}
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/file/..."
              className="
                w-full
                rounded-2xl
                border
                border-student-border
                bg-student-light
                py-3
                pl-11
                pr-12
                text-sm
                outline-none
                transition
                focus:border-student-primary
                focus:ring-2
                focus:ring-student-primary/20
              "
            />

            {/* Clear Button */}
            {fileUrl && (
              <button
                type="button"
                onClick={() => setFileUrl("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Helper Text */}
          <p className="mt-2 text-xs text-text-muted">
            Paste a public URL from Google Drive, Dropbox, OneDrive, GitHub, etc.
          </p>

          {/* Validation Error */}
          {fileUrl && !isValidUrl(fileUrl) && (
            <p className="mt-2 text-sm text-red-500">
              Please enter a valid URL.
            </p>
          )}
        </div>

        {/* ─── URL Preview ────────────────────────────────────────── */}
        {isValidUrl(fileUrl) && (
          <div className="rounded-2xl border border-student-border bg-student-light p-4">
            <p className="mb-2 text-sm font-semibold">Preview</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-sm text-student-primary hover:underline"
            >
              {fileUrl}
            </a>
          </div>
        )}

        {/* ─── Action Buttons ─────────────────────────────────────── */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            tone="student"
            fullWidth
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            tone="student"
            fullWidth
            loading={loading}
            disabled={!isValidUrl(fileUrl)}
            onClick={handleSubmit}
          >
            {isReplace ? "Update Submission" : "Submit Assignment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default AssignmentSubmissionModal;