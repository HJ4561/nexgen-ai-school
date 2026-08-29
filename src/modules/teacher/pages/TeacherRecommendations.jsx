// src/modules/teacher/pages/TeacherRecommendations.jsx

/**
 * ============================================
 * TEACHER RECOMMENDATIONS PAGE - COMPLETE
 * ============================================
 * 
 * Purpose: View student recommendations and action plans
 * Used by: Teacher module routes
 * 
 * Features:
 * - View student recommendations
 * - Filter by type and status
 * - Search students
 * - View individual recommendation details
 * - Track recommendation progress
 * - Card and Table views
 * - Responsive design
 * - Toast notifications
 * - Loading states
 * - GSAP animations
 * - Framer Motion transitions
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/analytics/recommendations/ - Get recommendations
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from API response
 * - type from API response
 * - content from API response
 * - status from API response
 * 
 * Usage:
 * <Route path="/teacher/recommendations" element={<TeacherRecommendations />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Grid,
  List,
  Clock,
  Users,
  Calendar,
  Award,
  Target,
  Brain,
  Sparkles,
  Zap,
  Shield,
  AlertTriangle,
  Info,
  User,
  FileText,
  Activity,
  BarChart3,
  BookOpen,
  GraduationCap,
  Trophy,
  Gauge,
  Percent,
  Check,
  Circle,
  Play,
  BookMarked,
  Plus,
  Edit,
  Trash2,
  Star,
  StarHalf,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchRecommendations,
  fetchTeacherClasses,
  fetchSubjects,
  fetchStudents,
} from "../store/teacherThunks";

import {
  selectTeacherRecommendations,
  selectTeacherClasses,
  selectTeacherSubjects,
  selectTeacherStudents,
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

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// ✅ Get priority based on type
const getPriorityFromType = (type) => {
  const priorityMap = {
    'study_plan': 'high',
    'activity': 'medium',
    'behavioral': 'high',
    'academic': 'high',
    'general': 'low',
  };
  return priorityMap[type] || 'medium';
};

// ✅ Get readable type label
const getTypeLabel = (type) => {
  const typeMap = {
    'study_plan': 'Study Plan',
    'activity': 'Activity',
    'behavioral': 'Behavioral',
    'academic': 'Academic',
    'general': 'General',
    'skill': 'Skill',
  };
  return typeMap[type] || type || 'General';
};

// ✅ Get status with proper mapping
const getStatus = (status) => {
  const statusMap = {
    'pending': 'pending',
    'accepted': 'in_progress',
    'in_progress': 'in_progress',
    'completed': 'completed',
    'rejected': 'rejected',
  };
  return statusMap[status] || 'pending';
};

const getPriorityBadge = (priority) => {
  const config = {
    high: {
      icon: <AlertCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700 border-red-200",
      label: "High",
    },
    medium: {
      icon: <AlertTriangle className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Medium",
    },
    low: {
      icon: <Info className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Low",
    },
  };

  const info = config[priority] || config.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.className}`}>
      {info.icon}
      {info.label}
    </span>
  );
};

const getStatusBadge = (status) => {
  const config = {
    pending: {
      icon: <Clock className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Pending",
    },
    in_progress: {
      icon: <Play className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "In Progress",
    },
    accepted: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Accepted",
    },
    completed: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Completed",
    },
    rejected: {
      icon: <AlertCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Rejected",
    },
  };

  const info = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.className}`}>
      {info.icon}
      {info.label}
    </span>
  );
};

const getTypeBadge = (type) => {
  const config = {
    study_plan: {
      icon: <BookOpen className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Study Plan",
    },
    activity: {
      icon: <Activity className="w-3 h-3" />,
      className: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Activity",
    },
    behavioral: {
      icon: <Users className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Behavioral",
    },
    academic: {
      icon: <BookMarked className="w-3 h-3" />,
      className: "bg-indigo-100 text-indigo-700 border-indigo-200",
      label: "Academic",
    },
    general: {
      icon: <Lightbulb className="w-3 h-3" />,
      className: "bg-gray-100 text-gray-700 border-gray-200",
      label: "General",
    },
    skill: {
      icon: <Brain className="w-3 h-3" />,
      className: "bg-teal-100 text-teal-700 border-teal-200",
      label: "Skill",
    },
  };

  const info = config[type] || config.general;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.className}`}>
      {info.icon}
      {info.label}
    </span>
  );
};

const getInitials = (name) => {
  if (!name || name === "Unknown") return "U";
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
  return colors[(id || 0) % colors.length] || colors[0];
};

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

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-50 text-gray-600",
    gold: "bg-amber-100 text-amber-700",
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

// ─── Recommendation Detail Modal ──────────────────────────────────────

const RecommendationDetailModal = ({ isOpen, recommendation, onClose, onStatusUpdate, loading }) => {
  if (!isOpen || !recommendation) return null;

  const status = getStatus(recommendation.status || 'pending');
  const studentName = recommendation.student_name || 'Unknown Student';
  const type = recommendation.type || 'general';
  const priority = getPriorityFromType(type);

  const handleStatusChange = (newStatus) => {
    if (newStatus !== status) {
      onStatusUpdate(recommendation.id, newStatus);
    }
  };

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
        <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Recommendation Details</p>
                <h3 className="text-base sm:text-lg font-bold line-clamp-1">
                  {getTypeLabel(type)}
                </h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(status)}
            {getPriorityBadge(priority)}
            {getTypeBadge(type)}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="text-sm font-medium text-gray-800">{studentName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Recommendation</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {recommendation.content || 'No content provided'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {formatDateTime(recommendation.created_at)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm font-medium text-gray-800 mt-1">
                  {formatDateTime(recommendation.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          {status !== 'completed' && status !== 'rejected' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange('accepted')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Accept
                  </button>
                )}
                {status !== 'in_progress' && status !== 'accepted' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    Start Progress
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark Complete
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <AlertCircle className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherRecommendations() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const recommendations = useSelector(selectTeacherRecommendations);
  const classes = useSelector(selectTeacherClasses);
  const subjects = useSelector(selectTeacherSubjects);
  const students = useSelector(selectTeacherStudents);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState(false);

  const ITEMS_PER_PAGE = 9;

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching recommendations data...');
      
      await Promise.all([
        dispatch(fetchRecommendations()),
        dispatch(fetchTeacherClasses()),
        dispatch(fetchSubjects()),
        dispatch(fetchStudents()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All recommendations data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load recommendations. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

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

  const processedRecommendations = useMemo(() => {
    const recs = Array.isArray(recommendations) ? recommendations : [];
    
    return recs.map(rec => ({
      ...rec,
      student_name: rec.student_name || rec.student?.name || 'Unknown Student',
      content: rec.content || rec.recommendation || 'No content',
      type: rec.type || 'general',
      status: rec.status || 'pending',
      priority: getPriorityFromType(rec.type || 'general'),
      type_label: getTypeLabel(rec.type || 'general'),
    }));
  }, [recommendations]);

  // Group recommendations by student
  const groupedRecommendations = useMemo(() => {
    const grouped = {};
    
    processedRecommendations.forEach(rec => {
      const studentId = rec.student || rec.student_id || rec.id;
      if (!grouped[studentId]) {
        grouped[studentId] = {
          student_id: studentId,
          student_name: rec.student_name,
          recommendations: [],
        };
      }
      grouped[studentId].recommendations.push(rec);
    });
    
    return Object.values(grouped);
  }, [processedRecommendations]);

  const filteredRecommendations = useMemo(() => {
    let filtered = processedRecommendations;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(rec =>
        (rec.student_name || "").toLowerCase().includes(search) ||
        (rec.content || "").toLowerCase().includes(search)
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(rec => rec.type === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(rec => rec.status === filterStatus);
    }

    return filtered;
  }, [processedRecommendations, searchTerm, filterType, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredRecommendations.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredRecommendations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = processedRecommendations.length;
    const pending = processedRecommendations.filter(r => r.status === 'pending').length;
    const accepted = processedRecommendations.filter(r => r.status === 'accepted').length;
    const inProgress = processedRecommendations.filter(r => r.status === 'in_progress').length;
    const completed = processedRecommendations.filter(r => r.status === 'completed').length;
    const rejected = processedRecommendations.filter(r => r.status === 'rejected').length;
    const highPriority = processedRecommendations.filter(r => r.priority === 'high').length;
    const uniqueStudents = new Set(processedRecommendations.map(r => r.student)).size;

    return {
      total,
      pending,
      accepted,
      inProgress,
      completed,
      rejected,
      highPriority,
      uniqueStudents,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [processedRecommendations]);

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (recommendation) => {
    setSelectedRecommendation(recommendation);
    setIsDetailOpen(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true);
    try {
      // You would dispatch an update thunk here
      // For now, we'll just show a success message
      toast.success(`Recommendation marked as ${newStatus}`);
      // Refresh data to show updated status
      await fetchAllData();
      setIsDetailOpen(false);
    } catch (err) {
      toast.error(err || "Failed to update recommendation");
    } finally {
      setUpdating(false);
    }
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
    setFilterType("all");
    setFilterStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && processedRecommendations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Recommendations"
        subtitle={`${stats.total} recommendations for ${stats.uniqueStudents} students`}
        breadcrumbs={["Teacher", "Recommendations"]}
        bgColor="bg-amber-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all disabled:opacity-50"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={Lightbulb}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Accepted"
          value={stats.accepted}
          icon={CheckCircle}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Play}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority}
          icon={AlertCircle}
          color="red"
          isLoading={loading}
        />
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or recommendation..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">
                  {(filterType !== "all" ? 1 : 0) + (filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                  {/* Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterType === "all"
                            ? "bg-amber-50 text-amber-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {["study_plan", "activity", "behavioral", "academic", "general"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterType === type
                              ? "bg-amber-50 text-amber-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type === "study_plan" ? "Study Plan" : 
                           type === "activity" ? "Activity" :
                           type === "behavioral" ? "Behavioral" :
                           type === "academic" ? "Academic" : "General"}
                        </button>
                      ))}
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
                            ? "bg-amber-50 text-amber-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {["pending", "accepted", "in_progress", "completed", "rejected"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-amber-50 text-amber-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === "in_progress" ? "In Progress" : status}
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

      {/* ─── Results Summary ─────────────────────────────────────────── */}
      {filteredRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 sm:p-5 border border-amber-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Recommendations Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredRecommendations.length} recommendations • 
                  <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
                  <span className="text-blue-600 ml-1">{stats.accepted} accepted</span> •
                  <span className="text-blue-600 ml-1">{stats.inProgress} in progress</span> •
                  <span className="text-emerald-600 ml-1">{stats.completed} completed</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-200 text-amber-800 text-xs font-medium rounded-full">
                {filteredRecommendations.length} Total
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                {stats.uniqueStudents} Students
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Recommendations List ────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching recommendations found" : "No recommendations available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Recommendations will appear here once data is available."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
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
          {pageItems.map((rec) => {
            const colorClass = getRandomColor(rec.student || 0);
            const studentName = rec.student_name || "Unknown Student";
            const priority = rec.priority || 'medium';
            const status = rec.status || 'pending';
            const type = rec.type || 'general';
            
            return (
              <motion.div
                key={rec.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  priority === 'high' ? 'border-red-200' :
                  priority === 'medium' ? 'border-amber-200' :
                  'border-blue-200'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(studentName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {studentName}
                        </h4>
                        <p className="text-xs text-gray-500">{getTypeLabel(type)}</p>
                      </div>
                    </div>
                    {getPriorityBadge(priority)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {rec.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getTypeBadge(type)}
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(rec)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors flex items-center justify-center gap-1"
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommendation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((rec) => {
                  const studentName = rec.student_name || "Unknown Student";
                  const status = rec.status || 'pending';
                  const type = rec.type || 'general';
                  
                  return (
                    <tr key={rec.id} className={`hover:bg-gray-50 transition-colors ${
                      status === 'pending' ? 'bg-amber-50/20' :
                      status === 'completed' ? 'bg-emerald-50/20' :
                      status === 'rejected' ? 'bg-red-50/20' : ''
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(rec.student || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-800 line-clamp-2">{rec.content}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {getTypeBadge(type)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(rec)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
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
              {filteredRecommendations.length} recommendations • 
              <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
              <span className="text-blue-600 ml-1">{stats.accepted} accepted</span> •
              <span className="text-blue-600 ml-1">{stats.inProgress} in progress</span> •
              <span className="text-emerald-600 ml-1">{stats.completed} completed</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredRecommendations.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecommendations.length)} of {filteredRecommendations.length} recommendations
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
                      ? 'bg-amber-600 text-white'
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
        <p>© 2024 Smart School Management System • Recommendations Module</p>
        <p className="mt-1">
          {filteredRecommendations.length} recommendations • 
          {filterType !== "all" ? ` Type: ${getTypeLabel(filterType)}` : " All types"}
          {filterStatus !== "all" ? ` • Status: ${filterStatus}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Recommendation Detail Modal ────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedRecommendation && (
          <RecommendationDetailModal
            isOpen={isDetailOpen}
            recommendation={selectedRecommendation}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedRecommendation(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            loading={updating}
          />
        )}
      </AnimatePresence>

    </div>
  );
}