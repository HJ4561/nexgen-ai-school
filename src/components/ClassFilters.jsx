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
    <div className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 border-b border-gray-100 bg-[var(--color-surface-dim)]/30 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row-wrap items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
        {/* Filter Label */}
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <Filter size={16} className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
          <span className="text-xs font-medium text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">Filters:</span>
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
          className="min-w-[140px] px-4 sm:px-6 lg:px-8"
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
          className="min-w-[140px] px-4 sm:px-6 lg:px-8"
        />

        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs px-4 sm:px-6 lg:px-8">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm md:text-base md:text-base focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-[var(--color-admin-primary)] outline-none transition-all px-4 sm:px-6 lg:px-8"
          />
        </div>

        {/* Optional: Add button can be added here if needed */}
      </div>
    </div>
  );
}


















