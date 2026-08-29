/**
 * ============================================
 * MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Reusable popup/dialog component
 * Used across: All dashboards for confirmations, forms, details
 * 
 * Features:
 * - Backdrop overlay with blur
 * - Close on outside click
 * - Multiple sizes (sm, md, lg, xl)
 * - Custom title, body, and footer
 * - Scrollable body
 * - Close button in header
 * 
 * Structure:
 * ┌─────────────────────────────────────────┐
 * │ ██████████████████████████████████████ │ ← Backdrop overlay
 * │  ┌─────────────────────────────────┐    │
 * │  │ Title              [✕]          │    │ ← Header
 * │  ├─────────────────────────────────┤    │
 * │  │                                 │    │
 * │  │  Main Content (children)        │    │ ← Body (scrollable)
 * │  │                                 │    │
 * │  ├─────────────────────────────────┤    │
 * │  │  [Cancel]  [Confirm]           │    │ ← Footer (optional)
 * │  └─────────────────────────────────┘    │
 * └─────────────────────────────────────────┘
 * ============================================
 */

import { X } from "lucide-react";

/**
 * Modal Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Controls modal visibility (true = visible)
 * @param {Function} props.onClose - Called when modal closes (click outside, close button, or ESC)
 * @param {string} props.title - Modal heading text
 * @param {ReactNode} props.children - Main modal content
 * @param {ReactNode} props.footer - Optional footer with action buttons
 * @param {string} props.size - Modal width: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @returns {JSX.Element} Rendered modal or null if closed
 * 
 * @example
 * // Basic modal
 * <Modal open={open} onClose={() => setOpen(false)} title="Student Details">
 *   <p>Student information goes here.</p>
 * </Modal>
 * 
 * @example
 * // Modal with footer buttons
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Delete Student"
 *   footer={
 *     <>
 *       <button onClick={() => setOpen(false)}>Cancel</button>
 *       <button onClick={handleDelete}>Delete</button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to delete this student?</p>
 * </Modal>
 * 
 * @example
 * // Large modal for forms/tables
 * <Modal open={open} onClose={() => setOpen(false)} title="Attendance Report" size="lg">
 *   <AttendanceTable />
 * </Modal>
 */
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) {
  // Don't render if modal is closed
  if (!open) return null;

  // Size mapping for modal width
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    // Backdrop Overlay
    // Covers entire screen and closes modal on outside click
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className={`
          relative
          w-full
          ${sizes[size]}
          rounded-modal
          border border-slate-200
          bg-white
          shadow-2xl
          animate-in
          fade-in
          zoom-in-95
        `}
        // Prevent closing when clicking inside modal
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title + Close Button */}
        <div
          className="
            flex items-center justify-between
            border-b border-slate-200
            px-6 py-4"
        >
          <h2 className="text-xl font-semibold text-text-primary">
            {title}
          </h2>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="
              rounded-full p-2
              text-text-secondary
              transition
              hover:bg-slate-100
              hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body: Main content with scroll */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer: Optional action buttons */}
        {footer && (
          <div
            className="
              flex justify-end gap-3
              border-t border-slate-200
              px-6 py-4"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;