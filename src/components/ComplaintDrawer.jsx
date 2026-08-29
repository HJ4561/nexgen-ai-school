/**
 * ============================================
 * COMPLAINT DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Detailed complaint management drawer with resolution controls
 * Features:
 * - Reporter information with role-based styling
 * - Complaint details (type, description, date)
 * - Resolution form with status update and admin remarks
 * - History timeline tracking complaint lifecycle
 * - Status update with admin remarks (required)
 * - Role-based color coding for reporters
 * - Responsive drawer layout
 * 
 * Dependencies:
 * - lucide-react for icons (AlertCircle, Clock, CheckCircle)
 * - @/components/admin/Drawer for side panel
 * - @/components/ui/Badge for category display
 * - @/components/common/StatusBadge for status indicator
 * - @/components/ui/Select for status dropdown
 * - @/components/ui/Button for action buttons
 * - @/utils/helpers for formatting and constants
 * 
 * Usage:
 * <ComplaintDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   complaint={selectedComplaint}
 *   onUpdate={handleComplaintUpdate}
 *   isSubmitting={isSubmitting}
 * />
 * ============================================
 */

import { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import Drawer from "@/components/admin/Drawer";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/common/StatusBadge";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import {
  getInitials,
  formatDate,
  statusDisplayMap,
  COMPLAINT_STATUS_OPTIONS,
} from "@/utils/helpers";

/**
 * ============================================
 * COMPLAINT DRAWER COMPONENT
 * ============================================
 * 
 * Renders a detailed drawer for complaint management and resolution
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.complaint - Complaint object with all details
 * @param {Function} props.onUpdate - Callback function to update complaint status
 * @param {boolean} props.isSubmitting - Loading state for submission
 * @returns {JSX.Element|null} Complaint drawer or null if no complaint
 * 
 * @example
 * const [isDrawerOpen, setIsDrawerOpen] = useState(false);
 * const [selectedComplaint, setSelectedComplaint] = useState(null);
 * 
 * <ComplaintDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   complaint={selectedComplaint}
 *   onUpdate={(id, status, remarks) => updateComplaint(id, status, remarks)}
 *   isSubmitting={loading}
 * />
 * ============================================
 */
