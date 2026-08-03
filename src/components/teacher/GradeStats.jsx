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
    <div className="lg:col-span-2 bg-[var(--color-teacher-light)]/30 rounded-xl p-5 border border-[var(--color-teacher-primary)]/20 flex flex-col justify-between border-t-[3px] border-t-[var(--color-teacher-primary)]">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--color-teacher-primary)] uppercase tracking-wider">
          Class Analytics
        </p>
        <BarChart3 size={18} className="text-[var(--color-teacher-primary)]" />
      </div>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {/* Average */}
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--color-warning)]">
            {stats.avg ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Avg Mark</p>
        </div>

        {/* Highest */}
        <div className="text-center border-x border-[var(--color-teacher-primary)]/20">
          <p className="text-2xl font-bold text-[var(--color-teacher-primary)]">
            {stats.highest ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Highest</p>
        </div>

        {/* Lowest */}
        <div className="text-center">
          <p className="text-2xl font-bold text-[var(--color-danger)]">
            {stats.lowest ?? '—'}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Lowest</p>
        </div>
      </div>
    </div>
  );
}











