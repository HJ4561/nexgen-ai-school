/**
 * ============================================
 * FEE TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays fee records in a responsive table
 * Features:
 * - Student name display
 * - Original fee with currency formatting
 * - Scholarship percentage badge
 * - Final payable amount with highlighting
 * - Status badge with color coding
 * - Action buttons (View, Edit, Record Payment)
 * - Responsive design with mobile support
 * - Pagination controls
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Eye, Edit, DollarSign)
 * - @/components/ui/Badge for scholarship percentage
 * - @/components/composite/StatusBadge for status indicator
 * - @/components/admin/ResponsiveTable for table structure
 * - @/components/ui/Pagination for page controls
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <FeeTable
 *   data={feeData}
 *   onView={handleView}
 *   onPay={handlePay}
 *   onEdit={handleEdit}
 *   currentPage={page}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 * />
 * ============================================
 */

import { Eye, Edit, DollarSign } from 'lucide-react';
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/composite/StatusBadge";
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Pagination from "@/components/ui/Pagination";
import { formatCurrency, getStatusLabel } from "@/utils/helpers";

/**
 * ============================================
 * FEE TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table of fee records with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of fee objects to display
 * @param {Function} props.onView - Callback when view button is clicked
 * @param {Function} props.onPay - Callback when pay button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback function when page changes
 * @returns {JSX.Element} Fee table with pagination
 * 
 * @example
 * const [page, setPage] = useState(1);
 * 
 * <FeeTable
 *   data={fees.slice((page-1)*10, page*10)}
 *   onView={(fee) => openDetailsDrawer(fee)}
 *   onPay={(fee) => openPaymentDrawer(fee)}
 *   onEdit={(fee) => openEditDrawer(fee)}
 *   currentPage={page}
 *   totalPages={Math.ceil(fees.length / 10)}
 *   totalItems={fees.length}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 * />
 * ============================================
 */
export default function FeeTable({
  data,
  onView,
  onPay, 
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
}) {
  /**
   * ============================================
   * TABLE COLUMNS CONFIGURATION
   * ============================================
   * 
   * Defines the structure and rendering of each column
   * 
   * @constant {Array} tableColumns
   * @property {string} key - Unique identifier for the column
   * @property {string} label - Display name in table header
   * @property {Object} mobile - Mobile-specific configuration
   * @property {Function} render - Function to render cell content
   */
  const tableColumns = [
    /**
     * ============================================
     * STUDENT COLUMN
     * ============================================
     * 
     * Displays student name
     * Acts as the title on mobile view
     */
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {row.student_name || 'Unknown'}
          </p>
        </div>
      ),
      mobile: { role: 'title' },
    },

    /**
     * ============================================
     * ORIGINAL FEE COLUMN
     * ============================================
     * 
     * Displays the original fee amount with currency formatting
     * Shows as detail on mobile view
     */
    {
      key: 'original',
      label: 'Original Fee',
      render: (row) => (
        <span className="text-sm text-[var(--color-text-primary)]">
          {formatCurrency(row.original_amount)}
        </span>
      ),
      mobile: { role: 'detail', label: 'Original Fee' },
    },

    /**
     * ============================================
     * SCHOLARSHIP COLUMN
     * ============================================
     * 
     * Displays scholarship percentage as a badge
     * Shows as badge on mobile view
     */
    {
      key: 'scholarship',
      label: 'Schol. (%)',
      render: (row) => (
        <Badge tone="parent" className="text-[10px]">
          {row.scholarship_percentage || 0}%
        </Badge>
      ),
      mobile: { role: 'badge' },
    },

    /**
     * ============================================
     * FINAL PAYABLE COLUMN
     * ============================================
     * 
     * Displays the final payable amount with highlighting
     * Shows as detail on mobile view
     */
    {
      key: 'payable',
      label: 'Final Payable',
      render: (row) => (
        <span className="text-sm font-bold text-[var(--color-admin-primary)]">
          {formatCurrency(row.amount)}
        </span>
      ),
      mobile: { role: 'detail', label: 'Final Payable' },
    },

    /**
     * ============================================
     * STATUS COLUMN
     * ============================================
     * 
     * Displays status badge with color coding
     * Shows as detail on mobile view
     */
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={getStatusLabel(row.status)} />,
      mobile: { role: 'detail', label: 'Status' },
    },

    /**
     * ============================================
     * ACTIONS COLUMN
     * ============================================
     * 
     * Provides three action buttons:
     * - View Details (Eye icon)
     * - Edit Challan (Edit icon)
     * - Record Payment (DollarSign icon)
     * Each button has hover tooltips and transitions
     */
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* ─── View Button ─── */}
          <button
            onClick={() => onView(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
            title="View Details"
          >
            <Eye size={15} />
          </button>
          
          {/* ─── Edit Button ─── */}
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
            title="Edit Challan"
          >
            <Edit size={15} />
          </button>
          
          {/* ─── Payment Button ─── */}
          <button
            onClick={() => onPay(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-success)] hover:bg-[var(--color-success-bg)] transition-colors"
            title="Record Payment"
          >
            <DollarSign size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      {/* ─── Responsive Table ─── */}
      <ResponsiveTable
        columns={tableColumns}
        data={data}
        keyField="id"
        emptyMessage="No fee records found."
      />

      {/* ─── Pagination Controls ─── */}
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
