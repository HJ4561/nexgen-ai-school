/**
 * ============================================
 * PAGINATION COMPONENT
 * ============================================
 * 
 * Purpose: Reusable pagination controls for data tables
 * Features:
 * - Page navigation with Previous/Next buttons
 * - Visible page numbers (max 5)
 * - Page number highlighting for current page
 * - Item count display (showing X-Y of Z items)
 * - Disabled state for first/last page buttons
 * - Responsive layout with flex wrapping
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (ChevronLeft, ChevronRight)
 * 
 * Usage:
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 * />
 * ============================================
 */

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ============================================
 * PAGINATION COMPONENT
 * ============================================
 * 
 * Renders pagination controls for data navigation
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items per page
 * @returns {JSX.Element|null} Pagination UI or null if totalPages <= 1
 * 
 * @example
 * const [currentPage, setCurrentPage] = useState(1);
 * const totalItems = 100;
 * const itemsPerPage = 10;
 * const totalPages = Math.ceil(totalItems / itemsPerPage);
 * 
 * <Pagination
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   onPageChange={setCurrentPage}
 *   totalItems={totalItems}
 *   itemsPerPage={itemsPerPage}
 * />
 * ============================================
 */
function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  // Return null if only one page (no pagination needed)
  if (totalPages <= 1) return null;

  /**
   * ============================================
   * ITEM RANGE CALCULATION
   * ============================================
   * 
   * Calculates the range of items being displayed
   * Example: Showing 11–20 of 100 items
   */
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  /**
   * ============================================
   * VISIBLE PAGE NUMBERS
   * ============================================
   * 
   * Computes which 5 page numbers to show
   * - If totalPages <= 5: Show all pages
   * - Otherwise: Center current page, keep within bounds
   * 
   * @returns {Array} Array of page numbers to display
   */
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // Center current page, but keep within bounds
    let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-2">
      {/* ─── Item Range Display ─── */}
      <span className="text-sm text-[var(--color-text-secondary)]">
        Showing {startItem}–{endItem} of {totalItems} items
      </span>

      {/* ─── Pagination Controls ─── */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Number Buttons */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
              currentPage === page
                ? "bg-[var(--color-admin-primary)] text-white"
                : "hover:bg-gray-100 text-[var(--color-text-primary)]"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;