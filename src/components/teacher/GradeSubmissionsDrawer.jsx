/**
 * ============================================
 * GRADE SUBMISSIONS DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Drawer for grading student submissions
 * Features:
 * - Displays all submissions for an assignment
 * - Shows graded/pending status with badges
 * - Inline editing for marks and feedback
 * - View submission file link
 * - Graded submission summary
 * - Teacher role theming
 * - Scrollable submission list
 * 
 * Dependencies:
 * - lucide-react for icons (LinkIcon, MessageSquare, CheckCircle)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicators
 * - @/components/ui/Input for marks input
 * - @/components/ui/TextArea for feedback
 * - @/components/admin/Drawer for sliding panel
 * - @/utils/helpers for date formatting
 * 
 * Usage:
 * <GradeSubmissionsDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   assignment={selectedAssignment}
 *   submissions={submissionsList}
 *   editingSubmission={editingSubmission}
 *   setEditingSubmission={setEditingSubmission}
 *   onGrade={handleGrade}
 *   loading={isSaving}
 * />
 * ============================================
 */

import { useState } from 'react';
import { LinkIcon, MessageSquare, CheckCircle } from 'lucide-react';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Drawer from "@/components/admin/Drawer";
import { formatDate } from "@/utils/helpers";

/**
 * ============================================
 * GRADE SUBMISSIONS DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders a drawer for grading student submissions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.assignment - Assignment object being graded
 * @param {Array} props.submissions - Array of submission objects
 * @param {Object} props.editingSubmission - Currently editing submission object
 * @param {Function} props.setEditingSubmission - Setter for editing submission
 * @param {Function} props.onGrade - Callback function to save grade
 * @param {boolean} props.loading - Loading state for save operation
 * @returns {JSX.Element|null} Grade submissions drawer or null if no assignment
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [editingSubmission, setEditingSubmission] = useState(null);
 * 
 * <GradeSubmissionsDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   assignment={assignment}
 *   submissions={submissions}
 *   editingSubmission={editingSubmission}
 *   setEditingSubmission={setEditingSubmission}
 *   onGrade={handleGrade}
 *   loading={isSaving}
 * />
 * ============================================
 */
export default function GradeSubmissionsDrawer({
  isOpen,
  onClose,
  assignment,
  submissions,
  editingSubmission,
  setEditingSubmission,
  onGrade,
  loading,
}) {
  /**
   * ============================================
   * LOCAL STATE FOR EDITING
   * ============================================
   * 
   * Manages the marks and feedback values during editing
   */
  const [editingMarks, setEditingMarks] = useState('');
  const [editingFeedback, setEditingFeedback] = useState('');

  /**
   * ============================================
   * HANDLE EDIT START
   * ============================================
   * 
   * Sets up the editing state with submission data
   * Populates marks and feedback fields
   * 
   * @param {Object} sub - Submission object to edit
   */
  const handleEditStart = (sub) => {
    setEditingSubmission(sub);
    setEditingMarks(sub.marks || '');
    setEditingFeedback(sub.feedback || '');
  };

  /**
   * ============================================
   * HANDLE CANCEL EDIT
   * ============================================
   * 
   * Clears editing state and resets form fields
   */
  const handleCancelEdit = () => {
    setEditingSubmission(null);
    setEditingMarks('');
    setEditingFeedback('');
  };

  /**
   * ============================================
   * HANDLE SAVE GRADE
   * ============================================
   * 
   * Saves the grade and feedback for the current submission
   * Calls onGrade callback and cancels edit mode
   */
  const handleSaveGrade = () => {
    if (!editingSubmission) return;
    onGrade(editingSubmission.id, editingMarks, editingFeedback);
    handleCancelEdit();
  };

  // Return null if no assignment is selected
  if (!assignment) return null;

  /**
   * ============================================
   * SUBMISSION STATISTICS
   * ============================================
   * 
   * Counts graded and pending submissions
   */
  const graded = submissions.filter(s => s.marks !== null && s.marks !== undefined).length;
  const pending = submissions.length - graded;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Grade Submissions"
      width="max-w-[460px]"
      subtitle={`${assignment.title} • Class ${assignment.class_section}`}
      footer={
        // ─── Drawer Footer with Close Button ───
        <div className="flex gap-3">
          <Button variant="outline" tone="teacher" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Submission Summary ─── */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">
            {graded} graded · {pending} pending
          </span>
          <span className="text-[var(--color-text-muted)]">
            {submissions.length} submissions
          </span>
        </div>

        {submissions.length === 0 ? (
          // ─── Empty State ───
          <div className="text-center py-8">
            <p className="text-sm text-[var(--color-text-muted)]">No submissions yet</p>
          </div>
        ) : (
          // ─── Submissions List ───
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
            {submissions.map((sub) => {
              const isGraded = sub.marks !== null && sub.marks !== undefined;
              const isEditing = editingSubmission?.id === sub.id;

              return (
                <div
                  key={sub.id}
                  className={`bg-[var(--color-surface-dim)] rounded-lg p-4 border ${
                    isGraded ? 'border-[var(--color-success)]/20' : 'border-gray-200'
                  } transition-all`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {/* Student Name */}
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {sub.student_name}
                      </p>

                      {/* Submission Date */}
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Submitted: {formatDate(sub.submitted_at)}
                      </p>

                      {/* View Submission Link */}
                      {sub.file_url && (
                        <a
                          href={sub.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--color-teacher-primary)] hover:underline flex items-center gap-1 mt-1"
                        >
                          <LinkIcon size={12} />
                          View Submission
                        </a>
                      )}
                    </div>

                    {/* Graded Badge */}
                    {isGraded && (
                      <Badge color="success" className="text-[10px] shrink-0">
                        Graded
                      </Badge>
                    )}
                  </div>

                  {/* ─── Grade & Feedback Section ─── */}
                  <div className="mt-3">
                    {isEditing ? (
                      // ─── Edit Mode ───
                      <div className="space-y-3">
                        <Input
                          label="Marks"
                          type="number"
                          value={editingMarks}
                          onChange={(e) => setEditingMarks(e.target.value)}
                          placeholder="e.g., 85"
                          tone="teacher"
                        />
                        <TextArea
                          label="Feedback"
                          value={editingFeedback}
                          onChange={(e) => setEditingFeedback(e.target.value)}
                          placeholder="Write feedback..."
                          rows={2}
                          tone="teacher"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            tone="teacher"
                            size="sm"
                            onClick={handleSaveGrade}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save Grade'}
                          </Button>
                          <Button
                            variant="outline"
                            tone="teacher"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // ─── View Mode ───
                      <div
                        className="cursor-pointer hover:bg-white/50 rounded-lg p-2 -mx-2 transition-colors"
                        onClick={() => handleEditStart(sub)}
                      >
                        {isGraded ? (
                          // ─── Graded Display ───
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--color-text-muted)]">Marks:</span>
                              <span className="text-sm font-semibold text-[var(--color-teacher-primary)]">
                                {sub.marks}
                              </span>
                            </div>
                            {sub.feedback && (
                              <div className="mt-1">
                                <p className="text-xs text-[var(--color-text-muted)]">Feedback:</p>
                                <p className="text-sm text-[var(--color-text-primary)]">{sub.feedback}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // ─── Pending Display ───
                          <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                            <MessageSquare size={14} />
                            Click to grade
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Drawer>
  );
}