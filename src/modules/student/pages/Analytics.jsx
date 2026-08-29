// src/modules/student/pages/Analytics.jsx

/**
 * ============================================
 * STUDENT ANALYTICS COMPONENT - IMPROVED UI/UX
 * ============================================
 * 
 * Purpose: Displays student's analytics, predictions, and recommendations
 * Used by: Student module routes
 * 
 * Features:
 * - Predictions overview with better visual hierarchy
 * - Recommendations list with priority indicators
 * - Student goals tracking with progress visualization
 * - Skills assessment with proficiency levels
 * - Premium UI with animations
 * - Fully responsive
 * - Improved spacing and padding
 * - Better visual feedback
 * ============================================
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BookOpen,
  Lightbulb,
  Brain,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Star,
  Flag,
  Activity,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Rocket,
  GraduationCap,
  Medal,
  Star as StarIcon,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import studentService from "@/modules/student/services/studentService";

// ─── Toast Notification ───────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
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
      <div className="flex-shrink-0">{icons[type]}</div>
      <span className="text-sm font-medium text-text-primary">{message}</span>
    </motion.div>
  );
}

// ─── Premium Stat Card ─────────────────────────────────────────────────

function PremiumStatCard({ label, value, subtext, icon: Icon, color, delay, trend }) {
  const colorMap = {
    student: { bg: "bg-gradient-to-br from-student-light to-student-light/30", text: "text-student-dark", ring: "ring-student-light/40", hover: "hover:shadow-student-light/20" },
    emerald: { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/30", text: "text-emerald-600", ring: "ring-emerald-400/30", hover: "hover:shadow-emerald-500/20" },
    amber: { bg: "bg-gradient-to-br from-amber-50 to-amber-100/30", text: "text-amber-600", ring: "ring-amber-400/30", hover: "hover:shadow-amber-500/20" },
    rose: { bg: "bg-gradient-to-br from-rose-50 to-rose-100/30", text: "text-rose-600", ring: "ring-rose-400/30", hover: "hover:shadow-rose-500/20" },
    blue: { bg: "bg-gradient-to-br from-blue-50 to-blue-100/30", text: "text-blue-600", ring: "ring-blue-400/30", hover: "hover:shadow-blue-500/20" },
    purple: { bg: "bg-gradient-to-br from-purple-50 to-purple-100/30", text: "text-purple-600", ring: "ring-purple-400/30", hover: "hover:shadow-purple-500/20" },
    indigo: { bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/30", text: "text-indigo-600", ring: "ring-indigo-400/30", hover: "hover:shadow-indigo-500/20" },
  };

  const c = colorMap[color] || colorMap.student;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl ${c.bg} border border-gray-100/60 p-5 sm:p-6 transition-all duration-300 hover:shadow-2xl ${c.hover}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
            {label}
          </p>
          <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${c.ring} ring-4 ${c.text} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
            <Icon size={17} strokeWidth={2.5} className={c.text} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
            {value}
          </p>
        </div>
        {subtext && (
          <p className="mt-1 text-[10px] sm:text-xs font-medium text-text-secondary flex items-center gap-1">
            {subtext}
          </p>
        )}
        {trend && (
          <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Prediction Card ──────────────────────────────────────────────────

function PredictionCard({ prediction }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getRiskColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore < 30) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (numScore < 60) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const predictionType = prediction.prediction_type || prediction.type || "Prediction";
  const predictionValue = prediction.value || "No prediction value";
  const predictionDetails = prediction.details || prediction.description || null;
  const predictionDate = prediction.prediction_date || prediction.created_at || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-200/50">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-text-primary capitalize">
                {predictionType}
              </p>
              {prediction.risk_score && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(prediction.risk_score)}`}>
                  Risk: {prediction.risk_score}%
                </span>
              )}
            </div>
            <p className="text-base font-medium text-text-secondary mt-1">
              {predictionValue}
            </p>
            {predictionDetails && (
              <p className="text-sm text-text-secondary/70 mt-1.5 leading-relaxed">
                {predictionDetails}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary/70 mt-2.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(predictionDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:mt-0">
          {prediction.risk_score && parseFloat(prediction.risk_score) < 30 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
              <ThumbsUp className="h-3.5 w-3.5" />
              Low Risk
            </span>
          )}
          {prediction.risk_score && parseFloat(prediction.risk_score) >= 60 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100">
              <ThumbsDown className="h-3.5 w-3.5" />
              High Risk
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Recommendation Card ─────────────────────────────────────────────

function RecommendationCard({ recommendation }) {
  const getStatusConfig = (status) => {
    const map = {
      pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock, label: "Pending" },
      accepted: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle, label: "Accepted" },
      in_progress: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Activity, label: "In Progress" },
      completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Completed" },
      rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Rejected" },
      dismissed: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: XCircle, label: "Dismissed" },
    };
    return map[status] || map.pending;
  };

  const statusConfig = getStatusConfig(recommendation.status);
  const StatusIcon = statusConfig.icon;

  const recommendationType = recommendation.recommendation_type || recommendation.type || "Recommendation";
  const recommendationContent = recommendation.content || recommendation.recommendation || "No content provided";

  // Get priority indicator
  const getPriority = (type) => {
    const priorityMap = {
      study_plan: { color: "bg-red-100 text-red-700", label: "High" },
      activity: { color: "bg-yellow-100 text-yellow-700", label: "Medium" },
      behavioral: { color: "bg-red-100 text-red-700", label: "High" },
      academic: { color: "bg-red-100 text-red-700", label: "High" },
      general: { color: "bg-blue-100 text-blue-700", label: "Low" },
    };
    return priorityMap[type] || { color: "bg-blue-100 text-blue-700", label: "Low" };
  };

  const priority = getPriority(recommendationType);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-200/50">
            <Lightbulb className="h-6 w-6 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-text-primary capitalize">
                {recommendationType.replace(/_/g, " ")}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.color}`}>
                {priority.label} Priority
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
              {recommendationContent}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────

function GoalCard({ goal }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      active: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Target, label: "Active" },
      completed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle, label: "Completed" },
      cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle, label: "Cancelled" },
    };
    return map[status] || map.active;
  };

  const statusConfig = getStatusConfig(goal.status);
  const StatusIcon = statusConfig.icon;

  const goalType = goal.goal_type || goal.type || "Goal";
  const goalTarget = goal.target || goal.goal || "No target set";
  const goalProgress = goal.progress !== undefined ? goal.progress : null;
  const goalTargetDate = goal.target_date || goal.due_date || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0 shadow-sm shadow-rose-200/50">
            <Flag className="h-6 w-6 text-rose-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-text-primary capitalize">
                {goalType}
              </p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-1.5">
              {goalTarget}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary/70 mt-2">
              {goalProgress !== null && (
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Progress: {goalProgress}%
                </span>
              )}
              {goalTargetDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Target: {formatDate(goalTargetDate)}
                </span>
              )}
            </div>
            {goalProgress !== null && (
              <div className="mt-3 w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(goalProgress, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    goalProgress >= 70 ? "bg-emerald-500" :
                    goalProgress >= 40 ? "bg-yellow-500" : "bg-rose-500"
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skill Card ───────────────────────────────────────────────────────

function SkillCard({ skill }) {
  const getProficiencyLevel = (level) => {
    const map = {
      beginner: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Beginner", icon: StarIcon },
      intermediate: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Intermediate", icon: StarIcon },
      advanced: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Advanced", icon: StarIcon },
      expert: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Expert", icon: Medal },
    };
    return map[level] || map.beginner;
  };

  const proficiency = getProficiencyLevel(skill.proficiency_level);
  const skillName = skill.skill_name || skill.skill?.name || skill.skill || "Unknown Skill";
  const ProficiencyIcon = proficiency.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200/50">
            <Award className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{skillName}</p>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${proficiency.color}`}>
              <ProficiencyIcon className="h-3 w-3" />
              {proficiency.label}
            </span>
          </div>
        </div>
        {skill.acquired_on && (
          <span className="text-xs text-text-secondary/70 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Acquired: {new Date(skill.acquired_on).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────

function PremiumEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 sm:p-16 text-center border border-gray-100"
    >
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-student-light to-student-light/30 animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
          <Icon size={40} className="text-student-dark" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-student-dark to-student-hover rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Analytics() {
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("predictions");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [studentGoals, setStudentGoals] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, recRes, goalsRes, skillsRes] = await Promise.all([
        studentService.getPredictions(),
        studentService.getRecommendations(),
        studentService.getStudentGoals(),
        studentService.getStudentSkills(),
      ]);

      setPredictions(predRes?.results || predRes || []);
      setRecommendations(recRes?.results || recRes || []);
      setStudentGoals(goalsRes?.results || goalsRes || []);
      setStudentSkills(skillsRes?.results || skillsRes || []);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      const msg = err.response?.data?.errors?.detail || 
                  err.response?.data?.message || 
                  'Failed to load analytics data';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalPredictions = predictions?.length || 0;
    const totalRecommendations = recommendations?.length || 0;
    const totalGoals = studentGoals?.length || 0;
    const totalSkills = studentSkills?.length || 0;
    const activeGoals = studentGoals?.filter((g) => g.status === "active").length || 0;
    const completedGoals = studentGoals?.filter((g) => g.status === "completed").length || 0;

    return {
      totalPredictions,
      totalRecommendations,
      totalGoals,
      totalSkills,
      activeGoals,
      completedGoals,
    };
  }, [predictions, recommendations, studentGoals, studentSkills]);

  const filteredPredictions = useMemo(() => {
    if (!predictions) return [];
    return predictions.filter((item) => {
      const matchesSearch = searchTerm === "" ||
        (item.prediction_type || item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.value || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.details || item.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [predictions, searchTerm]);

  const filteredRecommendations = useMemo(() => {
    if (!recommendations) return [];
    return recommendations.filter((item) => {
      const matchesSearch = searchTerm === "" ||
        (item.recommendation_type || item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.content || item.recommendation || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [recommendations, searchTerm]);

  const filteredGoals = useMemo(() => {
    if (!studentGoals) return [];
    return studentGoals.filter((item) => {
      const matchesSearch = searchTerm === "" ||
        (item.goal_type || item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.target || item.goal || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [studentGoals, searchTerm]);

  const filteredSkills = useMemo(() => {
    if (!studentSkills) return [];
    return studentSkills.filter((item) => {
      const skillName = item.skill_name || item.skill?.name || item.skill || "";
      const matchesSearch = searchTerm === "" ||
        skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.proficiency_level || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [studentSkills, searchTerm]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast({ message: "Analytics data refreshed", type: "info" });
  };

  const tabs = [
    { id: "predictions", label: "Predictions", icon: Brain, count: stats.totalPredictions, color: "purple" },
    { id: "recommendations", label: "Recommendations", icon: Lightbulb, count: stats.totalRecommendations, color: "amber" },
    { id: "goals", label: "Goals", icon: Target, count: stats.totalGoals, color: "rose" },
    { id: "skills", label: "Skills", icon: Award, count: stats.totalSkills, color: "indigo" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Failed to load data</h3>
          <p className="text-text-secondary mt-2 leading-relaxed">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-student-dark to-student-hover rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6 pb-16">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <PageHeader
        title="Analytics"
        subtitle="View your predictions, recommendations, goals, and skills"
        breadcrumbs={["Student", "Analytics"]}
        bgColor="bg-student-light"
      >
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/20 rounded-xl hover:bg-white/30 transition-all disabled:opacity-50 backdrop-blur-sm hover:scale-105 duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <PremiumStatCard
          label="Predictions"
          value={stats.totalPredictions}
          subtext="AI predictions"
          icon={Brain}
          color="purple"
          delay={0.05}
        />
        <PremiumStatCard
          label="Recommendations"
          value={stats.totalRecommendations}
          subtext="Personalized"
          icon={Lightbulb}
          color="amber"
          delay={0.1}
        />
        <PremiumStatCard
          label="Goals"
          value={stats.totalGoals}
          subtext={`${stats.activeGoals} active, ${stats.completedGoals} completed`}
          icon={Target}
          color="rose"
          delay={0.15}
        />
        <PremiumStatCard
          label="Skills"
          value={stats.totalSkills}
          subtext="Acquired skills"
          icon={Award}
          color="indigo"
          delay={0.2}
        />
      </div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-5 sm:p-6 border border-indigo-100"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200/50">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Analytics Summary</p>
              <p className="text-sm text-text-secondary">
                {stats.totalPredictions + stats.totalRecommendations} insights, {stats.totalGoals} goals, {stats.totalSkills} skills
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-xl">
              {stats.totalPredictions + stats.totalRecommendations + stats.totalGoals + stats.totalSkills} items
            </span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-text-secondary group-focus-within:text-student-dark transition-colors" />
          <input
            type="text"
            placeholder="Search analytics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-student-light focus:border-transparent transition-all bg-white/80 backdrop-blur-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorMap = {
            purple: "bg-purple-100 text-purple-700",
            amber: "bg-amber-100 text-amber-700",
            rose: "bg-rose-100 text-rose-700",
            indigo: "bg-indigo-100 text-indigo-700",
          };
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? `bg-student-light text-student-dark shadow-sm`
                  : "text-text-secondary hover:bg-gray-100"
              }`}
            >
              <Icon size={16} className={isActive ? "text-student-dark" : ""} />
              {tab.label}
              <span className={`text-xs px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                isActive ? "bg-student-dark/20 text-student-dark" : "bg-gray-200 text-text-secondary"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Predictions */}
        {activeTab === "predictions" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">AI Predictions</h2>
              <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {filteredPredictions.length} predictions
              </span>
            </div>
            {filteredPredictions.length === 0 ? (
              <PremiumEmptyState
                icon={Brain}
                title={searchTerm ? "No matching predictions" : "No predictions yet"}
                description={
                  searchTerm
                    ? `No predictions found matching "${searchTerm}"`
                    : "AI predictions will appear here as your learning data is analyzed."
                }
                action={searchTerm ? { label: "Clear Search", onClick: () => setSearchTerm("") } : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredPredictions.map((item) => (
                  <PredictionCard key={item.id} prediction={item} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Recommendations */}
        {activeTab === "recommendations" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Recommendations</h2>
              <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {filteredRecommendations.length} recommendations
              </span>
            </div>
            {filteredRecommendations.length === 0 ? (
              <PremiumEmptyState
                icon={Lightbulb}
                title={searchTerm ? "No matching recommendations" : "No recommendations yet"}
                description={
                  searchTerm
                    ? `No recommendations found matching "${searchTerm}"`
                    : "Personalized recommendations will appear here based on your performance."
                }
                action={searchTerm ? { label: "Clear Search", onClick: () => setSearchTerm("") } : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredRecommendations.map((item) => (
                  <RecommendationCard key={item.id} recommendation={item} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Goals */}
        {activeTab === "goals" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Your Goals</h2>
              <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {filteredGoals.length} goals
              </span>
            </div>
            {filteredGoals.length === 0 ? (
              <PremiumEmptyState
                icon={Target}
                title={searchTerm ? "No matching goals" : "No goals set"}
                description={
                  searchTerm
                    ? `No goals found matching "${searchTerm}"`
                    : "Set academic goals to track your progress and achievements."
                }
                action={searchTerm ? { label: "Clear Search", onClick: () => setSearchTerm("") } : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((item) => (
                  <GoalCard key={item.id} goal={item} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Skills */}
        {activeTab === "skills" && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary">Your Skills</h2>
              <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                {filteredSkills.length} skills
              </span>
            </div>
            {filteredSkills.length === 0 ? (
              <PremiumEmptyState
                icon={Award}
                title={searchTerm ? "No matching skills" : "No skills recorded"}
                description={
                  searchTerm
                    ? `No skills found matching "${searchTerm}"`
                    : "Your acquired skills and proficiency levels will appear here."
                }
                action={searchTerm ? { label: "Clear Search", onClick: () => setSearchTerm("") } : undefined}
              />
            ) : (
              <div className="space-y-3 pb-4">
                {filteredSkills.map((item) => (
                  <SkillCard key={item.id} skill={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with extra spacing */}
      <div className="text-center text-xs text-text-secondary/60 py-8 border-t border-gray-100">
        <p>© 2024 Smart School Management System • Analytics Module</p>
      </div>
    </div>
  );
}

export default Analytics;