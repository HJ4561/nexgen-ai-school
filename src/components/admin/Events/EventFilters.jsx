/**
 * ============================================
 * EVENT FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filter controls for event management
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Search events or venues
 * - Filter by status (All, Scheduled, Upcoming, Completed)
 * - Admin role theming
 * - Responsive flex layout
 * 
 * Dependencies:
 * - Select component for dropdown
 * - Lucide React icons
 * ============================================
 */

import { Search } from 'lucide-react';
import Select from '@/components/ui/Select';
import { Search, X } from 'lucide-react';  // Add X for clear button


/**
 * EventFilters Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.search - Current search query
 * @param {Function} props.setSearch - Update search query
 * @param {string} props.filterStatus - Current status filter
 * @param {Function} props.setFilterStatus - Update status filter
 * @returns {JSX.Element} Rendered filter controls
 * 
 * @example
 * <EventFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterStatus={filterStatus}
 *   setFilterStatus={setFilterStatus}
 * />
 */
export default function EventFilters({
  search,
  setSearch,
  filterStatus,
  setFilterStatus,
  hasActiveFilters,  // Add this
  clearFilters,      // Add this
}) {
  // ─── Status Options ──────────────────────────────────────────────────
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-4 flex flex-wrap items-center gap-3">
      {/* ─── Search Input ────────────────────────────────────────────── */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or venues..."
          className="w-full pl-9 pr-3 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none"
        />
      </div>

      {/* ─── Status Filter ────────────────────────────────────────────── */}
      <Select
        value={filterStatus}
        onChange={(val) => setFilterStatus(val)}
        options={statusOptions}
        tone="admin"
        size="sm"
        className="min-w-[140px]"
      />
    </div>
  );
}
















