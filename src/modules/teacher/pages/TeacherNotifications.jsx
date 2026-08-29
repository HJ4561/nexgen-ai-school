// src/modules/teacher/pages/TeacherNotifications.jsx

/**
 * ============================================
 * TEACHER NOTIFICATIONS - COMPLETE
 * ============================================
 * 
 * Purpose: View and manage notifications
 * Used by: Teacher module routes
 * 
 * Features:
 * - View notifications list
 * - Mark as read/unread
 * - Mark all as read
 * - Filter by read/unread
 * - Notification statistics
 * - View notification details
 * - Responsive design
 * - Full screen visibility
 * - GSAP animations
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/communication/notifications/ - Get notifications
 * - PATCH /api/communication/notifications/{id}/ - Update notification
 * - POST /api/communication/notifications/mark-all-read/ - Mark all as read
 * 
 * Usage:
 * <Route path="/teacher/notifications" element={<TeacherNotifications />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Bell,
  Search,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  Mail,
  MailOpen,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  AlertCircle,
  Sparkles,
  Inbox,
  MessageSquare,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../store/teacherThunks";

import {
  selectTeacherNotifications,
  selectTeacherUnreadCount,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = {
  info: { label: "Info", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Bell },
  success: { label: "Success", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  warning: { label: "Warning", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle },
  error: { label: "Error", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  announcement: { label: "Announcement", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Sparkles },
  reminder: { label: "Reminder", color: "bg-cyan-100 text-cyan-700 border-cyan-200", icon: Clock },
  message: { label: "Message", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: MessageSquare },
};

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
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
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getStatusBadge = (isRead) => {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isRead 
        ? 'bg-gray-100 text-gray-700 border-gray-200' 
        : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      {isRead ? 'Read' : 'Unread'}
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

// ─── Notification Detail Modal ──────────────────────────────────────────

const NotificationDetailModal = ({ isOpen, notification, onClose, onMarkRead, loading }) => {
  if (!isOpen || !notification) return null;

  const isRead = notification.is_read;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className={`sticky top-0 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 ${
          isRead 
            ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Notification</p>
                <h3 className="text-base sm:text-lg font-bold line-clamp-1">{notification.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getTypeBadge(notification.type)}
            {getStatusBadge(isRead)}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Message</label>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {notification.message || notification.body || "No message content"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Received</label>
              <p className="text-sm text-gray-600">{formatDateTime(notification.created_at)}</p>
            </div>
            {notification.sender && (
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">From</label>
                <p className="text-sm text-gray-800">{notification.sender}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          {!isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <MailOpen className="w-4 h-4" />
                  Mark as Read
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherNotifications() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const notifications = useSelector(selectTeacherNotifications);
  const unreadCount = useSelector(selectTeacherUnreadCount);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [marking, setMarking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
  };

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching notifications data...');
      
      await dispatch(fetchNotifications());
      
      setDataFetched(true);
      console.log('✅ All notifications data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load notifications. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Notifications loaded:', notifications?.length || 0);
    console.log('📊 Unread count:', unreadCount || 0);
  }, [notifications, unreadCount]);

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

  const filteredNotifications = useMemo(() => {
    let filtered = Array.isArray(notifications) ? [...notifications] : [];
    
    console.log('📊 Filtering notifications - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(search) ||
        n.message?.toLowerCase().includes(search) ||
        n.body?.toLowerCase().includes(search)
      );
    }
    
    if (filterStatus === "unread") {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filterStatus === "read") {
      filtered = filtered.filter(n => n.is_read);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0);
      const dateB = new Date(b.created_at || b.createdAt || 0);
      return dateB - dateA;
    });

    console.log('📊 Filtered notifications count:', filtered.length);
    return filtered;
  }, [notifications, searchTerm, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const notificationsArray = Array.isArray(notifications) ? notifications : [];
    const unread = notificationsArray.filter(n => !n.is_read).length;
    
    return {
      total: notificationsArray.length,
      unread: unread,
      read: notificationsArray.filter(n => n.is_read).length,
    };
  }, [notifications]);

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailOpen(true);
    if (!notification.is_read) {
      handleMarkRead(notification.id, false);
    }
  };

  const handleMarkRead = async (id, showToast = true) => {
    setMarking(true);
    try {
      await dispatch(markNotificationRead(id)).unwrap();
      if (showToast) toast.success("Notification marked as read");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to mark notification as read");
    } finally {
      setMarking(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (stats.unread === 0) {
      toast.info("All notifications are already read");
      return;
    }

    setMarking(true);
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      toast.success("All notifications marked as read");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to mark all notifications as read");
    } finally {
      setMarking(false);
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
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Notifications"
        subtitle="View and manage notifications"
        breadcrumbs={["Teacher", "Notifications"]}
        bgColor="bg-blue-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={marking}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <MailOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}
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
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={Bell}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Unread"
          value={stats.unread}
          icon={Mail}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Read"
          value={stats.read}
          icon={MailOpen}
          color="emerald"
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
                placeholder="Search notifications..."
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
                  {(filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                        onClick={() => setFilterStatus("unread")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "unread"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Unread
                      </button>
                      <button
                        onClick={() => setFilterStatus("read")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "read"
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Read
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

      {/* ─── Results Summary Banner ──────────────────────────────────── */}
      {filteredNotifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Notifications Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredNotifications.length} notifications • 
                  <span className="text-amber-600 ml-1">{stats.unread} unread</span> •
                  <span className="text-emerald-600 ml-1">{stats.read} read</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {filteredNotifications.length} Total
              </span>
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {filterStatus}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Notifications List ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching notifications found" : "No notifications available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "You're all caught up! No new notifications to display."}
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
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="divide-y divide-gray-100">
            {pageItems.map((notification) => {
              const isRead = notification.is_read;
              const type = notification.type || 'info';
              const TypeIcon = NOTIFICATION_TYPES[type]?.icon || Bell;

              return (
                <motion.div
                  key={notification.id}
                  variants={itemVariants}
                  className={`p-4 sm:p-5 hover:bg-gray-50 transition-all cursor-pointer ${
                    !isRead ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleViewDetails(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      !isRead 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title || "Notification"}
                          </p>
                          <p className={`text-xs mt-0.5 line-clamp-2 ${!isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                            {notification.message || notification.body || "No message content"}
                          </p>
                        </div>
                        {!isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getTypeBadge(type)}
                        {getStatusBadge(isRead)}
                        <span className="text-[10px] text-gray-400">
                          {formatDateTime(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredNotifications.length} notifications • 
              <span className="text-amber-600 ml-1">{stats.unread} unread</span> •
              <span className="text-emerald-600 ml-1">{stats.read} read</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredNotifications.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)} of {filteredNotifications.length} notifications
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
        <p>© 2024 Smart School Management System • Notifications Module</p>
        <p className="mt-1">
          {filteredNotifications.length} notifications • 
          {filterStatus !== "all" ? ` Filtered by: ${filterStatus}` : " All"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Notification Detail Modal ──────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedNotification && (
          <NotificationDetailModal
            isOpen={isDetailOpen}
            notification={selectedNotification}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedNotification(null);
            }}
            onMarkRead={handleMarkRead}
            loading={marking}
          />
        )}
      </AnimatePresence>

    </div>
  );
}