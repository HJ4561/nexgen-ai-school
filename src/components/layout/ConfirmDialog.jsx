/**
 * ============================================
 * CONFIRM DIALOG COMPONENT
 * ============================================
 * 
 * Purpose: Reusable confirmation dialog for risky/destructive actions
 * Used across: All modules (admin, teacher, student, parent)
 * 
 * Features:
 * - Modal overlay with blur backdrop
 * - Customizable title, message, and button text
 * - Danger variant for destructive actions (red confirm button)
 * - Role-based theming for confirm button
 * - Click outside to cancel
 * 
 * Typical Use Cases:
 * - Deleting a student/teacher
 * - Rejecting a leave request
 * - Logging out
 * - Any action that needs user confirmation
 * 
 * Usage:
 * <ConfirmDialog
 *   isOpen={showDeleteConfirm}
 *   title="Delete Student?"
 *   message="This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDeleteConfirm(false)}
 * />
 * ============================================
 */

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * CONFIRM DIALOG
 *
 * Use this before any risky/important action — deleting a student,
 * rejecting a leave request, logging out, etc. Shows a popup asking
 * the user to confirm before it actually happens.
 *
 * This component doesn't do the actual delete/reject/whatever — it
 * just asks. Your page decides what happens when Confirm is clicked.
 *
 * Params you can pass:
 *  - isOpen: true/false → whether the dialog is showing
 *  - title: heading text, e.g. "Delete Student?"
 *  - message: explanation text, e.g. "This action cannot be undone"
 *  - confirmText: text on the confirm button (default "Confirm")
 *  - cancelText: text on the cancel button (default "Cancel")
 *  - onConfirm: function that runs when Confirm is clicked
 *  - onCancel: function that runs when Cancel is clicked, or when
 *    clicking outside the dialog (the dark overlay)
 *  - variant: "danger" | "default" → "danger" makes the confirm
 *    button red, for destructive actions like delete
 *  - tone: role color for the confirm button when variant is "default"
 *    → "brand" | "admin" | "teacher" | "student" | "parent"
 *
 * Example:
 *   <ConfirmDialog
 *     isOpen={showDeleteConfirm}
 *     title="Delete Student?"
 *     message="This action cannot be undone."
 *     variant="danger"
 *     confirmText="Delete"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowDeleteConfirm(false)}
 *   />
 */

/**
 * ConfirmDialog Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {string} props.title - Dialog heading
 * @param {string} props.message - Explanation text
 * @param {string} props.confirmText - Confirm button text (default: "Confirm")
 * @param {string} props.cancelText - Cancel button text (default: "Cancel")
 * @param {Function} props.onConfirm - Called when Confirm is clicked
 * @param {Function} props.onCancel - Called when Cancel or overlay is clicked
 * @param {string} props.variant - "danger" | "default" (default: "default")
 * @param {string} props.tone - Role color: "brand" | "admin" | "teacher" | "student" | "parent" (default: "brand")
 * @returns {JSX.Element|null} Rendered dialog or null if closed
 * 
 * @example
 * // Danger variant for destructive actions
 * <ConfirmDialog
 *   isOpen={showDelete}
 *   title="Delete Student?"
 *   message="This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDelete(false)}
 * />
 * 
 * @example
 * // Default variant with custom tone
 * <ConfirmDialog
 *   isOpen={showApprove}
 *   title="Approve Request?"
 *   message="Are you sure you want to approve this request?"
 *   tone="admin"
 *   confirmText="Approve"
 *   onConfirm={handleApprove}
 *   onCancel={() => setShowApprove(false)}
 * />
 */
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  tone = 'brand',
}) {
  // Don't render if dialog is closed
  if (!isOpen) return null;

  return (
    // Backdrop overlay - closes dialog on outside click
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      {/* Dialog container - prevents closing when clicking inside */}
      <div
        className="w-full max-w-sm rounded-modal bg-surface p-6 shadow-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
        
        {/* Message */}
        {message && <p className="mt-2 text-sm text-text-secondary">{message}</p>}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          {/* Cancel button */}
          <Button variant="outline" tone={tone} onClick={onCancel}>
            {cancelText}
          </Button>
          
          {/* Confirm button - danger variant for destructive actions */}
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            tone={tone}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;















