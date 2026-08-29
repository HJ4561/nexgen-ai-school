// src/modules/student/pages/Submissions.jsx

/**
 * ============================================
 * STUDENT SUBMISSIONS - COMPLETE
 * ============================================
 * 
 * Purpose: Track and manage student assignment submissions
 * 
 * API Endpoints:
 * - GET /api/assignments/submissions/ - List submissions
 * - GET /api/assignments/assignments/ - List assignments
 * - GET /api/assignments/submissions/{id}/ - Get submission details
 * - DELETE /api/assignments/submissions/{id}/ - Delete submission
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from submissions (read-only)
 * - assignment_title from submissions (read-only)
 * - teacher_name from assignments (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import PageHeader from "@/components/layout/PageHeader";
import {
  fetchSubmissions,
  fetchAssignments,
  deleteSubmission,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentSubmissions,
  selectStudentAssignments,
  selectStudentLoading,
  selectStudentError,
  selectStudentProfile,
} from "@/modules/student/store/studentSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Calendar,
  BookOpen,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  FileUp,
  Filter,
  Search,
  ChevronDown,
  Trash2,
  Loader2,
  User,
  Users,
  Award,
  TrendingUp,
  Star,
  Sparkles,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  School,
} from "lucide-react";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getStudentName = (submission) => {
  if (!submission) return null;
  // ✅ 1. PRIORITY: Use student_name from API (new field!)
  if (submission.student_name && submission.student_name !== 'null') return submission.student_name;
  // 2. FALLBACK: Use student object
  if (submission.student) {
    if (typeof submission.student === 'string') return submission.student;
    if (submission.student.name) return submission.student.name;
    if (submission.student.student_name) return submission.student.student_name;
  }
  return null;
};

const getAssignmentTitleFromSubmission = (submission) => {
  if (!submission) return null;
  // ✅ 1. PRIORITY: Use assignment_title from API (new field!)
  if (submission.assignment_title && submission.assignment_title !== 'null') return submission.assignment_title;
  // 2. FALLBACK: Use assignment object
  if (submission.assignment) {
    if (typeof submission.assignment === 'string') return submission.assignment;
    if (submission.assignment.title) return submission.assignment.title;
    if (submission.assignment.assignment_title) return submission.assignment.assignment_title;
  }
  return null;
};

const getTeacherName = (assignment) => {
  if (!assignment) return null;
  // ✅ 1. PRIORITY: Use teacher_name from API (new field!)
  if (assignment.teacher_name && assignment.teacher_name !== 'null') return assignment.teacher_name;
  // 2. FALLBACK: Use teacher object
  if (assignment.teacher) {
    if (typeof assignment.teacher === 'string') return assignment.teacher;
    if (assignment.teacher.name) return assignment.teacher.name;
    if (assignment.teacher.teacher_name) return assignment.teacher.teacher_name;
  }
  return null;
};

const getSubjectName = (assignment) => {
  if (!assignment) return null;
  if (assignment.subject_name && assignment.subject_name !== 'null') return assignment.subject_name;
  if (assignment.subject) {
    if (typeof assignment.subject === 'string') return assignment.subject;
    if (assignment.subject.name) return assignment.subject.name;
    if (assignment.subject.subject_name) return assignment.subject.subject_name;
  }
  return null;
};

// ─── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    info: { icon: Sparkles, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  };

  const { icon: Icon, bg, border, text } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${border} ${bg} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      <Icon className={`h-5 w-5 ${text}`} />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const configs = {
    submitted: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Submitted" },
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
    graded: { color: "bg-blue-100 text-blue-700", icon: CheckCircle, label: "Graded" },
    late: { color: "bg-orange-100 text-orange-700", icon: Clock, label: "Late" },
    rejected: { color: "bg-rose-100 text-rose-700", icon: XCircle, label: "Rejected" },
    active: { color: "bg-indigo-100 text-indigo-700", icon: Clock, label: "Active" },
  };

  const config = configs[status?.toLowerCase()] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = "indigo", delay = 0 }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Submission Card ──────────────────────────────────────────────────

function SubmissionCard({ submission, assignment, onViewDetails, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff < 7) return `${diff} days ago`;
      if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const assignmentTitle = getAssignmentTitleFromSubmission(submission) || assignment?.title || "Assignment";
  const studentName = getStudentName(submission);
  const teacherName = getTeacherName(assignment);
  const subjectName = getSubjectName(assignment);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this submission?")) {
      setIsDeleting(true);
      await onDelete(submission.id);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200"
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          {/* Left: Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold text-gray-800 truncate">
                  {assignmentTitle}
                </h4>
                <StatusBadge status={submission.status} />
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(submission.created_at || submission.submitted_at)}
                </span>
                {studentName && (
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-3.5 w-3.5" />
                    {studentName}
                  </span>
                )}
                {teacherName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    Teacher: {teacherName}
                  </span>
                )}
                {subjectName && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {subjectName}
                  </span>
                )}
                {submission.marks_obtained !== null && submission.marks_obtained !== undefined && (
                  <span className="flex items-center gap-1 font-medium text-indigo-600">
                    <Award className="h-3.5 w-3.5" />
                    {submission.marks_obtained}/{assignment?.total_marks || 100}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
            >
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => onViewDetails(submission)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl hover:bg-rose-50 transition-all"
              title="Delete"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
              ) : (
                <Trash2 className="h-4 w-4 text-gray-400 hover:text-rose-500 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5 capitalize">
                      {submission.status || "Pending"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Marks</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {submission.marks_obtained !== null && submission.marks_obtained !== undefined
                        ? `${submission.marks_obtained}/${assignment?.total_marks || 100}`
                        : "Not graded"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Submitted</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {formatDate(submission.created_at || submission.submitted_at)}
                    </p>
                  </div>
                  {assignment?.due_date && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-700 mt-0.5">
                        {formatDate(assignment.due_date)}
                      </p>
                    </div>
                  )}
                </div>
                {submission.feedback && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Feedback</p>
                    <p className="text-sm text-blue-700 mt-1">{submission.feedback}</p>
                  </div>
                )}
                {submission.file && (
                  <button
                    onClick={() => window.open(submission.file, "_blank")}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl px-4 py-2 hover:bg-indigo-100 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Download Submission
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Submission Details Modal ─────────────────────────────────────────

function SubmissionDetailsModal({ submission, assignment, onClose, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!submission) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const assignmentTitle = getAssignmentTitleFromSubmission(submission) || assignment?.title || "Assignment";
  const studentName = getStudentName(submission);
  const teacherName = getTeacherName(assignment);
  const subjectName = getSubjectName(assignment);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      setIsDeleting(true);
      await onDelete(submission.id);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{assignmentTitle}</h3>
                <p className="text-sm text-white/80">
                  #{String(submission.id || '').padStart(4, '0')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <XCircle className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <StatusBadge status={submission.status} />

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {studentName || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Subject</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {subjectName || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Teacher</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {teacherName || "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Marks</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {submission.marks_obtained !== null && submission.marks_obtained !== undefined
                  ? `${submission.marks_obtained}/${assignment?.total_marks || 100}`
                  : "Not graded"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-gray-500">Submitted At</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {formatDate(submission.created_at || submission.submitted_at)}
              </p>
            </div>
            {assignment?.due_date && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {formatDate(assignment.due_date)}
                </p>
              </div>
            )}
          </div>

          {submission.feedback && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Feedback</p>
              <p className="text-sm text-blue-700 mt-1">{submission.feedback}</p>
            </div>
          )}

          {submission.file && (
            <button
              onClick={() => window.open(submission.file, "_blank")}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl px-4 py-3 hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Download className="h-4 w-4" />
              Download Submission
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────

function PremiumEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
    >
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-300/30 animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon size={32} className="text-indigo-500" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Submissions() {
  const dispatch = useDispatch();
  const submissions = useSelector(selectStudentSubmissions);
  const assignments = useSelector(selectStudentAssignments);
  const profile = useSelector(selectStudentProfile);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const containerRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Fetch Data ──────────────────────────────────────────────────
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchSubmissions()).unwrap(),
        dispatch(fetchAssignments()).unwrap(),
      ]);
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setToast({ message: "Failed to load submissions", type: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      const statCards = document.querySelectorAll('.stat-card-animate');
      if (statCards.length) {
        tl.fromTo(statCards, 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = Array.isArray(submissions) ? submissions : [];
    const total = list.length;
    const submitted = list.filter(s => s.status?.toLowerCase() === "submitted").length;
    const graded = list.filter(s => s.status?.toLowerCase() === "graded").length;
    const pending = list.filter(s => s.status?.toLowerCase() === "pending").length;
    const late = list.filter(s => s.status?.toLowerCase() === "late").length;

    return { total, submitted, graded, pending, late };
  }, [submissions]);

  // ─── Filter Submissions ─────────────────────────────────────────
  const filteredSubmissions = useMemo(() => {
    const list = Array.isArray(submissions) ? submissions : [];
    
    let filtered = list.filter((sub) => {
      const matchesStatus = filterStatus === "all" || sub.status?.toLowerCase() === filterStatus;
      const searchLower = searchTerm.toLowerCase();
      const assignmentTitle = getAssignmentTitleFromSubmission(sub) || "";
      const studentName = getStudentName(sub) || "";
      const matchesSearch = searchTerm === "" || 
        assignmentTitle.toLowerCase().includes(searchLower) ||
        studentName.toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.created_at || a.submitted_at || '';
      const dateB = b.created_at || b.submitted_at || '';
      return new Date(dateB) - new Date(dateA);
    });

    return filtered;
  }, [submissions, filterStatus, searchTerm]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Submissions refreshed", type: "info" });
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  const handleDeleteSubmission = async (id) => {
    try {
      await dispatch(deleteSubmission(id)).unwrap();
      setToast({ message: "Submission deleted successfully", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ message: "Failed to delete submission", type: "error" });
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedSubmission(null);
  };

  // ─── Get assignment for submission ──────────────────────────────
  const getAssignmentForSubmission = (submission) => {
    if (!submission) return null;
    const assignmentId = submission.assignment || submission.assignment_id;
    if (!assignmentId) return null;
    const list = Array.isArray(assignments) ? assignments : [];
    return list.find(a => a.id === assignmentId) || list.find(a => String(a.id) === String(assignmentId));
  };

  if (loading && !submissions?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Submissions"
        subtitle="Track and manage your assignment submissions"
        breadcrumbs={["Student", "Submissions"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {profile && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                <User className="h-3.5 w-3.5" />
                {profile.user_name || profile.name || "Student"}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-animate">
          <StatCard label="Total" value={stats.total} icon={FileText} color="indigo" delay={0.05} />
        </div>
        <div className="stat-card-animate">
          <StatCard label="Submitted" value={stats.submitted} icon={CheckCircle} color="emerald" delay={0.1} />
        </div>
        <div className="stat-card-animate">
          <StatCard label="Graded" value={stats.graded} icon={Award} color="blue" delay={0.15} />
        </div>
        <div className="stat-card-animate">
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" delay={0.2} />
        </div>
      </div>

      {/* ─── Debug Info ────────────────────────────────────────────── */}
      {submissions?.length === 0 && !loading && !error && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">No submissions found</p>
              <p className="text-sm text-blue-700 mt-1">
                You haven't submitted any assignments yet. 
                Go to the <Link to="/student/assignments" className="font-semibold underline hover:text-blue-900">Assignments</Link> page to view and submit your assignments.
              </p>
              {assignments?.length > 0 && (
                <p className="text-sm text-blue-700 mt-1">
                  You have {assignments.length} active assignment{assignments.length > 1 ? 's' : ''} available to submit.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search submissions by assignment or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showFilters || filterStatus !== "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Status
              {filterStatus !== "all" && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 flex flex-wrap gap-2">
                {["all", "submitted", "graded", "pending", "late", "rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                      filterStatus === status
                        ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
                {filterStatus !== "all" && (
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="px-3 py-1.5 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Submissions List ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Submissions</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredSubmissions.length} of {submissions?.length || 0} submissions
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'submission' : 'submissions'}
          </span>
        </div>

        {filteredSubmissions.length === 0 ? (
          <PremiumEmptyState
            icon={FileText}
            title={searchTerm ? "No matching submissions found" : "No submissions yet"}
            description={
              searchTerm 
                ? `No submissions found matching "${searchTerm}". Try adjusting your search.`
                : filterStatus !== "all"
                ? `No submissions with status "${filterStatus}". Try changing the filter.`
                : "You haven't submitted any assignments yet. Go to the Assignments page to submit your work."
            }
            action={(searchTerm || filterStatus !== "all") ? { 
              label: "Clear Filters", 
              onClick: () => {
                setSearchTerm("");
                setFilterStatus("all");
              }
            } : {
              label: "View Assignments",
              onClick: () => window.location.href = "/student/assignments"
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((submission, index) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                assignment={getAssignmentForSubmission(submission)}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteSubmission}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Details Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDetailsModal && selectedSubmission && (
          <SubmissionDetailsModal
            submission={selectedSubmission}
            assignment={getAssignmentForSubmission(selectedSubmission)}
            onClose={handleCloseDetails}
            onDelete={handleDeleteSubmission}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Submissions Module</p>
      </div>
    </div>
  );
}

export default Submissions;