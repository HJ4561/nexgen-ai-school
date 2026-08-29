// src/modules/teacher/pages/TeacherPredictions.jsx

/**
 * ============================================
 * TEACHER PREDICTIONS PAGE - COMPLETE
 * ============================================
 * 
 * Purpose: View student performance predictions and analytics
 * Used by: Teacher module routes
 * 
 * Features:
 * - View student performance predictions
 * - Risk analysis for students
 * - Performance trends and insights
 * - Filter by prediction type
 * - Search students
 * - View individual student prediction details
 * - Card and Table views
 * - Responsive design
 * - Toast notifications
 * - Loading states
 * - GSAP animations
 * - Framer Motion transitions
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/analytics/predictions/ - Get predictions
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from API response
 * - prediction_type, value, risk_score from API
 * 
 * Usage:
 * <Route path="/teacher/predictions" element={<TeacherPredictions />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
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
  BookOpen,
  Calendar,
  Award,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  BookMarked,
  GraduationCap,
  Trophy,
  Gauge,
  Percent,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchPredictions,
  fetchTeacherClasses,
  fetchSubjects,
  fetchStudents,
} from "../store/teacherThunks";

import {
  selectTeacherPredictions,
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

// ✅ Get risk level from prediction type and value
const getRiskLevel = (prediction) => {
  // If it's a risk prediction, use the value
  if (prediction.prediction_type === 'risk') {
    const value = prediction.value?.toLowerCase() || '';
    if (value.includes('low')) return 'low';
    if (value.includes('medium') || value.includes('moderate')) return 'medium';
    if (value.includes('high')) return 'high';
  }
  
  // For performance predictions, use the value to determine risk
  if (prediction.prediction_type === 'performance') {
    const value = prediction.value?.toLowerCase() || '';
    if (value.includes('above') || value.includes('excellent') || value.includes('good')) return 'low';
    if (value.includes('average') || value.includes('moderate')) return 'medium';
    if (value.includes('below') || value.includes('poor') || value.includes('failing')) return 'high';
  }
  
  // Default based on risk_score
  const score = parseFloat(prediction.risk_score) || 0;
  if (score <= 10) return 'low';
  if (score <= 20) return 'medium';
  return 'high';
};

// ✅ Get performance percentage from prediction
const getPerformancePercentage = (prediction) => {
  // Try to extract from value
  const value = prediction.value?.toLowerCase() || '';
  
  if (prediction.prediction_type === 'performance') {
    if (value.includes('excellent') || value.includes('outstanding')) return 90;
    if (value.includes('above average')) return 75;
    if (value.includes('average')) return 60;
    if (value.includes('below average')) return 45;
    if (value.includes('poor') || value.includes('failing')) return 30;
    return 50;
  }
  
  if (prediction.prediction_type === 'risk') {
    const score = parseFloat(prediction.risk_score) || 0;
    return Math.max(0, 100 - score * 2); // Lower risk = higher performance
  }
  
  return 50;
};

// ✅ Get the display value for prediction
const getPredictionDisplay = (prediction) => {
  if (prediction.prediction_type === 'performance') {
    return prediction.value || 'Average';
  }
  if (prediction.prediction_type === 'risk') {
    return prediction.value || 'Low Risk';
  }
  return prediction.value || 'N/A';
};

const getRiskBadge = (riskLevel) => {
  const config = {
    low: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Low Risk",
    },
    medium: {
      icon: <AlertTriangle className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Medium Risk",
    },
    high: {
      icon: <AlertCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700 border-red-200",
      label: "High Risk",
    },
  };

  const info = config[riskLevel] || config.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.className}`}>
      {info.icon}
      {info.label}
    </span>
  );
};

const getPerformanceColor = (percentage) => {
  if (percentage >= 80) return "text-emerald-600 bg-emerald-50";
  if (percentage >= 60) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
};

const getPredictionTypeBadge = (type) => {
  const config = {
    performance: {
      icon: <TrendingUp className="w-3 h-3" />,
      className: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Performance",
    },
    risk: {
      icon: <Shield className="w-3 h-3" />,
      className: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Risk",
    },
  };
  
  const info = config[type] || config.performance;
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

// ─── Prediction Detail Modal ──────────────────────────────────────────

const PredictionDetailModal = ({ isOpen, prediction, onClose }) => {
  if (!isOpen || !prediction) return null;

  const riskLevel = getRiskLevel(prediction);
  const performance = getPerformancePercentage(prediction);
  const displayValue = getPredictionDisplay(prediction);

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
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Prediction Details</p>
                <h3 className="text-base sm:text-lg font-bold">{prediction.student_name || "Student"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Prediction Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Type</p>
              <div className="mt-1">{getPredictionTypeBadge(prediction.prediction_type)}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Risk Level</p>
              <div className="mt-1">{getRiskBadge(riskLevel)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Prediction</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{displayValue}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Risk Score</p>
              <p className="text-sm font-bold text-gray-800 mt-1">{prediction.risk_score || '—'}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Performance</p>
            <p className={`text-lg font-bold ${getPerformanceColor(performance)}`}>
              {performance}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${performance >= 80 ? 'bg-emerald-500' : performance >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${performance}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Prediction Date</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{formatDate(prediction.prediction_date)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{formatDate(prediction.created_at)}</p>
            </div>
          </div>

          {prediction.details && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Details</p>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                {prediction.details}
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

export default function TeacherPredictions() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const predictions = useSelector(selectTeacherPredictions);
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
  const [filterRisk, setFilterRisk] = useState("all");
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching predictions data...');
      
      await Promise.all([
        dispatch(fetchPredictions()),
        dispatch(fetchTeacherClasses()),
        dispatch(fetchSubjects()),
        dispatch(fetchStudents()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All predictions data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load predictions. Please refresh.");
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

  // Process predictions with computed values
  const processedPredictions = useMemo(() => {
    const predictionsArray = Array.isArray(predictions) ? predictions : [];
    
    return predictionsArray.map(p => {
      const riskLevel = getRiskLevel(p);
      const performance = getPerformancePercentage(p);
      const displayValue = getPredictionDisplay(p);
      
      return {
        ...p,
        risk_level: riskLevel,
        performance: performance,
        display_value: displayValue,
      };
    });
  }, [predictions]);

  // Group predictions by student for the enriched view
  const enrichedPredictions = useMemo(() => {
    const grouped = {};
    
    processedPredictions.forEach(p => {
      const studentId = p.student || p.student_id || p.id;
      if (!grouped[studentId]) {
        grouped[studentId] = {
          student_id: studentId,
          student_name: p.student_name || `Student ${studentId}`,
          predictions: [],
          latest_prediction: null,
          risk_level: 'low',
          performance: 50,
        };
      }
      grouped[studentId].predictions.push(p);
      
      // Update latest prediction (by date)
      if (!grouped[studentId].latest_prediction || 
          new Date(p.prediction_date) > new Date(grouped[studentId].latest_prediction.prediction_date)) {
        grouped[studentId].latest_prediction = p;
      }
    });
    
    // Calculate aggregated risk and performance for each student
    Object.values(grouped).forEach(student => {
      const risks = student.predictions.map(p => getRiskLevel(p));
      const performances = student.predictions.map(p => getPerformancePercentage(p));
      
      // Highest risk takes precedence
      if (risks.includes('high')) student.risk_level = 'high';
      else if (risks.includes('medium')) student.risk_level = 'medium';
      else student.risk_level = 'low';
      
      student.performance = Math.round(performances.reduce((a, b) => a + b, 0) / performances.length);
      
      // Get all unique prediction types
      student.prediction_types = [...new Set(student.predictions.map(p => p.prediction_type))];
    });
    
    return Object.values(grouped);
  }, [processedPredictions]);

  const filteredPredictions = useMemo(() => {
    let filtered = enrichedPredictions;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.student_name || "").toLowerCase().includes(search)
      );
    }

    if (filterRisk !== "all") {
      filtered = filtered.filter(p => p.risk_level === filterRisk);
    }

    return filtered;
  }, [enrichedPredictions, searchTerm, filterRisk]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredPredictions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = enrichedPredictions.length;
    const lowRisk = enrichedPredictions.filter(p => p.risk_level === 'low').length;
    const mediumRisk = enrichedPredictions.filter(p => p.risk_level === 'medium').length;
    const highRisk = enrichedPredictions.filter(p => p.risk_level === 'high').length;
    const avgPerformance = total > 0 
      ? Math.round(enrichedPredictions.reduce((sum, p) => sum + p.performance, 0) / total)
      : 0;
    const totalPredictions = processedPredictions.length;

    return {
      total,
      lowRisk,
      mediumRisk,
      highRisk,
      avgPerformance,
      totalPredictions,
    };
  }, [enrichedPredictions, processedPredictions]);

  const hasActiveFilters = searchTerm || filterRisk !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (student) => {
    // Find the latest prediction for this student
    const latest = student.latest_prediction || student.predictions[0];
    if (latest) {
      setSelectedPrediction(latest);
      setIsDetailOpen(true);
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
    setFilterRisk("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && enrichedPredictions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading predictions...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Predictions & Analytics"
        subtitle={`${stats.totalPredictions} total predictions for ${stats.total} students`}
        breadcrumbs={["Teacher", "Predictions"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Students"
          value={stats.total}
          icon={UsersIcon}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Total Predictions"
          value={stats.totalPredictions}
          icon={Brain}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Low Risk"
          value={stats.lowRisk}
          icon={Shield}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Medium Risk"
          value={stats.mediumRisk}
          icon={AlertTriangle}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="High Risk"
          value={stats.highRisk}
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
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  {(filterRisk !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterRisk("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterRisk === "all"
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterRisk("low")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterRisk === "low"
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Low
                      </button>
                      <button
                        onClick={() => setFilterRisk("medium")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterRisk === "medium"
                            ? "bg-amber-50 text-amber-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => setFilterRisk("high")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterRisk === "high"
                            ? "bg-red-50 text-red-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        High
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

      {/* ─── Results Summary ─────────────────────────────────────────── */}
      {filteredPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Brain className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Predictions Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredPredictions.length} students • 
                  <span className="text-emerald-600 ml-1">{stats.lowRisk} low risk</span> •
                  <span className="text-amber-600 ml-1">{stats.mediumRisk} medium risk</span> •
                  <span className="text-red-600 ml-1">{stats.highRisk} high risk</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">
                {filteredPredictions.length} Students
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                Avg: {stats.avgPerformance}%
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Predictions List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPredictions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching predictions found" : "No predictions available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Predictions will appear here once data is available."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
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
            const riskLevel = student.risk_level || 'low';
            const performance = student.performance || 0;
            const colorClass = getRandomColor(student.student_id || 0);
            const studentName = student.student_name || "Unknown";
            const latestPrediction = student.latest_prediction;
            const predictionTypes = student.prediction_types || [];
            
            return (
              <motion.div
                key={student.student_id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  riskLevel === 'low' ? 'border-emerald-200' :
                  riskLevel === 'medium' ? 'border-amber-200' :
                  'border-red-200'
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
                        <div className="flex gap-1 mt-0.5">
                          {predictionTypes.map((type) => (
                            <span key={type} className="text-[10px]">
                              {getPredictionTypeBadge(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {getRiskBadge(riskLevel)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Performance</span>
                      <span className={`text-sm font-bold ${getPerformanceColor(performance)}`}>
                        {performance}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${performance >= 80 ? 'bg-emerald-500' : performance >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${performance}%` }}
                      />
                    </div>

                    {latestPrediction && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Latest Prediction</p>
                        <p className="text-sm font-medium text-gray-800">
                          {getPredictionDisplay(latestPrediction)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(latestPrediction.prediction_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-1"
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prediction Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Prediction</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((student) => {
                  const riskLevel = student.risk_level || 'low';
                  const performance = student.performance || 0;
                  const studentName = student.student_name || "Unknown";
                  const latestPrediction = student.latest_prediction;
                  const predictionTypes = student.prediction_types || [];
                  
                  return (
                    <tr key={student.student_id} className={`hover:bg-gray-50 transition-colors ${
                      riskLevel === 'high' ? 'bg-red-50/20' :
                      riskLevel === 'medium' ? 'bg-amber-50/20' : ''
                    }`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(student.student_id || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {predictionTypes.map((type) => (
                            <span key={type}>{getPredictionTypeBadge(type)}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-800">
                            {latestPrediction ? getPredictionDisplay(latestPrediction) : '—'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {latestPrediction ? formatDate(latestPrediction.prediction_date) : '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${getPerformanceColor(performance)}`}>
                            {performance}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${performance >= 80 ? 'bg-emerald-500' : performance >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getRiskBadge(riskLevel)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewDetails(student)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
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
              {filteredPredictions.length} students • 
              <span className="text-emerald-600 ml-1">{stats.lowRisk} low risk</span> •
              <span className="text-amber-600 ml-1">{stats.mediumRisk} medium risk</span> •
              <span className="text-red-600 ml-1">{stats.highRisk} high risk</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredPredictions.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredPredictions.length)} of {filteredPredictions.length} students
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
                      ? 'bg-indigo-600 text-white'
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
        <p>© 2024 Smart School Management System • Predictions Module</p>
        <p className="mt-1">
          {filteredPredictions.length} students • 
          {filterRisk !== "all" ? ` Risk: ${filterRisk}` : " All risks"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Prediction Detail Modal ────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedPrediction && (
          <PredictionDetailModal
            isOpen={isDetailOpen}
            prediction={selectedPrediction}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedPrediction(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}