/**
 * ============================================
 * EMPTY NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Displays an empty state when no notifications are available
 * Features:
 * - BellOff icon with muted styling
 * - Clear title and description
 * - Optional refresh button
 * - Role-based theming
 * - Centered card layout
 * - Responsive design
 * 
 * Dependencies:
 * - lucide-react for icons (BellOff)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for refresh action
 * 
 * Usage:
 * <EmptyNotification role="admin" />
 * ============================================
 */

import { BellOff } from "lucide-react";

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

/**
 * ============================================
 * EMPTY NOTIFICATION COMPONENT
 * ============================================
 * 
 * Renders an empty state for notifications
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Empty notification UI
 * 
 * @example
 * // Admin user with no notifications
 * <EmptyNotification role="admin" />
 * 
 * // Student user with no notifications
 * <EmptyNotification role="student" />
 * ============================================
 */
const EmptyNotification = ({role}) => {
  return (
    <Card className="flex flex-col items-center justify-center py-20" tone={role}>
      {/* ─── Icon ─── */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
        <BellOff
          size={40}
          className="text-text-secondary"
        />
      </div>

      {/* ─── Title ─── */}
      <h2 className="mt-6 text-2xl font-semibold text-text-primary">
        No Notifications
      </h2>

      {/* ─── Description ─── */}
      <p className="mt-3 max-w-md text-center leading-7 text-text-secondary">
        You're all caught up! There are currently no notifications
        available. New announcements and updates will appear here.
      </p>

      {/* ─── Refresh Button ─── */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </Card>
  );
};

export default EmptyNotification;