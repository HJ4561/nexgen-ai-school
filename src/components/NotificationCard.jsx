/**
 * ============================================
 * NOTIFICATION CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a single notification in a list
 * Features:
 * - Icon with circular container
 * - Message text with read/unread styling
 * - Time display
 * - Unread indicator (bold text + blue dot)
 * - Role-based theming (brand, admin, teacher, student, parent)
 * - Click handler with hover effects
 * - Responsive card design
 * 
 * Dependencies:
 * - lucide-react for icons (passed as prop)
 * 
 * Usage:
 * <NotificationCard
 *   icon={<Bell size={16} />}
 *   message="New leave request from Ali"
 *   time="2 hours ago"
 *   isRead={false}
 *   tone="admin"
 *   onClick={() => markAsRead(notification.id)}
 * />
 * ============================================
 */

/**
 * ============================================
 * UNREAD BACKGROUND CLASSES
 * ============================================
 * 
 * Maps tone values to background color classes for unread notifications
 * 
 * @constant {Object} UNREAD_BG_CLASSES
 * @property {string} brand - Brand light background
 * @property {string} admin - Admin light background
 * @property {string} teacher - Teacher light background
 * @property {string} student - Student light background
 * @property {string} parent - Parent light background
 */
const UNREAD_BG_CLASSES = {
  brand: 'bg-brand-light',
  admin: 'bg-admin-light',
  teacher: 'bg-teacher-light',
  student: 'bg-student-light',
  parent: 'bg-parent-light',
};

/**
 * ============================================
 * UNREAD DOT CLASSES
 * ============================================
 * 
 * Maps tone values to dot color classes for unread indicator
 * 
 * @constant {Object} UNREAD_DOT_CLASSES
 * @property {string} brand - Brand primary color
 * @property {string} admin - Admin primary color
 * @property {string} teacher - Teacher primary color
 * @property {string} student - Student primary color
 * @property {string} parent - Parent primary color
 */
const UNREAD_DOT_CLASSES = {
  brand: 'bg-brand-primary',
  admin: 'bg-admin-primary',
  teacher: 'bg-teacher-primary',
  student: 'bg-student-primary',
  parent: 'bg-parent-primary',
};

/**
 * ============================================
 * NOTIFICATION CARD COMPONENT
 * ============================================
 * 
 * Renders a single notification card with read/unread state
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Lucide icon component to display
 * @param {string} props.message - The notification text
 * @param {string} props.time - Short time display (e.g., "2 hours ago")
 * @param {boolean} props.isRead - Whether the notification has been read (default: false)
 * @param {string} props.tone - Role-based color theme (brand, admin, teacher, student, parent)
 * @param {Function} props.onClick - Function called when the card is clicked
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Notification card UI
 * 
 * @example
 * // Unread notification
 * <NotificationCard
 *   icon={<Bell size={16} />}
 *   message="New leave request from Ali"
 *   time="2 hours ago"
 *   isRead={false}
 *   tone="admin"
 *   onClick={() => markAsRead(notification.id)}
 * />
 * 
 * // Read notification
 * <NotificationCard
 *   icon={<CheckCircle size={16} />}
 *   message="Leave request approved"
 *   time="1 day ago"
 *   isRead={true}
 * />
 * ============================================
 */
function NotificationCard({
  icon,
  message,
  time,
  isRead = false,
  tone = 'brand',
  onClick,
  className = '',
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col md:flex-row items-start gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 rounded-card p-3 transition-colors duration-150 ${
        onClick ? 'cursor-pointer hover:bg-surface-dim' : ''
      } ${!isRead ? UNREAD_BG_CLASSES[tone] || UNREAD_BG_CLASSES.brand : 'bg-transparent'} ${className}`}
    >
      {/* ─── Icon Container ─── */}
      {icon && (
        <span className="flex flex-col md:flex-row h-icon-lg w-icon-lg flex-shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-secondary px-4 sm:px-6 lg:px-8">
          {icon}
        </span>
      )}

      {/* ─── Message and Time ─── */}
      <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
        <p className={`text-sm md:text-base md:text-base ${!isRead ? 'font-semibold text-text-primary' : 'font-normal text-text-secondary'}`}>
          {message}
        </p>
        {time && <p className="mt-0.5 text-xs text-text-muted px-4 sm:px-6 lg:px-8">{time}</p>}
      </div>

      {/* ─── Unread Indicator Dot ─── */}
      {!isRead && (
        <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${UNREAD_DOT_CLASSES[tone] || UNREAD_DOT_CLASSES.brand}`} />
      )}
    </div>
  );
}

export default NotificationCard;