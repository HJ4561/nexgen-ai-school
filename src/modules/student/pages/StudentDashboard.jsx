// src/modules/student/pages/StudentDashboard.jsx

/**
 * ============================================
 * STUDENT DASHBOARD - ENHANCED ATTENDANCE GRAPH
 * ============================================
 * 
 * Features:
 * - Enhanced attendance graph with filters
 * - Filter by: All, Present, Absent, Late
 * - Interactive bar chart with hover details
 * - Monthly view with statistics
 * - Smooth animations
 * ============================================
 */

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Clock, CalendarDays,
  BookOpen, CheckCircle, XCircle,
  User, Award, FileText, Bell,
  GraduationCap, Activity, Wallet,
  Library, Zap,
  ArrowUpRight, ArrowDownRight,
  CreditCard, Sparkles,
  RefreshCw, Users, School,
  BarChart3, Filter, ChevronDown,
  Calendar, Eye, EyeOff,
  PieChart, List,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import {
  fetchProfile,
  fetchAttendance,
  fetchResults,
  fetchAssignments,
  fetchFees,
  fetchBookIssues,
  fetchEvents,
  fetchParticipations,
  fetchNotifications,
  fetchExams,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentProfile,
  selectStudentAttendance,
  selectStudentResults,
  selectStudentAssignments,
  selectStudentFees,
  selectStudentBookIssues,
  selectStudentEvents,
  selectStudentParticipations,
  selectStudentNotifications,
  selectStudentExams,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getUserName = (profile) => {
  if (!profile) return null;
  if (profile.user_name && profile.user_name !== 'null') return profile.user_name;
  if (profile.user) {
    if (typeof profile.user === 'string') return profile.user;
    if (profile.user.name) return profile.user.name;
    if (profile.user.user_name) return profile.user.user_name;
  }
  if (profile.name) return profile.name;
  return null;
};

const getClassName = (profile) => {
  if (!profile) return null;
  if (profile.class_name && profile.class_name !== 'null') return profile.class_name;
  if (profile.class_obj) {
    if (typeof profile.class_obj === 'string') return profile.class_obj;
    if (profile.class_obj.name) return profile.class_obj.name;
    if (profile.class_obj.class_name) return profile.class_obj.class_name;
  }
  return null;
};

const getParentName = (profile) => {
  if (!profile) return null;
  if (profile.parent_name && profile.parent_name !== 'null') return profile.parent_name;
  if (profile.parent) {
    if (typeof profile.parent === 'string') return profile.parent;
    if (profile.parent.name) return profile.parent.name;
    if (profile.parent.parent_name) return profile.parent.parent_name;
  }
  return null;
};

// ─── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
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
}

// ─── Skeleton ──────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse" />
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

function StatCard({ title, value, subtitle, icon: Icon, color = "indigo", delay = 0, trend, onClick }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer"
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
      {trend !== undefined && trend !== null && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  );
}

// ─── Enhanced Attendance Chart ──────────────────────────────────────

function EnhancedAttendanceChart({ data, totalDays, presentDays, absentDays, lateDays }) {
  const [filter, setFilter] = useState("all");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [viewMode, setViewMode] = useState("chart");

  const filterOptions = [
    { label: "All", value: "all", icon: BarChart3 },
    { label: "Present", value: "present", icon: CheckCircle },
    { label: "Absent", value: "absent", icon: XCircle },
    { label: "Late", value: "late", icon: Clock },
  ];

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (filter === "all") return data;
    
    return data.filter(item => {
      if (filter === "present") return item.status === "present";
      if (filter === "absent") return item.status === "absent";
      if (filter === "late") return item.status === "late";
      return true;
    });
  }, [data, filter]);

  const statusColors = {
    present: "bg-emerald-500",
    absent: "bg-rose-500",
    late: "bg-amber-500",
  };

  const statusGradients = {
    present: "linear-gradient(180deg, #10b981, #059669)",
    absent: "linear-gradient(180deg, #f43f5e, #e11d48)",
    late: "linear-gradient(180deg, #f59e0b, #d97706)",
  };

  const getStatusLabel = (status) => {
    const map = {
      present: "Present",
      absent: "Absent",
      late: "Late",
    };
    return map[status] || status;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <BarChart3 className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-sm font-medium">No attendance data available</p>
        <p className="text-xs text-gray-400 mt-1">Attendance records will appear here</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filter === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("chart")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "chart" ? "bg-white shadow-sm" : "text-gray-400"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white shadow-sm" : "text-gray-400"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Stats summary */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl">
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-600">{presentDays}</span>
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-gray-600">{absentDays}</span>
            </span>
            {lateDays > 0 && (
              <span className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600">{lateDays}</span>
              </span>
            )}
            <span className="text-xs text-gray-400">
              Total: {totalDays}
            </span>
          </div>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === "chart" && (
        <div className="relative">
          <div className="h-56 flex items-end gap-2">
            {filteredData.map((item, index) => {
              const maxValue = Math.max(...data.map(d => d.percentage || 0), 1);
              const height = Math.max((item.percentage || 0) / maxValue * 180, 4);
              const status = item.status || "present";
              const isHovered = hoveredIndex === index;
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative w-full group">
                    {/* Tooltip */}
                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200 ${
                      isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.month || `Day ${index + 1}`}</span>
                        <span className="text-gray-400">|</span>
                        <span className="font-bold">{item.percentage || 0}%</span>
                        <span className="text-gray-400">|</span>
                        <span className={`${
                          status === "present" ? "text-emerald-400" :
                          status === "absent" ? "text-rose-400" :
                          "text-amber-400"
                        }`}>
                          {getStatusLabel(status)}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>

                    {/* Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}px` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isHovered ? "opacity-100 scale-y-105" : "opacity-90"
                      }`}
                      style={{
                        height: `${height}px`,
                        background: statusGradients[status] || statusGradients.present,
                        minHeight: height > 0 ? '4px' : '0px',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">
                    {item.month?.slice(0, 3) || `D${index + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-100">
            {filter === "all" ? (
              <>
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  Present ({presentDays})
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  Absent ({absentDays})
                </span>
                {lateDays > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    Late ({lateDays})
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-gray-500">
                Showing {filteredData.length} {filter} records
              </span>
            )}
            <span className="text-xs text-gray-400">
              {Math.round(data.reduce((sum, d) => sum + (d.percentage || 0), 0) / (data.length || 1))}% Average
            </span>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {filteredData.map((item, index) => {
            const status = item.status || "present";
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${statusColors[status] || statusColors.present}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {item.month || `Day ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold ${
                    status === "present" ? "text-emerald-600" :
                    status === "absent" ? "text-rose-600" :
                    "text-amber-600"
                  }`}>
                    {getStatusLabel(status)}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {item.percentage || 0}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Grade Chart ──────────────────────────────────────────────────────

function GradeChart({ subjects }) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Award className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No grades available</p>
      </div>
    );
  }

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-700">Grade Distribution</p>
        <span className="text-xs text-gray-400">{subjects.length} subjects</span>
      </div>
      <div className="space-y-3">
        {subjects.slice(0, 5).map((subject, index) => {
          const percentage = subject.total_marks > 0 
            ? Math.min((subject.marks || 0) / (subject.total_marks || 100) * 100, 100) 
            : 0;
          const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
          const grade = percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {subject.name || `Subject ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-500">
                    {subject.marks || 0}/{subject.total_marks || 100}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    percentage >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    percentage >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {grade}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
            </div>
          );
        })}
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

// ─── Recent Activity Item ─────────────────────────────────────────────

function RecentActivityItem({ item, index }) {
  const isAssignment = item.title !== undefined && item.due_date !== undefined;
  const isNotification = item.title !== undefined && item.message !== undefined;
  const isParticipation = item.event !== undefined;
  
  let Icon = Bell;
  let title = "Activity";
  let time = "";
  let status = "pending";
  let statusLabel = "Pending";
  
  if (isAssignment) {
    Icon = FileText;
    title = item.title || "Assignment";
    time = item.due_date ? new Date(item.due_date).toLocaleDateString() : "";
    status = item.status || "pending";
    statusLabel = status === 'submitted' || status === 'graded' ? 'Completed' : 'Pending';
  } else if (isNotification) {
    Icon = Bell;
    title = item.title || "Notification";
    time = item.created_at ? new Date(item.created_at).toLocaleDateString() : "";
    status = item.is_read ? 'read' : 'unread';
    statusLabel = item.is_read ? 'Read' : 'Unread';
  } else if (isParticipation) {
    Icon = CalendarDays;
    title = item.event?.name || "Event";
    time = item.event?.event_date ? new Date(item.event.event_date).toLocaleDateString() : "";
    status = 'completed';
    statusLabel = 'Attended';
  }
  
  const isPending = status === 'pending' || status === 'active' || status === 'unread';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
    >
      <div className={`p-2 rounded-lg ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{title}</p>
        <p className="text-xs text-gray-400">{time || 'Just now'}</p>
      </div>
      <span 
        className={`text-xs px-2.5 py-0.5 rounded-full ${
          isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {statusLabel}
      </span>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function StudentDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const profile = useSelector(selectStudentProfile);
  const attendanceState = useSelector(selectStudentAttendance);
  const resultsState = useSelector(selectStudentResults);
  const assignments = useSelector(selectStudentAssignments);
  const fees = useSelector(selectStudentFees);
  const bookIssues = useSelector(selectStudentBookIssues);
  const events = useSelector(selectStudentEvents);
  const participations = useSelector(selectStudentParticipations);
  const notifications = useSelector(selectStudentNotifications);
  const exams = useSelector(selectStudentExams);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const containerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    attendance: 0,
    gpa: 0,
  });

  // ─── Load Data ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchProfile()).unwrap(),
        dispatch(fetchAttendance()).unwrap(),
        dispatch(fetchResults()).unwrap(),
        dispatch(fetchAssignments()).unwrap(),
        dispatch(fetchFees()).unwrap(),
        dispatch(fetchBookIssues()).unwrap(),
        dispatch(fetchEvents()).unwrap(),
        dispatch(fetchParticipations()).unwrap(),
        dispatch(fetchNotifications()).unwrap(),
        dispatch(fetchExams()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setToast({ message: "Failed to load dashboard data", type: "error" });
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Refresh ──────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Dashboard refreshed", type: "info" });
  };

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

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
  }, [loading]);

  // ─── Extract Data ──────────────────────────────────────────────────
  const attendanceData = useMemo(() => {
    let data = [];
    if (Array.isArray(attendanceState)) {
      data = attendanceState;
    } else if (attendanceState?.results) {
      data = attendanceState.results;
    } else if (attendanceState?.data) {
      data = attendanceState.data;
    }
    return data;
  }, [attendanceState]);

  const resultsData = useMemo(() => {
    let data = [];
    if (Array.isArray(resultsState)) {
      data = resultsState;
    } else if (resultsState?.results) {
      data = resultsState.results;
    } else if (resultsState?.data) {
      data = resultsState.data;
    }
    return data;
  }, [resultsState]);

  // ─── Calculate Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    // ─── Attendance ────────────────────────────────────────────────
    const totalDays = attendanceData.length || 0;
    const presentDays = attendanceData.filter(a => 
      a.status === 'present' || a.status === 'Present'
    ).length || 0;
    const absentDays = attendanceData.filter(a => 
      a.status === 'absent' || a.status === 'Absent'
    ).length || 0;
    const lateDays = attendanceData.filter(a => 
      a.status === 'late' || a.status === 'Late'
    ).length || 0;
    const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Monthly data with status
    const monthlyMap = {};
    attendanceData.forEach(a => {
      if (a.date) {
        const month = new Date(a.date).toLocaleString('default', { month: 'short' });
        if (!monthlyMap[month]) {
          monthlyMap[month] = { present: 0, absent: 0, late: 0, total: 0 };
        }
        monthlyMap[month].total++;
        const status = a.status?.toLowerCase() || 'present';
        if (status === 'present') monthlyMap[month].present++;
        else if (status === 'absent') monthlyMap[month].absent++;
        else if (status === 'late') monthlyMap[month].late++;
      }
    });
    
    const monthlyData = Object.entries(monthlyMap).map(([month, d]) => {
      const percentage = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
      let status = 'present';
      if (percentage < 50) status = 'absent';
      else if (percentage < 75) status = 'late';
      return {
        month,
        percentage,
        status,
        present: d.present,
        absent: d.absent,
        late: d.late,
        total: d.total,
      };
    });

    // ─── Results ────────────────────────────────────────────────────
    const subjects = resultsData.map(r => ({
      name: r.exam?.name || r.exam_name || r.subject_name || "Exam",
      marks: r.marks_obtained || 0,
      total_marks: r.exam?.total_marks || r.total_marks || 100,
    }));
    const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
    const totalPossible = subjects.reduce((sum, s) => sum + s.total_marks, 0);
    const gpa = totalPossible > 0 ? Number(((totalMarks / totalPossible) * 4).toFixed(2)) : 0;

    // ─── Assignments ────────────────────────────────────────────────
    const assignmentList = Array.isArray(assignments) ? assignments : [];
    const submittedCount = assignmentList.filter(a => 
      a.status === 'submitted' || a.status === 'graded' || a.status === 'completed'
    ).length;
    const pendingCount = assignmentList.filter(a => 
      a.status === 'pending' || a.status === 'active' || !a.status
    ).length;

    // ─── Fees ──────────────────────────────────────────────────────
    const feeList = Array.isArray(fees) ? fees : [];
    const paidFees = feeList.filter(f => f.status === 'paid' || f.status === 'Paid').length;
    const totalFees = feeList.length;
    const totalFeeAmount = feeList.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);
    const paidFeeAmount = feeList.filter(f => f.status === 'paid' || f.status === 'Paid')
      .reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0);

    // ─── Books ──────────────────────────────────────────────────────
    const bookList = Array.isArray(bookIssues) ? bookIssues : [];
    const issuedBooks = bookList.filter(b => b.status === 'issued' || b.status === 'Issued').length;
    const overdueBooks = bookList.filter(b => {
      if (b.status !== 'issued' && b.status !== 'Issued') return false;
      return new Date(b.due_date) < new Date();
    }).length;

    // ─── Events ─────────────────────────────────────────────────────
    const participationList = Array.isArray(participations) ? participations : [];
    const notificationList = Array.isArray(notifications) ? notifications : [];

    return {
      attendancePercent,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      monthlyData,
      subjects,
      gpa,
      totalResults: subjects.length,
      submittedAssignments: submittedCount,
      pendingAssignments: pendingCount,
      totalFees,
      paidFees,
      unpaidFees: totalFees - paidFees,
      totalFeeAmount,
      paidFeeAmount,
      totalBooks: bookList.length,
      issuedBooks,
      overdueBooks,
      eventsAttended: participationList.length,
      unreadNotifications: notificationList.filter(n => !n.is_read).length,
    };
  }, [attendanceData, resultsData, assignments, fees, bookIssues, participations, notifications]);

  // ─── Get student info ──────────────────────────────────────────────
  const studentName = getUserName(profile) || "Student";
  const firstName = studentName.split(' ')[0] || "Student";
  const classDisplay = getClassName(profile) || "Class";
  const parentName = getParentName(profile);

  // ─── Recent Activity ──────────────────────────────────────────────
  const recentItems = useMemo(() => {
    const items = [];
    
    const assignmentList = Array.isArray(assignments) ? assignments : [];
    assignmentList.forEach(a => {
      items.push({ ...a, _type: 'assignment' });
    });
    
    const notificationList = Array.isArray(notifications) ? notifications : [];
    notificationList.forEach(n => {
      items.push({ ...n, _type: 'notification' });
    });
    
    const participationList = Array.isArray(participations) ? participations : [];
    participationList.forEach(p => {
      items.push({ ...p, _type: 'participation' });
    });
    
    items.sort((a, b) => {
      const dateA = a.created_at || a.due_date || a.event?.event_date || '';
      const dateB = b.created_at || b.due_date || b.event?.event_date || '';
      return new Date(dateB) - new Date(dateA);
    });
    
    return items.slice(0, 5);
  }, [assignments, notifications, participations]);

  // ─── Animate Stats ────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    
    if (stats.attendancePercent) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stats.attendancePercent,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          setAnimatedStats(prev => ({ ...prev, attendance: Math.round(obj.val) }));
        }
      });
    }
    
    if (stats.gpa) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: stats.gpa,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          setAnimatedStats(prev => ({ ...prev, gpa: Number(obj.val).toFixed(2) }));
        }
      });
    }
  }, [loading, stats.attendancePercent, stats.gpa]);

  // ─── Quick Actions ──────────────────────────────────────────────
  const quickActions = [
    { icon: BookOpen, label: 'My Classes', color: 'indigo', path: '/student/timetable' },
    { icon: CalendarDays, label: 'Timetable', color: 'purple', path: '/student/timetable' },
    { icon: FileText, label: 'Submissions', color: 'amber', path: '/student/submissions' },
    { icon: Award, label: 'Report Card', color: 'emerald', path: '/student/report-card' },
    { icon: Wallet, label: 'Fees', color: 'blue', path: '/student/fees' },
    { icon: Library, label: 'Library', color: 'rose', path: '/student/library' },
  ];

  // ─── Loading State ──────────────────────────────────────────────
  if (loading && !profile) {
    return <DashboardSkeleton />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ──────────────────────────────────────────── */}
        <PageHeader
          title="Dashboard"
          subtitle={`Welcome back, ${firstName}! Here's your academic overview`}
          breadcrumbs={["Student", "Dashboard"]}
          bgColor="bg-indigo-50"
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              {parentName && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                  <Users className="h-3.5 w-3.5" />
                  Parent: {parentName}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                <School className="h-3.5 w-3.5" />
                {classDisplay}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          }
        />

        {/* ─── Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Attendance"
            value={`${animatedStats.attendance || stats.attendancePercent}%`}
            subtitle={`${stats.presentDays}/${stats.totalDays} days`}
            icon={Activity}
            color="indigo"
            delay={0.05}
            trend={stats.attendancePercent > 75 ? 5 : -3}
            onClick={() => navigate('/student/attendance')}
          />
          <StatCard
            title="GPA"
            value={animatedStats.gpa || stats.gpa || '0.00'}
            subtitle={`${stats.totalResults} subjects`}
            icon={GraduationCap}
            color="emerald"
            delay={0.1}
            trend={stats.gpa > 3.2 ? 8 : -2}
            onClick={() => navigate('/student/report-card')}
          />
          <StatCard
            title="Assignments"
            value={`${stats.submittedAssignments}/${stats.submittedAssignments + stats.pendingAssignments}`}
            subtitle={stats.pendingAssignments > 0 ? `${stats.pendingAssignments} pending` : 'All done 🎉'}
            icon={FileText}
            color="amber"
            delay={0.15}
            trend={stats.pendingAssignments === 0 ? 10 : -5}
            onClick={() => navigate('/student/assignments')}
          />
          <StatCard
            title="Fees"
            value={`${stats.paidFees}/${stats.totalFees}`}
            subtitle={stats.unpaidFees > 0 ? `${stats.unpaidFees} pending` : 'All paid ✅'}
            icon={Wallet}
            color="blue"
            delay={0.2}
            trend={stats.unpaidFees === 0 ? 10 : -5}
            onClick={() => navigate('/student/fees')}
          />
        </div>

        {/* ─── Charts Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Attendance Chart - 2 columns */}
          <div className="lg:col-span-2 animate-section bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-800">Attendance Overview</h3>
                <p className="text-xs text-gray-400">Monthly attendance breakdown</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {stats.totalDays} days
                </span>
              </div>
            </div>
            <EnhancedAttendanceChart 
              data={stats.monthlyData || []}
              totalDays={stats.totalDays || 0}
              presentDays={stats.presentDays || 0}
              absentDays={stats.absentDays || 0}
              lateDays={stats.lateDays || 0}
            />
          </div>

          {/* Quick Overview - 1 column */}
          <div className="animate-section bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Quick Overview</p>
              <span className="text-xs text-gray-400">Current status</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Books Issued</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.issuedBooks}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Overdue Books</span>
                </div>
                <span className={`text-sm font-semibold ${stats.overdueBooks > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {stats.overdueBooks}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Events Attended</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{stats.eventsAttended}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Fee Balance</span>
                </div>
                <span className={`text-sm font-semibold ${stats.unpaidFees > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  PKR {(stats.totalFeeAmount - stats.paidFeeAmount).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-gray-600">Unread</span>
                </div>
                <span className="text-sm font-semibold text-indigo-700">
                  {stats.unreadNotifications}
                </span>
              </div>

              {parentName && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-gray-600">Parent</span>
                  </div>
                  <span className="text-sm font-medium text-indigo-700 truncate max-w-[120px]">
                    {parentName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Grade Chart & Recent Activity ────────────────────────── */}
        <div className="animate-section grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <GradeChart subjects={stats.subjects || []} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Recent Activity</p>
                <p className="text-xs text-gray-400">Latest updates</p>
              </div>
              {recentItems.length > 0 && (
                <span className="text-xs text-gray-400">{recentItems.length} items</span>
              )}
            </div>
            <div className="space-y-3">
              {recentItems.length > 0 ? (
                recentItems.map((item, index) => (
                  <RecentActivityItem key={index} item={item} index={index} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Quick Actions ────────────────────────────────────────── */}
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
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </motion.div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-gray-400 py-4 border-t border-gray-200"
        >
          <p>© 2024 Smart School Management System • Student Dashboard</p>
        </motion.div>
      </div>
    </div>
  );
}