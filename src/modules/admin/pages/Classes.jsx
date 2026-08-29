// src/modules/admin/pages/Classes.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, Users, Calendar, 
  BookOpen, School, RefreshCw, AlertCircle, CheckCircle, 
  Loader2, ChevronRight, Home 
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
const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Ã¢â‚¬â€";
  }
};

const getInitials = (name) => {
  if (!name) return "C";
  return name.charAt(0).toUpperCase();
};

// --- Main Component ----------------------------------------------------
const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    academic_year: "",
    sections: "",
    is_active: true,
    description: "",
  });
  const pageSize = 10;

  // --- Fetch Classes ----------------------------------------------------
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await api.get("/academics/classes/");
      const data = response.data?.results || response.data || [];
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      setClasses([]);
      setErrored(true);
      showToast("Failed to load classes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- Toast ------------------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Modal Handlers ---------------------------------------------------
  const openAdd = useCallback(() => {
    setEditingClass(null);
    setFormData({
      name: "",
      academic_year: "",
      sections: "",
      is_active: true,
      description: "",
    });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || "",
      academic_year: cls.academic_year || "",
      sections: cls.sections_count?.toString() || "",
      is_active: cls.is_active !== undefined ? cls.is_active : true,
      description: cls.description || "",
    });
    setModalOpen(true);
  }, []);

  const openDetail = useCallback((cls) => {
    setSelectedClass(cls);
    setDetailModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingClass(null);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedClass(null);
  }, []);

  // --- Form Submit ------------------------------------------------------
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Please enter a class name", "error");
      return;
    }
    
    if (!formData.academic_year.trim()) {
      showToast("Please enter an academic year", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        academic_year: formData.academic_year.trim(),
        sections_count: parseInt(formData.sections) || 0,
        is_active: formData.is_active,
        description: formData.description?.trim() || "",
      };

      if (editingClass) {
        const response = await api.patch(`/academics/classes/${editingClass.id}/`, payload);
        setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...response.data } : c));
        showToast("Class updated successfully", "success");
      } else {
        const response = await api.post("/academics/classes/", payload);
        setClasses(prev => [response.data, ...prev]);
        showToast("Class created successfully", "success");
      }
      setModalOpen(false);
      setEditingClass(null);
    } catch (error) {
      console.error("Failed to save class:", error);
      showToast(error.response?.data?.detail || "Failed to save class", "error");
    } finally {
      setSaving(false);
    }
  }, [formData, editingClass, showToast]);

  // --- Delete Handler ---------------------------------------------------
  const handleDelete = useCallback(async () => {
    if (!deletingClass) return;
    setSaving(true);
    try {
      await api.delete(`/academics/classes/${deletingClass.id}/`);
      setClasses(prev => prev.filter(c => c.id !== deletingClass.id));
      showToast("Class deleted successfully", "success");
      setDeletingClass(null);
    } catch (error) {
      console.error("Failed to delete class:", error);
      showToast("Failed to delete class", "error");
    } finally {
      setSaving(false);
    }
  }, [deletingClass, showToast]);

  // --- Filter Logic -----------------------------------------------------
  const filtered = useMemo(() => {
    if (!searchTerm) return classes;
    const search = searchTerm.toLowerCase();
    return classes.filter(c => {
      return (c.name || "").toLowerCase().includes(search) ||
             (c.academic_year || "").toLowerCase().includes(search) ||
             (c.description || "").toLowerCase().includes(search);
    });
  }, [classes, searchTerm]);

  // --- Pagination -------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // --- Stats ------------------------------------------------------------
  const stats = useMemo(() => ({
    total: classes.length,
    active: classes.filter(c => c.is_active).length,
    inactive: classes.filter(c => !c.is_active).length,
    totalSections: classes.reduce((sum, c) => sum + (c.sections_count || 0), 0),
  }), [classes]);

  // --- Loading State ----------------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8">
          <PageHeader 
  title="Classes" 
  subtitle={`Manage all classes and grade levels${classes.length > 0 ? ` Ã¢â‚¬â€ ${classes.length} total classes` : ""}`}
  breadcrumbs={["Admin", "Academics", "Classes"]}
  action={
    <div className="flex items-center gap-2.5">
      <button 
        onClick={fetchClasses} 
        disabled={loading} 
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </button>
      <div className="w-px h-6 bg-gray-200" />
      <button 
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
        onClick={openAdd}
      >
        <Plus className="w-4 h-4" />
        Add Class
      </button>
    </div>
  }
