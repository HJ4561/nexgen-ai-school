// src/modules/admin/pages/AccessLogs/index.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, RefreshCw, AlertCircle, Eye, Filter, ChevronDown,
  X, Shield, User, Clock, Monitor, MapPin, Globe,
  Smartphone, Laptop, Tablet, ChevronRight, CalendarDays,
  Download, FileText
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints ──────────────────────────────────────────────────────
const ACCESS_LOGS_API = "/security/access-logs/";

// ─── Constants ──────────────────────────────────────────────────────────
const ACTION_TYPES = {
  viewed_dashboard: { label: "Viewed Dashboard", color: "bg-blue-50 text-blue-700 border-blue-200" },
  viewed_students: { label: "Viewed Students", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  viewed_teachers: { label: "Viewed Teachers", color: "bg-purple-50 text-purple-700 border-purple-200" },
  viewed_parents: { label: "Viewed Parents", color: "bg-amber-50 text-amber-700 border-amber-200" },
  viewed_staff: { label: "Viewed Staff", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  viewed_finance: { label: "Viewed Finance", color: "bg-green-50 text-green-700 border-green-200" },
  viewed_reports: { label: "Viewed Reports", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  viewed_settings: { label: "Viewed Settings", color: "bg-gray-50 text-gray-700 border-gray-200" },
  viewed_attendance: { label: "Viewed Attendance", color: "bg-rose-50 text-rose-700 border-rose-200" },
  viewed_exams: { label: "Viewed Exams", color: "bg-orange-50 text-orange-700 border-orange-200" },
  viewed_assignments: { label: "Viewed Assignments", color: "bg-teal-50 text-teal-700 border-teal-200" },
  viewed_hr: { label: "Viewed HR", color: "bg-pink-50 text-pink-700 border-pink-200" },
  viewed_transport: { label: "Viewed Transport", color: "bg-sky-50 text-sky-700 border-sky-200" },
  viewed_library: { label: "Viewed Library", color: "bg-violet-50 text-violet-700 border-violet-200" },
  viewed_canteen: { label: "Viewed Canteen", color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  viewed_security: { label: "Viewed Security", color: "bg-red-50 text-red-700 border-red-200" },
  viewed_ptm: { label: "Viewed PTM", color: "bg-lime-50 text-lime-700 border-lime-200" },
  viewed_events: { label: "Viewed Events", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  viewed_documents: { label: "Viewed Documents", color: "bg-stone-50 text-stone-700 border-stone-200" },
  login: { label: "Login", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  logout: { label: "Logout", color: "bg-red-50 text-red-700 border-red-200" },
  create: { label: "Created", color: "bg-blue-50 text-blue-700 border-blue-200" },
  update: { label: "Updated", color: "bg-amber-50 text-amber-700 border-amber-200" },
  delete: { label: "Deleted", color: "bg-red-50 text-red-700 border-red-200" },
};

const DEVICE_TYPES = {
  web: { label: "Web", icon: Monitor },
  mobile: { label: "Mobile", icon: Smartphone },
  tablet: { label: "Tablet", icon: Tablet },
  api: { label: "API", icon: Globe },
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
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getDeviceIcon = (device) => {
  if (!device) return Monitor;
  const deviceLower = device.toLowerCase();
  if (deviceLower.includes("mobile") || deviceLower.includes("android") || deviceLower.includes("ios")) {
    return Smartphone;
  }
  if (deviceLower.includes("tablet") || deviceLower.includes("ipad")) {
    return Tablet;
  }
  if (deviceLower.includes("api")) {
    return Globe;
  }
  return Monitor;
};

// ─── Details Modal ──────────────────────────────────────────────────────
const DetailsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const actionInfo = ACTION_TYPES[data.action] || { label: data.action, color: "bg-gray-50 text-gray-700 border-gray-200" };
  const DeviceIcon = getDeviceIcon(data.device);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Access Log Details
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">User</p>
              <p className="font-medium text-gray-800 mt-1">{data.user_name || data.user || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Action</p>
              <div className="mt-1">
                <Badge className={`${actionInfo.color} text-xs`}>{actionInfo.label}</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">IP Address</p>
              <p className="font-medium text-gray-800 mt-1">{data.ip_address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Device</p>
              <p className="font-medium text-gray-800 mt-1 flex items-center gap-2">
                <DeviceIcon className="w-4 h-4 text-gray-500" />
                {data.device || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Via</p>
              <p className="font-medium text-gray-800 mt-1">{data.via || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p className="font-medium text-gray-800 mt-1">{formatDateTime(data.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const AccessLogs = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterVia, setFilterVia] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const itemsPerPage = 10;

  // ─── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ─────────────────────────────────────────────────────────
  const fetchAccessLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(ACCESS_LOGS_API);
      const data = response.data?.results || response.data || [];
      setAccessLogs(data);
    } catch (error) {
      console.error("Failed to fetch access logs:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Access logs endpoint not found. The security module may not be configured.");
      } else {
        setError(error.response?.data?.detail || "Failed to load access logs");
      }
      setAccessLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessLogs();
  }, [fetchAccessLogs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAccessLogs();
    showToast("Access logs refreshed", "success");
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    return accessLogs.filter(log => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const actionLabel = ACTION_TYPES[log.action]?.label || log.action || "";
        const userName = log.user_name || log.user || "";
        if (!actionLabel.toLowerCase().includes(search) &&
            !userName.toLowerCase().includes(search) &&
            !(log.ip_address || "").toLowerCase().includes(search) &&
            !(log.device || "").toLowerCase().includes(search)) {
          return false;
        }
      }

      // Action filter
      if (filterAction !== "all" && log.action !== filterAction) {
        return false;
      }

      // Via filter
      if (filterVia !== "all" && log.via !== filterVia) {
        return false;
      }

      // Date filter
      if (filterDate && log.created_at) {
        const logDate = new Date(log.created_at).toISOString().split('T')[0];
        if (logDate !== filterDate) {
          return false;
        }
      }

      return true;
    });
  }, [accessLogs, searchTerm, filterAction, filterVia, filterDate]);

  // ─── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // ─── Export CSV ──────────────────────────────────────────────────────
  const handleExport = () => {
    if (filteredLogs.length === 0) {
      showToast("No logs to export", "error");
      return;
    }

    const headers = ["User", "Action", "IP Address", "Device", "Via", "Created At"];
    const rows = filteredLogs.map(log => [
      log.user_name || log.user || "",
      ACTION_TYPES[log.action]?.label || log.action || "",
      log.ip_address || "",
      log.device || "",
      log.via || "",
      formatDateTime(log.created_at),
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `access_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${filteredLogs.length} logs exported`, "success");
  };

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = accessLogs.length;
    const uniqueUsers = new Set(accessLogs.map(log => log.user)).size;
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = accessLogs.filter(log => {
      if (!log.created_at) return false;
      return new Date(log.created_at).toISOString().split('T')[0] === today;
    }).length;
    const uniqueActions = new Set(accessLogs.map(log => log.action)).size;
    return { total, uniqueUsers, todayLogs, uniqueActions };
  }, [accessLogs]);

  // ─── Unique Actions for Filter ──────────────────────────────────────
  const uniqueActions = useMemo(() => {
    const actions = new Set(accessLogs.map(log => log.action).filter(Boolean));
    return Array.from(actions);
  }, [accessLogs]);

  const uniqueVias = useMemo(() => {
    const vias = new Set(accessLogs.map(log => log.via).filter(Boolean));
    return Array.from(vias);
  }, [accessLogs]);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="Access Logs" subtitle="Monitor system access and activity" breadcrumbs={["Admin", "Security", "Access Logs"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading access logs...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Access Logs" 
          subtitle={`Monitor system access and activity${accessLogs.length > 0 ? ` — ${accessLogs.length} logs recorded` : ""}`}
          breadcrumbs={["Admin", "Security", "Access Logs"]}
          icon={Shield}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading access logs</p>
              <p className="text-amber-600">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Logs</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All activities</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Logs</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.todayLogs}</p>
            <p className="text-xs text-gray-400 mt-1">Today's activity</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Users</p>
            <p className="text-2xl font-bold text-purple-600">{stats.uniqueUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Active users</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Actions</p>
            <p className="text-2xl font-bold text-amber-600">{stats.uniqueActions}</p>
            <p className="text-xs text-gray-400 mt-1">Action types</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* ─── Search & Filters ────────────────────────────────────────── */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user, action, IP address, or device..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterAction}
                  onChange={(e) => { setFilterAction(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Actions</option>
                  {uniqueActions.map(action => {
                    const info = ACTION_TYPES[action] || { label: action };
                    return <option key={action} value={action}>{info.label}</option>;
                  })}
                </select>
                <select
                  value={filterVia}
                  onChange={(e) => { setFilterVia(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Via</option>
                  {uniqueVias.map(via => (
                    <option key={via} value={via}>{via}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                />
                {(filterAction !== "all" || filterVia !== "all" || filterDate || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilterAction("all");
                      setFilterVia("all");
                      setFilterDate("");
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Table ───────────────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            {accessLogs.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">No Access Logs Found</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-md">
                      {error && error.includes("not configured")
                        ? "The security module is not available. Please contact your system administrator."
                        : "Access logs will appear here as users interact with the system."}
                    </p>
                  </div>
                </div>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">No Matching Logs</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                  </div>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Via</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((log) => {
                    const actionInfo = ACTION_TYPES[log.action] || { label: log.action || "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200" };
                    const DeviceIcon = getDeviceIcon(log.device);
                    return (
                      <tr key={log.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">{log.user_name || log.user || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${actionInfo.color} text-xs`}>{actionInfo.label}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700 font-mono">{log.ip_address || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <DeviceIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-700">{log.device || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs">{log.via || "—"}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{formatDateTime(log.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setSelectedItem(log); setDetailsModalOpen(true); }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {accessLogs.length > 0 && (
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
      </div>

      {/* ─── Details Modal ──────────────────────────────────────────────── */}
      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedItem(null); }}
        data={selectedItem}
      />

      {/* ─── Toast ────────────────────────────────────────────────────────── */}
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

export default AccessLogs;