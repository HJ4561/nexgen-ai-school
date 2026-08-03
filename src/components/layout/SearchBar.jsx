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
 * Usage Pattern:
 * This component doesn't search anything itself — it just tells you
 * (via onSearch) what to search for, after you've paused typing.
 * Your page takes that text and does the actual filtering/API call.
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

import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * ============================================
 * SIZE CLASSES
 * ============================================
 * 
 * Maps size prop to input height and text size classes
 * 
 * @constant {Object} SIZE_CLASSES
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
 * 
 * Maps size prop to icon size classes
 * 
 * @constant {Object} ICON_SIZE_CLASSES
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
 * 
 * Maps tone to focus ring color classes
 * Literal class names for Tailwind (no dynamic class building)
 * 
 * @constant {Object} TONE_FOCUS_RING
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
 * 
 * Renders a search input with debounced search and clear button
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current text in the input
 * @param {Function} props.onChange - Function called on every keystroke
 * @param {Function} props.onSearch - Function called after debounce with search text
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 400)
 * @param {string} props.placeholder - Input placeholder text (default: "Search...")
 * @param {string} props.tone - Role color for focus ring (brand, admin, teacher, student, parent)
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Search bar UI
 * 
 * @example
 * // Basic search
 * const [query, setQuery] = useState('');
 * 
 * <SearchBar
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 *   onSearch={(text) => filterStudents(text)}
 *   placeholder="Search students..."
 * />
 * 
 * // With custom tone and size
 * <SearchBar
 *   value={query}
 *   onChange={(e) => setQuery(e.target.value)}
 *   onSearch={(text) => searchAPI(text)}
 *   tone="admin"
 *   size="lg"
 *   debounceMs={600}
 * />
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
   * 
   * Waits until the user stops typing for `debounceMs`, then calls onSearch.
   * Every new keystroke cancels the previous timer and starts a fresh one,
   * so onSearch only fires once typing pauses.
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
   * 
   * Clears the input value and triggers onSearch with empty string
   * Simulates an onChange event to update parent state
   */
  function handleClear() {
    onChange({ target: { value: '' } });
    if (onSearch) onSearch('');
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* ─── Search Icon ─── */}
      <span
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted ${ICON_SIZE_CLASSES[size]}`}
      >
        <Search size={16} />
      </span>

      {/* ─── Input Field ─── */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-input border border-surface-muted bg-surface pl-9 pr-9 text-text-primary placeholder:text-text-muted transition-colors duration-150 focus:outline-none focus:ring-2 ${
          TONE_FOCUS_RING[tone] || TONE_FOCUS_RING.brand
        } ${SIZE_CLASSES[size]}`}
      />

      {/* ─── Clear Button ─── */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;