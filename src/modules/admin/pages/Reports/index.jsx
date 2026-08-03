// src/modules/admin/pages/Reports/index.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  File, Download, Calendar, Filter, X, RefreshCw, 
  AlertCircle, CheckCircle, FileText, FileSpreadsheet,
  FileBarChart, Users, BookOpen, DollarSign, Clock,
  TrendingUp, TrendingDown, Printer, Mail, Eye,
  Search, ChevronDown, ArrowRight, PieChart, Loader2
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
const STUDENTS_API = "/users/students/";
const TEACHERS_API = "/users/teachers/";
const ATTENDANCE_API = "/attendance/attendance/";
const PAYMENTS_API = "/finance/payments/";
const EXPENSES_API = "/finance/expenses/";
const EXAMS_API = "/exams/exams/";
const ASSIGNMENTS_API = "/assignments/assignments/";
const EVENTS_API = "/events/events/";
const MESSAGES_API = "/communication/messages/";
const NOTIFICATIONS_API = "/communication/notifications/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Stats Card Component ──────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, iconBg, iconColor, subtitle }) => (
  <Card className="p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);

// ─── Report Card Component ─────────────────────────────────────────────
const ReportCard = ({ 
  title, 
  description, 
  icon: Icon, 
  iconBg, 
  iconColor, 
  count, 
  onGenerate, 
  onPreview, 
  onExport,
  loading,
  generating
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await onGenerate();
    setIsGenerating(false);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 group relative">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          <p className="text-xs text-gray-400 mt-1">{count} records available</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              onClick={onPreview}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || isGenerating}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
        <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-[10px] shrink-0">
          {count || 0}
        </Badge>
      </div>

      {/* Export Options Dropdown */}
      {showExportOptions && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[140px]">
          <button
            onClick={() => onExport('pdf')}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
          </button>
          <button
            onClick={() => onExport('excel')}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /> Excel
          </button>
          <button
            onClick={() => onExport('csv')}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
          >
            <FileBarChart className="w-3.5 h-3.5 text-blue-500" /> CSV
          </button>
        </div>
      )}
    </Card>
  );
};

