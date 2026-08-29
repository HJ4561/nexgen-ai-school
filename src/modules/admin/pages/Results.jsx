// src/modules/admin/pages/Results.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, Eye, X, RefreshCw, AlertCircle, CheckCircle, 
  Loader2, Award, Users, BookOpen, Calendar, FileText,
  TrendingUp, TrendingDown, Download
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const GRADE_STYLES = {
  "A+": "bg-green-100 text-green-700 border-green-200",
  "A": "bg-green-100 text-green-700 border-green-200",
  "A-": "bg-green-100 text-green-700 border-green-200",
  "B+": "bg-blue-100 text-blue-700 border-blue-200",
  "B": "bg-blue-100 text-blue-700 border-blue-200",
  "B-": "bg-blue-100 text-blue-700 border-blue-200",
  "C+": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "C": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "C-": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "D": "bg-red-100 text-red-700 border-red-200",
  "F": "bg-red-100 text-red-700 border-red-200",
};

const GRADE_ICONS = {
  "A+": <Award className="w-3 h-3" />,
  "A": <Award className="w-3 h-3" />,
  "A-": <Award className="w-3 h-3" />,
  "B+": <TrendingUp className="w-3 h-3" />,
  "B": <TrendingUp className="w-3 h-3" />,
  "B-": <TrendingUp className="w-3 h-3" />,
  "C+": <TrendingDown className="w-3 h-3" />,
  "C": <TrendingDown className="w-3 h-3" />,
  "C-": <TrendingDown className="w-3 h-3" />,
  "D": <AlertCircle className="w-3 h-3" />,
  "F": <AlertCircle className="w-3 h-3" />,
};

const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Ã¢â‚¬â€";
  }
};

const getGrade = (marks, totalMarks) => {
  if (!marks || !totalMarks) return "Ã¢â‚¬â€";
  const percentage = (marks / totalMarks) * 100;
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 75) return "A-";
  if (percentage >= 70) return "B+";
  if (percentage >= 65) return "B";
  if (percentage >= 60) return "B-";
  if (percentage >= 55) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 45) return "C-";
  if (percentage >= 40) return "D";
  return "F";
};

const getGradeColor = (grade) => {
  return GRADE_STYLES[grade] || "bg-gray-100 text-gray-700 border-gray-200";
};

const getGradeIcon = (grade) => {
  return GRADE_ICONS[grade] || null;
};

const getInitials = (name) => {
  if (!name) return "S";
  return name.charAt(0).toUpperCase();
};

