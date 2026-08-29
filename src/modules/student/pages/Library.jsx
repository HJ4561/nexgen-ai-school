// src/modules/student/pages/Library.jsx

/**
 * ============================================
 * STUDENT LIBRARY COMPONENT
 * ============================================
 * 
 * Purpose: Displays student's book issues, history, and library management
 * 
 * API Endpoints:
 * - GET /api/library/book-issues/ - List book issues
 * - GET /api/library/book-issue-history/ - List book issue history
 * 
 * USAGE OF NEW API FIELDS:
 * - book_title from book-issues (read-only)
 * - student_name from book-issues (read-only)
 * - book_title from book-issue-history (read-only)
 * - student_name from book-issue-history (read-only)
 * - changed_by_name from book-issue-history (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Book,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Download,
  User,
  Hash,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Sparkles,
  CalendarDays,
  Users,
  Library as LibraryIcon,
  BookMarked,
  BookCheck,
  BookX,
  Clock as ClockIcon,
  ArrowRight,
  Plus,
  Minus as MinusIcon,
  Star,
  Trophy,
  Medal,
  Shield,
  Layers,
  Grid,
  List,
  ExternalLink,
  Info,
  HelpCircle,
  Heart,
  Share2,
  BookCopy,
  BookOpenCheck,
  LibraryBig,
  GraduationCap,
  Award as AwardIcon,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchBookIssues,
  fetchBookIssueHistory,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentBookIssues,
  selectStudentBookIssueHistory,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getBookTitle = (item) => {
  if (!item) return "Unknown Book";
  // ✅ 1. PRIORITY: Use book_title from API (new field!)
  if (item.book_title && item.book_title !== 'null') {
    return item.book_title;
  }
  // 2. FALLBACK: Use book object
  if (item.book) {
    if (typeof item.book === 'string') return item.book;
    if (item.book.title) return item.book.title;
    if (item.book.book_title) return item.book.book_title;
  }
  return `Book #${item.book || item.id}`;
};

const getStudentName = (item) => {
  if (!item) return null;
  // ✅ 1. PRIORITY: Use student_name from API (new field!)
  if (item.student_name && item.student_name !== 'null') {
    return item.student_name;
  }
  // 2. FALLBACK: Use student object
  if (item.student) {
    if (typeof item.student === 'string') return item.student;
    if (item.student.name) return item.student.name;
    if (item.student.student_name) return item.student.student_name;
  }
  return null;
};

const getChangedByName = (item) => {
  if (!item) return null;
  // ✅ 1. PRIORITY: Use changed_by_name from API (new field!)
  if (item.changed_by_name && item.changed_by_name !== 'null') {
    return item.changed_by_name;
  }
  // 2. FALLBACK: Use changed_by object
  if (item.changed_by) {
    if (typeof item.changed_by === 'string') return item.changed_by;
    if (item.changed_by.name) return item.changed_by.name;
    if (item.changed_by.changed_by_name) return item.changed_by.changed_by_name;
  }
  return null;
};

// ─── Toast ──────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
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
};

// ─── Stat Card ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, subtext, icon: Icon, color, delay }) => {
  const colors = {
    purple: { bg: "from-purple-50 to-purple-100/50", text: "text-purple-600", ring: "ring-purple-400/20" },
    emerald: { bg: "from-emerald-50 to-emerald-100/50", text: "text-emerald-600", ring: "ring-emerald-400/20" },
    amber: { bg: "from-amber-50 to-amber-100/50", text: "text-amber-600", ring: "ring-amber-400/20" },
    blue: { bg: "from-blue-50 to-blue-100/50", text: "text-blue-600", ring: "ring-blue-400/20" },
    rose: { bg: "from-rose-50 to-rose-100/50", text: "text-rose-600", ring: "ring-rose-400/20" },
    indigo: { bg: "from-indigo-50 to-indigo-100/50", text: "text-indigo-600", ring: "ring-indigo-400/20" },
  };

  const c = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-4 ${c.ring} ${c.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Book Issue Card ────────────────────────────────────────────────────

const BookIssueCard = ({ bookIssue, index, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusConfig = (status) => {
    const map = {
      issued: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: BookOpen, label: "Issued" },
      returned: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: BookCheck, label: "Returned" },
      overdue: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Overdue" },
      lost: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: BookX, label: "Lost" },
      reserved: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: BookMarked, label: "Reserved" },
    };
    return map[status?.toLowerCase()] || map.issued;
  };

  const statusConfig = getStatusConfig(bookIssue.status);
  const StatusIcon = statusConfig.icon;
  const bookTitle = getBookTitle(bookIssue);
  const studentName = getStudentName(bookIssue);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const isOverdue = bookIssue.status?.toLowerCase() === "overdue";
  const isReturned = bookIssue.status?.toLowerCase() === "returned";
  const daysRemaining = useMemo(() => {
    if (!bookIssue.due_date || isReturned) return null;
    const today = new Date();
    const dueDate = new Date(bookIssue.due_date);
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  }, [bookIssue.due_date, isReturned]);

  const hasFine = bookIssue.fine && parseFloat(bookIssue.fine) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-purple-200 hover:shadow-lg"
    >
      <div className={`absolute left-0 top-0 h-full w-1 transition-colors duration-300 ${
        isOverdue ? 'bg-rose-400' :
        isReturned ? 'bg-emerald-400' :
        'bg-blue-400'
      }`} />

      <div className="p-5 pl-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Book Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {bookTitle}
              </h4>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
              {isOverdue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                  <Clock className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-gray-400" />
                {studentName || "N/A"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                Due: {formatDate(bookIssue.due_date)}
              </span>
              {hasFine && (
                <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <AlertCircle size={13} />
                  Fine: ${parseFloat(bookIssue.fine).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {daysRemaining !== null && !isReturned && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                daysRemaining > 7 ? "bg-emerald-100 text-emerald-700" :
                daysRemaining > 3 ? "bg-amber-100 text-amber-700" :
                "bg-rose-100 text-rose-700"
              }`}>
                <Clock size={12} />
                {daysRemaining > 0 ? `${daysRemaining}d left` : "Due today"}
              </div>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
            >
              {isExpanded ? "Less" : "More"}
              <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={() => onViewDetails(bookIssue)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="View Details"
            >
              <Eye size={18} />
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
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Book Details</p>
                  <p className="text-sm font-medium text-gray-800 mt-1">{bookTitle}</p>
                  {bookIssue.book?.author && (
                    <p className="text-xs text-gray-500">Author: {bookIssue.book.author}</p>
                  )}
                  {bookIssue.book?.isbn && (
                    <p className="text-xs text-gray-500">ISBN: {bookIssue.book.isbn}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Issue Details</p>
                  <p className="text-xs text-gray-600 mt-1">Issued: {formatDate(bookIssue.issued_date || bookIssue.created_at)}</p>
                  <p className="text-xs text-gray-600">Due: {formatDate(bookIssue.due_date)}</p>
                  {bookIssue.return_date && (
                    <p className="text-xs text-emerald-600">Returned: {formatDate(bookIssue.return_date)}</p>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status Info</p>
                  <p className="text-xs text-gray-600 mt-1 capitalize">Status: {bookIssue.status || "N/A"}</p>
                  {hasFine && (
                    <p className="text-xs text-rose-600 font-medium">Fine: ${parseFloat(bookIssue.fine).toFixed(2)}</p>
                  )}
                  {bookIssue.renewal_count > 0 && (
                    <p className="text-xs text-gray-600">Renewed: {bookIssue.renewal_count} times</p>
                  )}
                  {studentName && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <User size={11} />
                      {studentName}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── History Card ──────────────────────────────────────────────────────

const HistoryCard = ({ history }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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

  const getStatusLabel = (status) => {
    const map = {
      issued: "Issued",
      returned: "Returned",
      overdue: "Overdue",
      lost: "Lost",
      reserved: "Reserved",
    };
    return map[status?.toLowerCase()] || status || "N/A";
  };

  const bookTitle = getBookTitle(history);
  const studentName = getStudentName(history);
  const changedByName = getChangedByName(history);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{bookTitle}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <ArrowRight size={12} />
              <span className="text-gray-400">Status:</span>
              <span className="font-medium text-gray-700">
                {getStatusLabel(history.status_old)} → {getStatusLabel(history.status_new)}
              </span>
            </span>
            {studentName && (
              <span className="flex items-center gap-1">
                <User size={11} />
                {studentName}
              </span>
            )}
            {changedByName && (
              <span className="flex items-center gap-1 text-gray-400">
                <span>by</span>
                {changedByName}
              </span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400 flex-shrink-0">
          {formatDate(history.created_at)}
        </div>
      </div>
      {history.reason && (
        <p className="text-xs text-gray-400 mt-1 italic">"{history.reason}"</p>
      )}
    </motion.div>
  );
};

// ─── Book Details Modal ───────────────────────────────────────────────

const BookDetailsModal = ({ bookIssue, onClose }) => {
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

  if (!bookIssue) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      issued: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: BookOpen, label: "Issued" },
      returned: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: BookCheck, label: "Returned" },
      overdue: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Overdue" },
      lost: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: BookX, label: "Lost" },
      reserved: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: BookMarked, label: "Reserved" },
    };
    return map[status?.toLowerCase()] || map.issued;
  };

  const statusConfig = getStatusConfig(bookIssue.status);
  const StatusIcon = statusConfig.icon;
  const bookTitle = getBookTitle(bookIssue);
  const studentName = getStudentName(bookIssue);
  const hasFine = bookIssue.fine && parseFloat(bookIssue.fine) > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="mb-1 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {statusConfig.label}
                </span>
                {hasFine && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/30 px-3 py-0.5 text-xs font-medium text-rose-100">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Fine: ${parseFloat(bookIssue.fine).toFixed(2)}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">{bookTitle}</h2>
              {studentName && (
                <p className="text-sm text-white/70 flex items-center gap-1 mt-0.5">
                  <User size={14} />
                  {studentName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{bookIssue.status || "N/A"}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Book ID</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">#{bookIssue.book}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Issue & Return</p>
            <p className="text-sm text-gray-700 mt-1">Issued: {formatDate(bookIssue.issued_date || bookIssue.created_at)}</p>
            <p className="text-sm text-gray-700">Due: {formatDate(bookIssue.due_date)}</p>
            {bookIssue.return_date && (
              <p className="text-sm text-emerald-600">Returned: {formatDate(bookIssue.return_date)}</p>
            )}
          </div>

          {bookIssue.book?.author && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Author</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{bookIssue.book.author}</p>
            </div>
          )}

          {bookIssue.book?.isbn && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">ISBN</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{bookIssue.book.isbn}</p>
            </div>
          )}

          {bookIssue.book?.category && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium text-gray-800 mt-1">
                {typeof bookIssue.book.category === 'object' 
                  ? bookIssue.book.category.name 
                  : bookIssue.book.category}
              </p>
            </div>
          )}

          {bookIssue.book?.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Description</p>
              <p className="text-sm text-gray-600 mt-1">{bookIssue.book.description}</p>
            </div>
          )}

          {bookIssue.renewal_count > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Renewals</p>
              <p className="text-sm font-medium text-gray-800 mt-1">{bookIssue.renewal_count} times</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-12 text-center"
  >
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
        <Icon size={28} className="text-gray-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────

function Library() {
  const dispatch = useDispatch();
  const bookIssues = useSelector(selectStudentBookIssues);
  const bookHistory = useSelector(selectStudentBookIssueHistory);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const [selectedBook, setSelectedBook] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchBookIssues()).unwrap(),
        dispatch(fetchBookIssueHistory()).unwrap(),
      ]);
      
      // Debug: Check for new API fields
      if (bookIssues?.length > 0) {
        console.log("📊 Sample book issue fields:", Object.keys(bookIssues[0]));
        console.log("📊 book_title:", bookIssues[0].book_title);
        console.log("📊 student_name:", bookIssues[0].student_name);
      }
      if (bookHistory?.length > 0) {
        console.log("📊 Sample history fields:", Object.keys(bookHistory[0]));
        console.log("📊 book_title:", bookHistory[0].book_title);
        console.log("📊 student_name:", bookHistory[0].student_name);
        console.log("📊 changed_by_name:", bookHistory[0].changed_by_name);
      }
    } catch (err) {
      console.error("Error loading library data:", err);
      setToast({ message: "Failed to load library data", type: "error" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Library refreshed", type: "info" });
  };

  // Stats
  const stats = useMemo(() => {
    const total = bookIssues?.length || 0;
    const issued = bookIssues?.filter((b) => b.status?.toLowerCase() === "issued").length || 0;
    const returned = bookIssues?.filter((b) => b.status?.toLowerCase() === "returned").length || 0;
    const overdue = bookIssues?.filter((b) => b.status?.toLowerCase() === "overdue").length || 0;
    const totalFine = bookIssues?.reduce((sum, b) => {
      const fine = b.fine ? parseFloat(b.fine) : 0;
      return sum + (isNaN(fine) ? 0 : fine);
    }, 0) || 0;

    return { total, issued, returned, overdue, totalFine };
  }, [bookIssues]);

  // Filter book issues
  const filteredBooks = useMemo(() => {
    if (!bookIssues) return [];
    
    let filtered = bookIssues.filter((book) => {
      const matchesStatus = filterStatus === "all" || book.status?.toLowerCase() === filterStatus;
      const bookTitle = getBookTitle(book);
      const studentName = getStudentName(book);
      const matchesSearch = searchTerm === "" || 
        bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (studentName && studentName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    return filtered;
  }, [bookIssues, filterStatus, searchTerm]);

  // Handle view details
  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowDetailsModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setShowFilters(false);
  };

  if (loading && !bookIssues?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Library"
          subtitle="Manage your borrowed books and view your library history"
          breadcrumbs={["Student", "Library"]}
          bgColor="bg-purple-50"
          actions={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white/80 rounded-lg hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        <div className="mt-6" />

        {/* ─── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Books" value={stats.total} icon={LibraryIcon} color="purple" delay={0.05} />
          <StatCard label="Issued" value={stats.issued} icon={BookOpen} color="blue" delay={0.1} />
          <StatCard label="Returned" value={stats.returned} icon={BookCheck} color="emerald" delay={0.15} />
          <StatCard 
            label="Overdue" 
            value={stats.overdue} 
            subtext={`Total fine: $${stats.totalFine.toFixed(2)}`}
            icon={AlertCircle} 
            color="rose" 
            delay={0.2} 
          />
        </div>

        {/* ─── Filters ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showFilters || filterStatus !== "all"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={16} />
              Filters
              {filterStatus !== "all" && (
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {["all", "issued", "returned", "overdue", "lost", "reserved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilters(false); }}
                      className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                        filterStatus === status
                          ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {status === "all" ? "All" : status}
                    </button>
                  ))}
                </div>
                {(searchTerm || filterStatus !== "all") && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Results Count ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* ─── Book List ──────────────────────────────────────────────── */}
        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={Book}
            title={searchTerm || filterStatus !== "all" ? "No matching books found" : "No books issued"}
            description={
              searchTerm || filterStatus !== "all"
                ? "No books match your filters. Try adjusting your search."
                : "You haven't borrowed any books from the library yet."
            }
            action={(searchTerm || filterStatus !== "all") ? { 
              label: "Clear Filters", 
              onClick: clearFilters 
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredBooks.map((book, index) => (
              <BookIssueCard
                key={book.id}
                bookIssue={book}
                index={index}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* ─── History ────────────────────────────────────────────────── */}
        {bookHistory && bookHistory.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">History</h2>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {bookHistory.length}
              </span>
            </div>
            <div className="space-y-2">
              {bookHistory.slice(0, 5).map((history) => (
                <HistoryCard key={history.id} history={history} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Library Module</p>
        </div>

        {/* ─── Details Modal ───────────────────────────────────────────── */}
        <AnimatePresence>
          {showDetailsModal && selectedBook && (
            <BookDetailsModal
              bookIssue={selectedBook}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedBook(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Library;