// src/modules/teacher/pages/TeacherGrades.jsx

/**
 * ============================================
 * TEACHER GRADES (Marks Entry) - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: Enter and manage student grades
 * Uses REAL API DATA - No mock data
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name instead of student?.name
 * - class_name instead of class_obj?.name
 * - subject_name instead of subject?.name
 * - teacher_name instead of teacher?.name (nullable)
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/exams/results/ - Get results
 * - POST /api/exams/results/ - Create result
 * - PATCH /api/exams/results/{id}/ - Update result
 * - GET /api/exams/grade-scale/ - Get grade scale
 * - GET /api/users/students/ - Get students
 * - GET /api/academics/classes/ - Get classes
 * - GET /api/academics/subjects/ - Get subjects
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  FileText,
  Search,
  Download,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2,
  GraduationCap,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
  Users,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Grid,
  List,
  Eye,
  Trash2,
  Plus,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchExams,
  fetchResults,
  fetchGradeScale,
  fetchStudents,
  fetchTeacherClasses,
  fetchSubjects,
  createResult,
  updateResult,
} from "../store/teacherThunks";

import {
  selectTeacherExams,
  selectTeacherResults,
  selectTeacherGradeScale,
  selectTeacherStudents,
  selectTeacherClasses,
  selectTeacherSubjects,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const getGradeInfo = (marks, total, gradeScale = []) => {
  if (!marks || marks === 0 || !total || total === 0) {
    return { grade: "N/A", percentage: 0, color: "bg-gray-100 text-gray-600 border-gray-200" };
  }
  
  const percentage = Math.round((parseFloat(marks) / parseFloat(total)) * 100);
  
  let grade = "F";
  if (gradeScale && gradeScale.length > 0) {
    const matching = gradeScale.find(g => 
      percentage >= g.min_percentage && percentage <= g.max_percentage
    );
    if (matching) grade = matching.grade;
  } else {
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "F";
  }
  
  const colors = {
    "A+": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "A": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "B": "bg-blue-100 text-blue-800 border-blue-200",
    "C": "bg-amber-100 text-amber-800 border-amber-200",
    "D": "bg-amber-100 text-amber-800 border-amber-200",
    "F": "bg-red-100 text-red-800 border-red-200",
    "N/A": "bg-gray-100 text-gray-600 border-gray-200",
  };
  
  return {
    grade,
    percentage,
    color: colors[grade] || colors["N/A"],
  };
};

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
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

// ─── Main Component ────────────────────────────────────────────────────

export default function TeacherGrades() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const exams = useSelector(selectTeacherExams);
  const results = useSelector(selectTeacherResults);
  const gradeScale = useSelector(selectTeacherGradeScale);
  const students = useSelector(selectTeacherStudents);
  const classes = useSelector(selectTeacherClasses);
  const subjects = useSelector(selectTeacherSubjects);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ─────────────────────────────────────────────────────
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [bulkGrades, setBulkGrades] = useState({});
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table");

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
      console.log('📊 Fetching grade data...');
      
      await Promise.all([
        dispatch(fetchTeacherClasses()),
        dispatch(fetchSubjects()),
        dispatch(fetchExams()),
        dispatch(fetchResults()),
        dispatch(fetchGradeScale()),
        dispatch(fetchStudents()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load data. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 State updated - Results:', results?.length || 0);
    console.log('📊 State updated - Students:', students?.length || 0);
    console.log('📊 State updated - Classes:', classes?.length || 0);
    console.log('📊 State updated - Subjects:', subjects?.length || 0);
    console.log('📊 State updated - Exams:', exams?.length || 0);
    console.log('📊 State updated - Grade Scale:', gradeScale?.length || 0);
  }, [results, students, classes, subjects, exams, gradeScale]);

  // ─── GSAP Animations ─────────────────────────────────────────────────

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

  const filteredResults = useMemo(() => {
  let filtered = Array.isArray(results) ? [...results] : [];
  
  console.log('📊 Filtering results - raw count:', filtered.length);
  console.log('📊 Available exams for mapping:', exams?.length || 0);

  // ─── Enrich results with exam details ──────────────────────────────
  // This maps each result to its exam to get class and subject names
  const enriched = filtered.map(result => {
    // Find the exam details
    const examDetails = Array.isArray(exams) 
      ? exams.find(e => String(e.id) === String(result.exam || result.exam_id))
      : null;
    
    // Log for debugging
    if (result.id === filtered[0]?.id) {
      console.log('📊 Exam details for result:', result.exam, examDetails);
    }
    
    return {
      ...result,
      // ✅ Get class name from exam
      class_name: examDetails?.class_name || 
                   examDetails?.class_obj?.name || 
                   '—',
      // ✅ Get subject name from exam
      subject_name: examDetails?.subject_name || 
                    examDetails?.subject?.name || 
                    '—',
      // ✅ Keep exam details for reference
      _exam_details: examDetails,
    };
  });

  // ─── Apply filters ──────────────────────────────────────────────────
  
  if (selectedExam) {
    const filteredByExam = enriched.filter(r => {
      const examId = r.exam || r.exam_id;
      return String(examId) === String(selectedExam);
    });
    console.log(`📊 Filtered by exam ${selectedExam}: ${filteredByExam.length} results`);
    filtered = filteredByExam;
  } else {
    filtered = enriched;
  }
  
  if (selectedClass) {
    filtered = filtered.filter(r => {
      // Check if the class matches
      const classId = r.class_id || r.class_obj?.id || r.class_obj;
      if (classId) {
        return String(classId) === String(selectedClass);
      }
      // If no class ID, try to match by name
      return r.class_name === selectedClass || 
             r.class_obj?.name === selectedClass;
    });
  }
  
  if (selectedSubject) {
    filtered = filtered.filter(r => {
      const subjectId = r.subject_id || r.subject?.id || r.subject;
      if (subjectId) {
        return String(subjectId) === String(selectedSubject);
      }
      return r.subject_name === selectedSubject || 
             r.subject?.name === selectedSubject;
    });
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(r => {
      const name = r.student_name || r.student?.name || '';
      return name.toLowerCase().includes(term);
    });
  }
  
  if (filterGrade !== "all") {
    filtered = filtered.filter(r => {
      const info = getGradeInfo(r.marks_obtained, r.total_marks || 100, gradeScale);
      return info.grade === filterGrade;
    });
  }

  console.log('📊 Final filtered results count:', filtered.length);
  if (filtered.length > 0) {
    console.log('📊 Sample enriched result:', filtered[0]);
  }
  return filtered;
}, [results, selectedExam, selectedClass, selectedSubject, searchTerm, filterGrade, gradeScale, exams]);

  const stats = useMemo(() => {
    const total = filteredResults.length;
    const passed = filteredResults.filter(r => {
      const info = getGradeInfo(r.marks_obtained, r.total_marks || 100, gradeScale);
      return info.grade !== "F" && info.grade !== "N/A";
    }).length;
    const failed = total - passed;
    const totalMarks = filteredResults.reduce((sum, r) => sum + (parseFloat(r.marks_obtained) || 0), 0);
    const average = total > 0 ? Math.round(totalMarks / total) : 0;
    
    return { total, passed, failed, average };
  }, [filteredResults, gradeScale]);

  const hasActiveFilters = selectedExam || selectedClass || selectedSubject || searchTerm || filterGrade !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleEdit = (result) => {
    setEditingId(result.id);
    setEditValues({
      marks_obtained: result.marks_obtained || 0,
      total_marks: result.total_marks || 100,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveEdit = async (result) => {
    if (editValues.marks_obtained === undefined || editValues.marks_obtained === null || editValues.marks_obtained === '') {
      toast.error("Please enter marks");
      return;
    }

    const marks = parseFloat(editValues.marks_obtained);
    const total = parseFloat(editValues.total_marks || result.total_marks || 100);

    if (isNaN(marks) || marks < 0 || marks > total) {
      toast.error(`Marks must be between 0 and ${total}`);
      return;
    }

    setSaving(true);
    try {
      const data = {
        marks_obtained: marks,
        total_marks: total,
      };
      
      await dispatch(updateResult({ id: result.id, data })).unwrap();
      toast.success("Grade updated successfully");
      setEditingId(null);
      setEditValues({});
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to update grade");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkChange = (studentId, value) => {
    setBulkGrades(prev => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSaveBulk = async () => {
    const entries = Object.entries(bulkGrades).filter(([_, value]) => value !== undefined && value !== null && value !== "");
    
    if (entries.length === 0) {
      toast.error("No grades to save");
      return;
    }

    setSaving(true);
    try {
      const promises = entries.map(async ([studentId, marks]) => {
        const existing = results.find(r => {
          const student = r.student_id || r.student?.id || r.student;
          return String(student) === String(studentId);
        });
        
        const data = {
          student: parseInt(studentId),
          marks_obtained: parseFloat(marks),
          total_marks: 100,
        };
        
        if (existing) {
          await dispatch(updateResult({ id: existing.id, data })).unwrap();
        } else {
          await dispatch(createResult(data)).unwrap();
        }
      });

      await Promise.all(promises);
      toast.success(`Saved ${entries.length} grades`);
      setBulkGrades({});
      setShowBulkEntry(false);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const handleExport = () => {
  if (filteredResults.length === 0) {
    toast.error("No data to export");
    return;
  }

  const headers = ['Student Name', 'Exam', 'Class', 'Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade'];
  const rows = filteredResults.map(r => {
    const info = getGradeInfo(r.marks_obtained, r.total_marks || 100, gradeScale);
    return [
      r.student_name || 'Unknown',
      r.exam_name || '—',
      r.class_name || r.class_obj?.name || '—',
      r.subject_name || r.subject?.name || '—',
      r.marks_obtained || 0,
      r.total_marks || 100,
      info.percentage,
      info.grade,
    ];
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grades_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  toast.success("Grades exported");
};

  const clearFilters = () => {
    setSelectedExam("");
    setSelectedClass("");
    setSelectedSubject("");
    setSearchTerm("");
    setFilterGrade("all");
    setShowFilters(false);
  };

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !dataFetched && results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading grades...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Marks Entry"
        subtitle="Enter and manage student grades"
        breadcrumbs={["Teacher", "Marks Entry"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExport}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              disabled={filteredResults.length === 0}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => setShowBulkEntry(!showBulkEntry)}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Bulk Entry</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
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

      {/* ─── Stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total"
          value={stats.total}
          subtitle={`${filteredResults.length} records`}
          icon={FileText}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Passed"
          value={stats.passed}
          subtitle={`${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% rate`}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Failed"
          value={stats.failed}
          subtitle="Need improvement"
          icon={XCircle}
          color="red"
          isLoading={loading}
        />
        <StatCard
          title="Average"
          value={stats.average}
          subtitle="Marks average"
          icon={BarChart3}
          color="purple"
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
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                  {(selectedExam ? 1 : 0) + (selectedClass ? 1 : 0) + (selectedSubject ? 1 : 0) + (searchTerm ? 1 : 0) + (filterGrade !== "all" ? 1 : 0)}
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Exam Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</label>
                    <div className="mt-2">
                      <select
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Exams ({exams?.length || 0})</option>
                        {Array.isArray(exams) && exams.map(exam => (
                          <option key={exam.id} value={exam.id}>{exam.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</label>
                    <div className="mt-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Classes ({classes?.length || 0})</option>
                        {Array.isArray(classes) && classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</label>
                    <div className="mt-2">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Subjects ({subjects?.length || 0})</option>
                        {Array.isArray(subjects) && subjects.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grade Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterGrade("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterGrade === "all"
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {["A+", "A", "B", "C", "D", "F"].map((grade) => (
                        <button
                          key={grade}
                          onClick={() => setFilterGrade(grade)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                            filterGrade === grade
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {grade}
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
                      <XCircle className="h-4 w-4" />
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
      {filteredResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Grades Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredResults.length} records • 
                  <span className="text-emerald-600 ml-1">{stats.passed} passed</span> •
                  <span className="text-red-600 ml-1">{stats.failed} failed</span> •
                  <span className="text-indigo-600 ml-1">Avg: {stats.average}%</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">
                {filteredResults.length} Records
              </span>
              {filterGrade !== "all" && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  Grade: {filterGrade}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Bulk Entry ─────────────────────────────────────────────── */}
      {showBulkEntry && students?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Bulk Grade Entry</h3>
                <p className="text-xs text-gray-500">Enter grades for all students at once</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkEntry(false)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBulk}
                disabled={saving || Object.keys(bulkGrades).length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full min-w-[500px]">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(students) && students.map(student => {
                  const existing = results.find(r => {
                    const studentId = r.student_id || r.student?.id || r.student;
                    return String(studentId) === String(student.id);
                  });
                  const value = bulkGrades[student.id] !== undefined ? bulkGrades[student.id] : (existing?.marks_obtained || '');
                  const info = getGradeInfo(parseFloat(value), 100, gradeScale);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs">
                            {student.name?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.name || "Unknown"}</p>
                            <p className="text-xs text-gray-400">Roll: {student.roll_no || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Marks"
                          value={value}
                          onChange={(e) => handleBulkChange(student.id, e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        />
                        <span className="text-xs text-gray-400 ml-1">/ 100</span>
                      </td>
                      <td className="px-3 py-2">
                        {value !== '' && (
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                            {info.grade}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ─── Grades Table ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching grades found" : "No grades available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : results?.length === 0 ? "No results data available from API. Make sure the results endpoint is returning data." : "No grade records found."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        // ─── Table View ──────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Class</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subject</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                  <th className="text-left px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="text-right px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredResults.map((result) => {
                  const isEditing = editingId === result.id;
                  // ✅ Use new API fields
                  const studentName = result.student_name || result.student?.name || 'Unknown';
                  const className = result.class_name || result.class_obj?.name || '—';
                  const subjectName = result.subject_name || result.subject?.name || '—';
                  const total = result.total_marks || 100;
                  const marks = isEditing ? editValues.marks_obtained : result.marks_obtained;
                  const info = getGradeInfo(marks, total, gradeScale);

                  return (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[100px] sm:max-w-[150px]">
                            {studentName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{className}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{subjectName}</span>
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={total}
                              value={editValues.marks_obtained || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, marks_obtained: parseFloat(e.target.value) || 0 }))}
                              className="w-16 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <span className="text-xs text-gray-400">/ {total}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-gray-800">{marks || 0} / {total}</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                          {info.grade}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(result)}
                              disabled={saving}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            >
                              {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEdit(result)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredResults.length} records • 
              <span className="text-emerald-600 ml-1">{stats.passed} passed</span> •
              <span className="text-red-600 ml-1">{stats.failed} failed</span> •
              <span className="text-indigo-600 ml-1">Avg: {stats.average}</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        // ─── Card View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {filteredResults.map((result) => {
            // ✅ Use new API fields
            const studentName = result.student_name || result.student?.name || 'Unknown';
            const className = result.class_name || result.class_obj?.name || '—';
            const subjectName = result.subject_name || result.subject?.name || '—';
            const total = result.total_marks || 100;
            const marks = result.marks_obtained || 0;
            const info = getGradeInfo(marks, total, gradeScale);

            return (
              <motion.div
                key={result.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
                      {studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{studentName}</p>
                      <p className="text-xs text-gray-500">{className}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                    {info.grade}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Subject</span>
                    <span className="font-medium text-gray-700">{subjectName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Marks</span>
                    <span className="font-semibold text-gray-900">{marks} / {total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Percentage</span>
                    <span className={`font-medium ${info.percentage >= 70 ? 'text-emerald-600' : info.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {info.percentage}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEdit(result)}
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • Marks Entry Module</p>
        <p className="mt-1">
          {filteredResults.length} records • 
          {filterGrade !== "all" ? ` Filtered by: Grade ${filterGrade}` : " All grades"}
          {selectedExam ? ` • Exam: ${exams?.find(e => String(e.id) === String(selectedExam))?.name || selectedExam}` : ""}
          {selectedClass ? ` • Class: ${classes?.find(c => String(c.id) === String(selectedClass))?.name || selectedClass}` : ""}
          {selectedSubject ? ` • Subject: ${subjects?.find(s => String(s.id) === String(selectedSubject))?.name || selectedSubject}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

    </div>
  );
}