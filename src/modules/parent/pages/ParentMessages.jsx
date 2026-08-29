/**
 * ============================================
 * PARENT MESSAGES COMPONENT
 * ============================================
 * 
 * Purpose: View and send messages
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Message statistics
 * - Conversation list
 * - Message thread view
 * - Send new message
 * - Reply to messages
 * - Mark as read/unread
 * - Search conversations
 * - Filter by status
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/communication/messages/ - Get messages
 * - POST /api/communication/messages/ - Send message
 * - PATCH /api/communication/messages/{id}/ - Update message
 * 
 * Usage:
 * <Route path="/parent/messages" element={<ParentMessages />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  MailOpen,
  Send,
  Search,
  X,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
  Reply,
  Trash2,
  Eye,
  Filter,
  Paperclip,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchMessages,
  sendMessage,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
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

// ─── Send Message Modal ────────────────────────────────────────────────

const SendMessageModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    receiver: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        receiver: "",
        subject: "",
        message: "",
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

    if (!formData.receiver) {
      newErrors.receiver = "Please select a receiver";
    }
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white rounded-t-xl sm:rounded-t-2xl border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Send Message
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Receiver <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter teacher or admin name"
              value={formData.receiver}
              onChange={(e) => handleChange("receiver", e.target.value)}
              className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.receiver ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base`}
            />
            {errors.receiver && <p className="text-xs text-red-500 mt-1">{errors.receiver}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Message subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.subject ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base`}
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Type your message here..."
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.message ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base resize-none`}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px]">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading} className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px]">
              {loading ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" /> : <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Message Detail Drawer ─────────────────────────────────────────────

const MessageDetailDrawer = ({ isOpen, onClose, message }) => {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Message Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subject</label>
            <p className="text-sm sm:text-base font-medium text-gray-800">{message.subject}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={message.is_read ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
              {message.is_read ? 'Read' : 'Unread'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">From</label>
              <p className="text-sm text-gray-800">{message.sender_name || "Unknown"}</p>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">To</label>
              <p className="text-sm text-gray-800">{message.receiver_name || "Unknown"}</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Message</label>
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {message.message}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Sent</label>
              <p className="text-sm text-gray-600">{formatDate(message.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 min-h-[36px] sm:min-h-[40px]">
              Close
            </Button>
            <Button variant="primary" size="sm" className="flex-1 min-h-[36px] sm:min-h-[40px]">
              <Reply className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentMessages = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  // Use direct state access since selectMessages doesn't exist
  const messages = useSelector((state) => state.parent.messages || []);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchMessages());
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.subject?.toLowerCase().includes(search) ||
        m.message?.toLowerCase().includes(search) ||
        m.sender_name?.toLowerCase().includes(search) ||
        m.receiver_name?.toLowerCase().includes(search)
      );
    }

    if (filterStatus === "unread") {
      filtered = filtered.filter(m => !m.is_read);
    } else if (filterStatus === "read") {
      filtered = filtered.filter(m => m.is_read);
    }

    return filtered;
  }, [messages, searchTerm, filterStatus]);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: messages.length,
    unread: messages.filter(m => !m.is_read).length,
    read: messages.filter(m => m.is_read).length,
  }), [messages]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleSendMessage = async (data) => {
    setSending(true);
    try {
      await dispatch(sendMessage(data)).unwrap();
      setIsSendModalOpen(false);
      showToast("Message sent successfully!", "success");
    } catch (error) {
      showToast(error || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleViewDetails = (message) => {
    setSelectedMessage(message);
    setIsDetailDrawerOpen(true);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Messages" subtitle="View and send messages" breadcrumbs={["Parent", "Messages"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
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

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Messages"
          subtitle="View and send messages"
          breadcrumbs={["Parent", "Messages"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSendModalOpen(true)}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">New Message</span>
                <span className="xs:hidden">New</span>
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading messages</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-3 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All messages</p>
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
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="flex flex-col items-center gap-3">
                <Mail className="w-12 h-12 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">No messages found</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Messages will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 transition-colors border-b border-gray-100 ${
                      !message.is_read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${
                        !message.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {message.is_read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${!message.is_read ? 'text-gray-800' : 'text-gray-600'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{message.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-gray-400">{getTimeAgo(message.created_at)}</span>
                          <button
                            onClick={() => handleViewDetails(message)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">From</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">To</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Received</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMessages.map((message) => (
                      <tr
                        key={message.id}
                        className={`transition-colors ${!message.is_read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <div className="flex items-center gap-2">
                            {!message.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                            <span className={`text-sm ${!message.is_read ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                              {message.subject}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{message.sender_name || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{message.receiver_name || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <span className="text-sm text-gray-500">{getTimeAgo(message.created_at)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <Badge className={message.is_read ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'}>
                            {message.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right">
                          <button
                            onClick={() => handleViewDetails(message)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSubmit={handleSendMessage}
        loading={sending}
      />

      {/* Message Detail Drawer */}
      <MessageDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        message={selectedMessage}
      />
    </div>
  );
};

export default ParentMessages;