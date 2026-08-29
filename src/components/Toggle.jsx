/**
 * ============================================
 * TOGGLE COMPONENT
 * ============================================
 * 
 * Purpose: Reusable toggle switch with role-based theming
 * Features:
 * - Multiple size options (sm, md, lg)
 * - Role-based colors (brand, admin, teacher, student, parent)
 * - Disabled state with visual feedback
 * - Optional label
 * - Smooth transitions with transform animations
 * - ARIA accessibility attributes
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   tone="admin"
 *   size="md"
 *   label="Enable notifications"
 *   disabled={false}
 * />
 * ============================================
 */

import React from 'react';

/**
 * ============================================
 * TOGGLE COMPONENT
 * ============================================
 * 
 * Renders a styled toggle switch with role-based theming
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.checked - Current toggle state
 * @param {Function} props.onChange - Function called when toggle is clicked
 * @param {string} props.tone - Role color theme (brand, admin, teacher, student, parent) (default: 'brand')
 * @param {string} props.size - Toggle size (sm, md, lg) (default: 'md')
 * @param {boolean} props.disabled - Disables the toggle (default: false)
 * @param {string} props.label - Optional label text
 * @returns {JSX.Element} Toggle UI
 * 
 * @example
 * const [isEnabled, setIsEnabled] = useState(false);
 * 
 * // Basic toggle
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 * />
 * 
 * // Toggle with label and custom theme
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   tone="admin"
 *   size="lg"
 *   label="Enable notifications"
 * />
 * ============================================
 */
function Toggle({ checked, onChange, tone = 'brand', size = 'md', disabled = false, label }) {
  /**
   * ============================================
   * SIZE CLASSES
   * ============================================
   * 
   * Maps size prop to Tailwind classes
   * 
   * @constant {Object} sizeClasses
   * @property {Object} sm - Small size (32px)
   * @property {Object} md - Medium size (40px)
   * @property {Object} lg - Large size (48px)
   */
  const sizeClasses = {
    sm: {
      wrapper: 'w-8 h-5',
      dot: 'w-3 h-3',
      translate: 'translate-x-3',
    },
    md: {
      wrapper: 'w-10 h-6',
      dot: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    lg: {
      wrapper: 'w-12 h-7',
      dot: 'w-5 h-5',
      translate: 'translate-x-5',
    },
  };

  /**
   * ============================================
   * TONE COLORS
   * ============================================
   * 
   * Maps tone to background color classes
   * 
   * @constant {Object} toneColors
   */
  const toneColors = {
    brand: 'bg-brand-primary',
    admin: 'bg-admin-primary',
    teacher: 'bg-teacher-primary',
    student: 'bg-student-primary',
    parent: 'bg-parent-primary',
  };

  /**
   * ============================================
   * BG COLOR DETERMINATION
   * ============================================
   * 
   * Uses role color when checked, gray when unchecked
   */
  const bgColor = checked ? toneColors[tone] || toneColors.brand : 'bg-gray-300';

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
      {/* ─── Label ────────────────────────────────────────────────── */}
      {label && <span className="text-sm md:text-base md:text-base text-[var(--color-text-secondary)] px-4 sm:px-6 lg:px-8">{label}</span>}

      {/* ─── Toggle Button ──────────────────────────────────────────── */}
      <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex flex-col md:flex-row items-center rounded-full transition-colors duration-200 ease-in-out
          ${sizeClasses[size].wrapper}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${bgColor}
        `}
      >
        {/* ─── Toggle Dot ────────────────────────────────────────────── */}
        <span
          className={`
            inline-block md:hidden rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out
            ${sizeClasses[size].dot}
            ${checked ? sizeClasses[size].translate : 'translate-x-0.5'}
          `}
        />
      </Button>
    </div>
  );
}

export default Toggle;