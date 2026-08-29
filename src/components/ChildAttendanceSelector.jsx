/**
 * ============================================
 * CHILD ATTENDANCE SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows parents to select a child to view attendance
 * Features:
 * - Custom dropdown with avatar and child info
 * - Displays selected child's name and roll number
 * - Role-based theming (parent primary color)
 * - Smooth transitions and focus states
 * - Redux state management for selected child
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (ChevronDown, User)
 * - @/components/ui/Card for container
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <ChildAttendanceSelector />
 * ============================================
 */

import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, User } from "lucide-react";

import Card from '@/components/ui/Card';
import { setSelectedChild } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * CHILD ATTENDANCE SELECTOR COMPONENT
 * ============================================
 * 
 * Renders a custom dropdown for selecting a child
 * 
 * @returns {JSX.Element} Child attendance selector UI
 * 
 * @example
 * // In parent dashboard
 * <ChildAttendanceSelector />
 * ============================================
 */
const ChildAttendanceSelector = () => {
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
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild =
    parentLinks.find(
      (child) => child.student === selectedChild
    ) || parentLinks[0];

  /**
   * ============================================
   * HANDLE CHANGE
   * ============================================
   * 
   * Dispatches setSelectedChild action with the new child ID
   * 
   * @param {Object} e - Select change event
   */
  const handleChange = (e) => {
    dispatch(setSelectedChild(Number(e.target.value)));
  };

  return (
    <Card className="h-full px-4 sm:px-6 lg:px-8">
      {/* ─── Label ─── */}
      <label className="mb-3 block md:hidden text-sm md:text-base md:text-base font-semibold text-parent-primary px-4 sm:px-6 lg:px-8">
        Select Child
      </label>

      {/* ─── Custom Dropdown ─── */}
      <div className="relative px-4 sm:px-6 lg:px-8">
        {/* Native select (hidden md:block md:hidden appearance) */}
        <select
          value={currentChild?.student || ""}
          onChange={handleChange}
          className="
            w-full
            appearance-none
            rounded-xl
            border
            border-parent-primary/30
            bg-surface
            py-4
            pl-20
            pr-12
            outline-none
            transition
            focus:border-parent-primary
            focus:ring-2
            focus:ring-parent-primary/20
           px-4 sm:px-6 lg:px-8"
        >
          {parentLinks.map((child) => (
            <option
              key={child.id}
              value={child.student}
            >
              {child.student_name}
            </option>
          ))}
        </select>

        {/* ─── Avatar ─── */}
        <div
          className="
            absolute
            left-4
            top-1/2
            flex flex-col md:flex-row h-12
            w-12
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-parent-primary
            text-white
           px-4 sm:px-6 lg:px-8"
        >
          <User size={22} />
        </div>

        {/* ─── Child Info (selected child display) ─── */}
        {currentChild && (
          <div
            className="
              pointer-events-none
              absolute
              left-20
              top-1/2
              -translate-y-1/2
             px-4 sm:px-6 lg:px-8"
          >
            <p className="font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
              {currentChild.student_name}
            </p>

            <p className="text-xs text-text-secondary px-4 sm:px-6 lg:px-8">
              Roll No: {currentChild.student_roll_number}
            </p>
          </div>
        )}

        {/* ─── Dropdown Icon ─── */}
        <ChevronDown
          size={18}
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            text-text-secondary
           px-4 sm:px-6 lg:px-8"
        />
      </div>
    </Card>
  );
};

export default ChildAttendanceSelector;