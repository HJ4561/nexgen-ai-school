/**
 * ============================================
 * COMPLAINT STATS COMPONENT
 * ============================================
 * 
 * Purpose: Displays complaint statistics in a grid of cards
 * Features:
 * - Total complaints count
 * - Pending complaints count
 * - Resolved complaints count
 * - Open complaints count
 * - Color-coded icons for each stat type
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Default values when stats are missing
 * 
 * Dependencies:
 * - lucide-react for icons (AlertTriangle, CheckCircle, Clock, FileText)
 * 
 * Usage:
 * <ComplaintStats
 *   stats={statsData}
 *   latestComplaints={recentComplaints}
 *   onViewAll={handleViewAll}
 *   onViewDetail={handleViewDetail}
 * />
 * ============================================
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

/**
 * ============================================
 * COMPLAINT STATS COMPONENT
 * ============================================
 * 
 * Renders complaint statistics in a visual grid format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing complaint counts
 * @param {number} props.stats.total - Total number of complaints
 * @param {number} props.stats.pending - Number of pending complaints
 * @param {number} props.stats.resolved - Number of resolved complaints
 * @param {number} props.stats.open - Number of open complaints
 * @param {Array} props.latestComplaints - Array of recent complaints (reserved for future use)
 * @param {Function} props.onViewAll - Callback for "View All" action (reserved for future use)
 * @param {Function} props.onViewDetail - Callback for viewing complaint details (reserved for future use)
 * @returns {JSX.Element} Complaint statistics grid
 * 
 * @example
 * const stats = {
 *   total: 45,
 *   pending: 12,
 *   resolved: 28,
 *   open: 5
 * };
 * 
 * <ComplaintStats
 *   stats={stats}
 *   latestComplaints={recentList}
 *   onViewAll={() => navigate('/complaints')}
 *   onViewDetail={(id) => openDrawer(id)}
 * />
 * ============================================
 */
const ComplaintStats = ({ stats, latestComplaints, onViewAll, onViewDetail }) => {
  /**
   * ============================================
   * SAFE STATS DEFAULTS
   * ============================================
   * 
   * Ensures stats object has default values to prevent rendering errors
   * when stats are not yet loaded or undefined
   */
  const safeStats = stats || { total: 0, pending: 0, resolved: 0, open: 0 };

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
      label: 'Total Complaints',
      value: safeStats.total || 0,
      icon: FileText,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: safeStats.pending || 0,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Resolved',
      value: safeStats.resolved || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Open',
      value: safeStats.open || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-4 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      {/* ─── Render each stat card ─── */}
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            {/* Icon container with role-based color */}
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

export default ComplaintStats;