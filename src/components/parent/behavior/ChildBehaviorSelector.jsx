/**
 * ============================================
 * CHILD BEHAVIOR SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows parents to select a child and view behavior statistics
 * Features:
 * - Child selection dropdown with name and roll number
 * - Selected child information display
 * - Total behavior logs count
 * - Latest behavior record date
 * - Educational tip card
 * - Role-based theming (parent primary color)
 * - Responsive grid layout
 * 
 * Dependencies:
 * - lucide-react for icons (User, ClipboardList, CalendarDays)
 * - @/components/ui/Card for container
 * - @/components/ui/Select for dropdown
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <ChildBehaviorSelector />
 * ============================================
 */

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

import { setSelectedChild } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * CHILD BEHAVIOR SELECTOR COMPONENT
 * ============================================
 * 
 * Renders a child selector with behavior statistics
 * 
 * @returns {JSX.Element} Child behavior selector UI
 * 
 * @example
 * // In parent dashboard
 * <ChildBehaviorSelector />
 * ============================================
 */
const ChildBehaviorSelector = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves parentLinks, behaviorLogs, and selectedChild from Redux store
   */
  const {
    parentLinks = [],
    behaviorLogs = [],
    selectedChild,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * SELECT OPTIONS
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
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * CHILD LOGS
   * ============================================
   * 
   * Filters behavior logs for the selected child
   */
  const childLogs = useMemo(() => {
    if (!currentChild) return [];
    return behaviorLogs.filter(
      (log) => log.student_name === currentChild.student_name
    );
  }, [behaviorLogs, currentChild]);

  /**
   * ============================================
   * LATEST RECORD
   * ============================================
   * 
   * Finds the most recent behavior log for the selected child
   * Returns null if no logs exist
   */
  const latestLog = useMemo(() => {
    if (!childLogs.length) return null;
    return [...childLogs].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
  }, [childLogs]);

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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ============================================
            LEFT SECTION
            Child selection and information
            ============================================ */}

        <div className="space-y-5">
          {/* ─── Header ─── */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Select Child
            </h3>

            <p className="mt-1 text-sm text-text-secondary">
              Choose a child to view behavior records.
            </p>
          </div>

          {/* ─── Child Selector Dropdown ─── */}
          <Select
            tone="parent"
            size="lg"
            value={currentChild?.student || ""}
            options={options}
            placeholder="Select Child"
            onChange={handleChange}
          />

          {/* ─── Selected Child Info ─── */}
          {currentChild && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-parent-primary/10">
                  <User size={26} className="text-parent-primary" />
                </div>

                {/* Child Details */}
                <div>
                  <h4 className="font-semibold text-text-primary">
                    {currentChild.student_name}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    Roll No. {currentChild.student_roll_number}
                  </p>
                  <p className="mt-1 inline-flex rounded-full bg-parent-primary/10 px-3 py-1 text-xs font-medium text-parent-primary">
                    {currentChild.relation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================
            RIGHT SECTION
            Statistics and educational tip
            ============================================ */}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* ─── Total Logs Stat ─── */}
          <div className="rounded-xl border border-slate-200 bg-parent-light p-5">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-parent-primary" size={22} />
              <div>
                <p className="text-sm text-text-secondary">Total Logs</p>
                <h3 className="text-2xl font-bold text-parent-primary">
                  {childLogs.length}
                </h3>
              </div>
            </div>
          </div>

          {/* ─── Latest Record Stat ─── */}
          <div className="rounded-xl border border-slate-200 bg-parent-light p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-parent-primary" size={22} />
              <div>
                <p className="text-sm text-text-secondary">Latest Record</p>
                <h3 className="font-semibold text-text-primary">
                  {latestLog
                    ? new Date(latestLog.date).toLocaleDateString()
                    : "--"}
                </h3>
              </div>
            </div>
          </div>

          {/* ─── Educational Tip ─── */}
          <div className="col-span-full rounded-xl border border-parent-border bg-parent-primary/5 p-5">
            <h4 className="font-semibold text-parent-primary">
              Stay Informed
            </h4>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Regularly reviewing behavior records helps
              strengthen communication between parents
              and teachers, encouraging positive habits
              and continuous personal growth.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChildBehaviorSelector;