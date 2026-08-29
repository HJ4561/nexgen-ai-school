/**
 * ============================================
 * ASSIGNMENT FILTERS COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Filtering controls for assignment management (Teacher)
 * Features:
 * - Search input for assignment titles
 * - Class filter dropdown
 * - Subject filter dropdown
 * - Status filter buttons (All, Active, Completed)
 * - Admin-themed styling with teacher role
 * - Responsive flex layout
 * 
 * Dependencies:
 * - lucide-react for icons (Search)
 * - @/components/ui/Select for dropdown filters
 * 
 * Usage:
 * <AssignmentFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterSubject={filterSubject}
 *   setFilterSubject={setFilterSubject}
 *   classOptions={classOptions}
 *   subjectOptions={subjectOptions}
 * />
 * ============================================
 */

import { Search } from 'lucide-react';
import Select from "@/components/ui/Select";

/**
 * ============================================
 * ASSIGNMENT FILTERS COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders filter controls for assignment management
 * 
 * @param {Object} props - Component props
 * @param {string} props.search - Current search query value
 * @param {Function} props.setSearch - Setter function for search state
 * @param {string} props.filterStatus - Current status filter value ('all' | 'Active' | 'Completed')
 * @param {Function} props.setFilterStatus - Setter function for status filter
 * @param {string} props.filterClass - Current class filter value
 * @param {Function} props.setFilterClass - Setter function for class filter
 * @param {string} props.filterSubject - Current subject filter value
 * @param {Function} props.setFilterSubject - Setter function for subject filter
 * @param {Array} props.classOptions - Array of class options for dropdown
 * @param {Array} props.subjectOptions - Array of subject options for dropdown
 * @returns {JSX.Element} Assignment filters UI
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const [filterStatus, setFilterStatus] = useState('all');
 * const [filterClass, setFilterClass] = useState('');
 * const [filterSubject, setFilterSubject] = useState('');
 * const classOptions = [{ value: '10-A', label: 'Class 10-A' }];
 * const subjectOptions = [{ value: 'Math', label: 'Mathematics' }];
 * 
 * <AssignmentFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 *   filterClass={filterClass}
 *   setFilterClass={setFilterClass}
 *   filterSubject={filterSubject}
 *   setFilterSubject={setFilterSubject}
 *   classOptions={classOptions}
 *   subjectOptions={subjectOptions}
 * />
 * ============================================
 */
export default function AssignmentFilters({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  filterClass,
  setFilterClass,
  filterSubject,
  setFilterSubject,
  classOptions,
  subjectOptions,
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-soft border border-gray-100">
      <div className="flex flex-col flex-wrap items-center gap-3 md:flex-row">
        {/* ─── Search Input ─── */}
        <div className="relative flex-1 min-w-[180px]">
          <Search 
            size={15} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" 
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-teacher-primary)]"
          />
        </div>

        {/* ─── Class Filter Dropdown ─── */}
        <Select
          value={filterClass}
          onChange={(val) => setFilterClass(val)}
          options={classOptions}
          tone="teacher"
          size="sm"
          className="min-w-[130px]"
        />

        {/* ─── Subject Filter Dropdown ─── */}
        <Select
          value={filterSubject}
          onChange={(val) => setFilterSubject(val)}
          options={subjectOptions}
          tone="teacher"
          size="sm"
          className="min-w-[130px]"
        />

        {/* ─── Status Filter Buttons ─── */}
        <div className="flex bg-[var(--color-surface-dim)] rounded-lg p-0.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white shadow-sm text-[var(--color-teacher-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-teacher-primary)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('Active')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterStatus === 'Active'
                ? 'bg-white shadow-sm text-[var(--color-teacher-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-teacher-primary)]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              filterStatus === 'Completed'
                ? 'bg-white shadow-sm text-[var(--color-teacher-primary)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-teacher-primary)]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
    </div>
  );
}