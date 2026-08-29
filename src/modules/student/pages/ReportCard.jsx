// src/modules/student/pages/ReportCard.jsx

/**
 * ============================================
 * STUDENT REPORT CARD - COMPLETE
 * ============================================
 * 
 * Features:
 * - View all results with grade calculation
 * - Filter by exam type (All, Term, Annual, Midterm, Quiz, Test)
 * - Chart view and Bar view toggle
 * - Detailed results table
 * - Academic summary with overall grade
 * - Teacher's remarks
 * - Premium UI/UX with animations
 * 
 * API Endpoints:
 * - GET /api/exams/results/ - List results
 * - GET /api/exams/grade-scale/ - List grade scale
 * - GET /api/users/students/me/ - Get student profile
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from results (read-only)
 * - exam_name from results (read-only)
 * - subject_name from results (already exists)
 * - teacher_name from results (already exists)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  BarChart3,
  Table2,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  User,
  Calendar,
  School,
  AlertCircle,
  Loader2,
  Hash,
  Medal,
  Crown,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchResults,
  fetchGradeScale,
  fetchProfile,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentResults,
  selectStudentGradeScale,
  selectStudentProfile,
  selectStudentLoading,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getStudentName = (result) => {
  if (!result) return null;
  if (result.student_name && result.student_name !== 'null') return result.student_name;
  if (result.student) {
    if (typeof result.student === 'string') return result.student;
    if (result.student.name) return result.student.name;
    if (result.student.student_name) return result.student.student_name;
  }
  return null;
};

const getExamName = (result) => {
  if (!result) return "General";
  if (result.exam_name && result.exam_name !== 'null') return result.exam_name;
  if (result.exam) {
    if (typeof result.exam === 'string') return result.exam;
    if (result.exam.name) return result.exam.name;
    if (result.exam.exam_name) return result.exam.exam_name;
  }
  return "General";
};

const getSubjectName = (result) => {
  if (!result) return "Subject";
  if (result.subject_name && result.subject_name !== 'null') return result.subject_name;
  if (result.subject) {
    if (typeof result.subject === 'string') return result.subject;
    if (result.subject.name) return result.subject.name;
    if (result.subject.subject_name) return result.subject.subject_name;
  }
  return "Subject";
};

const getTeacherName = (result) => {
  if (!result) return null;
  if (result.teacher_name && result.teacher_name !== 'null') return result.teacher_name;
  if (result.teacher) {
    if (typeof result.teacher === 'string') return result.teacher;
    if (result.teacher.name) return result.teacher.name;
    if (result.teacher.teacher_name) return result.teacher.teacher_name;
  }
  return null;
};

// ─── Constants ──────────────────────────────────────────────────────────

const GRADE_TIERS = [
  { min: 90, grade: "A+", colors: ["#8B5CF6", "#6D28D9"], bg: "bg-gradient-to-r from-purple-500 to-purple-700", text: "text-purple-500" },
  { min: 80, grade: "A", colors: ["#06B6D4", "#0891B2"], bg: "bg-gradient-to-r from-cyan-500 to-cyan-700", text: "text-cyan-500" },
  { min: 70, grade: "B", colors: ["#34D399", "#059669"], bg: "bg-gradient-to-r from-emerald-500 to-emerald-700", text: "text-emerald-500" },
  { min: 60, grade: "C", colors: ["#FBBF24", "#D97706"], bg: "bg-gradient-to-r from-amber-500 to-amber-700", text: "text-amber-500" },
  { min: 50, grade: "D", colors: ["#FB923C", "#EA580C"], bg: "bg-gradient-to-r from-orange-500 to-orange-700", text: "text-orange-500" },
  { min: 0, grade: "F", colors: ["#FB7185", "#E11D48"], bg: "bg-gradient-to-r from-rose-500 to-rose-700", text: "text-rose-500" },
];

const getGradeMeta = (percentage) =>
  GRADE_TIERS.find((tier) => Number(percentage) >= tier.min) || GRADE_TIERS[GRADE_TIERS.length - 1];

// ─── Helper Components ─────────────────────────────────────────────────

const GradeBadge = ({ percentage, size = "sm" }) => {
  const meta = getGradeMeta(percentage);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl font-bold text-white shadow-lg ${
        size === "lg" 
          ? "px-5 py-2.5 text-sm min-w-[48px]" 
          : "px-3.5 py-1.5 text-xs min-w-[36px]"
      } ${meta.bg}`}
    >
      {meta.grade}
    </span>
  );
};

const PerformanceBar = ({ percentage, meta, showLabel = true }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 min-w-0">
      <div className="relative h-8 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
        <div
          className="absolute inset-y-0 left-0 rounded-xl transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: `linear-gradient(90deg, ${meta.colors[0]}, ${meta.colors[1]})`,
          }}
        />
        {showLabel && (
          <div className="absolute inset-0 flex items-center px-4">
            <span className="text-xs font-bold text-white drop-shadow-sm">
              {percentage}%
            </span>
          </div>
        )}
      </div>
    </div>
    <GradeBadge percentage={percentage} />
  </div>
);

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
      active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
    }`}
  >
    {label}
  </button>
);

const MetricCard = ({ label, value, footer, icon: Icon, colors, cardRef, index }) => {
  const gradientId = `metric-grad-${index}`;
  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
      style={{
        border: `1px solid ${colors[0]}20`,
      }}
    >
      <svg className="absolute -right-12 -top-12 h-32 w-32 opacity-5 transition-opacity duration-500 group-hover:opacity-10">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r="56" fill={`url(#${gradientId})`} />
      </svg>
      
      <div className="relative flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-800 truncate">
            {value}
          </p>
        </div>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 ml-3"
          style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>
      <p className="relative mt-2 text-xs font-medium text-gray-500 truncate">
        {footer}
      </p>
    </div>
  );
};

// ─── Premium Chart Component ──────────────────────────────────────────

const PremiumBarChart = ({ data, examFilter }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
        <BarChart3 size={40} className="text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">No chart data available</p>
      </div>
    );
  }

  const chartHeight = Math.min(Math.max(data.length * 55 + 80, 350), 550);

  return (
    <div className="w-full" style={{ height: chartHeight, minHeight: 350 }}>
      {isMounted && data.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
            barCategoryGap={14}
          >
            <defs>
              {GRADE_TIERS.map((tier) => (
                <linearGradient 
                  key={tier.grade} 
                  id={`chart-tier-${tier.grade.replace("+", "plus")}`} 
                  x1="0" y1="0" x2="1" y2="0"
                >
                  <stop offset="0%" stopColor={tier.colors[0]} stopOpacity="0.9" />
                  <stop offset="50%" stopColor={tier.colors[0]} stopOpacity="1" />
                  <stop offset="100%" stopColor={tier.colors[1]} stopOpacity="1" />
                </linearGradient>
              ))}
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="6 6" stroke="#E5E7EB" vertical={false} strokeOpacity="0.5" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB", strokeWidth: 1.5 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="subject"
              width={90}
              tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const point = payload[0].payload;
                const meta = getGradeMeta(point.marks);
                return (
                  <div className="rounded-2xl border-0 bg-white/95 backdrop-blur-sm px-5 py-4 shadow-2xl shadow-black/10">
                    <p className="text-sm font-bold text-gray-800">{label}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-900">{point.marks}%</span>
                      <GradeBadge percentage={point.marks} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">
                      {point.obtained} / {point.total} marks
                    </p>
                    <div className="mt-2 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${point.marks}%`,
                          background: `linear-gradient(90deg, ${meta.colors[0]}, ${meta.colors[1]})`
                        }}
                      />
                    </div>
                  </div>
                );
              }}
              cursor={{ fill: "#F3F4F6", fillOpacity: 0.5 }}
            />
            <Bar 
              dataKey="marks" 
              radius={[0, 12, 12, 0]} 
              maxBarSize={32} 
              animationDuration={1000} 
              animationEasing="ease-out"
              filter="url(#shadow)"
            >
              {data.map((entry, index) => {
                const gradeMeta = getGradeMeta(entry.marks);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#chart-tier-${gradeMeta.grade.replace("+", "plus")})`}
                  />
                );
              })}
              <LabelList
                dataKey="marks"
                position="right"
                formatter={(value) => `${value}%`}
                style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  fill: "#374151",
                  fontFamily: "inherit"
                }}
                offset={8}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// ─── Toast ──────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    info: { icon: Sparkles, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  };

  const { icon: Icon, bg, border, text } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${border} ${bg} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      <Icon className={`h-5 w-5 ${text}`} />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

function ReportCard() {
  const dispatch = useDispatch();
  
  const results = useSelector(selectStudentResults);
  const gradeScale = useSelector(selectStudentGradeScale);
  const profile = useSelector(selectStudentProfile);
  const loading = useSelector(selectStudentLoading);

  const [examFilter, setExamFilter] = useState("All");
  const [viewMode, setViewMode] = useState("chart");
  const [toast, setToast] = useState(null);
  const rowRefs = useRef([]);

  // ─── Load Data ──────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchResults()).unwrap(),
        dispatch(fetchGradeScale()).unwrap(),
        dispatch(fetchProfile()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading report card data:", err);
      setToast({ message: "Failed to load report card", type: "error" });
    }
  };

  // ─── Data Processing ──────────────────────────────────────────────────

  const filteredResults = useMemo(() => {
    if (!results) return [];
    if (examFilter === "All") return results;
    return results.filter((r) => {
      const examType = r.exam?.exam_type || r.exam_type || "";
      return examType.toLowerCase() === examFilter.toLowerCase();
    });
  }, [results, examFilter]);

  const chartData = useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) return [];

    const grouped = filteredResults.reduce((acc, result) => {
      const subject = getSubjectName(result);
      if (!acc[subject]) {
        acc[subject] = { obtained: 0, total: 0, count: 0 };
      }
      acc[subject].obtained += Number(result.marks_obtained) || 0;
      acc[subject].total += Number(result.exam?.total_marks) || Number(result.total_marks) || 100;
      acc[subject].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([subject, values]) => {
      const percentage = values.total > 0 
        ? Number(((values.obtained / values.total) * 100).toFixed(1)) 
        : 0;
      return {
        subject,
        marks: percentage,
        obtained: values.obtained,
        total: values.total,
        count: values.count,
      };
    }).sort((a, b) => b.marks - a.marks);
  }, [filteredResults]);

  const summary = useMemo(() => {
    if (!filteredResults || filteredResults.length === 0) {
      return { obtained: 0, total: 0, percentage: 0, average: "0", grade: "-", subjectCount: 0 };
    }

    const obtained = filteredResults.reduce((sum, item) => sum + (Number(item.marks_obtained) || 0), 0);
    const total = filteredResults.reduce((sum, item) => sum + (Number(item.exam?.total_marks) || Number(item.total_marks) || 100), 0);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;
    const subjectNames = new Set(filteredResults.map((item) => getSubjectName(item)));

    return {
      obtained,
      total,
      percentage,
      average: percentage.toFixed(1),
      grade: getGradeMeta(percentage).grade,
      subjectCount: subjectNames.size,
    };
  }, [filteredResults]);

  const examOptions = useMemo(() => {
    if (!results || results.length === 0) {
      return ["All"];
    }
    const uniqueExamTypes = [...new Set(results.map(r => r.exam?.exam_type || r.exam_type).filter(Boolean))];
    return ["All", ...uniqueExamTypes];
  }, [results]);

  const studentName = getStudentName(results?.[0]) || profile?.user_name || profile?.name || "Student";

  // ─── GSAP Animations ──────────────────────────────────────────────────

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const filterBarRef = useRef(null);
  const metricRefs = useRef([]);
  const chartCardRef = useRef(null);
  const tableCardRef = useRef(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (headerRef.current) {
        tl.fromTo(headerRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 });
      }
      
      if (filterBarRef.current) {
        tl.fromTo(filterBarRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
      }
      
      const validMetricRefs = metricRefs.current.filter(Boolean);
      if (validMetricRefs.length) {
        tl.fromTo(validMetricRefs, { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }, "-=0.2");
      }
      
      if (chartCardRef.current) {
        tl.fromTo(chartCardRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");
      }
      
      if (tableCardRef.current) {
        tl.fromTo(tableCardRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
      }
      
      if (summaryRef.current) {
        tl.fromTo(summaryRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !results?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading report card...</p>
        </div>
      </div>
    );
  }

  // ─── No Data State ──────────────────────────────────────────────────

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Report Card"
            subtitle="View your academic performance and examination results"
            breadcrumbs={["Student", "Report Card"]}
            bgColor="bg-indigo-50"
          />
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center mt-6">
            <ClipboardX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">No Results Available</h3>
            <p className="text-sm text-gray-500 mt-1">No grades have been published yet.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <div ref={headerRef}>
          <PageHeader
            title="Report Card"
            subtitle="View your academic performance and examination results"
            breadcrumbs={["Student", "Report Card"]}
            bgColor="bg-indigo-50"
            actions={
              <div className="flex items-center gap-2 text-sm text-indigo-700">
                <User size={16} />
                <span>{studentName}</span>
              </div>
            }
          />
        </div>

        <div className="mt-6" />

        {/* ─── Filter Bar ────────────────────────────────────────────── */}
        <div ref={filterBarRef} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800 truncate">Grade Summary</h2>
                <Sparkles size={16} className="text-yellow-400" />
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {examFilter === "All" 
                  ? `${filteredResults.length} results across all examinations` 
                  : `${filteredResults.length} results for ${examFilter}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {examOptions.map((option) => (
                  <FilterButton
                    key={option}
                    label={option}
                    active={option === examFilter}
                    onClick={() => setExamFilter(option)}
                  />
                ))}
              </div>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden ml-2 shadow-sm">
                <button
                  onClick={() => setViewMode("chart")}
                  className={`px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                    viewMode === "chart"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                  title="Chart View"
                >
                  <BarChart3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode("bars")}
                  className={`px-3 py-2 text-xs font-semibold transition-all duration-300 ${
                    viewMode === "bars"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                  title="Bar View"
                >
                  <Table2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Metric Cards ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MetricCard
            cardRef={(el) => el && metricRefs.current.push(el)}
            index={0}
            label="Subjects"
            value={summary.subjectCount}
            footer={examFilter === "All" ? "Total Subjects" : `${examFilter} Subjects`}
            icon={BookOpen}
            colors={["#818CF8", "#6366F1"]}
          />
          <MetricCard
            cardRef={(el) => el && metricRefs.current.push(el)}
            index={1}
            label="Average"
            value={`${summary.average}%`}
            footer="Overall Performance"
            icon={Percent}
            colors={getGradeMeta(summary.percentage).colors}
          />
          <MetricCard
            cardRef={(el) => el && metricRefs.current.push(el)}
            index={2}
            label="Grade"
            value={summary.grade}
            footer="Overall Grade"
            icon={Award}
            colors={getGradeMeta(summary.percentage).colors}
          />
          <MetricCard
            cardRef={(el) => el && metricRefs.current.push(el)}
            index={3}
            label="Marks"
            value={`${Number(summary.obtained).toFixed(0)}/${Number(summary.total).toFixed(0)}`}
            footer="Obtained / Total"
            icon={Target}
            colors={["#38BDF8", "#2563EB"]}
          />
        </div>

        {/* ─── Chart Section ────────────────────────────────────────────── */}
        <div ref={chartCardRef} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200">
                {viewMode === "chart" ? (
                  <TrendingUp size={22} strokeWidth={2} />
                ) : (
                  <Table2 size={22} strokeWidth={2} />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {viewMode === "chart" ? "Performance Analytics" : "Subject Performance"}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {examFilter === "All" ? "Performance across all subjects" : `${examFilter} performance by subject`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100">
                <span className="text-xs font-medium text-gray-600">Results</span>
                <span className="text-xs font-bold text-gray-800">{chartData.length}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <GraduationCap size={40} className="text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">No data available</p>
            </div>
          ) : (
            <>
              {viewMode === "chart" && <PremiumBarChart data={chartData} examFilter={examFilter} />}
              {viewMode === "bars" && (
                <div className="space-y-4">
                  {chartData.map((item, index) => {
                    const meta = getGradeMeta(item.marks);
                    return (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                            {item.subject}
                          </span>
                          <span className="text-sm font-bold text-gray-600">
                            {item.marks}%
                          </span>
                        </div>
                        <PerformanceBar percentage={item.marks} meta={meta} showLabel={false} />
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3">
                {GRADE_TIERS.map((tier) => (
                  <div key={tier.grade} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                    <span
                      className="h-3 w-3 rounded-full shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${tier.colors[0]}, ${tier.colors[1]})` }}
                    />
                    <span className="text-xs font-medium text-gray-600">{tier.grade}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── Results Table ────────────────────────────────────────────── */}
        <div ref={tableCardRef} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800 truncate">Detailed Results</h3>
              <p className="text-xs text-gray-500 truncate">
                {examFilter === "All" 
                  ? `${filteredResults.length} results across all examinations` 
                  : `${filteredResults.length} ${examFilter} results`}
              </p>
            </div>
            <select 
              value={examFilter} 
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {examOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {filteredResults.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <ClipboardX size={36} className="text-gray-300" />
              <h4 className="mt-2 text-sm font-semibold text-gray-700">No Results Found</h4>
              <p className="text-xs text-gray-500">
                {examFilter === "All" ? "No grades available" : `No ${examFilter} results available`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Teacher</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Exam</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((result, index) => {
                    const obtained = Number(result.marks_obtained) || 0;
                    const total = Number(result.exam?.total_marks) || Number(result.total_marks) || 100;
                    const percentage = total > 0 ? ((obtained / total) * 100).toFixed(1) : 0;
                    const subjectName = getSubjectName(result);
                    const teacherName = getTeacherName(result);
                    const examName = getExamName(result);
                    const examType = result.exam?.exam_type || result.exam_type || "General";

                    return (
                      <tr
                        key={result.id || index}
                        ref={(el) => el && rowRefs.current.push(el)}
                        className="hover:bg-gray-50/70 transition-all duration-200 group"
                      >
                        <td className="px-4 py-4 text-xs font-medium text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-gray-800 group-hover:text-gray-900">
                          {subjectName}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500 hidden sm:table-cell">
                          {teacherName || "N/A"}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            {examName}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">
                          {obtained}/{total}
                        </td>
                        <td className="px-4 py-4">
                          <GradeBadge percentage={percentage} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Summary & Remarks ────────────────────────────────────────── */}
        <div ref={summaryRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${getGradeMeta(summary.percentage).colors[0]}, ${getGradeMeta(summary.percentage).colors[1]})` }}
              >
                <Trophy size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 truncate">Academic Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Student</span>
                <span className="text-sm font-semibold text-gray-800">{studentName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Academic Year</span>
                <span className="text-sm font-semibold text-gray-800">2025-2026</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Filter Applied</span>
                <span className="text-sm font-semibold text-blue-600">{examFilter === "All" ? "All Exams" : examFilter}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Total Subjects</span>
                <span className="text-sm font-semibold text-gray-800">{summary.subjectCount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Total Marks</span>
                <span className="text-sm font-semibold text-gray-800">{Number(summary.total).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Obtained Marks</span>
                <span className="text-sm font-semibold text-emerald-600">+{Number(summary.obtained).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">Overall Percentage</span>
                <span className="text-sm font-semibold text-blue-600">{summary.average}%</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-gray-700">Overall Grade</span>
                <GradeBadge percentage={summary.percentage} size="lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-200">
                <Star size={20} strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 truncate">Teacher's Remarks</h3>
            </div>

            <div className="relative rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 pl-10 text-gray-700 border border-blue-100">
              <Quote size={20} className="absolute left-4 top-4 text-blue-400/50" />
              <p className="text-sm leading-relaxed">
                {results?.[0]?.remarks || "No remarks available."}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100">
                <GraduationCap size={14} className="text-gray-500" />
              </div>
              <span className="font-medium">Results published on {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Report Card Module</p>
        </div>
      </div>
    </div>
  );
}

export default ReportCard;