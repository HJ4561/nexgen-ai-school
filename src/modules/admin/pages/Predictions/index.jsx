// src/modules/admin/pages/Predictions/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Sparkles, TrendingUp, TrendingDown, Users, BookOpen, X, 
  RefreshCw, AlertCircle, CheckCircle, Clock, 
  GraduationCap, Award, Brain, Zap, BarChart3, 
  Target, AlertTriangle, ArrowRight, Shield, 
  Filter, ChevronDown, Eye, Edit, Trash2, Plus,
  Calendar, User, MessageSquare, FileText, Settings,
  Search, Minus
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
// Predictions: /api/analytics/predictions/
// Student Goals: /api/analytics/student-goals/
// Student Skills: /api/analytics/student-skills/
// Recommendations: /api/analytics/recommendations/
// Skill Mapping: /api/analytics/skill-mapping/

const PREDICTIONS_API = "/analytics/predictions/";
const STUDENT_GOALS_API = "/analytics/student-goals/";
const STUDENT_SKILLS_API = "/analytics/student-skills/";
const RECOMMENDATIONS_API = "/analytics/recommendations/";
const SKILL_MAPPING_API = "/analytics/skill-mapping/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRiskColor = (score) => {
  const numScore = Number(score);
  if (numScore >= 70) return "bg-red-50 text-red-700 border-red-200";
  if (numScore >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

const getRiskLabel = (score) => {
  const numScore = Number(score);
  if (numScore >= 70) return "High Risk";
  if (numScore >= 40) return "Medium Risk";
  return "Low Risk";
};

const getRiskIcon = (score) => {
  const numScore = Number(score);
  if (numScore >= 70) return <AlertTriangle className="w-3.5 h-3.5" />;
  if (numScore >= 40) return <AlertCircle className="w-3.5 h-3.5" />;
  return <Shield className="w-3.5 h-3.5" />;
};

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'completed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getPredictionTypeLabel = (type) => {
  const labels = {
    performance: "Performance",
    attendance: "Attendance",
    behavior: "Behavior",
    academic: "Academic",
    dropout: "Dropout Risk",
    engagement: "Engagement",
  };
  return labels[type?.toLowerCase()] || type || "—";
};

