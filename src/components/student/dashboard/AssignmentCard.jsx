/**
 * ============================================
 * ASSIGNMENT CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a single assignment with status and actions
 * Features:
 * - Status-based theming (Pending, Submitted, Graded)
 * - Color-coded accent bar and icon
 * - Days remaining calculation with overdue detection
 * - Submission file display with details
 * - Graded feedback with marks display
 * - Role-based action buttons (Submit, Replace, View, Delete)
 * - Responsive layout with hover effects
 * - Overdue state with visual indicators
 * 
 * Dependencies:
 * - lucide-react for icons (Calendar, FileText, Upload, Eye, RotateCcw, BookOpen, Clock3, CheckCircle2, AlertCircle, Star, X)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicators
 * - @/components/ui/Card for container
 * 
 * Usage:
 * <AssignmentCard
 *   assignment={assignmentData}
 *   onSubmit={handleSubmit}
 *   onReplace={handleReplace}
 *   onView={handleView}
 *   onDelete={handleDelete}
 * />
 * ============================================
 */

import {
  Calendar,
  FileText,
  Upload,
  Eye,
  RotateCcw,
  BookOpen,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Star,
  X,
} from "lucide-react";

import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

/**
 * ============================================
 * STATUS META CONFIGURATION
 * ============================================
 * 
 * Status → color, one source of truth reused for the icon badge,
 * the left accent bar, and the status badge.
 * 
 * @constant {Object} STATUS_META
 * @property {Object} Pending - Yellow/warning theme
 * @property {Object} Submitted - Blue/info theme
 * @property {Object} Graded - Green/success theme
 */
const STATUS_META = {
  Pending: { colors: ["#FBBF24", "#D97706"], icon: AlertCircle, badgeVariant: "warning" },
  Submitted: { colors: ["#38BDF8", "#2563EB"], icon: CheckCircle2, badgeVariant: "info" },
  Graded: { colors: ["#34D399", "#0D9488"], icon: Star, badgeVariant: "success" },
};

/**
 * ============================================
 * OVERDUE COLORS
 * ============================================
 * 
 * Red/pink theme for overdue assignments
 * 
 * @constant {Array} OVERDUE_COLORS
 */
const OVERDUE_COLORS = ["#FB7185", "#E11D48"];

/**
 * ============================================
 * ASSIGNMENT CARD COMPONENT
 * ============================================
 * 
 * Renders an assignment with status, dates, and actions
 * 
 * @param {Object} props - Component props
 * @param {Object} props.assignment - Assignment object
 * @param {string} props.assignment.title - Assignment title
 * @param {string} props.assignment.subject_name - Subject name
 * @param {string} props.assignment.description - Assignment description
 * @param {string} props.assignment.assigned_at - Assignment date
 * @param {string} props.assignment.due_date - Due date
 * @param {string} props.assignment.status - Status (Pending, Submitted, Graded)
 * @param {Object} props.assignment.submission - Submission object
 * @param {string} props.assignment.submission.file_name - Submitted file name
 * @param {string} props.assignment.submission.submitted_at - Submission date
 * @param {number} props.assignment.marks - Obtained marks (if graded)
 * @param {string} props.assignment.feedback - Teacher feedback (if graded)
 * @param {Function} props.onSubmit - Callback for submitting assignment
 * @param {Function} props.onReplace - Callback for replacing submission
 * @param {Function} props.onView - Callback for viewing submission
 * @param {Function} props.onDelete - Callback for deleting submission
 * @returns {JSX.Element} Assignment card UI
 * 
 * @example
 * const assignment = {
 *   title: 'Math Homework',
 *   subject_name: 'Mathematics',
 *   description: 'Complete exercises 1-10',
 *   due_date: '2024-12-31',
 *   status: 'Pending'
 * };
 * 
 * <AssignmentCard
 *   assignment={assignment}
 *   onSubmit={() => openSubmitModal(assignment)}
 *   onView={() => viewSubmission(assignment)}
 * />
 * ============================================
 */
