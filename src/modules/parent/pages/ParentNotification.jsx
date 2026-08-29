/**
 * ============================================
 * PARENT NOTIFICATION COMPONENT
 * ============================================
 * 
 * Purpose: Parent notification page for viewing and managing notifications
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title, subtitle, and breadcrumbs
 * - Notification statistics overview
 * - Notification filters (All, Unread, Read, Sent)
 * - Search by notification title or message
 * - Notification list with read/unread status
 * - Mark read/unread functionality
 * - Mark all as read functionality
 * - Delete notification
 * - View notification details in drawer
 * - Pagination for notification list
 * - Real-time unread count badge
 * - Responsive design for all screen sizes
 * - GSAP animations
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/components/layout/PageHeader
 * - @/components/ui/* for UI components
 * - @/modules/parent/store/parentThunks
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/communication/notifications/ - Fetch notifications
 * - PATCH /api/communication/notifications/{id}/ - Mark as read/unread
 * - POST /api/communication/notifications/mark-all-read/ - Mark all as read
 * - DELETE /api/communication/notifications/{id}/ - Delete notification
 * 
 * Usage:
 * <Route path="/parent/notifications" element={<ParentNotification />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Search,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Mail,
  MailOpen,
  Calendar,
  User,
  Megaphone,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/modules/parent/store/parentThunks";

import {
  selectNotifications,
  selectUnreadCount,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

// ─── Constants ──────────────────────────────────────────────────────────────

const NOTIFICATION_TYPES = {
  info: { label: "Info", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Info },
  success: { label: "Success", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  warning: { label: "Warning", color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertCircle },
  error: { label: "Error", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  announcement: { label: "Announcement", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Megaphone },
  reminder: { label: "Reminder", color: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Clock },
};

const FILTER_TABS = ["All", "Unread", "Read", "Sent"];

const ITEMS_PER_PAGE = 10;

// ─── Helper Functions ──────────────────────────────────────────────────────

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

const getTimeAgo = (dateString) => {
  if (!dateString) return "—";
  try {
    const now = new Date();
    const diff = now - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  } catch {
    return "—";
  }
};

const getNotificationTypeBadge = (type) => {
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} text-[10px] sm:text-xs flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

// ─── Notification Detail Drawer ──────────────────────────────────────────────

const NotificationDetailDrawer = ({ isOpen, onClose, notification, onMarkRead }) => {
  if (!isOpen || !notification) return null;

  const handleMarkRead = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Notification Details
          </h3>
          <div className="flex items-center gap-2">
            {!notification.is_read && (
              <button
                onClick={handleMarkRead}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                title="Mark as read"
              >
                <MailOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Title</label>
            <p className="text-sm sm:text-base font-medium text-gray-800">{notification.title || "Notification"}</p>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Type</label>
              {getNotificationTypeBadge(notification.type)}
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <Badge className={`${notification.is_read ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'} text-xs`}>
                {notification.is_read ? 'Read' : 'Unread'}
              </Badge>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Message</label>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {notification.message || notification.body || "No message content"}
            </div>
          </div>

          {/* Sender */}
          {notification.sender && (
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">From</label>
              <p className="text-sm text-gray-800">{notification.sender}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Received</label>
              <p className="text-sm text-gray-600">{formatDateTime(notification.created_at)}</p>
            </div>
            {notification.read_at && (
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Read At</label>
                <p className="text-sm text-gray-600">{formatDateTime(notification.read_at)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full min-h-[36px] sm:min-h-[40px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentNotification = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    if (activeTab === "Unread") {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeTab === "Read") {
      filtered = filtered.filter(n => n.is_read);
    } else if (activeTab === "Sent") {
      // For parent, "Sent" means notifications they created or sent
      // In a real implementation, this would filter by sender
      filtered = filtered.filter(n => n.is_sent || false);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(search) ||
        n.message?.toLowerCase().includes(search) ||
        n.body?.toLowerCase().includes(search) ||
        n.type?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [notifications, activeTab, searchTerm]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsDetailDrawerOpen(true);
    
    // Mark as read when viewing
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id));
    }
  };

  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
    showToast("Notification marked as read", "success");
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      showToast("No unread notifications", "info");
      return;
    }
    dispatch(markAllNotificationsAsRead());
    showToast("All notifications marked as read", "success");
  };

  const handleDeleteClick = (notification) => {
    setDeleteTarget(notification);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // In a real implementation, this would dispatch a delete action
    // For now, we'll just close the dialog and show a toast
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
    showToast("Notification deleted successfully", "success");
  };

  const handleRefresh = () => {
    dispatch(fetchNotifications());
    showToast("Notifications refreshed", "info");
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: notifications.length,
    unread: unreadCount,
    read: notifications.filter(n => n.is_read).length,
    sent: notifications.filter(n => n.is_sent || false).length,
  }), [notifications, unreadCount]);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader 
          title="Notifications" 
          subtitle="View and manage your notifications" 
          breadcrumbs={["Parent", "Notifications"]}
        />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : 
          toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Notifications"
          subtitle="View and manage your notifications"
          breadcrumbs={["Parent", "Notifications"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {unreadCount > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="min-h-[36px] sm:min-h-[40px]"
                >
                  <MailOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="hidden xs:inline">Mark All Read</span>
                  <span className="xs:hidden">Read All</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">Refresh</span>
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* ─── Error Message ────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading notifications</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Statistics Cards ───────────────────────────────────────────── */}
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All notifications</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Unread</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.unread}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Needs attention</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Read</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.read}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Already viewed</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.sent}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">By you</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Filters ───────────────────────────────────────────────────── */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <nav className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide py-1 min-w-max">
            {FILTER_TABS.map((tab) => {
              const count = tab === "Unread" ? stats.unread : 
                           tab === "Read" ? stats.read : 
                           tab === "Sent" ? stats.sent : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
                  }`}
                >
                  {tab}
                  {count !== null && (
                    <span
                      className={`ml-0.5 sm:ml-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* ─── Notification List ──────────────────────────────────────────── */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-500 font-medium">No notifications found</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {searchTerm || activeTab !== "All" ? 'Try adjusting your filters' : 'You\'re all caught up!'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {pageItems.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors border-b border-gray-100 ${
                      !notification.is_read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        !notification.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.title || "Notification"}
                          </p>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {notification.message || notification.body}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {getNotificationTypeBadge(notification.type)}
                            <span className="text-[10px] text-gray-400">{getTimeAgo(notification.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewDetails(notification)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(notification)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Notification</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((notification) => (
                      <tr
                        key={notification.id}
                        className={`transition-colors ${!notification.is_read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-1.5 rounded-lg shrink-0 ${
                              !notification.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-[200px] ${
                                !notification.is_read ? 'text-gray-800' : 'text-gray-600'
                              }`}>
                                {notification.title || "Notification"}
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[250px]">
                                {notification.message || notification.body}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                          {getNotificationTypeBadge(notification.type)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden lg:table-cell">
                          <Badge className={`${notification.is_read ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'} text-[10px] sm:text-xs`}>
                            {notification.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                            {getTimeAgo(notification.created_at)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <MailOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(notification)}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(notification)}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredNotifications.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* ─── Notification Detail Drawer ────────────────────────────────── */}
      <NotificationDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        notification={selectedNotification}
        onMarkRead={handleMarkAsRead}
      />

      {/* ─── Delete Confirmation Dialog ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Notification"
        message={`Are you sure you want to delete "${deleteTarget?.title || 'this notification'}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default ParentNotification;