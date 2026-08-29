/**
 * ============================================
 * MONTHLY SUMMARY COMPONENT
 * ============================================
 * 
 * Purpose: Displays monthly attendance summary for parent view
 * Features:
 * - Present days count
 * - Absent days count
 * - Leave days count
 * - Overall attendance percentage
 * - Color-coded icons and backgrounds
 * - Responsive grid layout
 * - Hover effects on cards
 * - Role-based theming (parent primary color)
 * 
 * Dependencies:
 * - lucide-react for icons (CheckCircle2, XCircle, Clock3, Percent)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <MonthlySummary />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Percent,
} from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * MONTHLY SUMMARY COMPONENT
 * ============================================
 * 
 * Renders monthly attendance summary in a visual card grid
 * 
 * @returns {JSX.Element} Monthly summary UI
 * 
 * @example
 * // In parent dashboard
 * <MonthlySummary />
 * ============================================
 */
const MonthlySummary = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    attendance,
    parentLinks,
    selectedChild,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * SELECTED CHILD
   * ============================================
   * 
   * Finds the current child data from parentLinks
   * based on the selectedChild ID
   */
  const currentChild = parentLinks.find(
    (child) => child.student === selectedChild
  );

  /**
   * ============================================
   * ATTENDANCE SUMMARY
   * ============================================
   * 
   * Calculates attendance statistics for the selected child:
   * - present: Number of Present days
   * - absent: Number of Absent days
   * - leave: Number of Leave days
   * - percentage: Overall attendance percentage
   * 
   * Returns default values if no child is selected
   */
  const summary = useMemo(() => {
    // Return default values if no child is selected
    if (!currentChild) {
      return {
        present: 0,
        absent: 0,
        leave: 0,
        percentage: 0,
      };
    }

    // Filter attendance records for the selected child
    const records = attendance.filter(
      (item) => item.student_name === currentChild.student_name
    );

    // Count by status
    const present = records.filter(
      (item) => item.status === "Present"
    ).length;

    const absent = records.filter(
      (item) => item.status === "Absent"
    ).length;

    const leave = records.filter(
      (item) => item.status === "Leave"
    ).length;

    const total = records.length;

    // Calculate attendance percentage
    return {
      present,
      absent,
      leave,
      percentage:
        total === 0
          ? 0
          : Math.round((present / total) * 100),
    };
  }, [attendance, currentChild]);

  /**
   * ============================================
   * STAT CARDS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} stats
   * @property {string} title - Display label for the stat
   * @property {number|string} value - The statistic value
   * @property {Component} icon - Lucide icon component
   * @property {string} bg - Background color class for the card
   * @property {string} iconBg - Background color class for the icon container
   * @property {string} color - Text color class for the icon
   */
  const stats = [
    {
      title: "Present",
      value: summary.present,
      icon: CheckCircle2,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      color: "text-green-600",
    },
    {
      title: "Absent",
      value: summary.absent,
      icon: XCircle,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      color: "text-red-600",
    },
    {
      title: "Leave",
      value: summary.leave,
      icon: Clock3,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Attendance",
      value: `${summary.percentage}%`,
      icon: Percent,
      bg: "bg-parent-primary/5",
      iconBg: "bg-parent-primary/10",
      color: "text-parent-primary",
    },
  ];

  return (
    <Card hover={false}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg md:text-xl md:text-2xl font-semibold text-text-primary sm:text-xl md:text-2xl md:text-2xl px-4 sm:px-6 lg:px-8">
          Monthly Summary
        </h2>

        <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
          Overview of your child's attendance performance.
        </p>
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 px-4 sm:px-6 lg:px-8">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`
                flex flex-col md:flex-row items-center justify-between
                rounded-xl border border-border
                p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 transition-all duration-200
                hover:shadow-sm
                ${item.bg}
              `}
            >
              <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 min-w-0 px-4 sm:px-6 lg:px-8">
                {/* ─── Icon Container ─── */}
                <div
                  className={`
                    flex flex-col md:flex-row h-12 w-12 shrink-0 items-center justify-center
                    rounded-xl
                    ${item.iconBg}
                  `}
                >
                  <Icon
                    size={22}
                    className={item.color}
                  />
                </div>

                {/* ─── Label and Value ─── */}
                <div className="min-w-0 px-4 sm:px-6 lg:px-8">
                  <p className="text-xs font-medium text-text-secondary sm:text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8">
                    {item.title}
                  </p>

                  <h3 className="mt-1 text-lg md:text-xl md:text-2xl font-bold text-text-primary sm:text-xl md:text-2xl md:text-2xl px-4 sm:px-6 lg:px-8">
                    {item.value}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MonthlySummary;