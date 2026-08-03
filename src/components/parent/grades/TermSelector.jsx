/**
 * ============================================
 * TERM SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows parents to select an exam type for filtering grades
 * Features:
 * - Standard exam types (Mid-Term, Final, Quiz, Assignment)
 * - Dynamic detection of custom exam types from data
 * - "All Exams" option for viewing all results
 * - Pill-style buttons with active state highlighting
 * - Role-based theming (parent primary color)
 * - Educational tag line with icon
 * - Responsive horizontal scroll for mobile
 * - State management via Redux (setSelectedTerm)
 * 
 * Standard exam types are always shown, even if the child has no grades
 * of that type yet, so the filter stays consistent with the rest of the
 * app (report card, grade chart, etc).
 * 
 * Dependencies:
 * - @/components/ui/Card for container
 * - @/components/ui/Select for dropdown (unused but imported)
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <TermSelector />
 * ============================================
 */

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

import { setSelectedTerm } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * STANDARD EXAM TYPES
 * ============================================
 * 
 * Standard exam types that are always shown in the filter
 * Even if the child has no grades of that type yet, the option
 * remains visible for consistency with the rest of the app
 * (report card, grade chart, etc).
 * 
 * @constant {Array} STANDARD_TERMS
 */
const STANDARD_TERMS = ["Mid-Term", "Final", "Quiz", "Assignment"];

/**
 * ============================================
 * TERM SELECTOR COMPONENT
 * ============================================
 * 
 * Renders exam type filter pills for grade filtering
 * 
 * @returns {JSX.Element} Term selector UI
 * 
 * @example
 * // In parent dashboard
 * <TermSelector />
 * ============================================
 */
const TermSelector = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves grades and selectedTerm from Redux store
   */
  const {
    grades,
    selectedTerm,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * BUILD TERM OPTIONS
   * ============================================
   * 
   * Builds the list of exam type options:
   * 1. Extracts unique exam types from grades data
   * 2. Starts with STANDARD_TERMS (always present)
   * 3. Appends any extra exam types found in data
   * 4. Prepends "All Exams" option
   * 
   * @returns {Array} Array of option objects { value, label }
   */
  const options = useMemo(() => {
    // Extract unique exam types from grades data
    const termsInData = [
      ...new Set(grades.map((item) => item.exam_type)),
    ];

    // Start with standard terms, then append any extra exam types
    // found in the data that aren't already covered
    const extraTerms = termsInData.filter(
      (term) => !STANDARD_TERMS.includes(term)
    );

    const terms = [...STANDARD_TERMS, ...extraTerms];

    // Return options with "All Exams" first
    return [
      {
        value: "All",
        label: "All Exams",
      },
      ...terms.map((term) => ({
        value: term,
        label: term,
      })),
    ];
  }, [grades]);

  /**
   * ============================================
   * HANDLE CHANGE
   * ============================================
   * 
   * Dispatches setSelectedTerm action with the selected term
   * 
   * @param {string} value - Selected term value
   */
  const handleChange = (value) => {
    dispatch(setSelectedTerm(value));
  };

  return (
    <Card hover={false}>
      <div className="space-y-5">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Select Examination
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Choose an examination to view your child's academic performance and subject-wise results.
          </p>
        </div>

        {/* ─── Term Filter Pills ────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleChange(option.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedTerm === option.value
                  ? "bg-parent-primary text-white"
                  : "border border-parent-primary/20 bg-white text-text-secondary hover:bg-parent-primary/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* ─── Educational Tag Line ──────────────────────────────── */}
        <div className="rounded-xl border border-parent-primary/20 bg-parent-primary/5 p-4">
          <p className="text-sm leading-6 text-text-secondary">
            📚 Exam results help you monitor your child's progress over time.
            Switch between examinations to compare performance and identify
            strengths or areas that may need additional attention.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TermSelector;