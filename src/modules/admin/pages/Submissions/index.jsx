// src/modules/admin/pages/Submissions/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, FileText, User, Calendar, CheckCircle, XCircle, Clock, 
  Eye, X, Download, Filter, RefreshCw, AlertCircle, Users, 
  BookOpen, TrendingUp, TrendingDown, Award, ChevronDown, Edit
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const SUBMISSIONS_API = "/assignments/submissions/";
const ASSIGNMENTS_API = "/assignments/assignments/";
const STUDENTS_API = "/users/students/";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterAssignment, setFilterAssignment] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const itemsPerPage = 10;

  // ─── Fetch Submissions ──────────────────────────────────────────────────
  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        subject: filterSubject !== "all" ? filterSubject : undefined,
        assignment: filterAssignment !== "all" ? filterAssignment : undefined,
      };
      
      const response = await api.get(SUBMISSIONS_API, { params });
      const data = response.data?.results || response.data || [];
      
      console.log("📋 Submissions data from API:", data);
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      setLoadError(error.response?.data?.detail || error.message || "Failed to load submissions");
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterSubject, filterAssignment, itemsPerPage]);

  // ─── Fetch Related Data ───────────────────────────────────────────────
  const fetchRelatedData = useCallback(async () => {
    try {
      // Fetch assignments
      const assignmentsRes = await api.get(ASSIGNMENTS_API);
      const assignmentsData = assignmentsRes.data?.results || assignmentsRes.data || [];
      setAssignments(assignmentsData);
      
      // Fetch students
      const studentsRes = await api.get(STUDENTS_API);
      const studentsData = studentsRes.data?.results || studentsRes.data || [];
      setStudents(studentsData);
      
      // Extract unique subjects from assignments
      const uniqueSubjects = [...new Set(assignmentsData.map(a => a.subject))];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.warn("Failed to fetch related data:", error);
    }
  }, []);

  // ─── Initial Fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchSubmissions();
    fetchRelatedData();
  }, []);

  // ─── Fetch on filter change ──────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      fetchSubmissions();
    }
  }, [currentPage, searchTerm, filterStatus, filterSubject, filterAssignment]);

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'graded':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'graded':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'pending':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'rejected':
        return <XCircle className="w-3 h-3 mr-1" />;
      case 'submitted':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getGradeColor = (grade) => {
    if (!grade || grade === '-') return 'bg-gray-50 text-gray-700 border-gray-200';
    const gradeMap = {
      'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'A': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'A-': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'B+': 'bg-blue-50 text-blue-700 border-blue-200',
      'B': 'bg-blue-50 text-blue-700 border-blue-200',
      'B-': 'bg-blue-50 text-blue-700 border-blue-200',
      'C+': 'bg-amber-50 text-amber-700 border-amber-200',
      'C': 'bg-amber-50 text-amber-700 border-amber-200',
      'C-': 'bg-amber-50 text-amber-700 border-amber-200',
      'D': 'bg-rose-50 text-rose-700 border-rose-200',
      'F': 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return gradeMap[grade] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // ─── Filter Logic ──────────────────────────────────────────────────────
  const filteredSubmissions = submissions.filter(s => {
    const studentName = s.student ? String(s.student) : "";
    const assignmentName = s.assignment ? String(s.assignment) : "";
    const subjectName = s.subject ? String(s.subject) : "";
    const search = searchTerm.toLowerCase();
    
    return studentName.toLowerCase().includes(search) ||
           assignmentName.toLowerCase().includes(search) ||
           subjectName.toLowerCase().includes(search);
  });

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  const hasActiveFilters = filterStatus !== "all" || filterSubject !== "all" || filterAssignment !== "all" || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterSubject("all");
    setFilterAssignment("all");
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.status === 'graded').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    averageGrade: submissions
      .filter(s => s.grade && s.grade !== '-')
      .reduce((acc, s) => {
        const gradeMap = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
        return acc + (gradeMap[s.grade] || 0);
      }, 0) / (submissions.filter(s => s.grade && s.grade !== '-').length || 1)
  };

  // ─── Open Detail Modal ────────────────────────────────────────────────
  const openDetail = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalOpen(true);
  };

  // ─── Refresh Data ─────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubmissions();
    await fetchRelatedData();
    setRefreshing(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading submissions...</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Submissions" 
          subtitle={`Review student submissions${submissions.length ? ` — ${submissions.length} total` : ""}`}
          breadcrumbs={["Admin", "Submissions"]}
          action={
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Graded</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.graded}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Avg. Grade</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.averageGrade.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {loadError && (
            <div className="px-6 py-3 text-sm text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search submissions by student, assignment, or subject..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="graded">Graded</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="submitted">Submitted</option>
                </select>
                <select
                  value={filterSubject}
                  onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <select
                  value={filterAssignment}
                  onChange={(e) => { setFilterAssignment(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Assignments</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title || assignment.name || `Assignment ${assignment.id}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          {searchTerm ? "No submissions match your search." : "No submissions found."}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search terms" : "Waiting for student submissions"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className="hover:bg-blue-50/30 transition-colors duration-150 group cursor-pointer"
                      onClick={() => openDetail(submission)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                            {submission.student ? String(submission.student).charAt(0) : "S"}
                          </div>
                          <span className="font-medium text-gray-900">{submission.student || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{submission.assignment || "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {submission.subject || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {submission.submitted || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getStatusBadge(submission.status)} border font-medium px-3 py-1`}>
                          {getStatusIcon(submission.status)}
                          {getStatusLabel(submission.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {submission.grade && submission.grade !== '-' ? (
                          <Badge className={`${getGradeColor(submission.grade)} border font-medium px-3 py-1`}>
                            {submission.grade}
                            {submission.marks && (
                              <span className="ml-1 text-xs font-normal">
                                ({submission.marks}/{submission.total_marks})
                              </span>
                            )}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-400 border-gray-200">
                            —
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openDetail(submission); }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {submission.file && (
                            <button
                              onClick={(e) => { e.stopPropagation(); /* Handle download */ }}
                              className="p-2 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-all duration-200"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredSubmissions.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedSubmission(null);
          }}
          onEdit={() => {
            // Handle edit
            setDetailModalOpen(false);
          }}
        />
      )}
    </FadeIn>
  );
};

// ─── Submission Detail Modal ─────────────────────────────────────────────
const SubmissionDetailModal = ({ submission, onClose, onEdit }) => {
  if (!submission) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Submission Details</h2>
                <p className="text-sm text-white/80 mt-0.5">{submission.assignment}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Student</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{submission.student}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Assignment</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{submission.assignment}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Subject</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{submission.subject}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Submitted</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{submission.submitted}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <Badge className={`${getStatusBadge(submission.status)} border font-medium px-3 py-1 mt-1`}>
                  {getStatusIcon(submission.status)}
                  {getStatusLabel(submission.status)}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Grade</p>
                {submission.grade && submission.grade !== '-' ? (
                  <Badge className={`${getGradeColor(submission.grade)} border font-medium px-3 py-1 mt-1`}>
                    {submission.grade}
                    {submission.marks && (
                      <span className="ml-1 text-xs font-normal">
                        ({submission.marks}/{submission.total_marks})
                      </span>
                    )}
                  </Badge>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">Not graded yet</p>
                )}
              </div>
              {submission.feedback && (
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Feedback</p>
                  <p className="text-sm text-gray-900 mt-1">{submission.feedback}</p>
                </div>
              )}
              {submission.file && (
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">File</p>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">{submission.file}</span>
                    <button className="ml-auto p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-600/25"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Grade Submission
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Helper Functions (duplicated for modal) ─────────────────────────────
const getStatusBadge = (status) => {
  switch(status?.toLowerCase()) {
    case 'graded': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'graded': return <CheckCircle className="w-3 h-3 mr-1" />;
    case 'pending': return <Clock className="w-3 h-3 mr-1" />;
    case 'rejected': return <XCircle className="w-3 h-3 mr-1" />;
    case 'submitted': return <CheckCircle className="w-3 h-3 mr-1" />;
    default: return null;
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getGradeColor = (grade) => {
  if (!grade || grade === '-') return 'bg-gray-50 text-gray-700 border-gray-200';
  const gradeMap = {
    'A+': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'A': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'A-': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'B+': 'bg-blue-50 text-blue-700 border-blue-200',
    'B': 'bg-blue-50 text-blue-700 border-blue-200',
    'B-': 'bg-blue-50 text-blue-700 border-blue-200',
    'C+': 'bg-amber-50 text-amber-700 border-amber-200',
    'C': 'bg-amber-50 text-amber-700 border-amber-200',
    'C-': 'bg-amber-50 text-amber-700 border-amber-200',
    'D': 'bg-rose-50 text-rose-700 border-rose-200',
    'F': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return gradeMap[grade] || 'bg-gray-50 text-gray-700 border-gray-200';
};

export default Submissions;