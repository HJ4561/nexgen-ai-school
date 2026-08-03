// src/modules/admin/pages/Sections/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw, 
  AlertCircle, CheckCircle, Loader2, Users, Building 
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSections();
    fetchClasses();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    setErrored(false);
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
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/academics/classes/");
      const data = response.data?.results || response.data || [];
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const getClassName = (section) => {
    if (!section) return "—";
    const name = section.class_name || section.class_obj;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "—";
  };

  const openAdd = () => {
    setEditingSection(null);
    setFormData({ class_obj: "", name: "", capacity: "" });
    setModalOpen(true);
  };

  const openEdit = (section) => {
    setEditingSection(section);
    setFormData({
      class_obj: section.class_obj || "",
      name: section.name || "",
      capacity: section.capacity || "",
    });
    setModalOpen(true);
  };

  const openDetail = (section) => {
    setSelectedSection(section);
    setDetailModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSection(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSection(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        class_obj: Number(formData.class_obj),
        name: formData.name,
        capacity: Number(formData.capacity) || 0,
      };

      if (editingSection) {
        const response = await api.patch(`/academics/sections/${editingSection.id}/`, payload);
        setSections(sections.map(s => s.id === editingSection.id ? { ...s, ...response.data } : s));
        showToast("Section updated successfully", "success");
      } else {
        const response = await api.post("/academics/sections/", payload);
        setSections([response.data, ...sections]);
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
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/academics/sections/${deletingSection.id}/`);
      setSections(sections.filter(s => s.id !== deletingSection.id));
      showToast("Section deleted successfully", "success");
      setDeletingSection(null);
    } catch (error) {
      console.error("Failed to delete section:", error);
      showToast("Failed to delete section", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return sections.filter(s => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (s.name || "").toLowerCase().includes(search) ||
             getClassName(s).toLowerCase().includes(search);
    });
  }, [sections, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const stats = useMemo(() => {
    const total = sections.length;
    const totalCapacity = sections.reduce((sum, s) => sum + (Number(s.capacity) || 0), 0);
    return { total, totalCapacity };
  }, [sections]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading sections...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sections</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all class sections
              {sections.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {sections.length} total sections</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchSections}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading sections</p>
              <p className="text-amber-600">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sections</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All sections</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Capacity</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalCapacity}</p>
            <p className="text-xs text-gray-400 mt-1">Across all sections</p>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or class..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pageItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No sections found</p>
                  <p className="text-sm text-gray-400">Add a section to get started</p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={openAdd}>
                    <Plus className="w-4 h-4 mr-2" /> Add Section
                  </Button>
                </div>
              </div>
            ) : (
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
                    <tr key={section.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => openDetail(section)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {section.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <span className="font-medium text-gray-800">{section.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{getClassName(section)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-800">{section.capacity || 0}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetail(section)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(section)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit section">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingSection(section)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete section">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">{editingSection ? "Edit Section" : "Add New Section"}</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Class <span className="text-red-500">*</span></label>
                <select
                  value={formData.class_obj}
                  onChange={(e) => setFormData({ ...formData, class_obj: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Section Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., 35"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-gray-200" onClick={closeModal} disabled={saving}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {editingSection ? "Update Section" : "Create Section"}
                </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button onClick={closeDetailModal} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {selectedSection.name?.charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedSection.name || "—"}</h3>
                  <p className="text-sm text-white/80">{getClassName(selectedSection)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Class</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{getClassName(selectedSection)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Capacity</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{selectedSection.capacity || 0}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" className="border-gray-200" onClick={() => { closeDetailModal(); openEdit(selectedSection); }}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={closeDetailModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-2`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Sections;