// src/modules/parent/pages/BehaviorLogs.jsx

/**
 * ============================================
 * PARENT BEHAVIOR LOGS COMPONENT
 * ============================================
 * 
 * Purpose: View child behavior records and feedback
 * Used by: Parent module routes
 * 
 * API Endpoints:
 * - GET /api/attendance/behavior-logs/ - Get behavior logs
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from behavior logs (read-only)
 * - teacher_name from behavior logs (read-only)
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
  Eye,
  X,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Filter,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchParentLinks,
  fetchBehaviorLogs,
  fetchBehaviorStats,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectBehaviorLogs,
  selectBehaviorStats,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

import { setSelectedChild } from "@/modules/parent/store/parentSlice";

// ─── Constants ──────────────────────────────────────────────────────────

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

const getTypeBadge = (type) => {
  if (type === "positive" || type === "Positive") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <ThumbsUp className="w-3 h-3" />
        Positive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
      <ThumbsDown className="w-3 h-3" />
      Negative
    </span>
  );
};

const getSeverityBadge = (severity) => {
  const config = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-rose-100 text-rose-700",
  };
  const color = config[severity?.toLowerCase()] || config.medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {severity || "Medium"}
    </span>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

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

// ─── Behavior Detail Drawer ─────────────────────────────────────────────

const BehaviorDetailDrawer = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

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
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Behavior Details
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            {getTypeBadge(log.type)}
            {getSeverityBadge(log.severity)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm leading-relaxed">
              {log.description}
            </div>
          </div>

          {log.action_taken && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Action Taken</label>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-sm leading-relaxed">
                {log.action_taken}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student</label>
              <p className="text-sm font-medium text-gray-800">
                {log.student_name || log.student?.name || "—"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Teacher</label>
              <p className="text-sm font-medium text-gray-800">
                {log.teacher_name || log.teacher?.name || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Date</label>
              <p className="text-sm text-gray-600">{formatDate(log.date)}</p>
            </div>
            {log.created_at && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Recorded</label>
                <p className="text-sm text-gray-600">{formatDateTime(log.created_at)}</p>
              </div>
            )}
          </div>
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

// ─── Main Component ──────────────────────────────────────────────────────

const BehaviorLogs = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const logs = useSelector(selectBehaviorLogs);
  const stats = useSelector(selectBehaviorStats);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Data Fetching ────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchParentLinks()).unwrap(),
        dispatch(fetchBehaviorLogs()).unwrap(),
        dispatch(fetchBehaviorStats({})).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading behavior logs:", err);
      setToast({ message: "Failed to load behavior logs", type: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    let filtered = logs || [];

    // Filter by child
    if (selectedChild) {
      filtered = filtered.filter(l => l.student === selectedChild || l.student_id === selectedChild);
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.description?.toLowerCase().includes(search) ||
        l.action_taken?.toLowerCase().includes(search) ||
        l.teacher_name?.toLowerCase().includes(search) ||
        l.teacher?.name?.toLowerCase().includes(search)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(l => l.type?.toLowerCase() === filterType);
    }

    // Filter by severity
    if (filterSeverity !== "all") {
      filtered = filtered.filter(l => l.severity?.toLowerCase() === filterSeverity);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

    return filtered;
  }, [logs, selectedChild, searchTerm, filterType, filterSeverity]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    dispatch(setSelectedChild(childId));
    setCurrentPage(1);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Behavior logs refreshed", type: "info" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterSeverity("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterSeverity !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
        <PageHeader 
          title="Behavior Logs" 
          subtitle="View your child's behavior records" 
          breadcrumbs={["Parent", "Behavior Logs"]}
          bgColor="bg-indigo-50"
        />
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading behavior logs...</p>
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
        title="Behavior Logs"
        subtitle="View your child's behavior records and feedback"
        breadcrumbs={["Parent", "Behavior Logs"]}
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
          </div>
        }
      />

      {/* ─── Error State ────────────────────────────────────────────── */}
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
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-indigo-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Records</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{stats?.total || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">All behavior records</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-emerald-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Positive</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.positive || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Positive feedback</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 border-l-4 border-l-rose-500"
        >
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Needs Improvement</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{stats?.negative || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Negative feedback</p>
        </motion.div>
      </div>

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
            loading={loading}
          />

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or action..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            >
              <option value="all">All Types</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
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

      {/* ─── Logs List ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {pageItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">No behavior logs found</p>
            <p className="text-sm text-gray-400 mt-1">
              {hasActiveFilters || selectedChild ? 'Try adjusting your filters' : 'Behavior records will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              {pageItems.map((log) => (
                <div key={log.id} className="p-4 hover:bg-indigo-50/30 transition-colors border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {getTypeBadge(log.type)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{log.description}</p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(log.date)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(log)}
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
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Severity</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Teacher</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((log) => (
                    <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {log.description}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {getTypeBadge(log.type)}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">
                          {log.teacher_name || log.teacher?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-500">{formatDate(log.date)}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleViewDetails(log)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} entries
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

      {/* ─── Behavior Detail Drawer ──────────────────────────────────── */}
      <AnimatePresence>
        {isDrawerOpen && selectedLog && (
          <BehaviorDetailDrawer
            isOpen={isDrawerOpen}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedLog(null);
            }}
            log={selectedLog}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Behavior Logs Module</p>
      </div>
    </div>
  );
};

export default BehaviorLogs;