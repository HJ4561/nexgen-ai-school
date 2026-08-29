// src/modules/teacher/pages/TeacherBehaviorLogs.jsx

/**
 * ============================================
 * TEACHER BEHAVIOR LOGS - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: Manage student behavior logs
 * Used by: Teacher module routes
 * 
 * Features:
 * - Create behavior logs with dialog
 * - View behavior history with real API data
 * - Filter by type and severity
 * - Search behavior logs
 * - Behavior statistics cards
 * - View details in modal
 * - Edit and delete behavior logs (with API support)
 * - Card and Table view modes
 * - Responsive design
 * - Full screen visibility
 * - GSAP animations
 * - Framer Motion transitions
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/attendance/behavior-logs/ - Get behavior logs
 * - POST /api/attendance/behavior-logs/ - Create behavior log
 * - PATCH /api/attendance/behavior-logs/{id}/ - Update behavior log
 * - DELETE /api/attendance/behavior-logs/{id}/ - Delete behavior log
 * - GET /api/users/students/ - Get students
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name instead of student?.name or student?.user?.name
 * - teacher_name instead of teacher?.name or teacher?.user?.name
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  ShieldAlert,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
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
  Clock,
  ThumbsUp,
  ThumbsDown,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Info,
  Save,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchBehaviorLogs,
  createBehaviorLog,
  updateBehaviorLog,
  deleteBehaviorLog,
  fetchStudents,
} from "../store/teacherThunks";

import {
  selectTeacherBehaviorLogs,
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

const getTypeBadge = (type) => {
  if (type === "positive") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
        <ThumbsUp className="w-3 h-3" />
        Positive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
      <ThumbsDown className="w-3 h-3" />
      Negative
    </span>
  );
};

const getSeverityBadge = (severity) => {
  const config = {
    low: { color: "bg-green-50 text-green-700 border-green-200", label: "Low", icon: Info },
    medium: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "Medium", icon: AlertTriangle },
    high: { color: "bg-red-50 text-red-700 border-red-200", label: "High", icon: AlertCircle },
  };
  const info = config[severity] || config.medium;
  const Icon = info.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
};

const getSeverityColor = (severity) => {
  const map = {
    low: "border-l-green-500",
    medium: "border-l-amber-500",
    high: "border-l-red-500",
  };
  return map[severity] || "border-l-gray-500";
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

const getInitials = (name) => {
  if (!name) return "S";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

// ─── Create/Edit Behavior Log Modal ────────────────────────────────────

const BehaviorLogModal = ({ isOpen, log, onClose, onSave, loading, students }) => {
  const [formData, setFormData] = useState({
    student: "",
    type: "positive",
    severity: "low",
    description: "",
    action_taken: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (log) {
      setFormData({
        student: log.student || log.student_id || "",
        type: log.type || "positive",
        severity: log.severity || "low",
        description: log.description || "",
        action_taken: log.action_taken || "",
        date: log.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        student: "",
        type: "positive",
        severity: "low",
        description: "",
        action_taken: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [log]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">{log ? "Edit Behavior Log" : "Add Behavior Log"}</p>
                <h3 className="text-base sm:text-lg font-bold">{log ? "Update Record" : "New Behavior Log"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Student *</label>
            <select
              name="student"
              value={formData.student}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user_name || s.name || "Unknown"}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Severity *</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe the behavior..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Action Taken (Optional)</label>
            <textarea
              name="action_taken"
              value={formData.action_taken}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="What action was taken?"
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {log ? "Update Log" : "Save Log"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Behavior Log Detail Modal ─────────────────────────────────────────

const BehaviorLogDetailModal = ({ isOpen, log, onClose, onEdit, onDelete, deleting }) => {
  if (!isOpen || !log) return null;

  // ✅ Use new API fields: student_name, teacher_name
  const studentName = log.student_name || log.student?.name || "Unknown";
  const teacherName = log.teacher_name || log.teacher?.name || "Not specified";

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
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Behavior Log Details</p>
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
            {getTypeBadge(log.type)}
            {getSeverityBadge(log.severity)}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="text-sm text-gray-800">{studentName}</p>
              </div>
            </div>

            {teacherName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Teacher</p>
                  <p className="text-sm text-gray-800">{teacherName}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-800">{formatDate(log.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm leading-relaxed">
                  {log.description || "No description"}
                </div>
              </div>
            </div>

            {log.action_taken && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Action Taken</p>
                  <p className="text-sm text-gray-800">{log.action_taken}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Recorded</p>
                <p className="text-sm text-gray-800">{formatDateTime(log.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          <button
            onClick={() => { onEdit(log); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => { if (confirm("Delete this behavior log?")) onDelete(log.id); }}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
            ) : (
              <Trash2 className="w-4 h-4 inline mr-1" />
            )}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherBehaviorLogs() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const behaviorLogs = useSelector(selectTeacherBehaviorLogs);
  const students = useSelector(selectTeacherStudents);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

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
      console.log('📊 Fetching behavior logs data...');
      
      await Promise.all([
        dispatch(fetchBehaviorLogs()),
        dispatch(fetchStudents()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All behavior logs data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load behavior logs. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Behavior logs loaded:', behaviorLogs?.length || 0);
    console.log('📊 Students loaded:', students?.length || 0);
  }, [behaviorLogs, students]);

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

  const filteredLogs = useMemo(() => {
    let filtered = Array.isArray(behaviorLogs) ? [...behaviorLogs] : [];
    
    console.log('📊 Filtering logs - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        // ✅ Use new API field: student_name
        (l.student_name || l.student?.name || "").toLowerCase().includes(search) ||
        (l.description || "").toLowerCase().includes(search) ||
        (l.action_taken || "").toLowerCase().includes(search)
      );
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(l => l.type === filterType);
    }
    
    if (filterSeverity !== "all") {
      filtered = filtered.filter(l => l.severity === filterSeverity);
    }

    console.log('📊 Filtered logs count:', filtered.length);
    return filtered;
  }, [behaviorLogs, searchTerm, filterType, filterSeverity]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const logsArray = Array.isArray(behaviorLogs) ? behaviorLogs : [];
    
    const total = logsArray.length;
    const positive = logsArray.filter(l => l.type === "positive").length;
    const negative = logsArray.filter(l => l.type === "negative").length;
    const low = logsArray.filter(l => l.severity === "low").length;
    const medium = logsArray.filter(l => l.severity === "medium").length;
    const high = logsArray.filter(l => l.severity === "high").length;

    return {
      total,
      positive,
      negative,
      low,
      medium,
      high,
    };
  }, [behaviorLogs]);

  const hasActiveFilters = searchTerm || filterType !== "all" || filterSeverity !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleCreateLog = () => {
    setIsEditing(false);
    setSelectedLog(null);
    setIsModalOpen(true);
  };

  const handleEditLog = (log) => {
    setIsEditing(true);
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleSaveLog = async (data) => {
    try {
      if (isEditing && selectedLog) {
        await dispatch(updateBehaviorLog({ id: selectedLog.id, data })).unwrap();
        toast.success("Behavior log updated successfully!");
      } else {
        await dispatch(createBehaviorLog(data)).unwrap();
        toast.success("Behavior log created successfully!");
      }
      setIsModalOpen(false);
      setSelectedLog(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save behavior log");
    }
  };

  const handleDeleteLog = async (id) => {
    setDeletingId(id);
    try {
      await dispatch(deleteBehaviorLog(id)).unwrap();
      toast.success("Behavior log deleted successfully!");
      setIsDetailOpen(false);
      setSelectedLog(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to delete behavior log");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
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
    setFilterType("all");
    setFilterSeverity("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const isDeleting = (id) => deletingId === id;

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && behaviorLogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading behavior logs...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Behavior Logs"
        subtitle="Track and manage student behavior"
        breadcrumbs={["Teacher", "Behavior Logs"]}
        bgColor="bg-purple-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleCreateLog}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Log</span>
              <span className="xs:hidden">Add</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={ShieldAlert}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Positive"
          value={stats.positive}
          icon={ThumbsUp}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Negative"
          value={stats.negative}
          icon={ThumbsDown}
          color="red"
          isLoading={loading}
        />
        <StatCard
          title="Low"
          value={stats.low}
          icon={Info}
          color="green"
          isLoading={loading}
        />
        <StatCard
          title="Medium"
          value={stats.medium}
          icon={AlertTriangle}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="High"
          value={stats.high}
          icon={AlertCircle}
          color="red"
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
                placeholder="Search by student or description..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {(filterType !== "all" ? 1 : 0) + (filterSeverity !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                      {["all", "positive", "negative"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterType === type
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type === "all" ? "All" : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Severity Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "low", "medium", "high"].map((severity) => (
                        <button
                          key={severity}
                          onClick={() => setFilterSeverity(severity)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterSeverity === severity
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {severity === "all" ? "All" : severity}
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

      {/* ─── Results Summary Banner ──────────────────────────────────── */}
      {filteredLogs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-5 border border-purple-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Behavior Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredLogs.length} logs • 
                  <span className="text-emerald-600 ml-1">{stats.positive} positive</span> •
                  <span className="text-red-600 ml-1">{stats.negative} negative</span> •
                  <span className="text-green-600 ml-1">{stats.low} low</span> •
                  <span className="text-amber-600 ml-1">{stats.medium} medium</span> •
                  <span className="text-red-600 ml-1">{stats.high} high</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                {filteredLogs.length} Total
              </span>
              {filterType !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {filterType}
                </span>
              )}
              {filterSeverity !== "all" && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full capitalize">
                  {filterSeverity}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Behavior Logs List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching logs found" : "No behavior logs available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Add your first behavior log to start tracking student behavior."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={handleCreateLog}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Behavior Log
            </button>
          )}
        </div>
      ) : viewMode === "card" ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((log) => {
            const severityColor = getSeverityColor(log.severity);
            // ✅ Use new API field: student_name
            const studentName = log.student_name || log.student?.name || "Unknown";
            const colorClass = getRandomColor(log.id || 0);
            
            return (
              <motion.div
                key={log.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${severityColor} border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200`}
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
                        <p className="text-xs text-gray-500">
                          {formatDate(log.date)}
                        </p>
                      </div>
                    </div>
                    {getSeverityBadge(log.severity)}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {getTypeBadge(log.type)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {log.description || "No description"}
                    </p>
                    {log.action_taken && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">Action: {log.action_taken}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    <button
                      onClick={() => handleEditLog(log)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this behavior log?")) handleDeleteLog(log.id); }}
                      disabled={isDeleting(log.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting(log.id) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((log) => {
                  // ✅ Use new API field: student_name
                  const studentName = log.student_name || log.student?.name || "Unknown";
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(log.id || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600 line-clamp-1">{log.description || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(log.type)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(log.date)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(log)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditLog(log)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this behavior log?")) handleDeleteLog(log.id); }}
                            disabled={isDeleting(log.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {isDeleting(log.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredLogs.length} logs • 
              <span className="text-emerald-600 ml-1">{stats.positive} positive</span> •
              <span className="text-red-600 ml-1">{stats.negative} negative</span> •
              <span className="text-green-600 ml-1">{stats.low} low</span> •
              <span className="text-amber-600 ml-1">{stats.medium} medium</span> •
              <span className="text-red-600 ml-1">{stats.high} high</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredLogs.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} logs
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
                      ? 'bg-purple-600 text-white'
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
        <p>© 2024 Smart School Management System • Behavior Logs Module</p>
        <p className="mt-1">
          {filteredLogs.length} logs • 
          {filterType !== "all" ? ` Type: ${filterType}` : " All types"}
          {filterSeverity !== "all" ? ` • Severity: ${filterSeverity}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Create/Edit Behavior Log Modal ────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <BehaviorLogModal
            isOpen={isModalOpen}
            log={isEditing ? selectedLog : null}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedLog(null);
            }}
            onSave={handleSaveLog}
            loading={submitting}
            students={students}
          />
        )}
      </AnimatePresence>

      {/* ─── Behavior Log Detail Modal ────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedLog && (
          <BehaviorLogDetailModal
            isOpen={isDetailOpen}
            log={selectedLog}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedLog(null);
            }}
            onEdit={handleEditLog}
            onDelete={handleDeleteLog}
            deleting={isDeleting(selectedLog?.id)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}