/**
 * ============================================
 * CLASS SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for Timetable Management
 * Provides:
 * - Class dropdown selector for filtering timetable by class
 * - Search input for filtering by subject, teacher, or room
 * - Responsive layout that adapts to mobile and desktop
 * 
 * Dependencies:
 * - lucide-react for icons (Search)
 * - @/components/ui/Select for the class dropdown
 * 
 * Usage:
 * <ClassSelector
 *   selectedClass={selectedClass}
 *   setSelectedClass={setSelectedClass}
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 *   classOptions={classOptions}
 * />
 * ============================================
 */

import { Search } from "lucide-react";
import Select from "@/components/ui/Select";

/**
 * ============================================
 * CLASS SELECTOR COMPONENT
 * ============================================
 * 
 * Renders class filter and search controls for timetable management
 * 
 * @param {Object} props - Component props
 * @param {string|number} props.selectedClass - Currently selected class ID/value
 * @param {Function} props.setSelectedClass - Setter function for selected class
 * @param {string} props.searchTerm - Current search query value
 * @param {Function} props.setSearchTerm - Setter function for search state
 * @param {Array} props.classOptions - Array of class options for the dropdown
 * @returns {JSX.Element} Class selector and search UI
 * 
 * @example
 * const [selectedClass, setSelectedClass] = useState(1);
 * const [searchTerm, setSearchTerm] = useState('');
 * const classOptions = [
 *   { value: 1, label: 'Class 10-A' },
 *   { value: 2, label: 'Class 10-B' },
 * ];
 * 
 * <ClassSelector
 *   selectedClass={selectedClass}
 *   setSelectedClass={setSelectedClass}
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 *   classOptions={classOptions}
 * />
 * ============================================
 */
export default function ClassSelector({
  selectedClass,
  setSelectedClass,
  searchTerm,
  setSearchTerm,
  classOptions,
}) {
  return (
    <div className="flex flex-col md:flex-row-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      {/* ─── Class Dropdown ─── */}
      <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 w-full sm:w-auto px-4 sm:px-6 lg:px-8">
        <label className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] whitespace-nowrap px-4 sm:px-6 lg:px-8">
          Class:
        </label>
        <Select
          value={selectedClass}
          onChange={(val) => setSelectedClass(Number(val))}
          options={classOptions}
          tone="admin"
          size="sm"
          className="min-w-[150px] sm:min-w-[180px] w-full sm:w-auto px-4 sm:px-6 lg:px-8"
        />
      </div>

      {/* ─── Search Input ─── */}
      <div className="flex-1 min-w-[200px] w-full sm:w-auto px-4 sm:px-6 lg:px-8">
        <div className="relative px-4 sm:px-6 lg:px-8">
          {/* Search icon */}
          <Search 
            size={14} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject, teacher, or room..."
            className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm md:text-base md:text-base focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none px-4 sm:px-6 lg:px-8"
          />
        </div>
      </div>
    </div>
  );
}