// src/modules/teacher/pages/TeacherDashboard.jsx

/**
 * ============================================
 * TEACHER DASHBOARD - COMPLETE (UPDATED)
 * ============================================
 * 
 * Clean, modern teacher dashboard with:
 * - Professional design
 * - Smooth animations with GSAP + Framer Motion
 * - Interactive charts from API data
 * - Real-time data from API
 * - Clean typography
 * - Shows logged-in teacher name
 * - Quick actions for common tasks
 * - NO MOCK DATA - Everything from API
 * - Updated to use new API name fields (user_name, class_name, etc.)
 * ============================================
 */

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  Clock,
  CalendarDays,
  BookOpen,
  CheckCircle,
  Bell,
  ChevronRight,
  Calendar,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ClipboardCheck,
  MessageSquare,
  BarChart3,
  School,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchTeacherDashboard,
  fetchStudents,
  fetchAssignments,
  fetchTimetable,
  fetchAttendance,
  fetchAttendanceStats,
  fetchBehaviorLogs,
  fetchExams,
  fetchMessages,
  fetchNotifications,
} from "../store/teacherThunks";

import {
  selectTeacherProfile,
  selectTeacherDashboardSummary,
  selectTeacherStudents,
  selectTeacherAssignments,
  selectTeacherTimetable,
  selectTeacherAttendance,
  selectTeacherAttendanceStats,
  selectTeacherBehaviorLogs,
  selectTeacherExams,
  selectTeacherMessages,
  selectTeacherNotifications,
  selectTeacherUnreadCount,
  selectTeacherLoading,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const getInitials = (name) => {
  if (!name) return "T";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "T";
};

// ─── Skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-28 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse" />
          <div className="h-80 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ title, value, subtitle, icon: Icon, color = "indigo", delay = 0, trend, isLoading }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  );
}

// ─── Attendance Chart ──────────────────────────────────────────────────

function AttendanceChart({ data, totalDays, presentDays, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Activity className="w-8 h-8 mb-2" />
        <p className="text-sm">No attendance data available</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Monthly Attendance</p>
          <p className="text-xs text-gray-400">{presentDays} out of {totalDays} days present</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Present
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            Absent
          </span>
        </div>
      </div>
      <div className="h-48 flex items-end gap-2">
        {data.slice(0, 6).map((item, index) => {
          const height = Math.max((item.percentage || 0) * 2.4, 4);
          const isHigh = item.percentage >= 80;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full group">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  {item.percentage || 0}%
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}px`,
                    background: isHigh
                      ? 'linear-gradient(180deg, #6366f1, #4f46e5)'
                      : 'linear-gradient(180deg, #a5b4fc, #818cf8)',
                    opacity: item.percentage > 0 ? 1 : 0.3,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">
                {item.month?.slice(0, 3) || `M${index + 1}`}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + (d.percentage || 0), 0) / data.length) : 0}% Average
        </span>
        <span className="text-sm text-gray-500">
          Last {data.length} months
        </span>
      </div>
    </div>
  );
}

// ─── Quick Action ──────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, color = "indigo", onClick }) {
  const colors = {
    indigo: "hover:bg-indigo-50 text-indigo-600",
    emerald: "hover:bg-emerald-50 text-emerald-600",
    amber: "hover:bg-amber-50 text-amber-600",
    rose: "hover:bg-rose-50 text-rose-600",
    blue: "hover:bg-blue-50 text-blue-600",
    purple: "hover:bg-purple-50 text-purple-600",
    cyan: "hover:bg-cyan-50 text-cyan-600",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 ${colors[color]} transition-all text-left w-full`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const profile = useSelector(selectTeacherProfile);
  const dashboardSummary = useSelector(selectTeacherDashboardSummary);
  const students = useSelector(selectTeacherStudents);
  const assignments = useSelector(selectTeacherAssignments);
  const timetable = useSelector(selectTeacherTimetable);
  const attendance = useSelector(selectTeacherAttendance);
  const attendanceStats = useSelector(selectTeacherAttendanceStats);
  const behaviorLogs = useSelector(selectTeacherBehaviorLogs);
  const exams = useSelector(selectTeacherExams);
  const messages = useSelector(selectTeacherMessages);
  const notifications = useSelector(selectTeacherNotifications);
  const unreadCount = useSelector(selectTeacherUnreadCount);
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ─────────────────────────────────────────────────────
  const [animatedValues, setAnimatedValues] = useState({
    attendance: 0,
  });
  const [dataFetched, setDataFetched] = useState(false);

  // ─── Computed Values (from API data only) ──────────────────────────

  const todayClasses = useMemo(() => {
    if (!Array.isArray(timetable)) return [];
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    return timetable.filter(item =>
      item.day?.toLowerCase() === todayName ||
      item.day?.toLowerCase() === todayName.slice(0, 3)
    );
  }, [timetable]);

  const pendingAssignments = useMemo(() => {
    if (!Array.isArray(assignments)) return [];
    return assignments.filter(a => a.status === 'active' || a.status === 'published');
  }, [assignments]);

  // ─── Stats Calculation with new field names ──────────────────────

  const stats = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];
    const examsArray = Array.isArray(exams) ? exams : [];
    const messagesArray = Array.isArray(messages) ? messages : [];
    const behaviorLogsArray = Array.isArray(behaviorLogs) ? behaviorLogs : [];
    const todayClassesArray = Array.isArray(todayClasses) ? todayClasses : [];
    const pendingAssignmentsArray = Array.isArray(pendingAssignments) ? pendingAssignments : [];
    const notificationsArray = Array.isArray(notifications) ? notifications : [];

    // Get attendance rate from stats or calculate from attendance
    const attendanceRate = attendanceStats?.percentage || 0;
    
    // Calculate unread messages using new field names
    const unreadMessages = messagesArray.filter(m => m.is_read === false || m.is_read === 'false').length;

    // Calculate total classes - check multiple possible field names
    const totalClasses = dashboardSummary?.totalClasses || 
                         dashboardSummary?.total_classes || 
                         dashboardSummary?.classes_count || 
                         0;

    return {
      totalStudents: studentsArray.length || dashboardSummary?.totalStudents || 0,
      totalClasses: totalClasses,
      totalAssignments: assignmentsArray.length || dashboardSummary?.totalAssignments || 0,
      todayClasses: todayClassesArray.length || dashboardSummary?.todayClasses || 0,
      attendanceRate: attendanceRate,
      pendingSubmissions: pendingAssignmentsArray.length || dashboardSummary?.pendingSubmissions || 0,
      totalExams: examsArray.length || 0,
      unreadMessages: unreadMessages || 0,
      behaviorLogs: behaviorLogsArray.length || 0,
      unreadNotifications: unreadCount || dashboardSummary?.unreadNotifications || 0,
    };
  }, [students, assignments, exams, messages, todayClasses, pendingAssignments, 
      attendanceStats, dashboardSummary, behaviorLogs, notifications, unreadCount]);

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching dashboard data...');
      
      await Promise.all([
        dispatch(fetchTeacherDashboard()),
        dispatch(fetchStudents()),
        dispatch(fetchAssignments()),
        dispatch(fetchTimetable()),
        dispatch(fetchAttendance({})),
        dispatch(fetchBehaviorLogs()),
        dispatch(fetchExams()),
        dispatch(fetchMessages()),
        dispatch(fetchNotifications()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All dashboard data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load dashboard data. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── GSAP Animations ─────────────────────────────────────────────────

  useEffect(() => {
    if (loading && dataFetched) return;

    const ctx = gsap.context(() => {
      const sections = containerRef.current?.querySelectorAll('.animate-section') || [];
      if (sections.length > 0) {
        gsap.fromTo(
          sections,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, dataFetched]);

  // ─── Animate Stats ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;

    if (stats.attendanceRate) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stats.attendanceRate,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          setAnimatedValues(prev => ({ ...prev, attendance: Math.round(obj.val) }));
        }
      });
    }
  }, [loading, stats.attendanceRate]);

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleRefresh = async () => {
    await fetchAllData();
    toast.success("Data refreshed");
  };

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !dataFetched && !profile) {
    return <DashboardSkeleton />;
  }

  // ─── Error State ────────────────────────────────────────────────────

  if (error && !dataFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Teacher Name (using new field names) ──────────────────────────

  const teacherName = profile?.user_name || profile?.name || profile?.full_name || "Teacher";
  const firstName = teacherName.split(' ')[0] || "Teacher";

  // ─── Quick Actions ──────────────────────────────────────────────────

  const quickActions = [
    { icon: Users, label: 'Take Attendance', color: 'indigo', path: '/teacher/attendance' },
    { icon: FileText, label: 'Create Assignment', color: 'purple', path: '/teacher/assignments' },
    { icon: BookOpen, label: 'Enter Marks', color: 'emerald', path: '/teacher/marks-entry' },
    { icon: CalendarDays, label: 'Timetable', color: 'amber', path: '/teacher/timetable' },
    { icon: MessageSquare, label: 'Send Message', color: 'blue', path: '/teacher/messages' },
    { icon: BarChart3, label: 'Analytics', color: 'cyan', path: '/teacher/analytics' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/25">
                {getInitials(teacherName)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, <span className="text-indigo-600">{firstName}</span>!
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-0.5">
                  <span className="text-sm text-gray-500">
                    {profile?.subject_specialization || 'Teacher'} • {profile?.qualification || 'Educator'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="relative cursor-pointer" onClick={() => handleNavigate('/teacher/notifications')}>
                <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {stats.unreadNotifications}
                  </span>
                )}
              </div>
              <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                Teacher
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── Success Message ────────────────────────────────────────── */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        {/* ─── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Students"
            value={stats.totalStudents}
            subtitle={`${stats.totalClasses} classes`}
            icon={Users}
            color="indigo"
            delay={0.05}
            isLoading={loading}
          />
          <StatCard
            title="Attendance"
            value={`${animatedValues.attendance || stats.attendanceRate}%`}
            subtitle="Overall average"
            icon={Activity}
            color="emerald"
            delay={0.1}
            isLoading={loading}
          />
          <StatCard
            title="Assignments"
            value={stats.totalAssignments}
            subtitle={`${stats.pendingSubmissions} pending`}
            icon={ClipboardCheck}
            color="amber"
            delay={0.15}
            isLoading={loading}
          />
          <StatCard
            title="Today's Classes"
            value={stats.todayClasses}
            subtitle={`${stats.totalExams} exams`}
            icon={Calendar}
            color="blue"
            delay={0.2}
            isLoading={loading}
          />
        </div>

        {/* ─── Charts Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Chart - 2 columns */}
          <div className="lg:col-span-2 animate-section bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <AttendanceChart
              data={attendanceStats?.monthly_data || []}
              totalDays={attendanceStats?.total_days || 0}
              presentDays={attendanceStats?.present_days || 0}
              isLoading={loading}
            />
          </div>

          {/* Quick Stats - 1 column */}
          <div className="animate-section bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Quick Overview</p>
              <span className="text-xs text-gray-400">From API data</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <School className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Total Classes</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.totalClasses}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Total Exams</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.totalExams}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Unread Messages</span>
                </div>
                <span className={`text-sm font-semibold ${stats.unreadMessages > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {stats.unreadMessages}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Behavior Logs</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.behaviorLogs}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Today's Schedule ───────────────────────────────────────── */}
        <div className="animate-section bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Today's Schedule</p>
                <p className="text-xs text-gray-400">
                  {todayClasses.length} classes today
                </p>
              </div>
            </div>
            <button
              onClick={() => handleNavigate('/teacher/timetable')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {!todayClasses || todayClasses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No classes scheduled for today</p>
              <p className="text-sm text-gray-400">Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {item.start_time} - {item.end_time}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {/* Using new field names: class_name, subject_name */}
                        {item.class_name || item.class_obj?.name || 'Class'} • {item.subject_name || item.subject?.name || 'Subject'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0 ml-2">
                    {/* Using new field name: room_name */}
                    {item.room_name || item.room?.name || 'Room'} • {item.section_name || item.section?.name || 'A'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Quick Actions ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Zap className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-gray-700">Quick Actions</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onClick={() => handleNavigate(action.path)}
              />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}