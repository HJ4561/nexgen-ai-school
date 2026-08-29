/**
 * ============================================
 * PARENT SECURITY PAGE
 * ============================================
 * 
 * Purpose: Security monitoring for parents
 * Used by: Parent module routes
 * 
 * Features:
 * - Child entry/exit logs
 * - Access logs tracking
 * - Visitor information
 * - Real-time security monitoring
 * - Date filtering
 * - Security status indicators
 * 
 * Dependencies:
 * - react for component
 * - react-redux for state management
 * - lucide-react for icons
 * - @/components/ui/Card for containers
 * - @/components/ui/Badge for status indicators
 * - @/modules/parent/store/parentThunks for data fetching
 * 
 * Usage:
 * <Route path="/parent/security" element={<ParentSecurity />} />
 * ============================================
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Shield,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  fetchEntryExitLogs,
  fetchAccessLogs,
  fetchVisitors,
} from "@/modules/parent/store/parentThunks";
import { selectSelectedChild } from "@/modules/parent/store/parentSlice";

const ParentSecurity = () => {
  const dispatch = useDispatch();
  const selectedChild = useSelector(selectSelectedChild);
  const { entryExitLogs, accessLogs, visitors, loading } = useSelector((state) => state.parent);

  const [dateFilter, setDateFilter] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("entry-exit");

  useEffect(() => {
    if (selectedChild) {
      dispatch(fetchEntryExitLogs({ student_id: selectedChild }));
      dispatch(fetchAccessLogs({ student_id: selectedChild }));
      dispatch(fetchVisitors({ student_id: selectedChild }));
    }
  }, [dispatch, selectedChild]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "entry":
        return <Badge color="success">Entry</Badge>;
      case "exit":
        return <Badge color="warning">Exit</Badge>;
      case "approved":
        return <Badge color="success">Approved</Badge>;
      case "pending":
        return <Badge color="warning">Pending</Badge>;
      case "rejected":
        return <Badge color="danger">Rejected</Badge>;
      default:
        return <Badge color="secondary">{status || "N/A"}</Badge>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterByDate = (items) => {
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      return items.filter((item) => {
        const itemDate = new Date(item.entry_time || item.created_at).toDateString();
        return itemDate === today;
      });
    }
    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return items.filter((item) => {
        const itemDate = new Date(item.entry_time || item.created_at);
        return itemDate >= weekAgo;
      });
    }
    if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return items.filter((item) => {
        const itemDate = new Date(item.entry_time || item.created_at);
        return itemDate >= monthAgo;
      });
    }
    return items;
  };

  const filterBySearch = (items) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => {
      const searchable = [
        item.student_name,
        item.type,
        item.location,
        item.purpose,
        item.name,
        item.status,
      ].filter(Boolean);
      return searchable.some((field) => field.toLowerCase().includes(term));
    });
  };

  const filteredEntryExit = filterBySearch(filterByDate(entryExitLogs));
  const filteredAccess = filterBySearch(filterByDate(accessLogs));
  const filteredVisitors = filterBySearch(filterByDate(visitors));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      <PageHeader
        title="Security"
        subtitle="Monitor your child's entry/exit and security activities"
        breadcrumbs={["Parent", "Security"]}
        bgColor="bg-parent-light"
      />

      {/* ─── Stats Overview ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <LogIn size={18} />
            <p className="text-xs text-gray-500">Entries</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {entryExitLogs.filter((log) => log.type === "entry" || log.entry_time).length}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <LogOut size={18} />
            <p className="text-xs text-gray-500">Exits</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {entryExitLogs.filter((log) => log.type === "exit" || log.exit_time).length}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle2 size={18} />
            <p className="text-xs text-gray-500">Visitors</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{visitors.length}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Shield size={18} />
            <p className="text-xs text-gray-500">Access Logs</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{accessLogs.length}</p>
        </Card>
      </div>

      {/* ─── Filters ────────────────────────────────────────────────────── */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                tone={dateFilter === "today" ? "student" : "outline"}
                onClick={() => setDateFilter("today")}
              >
                Today
              </Button>
              <Button
                size="sm"
                tone={dateFilter === "week" ? "student" : "outline"}
                onClick={() => setDateFilter("week")}
              >
                Week
              </Button>
              <Button
                size="sm"
                tone={dateFilter === "month" ? "student" : "outline"}
                onClick={() => setDateFilter("month")}
              >
                Month
              </Button>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Tab Navigation ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("entry-exit")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "entry-exit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <LogIn size={16} />
            Entry/Exit Logs
          </span>
        </button>
        <button
          onClick={() => setActiveTab("access")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "access"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Shield size={16} />
            Access Logs
          </span>
        </button>
        <button
          onClick={() => setActiveTab("visitors")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "visitors"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <User size={16} />
            Visitors
          </span>
        </button>
      </div>

      {/* ─── Tab Content ────────────────────────────────────────────────── */}

      {/* Entry/Exit Logs */}
      {activeTab === "entry-exit" && (
        <Card>
          <div className="p-4 sm:p-6">
            {filteredEntryExit.length === 0 ? (
              <div className="py-8 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-secondary">No entry/exit logs found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEntryExit.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          log.type === "entry" || log.entry_time
                            ? "bg-emerald-100"
                            : "bg-amber-100"
                        }`}
                      >
                        {log.type === "entry" || log.entry_time ? (
                          <LogIn size={16} className="text-emerald-600" />
                        ) : (
                          <LogOut size={16} className="text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text-primary">
                            {log.student_name || "Student"}
                          </p>
                          {getStatusBadge(log.type || (log.entry_time ? "entry" : "exit"))}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(log.entry_time || log.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(log.entry_time || log.created_at)}
                          </span>
                          {log.exit_time && (
                            <span className="flex items-center gap-1">
                              <LogOut size={14} />
                              {formatTime(log.exit_time)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge color={log.exit_time ? "success" : "warning"}>
                      {log.exit_time ? "Completed" : "Active"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Access Logs */}
      {activeTab === "access" && (
        <Card>
          <div className="p-4 sm:p-6">
            {filteredAccess.length === 0 ? (
              <div className="py-8 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-secondary">No access logs found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full align-middle">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Device
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredAccess.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            {log.action || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(log.created_at)} {formatTime(log.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.ip_address || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.device || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Visitors */}
      {activeTab === "visitors" && (
        <Card>
          <div className="p-4 sm:p-6">
            {filteredVisitors.length === 0 ? (
              <div className="py-8 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-secondary">No visitors found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-text-primary">{visitor.name || "Visitor"}</p>
                          {getStatusBadge(visitor.status || "pending")}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                          <span>{visitor.purpose || "N/A"}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(visitor.in_time || visitor.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(visitor.in_time || visitor.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge color={visitor.status === "approved" ? "success" : "warning"}>
                      {visitor.status || "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ParentSecurity;