/**
 * ============================================
 * TIMETABLE INSIGHTS COMPONENT
 * ============================================
 * 
 * Purpose: Display timetable insights and quick actions
 * Used by: Teacher - Timetable Management page
 * 
 * Features:
 * - Today's teaching load with progress bar
 * - Up next class display
 * - Quick action buttons (Take Attendance, Mark Grades)
 * - Responsive grid layout
 * - Role-based theming
 * 
 * Dependencies:
 * - React Router for navigation
 * - Button component for actions
 * - Lucide React icons
 * ============================================
 */

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * TimetableInsights Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.upNext - Next upcoming class (null if none)
 * @param {number} props.progressPercent - Today's progress percentage
 * @param {number} props.todayCount - Number of classes today
 * @returns {JSX.Element} Rendered insights panel
 * 
 * @example
 * <TimetableInsights
 *   upNext={upNext}
 *   progressPercent={65}
 *   todayCount={6}
 * />
 */
export default function TimetableInsights({ upNext, progressPercent, todayCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ── Today's Load ─────────────────────── */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-soft">
        <h4 className="font-headline-md text-headline-md text-on-surface">
          Today's Load
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {todayCount} teaching hours scheduled today.
        </p>
        <div className="mt-4">
          <div className="flex justify-between text-label-xs font-bold">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-teacher-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Up Next & Quick Actions ──────────── */}
      <div className="bg-teacher-primary/80 rounded-xl p-5 shadow-soft text-on-primary">
        <div className="flex items-center gap-2 text-[var(--color-surface)]">
          <ChevronRight size={18} />
          <h4 className="font-label-sm font-bold uppercase tracking-wider">
            Up Next
          </h4>
        </div>

        {upNext ? (
          <>
            <h3 className="font-headline-lg text-headline-lg font-bold mt-1">
              {upNext.subjectName}
            </h3>
            <p className="font-body-sm text-body-sm text-on-primary/80">
              {upNext.className} • {upNext.startSlot}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/teacher/attendance">
                <Button
                  variant="primary"
                  tone="teacher"
                  className="bg-on-primary text-teacher-primary hover:bg-white/90"
                >
                  Take Attendance
                </Button>
              </Link>
              <Link to="/teacher/grades">
                <Button
                  variant="outline"
                  tone="teacher"
                  className="border-on-primary text-on-primary hover:bg-on-primary/10"
                >
                  Mark Grades
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-body-sm text-body-sm text-white/80 mt-1">
              No more classes today
            </p>
            {/* Quick action buttons even when no upcoming class */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Link to="/teacher/attendance">
                <Button
                  variant="primary"
                  tone="teacher"
                  className="bg-on-primary text-teacher-primary hover:bg-white/90"
                >
                  Take Attendance
                </Button>
              </Link>
              <Link to="/teacher/grades">
                <Button
                  variant="outline"
                  tone="teacher"
                  className="border-on-primary text-on-primary hover:bg-on-primary/10"
                >
                  Mark Grades
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}















