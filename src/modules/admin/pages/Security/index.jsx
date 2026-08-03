import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Shield, User, Clock, CheckCircle, XCircle, X, 
  RefreshCw, AlertCircle, Eye, Filter, ChevronDown,
  Calendar, Users, LogIn, LogOut, ShieldAlert, Activity
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
// Access Logs: /api/security/access-logs/
// Entry Exit Logs: /api/security/entry-exit-logs/
// Visitors: /api/security/visitors/

const ACCESS_LOGS_API = "/security/access-logs/";
const ENTRY_EXIT_LOGS_API = "/security/entry-exit-logs/";
const VISITORS_API = "/security/visitors/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

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

const formatTime = (timeString) => {
  if (!timeString) return "—";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status) => {
  switch(status?.toLowerCase()) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'success':
    case 'approved':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'failed':
    case 'rejected':
      return <XCircle className="w-3.5 h-3.5" />;
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

// 1. Access Logs Tab
const AccessLogsTab = ({ 
  logs, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  showFilters, setShowFilters,
  hasActiveFilters, clearFilters,
  pageSize, totalPages, startIndex, pageItems, filteredLogs
}) => {
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    failed: logs.filter(l => l.status === "failed").length,
  };

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading access logs</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Logs</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All access logs</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Successful</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.success}</p>
          <p className="text-xs text-gray-400 mt-1">Successful access</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-gray-400 mt-1">Failed attempts</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, action, or IP..."
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
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
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
                  <Shield className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No access logs found</p>
                <p className="text-sm text-gray-400">Access logs will appear here as users interact with the system</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">IP Address</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Device</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{log.user || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                        {log.action || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 font-mono">{log.ip_address || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{log.device || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={`${getStatusBadge(log.status)} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                        {getStatusIcon(log.status)}
                        {getStatusLabel(log.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 2. Entry Exit Logs Tab
const EntryExitLogsTab = ({ 
  logs, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  pageSize, totalPages, startIndex, pageItems, filteredLogs
}) => {
  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const today = new Date();
      const logDate = new Date(l.created_at);
      return logDate.getDate() === today.getDate() &&
             logDate.getMonth() === today.getMonth() &&
             logDate.getFullYear() === today.getFullYear();
    }).length,
    students: logs.filter(l => l.student).length,
  };

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading entry/exit logs</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entries</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All entries</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.today}</p>
          <p className="text-xs text-gray-400 mt-1">Today's entries</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
          <p className="text-2xl font-bold text-purple-600">{stats.students}</p>
          <p className="text-xs text-gray-400 mt-1">Student entries</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
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
                  <LogIn className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No entry/exit logs found</p>
                <p className="text-sm text-gray-400">Logs will appear here as students enter and exit</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entry Time</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {log.student || "Unknown Student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm text-gray-700">{formatTime(log.entry_time)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 3. Visitors Tab
const VisitorsTab = ({ 
  visitors, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  pageSize, totalPages, startIndex, pageItems, filteredVisitors
}) => {
  const stats = {
    total: visitors.length,
    approved: visitors.filter(v => v.approved_by).length,
    pending: visitors.filter(v => !v.approved_by).length,
  };

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading visitors</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visitors</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All visitors</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
          <p className="text-xs text-gray-400 mt-1">Approved visitors</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, purpose, or phone..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No visitors found</p>
                <p className="text-sm text-gray-400">Visitors will appear here when they check in</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">In Time</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{visitor.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{visitor.purpose || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{visitor.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{formatDateTime(visitor.in_time)}</td>
                    <td className="px-4 py-3.5">
                      <Badge className={`${visitor.approved_by ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                        {visitor.approved_by ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {visitor.approved_by ? "Approved" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {visitors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredVisitors.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Security = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState("access-logs");

  // Access Logs State
  const [accessLogs, setAccessLogs] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [accessError, setAccessError] = useState(false);
  const [accessErrorMessage, setAccessErrorMessage] = useState("");
  const [accessSearchTerm, setAccessSearchTerm] = useState("");
  const [accessCurrentPage, setAccessCurrentPage] = useState(1);
  const [accessFilterStatus, setAccessFilterStatus] = useState("all");
  const [showAccessFilters, setShowAccessFilters] = useState(false);

  // Entry Exit Logs State
  const [entryExitLogs, setEntryExitLogs] = useState([]);
  const [loadingEntryExit, setLoadingEntryExit] = useState(true);
  const [entryExitError, setEntryExitError] = useState(false);
  const [entryExitErrorMessage, setEntryExitErrorMessage] = useState("");
  const [entryExitSearchTerm, setEntryExitSearchTerm] = useState("");
  const [entryExitCurrentPage, setEntryExitCurrentPage] = useState(1);

  // Visitors State
  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [visitorsError, setVisitorsError] = useState(false);
  const [visitorsErrorMessage, setVisitorsErrorMessage] = useState("");
  const [visitorsSearchTerm, setVisitorsSearchTerm] = useState("");
  const [visitorsCurrentPage, setVisitorsCurrentPage] = useState(1);
  const [visitorsFilterStatus, setVisitorsFilterStatus] = useState("all");

  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Functions ──────────────────────────────────────────────────
  const fetchAccessLogs = useCallback(async () => {
    setLoadingAccess(true);
    setAccessError(false);
    setAccessErrorMessage("");
    try {
      const response = await api.get(ACCESS_LOGS_API);
      const data = response.data?.results || response.data || [];
      setAccessLogs(data);
    } catch (error) {
      console.error("Failed to fetch access logs:", error);
      setAccessError(true);
      setAccessErrorMessage(error.response?.data?.detail || "Failed to load access logs");
      setAccessLogs([]);
    } finally {
      setLoadingAccess(false);
    }
  }, []);

  const fetchEntryExitLogs = useCallback(async () => {
    setLoadingEntryExit(true);
    setEntryExitError(false);
    setEntryExitErrorMessage("");
    try {
      const response = await api.get(ENTRY_EXIT_LOGS_API);
      const data = response.data?.results || response.data || [];
      setEntryExitLogs(data);
    } catch (error) {
      console.error("Failed to fetch entry/exit logs:", error);
      setEntryExitError(true);
      setEntryExitErrorMessage(error.response?.data?.detail || "Failed to load entry/exit logs");
      setEntryExitLogs([]);
    } finally {
      setLoadingEntryExit(false);
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    setLoadingVisitors(true);
    setVisitorsError(false);
    setVisitorsErrorMessage("");
    try {
      const response = await api.get(VISITORS_API);
      const data = response.data?.results || response.data || [];
      setVisitors(data);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      setVisitorsError(true);
      setVisitorsErrorMessage(error.response?.data?.detail || "Failed to load visitors");
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAccessLogs(),
      fetchEntryExitLogs(),
      fetchVisitors(),
    ]);
    setRefreshing(false);
  }, [fetchAccessLogs, fetchEntryExitLogs, fetchVisitors]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredAccessLogs = useMemo(() => {
    let filtered = accessLogs;
    if (accessFilterStatus !== "all") {
      filtered = filtered.filter(l => l.status === accessFilterStatus);
    }
    if (accessSearchTerm) {
      const search = accessSearchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.user || "").toLowerCase().includes(search) ||
        (l.action || "").toLowerCase().includes(search) ||
        (l.ip_address || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [accessLogs, accessSearchTerm, accessFilterStatus]);

  const filteredEntryExitLogs = useMemo(() => {
    let filtered = entryExitLogs;
    if (entryExitSearchTerm) {
      const search = entryExitSearchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.student || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [entryExitLogs, entryExitSearchTerm]);

  const filteredVisitors = useMemo(() => {
    let filtered = visitors;
    if (visitorsFilterStatus !== "all") {
      filtered = filtered.filter(v => 
        visitorsFilterStatus === "approved" ? v.approved_by : !v.approved_by
      );
    }
    if (visitorsSearchTerm) {
      const search = visitorsSearchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        (v.name || "").toLowerCase().includes(search) ||
        (v.purpose || "").toLowerCase().includes(search) ||
        (v.phone || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [visitors, visitorsSearchTerm, visitorsFilterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const accessTotalPages = Math.max(1, Math.ceil(filteredAccessLogs.length / pageSize));
  const accessStartIndex = (accessCurrentPage - 1) * pageSize;
  const accessPageItems = filteredAccessLogs.slice(accessStartIndex, accessStartIndex + pageSize);

  const entryExitTotalPages = Math.max(1, Math.ceil(filteredEntryExitLogs.length / pageSize));
  const entryExitStartIndex = (entryExitCurrentPage - 1) * pageSize;
  const entryExitPageItems = filteredEntryExitLogs.slice(entryExitStartIndex, entryExitStartIndex + pageSize);

  const visitorsTotalPages = Math.max(1, Math.ceil(filteredVisitors.length / pageSize));
  const visitorsStartIndex = (visitorsCurrentPage - 1) * pageSize;
  const visitorsPageItems = filteredVisitors.slice(visitorsStartIndex, visitorsStartIndex + pageSize);

  const hasActiveFilters = accessFilterStatus !== "all" || accessSearchTerm;

  const clearFilters = () => {
    setAccessSearchTerm("");
    setAccessFilterStatus("all");
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: "access-logs", label: "Access Logs", icon: <Shield className="w-4 h-4" />, count: accessLogs.length },
    { id: "entry-exit", label: "Entry/Exit Logs", icon: <LogIn className="w-4 h-4" />, count: entryExitLogs.length },
    { id: "visitors", label: "Visitors", icon: <Users className="w-4 h-4" />, count: visitors.length },
  ];

  return (
    <FadeIn>
      <div className="space-y-6">
        <PageHeader
          title="Security"
          subtitle="Monitor security logs, entry/exit records, and visitors"
          breadcrumbs={["Admin", "Security"]}
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
        {activeTab === "access-logs" && (
          <AccessLogsTab
            logs={accessLogs}
            loading={loadingAccess}
            error={accessError}
            errorMessage={accessErrorMessage}
            searchTerm={accessSearchTerm}
            setSearchTerm={setAccessSearchTerm}
            currentPage={accessCurrentPage}
            setCurrentPage={setAccessCurrentPage}
            filterStatus={accessFilterStatus}
            setFilterStatus={setAccessFilterStatus}
            showFilters={showAccessFilters}
            setShowFilters={setShowAccessFilters}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            pageSize={pageSize}
            totalPages={accessTotalPages}
            startIndex={accessStartIndex}
            pageItems={accessPageItems}
            filteredLogs={filteredAccessLogs}
          />
        )}

        {activeTab === "entry-exit" && (
          <EntryExitLogsTab
            logs={entryExitLogs}
            loading={loadingEntryExit}
            error={entryExitError}
            errorMessage={entryExitErrorMessage}
            searchTerm={entryExitSearchTerm}
            setSearchTerm={setEntryExitSearchTerm}
            currentPage={entryExitCurrentPage}
            setCurrentPage={setEntryExitCurrentPage}
            pageSize={pageSize}
            totalPages={entryExitTotalPages}
            startIndex={entryExitStartIndex}
            pageItems={entryExitPageItems}
            filteredLogs={filteredEntryExitLogs}
          />
        )}

        {activeTab === "visitors" && (
          <VisitorsTab
            visitors={visitors}
            loading={loadingVisitors}
            error={visitorsError}
            errorMessage={visitorsErrorMessage}
            searchTerm={visitorsSearchTerm}
            setSearchTerm={setVisitorsSearchTerm}
            currentPage={visitorsCurrentPage}
            setCurrentPage={setVisitorsCurrentPage}
            filterStatus={visitorsFilterStatus}
            setFilterStatus={setVisitorsFilterStatus}
            pageSize={pageSize}
            totalPages={visitorsTotalPages}
            startIndex={visitorsStartIndex}
            pageItems={visitorsPageItems}
            filteredVisitors={filteredVisitors}
          />
        )}
      </div>

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

export default Security;