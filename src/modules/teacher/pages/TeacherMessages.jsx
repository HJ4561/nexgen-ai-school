// src/modules/teacher/pages/TeacherMessages.jsx

/**
 * ============================================
 * TEACHER MESSAGES - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: View and send messages
 * Used by: Teacher module routes
 * 
 * Features:
 * - View messages list
 * - Send new messages
 * - Reply to messages
 * - Mark messages as read/unread
 * - Delete messages
 * - Filter by status (all, unread, read)
 * - Search by subject, sender, or message content
 * - Card and Table view modes
 * - Responsive design
 * - Toast notifications
 * - GSAP animations
 * - Framer Motion transitions
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/communication/messages/ - Get messages
 * - POST /api/communication/messages/ - Send message
 * - PATCH /api/communication/messages/{id}/ - Update message
 * - DELETE /api/communication/messages/{id}/ - Delete message
 * - GET /api/users/students/ - Get students (for recipient selection)
 * - GET /api/users/teachers/me - Get teacher profile
 * 
 * USAGE OF NEW API FIELDS:
 * - sender_name instead of sender?.name or sender?.user?.name
 * - receiver_name instead of receiver?.name or receiver?.user?.name
 * - user_name for notifications (if applicable)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Send,
  Search,
  Eye,
  Reply,
  Trash2,
  Mail,
  MailOpen,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  X,
  Grid,
  List,
  AlertCircle,
  RefreshCw,
  Loader2,
  Plus,
  Calendar,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  fetchStudents,
  fetchProfile,
} from "../store/teacherThunks";

import {
  selectTeacherMessages,
  selectTeacherStudents,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getStatusBadge = (isRead) => {
  if (isRead) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">
        <MailOpen className="w-3 h-3" />
        Read
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
      <Mail className="w-3 h-3" />
      Unread
    </span>
  );
};

const getInitials = (name) => {
  if (!name || name === "Unknown" || name.startsWith("User ")) return "U";
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

// ─── Message Detail Modal ──────────────────────────────────────────────

const MessageDetailModal = ({ isOpen, message, onClose, onReply, onDelete, onMarkRead, loading, getSenderName, getReceiverName }) => {
  if (!isOpen || !message) return null;

  const isRead = message.is_read === true || message.is_read === 'true';
  
  // ✅ Use smart name resolvers that prioritize sender_name/receiver_name
  const senderName = getSenderName(message);
  const receiverName = getReceiverName(message);

  // Extract message content
  const messageContent = message.message || message.content || message.text || message.body || "No message content";
  const messageDate = message.created_at || message.sent_at || message.timestamp || message.updated_at || null;

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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Message Details</p>
                <h3 className="text-base sm:text-lg font-bold line-clamp-1">{message.subject || "No Subject"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(isRead)}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">From</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(message.sender || 0)}`}>
                    {getInitials(senderName)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate" title={senderName}>
                    {senderName}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">To</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(message.receiver || 1)}`}>
                    {getInitials(receiverName)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate" title={receiverName}>
                    {receiverName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Sent</p>
                <p className="text-sm text-gray-800">{formatDate(messageDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Message</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {messageContent}
              </div>
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
          {!isRead && (
            <button
              onClick={() => onMarkRead(message.id)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              <MailOpen className="w-4 h-4" />
              Mark as Read
            </button>
          )}
          <button
            onClick={() => { onReply(message); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
          <button
            onClick={() => { if (confirm("Delete this message?")) onDelete(message.id); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Compose Message Modal ─────────────────────────────────────────────

const ComposeMessageModal = ({ isOpen, replyTo, onClose, onSend, loading, students }) => {
  const [formData, setFormData] = useState({
    receiver: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (replyTo) {
      // ✅ Use sender_name if available, or fallback
      const senderName = replyTo.sender_name || `User ${replyTo.sender}`;
      setFormData({
        receiver: replyTo.sender || replyTo.sender_id || "",
        subject: `Re: ${replyTo.subject || ""}`,
        message: `\n\n--- Original Message from ${senderName} ---\n${replyTo.message || ""}`,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(formData);
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
                <Send className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">{replyTo ? "Reply to Message" : "Compose Message"}</p>
                <h3 className="text-base sm:text-lg font-bold">{replyTo ? "Reply" : "New Message"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Recipient *</label>
            <select
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select recipient</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user_name || s.name || "Unknown"}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Message subject..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Type your message here..."
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
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
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

export default function TeacherMessages() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const messages = useSelector(selectTeacherMessages);
  const students = useSelector(selectTeacherStudents);
  const profile = useSelector(selectTeacherProfile);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const ITEMS_PER_PAGE = 9;

  // ─── Create student map for fallback ──────────────────────────────────
  const studentMap = useMemo(() => {
    const map = {};
    students.forEach(s => {
      map[s.id] = s.user_name || s.name || s.user?.name || `Student ${s.id}`;
    });
    return map;
  }, [students]);

  // ─── Smart Name Resolution using API fields ────────────────────────────
  
  const getSenderName = useCallback((message) => {
    // ✅ 1. PRIORITY: Use sender_name from API (this is the new field!)
    if (message.sender_name && message.sender_name !== 'Unknown' && message.sender_name !== 'null') {
      return message.sender_name;
    }
    
    // 2. FALLBACK: Check if it's a student (from our fetched data)
    if (studentMap[message.sender]) {
      return studentMap[message.sender];
    }
    
    // 3. FALLBACK: Check if it's the current teacher
    if (profile && message.sender === profile.id) {
      return profile.user_name || profile.name || 'You (Teacher)';
    }
    
    // 4. LAST RESORT: Show ID with hint
    return `User ${message.sender}`;
  }, [studentMap, profile]);

  const getReceiverName = useCallback((message) => {
    // ✅ 1. PRIORITY: Use receiver_name from API (this is the new field!)
    if (message.receiver_name && message.receiver_name !== 'Unknown' && message.receiver_name !== 'null') {
      return message.receiver_name;
    }
    
    // 2. FALLBACK: Check if it's a student
    if (studentMap[message.receiver]) {
      return studentMap[message.receiver];
    }
    
    // 3. FALLBACK: Check if it's the current teacher
    if (profile && message.receiver === profile.id) {
      return profile.user_name || profile.name || 'You (Teacher)';
    }
    
    // 4. LAST RESORT: Show ID with hint
    return `User ${message.receiver}`;
  }, [studentMap, profile]);

  // ─── Debug: Log message data when loaded ──────────────────────────────
  
  useEffect(() => {
    if (messages.length > 0) {
      console.log('📊 Sample message fields:', Object.keys(messages[0]));
      console.log('📊 Sample message:', messages[0]);
      console.log('📊 sender_name present?', messages[0].sender_name !== undefined);
      console.log('📊 receiver_name present?', messages[0].receiver_name !== undefined);
    }
  }, [messages]);

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching messages data...');
      
      await Promise.all([
        dispatch(fetchMessages()),
        dispatch(fetchStudents()),
        dispatch(fetchProfile()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All messages data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load messages. Please refresh.");
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

  const filteredMessages = useMemo(() => {
    let filtered = Array.isArray(messages) ? [...messages] : [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        (m.subject || "").toLowerCase().includes(search) ||
        (m.message || m.content || m.text || "").toLowerCase().includes(search) ||
        // ✅ Search using sender_name and receiver_name
        (m.sender_name || "").toLowerCase().includes(search) ||
        (m.receiver_name || "").toLowerCase().includes(search)
      );
    }
    
    if (filterStatus === "unread") {
      filtered = filtered.filter(m => m.is_read === false || m.is_read === 'false');
    } else if (filterStatus === "read") {
      filtered = filtered.filter(m => m.is_read === true || m.is_read === 'true');
    }

    return filtered;
  }, [messages, searchTerm, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredMessages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const messagesArray = Array.isArray(messages) ? messages : [];
    
    const total = messagesArray.length;
    const unread = messagesArray.filter(m => m.is_read === false || m.is_read === 'false').length;
    const read = messagesArray.filter(m => m.is_read === true || m.is_read === 'true').length;

    return {
      total,
      unread,
      read,
    };
  }, [messages]);

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setIsDetailOpen(true);
  };

  const handleCompose = () => {
    setReplyTo(null);
    setIsComposeOpen(true);
  };

  const handleReply = (message) => {
    setReplyTo(message);
    setIsComposeOpen(true);
  };

  const handleSendMessage = async (data) => {
    try {
      // ✅ Do NOT include sender_name or receiver_name in POST data
      // These are read-only fields from the API
      const postData = {
        receiver: data.receiver,
        subject: data.subject,
        message: data.message,
      };
      await dispatch(sendMessage(postData)).unwrap();
      toast.success("Message sent successfully!");
      setIsComposeOpen(false);
      setReplyTo(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to send message");
    }
  };

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    try {
      // ✅ Do NOT include sender_name or receiver_name in PATCH data
      await dispatch(updateMessage({ id, data: { is_read: true } })).unwrap();
      toast.success("Message marked as read");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to mark message as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    setActionLoading(true);
    try {
      await dispatch(deleteMessage(id)).unwrap();
      toast.success("Message deleted successfully");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to delete message");
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
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Messages"
        subtitle="View and send messages"
        breadcrumbs={["Teacher", "Messages"]}
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
              onClick={handleCompose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">New Message</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Messages"
          value={stats.total}
          icon={MessageSquare}
          color="blue"
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
                placeholder="Search by subject, sender, or message..."
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
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "unread", "read"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
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

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Stats</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">{filteredMessages.length}</p>
                        <p className="text-[10px] text-gray-500">Filtered</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">{stats.unread}</p>
                        <p className="text-[10px] text-gray-500">Unread</p>
                      </div>
                    </div>
                  </div>
                </div>

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
      {filteredMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Messages Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredMessages.length} messages • 
                  <span className="text-amber-600 ml-1">{stats.unread} unread</span> •
                  <span className="text-emerald-600 ml-1">{stats.read} read</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">
                {filteredMessages.length} Total
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

      {/* ─── Messages List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching messages found" : "No messages available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Send your first message to start communicating."}
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
              onClick={handleCompose}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Compose Message
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
          {pageItems.map((message) => {
            const isRead = message.is_read === true || message.is_read === 'true';
            // ✅ Get names using the smart resolvers that prioritize sender_name/receiver_name
            const senderName = getSenderName(message);
            const receiverName = getReceiverName(message);
            const colorClass = getRandomColor(message.sender || 0);
            
            return (
              <motion.div
                key={message.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  isRead ? 'border-gray-100' : 'border-indigo-200 bg-indigo-50/30'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(senderName)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold line-clamp-1 ${isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                          {message.subject || "No Subject"}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">From: {senderName}</p>
                      </div>
                    </div>
                    {getStatusBadge(isRead)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <p className={`text-sm line-clamp-2 ${isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                      {message.message || "No message content"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(message.created_at || message.sent_at)}</span>
                    </div>
                    {!isRead && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        New
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewMessage(message)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleReply(message)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    {!isRead && (
                      <button
                        onClick={() => handleMarkRead(message.id)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Mark as Read"
                      >
                        <MailOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm("Delete this message?")) handleDeleteMessage(message.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">From</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((message) => {
                  const isRead = message.is_read === true || message.is_read === 'true';
                  // ✅ Get names using the smart resolvers
                  const senderName = getSenderName(message);
                  const receiverName = getReceiverName(message);
                  
                  return (
                    <tr key={message.id} className={`hover:bg-gray-50 transition-colors ${!isRead ? 'bg-indigo-50/20' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>}
                          <span className={`text-sm ${!isRead ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                            {message.subject || "No Subject"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{senderName}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{receiverName}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(isRead)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewMessage(message)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReply(message)}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                          {!isRead && (
                            <button
                              onClick={() => handleMarkRead(message.id)}
                              disabled={actionLoading}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Mark as Read"
                            >
                              <MailOpen className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { if (confirm("Delete this message?")) handleDeleteMessage(message.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
              {filteredMessages.length} messages • 
              <span className="text-amber-600 ml-1">{stats.unread} unread</span> •
              <span className="text-emerald-600 ml-1">{stats.read} read</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMessages.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredMessages.length)} of {filteredMessages.length} messages
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
        <p>© 2024 Smart School Management System • Messages Module</p>
        <p className="mt-1">
          {filteredMessages.length} messages • 
          {filterStatus !== "all" ? ` Status: ${filterStatus}` : " All"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Message Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedMessage && (
          <MessageDetailModal
            isOpen={isDetailOpen}
            message={selectedMessage}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedMessage(null);
            }}
            onReply={handleReply}
            onDelete={handleDeleteMessage}
            onMarkRead={handleMarkRead}
            loading={actionLoading}
            getSenderName={getSenderName}
            getReceiverName={getReceiverName}
          />
        )}
      </AnimatePresence>

      {/* ─── Compose Message Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isComposeOpen && (
          <ComposeMessageModal
            isOpen={isComposeOpen}
            replyTo={replyTo}
            onClose={() => {
              setIsComposeOpen(false);
              setReplyTo(null);
            }}
            onSend={handleSendMessage}
            loading={submitting}
            students={students}
          />
        )}
      </AnimatePresence>

    </div>
  );
}