export default function ComplaintDrawer({
  isOpen,
  onClose,
  complaint,
  onUpdate,
  isSubmitting,
}) {
  // â”€â”€â”€ State Management â”€â”€â”€
  const [status, setStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");

  /**
   * ============================================
   * RESET FORM ON COMPLAINT CHANGE
   * ============================================
   * 
   * Resets form fields when a new complaint is selected
   * Populates status and admin remarks from complaint data
   */
  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || "Open");
      setAdminRemarks(complaint.admin_remarks || "");
    }
  }, [complaint]);

  // Return null if no complaint is selected
  if (!complaint) return null;

  /**
   * ============================================
   * HANDLE FORM SUBMISSION
   * ============================================
   * 
   * Validates admin remarks and calls onUpdate callback
   * Shows alert if remarks are empty
   */
  const handleSubmit = () => {
    if (!adminRemarks.trim()) {
      alert("Please add admin remarks before updating.");
      return;
    }
    onUpdate(complaint.id, status, adminRemarks);
  };

  /**
   * ============================================
   * REPORTER ROLE COLOR MAPPING
   * ============================================
   * 
   * Determines color scheme based on reporter's role
   * - Student: Blue
   * - Teacher: Purple
   * - Parent: Green
   */
  const roleColorClass =
    complaint.reporter_role === "Student"
      ? "bg-[var(--color-student-light)] text-[var(--color-student-primary)]"
      : complaint.reporter_role === "Teacher"
      ? "bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)]"
      : "bg-[var(--color-parent-light)] text-[var(--color-parent-primary)]";

  /**
   * ============================================
   * STATUS DISPLAY MAPPING
   * ============================================
   * 
   * Maps status values to display labels
   */
  const displayStatus = statusDisplayMap[complaint.status] || complaint.status;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Complaint Details"
      width="max-w-[480px]"
      footer={
        // â”€â”€â”€ Footer with action buttons â”€â”€â”€
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="outline" tone="admin" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="primary"
            tone="admin"
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting || !adminRemarks.trim()}
          >
            {isSubmitting ? "Updating..." : "Update & Notify"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* â”€â”€â”€ Reporter Info â”€â”€â”€ */}
        <div className="bg-[var(--color-surface-dim)] p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 rounded-xl border border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 mb-3 px-4 sm:px-6 lg:px-8">
            {/* Avatar with role-based color */}
            <div
              className={`w-10 h-10 rounded-full flex flex-col md:flex-row items-center justify-center text-sm md:text-base md:text-base font-bold ${roleColorClass}`}
            >
              {getInitials(complaint.reporter_name)}
            </div>
            <div>
              <p className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                {complaint.reporter_name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                {complaint.reporter_role}
              </p>
            </div>
          </div>
          {/* Complaint description */}
          <div className="space-y-2 px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">
              Description
            </p>
            <p className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] leading-relaxed px-4 sm:px-6 lg:px-8">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* â”€â”€â”€ Complaint Type â”€â”€â”€ */}
        <div>
          <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
            Category
          </label>
          <Badge tone="neutral">{complaint.complaint_type}</Badge>
        </div>

        {/* â”€â”€â”€ Against User (Conditional) â”€â”€â”€ */}
        {complaint.against_user && (
          <div>
            <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
              Against
            </label>
            <p className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
              User ID: {complaint.against_user}
            </p>
          </div>
        )}

        {/* â”€â”€â”€ Submitted Date â”€â”€â”€ */}
        <div>
          <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
            Submitted
          </label>
          <p className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
            {formatDate(complaint.created_at)}
          </p>
        </div>

        {/* â”€â”€â”€ Resolution Form â”€â”€â”€ */}
        <div className="border-t border-gray-200 pt-6 px-4 sm:px-6 lg:px-8">
          <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 px-4 sm:px-6 lg:px-8">
            Resolve Complaint
          </h4>
          <div className="space-y-4 px-4 sm:px-6 lg:px-8">
            {/* Status dropdown */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Status
              </label>
              <Select
                value={status}
                onChange={(val) => setStatus(val)}
                options={COMPLAINT_STATUS_OPTIONS}
                tone="admin"
                size="md"
              />
            </div>

            {/* Admin remarks textarea */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Admin Remarks <span className="text-red-500 px-4 sm:px-6 lg:px-8">*</span>
              </label>
              <textarea
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add resolution details here..."
                rows={4}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm md:text-base md:text-base resize-none px-4 sm:px-6 lg:px-8"
              />
            </div>
          </div>
        </div>

        {/* â”€â”€â”€ History Timeline â”€â”€â”€ */}
        <div className="border-t border-gray-200 pt-6 px-4 sm:px-6 lg:px-8">
          <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 px-4 sm:px-6 lg:px-8">
            History Tracking
          </h4>
          <div className="space-y-4 px-4 sm:px-6 lg:px-8">
            {/* Timeline Item: Complaint Filed */}
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
              <div className="w-8 h-8 rounded-full bg-[var(--color-admin-light)] text-[var(--color-admin-primary)] flex flex-col md:flex-row items-center justify-center shrink-0 px-4 sm:px-6 lg:px-8">
                <AlertCircle size={16} />
              </div>
              <div>
                <p className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                  Complaint Filed
                </p>
                <p className="text-xs text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                  {formatDate(complaint.created_at)}
                </p>
              </div>
            </div>

            {/* Timeline Item: Status Update (conditional) */}
            {complaint.admin_remarks && (
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                <div className="w-8 h-8 rounded-full bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)] flex flex-col md:flex-row items-center justify-center shrink-0 px-4 sm:px-6 lg:px-8">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                    Status Updated:{" "}
                    {COMPLAINT_STATUS_OPTIONS.find(
                      (opt) => opt.value === complaint.status
                    )?.label || complaint.status}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                    {complaint.remarks_updated_at
                      ? formatDate(complaint.remarks_updated_at)
                      : "Today"}
                  </p>
                  <p className="text-sm md:text-base md:text-base text-[var(--color-text-secondary)] mt-1 px-4 sm:px-6 lg:px-8">
                    {complaint.admin_remarks}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline Item: Resolved (conditional) */}
            {complaint.status === "Resolved" && complaint.resolved_at && (
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                <div className="w-8 h-8 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] flex flex-col md:flex-row items-center justify-center shrink-0 px-4 sm:px-6 lg:px-8">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                    Resolved
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                    {formatDate(complaint.resolved_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

