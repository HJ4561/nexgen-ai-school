/**
 * ============================================
 * GRADE CHART COMPONENT
 * ============================================
 * 
 * Purpose: Displays student grade analytics with radar chart and exam breakdown
 * Features:
 * - Radar chart for subject-wise performance
 * - Exam-type breakdown with ranked bars
 * - Overall average with letter grade (A-F)
 * - Exam type filter (All, Mid-Term, Final, Quiz, Assignment)
 * - Percentage calculation with tier-based grading
 * - Role-based theming (parent)
 * - Responsive layout
 * - Empty state handling
 * 
 * Dependencies:
 * - recharts for radar chart rendering
 * - lucide-react for icons (Sparkles, BookOpen)
 * - @/components/ui/Card for container
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <GradeChart />
 * ============================================
 */

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Sparkles, BookOpen } from "lucide-react";

import Card from '@/components/ui/Card';
import { setSelectedTerm } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * HELPERS
 * ============================================
 * 
 * Utility functions for grade calculations and grading tiers
 */

/**
 * Calculate percentage from obtained and total marks
 * 
 * @param {number|string} obtained - Marks obtained
 * @param {number|string} total - Total marks
 * @returns {number} Percentage (0-100)
 */
const toPercent = (obtained, total) => {
  const o = parseFloat(obtained);
  const t = parseFloat(total);
  if (!t) return 0;
  return (o / t) * 100;
};

/**
 * Determine grade tier based on percentage
 * - A: 90-100% (Green)
 * - B: 80-89% (Lime)
 * - C: 70-79% (Amber)
 * - D: 60-69% (Orange)
 * - F: 0-59% (Red)
 * 
 * @param {number} pct - Percentage
 * @returns {Object} Grade tier with label and color
 */
const tierForPercent = (pct) => {
  if (pct >= 90) return { label: "A", color: "#22c55e" };
  if (pct >= 80) return { label: "B", color: "#84cc16" };
  if (pct >= 70) return { label: "C", color: "#f59e0b" };
  if (pct >= 60) return { label: "D", color: "#f97316" };
  return { label: "F", color: "#ef4444" };
};

/**
 * ============================================
 * EXAM FILTER OPTIONS
 * ============================================
 * 
 * Available exam types for filtering
 * Reads/writes the same `selectedTerm` in Redux that
 * TermSelector and GradeOverview use, so all three stay
 * in sync instead of drifting apart.
 */
const EXAM_FILTERS = ["All", "Mid-Term", "Final", "Quiz", "Assignment"];

/**
 * ============================================
 * EXAM FILTER BAR SUB-COMPONENT
 * ============================================
 * 
 * Renders filter pills for exam types
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected filter
 * @param {Function} props.onChange - Filter change callback
 * @returns {JSX.Element} Filter bar UI
 */
