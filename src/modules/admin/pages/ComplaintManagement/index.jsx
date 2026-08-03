// src/modules/admin/pages/ComplaintManagement/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Plus, Eye, CheckCircle, XCircle, Clock, 
  User, Mail, Calendar, MessageSquare, AlertCircle, X, 
  Filter, Edit, Trash2, RefreshCw
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
// Note: Since there's no specific "complaints" endpoint in the docs,
// we'll use a generic endpoint or you can update this to the correct one
const COMPLAINTS_API = "/complaints/";
// Alternative: If complaints are part of another module, use:
// const COMPLAINTS_API = "/support/tickets/";
// const COMPLAINTS_API = "/feedback/complaints/";

// ─── Helper Functions ──────────────────────────────────────────────────
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
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'in-progress':
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'pending':
      return <Clock className="w-3.5 h-3.5" />;
    case 'in-progress':
    case 'in_progress':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'resolved':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'rejected':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

const getPriorityBadge = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// ─── Main Component ────────────────────────────────────────────────────
const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingComplaint, setDeletingComplaint] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Complaints ──────────────────────────────────────────────────
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(COMPLAINTS_API);
      const data = response.data?.results || response.data || [];
      setComplaints(data);
      
      if (data.length === 0) {
        console.log("No complaints found in API response");
      }
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Complaints endpoint not found. The complaints module may not be configured.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view complaints.");
      } else {
        setError(error.response?.data?.detail || "Failed to load complaints");
      }
      setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ─── Refresh Handler ───────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplaints();
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredComplaints = useMemo(() => {
    let filtered = complaints;

    if (filterStatus !== "all") {
      filtered = filtered.filter(c => c.status?.toLowerCase() === filterStatus);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.student?.toLowerCase() || c.student_name?.toLowerCase() || "").includes(search) ||
        (c.subject?.toLowerCase() || "").includes(search) ||
        (c.description?.toLowerCase() || "").includes(search) ||
        (c.title?.toLowerCase() || "").includes(search)
      );
    }

    return filtered;
  }, [complaints, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);
  const hasActiveFilters = filterStatus !== "all" || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  // ─── Delete Handler ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingComplaint) return;
    setSaving(true);
    try {
      await api.delete(`${COMPLAINTS_API}${deletingComplaint.id}/`);
      setComplaints(complaints.filter(c => c.id !== deletingComplaint.id));
      showToast("Complaint deleted successfully", "success");
      setDeletingComplaint(null);
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      showToast("Failed to delete complaint", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status?.toLowerCase() === "pending").length,
    inProgress: complaints.filter(c => c.status?.toLowerCase() === "in-progress" || c.status?.toLowerCase() === "in_progress").length,
    resolved: complaints.filter(c => c.status?.toLowerCase() === "resolved").length,
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Complaint Management" 
            subtitle="Manage all complaints" 
            breadcrumbs={["Admin", "Complaint Management"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading complaints...</p>
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
          title="Complaint Management" 
          subtitle={`Manage all complaints${complaints.length > 0 ? ` — ${complaints.length} total` : ""}`}
          breadcrumbs={["Admin", "Complaint Management"]}
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
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => {}} // Open add complaint modal
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Complaint
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading complaints</p>
              <p className="text-amber-600">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All complaints</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            <p className="text-xs text-gray-400 mt-1">Being worked on</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.resolved}</p>
            <p className="text-xs text-gray-400 mt-1">Completed</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student, subject, or description..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm text-sm"
                  disabled={complaints.length === 0}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
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
            {complaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">No Complaints Found</p>
                    <p className="text-sm text-gray-400 mt-1 max-w-md">
                      {error && error.includes("not configured") 
                        ? "The complaints module is not available. Please contact your system administrator."
                        : "Complaints will appear here once submitted."}
                    </p>
                  </div>
                </div>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No complaints match your search</p>
                  <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((complaint) => {
                    const studentName = complaint.student || complaint.student_name || "Unknown";
                    const subject = complaint.subject || complaint.title || "—";
                    const description = complaint.description || "—";
                    const date = complaint.date || complaint.created_at || "";
                    const priority = complaint.priority || "medium";
                    const status = complaint.status || "pending";

                    return (
                      <tr key={complaint.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                              {studentName.charAt(0).toUpperCase() || "S"}
                            </div>
                            <span className="font-medium text-gray-900">{studentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700">{subject}</td>
                        <td className="px-4 py-3.5 text-gray-700 max-w-xs truncate" title={description}>
                          {description}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(date)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${getPriorityBadge(priority)} text-xs px-2.5 py-1`}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${getStatusBadge(status)} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                            {getStatusIcon(status)}
                            {getStatusLabel(status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedComplaint(complaint);
                                setDetailModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {}} // Open edit modal
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Edit complaint"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingComplaint(complaint)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete complaint"
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
            )}
          </div>

          {complaints.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filteredComplaints.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* Delete Confirmation */}
      {deletingComplaint && (
        <ConfirmDialog
          open={true}
          title="Delete Complaint"
          message={`Are you sure you want to delete this complaint from "${deletingComplaint.student || deletingComplaint.student_name || 'Unknown'}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingComplaint(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default ComplaintManagement;