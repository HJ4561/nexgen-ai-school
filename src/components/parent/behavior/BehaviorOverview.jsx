/**
 * ============================================
 * BEHAVIOR OVERVIEW COMPONENT
 * ============================================
 * 
 * Purpose: Displays behavior statistics summary for parent view
 * Features:
 * - Total behavior logs count
 * - Low severity count (Green)
 * - Medium severity count (Yellow)
 * - High severity count (Red)
 * - Color-coded icons and backgrounds
 * - Responsive grid layout (1/2/4 columns)
 * - Role-based theming (parent primary color)
 * 
 * Dependencies:
 * - lucide-react for icons (ClipboardList, ShieldCheck, AlertTriangle, ShieldAlert)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <BehaviorOverview />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  ClipboardList,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * BEHAVIOR OVERVIEW COMPONENT
 * ============================================
 * 
 * Renders behavior statistics in a visual card grid
 * 
 * @returns {JSX.Element} Behavior overview UI
 * 
 * @example
 * // In parent dashboard
 * <BehaviorOverview />
 * ============================================
 */
const BehaviorOverview = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    behaviorLogs = [],
    parentLinks = [],
    selectedChild,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * CHILD LOGS
   * ============================================
   * 
   * Filters behavior logs for the selected child
   */
  const childLogs = useMemo(() => {
    if (!currentChild) return [];
    return behaviorLogs.filter(
      (log) => log.student_name === currentChild.student_name
    );
  }, [behaviorLogs, currentChild]);

  /**
   * ============================================
   * STATISTICS
   * ============================================
   * 
   * Calculates behavior statistics for the selected child:
   * - total: Total number of behavior logs
   * - low: Number of Low severity logs
   * - medium: Number of Medium severity logs
   * - high: Number of High severity logs
   */
  const stats = useMemo(() => {
    return {
      total: childLogs.length,
      low: childLogs.filter((log) => log.severity === "Low").length,
      medium: childLogs.filter((log) => log.severity === "Medium").length,
      high: childLogs.filter((log) => log.severity === "High").length,
    };
  }, [childLogs]);

  /**
   * ============================================
   * STAT CARDS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} cards
   * @property {string} title - Display label for the stat
   * @property {number} value - The statistic value
   * @property {Component} icon - Lucide icon component
   * @property {string} color - Text color class for the icon
   * @property {string} bg - Background color class for the icon container
   */
  const cards = [
    {
      title: "Total Logs",
      value: stats.total,
      icon: ClipboardList,
      color: "text-parent-primary",
      bg: "bg-parent-primary/10",
    },
    {
      title: "Low Severity",
      value: stats.low,
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Medium Severity",
      value: stats.medium,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "High Severity",
      value: stats.high,
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

                <h3 className="mt-2 text-3xl font-bold text-text-primary">
                  {card.value}
                </h3>
              </div>

              {/* Icon container with color coding */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.bg}`}
              >
                <Icon size={24} className={card.color} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BehaviorOverview;