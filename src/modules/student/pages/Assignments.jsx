// src/modules/student/pages/Assignments.jsx

/**
 * ============================================
 * STUDENT ASSIGNMENTS - FULLY FUNCTIONAL
 * ============================================
 * 
 * Purpose: View and submit assignments
 * Used by: Student module routes
 * 
 * Features:
 * - Full screen responsive layout
 * - Real API data (no mock data)
 * - Submit assignments with file upload
 * - View submission status and grades
 * - Filter by status
 * - Search assignments
 * - File validation
 * - Toast notifications
 * - Loading states
 * - Error handling
 * 
 * API Endpoints:
 * - GET /api/assignments/assignments/ - Get assignments
 * - GET /api/assignments/submissions/ - Get submissions
 * - POST /api/assignments/submissions/ - Submit assignment
 * 
 * USAGE OF NEW API FIELDS:
 * - class_name from assignments
 * - subject_name from assignments
 * - teacher_name from assignments
 * - student_name from submissions
 * - assignment_title from submissions
 * 
 * Usage:
 * <Route path="/student/assignments" element={<Assignments />} />
 * ============================================
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Clock,
  Upload,
  Eye,
  Calendar,
  User,
  BookOpen,
  Search,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Award,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  File,
  Paperclip,
  Trash2,
  Shield,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchAssignments,
  fetchSubmissions,
  submitAssignment,
} from "@/modules/student/store/studentThunks";

// ─── Status Badge ──────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const configs = {
    active: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Active" },
    assigned: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Assigned" },
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
    submitted: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Upload, label: "Submitted" },
    graded: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Graded" },
    overdue: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Overdue" },
    late: { color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle, label: "Late" },
  };

  const normalizedStatus = status?.toLowerCase() || "active";
  const config = configs[normalizedStatus] || configs.active;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

// ─── Toast Notification ───────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border ${colors[type]} px-5 py-4 shadow-2xl backdrop-blur-sm max-w-md`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

function Assignments() {
  const dispatch = useDispatch();
  const { 
    assignments = [], 
    submissions = [], 
    loading = false, 
    submitting = false,
    error = null,
  } = useSelector(state => state?.student || {});

  // ─── Local State ──────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      console.log("🔄 Fetching assignments and submissions...");
      await Promise.all([
        dispatch(fetchAssignments()),
        dispatch(fetchSubmissions()),
      ]);
      console.log("✅ Data fetched successfully");
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      setToast({ message: "Failed to load assignments. Please refresh.", type: "error" });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData, retryCount]);

  // ─── Debug Logging ──────────────────────────────────────────────────

  useEffect(() => {
    if (assignments.length > 0) {
      console.log("📊 Assignments loaded:", assignments.length);
      console.log("📊 Submissions loaded:", submissions.length);
      console.log("📊 Sample assignment:", assignments[0]);
    }
  }, [assignments, submissions]);

  // ─── Helper Functions ──────────────────────────────────────────────

  const getAssignmentStatus = (assignment) => {
    if (!assignment) return "active";

    const submission = submissions.find(s => s.assignment === assignment.id);

    if (submission?.status) {
      if (submission.status === "submitted" || submission.status === "pending") {
        return "submitted";
      }
      if (submission.status === "graded" || submission.marks_obtained !== undefined) {
        return "graded";
      }
      return submission.status;
    }

    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return "overdue";
    }

    return assignment?.status === "active" ? "active" : "assigned";
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(s => s.assignment === assignmentId);
  };

  // ─── Filtered Assignments ────────────────────────────────────────────

  const filteredAssignments = useMemo(() => {
    const list = assignments || [];
    
    return list.filter(assignment => {
      const status = getAssignmentStatus(assignment);
      const matchesFilter = filter === "all" || status === filter;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (assignment?.title || "").toLowerCase().includes(searchLower) ||
        (assignment?.description || "").toLowerCase().includes(searchLower) ||
        (assignment?.class_name || "").toLowerCase().includes(searchLower) ||
        (assignment?.subject_name || "").toLowerCase().includes(searchLower) ||
        (assignment?.teacher_name || "").toLowerCase().includes(searchLower);
      
      return matchesFilter && matchesSearch;
    });
  }, [assignments, submissions, filter, searchTerm]);

  // ─── Filter Counts ──────────────────────────────────────────────────

  const filterCounts = useMemo(() => {
    const list = assignments || [];
    const counts = { all: list.length, active: 0, submitted: 0, graded: 0, overdue: 0 };
    list.forEach(assignment => {
      const status = getAssignmentStatus(assignment);
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [assignments, submissions]);

  // ─── Handle Submit ──────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError("Please select a file to upload.");
      return;
    }
    if (!selectedAssignment) return;
    
    setFileError("");
    setSubmitSuccess(false);
    setSubmitError(null);
    
    try {
      console.log("📤 Submitting assignment:", selectedAssignment.id);
      console.log("📎 File:", file.name, file.size, file.type);
      
      // Prepare submission data
      const submitData = {
        assignment: selectedAssignment.id,
        file: file,
        description: description || "",
      };
      
      console.log("📦 Submit data:", submitData);
      
      // Dispatch the thunk
      const result = await dispatch(submitAssignment(submitData)).unwrap();
      console.log("✅ Submission result:", result);
      
      setSubmitSuccess(true);
      setToast({ message: "Assignment submitted successfully!", type: "success" });
      
      // Refresh data after submission
      setTimeout(() => {
        setShowSubmitModal(false);
        setFile(null);
        setDescription("");
        setSelectedAssignment(null);
        setFileError("");
        setSubmitSuccess(false);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error("❌ Submit error:", err);
      
      // Handle specific error cases
      let errorMessage = "Failed to submit assignment. Please try again.";
      
      if (err?.response?.status === 403) {
        errorMessage = "You don't have permission to submit this assignment. Please contact your teacher.";
      } else if (err?.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid submission. Please check your file.";
      } else if (err?.response?.status === 401) {
        errorMessage = "Your session has expired. Please login again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setFileError(errorMessage);
      setSubmitError(errorMessage);
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-zip-compressed'];
      const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.zip', '.rar'];
      
      const fileExtension = '.' + selected.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(selected.type) || validExtensions.includes(fileExtension);
      
      if (!isValidType) {
        setFileError("Invalid file type. Please upload PDF, Word, Text, PowerPoint, or ZIP files.");
        return;
      }
      
      if (selected.size > 10 * 1024 * 1024) {
        setFileError("File size exceeds 10MB limit.");
        return;
      }
      
      setFile(selected);
      setFileError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/zip', 'application/x-zip-compressed'];
      const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.zip', '.rar'];
      
      const fileExtension = '.' + droppedFile.name.split('.').pop().toLowerCase();
      const isValidType = validTypes.includes(droppedFile.type) || validExtensions.includes(fileExtension);
      
      if (!isValidType) {
        setFileError("Invalid file type. Please upload PDF, Word, Text, PowerPoint, or ZIP files.");
        return;
      }
      
      if (droppedFile.size > 10 * 1024 * 1024) {
        setFileError("File size exceeds 10MB limit.");
        return;
      }
      setFile(droppedFile);
      setFileError("");
    }
  };

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    setToast({ message: "Refreshing assignments...", type: "info" });
  };

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !assignments.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <PageHeader
          title="Assignments"
          subtitle={`${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} available`}
          breadcrumbs={["Student", "Assignments"]}
          bgColor="bg-blue-50"
        >
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </PageHeader>

        {/* ─── Stats Row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">{filterCounts.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{filterCounts.graded}</p>
            <p className="text-xs text-gray-500">Graded</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{filterCounts.overdue}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
        </div>

        {/* ─── Filters ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "submitted", label: "Submitted" },
                { id: "graded", label: "Graded" },
                { id: "overdue", label: "Overdue" },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                    filter === id
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  <span className={`text-xs ${filter === id ? "text-white/80" : "text-gray-400"}`}>
                    ({filterCounts[id] || 0})
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 pl-9 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Assignment List ───────────────────────────────────────────── */}
        <div className="space-y-3 sm:space-y-4">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <FileText size={32} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-700">No Assignments Found</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                {searchTerm 
                  ? `No assignments match your search for "${searchTerm}".` 
                  : filter !== "all" 
                    ? `No ${filter} assignments available.` 
                    : "You have no assignments at the moment."}
              </p>
              {(searchTerm || filter !== "all") && (
                <button
                  onClick={() => { setSearchTerm(""); setFilter("all"); }}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence>
              {filteredAssignments.map((assignment, index) => {
                const status = getAssignmentStatus(assignment);
                const submission = getSubmission(assignment.id);
                const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date() && (status === "active" || status === "assigned");
                const displayStatus = isOverdue ? "overdue" : status;
                const isSubmittable = !submission || status === "active" || status === "assigned" || status === "overdue";
                
                // Use new API fields
                const className = assignment.class_name || "Class";
                const subjectName = assignment.subject_name || "Subject";
                const teacherName = assignment.teacher_name || "Teacher";

                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
                      displayStatus === "overdue" ? "border-red-200 bg-red-50/30" : 
                      displayStatus === "graded" ? "border-emerald-200 bg-emerald-50/20" :
                      displayStatus === "submitted" ? "border-blue-200 bg-blue-50/20" :
                      "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 sm:p-5">
                      {/* Left: Assignment Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 truncate">
                            {assignment.title || "Untitled Assignment"}
                          </h3>
                          <StatusBadge status={displayStatus} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} className="text-blue-500" />
                            {subjectName}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} className="text-gray-400" />
                            {teacherName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} className="text-gray-400" />
                            {assignment.total_marks || 0} marks
                          </span>
                        </div>
                        
                        {assignment.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                        
                        {submission?.marks_obtained !== undefined && submission?.marks_obtained !== null && (
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <Award size={14} />
                              Score: {submission.marks_obtained}/{assignment.total_marks || 100}
                            </span>
                            {submission.feedback && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                <MessageSquare size={12} />
                                {submission.feedback}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Actions */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {isSubmittable ? (
                          <button
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:scale-105 ${
                              displayStatus === "overdue" 
                                ? "bg-red-600 hover:bg-red-700 shadow-red-200" 
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                            }`}
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmitModal(true);
                            }}
                            disabled={submitting}
                          >
                            {submitting ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Upload size={16} />
                            )}
                            {displayStatus === "overdue" ? "Submit Late" : "Submit"}
                          </button>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        {filteredAssignments.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-200 pt-4 mt-6">
            <span>
              Showing {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? "s" : ""}
              {filter !== "all" && ` (${filter} filter)`}
            </span>
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {assignments.filter(a => getAssignmentStatus(a) === "active" || getAssignmentStatus(a) === "assigned").length} Active
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {assignments.filter(a => getAssignmentStatus(a) === "graded").length} Graded
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {assignments.filter(a => getAssignmentStatus(a) === "submitted").length} Submitted
              </span>
            </span>
          </div>
        )}

      </div>

      {/* ─── Submit Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Submit Assignment</h3>
                <button
                  onClick={() => {
                    if (!submitting) {
                      setShowSubmitModal(false);
                      setFile(null);
                      setDescription("");
                      setFileError("");
                      setSubmitSuccess(false);
                      setSubmitError(null);
                    }
                  }}
                  className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                  disabled={submitting}
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              
              {submitSuccess ? (
                <div className="py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-gray-800">Assignment Submitted!</h4>
                  <p className="text-sm text-gray-500">Your assignment has been submitted successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Assignment Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Assignment
                    </label>
                    <p className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
                      {selectedAssignment?.title || "N/A"}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Subject: {selectedAssignment?.subject_name || "N/A"}</span>
                      <span>•</span>
                      <span>Due: {selectedAssignment?.due_date ? new Date(selectedAssignment.due_date).toLocaleDateString() : "N/A"}</span>
                      <span>•</span>
                      <span>{selectedAssignment?.total_marks || 0} marks</span>
                    </div>
                    {selectedAssignment?.description && (
                      <p className="mt-1 text-xs text-gray-500">
                        {selectedAssignment.description}
                      </p>
                    )}
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Upload File <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                        fileError ? "border-red-300 bg-red-50" : 
                        isDragging ? "border-blue-400 bg-blue-50" :
                        file ? "border-emerald-400 bg-emerald-50" :
                        "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.zip,.rar"
                        disabled={submitting}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        {file ? (
                          <div className="flex items-center justify-center gap-3">
                            <File size={32} className="text-emerald-500" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-700">{file.name}</p>
                              <p className="text-xs text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setFileError("");
                              }}
                              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} className={`mx-auto ${fileError ? "text-red-400" : "text-gray-400"}`} />
                            <p className={`mt-2 text-sm ${fileError ? "text-red-600" : "text-gray-600"}`}>
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              PDF, Word, Text, PowerPoint, or ZIP files (max 10MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {fileError && (
                      <p className="mt-1 text-xs text-red-500">{fileError}</p>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Description (optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add any notes or comments..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 resize-none"
                      rows={3}
                      disabled={submitting}
                    />
                  </div>

                  {/* Error Display */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-600 flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{submitError}</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting || !file}
                      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all ${
                        submitting || !file
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                      }`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="inline animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Assignment"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!submitting) {
                          setShowSubmitModal(false);
                          setFile(null);
                          setDescription("");
                          setFileError("");
                          setSubmitError(null);
                        }
                      }}
                      disabled={submitting}
                      className="px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Assignments;