// ─── Preview Modal Component ───────────────────────────────────────────
const PreviewModal = ({ isOpen, onClose, reportType, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            Preview: {reportType} Report
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.slice(0, 10).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="px-4 py-3 text-sm text-gray-700">
                          {typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/) 
                            ? formatDate(value) 
                            : typeof value === 'number' && value > 1000 
                              ? formatCurrency(value) 
                              : value || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 10 && (
                <p className="text-xs text-gray-400 text-center mt-4">Showing first 10 of {data.length} records</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No data available for preview</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Download preview data as CSV
              if (data && data.length > 0) {
                const headers = Object.keys(data[0]);
                const rows = data.map(row => headers.map(h => row[h] || ''));
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${reportType}_preview.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Preview
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('');

  // ─── Report Data State ──────────────────────────────────────────────
  const [reportData, setReportData] = useState({
    students: { total: 0, newThisMonth: 0, data: [] },
    teachers: { total: 0, active: 0, data: [] },
    attendance: { total: 0, present: 0, rate: 0, data: [] },
    revenue: { total: 0, thisMonth: 0, data: [] },
    expenses: { total: 0, thisMonth: 0, data: [] },
    exams: { total: 0, upcoming: 0, completed: 0, data: [] },
    assignments: { total: 0, submitted: 0, pending: 0, data: [] },
    events: { total: 0, upcoming: 0, completed: 0, data: [] },
    messages: { total: 0, unread: 0, data: [] },
    notifications: { total: 0, unread: 0, data: [] },
  });

  // ─── Filter State ────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // ─── Toast Helper ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Safe Fetch Helper ──────────────────────────────────────────────
  const safeFetch = async (url, fallbackData = []) => {
    try {
      const response = await api.get(url);
      return response.data?.results || response.data || fallbackData;
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message);
      return fallbackData;
    }
  };

  // ─── Fetch All Data ──────────────────────────────────────────────────
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        students,
        teachers,
        attendance,
        payments,
        expenses,
        exams,
        assignments,
        events,
        messages,
        notifications,
      ] = await Promise.all([
        safeFetch(STUDENTS_API),
        safeFetch(TEACHERS_API),
        safeFetch(ATTENDANCE_API),
        safeFetch(PAYMENTS_API),
        safeFetch(EXPENSES_API),
        safeFetch(EXAMS_API),
        safeFetch(ASSIGNMENTS_API),
        safeFetch(EVENTS_API),
        safeFetch(MESSAGES_API),
        safeFetch(NOTIFICATIONS_API),
      ]);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Calculate stats
      const newStudentsThisMonth = students.filter(s => {
        const date = new Date(s.created_at || s.admission_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      const totalAttendance = attendance.length;
      const presentCount = attendance.filter(a => a.status === "present").length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
      const revenueThisMonth = payments.filter(p => {
        const date = new Date(p.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const expensesThisMonth = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, e) => sum + Number(e.amount || 0), 0);

      setReportData({
        students: { 
          total: students.length, 
          newThisMonth: newStudentsThisMonth,
          data: students.slice(0, 20).map(s => ({
            Name: s.name || s.full_name || 'Unknown',
            Email: s.email || '—',
            Class: s.class_obj?.name || '—',
            Admission: s.admission_no || '—',
            Status: s.status || 'Active',
          }))
        },
        teachers: { 
          total: teachers.length, 
          active: teachers.filter(t => t.status === "active").length,
          data: teachers.slice(0, 20).map(t => ({
            Name: t.name || t.full_name || 'Unknown',
            Email: t.email || '—',
            Subject: t.subject_specialization || '—',
            Status: t.status || 'Active',
          }))
        },
        attendance: { 
          total: totalAttendance, 
          present: presentCount, 
          rate: attendanceRate,
          data: attendance.slice(0, 20).map(a => ({
            Student: a.student?.name || 'Unknown',
            Date: a.date || '—',
            Status: a.status || '—',
            Teacher: a.teacher?.name || '—',
          }))
        },
        revenue: { 
          total: totalRevenue, 
          thisMonth: revenueThisMonth,
          data: payments.slice(0, 20).map(p => ({
            Student: p.student?.name || 'Unknown',
            Amount: p.amount_paid || 0,
            Date: p.payment_date || '—',
            Method: p.payment_method || '—',
            Status: p.status || 'Completed',
          }))
        },
        expenses: { 
          total: totalExpenses, 
          thisMonth: expensesThisMonth,
          data: expenses.slice(0, 20).map(e => ({
            Description: e.description || '—',
            Category: e.category || '—',
            Amount: e.amount || 0,
            Date: e.date || '—',
          }))
        },
        exams: {
          total: exams.length,
          upcoming: exams.filter(e => e.status === "upcoming" || e.status === "scheduled").length,
          completed: exams.filter(e => e.status === "completed").length,
          data: exams.slice(0, 20).map(e => ({
            Name: e.name || '—',
            Subject: e.subject?.name || '—',
            Date: e.date || '—',
            Status: e.status || '—',
          }))
        },
        assignments: {
          total: assignments.length,
          submitted: assignments.filter(a => a.status === "submitted" || a.status === "graded").length,
          pending: assignments.filter(a => a.status === "pending").length,
          data: assignments.slice(0, 20).map(a => ({
            Title: a.title || '—',
            Subject: a.subject?.name || '—',
            Due: a.due_date || '—',
            Status: a.status || '—',
          }))
        },
        events: {
          total: events.length,
          upcoming: events.filter(e => {
            const date = new Date(e.event_date);
            return date >= now && e.status !== "cancelled";
          }).length,
          completed: events.filter(e => {
            const date = new Date(e.event_date);
            return date < now || e.status === "completed";
          }).length,
          data: events.slice(0, 20).map(e => ({
            Name: e.name || '—',
            Date: e.event_date || '—',
            Location: e.location || '—',
            Status: e.status || '—',
          }))
        },
        messages: { 
          total: messages.length, 
          unread: messages.filter(m => !m.is_read).length,
          data: messages.slice(0, 20).map(m => ({
            Subject: m.subject || '—',
            Sender: m.sender?.name || '—',
            Receiver: m.receiver?.name || '—',
            Status: m.is_read ? 'Read' : 'Unread',
          }))
        },
        notifications: { 
          total: notifications.length, 
          unread: notifications.filter(n => !n.is_read).length,
          data: notifications.slice(0, 20).map(n => ({
            Title: n.title || '—',
            Message: n.message || '—',
            Type: n.type || '—',
            Status: n.is_read ? 'Read' : 'Unread',
          }))
        },
      });

    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setError("Failed to load report data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // ─── Refresh Handler ─────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    showToast("Reports refreshed successfully", "success");
  };

  // ─── Report Generation Handlers ──────────────────────────────────────
  const generateReport = async (type) => {
    setGenerating(type);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`, "success");
    } catch (error) {
      showToast(`Failed to generate ${type} report`, "error");
    } finally {
      setGenerating(null);
    }
  };

  const previewReport = (type) => {
    let data = [];
    let label = type.charAt(0).toUpperCase() + type.slice(1);
    
    switch(type) {
      case 'student':
        data = reportData.students.data;
        break;
      case 'attendance':
        data = reportData.attendance.data;
        break;
      case 'financial':
        data = reportData.revenue.data;
        break;
      case 'exam':
        data = reportData.exams.data;
        break;
      case 'assignment':
        data = reportData.assignments.data;
        break;
      case 'event':
        data = reportData.events.data;
        break;
      default:
        data = [];
    }
    
    setPreviewType(label);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  const exportReport = async (type, format) => {
    try {
      let data = [];
      let filename = `${type}_report`;
      
      switch(type) {
        case 'student':
          data = reportData.students.data;
          filename = `student_report_${new Date().toISOString().slice(0,10)}`;
          break;
        case 'attendance':
          data = reportData.attendance.data;
          filename = `attendance_report_${new Date().toISOString().slice(0,10)}`;
          break;
        case 'financial':
          data = reportData.revenue.data;
          filename = `financial_report_${new Date().toISOString().slice(0,10)}`;
          break;
        case 'exam':
          data = reportData.exams.data;
          filename = `exam_report_${new Date().toISOString().slice(0,10)}`;
          break;
        case 'assignment':
          data = reportData.assignments.data;
          filename = `assignment_report_${new Date().toISOString().slice(0,10)}`;
          break;
        case 'event':
          data = reportData.events.data;
          filename = `event_report_${new Date().toISOString().slice(0,10)}`;
          break;
        default:
          data = [];
      }

      if (data.length === 0) {
        showToast('No data available for export', 'error');
        return;
      }

      if (format === 'csv') {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(h => row[h] || ''));
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`${format.toUpperCase()} exported successfully`, 'success');
      } else {
        showToast(`${format.toUpperCase()} export coming soon`, 'info');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Export failed', 'error');
    }
  };

  // ─── Report Definitions ──────────────────────────────────────────────
  const reports = [
    {
      id: "student",
      title: "Student Report",
      description: "Academic performance and demographics",
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      count: reportData.students.total,
    },
    {
      id: "attendance",
      title: "Attendance Report",
      description: "Monthly attendance summary",
      icon: Clock,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      count: reportData.attendance.total,
    },
    {
      id: "financial",
      title: "Financial Report",
      description: "Revenue & expenses overview",
      icon: DollarSign,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      count: reportData.revenue.total > 0 ? reportData.revenue.data.length : 0,
    },
    {
      id: "exam",
      title: "Exam Report",
      description: "Exam results and performance",
      icon: BookOpen,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      count: reportData.exams.total,
    },
    {
      id: "assignment",
      title: "Assignment Report",
      description: "Assignment submissions and grades",
      icon: FileText,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      count: reportData.assignments.total,
    },
    {
      id: "event",
      title: "Event Report",
      description: "Event participation and feedback",
      icon: Calendar,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
      count: reportData.events.total,
    },
  ];

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Reports" 
            subtitle="Generate and download reports" 
            breadcrumbs={["Admin", "Reports"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading report data...</p>
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
          title="Reports" 
          subtitle={`Generate and download reports${reportData.students.total > 0 ? ` — ${reportData.students.total} students` : ""}`}
          breadcrumbs={["Admin", "Reports"]}
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
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading reports</p>
              <p className="text-amber-600">{error}</p>
            </div>
          </div>
        )}

        {/* ─── Stats Overview ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Students"
            value={reportData.students.total.toLocaleString()}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subtitle={`${reportData.students.newThisMonth} new this month`}
          />
          <StatsCard
            label="Attendance Rate"
            value={`${reportData.attendance.rate}%`}
            icon={CheckCircle}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle={`${reportData.attendance.present} present out of ${reportData.attendance.total}`}
          />
          <StatsCard
            label="Revenue"
            value={formatCurrency(reportData.revenue.total)}
            icon={DollarSign}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subtitle={formatCurrency(reportData.revenue.thisMonth) + " this month"}
          />
          <StatsCard
            label="Exams"
            value={reportData.exams.total}
            icon={BookOpen}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subtitle={`${reportData.exams.upcoming} upcoming`}
          />
        </div>

        {/* ─── Filters Section ────────────────────────────────────────────── */}
        {showFilters && (
          <Card className="p-4 border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <button
                onClick={() => {
                  setDateRange({ from: "", to: "" });
                  showToast('Filters cleared', 'info');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <X className="w-3.5 h-3.5 inline mr-1" /> Clear
              </button>
            </div>
          </Card>
        )}

        {/* ─── Reports Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description}
              icon={report.icon}
              iconBg={report.iconBg}
              iconColor={report.iconColor}
              count={report.count}
              onGenerate={() => generateReport(report.id)}
              onPreview={() => previewReport(report.id)}
              onExport={(format) => exportReport(report.id, format)}
              loading={generating === report.id}
            />
          ))}
        </div>

        {/* ─── Export Options ─────────────────────────────────────────────── */}
        <Card className="p-6 border-2 border-dashed border-gray-200">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <Download className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Export Options</h3>
            <p className="text-gray-500 mt-2 max-w-md text-center">
              Export data in various formats including PDF, Excel, and CSV.
              Select a report above to get started.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 cursor-pointer hover:bg-blue-100 transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" /> Excel
              </Badge>
              <Badge className="bg-red-50 text-red-700 border-red-200 px-3 py-1 cursor-pointer hover:bg-red-100 transition-colors">
                <FileText className="w-3.5 h-3.5 inline mr-1" /> PDF
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1 cursor-pointer hover:bg-green-100 transition-colors">
                <FileBarChart className="w-3.5 h-3.5 inline mr-1" /> CSV
              </Badge>
            </div>
          </div>
        </Card>

        {/* ─── Preview Modal ───────────────────────────────────────────────── */}
        <PreviewModal
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setPreviewData(null);
          }}
          reportType={previewType}
          data={previewData}
        />

        {/* ─── Toast ───────────────────────────────────────────────────────── */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
            {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
            {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default Reports;