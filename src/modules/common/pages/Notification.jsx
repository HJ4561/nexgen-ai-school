/**
 * ============================================
 * NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Shared notification management page for all roles
 * Used by: Admin, Teacher, Student, Parent modules
 * 
 * Features:
 * - Role-based theming (admin, teacher, student, parent)
 * - Notification statistics overview
 * - Notification filters (All, Unread, Read, Sent)
 * - Notification list with search and pagination
 * - Unread count tracking
 * - Mark read/unread functionality
 * - Responsive layout
 * - Shared across all user roles
 * 
 * Dependencies:
 * - React for state management
 * - Various notification components
 * 
 * Usage:
 * <Notification role="admin" />
 * <Notification role="teacher" />
 * <Notification role="student" />
 * <Notification role="parent" />
 * ============================================
 */

import { useState } from "react";
import NotificationStats from "@/components/admin/NotificationStats";
import NotificationFilters from "@/components/admin/NotificationFilters";
import NotificationList from "@/components/admin/NotificationList";

/**
 * ============================================
 * NOTIFICATION COMPONENT
 * ============================================
 * 
 * Renders the notification management page for any role
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for theming ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Notification management page
 * 
 * @example
 * // Admin notifications
 * <Notification role="admin" />
 * 
 * // Teacher notifications
 * <Notification role="teacher" />
 * 
 * // Student notifications
 * <Notification role="student" />
 * 
 * // Parent notifications
 * <Notification role="parent" />
 * ============================================
 */
const Notification = ({ role }) => {
  // ─── State Management ──────────────────────────────────────────────────

  /**
   * ============================================
   * FILTER STATE
   * ============================================
   * 
   * Controls which notifications to display
   * - 'all': All notifications
   * - 'unread': Only unread notifications
   * - 'read': Only read notifications
   * - 'sent': Only sent notifications
   */
  const [filter, setFilter] = useState("all");

  /**
   * ============================================
   * UNREAD COUNT STATE
   * ============================================
   * 
   * Tracks the number of unread notifications
   * Updated by NotificationList component
   * Used by NotificationFilters for the "Mark All Read" button
   */
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
            <div className="w-full">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Notifications
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                Read your important updates, announcements and reminders.
              </p>
            </div>
            {/* Optional: Add action button here if needed */}
          </div>
        </div>

        {/* ─── Statistics ────────────────────────────────────────────────── */}
        {/* Shows notification counts (total, unread, read, recipients) */}
        <NotificationStats role={role} />

        {/* ─── Filters ──────────────────────────────────────────────────── */}
        {/* Provides filter buttons and search functionality */}
        <NotificationFilters
          role={role}
          filter={filter}
          setFilter={setFilter}
          unreadCount={unreadCount}
        />

        {/* ─── Notification List ────────────────────────────────────────── */}
        {/* Displays notifications with read/unread status and actions */}
        <NotificationList
          role={role}
          filter={filter}
          onUnreadCountChange={setUnreadCount}
        />
      </div>
    </div>
  );
};

export default Notification;