/**
 * ============================================
 * CHILD CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a selectable child card for parent dashboard
 * Features:
 * - Child avatar with first letter
 * - Child name, roll number, and relation
 * - Selected/unselected states with visual feedback
 * - Checkmark icon for selected state
 * - Role-based theming (parent primary color)
 * - Hover effects and transitions
 * - Click handler for selection
 * 
 * Dependencies:
 * - lucide-react for icons (CheckCircle)
 * 
 * Usage:
 * <ChildCard
 *   child={childData}
 *   selected={isSelected}
 *   onSelect={handleSelect}
 * />
 * ============================================
 */

import { CheckCircle } from "lucide-react";

/**
 * ============================================
 * CHILD CARD COMPONENT
 * ============================================
 * 
 * Renders a selectable card for a child
 * 
 * @param {Object} props - Component props
 * @param {Object} props.child - Child object containing student data
 * @param {string} props.child.student_name - Name of the student
 * @param {string} props.child.student_roll_number - Roll number of the student
 * @param {string} props.child.relation - Relation to the child (e.g., "Father", "Mother")
 * @param {boolean} props.selected - Whether this child is currently selected
 * @param {Function} props.onSelect - Callback when the card is clicked
 * @returns {JSX.Element} Child card UI
 * 
 * @example
 * const [selectedChildId, setSelectedChildId] = useState(null);
 * 
 * <ChildCard
 *   child={{ student: 1, student_name: 'John Doe', student_roll_number: '1001', relation: 'Father' }}
 *   selected={selectedChildId === 1}
 *   onSelect={(id) => setSelectedChildId(id)}
 * />
 * ============================================
 */
const ChildCard = ({
  child,
  selected,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(child.student)}
      className={`
        w-full rounded-xl border-2 p-4
        transition-all duration-200
        ${
          selected
            ? "border-parent-primary bg-parent-primary/5 shadow-md"
            : "border-border bg-surface hover:border-parent-primary/40"
        }
      `}
    >
      <div className="flex items-center justify-between">
        {/* ============================================
            LEFT SECTION
            Avatar + Child Information
            ============================================ */}

        <div className="flex items-center gap-4">
          {/* ─── Avatar ─── */}
          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-parent-primary
              text-lg font-bold text-white
            "
          >
            {child.student_name.charAt(0)}
          </div>

          {/* ─── Child Info ─── */}
          <div className="text-left">
            <h3 className="font-semibold text-text-primary">
              {child.student_name}
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              {child.student_roll_number}
            </p>

            <p className="text-xs text-text-secondary">
              {child.relation}
            </p>
          </div>
        </div>

        {/* ============================================
            RIGHT SECTION
            Selection Indicator
            ============================================ */}

        {selected ? (
          // ─── Selected State ───
          <CheckCircle
            size={24}
            className="text-parent-primary"
          />
        ) : (
          // ─── Unselected State ───
          <div className="h-6 w-6 rounded-full border-2 border-slate-300" />
        )}
      </div>
    </button>
  );
};

export default ChildCard;