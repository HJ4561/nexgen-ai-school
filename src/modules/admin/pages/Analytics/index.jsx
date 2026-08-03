// src/modules/admin/pages/Analytics/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  BarChart3, TrendingUp, Users, BookOpen, DollarSign, Calendar, 
  X, RefreshCw, AlertCircle, TrendingDown, Minus, 
  GraduationCap, UserCheck, Award, Clock, PieChart,
  Activity, Shield, FileText, MessageSquare, CheckCircle, Bell,
  Filter, ChevronDown, Eye, Download, Printer, Calendar as CalendarIcon,
  ArrowUp, ArrowDown, Loader2
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations";
import api from "@/services/api";

// ─── API Endpoints ──────────────────────────────────────────────────────
const STUDENTS_API = "/users/students/";
const TEACHERS_API = "/users/teachers/";
const ATTENDANCE_API = "/attendance/attendance/";
const PAYMENTS_API = "/finance/payments/";
const FEES_API = "/finance/fees/";
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

const getTrendIcon = (value) => {
  if (value > 0) return <TrendingUp className="w-4 h-4 text-emerald-600" />;
  if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

const getTrendColor = (value) => {
  if (value > 0) return "text-emerald-600";
  if (value < 0) return "text-red-600";
  return "text-gray-400";
};

// ─── Stats Card Component ──────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, iconBg, iconColor, trend, trendLabel, subtitle, onClick }) => (
  <Card 
    className={`p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(trend)}
            <span className={`text-xs font-medium ${getTrendColor(trend)}`}>
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

// ─── Detailed View Modal ───────────────────────────────────────────────
const DetailedViewModal = ({ isOpen, onClose, title, data, columns, type }) => {
  if (!isOpen) return null;

  const exportData = () => {
    if (!data || data.length === 0) return;
    const headers = columns.map(c => c.label);
    const rows = data.map(item => columns.map(c => {
      const val = item[c.key];
      if (typeof val === 'number' && c.isCurrency) return formatCurrency(val);
      if (val && c.isDate) return new Date(val).toLocaleDateString();
      return val || '—';
    }));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            {title} Details
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
              title="Export as CSV"
            >
              <Download className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {columns.map((col) => (
                      <th key={col.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      {columns.map((col) => {
                        const val = item[col.key];
                        let display = val;
                        if (typeof val === 'number' && col.isCurrency) display = formatCurrency(val);
                        else if (val && col.isDate) display = new Date(val).toLocaleDateString();
                        else if (val === undefined || val === null) display = '—';
                        return (
                          <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 20 && (
                <p className="text-xs text-gray-400 text-center mt-4">Showing first 20 of {data.length} records</p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No detailed data available</p>
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
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiErrors, setApiErrors] = useState([]);
  const [toast, setToast] = useState(null);
  const [detailedView, setDetailedView] = useState({ isOpen: false, title: '', data: [], columns: [], type: '' });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  // ─── Analytics Data State ────────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState({
    students: { total: 0, newThisMonth: 0, trend: 0, data: [] },
    teachers: { total: 0, active: 0, trend: 0, data: [] },
    attendance: { rate: 0, today: 0, trend: 0, data: [] },
    revenue: { total: 0, thisMonth: 0, trend: 0, data: [] },
    expenses: { total: 0, thisMonth: 0, trend: 0, data: [] },
    exams: { total: 0, upcoming: 0, completed: 0, data: [] },
    assignments: { total: 0, pending: 0, submitted: 0, data: [] },
    events: { total: 0, upcoming: 0, completed: 0, data: [] },
    messages: { total: 0, unread: 0, data: [] },
    notifications: { total: 0, unread: 0, data: [] },
  });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Safe API Fetch ──────────────────────────────────────────────────
  const safeFetch = async (url, fallbackData = []) => {
    try {
      const response = await api.get(url);
      return response.data?.results || response.data || fallbackData;
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message);
      if (error.response?.status === 401) {
        setApiErrors(prev => [...prev, `${url} - Authentication required`]);
      } else if (error.response?.status === 404) {
        setApiErrors(prev => [...prev, `${url} - Endpoint not found`]);
      }
      return fallbackData;
    }
  };

  // ─── Fetch Analytics Data ──────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApiErrors([]);
    
    try {
      const [
        students,
        teachers,
        attendance,
        payments,
        fees,
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
        safeFetch(FEES_API),
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

      // Filter by date range if set
      const filterByDate = (items, dateField) => {
        if (!dateRange.from && !dateRange.to) return items;
        return items.filter(item => {
          const date = new Date(item[dateField]);
          if (dateRange.from && date < new Date(dateRange.from)) return false;
          if (dateRange.to && date > new Date(dateRange.to)) return false;
          return true;
        });
      };

      // Students
      const newStudentsThisMonth = students.filter(s => {
        const date = new Date(s.created_at || s.admission_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
      
      // Attendance
      const totalAttendance = attendance.length;
      const presentToday = attendance.filter(a => {
        const date = new Date(a.date);
        return date.toDateString() === now.toDateString() && a.status === "present";
      }).length;
      const attendanceRate = totalAttendance > 0 
        ? Math.round((attendance.filter(a => a.status === "present").length / totalAttendance) * 100) 
        : 0;

      // Revenue
      const filteredPayments = filterByDate(payments, 'payment_date');
      const totalRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
      const revenueThisMonth = filteredPayments.filter(p => {
        const date = new Date(p.payment_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);

      // Expenses
      const filteredExpenses = filterByDate(expenses, 'date');
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const expensesThisMonth = filteredExpenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, e) => sum + Number(e.amount || 0), 0);

      // Exams
      const upcomingExams = exams.filter(e => e.status === "upcoming" || e.status === "scheduled").length;
      const completedExams = exams.filter(e => e.status === "completed").length;

      // Assignments
      const pendingAssignments = assignments.filter(a => a.status === "pending").length;
      const submittedAssignments = assignments.filter(a => a.status === "submitted" || a.status === "graded").length;

      // Events
      const upcomingEvents = events.filter(e => {
        const date = new Date(e.event_date);
        return date >= now && e.status !== "cancelled";
      }).length;
      const completedEvents = events.filter(e => {
        const date = new Date(e.event_date);
        return date < now || e.status === "completed";
      }).length;

      // Messages
      const unreadMessages = messages.filter(m => !m.is_read).length;

      // Notifications
      const unreadNotifications = notifications.filter(n => !n.is_read).length;

      setAnalyticsData({
        students: {
          total: students.length,
          newThisMonth: newStudentsThisMonth,
          trend: students.length > 0 ? Math.round((newStudentsThisMonth / students.length) * 100) : 0,
          data: students.slice(0, 20).map(s => ({
            name: s.name || s.full_name || 'Unknown',
            email: s.email || '—',
            class: s.class_obj?.name || '—',
            admission: s.admission_no || '—',
            status: s.status || 'Active',
            joined: s.created_at || s.admission_date || '—',
          }))
        },
        teachers: {
          total: teachers.length,
          active: teachers.filter(t => t.status === "active").length,
          trend: teachers.length > 0 ? Math.round((teachers.filter(t => t.status === "active").length / teachers.length) * 100) : 0,
          data: teachers.slice(0, 20).map(t => ({
            name: t.name || t.full_name || 'Unknown',
            email: t.email || '—',
            subject: t.subject_specialization || '—',
            status: t.status || 'Active',
            joined: t.join_date || t.created_at || '—',
          }))
        },
        attendance: {
          rate: attendanceRate,
          today: presentToday,
          trend: attendanceRate > 0 ? Math.round(attendanceRate / 10) : 0,
          data: attendance.slice(0, 20).map(a => ({
            student: a.student?.name || 'Unknown',
            date: a.date || '—',
            status: a.status || '—',
            teacher: a.teacher?.name || '—',
          }))
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          trend: totalRevenue > 0 ? Math.round((revenueThisMonth / totalRevenue) * 100) : 0,
          data: filteredPayments.slice(0, 20).map(p => ({
            student: p.student?.name || 'Unknown',
            amount: p.amount_paid || 0,
            date: p.payment_date || '—',
            method: p.payment_method || '—',
            status: p.status || 'Completed',
          }))
        },
        expenses: {
          total: totalExpenses,
          thisMonth: expensesThisMonth,
          trend: totalExpenses > 0 ? Math.round((expensesThisMonth / totalExpenses) * 100) : 0,
          data: filteredExpenses.slice(0, 20).map(e => ({
            description: e.description || '—',
            category: e.category || '—',
            amount: e.amount || 0,
            date: e.date || '—',
          }))
        },
        exams: {
          total: exams.length,
          upcoming: upcomingExams,
          completed: completedExams,
          data: exams.slice(0, 20).map(e => ({
            name: e.name || '—',
            subject: e.subject?.name || '—',
            date: e.date || '—',
            status: e.status || '—',
          }))
        },
        assignments: {
          total: assignments.length,
          pending: pendingAssignments,
          submitted: submittedAssignments,
          data: assignments.slice(0, 20).map(a => ({
            title: a.title || '—',
            subject: a.subject?.name || '—',
            due: a.due_date || '—',
            status: a.status || '—',
          }))
        },
        events: {
          total: events.length,
          upcoming: upcomingEvents,
          completed: completedEvents,
          data: events.slice(0, 20).map(e => ({
            name: e.name || '—',
            date: e.event_date || '—',
            location: e.location || '—',
            status: e.status || '—',
          }))
        },
        messages: {
          total: messages.length,
          unread: unreadMessages,
          data: messages.slice(0, 20).map(m => ({
            subject: m.subject || '—',
            sender: m.sender?.name || '—',
            receiver: m.receiver?.name || '—',
            status: m.is_read ? 'Read' : 'Unread',
          }))
        },
        notifications: {
          total: notifications.length,
          unread: unreadNotifications,
          data: notifications.slice(0, 20).map(n => ({
            title: n.title || '—',
            message: n.message || '—',
            type: n.type || '—',
            status: n.is_read ? 'Read' : 'Unread',
          }))
        },
      });

      if (apiErrors.length > 0) {
        setError(`Some data could not be loaded: ${apiErrors.length} endpoint(s) failed`);
      }

    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      setError("Failed to load analytics data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    showToast("Analytics refreshed successfully", "success");
  };

  // ─── Open Detailed View ──────────────────────────────────────────────
  const openDetailedView = (type, title, data, columns) => {
    if (!data || data.length === 0) {
      showToast(`No detailed data available for ${title}`, 'info');
      return;
    }
    setDetailedView({
      isOpen: true,
      title,
      data,
      columns,
      type
    });
  };

  // ─── Column Definitions ──────────────────────────────────────────────
  const columnDefs = {
    students: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'class', label: 'Class' },
      { key: 'admission', label: 'Admission No' },
      { key: 'status', label: 'Status' },
      { key: 'joined', label: 'Joined', isDate: true },
    ],
    teachers: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'subject', label: 'Subject' },
      { key: 'status', label: 'Status' },
      { key: 'joined', label: 'Joined', isDate: true },
    ],
    attendance: [
      { key: 'student', label: 'Student' },
      { key: 'date', label: 'Date', isDate: true },
      { key: 'status', label: 'Status' },
      { key: 'teacher', label: 'Teacher' },
    ],
    revenue: [
      { key: 'student', label: 'Student' },
      { key: 'amount', label: 'Amount', isCurrency: true },
      { key: 'date', label: 'Date', isDate: true },
      { key: 'method', label: 'Method' },
      { key: 'status', label: 'Status' },
    ],
    expenses: [
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', isCurrency: true },
      { key: 'date', label: 'Date', isDate: true },
    ],
    exams: [
      { key: 'name', label: 'Exam Name' },
      { key: 'subject', label: 'Subject' },
      { key: 'date', label: 'Date', isDate: true },
      { key: 'status', label: 'Status' },
    ],
    assignments: [
      { key: 'title', label: 'Title' },
      { key: 'subject', label: 'Subject' },
      { key: 'due', label: 'Due Date', isDate: true },
      { key: 'status', label: 'Status' },
    ],
    events: [
      { key: 'name', label: 'Event Name' },
      { key: 'date', label: 'Date', isDate: true },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ],
    messages: [
      { key: 'subject', label: 'Subject' },
      { key: 'sender', label: 'Sender' },
      { key: 'receiver', label: 'Receiver' },
      { key: 'status', label: 'Status' },
    ],
    notifications: [
      { key: 'title', label: 'Title' },
      { key: 'message', label: 'Message' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
    ],
  };

  // ─── Clear Date Filters ──────────────────────────────────────────────
  const clearDateFilters = () => {
    setDateRange({ from: '', to: '' });
    showToast('Date filters cleared', 'info');
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Analytics" 
            subtitle="View school analytics and insights" 
            breadcrumbs={["Admin", "Analytics"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading analytics...</p>
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
          title="Analytics" 
          subtitle={`View school analytics and insights${analyticsData.students.total > 0 ? ` — ${analyticsData.students.total} students` : ""}`}
          breadcrumbs={["Admin", "Analytics"]}
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
              <p className="font-medium">Warning</p>
              <p className="text-amber-600">{error}</p>
              {apiErrors.length > 0 && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer font-medium">Show details</summary>
                  <ul className="mt-1 list-disc pl-4">
                    {apiErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}

        {/* ─── Date Range Filters ────────────────────────────────────────── */}
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
                onClick={clearDateFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <X className="w-3.5 h-3.5 inline mr-1" /> Clear
              </button>
            </div>
          </Card>
        )}

        {/* ─── Stats Row 1: Core Metrics ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Total Students"
            value={analyticsData.students.total.toLocaleString()}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            subtitle={`${analyticsData.students.newThisMonth} new this month`}
            trend={analyticsData.students.trend}
            trendLabel="growth"
            onClick={() => openDetailedView('students', 'Students', analyticsData.students.data, columnDefs.students)}
          />
          <StatsCard
            label="Teachers"
            value={analyticsData.teachers.total}
            icon={BookOpen}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            subtitle={`${analyticsData.teachers.active} active`}
            trend={analyticsData.teachers.trend}
            trendLabel="active rate"
            onClick={() => openDetailedView('teachers', 'Teachers', analyticsData.teachers.data, columnDefs.teachers)}
          />
          <StatsCard
            label="Attendance Rate"
            value={`${analyticsData.attendance.rate}%`}
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            subtitle={`${analyticsData.attendance.today} present today`}
            trend={analyticsData.attendance.trend}
            trendLabel="vs avg"
            onClick={() => openDetailedView('attendance', 'Attendance', analyticsData.attendance.data, columnDefs.attendance)}
          />
          <StatsCard
            label="Revenue"
            value={formatCurrency(analyticsData.revenue.total)}
            icon={DollarSign}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            subtitle={formatCurrency(analyticsData.revenue.thisMonth) + " this month"}
            trend={analyticsData.revenue.trend}
            trendLabel="monthly"
            onClick={() => openDetailedView('revenue', 'Revenue', analyticsData.revenue.data, columnDefs.revenue)}
          />
        </div>

        {/* ─── Stats Row 2: Academic Metrics ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Exams"
            value={analyticsData.exams.total}
            icon={GraduationCap}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            subtitle={`${analyticsData.exams.upcoming} upcoming, ${analyticsData.exams.completed} completed`}
            onClick={() => openDetailedView('exams', 'Exams', analyticsData.exams.data, columnDefs.exams)}
          />
          <StatsCard
            label="Assignments"
            value={analyticsData.assignments.total}
            icon={FileText}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            subtitle={`${analyticsData.assignments.pending} pending, ${analyticsData.assignments.submitted} submitted`}
            onClick={() => openDetailedView('assignments', 'Assignments', analyticsData.assignments.data, columnDefs.assignments)}
          />
          <StatsCard
            label="Events"
            value={analyticsData.events.total}
            icon={Calendar}
            iconBg="bg-pink-50"
            iconColor="text-pink-600"
            subtitle={`${analyticsData.events.upcoming} upcoming, ${analyticsData.events.completed} completed`}
            onClick={() => openDetailedView('events', 'Events', analyticsData.events.data, columnDefs.events)}
          />
          <StatsCard
            label="Expenses"
            value={formatCurrency(analyticsData.expenses.total)}
            icon={Activity}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
            subtitle={formatCurrency(analyticsData.expenses.thisMonth) + " this month"}
            trend={analyticsData.expenses.trend}
            trendLabel="spending"
            onClick={() => openDetailedView('expenses', 'Expenses', analyticsData.expenses.data, columnDefs.expenses)}
          />
        </div>

        {/* ─── Stats Row 3: Communication Metrics ────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            label="Messages"
            value={analyticsData.messages.total}
            icon={MessageSquare}
            iconBg="bg-cyan-50"
            iconColor="text-cyan-600"
            subtitle={`${analyticsData.messages.unread} unread`}
            onClick={() => openDetailedView('messages', 'Messages', analyticsData.messages.data, columnDefs.messages)}
          />
          <StatsCard
            label="Notifications"
            value={analyticsData.notifications.total}
            icon={Bell}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
            subtitle={`${analyticsData.notifications.unread} unread`}
            onClick={() => openDetailedView('notifications', 'Notifications', analyticsData.notifications.data, columnDefs.notifications)}
          />
          <StatsCard
            label="Net Revenue"
            value={formatCurrency(analyticsData.revenue.total - analyticsData.expenses.total)}
            icon={TrendingUp}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            subtitle="Revenue - Expenses"
          />
          <StatsCard
            label="Student-Teacher Ratio"
            value={analyticsData.teachers.total > 0 ? (analyticsData.students.total / analyticsData.teachers.total).toFixed(1) : "N/A"}
            icon={Users}
            iconBg="bg-gray-50"
            iconColor="text-gray-600"
            subtitle={`${analyticsData.students.total} : ${analyticsData.teachers.total}`}
          />
        </div>

        {/* ─── Coming Soon: Detailed Analytics ───────────────────────────── */}
        <Card className="p-8 text-center border-2 border-dashed border-gray-200 hover:border-blue-300 transition-all group cursor-pointer">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Detailed Analytics Dashboard</h3>
            <p className="text-gray-500 mt-2 max-w-md">
              Interactive charts and detailed reports are coming soon. 
              Stay tuned for real-time analytics visualizations.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <PieChart className="w-3.5 h-3.5 inline mr-1" /> Charts
              </Badge>
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                <FileText className="w-3.5 h-3.5 inline mr-1" /> Reports
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                <Download className="w-3.5 h-3.5 inline mr-1" /> Export
              </Badge>
            </div>
          </div>
        </Card>

        {/* ─── Detailed View Modal ───────────────────────────────────────── */}
        <DetailedViewModal
          isOpen={detailedView.isOpen}
          onClose={() => setDetailedView({ ...detailedView, isOpen: false })}
          title={detailedView.title}
          data={detailedView.data}
          columns={detailedView.columns}
          type={detailedView.type}
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

export default Analytics;