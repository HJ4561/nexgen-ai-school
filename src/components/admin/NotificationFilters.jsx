/**
 * ============================================
 * NOTIFICATION FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for Notification Management
 * Provides:
 * - Filter buttons (All, Unread, Read, Sent)
 * - Search input for notifications
 * - Mark All Read button with unread count
 * - Responsive layout with flexible wrapping
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Search, CheckCircle)
 * - @/components/ui/Button for filter and action buttons
 * 
 * Usage:
 * <NotificationFilters
 *   filter={filter}
 *   setFilter={setFilter}
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 *   unreadCount={unreadCount}
 *   onMarkAllRead={handleMarkAllRead}
 * />
 * ============================================
 */

import { Search, CheckCircle } from 'lucide-react';
import Button from "@/components/ui/Button";

/**
 * ============================================
 * NOTIFICATION FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for notification management
 * 
 * @param {Object} props - Component props
 * @param {string} props.filter - Current filter value ('all' | 'unread' | 'read' | 'sent')
 * @param {Function} props.setFilter - Setter function for filter state
 * @param {string} props.searchTerm - Current search query value
 * @param {Function} props.setSearchTerm - Setter function for search state
 * @param {number} props.unreadCount - Number of unread notifications
 * @param {Function} props.onMarkAllRead - Callback function to mark all notifications as read
 * @returns {JSX.Element} Notification filters UI
 * 
 * @example
 * const [filter, setFilter] = useState('all');
 * const [searchTerm, setSearchTerm] = useState('');
 * const unreadCount = 5;
 * 
 * <NotificationFilters
 *   filter={filter}
 *   setFilter={setFilter}
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 *   unreadCount={unreadCount}
 *   onMarkAllRead={() => markAllNotificationsAsRead()}
 * />
 * ============================================
 */
export default function NotificationFilters({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  unreadCount,
  onMarkAllRead,
}) {
  /**
   * ============================================
   * FILTER OPTIONS
   * ============================================
   * 
   * Available filter options for notifications
   * Each option renders as a toggle button
   * 
   * @constant {Array} filterOptions
   */
  const filterOptions = ['all', 'unread', 'read', 'sent'];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      {/* ─── Filter Buttons ─── */}
      <div className="flex flex-wrap gap-1">
        {filterOptions.map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            tone="admin"
            size="sm"
            className="capitalize"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f}
          </Button>
        ))}
      </div>

      {/* ─── Search and Actions ─── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="pl-9 pr-4 py-1.5 bg-surface-muted border-none rounded-lg text-sm focus:ring-2 focus:ring-admin-primary/20 outline-none w-48 md:w-64"
          />
        </div>

        {/* Mark All Read Button (conditional) */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            tone="admin"
            size="sm"
            leftIcon={<CheckCircle size={14} />}
            onClick={onMarkAllRead}
          >
            Mark All Read
          </Button>
        )}
      </div>
    </div>
  );
}