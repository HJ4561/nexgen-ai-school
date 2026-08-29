/**
 * ============================================
 * GRADE SUMMARY CHART COMPONENT
 * ============================================
 * 
 * Purpose: Displays grade summary as horizontal bar chart with performance tiers
 * Features:
 * - Horizontal bar chart with subject-wise performance
 * - Performance tier coloring (Excellent, Good, Needs Focus)
 * - Exam type filter (All, Mid-Term, Final, Quiz, Assignment)
 * - Average percentage display
 * - Custom tooltip with subject details
 * - Legend for performance tiers
 * - Responsive chart height based on data
 * - Empty state with icon
 * 
 * Performance tiers — color now carries meaning (how well the
 * subject was scored) instead of an arbitrary rotating palette.
 * 
 * Dependencies:
 * - recharts for chart rendering (BarChart)
 * - lucide-react for icons (ClipboardX)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <GradeSummaryChart />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ClipboardX } from "lucide-react";

import Card from '@/components/ui/Card'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

/**
 * ============================================
 * PERFORMANCE TIERS
 * ============================================
 * 
 * Color now carries meaning (how well the subject was scored)
 * instead of an arbitrary rotating palette.
 * 
 * - Excellent: ≥ 85% (Green gradient)
 * - Good: ≥ 70% (Blue gradient)
 * - Needs Focus: < 70% (Red gradient)
 * 
 * @constant {Array} TIERS
 */
const TIERS = [
  { min: 85, label: "Excellent", colors: ["#34D399", "#0D9488"] },
  { min: 70, label: "Good", colors: ["#60A5FA", "#2563EB"] },
  { min: 0, label: "Needs Focus", colors: ["#FB7185", "#E11D48"] },
];

/**
 * ============================================
 * GET TIER
 * ============================================
 * 
 * Determines the performance tier for a given percentage
 * 
 * @param {number} percentage - Score percentage
 * @returns {Object} Tier configuration
 */
const getTier = (percentage) => TIERS.find((tier) => percentage >= tier.min) || TIERS[TIERS.length - 1];

/**
 * ============================================
 * EXAM FILTER OPTIONS
 * ============================================
 * 
 * Available exam types for filtering
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
              ? "border-student-primary bg-student-primary text-white shadow-sm"
              : "border-slate-200 bg-white text-text-secondary hover:border-student-primary/40 hover:text-student-primary"
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
 * CUSTOM TOOLTIP SUB-COMPONENT
 * ============================================
 * 
 * Renders custom tooltip with subject details and tier color indicator
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const tier = getTier(point.percentage);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-sm font-semibold text-text-primary">{point.subject}</p>
      <p className="text-xs text-text-secondary">{point.exam}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.colors[1] }} />
        <span className="text-sm font-semibold text-text-primary">
          {point.percentage}%
        </span>
        <span className="text-xs text-text-secondary">
          ({point.obtained}/{point.total})
        </span>
      </div>
    </div>
  );
};

/**
 * ============================================
 * LEGEND SUB-COMPONENT
 * ============================================
 * 
 * Renders color legend for performance tiers
 * 
 * @returns {JSX.Element} Legend UI
 */
const Legend = () => (
  <div className="mt-4 flex flex-wrap items-center justify-center gap-5">
    {TIERS.map((tier) => (
      <div key={tier.label} className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: `linear-gradient(135deg, ${tier.colors[0]}, ${tier.colors[1]})` }}
        />
        <span className="text-xs text-text-secondary">{tier.label}</span>
      </div>
    ))}
  </div>
);

/**
 * ============================================
 * GRADE SUMMARY CHART COMPONENT
 * ============================================
 * 
 * Renders horizontal bar chart of subject grades with performance tiers
 * 
 * @returns {JSX.Element} Grade summary chart UI
 * 
 * @example
 * // In student dashboard
 * <GradeSummaryChart />
 * ============================================
 */
