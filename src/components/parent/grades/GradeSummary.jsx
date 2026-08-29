/**
 * ============================================
 * GRADE SUMMARY COMPONENT
 * ============================================
 * 
 * Purpose: Displays academic performance insights for parent view
 * Features:
 * - Strong subjects (90% and above)
 * - Weak subjects (below 70%)
 * - Color-coded subject tags (green for strong, orange for weak)
 * - Educational tip footer
 * - Role-based theming (parent)
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (CircleCheckBig, TriangleAlert, Info)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <GradeSummary />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import Card from '@/components/ui/Card';

import {
  CircleCheckBig,
  TriangleAlert,
  Info,
} from "lucide-react";

/**
 * ============================================
 * GRADE SUMMARY COMPONENT
 * ============================================
 * 
 * Renders performance insights with strong and weak subjects
 * 
 * @returns {JSX.Element} Grade summary UI
 * 
 * @example
 * // In parent dashboard
 * <GradeSummary />
 * ============================================
 */
const GradeSummary = () => {
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
   */
  const currentChild = parentLinks.find(
    (child) => child.student === selectedChild
  );

  /**
   * ============================================
   * FILTER GRADES
   * ============================================
   * 
   * Filters grades for the selected child and exam type
   * - Filters by student name
   * - Filters by exam type (or shows all if "All" selected)
   */
  const childGrades = useMemo(() => {
    if (!currentChild) return [];

    return grades.filter(
      (item) =>
        item.student_name === currentChild.student_name &&
        (selectedTerm === "All" || item.exam_type === selectedTerm)
    );
  }, [grades, currentChild, selectedTerm]);

  /**
   * ============================================
   * INSIGHTS
   * ============================================
   * 
   * Analyzes grades to identify strong and weak subjects:
   * - strong: Subjects with 90% and above (Excellent Performance)
   * - weak: Subjects with below 70% (Needs Improvement)
   * 
   * Returns empty arrays if no grades exist
   */
  const summary = useMemo(() => {
    // Return empty if no grades
    if (!childGrades.length) {
      return {
        strong: [],
        weak: [],
      };
    }

    // Calculate percentage for each grade
    const data = childGrades.map((item) => {
      const percentage =
        (Number(item.obtained_marks) / Number(item.total_marks)) * 100;

      return {
        ...item,
        percentage,
      };
    });

    return {
      // 90% and above = Strong (Excellent Performance)
      strong: data.filter((item) => item.percentage >= 90),

      // Below 70% = Weak (Needs Improvement)
      weak: data.filter((item) => item.percentage < 70),
    };
  }, [childGrades]);

  return (
    <Card hover={false}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl md:text-2xl font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
          Academic Summary
        </h2>

        <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
          Quick performance overview for the selected exam.
        </p>
      </div>

      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* ─── Strong Subjects ──────────────────────────────────── */}
        <div>
          <div className="mb-3 flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            <CircleCheckBig size={18} className="text-green-600 px-4 sm:px-6 lg:px-8" />
            <h3 className="font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
              Excellent Performance
            </h3>
          </div>

          {summary.strong.length === 0 ? (
            <p className="text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
              No subjects scored above 90%.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row-wrap gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
              {summary.strong.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm md:text-base md:text-base font-medium text-green-700 px-4 sm:px-6 lg:px-8"
                >
                  {item.subject_name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─── Weak Subjects ────────────────────────────────────── */}
        <div>
          <div className="mb-3 flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            <TriangleAlert size={18} className="text-orange-500 px-4 sm:px-6 lg:px-8" />
            <h3 className="font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
              Needs Improvement
            </h3>
          </div>

          {summary.weak.length === 0 ? (
            <p className="text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
              Great! No weak subjects.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row-wrap gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
              {summary.weak.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-orange-100 px-3 py-1 text-sm md:text-base md:text-base font-medium text-orange-700 px-4 sm:px-6 lg:px-8"
                >
                  {item.subject_name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer: Educational Tip ──────────────────────────── */}
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            <Info size={18} className="mt-0.5 text-blue-600 px-4 sm:px-6 lg:px-8" />
            <p className="text-sm md:text-base md:text-base leading-6 text-blue-700 px-4 sm:px-6 lg:px-8">
              Grades are updated after each examination.
              Contact the class teacher if you believe any
              marks are incorrect.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GradeSummary;