/**
 * ============================================
 * QUICK STATS COMPONENT
 * ============================================
 * 
 * Purpose: Displays student dashboard statistics cards
 * Features:
 * - Attendance percentage with ring progress
 * - Academic score with exam filter
 * - Assignment completion with bar progress
 * - Participation count with ring progress
 * - Animated progress rings and bars
 * - Exam type filter for academic score
 * - Hover effects with ambient glow
 * - Staggered entrance animations
 * - Role-based theming (student)
 * 
 * Dependencies:
 * - lucide-react for icons (CheckCircle2, GraduationCap, ClipboardList, Users, Trophy)
 * - react-redux for state management
 * - @/utils/assignmentUtils for assignment merging
 * 
 * Usage:
 * <QuickStats />
 * ============================================
 */

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  GraduationCap,
  ClipboardList,
  Users,
  Trophy,
} from "lucide-react";
import { mergeAssignments } from "@/utils/assignmentUtils";

/**
 * ============================================
 * SMALL VISUAL PRIMITIVES
 * ============================================
 */

/**
 * Animated radial progress ring, drawn with a gradient stroke.
 * 
 * @param {Object} props - Component props
 * @param {number} props.percent - Progress percentage (0-100)
 * @param {string} props.gradientId - Unique gradient ID
 * @param {Array} props.colors - Gradient color array
 * @param {number} props.size - Ring size in pixels (default: 68)
 * @param {number} props.stroke - Stroke width (default: 6)
 * @returns {JSX.Element} Progress ring UI
 */
const ProgressRing = ({ percent, gradientId, colors, size = 68, stroke = 6 }) => {
  const [mounted, setMounted] = useState(false);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (mounted ? clamped / 100 : 0) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 px-4 sm:px-6 lg:px-8">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="100%" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="stroke-slate-100 dark:stroke-slate-800 px-4 sm:px-6 lg:px-8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        stroke={`url(#${gradientId})`}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </svg>
  );
};

/**
 * Animated horizontal fill bar, used for count-based metrics.
 * 
 * @param {Object} props - Component props
 * @param {number} props.percent - Progress percentage (0-100)
 * @param {Array} props.colors - Gradient color array
 * @returns {JSX.Element} Progress bar UI
 */
