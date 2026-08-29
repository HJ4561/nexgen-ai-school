// src/modules/admin/pages/Sections.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw, 
  AlertCircle, CheckCircle, Loader2, Users, Building 
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
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
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Ã¢â‚¬â€";
  }
};

// --- Main Component ----------------------------------------------------
const Sections = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    class_obj: "",
    name: "",
    capacity: "",
  });
  const pageSize = 10;

  // --- Toast ----------------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch Data --------------------------------------------------
  const fetchSections = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    try {
      const response = await api.get("/academics/sections/");
      const data = response.data?.results || response.data || [];
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      setSections([]);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || "Failed to load sections");
      showToast("Failed to load sections", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await api.get("/academics/classes/");
      const data = response.data?.results || response.data || [];
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  }, []);

  useEffect(() => {
    fetchSections();
    fetchClasses();
  }, [fetchSections, fetchClasses]);

  // --- Refresh Handler ----------------------------------------------
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSections();
  }, [fetchSections]);

  // --- Helper Functions --------------------------------------------
  const getClassName = useCallback((section) => {
    if (!section) return "Ã¢â‚¬â€";
    const name = section.class_name || section.class_obj;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  }, []);

  // --- Modal Handlers ----------------------------------------------
  const openAdd = useCallback(() => {
    setEditingSection(null);
    setFormData({ class_obj: "", name: "", capacity: "" });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((section) => {
    setEditingSection(section);
    setFormData({
      class_obj: section.class_obj || "",
      name: section.name || "",
      capacity: section.capacity || "",
    });
    setModalOpen(true);
  }, []);

  const openDetail = useCallback((section) => {
    setSelectedSection(section);
    setDetailModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingSection(null);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedSection(null);
  }, []);

  // --- Submit Handler ----------------------------------------------
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.class_obj || !formData.name) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        class_obj: Number(formData.class_obj),
        name: formData.name.trim(),
        capacity: Number(formData.capacity) || 0,
      };

      if (editingSection) {
        const response = await api.patch(`/academics/sections/${editingSection.id}/`, payload);
        setSections(prev => prev.map(s => s.id === editingSection.id ? { ...s, ...response.data } : s));
        showToast("Section updated successfully", "success");
      } else {
        const response = await api.post("/academics/sections/", payload);
        setSections(prev => [response.data, ...prev]);
        showToast("Section created successfully", "success");
      }
      setModalOpen(false);
      setEditingSection(null);
    } catch (error) {
      console.error("Failed to save section:", error);
      showToast(error.response?.data?.detail || "Failed to save section", "error");
    } finally {
      setSaving(false);
    }
  }, [formData, editingSection, showToast]);

  // --- Delete Handler ----------------------------------------------
  const handleDelete = useCallback(async () => {
    if (!deletingSection) return;
    setSaving(true);
    try {
      await api.delete(`/academics/sections/${deletingSection.id}/`);
      setSections(prev => prev.filter(s => s.id !== deletingSection.id));
      showToast("Section deleted successfully", "success");
      setDeletingSection(null);
    } catch (error) {
      console.error("Failed to delete section:", error);
      showToast("Failed to delete section", "error");
    } finally {
      setSaving(false);
    }
  }, [deletingSection, showToast]);

  // --- Clear Search ----------------------------------------------
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // --- Filter Logic ----------------------------------------------
  const filtered = useMemo(() => {
    return sections.filter(s => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(search) ||
             getClassName(s).toLowerCase().includes(search);
    });
  }, [sections, searchTerm, getClassName]);

  // --- Pagination ------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // --- Stats ------------------------------------------------------
  const stats = useMemo(() => {
    const total = sections.length;
    const totalCapacity = sections.reduce((sum, s) => sum + (Number(s.capacity) || 0), 0);
    return { total, totalCapacity };
  }, [sections]);

  // --- Loading State ----------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
          <PageHeader 
            title="Sections" 
            subtitle="Manage all class sections" 
            breadcrumbs={["Admin", "Academics", "Sections"]} 
          />
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading sections...</p>
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
          title="Sections" 
          subtitle={`Manage all class sections${sections.length > 0 ? ` Ã¢â‚¬â€ ${sections.length} total sections` : ""}`}
          breadcrumbs={["Admin", "Academics", "Sections"]}
          icon={Building}
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
                <span className="hidden xs:inline">Add Section</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error loading sections</p>
              <p className="text-amber-600 break-words">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sections</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">All sections</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Capacity</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.totalCapacity}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Across all sections</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Classes</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{new Set(sections.map(s => s.class_obj)).size}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Classes with sections</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Capacity</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">
              {stats.total > 0 ? Math.round(stats.totalCapacity / stats.total) : 0}
            </p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Per section</p>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or class..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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
                    <Building className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                      {searchTerm ? "No sections match your search" : "No sections found"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {searchTerm ? "Try adjusting your search terms" : "Add a section to get started"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <button 
                      onClick={openAdd}
                      className="mt-2 md:mt-3 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Add Section
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.map((section) => (
                      <div 
                        key={section.id} 
                        className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(section)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(section.name)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 text-sm truncate">{section.name || "Ã¢â‚¬â€"}</p>
                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {getClassName(section)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">
                                Capacity: {section.capacity || 0}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEdit(section); }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeletingSection(section); }}
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
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pageItems.map((section) => (
                        <tr 
                          key={section.id} 
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                          onClick={() => openDetail(section)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(section.name)}
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-[150px]">{section.name || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600 truncate max-w-[150px]">{getClassName(section)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-semibold text-gray-800">{section.capacity || 0}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDetail(section); }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(section); }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                                title="Edit section"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeletingSection(section); }}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all"
                                title="Delete section"
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

          {sections.length > 0 && (
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                {editingSection ? "Edit Section" : "Add New Section"}
              </h3>
              <button onClick={closeModal} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.class_obj}
                  onChange={(e) => setFormData({ ...formData, class_obj: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                >
                  <option value="">Select a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., A, B, C"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="e.g., 35"
                />
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
                      {editingSection ? "Update Section" : "Create Section"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingSection && (
        <ConfirmDialog
          open={true}
          title="Delete this section?"
          message={`This permanently removes section "${deletingSection.name}" from class ${getClassName(deletingSection)}.`}
          confirmLabel="Delete Section"
          onConfirm={handleDelete}
          onCancel={() => setDeletingSection(null)}
          loading={saving}
        />
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedSection && (
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
                  {getInitials(selectedSection.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-xl font-bold text-white truncate">{selectedSection.name || "Ã¢â‚¬â€"}</h3>
                  <p className="text-xs sm:text-sm text-white/80 truncate">{getClassName(selectedSection)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Class</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 break-words">{getClassName(selectedSection)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Capacity</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{selectedSection.capacity || 0}</p>
                </div>
              </div>
              {selectedSection.created_at && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider">Created</span>
                  </div>
                  <p className="text-sm text-gray-700">{formatDate(selectedSection.created_at)}</p>
                </div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  closeDetailModal();
                  openEdit(selectedSection);
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
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

export default Sections;