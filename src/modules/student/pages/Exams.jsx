// src/modules/student/pages/Exams.jsx

/**
 * ============================================
 * STUDENT EXAMS - COMPLETE WITH RESULTS
 * ============================================
 * 
 * Features:
 * - View all exams with status (Upcoming/Today/Completed)
 * - View results with marks, percentage, grade, GPA
 * - Search exams by name, subject, teacher
 * - Filter by status (all/upcoming/today/completed)
 * - Filter by exam type (term/annual/midterm/quiz/test)
 * - Sort by date, name, marks
 * - Detailed exam view with full results
 * - Print results
 * - Real-time progress bars
 * - Premium UI/UX
 * 
 * API Endpoints:
 * - GET /api/exams/exams/ - List exams
 * - GET /api/exams/results/ - List results
 * - GET /api/exams/grade-scale/ - List grade scale
 * 
 * USAGE OF NEW API FIELDS:
 * - class_name, subject_name, teacher_name (exams)
 * - student_name, exam_name (results)
 * - grade, percentage, gpa (results)
 * ============================================
 */

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import {
  fetchExams,
  fetchResults,
  fetchGradeScale,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentExams,
  selectStudentResults,
  selectStudentGradeScale,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
  FileText,
  Eye,
  Printer,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Clock as ClockIcon,
  Layers,
  X,
  Trophy,
  BarChart3,
  Sparkles,
  Star,
  Medal,
  Zap,
  Percent,
  Hash,
} from "lucide-react";

// ─── Safe Name Resolution ────────────────────────────────────────────

const getSubjectName = (exam) => {
  if (!exam) return "N/A";
  if (exam.subject_name && exam.subject_name !== 'null') return exam.subject_name;
  if (exam.subject) {
    if (typeof exam.subject === 'string') return exam.subject;
    if (exam.subject.name) return exam.subject.name;
    if (exam.subject.subject_name) return exam.subject.subject_name;
  }
  return "N/A";
};

const getClassName = (exam) => {
  if (!exam) return null;
  if (exam.class_name && exam.class_name !== 'null') return exam.class_name;
  if (exam.class_obj) {
    if (typeof exam.class_obj === 'string') return exam.class_obj;
    if (exam.class_obj.name) return exam.class_obj.name;
    if (exam.class_obj.class_name) return exam.class_obj.class_name;
  }
  return null;
};

const getTeacherName = (exam) => {
  if (!exam) return null;
  if (exam.teacher_name && exam.teacher_name !== 'null') return exam.teacher_name;
  if (exam.teacher) {
    if (typeof exam.teacher === 'string') return exam.teacher;
    if (exam.teacher.name) return exam.teacher.name;
    if (exam.teacher.teacher_name) return exam.teacher.teacher_name;
  }
  return null;
};

const getStudentName = (result) => {
  if (!result) return null;
  if (result.student_name && result.student_name !== 'null') return result.student_name;
  if (result.student) {
    if (typeof result.student === 'string') return result.student;
    if (result.student.name) return result.student.name;
    if (result.student.student_name) return result.student.student_name;
  }
  return null;
};

const getExamName = (result) => {
  if (!result) return null;
  if (result.exam_name && result.exam_name !== 'null') return result.exam_name;
  if (result.exam) {
    if (typeof result.exam === 'string') return result.exam;
    if (result.exam.name) return result.exam.name;
    if (result.exam.exam_name) return result.exam.exam_name;
  }
  return null;
};

// ─── Toast ──────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
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
};

