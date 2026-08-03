/**
 * ============================================
 * TEXTAREA COMPONENT
 * ============================================
 * 
 * Purpose: Reusable textarea component with role-based theming
 * Features:
 * - Label with required indicator
 * - Error state with message
 * - Helper text support
 * - Disabled state with visual feedback
 * - Role-based focus ring (brand, admin, teacher, student, parent)
 * - Customizable number of rows
 * - Resize disabled by default
 * - Consistent styling with transitions
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <Textarea
 *   label="Description"
 *   value={description}
 *   onChange={handleChange}
 *   placeholder="Enter description..."
 *   rows={4}
 *   error={errors.description}
 *   helperText="Provide a detailed description"
 *   tone="admin"
 *   required={true}
 *   disabled={false}
 * />
 * ============================================
 */

/**
 * ============================================
 * TONE FOCUS RING
 * ============================================
 * 
 * Maps tone to focus ring and border color classes
 * 
 * @constant {Object} TONE_FOCUS_RING
 * @property {string} brand - Brand colors
 * @property {string} admin - Admin colors
 * @property {string} teacher - Teacher colors
 * @property {string} student - Student colors
 * @property {string} parent - Parent colors
 */
const TONE_FOCUS_RING = {
  brand: 'focus:ring-brand-primary/20 focus:border-brand-primary',
  admin: 'focus:ring-admin-primary/20 focus:border-admin-primary',
  teacher: 'focus:ring-teacher-primary/20 focus:border-teacher-primary',
  student: 'focus:ring-student-primary/20 focus:border-student-primary',
  parent: 'focus:ring-parent-primary/20 focus:border-parent-primary',
};

/**
 * ============================================
 * TEXTAREA COMPONENT
 * ============================================
 * 
 * Renders a styled textarea with label and validation states
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Text displayed above the textarea
 * @param {string} props.value - Current textarea value
 * @param {Function} props.onChange - Function called when value changes
 * @param {string} props.placeholder - Placeholder text (default: "")
 * @param {number} props.rows - Number of visible rows (default: 4)
 * @param {string} props.error - Error message to display
 * @param {string} props.helperText - Additional guidance text
 * @param {boolean} props.disabled - Disables the textarea (default: false)
 * @param {boolean} props.required - Shows required (*) indicator (default: false)
 * @param {string} props.tone - Role color theme (brand, admin, teacher, student, parent)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.props - Additional native textarea props
 * @returns {JSX.Element} Textarea UI
 * 
 * @example
 * const [description, setDescription] = useState('');
 * 
 * <Textarea
 *   label="Description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   placeholder="Enter description..."
 *   rows={4}
 *   tone="admin"
 *   required={true}
 * />
 * ============================================
 */
function Textarea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  error,
  helperText,
  disabled = false,
  required = false,
  tone = 'brand',
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* ─── Label ────────────────────────────────────────────────── */}
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
      )}

      {/* ─── Textarea ──────────────────────────────────────────────── */}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full rounded-input border bg-white px-4 py-3
          text-text-primary placeholder:text-text-muted
          transition-all duration-200 outline-none resize-none
          ${
            error
              ? 'border-danger focus:ring-2 focus:ring-danger/20'
              : `border-slate-300 focus:ring-2 ${TONE_FOCUS_RING[tone] || TONE_FOCUS_RING.brand}`
          }
          ${disabled ? 'cursor-not-allowed bg-slate-100 opacity-60' : ''}
          ${className}
        `}
        {...props}
      />

      {/* ─── Error / Helper Text ────────────────────────────────────── */}
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && helperText && <p className="text-sm text-text-secondary">{helperText}</p>}
    </div>
  );
}

export default Textarea;