/**
 * ============================================
 * BEHAVIOR FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for behavior logs
 * Features:
 * - Search input for description
 * - Severity filter dropdown (All, Low, Medium, High)
 * - Sort options (Newest First, Oldest First)
 * - Reset filters button
 * - Role-based theming
 * - Responsive grid layout (1/2/4 columns)
 * - Parent role styling
 * 
 * Dependencies:
 * - lucide-react for icons (Search, RotateCcw)
 * - @/components/ui/Input for search field
 * - @/components/ui/Select for dropdowns
 * - @/components/ui/Button for reset action
 * 
 * Usage:
 * <BehaviorFilters
 *   role="parent"
 *   filters={filters}
 *   onChange={handleFilterChange}
 *   onReset={handleReset}
 * />
 * ============================================
 */

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

import {
  Search,
  RotateCcw,
} from "lucide-react";

/**
 * ============================================
 * FILTER OPTIONS
 * ============================================
 * 
 * Severity options for filtering behavior logs
 * - All: Shows all severity levels
 * - Low: Green (ShieldCheck)
 * - Medium: Yellow (AlertTriangle)
 * - High: Red (ShieldAlert)
 * 
 * Sort options for ordering results
 * - Newest First: Most recent first
 * - Oldest First: Oldest first
 * 
 * @constant {Array} severityOptions
 * @constant {Array} sortOptions
 */
const severityOptions = [
  {
    value: "All",
    label: "All Severity",
  },
  {
    value: "Low",
    label: "Low",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "High",
    label: "High",
  },
];

const sortOptions = [
  {
    value: "newest",
    label: "Newest First",
  },
  {
    value: "oldest",
    label: "Oldest First",
  },
];

/**
 * ============================================
 * BEHAVIOR FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for behavior logs
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('parent', 'admin', 'teacher', 'student')
 * @param {Object} props.filters - Filter state object
 * @param {string} props.filters.search - Search query
 * @param {string} props.filters.severity - Selected severity filter
 * @param {string} props.filters.sort - Selected sort option
 * @param {Function} props.onChange - Callback when a filter changes
 * @param {Function} props.onReset - Callback to reset all filters
 * @returns {JSX.Element} Behavior filters UI
 * 
 * @example
 * const [filters, setFilters] = useState({
 *   search: '',
 *   severity: 'All',
 *   sort: 'newest'
 * });
 * 
 * const handleFilterChange = (field, value) => {
 *   setFilters(prev => ({ ...prev, [field]: value }));
 * };
 * 
 * const handleReset = () => {
 *   setFilters({ search: '', severity: 'All', sort: 'newest' });
 * };
 * 
 * <BehaviorFilters
 *   role="parent"
 *   filters={filters}
 *   onChange={handleFilterChange}
 *   onReset={handleReset}
 * />
 * ============================================
 */
const BehaviorFilters = ({
  role,
  filters,
  onChange,
  onReset,
}) => {
  return (
    <div className="rounded-2xl border border-parent-border bg-surface p-5">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-text-primary">
          Filter Behavior Logs
        </h3>

        <p className="mt-1 text-sm text-text-secondary">
          Quickly find behavior records using the available filters.
        </p>
      </div>

      {/* ─── Filter Controls Grid ──────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* ─── Search Input ─── */}
        <Input
          label="Search"
          placeholder="Search description..."
          value={filters.search}
          leftIcon={<Search size={18} />}
          onChange={(e) =>
            onChange(
              "search",
              e.target.value
            )
          }
        />

        {/* ─── Severity Filter Dropdown ─── */}
        <Select
          label="Severity"
          tone={role}
          value={filters.severity}
          options={severityOptions}
          onChange={(value) =>
            onChange(
              "severity",
              value
            )
          }
        />

        {/* ─── Sort Dropdown ─── */}
        <Select
          label="Sort"
          tone={role}
          value={filters.sort}
          options={sortOptions}
          onChange={(value) =>
            onChange(
              "sort",
              value
            )
          }
        />

        {/* ─── Reset Button ─── */}
        <div className="flex items-end">
          <Button
            className="w-full"
            variant="outline"
            tone={role}
            leftIcon={
              <RotateCcw size={16} />
            }
            onClick={onReset}
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BehaviorFilters;