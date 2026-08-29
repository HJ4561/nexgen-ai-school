/**
 * ============================================
 * ATTENDANCE CALENDAR COMPONENT
 * ============================================
 * 
 * Purpose: Displays monthly attendance calendar for parent view
 * Features:
 * - Monthly calendar grid with day navigation
 * - Color-coded attendance status (Present, Absent, Leave)
 * - Month navigation (previous/next/today)
 * - Month statistics summary
 * - Today highlighting
 * - Legend for status colors
 * - Responsive grid layout
 * - Parent role theming
 * 
 * Dependencies:
 * - lucide-react for icons (ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock3)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <AttendanceCalendar />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * CONSTANTS
 * ============================================
 * 
 * Week day names and month names for calendar display
 */
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * ============================================
 * ATTENDANCE CALENDAR COMPONENT
 * ============================================
 * 
 * Renders a monthly attendance calendar for parents
 * 
 * @returns {JSX.Element} Attendance calendar UI
 * 
 * @example
 * // In parent dashboard
 * <AttendanceCalendar />
 * ============================================
 */
const AttendanceCalendar = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const { attendance, parentLinks, selectedChild } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * SELECTED CHILD
   * ============================================
   * 
   * Finds the current child data from parentLinks
   * based on the selectedChild ID
   */
  const currentChild = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * VIEWED MONTH (Navigable)
   * ============================================
   * 
   * State for the currently viewed month
   * Defaults to today's month
   */
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  /**
   * ============================================
   * MONTH NAVIGATION
   * ============================================
   * 
   * Functions to navigate between months
   * - goToPrevMonth: Move to previous month
   * - goToNextMonth: Move to next month
   * - goToToday: Jump back to current month
   */
  const goToPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

  /**
   * ============================================
   * ATTENDANCE MAP
   * ============================================
   * 
   * Creates a lookup map of date → status for quick access
   * Filters by the current child's name
   */
  const attendanceMap = useMemo(() => {
    const map = {};
    attendance
      .filter((item) => item.student_name === currentChild?.student_name)
      .forEach((item) => {
        map[item.date] = item.status;
      });
    return map;
  }, [attendance, currentChild]);

  /**
   * ============================================
   * CALENDAR GRID
   * ============================================
   * 
   * Builds the calendar grid with proper alignment
   * - First day offset (0 = Sunday)
   * - Days in month
   * - Null cells for empty days
   */
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  /**
   * ============================================
   * DATE KEY BUILDER
   * ============================================
   * 
   * Builds a date key in YYYY-MM-DD format for lookup
   * 
   * @param {number} day - Day of the month
   * @returns {string} Formatted date key
   */
  const buildDateKey = (day) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  /**
   * ============================================
   * TODAY CHECK
   * ============================================
   * 
   * Checks if a given day is today
   * 
   * @param {number} day - Day of the month
   * @returns {boolean} True if the day is today
   */
  const isToday = (day) => isCurrentMonth && day === today.getDate();

  /**
   * ============================================
   * MONTH STATS
   * ============================================
   * 
   * Calculates attendance statistics for the current month
   * Counts Present, Absent, and Leave days
   */
  const monthStats = useMemo(() => {
    const stats = { Present: 0, Absent: 0, Leave: 0 };
    for (let day = 1; day <= daysInMonth; day++) {
      const status = attendanceMap[buildDateKey(day)];
      if (status && stats[status] !== undefined) {
        stats[status] += 1;
      }
    }
    return stats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceMap, daysInMonth, month, year]);

  /**
   * ============================================
   * STATUS STYLING
   * ============================================
   * 
   * Returns Tailwind classes for a given day based on attendance status
   * - Present: Green
   * - Absent: Red
   * - Leave: Yellow
   * - No Record: Default (surface)
   * 
   * @param {number} day - Day of the month
   * @returns {string} CSS classes
   */
  const getStatusClass = (day) => {
    const status = attendanceMap[buildDateKey(day)];

    if (status === "Present")
      return "bg-green-500 text-white shadow-sm shadow-green-500/30 hover:bg-green-600";
    if (status === "Absent")
      return "bg-red-500 text-white shadow-sm shadow-red-500/30 hover:bg-red-600";
    if (status === "Leave")
      return "bg-yellow-400 text-white shadow-sm shadow-yellow-400/30 hover:bg-yellow-500";
    return "bg-surface text-text-primary hover:bg-parent-primary/10";
  };

  return (
    <Card>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Monthly Calendar
          </h2>
          <p className="text-sm text-text-secondary">
            Attendance overview
          </p>
        </div>

        {/* ─── Month Navigator ────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-full border border-parent-border bg-surface p-1">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-parent-primary/10 hover:text-parent-primary"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="min-w-[9rem] rounded-full px-3 py-1.5 text-center text-sm font-semibold text-text-primary transition-colors hover:bg-parent-primary/10"
          >
            {monthNames[month]} {year}
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-parent-primary/10 hover:text-parent-primary"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ─── Month Stats ──────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatPill
          icon={<CheckCircle2 size={16} />}
          label="Present"
          value={monthStats.Present}
          tone="text-green-600 bg-green-50 border-green-100"
        />
        <StatPill
          icon={<XCircle size={16} />}
          label="Absent"
          value={monthStats.Absent}
          tone="text-red-600 bg-red-50 border-red-100"
        />
        <StatPill
          icon={<Clock3 size={16} />}
          label="Leave"
          value={monthStats.Leave}
          tone="text-yellow-700 bg-yellow-50 border-yellow-100"
        />
      </div>

      {/* ─── Week Days ────────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-1.5 text-center text-[11px] sm:text-sm font-semibold uppercase tracking-wide text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* ─── Calendar Grid ────────────────────────────────────── */}
      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
        {cells.map((day, index) =>
          day ? (
            <div
              key={index}
              className={`
                relative
                flex h-9 sm:h-12
                items-center
                justify-center
                rounded-lg
                text-xs sm:text-sm
                font-semibold
                transition-all
                duration-150
                cursor-default
                ${getStatusClass(day)}
                ${
                  isToday(day)
                    ? "ring-2 ring-parent-primary ring-offset-1 ring-offset-surface"
                    : ""
                }
              `}
            >
              {day}
            </div>
          ) : (
            <div key={index} className="h-9 sm:h-12" />
          )
        )}
      </div>

      {/* ─── Legend ────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-parent-border pt-5">
        <Legend color="bg-green-500" text="Present" />
        <Legend color="bg-red-500" text="Absent" />
        <Legend color="bg-yellow-400" text="Leave" />
        <Legend color="bg-slate-200" text="No Record" />
      </div>
    </Card>
  );
};

/**
 * ============================================
 * STAT PILL SUB-COMPONENT
 * ============================================
 * 
 * Displays a statistic with icon and value
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.label - Statistic label
 * @param {number} props.value - Statistic value
 * @param {string} props.tone - Color classes
 * @returns {JSX.Element} Stat pill UI
 */
function StatPill({ icon, label, value, tone }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${tone}`}
    >
      {icon}
      <div className="leading-tight">
        <p className="text-base font-bold">{value}</p>
        <p className="text-[11px] font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
}

/**
 * ============================================
 * LEGEND SUB-COMPONENT
 * ============================================
 * 
 * Displays a color legend item
 * 
 * @param {Object} props - Component props
 * @param {string} props.color - Background color class
 * @param {string} props.text - Legend text
 * @returns {JSX.Element} Legend item UI
 */
function Legend({ color, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  );
}

export default AttendanceCalendar;