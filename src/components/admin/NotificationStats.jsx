/**
 * ============================================
 * NOTIFICATION STATS COMPONENT
 * ============================================
 * 
 * Purpose: Displays notification statistics in a grid of cards
 * Features:
 * - Total notifications count
 * - Unread notifications count
 * - Read notifications count
 * - Recipients count
 * - Color-coded icons for each stat type
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Default values when stats are missing
 * 
 * Dependencies:
 * - lucide-react for icons (Bell, Mail, CheckCircle, Users)
 * 
 * Usage:
 * <NotificationStats
 *   stats={notificationStats}
 * />
 * ============================================
 */

import React from 'react';
import { Bell, Mail, CheckCircle, Users } from 'lucide-react';

/**
 * ============================================
 * NOTIFICATION STATS COMPONENT
 * ============================================
 * 
 * Renders notification statistics in a visual grid format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing notification counts
 * @param {number} props.stats.total - Total number of notifications
 * @param {number} props.stats.read - Number of read notifications
 * @param {number} props.stats.unread - Number of unread notifications
 * @param {number} props.stats.recipients - Number of recipients
 * @returns {JSX.Element} Notification statistics grid
 * 
 * @example
 * const stats = {
 *   total: 150,
 *   read: 120,
 *   unread: 30,
 *   recipients: 75
 * };
 * 
 * <NotificationStats stats={stats} />
 * ============================================
 */
const NotificationStats = ({ stats }) => {
  /**
   * ============================================
   * SAFE STATS DEFAULTS
   * ============================================
   * 
   * Ensures stats object has default values to prevent rendering errors
   * when stats are not yet loaded or undefined
   */
  const safeStats = stats || { total: 0, read: 0, unread: 0, recipients: 0 };

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
      label: 'Total Notifications',
      value: safeStats.total || 0,
      icon: Bell,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Unread',
      value: safeStats.unread || 0,
      icon: Mail,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Read',
      value: safeStats.read || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Recipients',
      value: safeStats.recipients || 0,
      icon: Users,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
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

export default NotificationStats;