// --- Main Component ----------------------------------------------------
const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  // --- Toast ----------------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch Results --------------------------------------------------
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    try {
      const response = await api.get("/exams/results/");
      const data = response.data?.results || response.data || [];
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      
      if (error.response?.status === 401) {
        setErrorMessage("Authentication failed. Please login again.");
        showToast("Authentication failed. Please login again.", "error");
      } else if (error.response?.status === 404) {
        setErrorMessage("Results endpoint not found. Please check the API configuration.");
        showToast("Results module not available", "error");
      } else if (error.response?.status === 403) {
        setErrorMessage("You don't have permission to view results.");
        showToast("Permission denied", "error");
      } else if (error.code === "ERR_NETWORK") {
        setErrorMessage("Network error. Please check your connection.");
        showToast("Network error. Please try again.", "error");
      } else {
        setErrorMessage(error.response?.data?.detail || "Failed to load results");
        showToast("Failed to load results", "error");
      }
      
      setResults([]);
      setErrored(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // --- Refresh Handler ----------------------------------------------
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchResults();
  }, [fetchResults]);

  // --- Modal Handlers ----------------------------------------------
  const openDetail = useCallback((result) => {
    setSelectedResult(result);
    setDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    setSelectedResult(null);
  }, []);

  // --- Export Handler ----------------------------------------------
  const handleExport = useCallback(() => {
    if (filteredData.length === 0) {
      showToast("No results to export", "error");
      return;
    }
    
    try {
      const headers = ["Student", "Exam", "Subject", "Marks Obtained", "Total Marks", "Grade"];
      const rows = filteredData.map((r) => [
        getStudentName(r),
        getExamName(r),
        getSubjectName(r),
        r.marks_obtained || r.marks || 0,
        r.total_marks || "Ã¢â‚¬â€",
        r.grade || getGrade(r.marks_obtained, r.total_marks) || "Ã¢â‚¬â€",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
      
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `results-${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`Exported ${filteredData.length} results`, "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Export failed. Please try again.", "error");
    }
  }, [filteredData, showToast]);

  // --- Helper Functions --------------------------------------------
  const getStudentName = useCallback((result) => {
    if (!result) return "Ã¢â‚¬â€";
    const name = result.student || result.student_name || result.studentName;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  }, []);

  const getExamName = useCallback((result) => {
    if (!result) return "Ã¢â‚¬â€";
    const name = result.exam || result.exam_name || result.examName;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  }, []);

  const getSubjectName = useCallback((result) => {
    if (!result) return "Ã¢â‚¬â€";
    const name = result.subject || result.subject_name || result.subjectName;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  }, []);

  // --- Stats ---------------------------------------------------------
  const stats = useMemo(() => {
    const total = results.length;
    const totalMarks = results.reduce((sum, r) => sum + (Number(r.marks_obtained) || Number(r.marks) || 0), 0);
    const avgMarks = total > 0 ? Math.round(totalMarks / total) : 0;
    const passed = results.filter(r => {
      const grade = r.grade || getGrade(r.marks_obtained, r.total_marks);
      return grade && grade !== "F" && grade !== "D";
    }).length;
    const failed = results.filter(r => {
      const grade = r.grade || getGrade(r.marks_obtained, r.total_marks);
      return grade === "F" || grade === "D";
    }).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, avgMarks, passed, failed, passRate };
  }, [results]);

  // --- Filtering ----------------------------------------------------
  const filteredData = useMemo(() => {
    return results.filter((result) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const student = getStudentName(result).toLowerCase();
      const exam = getExamName(result).toLowerCase();
      const subject = getSubjectName(result).toLowerCase();
      return student.includes(search) || exam.includes(search) || subject.includes(search);
    });
  }, [results, searchTerm, getStudentName, getExamName, getSubjectName]);

  // --- Pagination --------------------------------------------------
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredData.slice(startIndex, startIndex + pageSize);

  // --- Clear Search ----------------------------------------------
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  // --- Loading State ----------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
          <PageHeader 
            title="Results" 
            subtitle="View and manage exam results" 
            breadcrumbs={["Admin", "Academics", "Results"]} 
          />
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-50 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading results...</p>
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
          title="Results" 
          subtitle={`View and manage exam results${results.length > 0 ? ` Ã¢â‚¬â€ ${results.length} total results` : ""}`}
          breadcrumbs={["Admin", "Academics", "Results"]}
          icon={Award}
          action={
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="hidden sm:inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={handleExport}
                disabled={results.length === 0}
                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">Export</span>
                <span className="xs:hidden">Export</span>
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error loading results</p>
              <p className="text-amber-600 break-words">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Results</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">All results</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Average Marks</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.avgMarks}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Per result</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-green-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.passRate}%</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.passed} passed</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-red-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</p>
            <p className="text-xl md:text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Needs improvement</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student, exam, or subject..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-xs md:text-sm"
                  />
                  {searchTerm && (
                    <button 
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {results.length === 0 && !loading ? (
              <div className="text-center py-12 md:py-16">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Award className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">No results found</p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">Results will appear here once exams are graded</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No results match your search</p>
                          <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                        </div>
                      </div>
                    ) : (
                      pageItems.map((result) => {
                        const studentName = getStudentName(result);
                        const examName = getExamName(result);
                        const subjectName = getSubjectName(result);
                        const marks = result?.marks_obtained ?? result?.marks ?? "Ã¢â‚¬â€";
                        const totalMarks = result?.total_marks ?? result?.totalMarks ?? "Ã¢â‚¬â€";
                        const grade = result?.grade || getGrade(marks, totalMarks);
                        const gradeStyle = getGradeColor(grade);
                        const gradeIcon = getGradeIcon(grade);
                        
                        return (
                          <div 
                            key={result.id} 
                            className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                            onClick={() => openDetail(result)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                    {getInitials(studentName)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-800 text-sm truncate">{studentName}</p>
                                    <p className="text-xs text-gray-500 truncate">{examName}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                    {subjectName}
                                  </Badge>
                                  <Badge className={`${gradeStyle} text-[10px] flex items-center gap-1`}>
                                    {gradeIcon}
                                    {grade}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 mt-1.5">
                                  <span className="font-semibold text-gray-800 text-sm">{marks}</span>
                                  {totalMarks !== "Ã¢â‚¬â€" && (
                                    <span className="text-xs text-gray-400">/ {totalMarks}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); openDetail(result); }}
                                className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors ml-2"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Marks</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pageItems.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Search className="w-6 h-6 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium">No results match your search</p>
                              <p className="text-sm text-gray-400">Try adjusting your search terms</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pageItems.map((result) => {
                          const studentName = getStudentName(result);
                          const examName = getExamName(result);
                          const subjectName = getSubjectName(result);
                          const marks = result?.marks_obtained ?? result?.marks ?? "Ã¢â‚¬â€";
                          const totalMarks = result?.total_marks ?? result?.totalMarks ?? "Ã¢â‚¬â€";
                          const grade = result?.grade || getGrade(marks, totalMarks);
                          const gradeStyle = getGradeColor(grade);
                          const gradeIcon = getGradeIcon(grade);
                          
                          return (
                            <tr 
                              key={result.id} 
                              className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                              onClick={() => openDetail(result)}
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                    {getInitials(studentName)}
                                  </div>
                                  <span className="font-medium text-gray-800 truncate max-w-[150px]">{studentName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="text-sm text-gray-600 truncate max-w-[120px]">{examName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs whitespace-nowrap">
                                  {subjectName}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold text-gray-800 text-sm">{marks}</span>
                                  {totalMarks !== "Ã¢â‚¬â€" && (
                                    <span className="text-xs text-gray-400">/ {totalMarks}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge className={`${gradeStyle} text-xs flex items-center gap-1.5 px-2.5 py-1 whitespace-nowrap`}>
                                  {gradeIcon}
                                  {grade}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openDetail(result); }}
                                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {results.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* Result Detail Modal */}
      {detailModalOpen && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header with gradient */}
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
                  {getInitials(getStudentName(selectedResult))}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-xl font-bold text-white truncate">{getStudentName(selectedResult)}</h3>
                  <p className="text-xs sm:text-sm text-white/80 truncate">{getExamName(selectedResult)}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Grade</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {selectedResult.grade || getGrade(
                      selectedResult.marks_obtained || selectedResult.marks,
                      selectedResult.total_marks || selectedResult.totalMarks
                    ) || "Ã¢â‚¬â€"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Subject</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                    {getSubjectName(selectedResult)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Marks Obtained</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {selectedResult.marks_obtained || selectedResult.marks || "Ã¢â‚¬â€"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Total Marks</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">
                    {selectedResult.total_marks || selectedResult.totalMarks || "Ã¢â‚¬â€"}
                  </p>
                </div>
              </div>

              {selectedResult.exam_date && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-0.5 sm:mb-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Exam Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(selectedResult.exam_date)}
                  </p>
                </div>
              )}

              {selectedResult.remarks && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500 mb-1 sm:mb-2">
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Remarks</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">
                    {selectedResult.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={closeDetailModal}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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

export default Results;