/**
 * ============================================
 * FEE FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for Fee Management
 * Provides:
 * - Search input for student name/roll number
 * - Month filter for fee period
 * - Class filter dropdown
 * - Status filter dropdown (Paid, Unpaid, Partial, Overdue)
 * - Scholarship filter dropdown
 * - Responsive layout with flexible wrapping
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Search)
 * - @/components/ui/Select for dropdown filters
 * 
 * Usage:
 * <FeeFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterScholarship={filterScholarship}
 *   setFilterScholarship={setFilterScholarship}
 *   filterMonth={filterMonth}
 *   setFilterMonth={setFilterMonth}
 *   classOptions={classOptions}
 *   statusOptions={statusOptions}
 *   scholarshipOptions={scholarshipOptions}
 * />
 * ============================================
 */

import { Search } from 'lucide-react';  // ← removed X import
import Select from "@/components/ui/Select";

/**
 * ============================================
 * FEE FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for fee management
 * 
 * @param {Object} props - Component props
 * @param {string} props.search - Current search query value
 * @param {Function} props.setSearch - Setter function for search state
 * @param {string} props.filterClass - Current class filter value
 * @param {Function} props.setFilterClass - Setter function for class filter
 * @param {string} props.filterStatus - Current status filter value
 * @param {Function} props.setFilterStatus - Setter function for status filter
 * @param {string} props.filterScholarship - Current scholarship filter value
 * @param {Function} props.setFilterScholarship - Setter function for scholarship filter
 * @param {string} props.filterMonth - Current month filter value (YYYY-MM)
 * @param {Function} props.setFilterMonth - Setter function for month filter
 * @param {Array} props.classOptions - Array of class options for dropdown
 * @param {Array} props.statusOptions - Array of status options for dropdown
 * @param {Array} props.scholarshipOptions - Array of scholarship options for dropdown
 * @returns {JSX.Element} Fee filters UI
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const [filterClass, setFilterClass] = useState('all');
 * const [filterStatus, setFilterStatus] = useState('all');
 * const [filterScholarship, setFilterScholarship] = useState('all');
 * const [filterMonth, setFilterMonth] = useState('2024-01');
 * 
 * <FeeFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterScholarship={filterScholarship}
 *   setFilterScholarship={setFilterScholarship}
 *   filterMonth={filterMonth}
 *   setFilterMonth={setFilterMonth}
 *   classOptions={classes}
 *   statusOptions={statuses}
 *   scholarshipOptions={scholarships}
 * />
 * ============================================
 */
export default function FeeFilters({
  search,
  setSearch,
  filterClass,
  setFilterClass,
  filterStatus,
  setFilterStatus,
  filterScholarship,
  setFilterScholarship,
  filterMonth,
  setFilterMonth,
  classOptions,
  statusOptions,
  scholarshipOptions,
}) {
  return (
    <div className="p-3 flex flex-col md:flex-row-wrap items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 border-b border-gray-100 px-4 sm:px-6 lg:px-8">
      {/* ─── Search Input ─── */}
      <div className="relative flex-1 min-w-[150px] px-4 sm:px-6 lg:px-8">
        <Search 
          size={14} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" 
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name/roll..."
          className="w-full pl-8 pr-3 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm md:text-base md:text-base focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none px-4 sm:px-6 lg:px-8"
        />
      </div>

      {/* ─── Month Filter ─── */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm md:text-base md:text-base focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none px-4 sm:px-6 lg:px-8"
        />
        {/* ─── Removed the X button ─── */}
      </div>

      {/* ─── Class Filter Dropdown ─── */}
      <Select
        value={filterClass}
        onChange={(val) => setFilterClass(val)}
        options={classOptions}
        tone="admin"
        size="sm"
        className="min-w-[120px] px-4 sm:px-6 lg:px-8"
      />

      {/* ─── Status Filter Dropdown ─── */}
      <Select
        value={filterStatus}
        onChange={(val) => setFilterStatus(val)}
        options={statusOptions}
        tone="admin"
        size="sm"
        className="min-w-[120px] px-4 sm:px-6 lg:px-8"
      />

      {/* ─── Scholarship Filter Dropdown ─── */}
      <Select
        value={filterScholarship}
        onChange={(val) => setFilterScholarship(val)}
        options={scholarshipOptions}
        tone="admin"
        size="sm"
        className="min-w-[120px] px-4 sm:px-6 lg:px-8"
      />
    </div>
  );
}