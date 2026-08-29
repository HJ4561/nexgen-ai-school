/**
 * ============================================
 * PARENT SUBMISSIONS COMPONENT
 * ============================================
 * 
 * Purpose: View child assignment submissions and grades
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for filtering by child
 * - Submission statistics
 * - Submission list with filters
 * - View submission details
 * - Download submission file
 * - Filter by status and subject
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/assignments/submissions/ - Get submissions
 * 
 * Usage:
 * <Route path="/parent/submissions" element={<ParentSubmissions />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Search,
  Eye,
  Download,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchParentLinks,
  fetchSubmissions,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const ITEMS_PER_PAGE = 10;

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
  const config = {
    submitted: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    graded: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    returned: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: RefreshCw },
    late: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
    pending: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    approved: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  };
  const info = config[status] || config.submitted;
  const Icon = info.icon;
  return (
    <Badge className={`${info.color} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Submitted"}
    </Badge>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children }) => {
  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm pr-8 sm:pr-10 min-h-[36px] sm:min-h-[42px]"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Submission Detail Drawer ──────────────────────────────────────────

const SubmissionDetailDrawer = ({ isOpen, onClose, submission }) => {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Submission Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Assignment</label>
            <p className="text-sm font-medium text-gray-800">{submission.assignment_title || "Assignment"}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Subject</label>
            <p className="text-sm text-gray-800">{submission.subject_name || "—"}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student</label>
            <p className="text-sm text-gray-800">{submission.student_name || "—"}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            {getStatusBadge(submission.status)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Marks Obtained</label>
              <p className="text-lg font-bold text-gray-800">{submission.marks_obtained || 0}</p>
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Marks</label>
              <p className="text-lg font-bold text-gray-800">{submission.total_marks || 0}</p>
            </div>
          </div>

          {submission.feedback && (
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Feedback</label>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm leading-relaxed">
                {submission.feedback}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Submitted At</label>
            <p className="text-sm text-gray-600">{formatDate(submission.submitted_at || submission.created_at)}</p>
          </div>

          {submission.file_url && (
            <div className="pt-2 border-t border-gray-100">
              <Button
                variant="primary"
                size="sm"
                className="w-full min-h-[36px] sm:min-h-[40px]"
                onClick={() => window.open(submission.file_url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Submission
              </Button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full min-h-[36px] sm:min-h-[40px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentSubmissions = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  // Use direct state access since selectSubmissions doesn't exist
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const submissions = useSelector((state) => state.parent.submissions || []);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  // ─── Get unique subjects for filter ─────────────────────────────────
  const subjectOptions = useMemo(() => {
    const subjects = new Set();
    submissions.forEach(sub => {
      if (sub.subject_name) subjects.add(sub.subject_name);
      if (sub.subject) subjects.add(sub.subject);
    });
    return Array.from(subjects);
  }, [submissions]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    if (selectedChild) {
      filtered = filtered.filter(s => s.student === selectedChild || s.student_id === selectedChild);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.assignment_title?.toLowerCase().includes(search) ||
        s.student_name?.toLowerCase().includes(search) ||
        s.subject_name?.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }

    if (filterSubject !== "all") {
      filtered = filtered.filter(s => s.subject === filterSubject || s.subject_name === filterSubject);
    }

    return filtered;
  }, [submissions, selectedChild, searchTerm, filterStatus, filterSubject]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredSubmissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: submissions.length,
    submitted: submissions.filter(s => s.status === "submitted" || s.status === "pending").length,
    graded: submissions.filter(s => s.status === "graded" || s.status === "approved").length,
    late: submissions.filter(s => s.status === "late").length,
  }), [submissions]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    setCurrentPage(1);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setIsDrawerOpen(true);
  };

  const handleDownload = (submission) => {
    showToast("Downloading submission...", "info");
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterSubject("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterSubject !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Submissions" subtitle="View assignment submissions and grades" breadcrumbs={["Parent", "Submissions"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Submissions"
          subtitle="View assignment submissions and grades"
          breadcrumbs={["Parent", "Submissions"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
                />
              </div>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading submissions</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All submissions</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.submitted}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Awaiting grading</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Graded</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.graded}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Completed</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-red-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Late</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.late}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Needs attention</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
              <option value="returned">Returned</option>
              <option value="late">Late</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
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

      {/* Submissions List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-12 h-12 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">No submissions found</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Submissions will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {pageItems.map((sub) => (
                  <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800 truncate max-w-[150px]">{sub.assignment_title || "Assignment"}</p>
                        <p className="text-xs text-gray-500">{sub.student_name || "Student"}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(sub.submitted_at || sub.created_at)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(sub.status)}
                          {sub.marks_obtained !== undefined && sub.marks_obtained !== null && (
                            <span className="text-xs font-semibold text-gray-700">
                              {sub.marks_obtained}/{sub.total_marks}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewSubmission(sub)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(sub)}
                          className="p-2 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Student</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm font-medium text-gray-800 truncate block max-w-[120px]">
                            {sub.assignment_title || "Assignment"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{sub.student_name || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{sub.subject_name || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          {getStatusBadge(sub.status)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          {sub.marks_obtained !== undefined && sub.marks_obtained !== null ? (
                            <span className="text-sm font-semibold text-gray-700">
                              {sub.marks_obtained}/{sub.total_marks || 0}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewSubmission(sub)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(sub)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                              <Download className="w-4 h-4" />
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

        {filteredSubmissions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredSubmissions.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Submission Detail Drawer */}
      <SubmissionDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        submission={selectedSubmission}
      />
    </div>
  );
};

export default ParentSubmissions;