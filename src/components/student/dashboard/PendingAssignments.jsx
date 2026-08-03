/**
 * ============================================
 * PENDING ASSIGNMENTS COMPONENT
 * ============================================
 * 
 * Purpose: Displays pending assignments for student dashboard
 * Features:
 * - Merges assignments with submission data
 * - Filters for pending assignments only
 * - Urgency-based color coding (Overdue, Due Soon, Pending)
 * - Days remaining/overdue calculation
 * - Scrollable list with max height
 * - Fade hint for overflow content
 * - Staggered entrance animations
 * - View All link to assignments page
 * - Empty state with icon
 * 
 * Dependencies:
 * - lucide-react for icons (BookOpen, CalendarDays, ArrowRight)
 * - react-router-dom for navigation
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for urgency indicators
 * - react-redux for state management
 * 
 * Usage:
 * <PendingAssignments />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

/**
 * ============================================
 * URGENCY HELPERS
 * ============================================
 * 
 * Color mapping for urgency levels
 * - danger: Overdue — rose
 * - warning: Due soon — amber
 * - primary: Pending — indigo
 * 
 * @constant {Object} URGENCY_COLORS
 */
const URGENCY_COLORS = {
  danger: ["#FB7185", "#E11D48"], // overdue — rose
  warning: ["#FBBF24", "#D97706"], // due soon — amber
  primary: ["#818CF8", "#6366F1"], // pending — indigo
};

/**
 * ============================================
 * DATE UTILITY FUNCTIONS
 * ============================================
 * 
 * Calculate days between today and a due date
 * 
 * @param {string} date - Due date string
 * @returns {number} Number of days until due (negative if overdue)
 */
const getDiffDays = (date) => {
  const today = new Date();
  const due = new Date(date);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
};

/**
 * Determine urgency variant based on days remaining
 * - < 0: danger (overdue)
 * - <= 3: warning (due soon)
 * - > 3: primary (pending)
 * 
 * @param {string} date - Due date string
 * @returns {string} Variant key
 */
const getVariant = (date) => {
  const diff = getDiffDays(date);
  if (diff < 0) return "danger";
  if (diff <= 3) return "warning";
  return "primary";
};

/**
 * Get human-readable label for urgency
 * 
 * @param {string} date - Due date string
 * @returns {string} Label (Overdue, Due Soon, Pending)
 */
const getLabel = (date) => {
  const diff = getDiffDays(date);
  if (diff < 0) return "Overdue";
  if (diff <= 3) return "Due Soon";
  return "Pending";
};

/**
 * Get detailed due date copy with days remaining
 * 
 * @param {string} date - Due date string
 * @returns {string} Formatted due date text
 */
const getDueCopy = (date) => {
  const diff = getDiffDays(date);
  const formatted = new Date(date).toLocaleDateString();
  if (diff < 0) return `Due ${formatted} · ${Math.abs(diff)}d overdue`;
  if (diff === 0) return `Due ${formatted} · today`;
  return `Due ${formatted} · in ${diff}d`;
};

/**
 * ============================================
 * PENDING ASSIGNMENTS COMPONENT
 * ============================================
 * 
 * Renders a list of pending assignments with urgency indicators
 * 
 * @returns {JSX.Element} Pending assignments UI
 * 
 * @example
 * // In student dashboard
 * <PendingAssignments />
 * ============================================
 */
const PendingAssignments = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves assignments and submissions from Redux store
   */
  const {
    assignments = [],
    submissions = [],
  } = useSelector(
    (state) => state.student
  );

  /**
   * ============================================
   * MERGE ASSIGNMENTS + SUBMISSIONS
   * ============================================
   * 
   * 1. Merges assignments with submission data
   * 2. Determines status based on submission presence
   *    - No submission: Pending
   *    - Submission without marks: Submitted
   *    - Submission with marks: Graded
   * 3. Filters for pending assignments only
   * 4. Sorts by due date (earliest first)
   */
  const pendingAssignments = useMemo(() => {
    return assignments
      .map((assignment) => {
        const submission = submissions.find(
          (item) => item.assignment === assignment.id
        );

        let status = "Pending";

        if (submission) {
          status = submission.marks != null ? "Graded" : "Submitted";
        }

        return {
          ...assignment,
          status,
        };
      })
      .filter((assignment) => assignment.status === "Pending")
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [assignments, submissions]);

  return (
    <Card hover={false} className="flex h-full flex-col">
      {/* ============================================
          HEADER
          ============================================ */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Pending Assignments
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Complete your upcoming assignments before the deadline.
          </p>
        </div>

        {/* View All Link */}
        <Link to="/student/assignments">
          <Button
            size="sm"
            variant="ghost"
            tone="student"
            rightIcon={<ArrowRight size={16} />}
          >
            View All
          </Button>
        </Link>
      </div>

      {/* ============================================
          EMPTY STATE
          ============================================ */}
      {pendingAssignments.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300">
          <div className="text-center">
            <BookOpen size={42} className="mx-auto text-slate-400" />
            <p className="mt-4 font-medium text-text-primary">
              No Pending Assignments
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Great job! You're all caught up.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex-1">
          {/* ─── Scrollable List ──────────────────────────────────── */}
          {/* Capped height so the card stays a consistent size
              regardless of how many are pending. */}
          <div className="pending-scroll max-h-[420px] space-y-3 overflow-y-auto pr-1.5">
            {pendingAssignments.map((assignment, index) => {
              const variant = getVariant(assignment.due_date);
              const colors = URGENCY_COLORS[variant];

              return (
                <div
                  key={assignment.id}
                  style={{
                    borderLeftColor: colors[1],
                    animationDelay: `${Math.min(index, 8) * 60}ms`,
                  }}
                  className="group flex flex-col gap-4 rounded-xl border border-slate-200
                             border-l-4 p-4 opacity-0 [animation-fill-mode:forwards]
                             animate-[pending-in_0.5s_ease-out] transition-all duration-200
                             hover:-translate-y-0.5 hover:border-student-primary hover:shadow-sm

                             lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* ─── Left Section ─── */}
                  <div className="flex items-start gap-4">
                    {/* Urgency Icon */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm
                                 transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                    >
                      <BookOpen size={20} strokeWidth={2.25} />
                    </div>

                    <div>
                      {/* Assignment Title */}
                      <h3 className="font-semibold text-text-primary">
                        {assignment.title}
                      </h3>

                      {/* Subject Name */}
                      <p className="mt-1 text-sm text-text-secondary">
                        {assignment.subject_name}
                      </p>

                      {/* Due Date */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-text-secondary">
                        <CalendarDays size={15} />
                        <span>{getDueCopy(assignment.due_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ─── Right Section ─── */}
                  <Badge variant={variant}>{getLabel(assignment.due_date)}</Badge>
                </div>
              );
            })}
          </div>

          {/* ─── Fade Hint ────────────────────────────────────────── */}
          {/* Signals there's more content without needing a visible scrollbar track. */}
          {pendingAssignments.length > 3 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
      )}

      {/* ─── Styles ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes pending-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pending-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .pending-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .pending-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .pending-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .pending-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[pending-in"] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </Card>
  );
};

export default PendingAssignments;