const ExamFilterBar = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    {EXAM_FILTERS.map((option) => {
      const active = option === value;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
            active
              ? "border-parent-primary bg-parent-primary text-white shadow-sm"
              : "border-border bg-white text-text-secondary hover:border-parent-primary/40 hover:text-parent-primary"
          }`}
        >
          {option === "All" ? "All Exams" : option}
        </button>
      );
    })}
  </div>
);

/**
 * ============================================
 * RADAR TOOLTIP SUB-COMPONENT
 * ============================================
 * 
 * Custom tooltip for the radar chart
 * Shows subject name and score percentage
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const RadarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-text-secondary">
        {point.subject}
      </p>
      <p className="mt-1 text-lg font-bold text-parent-primary">
        {point.score}%
      </p>
    </div>
  );
};

/**
 * ============================================
 * GRADE CHART COMPONENT
 * ============================================
 * 
 * Renders a radar chart and exam breakdown for grade analytics
 * 
 * @returns {JSX.Element} Grade chart UI
 * 
 * @example
 * // In parent dashboard
 * <GradeChart />
 * ============================================
 */
const GradeChart = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves grades, selectedChild, parentLinks, and selectedTerm
   */
  const {
    grades = [],
    selectedChild,
    parentLinks = [],
    selectedTerm,
  } = useSelector((state) => state.parent);

  const selectedStudent = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * FILTER TO SELECTED CHILD
   * ============================================
   * 
   * Filters grades for the selected student
   */
  const childGrades = useMemo(() => {
    if (!selectedStudent) return [];
    return grades.filter(
      (g) => g.student_name === selectedStudent.student_name
    );
  }, [grades, selectedStudent]);

  /**
   * ============================================
   * FURTHER FILTER BY EXAM TYPE
   * ============================================
   * 
   * Filters grades by the selected exam type
   * Uses the shared selectedTerm from Redux
   */
  const filteredGrades = useMemo(() => {
    if (selectedTerm === "All") return childGrades;
    return childGrades.filter((g) => g.exam_type === selectedTerm);
  }, [childGrades, selectedTerm]);

  /**
   * ============================================
   * SUBJECT-WISE AVERAGE (Radar)
   * ============================================
   * 
   * Groups grades by subject and calculates average percentage
   * Used as data for the radar chart
   */
  const subjectData = useMemo(() => {
    const bySubject = {};

    filteredGrades.forEach((g) => {
      const pct = toPercent(g.obtained_marks, g.total_marks);
      if (!bySubject[g.subject_name]) {
        bySubject[g.subject_name] = { total: 0, count: 0 };
      }
      bySubject[g.subject_name].total += pct;
      bySubject[g.subject_name].count += 1;
    });

    return Object.entries(bySubject).map(([subject, { total, count }]) => ({
      subject,
      score: Math.round(total / count),
    }));
  }, [filteredGrades]);

  /**
   * ============================================
   * EXAM-TYPE BREAKDOWN (Ranked Bars)
   * ============================================
   * 
   * Groups grades by exam type and calculates average
   * Sorted by average (highest first)
   * Includes grade tier and color
   */
  const examTypeData = useMemo(() => {
    const byType = {};

    filteredGrades.forEach((g) => {
      const pct = toPercent(g.obtained_marks, g.total_marks);
      if (!byType[g.exam_type]) {
        byType[g.exam_type] = { total: 0, count: 0 };
      }
      byType[g.exam_type].total += pct;
      byType[g.exam_type].count += 1;
    });

    return Object.entries(byType)
      .map(([type, { total, count }]) => {
        const avg = Math.round(total / count);
        return { type, avg, ...tierForPercent(avg) };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [filteredGrades]);

  /**
   * ============================================
   * OVERALL AVERAGE
   * ============================================
   * 
   * Marks-weighted average (sum obtained / sum total)
   * Matches the calculation GradeOverview uses,
   * so the two cards never disagree for the same filter.
   */
  const overallAvg = useMemo(() => {
    if (!filteredGrades.length) return 0;

    const obtained = filteredGrades.reduce(
      (sum, g) => sum + Number(g.obtained_marks),
      0
    );
    const total = filteredGrades.reduce(
      (sum, g) => sum + Number(g.total_marks),
      0
    );

    return total ? Math.round((obtained / total) * 100) : 0;
  }, [filteredGrades]);

  const overallTier = tierForPercent(overallAvg);
  const isEmpty = filteredGrades.length === 0;

  return (
    <Card className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-parent-primary/10 p-3">
            <Sparkles size={22} className="text-parent-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              Performance Snapshot
            </h3>
            <p className="text-sm text-text-secondary">
              {selectedTerm === "All"
                ? "Subject-wise average score"
                : `Subject-wise average — ${selectedTerm} only`}
            </p>
          </div>
        </div>

        {/* ─── Overall Grade Pill ─── */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ backgroundColor: `${overallTier.color}1A` }}
        >
          <span
            className="text-lg font-bold"
            style={{ color: overallTier.color }}
          >
            {overallTier.label}
          </span>
          <span className="text-sm font-semibold text-text-primary">
            {overallAvg}% overall
          </span>
        </div>
      </div>

      {/* ─── Exam Filter ────────────────────────────────────────── */}
      <div className="mt-4">
        <ExamFilterBar
          value={selectedTerm}
          onChange={(term) => dispatch(setSelectedTerm(term))}
        />
      </div>

      {isEmpty ? (
        // ─── Empty State ──────────────────────────────────────────
        <div className="mt-6 rounded-xl bg-surface-muted p-10 text-center">
          <BookOpen size={32} className="mx-auto text-text-secondary" />
          <p className="mt-3 text-sm text-text-secondary">
            {selectedTerm === "All"
              ? "No grade records yet."
              : `No ${selectedTerm} grade records yet.`}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 xl:grid-cols-5">
          {/* ─── Radar Chart (60%) ──────────────────────────────── */}
          <div className="xl:col-span-3">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={subjectData} outerRadius="75%">
                <PolarGrid stroke="var(--border, #e5e7eb)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fontSize: 12,
                    fill: "var(--text-secondary, #6b7280)",
                  }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 10,
                    fill: "var(--text-secondary, #9ca3af)",
                  }}
                  tickCount={5}
                />
                <Tooltip content={<RadarTooltip />} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--parent-primary, #6366f1)"
                  strokeWidth={2}
                  fill="var(--parent-primary, #6366f1)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Exam Type Bars (40%) ───────────────────────────── */}
          <div className="flex flex-col justify-center gap-4 xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              By Exam Type
            </p>

            {examTypeData.map((item) => (
              <div key={item.type}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {item.type}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: item.color }}
                  >
                    {item.avg}%
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.avg}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default GradeChart;