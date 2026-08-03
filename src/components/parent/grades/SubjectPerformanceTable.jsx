/**
 * ============================================
 * SUBJECT PERFORMANCE TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays detailed subject performance in a responsive table
 * Features:
 * - Subject name, exam type, obtained/total marks
 * - Percentage calculation with color coding
 * - Letter grade badges (A+, A, B, C, D, F)
 * - Grade-based badge variants
 * - Responsive design (table on desktop, card list on mobile)
 * - Role-based theming (parent)
 * - Empty state handling
 * 
 * Dependencies:
 * - @/components/ui/Card for container
 * - @/components/ui/Table for desktop view
 * - @/components/ui/Badge for grade indicators
 * - react-redux for state management
 * 
 * Usage:
 * <SubjectPerformanceTable />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import Card from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * SUBJECT PERFORMANCE TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table of subject grades
 * 
 * @returns {JSX.Element} Subject performance table UI
 * 
 * @example
 * // In parent dashboard
 * <SubjectPerformanceTable />
 * ============================================
 */
const SubjectPerformanceTable = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves grades, parentLinks, selectedChild, and selectedTerm
   */
  const {
    grades,
    parentLinks,
    selectedChild,
    selectedTerm,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * SELECTED CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Returns undefined if not found
   */
  const currentChild = useMemo(
    () =>
      parentLinks.find(
        (child) => child.student === selectedChild
      ),
    [parentLinks, selectedChild]
  );

  /**
   * ============================================
   * TABLE ROWS
   * ============================================
   * 
   * Processes grades into table rows with calculated fields:
   * - percentage: Calculated percentage (obtained/total * 100)
   * - grade: Letter grade based on percentage
   *   - A+: 90-100%
   *   - A: 80-89%
   *   - B: 70-79%
   *   - C: 60-69%
   *   - D: 50-59%
   *   - F: Below 50%
   * 
   * Filters by student name and exam type
   */
  const rows = useMemo(() => {
    if (!currentChild) return [];

    return grades
      .filter(
        (item) =>
          item.student_name === currentChild.student_name &&
          (selectedTerm === "All" || item.exam_type === selectedTerm)
      )
      .map((item) => {
        const obtained = Number(item.obtained_marks);
        const total = Number(item.total_marks);
        const percentage = (obtained / total) * 100;

        // Determine letter grade
        let grade = "F";
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";

        return {
          ...item,
          percentage: percentage.toFixed(1),
          grade,
        };
      });
  }, [grades, currentChild, selectedTerm]);

  /**
   * ============================================
   * BADGE VARIANT MAPPING
   * ============================================
   * 
   * Maps letter grades to Badge component variants
   * - A+: success (green)
   * - A: info (blue)
   * - B: primary (indigo)
   * - C: warning (yellow)
   * - D/F: danger (red)
   * 
   * @param {string} grade - Letter grade
   * @returns {string} Badge variant
   */
  const getVariant = (grade) => {
    switch (grade) {
      case "A+":
        return "success";
      case "A":
        return "info";
      case "B":
        return "primary";
      case "C":
        return "warning";
      default:
        return "danger";
    }
  };

  /**
   * ============================================
   * DESKTOP COLUMNS
   * ============================================
   * 
   * Defines the columns for the desktop table view
   * - Subject: Subject name
   * - Exam: Exam type
   * - Obtained: Marks obtained
   * - Total: Total marks
   * - Percentage: Calculated percentage (color-coded)
   * - Grade: Letter grade badge
   * - Exam Date: Formatted exam date
   */
  const columns = [
    {
      key: "subject_name",
      label: "Subject",
    },
    {
      key: "exam_type",
      label: "Exam",
    },
    {
      key: "obtained_marks",
      label: "Obtained",
    },
    {
      key: "total_marks",
      label: "Total",
    },
    {
      key: "percentage",
      label: "Percentage",
      render: (row) => (
        <span className="font-semibold text-green-600">
          {row.percentage}%
        </span>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (row) => (
        <Badge variant={getVariant(row.grade)}>
          {row.grade}
        </Badge>
      ),
    },
    {
      key: "exam_date",
      label: "Exam Date",
      render: (row) =>
        new Date(row.exam_date).toLocaleDateString(),
    },
  ];

  return (
    <Card hover={false}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Subject Performance
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Detailed marks for the selected examination.
        </p>
      </div>

      {/* ─── Mobile Card List ──────────────────────────────────── */}
      <div className="space-y-4 md:hidden">
        {rows.length === 0 ? (
          // Empty state
          <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-text-secondary">
            No grades available.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              {/* Top row: Subject + Exam + Grade */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {row.subject_name}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {row.exam_type}
                  </p>
                </div>
                <Badge variant={getVariant(row.grade)}>
                  {row.grade}
                </Badge>
              </div>

              {/* Details grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-text-secondary">Obtained</p>
                  <p className="font-medium">{row.obtained_marks}</p>
                </div>

                <div>
                  <p className="text-text-secondary">Total</p>
                  <p className="font-medium">{row.total_marks}</p>
                </div>

                <div>
                  <p className="text-text-secondary">Percentage</p>
                  <p className="font-semibold text-green-600">
                    {row.percentage}%
                  </p>
                </div>

                <div>
                  <p className="text-text-secondary">Date</p>
                  <p className="font-medium">
                    {new Date(row.exam_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Desktop Table ──────────────────────────────────────── */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={rows}
          emptyMessage="No grades available."
        />
      </div>
    </Card>
  );
};

export default SubjectPerformanceTable;