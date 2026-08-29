// src/modules/admin/pages/Subjects.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, BookOpen, X, RefreshCw, 
  AlertCircle, CheckCircle, Loader2, Hash, FileText, Calendar 
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// --- Helper Functions --------------------------------------------------
const getInitials = (name) => {
  if (!name) return "S";
  return name.charAt(0).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Ã¢â‚¬â€";
  }
};

// --- Main Component ----------------------------------------------------
const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });
  const pageSize = 10;

  // --- Toast ----------------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch Subjects --------------------------------------------------
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    try {
      const response = await api.get("/academics/subjects/");
      const data = response.data?.results || response.data || [];
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || "Failed to load subjects");
      showToast("Failed to load subjects", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // --- Refresh Handler ----------------------------------------------
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubjects();
  }, [fetchSubjects]);

  // --- Clear Search ----------------------------------------------
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // --- Modal Handlers ----------------------------------------------
  const openAdd = useCallback(() => {
    setEditingSubject(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      description: subject.description || "",
      is_active: subject.is_active !== undefined ? subject.is_active : true,
    });
    setModalOpen(true);
  }, []);

  const openDetail = useCallback((subject) => {
    setSelectedSubject(subject);
    setDetailModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingSubject(null);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedSubject(null);
  }, []);

  // --- Submit Handler ----------------------------------------------
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Please enter a subject name", "error");
      return;
    }
    if (!formData.code.trim()) {
      showToast("Please enter a subject code", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || "",
        is_active: formData.is_active,
      };

      if (editingSubject) {
        const response = await api.patch(`/academics/subjects/${editingSubject.id}/`, payload);
        setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...response.data } : s));
        showToast("Subject updated successfully", "success");
      } else {
        const response = await api.post("/academics/subjects/", payload);
        setSubjects(prev => [response.data, ...prev]);
        showToast("Subject created successfully", "success");
      }
      setModalOpen(false);
      setEditingSubject(null);
    } catch (error) {
      console.error("Failed to save subject:", error);
      showToast(error.response?.data?.detail || "Failed to save subject", "error");
    } finally {
      setSaving(false);
    }
  }, [formData, editingSubject, showToast]);

  // --- Delete Handler ----------------------------------------------
  const handleDelete = useCallback(async () => {
    if (!deletingSubject) return;
    setSaving(true);
    try {
      await api.delete(`/academics/subjects/${deletingSubject.id}/`);
      setSubjects(prev => prev.filter(s => s.id !== deletingSubject.id));
      showToast("Subject deleted successfully", "success");
      setDeletingSubject(null);
    } catch (error) {
      console.error("Failed to delete subject:", error);
      showToast("Failed to delete subject", "error");
    } finally {
      setSaving(false);
    }
  }, [deletingSubject, showToast]);

  // --- Filter Logic ----------------------------------------------
  const filtered = useMemo(() => {
    return subjects.filter(s => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(search) ||
             (s.code || "").toLowerCase().includes(search) ||
             (s.description || "").toLowerCase().includes(search);
    });
  }, [subjects, searchTerm]);

  // --- Pagination ------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // --- Stats ------------------------------------------------------
  const stats = useMemo(() => ({
    total: subjects.length,
    active: subjects.filter(s => s.is_active).length,
    inactive: subjects.filter(s => !s.is_active).length,
  }), [subjects]);

  // --- Loading State ----------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
          <PageHeader 
            title="Subjects" 
            subtitle="Manage all subjects offered" 
            breadcrumbs={["Admin", "Academics", "Subjects"]} 
          />
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-50 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading subjects...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // --- Render ----------------------------------------------------------
  return (
    <FadeIn>
      <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
        <PageHeader 
          title="Subjects" 
          subtitle={`Manage all subjects offered${subjects.length > 0 ? ` Ã¢â‚¬â€ ${subjects.length} total subjects` : ""}`}
          breadcrumbs={["Admin", "Academics", "Subjects"]}
          icon={BookOpen}
          action={
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="hidden sm:inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={openAdd}
                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Add Subject</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error loading subjects</p>
              <p className="text-amber-600 break-words">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Subjects</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">All subjects</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Active subjects</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">{stats.inactive}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Inactive subjects</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Codes</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{new Set(subjects.map(s => s.code)).size}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Unique subject codes</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, code, or description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs md:text-sm"
                  />
                  {searchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pageItems.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                      {searchTerm ? "No subjects match your search" : "No subjects found"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {searchTerm ? "Try adjusting your search terms" : "Add a subject to get started"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <button 
                      onClick={openAdd}
                      className="mt-2 md:mt-3 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Add Subject
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.map((subject) => (
                      <div 
                        key={subject.id} 
                        className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(subject)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(subject.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 text-sm truncate">{subject.name || "Ã¢â‚¬â€"}</p>
                                <p className="text-xs text-gray-500 font-mono">{subject.code || "Ã¢â‚¬â€"}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <Badge className={subject.is_active ? "bg-green-100 text-green-700 border-green-200 text-[10px] flex items-center gap-1" : "bg-gray-100 text-gray-700 border-gray-200 text-[10px] flex items-center gap-1"}>
                                {subject.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {subject.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            {subject.description && (
                              <p className="text-xs text-gray-500 mt-1.5 truncate">{subject.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEdit(subject); }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeletingSubject(subject); }}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pageItems.map((subject) => (
                        <tr 
                          key={subject.id} 
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                          onClick={() => openDetail(subject)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {subject.code?.charAt(0).toUpperCase() || "S"}
                              </div>
                              <span className="font-mono text-sm text-gray-600 truncate max-w-[100px]">{subject.code || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(subject.name)}
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-[150px]">{subject.name || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-gray-600 truncate max-w-[200px]">
                              {subject.description || "Ã¢â‚¬â€"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className={subject.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap" : "bg-gray-100 text-gray-700 border-gray-200 text-xs flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap"}>
                              {subject.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {subject.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDetail(subject); }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(subject); }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                title="Edit subject"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeletingSubject(subject); }}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                                title="Delete subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Add/Edit Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h3>
              <button onClick={closeModal} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="e.g., MATH101, PHY202"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                  placeholder="Enter subject description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={formData.is_active ? "active" : "inactive"}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingSubject ? "Update Subject" : "Create Subject"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {detailModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button 
                onClick={closeDetailModal} 
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl sm:text-3xl font-bold shadow-lg">
                  {getInitials(selectedSubject.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-xl font-bold text-white truncate">{selectedSubject.name || "Ã¢â‚¬â€"}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                    <Badge className="bg-white/20 text-white border-white/30 text-[10px] sm:text-xs flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {selectedSubject.code || "N/A"}
                    </Badge>
                    <Badge className={selectedSubject.is_active ? "bg-green-500/30 text-white border-green-400/30 text-[10px] sm:text-xs flex items-center gap-1" : "bg-gray-500/30 text-white border-gray-400/30 text-[10px] sm:text-xs flex items-center gap-1"}>
                      {selectedSubject.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {selectedSubject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Hash className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Code</span>
                  </div>
                  <p className="text-base sm:text-lg font-mono font-semibold text-gray-800 break-words">
                    {selectedSubject.code || "Ã¢â‚¬â€"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <Badge className={selectedSubject.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs" : "bg-gray-100 text-gray-700 border-gray-200 text-xs"}>
                    {selectedSubject.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {selectedSubject.description && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Description</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {selectedSubject.description}
                  </p>
                </div>
              )}

              {selectedSubject.created_at && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Created</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formatDate(selectedSubject.created_at)}
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  closeDetailModal();
                  openEdit(selectedSubject);
                }}
              >
                <Edit className="w-4 h-4" />
                Edit Subject
              </button>
              <button
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                onClick={closeDetailModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingSubject && (
        <ConfirmDialog
          open={true}
          title="Delete this subject?"
          message={`This permanently removes "${deletingSubject.name}" (${deletingSubject.code}) and all associated data. This action cannot be undone.`}
          confirmLabel="Delete Subject"
          onConfirm={handleDelete}
          onCancel={() => setDeletingSubject(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 ${
          toast.type === "success" ? "bg-emerald-600" : 
          toast.type === "error" ? "bg-red-600" : "bg-blue-600"
        } text-white text-xs md:text-sm px-4 md:px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2 max-w-full md:max-w-md`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="break-words">{toast.message}</span>
        </div>
      )}
    </FadeIn>
  );
};

export default Subjects;