/>
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-50 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading classes...</p>
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
          title="Classes" 
          subtitle={`Manage all classes and grade levels${classes.length > 0 ? ` Ã¢â‚¬â€ ${classes.length} total classes` : ""}`}
          breadcrumbs={["Admin", "Academics", "Classes"]}
          icon={School}
          action={
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button 
                onClick={fetchClasses} 
                disabled={loading} 
                className="hidden sm:inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                onClick={openAdd}
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Add Class</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          }
        />

        {/* Error Message */}
        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Could not load classes</p>
              <p className="text-amber-600">Please refresh the page to try again.</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">All grade levels</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Active classes</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-red-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Inactive</p>
            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.inactive}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Inactive classes</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sections</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.totalSections}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Across all classes</p>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          {/* Search Bar */}
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes by name or academic year..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs md:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table / Mobile Cards */}
          <div className="overflow-x-auto">
            {pageItems.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <School className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                      {searchTerm ? "No classes match your search" : "No classes found"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {searchTerm ? "Try adjusting your search terms" : "Add a class to get started"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <button 
                      className="mt-2 md:mt-3 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                      onClick={openAdd}
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Add Class
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.map((cls) => (
                      <div 
                        key={cls.id} 
                        className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(cls)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(cls.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 truncate">{cls.name || "Ã¢â‚¬â€"}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {cls.academic_year || "Ã¢â‚¬â€"}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {cls.sections_count || 0} sections
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Badge className={cls.is_active ? "bg-green-100 text-green-700 border-green-200 text-[10px] flex items-center gap-1 px-2 py-0.5" : "bg-gray-100 text-gray-700 border-gray-200 text-[10px] flex items-center gap-1 px-2 py-0.5"}>
                                {cls.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {cls.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEdit(cls); }} 
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeletingClass(cls); }} 
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
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Academic Year</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Sections</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pageItems.map((cls) => (
                        <tr 
                          key={cls.id} 
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                          onClick={() => openDetail(cls)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(cls.name)}
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-[200px]">{cls.name || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600">{cls.academic_year || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600">{cls.sections_count || 0}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className={cls.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1.5 px-2.5 py-1" : "bg-gray-100 text-gray-700 border-gray-200 text-xs flex items-center gap-1.5 px-2.5 py-1"}>
                              {cls.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {cls.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDetail(cls); }} 
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" 
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(cls); }} 
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" 
                                title="Edit class"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeletingClass(cls); }} 
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all" 
                                title="Delete class"
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

          {/* Pagination */}
          {filtered.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* Add/Edit Class Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                {editingClass ? "Edit Class" : "Add New Class"}
              </h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., Grade 10, Class 5A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., 2024-2025"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Number of Sections</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sections}
                  onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
                  placeholder="Enter class description"
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
                      {editingClass ? "Update Class" : "Create Class"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {detailModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Class Details</h3>
              <button 
                onClick={closeDetailModal} 
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-blue-500/25">
                  {getInitials(selectedClass.name)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Class Name</p>
                  <p className="font-medium text-gray-800 break-words">{selectedClass.name || "Ã¢â‚¬â€"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-800">{selectedClass.academic_year || "Ã¢â‚¬â€"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Sections</p>
                  <p className="font-medium text-gray-800">{selectedClass.sections_count || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={selectedClass.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs" : "bg-gray-100 text-gray-700 border-gray-200 text-xs"}>
                    {selectedClass.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {selectedClass.description && (
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700 break-words">{selectedClass.description}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    closeDetailModal();
                    openEdit(selectedClass);
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Class
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
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingClass && (
        <ConfirmDialog
          open={true}
          title="Delete this class?"
          message={`This permanently removes "${deletingClass.name}" and all associated data. This action cannot be undone.`}
          confirmLabel="Delete Class"
          onConfirm={handleDelete}
          onCancel={() => setDeletingClass(null)}
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

export default Classes;