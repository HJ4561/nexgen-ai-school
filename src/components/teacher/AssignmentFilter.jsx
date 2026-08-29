/**
 * ============================================
 * ASSIGNMENT FILTER COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for assignment management
 * Features:
 * - Search input for assignment titles
 * - Subject filter dropdown (All Subjects, Mathematics, English, Science)
 * - Status filter dropdown (All Status, Pending, Submitted, Graded)
 * - Date filter input
 * - Responsive grid layout (1 column mobile, 4 columns desktop)
 * - Consistent card styling with border and shadow
 * 
 * Dependencies:
 * - @/components/ui/Input for search and date fields
 * - @/components/ui/Select for dropdown filters
 * 
 * Usage:
 * <AssignmentFilter
 *   filters={filters}
 *   onChange={handleFilterChange}
 * />
 * ============================================
 */

import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * ============================================
 * ASSIGNMENT FILTER COMPONENT
 * ============================================
 * 
 * Renders filter controls for assignment management
 * 
 * @param {Object} props - Component props
 * @param {Object} props.filters - Filter state object
 * @param {string} props.filters.search - Search query
 * @param {string} props.filters.subject - Selected subject filter
 * @param {string} props.filters.status - Selected status filter
 * @param {string} props.filters.date - Selected date filter
 * @param {Function} props.onChange - Callback when a filter changes
 * @returns {JSX.Element} Assignment filter UI
 * 
 * @example
 * const [filters, setFilters] = useState({
 *   search: '',
 *   subject: '',
 *   status: '',
 *   date: ''
 * });
 * 
 * const handleFilterChange = (field, value) => {
 *   setFilters(prev => ({ ...prev, [field]: value }));
 * };
 * 
 * <AssignmentFilter
 *   filters={filters}
 *   onChange={handleFilterChange}
 * />
 * ============================================
 */
const AssignmentFilter = ({ filters, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
        {/* ─── Search Input ─── */}
        <div>
          <label className="text-sm md:text-base md:text-base text-gray-600 mb-1 block md:hidden px-4 sm:px-6 lg:px-8">Search</label>
          <Input
            placeholder="Search assignments..."
            value={filters?.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
          />
        </div>

        {/* ─── Subject Filter Dropdown ─── */}
        <div>
          <label className="text-sm md:text-base md:text-base text-gray-600 mb-1 block md:hidden px-4 sm:px-6 lg:px-8">Subject</label>
          <Select
            value={filters?.subject || ''}
            onChange={(e) => onChange('subject', e.target.value)}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
          </Select>
        </div>

        {/* ─── Status Filter Dropdown ─── */}
        <div>
          <label className="text-sm md:text-base md:text-base text-gray-600 mb-1 block md:hidden px-4 sm:px-6 lg:px-8">Status</label>
          <Select
            value={filters?.status || ''}
            onChange={(e) => onChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </Select>
        </div>

        {/* ─── Date Filter Input ─── */}
        <div>
          <label className="text-sm md:text-base md:text-base text-gray-600 mb-1 block md:hidden px-4 sm:px-6 lg:px-8">Date</label>
          <Input
            type="date"
            value={filters?.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AssignmentFilter;