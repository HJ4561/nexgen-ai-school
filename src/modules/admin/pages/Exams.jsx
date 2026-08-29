// src/modules/admin/pages/Exams.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Calendar, Eye, X,
  RefreshCw, AlertCircle, CheckCircle, Loader2,
  BookOpen, Clock, Users, FileText, Award, Hash,
  GraduationCap, User, ChevronDown, Filter, Settings,
  TrendingUp, TrendingDown, Minus, Brain,
  FileQuestion, PenTool, BarChart, Sparkles
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ============= CONSTANTS =============
const STATUS_STYLES = {
  active: "bg-green-100 text-green-700 border-green-200",
  upcoming: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-gray-100 text-gray-700 border-gray-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS = {
  active: <CheckCircle className="w-3 h-3" />,
  upcoming: <Clock className="w-3 h-3" />,
  completed: <Award className="w-3 h-3" />,
  cancelled: <AlertCircle className="w-3 h-3" />,
};

const STATUS_LABELS = {
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

const EXAM_TYPES = {
  midterm: "Midterm",
  final: "Final",
  quiz: "Quiz",
  practical: "Practical",
  assignment: "Assignment",
  annual: "Annual",
};

const QUESTION_TYPES = {
  mcq: "Multiple Choice",
  subjective: "Subjective",
  true_false: "True/False",
  fill_blank: "Fill in the Blank",
  matching: "Matching",
};

const GRADE_COLORS = {
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

// ============= HELPERS =============
const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getGradeColor = (grade) => {
  return GRADE_COLORS[grade] || "bg-gray-100 text-gray-700 border-gray-200";
};

// ============= TAB COMPONENTS =============

// 1. Exams Tab
const ExamsTab = ({
  exams, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  filterType, setFilterType,
  showFilters, setShowFilters,
  hasActiveFilters, clearFilters,
  pageSize, openAddExam, openEditExam, openDetail, setDeletingItem,
  getSubjectName, getClassName, getTeacherName,
  fetchExams
}) => {
  const stats = useMemo(() => {
    const total = exams.length;
    const upcoming = exams.filter(e => e.status === "upcoming").length;
    const active = exams.filter(e => e.status === "active").length;
    const completed = exams.filter(e => e.status === "completed").length;
    const cancelled = exams.filter(e => e.status === "cancelled").length;
    return { total, upcoming, active, completed, cancelled };
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      if (filterStatus !== "all" && exam.status !== filterStatus) return false;
      if (filterType !== "all" && exam.exam_type !== filterType) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (exam.name || "").toLowerCase().includes(search) ||
             getSubjectName(exam).toLowerCase().includes(search) ||
             getClassName(exam).toLowerCase().includes(search);
    });
  }, [exams, searchTerm, filterStatus, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredExams.slice(startIndex, startIndex + pageSize);

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading exams</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All exams</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
          <p className="text-xs text-gray-400 mt-1">Scheduled</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">In progress</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-gray-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
          <p className="text-xs text-gray-400 mt-1">Finished</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          <p className="text-xs text-gray-400 mt-1">Not held</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, subject, class, or type..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Types</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="practical">Practical</option>
                <option value="assignment">Assignment</option>
                <option value="annual">Annual</option>
              </select>
              <Button
                variant="outline"
                className="border-gray-200"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" className="border-gray-200 px-3 text-gray-500" onClick={clearFilters}>
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-4 mt-4 pt-4 border-t border-gray-200/50">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <Button variant="outline" className="border-gray-200 text-sm" onClick={clearFilters}>
                Reset Dates
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No exams found</p>
                <p className="text-sm text-gray-400">Add an exam to get started</p>
                <Button variant="primary" onClick={openAddExam} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exam
                </Button>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam Name</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((exam) => {
                  const statusIcon = STATUS_ICONS[exam.status] || null;
                  const statusStyle = STATUS_STYLES[exam.status] || "bg-gray-100 text-gray-700 border-gray-200";
                  const isUpcoming = exam.status === "upcoming";

                  return (
                    <tr
                      key={exam.id}
                      className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${isUpcoming ? "bg-blue-50/10" : ""}`}
                      onClick={() => openDetail(exam)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {exam.name?.charAt(0).toUpperCase() || "E"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{exam.name || "Ã¢â‚¬â€"}</p>
                            {exam.total_marks && (
                              <p className="text-xs text-gray-500">{exam.total_marks} marks</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                          {getSubjectName(exam)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{getClassName(exam)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{getTeacherName(exam)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
                          {EXAM_TYPES[exam.exam_type] || exam.exam_type || "Ã¢â‚¬â€"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(exam.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${statusStyle} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                          {statusIcon}
                          {STATUS_LABELS[exam.status] || exam.status || "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetail(exam)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditExam(exam)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit exam">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(exam)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete exam">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {exams.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredExams.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 2. Grade Scale Tab
const GradeScaleTab = ({
  grades, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  pageSize, openAddGrade, openEditGrade, openDetail, setDeletingItem,
  fetchGrades
}) => {
  const stats = useMemo(() => {
    const total = grades.length;
    const avgGPA = total > 0 ? grades.reduce((sum, g) => sum + (Number(g.gpa) || 0), 0) / total : 0;
    const highestGrade = grades.reduce((max, g) => {
      const maxPct = Number(g.max_percentage) || 0;
      const currentMax = Number(max?.max_percentage) || 0;
      return maxPct > currentMax ? g : max;
    }, grades[0]);
    const lowestGrade = grades.reduce((min, g) => {
      const minPct = Number(g.min_percentage) || 0;
      const currentMin = Number(min?.min_percentage) || 0;
      return minPct < currentMin ? g : min;
    }, grades[0]);
    return { total, avgGPA, highestGrade, lowestGrade };
  }, [grades]);

  const filteredGrades = useMemo(() => {
    return grades.filter(grade => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (grade.grade || "").toLowerCase().includes(search) ||
             (grade.description || "").toLowerCase().includes(search);
    });
  }, [grades, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredGrades.slice(startIndex, startIndex + pageSize);

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading grade scale</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Grades</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Configured</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average GPA</p>
          <p className="text-2xl font-bold text-purple-600">{stats.avgGPA.toFixed(1)}</p>
          <p className="text-xs text-gray-400 mt-1">Across all grades</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Highest Grade</p>
          <p className="text-2xl font-bold text-green-600">{stats.highestGrade?.grade || "Ã¢â‚¬â€"}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.highestGrade?.min_percentage || 0}% - {stats.highestGrade?.max_percentage || 0}%
          </p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lowest Grade</p>
          <p className="text-2xl font-bold text-red-600">{stats.lowestGrade?.grade || "Ã¢â‚¬â€"}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.lowestGrade?.min_percentage || 0}% - {stats.lowestGrade?.max_percentage || 0}%
          </p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by grade or description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <Button variant="primary" className="whitespace-nowrap" onClick={openAddGrade}>
              <Plus className="w-4 h-4 mr-2" />
              Add Grade
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Award className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No grades configured</p>
                <p className="text-sm text-gray-400">Add a grade to set up the grading scale</p>
                <Button variant="primary" onClick={openAddGrade} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Min %</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Max %</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">GPA</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((grade) => {
                  const gradeStyle = getGradeColor(grade.grade);
                  return (
                    <tr
                      key={grade.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => openDetail(grade)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                            {grade.grade || "?"}
                          </div>
                          <Badge className={`${gradeStyle} text-sm font-bold px-3 py-1.5`}>
                            {grade.grade || "Ã¢â‚¬â€"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-gray-800">{grade.min_percentage || 0}%</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-gray-800">{grade.max_percentage || 0}%</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-800">{Number(grade.gpa).toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {grade.description || "Ã¢â‚¬â€"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openDetail(grade)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEditGrade(grade)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit grade">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeletingItem(grade)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete grade">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {grades.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredGrades.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 3. Questions Tab
const QuestionsTab = ({
  questions, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  pageSize, openAddQuestion, openEditQuestion, openDetail, setDeletingItem,
  getExamName
}) => {
  const stats = useMemo(() => {
    const total = questions.length;
    const mcq = questions.filter(q => q.question_type === "mcq").length;
    const subjective = questions.filter(q => q.question_type === "subjective").length;
    const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
    return { total, mcq, subjective, totalMarks };
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (q.question_text || "").toLowerCase().includes(search) ||
             (q.question_type || "").toLowerCase().includes(search) ||
             getExamName(q).toLowerCase().includes(search);
    });
  }, [questions, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredQuestions.slice(startIndex, startIndex + pageSize);

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading questions</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All questions</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">MCQs</p>
          <p className="text-2xl font-bold text-purple-600">{stats.mcq}</p>
          <p className="text-xs text-gray-400 mt-1">Multiple choice</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjective</p>
          <p className="text-2xl font-bold text-orange-600">{stats.subjective}</p>
          <p className="text-xs text-gray-400 mt-1">Written answers</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalMarks}</p>
          <p className="text-xs text-gray-400 mt-1">Across all questions</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions by text or type..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <Button variant="primary" className="whitespace-nowrap" onClick={openAddQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileQuestion className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No questions found</p>
                <p className="text-sm text-gray-400">Add questions to your exams</p>
                <Button variant="primary" onClick={openAddQuestion} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Question</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Marks</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => openDetail(q)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          <FileQuestion className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                          {q.question_text || "Ã¢â‚¬â€"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600">{getExamName(q)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                        {QUESTION_TYPES[q.question_type] || q.question_type || "Ã¢â‚¬â€"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-800">{q.marks || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(q)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditQuestion(q)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit question">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingItem(q)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete question">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {questions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredQuestions.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 4. Student Answers Tab
const StudentAnswersTab = ({
  studentAnswers, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  pageSize, openDetail, setDeletingItem,
  getStudentName, getExamName, getQuestionText
}) => {
  const stats = useMemo(() => {
    const total = studentAnswers.length;
    const correct = studentAnswers.filter(a => a.is_correct).length;
    const incorrect = studentAnswers.filter(a => a.is_correct === false).length;
    const totalMarks = studentAnswers.reduce((sum, a) => sum + (Number(a.marks_awarded) || 0), 0);
    return { total, correct, incorrect, totalMarks };
  }, [studentAnswers]);

  const filteredAnswers = useMemo(() => {
    return studentAnswers.filter(a => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getStudentName(a).toLowerCase().includes(search) ||
             getExamName(a).toLowerCase().includes(search) ||
             (a.answer_text || "").toLowerCase().includes(search);
    });
  }, [studentAnswers, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredAnswers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredAnswers.slice(startIndex, startIndex + pageSize);

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading student answers</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Answers</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All submissions</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</p>
          <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
          <p className="text-xs text-gray-400 mt-1">Correct answers</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Incorrect</p>
          <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
          <p className="text-xs text-gray-400 mt-1">Wrong answers</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalMarks}</p>
          <p className="text-xs text-gray-400 mt-1">Awarded</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student, exam, or answer..."
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <PenTool className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No student answers found</p>
                <p className="text-sm text-gray-400">Answers will appear here once students submit</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Answer</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Marks</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((answer) => (
                  <tr
                    key={answer.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => openDetail(answer)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {getStudentName(answer).charAt(0).toUpperCase() || "S"}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{getStudentName(answer)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600">{getExamName(answer)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-600 truncate max-w-xs">
                        {answer.answer_text || answer.selected_option || "Ã¢â‚¬â€"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={answer.is_correct ? "bg-green-100 text-green-700 border-green-200 text-xs px-2.5 py-1" : "bg-red-100 text-red-700 border-red-200 text-xs px-2.5 py-1"}>
                        {answer.is_correct ? "Correct" : "Incorrect"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-800">{answer.marks_awarded || 0}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(answer)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingItem(answer)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete answer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {studentAnswers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredAnswers.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 5. AI Auto Checking Tab
const AiAutoCheckingTab = ({
  aiChecks, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  pageSize, openDetail, setDeletingItem,
  getStudentName, getExamName
}) => {
  const stats = useMemo(() => {
    const total = aiChecks.length;
    const checkedByAI = aiChecks.filter(a => a.checked_by_ai).length;
    const reviewed = aiChecks.filter(a => a.reviewed_by_teacher).length;
    const avgScore = total > 0 ? aiChecks.reduce((sum, a) => sum + (Number(a.ai_score) || 0), 0) / total : 0;
    return { total, checkedByAI, reviewed, avgScore };
  }, [aiChecks]);

  const filteredChecks = useMemo(() => {
    return aiChecks.filter(a => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getStudentName(a).toLowerCase().includes(search) ||
             getExamName(a).toLowerCase().includes(search);
    });
  }, [aiChecks, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredChecks.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredChecks.slice(startIndex, startIndex + pageSize);

  return (
    <>
      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading AI checks</p>
            <p className="text-amber-600">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Checks</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All AI checks</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Checked</p>
          <p className="text-2xl font-bold text-purple-600">{stats.checkedByAI}</p>
          <p className="text-xs text-gray-400 mt-1">By AI system</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed</p>
          <p className="text-2xl font-bold text-green-600">{stats.reviewed}</p>
          <p className="text-xs text-gray-400 mt-1">By teacher</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg AI Score</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.avgScore.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Confidence score</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student or exam..."
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No AI checks found</p>
                <p className="text-sm text-gray-400">AI checks will appear here once exams are auto-checked</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Score</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Confidence</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((check) => (
                  <tr
                    key={check.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => openDetail(check)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                          {getStudentName(check).charAt(0).toUpperCase() || "S"}
                        </div>
                        <span className="font-medium text-gray-800">{getStudentName(check)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600">{getExamName(check)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-800">{check.ai_score || 0}%</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${check.confidence_score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{check.confidence_score || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={check.reviewed_by_teacher ? "bg-green-100 text-green-700 border-green-200 text-xs px-2.5 py-1" : "bg-yellow-100 text-yellow-700 border-yellow-200 text-xs px-2.5 py-1"}>
                        {check.reviewed_by_teacher ? "Reviewed" : "Pending Review"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(check)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="View details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingItem(check)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete check">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {aiChecks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredChecks.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// ============= MAIN COMPONENT =============
const Exams = () => {
  // ---- Tab State ----
  const [activeTab, setActiveTab] = useState("exams");
  
  // ---- Shared State ----
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // ---- Exams State ----
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [examsError, setExamsError] = useState(false);
  const [examsErrorMessage, setExamsErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // ---- Grade Scale State ----
  const [grades, setGrades] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [gradesError, setGradesError] = useState(false);
  const [gradesErrorMessage, setGradesErrorMessage] = useState("");
  const [gradeSearchTerm, setGradeSearchTerm] = useState("");
  const [gradeCurrentPage, setGradeCurrentPage] = useState(1);
  
  // ---- Questions State ----
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionsError, setQuestionsError] = useState(false);
  const [questionsErrorMessage, setQuestionsErrorMessage] = useState("");
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [questionCurrentPage, setQuestionCurrentPage] = useState(1);
  
  // ---- Student Answers State ----
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(true);
  const [answersError, setAnswersError] = useState(false);
  const [answersErrorMessage, setAnswersErrorMessage] = useState("");
  const [answerSearchTerm, setAnswerSearchTerm] = useState("");
  const [answerCurrentPage, setAnswerCurrentPage] = useState(1);
  
  // ---- AI Auto Checking State ----
  const [aiChecks, setAiChecks] = useState([]);
  const [loadingAiChecks, setLoadingAiChecks] = useState(true);
  const [aiChecksError, setAiChecksError] = useState(false);
  const [aiChecksErrorMessage, setAiChecksErrorMessage] = useState("");
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [aiCurrentPage, setAiCurrentPage] = useState(1);
  
  const pageSize = 10;

  // ============= EFFECTS =============
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
    fetchTeachers();
    fetchGrades();
    fetchQuestions();
    fetchStudentAnswers();
    fetchAiChecks();
  };

  // ============= TOAST =============
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ============= EXAMS API =============
  const fetchExams = async () => {
    setLoadingExams(true);
    setExamsError(false);
    setExamsErrorMessage("");
    try {
      const response = await api.get("/exams/exams/");
      const data = response.data?.results || response.data || [];
      setExams(data);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      setExamsError(true);
      setExamsErrorMessage(error.response?.data?.detail || "Failed to load exams");
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/academics/classes/");
      const data = response.data?.results || response.data || [];
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get("/academics/subjects/");
      const data = response.data?.results || response.data || [];
      setSubjects(data);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/users/teachers/");
      const data = response.data?.results || response.data || [];
      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  // ============= GRADE SCALE API =============
  const fetchGrades = async () => {
    setLoadingGrades(true);
    setGradesError(false);
    setGradesErrorMessage("");
    try {
      const response = await api.get("/exams/grade-scale/");
      const data = response.data?.results || response.data || [];
      setGrades(data);
    } catch (error) {
      console.error("Failed to fetch grade scale:", error);
      setGradesError(true);
      setGradesErrorMessage(error.response?.data?.detail || "Failed to load grade scale");
      setGrades([]);
    } finally {
      setLoadingGrades(false);
    }
  };

  // ============= QUESTIONS API =============
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    setQuestionsError(false);
    setQuestionsErrorMessage("");
    try {
      const response = await api.get("/exams/questions/");
      const data = response.data?.results || response.data || [];
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setQuestionsError(true);
      setQuestionsErrorMessage(error.response?.data?.detail || "Failed to load questions");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ============= STUDENT ANSWERS API =============
  const fetchStudentAnswers = async () => {
    setLoadingAnswers(true);
    setAnswersError(false);
    setAnswersErrorMessage("");
    try {
      const response = await api.get("/exams/student-answers/");
      const data = response.data?.results || response.data || [];
      setStudentAnswers(data);
    } catch (error) {
      console.error("Failed to fetch student answers:", error);
      setAnswersError(true);
      setAnswersErrorMessage(error.response?.data?.detail || "Failed to load student answers");
      setStudentAnswers([]);
    } finally {
      setLoadingAnswers(false);
    }
  };

  // ============= AI AUTO CHECKING API =============
  const fetchAiChecks = async () => {
    setLoadingAiChecks(true);
    setAiChecksError(false);
    setAiChecksErrorMessage("");
    try {
      const response = await api.get("/exams/ai-auto-checking/");
      const data = response.data?.results || response.data || [];
      setAiChecks(data);
    } catch (error) {
      console.error("Failed to fetch AI checks:", error);
      setAiChecksError(true);
      setAiChecksErrorMessage(error.response?.data?.detail || "Failed to load AI checks");
      setAiChecks([]);
    } finally {
      setLoadingAiChecks(false);
    }
  };

  // ============= HELPER FUNCTIONS =============
  const getClassName = (exam) => {
    if (!exam) return "Ã¢â‚¬â€";
    const name = exam.class_name || exam.class_obj;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  };

  const getSubjectName = (exam) => {
    if (!exam) return "Ã¢â‚¬â€";
    const name = exam.subject_name || exam.subject;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  };

  const getTeacherName = (exam) => {
    if (!exam) return "Ã¢â‚¬â€";
    const name = exam.teacher_name || exam.teacher;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  };

  const getStudentName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    const name = item.student || item.student_name;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  };

  const getExamName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    const name = item.exam || item.exam_name;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object' && name.name) return name.name;
    return "Ã¢â‚¬â€";
  };

  const openDetail = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterType("all");
    setSearchTerm("");
  };

  // ============= TAB CONFIGURATION =============
  const tabs = [
    { id: "exams", label: "Exams", icon: <BookOpen className="w-4 h-4" />, count: exams.length },
    { id: "grade-scale", label: "Grade Scale", icon: <Award className="w-4 h-4" />, count: grades.length },
    { id: "questions", label: "Questions", icon: <FileQuestion className="w-4 h-4" />, count: questions.length },
    { id: "student-answers", label: "Student Answers", icon: <PenTool className="w-4 h-4" />, count: studentAnswers.length },
    { id: "ai-auto-checking", label: "AI Auto Check", icon: <Sparkles className="w-4 h-4" />, count: aiChecks.length },
  ];

  // ============= MAIN RETURN =============
  return (
    <FadeIn>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Exam Management"
          subtitle="Manage exams, grading scale, questions, and AI auto-checking"
          breadcrumbs={["Admin", "Exam Management"]}
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="outline" onClick={fetchAllData} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button variant="primary" onClick={() => {
                  if (activeTab === "exams") {
                    // openAddExam();
                  } else if (activeTab === "grade-scale") {
                    // openAddGrade();
                  } else if (activeTab === "questions") {
                    // openAddQuestion();
                  }
                }} className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === "exams" ? "Exam" : activeTab === "grade-scale" ? "Grade" : activeTab === "questions" ? "Question" : "Item"}
              </Button>
            </div>
          }
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-2 sm:gap-4 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                    ${isActive 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                  <Badge className={isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "exams" && (
          <ExamsTab 
            exams={exams} 
            loading={loadingExams} 
            error={examsError} 
            errorMessage={examsErrorMessage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            hasActiveFilters={filterStatus !== "all" || filterType !== "all" || searchTerm}
            clearFilters={clearFilters}
            pageSize={pageSize}
            openAddExam={() => {}}
            openEditExam={() => {}}
            openDetail={openDetail}
            setDeletingItem={setDeletingItem}
            getSubjectName={getSubjectName}
            getClassName={getClassName}
            getTeacherName={getTeacherName}
            fetchExams={fetchExams}
          />
        )}

        {activeTab === "grade-scale" && (
          <GradeScaleTab 
            grades={grades}
            loading={loadingGrades}
            error={gradesError}
            errorMessage={gradesErrorMessage}
            searchTerm={gradeSearchTerm}
            setSearchTerm={setGradeSearchTerm}
            currentPage={gradeCurrentPage}
            setCurrentPage={setGradeCurrentPage}
            pageSize={pageSize}
            openAddGrade={() => {}}
            openEditGrade={() => {}}
            openDetail={openDetail}
            setDeletingItem={setDeletingItem}
            fetchGrades={fetchGrades}
          />
        )}

        {activeTab === "questions" && (
          <QuestionsTab 
            questions={questions}
            loading={loadingQuestions}
            error={questionsError}
            errorMessage={questionsErrorMessage}
            searchTerm={questionSearchTerm}
            setSearchTerm={setQuestionSearchTerm}
            currentPage={questionCurrentPage}
            setCurrentPage={setQuestionCurrentPage}
            pageSize={pageSize}
            openAddQuestion={() => {}}
            openEditQuestion={() => {}}
            openDetail={openDetail}
            setDeletingItem={setDeletingItem}
            getExamName={getExamName}
          />
        )}

        {activeTab === "student-answers" && (
          <StudentAnswersTab 
            studentAnswers={studentAnswers}
            loading={loadingAnswers}
            error={answersError}
            errorMessage={answersErrorMessage}
            searchTerm={answerSearchTerm}
            setSearchTerm={setAnswerSearchTerm}
            currentPage={answerCurrentPage}
            setCurrentPage={setAnswerCurrentPage}
            pageSize={pageSize}
            openDetail={openDetail}
            setDeletingItem={setDeletingItem}
            getStudentName={getStudentName}
            getExamName={getExamName}
            getQuestionText={() => {}}
          />
        )}

        {activeTab === "ai-auto-checking" && (
          <AiAutoCheckingTab 
            aiChecks={aiChecks}
            loading={loadingAiChecks}
            error={aiChecksError}
            errorMessage={aiChecksErrorMessage}
            searchTerm={aiSearchTerm}
            setSearchTerm={setAiSearchTerm}
            currentPage={aiCurrentPage}
            setCurrentPage={setAiCurrentPage}
            pageSize={pageSize}
            openDetail={openDetail}
            setDeletingItem={setDeletingItem}
            getStudentName={getStudentName}
            getExamName={getExamName}
          />
        )}
      </div>

      {/* Detail Modal */}
      {detailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDetailModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="relative px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
              <button onClick={closeDetailModal} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {selectedItem.name?.charAt(0).toUpperCase() || 
                   selectedItem.grade?.charAt(0).toUpperCase() || 
                   selectedItem.question_text?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedItem.name || 
                     `Grade ${selectedItem.grade}` || 
                     selectedItem.question_text?.substring(0, 30) || 
                     "Details"}
                  </h3>
                  <p className="text-sm text-white/80">{activeTab.replace("-", " ").toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <Button variant="primary" onClick={closeDetailModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title="Delete this item?"
          message={`This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={async () => {
            setDeletingItem(null);
            showToast("Deleted successfully", "success");
          }}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Exams;