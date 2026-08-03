/**
 * ============================================
 * CHILD SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Displays a grid of selectable child cards for parent dashboard
 * Features:
 * - Grid layout with configurable columns (1 or 2)
 * - Child cards with avatar and information
 * - Selected child highlighting
 * - Currently viewing section
 * - Role-based theming (parent primary color)
 * - Redux state management for selected child
 * 
 * Dependencies:
 * - @/components/ui/Card for container
 * - @/components/parent/ChildCard for individual child cards
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <ChildSelector
 *   title="Select Child"
 *   subtitle="Choose a child to view their dashboard"
 *   columns={2}
 * />
 * ============================================
 */

import { useDispatch, useSelector } from "react-redux";

import Card from '@/components/ui/Card'
import ChildCard from "./ChildCard";

import { setSelectedChild } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * CHILD SELECTOR COMPONENT
 * ============================================
 * 
 * Renders a grid of child cards for selection
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Heading text (default: "Select Child")
 * @param {string} props.subtitle - Optional subtitle text
 * @param {number} props.columns - Number of columns (1 or 2, default: 2)
 * @returns {JSX.Element} Child selector UI
 * 
 * @example
 * // Default two-column layout
 * <ChildSelector
 *   title="Select Child"
 *   subtitle="Choose a child to view their dashboard"
 * />
 * 
 * // Single column layout
 * <ChildSelector
 *   title="My Children"
 *   columns={1}
 * />
 * ============================================
 */
const ChildSelector = ({
  title = "Select Child",
  subtitle = "",
  columns = 2,
}) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves parentLinks and selectedChild from Redux store
   */
  const { parentLinks, selectedChild } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * SELECTED STUDENT
   * ============================================
   * 
   * Finds the currently selected student from parentLinks
   */
  const selectedStudent = parentLinks.find(
    (c) => c.student === selectedChild
  );

  return (
    <Card>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      {/* ─── Child Cards Grid ────────────────────────────────────── */}
      <div
        className={`grid gap-4 ${
          columns === 1
            ? "grid-cols-1"
            : "md:grid-cols-2"
        }`}
      >
        {parentLinks.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            selected={selectedChild === child.student}
            onSelect={(id) =>
              dispatch(setSelectedChild(id))
            }
          />
        ))}
      </div>

      {/* ─── Currently Viewing Section ──────────────────────────── */}
      {selectedStudent && (
        <div className="mt-5 rounded-xl bg-parent-primary/5 p-4">
          <p className="text-sm text-text-secondary">
            Currently Viewing
          </p>

          <h3 className="mt-1 text-lg font-semibold text-parent-primary">
            {selectedStudent.student_name}
          </h3>

          <p className="text-sm text-text-secondary">
            Roll No: {selectedStudent.student_roll_number}
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChildSelector;