/**
 * ============================================
 * STUDENT REPORT CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays student's academic performance and grades
 * Used by: Student module routes
 * 
 * Features:
 * - Grade summary cards (Subjects, Average, Grade, Marks)
 * - Subject performance bar chart with grade tiers
 * - Subject-wise results table with filtering
 * - Academic summary with overall stats
 * - Teacher remarks display
 * - Exam type filter (All, Mid-Term, Final, Quiz, Assignment)
 * - GSAP entrance animations
 * - Responsive design (desktop table, mobile cards)
 * - Role-based theming (student primary color)
 * 
 * Grade Tiers:
 * - A+: 90%+ (Emerald/Teal)
 * - A: 80-89% (Green)
 * - B: 70-79% (Blue)
 * - C: 60-69% (Yellow/Amber)
 * - D: 50-59% (Orange)
 * - F: Below 50% (Red)
 * 
 * Dependencies:
 * - lucide-react for icons
 * - recharts for charts
 * - @/components/layout/PageHeader for page header
 * - @/components/ui/Card for containers
 * - @/components/ui/Select for dropdown
 * - @/modules/student/store/studentThunks for data fetching
 * - gsap for animations
 * - react-redux for state management
 * 
 * Usage:
 * <Route path="/student/report-card" element={<ReportCard />} />
 * ============================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import {
  GraduationCap,
  Trophy,
  Percent,
  Star,
  BookOpen,
  Target,
  Quote,
  ClipboardX,
} from "lucide-react";

import { fetchProfile, fetchReportCard } from "@/modules/student/store/studentThunks";

import PageHeader from "@/components/layout/PageHeader";
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

// ─── Constants ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * GRADE TIERS
 * ============================================
 * 
 * One source of truth for the letter grade + the color it renders with,
 * reused across the stat cards, chart, table, and summary.
 * 
 * @constant {Array} GRADE_TIERS
 * @property {number} min - Minimum percentage for the grade
 * @property {string} grade - Letter grade (A+, A, B, C, D, F)
 * @property {Array} colors - Gradient color pair
 */
const GRADE_TIERS = [
  { min: 90, grade: "A+", colors: ["#34D399", "#0D9488"] },
  { min: 80, grade: "A", colors: ["#4ADE80", "#059669"] },
  { min: 70, grade: "B", colors: ["#60A5FA", "#2563EB"] },
  { min: 60, grade: "C", colors: ["#FBBF24", "#D97706"] },
  { min: 50, grade: "D", colors: ["#FB923C", "#EA580C"] },
  { min: 0, grade: "F", colors: ["#FB7185", "#E11D48"] },
];

/**
 * ============================================
 * GET GRADE META
 * ============================================
 * 
 * Returns the grade tier configuration for a given percentage
 * 
 * @param {number} percentage - The percentage to evaluate
 * @returns {Object} Grade tier configuration
 */
const getGradeMeta = (percentage) =>
  GRADE_TIERS.find((tier) => Number(percentage) >= tier.min) || GRADE_TIERS[GRADE_TIERS.length - 1];

/**
 * ============================================
 * GRADE BADGE COMPONENT
 * ============================================
 * 
 * Renders a colored badge with the letter grade
 * 
 * @param {Object} props - Component props
 * @param {number} props.percentage - The percentage value
 * @param {string} props.size - Size of the badge ('sm' | 'lg')
 * @returns {JSX.Element} Grade badge UI
 */
const GradeBadge = ({ percentage, size = "sm" }) => {
  const meta = getGradeMeta(percentage);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm ${
        size === "lg" ? "px-4 py-1.5 text-sm" : "px-3 py-1 text-xs"
      }`}
      style={{ background: `linear-gradient(135deg, ${meta.colors[0]}, ${meta.colors[1]})` }}
    >
      {meta.grade}
    </span>
  );
};

// ─── Visual Primitives ──────────────────────────────────────────────────────

/**
 * ============================================
 * METRIC CARD COMPONENT
 * ============================================
 * 
 * Compact stat card used for summary metrics
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Metric value
 * @param {string} props.footer - Footer text
 * @param {Component} props.icon - Lucide icon component
 * @param {Array} props.colors - Gradient color array
 * @param {Function} props.cardRef - GSAP ref callback
 * @returns {JSX.Element} Metric card UI
 */
const MetricCard = ({ label, value, footer, icon: Icon, colors, cardRef }) => (
  <div
    ref={cardRef}
    className="group relative overflow-hidden rounded-2xl border border-student-border bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-slate-200/60"
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1.5 text-3xl font-semibold text-slate-800">{value}</p>
      </div>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      >
        <Icon size={20} strokeWidth={2.25} />
      </div>
    </div>
    <p className="relative mt-3 text-sm font-medium text-slate-500">{footer}</p>
  </div>
);

/**
 * ============================================
 * SUMMARY FILTER BAR
 * ============================================
 * 
 * Shares the same `examFilter` state as the chart and table below,
 * so picking an exam type here updates every section together.
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current filter value
 * @param {Function} props.onChange - Filter change callback
 * @returns {JSX.Element} Filter bar UI
 */
const SUMMARY_FILTERS = ["All", "Mid-Term", "Final", "Quiz", "Assignment"];

const SummaryFilterBar = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    {SUMMARY_FILTERS.map((option) => {
      const active = option === value;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
            active
              ? "border-student-primary bg-student-primary text-white shadow-sm"
              : "border-student-border bg-white text-text-secondary hover:border-student-primary/40 hover:text-student-primary"
          }`}
        >
          {option === "All" ? "All Exams" : option}
        </button>
      );
    })}
  </div>
);

// ─── Chart Sub-components ──────────────────────────────────────────────────

/**
 * ============================================
 * CHART TOOLTIP
 * ============================================
 * 
 * Custom tooltip for the bar chart
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <p className="text-xs text-text-secondary">{point.exam}</p>
      <div className="mt-2 flex items-center gap-2">
        <GradeBadge percentage={point.marks} />
        <span className="text-sm font-semibold text-text-primary">{point.marks}%</span>
        <span className="text-xs text-text-secondary">
          ({point.obtained}/{point.total})
        </span>
      </div>
    </div>
  );
};

/**
 * ============================================
 * CHART LEGEND
 * ============================================
 * 
 * Renders the grade tier legend for the chart
 * 
 * @returns {JSX.Element} Legend UI
 */
const ChartLegend = () => (
  <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
    {GRADE_TIERS.filter((t) => t.grade !== "D").map((tier) => (
      <div key={tier.grade} className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: `linear-gradient(135deg, ${tier.colors[0]}, ${tier.colors[1]})` }}
        />
        <span className="text-xs text-text-secondary">{tier.grade}</span>
      </div>
    ))}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

/**
 * ============================================
 * REPORT CARD COMPONENT
 * ============================================
 * 
 * Renders the student report card with grades and performance
 * 
 * @returns {JSX.Element} Report card page
 * 
 * @example
 * // In student routes
 * <Route path="/student/report-card" element={<ReportCard />} />
 * ============================================
 */
function ReportCard() {
  const dispatch = useDispatch();
  const { reportCard, loading } = useSelector((state) => state.student);

  // ─── Data Fetching ───────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchReportCard());
  }, [dispatch]);

  // ─── State Management ────────────────────────────────────────────────

  /**
   * ============================================
   * EXAM FILTER
   * ============================================
   * 
   * Single shared filter — drives the summary cards, the chart, and
   * the table together instead of drifting independently.
   */
  const [examFilter, setExamFilter] = useState("All");

  const examOptions = [
    { label: "All Exams", value: "All" },
    { label: "Mid Term", value: "Mid-Term" },
    { label: "Final", value: "Final" },
    { label: "Quiz", value: "Quiz" },
    { label: "Assignment", value: "Assignment" },
  ];

  // ─── Computed Data ───────────────────────────────────────────────────

  /**
   * ============================================
   * FILTERED GRADES
   * ============================================
   * 
   * Filters grades based on the selected exam type
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
   * Groups grades by exam type and calculates performance
   */
  const chartData = useMemo(() => {
    const grades = filteredGrades;

    if (!grades.length) return [];

    const grouped = grades.reduce((acc, grade) => {
      const exam = grade.exam_type;

      if (!acc[exam]) {
        acc[exam] = {
          obtained: 0,
          total: 0,
        };
      }

      acc[exam].obtained += Number(grade.obtained_marks);
      acc[exam].total += Number(grade.total_marks);

      return acc;
    }, {});

    return Object.entries(grouped).map(([exam, values]) => {
      const percentage = Number(
        ((values.obtained / values.total) * 100).toFixed(1)
      );

      return {
        subject: exam,
        exam,
        marks: percentage,
        obtained: values.obtained,
        total: values.total,
        grade: getGradeMeta(percentage).grade,
      };
    });
  }, [filteredGrades]);

  const chartHeight = Math.max(chartData.length * 48, 260);

  /**
   * ============================================
   * SUMMARY STATISTICS
   * ============================================
   * 
   * Calculates overall academic summary statistics
   */
  const summary = useMemo(() => {
    const grades = filteredGrades;

    if (!grades.length) {
      return {
        obtained: 0,
        total: 0,
        percentage: 0,
        average: "0.00",
        grade: "-",
        subjectCount: 0,
      };
    }

    const obtained = grades.reduce((sum, item) => sum + Number(item.obtained_marks), 0);
    const total = grades.reduce((sum, item) => sum + Number(item.total_marks), 0);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    // Count each subject once, even if it has multiple exam-type
    // records (Mid-Term, Final, Quiz, ...) within the current filter.
    const subjectCount = new Set(grades.map((item) => item.subject_name)).size;

    return {
      obtained,
      total,
      percentage,
      average: percentage.toFixed(2),
      grade: getGradeMeta(percentage).grade,
      subjectCount,
    };
  }, [filteredGrades]);

  /**
   * ============================================
   * PUBLISHED DATE
   * ============================================
   * 
   * Formats the published date or returns a fallback message
   */
  const publishedDate = useMemo(() => {
    if (!reportCard?.published_at) return "Not published yet";
    return new Date(reportCard.published_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [reportCard]);

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const filterBarRef = useRef(null);
  const metricRefs = useRef([]);
  const chartCardRef = useRef(null);
  const tableCardRef = useRef(null);
  const summaryRef = useRef(null);
  const rowRefs = useRef([]);
  const mobileCardRefs = useRef([]);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Page-level entrance — runs once, after loading resolves
   */
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(
          filterBarRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.25"
        )
        .fromTo(
          metricRefs.current,
          { opacity: 0, y: 20, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 },
          "-=0.2"
        )
        .fromTo(
          chartCardRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.25"
        )
        .fromTo(
          tableCardRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        )
        .fromTo(
          summaryRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        );
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  /**
   * ============================================
   * ROW REVEAL ANIMATIONS
   * ============================================
   * 
   * Re-fires whenever the filtered result set changes
   * (exam filter switch), so the table feels alive on every filter click.
   */
  useEffect(() => {
    if (loading) return;

    const targets = [...rowRefs.current, ...mobileCardRefs.current].filter(Boolean);
    if (!targets.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.035,
        }
      );
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredGrades, loading]);

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-student-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading report card...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div ref={headerRef}>
        <PageHeader
          title="Report Card"
          subtitle="View your academic performance and examination results."
          breadcrumbs={["Student", "Report Card"]}
          icon={GraduationCap}
          bgColor="bg-student-light"
        />
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────────── */}
      <div ref={filterBarRef} className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-student-text">Grade Summary</h2>
          <p className="text-sm text-text-secondary">
            {examFilter === "All"
              ? "Stats across all examinations."
              : `Stats for ${examFilter} only.`}
          </p>
        </div>

        <SummaryFilterBar value={examFilter} onChange={setExamFilter} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          cardRef={(el) => el && metricRefs.current.push(el)}
          label="Subjects"
          value={summary.subjectCount}
          footer={examFilter === "All" ? "Completed" : `${examFilter} Entries`}
          icon={BookOpen}
          colors={["#818CF8", "#6366F1"]}
        />

        <MetricCard
          cardRef={(el) => el && metricRefs.current.push(el)}
          label="Average"
          value={`${summary.average}%`}
          footer="Overall Performance"
          icon={Percent}
          colors={getGradeMeta(summary.percentage).colors}
        />

        <MetricCard
          cardRef={(el) => el && metricRefs.current.push(el)}
          label="Grade"
          value={summary.grade}
          footer="Overall Grade"
          icon={Trophy}
          colors={getGradeMeta(summary.percentage).colors}
        />

        <MetricCard
          cardRef={(el) => el && metricRefs.current.push(el)}
          label="Marks"
          value={`${summary.obtained.toFixed(2)}/${summary.total.toFixed(2)}`}
          footer="Obtained"
          icon={Target}
          colors={["#38BDF8", "#2563EB"]}
        />
      </div>

      {/* ─── Performance Chart ─────────────────────────────────────────── */}
      <div ref={chartCardRef}>
        <Card>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-student-light">
                <GraduationCap size={24} className="text-student-primary" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-student-text">Subject Performance</h2>
                <p className="text-sm text-text-secondary">
                  {examFilter === "All"
                    ? "Performance across all examinations."
                    : `${examFilter} examination performance.`}
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-student-light px-3 py-2 text-sm font-medium text-student-primary">
              {examFilter}
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <GraduationCap size={44} className="mx-auto text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-text-primary">No Results Available</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  No subject performance found for the selected exam.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 40, left: 20, bottom: 10 }}
                    barCategoryGap={16}
                  >
                    <defs>
                      {GRADE_TIERS.map((tier) => (
                        <linearGradient key={tier.grade} id={`report-tier-${tier.grade.replace("+", "plus")}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={tier.colors[0]} />
                          <stop offset="100%" stopColor={tier.colors[1]} />
                        </linearGradient>
                      ))}
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />

                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: "#94A3B8" }}
                      tickLine={false}
                      axisLine={{ stroke: "#EEF2F7" }}
                    />

                    <YAxis
                      type="category"
                      dataKey="subject"
                      width={150}
                      tick={{ fontSize: 12, fill: "#334155" }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F8FAFC" }} />

                    <Bar dataKey="marks" radius={[0, 8, 8, 0]} maxBarSize={26} animationDuration={800} animationEasing="ease-out">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={`url(#report-tier-${getGradeMeta(entry.marks).grade.replace("+", "plus")})`}
                        />
                      ))}
                      <LabelList
                        dataKey="marks"
                        position="right"
                        formatter={(value) => `${value}%`}
                        style={{ fontSize: 12, fontWeight: 600, fill: "#334155" }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ChartLegend />
            </>
          )}
        </Card>
      </div>

      {/* ─── Subject Results ───────────────────────────────────────────── */}
      <div ref={tableCardRef}>
        <Card>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-student-text">
                Subject Wise Results
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                View your performance across different examinations.
              </p>
            </div>

            <div className="w-full lg:w-64">
              <Select
                tone="student"
                value={examFilter}
                options={examOptions}
                onChange={setExamFilter}
              />
            </div>
          </div>

          {filteredGrades.length === 0 ? (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300">
              <ClipboardX size={46} className="text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold">No Results Found</h3>
              <p className="mt-2 text-sm text-text-secondary">
                There are no results for the selected examination.
              </p>
            </div>
          ) : (
            <>
              {/* ─── Desktop Table ───────────────────────────────────────── */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-237.5">
                  <thead>
                    <tr className="border-b border-student-border bg-student-light/40">
                      <th className="p-4 text-left text-xs font-semibold uppercase">Subject</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Teacher</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Exam</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Marks</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Performance</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Date</th>
                      <th className="p-4 text-left text-xs font-semibold uppercase">Grade</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredGrades.map((subject) => {
                      const percentage = (
                        (Number(subject.obtained_marks) / Number(subject.total_marks)) * 100
                      ).toFixed(1);

                      const meta = getGradeMeta(percentage);

                      return (
                        <tr
                          key={subject.id}
                          ref={(el) => el && rowRefs.current.push(el)}
                          className="border-b border-slate-100 transition hover:bg-student-light/30"
                        >
                          <td className="p-4 font-semibold">{subject.subject_name}</td>
                          <td className="p-4 text-text-secondary">{subject.teacher_name}</td>
                          <td className="p-4">
                            <span className="rounded-lg bg-student-light px-3 py-1 text-xs font-medium">
                              {subject.exam_type}
                            </span>
                          </td>
                          <td className="p-4 font-medium">
                            {subject.obtained_marks}/{subject.total_marks}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                    background: `linear-gradient(90deg, ${meta.colors[0]}, ${meta.colors[1]})`,
                                  }}
                                />
                              </div>
                              <span className="font-semibold">{percentage}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {new Date(subject.exam_date).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <GradeBadge percentage={percentage} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ─── Mobile & Tablet Cards ───────────────────────────────── */}
              <div className="grid gap-4 lg:hidden">
                {filteredGrades.map((subject) => {
                  const percentage = (
                    (Number(subject.obtained_marks) / Number(subject.total_marks)) * 100
                  ).toFixed(1);

                  const meta = getGradeMeta(percentage);

                  return (
                    <div
                      key={subject.id}
                      ref={(el) => el && mobileCardRefs.current.push(el)}
                    >
                      <Card hover={false} className="border">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-text-primary">
                              {subject.subject_name}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {subject.teacher_name}
                            </p>
                          </div>
                          <GradeBadge percentage={percentage} />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-text-secondary">Exam</p>
                            <span className="mt-1 inline-block rounded bg-student-light px-2 py-1 text-xs">
                              {subject.exam_type}
                            </span>
                          </div>
                          <div>
                            <p className="text-text-secondary">Date</p>
                            <p className="font-medium">
                              {new Date(subject.exam_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Obtained</p>
                            <p className="font-semibold">
                              {subject.obtained_marks}
                            </p>
                          </div>
                          <div>
                            <p className="text-text-secondary">Total</p>
                            <p className="font-semibold">
                              {subject.total_marks}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-text-secondary">Performance</span>
                            <span className="font-semibold">{percentage}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${meta.colors[0]}, ${meta.colors[1]})`,
                              }}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* ─── Academic Summary ───────────────────────────────────────────── */}
      <div ref={summaryRef} className="grid gap-6 lg:grid-cols-2">
        {/* Summary Card */}
        <Card>
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${getGradeMeta(summary.percentage).colors[0]}, ${getGradeMeta(summary.percentage).colors[1]})` }}
            >
              <Trophy size={20} strokeWidth={2.25} />
            </div>
            <h2 className="text-lg font-bold text-student-text">Academic Summary</h2>
          </div>

          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-text-secondary">Academic Year</span>
              <span className="font-semibold text-text-primary">{reportCard?.academic_year}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-text-secondary">Total Subjects</span>
              <span className="font-semibold text-text-primary">{summary.subjectCount}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-text-secondary">Total Marks</span>
              <span className="font-semibold text-text-primary">{summary.total}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-text-secondary">Obtained Marks</span>
              <span className="font-semibold text-emerald-600">{summary.obtained}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-text-secondary">Overall Percentage</span>
              <span className="font-semibold text-student-primary">{summary.average}%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Overall Grade</span>
              <GradeBadge percentage={summary.percentage} size="lg" />
            </div>
          </div>
        </Card>

        {/* Teacher Remarks */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-student-light text-student-primary">
              <Star size={20} strokeWidth={2.25} />
            </div>
            <h2 className="text-lg font-bold text-student-text">Teacher Remarks</h2>
          </div>

          <div className="relative mt-6 rounded-2xl bg-student-light p-5 pl-12 text-student-text">
            <Quote size={28} className="absolute left-4 top-4 text-student-primary/30" />
            <p className="italic leading-relaxed">
              {reportCard?.remarks ?? "No remarks available."}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3 text-text-secondary">
            <Percent size={18} />
            Published on {publishedDate}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportCard;