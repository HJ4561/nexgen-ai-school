/**
 * ============================================
 * NOTIFICATION DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Displays detailed information about a notification in a modal
 * Features:
 * - Sender information with avatar
 * - Notification type with icon
 * - Read/Unread status badge
 * - Creation date and time
 * - Full message content
 * - Role-based styling
 * - Responsive modal layout
 * 
 * Dependencies:
 * - lucide-react for icons (Bell, Mail, CalendarDays, User)
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicator
 * 
 * Usage:
 * <NotificationDetailsModal
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   notification={selectedNotification}
 *   role="admin"
 * />
 * ============================================
 */

import {
  Bell,
  Mail,
  CalendarDays,
  User,
} from "lucide-react";

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

/**
 * ============================================
 * NOTIFICATION DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal with detailed notification information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Object} props.notification - Notification object with all details
 * @param {string} props.notification.sender_name - Name of the notification sender
 * @param {string} props.notification.type - Type of notification (email, bell, etc.)
 * @param {string} props.notification.message - Notification message content
 * @param {boolean} props.notification.is_read - Whether notification has been read
 * @param {string} props.notification.created_at - Creation timestamp
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element|null} Notification details modal or null if no notification
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedNotification, setSelectedNotification] = useState(null);
 * 
 * <NotificationDetailsModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   notification={selectedNotification}
 *   role="admin"
 * />
 * ============================================
 */
const NotificationDetailsModal = ({
  open,
  onClose,
  notification,
  role,
}) => {
  // Return null if no notification is selected
  if (!notification) return null;

  /**
   * ============================================
   * NOTIFICATION DATA DESTRUCTURING
   * ============================================
   * 
   * Extracts relevant fields from the notification object
   */
  const {
    sender_name,
    type,
    message,
    is_read,
    created_at,
  } = notification;

  /**
   * ============================================
   * GET ICON BY TYPE
   * ============================================
   * 
   * Returns the appropriate icon based on notification type
   * Falls back to Bell icon for unknown types
   * 
   * @returns {JSX.Element} Icon component
   */
  const getIcon = () => {
    switch (type) {
      case "email":
        return (
          <Mail
            size={22}
            className="text-brand-primary"
          />
        );

      default:
        return (
          <Bell
            size={22}
            className="text-brand-primary"
          />
        );
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notification Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* ─── Header Section ─── */}
        <div className="flex items-center gap-4 rounded-xl bg-surface-muted p-5">
          {/* Icon with background */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-light">
            {getIcon()}
          </div>

          {/* Title and Status */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Notification
            </h3>

            <Badge
              color={
                is_read
                  ? "neutral"
                  : "primary"
              }
            >
              {is_read ? "Read" : "Unread"}
            </Badge>
          </div>
        </div>

        {/* ─── Sender ─── */}
        <div className="flex items-center gap-3">
          <User
            size={18}
            className="text-text-secondary"
          />

          <div>
            <p className="text-sm text-text-secondary">
              Sender
            </p>

            <p className="font-medium text-text-primary">
              {sender_name}
            </p>
          </div>
        </div>

        {/* ─── Type ─── */}
        <div className="flex items-center gap-3">
          {getIcon()}

          <div>
            <p className="text-sm text-text-secondary">
              Type
            </p>

            <p className="font-medium capitalize text-text-primary">
              {type}
            </p>
          </div>
        </div>

        {/* ─── Date ─── */}
        <div className="flex items-center gap-3">
          <CalendarDays
            size={18}
            className="text-text-secondary"
          />

          <div>
            <p className="text-sm text-text-secondary">
              Date
            </p>

            <p className="font-medium text-text-primary">
              {new Date(
                created_at
              ).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ─── Message ─── */}
        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">
            Message
          </p>

          <div className="rounded-xl border border-border bg-surface-muted p-5">
            <p className="whitespace-pre-line leading-7 text-text-primary">
              {message}
            </p>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            tone={role}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailsModal;