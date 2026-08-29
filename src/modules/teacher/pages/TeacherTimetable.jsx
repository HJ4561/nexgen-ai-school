// src/modules/teacher/pages/TeacherTimetable.jsx

/**
 * ============================================
 * TEACHER TIMETABLE - COMPLETE
 * ============================================
 * 
 * Purpose: View and manage class timetable
 * Used by: Teacher module routes
 * 
 * Features:
 * - View weekly timetable in grid format
 * - Filter by class and day
 * - Week navigation
 * - Export timetable
 * - Responsive design
 * - Full screen visibility
 * - GSAP animations
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/academics/timetable/ - Get timetable
 * - GET /api/academics/classes/ - Get classes
 * - GET /api/academics/rooms/ - Get rooms
 * - GET /api/academics/subjects/ - Get subjects
 * 
 * Usage:
 * <Route path="/teacher/timetable" element={<TeacherTimetable />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  BookOpen,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  AlertCircle,
  RefreshCw,
  Loader2,
  GraduationCap,
  CheckCircle,
  XCircle,
  Calendar,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Printer,
  FileText,
  Zap,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchTimetable,
  fetchTeacherClasses,
  fetchRooms,
  fetchSubjects,
} from "../store/teacherThunks";

import {
  selectTeacherTimetable,
  selectTeacherClasses,
  selectTeacherRooms,
  selectTeacherSubjects,
  selectTeacherLoading,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIME_SLOTS = [
  "08:00", "08:45", "09:30", "10:15", 
  "11:00", "11:45", "12:30", "13:15", 
  "14:00", "14:45", "15:30"
];

const DAY_COLORS = {
  Monday: "border-l-blue-500",
  Tuesday: "border-l-emerald-500",
  Wednesday: "border-l-amber-500",
  Thursday: "border-l-purple-500",
  Friday: "border-l-rose-500",
};

const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  rescheduled: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  try {
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  } catch {
    return "—";
  }
};

const getDayName = (day) => {
  if (!day) return "";
  const dayMap = {
    mon: "Monday",
    tue: "Tuesday",
    wed: "Wednesday",
    thu: "Thursday",
    fri: "Friday",
    sat: "Saturday",
    sun: "Sunday",
  };
  const normalized = day.toLowerCase().slice(0, 3);
  return dayMap[normalized] || day;
};

const getStatusBadge = (status) => {
  const config = STATUS_COLORS[status] || STATUS_COLORS.active;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${config}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Active"}
    </span>
  );
};

const getDayColor = (day) => {
  const colors = {
    Monday: "bg-blue-50 border-blue-200 text-blue-700",
    Tuesday: "bg-emerald-50 border-emerald-200 text-emerald-700",
    Wednesday: "bg-amber-50 border-amber-200 text-amber-700",
    Thursday: "bg-purple-50 border-purple-200 text-purple-700",
    Friday: "bg-rose-50 border-rose-200 text-rose-700",
  };
  return colors[day] || "bg-gray-50 border-gray-200 text-gray-700";
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          )}
          {subtitle && !isLoading && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colors[color] || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors[color] ? 'text-' + color + '-600' : 'text-gray-600'}`} />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherTimetable() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const timetable = useSelector(selectTeacherTimetable);
  const classes = useSelector(selectTeacherClasses);
  const rooms = useSelector(selectTeacherRooms);
  const subjects = useSelector(selectTeacherSubjects);
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching timetable data...');
      
      await Promise.all([
        dispatch(fetchTimetable()),
        dispatch(fetchTeacherClasses()),
        dispatch(fetchRooms()),
        dispatch(fetchSubjects()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All timetable data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load timetable. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Timetable entries loaded:', timetable?.length || 0);
    console.log('📊 Classes loaded:', classes?.length || 0);
    console.log('📊 Rooms loaded:', rooms?.length || 0);
    console.log('📊 Subjects loaded:', subjects?.length || 0);
  }, [timetable, classes, rooms, subjects]);

  // ─── GSAP Animations ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Computed Values ─────────────────────────────────────────────────

  const weekDates = useMemo(() => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay() + 1);
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeek]);

  const filteredTimetable = useMemo(() => {
    let filtered = Array.isArray(timetable) ? [...timetable] : [];
    
    console.log('📊 Filtering timetable - raw count:', filtered.length);

    if (selectedDay !== "all") {
      filtered = filtered.filter(t => {
        const day = getDayName(t.day).toLowerCase();
        return day === selectedDay.toLowerCase();
      });
    }

    if (selectedClass) {
      filtered = filtered.filter(t => {
        const classId = t.class_obj || t.class_obj_id;
        return String(classId) === String(selectedClass);
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.subject_name?.toLowerCase().includes(term) ||
        t.class_name?.toLowerCase().includes(term) ||
        t.teacher_name?.toLowerCase().includes(term) ||
        t.room_name?.toLowerCase().includes(term)
      );
    }

    console.log('📊 Filtered timetable count:', filtered.length);
    return filtered;
  }, [timetable, selectedDay, selectedClass, searchTerm]);

  // ─── Group by Day ────────────────────────────────────────────────────

  const timetableByDay = useMemo(() => {
    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = filteredTimetable.filter(t => {
        const dayName = getDayName(t.day);
        return dayName === day;
      });
    });
    return grouped;
  }, [filteredTimetable]);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = filteredTimetable.length;
    const daysWithClasses = Object.values(timetableByDay).filter(items => items.length > 0).length;
    const uniqueClasses = new Set(filteredTimetable.map(t => t.class_obj || t.class_obj_id)).size;
    const uniqueRooms = new Set(filteredTimetable.map(t => t.room || t.room_id)).size;
    
    return {
      total,
      daysWithClasses,
      uniqueClasses,
      uniqueRooms,
    };
  }, [filteredTimetable, timetableByDay]);

  // ─── Get Entry for Time Slot ────────────────────────────────────────

  const getEntryForSlot = (day, timeSlot) => {
    const entries = timetableByDay[day] || [];
    return entries.find(e => {
      const start = formatTime(e.start_time);
      return start === timeSlot;
    });
  };

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleWeekChange = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(todayName);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Timetable refreshed");
  };

  const handleExport = () => {
    if (filteredTimetable.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ['Day', 'Start Time', 'End Time', 'Class', 'Subject', 'Room', 'Teacher', 'Status'];
    const rows = filteredTimetable.map(t => [
      getDayName(t.day),
      formatTime(t.start_time),
      formatTime(t.end_time),
      t.class_name || t.class_obj?.name || '—',
      t.subject_name || t.subject?.name || '—',
      t.room_name || t.room?.name || '—',
      t.teacher_name || t.teacher?.name || '—',
      t.status || 'active',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable_${currentWeek.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Timetable exported");
  };

  const clearFilters = () => {
    setSelectedDay("all");
    setSelectedClass("");
    setSearchTerm("");
    setShowFilters(false);
  };

  const hasActiveFilters = selectedDay !== "all" || selectedClass || searchTerm;

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && timetable.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading timetable...</p>
        </div>
      </div>
    );
  }

  // ─── Animation Variants ──────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Timetable"
        subtitle="View and manage your class schedule"
        breadcrumbs={["Teacher", "Timetable"]}
        bgColor="bg-blue-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              disabled={filteredTimetable.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      {/* ─── Success/Error Messages ────────────────────────────────── */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ─── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Classes"
          value={stats.total}
          subtitle={`${filteredTimetable.length} entries`}
          icon={BookOpen}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Active Days"
          value={stats.daysWithClasses}
          subtitle={`of ${DAYS.length} days`}
          icon={Calendar}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Classes"
          value={stats.uniqueClasses}
          subtitle="Unique classes"
          icon={GraduationCap}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Rooms"
          value={stats.uniqueRooms}
          subtitle="Unique rooms"
          icon={MapPin}
          color="purple"
          isLoading={loading}
        />
      </div>

      {/* ─── Premium Filter Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search timetable by subject, class, teacher, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {(selectedDay !== "all" ? 1 : 0) + (selectedClass ? 1 : 0) + (searchTerm ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWeekChange(-1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
                {weekDates.length > 0 && (
                  `${weekDates[0].toLocaleDateString()} - ${weekDates[weekDates.length - 1].toLocaleDateString()}`
                )}
              </span>
              <button
                onClick={() => handleWeekChange(1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Day Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Day</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedDay("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          selectedDay === "all"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            selectedDay === day
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedClass("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          !selectedClass
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {Array.isArray(classes) && classes.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setSelectedClass(String(cls.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            String(selectedClass) === String(cls.id)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {cls.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Results Summary Banner ──────────────────────────────────── */}
      {filteredTimetable.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Timetable Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredTimetable.length} classes scheduled across {stats.daysWithClasses} days
                  {stats.uniqueClasses > 0 && ` • ${stats.uniqueClasses} unique classes`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {filteredTimetable.length} Classes
              </span>
              {selectedDay !== "all" && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {selectedDay}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Timetable ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredTimetable.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching timetable entries found" : "No timetable entries available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "There are no timetable entries available at the moment. Check back later for updates."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        // ─── Grid View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                    Time
                  </th>
                  {weekDates.map((date, index) => {
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <th key={index} className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isToday ? 'bg-blue-50' : ''}`}>
                        <div className="flex flex-col">
                          <span>{DAYS_SHORT[index]}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {date.getDate()}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {TIME_SLOTS.map((timeSlot) => (
                  <motion.tr
                    key={timeSlot}
                    variants={itemVariants}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-medium text-gray-600 whitespace-nowrap sticky left-0 bg-white">
                      {timeSlot}
                    </td>
                    {weekDates.map((date, index) => {
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                      const entry = getEntryForSlot(dayName, timeSlot);
                      const isToday = new Date().toDateString() === date.toDateString();
                      
                      return (
                        <td key={index} className={`px-4 py-3 ${isToday ? 'bg-blue-50/50' : ''}`}>
                          {entry ? (
                            <div className={`bg-white rounded-lg p-3 border-l-4 ${DAY_COLORS[dayName] || 'border-l-blue-500'} shadow-sm hover:shadow-md transition-shadow`}>
                              <p className="text-sm font-medium text-gray-800">
                                {entry.subject_name || entry.subject?.name || "Subject"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.class_name || entry.class_obj?.name || "Class"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {entry.room_name || entry.room?.name || "Room"}
                                </span>
                              </div>
                              {entry.status && (
                                <div className="mt-1">
                                  {getStatusBadge(entry.status)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredTimetable.length} entries • 
              <span className="text-blue-600 ml-1">{stats.daysWithClasses} active days</span> •
              <span className="text-emerald-600 ml-1">{stats.uniqueClasses} classes</span>
            </div>
            <div className="text-xs text-gray-400">
              Week of {currentWeek.toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      ) : (
        // ─── List View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-4 sm:p-6 space-y-4">
            {filteredTimetable.map((entry, index) => {
              const dayName = getDayName(entry.day);
              const dayColor = getDayColor(dayName);
              
              return (
                <motion.div
                  key={entry.id || index}
                  variants={itemVariants}
                  className={`bg-gray-50 rounded-xl p-4 border-l-4 ${DAY_COLORS[dayName] || 'border-l-blue-500'} hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dayColor}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {entry.subject_name || entry.subject?.name || "Subject"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dayName} • {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {entry.class_name || entry.class_obj?.name || "Class"}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {entry.room_name || entry.room?.name || "Room"}
                      </span>
                      {entry.status && getStatusBadge(entry.status)}
                    </div>
                  </div>
                  {entry.teacher_name && (
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {entry.teacher_name || entry.teacher?.name || "Teacher"}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredTimetable.length} entries • 
              <span className="text-blue-600 ml-1">{stats.daysWithClasses} active days</span>
            </div>
            <div className="text-xs text-gray-400">
              Week of {currentWeek.toLocaleDateString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • Timetable Module</p>
        <p className="mt-1">
          {filteredTimetable.length} entries displayed • 
          {selectedDay !== "all" ? ` Filtered by: ${selectedDay}` : " All days"}
          {selectedClass ? ` • Class: ${classes?.find(c => String(c.id) === String(selectedClass))?.name || selectedClass}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

    </div>
  );
}