/**
 * ============================================
 * BEHAVIOR FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for the Behavior Logs page
 * Provides:
 * - Search input for filtering by student, teacher, or description
 * - Severity dropdown filter (High, Medium, Low, All)
 * - Export CSV functionality
 * 
 * Dependencies:
 * - lucide-react for icons (Search, Download)
 * - @/components/ui/Button for the export button
 * - @/components/ui/Select for the severity dropdown
 * - @/utils/helpers for severity options configuration
 * 
 * Usage:
 * <BehaviorFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterSeverity={filterSeverity}
 *   setFilterSeverity={setFilterSeverity}
 *   onExport={handleExport}
 * />
 * ============================================
 */

import { Search, Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { SEVERITY_OPTIONS } from "@/utils/helpers";

/**
 * ============================================
 * BEHAVIOR FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for the behavior logs table
 * 
 * @param {Object} props - Component props
 * @param {string} props.search - Current search query value
 * @param {Function} props.setSearch - Setter function for search state
 * @param {string} props.filterSeverity - Current severity filter value
 * @param {Function} props.setFilterSeverity - Setter function for severity filter
 * @param {Function} props.onExport - Callback function for CSV export
 * @returns {JSX.Element} Filter controls UI
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const [severity, setSeverity] = useState('all');
 * 
 * <BehaviorFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterSeverity={severity}
 *   setFilterSeverity={setSeverity}
 *   onExport={() => exportCSV(data)}
 * />
 * ============================================
 */
export default function BehaviorFilters({
  search,
  setSearch,
  filterSeverity,
  setFilterSeverity,
  onExport,
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search 
          size={15} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" 
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student, teacher, or description..."
          className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none"
        />
      </div>

      {/* Severity Filter Dropdown */}
      <Select
        value={filterSeverity}
        onChange={(val) => setFilterSeverity(val)}
        options={SEVERITY_OPTIONS}
        tone="admin"
        size="sm"
        className="min-w-[140px]"
      />

      {/* Export Button */}
      <div className="ml-auto">
        <Button
          variant="outline"
          tone="admin"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={onExport}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
}