// src/modules/parent/pages/ParentComplaint.jsx

/**
 * ============================================
 * PARENT COMPLAINT COMPONENT
 * ============================================
 * 
 * Purpose: Parent complaint page for submitting and tracking complaints
 * Used by: Parent module routes
 * 
 * API Endpoints:
 * - GET /api/communication/messages/ - Fetch complaints (messages)
 * - POST /api/communication/messages/ - Create complaint
 * 
 * USAGE OF NEW API FIELDS:
 * - sender_name from messages (read-only)
 * - receiver_name from messages (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ChevronDown,
  RefreshCw,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Send,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";

import {
  fetchParentLinks,
  fetchComplaints,
  createComplaint,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectComplaints,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

import { setSelectedChild } from "@/modules/parent/store/parentSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const COMPLAINT_TYPES = [
  { value: "academic", label: "Academic" },
  { value: "behavioral", label: "Behavioral" },
  { value: "administrative", label: "Administrative" },
  { value: "transport", label: "Transport" },
  { value: "canteen", label: "Canteen" },
  { value: "facility", label: "Facility" },
  { value: "teacher", label: "Teacher Related" },
  { value: "other", label: "Other" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "medium", label: "Medium", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "high", label: "High", color: "bg-red-50 text-red-700 border-red-200" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
  resolved: { label: "Resolved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200", icon: X },
};

const ITEMS_PER_PAGE = 10;

// ─── Helper Functions ──────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

// ─── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
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

// ─── Badge Components ──────────────────────────────────────────────────

const getStatusBadge = (status) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getSeverityBadge = (severity) => {
  const config = SEVERITY_LEVELS.find(s => s.value === severity) || SEVERITY_LEVELS[0];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const getTypeLabel = (type) => {
  const found = COMPLAINT_TYPES.find(t => t.value === type);
  return found?.label || type || "Other";
};

// ─── Child Selector Component ─────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children, loading }) => {
  if (loading) {
    return (
      <div className="relative">
        <div className="w-full sm:w-48 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl animate-pulse h-[42px]" />
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="text-sm text-gray-400 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200">
        No children linked
      </div>
    );
  }

  return (
    <div className="relative flex-1 sm:flex-none sm:w-48">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm pr-10"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Create Complaint Modal ──────────────────────────────────────────

const CreateComplaintModal = ({ isOpen, onClose, onSubmit, loading, children }) => {
  const [formData, setFormData] = useState({
    title: "",
    complaint_type: "",
    description: "",
    severity: "medium",
    student_id: "",
    against_user: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        complaint_type: "",
        description: "",
        severity: "medium",
        student_id: "",
        against_user: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.complaint_type) newErrors.complaint_type = "Type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.student_id) newErrors.student_id = "Please select a child";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            Submit Complaint
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Brief summary of your complaint"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Complaint Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.complaint_type}
              onChange={(e) => handleChange("complaint_type", e.target.value)}
              className={`w-full px-4 py-2.5 border ${errors.complaint_type ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm`}
            >
              <option value="">Select type...</option>
              {COMPLAINT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.complaint_type && <p className="text-xs text-red-500 mt-1">{errors.complaint_type}</p>}
          </div>

          {/* Student/Child */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Related Child <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => handleChange("student_id", e.target.value)}
              className={`w-full px-4 py-2.5 border ${errors.student_id ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm`}
            >
              <option value="">Select a child...</option>
              {children.map((child) => (
                <option key={child.id} value={child.student || child.id}>
                  {child.student_name || child.name || `Child ${child.id}`}
                </option>
              ))}
            </select>
            {errors.student_id && <p className="text-xs text-red-500 mt-1">{errors.student_id}</p>}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Severity</label>
            <div className="grid grid-cols-3 gap-3">
              {SEVERITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => handleChange("severity", level.value)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    formData.severity === level.value
                      ? `${level.color} border-current`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Please provide detailed information about your complaint..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Against User (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Against (Optional)
            </label>
            <input
              type="text"
              placeholder="Name of person involved (if any)"
              value={formData.against_user}
              onChange={(e) => handleChange("against_user", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Complaint Detail Drawer ──────────────────────────────────────────

const ComplaintDetailDrawer = ({ isOpen, onClose, complaint }) => {
  if (!isOpen || !complaint) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25 }}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Complaint Details
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
            <p className="text-base font-medium text-gray-800">{complaint.title}</p>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {getTypeLabel(complaint.type)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
              {getStatusBadge(complaint.status)}
            </div>
          </div>

          {/* Severity & Related Child */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Severity</label>
              {getSeverityBadge(complaint.severity)}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Related Child</label>
              <p className="text-sm text-gray-800">{complaint.student_name || "—"}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Against User */}
          {complaint.against_user && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Against</label>
              <p className="text-sm text-gray-800">{complaint.against_user}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted</label>
              <p className="text-sm text-gray-600">{formatDateTime(complaint.created_at)}</p>
            </div>
            {complaint.updated_at && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Last Updated</label>
                <p className="text-sm text-gray-600">{formatDateTime(complaint.updated_at)}</p>
              </div>
            )}
          </div>

          {/* Resolution Notes */}
          {complaint.resolution_notes && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Resolution Notes</label>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-sm leading-relaxed">
                {complaint.resolution_notes}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

const ParentComplaint = () => {
  const dispatch = useDispatch();
  
  // ─── Redux State ──────────────────────────────────────────────────
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const complaints = useSelector(selectComplaints);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────────
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchParentLinks()).unwrap(),
        dispatch(fetchComplaints()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading complaints:", err);
      setToast({ message: "Failed to load complaints", type: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // ─── Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = complaints?.length || 0;
    const pending = complaints?.filter(c => c.status?.toLowerCase() === "pending").length || 0;
    const inProgress = complaints?.filter(c => c.status?.toLowerCase() === "in_progress").length || 0;
    const resolved = complaints?.filter(c => c.status?.toLowerCase() === "resolved").length || 0;
    const rejected = complaints?.filter(c => c.status?.toLowerCase() === "rejected").length || 0;

    return { total, pending, inProgress, resolved, rejected };
  }, [complaints]);

  // ─── Filter Logic ─────────────────────────────────────────────────
  const filteredComplaints = useMemo(() => {
    let filtered = complaints || [];

    // Filter by selected child
    if (selectedChild) {
      filtered = filtered.filter(c => c.student === selectedChild || c.student_id === selectedChild);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title?.toLowerCase().includes(search) ||
        c.description?.toLowerCase().includes(search) ||
        c.type?.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(c => c.status?.toLowerCase() === filterStatus);
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(c => c.type?.toLowerCase() === filterType);
    }

    // Filter by severity
    if (filterSeverity !== "all") {
      filtered = filtered.filter(c => c.severity?.toLowerCase() === filterSeverity);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return filtered;
  }, [complaints, selectedChild, searchTerm, filterStatus, filterType, filterSeverity]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredComplaints.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    dispatch(setSelectedChild(childId));
    setCurrentPage(1);
  };

  const handleCreateComplaint = async (data) => {
    setCreating(true);
    try {
      const payload = {
        subject: data.title,
        message: data.description,
        complaint_type: data.complaint_type,
        severity: data.severity,
        student_id: data.student_id,
        against_user: data.against_user || "",
      };
      
      await dispatch(createComplaint(payload)).unwrap();
      setToast({ message: "✅ Complaint submitted successfully!", type: "success" });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (error) {
      setToast({ message: error || "Failed to submit complaint", type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailDrawerOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Complaints refreshed", type: "info" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setFilterSeverity("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterType !== "all" || filterSeverity !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
        <PageHeader 
          title="Complaints" 
          subtitle="Submit and track your complaints"
          breadcrumbs={["Parent", "Complaints"]}
          bgColor="bg-indigo-50"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading complaints...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Complaints"
        subtitle="Submit and track your complaints"
        breadcrumbs={["Parent", "Complaints"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Complaint
            </button>
          </div>
        }
      />

      {/* ─── Error State ──────────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 p-4 rounded-xl text-center border border-rose-200"
        >
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm shadow-sm"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ─── Stats Cards ────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-indigo-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-0.5">All complaints</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-amber-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-0.5">Awaiting review</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-blue-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          <p className="text-xs text-gray-400 mt-0.5">Being addressed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-emerald-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.resolved}</p>
          <p className="text-xs text-gray-400 mt-0.5">Completed</p>
        </motion.div>
      </div>

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints by title or description..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            <ChildSelector
              children={children}
              selectedChild={selectedChild}
              onSelect={handleChildSelect}
              loading={loading}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            >
              <option value="all">All Types</option>
              {COMPLAINT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            >
              <option value="all">All Severity</option>
              {SEVERITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"
              >
                <X className="w-4 h-4 inline mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Complaint List ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {pageItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">No complaints found</p>
            <p className="text-sm text-gray-400 mt-1">
              {hasActiveFilters || selectedChild ? 'Try adjusting your filters' : 'Submit a new complaint to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {pageItems.map((complaint) => (
                <div key={complaint.id} className="p-4 hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{complaint.title}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                          {getTypeLabel(complaint.type)}
                        </span>
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(complaint.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(complaint)}
                      className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors ml-2"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Severity</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                            {complaint.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {getTypeLabel(complaint.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {getSeverityBadge(complaint.severity)}
                      </td>
                      <td className="px-4 py-3.5">
                        {getStatusBadge(complaint.status)}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(complaint.created_at)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-xs text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredComplaints.length)} of {filteredComplaints.length} entries
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all text-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-all text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ─── Create Complaint Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateComplaintModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateComplaint}
            loading={creating}
            children={children}
          />
        )}
      </AnimatePresence>

      {/* ─── Complaint Detail Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedComplaint && (
          <ComplaintDetailDrawer
            isOpen={isDetailDrawerOpen}
            onClose={() => {
              setIsDetailDrawerOpen(false);
              setSelectedComplaint(null);
            }}
            complaint={selectedComplaint}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Complaints Module</p>
      </div>
    </div>
  );
};

export default ParentComplaint;