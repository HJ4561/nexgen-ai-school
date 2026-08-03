/**
 * ============================================
 * CHILD EVENT SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows parents to select a child for event participation view
 * Features:
 * - Child selection dropdown with name and roll number
 * - Selected child information display
 * - Child details (name, roll number, class, relation)
 * - Role-based theming (parent primary color)
 * - Responsive card layout
 * 
 * Dependencies:
 * - @/components/ui/Card for container
 * - @/components/ui/Select for dropdown
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <ChildEventSelector />
 * ============================================
 */

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

import { setSelectedChild } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * CHILD EVENT SELECTOR COMPONENT
 * ============================================
 * 
 * Renders a child selector for event participation viewing
 * 
 * @returns {JSX.Element} Child event selector UI
 * 
 * @example
 * // In parent dashboard
 * <ChildEventSelector />
 * ============================================
 */
const ChildEventSelector = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves parentLinks and selectedChild from Redux store
   */
  const {
    parentLinks = [],
    selectedChild,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * DROPDOWN OPTIONS
   * ============================================
   * 
   * Maps parentLinks to Select component options
   * Format: "Child Name (Roll Number)"
   */
  const options = useMemo(
    () =>
      parentLinks.map((child) => ({
        value: child.student,
        label: `${child.student_name} (${child.student_roll_number})`,
      })),
    [parentLinks]
  );

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild = useMemo(
    () =>
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0],
    [parentLinks, selectedChild]
  );

  /**
   * ============================================
   * HANDLE CHANGE
   * ============================================
   * 
   * Dispatches setSelectedChild action with the new child ID
   * 
   * @param {string|number} value - Selected child ID
   */
  const handleChange = (value) => {
    dispatch(setSelectedChild(Number(value)));
  };

  return (
    <Card hover={false}>
      <div className="space-y-5">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Select Child
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Choose a child to view event participation history.
          </p>
        </div>

        {/* ─── Child Selector Dropdown ──────────────────────────── */}
        <Select
          tone="parent"
          size="lg"
          value={currentChild?.student || ""}
          options={options}
          placeholder="Select Child"
          onChange={handleChange}
        />

        {/* ─── Selected Child Information ────────────────────────── */}
        {currentChild && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              {/* Child Details */}
              <div>
                <h4 className="font-semibold text-text-primary">
                  {currentChild.student_name}
                </h4>

                <p className="mt-1 text-sm text-text-secondary">
                  Roll No: {currentChild.student_roll_number}
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  Grade {currentChild.class_name}
                </p>
              </div>

              {/* Relation Badge */}
              <div className="rounded-full bg-parent-primary/10 px-3 py-1 text-sm font-medium text-parent-primary">
                {currentChild.relation}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChildEventSelector;