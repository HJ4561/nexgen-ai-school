// src/modules/teacher/pages/TeacherLeaves.jsx

/**
 * ============================================
 * TEACHER LEAVES PAGE - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: View and manage teacher leaves
 * Used by: Teacher module routes
 * 
 * Features:
 * - View leave history with real API data
 * - Submit new leave requests
 * - View leave balance summary
 * - Filter leaves by status
 * - Delete pending leave requests
 * - Responsive design
 * - Toast notifications
 * - Loading states
 * 
 * USAGE OF NEW API FIELDS:
 * - employee_name instead of employee?.name (from /api/hr/leaves/)
 * - changed_by_name for leave history (nullable)
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/hr/leaves/ - Get leaves
 * - POST /api/hr/leaves/ - Create leave
 * - PATCH /api/hr/leaves/{id}/ - Update leave
 * - DELETE /api/hr/leaves/{id}/ - Delete leave
 * - GET /api/hr/leave-history/ - Get leave history (with employee_name, changed_by_name)
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Edit,
  FileText,
  User,
  Briefcase,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  X,
  Grid,
  List,
  Users,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchLeaves,
  fetchLeaveHistory,
  createLeave,
  updateLeave,
  deleteLeave,
} from "../store/teacherThunks";

import {
  selectTeacherLeaves,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
  selectTeacherProfile,
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

// ✅ Calculate duration from start and end dates
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
    return diffDays > 0 ? diffDays : 1;
  } catch {
    return 0;
  }
};

const getStatusBadge = (status) => {
  const statusMap = {
    pending: {
      icon: <Clock className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Pending",
    },
    approved: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Approved",
    },
    rejected: {
      icon: <XCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Rejected",
    },
    cancelled: {
      icon: <XCircle className="w-3 h-3" />,
      className: "bg-gray-100 text-gray-700 border-gray-200",
      label: "Cancelled",
    },
  };

  const config = statusMap[status] || statusMap.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const getLeaveTypeLabel = (type) => {
  const types = {
    sick: "Sick Leave",
    casual: "Casual Leave",
    annual: "Annual Leave",
    emergency: "Emergency Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    other: "Other",
  };
  return types[type] || type || "Leave";
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
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-50 text-gray-600",
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

// ─── Leave Detail Modal ──────────────────────────────────────────────

const LeaveDetailModal = ({ isOpen, leave, onClose, onDelete, onEdit, loading }) => {
  if (!isOpen || !leave) return null;

  const status = leave.status || 'pending';
  const isPending = status === 'pending';
  
  // ✅ Use new API field: employee_name
  const employeeName = leave.employee_name || leave.employee?.name || 'You';
  // ✅ Calculate duration if not provided
  const duration = leave.duration || calculateDuration(leave.start_date, leave.end_date) || '—';

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
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Leave Details</p>
                <h3 className="text-base sm:text-lg font-bold">{getLeaveTypeLabel(leave.leave_type)}</h3>
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
              <CalendarDays className="w-3 h-3" />
              {getLeaveTypeLabel(leave.leave_type)}
            </span>
          </div>

          <div className="space-y-3">
            {/* ✅ Show employee name if available */}
            {employeeName && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="text-sm text-gray-800">{employeeName}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{formatDate(leave.start_date)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="text-sm font-medium text-gray-800 mt-1">{formatDate(leave.end_date)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {duration} days
              </p>
            </div>

            {leave.reason && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Reason</p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm leading-relaxed">
                  {leave.reason}
                </div>
              </div>
            )}

            {leave.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm leading-relaxed">
                  {leave.notes}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400">
              <p>Created: {formatDateTime(leave.created_at)}</p>
              {leave.updated_at && <p>Updated: {formatDateTime(leave.updated_at)}</p>}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto order-last sm:order-first"
          >
            Close
          </button>
          {isPending && (
            <>
              <button
                onClick={() => { onEdit(leave); onClose(); }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => { if (confirm("Delete this leave request?")) onDelete(leave.id); onClose(); }}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Create/Edit Leave Modal ──────────────────────────────────────────

const LeaveFormModal = ({ isOpen, leaveToEdit, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    leave_type: "",
    start_date: "",
    end_date: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (leaveToEdit) {
      setFormData({
        leave_type: leaveToEdit.leave_type || "",
        start_date: leaveToEdit.start_date || "",
        end_date: leaveToEdit.end_date || "",
        reason: leaveToEdit.reason || "",
        notes: leaveToEdit.notes || "",
      });
    } else {
      setFormData({
        leave_type: "",
        start_date: "",
        end_date: "",
        reason: "",
        notes: "",
      });
    }
  }, [leaveToEdit, isOpen]);

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
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">{leaveToEdit ? "Edit" : "New"} Leave Request</p>
                <h3 className="text-base sm:text-lg font-bold">{leaveToEdit ? "Update Leave" : "Apply for Leave"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Leave Type *</label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select leave type</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="annual">Annual Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Start Date *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">End Date *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Reason *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Any additional information..."
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
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {leaveToEdit ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  {leaveToEdit ? "Update Leave" : "Submit Request"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherLeaves() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const leaves = useSelector(selectTeacherLeaves);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);
  const profile = useSelector(selectTeacherProfile);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveToEdit, setLeaveToEdit] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 9;

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching leaves data...');
      
      await Promise.all([
        dispatch(fetchLeaves()),
      ]);
      
      setDataFetched(true);
      console.log('✅ Leaves data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load leaves. Please refresh.");
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

  const filteredLeaves = useMemo(() => {
    let filtered = Array.isArray(leaves) ? [...leaves] : [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.leave_type?.toLowerCase().includes(search) ||
        l.reason?.toLowerCase().includes(search) ||
        l.status?.toLowerCase().includes(search) ||
        // ✅ Search in employee_name too
        (l.employee_name || "").toLowerCase().includes(search)
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(l => l.status === filterStatus);
    }

    if (filterType !== "all") {
      filtered = filtered.filter(l => l.leave_type === filterType);
    }

    return filtered;
  }, [leaves, searchTerm, filterStatus, filterType]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredLeaves.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const leavesArray = Array.isArray(leaves) ? leaves : [];
    
    const total = leavesArray.length;
    const pending = leavesArray.filter(l => l.status === 'pending').length;
    const approved = leavesArray.filter(l => l.status === 'approved').length;
    const rejected = leavesArray.filter(l => l.status === 'rejected').length;
    const cancelled = leavesArray.filter(l => l.status === 'cancelled').length;

    // ✅ Calculate total days using the helper
    let totalDays = 0;
    leavesArray.forEach(l => {
      if (l.start_date && l.end_date) {
        const days = calculateDuration(l.start_date, l.end_date);
        if (days > 0) totalDays += days;
      }
    });

    return {
      total,
      pending,
      approved,
      rejected,
      cancelled,
      totalDays,
    };
  }, [leaves]);

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterType !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setIsDetailOpen(true);
  };

  const handleNewLeave = () => {
    setLeaveToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditLeave = (leave) => {
    setLeaveToEdit(leave);
    setIsFormOpen(true);
  };

  const handleSaveLeave = async (data) => {
    try {
      if (leaveToEdit) {
        await dispatch(updateLeave({ id: leaveToEdit.id, data })).unwrap();
        toast.success("Leave request updated successfully!");
      } else {
        await dispatch(createLeave(data)).unwrap();
        toast.success("Leave request submitted successfully!");
      }
      setIsFormOpen(false);
      setLeaveToEdit(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save leave request");
    }
  };

  const handleDeleteLeave = async (id) => {
    setActionLoading(true);
    try {
      await dispatch(deleteLeave(id)).unwrap();
      toast.success("Leave request deleted successfully");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to delete leave request");
    } finally {
      setActionLoading(false);
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
    setFilterStatus("all");
    setFilterType("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && leaves.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading leaves...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Leave Management"
        subtitle="View and manage your leave requests"
        breadcrumbs={["Teacher", "Leaves"]}
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
            <button
              onClick={handleNewLeave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">New Leave</span>
              <span className="xs:hidden">New</span>
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
          title="Total Leaves"
          value={stats.total}
          icon={CalendarDays}
          color="blue"
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
          title="Approved"
          value={stats.approved}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="red"
          isLoading={loading}
        />
        <StatCard
          title="Total Days"
          value={stats.totalDays}
          icon={Calendar}
          color="purple"
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
                placeholder="Search leaves by type, reason, or employee..."
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
                  {(filterStatus !== "all" ? 1 : 0) + (filterType !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "pending", "approved", "rejected", "cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === "all" ? "All" : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Leave Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "sick", "casual", "annual", "emergency", "other"].map((type) => (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setCurrentPage(1); }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterType === type
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type === "all" ? "All" : type}
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
      {filteredLeaves.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Leaves Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredLeaves.length} leaves • 
                  <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
                  <span className="text-emerald-600 ml-1">{stats.approved} approved</span> •
                  <span className="text-red-600 ml-1">{stats.rejected} rejected</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">
                {filteredLeaves.length} Total
              </span>
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {filterStatus}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Leaves List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching leaves found" : "No leave requests"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "You haven't submitted any leave requests yet."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={handleNewLeave}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Apply for Leave
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
          {pageItems.map((leave) => {
            const colorClass = getRandomColor(leave.id || 0);
            const isPending = leave.status === 'pending';
            // ✅ Use new API field: employee_name
            const employeeName = leave.employee_name || leave.employee?.name || null;
            // ✅ Calculate duration if not provided
            const duration = leave.duration || calculateDuration(leave.start_date, leave.end_date) || '—';
            
            return (
              <motion.div
                key={leave.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  isPending ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(getLeaveTypeLabel(leave.leave_type))}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">
                          {getLeaveTypeLabel(leave.leave_type)}
                        </h4>
                        {employeeName && (
                          <p className="text-xs text-gray-500">by {employeeName}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>

                  <div className="space-y-2 flex-1">
                    {leave.reason && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {leave.reason}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>
                        {duration} days
                      </span>
                    </div>
                    {isPending && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                        Awaiting Approval
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewLeave(leave)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleEditLeave(leave)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this leave request?")) handleDeleteLeave(leave.id); }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((leave) => {
                  const isPending = leave.status === 'pending';
                  // ✅ Use new API field: employee_name
                  const employeeName = leave.employee_name || leave.employee?.name || '—';
                  // ✅ Calculate duration if not provided
                  const duration = leave.duration || calculateDuration(leave.start_date, leave.end_date) || '—';
                  
                  return (
                    <tr key={leave.id} className={`hover:bg-gray-50 transition-colors ${isPending ? 'bg-amber-50/20' : ''}`}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-800">
                          {getLeaveTypeLabel(leave.leave_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{employeeName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">
                          {duration} days
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(leave.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewLeave(leave)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleEditLeave(leave)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { if (confirm("Delete this leave request?")) handleDeleteLeave(leave.id); }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
              {filteredLeaves.length} leaves • 
              <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
              <span className="text-emerald-600 ml-1">{stats.approved} approved</span> •
              <span className="text-red-600 ml-1">{stats.rejected} rejected</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredLeaves.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeaves.length)} of {filteredLeaves.length} leaves
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
        <p>© 2024 Smart School Management System • Leave Management Module</p>
        <p className="mt-1">
          {filteredLeaves.length} leaves • 
          {filterStatus !== "all" ? ` Status: ${filterStatus}` : " All"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Leave Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedLeave && (
          <LeaveDetailModal
            isOpen={isDetailOpen}
            leave={selectedLeave}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedLeave(null);
            }}
            onEdit={handleEditLeave}
            onDelete={handleDeleteLeave}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* ─── Leave Form Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {isFormOpen && (
          <LeaveFormModal
            isOpen={isFormOpen}
            leaveToEdit={leaveToEdit}
            onClose={() => {
              setIsFormOpen(false);
              setLeaveToEdit(null);
            }}
            onSave={handleSaveLeave}
            loading={submitting}
          />
        )}
      </AnimatePresence>

    </div>
  );
}