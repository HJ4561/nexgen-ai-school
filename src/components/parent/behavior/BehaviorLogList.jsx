/**
 * ============================================
 * BEHAVIOR LOG LIST COMPONENT
 * ============================================
 * 
 * Purpose: Displays and manages behavior logs for parent view
 * Features:
 * - Filters behavior logs by search, severity, and sort
 * - Displays logs in card format with severity theming
 * - Child selection from parentLinks
 * - Loading and empty states
 * - Details modal for viewing full log information
 * - Role-based theming
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (ClipboardX)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * - BehaviorFilters for filter controls
 * - BehaviorLogCard for individual log display
 * - BehaviorDetailsModal for detailed view
 * 
 * Usage:
 * <BehaviorLogList role="parent" />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import {
  ClipboardX,
} from "lucide-react";

import Card from '@/components/ui/Card';

import BehaviorFilters from "./BehaviorFilters";
import BehaviorLogCard from "./BehaviorLogCard";
import BehaviorDetailsModal from "./BehaviorDetailsModal";

/**
 * ============================================
 * BEHAVIOR LOG LIST COMPONENT
 * ============================================
 * 
 * Renders a filtered list of behavior logs with detail view
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('parent', 'admin', 'teacher', 'student')
 * @returns {JSX.Element} Behavior log list UI
 * 
 * @example
 * // In parent dashboard
 * <BehaviorLogList role="parent" />
 * ============================================
 */
const BehaviorLogList = ({ role }) => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    behaviorLogs = [],
    parentLinks = [],
    selectedChild,
    loading,
  } = useSelector(
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
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * FILTERS STATE
   * ============================================
   * 
   * Manages filter values for behavior logs
   * - search: Text search for description/reporter
   * - severity: Filter by severity (All, Low, Medium, High)
   * - sort: Sort order (newest, oldest)
   */
  const [filters, setFilters] = useState({
    search: "",
    severity: "All",
    sort: "newest",
  });

  /**
   * ============================================
   * SELECTED LOG
   * ============================================
   * 
   * Tracks the currently selected log for detail view
   */
  const [selectedLog, setSelectedLog] = useState(null);

  /**
   * ============================================
   * HANDLE FILTER CHANGE
   * ============================================
   * 
   * Updates a specific filter field
   * 
   * @param {string} field - The filter field to update
   * @param {*} value - The new filter value
   */
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * ============================================
   * RESET FILTERS
   * ============================================
   * 
   * Resets all filters to default values
   */
  const handleReset = () => {
    setFilters({
      search: "",
      severity: "All",
      sort: "newest",
    });
  };

  /**
   * ============================================
   * FILTER LOGS
   * ============================================
   * 
   * Applies all filters to the behavior logs:
   * 1. Filters by selected child
   * 2. Search: Matches description or reporter name
   * 3. Severity: Exact match on severity
   * 4. Sort: Newest or oldest by date
   * 
   * @returns {Array} Filtered and sorted behavior logs
   */
  const filteredLogs = useMemo(() => {
    // Return empty if no child is selected
    if (!currentChild) return [];

    // Filter by selected child
    let data = behaviorLogs.filter(
      (log) => log.student_name === currentChild.student_name
    );

    // ─── Search Filter ───
    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(
        (log) =>
          log.description.toLowerCase().includes(keyword) ||
          log.reported_by_name.toLowerCase().includes(keyword)
      );
    }

    // ─── Severity Filter ───
    if (filters.severity !== "All") {
      data = data.filter(
        (log) => log.severity === filters.severity
      );
    }

    // ─── Sort ───
    data.sort((a, b) => {
      const first = new Date(a.date);
      const second = new Date(b.date);
      return filters.sort === "newest" ? second - first : first - second;
    });

    return data;
  }, [behaviorLogs, currentChild, filters]);

  return (
    <>
      <Card hover={false}>
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Behavior Records
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Review classroom behavior reports submitted by teachers.
          </p>
        </div>

        {/* ─── Filters ────────────────────────────────────────────── */}
        <BehaviorFilters
          role={role}
          filters={filters}
          onChange={handleChange}
          onReset={handleReset}
        />

        {/* ─── Log List ────────────────────────────────────────────── */}
        <div className="mt-6 space-y-4">
          {loading ? (
            // ─── Loading State ───
            <div className="py-12 text-center">
              Loading...
            </div>
          ) : filteredLogs.length === 0 ? (
            // ─── Empty State ───
            <div className="flex flex-col items-center justify-center py-16">
              <ClipboardX size={42} className="text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold">
                No Behavior Logs
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                No records match the selected filters.
              </p>
            </div>
          ) : (
            // ─── Log Cards ───
            filteredLogs.map((log) => (
              <BehaviorLogCard
                key={log.id}
                log={log}
                onView={setSelectedLog}
              />
            ))
          )}
        </div>
      </Card>

      {/* ─── Details Modal ────────────────────────────────────────── */}
      <BehaviorDetailsModal
        log={selectedLog}
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
};

export default BehaviorLogList;