/**
 * ============================================
 * STAT CARD COMPONENT
 * ============================================
 * 
 * Purpose: Dashboard summary number cards
 * Features:
 * - Label and value display
 * - Role-based theming (brand, admin, teacher, student, parent)
 * - Optional footer with icon and text
 * - Footer color states (success, warning, danger, neutral)
 * - Auto-icon based on footer color
 * - Hover effects (shadow + translate)
 * - Subtle glow line at bottom
 * - Optional glow effect on card
 * 
 * Dependencies:
 * - lucide-react for icons (TrendingUp, TrendingDown)
 * 
 * Usage:
 * <StatCard
 *   label="Classes Today"
 *   value="5"
 *   tone="teacher"
 *   footerColor="success"
 *   footerText="All scheduled"
 * />
 * ============================================
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * ============================================
 * BACKGROUND TONE CLASSES
 * ============================================
 * 
 * Maps tone to background color classes with 10% opacity
 * 
 * @constant {Object} BG_TONE_CLASSES
 */
const BG_TONE_CLASSES = {
  brand: 'bg-[var(--color-brand-primary)]/10',
  admin: 'bg-[var(--color-admin-primary)]/10',
  teacher: 'bg-[var(--color-teacher-primary)]/10',
  student: 'bg-[var(--color-student-primary)]/10',
  parent: 'bg-[var(--color-parent-primary)]/10',
};

/**
 * ============================================
 * VALUE TONE CLASSES
 * ============================================
 * 
 * Maps tone to text color classes for the value
 * 
 * @constant {Object} VALUE_TONE_CLASSES
 */
const VALUE_TONE_CLASSES = {
  brand: 'text-brand-primary',
  admin: 'text-admin-primary',
  teacher: 'text-teacher-primary',
  student: 'text-student-primary',
  parent: 'text-parent-primary',
};

/**
 * ============================================
 * GLOW TONE CLASSES
 * ============================================
 * 
 * Maps tone to gradient color for the bottom glow line
 * 
 * @constant {Object} GLOW_TONE_CLASSES
 */
const GLOW_TONE_CLASSES = {
  brand: 'via-brand-primary',
  admin: 'via-admin-primary',
  teacher: 'via-teacher-primary',
  student: 'via-student-primary',
  parent: 'via-parent-primary',
};

/**
 * ============================================
 * FOOTER COLOR CLASSES
 * ============================================
 * 
 * Maps footer color to text color classes
 * 
 * @constant {Object} FOOTER_COLOR_CLASSES
 */
const FOOTER_COLOR_CLASSES = {
  success: 'text-success-text',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
  neutral: 'text-text-secondary',
};

/**
 * ============================================
 * DEFAULT FOOTER ICONS
 * ============================================
 * 
 * Auto-selects icon based on footer color
 * - success: TrendingUp (green)
 * - warning: TrendingDown (yellow)
 * - danger: TrendingDown (red)
 * - neutral: null (no icon)
 * 
 * @constant {Object} DEFAULT_FOOTER_ICONS
 */
const DEFAULT_FOOTER_ICONS = {
  success: <TrendingUp size={14} />,
  warning: <TrendingDown size={14} />,
  danger: <TrendingDown size={14} />,
  neutral: null,
};

/**
 * ============================================
 * STAT CARD COMPONENT
 * ============================================
 * 
 * Renders a dashboard summary card with label and value
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Small text on top (e.g., "Classes Today")
 * @param {string|number} props.value - The big number/text (e.g., "5" or "1,240")
 * @param {string} props.tone - Role color for the big number (brand, admin, teacher, student, parent)
 * @param {React.ReactNode} props.footerIcon - Custom footer icon (overrides auto-selection)
 * @param {string} props.footerText - Short message at the bottom (e.g., "All scheduled")
 * @param {string} props.footerColor - Color for footer icon+text (success, warning, danger, neutral)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.glow - Whether to add glow effect on card
 * @returns {JSX.Element} Stat card UI
 * 
 * @example
 * // Basic stat card
 * <StatCard label="Total Students" value="1,240" tone="student" />
 * 
 * // With footer
 * <StatCard
 *   label="Classes Today"
 *   value="5"
 *   tone="teacher"
 *   footerColor="success"
 *   footerText="All scheduled"
 * />
 * 
 * // With custom icon
 * <StatCard
 *   label="Pending Submissions"
 *   value="12"
 *   tone="admin"
 *   footerIcon={<Clock size={14} />}
 *   footerText="Grade by Fri"
 *   footerColor="warning"
 * />
 * ============================================
 */
function StatCard({
  label,
  value,
  tone = 'brand',
  footerIcon,
  footerText,
  footerColor = 'neutral',
  className = '',
  glow = false,
}) {
  // Resolve footer icon (custom or auto-selected)
  const resolvedIcon = footerIcon !== undefined ? footerIcon : DEFAULT_FOOTER_ICONS[footerColor];
  const hasFooter = Boolean(resolvedIcon || footerText);

  // Resolve background class based on tone
  const bgClass = BG_TONE_CLASSES[tone] || 'bg-surface';

  return (
    <div
      className={`relative overflow-hidden rounded-card ${bgClass} p-5 shadow-soft transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${className} ${
        glow ? 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[var(--color-teacher-primary)] before:to-transparent before:opacity-20 before:blur-2xl before:-z-10' : ''
      }`}
    >
      {/* ─── Label ─── */}
      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {label}
      </p>

      {/* ─── Value ─── */}
      <p
        className={`mt-2 text-3xl font-bold ${VALUE_TONE_CLASSES[tone] || VALUE_TONE_CLASSES.brand}`}
      >
        {value}
      </p>

      {/* ─── Footer (optional) ─── */}
      {hasFooter && (
        <div
          className={`mt-2 flex items-center gap-1 text-sm ${FOOTER_COLOR_CLASSES[footerColor] || FOOTER_COLOR_CLASSES.neutral}`}
        >
          {resolvedIcon}
          {footerText && <span>{footerText}</span>}
        </div>
      )}

      {/* ─── Glow Line at Bottom ─── */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${GLOW_TONE_CLASSES[tone] || GLOW_TONE_CLASSES.brand} to-transparent`}
      />
    </div>
  );
}

export default StatCard;