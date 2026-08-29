/**
 * ============================================
 * COMPLAINT FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for Complaint Management
 * Provides:
 * - Status filter dropdown (All, Open, In Progress, Resolved, Rejected)
 * - Category/Type filter dropdown (All, Academic, Behavioral, Infrastructure, etc.)
 * - Export button for downloading complaint data
 * - Filter label with icon
 * - Responsive layout with flexible wrapping
 * 
 * Dependencies:
 * - lucide-react for icons (Filter, Download)
 * - @/components/ui/Select for dropdown filters
 * - @/utils/helpers for filter options constants
 * 
 * Usage:
 * <ComplaintFilters
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterType={filterType}
 *   setFilterType={setFilterType}
 *   onExport={handleExport}
 * />
 * ============================================
 */

import { Filter, Download } from "lucide-react";
import Select from "@/components/ui/Select";
import {
  COMPLAINT_STATUS_OPTIONS,
  COMPLAINT_TYPE_OPTIONS,
} from "@/utils/helpers";

/**
 * ============================================
 * COMPLAINT FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for complaint management
 * 
 * @param {Object} props - Component props
 * @param {string} props.filterStatus - Current status filter value
 * @param {Function} props.setFilterStatus - Setter function for status filter
 * @param {string} props.filterType - Current type/category filter value
 * @param {Function} props.setFilterType - Setter function for type filter
 * @param {Function} props.onExport - Callback function for CSV export
 * @returns {JSX.Element} Complaint filters UI
 * 
 * @example
 * const [filterStatus, setFilterStatus] = useState('all');
 * const [filterType, setFilterType] = useState('all');
 * 
 * <ComplaintFilters
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterType={filterType}
 *   setFilterType={setFilterType}
 *   onExport={() => exportCSV(filteredData)}
 * />
 * ============================================
 */
export default function ComplaintFilters({
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  onExport,
}) {
  /**
   * ============================================
   * STATUS OPTIONS MAPPING
   * ============================================
   * 
   * Prepends "All Status" option to the status options list
   * Transforms COMPLAINT_STATUS_OPTIONS to Select component format
   * 
   * @constant {Array} statusOptions
   */
  const statusOptions = [
    { value: "all", label: "All Status" },
    ...COMPLAINT_STATUS_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  ];

  /**
   * ============================================
   * TYPE OPTIONS MAPPING
   * ============================================
   * 
   * Prepends "All Categories" option to the type options list
   * Transforms COMPLAINT_TYPE_OPTIONS to Select component format
   * 
   * @constant {Array} typeOptions
   */
  const typeOptions = [
    { value: "all", label: "All Categories" },
    ...COMPLAINT_TYPE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  ];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col md:flex-row-wrap gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 items-center px-4 sm:px-6 lg:px-8">
      {/* ─── Filter Label ─── */}
      <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
        <Filter size={16} className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
        <span className="text-xs font-medium text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
          Filters:
        </span>
      </div>

      {/* ─── Status Filter Dropdown ─── */}
      <Select
        value={filterStatus}
        onChange={(val) => setFilterStatus(val)}
        options={statusOptions}
        tone="admin"
        size="sm"
        className="min-w-[140px] px-4 sm:px-6 lg:px-8"
      />

      {/* ─── Type Filter Dropdown ─── */}
      <Select
        value={filterType}
        onChange={(val) => setFilterType(val)}
        options={typeOptions}
        tone="admin"
        size="sm"
        className="min-w-[140px] px-4 sm:px-6 lg:px-8"
      />

      {/* ─── Export Button ─── */}
      <div className="ml-auto flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
        <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={onExport}
          className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-3 py-1.5 text-sm md:text-base md:text-base text-[var(--color-text-secondary)] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors px-4 sm:px-6 lg:px-8"
        >
          <Download size={16} />
          Export
        </Button>
      </div>
    </div>
  );
}