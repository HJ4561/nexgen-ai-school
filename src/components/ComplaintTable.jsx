/**
 * ============================================
 * COMPLAINT TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays complaints in a tabular format with pagination
 * Features:
 * - Column-based data rendering with custom accessors
 * - Status badges with color coding (Resolved, Pending, Open)
 * - Status icons for visual indicators
 * - User information display (name + role)
 * - Description truncation with max-width
 * - View action button for each row
 * - Pagination controls
 * - Empty state handling
 * - Responsive table design
 * 
 * Dependencies:
 * - lucide-react for icons (Eye, CheckCircle, Clock, AlertTriangle)
 * - @/components/ui/Badge for status indicators
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Table for table structure
 * - @/components/ui/Pagination for page controls
 * 
 * Usage:
 * <ComplaintTable
 *   data={complaints}
 *   currentPage={page}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 *   onView={handleView}
 *   animateRows={true}
 * />
 * ============================================
 */

import React from 'react';
import { Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';

/**
 * ============================================
 * COMPLAINT TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table of complaints with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of complaint objects to display
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items per page (default: 10)
 * @param {Function} props.onPageChange - Callback function when page changes
 * @param {Function} props.onView - Callback function when view button is clicked
 * @param {boolean} props.animateRows - Whether to animate table rows (default: false)
 * @returns {JSX.Element} Complaint table with pagination
 * 
 * @example
 * const [page, setPage] = useState(1);
 * 
 * <ComplaintTable
 *   data={complaints.slice((page-1)*10, page*10)}
 *   currentPage={page}
 *   totalPages={Math.ceil(complaints.length / 10)}
 *   totalItems={complaints.length}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 *   onView={(complaint) => openDetails(complaint)}
 *   animateRows={true}
 * />
 * ============================================
 */
const ComplaintTable = ({
  data = [],
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onView,
  animateRows
}) => {
  /**
   * ============================================
   * GET STATUS BADGE STYLES
   * ============================================
   * 
   * Returns appropriate CSS classes for status badge based on status
   * 
   * @param {string} status - Complaint status
   * @returns {string} CSS classes for the badge
   */
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'open':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  /**
   * ============================================
   * GET STATUS ICON
   * ============================================
   * 
   * Returns appropriate icon component based on status
   * 
   * @param {string} status - Complaint status
   * @returns {JSX.Element|null} Icon component or null
   */
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-500" />;
      case 'open':
        return <AlertTriangle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  /**
   * ============================================
   * EMPTY STATE HANDLING
   * ============================================
   * 
   * Displays a fallback UI when no complaints are available
   */
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No complaints found
      </div>
    );
  }

  /**
   * ============================================
   * TABLE COLUMNS CONFIGURATION
   * ============================================
   * 
   * Defines the structure and rendering of each column
   * 
   * @constant {Array} columns
   * @property {string} header - Column header label
   * @property {Function} accessor - Function to render cell content
   */
  const columns = [
    /**
     * ============================================
     * USER COLUMN
     * ============================================
     * 
     * Displays user name and role in a stacked layout
     */
    {
      header: 'User',
      accessor: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.user_name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.user_role || 'N/A'}</p>
        </div>
      )
    },

    /**
     * ============================================
     * TYPE COLUMN
     * ============================================
     * 
     * Displays the complaint type/category
     */
    {
      header: 'Type',
      accessor: (row) => (
        <span className="text-sm text-gray-600">{row.type || 'N/A'}</span>
      )
    },

    /**
     * ============================================
     * DESCRIPTION COLUMN
     * ============================================
     * 
     * Shows the complaint description with truncation
     */
    {
      header: 'Description',
      accessor: (row) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 truncate">{row.description || 'N/A'}</p>
        </div>
      )
    },

    /**
     * ============================================
     * STATUS COLUMN
     * ============================================
     * 
     * Displays status badge with icon and color coding
     */
    {
      header: 'Status',
      accessor: (row) => (
        <Badge className={getStatusBadge(row.status)}>
          <span className="flex items-center gap-1">
            {getStatusIcon(row.status)}
            {row.status || 'Unknown'}
          </span>
        </Badge>
      )
    },

    /**
     * ============================================
     * DATE COLUMN
     * ============================================
     * 
     * Displays formatted creation date
     */
    {
      header: 'Date',
      accessor: (row) => (
        <p className="text-sm text-gray-600">
          {row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}
        </p>
      )
    },

    /**
     * ============================================
     * ACTIONS COLUMN
     * ============================================
     * 
     * Provides "View" button for each row
     */
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          size="sm"
          variant="outline"
          tone="admin"
          leftIcon={<Eye size={14} />}
          onClick={() => onView && onView(row)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* ─── Table ─── */}
      <Table
        data={data}
        columns={columns}
        keyExtractor={(row) => row.id || Math.random()}
        emptyMessage="No complaints found"
      />

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintTable;