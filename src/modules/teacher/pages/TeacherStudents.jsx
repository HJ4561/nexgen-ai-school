// src/modules/teacher/pages/TeacherStudents.jsx

/**
 * ============================================
 * TEACHER STUDENTS - COMPLETE (UPDATED)
 * ============================================
 * 
 * Purpose: View and manage students
 * Used by: Teacher module routes
 * 
 * Features:
 * - View student list with real API data
 * - Filter by class and section
 * - Search students
 * - View student details in modal
 * - Student statistics cards
 * - Card and Table view modes
 * - Responsive design
 * - GSAP animations
 * - Framer Motion transitions
 * - Toast notifications
 * - Updated to use new API name fields (user_name, class_name, etc.)
 * - Proper email display from API
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  User,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  UserPlus,
  GraduationCap,
  BookOpen,
  MapPin,
  CalendarDays,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchStudents,
  fetchStudentDetails,
  fetchTeacherClasses,
} from "../store/teacherThunks";

import {
  selectTeacherStudents,
  selectTeacherClasses,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const getInitials = (name) => {
  if (!name) return "S";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getRandomColor = (id) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-pink-100 text-pink-700",
  ];
  return colors[id % colors.length] || colors[0];
};

const getStatusBadge = (status) => {
  const statusMap = {
    active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    inactive: { label: "Inactive", color: "bg-gray-100 text-gray-700 border-gray-200" },
    suspended: { label: "Suspended", color: "bg-rose-100 text-rose-700 border-rose-200" },
    graduated: { label: "Graduated", color: "bg-blue-100 text-blue-700 border-blue-200" },
  };
  const config = statusMap[status] || statusMap.active;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

// Helper to get student email from various possible locations
const getStudentEmail = (student) => {
  if (!student) return "—";
  // Check all possible email locations
  return student.email || 
         student.user?.email || 
         student.user_data?.email || 
         student.user_email ||
         "—";
};

// Helper to get student name from various possible locations
const getStudentName = (student) => {
  if (!student) return "Unknown";
  return student.user_name || 
         student.name || 
         student.user?.name || 
         student.user_data?.name || 
         "Unknown";
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading, trend }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
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
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  );
};

// ─── Student Detail Modal ──────────────────────────────────────────────

const StudentDetailModal = ({ isOpen, student, onClose, loading }) => {
  if (!isOpen || !student) return null;

  const studentName = getStudentName(student);
  const studentEmail = getStudentEmail(student);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
                {getInitials(studentName)}
              </div>
              <div>
                <p className="text-xs text-white/80">Student Details</p>
                <h3 className="text-base sm:text-lg font-bold">{studentName}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(student.status || student.is_active ? "active" : "inactive")}
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
              {student.class_name || student.class_obj?.name || "No Class"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-800">
                  {studentEmail}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm text-gray-800">{student.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="text-sm text-gray-800">{formatDate(student.dob)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Admission</p>
                <p className="text-sm text-gray-800">
                  {student.admission_no || "—"} • {formatDate(student.admission_date)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Class & Section</p>
                <p className="text-sm text-gray-800">
                  {student.class_name || student.class_obj?.name || "—"}
                  {student.section_name || student.section?.name ? ` - ${student.section_name || student.section?.name}` : ""}
                </p>
              </div>
            </div>
            {student.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm text-gray-800">{student.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherStudents() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const students = useSelector(selectTeacherStudents);
  const classes = useSelector(selectTeacherClasses);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

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

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching students data...');
      
      await Promise.all([
        dispatch(fetchStudents()),
        dispatch(fetchTeacherClasses()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All students data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load students. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Students loaded:', students?.length || 0);
    console.log('📊 Classes loaded:', classes?.length || 0);
    // Log first student to see structure
    if (students && students.length > 0) {
      console.log('📋 Sample student data:', students[0]);
    }
  }, [students, classes]);

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

  const filteredStudents = useMemo(() => {
    let filtered = Array.isArray(students) ? [...students] : [];
    
    console.log('📊 Filtering students - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s => {
        const name = getStudentName(s).toLowerCase();
        const email = getStudentEmail(s).toLowerCase();
        const admission = (s.admission_no || "").toLowerCase();
        const phone = (s.phone || "").toLowerCase();
        const className = (s.class_name || s.class_obj?.name || "").toLowerCase();
        
        return name.includes(search) ||
               email.includes(search) ||
               admission.includes(search) ||
               phone.includes(search) ||
               className.includes(search);
      });
    }
    
    if (filterClass) {
      filtered = filtered.filter(s => {
        const classId = s.class_obj || s.class_id;
        return String(classId) === String(filterClass);
      });
    }

    console.log('📊 Filtered students count:', filtered.length);
    return filtered;
  }, [students, searchTerm, filterClass]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const studentsArray = Array.isArray(students) ? students : [];
    
    const byClass = studentsArray.reduce((acc, s) => {
      const className = s.class_name || s.class_obj?.name || "Unassigned";
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {});

    const active = studentsArray.filter(s => s.status === "active" || s.is_active !== false).length;
    const inactive = studentsArray.filter(s => s.status === "inactive" || s.is_active === false).length;
    const withEmail = studentsArray.filter(s => getStudentEmail(s) !== "—").length;

    return {
      total: studentsArray.length,
      active,
      inactive,
      withEmail,
      byClass,
    };
  }, [students]);

  const hasActiveFilters = searchTerm || filterClass;

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterClass("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Students"
        subtitle="View and manage your students"
        breadcrumbs={["Teacher", "Students"]}
        bgColor="bg-blue-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={Users}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          icon={AlertCircle}
          color="red"
          isLoading={loading}
        />
        <StatCard
          title="With Email"
          value={stats.withEmail}
          icon={Mail}
          color="purple"
          isLoading={loading}
          subtitle={`${stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}% of students`}
        />
      </div>

      {/* ─── Class Distribution ──────────────────────────────────────── */}
      {Object.keys(stats.byClass).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {Object.entries(stats.byClass).map(([className, count]) => (
            <div
              key={className}
              className="bg-white rounded-xl shadow-sm p-3 text-center border border-gray-100 hover:shadow-md transition-all"
            >
              <p className="text-lg font-bold text-blue-600">{count}</p>
              <p className="text-[10px] text-gray-500 truncate">{className}</p>
            </div>
          ))}
        </div>
      )}

      {/* ─── Premium Filter Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, admission number..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
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
                  {(filterClass ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterClass("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterClass === ""
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All Classes
                      </button>
                      {classes.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setFilterClass(cls.id)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterClass === String(cls.id)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {cls.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Stats</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">{filteredStudents.length}</p>
                        <p className="text-[10px] text-gray-500">Total</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">
                          {filteredStudents.filter(s => s.status === "active" || s.is_active !== false).length}
                        </p>
                        <p className="text-[10px] text-gray-500">Active</p>
                      </div>
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

      {/* ─── Results Summary Banner ──────────────────────────────────── */}
      {filteredStudents.length > 0 && (
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
                <p className="text-sm font-medium text-gray-800">Students Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredStudents.length} students • 
                  <span className="text-emerald-600 ml-1">{stats.active} active</span> •
                  <span className="text-gray-500 ml-1">{stats.inactive} inactive</span> •
                  <span className="text-blue-600 ml-1">{Object.keys(stats.byClass).length} classes</span> •
                  <span className="text-purple-600 ml-1">{stats.withEmail} with email</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {filteredStudents.length} Total
              </span>
              {filterClass && classes.find(c => String(c.id) === String(filterClass)) && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {classes.find(c => String(c.id) === String(filterClass))?.name}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Students List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching students found" : "No students available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "There are no students assigned to you at the moment."}
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
      ) : viewMode === "card" ? (
        // ─── Card View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((student) => {
            const isActive = student.status === "active" || student.is_active !== false;
            const colorClass = getRandomColor(student.id || 0);
            const studentName = getStudentName(student);
            const studentEmail = getStudentEmail(student);
            
            return (
              <motion.div
                key={student.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(studentName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {studentName}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {student.class_name || student.class_obj?.name || "No Class"}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(isActive ? "active" : "inactive")}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{student.phone || "—"}</span>
                    </div>
                    {student.admission_no && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Admission: {student.admission_no}</span>
                      </div>
                    )}
                    {student.section_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Section: {student.section_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // ─── Table View ──────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Admission No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((student) => {
                  const isActive = student.status === "active" || student.is_active !== false;
                  const studentName = getStudentName(student);
                  const studentEmail = getStudentEmail(student);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(student.id || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{studentName}</p>
                            {student.section_name && (
                              <p className="text-xs text-gray-500">Section {student.section_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[160px]">{studentEmail}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{student.admission_no || "—"}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{student.class_name || student.class_obj?.name || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(isActive ? "active" : "inactive")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredStudents.length} students • 
              <span className="text-emerald-600 ml-1">{stats.active} active</span> •
              <span className="text-gray-500 ml-1">{stats.inactive} inactive</span> •
              <span className="text-purple-600 ml-1">{stats.withEmail} with email</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredStudents.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)} of {filteredStudents.length} students
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • Students Module</p>
        <p className="mt-1">
          {filteredStudents.length} students • 
          {filterClass ? ` Class: ${classes.find(c => String(c.id) === String(filterClass))?.name || "..."}` : " All classes"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Student Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedStudent && (
          <StudentDetailModal
            isOpen={isDetailOpen}
            student={selectedStudent}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedStudent(null);
            }}
            loading={loading}
          />
        )}
      </AnimatePresence>

    </div>
  );
}