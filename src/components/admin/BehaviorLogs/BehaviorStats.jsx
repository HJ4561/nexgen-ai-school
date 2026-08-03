import React from "react";
import { motion } from "framer-motion";
import { 
  AlertCircle, CheckCircle, Clock, Users, 
  TrendingUp, TrendingDown, Eye, BarChart3, PieChart 
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { getInitials, formatDate, getSeverityBadgeClass } from "@/utils/behaviorHelpers";

const COLORS = {
  positive: "#10b981",
  negative: "#ef4444",
  neutral: "#6b7280",
};

const SEVERITY_COLORS = {
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#ef4444",
};

const BehaviorStats = ({ logs, recentLogs, onViewDetail }) => {
  const total = logs.length;
  const positive = logs.filter(log => log.type === "positive").length;
  const negative = logs.filter(log => log.type === "negative").length;
  const neutral = logs.filter(log => log.type === "neutral").length;
  
  const typeData = [
    { name: "Positive", value: positive, color: COLORS.positive },
    { name: "Negative", value: negative, color: COLORS.negative },
    { name: "Neutral", value: neutral, color: COLORS.neutral },
  ].filter(d => d.value > 0);

  const severityData = [
    { name: "Low", value: logs.filter(l => l.severity === "low").length, color: SEVERITY_COLORS.low },
    { name: "Medium", value: logs.filter(l => l.severity === "medium").length, color: SEVERITY_COLORS.medium },
    { name: "High", value: logs.filter(l => l.severity === "high").length, color: SEVERITY_COLORS.high },
  ].filter(d => d.value > 0);

  const getMonthlyTrend = () => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short" });
      months[key] = { month: key, positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    
    logs.forEach(log => {
      if (!log.created_at) return;
      const date = new Date(log.created_at);
      const key = date.toLocaleString("default", { month: "short" });
      if (months[key]) {
        months[key].total++;
        if (log.type === "positive") months[key].positive++;
        else if (log.type === "negative") months[key].negative++;
        else if (log.type === "neutral") months[key].neutral++;
      }
    });
    
    return Object.values(months);
  };

  const trendData = getMonthlyTrend();

  const statsCards = [
    {
      label: "Total Reports",
      value: total,
      icon: <Users className="w-5 h-5" />,
      color: "blue",
      subtitle: "All time",
    },
    {
      label: "Positive",
      value: positive,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green",
      subtitle: "Good behavior",
    },
    {
      label: "Negative",
      value: negative,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "red",
      subtitle: "Needs attention",
    },
    {
      label: "Neutral",
      value: neutral,
      icon: <Clock className="w-5 h-5" />,
      color: "gray",
      subtitle: "Mixed behavior",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-xs text-gray-600">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPieLabel = ({ name, percent }) => {
    return name + " " + (percent * 100).toFixed(0) + "%";
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={"bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-" + stat.color + "-500"}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
              <div className={"p-3 rounded-xl bg-" + stat.color + "-50"}>
                <div className={"text-" + stat.color + "-500"}>{stat.icon}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              Behavior Type Distribution
            </h3>
            <span className="text-xs text-gray-400">{total} total records</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => {
                    const key = "cell-" + index;
                    return <Cell key={key} fill={entry.color} />;
                  })}
                </Pie>
                <Tooltip content={CustomTooltip} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Severity Levels
            </h3>
            <span className="text-xs text-gray-400">By severity</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={CustomTooltip} />
                <Bar dataKey="value" fill="#8884d8">
                  {severityData.map((entry, index) => {
                    const key = "severity-cell-" + index;
                    return <Cell key={key} fill={entry.color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card className="p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Monthly Trend
          </h3>
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={CustomTooltip} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="positive" 
                stackId="1"
                stroke={COLORS.positive} 
                fill={COLORS.positive} 
                fillOpacity={0.6}
                name="Positive"
              />
              <Area 
                type="monotone" 
                dataKey="neutral" 
                stackId="1"
                stroke={COLORS.neutral} 
                fill={COLORS.neutral} 
                fillOpacity={0.6}
                name="Neutral"
              />
              <Area 
                type="monotone" 
                dataKey="negative" 
                stackId="1"
                stroke={COLORS.negative} 
                fill={COLORS.negative} 
                fillOpacity={0.6}
                name="Negative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Logs */}
      <Card className="p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Recent Activity
          </h3>
          <span className="text-xs text-gray-400">{recentLogs.length} recent logs</span>
        </div>
        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            recentLogs.slice(0, 5).map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onViewDetail(log)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(log.student_name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.student_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {log.description?.slice(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={"text-[10px] border " + getSeverityBadgeClass(log.severity)}>
                    {log.severity || "Medium"}
                  </Badge>
                  <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                  <Eye className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default BehaviorStats;
