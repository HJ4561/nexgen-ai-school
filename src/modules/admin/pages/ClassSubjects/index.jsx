// src/modules/admin/pages/ClassSubjects/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw, 
  AlertCircle, CheckCircle, Loader2, BookOpen, Users, User 
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const ClassSubjects = () => {
  const [classSubjects, setClassSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    class_obj: "",
    subject: "",
    teacher: "",
  });
  const pageSize = 10;

  useEffect(() => {
    fetchAllData();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    
    try {
      // Fetch all data in parallel
      const [classSubjectsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get("/academics/class-subjects/"),
        api.get("/academics/classes/"),
        api.get("/academics/subjects/"),
        api.get("/users/teachers/")
      ]);

      console.log("✅ Class Subjects Response:", classSubjectsRes.data);
      console.log("✅ Classes Response:", classesRes.data);
      console.log("✅ Subjects Response:", subjectsRes.data);
      console.log("✅ Teachers Response:", teachersRes.data);

      // Set data
      setClassSubjects(classSubjectsRes.data?.results || classSubjectsRes.data || []);
      setClasses(classesRes.data?.results || classesRes.data || []);
      setSubjects(subjectsRes.data?.results || subjectsRes.data || []);
      setTeachers(teachersRes.data?.results || teachersRes.data || []);
      
    } catch (error) {
      console.error("❌ Failed to fetch data:", error);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || error.message || "Failed to load data");
      showToast("Failed to load data", "error");
      
      // Set empty arrays on error
      setClassSubjects([]);
      setClasses([]);
      setSubjects([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // Individual fetch functions (for refresh)
  const fetchClassSubjects = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await api.get("/academics/class-subjects/");
      const data = response.data?.results || response.data || [];
      console.log("📚 Class Subjects fetched:", data);
      setClassSubjects(data);
    } catch (error) {
      console.error("Failed to fetch class subjects:", error);
      setClassSubjects([]);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || "Failed to load class subjects");
      showToast("Failed to load class subjects", "error");
    } finally {
      setLoading(false);
    }
  };

  const getClassName = (item) => {
    if (!item) return "—";
    // Check if class_obj is an object with name property
    if (item.class_obj && typeof item.class_obj === 'object' && item.class_obj.name) {
      return item.class_obj.name;
    }
    // Check if class_name is a string
    if (item.class_name) return item.class_name;
    // Check if class_obj is a string
    if (typeof item.class_obj === 'string') return item.class_obj;
    // Check if class_obj is a number and we have classes data
    if (item.class_obj && typeof item.class_obj === 'number') {
      const cls = classes.find(c => c.id === item.class_obj);
      if (cls) return cls.name;
    }
    return item.class_obj || "—";
  };

  const getSubjectName = (item) => {
    if (!item) return "—";
    // Check if subject is an object with name property
    if (item.subject && typeof item.subject === 'object' && item.subject.name) {
      return item.subject.name;
    }
    if (item.subject_name) return item.subject_name;
    if (typeof item.subject === 'string') return item.subject;
    if (item.subject && typeof item.subject === 'number') {
      const subj = subjects.find(s => s.id === item.subject);
      if (subj) return subj.name;
    }
    return item.subject || "—";
  };

  const getTeacherName = (item) => {
    if (!item) return "—";
    // Check if teacher is an object with name property
    if (item.teacher && typeof item.teacher === 'object' && item.teacher.name) {
      return item.teacher.name;
    }
    if (item.teacher_name) return item.teacher_name;
    if (typeof item.teacher === 'string') return item.teacher;
    if (item.teacher && typeof item.teacher === 'number') {
      const teacher = teachers.find(t => t.id === item.teacher);
      if (teacher) return teacher.name || teacher.user?.name || `Teacher ${teacher.id}`;
    }
    return item.teacher || "Not assigned";
  };

  const openAdd = () => {
    setEditingItem(null);
    setFormData({ class_obj: "", subject: "", teacher: "" });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      class_obj: item.class_obj || "",
      subject: item.subject || "",
      teacher: item.teacher || "",
    });
    setModalOpen(true);
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        class_obj: Number(formData.class_obj),
        subject: Number(formData.subject),
        teacher: formData.teacher ? Number(formData.teacher) : null,
      };

      if (editingItem) {
        const response = await api.patch(`/academics/class-subjects/${editingItem.id}/`, payload);
        setClassSubjects(classSubjects.map(c => c.id === editingItem.id ? { ...c, ...response.data } : c));
        showToast("Class subject updated successfully", "success");
      } else {
        const response = await api.post("/academics/class-subjects/", payload);
        setClassSubjects([response.data, ...classSubjects]);
        showToast("Class subject created successfully", "success");
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save class subject:", error);
      showToast(error.response?.data?.detail || "Failed to save class subject", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/academics/class-subjects/${deletingItem.id}/`);
      setClassSubjects(classSubjects.filter(c => c.id !== deletingItem.id));
      showToast("Class subject deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete class subject:", error);
      showToast("Failed to delete class subject", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    return classSubjects.filter(c => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getClassName(c).toLowerCase().includes(search) ||
             getSubjectName(c).toLowerCase().includes(search) ||
             getTeacherName(c).toLowerCase().includes(search);
    });
  }, [classSubjects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading class subjects...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Class Subjects</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage subject assignments to classes
              {classSubjects.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {classSubjects.length} assignments</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchClassSubjects}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" /> Assign Subject
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading class subjects</p>
              <p className="text-amber-600">{errorMessage}</p>
            </div>
          </div>
        )}

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by class, subject, or teacher..."
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
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    {searchTerm ? "No class subjects match your search" : "No class subjects found"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {searchTerm ? "Try adjusting your search terms" : "Assign subjects to classes"}
                  </p>
                  {!searchTerm && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={openAdd}>
                      <Plus className="w-4 h-4 mr-2" /> Assign Subject
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => openDetail(item)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {getClassName(item).charAt(0).toUpperCase() || "C"}
                          </div>
                          <span className="font-medium text-gray-800">{getClassName(item)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                          {getSubjectName(item)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{getTeacherName(item)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetail(item)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit assignment">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete assignment">
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

          {classSubjects.length > 0 && (
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
              <h3 className="font-semibold text-gray-800 text-lg">{editingItem ? "Edit Assignment" : "New Assignment"}</h3>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="">Select a subject...</option>
                  {subjects.map((subj) => (
                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Teacher</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.user?.name || `Teacher ${teacher.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-gray-200" onClick={closeModal} disabled={saving}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {editingItem ? "Update" : "Assign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title="Delete this assignment?"
          message={`This removes the subject "${getSubjectName(deletingItem)}" from class ${getClassName(deletingItem)}.`}
          confirmLabel="Delete Assignment"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button onClick={closeDetailModal} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getClassName(selectedItem).charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{getClassName(selectedItem)}</h3>
                  <p className="text-sm text-white/80">{getSubjectName(selectedItem)}</p>
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
                  <p className="text-sm font-semibold text-gray-800">{getClassName(selectedItem)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Subject</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{getSubjectName(selectedItem)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Teacher</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{getTeacherName(selectedItem)}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" className="border-gray-200" onClick={() => { closeDetailModal(); openEdit(selectedItem); }}>
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

export default ClassSubjects;