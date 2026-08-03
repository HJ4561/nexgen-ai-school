// src/modules/admin/pages/Subjects/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Plus, Edit, Trash2, Eye, BookOpen, X, RefreshCw, AlertCircle, CheckCircle, Loader2, Hash, FileText, Calendar } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
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

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await api.get("/academics/subjects/");
      const data = response.data?.results || response.data || [];
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      setSubjects([]);
      setErrored(true);
      showToast("Failed to load subjects", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingSubject(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name || "",
      code: subject.code || "",
      description: subject.description || "",
      is_active: subject.is_active !== undefined ? subject.is_active : true,
    });
    setModalOpen(true);
  };

  const openDetail = (subject) => {
    setSelectedSubject(subject);
    setDetailModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSubject(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSubject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        is_active: formData.is_active,
      };

      if (editingSubject) {
        // Update subject
        const response = await api.patch(`/academics/subjects/${editingSubject.id}/`, payload);
        setSubjects(subjects.map(s => s.id === editingSubject.id ? { ...s, ...response.data } : s));
        showToast("Subject updated successfully", "success");
      } else {
        // Create subject
        const response = await api.post("/academics/subjects/", payload);
        setSubjects([response.data, ...subjects]);
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
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/academics/subjects/${deletingSubject.id}/`);
      setSubjects(subjects.filter(s => s.id !== deletingSubject.id));
      showToast("Subject deleted successfully", "success");
      setDeletingSubject(null);
    } catch (error) {
      console.error("Failed to delete subject:", error);
      showToast("Failed to delete subject", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return subjects.filter(s => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(search) ||
             (s.code || "").toLowerCase().includes(search) ||
             (s.description || "").toLowerCase().includes(search);
    });
  }, [subjects, searchTerm]);

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
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading subjects...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all subjects offered
              {subjects.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {subjects.length} total subjects</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchSubjects} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            Couldn't load subjects. Please refresh.
          </div>
        )}

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search subjects by name, code, or description..."
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
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
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
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {searchTerm ? "No subjects match your search" : "No subjects found"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm ? "Try adjusting your search" : "Add a subject to get started"}
                        </p>
                        {!searchTerm && (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 mt-2"
                            onClick={openAdd}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((subject) => (
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
                          <span className="font-mono text-sm text-gray-600">{subject.code || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {subject.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <span className="font-medium text-gray-800">{subject.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {subject.description || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={subject.is_active ? "bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1.5 px-2.5 py-1" : "bg-gray-100 text-gray-700 border-gray-200 text-xs flex items-center gap-1.5 px-2.5 py-1"}>
                          {subject.is_active ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {subject.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openDetail(subject)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(subject)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit subject"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingSubject(subject)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete subject"
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

      {/* Add/Edit Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Mathematics, Physics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                  placeholder="e.g., MATH101, PHY202"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Enter subject description"
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
                      {editingSubject ? "Update Subject" : "Create Subject"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Detail Modal - Modern Professional */}
      {detailModalOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className="relative px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button 
                onClick={closeDetailModal} 
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {selectedSubject.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSubject.name || "—"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                      <Hash className="w-3 h-3 mr-1" />
                      {selectedSubject.code || "N/A"}
                    </Badge>
                    <Badge className={selectedSubject.is_active ? "bg-green-500/30 text-white border-green-400/30 text-xs" : "bg-gray-500/30 text-white border-gray-400/30 text-xs"}>
                      {selectedSubject.is_active ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {selectedSubject.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Hash className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Code</span>
                  </div>
                  <p className="text-lg font-mono font-semibold text-gray-800">
                    {selectedSubject.code || "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <Badge className={selectedSubject.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}>
                    {selectedSubject.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {selectedSubject.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Description</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedSubject.description}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Created</span>
                </div>
                <p className="text-sm text-gray-700">
                  {selectedSubject.created_at ? new Date(selectedSubject.created_at).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "—"}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <Button
                variant="outline"
                className="border-gray-200"
                onClick={() => {
                  closeDetailModal();
                  openEdit(selectedSubject);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Subject
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
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Subjects;