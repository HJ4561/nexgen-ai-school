/**
 * ============================================
 * GRADE STATS COMPONENT
 * ============================================
 * 
 * Purpose: Display grade statistics in a compact card
 * Used by: Teacher - Grade Management page
 * 
 * Features:
 * - Average marks display
 * - Highest marks display
 * - Lowest marks display
 * - Teacher role theming
 * - Border accent with teacher color
 * - Icon for visual enhancement
 * 
 * Dependencies:
 * - Lucide React icons
 * ============================================
 */

import { BarChart3 } from 'lucide-react';

/**
 * GradeStats Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.stats - Statistics data object
 * @param {number} props.stats.avg - Average marks
 * @param {number} props.stats.highest - Highest marks
 * @param {number} props.stats.lowest - Lowest marks
 * @returns {JSX.Element} Rendered stats card
 * 
 * @example
 * <GradeStats stats={{
 *   avg: 75.5,
 *   highest: 98,
 *   lowest: 45
 * }} />
 */
export default function GradeStats({ stats }) {
  return (
    <div className="lg:col-span-2 bg-[var(--color-teacher-light)]/30 rounded-xl p-5 border border-[var(--color-teacher-primary)]/20 flex flex-col md:flex-row-col justify-between border-t-[3px] border-t-[var(--color-teacher-primary)] px-4 sm:px-6 lg:px-8">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold text-[var(--color-teacher-primary)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">
          Class Analytics
        </p>
        <BarChart3 size={18} className="text-[var(--color-teacher-primary)] px-4 sm:px-6 lg:px-8" />
      </div>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 mt-3 px-4 sm:px-6 lg:px-8">
        {/* Average */}
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-warning)] px-4 sm:px-6 lg:px-8">
            {stats.avg ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">Avg Mark</p>
        </div>

        {/* Highest */}
        <div className="text-center border-x border-[var(--color-teacher-primary)]/20 px-4 sm:px-6 lg:px-8">
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-teacher-primary)] px-4 sm:px-6 lg:px-8">
            {stats.highest ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">Highest</p>
        </div>

        {/* Lowest */}
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <p className="text-2xl md:text-3xl font-bold text-[var(--color-danger)] px-4 sm:px-6 lg:px-8">
            {stats.lowest ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">Lowest</p>
        </div>
      </div>
    </div>
  );
}











