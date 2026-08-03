/**
 * ============================================
 * ATTENDANCE STATS COMPONENT (PARENT VIEW)
 * ============================================
 * 
 * Purpose: Displays attendance statistics summary for parent view
 * Features:
 * - Present days count
 * - Absent days count
 * - Leave days count
 * - Overall attendance percentage
 * - Color-coded icons for each stat type
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Card container with hover effect disabled
 * - Parent role theming
 * 
 * Dependencies:
 * - lucide-react for icons (CheckCircle2, XCircle, Clock3, Percent)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <AttendanceStats />
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

import Card from "@/components/ui/Card";

/**
 * ============================================
 * ATTENDANCE STATS COMPONENT (PARENT VIEW)
 * ============================================
 * 
 * Renders attendance statistics in a visual card grid
 * 
 * @returns {JSX.Element} Attendance statistics grid
 * 
 * @example
 * // In parent dashboard
 * <AttendanceStats />
 * ============================================
 */
const AttendanceStats = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    attendance = [],
    parentLinks = [],
    selectedChild,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * based on the selectedChild ID
   */
  const currentChild = parentLinks.find(
    (child) => child.student === selectedChild
  );

  /**
   * ============================================
   * STATS CALCULATION
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
  const stats = useMemo(() => {
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
      (r) => r.status === "Present"
    ).length;

    const absent = records.filter(
      (r) => r.status === "Absent"
    ).length;

    const leave = records.filter(
      (r) => r.status === "Leave"
    ).length;

    // Calculate attendance percentage
    const percentage = records.length
      ? Math.round((present / records.length) * 100)
      : 0;

    return {
      present,
      absent,
      leave,
      percentage,
    };
  }, [attendance, currentChild]);

  /**
   * ============================================
   * STAT CARDS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} cards
   * @property {string} title - Display label for the stat
   * @property {number|string} value - The statistic value
   * @property {Component} icon - Lucide icon component
   * @property {string} color - Text color class for the icon
   * @property {string} bg - Background color class for the icon container
   */
  const cards = [
    {
      title: "Present",
      value: stats.present,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Absent",
      value: stats.absent,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Leave",
      value: stats.leave,
      icon: Clock3,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Attendance",
      value: `${stats.percentage}%`,
      icon: Percent,
      color: "text-parent-primary",
      bg: "bg-parent-primary/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* ─── Render each stat card ─── */}
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} hover={false}>
            <div className="flex items-center justify-between">
              {/* Stat label and value */}
              <div>
                <p className="text-sm text-text-secondary">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {card.value}
                </h2>
              </div>

              {/* Icon container with color coding */}
              <div className={`rounded-xl p-3 ${card.bg}`}>
                <Icon size={24} className={card.color} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default AttendanceStats;