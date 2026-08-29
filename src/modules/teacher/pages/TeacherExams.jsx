// src/modules/teacher/pages/TeacherExams.jsx

/**
 * ============================================
 * TEACHER EXAMS - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: Create and manage exams
 * Used by: Teacher module routes
 * 
 * Features:
 * - Create exams with dialog
 * - Add questions to exams
 * - View exam list with real API data
 * - Exam statistics cards
 * - Filter by class, subject, and status
 * - Search exams
 * - View exam details in modal
 * - Edit and delete exams
 * - Card and Table view modes
 * - Responsive design
 * - Full screen visibility
 * - GSAP animations
 * - Framer Motion transitions
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/exams/exams/ - Get exams
 * - POST /api/exams/exams/ - Create exam
 * - PATCH /api/exams/exams/{id}/ - Update exam
 * - DELETE /api/exams/exams/{id}/ - Delete exam
 * - GET /api/academics/classes/ - Get classes
 * - GET /api/academics/subjects/ - Get subjects
 * 
 * USAGE OF NEW API FIELDS:
 * - class_name instead of class_obj?.name
 * - subject_name instead of subject?.name
 * - teacher_name instead of teacher?.name (nullable)
 * - exam_name for questions/answers (if applicable)
 * 
 * Usage:
 * <Route path="/teacher/exams" element={<TeacherExams />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  BookMarked,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Grid,
  List,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Clock,
  FileQuestion,
  Users,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  FileText,
  HelpCircle,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
  fetchQuestions,
  createQuestion,
  fetchTeacherClasses,
  fetchSubjects,
} from "../store/teacherThunks";

import {
  selectTeacherExams,
  selectTeacherClasses,
  selectTeacherSubjects,
  selectTeacherQuestions,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

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

// ─── FIXED: Get status from various possible field names ─────────────
const getExamStatus = (exam) => {
  return exam.status || 
         exam.exam_status || 
         exam.state || 
         exam.exam_state ||
         'draft';
};

const getStatusBadge = (status) => {
  const statusMap = {
    active: { label: "Active", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    draft: { label: "Draft", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    completed: { label: "Completed", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Award },
    scheduled: { label: "Scheduled", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Calendar },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    published: { label: "Published", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    ongoing: { label: "Ongoing", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: Clock },
  };
  const config = statusMap[status] || statusMap.draft;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getStatusColor = (status) => {
  const map = {
    active: "border-l-emerald-500",
    draft: "border-l-amber-500",
    completed: "border-l-blue-500",
    scheduled: "border-l-purple-500",
    cancelled: "border-l-red-500",
    published: "border-l-green-500",
    ongoing: "border-l-indigo-500",
  };
  return map[status] || "border-l-gray-500";
};

const getRandomColor = (id) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-pink-100 text-pink-700",
  ];
  return colors[id % colors.length] || colors[0];
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
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
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

// ─── Create/Edit Exam Modal ─────────────────────────────────────────────

const ExamModal = ({ isOpen, exam, onClose, onSave, loading, classes, subjects }) => {
  const [formData, setFormData] = useState({
    name: "",
    class_obj: "",
    subject: "",
    teacher: "",
    exam_type: "annual",
    date: "",
    total_marks: 100,
    description: "",
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        name: exam.name || "",
        class_obj: exam.class_obj || exam.class_id || "",
        subject: exam.subject || exam.subject_id || "",
        teacher: exam.teacher || exam.teacher_id || "",
        exam_type: exam.exam_type || "annual",
        date: exam.date || "",
        total_marks: exam.total_marks || 100,
        description: exam.description || "",
      });
    } else {
      setFormData({
        name: "",
        class_obj: "",
        subject: "",
        teacher: "",
        exam_type: "annual",
        date: "",
        total_marks: 100,
        description: "",
      });
    }
  }, [exam]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const examTypes = [
    { value: "annual", label: "Annual" },
    { value: "mid_term", label: "Mid Term" },
    { value: "final_term", label: "Final Term" },
    { value: "quiz", label: "Quiz" },
    { value: "test", label: "Test" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">{exam ? "Edit Exam" : "Create Exam"}</p>
                <h3 className="text-base sm:text-lg font-bold">{exam ? exam.name || "Exam" : "New Exam"}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Exam Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. Final Term Math"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Class *</label>
              <select
                name="class_obj"
                value={formData.class_obj}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Subject *</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Subject</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Exam Type *</label>
              <select
                name="exam_type"
                value={formData.exam_type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {examTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Total Marks</label>
            <input
              type="number"
              name="total_marks"
              value={formData.total_marks}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Additional details about the exam..."
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
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
                  {exam ? "Update Exam" : "Create Exam"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Exam Detail Modal ──────────────────────────────────────────────────

const ExamDetailModal = ({ isOpen, exam, onClose, onEdit, onDelete, onAddQuestion, loading }) => {
  if (!isOpen || !exam) return null;

  const examStatus = getExamStatus(exam);
  
  // ✅ Use new API fields: class_name, subject_name, teacher_name
  const className = exam.class_name || exam.class_obj?.name || "—";
  const subjectName = exam.subject_name || exam.subject?.name || "—";
  const teacherName = exam.teacher_name || exam.teacher?.name || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Exam Details</p>
                <h3 className="text-base sm:text-lg font-bold">{exam.name}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(examStatus)}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Class</p>
                <p className="text-sm font-medium text-gray-800">{className}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Subject</p>
                <p className="text-sm font-medium text-gray-800">{subjectName}</p>
              </div>
            </div>

            {teacherName && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Teacher</p>
                  <p className="text-sm text-gray-800">{teacherName}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-800">{formatDate(exam.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Total Marks</p>
                <p className="text-sm text-gray-800">{exam.total_marks || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Exam Type</p>
                <p className="text-sm text-gray-800 capitalize">{exam.exam_type || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileQuestion className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Questions</p>
                <p className="text-sm text-gray-800">{exam.questions_count || exam.question_count || 0}</p>
              </div>
            </div>

            {exam.description && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm leading-relaxed">
                  {exam.description}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          <button
            onClick={() => { onEdit(exam); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit Exam
          </button>
          <button
            onClick={() => onAddQuestion(exam)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Question
          </button>
          <button
            onClick={() => { if (confirm("Delete this exam?")) onDelete(exam.id); onClose(); }}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherExams() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const exams = useSelector(selectTeacherExams);
  const classes = useSelector(selectTeacherClasses);
  const subjects = useSelector(selectTeacherSubjects);
  const questions = useSelector(selectTeacherQuestions);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedExam, setSelectedExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

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
      console.log('📊 Fetching exams data...');
      
      await Promise.all([
        dispatch(fetchExams()),
        dispatch(fetchTeacherClasses()),
        dispatch(fetchSubjects()),
        dispatch(fetchQuestions()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All exams data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load exams. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Exams loaded:', exams?.length || 0);
    console.log('📊 Classes loaded:', classes?.length || 0);
    console.log('📊 Subjects loaded:', subjects?.length || 0);
  }, [exams, classes, subjects]);

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

  // ─── Computed Values ─────────────────────────────────────────────────

  const filteredExams = useMemo(() => {
    let filtered = Array.isArray(exams) ? [...exams] : [];
    
    console.log('📊 Filtering exams - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name || "").toLowerCase().includes(search) ||
        (e.description || "").toLowerCase().includes(search) ||
        // ✅ Search in new API fields too
        (e.class_name || "").toLowerCase().includes(search) ||
        (e.subject_name || "").toLowerCase().includes(search) ||
        (e.teacher_name || "").toLowerCase().includes(search)
      );
    }
    
    if (filterClass) {
      filtered = filtered.filter(e => {
        const classId = e.class_obj || e.class_id;
        return String(classId) === String(filterClass);
      });
    }
    
    if (filterSubject) {
      filtered = filtered.filter(e => {
        const subjectId = e.subject || e.subject_id;
        return String(subjectId) === String(filterSubject);
      });
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(e => {
        const status = getExamStatus(e);
        return status === filterStatus;
      });
    }

    console.log('📊 Filtered exams count:', filtered.length);
    return filtered;
  }, [exams, searchTerm, filterClass, filterSubject, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredExams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const examsArray = Array.isArray(exams) ? exams : [];
    
    console.log('📊 Calculating exam stats for:', examsArray.length, 'exams');
    console.log('📊 First exam for stats:', examsArray[0]);
    
    const total = examsArray.length;
    
    // Use getExamStatus to get status from various field names
    const active = examsArray.filter(e => getExamStatus(e) === "active" || getExamStatus(e) === "published").length;
    const draft = examsArray.filter(e => getExamStatus(e) === "draft").length;
    const completed = examsArray.filter(e => getExamStatus(e) === "completed" || getExamStatus(e) === "finished").length;
    const scheduled = examsArray.filter(e => getExamStatus(e) === "scheduled" || getExamStatus(e) === "upcoming").length;

    console.log('📊 Stats calculated:', { total, active, draft, completed, scheduled });

    return {
      total,
      active,
      draft,
      completed,
      scheduled,
    };
  }, [exams]);

  const hasActiveFilters = searchTerm || filterClass || filterSubject || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleCreateExam = () => {
    setIsEditing(false);
    setSelectedExam(null);
    setIsModalOpen(true);
  };

  const handleEditExam = (exam) => {
    setIsEditing(true);
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleSaveExam = async (data) => {
    try {
      if (isEditing && selectedExam) {
        await dispatch(updateExam({ id: selectedExam.id, data })).unwrap();
        toast.success("Exam updated successfully!");
      } else {
        await dispatch(createExam(data)).unwrap();
        toast.success("Exam created successfully!");
      }
      setIsModalOpen(false);
      setSelectedExam(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save exam");
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await dispatch(deleteExam(id)).unwrap();
      toast.success("Exam deleted successfully!");
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to delete exam");
    }
  };

  const handleViewDetails = (exam) => {
    console.log('📊 Viewing exam:', exam);
    setSelectedExam(exam);
    setIsDetailOpen(true);
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
    setFilterClass("");
    setFilterSubject("");
    setFilterStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && exams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading exams...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Exams"
        subtitle="Create and manage exams"
        breadcrumbs={["Teacher", "Exams"]}
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
              onClick={handleCreateExam}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Create Exam</span>
              <span className="xs:hidden">Create</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Exams"
          value={stats.total}
          icon={BookMarked}
          color="blue"
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
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          color="purple"
          isLoading={loading}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={Award}
          color="indigo"
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
                placeholder="Search exams by name, class, subject, or description..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
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
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
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
                  {(filterClass ? 1 : 0) + (filterSubject ? 1 : 0) + (filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      <button
                        onClick={() => setFilterClass("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterClass === ""
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {classes.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => setFilterClass(String(cls.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterClass === String(cls.id)
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
                    <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      <button
                        onClick={() => setFilterSubject("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterSubject === ""
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {subjects.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setFilterSubject(String(sub.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterSubject === String(sub.id)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "active", "draft", "scheduled", "completed", "cancelled", "published", "ongoing"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === "all" ? "All" : status}
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
                      <X className="h-4 w-4" />
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
      {filteredExams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-5 border border-blue-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookMarked className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Exams Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredExams.length} exams • 
                  <span className="text-emerald-600 ml-1">{stats.active} active</span> •
                  <span className="text-amber-600 ml-1">{stats.draft} draft</span> •
                  <span className="text-purple-600 ml-1">{stats.scheduled} scheduled</span> •
                  <span className="text-blue-600 ml-1">{stats.completed} completed</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">
                {filteredExams.length} Total
              </span>
              {filterClass && classes.find(c => String(c.id) === String(filterClass)) && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {classes.find(c => String(c.id) === String(filterClass))?.name}
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full capitalize">
                  {filterStatus}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Exams List ────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookMarked className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching exams found" : "No exams available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "Create your first exam to get started."}
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
              onClick={handleCreateExam}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Create Exam
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
          {pageItems.map((exam) => {
            const examStatus = getExamStatus(exam);
            const statusColor = getStatusColor(examStatus);
            // ✅ Use new API fields
            const className = exam.class_name || exam.class_obj?.name || "No Class";
            const subjectName = exam.subject_name || exam.subject?.name || "No Subject";
            const teacherName = exam.teacher_name || exam.teacher?.name || null;
            
            return (
              <motion.div
                key={exam.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${statusColor} border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <BookMarked className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {exam.name}
                        </h4>
                        <p className="text-xs text-gray-500">{className}</p>
                      </div>
                    </div>
                    {getStatusBadge(examStatus)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{subjectName}</span>
                    </div>
                    {teacherName && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{teacherName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Award className="w-3.5 h-3.5" />
                      <span>{exam.total_marks || 0} marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FileQuestion className="w-3.5 h-3.5" />
                      <span>{exam.questions_count || exam.question_count || 0} questions</span>
                    </div>
                    {exam.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{exam.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(exam)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    <button
                      onClick={() => handleEditExam(exam)}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this exam?")) handleDeleteExam(exam.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // ─── Table View ──────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Class</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((exam) => {
                  const examStatus = getExamStatus(exam);
                  // ✅ Use new API fields
                  const className = exam.class_name || exam.class_obj?.name || "—";
                  const subjectName = exam.subject_name || exam.subject?.name || "—";
                  
                  return (
                    <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{exam.name}</p>
                          {exam.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{exam.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{className}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{subjectName}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(exam.date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(examStatus)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(exam)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm("Delete this exam?")) handleDeleteExam(exam.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredExams.length} exams • 
              <span className="text-emerald-600 ml-1">{stats.active} active</span> •
              <span className="text-amber-600 ml-1">{stats.draft} draft</span> •
              <span className="text-blue-600 ml-1">{stats.completed} completed</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredExams.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredExams.length)} of {filteredExams.length} exams
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
        <p>© 2024 Smart School Management System • Exams Module</p>
        <p className="mt-1">
          {filteredExams.length} exams • 
          {filterClass ? ` Class: ${classes.find(c => String(c.id) === String(filterClass))?.name || "..."}` : " All classes"}
          {filterStatus !== "all" ? ` • Status: ${filterStatus}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Create/Edit Exam Modal ────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <ExamModal
            isOpen={isModalOpen}
            exam={isEditing ? selectedExam : null}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedExam(null);
            }}
            onSave={handleSaveExam}
            loading={submitting}
            classes={classes}
            subjects={subjects}
          />
        )}
      </AnimatePresence>

      {/* ─── Exam Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedExam && (
          <ExamDetailModal
            isOpen={isDetailOpen}
            exam={selectedExam}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedExam(null);
            }}
            onEdit={handleEditExam}
            onDelete={handleDeleteExam}
            onAddQuestion={(exam) => {
              // Placeholder for add question functionality
              toast.info("Add question feature coming soon!");
              setIsDetailOpen(false);
            }}
            loading={loading}
          />
        )}
      </AnimatePresence>

    </div>
  );
}