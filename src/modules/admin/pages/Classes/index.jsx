// src/modules/admin/pages/Classes/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Eye, X, Users, Calendar, BookOpen, School, RefreshCw, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

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

  useEffect(() => {
    fetchClasses();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchClasses = async () => {
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
  };

  const openAdd = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      academic_year: "",
      sections: "",
      is_active: true,
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name || "",
      academic_year: cls.academic_year || "",
      sections: cls.sections_count || "",
      is_active: cls.is_active !== undefined ? cls.is_active : true,
      description: cls.description || "",
    });
    setModalOpen(true);
  };

  const openDetail = (cls) => {
    setSelectedClass(cls);
    setDetailModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClass(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedClass(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        academic_year: formData.academic_year,
        sections_count: parseInt(formData.sections) || 0,
        is_active: formData.is_active,
        description: formData.description,
      };

      if (editingClass) {
        // Update class
        const response = await api.patch(`/academics/classes/${editingClass.id}/`, payload);
        setClasses(classes.map(c => c.id === editingClass.id ? { ...c, ...response.data } : c));
        showToast("Class updated successfully", "success");
      } else {
        // Create class
        const response = await api.post("/academics/classes/", payload);
        setClasses([response.data, ...classes]);
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
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/academics/classes/${deletingClass.id}/`);
      setClasses(classes.filter(c => c.id !== deletingClass.id));
      showToast("Class deleted successfully", "success");
      setDeletingClass(null);
    } catch (error) {
      console.error("Failed to delete class:", error);
      showToast("Failed to delete class", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return classes.filter(c => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (c.name || "").toLowerCase().includes(search) ||
             (c.academic_year || "").toLowerCase().includes(search);
    });
  }, [classes, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading classes...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all classes and grade levels
              {classes.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {classes.length} total classes</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchClasses} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            Couldn't load classes. Please refresh.
          </div>
        )}

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
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
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <School className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? "No classes match your search" : "No classes found"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? "Try adjusting your search" : "Add a class to get started"}
                        </p>
                        {!searchTerm && (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 mt-2"
                            onClick={openAdd}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Class
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((cls) => (
                    <tr 
                      key={cls.id} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => openDetail(cls)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {cls.name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <span className="font-medium text-gray-800">{cls.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{cls.academic_year || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{cls.sections_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={cls.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1.5 px-2.5 py-1" : "bg-gray-100 text-gray-700 border-gray-200 text-xs flex items-center gap-1.5 px-2.5 py-1"}>
                          {cls.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {cls.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openDetail(cls)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(cls)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit class"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingClass(cls)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

      {/* Add/Edit Class Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingClass ? "Edit Class" : "Add New Class"}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Class Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Grade 10, Class 5A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Academic Year <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Enter class description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={formData.is_active ? "active" : "inactive"}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-gray-200" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingClass ? "Update Class" : "Create Class"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {detailModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Class Details</h3>
              <button onClick={closeDetailModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25">
                  {selectedClass.name?.charAt(0).toUpperCase() || "C"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Class Name</p>
                  <p className="font-medium text-gray-800">{selectedClass.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-800">{selectedClass.academic_year || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Sections</p>
                  <p className="font-medium text-gray-800">{selectedClass.sections_count || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={selectedClass.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                    {selectedClass.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              {selectedClass.description && (
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{selectedClass.description}</p>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="border-gray-200"
                  onClick={() => {
                    closeDetailModal();
                    openEdit(selectedClass);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Class
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={closeDetailModal}
                >
                  Close
                </Button>
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
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Classes;