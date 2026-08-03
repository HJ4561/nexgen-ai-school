/**
 * ============================================
 * BEHAVIOR TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays behavior logs in a responsive table format
 * Features:
 * - Responsive design with mobile-first approach
 * - Column-based data rendering with custom renderers
 * - Severity badges with color coding
 * - Pagination controls
 * - View details action with eye icon
 * - Mobile-friendly view with hidden columns
 * 
 * Dependencies:
 * - lucide-react for icons (Eye)
 * - @/components/ui/Badge for severity indicators
 * - @/components/admin/ResponsiveTable for table structure
 * - @/components/ui/Pagination for page controls
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <BehaviorTable
 *   data={paginatedData}
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 *   onPageChange={goToPage}
 *   onView={handleView}
 * />
 * ============================================
 */

import { Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Pagination from "@/components/ui/Pagination";
import {
  getInitials,
  formatDate,
  getSeverityColor,
  getSeverityBadgeClass,
} from "@/utils/helpers";

/**
 * ============================================
 * BEHAVIOR TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table of behavior logs with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of behavior log objects to display
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback function when page changes
 * @param {Function} props.onView - Callback function when view button is clicked
 * @returns {JSX.Element} Behavior table with pagination
 * 
 * @example
 * const [page, setPage] = useState(1);
 * 
 * <BehaviorTable
 *   data={logs.slice((page-1)*10, page*10)}
 *   currentPage={page}
 *   totalPages={Math.ceil(logs.length / 10)}
 *   totalItems={logs.length}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 *   onView={(log) => openDrawer(log)}
 * />
 * ============================================
 */
export default function BehaviorTable({
  data,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onView,
}) {
  /**
   * ============================================
   * TABLE COLUMNS CONFIGURATION
   * ============================================
   * 
   * Defines the structure and rendering of each column
   * 
   * Column Properties:
   * - key: Unique identifier for the column
   * - label: Display name in table header
   * - mobile: Mobile-specific configuration
   *   - role: 'title' | 'badge' | 'detail' | 'hidden'
   *   - label: Optional label for detail view
   * - render: Function to render cell content
   * 
   * @constant {Array} columns
   * ============================================
   */
  const columns = [
    /**
     * ============================================
     * STUDENT COLUMN
     * ============================================
     * 
     * Displays student name with avatar circle showing initials
     * Acts as the title/mobile primary identifier
     */
    {
      key: "student",
      label: "Student",
      mobile: { role: "title" },
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Avatar circle with student initials */}
          <div className="w-8 h-8 rounded-full bg-[var(--color-student-light)] flex items-center justify-center text-[var(--color-student-primary)] text-xs font-bold">
            {getInitials(row.student_name)}
          </div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {row.student_name}
          </span>
        </div>
      ),
    },

    /**
     * ============================================
     * REPORTED BY COLUMN
     * ============================================
     * 
     * Displays the name of the teacher/staff who reported the behavior
     */
    {
      key: "teacher",
      label: "Reported By",
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.reported_by_name}
        </span>
      ),
    },

    /**
     * ============================================
     * SEVERITY COLUMN
     * ============================================
     * 
     * Displays severity badge with color coding
     * - High: Red badge
     * - Medium: Yellow badge
     * - Low: Green badge
     * Shows as badge on mobile
     */
    {
      key: "severity",
      label: "Severity",
      mobile: { role: "badge" },
      render: (row) => (
        <Badge
          className={`text-[10px] border ${getSeverityBadgeClass(row.severity)}`}
        >
          {row.severity}
        </Badge>
      ),
    },

    /**
     * ============================================
     * DESCRIPTION COLUMN
     * ============================================
     * 
     * Shows the behavior description with truncation for long text
     * Shows as detail on mobile view
     */
    {
      key: "description",
      label: "Description",
      mobile: { role: "detail", label: "Description" },
      render: (row) => (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs truncate">
          {row.description}
        </p>
      ),
    },

    /**
     * ============================================
     * ACTION TAKEN COLUMN
     * ============================================
     * 
     * Displays the disciplinary action taken
     * Shows "—" if no action was taken
     * Shows as detail on mobile view
     */
    {
      key: "action_taken",
      label: "Action Taken",
      mobile: { role: "detail", label: "Action" },
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.action_taken || "—"}
        </span>
      ),
    },

    /**
     * ============================================
     * DATE COLUMN
     * ============================================
     * 
     * Displays formatted creation date
     * Shows as detail on mobile view
     */
    {
      key: "date",
      label: "Date",
      mobile: { role: "detail", label: "Date" },
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {formatDate(row.created_at)}
        </span>
      ),
    },

    /**
     * ============================================
     * ACTIONS COLUMN
     * ============================================
     * 
     * Provides "View Details" action with eye icon
     * Hidden on mobile (access via mobileActions)
     */
    {
      key: "actions",
      label: "Actions",
      mobile: { role: "hidden" },
      render: (row) => (
        <button
          onClick={() => onView(row)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
          title="View Details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      {/* Responsive Table */}
      <ResponsiveTable
        columns={columns}
        data={data}
        keyField="id"
        emptyMessage="No behavior logs found."
        mobileActions={(row) => (
          <button
            onClick={() => onView(row)}
            className="text-sm font-medium text-[var(--color-admin-primary)] hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-admin-light)] rounded-lg"
          >
            <Eye size={14} /> View Details
          </button>
        )}
      />

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}