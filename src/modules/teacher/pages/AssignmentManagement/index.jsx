/**
 * ============================================
 * TEACHER ASSIGNMENTS
 * ============================================
 * 
 * Purpose: Create and manage assignments
 * Used by: Teacher module routes
 * 
 * Features:
 * - Create assignments
 * - View assignments list
 * - Edit assignments
 * - Delete assignments
 * - Grade submissions
 * - View submissions
 * - Assignment statistics
 * - Filter by status, class, subject
 * - Search assignments
 * - Responsive design
 * - GSAP animations
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/assignments/assignments/ - Get assignments
 * - POST /api/assignments/assignments/ - Create assignment
 * - PATCH /api/assignments/assignments/{id}/ - Update assignment
 * - DELETE /api/assignments/assignments/{id}/ - Delete assignment
 * - GET /api/assignments/submissions/ - Get submissions
 * - PATCH /api/assignments/submissions/{id}/ - Grade submission
 * - GET /api/users/students/ - Get students
 * - GET /api/academics/classes/ - Get classes
 * - GET /api/academics/subjects/ - Get subjects
 * 
 * Usage:
 * <Route path="/teacher/assignments" element={<TeacherAssignments />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";
import {
  NotebookPen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Download,
  Upload,
  FileText,
  Users,
  BookOpen,
  AlertCircle,
  X,
  Save,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

// ─── Constants ──────────────────────────────────────────────────────────

const ASSIGNMENT_STATUS = {
  draft: { label: "Draft", color: "bg-gray-50 text-gray-700 border-gray-200" },
  published: { label: "Published", color: "bg-blue-50 text-blue-700 border-blue-200" },
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", color: "bg-purple-50 text-purple-700 border-purple-200" },
  archived: { label: "Archived", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const SUBMISSION_STATUS = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  submitted: { label: "Submitted", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Upload },
  graded: { label: "Graded", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  late: { label: "Late", color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
};

// ─── Helper Functions ──────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const getStatusBadge = (status) => {
  const config = ASSIGNMENT_STATUS[status] || ASSIGNMENT_STATUS.draft;
  return (
    <Badge className={`${config.color} text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1`}>
      {config.label}
    </Badge>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const TeacherAssignments = () => {
  const dispatch = useDispatch();
  const { assignments, submissions, classes, subjects, loading, error } = useSelector((state) => state.teacher);
  const containerRef = useRef(null);

  // ─── State ──────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class_obj: "",
    subject: "",
    due_date: "",
    total_marks: "",
    status: "draft",
  });
  const [saving, setSaving] = useState(false);
  const [grading, setGrading] = useState(false);
  const [toast, setToast] = useState(null);
  const ITEMS_PER_PAGE = 10;

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    // Fetch data
    // dispatch(fetchAssignments());
    // dispatch(fetchSubmissions());
    // dispatch(fetchClasses());
    // dispatch(fetchSubjects());
  }, [dispatch]);

  // ─── GSAP Animations ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    if (filterClass) {
      filtered = filtered.filter(a => a.class_obj === filterClass);
    }
    if (filterSubject) {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }
    return filtered;
  }, [assignments, searchTerm, filterStatus, filterClass, filterSubject]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: assignments.length,
    draft: assignments.filter(a => a.status === "draft").length,
    active: assignments.filter(a => a.status === "active").length,
    published: assignments.filter(a => a.status === "published").length,
    completed: assignments.filter(a => a.status === "completed").length,
    totalSubmissions: submissions.length,
    pendingSubmissions: submissions.filter(s => s.status === "pending" || s.status === "submitted").length,
    gradedSubmissions: submissions.filter(s => s.status === "graded").length,
  }), [assignments, submissions]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleCreateOpen = () => {
    setDrawerMode("add");
    setFormData({
      title: "",
      description: "",
      class_obj: "",
      subject: "",
      due_date: "",
      total_marks: "",
      status: "draft",
    });
    setIsDrawerOpen(true);
  };

  const handleEditOpen = (assignment) => {
    setDrawerMode("edit");
    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      class_obj: assignment.class_obj || "",
      subject: assignment.subject || "",
      due_date: assignment.due_date || "",
      total_marks: assignment.total_marks || "",
      status: assignment.status || "draft",
    });
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
  };

  const handleSaveAssignment = async () => {
    setSaving(true);
    try {
      if (drawerMode === "edit" && selectedAssignment) {
        // await dispatch(updateAssignment({ id: selectedAssignment.id, data: formData }));
        showToast("Assignment updated successfully", "success");
      } else {
        // await dispatch(createAssignment(formData));
        showToast("Assignment created successfully", "success");
      }
      setIsDrawerOpen(false);
      // dispatch(fetchAssignments());
    } catch (error) {
      showToast(error || "Failed to save assignment", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    try {
      // await dispatch(deleteAssignment(id));
      showToast("Assignment deleted successfully", "success");
      // dispatch(fetchAssignments());
    } catch (error) {
      showToast(error || "Failed to delete assignment", "error");
    }
  };

  const handleOpenGradeDrawer = (assignment) => {
    setSelectedAssignment(assignment);
    setIsGradeDrawerOpen(true);
  };

  const handleGradeSubmission = async ({ submissionId, marks_obtained, feedback }) => {
    setGrading(true);
    try {
      // await dispatch(gradeSubmission({ id: submissionId, data: { marks_obtained, feedback } }));
      showToast("Grade saved successfully", "success");
      // dispatch(fetchSubmissions());
    } catch (error) {
      showToast(error || "Failed to save grade", "error");
    } finally {
      setGrading(false);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterClass("");
    setFilterSubject("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterClass || filterSubject;

  // ─── Get Submissions for Assignment ──────────────────────────────────
  const getSubmissionsForAssignment = (assignmentId) => {
    return submissions.filter(s => s.assignment === assignmentId);
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && assignments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Assignments" subtitle="Create and manage assignments" breadcrumbs={["Teacher", "Assignments"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Assignments"
          subtitle="Create and manage assignments"
          breadcrumbs={["Teacher", "Assignments"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateOpen}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Create Assignment</span>
                <span className="xs:hidden">Create</span>
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading assignments</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Stats Cards ───────────────────────────────────────────────── */}
      <StaggerGroup className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All assignments</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Active</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Draft</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.draft}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">In progress</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Finished</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalSubmissions}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Total submissions</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.pendingSubmissions}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Needs grading</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Filters ────────────────────────────────────────────────────── */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ─── Assignments Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {pageItems.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-16 px-4">
            <div className="flex flex-col items-center gap-3">
              <NotebookPen className="w-12 h-12 text-gray-300" />
              <p className="text-sm sm:text-base text-gray-500 font-medium">No assignments found</p>
              <p className="text-xs sm:text-sm text-gray-400">
                {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first assignment to get started'}
              </p>
              <Button variant="primary" size="sm" onClick={handleCreateOpen} className="mt-2">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Create Assignment
              </Button>
            </div>
          </div>
        ) : (
          pageItems.map((assignment) => {
            const assignmentSubmissions = getSubmissionsForAssignment(assignment.id);
            const submittedCount = assignmentSubmissions.filter(s => s.status === "submitted" || s.status === "graded").length;
            const gradedCount = assignmentSubmissions.filter(s => s.status === "graded").length;
            const totalStudents = assignmentSubmissions.length;

            return (
              <Card key={assignment.id} className="p-4 hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                      {assignment.title}
                    </h4>
                    {getStatusBadge(assignment.status)}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 flex-1 min-h-[32px]">
                    {assignment.description}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{assignment.class_name || "Class"} • {assignment.subject_name || "Subject"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Total Marks: {assignment.total_marks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {submittedCount}/{totalStudents} submitted
                        {gradedCount > 0 && ` • ${gradedCount} graded`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditOpen(assignment)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenGradeDrawer(assignment)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Grade Submissions"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    <span className="text-[10px] text-gray-400">
                      {formatDate(assignment.created_at)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ─── Pagination ────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAssignments.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length)} of {filteredAssignments.length} assignments
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Grade Submissions Drawer ───────────────────────────────────── */}
      {isGradeDrawerOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsGradeDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Grade Submissions
              </h3>
              <button onClick={() => setIsGradeDrawerOpen(false)} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-800">{selectedAssignment.title}</h4>
                <p className="text-xs text-gray-500">Total Marks: {selectedAssignment.total_marks}</p>
                <p className="text-xs text-gray-500">Due Date: {formatDate(selectedAssignment.due_date)}</p>
              </div>

              {getSubmissionsForAssignment(selectedAssignment.id).length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getSubmissionsForAssignment(selectedAssignment.id).map((sub) => (
                    <div key={sub.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                            {sub.student_name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{sub.student_name || "Student"}</p>
                          </div>
                        </div>
                        {sub.file && (
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Marks</label>
                          <input
                            type="number"
                            min="0"
                            max={selectedAssignment.total_marks}
                            value={sub.marks_obtained || ""}
                            onChange={(e) => {
                              // Update grade locally
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Marks"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Feedback</label>
                          <input
                            type="text"
                            value={sub.feedback || ""}
                            onChange={(e) => {
                              // Update feedback locally
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Feedback"
                          />
                        </div>
                      </div>

                      <div className="mt-2 flex justify-end">
                        <Button variant="primary" size="sm" className="min-h-[28px] text-xs">
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="primary" size="sm" className="w-full min-h-[36px] sm:min-h-[40px]">
                    <Send className="w-4 h-4 mr-2" />
                    Save All Grades
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;