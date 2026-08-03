/**
 * ============================================
 * CLASS FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filter and search controls for class management
 * Used in: Admin - Academic Structure - Classes Tab
 * 
 * Features:
 * - Dynamic class name filter (from existing classes)
 * - Dynamic section filter (from existing sections)
 * - Search by class name or section
 * - Shows total count of filtered items
 * 
 * Dependencies:
 * - Select component for dropdowns
 * - Lucide React icons
 * ============================================
 */

import { useMemo } from "react";
import { Filter, Search, Plus } from "lucide-react";
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

/**
 * ClassFilters Component
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.classes - Array of class objects for dynamic options
 * @param {string} props.filterClass - Selected class name filter
 * @param {Function} props.setFilterClass - Update class filter
 * @param {string} props.filterSection - Selected section filter
 * @param {Function} props.setFilterSection - Update section filter
 * @param {string} props.search - Current search query
 * @param {Function} props.setSearch - Update search query
 * @param {number} props.totalCount - Number of filtered items
 * @param {Function} props.onAdd - Opens add drawer (optional)
 * @returns {JSX.Element} Rendered filter controls
 * 
 * @example
 * <ClassFilters
 *   classes={classes}
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterSection={filterSection}
 *   setFilterSection={setFilterSection}
 *   search={search}
 *   setSearch={setSearch}
 *   totalCount={filtered.length}
 * />
 */
export default function ClassFilters({
  classes,
  filterClass,
  setFilterClass,
  filterSection,
  setFilterSection,
  search,
  setSearch,
  totalCount,
}) {
  // ─── Dynamic Options ────────────────────────────────────────────────
  // Extract unique class names from data
  const classOptions = useMemo(() => {
    const uniqueClasses = [...new Set(classes.map((c) => c.class_name))];
    return uniqueClasses.map((name) => ({ value: name, label: `Class ${name}` }));
  }, [classes]);

  // Extract unique sections from data
  const sectionOptions = useMemo(() => {
    const uniqueSections = [...new Set(classes.map((c) => c.section))];
    return uniqueSections.map((sec) => ({ value: sec, label: `Section ${sec}` }));
  }, [classes]);

  return (
    <div className="p-4 border-b border-gray-100 bg-[var(--color-surface-dim)]/30">
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter Label */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Filters:</span>
        </div>

        {/* Class Name Filter */}
        <Select
          value={filterClass}
          onChange={(val) => setFilterClass(val)}
          options={[
            { value: "all", label: "All Classes" },
            ...classOptions.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
          tone="admin"
          size="sm"
          placeholder="All Classes"
          className="min-w-[140px]"
        />

        {/* Section Filter */}
        <Select
          value={filterSection}
          onChange={(val) => setFilterSection(val)}
          options={[
            { value: "all", label: "All Sections" },
            ...sectionOptions.map((opt) => ({ value: opt.value, label: opt.label })),
          ]}
          tone="admin"
          size="sm"
          placeholder="All Sections"
          className="min-w-[140px]"
        />

        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-[var(--color-admin-primary)] outline-none transition-all"
          />
        </div>

        {/* Optional: Add button can be added here if needed */}
      </div>
    </div>
  );
}


