const ProgressBar = ({ percent, colors }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="h-1.5 w-full overflow-hidden md:block md:hidden rounded-full bg-slate-100 dark:bg-slate-800 px-4 sm:px-6 lg:px-8">
      <div
        className="h-full rounded-full px-4 sm:px-6 lg:px-8"
        style={{
          width: mounted ? `${clamped}%` : "0%",
          background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
          transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
};

/**
 * Footer tone color classes mapping
 */
const footerToneClasses = {
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
  info: "text-sky-600 dark:text-sky-400",
  neutral: "text-slate-500 dark:text-slate-400",
};

/**
 * ============================================
 * EXAM FILTER
 * ============================================
 * 
 * Exam-type filter used only on the Academic Score card
 */
const EXAM_FILTERS = ["All", "Mid-Term", "Final", "Quiz", "Assignment"];

/**
 * Academic filter select dropdown
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected filter
 * @param {Function} props.onChange - Filter change callback
 * @returns {JSX.Element} Filter select UI
 */
const AcademicFilterSelect = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onClick={(e) => e.stopPropagation()}
    className="relative z-10 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs
               font-medium text-text-secondary outline-none transition-colors
               hover:border-student-primary/40 focus:border-student-primary
               dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 px-4 sm:px-6 lg:px-8"
  >
    {EXAM_FILTERS.map((option) => (
      <option key={option} value={option}>
        {option === "All" ? "All Exams" : option}
      </option>
    ))}
  </select>
);

/**
 * ============================================
 * QUICK STATS COMPONENT
 * ============================================
 * 
 * Renders student dashboard statistics cards
 * 
 * @returns {JSX.Element} Quick stats UI
 * 
 * @example
 * // In student dashboard
 * <QuickStats />
 * ============================================
 */
const QuickStats = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves student data from Redux store
   */
  const {
    attendance = [],
    reportCard = {},
    assignments = [],
    submissions = [],
    participations = [],
  } = useSelector((state) => state.student);

  /**
   * ============================================
   * FILTER STATE
   * ============================================
   * 
   * Manages the selected exam filter for academic score
   */
  const [academicFilter, setAcademicFilter] = useState("All");

  /**
   * ============================================
   * MERGED ASSIGNMENTS
   * ============================================
   * 
   * Merges assignments with submission data using utility
   */
  const mergedAssignments = useMemo(
    () => mergeAssignments(assignments, submissions),
    [assignments, submissions]
  );

  /**
   * ============================================
   * ✅ FIXED: SAFE GRADE STATS EXTRACTION
   * ============================================
   * 
   * Safely extracts grades from reportCard regardless of data structure
   */
  const gradeStats = useMemo(() => {
    const grades = reportCard?.grades;
    
    // If grades is an array, use it directly
    if (Array.isArray(grades)) {
      return grades;
    }
    
    // If grades is an object with results/data property
    if (grades && typeof grades === 'object') {
      if (grades.results && Array.isArray(grades.results)) {
        return grades.results;
      }
      if (grades.data && Array.isArray(grades.data)) {
        return grades.data;
      }
      // If it's a single grade object, wrap it
      if (grades.id && grades.subject) {
        return [grades];
      }
    }
    
    // Default to empty array
    return [];
  }, [reportCard]);

  /**
   * ============================================
   * STATISTICS CALCULATIONS
   * ============================================
   * 
   * Calculates all statistics for the dashboard cards:
   * - Attendance percentage
   * - Academic performance (with exam filter)
   * - Assignment completion
   * - Participation achievements
   */
  const stats = useMemo(() => {
    /* ==========================================
        Attendance
    ========================================== */

    const presentDays = attendance.filter(
      (record) => record.status === "Present"
    ).length;

    const attendancePercentage = attendance.length
      ? Math.round((presentDays / attendance.length) * 100)
      : 0;

    /* ==========================================
        Academic Performance
        Scoped to the selected exam-type filter.
        ✅ FIXED: Uses safe gradeStats instead of reportCard.grades directly
    ========================================== */

    const grades =
      academicFilter === "All"
        ? gradeStats
        : gradeStats.filter((grade) => grade.exam_type === academicFilter);

    const obtainedMarks = grades.reduce(
      (sum, grade) => sum + Number(grade.obtained_marks || grade.marks_obtained || 0),
      0
    );

    const totalMarks = grades.reduce(
      (sum, grade) => sum + Number(grade.total_marks || grade.max_marks || 0),
      0
    );

    const averageMarks = totalMarks
      ? Number((((obtainedMarks / totalMarks) * 100).toFixed(2)))
      : 0;

    /* ==========================================
        Assignments
    ========================================== */

    const totalAssignments = mergedAssignments.length;

    const pendingAssignments = mergedAssignments.filter(
      (assignment) => assignment.status === "Pending"
    ).length;

    const completedAssignments = mergedAssignments.filter(
      (assignment) =>
        assignment.status === "Submitted" || assignment.status === "Graded"
    ).length;

    const assignmentCompletion =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    /* ==========================================
        Participations
    ========================================== */

    const totalParticipations = participations.length;

    const podiumFinishes = participations.filter(
      (item) => item.position
    ).length;

    const achievementRate = totalParticipations
      ? Math.round((podiumFinishes / totalParticipations) * 100)
      : 0;

    return {
      attendancePercentage,
      averageMarks,
      totalExams: new Set(
        gradeStats.map((grade) => grade.subject_name || grade.subject)
      ).size,
      totalAssignments,
      pendingAssignments,
      completedAssignments,
      assignmentCompletion,
      totalParticipations,
      podiumFinishes,
      achievementRate,
    };
  }, [attendance, gradeStats, mergedAssignments, participations, academicFilter]);

  /**
   * ============================================
   * ATTENDANCE TONE HELPERS
   * ============================================
   * 
   * Determine tone and message based on attendance percentage
   */
  const getAttendanceTone = () => {
    if (stats.attendancePercentage >= 90) return "success";
    if (stats.attendancePercentage >= 75) return "warning";
    return "danger";
  };

  const getAttendanceMessage = () => {
    if (stats.attendancePercentage >= 90) return "Excellent attendance";
    if (stats.attendancePercentage >= 75) return "Keep improving";
    return "Needs attention";
  };

  /**
   * Determine tone based on average marks
   */
  const getMarksTone = () => {
    if (stats.averageMarks >= 85) return "success";
    if (stats.averageMarks >= 70) return "warning";
    return "danger";
  };

  /**
   * ============================================
   * STAT CARDS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   */
  const cards = [
    {
      key: "attendance",
      title: "Attendance",
      value: `${stats.attendancePercentage}%`,
      footer: getAttendanceMessage(),
      footerTone: getAttendanceTone(),
      icon: CheckCircle2,
      colors: ["#34D399", "#0D9488"],
      visual: { type: "ring", percent: stats.attendancePercentage },
    },
    {
      key: "academic",
      title: "Academic Score",
      value: `${stats.averageMarks}%`,
      footer:
        stats.totalExams === 0
          ? "No exams recorded"
          : `${stats.totalExams} exam${stats.totalExams === 1 ? "" : "s"} evaluated`,
      footerTone: getMarksTone(),
      icon: GraduationCap,
      colors: ["#A78BFA", "#6366F1"],
      visual: { type: "ring", percent: stats.averageMarks },
      filterable: true,
    },
    {
      key: "assignments",
      title: "Assignments",
      value: stats.pendingAssignments,
      footer:
        stats.pendingAssignments === 0
          ? "All completed 🎉"
          : `${stats.pendingAssignments} pending`,
      footerTone: stats.pendingAssignments === 0 ? "success" : "warning",
      icon: ClipboardList,
      colors: ["#FBBF24", "#EA580C"],
      visual: { type: "bar", percent: stats.assignmentCompletion },
    },
    {
      key: "participations",
      title: "Participations",
      value: stats.totalParticipations,
      footer:
        stats.podiumFinishes > 0
          ? `${stats.podiumFinishes} podium ${stats.podiumFinishes === 1 ? "finish" : "finishes"}`
          : "No podium finishes yet",
      footerTone: stats.podiumFinishes > 0 ? "info" : "neutral",
      icon: stats.podiumFinishes > 0 ? Trophy : Users,
      colors: ["#38BDF8", "#2563EB"],
      visual: { type: "ring", percent: stats.achievementRate },
    },
  ];

  return (
    <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 px-4 sm:px-6 lg:px-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            style={{ animationDelay: `${index * 90}ms` }}
            className="group relative overflow-hidden md:block md:hidden rounded-2xl border border-slate-200/70 bg-white p-5 opacity-0 shadow-sm [animation-fill-mode:forwards]
                       animate-[quickstat-in_0.6s_ease-out] transition-all duration-300
                       hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/70
                       dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/30 px-4 sm:px-6 lg:px-8"
          >
            {/* ─── Top Accent Line ─── */}
            <div
              aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] opacity-80 px-4 sm:px-6 lg:px-8"
              style={{ background: `linear-gradient(90deg, ${card.colors[0]}, ${card.colors[1]})` }}
            />

            {/* ─── Ambient Glow ─── */}
            <div
              aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25 px-4 sm:px-6 lg:px-8"
              style={{ background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})` }}
            />

            <div className="relative flex flex-col md:flex-row items-start justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-4 sm:px-6 lg:px-8">
                  {card.title}
                </p>
                <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight text-slate-800 dark:text-slate-100 px-4 sm:px-6 lg:px-8">
                  {card.value}
                </p>
              </div>

              {/* ─── Visual: Ring or Icon ─── */}
              {card.visual.type === "ring" ? (
                <div className="relative flex flex-col md:flex-row h-[68px] w-[68px] shrink-0 items-center justify-center px-4 sm:px-6 lg:px-8">
                  <ProgressRing
                    percent={card.visual.percent}
                    gradientId={`grad-${card.key}`}
                    colors={card.colors}
                  />
                  <div
                    className="absolute flex flex-col md:flex-row h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-transform duration-300 group-hover:scale-105 px-4 sm:px-6 lg:px-8"
                    style={{ background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})` }}
                  >
                    <Icon size={17} strokeWidth={2.25} />
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col md:flex-row h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 px-4 sm:px-6 lg:px-8"
                  style={{ background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})` }}
                >
                  <Icon size={20} strokeWidth={2.25} />
                </div>
              )}
            </div>

            <div className="relative mt-4 space-y-2.5 px-4 sm:px-6 lg:px-8">
              {/* ─── Progress Bar ─── */}
              {card.visual.type === "bar" && (
                <ProgressBar percent={card.visual.percent} colors={card.colors} />
              )}

              {/* ─── Footer ─── */}
              <p className={`flex flex-col md:flex-row items-center gap-1.5 text-sm md:text-base md:text-base font-medium ${footerToneClasses[card.footerTone]}`}>
                <span
                  aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full px-4 sm:px-6 lg:px-8"
                  style={{ background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})` }}
                />
                {card.footer}
              </p>

              {/* ─── Exam Filter ─── */}
              {card.filterable && (
                <AcademicFilterSelect value={academicFilter} onChange={setAcademicFilter} />
              )}
            </div>
          </div>
        );
      })}

      {/* ─── Animation Styles ─── */}
      <style>{`
        @keyframes quickstat-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .group { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
};

export default QuickStats;