// src/modules/teacher/pages/TeacherAssignments.jsx

/**
 * ============================================
 * TEACHER ASSIGNMENTS - COMPLETE (REAL API DATA)
 * ============================================
 * 
 * Purpose: Create and manage assignments
 * Used by: Teacher module routes
 * 
 * Features:
 * - Create assignments with API
 * - View assignments list
 * - Edit assignments
 * - Delete assignments
 * - Grade submissions
 * - View submissions
 * - Assignment statistics
 * - Filter by status, class, subject
 * - Search assignments
 * - Full responsive design
 * - All content visible at full screen
 * - GSAP animations
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  NotebookPen,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
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
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  ChevronUp,
  Award,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchAssignments,
  fetchSubmissions,
  fetchTeacherClasses,
  fetchSubjects,
  fetchStudents,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,
} from "../store/teacherThunks";

import {
  selectTeacherAssignments,
  selectTeacherSubmissions,
  selectTeacherClasses,
  selectTeacherSubjects,
  selectTeacherStudents,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const ASSIGNMENT_STATUS = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  published: { label: "Published", color: "bg-blue-100 text-blue-700 border-blue-200" },
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Completed", color: "bg-purple-100 text-purple-700 border-purple-200" },
  archived: { label: "Archived", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

const SUBMISSION_STATUS = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Upload },
  graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
  late: { label: "Late", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

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
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const getSubmissionStatusBadge = (status) => {
  const config = SUBMISSION_STATUS[status] || SUBMISSION_STATUS.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          )}
          {subtitle && !isLoading && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colors[color] || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors[color] ? 'text-' + color + '-600' : 'text-gray-600'}`} />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Create/Edit Assignment Drawer ─────────────────────────────────────

const AssignmentDrawer = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, classOptions, subjectOptions }) => {
  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <NotebookPen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            {mode === "edit" ? "Edit Assignment" : "Create Assignment"}
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter assignment title"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter assignment description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_obj || ""}
                onChange={(e) => handleChange("class_obj", e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                required
              >
                <option value="">Select Class</option>
                {classOptions.map((cls) => (
                  <option key={cls.value} value={cls.value}>{cls.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                required
              >
                <option value="">Select Subject</option>
                {subjectOptions.map((sub) => (
                  <option key={sub.value} value={sub.value}>{sub.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.due_date || ""}
                onChange={(e) => handleChange("due_date", e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g., 20"
                value={formData.total_marks || ""}
                onChange={(e) => handleChange("total_marks", e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status || "draft"}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === "edit" ? "Update Assignment" : "Create Assignment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Grade Submissions Drawer ──────────────────────────────────────────

const GradeSubmissionsDrawer = ({ isOpen, onClose, assignment, submissions, onGrade, loading, totalMarks }) => {
  if (!isOpen || !assignment) return null;

  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    if (submissions) {
      const initialGrades = {};
      const initialFeedback = {};
      submissions.forEach(sub => {
        initialGrades[sub.id] = sub.marks_obtained || "";
        initialFeedback[sub.id] = sub.feedback || "";
      });
      setGrades(initialGrades);
      setFeedback(initialFeedback);
    }
  }, [submissions]);

  const handleGradeChange = (submissionId, value) => {
    setGrades({ ...grades, [submissionId]: value });
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedback({ ...feedback, [submissionId]: value });
  };

  const handleSubmitGrade = (submissionId) => {
    const marks = parseFloat(grades[submissionId]);
    if (isNaN(marks) || marks < 0 || marks > totalMarks) {
      toast.error(`Marks must be between 0 and ${totalMarks}`);
      return;
    }
    onGrade({
      submissionId,
      marks_obtained: marks,
      feedback: feedback[submissionId] || "",
    });
  };

  const handleSubmitAll = () => {
    const entries = Object.entries(grades).filter(([_, value]) => value !== "" && value !== undefined);
    if (entries.length === 0) {
      toast.error("No grades to save");
      return;
    }
    entries.forEach(([id, marks]) => {
      const marksNum = parseFloat(marks);
      if (!isNaN(marksNum) && marksNum >= 0 && marksNum <= totalMarks) {
        onGrade({
          submissionId: id,
          marks_obtained: marksNum,
          feedback: feedback[id] || "",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Grade Submissions
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-800">{assignment.title}</h4>
            <p className="text-xs text-gray-500">Total Marks: {totalMarks}</p>
            <p className="text-xs text-gray-500">Due Date: {formatDate(assignment.due_date)}</p>
            <p className="text-xs text-gray-500">Submissions: {submissions.length}</p>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                        {sub.student_name?.charAt(0) || sub.student?.name?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{sub.student_name || sub.student?.name || "Student"}</p>
                        {getSubmissionStatusBadge(sub.status)}
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
                        max={totalMarks}
                        value={grades[sub.id] || ""}
                        onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Marks"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Feedback</label>
                      <input
                        type="text"
                        value={feedback[sub.id] || ""}
                        onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Feedback"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => handleSubmitGrade(sub.id)}
                      disabled={grades[sub.id] === "" || grades[sub.id] === undefined}
                      className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3 h-3 inline mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitAll}
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Save All Grades
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherAssignments() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const assignments = useSelector(selectTeacherAssignments);
  const submissions = useSelector(selectTeacherSubmissions);
  const classes = useSelector(selectTeacherClasses);
  const subjects = useSelector(selectTeacherSubjects);
  const students = useSelector(selectTeacherStudents);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [showFilters, setShowFilters] = useState(false);
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
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ITEMS_PER_PAGE = 9;

  // ─── Animation Variants ──────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching assignment data...');
      
      await Promise.all([
        dispatch(fetchTeacherClasses()),
        dispatch(fetchSubjects()),
        dispatch(fetchStudents()),
        dispatch(fetchAssignments()),
        dispatch(fetchSubmissions()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All assignment data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load data. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Assignments loaded:', assignments?.length || 0);
    console.log('📊 Submissions loaded:', submissions?.length || 0);
    console.log('📊 Classes loaded:', classes?.length || 0);
    console.log('📊 Subjects loaded:', subjects?.length || 0);
  }, [assignments, submissions, classes, subjects]);

  // ─── GSAP Animations ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Filter Logic ─────────────────────────────────────────────────────

  const filteredAssignments = useMemo(() => {
    let filtered = Array.isArray(assignments) ? [...assignments] : [];
    
    console.log('📊 Filtering assignments - raw count:', filtered.length);

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
      filtered = filtered.filter(a => {
        const classId = a.class_obj || a.class_obj_id;
        return String(classId) === String(filterClass);
      });
    }
    
    if (filterSubject) {
      filtered = filtered.filter(a => {
        const subjectId = a.subject || a.subject_id;
        return String(subjectId) === String(filterSubject);
      });
    }

    console.log('📊 Filtered assignments count:', filtered.length);
    return filtered;
  }, [assignments, searchTerm, filterStatus, filterClass, filterSubject]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAssignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const assignmentsArray = Array.isArray(assignments) ? assignments : [];
    const submissionsArray = Array.isArray(submissions) ? submissions : [];
    
    return {
      total: assignmentsArray.length,
      draft: assignmentsArray.filter(a => a.status === "draft").length,
      active: assignmentsArray.filter(a => a.status === "active").length,
      published: assignmentsArray.filter(a => a.status === "published").length,
      completed: assignmentsArray.filter(a => a.status === "completed").length,
      totalSubmissions: submissionsArray.length,
      pendingSubmissions: submissionsArray.filter(s => s.status === "pending" || s.status === "submitted").length,
      gradedSubmissions: submissionsArray.filter(s => s.status === "graded").length,
    };
  }, [assignments, submissions]);

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
    if (!formData.title || !formData.description || !formData.class_obj || !formData.subject || !formData.due_date || !formData.total_marks) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        total_marks: parseInt(formData.total_marks),
      };
      
      if (drawerMode === "edit" && selectedAssignment) {
        await dispatch(updateAssignment({ id: selectedAssignment.id, data })).unwrap();
        toast.success("Assignment updated successfully");
      } else {
        await dispatch(createAssignment(data)).unwrap();
        toast.success("Assignment created successfully");
      }
      setIsDrawerOpen(false);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await dispatch(deleteAssignment(id)).unwrap();
      toast.success("Assignment deleted successfully");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to delete assignment");
    }
  };

  const handleOpenGradeDrawer = (assignment) => {
    setSelectedAssignment(assignment);
    setIsGradeDrawerOpen(true);
  };

  const handleGradeSubmission = async ({ submissionId, marks_obtained, feedback }) => {
    setGrading(true);
    try {
      await dispatch(gradeSubmission({ id: submissionId, data: { marks_obtained, feedback } })).unwrap();
      toast.success("Grade saved successfully");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save grade");
    } finally {
      setGrading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterClass("");
    setFilterSubject("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterClass || filterSubject;

  // ─── Get Submissions for Assignment ──────────────────────────────────

  const getSubmissionsForAssignment = (assignmentId) => {
    return Array.isArray(submissions) ? submissions.filter(s => {
      const assignment = s.assignment || s.assignment_id;
      return String(assignment) === String(assignmentId);
    }) : [];
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Assignments"
        subtitle="Create and manage assignments for your students"
        breadcrumbs={["Teacher", "Assignments"]}
        bgColor="bg-blue-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleCreateOpen}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Assignment</span>
            </button>
          </div>
        }
      />

      {/* ─── Success/Error Messages ────────────────────────────────── */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          icon={FileText}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Draft"
          value={stats.draft}
          icon={Clock}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon={Upload}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Submissions"
          value={stats.totalSubmissions}
          icon={Users}
          color="purple"
          isLoading={loading}
        />
        <StatCard
          title="Pending Grading"
          value={stats.pendingSubmissions}
          icon={AlertCircle}
          color="red"
          isLoading={loading}
        />
      </div>

      {/* ─── Premium Filter Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments by title or description..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {(filterStatus !== "all" ? 1 : 0) + (filterClass ? 1 : 0) + (filterSubject ? 1 : 0) + (searchTerm ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "all"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {["draft", "published", "active", "completed", "archived"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterClass("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          !filterClass
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {Array.isArray(classes) && classes.slice(0, 6).map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setFilterClass(String(cls.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            String(filterClass) === String(cls.id)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {cls.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterSubject("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          !filterSubject
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {Array.isArray(subjects) && subjects.slice(0, 6).map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setFilterSubject(String(sub.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            String(filterSubject) === String(sub.id)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Results Summary Banner ──────────────────────────────────── */}
      {filteredAssignments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <NotebookPen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Assignment Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredAssignments.length} assignments • 
                  {stats.active} active • 
                  {stats.pendingSubmissions} pending submissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {filteredAssignments.length} Total
              </span>
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full capitalize">
                  {filterStatus}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Assignments Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <NotebookPen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching assignments found" : "No assignments available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Create your first assignment to get started."}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={handleCreateOpen}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </button>
          )}
        </div>
      ) : viewMode === "card" ? (
        // ─── Card View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((assignment) => {
            const assignmentSubmissions = getSubmissionsForAssignment(assignment.id);
            const submittedCount = assignmentSubmissions.filter(s => s.status === "submitted" || s.status === "graded").length;
            const gradedCount = assignmentSubmissions.filter(s => s.status === "graded").length;
            const totalStudents = assignmentSubmissions.length;

            return (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">
                      {assignment.title}
                    </h4>
                    {getStatusBadge(assignment.status)}
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 flex-1 min-h-[32px]">
                    {assignment.description || "No description"}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {assignment.class_name || assignment.class_obj?.name || "Class"} • 
                        {assignment.subject_name || assignment.subject?.name || "Subject"}
                      </span>
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

                  <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
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
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // ─── List View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((assignment) => (
                  <motion.tr
                    key={assignment.id}
                    variants={itemVariants}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{assignment.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{assignment.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{assignment.class_name || assignment.class_obj?.name || "—"}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{assignment.subject_name || assignment.subject?.name || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(assignment.due_date)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
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
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAssignments.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length)} of {filteredAssignments.length} assignments
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
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
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
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
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • Assignments Module</p>
        <p className="mt-1">
          {filteredAssignments.length} assignments • 
          {filterStatus !== "all" ? ` Filtered by: ${filterStatus}` : " All statuses"}
          {filterClass ? ` • Class: ${classes?.find(c => String(c.id) === String(filterClass))?.name || filterClass}` : ""}
          {filterSubject ? ` • Subject: ${subjects?.find(s => String(s.id) === String(filterSubject))?.name || filterSubject}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Assignment Drawer ────────────────────────────────────────── */}
      <AssignmentDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mode={drawerMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveAssignment}
        loading={saving}
        classOptions={Array.isArray(classes) ? classes.map(c => ({ value: c.id, label: c.name })) : []}
        subjectOptions={Array.isArray(subjects) ? subjects.map(s => ({ value: s.id, label: s.name })) : []}
      />

      {/* ─── Grade Submissions Drawer ────────────────────────────────── */}
      <GradeSubmissionsDrawer
        isOpen={isGradeDrawerOpen}
        onClose={() => setIsGradeDrawerOpen(false)}
        assignment={selectedAssignment}
        submissions={selectedAssignment ? getSubmissionsForAssignment(selectedAssignment.id) : []}
        onGrade={handleGradeSubmission}
        loading={grading}
        totalMarks={selectedAssignment?.total_marks || 100}
      />
    </div>
  );
}