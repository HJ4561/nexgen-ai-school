/**
 * ============================================
 * ATTENDANCE SUMMARY CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays attendance performance summary for the selected child
 * Features:
 * - Overall attendance percentage
 * - Multi-status circular progress ring (Present, Absent, Late, Leave)
 * - Status breakdown counts with color-coded cards
 * - Recent attendance trend strip (last 14 records)
 * - Role-based theming (parent primary color)
 * - Responsive card layout
 * - Dynamic grid for status counts
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <AttendanceSummaryCard />
 * ============================================
 */

import React from 'react';
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CalendarDays } from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * STATUS STYLES
 * ============================================
 * 
 * Maps attendance status to visual styles
 * - Present: Green
 * - Absent: Red
 * - Late: Amber
 * - Leave: Indigo
 * - Fallback: Slate (for unknown statuses)
 * 
 * @constant {Object} STATUS_STYLES
 * @constant {Object} FALLBACK_STYLE
 */
const STATUS_STYLES = {
  Present: { ring: "#22c55e", bg: "bg-green-50", text: "text-green-600", strong: "text-green-700" },
  Absent: { ring: "#ef4444", bg: "bg-red-50", text: "text-red-600", strong: "text-red-700" },
  Late: { ring: "#f59e0b", bg: "bg-amber-50", text: "text-amber-600", strong: "text-amber-700" },
  Leave: { ring: "#6366f1", bg: "bg-indigo-50", text: "text-indigo-600", strong: "text-indigo-700" },
};

const FALLBACK_STYLE = { ring: "#94a3b8", bg: "bg-slate-50", text: "text-slate-600", strong: "text-slate-700" };

/**
 * ============================================
 * ATTENDANCE SUMMARY CARD COMPONENT
 * ============================================
 * 
 * Renders attendance performance with visual metrics
 * 
 * @returns {JSX.Element} Attendance summary card UI
 * 
 * @example
 * // In parent dashboard
 * <AttendanceSummaryCard />
 * ============================================
 */
const AttendanceSummaryCard = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves attendance, selectedChild, and parentLinks from Redux store
   */
  const { attendance, selectedChild, parentLinks } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * SELECTED STUDENT
   * ============================================
   * 
   * Finds the current student from parentLinks
   */
  const selectedStudent = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * ATTENDANCE FOR SELECTED CHILD
   * ============================================
   * 
   * Filters attendance records for the selected student
   */
  const childAttendance = useMemo(() => {
    if (!selectedStudent) return [];
    return attendance.filter(
      (item) => item.student_name === selectedStudent.student_name
    );
  }, [attendance, selectedStudent]);

  /**
   * ============================================
   * RECENT ATTENDANCE (Trend Strip)
   * ============================================
   * 
   * Sorts attendance by date (newest first)
   * Takes last 14 records and reverses for chronological display
   * Used for the visual trend strip
   */
  const recentAttendance = useMemo(() => {
    return [...childAttendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 14)
      .reverse();
  }, [childAttendance]);

  /**
   * ============================================
   * CALCULATIONS
   * ============================================
   * 
   * - totalDays: Total number of attendance records
   * - statusCounts: Object with count per status
   * - presentDays: Number of present days
   * - percentage: Attendance percentage
   */
  const totalDays = childAttendance.length;

  const statusCounts = useMemo(() => {
    return childAttendance.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [childAttendance]);

  const presentDays = statusCounts.Present || 0;

  const percentage =
    totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

  /**
   * ============================================
   * MULTI-SEGMENT PROGRESS RING
   * ============================================
   * 
   * Builds a circular progress ring with segments for each status
   * Each status gets its own colored arc proportional to its count
   * 
   * - radius: 55px
   * - circumference: 2 * PI * radius
   * - Each segment: fraction * circumference for dasharray
   * - Cumulative offset for proper positioning
   */
  const radius = 55;
  const circumference = 2 * Math.PI * radius;

  const statusEntries = Object.entries(statusCounts);

  // Build cumulative offsets so each status gets its own arc segment
  let cumulative = 0;
  const segments = statusEntries.map(([status, count]) => {
    const fraction = totalDays === 0 ? 0 : count / totalDays;
    const dash = fraction * circumference;
    const segment = {
      status,
      color: (STATUS_STYLES[status] || FALLBACK_STYLE).ring,
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -cumulative,
    };
    cumulative += dash;
    return segment;
  });

  return (
    <Card className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-parent-primary/10 p-3">
          <CalendarDays size={22} className="text-parent-primary" />
        </div>

        <div>
          <h3 className="font-semibold text-text-primary">
            Attendance Performance
          </h3>

          <p className="text-sm text-text-secondary">Current Session</p>
        </div>
      </div>

      {totalDays === 0 ? (
        // ─── Empty State ──────────────────────────────────────────
        <p className="mt-8 text-sm text-text-secondary">
          No attendance records yet for this child.
        </p>
      ) : (
        <>
          {/* ─── Percentage + Ring ─────────────────────────────────── */}

          <div className="mt-8 flex items-center justify-between">
            {/* Left: Percentage Details */}
            <div>
              <p className="text-sm text-text-secondary">Attendance</p>

              <h2 className="mt-2 text-4xl font-bold text-parent-primary">
                {percentage}%
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                {presentDays} / {totalDays} Days Present
              </p>
            </div>

            {/* ─── Multi-status Circular Progress ─── */}
            <div className="relative h-36 w-36">
              <svg className="-rotate-90" width="140" height="140">
                {/* Background circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="10"
                  fill="transparent"
                />

                {/* Status segments */}
                {segments.map((seg) => (
                  <circle
                    key={seg.status}
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={seg.color}
                    strokeWidth="10"
                    fill="transparent"
                    strokeLinecap="butt"
                    strokeDasharray={seg.dasharray}
                    strokeDashoffset={seg.dashoffset}
                  />
                ))}
              </svg>

              {/* Center percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
            </div>
          </div>

          {/* ─── Recent Trend Strip ──────────────────────────────── */}
          {recentAttendance.length > 0 && (
            <div className="mt-8">
              <p className="mb-2 text-xs font-medium text-text-secondary">
                Last {recentAttendance.length} Records
              </p>

              <div className="flex items-end gap-1">
                {recentAttendance.map((item) => {
                  const style = STATUS_STYLES[item.status] || FALLBACK_STYLE;
                  return (
                    <div
                      key={item.id}
                      title={`${item.date} — ${item.status}`}
                      className="h-8 flex-1 rounded-sm transition hover:opacity-70"
                      style={{ backgroundColor: style.ring }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Bottom Stats ────────────────────────────────────── */}
          <div
            className="mt-8 grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                statusEntries.length,
                4
              )}, minmax(0, 1fr))`,
            }}
          >
            {statusEntries.map(([status, count]) => {
              const style = STATUS_STYLES[status] || FALLBACK_STYLE;
              return (
                <div
                  key={status}
                  className={`rounded-xl ${style.bg} p-4 text-center`}
                >
                  <p className={`text-sm ${style.text}`}>{status}</p>
                  <h4 className={`mt-2 text-2xl font-bold ${style.strong}`}>
                    {count}
                  </h4>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
};

export default AttendanceSummaryCard;