/**
 * ============================================
 * GRADE FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filter controls for grade management
 * Used by: Teacher - Grade Management page
 * 
 * Features:
 * - Subject/Class filter
 * - Exam type filter
 * - Exam date filter with clear button
 * - Teacher role theming
 * - Responsive grid layout
 * 
 * Dependencies:
 * - Select component for dropdowns
 * ============================================
 */

import Select from '@/components/ui/Select';

/**
 * GradeFilters Component
 * 
 * @component
 * @param {Object} props
 * @param {string|number} props.filterSubject - Currently selected subject filter
 * @param {Function} props.setFilterSubject - Update subject filter
 * @param {string} props.filterExamType - Currently selected exam type filter
 * @param {Function} props.setFilterExamType - Update exam type filter
 * @param {Array} props.subjectOptions - Available subject options
 * @param {Array} props.examTypeOptions - Available exam type options
 * @param {string} props.filterExamDate - Selected date filter
 * @param {Function} props.setFilterExamDate - Update date filter
 * @returns {JSX.Element} Rendered filter controls
 * 
 * @example
 * <GradeFilters
 *   filterSubject={filterSubject}
 *   setFilterSubject={setFilterSubject}
 *   filterExamType={filterExamType}
 *   setFilterExamType={setFilterExamType}
 *   subjectOptions={subjectOptions}
 *   examTypeOptions={examTypeOptions}
 *   filterExamDate={filterExamDate}
 *   setFilterExamDate={setFilterExamDate}
 * />
 */
export default function GradeFilters({
  filterSubject,
  setFilterSubject,
  filterExamType,
  setFilterExamType,
  subjectOptions,
  examTypeOptions,
  filterExamDate,
  setFilterExamDate,
}) {
  return (
    <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-soft border border-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Subject/Class Filter */}
        <Select
          label="Subject / Class"
          tone="teacher"
          value={filterSubject}
          onChange={(val) => setFilterSubject(val)}
          options={subjectOptions}
          placeholder="Select subject or class..."
        />
        
        {/* Exam Type Filter */}
        <Select
          label="Exam Type"
          tone="teacher"
          value={filterExamType}
          onChange={(val) => setFilterExamType(val)}
          options={examTypeOptions}
          placeholder="Select exam"
        />
        
        {/* Exam Date Filter */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Exam Date
          </label>
          <input
            type="date"
            value={filterExamDate}
            onChange={(e) => setFilterExamDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-teacher-primary)] outline-none text-sm"
          />
          {filterExamDate && (
            <button
              onClick={() => setFilterExamDate('')}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] mt-1 transition-colors"
            >
              Clear date
            </button>
          )}
        </div>
      </div>
    </div>
  );
}















