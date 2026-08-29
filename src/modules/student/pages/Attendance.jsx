// src/modules/student/pages/Attendance.jsx

/**
 * ============================================
 * STUDENT ATTENDANCE - REDESIGNED WITH IMPROVED UI/UX
 * ============================================
 * 
 * Purpose: View student attendance history with beautiful UI
 * Used by: Student module routes
 * 
 * Features:
 * - Beautiful gradient design with glass morphism
 * - Animated donut chart with smooth transitions
 * - Real API data with Redux integration
 * - Filter by month with elegant dropdown
 * - Pagination with smooth animations
 * - Responsive design for all devices
 * - Loading skeleton states
 * - Error handling with retry
 * - New API fields: student_name, teacher_name, marked_by_name
 * 
 * API Endpoints:
 * - GET /api/attendance/attendance/ - Get attendance records
 * 
 * Usage:
 * <Route path="/student/attendance" element={<Attendance />} />
 * ============================================
 */

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  User,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Sparkles,
  Zap,
  Award,
  Star,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchAttendance,
} from "@/modules/student/store/studentThunks";

import {
  selectStudentAttendance,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  present: ["#34D399", "#0D9488"],
  absent: ["#FB7185", "#E11D48"],
  leave: ["#FBBF24", "#D97706"],
  late: ["#60A5FA", "#2563EB"],
  holiday: ["#A78BFA", "#7C3AED"],
};

const STATUS_ICONS = {
  present: CheckCircle2,
  absent: XCircle,
  leave: Clock3,
  late: Clock3,
  holiday: Calendar,
};

const ATTENDANCE_PER_PAGE = 6;

// ─── Status Badge ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const configs = {
    present: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Present" },
    absent: { color: "bg-red-100 text-red-700 border-red-200", label: "Absent" },
    leave: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Leave" },
    on_leave: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "On Leave" },
    late: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Late" },
    holiday: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Holiday" },
  };

  const normalizedStatus = status?.toLowerCase() || "present";
  const config = configs[normalizedStatus] || configs.present;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.color.replace('bg-', 'bg-').split(' ')[0]}`} />
      {config.label}
    </motion.span>
  );
};

// ─── AttendanceDonut Component ─────────────────────────────────────────────

const AttendanceDonut = ({ present, absent, leave, late, percentage, size = 160, thickness = 18 }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = present + absent + leave + late || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { key: "present", value: present, colors: STATUS_COLORS.present, label: "Present" },
    { key: "absent", value: absent, colors: STATUS_COLORS.absent, label: "Absent" },
    { key: "leave", value: leave, colors: STATUS_COLORS.leave, label: "Leave" },
    { key: "late", value: late, colors: STATUS_COLORS.late, label: "Late" },
  ];

  let cumulative = 0;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-blue-500/20 blur-2xl scale-110" />
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`} 
        className="-rotate-90 relative z-10"
      >
        <defs>
          {segments.map((s) => (
            <linearGradient key={s.key} id={`donut-${s.key}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={s.colors[0]} />
              <stop offset="100%" stopColor={s.colors[1]} />
            </linearGradient>
          ))}
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-gray-100"
        />

        {segments.map((s) => {
          const share = s.value / total;
          const dash = mounted ? share * circumference : 0;
          const offset = -((cumulative / total) * circumference);
          cumulative += s.value;

          if (s.value === 0) return null;

          return (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={thickness}
              strokeLinecap="round"
              stroke={`url(#donut-${s.key})`}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              style={{ 
                transition: "stroke-dasharray 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          );
        })}
      </svg>

      <div className="absolute flex flex-col items-center z-20">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="text-3xl sm:text-4xl font-bold text-gray-900"
        >
          {percentage}%
        </motion.span>
        <span className="text-xs font-medium text-gray-400">
          Attendance Rate
        </span>
      </div>
    </div>
  );
};

// ─── MetricCard Component ──────────────────────────────────────────────────

const MetricCard = ({ label, value, icon: Icon, colors, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay || 0, duration: 0.5, type: "spring", stiffness: 100 }}
    whileHover={{ y: -6, transition: { duration: 0.2 } }}
    className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
  >
    <div
      className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    />
    
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
          {value}
        </p>
      </div>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
  </motion.div>
);

// ─── Pagination Component ──────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;

    for (let page = 1; page <= totalPages; page += 1) {
      const isEdge = page === 1 || page === totalPages;
      const isNearCurrent = Math.abs(page - currentPage) <= windowSize;

      if (isEdge || isNearCurrent) {
        pages.push(page);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
              page === currentPage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────

const AttendanceSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gray-200" />
            <div>
              <div className="h-5 w-48 bg-gray-200 rounded-lg" />
              <div className="mt-1.5 h-4 w-32 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="ml-auto h-7 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────

function Attendance() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const attendance = useSelector(selectStudentAttendance);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState("All Months");
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch Attendance ──────────────────────────────────────────────────

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        console.log("🔍 Fetching attendance using Redux...");
        await dispatch(fetchAttendance()).unwrap();
      } catch (err) {
        console.error("❌ Error fetching attendance:", err);
        if (err?.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchAttendanceData();
  }, [dispatch, navigate]);

  // ─── Computed Values ───────────────────────────────────────────────────

  const months = [
    "All Months",
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const monthlyAttendance = useMemo(() => {
    if (!attendance || attendance.length === 0) return [];
    
    if (selectedMonth === "All Months") {
      return attendance;
    }
    
    return attendance.filter((item) => {
      if (!item.date) return false;
      try {
        const month = new Date(item.date).toLocaleString("default", { month: "long" });
        return month === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }, [attendance, selectedMonth]);

  const sortedAttendance = useMemo(() => {
    return [...monthlyAttendance].sort((a, b) => {
      try {
        return new Date(b.date) - new Date(a.date);
      } catch (e) {
        return 0;
      }
    });
  }, [monthlyAttendance]);

  const stats = useMemo(() => {
    const present = monthlyAttendance.filter((item) => item.status?.toLowerCase() === "present").length;
    const absent = monthlyAttendance.filter((item) => item.status?.toLowerCase() === "absent").length;
    const leave = monthlyAttendance.filter((item) => {
      const status = item.status?.toLowerCase() || '';
      return status === "leave" || status === "on_leave";
    }).length;
    const late = monthlyAttendance.filter((item) => {
      const status = item.status?.toLowerCase() || '';
      return status === "late";
    }).length;
    const percentage = monthlyAttendance.length
      ? Math.round((present / monthlyAttendance.length) * 100)
      : 0;

    return { present, absent, leave, late, percentage, total: monthlyAttendance.length };
  }, [monthlyAttendance]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, attendance]);

  const totalPages = Math.max(1, Math.ceil(sortedAttendance.length / ATTENDANCE_PER_PAGE));
  const paginatedAttendance = useMemo(() => {
    const start = (currentPage - 1) * ATTENDANCE_PER_PAGE;
    return sortedAttendance.slice(start, start + ATTENDANCE_PER_PAGE);
  }, [sortedAttendance, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // ─── Loading State ─────────────────────────────────────────────────────

  if (loading && !attendance.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <PageHeader 
            title="Attendance" 
            subtitle="View your monthly attendance history" 
            breadcrumbs={["Student", "Attendance"]} 
            bgColor="bg-blue-50" 
          />
          <div className="mt-6">
            <AttendanceSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────

  if (error && !attendance.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <PageHeader 
            title="Attendance" 
            subtitle="View your monthly attendance history" 
            breadcrumbs={["Student", "Attendance"]} 
            bgColor="bg-blue-50" 
          />
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Failed to load attendance</h3>
              <p className="text-gray-500 mt-2 max-w-md">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        
        <PageHeader
          bgColor="bg-blue-50"
          title="Attendance"
          subtitle="Track your attendance progress and history"
          breadcrumbs={["Student", "Attendance"]}
        />

        {/* ─── Stats Overview ─────────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Donut Chart */}
              <div className="flex shrink-0 items-center justify-center lg:pr-8 lg:border-r lg:border-gray-200">
                <AttendanceDonut
                  present={stats.present}
                  absent={stats.absent}
                  leave={stats.leave}
                  late={stats.late}
                  percentage={stats.percentage}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                <MetricCard
                  label="Present Days"
                  value={stats.present}
                  icon={CheckCircle2}
                  colors={STATUS_COLORS.present}
                  delay={0.05}
                />
                <MetricCard
                  label="Absent Days"
                  value={stats.absent}
                  icon={XCircle}
                  colors={STATUS_COLORS.absent}
                  delay={0.1}
                />
                <MetricCard
                  label="Leave Days"
                  value={stats.leave}
                  icon={Clock3}
                  colors={STATUS_COLORS.leave}
                  delay={0.15}
                />
                <MetricCard
                  label="Late Days"
                  value={stats.late}
                  icon={Clock3}
                  colors={STATUS_COLORS.late}
                  delay={0.2}
                />
              </div>
            </div>

            {/* Summary Bar */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.present}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.absent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-gray-600">Leave</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.leave}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Late</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.late}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 size={16} />
                <span>{stats.total} total records</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Attendance History ──────────────────────────────────────────── */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Attendance History
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Daily attendance records for the selected month
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                <select
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-gray-900 outline-none transition-colors focus:border-blue-500"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Month Title */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMonth === "All Months" ? "All Records" : `${selectedMonth} ${currentYear}`}
              </h3>
              <span className="text-sm text-gray-500">
                {sortedAttendance.length} record{sortedAttendance.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Attendance List */}
            {sortedAttendance.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar size={32} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {!attendance || attendance.length === 0 
                      ? "No attendance records found" 
                      : `No records for ${selectedMonth}`}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {!attendance || attendance.length === 0
                      ? "Records will appear once your teacher marks attendance"
                      : "Try selecting a different month"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <AnimatePresence>
                    {paginatedAttendance.map((item, index) => {
                      const StatusIcon = STATUS_ICONS[item.status?.toLowerCase()] || Clock3;
                      const colors = STATUS_COLORS[item.status?.toLowerCase()] || STATUS_COLORS.present;
                      
                      // Use new API fields
                      const studentName = item.student_name || item.student?.name || 'You';
                      const teacherName = item.teacher_name || item.marked_by_name || item.teacher?.name || 'Teacher';
                      const className = item.class_name || item.class_obj?.name || '';

                      return (
                        <motion.div
                          key={item.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 transition-all hover:shadow-md"
                        >
                          {/* Left accent bar */}
                          <div 
                            className="absolute left-0 top-0 h-full w-1 rounded-l-full"
                            style={{ background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})` }}
                          />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-4">
                            <div className="flex items-center gap-4">
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                              >
                                <StatusIcon size={18} strokeWidth={2} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {item.date ? new Date(item.date).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }) : "Unknown date"}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <User size={12} className="text-gray-400" />
                                    {studentName}
                                  </span>
                                  {teacherName && (
                                    <span className="flex items-center gap-1">
                                      <Users size={12} className="text-gray-400" />
                                      {teacherName}
                                    </span>
                                  )}
                                  {className && (
                                    <span className="text-gray-400">• {className}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 self-start sm:self-center">
                              <StatusBadge status={item.status} />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-gray-500">
                      Showing {(currentPage - 1) * ATTENDANCE_PER_PAGE + 1}
                      {"–"}
                      {Math.min(currentPage * ATTENDANCE_PER_PAGE, sortedAttendance.length)} of{" "}
                      {sortedAttendance.length} record{sortedAttendance.length !== 1 ? 's' : ''}
                    </p>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Attendance Module</p>
          <p className="mt-1">
            {stats.total} total records • {stats.percentage}% attendance rate
          </p>
        </div>
      </div>
    </div>
  );
}

export default Attendance;