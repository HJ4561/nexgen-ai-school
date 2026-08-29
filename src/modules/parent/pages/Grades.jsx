// src/modules/parent/pages/Grades.jsx

/**
 * ============================================
 * PARENT GRADES PAGE
 * ============================================
 * 
 * Purpose: Display grades for parent's children
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from results (read-only)
 * - exam_name from results (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Award,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Calendar,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  Star,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Loader2,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
// ✅ Fixed: Import TermSelector directly
import TermSelector from "@/components/TermSelector";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchResults,
  fetchGradeSummary,
  fetchGradeScale,
  fetchParentLinks,
} from "@/modules/parent/store/parentThunks";

import {
  selectResults,
  selectGradeSummary,
  selectGradeScale,
  selectParentLinks,
  selectSelectedChild,
  selectSelectedTerm,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

// ✅ Import setSelectedTerm from parentSlice
import { setSelectedTerm } from "@/modules/parent/store/parentSlice";

// ─── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
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

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ label, value, subtitle, icon: Icon, color = "indigo", delay = 0 }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Grade Card ─────────────────────────────────────────────────────────

function GradeCard({ result, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-600 bg-emerald-50";
    if (percentage >= 60) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const marks = result.marks_obtained || 0;
  const total = result.exam?.total_marks || 100;
  const percentage = total > 0 ? Math.round((marks / total) * 100) : 0;
  const grade = getGradeLabel(percentage);
  const gradeColor = getGradeColor(percentage);

  // ✅ Use new API fields
  const studentName = result.student_name || result.student?.name || "Student";
  const examName = result.exam_name || result.exam?.name || "Exam";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200"
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold text-gray-800 truncate">
                  {examName}
                </h4>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeColor}`}>
                  <Award className="h-3 w-3" />
                  Grade {grade}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {percentage}%
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {studentName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {result.exam?.date ? new Date(result.exam.date).toLocaleDateString() : "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" />
                  {marks}/{total}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              {isExpanded ? "Less" : "More"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
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
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Subject</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {result.subject_name || result.subject?.name || "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Marks</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {marks}/{total}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {percentage}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Grade</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {grade}
                  </p>
                </div>
                {result.exam?.exam_type && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Exam Type</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5 capitalize">
                      {result.exam.exam_type}
                    </p>
                  </div>
                )}
                {result.remarks && (
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-3">
                    <p className="text-xs text-gray-500">Remarks</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">
                      {result.remarks}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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

function Grades() {
  const dispatch = useDispatch();

  const results = useSelector(selectResults);
  const gradeSummary = useSelector(selectGradeSummary);
  const gradeScale = useSelector(selectGradeScale);
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const selectedTerm = useSelector(selectSelectedTerm);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ─── Load Data ──────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchResults()).unwrap(),
        dispatch(fetchGradeSummary({})).unwrap(),
        dispatch(fetchGradeScale()).unwrap(),
        dispatch(fetchParentLinks()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading grades:", err);
      setToast({ message: "Failed to load grades", type: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // ─── Filter Results ──────────────────────────────────────────────────
  const filteredResults = useMemo(() => {
    let filtered = results || [];

    // Filter by child
    if (selectedChild) {
      filtered = filtered.filter(r => r.student === selectedChild || r.student_id === selectedChild);
    }

    // Filter by term
    if (selectedTerm) {
      filtered = filtered.filter(r => {
        const term = r.term || r.term_name || r.exam?.term || r.exam?.term_name || r.exam_type;
        return term === selectedTerm;
      });
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        (r.exam?.name || r.exam_name || "").toLowerCase().includes(search) ||
        (r.subject_name || r.subject?.name || "").toLowerCase().includes(search) ||
        (r.student_name || r.student?.name || "").toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [results, selectedChild, selectedTerm, searchTerm]);

  // ─── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = results?.length || 0;
    const avg = gradeSummary?.average || 0;
    const passed = results?.filter(r => {
      const marks = r.marks_obtained || 0;
      const total = r.exam?.total_marks || 100;
      return total > 0 && (marks / total) >= 0.5;
    }).length || 0;

    return { total, avg, passed };
  }, [results, gradeSummary]);

  // ─── Refresh ──────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Grades refreshed", type: "info" });
  };

  if (loading && !results?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading grades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Grades"
        subtitle="View your children's academic performance"
        breadcrumbs={["Parent", "Grades"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
              <GraduationCap className="h-3.5 w-3.5" />
              {stats.total} results
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Results"
          value={stats.total}
          subtitle="All subjects"
          icon={BookOpen}
          color="indigo"
          delay={0.05}
        />
        <StatCard
          label="Average"
          value={`${stats.avg}%`}
          subtitle="Overall average"
          icon={TrendingUp}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          label="Passed"
          value={stats.passed}
          subtitle={`${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% pass rate`}
          icon={CheckCircle}
          color="blue"
          delay={0.15}
        />
        <StatCard
          label="Children"
          value={children?.length || 0}
          subtitle="Linked children"
          icon={User}
          color="purple"
          delay={0.2}
        />
      </div>

      {/* ─── Error State ──────────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 p-4 rounded-xl text-center border border-rose-200"
        >
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm shadow-sm"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search grades by subject, exam, or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Term Selector - Imported directly */}
        <TermSelector />
      </div>

      {/* ─── Results List ────────────────────────────────────────────── */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Results</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredResults.length} of {results?.length || 0} results
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <PremiumEmptyState
            icon={GraduationCap}
            title={searchTerm ? "No matching results found" : "No results available"}
            description={
              searchTerm 
                ? `No results found matching "${searchTerm}". Try adjusting your search.`
                : selectedTerm
                ? `No results found for the selected term. Try changing the filter.`
                : "Your children's grades will appear here once they are published."
            }
            action={(searchTerm || selectedTerm) ? { 
              label: "Clear Filters", 
              onClick: () => {
                setSearchTerm("");
                dispatch(setSelectedTerm(null));
              }
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredResults.map((result, index) => (
              <GradeCard key={result.id} result={result} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Grades Module</p>
      </div>
    </div>
  );
}

export default Grades;