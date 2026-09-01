// src/modules/student/pages/StudentNotification.jsx

/**
 * ============================================
 * STUDENT NOTIFICATION - COMPLETE
 * ============================================
 * 
 * Purpose: Displays student notifications with full API integration
 * Used by: Student module routes
 * 
 * API Endpoints:
 * - GET /api/communication/notifications/ - List notifications
 * - PATCH /api/communication/notifications/{id}/ - Mark as read
 * - POST /api/communication/notifications/mark-all-read/ - Mark all as read
 * - DELETE /api/communication/notifications/{id}/ - Delete notification
 * 
 * USAGE OF NEW API FIELDS:
 * - user_name from notifications (read-only)
 * - sender_name from notifications (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  Filter,
  ChevronDown,
  Search,
  X,
  Mail,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
  Flame,
  Crown,
  Medal,
  ArrowRight,
  MessageSquare,
  DollarSign,
  BookOpen,
  Users,
  CalendarDays,
  Check,
  Trash2,
  Settings,
  BellRing,
  BellOff,
  Circle,
  Layers,
  Loader2,
  User,
  UserCircle,
  MailOpen,
  Send,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import api from "@/services/api";
import { fetchProfile } from "@/modules/student/store/studentThunks";
import { selectStudentProfile } from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getUserName = (notification) => {
  if (!notification) return null;
  // ✅ 1. PRIORITY: Use user_name from API (new field!)
  if (notification.user_name && notification.user_name !== 'null') return notification.user_name;
  // 2. FALLBACK: Use user object
  if (notification.user) {
    if (typeof notification.user === 'string') return notification.user;
    if (notification.user.name) return notification.user.name;
    if (notification.user.user_name) return notification.user.user_name;
  }
  return null;
};

const getSenderName = (notification) => {
  if (!notification) return null;
  // ✅ 1. PRIORITY: Use sender_name from API (new field!)
  if (notification.sender_name && notification.sender_name !== 'null') return notification.sender_name;
  // 2. FALLBACK: Use sender object
  if (notification.sender) {
    if (typeof notification.sender === 'string') return notification.sender;
    if (notification.sender.name) return notification.sender.name;
    if (notification.sender.sender_name) return notification.sender.sender_name;
  }
  return null;
};

const getProfileName = (profile) => {
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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${colors[type]} px-5 py-3.5 shadow-xl backdrop-blur-sm max-w-md`}
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

// ─── Notification Card ─────────────────────────────────────────────────

function NotificationCard({ notification, onMarkRead, onViewDetails, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff < 7) return `${diff} days ago`;
      if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getTypeConfig = (type) => {
    const map = {
      assignment: { icon: BookOpen, color: "bg-blue-100 text-blue-700", label: "Assignment" },
      fee: { icon: DollarSign, color: "bg-emerald-100 text-emerald-700", label: "Fee" },
      attendance: { icon: Users, color: "bg-amber-100 text-amber-700", label: "Attendance" },
      event: { icon: CalendarDays, color: "bg-purple-100 text-purple-700", label: "Event" },
      grade: { icon: Award, color: "bg-rose-100 text-rose-700", label: "Grade" },
      library: { icon: BookOpen, color: "bg-indigo-100 text-indigo-700", label: "Library" },
      canteen: { icon: MessageSquare, color: "bg-orange-100 text-orange-700", label: "Canteen" },
      general: { icon: Bell, color: "bg-gray-100 text-gray-700", label: "General" },
    };
    return map[type?.toLowerCase()] || map.general;
  };

  const typeConfig = getTypeConfig(notification.type);
  const TypeIcon = typeConfig.icon;
  const senderName = getSenderName(notification);
  const userName = getUserName(notification);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this notification?")) {
      setIsDeleting(true);
      await onDelete(notification.id);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200 ${
        notification.is_read ? "border-gray-100" : "border-indigo-200 bg-gradient-to-r from-white to-indigo-50/30"
      }`}
    >
      {!notification.is_read && (
        <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-indigo-600" />
      )}
      
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          {/* Left: Notification Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`h-12 w-12 rounded-xl ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className={`text-base font-semibold truncate ${notification.is_read ? "text-gray-500" : "text-gray-800"}`}>
                  {notification.title}
                </h4>
                {!notification.is_read && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 animate-pulse">
                    <Circle className="h-2 w-2 fill-current" />
                    New
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(notification.created_at)}
                </span>
                {senderName && (
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-3.5 w-3.5" />
                    From: {senderName}
                  </span>
                )}
                {userName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    For: {userName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!notification.is_read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
                title="Mark as read"
              >
                <Check className="h-4 w-4" />
                Mark Read
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => onViewDetails(notification)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
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
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Message</p>
                  <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-xl p-3 leading-relaxed">
                    {notification.message}
                  </p>
                </div>
                {notification.action_url && (
                  <button
                    onClick={() => window.location.href = notification.action_url}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl px-4 py-2 hover:bg-indigo-100 transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                    View Details
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Notification Details Modal ────────────────────────────────────────

function NotificationDetailsModal({ notification, onClose, onMarkRead }) {
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

  if (!notification) return null;

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

  const getTypeConfig = (type) => {
    const map = {
      assignment: { icon: BookOpen, color: "bg-blue-100 text-blue-700", label: "Assignment" },
      fee: { icon: DollarSign, color: "bg-emerald-100 text-emerald-700", label: "Fee" },
      attendance: { icon: Users, color: "bg-amber-100 text-amber-700", label: "Attendance" },
      event: { icon: CalendarDays, color: "bg-purple-100 text-purple-700", label: "Event" },
      grade: { icon: Award, color: "bg-rose-100 text-rose-700", label: "Grade" },
      library: { icon: BookOpen, color: "bg-indigo-100 text-indigo-700", label: "Library" },
      canteen: { icon: MessageSquare, color: "bg-orange-100 text-orange-700", label: "Canteen" },
      general: { icon: Bell, color: "bg-gray-100 text-gray-700", label: "General" },
    };
    return map[type?.toLowerCase()] || map.general;
  };

  const typeConfig = getTypeConfig(notification.type);
  const TypeIcon = typeConfig.icon;
  const senderName = getSenderName(notification);
  const userName = getUserName(notification);

  const handleMarkRead = async () => {
    if (!notification.is_read) {
      await onMarkRead(notification.id);
    }
  };

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
              <div className={`h-10 w-10 rounded-xl ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                <TypeIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">
                  {notification.title}
                </h3>
                <p className="text-sm text-white/80">
                  #{String(notification.id || '').padStart(4, '0')}
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
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
              <TypeIcon className="h-4 w-4" />
              {typeConfig.label}
            </span>
            {!notification.is_read && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                <Circle className="h-2 w-2 fill-current" />
                New
              </span>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Message</p>
            <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-xl p-3 leading-relaxed">
              {notification.message}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Received</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {formatDate(notification.created_at)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">
                {notification.is_read ? "Read" : "Unread"}
              </p>
            </div>
            {senderName && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500">From</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {senderName}
                </p>
              </div>
            )}
            {userName && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500">For</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {userName}
                </p>
              </div>
            )}
          </div>

          {notification.action_url && (
            <button
              onClick={() => {
                window.location.href = notification.action_url;
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-3 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <ArrowRight className="h-4 w-4" />
              View Details
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          {!notification.is_read && (
            <button
              onClick={handleMarkRead}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <Check className="h-4 w-4" />
              Mark as Read
            </button>
          )}
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

function StudentNotification() {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // ─── State ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // ─── Fetch Data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/communication/notifications/');
      
      const data = response.data?.results || response.data || [];
      setNotifications(data);
      
      // Debug: Check for new API fields
      if (data.length > 0) {
        console.log("📊 Notification fields:", Object.keys(data[0]));
        console.log("📊 user_name:", data[0].user_name);
        console.log("📊 sender_name:", data[0].sender_name);
      }
      
      // Also fetch profile if not loaded
      if (!profile) {
        await dispatch(fetchProfile()).unwrap();
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      const msg = err.response?.data?.message || 'Failed to load notifications';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dispatch, profile]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    const total = notifications?.length || 0;
    const unread = notifications?.filter((n) => !n.is_read).length || 0;
    const read = notifications?.filter((n) => n.is_read).length || 0;
    
    // Count by type
    const byType = {};
    notifications?.forEach((n) => {
      const type = n.type || "general";
      byType[type] = (byType[type] || 0) + 1;
    });

    return { total, unread, read, byType };
  }, [notifications]);

  // ─── Filter notifications ──────────────────────────────────────
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    let filtered = notifications.filter((n) => {
      const matchesType = filterType === "all" || n.type?.toLowerCase() === filterType;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        n.title?.toLowerCase().includes(searchLower) ||
        n.message?.toLowerCase().includes(searchLower) ||
        getSenderName(n)?.toLowerCase().includes(searchLower) ||
        getUserName(n)?.toLowerCase().includes(searchLower);
      return matchesType && matchesSearch;
    });

    // Sort: Unread first, then by date (newest first)
    filtered.sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  }, [notifications, filterType, searchTerm]);

  // ─── Handlers ──────────────────────────────────────────────────
  
  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/communication/notifications/${id}/`, { is_read: true });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      
      // If this notification is currently selected in modal, update it
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(prev => ({ ...prev, is_read: true }));
      }
      
      setToast({ message: "✅ Notification marked as read", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to mark as read", type: "error" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/communication/notifications/mark-all-read/');
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setToast({ message: "✅ All notifications marked as read", type: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark all as read';
      setToast({ message: msg, type: "error" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast({ message: "🔄 Notifications refreshed", type: "info" });
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/communication/notifications/${id}/`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setToast({ message: "🗑️ Notification deleted", type: "info" });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete notification';
      setToast({ message: msg, type: "error" });
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedNotification(null);
  };

  // ─── Get unique notification types ────────────────────────────
  const notificationTypes = useMemo(() => {
    const types = new Set();
    notifications?.forEach(n => {
      if (n.type) types.add(n.type);
    });
    return Array.from(types);
  }, [notifications]);

  const profileName = getProfileName(profile);

  if (loading && !notifications?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
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
        title="Notifications"
        subtitle="Stay updated with your latest notifications"
        breadcrumbs={["Student", "Notifications"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {profileName && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg text-sm font-medium text-indigo-700">
                <User className="h-4 w-4" />
                {profileName}
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
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                <Check className="h-4 w-4" />
                Mark All Read
              </button>
            )}
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Total"
            value={stats.total}
            subtext="All notifications"
            icon={Bell}
            color="indigo"
            delay={0.05}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Unread"
            value={stats.unread}
            subtext={stats.unread > 0 ? "New notifications" : "All caught up!"}
            icon={BellRing}
            color="amber"
            delay={0.1}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Read"
            value={stats.read}
            subtext="Already seen"
            icon={CheckCircle}
            color="emerald"
            delay={0.15}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Types"
            value={notificationTypes.length}
            subtext="Different categories"
            icon={Layers}
            color="blue"
            delay={0.2}
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
              placeholder="Search notifications by title, message, or sender..."
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
                showFilters || filterType !== "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Type
              {filterType !== "all" && (
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
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filterType === "all"
                      ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {notificationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                      filterType === type
                        ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {filterType !== "all" && (
                  <button
                    onClick={() => setFilterType("all")}
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

      {/* ─── Notifications List ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Notifications</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
          </span>
        </div>

        {filteredNotifications.length === 0 ? (
          <PremiumEmptyState
            icon={Bell}
            title={searchTerm ? "No matching notifications found" : "No notifications yet"}
            description={
              searchTerm 
                ? `No notifications found matching "${searchTerm}". Try adjusting your search.`
                : filterType !== "all"
                ? `No notifications of type "${filterType}". Try changing the filter.`
                : "You're all caught up! New notifications will appear here."
            }
            action={(searchTerm || filterType !== "all") ? { 
              label: "Clear Filters", 
              onClick: () => {
                setSearchTerm("");
                setFilterType("all");
              }
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Notification Details Modal ────────────────────────────────── */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedNotification && (
          <NotificationDetailsModal
            notification={selectedNotification}
            onClose={handleCloseDetails}
            onMarkRead={handleMarkRead}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Notifications Module</p>
      </div>
    </div>
  );
}

export default StudentNotification;