/**
 * ============================================
 * TIMETABLE STATS COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Displays timetable statistics in a grid of cards
 * Features:
 * - Total periods count
 * - Today's classes count
 * - Completed classes count
 * - Remaining classes count
 * - Color-coded icons for each stat type
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Consistent card styling with border and shadow
 * 
 * Dependencies:
 * - lucide-react for icons (Clock, Calendar, CheckCircle, BookOpen)
 * 
 * Usage:
 * <TimetableStats stats={statisticsData} />
 * ============================================
 */

import React from 'react';
import { Clock, Calendar, CheckCircle, BookOpen } from 'lucide-react';

/**
 * ============================================
 * TIMETABLE STATS COMPONENT
 * ============================================
 * 
 * Renders timetable statistics in a visual grid format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing timetable counts
 * @param {number} props.stats.total - Total number of periods
 * @param {number} props.stats.today - Number of today's classes
 * @param {number} props.stats.completed - Number of completed classes
 * @param {number} props.stats.remaining - Number of remaining classes
 * @returns {JSX.Element} Timetable statistics grid
 * 
 * @example
 * const stats = {
 *   total: 30,
 *   today: 6,
 *   completed: 4,
 *   remaining: 2
 * };
 * 
 * <TimetableStats stats={stats} />
 * ============================================
 */
const TimetableStats = ({ stats }) => {
  /**
   * ============================================
   * STAT ITEMS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} statItems
   * @property {string} label - Display label for the stat
   * @property {number} value - The statistic value
   * @property {Component} icon - Lucide icon component
   * @property {string} color - Text color class for the icon
   * @property {string} bg - Background color class for the icon container
   */
  const statItems = [
    {
      label: 'Total Periods',
      value: stats?.total || 0,
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: "Today's Classes",
      value: stats?.today || 0,
      icon: Calendar,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Completed',
      value: stats?.completed || 0,
      icon: CheckCircle,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Remaining',
      value: stats?.remaining || 0,
      icon: Clock,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      {/* ─── Render each stat card ─── */}
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            {/* Icon container with color coding */}
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            {/* Stat label and value */}
            <div>
              <p className="text-sm md:text-base md:text-base text-gray-500 px-4 sm:px-6 lg:px-8">{item.label}</p>
              <p className="text-2xl md:text-3xl font-semibold px-4 sm:px-6 lg:px-8">{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimetableStats;