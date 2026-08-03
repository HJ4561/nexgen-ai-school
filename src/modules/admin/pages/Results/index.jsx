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
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
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
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getGrade = (marks, totalMarks) => {
  if (!marks || !totalMarks) return "-";
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

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchResults();
  }, []);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchResults = async () => {
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
      } else if (error.response?.status === 404) {
        setErrorMessage("Results endpoint not found.");
      } else if (error.response?.status === 403) {
        setErrorMessage("You don't have permission to view results.");
      } else {
        setErrorMessage(error.response?.data?.detail || "Failed to load results");
      }
      setResults([]);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (result) => {
    setSelectedResult(result);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedResult(null);
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      showToast("No results to export", "error");
      return;
    }
    const headers = ["Student", "Exam", "Subject", "Marks Obtained", "Total Marks", "Grade"];
    const rows = filteredData.map((r) => {
      const row = [
        getStudentName(r),
        getExamName(r),
        getSubjectName(r),
        r.marks_obtained || r.marks || 0,
        r.total_marks || "-",
        r.grade || getGrade(r.marks_obtained, r.total_marks) || "-"
      ];
      return row.map((v) => {
        const str = String(v);
        return '"' + str.replace(/"/g, '""') + '"';
      }).join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "results-" + Date.now() + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Exported " + filteredData.length + " results", "success");
  };

  const getStudentName = (result) => {
    if (!result) return "-";
    if (result.student && typeof result.student === "object" && result.student.name) {
      return result.student.name;
    }
    if (result.student_name) return result.student_name;
    if (typeof result.student === "string") return result.student;
    if (result.studentName) return result.studentName;
    return "-";
  };

  const getExamName = (result) => {
    if (!result) return "-";
    if (result.exam && typeof result.exam === "object" && result.exam.name) {
      return result.exam.name;
    }
    if (result.exam_name) return result.exam_name;
    if (typeof result.exam === "string") return result.exam;
    if (result.examName) return result.examName;
    return "-";
  };

  const getSubjectName = (result) => {
    if (!result) return "-";
    if (result.subject && typeof result.subject === "object" && result.subject.name) {
      return result.subject.name;
    }
    if (result.subject_name) return result.subject_name;
    if (typeof result.subject === "string") return result.subject;
    if (result.subjectName) return result.subjectName;
    return "-";
  };

  const stats = useMemo(() => {
    const total = results.length;
    const totalMarks = results.reduce((sum, r) => sum + (Number(r.marks_obtained) || Number(r.marks) || 0), 0);
    const avgMarks = total > 0 ? Math.round(totalMarks / total) : 0;
    const passed = results.filter((r) => {
      const grade = r.grade || getGrade(r.marks_obtained, r.total_marks);
      return grade && grade !== "F" && grade !== "D";
    }).length;
    const failed = results.filter((r) => {
      const grade = r.grade || getGrade(r.marks_obtained, r.total_marks);
      return grade === "F" || grade === "D";
    }).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, avgMarks, passed, failed, passRate };
  }, [results]);

  const filteredData = useMemo(() => {
    return results.filter((result) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const student = getStudentName(result).toLowerCase();
      const exam = getExamName(result).toLowerCase();
      const subject = getSubjectName(result).toLowerCase();
      return student.includes(search) || exam.includes(search) || subject.includes(search);
    });
  }, [results, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredData.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading results...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Results</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage exam results
              {results.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {results.length} total results</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchResults} disabled={loading}>
              <RefreshCw className={"w-4 h-4 mr-2 " + (loading ? "animate-spin" : "")} />
              Refresh
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25" 
              onClick={handleExport}
              disabled={results.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading results</p>
              <p className="text-amber-600">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Results</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All results</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average Marks</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.avgMarks}</p>
            <p className="text-xs text-gray-400 mt-1">Per result</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</p>
            <p className="text-2xl font-bold text-green-600">{stats.passRate}%</p>
            <p className="text-xs text-gray-400 mt-1">{stats.passed} passed</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-xs text-gray-400 mt-1">Needs improvement</p>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student, exam, or subject..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {results.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No results found</p>
                  <p className="text-sm text-gray-400">Results will appear here once exams are graded</p>
                </div>
              </div>
            ) : (
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
                      const marks = result?.marks_obtained ?? result?.marks ?? "-";
                      const totalMarks = result?.total_marks ?? result?.totalMarks ?? "-";
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
                                {studentName.charAt(0).toUpperCase() || "S"}
                              </div>
                              <span className="font-medium text-gray-800">{studentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600">{examName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                              {subjectName}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-gray-800 text-sm">{marks}</span>
                              {totalMarks !== "-" && (
                                <span className="text-xs text-gray-400">/ {totalMarks}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className={gradeStyle + " text-xs flex items-center gap-1.5 px-2.5 py-1"}>
                              {gradeIcon}
                              {grade}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openDetail(result)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
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

      {detailModalOpen && selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button 
                onClick={closeDetailModal} 
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getStudentName(selectedResult).charAt(0).toUpperCase() || "S"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{getStudentName(selectedResult)}</h3>
                  <p className="text-sm text-white/80">{getExamName(selectedResult)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Grade</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedResult.grade || getGrade(
                      selectedResult.marks_obtained || selectedResult.marks,
                      selectedResult.total_marks || selectedResult.totalMarks
                    ) || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Subject</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {getSubjectName(selectedResult)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Marks Obtained</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedResult.marks_obtained || selectedResult.marks || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Total Marks</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedResult.total_marks || selectedResult.totalMarks || "-"}
                  </p>
                </div>
              </div>

              {selectedResult.exam_date && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Exam Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatDate(selectedResult.exam_date)}
                  </p>
                </div>
              )}

              {selectedResult.remarks && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Remarks</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedResult.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end bg-gray-50/50 rounded-b-2xl">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={closeDetailModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={"fixed bottom-6 right-6 z-50 " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600") + " text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2"}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Results;
