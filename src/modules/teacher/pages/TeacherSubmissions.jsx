// src/modules/teacher/pages/TeacherSubmissions.jsx

/**
 * ============================================
 * TEACHER SUBMISSIONS - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: Grade and manage student submissions
 * Used by: Teacher module routes
 * 
 * Features:
 * - View all submissions with real API data
 * - Filter by assignment, student, and status
 * - Search submissions
 * - Grade submissions (marks entry)
 * - Grade scale display
 * - Submission statistics cards
 * - Card and Table view modes
 * - Responsive design
 * - GSAP animations
 * - Framer Motion transitions
 * - Toast notifications
 * - Full screen visibility
 * - Uses common PageHeader component
 * - NO MOCK DATA - All data from API
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/assignments/submissions/ - Get submissions
 * - PATCH /api/assignments/submissions/{id}/ - Grade submission
 * - GET /api/assignments/assignments/ - Get assignments
 * - GET /api/exams/grade-scale/ - Get grade scale
 * - GET /api/users/students/ - Get students
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name instead of student?.name
 * - assignment_title instead of assignment?.title
 * - student_name in student filter dropdown
 * 
 * Usage:
 * <Route path="/teacher/submissions" element={<TeacherSubmissions />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  FileCheck,
  Search,
  Eye,
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
  FileText,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Save,
  File,
  Calendar,
  User,
  BookOpen,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchSubmissions,
  gradeSubmission,
  fetchAssignments,
  fetchStudents,
  fetchGradeScale,
} from "../store/teacherThunks";

import {
  selectTeacherSubmissions,
  selectTeacherAssignments,
  selectTeacherStudents,
  selectTeacherGradeScale,
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

const getStatusBadge = (status) => {
  const statusMap = {
    submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FileCheck },
    graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    late: { label: "Late", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
    resubmitted: { label: "Resubmitted", color: "bg-purple-100 text-purple-700 border-purple-200", icon: RefreshCw },
  };
  const config = statusMap[status] || statusMap.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getGradeLetter = (marks, totalMarks, gradeScale) => {
  if (!marks && marks !== 0) return "—";
  if (!totalMarks || totalMarks === 0) return "—";
  
  const percentage = (marks / totalMarks) * 100;
  
  if (gradeScale && gradeScale.length > 0) {
    const matching = gradeScale.find(g => 
      percentage >= g.min_percentage && percentage <= g.max_percentage
    );
    if (matching) return matching.grade;
  }
  
  // Default grading if no scale
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
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

const getInitials = (name) => {
  if (!name) return "S";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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

// ─── Grade Modal ─────────────────────────────────────────────────────────

const GradeModal = ({ isOpen, submission, onClose, onGrade, loading, gradeScale }) => {
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submission) {
      setMarks(submission.marks_obtained !== undefined && submission.marks_obtained !== null ? String(submission.marks_obtained) : "");
      setFeedback(submission.feedback || "");
    }
  }, [submission]);

  if (!isOpen || !submission) return null;

  const totalMarks = submission.assignment?.total_marks || submission.total_marks || 100;
  const currentMarks = parseFloat(marks);
  const isValid = !isNaN(currentMarks) && currentMarks >= 0 && currentMarks <= totalMarks;
  
  // ✅ Use new API fields with fallbacks
  const studentName = submission.student_name || submission.student?.name || "Student";
  const assignmentTitle = submission.assignment_title || submission.assignment?.title || "Unknown";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Grade Submission</p>
                <h3 className="text-base sm:text-lg font-bold">{studentName}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Assignment</span>
              <span className="font-medium text-gray-800">{assignmentTitle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Student</span>
              <span className="font-medium text-gray-800">{studentName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted</span>
              <span className="font-medium text-gray-800">{formatDate(submission.submitted_at || submission.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              {getStatusBadge(submission.status)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Marks Obtained (out of {totalMarks})
            </label>
            <input
              type="number"
              min="0"
              max={totalMarks}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              placeholder={`Enter marks (0-${totalMarks})`}
            />
            {marks && !isValid && (
              <p className="text-xs text-red-500 mt-1">
                Please enter a valid mark between 0 and {totalMarks}
              </p>
            )}
            {isValid && (
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="text-gray-500">Grade:</span>
                <span className="font-bold text-emerald-600">
                  {getGradeLetter(currentMarks, totalMarks, gradeScale)}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">
                  {((currentMarks / totalMarks) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
              placeholder="Add feedback for the student..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={() => onGrade(submission.id, { marks_obtained: parseFloat(marks), feedback })}
            disabled={loading || !isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Grade
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Submission Detail Modal ────────────────────────────────────────────

const SubmissionDetailModal = ({ isOpen, submission, onClose }) => {
  if (!isOpen || !submission) return null;

  // ✅ Use new API fields with fallbacks
  const studentName = submission.student_name || submission.student?.name || "Unknown";
  const assignmentTitle = submission.assignment_title || submission.assignment?.title || "Unknown";

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
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Submission Details</p>
                <h3 className="text-base sm:text-lg font-bold">{assignmentTitle}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(submission.status)}
            {submission.marks_obtained !== undefined && submission.marks_obtained !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
                <Award className="w-3 h-3" />
                {submission.marks_obtained}/{submission.total_marks || submission.assignment?.total_marks || "?"}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Student</p>
                <p className="text-sm text-gray-800">{studentName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Assignment</p>
                <p className="text-sm text-gray-800">{assignmentTitle}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="text-sm text-gray-800">{formatDate(submission.submitted_at || submission.created_at)}</p>
              </div>
            </div>
            {submission.file && (
              <div className="flex items-start gap-3">
                <File className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">File</p>
                  <a
                    href={submission.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Submission
                  </a>
                </div>
              </div>
            )}
            {submission.feedback && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Feedback</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm leading-relaxed">
                  {submission.feedback}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherSubmissions() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const submissions = useSelector(selectTeacherSubmissions);
  const assignments = useSelector(selectTeacherAssignments);
  const students = useSelector(selectTeacherStudents);
  const gradeScale = useSelector(selectTeacherGradeScale);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAssignment, setFilterAssignment] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStudent, setFilterStudent] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [gradingId, setGradingId] = useState(null);

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
      console.log('📊 Fetching submissions data...');
      
      await Promise.all([
        dispatch(fetchSubmissions()),
        dispatch(fetchAssignments()),
        dispatch(fetchStudents()),
        dispatch(fetchGradeScale()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All submissions data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load submissions. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Submissions loaded:', submissions?.length || 0);
    console.log('📊 Assignments loaded:', assignments?.length || 0);
    console.log('📊 Students loaded:', students?.length || 0);
  }, [submissions, assignments, students]);

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

  const filteredSubmissions = useMemo(() => {
    let filtered = Array.isArray(submissions) ? [...submissions] : [];
    
    console.log('📊 Filtering submissions - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        // ✅ Use new API field: student_name
        (s.student_name || s.student?.name || "").toLowerCase().includes(search) ||
        // ✅ Use new API field: assignment_title
        (s.assignment_title || s.assignment?.title || "").toLowerCase().includes(search) ||
        (s.feedback || "").toLowerCase().includes(search)
      );
    }
    
    if (filterAssignment) {
      filtered = filtered.filter(s => {
        const assignmentId = s.assignment || s.assignment_id;
        return String(assignmentId) === String(filterAssignment);
      });
    }
    
    if (filterStudent) {
      filtered = filtered.filter(s => {
        const studentId = s.student || s.student_id;
        return String(studentId) === String(filterStudent);
      });
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    console.log('📊 Filtered submissions count:', filtered.length);
    return filtered;
  }, [submissions, searchTerm, filterAssignment, filterStudent, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredSubmissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const submissionsArray = Array.isArray(submissions) ? submissions : [];
    
    const total = submissionsArray.length;
    const graded = submissionsArray.filter(s => s.status === "graded" || (s.marks_obtained !== undefined && s.marks_obtained !== null)).length;
    const pending = submissionsArray.filter(s => s.status === "pending" || s.status === "submitted").length;
    const late = submissionsArray.filter(s => s.status === "late").length;
    
    const avgMarks = submissionsArray
      .filter(s => s.marks_obtained !== undefined && s.marks_obtained !== null)
      .reduce((sum, s) => sum + (s.marks_obtained || 0), 0);
    const avgPercentage = submissionsArray
      .filter(s => s.marks_obtained !== undefined && s.marks_obtained !== null && s.assignment?.total_marks)
      .reduce((sum, s) => sum + ((s.marks_obtained / (s.assignment?.total_marks || 100)) * 100), 0);

    return {
      total,
      graded,
      pending,
      late,
      avgMarks: graded > 0 ? (avgMarks / graded).toFixed(1) : 0,
      avgPercentage: graded > 0 ? (avgPercentage / graded).toFixed(1) : 0,
    };
  }, [submissions]);

  const hasActiveFilters = searchTerm || filterAssignment || filterStudent || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setIsDetailOpen(true);
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setIsGradeOpen(true);
  };

  const handleSubmitGrade = async (id, data) => {
    setGradingId(id);
    try {
      await dispatch(gradeSubmission({ id, data })).unwrap();
      toast.success("Grade saved successfully!");
      await fetchAllData();
      setIsGradeOpen(false);
      setSelectedSubmission(null);
    } catch (err) {
      toast.error(err || "Failed to save grade");
    } finally {
      setGradingId(null);
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
    setFilterAssignment("");
    setFilterStudent("");
    setFilterStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  const isGrading = (id) => gradingId === id;

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Submissions"
        subtitle="Grade and manage student submissions"
        breadcrumbs={["Teacher", "Submissions"]}
        bgColor="bg-emerald-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Submissions"
          value={stats.total}
          icon={FileCheck}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Graded"
          value={stats.graded}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Late"
          value={stats.late}
          icon={AlertCircle}
          color="red"
          isLoading={loading}
        />
      </div>

      {/* ─── Average Stats ───────────────────────────────────────────── */}
      {stats.graded > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100">
            <p className="text-xs text-gray-500">Average Marks</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.avgMarks}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100">
            <p className="text-xs text-gray-500">Average Percentage</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.avgPercentage}%</p>
          </div>
        </div>
      )}

      {/* ─── Premium Filter Bar ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, assignment, or feedback..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                  {(filterAssignment ? 1 : 0) + (filterStudent ? 1 : 0) + (filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                  {/* Assignment Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      <button
                        onClick={() => setFilterAssignment("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterAssignment === ""
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {assignments.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setFilterAssignment(String(a.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterAssignment === String(a.id)
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {a.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Student</label>
                    <div className="mt-2 flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      <button
                        onClick={() => setFilterStudent("")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStudent === ""
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {students.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setFilterStudent(String(s.id))}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterStudent === String(s.id)
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {s.user_name || s.name || "Unknown"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "submitted", "pending", "graded", "late", "resubmitted"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-emerald-50 text-emerald-700 font-medium"
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
      {filteredSubmissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-5 border border-emerald-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Submissions Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredSubmissions.length} submissions • 
                  <span className="text-emerald-600 ml-1">{stats.graded} graded</span> •
                  <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
                  <span className="text-red-600 ml-1">{stats.late} late</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full">
                {filteredSubmissions.length} Total
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Submissions List ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileCheck className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching submissions found" : "No submissions available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "There are no submissions from students at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Clear All Filters
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
          {pageItems.map((submission) => {
            // ✅ Use new API fields with fallbacks
            const studentName = submission.student_name || submission.student?.name || "Unknown";
            const assignmentTitle = submission.assignment_title || submission.assignment?.title || "No Assignment";
            const isGraded = submission.status === "graded" || (submission.marks_obtained !== undefined && submission.marks_obtained !== null);
            const colorClass = getRandomColor(submission.student || 0);
            
            return (
              <motion.div
                key={submission.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  isGraded ? 'border-emerald-100' : 'border-amber-100'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(studentName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {studentName}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {assignmentTitle}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Submitted: {formatDate(submission.submitted_at || submission.created_at)}</span>
                    </div>
                    {isGraded && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500">Marks:</span>
                        <span className="font-semibold text-emerald-600">
                          {submission.marks_obtained}/{submission.total_marks || submission.assignment?.total_marks || "?"}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="font-medium text-blue-600">
                          {getGradeLetter(
                            submission.marks_obtained,
                            submission.total_marks || submission.assignment?.total_marks || 100,
                            gradeScale
                          )}
                        </span>
                      </div>
                    )}
                    {submission.feedback && (
                      <p className="text-xs text-gray-600 line-clamp-2">{submission.feedback}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(submission)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    {!isGraded && (
                      <button
                        onClick={() => handleGrade(submission)}
                        disabled={isGrading(submission.id)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isGrading(submission.id) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Edit className="w-3.5 h-3.5" />
                        )}
                        Grade
                      </button>
                    )}
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
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((submission) => {
                  // ✅ Use new API fields with fallbacks
                  const studentName = submission.student_name || submission.student?.name || "Unknown";
                  const assignmentTitle = submission.assignment_title || submission.assignment?.title || "—";
                  const isGraded = submission.status === "graded" || (submission.marks_obtained !== undefined && submission.marks_obtained !== null);
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(submission.student || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{assignmentTitle}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{formatDate(submission.submitted_at || submission.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {isGraded ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-emerald-600">
                              {submission.marks_obtained}/{submission.total_marks || submission.assignment?.total_marks || "?"}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              ({getGradeLetter(
                                submission.marks_obtained,
                                submission.total_marks || submission.assignment?.total_marks || 100,
                                gradeScale
                              )})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(submission)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isGraded && (
                            <button
                              onClick={() => handleGrade(submission)}
                              disabled={isGrading(submission.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Grade"
                            >
                              {isGrading(submission.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Edit className="w-4 h-4" />
                              )}
                            </button>
                          )}
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
              {filteredSubmissions.length} submissions • 
              <span className="text-emerald-600 ml-1">{stats.graded} graded</span> •
              <span className="text-amber-600 ml-1">{stats.pending} pending</span> •
              <span className="text-red-600 ml-1">{stats.late} late</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSubmissions.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
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
                      ? 'bg-emerald-600 text-white'
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
        <p>© 2024 Smart School Management System • Submissions Module</p>
      </div>

      {/* ─── Grade Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {isGradeOpen && selectedSubmission && (
          <GradeModal
            isOpen={isGradeOpen}
            submission={selectedSubmission}
            onClose={() => {
              setIsGradeOpen(false);
              setSelectedSubmission(null);
            }}
            onGrade={handleSubmitGrade}
            loading={isGrading(selectedSubmission.id)}
            gradeScale={gradeScale}
          />
        )}
      </AnimatePresence>

      {/* ─── Submission Detail Modal ────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedSubmission && (
          <SubmissionDetailModal
            isOpen={isDetailOpen}
            submission={selectedSubmission}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedSubmission(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}