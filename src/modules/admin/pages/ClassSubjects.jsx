// src/modules/admin/pages/ClassSubjects.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw, 
  AlertCircle, CheckCircle, Loader2, BookOpen, Users, User 
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
  if (!name) return "C";
  return name.charAt(0).toUpperCase();
};

// --- Main Component ----------------------------------------------------
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

  // --- Toast ------------------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch All Data ---------------------------------------------------
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    
    try {
      const [classSubjectsRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get("/academics/class-subjects/"),
        api.get("/academics/classes/"),
        api.get("/academics/subjects/"),
        api.get("/users/teachers/")
      ]);

      setClassSubjects(classSubjectsRes.data?.results || classSubjectsRes.data || []);
      setClasses(classesRes.data?.results || classesRes.data || []);
      setSubjects(subjectsRes.data?.results || subjectsRes.data || []);
      setTeachers(teachersRes.data?.results || teachersRes.data || []);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || error.message || "Failed to load data");
      showToast("Failed to load data", "error");
      
      setClassSubjects([]);
      setClasses([]);
      setSubjects([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Helper Functions -------------------------------------------------
  const getClassName = useCallback((item) => {
    if (!item) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
    if (item.class_obj && typeof item.class_obj === 'object' && item.class_obj.name) {
      return item.class_obj.name;
    }
    if (item.class_name) return item.class_name;
    if (typeof item.class_obj === 'string') return item.class_obj;
    if (item.class_obj && typeof item.class_obj === 'number') {
      const cls = classes.find(c => c.id === item.class_obj);
      if (cls) return cls.name;
    }
    return item.class_obj || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  }, [classes]);

  const getSubjectName = useCallback((item) => {
    if (!item) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
    if (item.subject && typeof item.subject === 'object' && item.subject.name) {
      return item.subject.name;
    }
    if (item.subject_name) return item.subject_name;
    if (typeof item.subject === 'string') return item.subject;
    if (item.subject && typeof item.subject === 'number') {
      const subj = subjects.find(s => s.id === item.subject);
      if (subj) return subj.name;
    }
    return item.subject || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  }, [subjects]);

  const getTeacherName = useCallback((item) => {
    if (!item) return "Not assigned";
    if (item.teacher && typeof item.teacher === 'object' && item.teacher.name) {
      return item.teacher.name;
    }
    if (item.teacher_name) return item.teacher_name;
    if (typeof item.teacher === 'string') return item.teacher;
    if (item.teacher && typeof item.teacher === 'number') {
      const teacher = teachers.find(t => t.id === item.teacher);
      if (teacher) return teacher.name || teacher.user?.name || `Teacher ${teacher.id}`;
    }
    return "Not assigned";
  }, [teachers]);

  // --- Modal Handlers ---------------------------------------------------
  const openAdd = useCallback(() => {
    setEditingItem(null);
    setFormData({ class_obj: "", subject: "", teacher: "" });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item) => {
    setEditingItem(item);
    setFormData({
      class_obj: item.class_obj || "",
      subject: item.subject || "",
      teacher: item.teacher || "",
    });
    setModalOpen(true);
  }, []);

  const openDetail = useCallback((item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  }, []);

  // --- Form Submit ------------------------------------------------------
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!formData.class_obj) {
      showToast("Please select a class", "error");
      return;
    }
    if (!formData.subject) {
      showToast("Please select a subject", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        class_obj: Number(formData.class_obj),
        subject: Number(formData.subject),
        teacher: formData.teacher ? Number(formData.teacher) : null,
      };

      if (editingItem) {
        const response = await api.patch(`/academics/class-subjects/${editingItem.id}/`, payload);
        setClassSubjects(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...response.data } : c));
        showToast("Class subject updated successfully", "success");
      } else {
        const response = await api.post("/academics/class-subjects/", payload);
        setClassSubjects(prev => [response.data, ...prev]);
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
  }, [formData, editingItem, showToast]);

  // --- Delete Handler ---------------------------------------------------
  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`/academics/class-subjects/${deletingItem.id}/`);
      setClassSubjects(prev => prev.filter(c => c.id !== deletingItem.id));
      showToast("Class subject deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete class subject:", error);
      showToast("Failed to delete class subject", "error");
    } finally {
      setSaving(false);
    }
  }, [deletingItem, showToast]);

  // --- Refresh Handler --------------------------------------------------
  const handleRefresh = useCallback(async () => {
    await fetchAllData();
    showToast("Data refreshed", "success");
  }, [fetchAllData, showToast]);

  // --- Filter Logic -----------------------------------------------------
  const filtered = useMemo(() => {
    if (!searchTerm) return classSubjects;
    const search = searchTerm.toLowerCase();
    return classSubjects.filter(c => {
      return getClassName(c).toLowerCase().includes(search) ||
             getSubjectName(c).toLowerCase().includes(search) ||
             getTeacherName(c).toLowerCase().includes(search);
    });
  }, [classSubjects, searchTerm, getClassName, getSubjectName, getTeacherName]);

  // --- Pagination -------------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // --- Stats ------------------------------------------------------------
  const stats = useMemo(() => ({
    total: classSubjects.length,
    uniqueClasses: new Set(classSubjects.map(c => c.class_obj)).size,
    uniqueSubjects: new Set(classSubjects.map(c => c.subject)).size,
    assignedTeachers: new Set(classSubjects.filter(c => c.teacher).map(c => c.teacher)).size,
  }), [classSubjects]);

  // --- Loading State ----------------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8">
          <PageHeader 
            title="Class Subjects" 
            subtitle="Manage subject assignments to classes" 
            breadcrumbs={["Admin", "Academics", "Class Subjects"]} 
          />
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading class subjects...</p>
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
          title="Class Subjects" 
          subtitle={`Manage subject assignments to classes${classSubjects.length > 0 ? ` ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${classSubjects.length} assignments` : ""}`}
          breadcrumbs={["Admin", "Academics", "Class Subjects"]}
          icon={BookOpen}
          action={
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button 
                onClick={handleRefresh} 
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
                <span className="hidden xs:inline">Assign Subject</span>
                <span className="xs:hidden">Assign</span>
              </button>
            </div>
          }
        />

        {/* Error Message */}
        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error loading class subjects</p>
              <p className="text-amber-600 break-words">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assignments</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Class-Subject pairs</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Classes</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.uniqueClasses}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Classes with subjects</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Subjects</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.uniqueSubjects}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Subjects assigned</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers Assigned</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">{stats.assignedTeachers}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Active teachers</p>
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
                  placeholder="Search by class, subject, or teacher..."
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
                    <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                      {searchTerm ? "No class subjects match your search" : "No class subjects found"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {searchTerm ? "Try adjusting your search terms" : "Assign subjects to classes"}
                    </p>
                  </div>
                  {!searchTerm && (
                    <button 
                      className="mt-2 md:mt-3 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                      onClick={openAdd}
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      Assign Subject
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(getClassName(item))}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-800 truncate">{getClassName(item)}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                    {getSubjectName(item)}
                                  </Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {getTeacherName(item)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); openEdit(item); }} 
                              className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }} 
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
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pageItems.map((item) => (
                        <tr 
                          key={item.id} 
                          className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                          onClick={() => openDetail(item)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                {getInitials(getClassName(item))}
                              </div>
                              <span className="font-medium text-gray-800 truncate max-w-[150px]">{getClassName(item)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              {getSubjectName(item)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span className="text-sm text-gray-600 truncate max-w-[150px]">{getTeacherName(item)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openDetail(item); }} 
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" 
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(item); }} 
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" 
                                title="Edit assignment"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeletingItem(item); }} 
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all" 
                                title="Delete assignment"
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                {editingItem ? "Edit Assignment" : "New Assignment"}
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
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.user?.name || `Teacher ${teacher.id}`}
                    </option>
                  ))}
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
                      {editingItem ? "Update" : "Assign"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedItem && (
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
                  {getInitials(getClassName(selectedItem))}
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-white">{getClassName(selectedItem)}</h3>
                  <p className="text-xs sm:text-sm text-white/80">{getSubjectName(selectedItem)}</p>
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
                  <p className="text-sm font-semibold text-gray-800 break-words">{getClassName(selectedItem)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Subject</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 break-words">{getSubjectName(selectedItem)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Teacher</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 break-words">{getTeacherName(selectedItem)}</p>
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                  closeDetailModal();
                  openEdit(selectedItem);
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

export default ClassSubjects;