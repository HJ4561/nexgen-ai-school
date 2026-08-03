/**
 * ============================================
 * ATTENDANCE TABS COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Tab navigation for attendance management
 * Features:
 * - Two tabs: "Mark Attendance" and "View Attendance"
 * - Role-based theming with teacher primary color
 * - Active tab highlighting with background and shadow
 * - Hover effects on inactive tabs
 * - Compact pill-style design
 * 
 * Dependencies:
 * - None (pure component)
 * 
 * Usage:
 * <AttendanceTabs
 *   activeTab={activeTab}
 *   setActiveTab={setActiveTab}
 * />
 * ============================================
 */

/**
 * ============================================
 * ATTENDANCE TABS COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders tab navigation for attendance management
 * 
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab ('mark' | 'view')
 * @param {Function} props.setActiveTab - Setter function for active tab
 * @returns {JSX.Element} Attendance tabs UI
 * 
 * @example
 * const [activeTab, setActiveTab] = useState('mark');
 * 
 * <AttendanceTabs
 *   activeTab={activeTab}
 *   setActiveTab={setActiveTab}
 * />
 * ============================================
 */
export default function AttendanceTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 bg-white p-2 rounded-xl shadow-soft border border-gray-100 w-fit">
      {/* ─── Mark Attendance Tab ─── */}
      <button
        onClick={() => setActiveTab('mark')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'mark'
            ? 'bg-[var(--color-teacher-primary)] text-white shadow-sm'
            : 'text-[var(--color-text-muted)] hover:bg-gray-100'
        }`}
      >
        Mark Attendance
      </button>

      {/* ─── View Attendance Tab ─── */}
      <button
        onClick={() => setActiveTab('view')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          activeTab === 'view'
            ? 'bg-[var(--color-teacher-primary)] text-white shadow-sm'
            : 'text-[var(--color-text-muted)] hover:bg-gray-100'
        }`}
      >
        View Attendance
      </button>
    </div>
  );
}