const GradeSummaryChart = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves reportCard from Redux store
   */
  const { reportCard = {} } = useSelector((state) => state.student);

  /**
   * ============================================
   * FILTER STATE
   * ============================================
   * 
   * Manages the selected exam filter
   */
  const [examFilter, setExamFilter] = useState("All");

  /**
   * ============================================
   * FILTERED GRADES
   * ============================================
   * 
   * Filters grades by the selected exam type
   * Returns all grades if "All" is selected
   */
  const filteredGrades = useMemo(() => {
    const grades = reportCard?.grades || [];
    if (examFilter === "All") return grades;
    return grades.filter((grade) => grade.exam_type === examFilter);
  }, [reportCard, examFilter]);

  /**
   * ============================================
   * CHART DATA
   * ============================================
   * 
   * Processes grades for chart display
   * - Calculates percentage to 2 decimal places
   * - Sorts by percentage (highest first)
   * - Includes subject, exam, obtained, total, and teacher
   */
  const chartData = useMemo(() => {
    return filteredGrades
      .map((grade) => ({
        subject: grade.subject_name,
        exam: grade.exam_type,
        percentage: Number(
          (
            (Number(grade.obtained_marks) / Number(grade.total_marks)) *
            100
          ).toFixed(2)
        ),
        obtained: Number(grade.obtained_marks),
        total: Number(grade.total_marks),
        teacher: grade.teacher_name,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [filteredGrades]);

  /**
   * ============================================
   * AVERAGE CALCULATION
   * ============================================
   * 
   * Calculates weighted average percentage
   * (sum obtained marks / sum total marks) * 100
   * Rounds to 2 decimal places
   */
  const average = useMemo(() => {
    if (!filteredGrades.length) return 0;

    const obtainedMarks = filteredGrades.reduce(
      (sum, grade) => sum + Number(grade.obtained_marks),
      0
    );

    const totalMarks = filteredGrades.reduce(
      (sum, grade) => sum + Number(grade.total_marks),
      0
    );

    return totalMarks
      ? Number((((obtainedMarks / totalMarks) * 100).toFixed(2)))
      : 0;
  }, [filteredGrades]);

  /**
   * ============================================
   * CHART HEIGHT
   * ============================================
   * 
   * Dynamically adjusts chart height based on number of subjects
   * Each subject gets 46px, minimum 220px
   */
  const chartHeight = Math.max(chartData.length * 46, 220);

  return (
    <Card hover={false} className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4 lg:justify-start">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Grade Summary</h2>
            <p className="mt-1 text-sm text-text-secondary">
              {examFilter === "All"
                ? "Performance across all examinations."
                : `${examFilter} examination performance.`}
            </p>
          </div>

          {/* Mobile Average */}
          <div className="rounded-xl bg-student-light px-4 py-2 lg:hidden">
            <p className="text-xs text-text-secondary">Average</p>
            <h3 className="text-lg font-bold text-student-primary">{average}%</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Bar */}
          <ExamFilterBar value={examFilter} onChange={setExamFilter} />

          {/* Desktop Average */}
          <div className="hidden rounded-xl bg-student-light px-4 py-2 lg:block">
            <p className="text-xs text-text-secondary">Average</p>
            <h3 className="text-lg font-bold text-student-primary">{average}%</h3>
          </div>
        </div>
      </div>

      {/* ─── Chart ────────────────────────────────────────────────── */}
      {chartData.length === 0 ? (
        // ─── Empty State ──────────────────────────────────────────
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300">
          <ClipboardX size={36} className="text-slate-400" />
          <div className="text-center">
            <p className="font-medium text-text-primary">No grades available</p>
            <p className="mt-1 text-sm text-text-secondary">
              {examFilter === "All"
                ? "Grades will appear here after exams are published."
                : `No ${examFilter} grades found.`}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ─── Bar Chart ───────────────────────────────────────── */}
          <div style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 34, left: 20, bottom: 5 }}
                barCategoryGap={14}
              >
                <defs>
                  {TIERS.map((tier) => (
                    <linearGradient key={tier.label} id={`tier-${tier.label}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={tier.colors[0]} />
                      <stop offset="100%" stopColor={tier.colors[1]} />
                    </linearGradient>
                  ))}
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" horizontal={false} />

                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#EEF2F7" }}
                />

                <YAxis
                  type="category"
                  dataKey="subject"
                  width={120}
                  tick={{ fontSize: 13, fill: "#334155" }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F8FAFC" }} />

                <Bar
                  dataKey="percentage"
                  radius={[0, 8, 8, 0]}
                  barSize={18}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={`url(#tier-${getTier(entry.percentage).label})`} />
                  ))}
                  <LabelList
                    dataKey="percentage"
                    position="right"
                    formatter={(value) => `${value}%`}
                    style={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Legend ───────────────────────────────────────────── */}
          <Legend />
        </>
      )}
    </Card>
  );
};

export default GradeSummaryChart;