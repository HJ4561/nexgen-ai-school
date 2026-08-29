/**
 * ============================================
 * SEARCH BAR COMPONENT
 * ============================================
 * 
 * Purpose: Search/filter input with debounced search and clear button
 * Features:
 * - Fixed search icon on the left
 * - Clear (X) button on the right when text is present
 * - Debounced onSearch callback (default 400ms)
 * - Controlled input with immediate onChange feedback
 * - Role-based focus ring (brand, admin, teacher, student, parent)
 * - Multiple size options (sm, md, lg)
 * - Responsive styling
 * 
 * Dependencies:
 * - lucide-react for icons (Search, X)
 * 
 * Usage:
 * <SearchBar
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 *   onSearch={(text) => filterStudents(text)}
 *   placeholder="Search students..."
 *   tone="admin"
 *   size="md"
 *   debounceMs={400}
 * />
 * ============================================
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

/**
 * ============================================
 * SIZE CLASSES
 * ============================================
 */
const SIZE_CLASSES = {
  sm: 'h-input-sm text-sm',
  md: 'h-input-md text-base',
  lg: 'h-input-lg text-lg',
};

/**
 * ============================================
 * ICON SIZE CLASSES
 * ============================================
 */
const ICON_SIZE_CLASSES = {
  sm: 'w-icon-sm h-icon-sm',
  md: 'w-icon-sm h-icon-sm',
  lg: 'w-icon-md h-icon-md',
};

/**
 * ============================================
 * TONE FOCUS RING
 * ============================================
 */
const TONE_FOCUS_RING = {
  brand: 'focus:ring-brand-primary focus:border-brand-primary',
  admin: 'focus:ring-admin-primary focus:border-admin-primary',
  teacher: 'focus:ring-teacher-primary focus:border-teacher-primary',
  student: 'focus:ring-student-primary focus:border-student-primary',
  parent: 'focus:ring-parent-primary focus:border-parent-primary',
};

/**
 * ============================================
 * SEARCH BAR COMPONENT
 * ============================================
 */
function SearchBar({
  value,
  onChange,
  onSearch,
  debounceMs = 400,
  placeholder = 'Search...',
  tone = 'brand',
  size = 'md',
  className = '',
}) {
  const debounceTimer = useRef(null);

  /**
   * ============================================
   * DEBOUNCE EFFECT
   * ============================================
   */
  useEffect(() => {
    if (!onSearch) return;

    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [value, debounceMs, onSearch]);

  /**
   * ============================================
   * HANDLE CLEAR
   * ============================================
   */
  const handleClear = useCallback(() => {
    const event = { target: { value: '' } };
    onChange(event);
    if (onSearch) onSearch('');
  }, [onChange, onSearch]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* ─── Search Icon ─── */}
      <span
        className={`pointer-events-none absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-text-muted ${ICON_SIZE_CLASSES[size]}`}
      >
        <Search size={size === 'lg' ? 18 : 16} />
      </span>

      {/* ─── Input Field ─── */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-input border border-surface-muted bg-surface pl-8 sm:pl-9 pr-8 sm:pr-9 text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 ${
          TONE_FOCUS_RING[tone] || TONE_FOCUS_RING.brand
        } ${SIZE_CLASSES[size]}`}
      />

      {/* ─── Clear Button ─── */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors p-1 rounded-full hover:bg-surface-muted"
          aria-label="Clear search"
        >
          <X size={size === 'lg' ? 18 : 16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;