// ─── Stat Card ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, subtext, icon: Icon, color, delay }) => {
  const colors = {
    purple: { bg: "from-purple-50 to-purple-100/50", text: "text-purple-600", ring: "ring-purple-400/20" },
    emerald: { bg: "from-emerald-50 to-emerald-100/50", text: "text-emerald-600", ring: "ring-emerald-400/20" },
    amber: { bg: "from-amber-50 to-amber-100/50", text: "text-amber-600", ring: "ring-amber-400/20" },
    blue: { bg: "from-blue-50 to-blue-100/50", text: "text-blue-600", ring: "ring-blue-400/20" },
    rose: { bg: "from-rose-50 to-rose-100/50", text: "text-rose-600", ring: "ring-rose-400/20" },
    indigo: { bg: "from-indigo-50 to-indigo-100/50", text: "text-indigo-600", ring: "ring-indigo-400/20" },
  };

  const c = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-4 ${c.ring} ${c.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Exam Card ────────────────────────────────────────────────────────

const ExamCard = ({ exam, result, gradeScale, onViewDetails }) => {
  const status = getExamStatus(exam);
  const StatusIcon = status.icon;
  const subjectName = getSubjectName(exam);
  const className = getClassName(exam);
  const teacherName = getTeacherName(exam);
  const studentName = getStudentName(result);
  
  const hasResult = result && result.marks_obtained !== null && result.marks_obtained !== undefined;
  const percentage = hasResult ? parseFloat(result.percentage || ((result.marks_obtained / exam.total_marks) * 100).toFixed(1)) : null;
  const grade = hasResult ? result.grade : null;
  const gpa = hasResult ? result.gpa : null;
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getExamTypeColor = (type) => {
    const types = {
      term: "bg-purple-100 text-purple-700 border-purple-200",
      annual: "bg-rose-100 text-rose-700 border-rose-200",
      midterm: "bg-blue-100 text-blue-700 border-blue-200",
      final: "bg-emerald-100 text-emerald-700 border-emerald-200",
      quiz: "bg-amber-100 text-amber-700 border-amber-200",
      test: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
    return types[type?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const PerformanceIcon = getPerformanceIcon(percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-purple-200 hover:shadow-lg"
    >
      <div className={`absolute left-0 top-0 h-full w-1 transition-colors duration-300 ${
        status.label === 'Completed' ? 'bg-emerald-400' :
        status.label === 'Today' ? 'bg-blue-400' :
        'bg-amber-400'
      }`} />

      <div className="p-5 pl-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Left: Exam Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h4 className="text-base font-semibold text-gray-900 truncate">
                {exam.name}
              </h4>
              {exam.exam_type && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getExamTypeColor(exam.exam_type)}`}>
                  {exam.exam_type}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={13} className="text-gray-400" />
                {subjectName}
              </span>
              {className && (
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-gray-400" />
                  {className}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                {formatDate(exam.date)}
              </span>
              {exam.total_marks && (
                <span className="flex items-center gap-1.5">
                  <Award size={13} className="text-gray-400" />
                  <span className="font-medium text-gray-700">{exam.total_marks}</span>
                  <span className="text-gray-400">marks</span>
                </span>
              )}
              {teacherName && (
                <span className="flex items-center gap-1.5">
                  <User size={13} className="text-gray-400" />
                  {teacherName}
                </span>
              )}
              {studentName && (
                <span className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-[10px]">for</span>
                  <User size={11} />
                  {studentName}
                </span>
              )}
            </div>
          </div>

          {/* Right: Results & Actions */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {hasResult ? (
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg min-w-[140px]">
                <PerformanceIcon />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {result.marks_obtained}
                      {exam.total_marks && <span className="text-xs text-gray-400">/{exam.total_marks}</span>}
                    </span>
                    {percentage !== null && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        percentage >= 80 ? "bg-emerald-100 text-emerald-700" :
                        percentage >= 60 ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                  {grade && (
                    <div className="text-xs font-medium">
                      Grade: <span className="text-emerald-600">{grade}</span>
                      {gpa && <span className="text-gray-400 ml-1">(GPA: {parseFloat(gpa).toFixed(2)})</span>}
                    </div>
                  )}
                </div>
              </div>
            ) : status.label === "Completed" ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <ClockIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Results pending</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <CalendarDays size={14} className="text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  {status.label === "Today" ? "Today" : getDaysUntil(exam.date)}
                </span>
              </div>
            )}

            <button
              onClick={() => onViewDetails(exam)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* Progress bar for results */}
        {hasResult && percentage !== null && (
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentage, 100)}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`h-full rounded-full ${
                  percentage >= 80 ? "bg-emerald-500" :
                  percentage >= 60 ? "bg-amber-500" :
                  "bg-rose-500"
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Exam Details Modal ─────────────────────────────────────────────

const ExamDetailsModal = ({ exam, result, gradeScale, onClose, onPrint }) => {
  const status = getExamStatus(exam);
  const StatusIcon = status.icon;
  const subjectName = getSubjectName(exam);
  const className = getClassName(exam);
  const teacherName = getTeacherName(exam);
  const studentName = getStudentName(result);
  const examNameFromResult = getExamName(result);
  
  const hasResult = result && result.marks_obtained !== null && result.marks_obtained !== undefined;
  const percentage = hasResult ? parseFloat(result.percentage || ((result.marks_obtained / exam.total_marks) * 100).toFixed(1)) : null;
  const grade = hasResult ? result.grade : null;
  const gpa = hasResult ? result.gpa : null;
  const PerformanceIcon = getPerformanceIcon(percentage);

  const formatDateFull = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getExamTypeColor = (type) => {
    const types = {
      term: "bg-purple-100 text-purple-700 border-purple-200",
      annual: "bg-rose-100 text-rose-700 border-rose-200",
      midterm: "bg-blue-100 text-blue-700 border-blue-200",
      final: "bg-emerald-100 text-emerald-700 border-emerald-200",
      quiz: "bg-amber-100 text-amber-700 border-amber-200",
      test: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
    return types[type?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200";
  };

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

  if (!exam) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 bg-gradient-to-r ${status.gradient} px-6 py-5 text-white rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="mb-1 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {status.label}
                </span>
                {exam.exam_type && (
                  <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${getExamTypeColor(exam.exam_type)} bg-white/20 text-white border-white/30`}>
                    {exam.exam_type}
                  </span>
                )}
                {hasResult && grade && (
                  <span className="rounded-full px-3 py-0.5 text-xs font-medium bg-emerald-400/30 text-emerald-100">
                    Grade: {grade}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">{exam.name}</h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasResult && (
                <button
                  onClick={onPrint}
                  className="rounded-lg p-2 transition-colors hover:bg-white/20"
                  title="Print Results"
                >
                  <Printer size={18} />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Exam Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Subject</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{subjectName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDateFull(exam.date)}</p>
            </div>
            {className && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Class</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{className}</p>
              </div>
            )}
            {exam.total_marks && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Marks</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{exam.total_marks}</p>
              </div>
            )}
            {teacherName && (
              <div className="bg-gray-50 rounded-lg p-3 text-center col-span-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Teacher</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{teacherName}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {exam.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700">{exam.description}</p>
            </div>
          )}

          {/* Results Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-gray-400" />
              <p className="text-sm font-semibold text-gray-800">Results</p>
              {hasResult && studentName && (
                <span className="text-xs text-gray-400 ml-auto">
                  {studentName}
                </span>
              )}
            </div>

            {hasResult ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 space-y-4">
                {/* Marks */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Marks Obtained</span>
                  <span className="text-xl font-bold text-gray-900">
                    {result.marks_obtained}
                    {exam.total_marks && <span className="text-sm font-normal text-gray-400"> / {exam.total_marks}</span>}
                  </span>
                </div>

                {/* Percentage */}
                {percentage !== null && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Percentage</span>
                      <div className="flex items-center gap-2">
                        <PerformanceIcon className={`h-5 w-5 ${
                          percentage >= 80 ? "text-emerald-600" :
                          percentage >= 60 ? "text-amber-600" :
                          "text-rose-600"
                        }`} />
                        <span className={`text-xl font-bold ${
                          percentage >= 80 ? "text-emerald-600" :
                          percentage >= 60 ? "text-amber-600" :
                          "text-rose-600"
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          percentage >= 80 ? "bg-emerald-500" :
                          percentage >= 60 ? "bg-amber-500" :
                          "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    {/* Grade & GPA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-500">Grade</span>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${
                          grade === 'A' ? 'text-emerald-600' :
                          grade === 'B' ? 'text-blue-600' :
                          grade === 'C' ? 'text-amber-600' :
                          grade === 'D' ? 'text-orange-600' :
                          'text-rose-600'
                        }`}>
                          {grade || "N/A"}
                        </span>
                        {gpa && (
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            GPA: {parseFloat(gpa).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Result ID */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Hash size={12} />
                        Result ID: #{result.id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDateFull(result.created_at)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <ClockIcon size={36} className="text-gray-300 mx-auto" />
                <p className="text-sm font-medium text-gray-600 mt-3">Results not yet available</p>
                <p className="text-xs text-gray-400 mt-1">Check back after the exam is completed and graded</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          {hasResult && (
            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Printer size={16} />
              Print Results
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Helper Functions ─────────────────────────────────────────────────

const getExamStatus = (exam) => {
  if (!exam?.date) return { 
    label: "Upcoming", 
    color: "bg-amber-100 text-amber-700", 
    icon: Calendar,
    gradient: "from-amber-400 to-orange-400"
  };
  
  const today = new Date();
  const examDate = new Date(exam.date);
  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);
  
  if (examDate < today) {
    return { 
      label: "Completed", 
      color: "bg-emerald-100 text-emerald-700", 
      icon: CheckCircle,
      gradient: "from-emerald-400 to-teal-400"
    };
  } else if (examDate.getTime() === today.getTime()) {
    return { 
      label: "Today", 
      color: "bg-blue-100 text-blue-700", 
      icon: Clock,
      gradient: "from-blue-400 to-indigo-400"
    };
  } else {
    return { 
      label: "Upcoming", 
      color: "bg-amber-100 text-amber-700", 
      icon: Calendar,
      gradient: "from-amber-400 to-orange-400"
    };
  }
};

const getPerformanceIcon = (percentage) => {
  if (percentage === null || percentage === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
  if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (percentage >= 60) return <Minus className="h-4 w-4 text-amber-600" />;
  return <TrendingDown className="h-4 w-4 text-rose-600" />;
};

const getDaysUntil = (dateString) => {
  if (!dateString) return "Soon";
  try {
    const examDate = new Date(dateString);
    const today = new Date();
    const diff = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Past";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  } catch {
    return "Soon";
  }
};

// ─── Empty State ─────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-12 text-center"
  >
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
        <Icon size={28} className="text-gray-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────

function Exams() {
  const dispatch = useDispatch();
  const exams = useSelector(selectStudentExams);
  const results = useSelector(selectStudentResults);
  const gradeScale = useSelector(selectStudentGradeScale);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Load Data ──────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchExams()).unwrap(),
        dispatch(fetchResults()).unwrap(),
        dispatch(fetchGradeScale()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading exams data:", err);
      setToast({ message: "Failed to load exams data", type: "error" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Exams refreshed", type: "info" });
  };

  // ─── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = exams?.length || 0;
    const completed = exams?.filter((e) => getExamStatus(e).label === "Completed").length || 0;
    const upcoming = exams?.filter((e) => getExamStatus(e).label === "Upcoming").length || 0;
    const today = exams?.filter((e) => getExamStatus(e).label === "Today").length || 0;
    const withResults = results?.length || 0;
    const avgScore = results?.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (parseFloat(r.marks_obtained) || 0), 0) / results.length)
      : 0;
    return { total, completed, upcoming, today, withResults, avgScore };
  }, [exams, results]);

  // ─── Get Result for Exam ──────────────────────────────────────────
  const getResultForExam = (examId) => {
    if (!examId) return null;
    const result = results?.find((r) => r.exam === examId);
    return result || null;
  };

  // ─── Filter & Sort ─────────────────────────────────────────────────
  const filteredExams = useMemo(() => {
    if (!exams || exams.length === 0) return [];
    
    let filtered = exams.filter((exam) => {
      const status = getExamStatus(exam).label.toLowerCase();
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesType = filterType === "all" || exam.exam_type?.toLowerCase() === filterType;
      const matchesSearch = searchTerm === "" || 
        exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSubjectName(exam).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClassName(exam)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getTeacherName(exam)?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "marks":
          const aResult = getResultForExam(a.id);
          const bResult = getResultForExam(b.id);
          comparison = (parseFloat(aResult?.marks_obtained) || 0) - (parseFloat(bResult?.marks_obtained) || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [exams, filterStatus, filterType, searchTerm, sortBy, sortOrder]);

  // ─── Type Options ──────────────────────────────────────────────────
  const examTypes = useMemo(() => {
    const types = new Set();
    exams?.forEach(e => {
      if (e.exam_type) types.add(e.exam_type.toLowerCase());
    });
    return Array.from(types);
  }, [exams]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setSortBy("date");
    setSortOrder("asc");
    setShowFilters(false);
  };

  // ─── Loading ────────────────────────────────────────────────────────
  if (loading && !exams?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading exams...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Exams"
          subtitle="View your exam schedule and results"
          breadcrumbs={["Student", "Exams"]}
          bgColor="bg-purple-50"
          actions={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white/80 rounded-lg hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        <div className="mt-6" />

        {/* ─── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard label="Total Exams" value={stats.total} icon={BookOpen} color="purple" delay={0.05} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="emerald" delay={0.1} />
          <StatCard label="Upcoming" value={stats.upcoming} icon={Calendar} color="amber" delay={0.15} />
          <StatCard label="Today" value={stats.today} icon={Clock} color="blue" delay={0.2} />
          <StatCard label="Results" value={stats.withResults} icon={Award} color="indigo" delay={0.25} />
          <StatCard 
            label="Avg Score" 
            value={stats.avgScore > 0 ? `${stats.avgScore}%` : "—"} 
            icon={BarChart3} 
            color="rose" 
            delay={0.3} 
          />
        </div>

        {/* ─── Results Summary Banner ────────────────────────────────── */}
        {stats.withResults > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Results Available</p>
                  <p className="text-xs text-gray-500">
                    {stats.withResults} exam result{stats.withResults > 1 ? "s" : ""} available
                    {stats.avgScore > 0 && ` • Average score: ${stats.avgScore}%`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full">
                  {stats.avgScore > 0 ? `${stats.avgScore}% Avg` : "No scores yet"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── Filters ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams by name, subject, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showFilters || filterStatus !== "all" || filterType !== "all"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={16} />
              Filters
              {(filterStatus !== "all" || filterType !== "all") && (
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {(filterStatus !== "all" ? 1 : 0) + (filterType !== "all" ? 1 : 0)}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "upcoming", "today", "completed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setShowFilters(false); }}
                          className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                            filterStatus === status
                              ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => { setFilterType("all"); setShowFilters(false); }}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterType === "all"
                            ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {examTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setShowFilters(false); }}
                          className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                            filterType === type
                              ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort By</label>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="date">Date</option>
                        <option value="name">Name</option>
                        <option value="marks">Marks</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                      >
                        {sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                {(searchTerm || filterStatus !== "all" || filterType !== "all") && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Results Count ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* ─── Exams List ────────────────────────────────────────────── */}
        {filteredExams.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No exams found"
            description={
              searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "No exams match your filters. Try adjusting your search."
                : "There are no exams scheduled at the moment. Check back later."
            }
            action={(searchTerm || filterStatus !== "all" || filterType !== "all") ? { 
              label: "Clear Filters", 
              onClick: clearFilters 
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                result={getResultForExam(exam.id)}
                gradeScale={gradeScale}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Exams Module</p>
        </div>

        {/* ─── Details Modal ───────────────────────────────────────────── */}
        <AnimatePresence>
          {showDetailsModal && selectedExam && (
            <ExamDetailsModal
              exam={selectedExam}
              result={getResultForExam(selectedExam.id)}
              gradeScale={gradeScale}
              onClose={() => { setShowDetailsModal(false); setSelectedExam(null); }}
              onPrint={handlePrint}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Exams;