// ─── Stats Card Component ──────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, iconBg, iconColor, subtitle, trend, trendLabel }) => (
  <Card className="p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend !== undefined && trend !== null && (
          <div className="flex items-center gap-1 mt-1">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : (
              <Minus className="w-4 h-4 text-gray-400" />
            )}
            <span className={`text-xs font-medium ${trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-gray-400"}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && <span className="text-xs text-gray-400 ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);

// ─── Safe Fetch Helper ──────────────────────────────────────────────────
const safeFetch = async (url, fallbackData = []) => {
  try {
    const response = await api.get(url);
    return response.data?.results || response.data || fallbackData;
  } catch (error) {
    console.warn(`Failed to fetch ${url}:`, error.message);
    return fallbackData;
  }
};

// ─── Main Component ────────────────────────────────────────────────────
const Predictions = () => {
  // ─── State ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── Data State ──────────────────────────────────────────────────────
  const [predictions, setPredictions] = useState([]);
  const [studentGoals, setStudentGoals] = useState([]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [skillMapping, setSkillMapping] = useState([]);

  // ─── Filter State ────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  // ─── Modal State ────────────────────────────────────────────────────
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    student: "",
    prediction_type: "performance",
    value: "",
    risk_score: "",
    prediction_date: "",
    details: "",
  });

  // ─── Toast Helper ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch All Data ──────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        predictionsData,
        goalsData,
        skillsData,
        recommendationsData,
        skillMappingData,
      ] = await Promise.all([
        safeFetch(PREDICTIONS_API),
        safeFetch(STUDENT_GOALS_API),
        safeFetch(STUDENT_SKILLS_API),
        safeFetch(RECOMMENDATIONS_API),
        safeFetch(SKILL_MAPPING_API),
      ]);

      setPredictions(predictionsData);
      setStudentGoals(goalsData);
      setStudentSkills(skillsData);
      setRecommendations(recommendationsData);
      setSkillMapping(skillMappingData);

      if (predictionsData.length === 0 && goalsData.length === 0) {
        setError("No predictions data available. Some endpoints may not be configured.");
      }
    } catch (error) {
      console.error("Failed to fetch predictions data:", error);
      setError("Failed to load predictions data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Refresh Handler ─────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  // ─── CRUD Operations ──────────────────────────────────────────────────
  const handleAddPrediction = async () => {
    setSaving(true);
    try {
      const payload = {
        student: formData.student,
        prediction_type: formData.prediction_type,
        value: formData.value,
        risk_score: Number(formData.risk_score) || 0,
        prediction_date: formData.prediction_date || new Date().toISOString().split('T')[0],
        details: formData.details,
      };
      const response = await api.post(PREDICTIONS_API, payload);
      setPredictions([response.data, ...predictions]);
      showToast("Prediction created successfully", "success");
      setModalOpen(false);
      setFormData({
        student: "",
        prediction_type: "performance",
        value: "",
        risk_score: "",
        prediction_date: "",
        details: "",
      });
    } catch (error) {
      console.error("Failed to create prediction:", error);
      showToast(error.response?.data?.detail || "Failed to create prediction", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${PREDICTIONS_API}${deletingItem.id}/`);
      setPredictions(predictions.filter(p => p.id !== deletingItem.id));
      showToast("Prediction deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete prediction:", error);
      showToast("Failed to delete prediction", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalPredictions = predictions.length;
    const highRisk = predictions.filter(p => Number(p.risk_score) >= 70).length;
    const mediumRisk = predictions.filter(p => Number(p.risk_score) >= 40 && Number(p.risk_score) < 70).length;
    const lowRisk = predictions.filter(p => Number(p.risk_score) < 40).length;
    
    const totalGoals = studentGoals.length;
    const activeGoals = studentGoals.filter(g => g.status === "active").length;
    const completedGoals = studentGoals.filter(g => g.status === "completed").length;
    
    const totalSkills = studentSkills.length;
    const advancedSkills = studentSkills.filter(s => s.proficiency_level === "advanced" || s.proficiency_level === "expert").length;
    
    const totalRecommendations = recommendations.length;
    const pendingRecommendations = recommendations.filter(r => r.status === "pending").length;

    return {
      predictions: { total: totalPredictions, highRisk, mediumRisk, lowRisk },
      goals: { total: totalGoals, active: activeGoals, completed: completedGoals },
      skills: { total: totalSkills, advanced: advancedSkills },
      recommendations: { total: totalRecommendations, pending: pendingRecommendations },
    };
  }, [predictions, studentGoals, studentSkills, recommendations]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredPredictions = useMemo(() => {
    let filtered = predictions;

    if (filterType !== "all") {
      filtered = filtered.filter(p => p.prediction_type === filterType);
    }

    if (filterRisk !== "all") {
      filtered = filtered.filter(p => {
        const score = Number(p.risk_score);
        if (filterRisk === "high") return score >= 70;
        if (filterRisk === "medium") return score >= 40 && score < 70;
        if (filterRisk === "low") return score < 40;
        return true;
      });
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.student || "").toLowerCase().includes(search) ||
        (p.value || "").toLowerCase().includes(search) ||
        (p.details || "").toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [predictions, searchTerm, filterType, filterRisk]);

  const totalPages = Math.max(1, Math.ceil(filteredPredictions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredPredictions.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = filterType !== "all" || filterRisk !== "all" || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterRisk("all");
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Predictions" 
            subtitle="AI-powered predictions and insights" 
            breadcrumbs={["Admin", "Analytics", "Predictions"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading predictions...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Predictions" 
          subtitle={`AI-powered predictions and insights${predictions.length > 0 ? ` — ${predictions.length} predictions` : ""}`}
          breadcrumbs={["Admin", "Analytics", "Predictions"]}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Prediction
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Warning</p>
              <p className="text-amber-600">{error}</p>
            </div>
          </div>
        )}

        {/* ─── Stats Row 1: Prediction Overview ────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Predictions"
            value={stats.predictions.total}
            icon={Brain}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subtitle={`${stats.predictions.highRisk} high risk, ${stats.predictions.lowRisk} low risk`}
          />
          <StatsCard
            label="High Risk"
            value={stats.predictions.highRisk}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            subtitle="Needs immediate attention"
          />
          <StatsCard
            label="Medium Risk"
            value={stats.predictions.mediumRisk}
            icon={AlertCircle}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subtitle="Monitor closely"
          />
          <StatsCard
            label="Low Risk"
            value={stats.predictions.lowRisk}
            icon={Shield}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle="On track"
          />
        </div>

        {/* ─── Stats Row 2: Goals & Skills ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Student Goals"
            value={stats.goals.total}
            icon={Target}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subtitle={`${stats.goals.active} active, ${stats.goals.completed} completed`}
          />
          <StatsCard
            label="Active Goals"
            value={stats.goals.active}
            icon={CheckCircle}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle="In progress"
          />
          <StatsCard
            label="Skills Tracked"
            value={stats.skills.total}
            icon={Award}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subtitle={`${stats.skills.advanced} advanced skills`}
          />
          <StatsCard
            label="Recommendations"
            value={stats.recommendations.total}
            icon={Sparkles}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subtitle={`${stats.recommendations.pending} pending`}
          />
        </div>

        {/* ─── Filters ────────────────────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search predictions by student or value..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="performance">Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="behavior">Behavior</option>
                  <option value="academic">Academic</option>
                  <option value="dropout">Dropout Risk</option>
                  <option value="engagement">Engagement</option>
                </select>
                <select
                  value={filterRisk}
                  onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
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

          {/* ─── Predictions Table ────────────────────────────────────────── */}
          <div className="overflow-x-auto">
            {predictions.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">No Predictions Found</p>
                    <p className="text-sm text-gray-400 mt-1">Add a prediction to start analyzing student outcomes.</p>
                  </div>
                </div>
              </div>
            ) : pageItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No predictions match your filters</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Prediction</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Score</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-800 text-sm">
                            {prediction.student || "Unknown Student"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {getPredictionTypeLabel(prediction.prediction_type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{prediction.value || "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getRiskColor(prediction.risk_score)} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                          {getRiskIcon(prediction.risk_score)}
                          {getRiskLabel(prediction.risk_score)} ({prediction.risk_score || 0}%)
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {formatDate(prediction.prediction_date)}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedPrediction(prediction);
                              setDetailModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // Open edit modal
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(prediction)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete"
                          >
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

          {predictions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filteredPredictions.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>

        {/* ─── Recommendations Section ───────────────────────────────────── */}
        {recommendations.length > 0 && (
          <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Recommendations
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendations.slice(0, 5).map((rec) => (
                <div key={rec.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {rec.student || "Student"}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{rec.content || "—"}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getStatusColor(rec.status)} text-xs px-2.5 py-1`}>
                          {rec.status || "Pending"}
                        </Badge>
                        <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                          {rec.type || "—"}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
            {recommendations.length > 5 && (
              <div className="px-4 py-3 border-t border-gray-100 text-center">
                <span className="text-xs text-gray-400">Showing 5 of {recommendations.length} recommendations</span>
              </div>
            )}
          </Card>
        )}

        {/* ─── Coming Soon: Detailed Analytics ───────────────────────────── */}
        <Card className="p-8 text-center border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Advanced AI Analytics Dashboard</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              Advanced AI models analyzing patterns and predicting outcomes. 
              More detailed analytics and visualizations coming soon.
            </p>
            <div className="flex gap-2 mt-4">
              <Badge className="bg-purple-50 text-purple-700">Machine Learning</Badge>
              <Badge className="bg-blue-50 text-blue-700">Pattern Recognition</Badge>
              <Badge className="bg-emerald-50 text-emerald-700">Trend Analysis</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Add Prediction Modal ────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Add Prediction</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Student</label>
                <input
                  type="text"
                  placeholder="Enter student name or ID"
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Prediction Type</label>
                <select
                  value={formData.prediction_type}
                  onChange={(e) => setFormData({ ...formData, prediction_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="performance">Performance</option>
                  <option value="attendance">Attendance</option>
                  <option value="behavior">Behavior</option>
                  <option value="academic">Academic</option>
                  <option value="dropout">Dropout Risk</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Prediction Value</label>
                <input
                  type="text"
                  placeholder="e.g., Above Average, 85%"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Risk Score (%)</label>
                <input
                  type="number"
                  placeholder="0-100"
                  value={formData.risk_score}
                  onChange={(e) => setFormData({ ...formData, risk_score: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.prediction_date}
                  onChange={(e) => setFormData({ ...formData, prediction_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Details</label>
                <textarea
                  rows={3}
                  placeholder="Additional details..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrediction}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Plus className="w-4 h-4" />}
                Add Prediction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ────────────────────────────────────────────────── */}
      {detailModalOpen && selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Prediction Details</h3>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium text-gray-800">{selectedPrediction.student || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Type</p>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    {getPredictionTypeLabel(selectedPrediction.prediction_type)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Prediction</p>
                  <p className="font-medium text-gray-800">{selectedPrediction.value || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <Badge className={`${getRiskColor(selectedPrediction.risk_score)}`}>
                    {getRiskLabel(selectedPrediction.risk_score)} ({selectedPrediction.risk_score || 0}%)
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedPrediction.prediction_date)}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-gray-500">Details</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedPrediction.details || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title="Delete Prediction"
          message={`Are you sure you want to delete this prediction for "${deletingItem.student || 'this student'}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* ─── Toast ───────────────────────────────────────────────────────── */}
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

export default Predictions;