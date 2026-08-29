/**
 * ============================================
 * SUBJECT FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filter controls for subject management
 * Used in: Admin - Academic Structure - Subjects Tab
 * 
 * Features:
 * - Filter by class
 * - Filter by subject name
 * - Filter by assignment status (assigned/unassigned/all)
 * - Dynamic options from data
 * 
 * Dependencies:
 * - Select component for dropdowns
 * - Lucide React icons
 * ============================================
 */

import { Filter } from "lucide-react";
import Select from '@/components/ui/Select';

/**
 * SubjectFilters Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.filterClass - Selected class filter (class_section_id)
 * @param {Function} props.setFilterClass - Update class filter
 * @param {string} props.filterSubject - Selected subject name filter
 * @param {Function} props.setFilterSubject - Update subject filter
 * @param {string} props.filterAssignment - Selected assignment status filter (all | assigned | unassigned)
 * @param {Function} props.setFilterAssignment - Update assignment status filter
 * @param {Array} props.classOptions - Available class options [{ value, label }]
 * @param {Array} props.subjectOptions - Available subject options [{ value, label }]
 * @param {number} props.totalItems - Total items count (optional)
 * @returns {JSX.Element} Rendered filter controls
 * 
 * @example
 * <SubjectFilters
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterSubject={filterSubject}
 *   setFilterSubject={setFilterSubject}
 *   filterAssignment={filterAssignment}
 *   setFilterAssignment={setFilterAssignment}
 *   classOptions={classOptions}
 *   subjectOptions={subjectOptions}
 *   totalItems={filtered.length}
 * />
 */
export default function SubjectFilters({
  filterClass,
  setFilterClass,
  filterSubject,
  setFilterSubject,
  filterAssignment,
  setFilterAssignment,
  classOptions,
  subjectOptions,
  totalItems,
}) {
  return (
    <div className="flex flex-col md:flex-row-wrap items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
      {/* Filter Label */}
      <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
        <Filter size={16} className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
        <span className="text-xs font-medium text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">Filters:</span>
      </div>

      {/* Class Filter */}
      <Select
        value={filterClass}
        onChange={(val) => setFilterClass(val)}
        options={[
          { value: "all", label: "All Classes" },
          ...classOptions.map((opt) => ({ value: String(opt.value), label: opt.label })),
        ]}
        tone="admin"
        size="sm"
        placeholder="All Classes"
        className="min-w-[140px] px-4 sm:px-6 lg:px-8"
      />

      {/* Subject Name Filter */}
      <Select
        value={filterSubject}
        onChange={(val) => setFilterSubject(val)}
        options={[
          { value: "all", label: "All Subjects" },
          ...subjectOptions.map((opt) => ({ value: opt.value, label: opt.label })),
        ]}
        tone="admin"
        size="sm"
        placeholder="All Subjects"
        className="min-w-[140px] px-4 sm:px-6 lg:px-8"
      />

      {/* Assignment Status Filter */}
      <Select
        value={filterAssignment}
        onChange={(val) => setFilterAssignment(val)}
        options={[
          { value: "all", label: "All" },
          { value: "assigned", label: "Assigned" },
          { value: "unassigned", label: "Unassigned" },
        ]}
        tone="admin"
        size="sm"
        placeholder="All"
        className="min-w-[140px] px-4 sm:px-6 lg:px-8"
      />
    </div>
  );
}















