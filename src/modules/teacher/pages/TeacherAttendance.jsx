// src/modules/teacher/pages/TeacherAttendance.jsx

/**
 * ============================================
 * TEACHER ATTENDANCE - COMPLETE (UPDATED)
 * ============================================
 * 
 * Purpose: Take and manage attendance for classes
 * Features:
 * - Full screen responsive design
 * - Modern card-based UI
 * - Real-time status updates with animations
 * - Bulk actions with visual feedback
 * - Attendance statistics from API
 * - Date picker
 * - Search and filter functionality
 * - Export to CSV
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * - Updated to use new API field names (user_name, class_name, etc.)
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  ClipboardCheck,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Save,
  FileSpreadsheet,
  ClockAlert,
  UserRoundCheck,
  UserRoundX,
  UserRoundMinus,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchAttendance,
  fetchAttendanceStats,
  markAttendance,
  updateAttendance,
  fetchStudents,
  fetchTeacherClasses,
} from "../store/teacherThunks";

import {
  selectTeacherAttendance,
  selectTeacherAttendanceStats,
  selectTeacherStudents,
  selectTeacherClasses,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

// Helper to get student name from various possible locations
const getStudentName = (student) => {
  if (!student) return "Unknown";
  return student.user_name || student.name || student.user?.name || "Unknown";
};

// Helper to get student roll number
const getStudentRollNo = (student) => {
  if (!student) return "—";
  return student.roll_no || student.admission_no || "—";
};

const getStatusConfig = (status) => {
  const config = {
    present: {
      bg: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle,
      label: "Present",
    },
    absent: {
      bg: "bg-red-100 text-red-700",
      border: "border-red-200",
      icon: XCircle,
      label: "Absent",
    },
    late: {
      bg: "bg-amber-100 text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      label: "Late",
    },
    leave: {
      bg: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
      icon: ClockAlert,
      label: "Leave",
    },
  };
  return config[status?.toLowerCase()] || config.present;
};

const StatusBadge = ({ status, size = "sm" }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${sizeClasses}`}>
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {config.label}
    </span>
  );
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
      transition={{ duration: 0.3 }}
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

// ─── Main Component ────────────────────────────────────────────────────

export default function TeacherAttendance() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const attendance = useSelector(selectTeacherAttendance);
  const attendanceStats = useSelector(selectTeacherAttendanceStats);
  const students = useSelector(selectTeacherStudents);
  const classes = useSelector(selectTeacherClasses);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ─────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [attendanceStatuses, setAttendanceStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ─── Computed Values ─────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => {
        const name = getStudentName(s).toLowerCase();
        const rollNo = getStudentRollNo(s).toLowerCase();
        return name.includes(term) || rollNo.includes(term);
      });
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(s => 
        (attendanceStatuses[s.id] || 'present') === filterStatus
      );
    }
    
    return filtered;
  }, [students, searchTerm, filterStatus, attendanceStatuses]);

  // ─── Stats from Attendance Data ─────────────────────────────────────

  const stats = useMemo(() => {
    const attendanceArray = Array.isArray(attendance) ? attendance : [];
    
    console.log('📊 Raw attendance data:', attendanceArray);
    console.log('📊 Selected date:', selectedDate);
    
    const filteredAttendance = attendanceArray.filter(a => {
      if (a.date) {
        return a.date === selectedDate;
      }
      return false;
    });
    
    console.log('📊 Filtered attendance for date:', filteredAttendance);
    
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(a => a.status === 'present').length;
    const absent = filteredAttendance.filter(a => a.status === 'absent').length;
    const late = filteredAttendance.filter(a => a.status === 'late').length;
    const leave = filteredAttendance.filter(a => a.status === 'leave').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    console.log('📊 Calculated Stats:', { total, present, absent, late, leave, percentage });
    
    return {
      total,
      present,
      absent,
      late,
      leave,
      percentage,
    };
  }, [attendance, selectedDate]);

  const hasActiveFilters = selectedClass || selectedSection || searchTerm || filterStatus !== "all";

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAttendanceData = useCallback(async () => {
    const params = { date: selectedDate };
    if (selectedClass) params.class_id = selectedClass;
    if (selectedSection) params.section_id = selectedSection;
    
    console.log('📤 Fetching attendance with params:', params);
    const result = await dispatch(fetchAttendance(params));
    console.log('📥 Attendance fetch result:', result);
    
    if (students.length > 0) {
      const firstStudent = students[0];
      const monthStr = selectedDate.slice(0, 7);
      await dispatch(fetchAttendanceStats({ 
        student_id: firstStudent.id, 
        month: monthStr 
      }));
    }
  }, [dispatch, selectedDate, selectedClass, selectedSection, students]);

  const fetchStudentsData = useCallback(async () => {
    if (!selectedClass) {
      setAttendanceStatuses({});
      return;
    }
    setLoadingStudents(true);
    const result = await dispatch(fetchStudents({ class_id: selectedClass }));
    console.log('📥 Students fetch result:', result);
    setLoadingStudents(false);
    return result;
  }, [dispatch, selectedClass]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchAttendanceData(),
        dispatch(fetchTeacherClasses()),
      ]);
    };
    fetchData();
  }, [dispatch, fetchAttendanceData]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  // ─── Initialize Attendance Statuses ─────────────────────────────────

  useEffect(() => {
    if (students.length > 0 && attendance.length > 0) {
      const statusMap = {};
      students.forEach(s => {
        const existing = attendance.find(a => 
          a.student === s.id && a.date === selectedDate
        );
        statusMap[s.id] = existing?.status || 'present';
      });
      setAttendanceStatuses(statusMap);
      console.log('📊 Attendance statuses initialized:', statusMap);
    } else if (students.length > 0) {
      const statusMap = {};
      students.forEach(s => {
        statusMap[s.id] = 'present';
      });
      setAttendanceStatuses(statusMap);
    }
  }, [students, attendance, selectedDate]);

  // ─── GSAP Animations ─────────────────────────────────────────────────

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

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const newStatuses = {};
    filteredStudents.forEach(s => {
      newStatuses[s.id] = status;
    });
    setAttendanceStatuses(prev => ({
      ...prev,
      ...newStatuses,
    }));
    toast.success(`All students marked as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }

    setSaving(true);
    try {
      const promises = filteredStudents.map(async (student) => {
        const status = attendanceStatuses[student.id] || 'present';
        const existing = attendance.find(a => 
          a.student === student.id && a.date === selectedDate
        );
        
        const data = {
          student: student.id,
          status: status,
          date: selectedDate,
        };

        if (existing) {
          await dispatch(updateAttendance({ id: existing.id, data })).unwrap();
        } else {
          await dispatch(markAttendance(data)).unwrap();
        }
      });

      await Promise.all(promises);
      await fetchAttendanceData();
      
      toast.success(`Attendance saved for ${filteredStudents.length} students`);
    } catch (err) {
      toast.error(err || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchAttendanceData(),
      fetchStudentsData(),
    ]);
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const handleDateChange = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleExport = () => {
    if (students.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ['Student Name', 'Roll No', 'Status', 'Date'];
    const rows = students.map(s => [
      getStudentName(s),
      getStudentRollNo(s),
      attendanceStatuses[s.id] || 'present',
      selectedDate,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Attendance exported");
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSearchTerm("");
    setFilterStatus("all");
    setShowFilters(false);
  };

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !attendance.length && !students.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading attendance...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Attendance"
        subtitle="Take and manage class attendance"
        breadcrumbs={["Teacher", "Attendance"]}
        bgColor="bg-blue-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={goToToday}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Today
            </button>
            <button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              disabled={students.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4" />
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

      {/* ─── Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={UsersRound}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Present"
          value={stats.present}
          subtitle={`${stats.percentage}%`}
          icon={UserRoundCheck}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Absent"
          value={stats.absent}
          icon={UserRoundX}
          color="red"
          isLoading={loading}
        />
        <StatCard
          title="Late"
          value={stats.late}
          icon={UserRoundMinus}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Leave"
          value={stats.leave}
          icon={ClockAlert}
          color="purple"
          isLoading={loading}
        />
        <div className="hidden lg:flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          {loading ? (
            <div className="w-20 h-20 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
          ) : (
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.percentage}%</p>
              <p className="text-xs text-gray-400">Attendance</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Premium Filter Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[42px]"
              />
              <button
                onClick={() => handleDateChange(1)}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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
                  {(selectedClass ? 1 : 0) + (selectedSection ? 1 : 0) + (searchTerm ? 1 : 0) + (filterStatus !== "all" ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Classes ({classes.length})</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Section</label>
                    <div className="mt-2">
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Sections</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                      </select>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "all"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus("present")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "present"
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setFilterStatus("absent")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "absent"
                            ? "bg-red-50 text-red-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => setFilterStatus("late")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "late"
                            ? "bg-amber-50 text-amber-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setFilterStatus("leave")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "leave"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Leave
                      </button>
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
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Attendance Summary Banner ──────────────────────────────── */}
      {students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Attendance Overview</p>
                <p className="text-xs text-gray-500">
                  {students.length} students • 
                  <span className="text-emerald-600 ml-1">{stats.present} present</span> •
                  <span className="text-red-600 ml-1">{stats.absent} absent</span> •
                  <span className="text-amber-600 ml-1">{stats.late} late</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {selectedDate}
              </span>
              {selectedClass && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {classes.find(c => c.id === selectedClass)?.name || selectedClass}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Students Grid ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Students</h3>
              <p className="text-xs text-gray-500">
                {filteredStudents.length} of {students.length} students shown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loadingStudents && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            <span className="text-xs text-gray-400">
              {selectedDate}
            </span>
          </div>
        </div>

        {/* Content */}
        {loadingStudents ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No students found</p>
            <p className="text-sm text-gray-400 mt-1">Select a class to view students</p>
            {!selectedClass && (
              <button
                onClick={() => {
                  if (classes.length > 0) {
                    setSelectedClass(classes[0].id);
                  }
                }}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select First Class
              </button>
            )}
          </div>
        ) : (
          // ─── Grid View ──────────────────────────────────────────────
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 sm:p-6">
            {filteredStudents.map((student) => {
              const status = attendanceStatuses[student.id] || 'present';
              const studentName = getStudentName(student);
              const rollNo = getStudentRollNo(student);
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-gray-50/50 rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                    status === 'present' ? 'border-emerald-200' :
                    status === 'absent' ? 'border-red-200' :
                    status === 'late' ? 'border-amber-200' :
                    'border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {studentName.charAt(0) || "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {studentName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Roll: {rollNo}
                      </p>
                      <div className="mt-1.5">
                        <StatusBadge status={status} size="lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        status === 'present'
                          ? 'bg-emerald-50 text-emerald-600 ring-2 ring-offset-2 ring-emerald-200'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                      title="Present"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        status === 'absent'
                          ? 'bg-red-50 text-red-600 ring-2 ring-offset-2 ring-red-200'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                      title="Absent"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        status === 'late'
                          ? 'bg-amber-50 text-amber-600 ring-2 ring-offset-2 ring-amber-200'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                      title="Late"
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'leave')}
                      className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                        status === 'leave'
                          ? 'bg-blue-50 text-blue-600 ring-2 ring-offset-2 ring-blue-200'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                      }`}
                      title="Leave"
                    >
                      <ClockAlert className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-500">
            {filteredStudents.length} students • 
            <span className="text-emerald-600 ml-1">{stats.present} present</span> •
            <span className="text-red-600 ml-1">{stats.absent} absent</span> •
            <span className="text-amber-600 ml-1">{stats.late} late</span>
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || filteredStudents.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      
    </div>
  );
}