function AssignmentCard({ assignment, onSubmit, onReplace, onView, onDelete }) {
  /**
   * ============================================
   * DESTRUCTURE ASSIGNMENT DATA
   * ============================================
   */
  const {
    title,
    subject_name,
    description,
    assigned_at,
    due_date,
    status,
    submission,
    marks,
    feedback,
  } = assignment;

  /**
   * ============================================
   * DAYS REMAINING CALCULATION
   * ============================================
   * 
   * Calculates the number of days until the due date
   * Returns null if no due date is provided
   */
  const getDaysRemaining = () => {
    if (!due_date) return null;
    const today = new Date();
    const due = new Date(due_date);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const isOverdue = status === "Pending" && daysRemaining !== null && daysRemaining < 0;

  /**
   * ============================================
   * STATUS CONFIGURATION RESOLUTION
   * ============================================
   * 
   * Gets the status meta for the current status
   * Falls back to Pending if status is not found
   * Uses overdue colors if the assignment is overdue
   */
  const meta = STATUS_META[status] || STATUS_META.Pending;
  const accentColors = isOverdue ? OVERDUE_COLORS : meta.colors;
  const StatusIcon = meta.icon;

  /**
   * ============================================
   * RENDER STATUS BADGE
   * ============================================
   * 
   * Renders the appropriate status badge based on
   * the assignment's status and overdue state
   */
  const renderStatus = () => {
    if (isOverdue) {
      return (
        <Badge variant="danger">
          <AlertCircle size={14} />
          Overdue
        </Badge>
      );
    }

    switch (status) {
      case "Pending":
        return (
          <Badge variant="warning">
            <AlertCircle size={14} />
            Pending
          </Badge>
        );
      case "Submitted":
        return (
          <Badge variant="info">
            <CheckCircle2 size={14} />
            Submitted
          </Badge>
        );
      case "Graded":
        return (
          <Badge variant="success">
            <Star size={14} />
            Graded
          </Badge>
        );
      default:
        return null;
    }
  };

  /**
   * ============================================
   * DUE DATE TONE
   * ============================================
   * 
   * Determines the visual tone for the due date section
   * based on the number of days remaining
   */
  const dueDateTone =
    daysRemaining === null
      ? { text: "text-text-secondary", bg: "bg-surface-dim" }
      : daysRemaining < 0
      ? { text: "text-rose-600", bg: "bg-rose-50" }
      : daysRemaining <= 2
      ? { text: "text-amber-600", bg: "bg-amber-50" }
      : { text: "text-emerald-600", bg: "bg-emerald-50" };

  return (
    <Card
      style={{ borderLeftColor: accentColors[1] }}
      className="border-l-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="space-y-6">
        {/* ============================================
            HEADER
            Title, subject, and status badge
            ============================================ */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* ─── Icon ─── */}
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${accentColors[0]}, ${accentColors[1]})` }}
            >
              <BookOpen size={26} />
            </div>

            {/* ─── Title & Subject ─── */}
            <div>
              <h3 className="text-lg font-bold leading-snug text-text-primary">{title}</h3>
              <p className="mt-1 text-sm font-medium text-student-text">{subject_name}</p>
            </div>
          </div>

          {/* ─── Status Badge ─── */}
          <div className="shrink-0 pt-1">{renderStatus()}</div>
        </div>

        {/* ============================================
            DESCRIPTION
            ============================================ */}

        <p className="leading-7 text-text-secondary">{description}</p>

        {/* ============================================
            DATES
            Assigned date and due date
            ============================================ */}

        <div className="grid items-stretch gap-4 md:grid-cols-2">
          {/* ─── Assigned Date ─── */}
          <div className="flex flex-col rounded-xl bg-surface-dim p-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-student-primary" />
              <span className="font-medium">Assigned</span>
            </div>
            <p className="mt-2 text-sm text-text-secondary">
              {new Date(assigned_at).toLocaleDateString()}
            </p>
            {daysRemaining !== null && (
              <p className="invisible mt-2 text-xs font-semibold" aria-hidden="true">
                spacer
              </p>
            )}
          </div>

          {/* ─── Due Date ─── */}
          <div className={`flex flex-col rounded-xl p-4 transition-colors duration-300 ${dueDateTone.bg}`}>
            <div className="flex items-center gap-2">
              <Clock3 size={18} className={dueDateTone.text} />
              <span className="font-medium">Due Date</span>
            </div>

            <p className="mt-2 text-sm text-text-secondary">
              {new Date(due_date).toLocaleDateString()}
            </p>

            {daysRemaining !== null && (
              <p className={`mt-2 text-xs font-semibold ${dueDateTone.text}`}>
                {daysRemaining < 0 ? "Overdue" : daysRemaining === 0 ? "Due today" : `${daysRemaining} day(s) left`}
              </p>
            )}
          </div>
        </div>

        {/* ============================================
            SUBMISSION
            File details if submitted
            ============================================ */}

        {submission && (
          <div className="flex items-center gap-3 rounded-2xl border border-student-border bg-student-light p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-student-primary shadow-sm">
              <FileText size={20} />
            </div>

            <div>
              <p className="font-medium text-text-primary">{submission.file_name}</p>
              <p className="text-sm text-text-secondary">
                Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* ============================================
            FEEDBACK
            Graded feedback with marks
            ============================================ */}

        {status === "Graded" && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            {/* ─── Decorative Glow ─── */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-4 h-24 w-24 rounded-full opacity-20 blur-2xl"
              style={{ background: `linear-gradient(135deg, ${STATUS_META.Graded.colors[0]}, ${STATUS_META.Graded.colors[1]})` }}
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-emerald-600" />
                <p className="font-semibold text-emerald-700">Marks Obtained</p>
              </div>

              <span
                className="rounded-full px-3.5 py-1 font-bold text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${STATUS_META.Graded.colors[0]}, ${STATUS_META.Graded.colors[1]})` }}
              >
                {marks}
              </span>
            </div>

            {feedback && (
              <div className="relative mt-4 border-t border-emerald-200/70 pt-4">
                <p className="text-sm font-medium text-emerald-700">Teacher Feedback</p>
                <p className="mt-1 text-sm italic leading-relaxed text-emerald-600">{feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* ============================================
            ACTIONS
            Role-based action buttons
            ============================================ */}

        <div className="flex flex-wrap gap-3">
          {/* ─── Pending ─── */}
          {status === "Pending" && !isOverdue && (
            <Button
              tone="student"
              leftIcon={<Upload />}
              onClick={onSubmit}
            >
              Submit Assignment
            </Button>
          )}

          {/* ─── Submitted ─── */}
          {status === "Submitted" && (
            <>
              {!isOverdue && (
                <>
                  <Button
                    tone="student"
                    leftIcon={<RotateCcw />}
                    onClick={onReplace}
                  >
                    Replace Submission
                  </Button>

                  <Button
                    variant="danger"
                    leftIcon={<X />}
                    onClick={() => onDelete(submission.id)}
                  >
                    Delete Submission
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                tone="student"
                leftIcon={<Eye />}
                onClick={onView}
              >
                View File
              </Button>
            </>
          )}

          {/* ─── Graded ─── */}
          {status === "Graded" && submission && (
            <Button
              variant="outline"
              tone="student"
              leftIcon={<Eye />}
              onClick={onView}
            >
              View File
            </Button>
          )}

          {/* ─── Overdue ─── */}
          {isOverdue && status === "Pending" && (
            <Button
              variant="outline"
              disabled
              leftIcon={<Clock3 />}
            >
              Submission Closed
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default AssignmentCard;