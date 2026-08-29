/**
 * ============================================
 * PARENT ANALYTICS PAGE
 * ============================================
 * 
 * Purpose: Analytics dashboard for parents
 * Used by: Parent module routes
 * 
 * Features:
 * - Child performance analytics
 * - Attendance trends
 * - Grade distribution
 * - Behavioral insights
 * - Parent engagement metrics
 * - Recommendations
 * 
 * Dependencies:
 * - react for component
 * - react-redux for state management
 * - recharts for charts
 * - lucide-react for icons
 * 
 * Usage:
 * <Route path="/parent/analytics" element={<ParentAnalytics />} />
 * ============================================
 */

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Calendar,
  Target,
  Brain,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  fetchPredictions,
  fetchRecommendations,
  fetchStudentGoals,
  fetchStudentSkills,
  fetchParentEngagement,
} from "@/modules/parent/store/parentThunks";
import { selectSelectedChild } from "@/modules/parent/store/parentSlice";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const ParentAnalytics = () => {
  const dispatch = useDispatch();
  const selectedChild = useSelector(selectSelectedChild);
  const { predictions, recommendations, studentGoals, studentSkills, parentEngagement, loading } = useSelector(
    (state) => state.parent
  );

  useEffect(() => {
    dispatch(fetchPredictions({ student_id: selectedChild }));
    dispatch(fetchRecommendations({ student_id: selectedChild }));
    dispatch(fetchStudentGoals({ student_id: selectedChild }));
    dispatch(fetchStudentSkills({ student_id: selectedChild }));
    dispatch(fetchParentEngagement({ parent_id: selectedChild }));
  }, [dispatch, selectedChild]);

  // ─── Computed Data ──────────────────────────────────────────────

  // Skill distribution data for pie chart
  const skillData = useMemo(() => {
    const levels = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    studentSkills.forEach((skill) => {
      const level = skill.proficiency_level?.toLowerCase() || "beginner";
      if (levels[level] !== undefined) {
        levels[level] += 1;
      }
    });
    return Object.entries(levels)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [studentSkills]);

  // Goal progress data
  const goalData = useMemo(() => {
    return studentGoals.map((goal) => ({
      name: goal.goal_type || "Goal",
      progress: goal.progress || 0,
      target: goal.target,
      status: goal.status,
    }));
  }, [studentGoals]);

  // Prediction risk levels
  const riskData = useMemo(() => {
    const risks = { low: 0, medium: 0, high: 0 };
    predictions.forEach((pred) => {
      const risk = pred.risk_score < 30 ? "low" : pred.risk_score < 60 ? "medium" : "high";
      risks[risk] += 1;
    });
    return risks;
  }, [predictions]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytics"
        subtitle="Track your child's performance and engagement metrics"
        breadcrumbs={["Parent", "Analytics"]}
        bgColor="bg-parent-light"
      />

      {/* ─── Stats Overview ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Target size={18} />
            <p className="text-xs text-gray-500">Goals</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{studentGoals.length}</p>
          <p className="text-xs text-gray-400">
            {studentGoals.filter((g) => g.status === "active").length} Active
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Brain size={18} />
            <p className="text-xs text-gray-500">Skills</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{studentSkills.length}</p>
          <p className="text-xs text-gray-400">Tracked skills</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <TrendingUp size={18} />
            <p className="text-xs text-gray-500">Predictions</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{predictions.length}</p>
          <p className="text-xs text-gray-400">{riskData.low || 0} Low risk</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Users size={18} />
            <p className="text-xs text-gray-500">Engagement</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{parentEngagement?.engagementScore || 0}%</p>
          <p className="text-xs text-gray-400">Parent engagement</p>
        </Card>
      </div>

      {/* ─── Predictions ────────────────────────────────────────────────── */}
      {predictions.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-text-primary">Performance Predictions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((pred, index) => (
                <div key={index} className="rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary capitalize">
                      {pred.prediction_type || "Prediction"}
                    </p>
                    <Badge color={pred.risk_score < 30 ? "success" : pred.risk_score < 60 ? "warning" : "danger"}>
                      {pred.risk_score < 30 ? "Low Risk" : pred.risk_score < 60 ? "Medium Risk" : "High Risk"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{pred.value || "N/A"}</p>
                  {pred.details && <p className="text-xs text-gray-500 mt-1">{pred.details}</p>}
                  <p className="text-xs text-gray-400 mt-2">Confidence: {pred.confidence_score || "N/A"}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ─── Recommendations ────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={20} className="text-amber-600" />
              <h3 className="text-lg font-semibold text-text-primary">Recommendations</h3>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary capitalize">{rec.type || "Recommendation"}</p>
                    <p className="text-sm text-gray-600">{rec.content}</p>
                  </div>
                  <Badge color={rec.status === "pending" ? "warning" : "success"}>
                    {rec.status || "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ─── Skills Chart ────────────────────────────────────────────────── */}
      {skillData.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-text-primary">Skill Distribution</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Goals Progress ──────────────────────────────────────────────── */}
      {goalData.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-emerald-600" />
              <h3 className="text-lg font-semibold text-text-primary">Goal Progress</h3>
            </div>
            <div className="space-y-4">
              {goalData.map((goal, index) => (
                <div key={index}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary capitalize">{goal.name}</p>
                      <p className="text-xs text-gray-500">{goal.target}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{goal.progress}%</span>
                      <Badge color={goal.status === "active" ? "warning" : "success"}>
                        {goal.status || "Active"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ─── Parent Engagement ────────────────────────────────────────────── */}
      {parentEngagement && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-rose-600" />
              <h3 className="text-lg font-semibold text-text-primary">Parent Engagement</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{parentEngagement.engagementScore || 0}%</p>
                <p className="text-xs text-gray-500">Engagement Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{parentEngagement.ptmAttendance || 0}</p>
                <p className="text-xs text-gray-500">PTM Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{parentEngagement.responseRate || 0}%</p>
                <p className="text-xs text-gray-500">Response Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{parentEngagement.interactionScore || 0}</p>
                <p className="text-xs text-gray-500">Interaction Score</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Empty State ──────────────────────────────────────────────────── */}
      {!loading &&
        predictions.length === 0 &&
        recommendations.length === 0 &&
        studentGoals.length === 0 &&
        studentSkills.length === 0 &&
        !parentEngagement && (
          <Card>
            <div className="py-16 text-center px-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <BarChart3 size={32} className="text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">No Analytics Data</h3>
              <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
                Analytics data will appear here once your child has sufficient activity records.
              </p>
            </div>
          </Card>
        )}
    </div>
  );
};

export default ParentAnalytics;