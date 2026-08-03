// src/modules/admin/pages/Visitors/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, X, RefreshCw, AlertCircle, CheckCircle, 
  Edit, Trash2, Eye, Search, Filter, ChevronDown,
  Users, User, Calendar, Clock, Phone, Mail,
  MapPin, Shield, UserCheck, UserX, LogIn,
  Building, Briefcase
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const VISITORS_API = "/security/visitors/";
const USERS_API = "/users/users/";

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

const VISITOR_STATUS = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200" },
  checked_in: { label: "Checked In", color: "bg-blue-50 text-blue-700 border-blue-200" },
  checked_out: { label: "Checked Out", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [deletingVisitor, setDeletingVisitor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    purpose: "",
    in_time: "",
    approved_by: "",
    notes: "",
  });
  const itemsPerPage = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitorsRes, usersRes] = await Promise.all([
        api.get(VISITORS_API),
        api.get(USERS_API),
      ]);
      setVisitors(visitorsRes.data?.results || visitorsRes.data || []);
      setUsers(usersRes.data?.results || usersRes.data || []);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Visitors endpoint not found.");
      } else {
        setError(error.response?.data?.detail || "Failed to load visitors");
      }
      setVisitors([]);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    showToast("Visitors refreshed", "success");
  };

  const getUserName = (userId) => {
    if (!userId) return "—";
    const user = users.find(u => u.id === userId);
    return user?.name || user?.full_name || "—";
  };

  const getVisitorStatus = (visitor) => {
    if (visitor.approved_by && visitor.in_time && !visitor.out_time) {
      return { label: "Checked In", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (visitor.approved_by && visitor.out_time) {
      return { label: "Checked Out", color: "bg-gray-50 text-gray-700 border-gray-200" };
    }
    if (visitor.approved_by) {
      return { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    if (visitor.rejected) {
      return { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200" };
    }
    return { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" };
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter(visitor => {
      if (filterStatus !== "all") {
        const status = getVisitorStatus(visitor);
        if (filterStatus === "approved" && !visitor.approved_by) return false;
        if (filterStatus === "pending" && visitor.approved_by) return false;
        if (filterStatus === "checked_in" && (!visitor.approved_by || !visitor.in_time)) return false;
        if (filterStatus === "checked_out" && (!visitor.approved_by || !visitor.out_time)) return false;
        if (filterStatus === "rejected" && !visitor.rejected) return false;
      }
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (visitor.name?.toLowerCase() || "").includes(search) ||
             (visitor.phone?.toLowerCase() || "").includes(search) ||
             (visitor.purpose?.toLowerCase() || "").includes(search);
    });
  }, [visitors, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredVisitors.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredVisitors.slice(startIndex, startIndex + itemsPerPage);

  const stats = useMemo(() => {
    const total = visitors.length;
    const pending = visitors.filter(v => !v.approved_by && !v.rejected).length;
    const approved = visitors.filter(v => v.approved_by && !v.out_time).length;
    const checkedIn = visitors.filter(v => v.approved_by && v.in_time && !v.out_time).length;
    const checkedOut = visitors.filter(v => v.approved_by && v.out_time).length;
    const rejected = visitors.filter(v => v.rejected).length;
    return { total, pending, approved, checkedIn, checkedOut, rejected };
  }, [visitors]);

  const handleSaveVisitor = async () => {
    if (!formData.name || !formData.phone || !formData.purpose) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        purpose: formData.purpose,
        in_time: formData.in_time || new Date().toISOString(),
        approved_by: formData.approved_by ? Number(formData.approved_by) : null,
        notes: formData.notes || "",
      };

      if (modalMode === "edit" && selectedVisitor) {
        const response = await api.patch(`${VISITORS_API}${selectedVisitor.id}/`, payload);
        setVisitors(visitors.map(v => v.id === selectedVisitor.id ? { ...v, ...response.data } : v));
        showToast("Visitor updated successfully", "success");
      } else {
        const response = await api.post(VISITORS_API, payload);
        setVisitors([response.data, ...visitors]);
        showToast("Visitor added successfully", "success");
      }
      setModalOpen(false);
      setFormData({ name: "", phone: "", purpose: "", in_time: "", approved_by: "", notes: "" });
      setSelectedVisitor(null);
    } catch (error) {
      console.error("Failed to save visitor:", error);
      showToast(error.response?.data?.detail || "Failed to save visitor", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (visitorId) => {
    setSaving(true);
    try {
      const response = await api.patch(`${VISITORS_API}${visitorId}/`, {
        in_time: new Date().toISOString(),
        approved_by: 1, // Use current admin ID
      });
      setVisitors(visitors.map(v => v.id === visitorId ? { ...v, ...response.data } : v));
      showToast("Visitor checked in successfully", "success");
    } catch (error) {
      console.error("Failed to check in visitor:", error);
      showToast(error.response?.data?.detail || "Failed to check in", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async (visitorId) => {
    setSaving(true);
    try {
      const response = await api.patch(`${VISITORS_API}${visitorId}/`, {
        out_time: new Date().toISOString(),
      });
      setVisitors(visitors.map(v => v.id === visitorId ? { ...v, ...response.data } : v));
      showToast("Visitor checked out successfully", "success");
    } catch (error) {
      console.error("Failed to check out visitor:", error);
      showToast(error.response?.data?.detail || "Failed to check out", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVisitor) return;
    setSaving(true);
    try {
      await api.delete(`${VISITORS_API}${deletingVisitor.id}/`);
      setVisitors(prev => prev.filter(item => item.id !== deletingVisitor.id));
      showToast("Visitor deleted", "success");
      setDeletingVisitor(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast(error.response?.data?.detail || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="Visitors" subtitle="Manage visitors" breadcrumbs={["Admin", "Security", "Visitors"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading visitors...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Visitors" 
          subtitle={`Manage visitor check-ins and check-outs${visitors.length > 0 ? ` — ${visitors.length} visitors` : ""}`}
          breadcrumbs={["Admin", "Security", "Visitors"]}
          action={
            <div className="flex items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button onClick={() => { setModalMode("add"); setFormData({ name: "", phone: "", purpose: "", in_time: "", approved_by: "", notes: "" }); setModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                <Plus className="w-4 h-4" /> Add Visitor
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading visitors</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All visitors</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            <p className="text-xs text-gray-400 mt-1">Approved</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In</p>
            <p className="text-2xl font-bold text-blue-600">{stats.checkedIn}</p>
            <p className="text-xs text-gray-400 mt-1">Currently inside</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-gray-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Checked Out</p>
            <p className="text-2xl font-bold text-gray-600">{stats.checkedOut}</p>
            <p className="text-xs text-gray-400 mt-1">Left premises</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-gray-400 mt-1">Not approved</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by name, phone, or purpose..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={clearFilters} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {visitors.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-10 h-10 text-gray-400" /></div>
                  <div><p className="text-gray-500 font-medium text-lg">No Visitors Found</p><p className="text-sm text-gray-400 mt-1">Add a visitor to get started.</p></div>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">In Time</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((visitor) => {
                    const status = getVisitorStatus(visitor);
                    return (
                      <tr key={visitor.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-4 h-4 text-gray-600" /></div>
                            <span className="font-medium text-gray-900">{visitor.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{visitor.phone || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-xs">{visitor.purpose || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{visitor.in_time ? formatDateTime(visitor.in_time) : "—"}</td>
                        <td className="px-4 py-3.5"><Badge className={`${status.color} text-xs`}>{status.label}</Badge></td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {!visitor.approved_by && !visitor.rejected && (
                              <button onClick={() => handleCheckIn(visitor.id)} disabled={saving} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" title="Approve & Check In">
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                            {visitor.approved_by && !visitor.out_time && (
                              <button onClick={() => handleCheckOut(visitor.id)} disabled={saving} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all" title="Check Out">
                                <LogIn className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => { setSelectedVisitor(visitor); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => { setModalMode("edit"); setSelectedVisitor(visitor); setFormData({ name: visitor.name || "", phone: visitor.phone || "", purpose: visitor.purpose || "", in_time: visitor.in_time || "", approved_by: visitor.approved_by || "", notes: visitor.notes || "" }); setModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setDeletingVisitor(visitor)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {visitors.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} itemsShown={pageItems.length} totalItems={filteredVisitors.length} onPageChange={setCurrentPage} />
          )}
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setModalOpen(false); setSelectedVisitor(null); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" />{modalMode === "add" ? "Add Visitor" : "Edit Visitor"}</h3>
              <button onClick={() => { setModalOpen(false); setSelectedVisitor(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter visitor name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Phone <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Purpose <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter purpose of visit" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">In Time</label>
                <input type="datetime-local" value={formData.in_time ? formData.in_time.slice(0, 16) : ""} onChange={(e) => setFormData({ ...formData, in_time: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Approved By</label>
                <select value={formData.approved_by} onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                  <option value="">Select approver...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name || u.full_name}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} placeholder="Enter notes..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setModalOpen(false); setSelectedVisitor(null); }} disabled={saving} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveVisitor} disabled={saving || !formData.name || !formData.phone || !formData.purpose} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{modalMode === "add" ? "Add Visitor" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsModalOpen && selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDetailsModalOpen(false); setSelectedVisitor(null); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">Visitor Details</h3>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedVisitor(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 mt-1">{selectedVisitor.name || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-gray-800 mt-1">{selectedVisitor.phone || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Purpose</p><p className="font-medium text-gray-800 mt-1">{selectedVisitor.purpose || "—"}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><Badge className={`${getVisitorStatus(selectedVisitor).color} mt-1`}>{getVisitorStatus(selectedVisitor).label}</Badge></div>
                <div><p className="text-xs text-gray-500">In Time</p><p className="font-medium text-gray-800 mt-1">{selectedVisitor.in_time ? formatDateTime(selectedVisitor.in_time) : "—"}</p></div>
                <div><p className="text-xs text-gray-500">Out Time</p><p className="font-medium text-gray-800 mt-1">{selectedVisitor.out_time ? formatDateTime(selectedVisitor.out_time) : "—"}</p></div>
                <div><p className="text-xs text-gray-500">Approved By</p><p className="font-medium text-gray-800 mt-1">{getUserName(selectedVisitor.approved_by)}</p></div>
                <div><p className="text-xs text-gray-500">Created</p><p className="font-medium text-gray-800 mt-1">{formatDate(selectedVisitor.created_at)}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-gray-600 mt-1">{selectedVisitor.notes || "—"}</p></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setDetailsModalOpen(false); setSelectedVisitor(null); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {deletingVisitor && (
        <ConfirmDialog open={true} title="Delete Visitor" message={`Are you sure you want to delete this visitor?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeletingVisitor(null)} loading={saving} />
      )}

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

export default Visitors;