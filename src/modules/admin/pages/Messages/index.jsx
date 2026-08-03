import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw,
  AlertCircle, CheckCircle, Loader2, MessageSquare,
  User, Mail, Clock, Send, Inbox, Archive,
  Filter, ChevronDown, Reply, Forward, Star,
  Users, Calendar, Paperclip, Download
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
// Messages: /api/communication/messages/
// Notifications: /api/communication/notifications/
// Notification Log: /api/communication/notification-log/

const MESSAGES_API = "/communication/messages/";
const NOTIFICATIONS_API = "/communication/notifications/";
const NOTIFICATION_LOG_API = "/communication/notification-log/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadge = (status) => {
  switch(status?.toLowerCase()) {
    case 'sent':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'delivered':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'read':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'sent':
      return <Send className="w-3.5 h-3.5" />;
    case 'delivered':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'read':
      return <Eye className="w-3.5 h-3.5" />;
    case 'failed':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'pending':
      return <Clock className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// ─── Tab Components ────────────────────────────────────────────────────

// 1. Messages Tab
const MessagesTab = ({ 
  messages, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  showFilters, setShowFilters,
  hasActiveFilters, clearFilters,
  pageSize, totalPages, startIndex, pageItems, filteredMessages,
  openCompose, openView, openReply, deleteMessage
}) => {
  const stats = {
    total: messages.length,
    read: messages.filter(m => m.is_read).length,
    unread: messages.filter(m => !m.is_read).length,
  };

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading messages</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Messages</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All messages</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Read</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.read}</p>
          <p className="text-xs text-gray-400 mt-1">Read messages</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unread</p>
          <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
          <p className="text-xs text-gray-400 mt-1">Unread messages</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject, sender, or receiver..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
              <button
                onClick={openCompose}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Compose
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No messages found</p>
                <p className="text-sm text-gray-400">Messages will appear here when communication is sent</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sender</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Receiver</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((message) => (
                  <tr key={message.id} className={`hover:bg-blue-50/30 transition-colors group ${!message.is_read ? "bg-blue-50/10" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Mail className={`w-4 h-4 ${!message.is_read ? "text-blue-600" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${!message.is_read ? "text-gray-900" : "text-gray-700"}`}>
                            {message.subject || "—"}
                          </p>
                          {!message.is_read && (
                            <span className="text-xs text-blue-600">New</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{message.sender || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{message.receiver || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDateTime(message.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={`${message.is_read ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                        {message.is_read ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {message.is_read ? "Read" : "Unread"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openView(message)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReply(message)}
                          className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(message)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {messages.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredMessages.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 2. Notifications Tab
const NotificationsTab = ({
  notifications, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterType, setFilterType,
  pageSize, totalPages, startIndex, pageItems, filteredNotifications,
  markAsRead, deleteNotification
}) => {
  const stats = {
    total: notifications.length,
    read: notifications.filter(n => n.is_read).length,
    unread: notifications.filter(n => !n.is_read).length,
    sms: notifications.filter(n => n.type === "sms").length,
    email: notifications.filter(n => n.type === "email").length,
    push: notifications.filter(n => n.type === "push").length,
  };

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading notifications</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Read</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.read}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unread</p>
          <p className="text-2xl font-bold text-amber-600">{stats.unread}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">SMS</p>
          <p className="text-2xl font-bold text-purple-600">{stats.sms}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
          <p className="text-2xl font-bold text-green-600">{stats.email}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Types</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="push">Push</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No notifications found</p>
                <p className="text-sm text-gray-400">Notifications will appear here when sent</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((notification) => (
                  <tr key={notification.id} className={`hover:bg-blue-50/30 transition-colors group ${!notification.is_read ? "bg-blue-50/10" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                          <MessageSquare className={`w-4 h-4 ${!notification.is_read ? "text-amber-600" : "text-gray-400"}`} />
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}>
                            {notification.title || "—"}
                          </p>
                          {!notification.is_read && (
                            <span className="text-xs text-amber-600">New</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{notification.user || "—"}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={`${
                        notification.type === "sms" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        notification.type === "email" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-green-50 text-green-700 border-green-200"
                      } text-xs px-2.5 py-1`}>
                        {notification.type?.toUpperCase() || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDateTime(notification.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={`${notification.is_read ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                        {notification.is_read ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {notification.is_read ? "Read" : "Unread"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification)}
                            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {notifications.length > 0 && (
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
    </>
  );
};

// ─── Compose Message Modal ────────────────────────────────────────────
const ComposeMessageModal = ({ isOpen, onClose, onSend, saving, replyTo }) => {
  const [formData, setFormData] = useState({
    receiver: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (replyTo) {
      setFormData({
        receiver: replyTo.sender || "",
        subject: `Re: ${replyTo.subject || ""}`,
        message: `\n\n--- Original Message ---\n${replyTo.message || ""}`,
      });
    } else {
      setFormData({
        receiver: "",
        subject: "",
        message: "",
      });
    }
  }, [replyTo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg">
            {replyTo ? "Reply to Message" : "Compose Message"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Receiver</label>
            <input
              type="text"
              placeholder="Enter receiver name or email"
              value={formData.receiver}
              onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Subject</label>
            <input
              type="text"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Message</label>
            <textarea
              rows={6}
              placeholder="Type your message here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSend(formData)}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── View Message Modal ───────────────────────────────────────────────
const ViewMessageModal = ({ isOpen, onClose, message }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg">Message Details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Subject</p>
              <p className="font-medium text-gray-800">{message.subject || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge className={message.is_read ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                {message.is_read ? "Read" : "Unread"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sender</p>
              <p className="font-medium text-gray-800">{message.sender || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Receiver</p>
              <p className="font-medium text-gray-800">{message.receiver || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Sent</p>
              <p className="font-medium text-gray-800">{formatDateTime(message.created_at)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Message</p>
              <p className="text-gray-700 whitespace-pre-wrap mt-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {message.message || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Messages = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState("messages");

  // Messages State
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState(false);
  const [messagesErrorMessage, setMessagesErrorMessage] = useState("");
  const [messagesSearchTerm, setMessagesSearchTerm] = useState("");
  const [messagesCurrentPage, setMessagesCurrentPage] = useState(1);
  const [messagesFilterStatus, setMessagesFilterStatus] = useState("all");
  const [showMessagesFilters, setShowMessagesFilters] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationsError, setNotificationsError] = useState(false);
  const [notificationsErrorMessage, setNotificationsErrorMessage] = useState("");
  const [notificationsSearchTerm, setNotificationsSearchTerm] = useState("");
  const [notificationsCurrentPage, setNotificationsCurrentPage] = useState(1);
  const [notificationsFilterType, setNotificationsFilterType] = useState("all");

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Functions ──────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    setMessagesError(false);
    setMessagesErrorMessage("");
    try {
      const response = await api.get(MESSAGES_API);
      const data = response.data?.results || response.data || [];
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessagesError(true);
      setMessagesErrorMessage(error.response?.data?.detail || "Failed to load messages");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    setNotificationsError(false);
    setNotificationsErrorMessage("");
    try {
      const response = await api.get(NOTIFICATIONS_API);
      const data = response.data?.results || response.data || [];
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotificationsError(true);
      setNotificationsErrorMessage(error.response?.data?.detail || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchMessages(),
      fetchNotifications(),
    ]);
    setRefreshing(false);
  }, [fetchMessages, fetchNotifications]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────
  const sendMessage = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        receiver: formData.receiver,
        subject: formData.subject,
        message: formData.message,
        is_read: false,
      };
      const response = await api.post(MESSAGES_API, payload);
      setMessages([response.data, ...messages]);
      showToast("Message sent successfully", "success");
      setComposeOpen(false);
      setReplyTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      showToast(error.response?.data?.detail || "Failed to send message", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteMessage = async (message) => {
    setSaving(true);
    try {
      await api.delete(`${MESSAGES_API}${message.id}/`);
      setMessages(messages.filter(m => m.id !== message.id));
      showToast("Message deleted", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      showToast("Failed to delete message", "error");
    } finally {
      setSaving(false);
    }
  };

  const markNotificationAsRead = async (notification) => {
    try {
      await api.patch(`${NOTIFICATIONS_API}${notification.id}/`, { is_read: true });
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, is_read: true } : n
      ));
      showToast("Marked as read", "success");
    } catch (error) {
      console.error("Failed to mark as read:", error);
      showToast("Failed to mark as read", "error");
    }
  };

  const deleteNotification = async (notification) => {
    setSaving(true);
    try {
      await api.delete(`${NOTIFICATIONS_API}${notification.id}/`);
      setNotifications(notifications.filter(n => n.id !== notification.id));
      showToast("Notification deleted", "success");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      showToast("Failed to delete notification", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    let filtered = messages;
    if (messagesFilterStatus !== "all") {
      filtered = filtered.filter(m => 
        messagesFilterStatus === "read" ? m.is_read : !m.is_read
      );
    }
    if (messagesSearchTerm) {
      const search = messagesSearchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        (m.subject || "").toLowerCase().includes(search) ||
        (m.sender || "").toLowerCase().includes(search) ||
        (m.receiver || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [messages, messagesSearchTerm, messagesFilterStatus]);

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (notificationsFilterType !== "all") {
      filtered = filtered.filter(n => n.type === notificationsFilterType);
    }
    if (notificationsSearchTerm) {
      const search = notificationsSearchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        (n.title || "").toLowerCase().includes(search) ||
        (n.message || "").toLowerCase().includes(search) ||
        (n.user || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [notifications, notificationsSearchTerm, notificationsFilterType]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const messagesTotalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize));
  const messagesStartIndex = (messagesCurrentPage - 1) * pageSize;
  const messagesPageItems = filteredMessages.slice(messagesStartIndex, messagesStartIndex + pageSize);

  const notificationsTotalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize));
  const notificationsStartIndex = (notificationsCurrentPage - 1) * pageSize;
  const notificationsPageItems = filteredNotifications.slice(notificationsStartIndex, notificationsStartIndex + pageSize);

  const hasActiveFilters = messagesFilterStatus !== "all" || messagesSearchTerm;

  const clearFilters = () => {
    setMessagesSearchTerm("");
    setMessagesFilterStatus("all");
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" />, count: messages.length },
    { id: "notifications", label: "Notifications", icon: <Inbox className="w-4 h-4" />, count: notifications.length },
  ];

  return (
    <FadeIn>
      <div className="space-y-6">
        <PageHeader
          title="Messages"
          subtitle="Manage all messages and communications"
          breadcrumbs={["Admin", "Messages"]}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAllData}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-2 sm:gap-4 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                    ${isActive 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  <Badge className={isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "messages" && (
          <MessagesTab
            messages={messages}
            loading={loadingMessages}
            error={messagesError}
            errorMessage={messagesErrorMessage}
            searchTerm={messagesSearchTerm}
            setSearchTerm={setMessagesSearchTerm}
            currentPage={messagesCurrentPage}
            setCurrentPage={setMessagesCurrentPage}
            filterStatus={messagesFilterStatus}
            setFilterStatus={setMessagesFilterStatus}
            showFilters={showMessagesFilters}
            setShowFilters={setShowMessagesFilters}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            pageSize={pageSize}
            totalPages={messagesTotalPages}
            startIndex={messagesStartIndex}
            pageItems={messagesPageItems}
            filteredMessages={filteredMessages}
            openCompose={() => {
              setReplyTo(null);
              setComposeOpen(true);
            }}
            openView={(message) => {
              setSelectedMessage(message);
              setViewOpen(true);
              // Mark as read if unread
              if (!message.is_read) {
                setMessages(messages.map(m => 
                  m.id === message.id ? { ...m, is_read: true } : m
                ));
              }
            }}
            openReply={(message) => {
              setReplyTo(message);
              setComposeOpen(true);
            }}
            deleteMessage={(message) => setDeletingItem(message)}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab
            notifications={notifications}
            loading={loadingNotifications}
            error={notificationsError}
            errorMessage={notificationsErrorMessage}
            searchTerm={notificationsSearchTerm}
            setSearchTerm={setNotificationsSearchTerm}
            currentPage={notificationsCurrentPage}
            setCurrentPage={setNotificationsCurrentPage}
            filterType={notificationsFilterType}
            setFilterType={setNotificationsFilterType}
            pageSize={pageSize}
            totalPages={notificationsTotalPages}
            startIndex={notificationsStartIndex}
            pageItems={notificationsPageItems}
            filteredNotifications={filteredNotifications}
            markAsRead={markNotificationAsRead}
            deleteNotification={(notification) => setDeletingItem(notification)}
          />
        )}
      </div>

      {/* Compose/Reply Modal */}
      <ComposeMessageModal
        isOpen={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          setReplyTo(null);
        }}
        onSend={sendMessage}
        saving={saving}
        replyTo={replyTo}
      />

      {/* View Message Modal */}
      <ViewMessageModal
        isOpen={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedMessage(null);
        }}
        message={selectedMessage}
      />

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title="Delete this item?"
          message={`Are you sure you want to delete "${deletingItem.subject || deletingItem.title || 'this item'}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            if (activeTab === "messages") {
              deleteMessage(deletingItem);
            } else {
              deleteNotification(deletingItem);
            }
            setDeletingItem(null);
          }}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Messages;