// src/modules/student/pages/StudentComplaint.jsx

/**
 * ============================================
 * STUDENT COMPLAINT - COMPLETE
 * ============================================
 * 
 * Purpose: Student complaint page with full CRUD functionality
 * Used by: Student module routes
 * 
 * API Endpoints:
 * - GET /api/communication/messages/ - List complaints (messages)
 * - POST /api/communication/messages/ - Create complaint
 * - GET /api/communication/messages/{id}/ - Retrieve complaint
 * - PATCH /api/communication/messages/{id}/ - Update complaint
 * - DELETE /api/communication/messages/{id}/ - Delete complaint
 * 
 * USAGE OF NEW API FIELDS:
 * - sender_name from messages (read-only)
 * - receiver_name from messages (read-only)
 * - user_name from notifications (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  User,
  Tag,
  Flag,
  Send,
  X,
  Loader2,
  Shield,
  Sparkles,
  UserCheck,
  UserX,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Info,
  HelpCircle,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Flame,
  Crown,
  Medal,
  ArrowRight,
  Mail,
  Phone,
  Building,
  Download,
  Printer,
  Trash2,
  Edit,
  Check,
  ShieldCheck,
  ShieldAlert,
  Clock as ClockIcon,
  UserCircle,
  MailOpen,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/services/api";
import { fetchProfile } from "@/modules/student/store/studentThunks";
import { selectStudentProfile } from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getSenderName = (message) => {
  if (!message) return null;
  // ✅ 1. PRIORITY: Use sender_name from API (new field!)
  if (message.sender_name && message.sender_name !== 'null') return message.sender_name;
  // 2. FALLBACK: Use sender object
  if (message.sender) {
    if (typeof message.sender === 'string') return message.sender;
    if (message.sender.name) return message.sender.name;
    if (message.sender.sender_name) return message.sender.sender_name;
  }
  return null;
};

const getReceiverName = (message) => {
  if (!message) return null;
  // ✅ 1. PRIORITY: Use receiver_name from API (new field!)
  if (message.receiver_name && message.receiver_name !== 'null') return message.receiver_name;
  // 2. FALLBACK: Use receiver object
  if (message.receiver) {
    if (typeof message.receiver === 'string') return message.receiver;
    if (message.receiver.name) return message.receiver.name;
    if (message.receiver.receiver_name) return message.receiver.receiver_name;
  }
  return null;
};

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

// ─── Toast Notification ───────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${colors[type]} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
}

// ─── Premium Stat Card ─────────────────────────────────────────────────

function PremiumStatCard({ label, value, subtext, icon: Icon, color, delay }) {
  const colorMap = {
    indigo: { bg: "from-indigo-50 to-indigo-100/30", text: "text-indigo-600", ring: "ring-indigo-400/30" },
    emerald: { bg: "from-emerald-50 to-emerald-100/30", text: "text-emerald-600", ring: "ring-emerald-400/30" },
    amber: { bg: "from-amber-50 to-amber-100/30", text: "text-amber-600", ring: "ring-amber-400/30" },
    rose: { bg: "from-rose-50 to-rose-100/30", text: "text-rose-600", ring: "ring-rose-400/30" },
    blue: { bg: "from-blue-50 to-blue-100/30", text: "text-blue-600", ring: "ring-blue-400/30" },
    purple: { bg: "from-purple-50 to-purple-100/30", text: "text-purple-600", ring: "ring-purple-400/30" },
    cyan: { bg: "from-cyan-50 to-cyan-100/30", text: "text-cyan-600", ring: "ring-cyan-400/30" },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border border-gray-100/60 p-5 transition-all duration-300 hover:shadow-xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.ring} ring-4 ${c.text} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Complaint Card ────────────────────────────────────────────────────

function ComplaintCard({ complaint, onViewDetails, onDelete, onStatusUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60));
      
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff} minutes ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
      in_progress: { color: "bg-blue-100 text-blue-700", icon: RefreshCw, label: "In Progress" },
      resolved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Resolved" },
      rejected: { color: "bg-rose-100 text-rose-700", icon: XCircle, label: "Rejected" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const statusConfig = getStatusConfig(complaint.status);
  const StatusIcon = statusConfig.icon;

  const getPriorityColor = (priority) => {
    const map = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-rose-100 text-rose-700",
      urgent: "bg-red-100 text-red-700",
    };
    return map[priority?.toLowerCase()] || map.low;
  };

  const senderName = getSenderName(complaint);
  const receiverName = getReceiverName(complaint);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      setIsDeleting(true);
      await onDelete(complaint.id);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200"
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          {/* Left: Complaint Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold text-gray-800 truncate">
                  {complaint.subject || complaint.complaint_type || "Complaint"}
                </h4>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </span>
                {complaint.priority && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                    <Flag className="h-3 w-3" />
                    {complaint.priority}
                  </span>
                )}
                {complaint.is_read ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <MailOpen className="h-3 w-3" />
                    Read
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <Mail className="h-3 w-3" />
                    Unread
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(complaint.created_at)}
                </span>
                {senderName && (
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-3.5 w-3.5" />
                    From: {senderName}
                  </span>
                )}
                {receiverName && (
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-3.5 w-3.5" />
                    To: {receiverName}
                  </span>
                )}
                {complaint.category && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {complaint.category}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              {isExpanded ? "Less" : "More"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => onViewDetails(complaint)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl hover:bg-rose-50 transition-all"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-rose-500 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Description</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                    {complaint.message || complaint.description || "No description provided."}
                  </p>
                </div>
                {complaint.resolution_notes && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Resolution Notes</p>
                    <p className="text-sm text-emerald-700 mt-1">{complaint.resolution_notes}</p>
                  </div>
                )}
                {complaint.admin_remarks && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Admin Remarks</p>
                    <p className="text-sm text-blue-700 mt-1">{complaint.admin_remarks}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Create Complaint Modal ────────────────────────────────────────────

function CreateComplaintModal({ isOpen, onClose, onSubmit, submitting }) {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    complaint_type: "",
    against_user: "",
    priority: "medium",
    receiver: null,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!formData.subject.trim()) {
      setErrors(prev => ({ ...prev, subject: "Subject is required" }));
      return;
    }
    if (!formData.message.trim()) {
      setErrors(prev => ({ ...prev, message: "Description is required" }));
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Submit Complaint</h3>
                <p className="text-sm text-white/80">We'll address your concern promptly</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full mt-1.5 px-4 py-2.5 border ${errors.subject ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80`}
              placeholder="Brief subject of your complaint"
            />
            {errors.subject && (
              <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Complaint Type *</label>
            <select
              name="complaint_type"
              value={formData.complaint_type}
              onChange={handleChange}
              required
              className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80"
            >
              <option value="">Select complaint type</option>
              <option value="academic">Academic</option>
              <option value="behavior">Behavior</option>
              <option value="facility">Facility</option>
              <option value="teacher">Teacher Related</option>
              <option value="student">Student Related</option>
              <option value="administrative">Administrative</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your complaint in detail..."
              className={`w-full mt-1.5 px-4 py-2.5 border ${errors.message ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 resize-none`}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-500">{errors.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Against (Optional)</label>
            <input
              type="text"
              name="against_user"
              value={formData.against_user}
              onChange={handleChange}
              placeholder="Name or ID of the person involved"
              className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full mt-1.5 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Complaint Details Modal ──────────────────────────────────────────

function ComplaintDetailsModal({ complaint, onClose, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!complaint) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
      in_progress: { color: "bg-blue-100 text-blue-700", icon: RefreshCw, label: "In Progress" },
      resolved: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Resolved" },
      rejected: { color: "bg-rose-100 text-rose-700", icon: XCircle, label: "Rejected" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const statusConfig = getStatusConfig(complaint.status);
  const StatusIcon = statusConfig.icon;
  const senderName = getSenderName(complaint);
  const receiverName = getReceiverName(complaint);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {complaint.subject || complaint.complaint_type || "Complaint"}
                </h3>
                <p className="text-sm text-white/80">
                  #{String(complaint.id || '').padStart(4, '0')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig.label}
            </span>
            {complaint.priority && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                <Flag className="h-4 w-4" />
                {complaint.priority}
              </span>
            )}
            {complaint.complaint_type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                <Tag className="h-4 w-4" />
                {complaint.complaint_type}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Description</p>
            <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-xl p-3 leading-relaxed">
              {complaint.message || complaint.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Submitted</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {formatDate(complaint.created_at)}
              </p>
            </div>
            {senderName && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {senderName}
                </p>
              </div>
            )}
            {receiverName && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">To</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {receiverName}
                </p>
              </div>
            )}
            {complaint.against_user && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Against</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {typeof complaint.against_user === 'object' 
                    ? complaint.against_user.name 
                    : `User #${complaint.against_user}`}
                </p>
              </div>
            )}
          </div>

          {complaint.resolution_notes && (
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider">Resolution Notes</p>
              <p className="text-sm text-emerald-700 mt-1">{complaint.resolution_notes}</p>
            </div>
          )}

          {complaint.admin_remarks && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Admin Remarks</p>
              <p className="text-sm text-blue-700 mt-1">{complaint.admin_remarks}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────

function PremiumEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
    >
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-300/30 animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon size={32} className="text-indigo-500" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-800">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function StudentComplaint() {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);

  const [toast, setToast] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── State ──────────────────────────────────────────────────────────
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // ─── Fetch Data ──────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [messagesResponse] = await Promise.all([
        api.get('/communication/messages/'),
        dispatch(fetchProfile()).unwrap(),
      ]);
      
      const data = messagesResponse.data?.results || messagesResponse.data || [];
      setComplaints(data);
      
      // Debug: Check for new API fields
      if (data.length > 0) {
        console.log("📊 Message fields:", Object.keys(data[0]));
        console.log("📊 sender_name:", data[0].sender_name);
        console.log("📊 receiver_name:", data[0].receiver_name);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      const msg = err.response?.data?.message || 'Failed to load complaints';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      const statCards = document.querySelectorAll('.stat-card-animate');
      if (statCards.length) {
        tl.fromTo(statCards, 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = complaints?.length || 0;
    const pending = complaints?.filter((c) => c.status?.toLowerCase() === "pending").length || 0;
    const inProgress = complaints?.filter((c) => c.status?.toLowerCase() === "in_progress").length || 0;
    const resolved = complaints?.filter((c) => c.status?.toLowerCase() === "resolved").length || 0;
    const rejected = complaints?.filter((c) => c.status?.toLowerCase() === "rejected").length || 0;

    return { total, pending, inProgress, resolved, rejected };
  }, [complaints]);

  // ─── Filter complaints ──────────────────────────────────────────
  const filteredComplaints = useMemo(() => {
    if (!complaints) return [];
    
    let filtered = complaints.filter((c) => {
      const matchesStatus = filterStatus === "all" || c.status?.toLowerCase() === filterStatus;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        (c.subject || c.complaint_type || "").toLowerCase().includes(searchLower) ||
        (c.message || c.description || "").toLowerCase().includes(searchLower) ||
        getSenderName(c)?.toLowerCase().includes(searchLower) ||
        getReceiverName(c)?.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });

    return filtered;
  }, [complaints, filterStatus, searchTerm]);

  // ─── Handlers ──────────────────────────────────────────────────

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast({ message: "Complaints refreshed", type: "info" });
  };

  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsModalOpen(true);
  };

  const handleCreateComplaint = async (formData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        subject: formData.subject,
        message: formData.message,
        complaint_type: formData.complaint_type,
        priority: formData.priority,
        against_user: formData.against_user || null,
      };
      
      const response = await api.post('/communication/messages/', payload);
      setToast({ message: "✅ Complaint submitted successfully!", type: "success" });
      setIsCreateModalOpen(false);
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit complaint";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (id) => {
    try {
      await api.delete(`/communication/messages/${id}/`);
      setToast({ message: "Complaint deleted successfully", type: "success" });
      await fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete complaint";
      setToast({ message: msg, type: "error" });
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedComplaint(null);
  };

  const userName = getUserName(profile);

  if (loading && !complaints?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Toast */}
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
        breadcrumbs={["Student", "Complaints"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {userName && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg text-sm font-medium text-indigo-700">
                <User className="h-4 w-4" />
                {userName}
              </span>
            )}
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
              <Plus className="h-4 w-4" />
              New Complaint
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Total"
            value={stats.total}
            subtext="All complaints"
            icon={MessageSquare}
            color="indigo"
            delay={0.05}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Pending"
            value={stats.pending}
            subtext="Awaiting response"
            icon={Clock}
            color="amber"
            delay={0.1}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="In Progress"
            value={stats.inProgress}
            subtext="Being addressed"
            icon={RefreshCw}
            color="blue"
            delay={0.15}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Resolved"
            value={stats.resolved}
            subtext="Completed"
            icon={CheckCircle}
            color="emerald"
            delay={0.2}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Rejected"
            value={stats.rejected}
            subtext="Not addressed"
            icon={XCircle}
            color="rose"
            delay={0.25}
          />
        </div>
      </div>

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

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search complaints by subject, description, or person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showFilters || filterStatus !== "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Status
              {filterStatus !== "all" && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 flex flex-wrap gap-2">
                {["all", "pending", "in_progress", "resolved", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                      filterStatus === status
                        ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "All" : status.replace("_", " ")}
                  </button>
                ))}
                {filterStatus !== "all" && (
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="px-3 py-1.5 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Complaints List ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Complaints</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredComplaints.length} of {complaints.length} complaints
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filteredComplaints.length} {filteredComplaints.length === 1 ? 'complaint' : 'complaints'}
          </span>
        </div>

        {filteredComplaints.length === 0 ? (
          <PremiumEmptyState
            icon={MessageSquare}
            title={searchTerm ? "No matching complaints found" : "No complaints yet"}
            description={
              searchTerm 
                ? `No complaints found matching "${searchTerm}". Try adjusting your search.`
                : filterStatus !== "all"
                ? `No complaints with status "${filterStatus.replace('_', ' ')}". Try changing the filter.`
                : "You haven't submitted any complaints yet. Click the 'New Complaint' button to get started."
            }
            action={(searchTerm || filterStatus !== "all") ? { 
              label: "Clear Filters", 
              onClick: () => {
                setSearchTerm("");
                setFilterStatus("all");
              }
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onViewDetails={handleView}
                onDelete={handleDeleteComplaint}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Create Complaint Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateComplaintModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateComplaint}
            submitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* ─── Complaint Details Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedComplaint && (
          <ComplaintDetailsModal
            complaint={selectedComplaint}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Complaints Module</p>
      </div>
    </div>
  );
}

export default StudentComplaint;