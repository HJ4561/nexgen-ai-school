/**
 * ============================================
 * RECENT ACTIVITY COMPONENT
 * ============================================
 * 
 * Purpose: Display recent teacher join activities
 * Features:
 * - Shows recently joined teachers (max 3)
 * - Animated list with stagger effect
 * - Teacher name and specialization display
 * - Join date with formatting
 * - Color-coded with teacher theme
 * - Scrollable container with max height
 * - Empty state handling
 * - Hover effects with elevation
 * 
 * Dependencies:
 * - lucide-react for icons (History, UserPlus)
 * - framer-motion for animations
 * - @/utils/helpers for date formatting
 * 
 * Usage:
 * <RecentActivity teachers={teachersList} />
 * ============================================
 */

import { useMemo } from "react";
import { History, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/helpers";

/**
 * ============================================
 * ICON MAPPING
 * ============================================
 * 
 * Maps activity types to their icon and color configuration
 * 
 * @constant {Object} iconMap
 * @property {Component} icon - Lucide icon component
 * @property {string} color - Color key for text color
 * @property {string} bg - Color key for background
 */
const iconMap = {
  teacher_joined: { icon: UserPlus, color: "teacher", bg: "teacher-light" },
};

/**
 * ============================================
 * RECENT ACTIVITY COMPONENT
 * ============================================
 * 
 * Renders a list of recent teacher join activities with animations
 * 
 * @param {Object} props - Component props
 * @param {Array} props.teachers - Array of teacher objects
 * @param {string} props.teachers.full_name - Teacher's full name
 * @param {string} props.teachers.specialization - Teacher's specialization
 * @param {string} props.teachers.joining_date - Teacher's join date
 * @returns {JSX.Element} Recent activity list UI
 * 
 * @example
 * const teachers = [
 *   { id: 1, full_name: 'John Doe', specialization: 'Mathematics', joining_date: '2024-01-15' },
 *   { id: 2, full_name: 'Jane Smith', specialization: 'Science', joining_date: '2024-01-14' }
 * ];
 * 
 * <RecentActivity teachers={teachers} />
 * ============================================
 */
export default function RecentActivity({ teachers }) {
  /**
   * ============================================
   * ACTIVITIES GENERATION
   * ============================================
   * 
   * Processes teacher data to generate activity items
   * - Filters teachers with joining_date
   * - Sorts by joining_date (newest first)
   * - Limits to 3 most recent
   * - Creates activity items with type, message, and timestamp
   */
  const activities = useMemo(() => {
    const items = [];
    const sortedTeachers = [...teachers]
      .filter((t) => t.joining_date)
      .sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date))
      .slice(0, 3);

    sortedTeachers.forEach((t) => {
      items.push({
        type: "teacher_joined",
        message: `${t.full_name} joined as ${t.specialization || "Teacher"}`,
        timestamp: t.joining_date,
      });
    });
    return items;
  }, [teachers]);

  return (
    <div className="space-y-3 px-4 sm:px-6 lg:px-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
        <History size={16} className="text-[var(--color-admin-primary)] px-4 sm:px-6 lg:px-8" />
        <h4 className="text-sm md:text-base md:text-base font-semibold text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
          Recently Joined Teachers
        </h4>
      </div>

      {/* ─── Activity List ─── */}
      <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-hide px-4 sm:px-6 lg:px-8">
        {activities.length === 0 ? (
          // ─── Empty State ───
          <p className="text-sm md:text-base md:text-base text-[var(--color-text-muted)] text-center py-4 px-4 sm:px-6 lg:px-8">
            No teachers joined yet
          </p>
        ) : (
          // ─── Activity Items ───
          activities.map((activity, index) => {
            const meta = iconMap[activity.type];
            const Icon = meta.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex flex-col md:flex-row items-start gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 p-2.5 rounded-lg bg-[var(--color-teacher-light)] border border-[var(--color-teacher-primary)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 px-4 sm:px-6 lg:px-8"
              >
                {/* ─── Activity Icon ─── */}
                <div
                  className={`w-8 h-8 rounded-full bg-[var(--color-${meta.bg})] flex flex-col md:flex-row items-center justify-center shrink-0`}
                >
                  <Icon
                    size={14}
                    className={`text-[var(--color-${meta.color}-primary)]`}
                  />
                </div>
                
                {/* ─── Activity Content ─── */}
                <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
                  <p className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                    {activity.message}
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}