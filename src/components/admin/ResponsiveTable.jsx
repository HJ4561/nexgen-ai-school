/**
 * ============================================
 * RESPONSIVE TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Renders a responsive table with desktop table and mobile card views
 * Features:
 * - Desktop: Compact table with row accent colors
 * - Mobile: Card grid with title, badge, and detail fields
 * - Row accent cycling (admin, teacher, student, parent)
 * - Staggered animation on scroll
 * - Hover effects with color highlighting
 * - Customizable columns with mobile roles
 * - Optional row click handler
 * - Empty state handling
 * - Highlight support for numeric values
 * 
 * Column Configuration:
 * {
 *   key: string,                 // unique key
 *   label: string,               // desktop header / mobile row label
 *   render: (row) => ReactNode,  // cell content (falls back to row[key])
 *   highlight: boolean,          // colors text with row's accent color
 *   mobile: {                     // optional, controls mobile card layout
 *     role: 'title' | 'badge' | 'detail' | 'hidden',
 *     label: string,              // override label for mobile
 *   }
 * }
 * 
 * Dependencies:
 * - framer-motion for animations
 * 
 * Usage:
 * <ResponsiveTable
 *   columns={columns}
 *   data={data}
 *   keyField="id"
 *   emptyMessage="No records found."
 *   onRowClick={handleRowClick}
 *   mobileActions={mobileActions}
 *   rowAccent="rotate"
 *   animateRows={true}
 * />
 * ============================================
 */

import React from 'react';
import { motion } from "framer-motion";

/**
 * ============================================
 * RESPONSIVE TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table with desktop and mobile views
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column configuration array
 * @param {Array} props.data - Data array to display
 * @param {string} props.keyField - Unique key field name (default: 'id')
 * @param {string} props.emptyMessage - Message when no data (default: 'No records found.')
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {Function} props.mobileActions - Mobile-specific action renderer
 * @param {string} props.rowAccent - Accent style ('rotate' | 'admin' | null)
 * @param {boolean} props.animateRows - Whether to animate rows (default: false)
 * @returns {JSX.Element} Responsive table UI
 * 
 * @example
 * const columns = [
 *   { key: 'name', label: 'Name', mobile: { role: 'title' } },
 *   { key: 'status', label: 'Status', mobile: { role: 'badge' } },
 *   { key: 'email', label: 'Email', mobile: { role: 'detail', label: 'Email' } }
 * ];
 * 
 * <ResponsiveTable
 *   columns={columns}
 *   data={users}
 *   keyField="id"
 *   onRowClick={(row) => console.log(row)}
 *   rowAccent="rotate"
 *   animateRows={true}
 * />
 * ============================================
 */
export function ResponsiveTable({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No records found.',
  onRowClick,
  mobileActions,
  rowAccent = 'rotate',
  animateRows = false,
}) {
  /**
   * ============================================
   * EMPTY STATE HANDLING
   * ============================================
   * 
   * Displays a fallback UI when no data is available
   */
  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-sm md:text-base md:text-base text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
        {emptyMessage}
      </div>
    );
  }

  /**
   * ============================================
   * COLUMN ROLES
   * ============================================
   * 
   * Extracts columns by their mobile role
   * - title: Primary column (acts as card title)
   * - badge: Secondary column (acts as card badge)
   * - detail: Regular detail fields (shown in card body)
   * - hidden: hidden md:block md:hidden on mobile
   */
  const titleCol = columns.find((c) => c.mobile?.role === 'title');
  const badgeCol = columns.find((c) => c.mobile?.role === 'badge');
  const detailCols = columns.filter((c) => {
    const role = c.mobile?.role || 'detail';
    return role === 'detail';
  });

  /**
   * ============================================
   * ACCENT COLOR PALETTE
   * ============================================
   * 
   * Defines the color scheme for row accents
   * Colors cycle in order: admin, teacher, student, parent
   * 
   * @constant {Array} ACCENT_COLORS
   */
  const ACCENT_COLORS = [
    { primary: 'var(--color-admin-primary)', light: 'var(--color-admin-light)' },
    { primary: 'var(--color-teacher-primary)', light: 'var(--color-teacher-light)' },
    { primary: 'var(--color-student-primary)', light: 'var(--color-student-light)' },
    { primary: 'var(--color-parent-primary)', light: 'var(--color-parent-light)' },
  ];

  /**
   * ============================================
   * GET ACCENT COLOR
   * ============================================
   * 
   * Returns accent color based on row index
   * - 'rotate': Cycles through all 4 colors
   * - 'admin': Uses admin color for all rows
   * - null: No accent (falls back to admin)
   * 
   * @param {number} index - Row index
   * @returns {Object} Primary and light color values
   */
  const getAccent = (index) => {
    if (rowAccent === 'rotate') {
      const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
      return color;
    }
    // default: admin
    return ACCENT_COLORS[0];
  };

  /**
   * ============================================
   * GET ACCENT VARIABLE
   * ============================================
   * 
   * Extracts just the color name for CSS custom properties
   * 
   * @param {number} index - Row index
   * @returns {Object} Primary and light color variables
   */
  const getAccentVar = (index) => {
    const accent = getAccent(index);
    return {
      primary: accent.primary,
      light: accent.light,
    };
  };

  /**
   * ============================================
   * STAGGER VARIANTS
   * ============================================
   * 
   * Framer Motion variants for staggered row animations
   * Used when animateRows is true
   */
  const tableVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.06, delayChildren: 0.3 },
    },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <>
      {/* ─── Desktop Table ────────────────────────────────────────────── */}
      <div className="hidden md:block md:hidden lg:block md:hidden overflow-x-auto px-4 sm:px-6 lg:px-8">
        <motion.table
          className="w-full border-collapse px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={animateRows ? tableVariants : undefined}
        >
          <thead>
            <tr className="border-b border-gray-100 bg-[var(--color-surface-dim)] px-4 sm:px-6 lg:px-8">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] whitespace-nowrap px-4 sm:px-6 lg:px-8"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const accent = getAccentVar(index);
              const isEven = index % 2 === 0;
              const RowTag = animateRows ? motion.tr : "tr";
              
              return (
                <RowTag
                  key={row[keyField]}
                  style={{
                    '--accent': accent.primary,
                    '--light': accent.light,
                  }}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`
                    group border-b border-gray-50 last:border-0 transition-colors duration-200
                    ${isEven ? 'bg-white' : 'bg-[var(--color-surface-muted)]/60'}
                    hover:bg-[var(--light)]
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                  variants={animateRows ? rowVariants : undefined}
                >
                  {columns.map((col, colIndex) => {
                    const isFirst = colIndex === 0;
                    const isLast = colIndex === columns.length - 1;
                    
                    return (
                      <td
                        key={col.key}
                        className={`
                          px-4 py-3.5 align-middle text-sm md:text-base md:text-base ${col.highlight ? 'font-semibold text-[var(--accent)]' : 'text-[var(--color-text-secondary)]'}
                          ${isFirst && !col.highlight ? 'font-medium text-[var(--color-text-primary)]' : ''}
                          ${isFirst ? 'rounded-l-lg' : ''}
                          ${isLast ? 'rounded-r-lg' : ''}
                        `}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    );
                  })}
                </RowTag>
              );
            })}
          </tbody>
        </motion.table>
      </div>

      {/* ─── Mobile Card Grid ──────────────────────────────────────────── */}
      <div className="lg:hidden md:block md:hidden grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 p-3 px-4 sm:px-6 lg:px-8">
        {data.map((row, index) => {
          const accent = getAccentVar(index);
          
          return (
            <motion.div
              key={row[keyField]}
              style={{
                '--accent': accent.primary,
              }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`
                rounded-lg border border-gray-100 bg-white p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 transition-all duration-200
                ${onRowClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
                border-t-4 border-t-[var(--accent)]
              `}
              initial={animateRows ? { opacity: 0, y: 12 } : undefined}
              whileInView={animateRows ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              {/* ─── Title and Badge ─── */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                <div className="min-w-0 flex-1 px-4 sm:px-6 lg:px-8">
                  {titleCol?.render ? titleCol.render(row) : null}
                </div>
                {badgeCol && (
                  <div className="shrink-0 px-4 sm:px-6 lg:px-8">
                    {badgeCol.render ? badgeCol.render(row) : null}
                  </div>
                )}
              </div>

              {/* ─── Detail Fields ─── */}
              {detailCols.length > 0 && (
                <div className="mt-3 space-y-1.5 px-4 sm:px-6 lg:px-8">
                  {detailCols.map((col) => (
                    <div
                      key={col.key}
                      className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8"
                    >
                      <span className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                        {col.mobile?.label || col.label}
                      </span>
                      <span className="font-medium text-[var(--color-text-primary)] text-right px-4 sm:px-6 lg:px-8">
                        {col.render ? col.render(row) : row[col.key]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Mobile Actions ─── */}
              {mobileActions && (
                <div className="mt-3 pt-3 border-t border-gray-100 px-4 sm:px-6 lg:px-8">
                  {mobileActions(row)}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

export default ResponsiveTable;