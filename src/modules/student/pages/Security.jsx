// src/modules/student/pages/Security.jsx

/**
 * ============================================
 * STUDENT SECURITY & BEHAVIOR LOGS - COMPLETE
 * ============================================
 * 
 * Purpose: Displays student's behavior logs and security settings
 * Used by: Student module routes
 * 
 * Based on Postman Collection:
 * - GET /api/attendance/behavior-logs/ - List behavior logs
 * - GET /api/attendance/behavior-logs/{id}/ - Retrieve behavior log
 * - POST /api/auth/change-password/ - Change password
 * - POST /api/auth/logout-all/ - Logout from all devices
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from behavior logs (read-only)
 * - teacher_name from behavior logs (read-only)
 * - user_name from profile (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { gsap } from "gsap";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Eye,
  X,
  LogOut,
  User,
  Calendar,
  MessageSquare,
  Sparkles,
  Loader2,
  UserCircle,
  Mail,
  Key,
  Globe,
  Smartphone,
  Lock,
  History,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  BadgeCheck,
  Clock as ClockIcon,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/services/api";
import { fetchProfile } from "@/modules/student/store/studentThunks";
import { selectStudentProfile } from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getStudentName = (log) => {
  if (!log) return null;
  // ✅ 1. PRIORITY: Use student_name from API (new field!)
  if (log.student_name && log.student_name !== 'null') return log.student_name;
  // 2. FALLBACK: Use student object
  if (log.student) {
    if (typeof log.student === 'string') return log.student;
    if (log.student.name) return log.student.name;
    if (log.student.student_name) return log.student.student_name;
  }
  return null;
};

const getTeacherName = (log) => {
  if (!log) return null;
  // ✅ 1. PRIORITY: Use teacher_name from API (new field!)
  if (log.teacher_name && log.teacher_name !== 'null') return log.teacher_name;
  // 2. FALLBACK: Use teacher object
  if (log.teacher) {
    if (typeof log.teacher === 'string') return log.teacher;
    if (log.teacher.name) return log.teacher.name;
    if (log.teacher.teacher_name) return log.teacher.teacher_name;
  }
  return null;
};

const getUserName = (profile) => {
  if (!profile) return null;
  if (profile.user_name && profile.user_name !== 'null') return profile.user_name;
  if (profile.user) {
    if (typeof profile.user === 'string') return profile.user;
    if (profile.user.name) return profile.user.name;
    if (profile.user.user_name) return profile.user.user_name;
  }
  if (profile.name) return profile.name;
  return null;
};

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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${colors[type]} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
}

// ─── Premium Stat Card ─────────────────────────────────────────────────

function PremiumStatCard({ label, value, subtext, icon: Icon, color, delay }) {
  const colorMap = {
    student: { bg: "from-indigo-50 to-indigo-100/30", text: "text-indigo-600", ring: "ring-indigo-400/30" },
    emerald: { bg: "from-emerald-50 to-emerald-100/30", text: "text-emerald-600", ring: "ring-emerald-400/30" },
    amber: { bg: "from-amber-50 to-amber-100/30", text: "text-amber-600", ring: "ring-amber-400/30" },
    rose: { bg: "from-rose-50 to-rose-100/30", text: "text-rose-600", ring: "ring-rose-400/30" },
    blue: { bg: "from-blue-50 to-blue-100/30", text: "text-blue-600", ring: "ring-blue-400/30" },
    purple: { bg: "from-purple-50 to-purple-100/30", text: "text-purple-600", ring: "ring-purple-400/30" },
    cyan: { bg: "from-cyan-50 to-cyan-100/30", text: "text-cyan-600", ring: "ring-cyan-400/30" },
  };

  const c = colorMap[color] || colorMap.student;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border border-gray-100/60 p-5 transition-all duration-300 hover:shadow-xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.ring} ring-4 ${c.text} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Behavior Log Card ───────────────────────────────────────────────

function BehaviorLogCard({ log, index }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60));
      
      if (diff < 1) return "Just now";
      if (diff < 60) return `${diff} minutes ago`;
      if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getTypeConfig = (type) => {
    const map = {
      positive: { color: "bg-emerald-100 text-emerald-700", icon: ThumbsUp, label: "Positive" },
      negative: { color: "bg-rose-100 text-rose-700", icon: ThumbsDown, label: "Negative" },
      neutral: { color: "bg-gray-100 text-gray-700", icon: Minus, label: "Neutral" },
    };
    return map[type?.toLowerCase()] || map.neutral;
  };

  const getSeverityConfig = (severity) => {
    const map = {
      low: { color: "bg-blue-100 text-blue-700", label: "Low" },
      medium: { color: "bg-amber-100 text-amber-700", label: "Medium" },
      high: { color: "bg-rose-100 text-rose-700", label: "High" },
    };
    return map[severity?.toLowerCase()] || map.low;
  };

  const typeConfig = getTypeConfig(log.type);
  const TypeIcon = typeConfig.icon;
  const severityConfig = getSeverityConfig(log.severity);
  const teacherName = getTeacherName(log);
  const studentName = getStudentName(log);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300 hover:border-indigo-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityConfig.color}`}>
                {severityConfig.label}
              </span>
              {studentName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  <User className="h-3 w-3" />
                  {studentName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 mt-1.5 leading-relaxed">
              {log.description || "No description provided"}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-2">
              {teacherName && (
                <span className="flex items-center gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  {teacherName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(log.date || log.created_at)}
              </span>
              {log.action_taken && (
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {log.action_taken}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-2 self-start">
          <span className="text-[10px] font-medium text-gray-400">
            #{String(log.id || '').padStart(4, '0')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Password Change Modal ────────────────────────────────────────────

function PasswordChangeModal({ isOpen, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.new_password !== formData.confirm_password) {
      setErrors({ confirm_password: "Passwords do not match" });
      return;
    }

    if (formData.new_password.length < 8) {
      setErrors({ new_password: "Password must be at least 8 characters" });
      return;
    }

    await onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Key className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Change Password</h3>
                <p className="text-sm text-white/80">Keep your account secure</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border ${errors.current_password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePassword('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border ${errors.new_password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80`}
                placeholder="Enter new password (min 8 chars)"
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            {errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{errors.new_password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative mt-1.5">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border ${errors.confirm_password ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
            {errors.confirm_password && (
              <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────

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
      <h3 className="mt-5 text-xl font-semibold text-gray-800">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        {description}
      </p>
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

function Security() {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);

  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // ─── State ──────────────────────────────────────────────────────────
  const [behaviorLogs, setBehaviorLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);

  // ─── Fetch Data ──────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsResponse] = await Promise.all([
        api.get('/attendance/behavior-logs/'),
        dispatch(fetchProfile()).unwrap(),
      ]);
      
      const data = logsResponse.data?.results || logsResponse.data || [];
      setBehaviorLogs(data);
      
      // Debug: Check for new API fields
      if (data.length > 0) {
        console.log("📊 Behavior log fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
    } catch (err) {
      console.error('Failed to fetch behavior logs:', err);
      const msg = err.response?.data?.errors?.detail || 
                  err.response?.data?.message || 
                  'Failed to load behavior logs';
      setError(msg);
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      const statCards = document.querySelectorAll('.stat-card-animate');
      if (statCards.length) {
        tl.fromTo(statCards, 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = behaviorLogs?.length || 0;
    const positive = behaviorLogs?.filter((l) => l.type?.toLowerCase() === "positive").length || 0;
    const negative = behaviorLogs?.filter((l) => l.type?.toLowerCase() === "negative").length || 0;
    const neutral = behaviorLogs?.filter((l) => l.type?.toLowerCase() === "neutral").length || 0;

    return { total, positive, negative, neutral };
  }, [behaviorLogs]);

  // ─── Filter logs ──────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    if (!behaviorLogs) return [];
    
    let filtered = behaviorLogs.filter((log) => {
      const matchesType = filterType === "all" || log.type?.toLowerCase() === filterType.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        log.description?.toLowerCase().includes(searchLower) ||
        log.type?.toLowerCase().includes(searchLower) ||
        log.action_taken?.toLowerCase().includes(searchLower) ||
        getStudentName(log)?.toLowerCase().includes(searchLower) ||
        getTeacherName(log)?.toLowerCase().includes(searchLower);
      return matchesType && matchesSearch;
    });

    filtered.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

    return filtered;
  }, [behaviorLogs, filterType, searchTerm]);

  // ─── Handlers ──────────────────────────────────────────────────

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast({ message: "Behavior logs refreshed", type: "info" });
  };

  const handleChangePassword = async (data) => {
    setIsPasswordSubmitting(true);
    try {
      await api.post('/auth/change-password/', data);
      setToast({ message: "Password changed successfully!", type: "success" });
      setIsPasswordModalOpen(false);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      setToast({ message: msg, type: "error" });
      throw error;
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm("Are you sure you want to log out from all devices?")) {
      try {
        await api.post('/auth/logout-all/');
        setToast({ message: "Logged out from all devices", type: "success" });
      } catch (error) {
        setToast({ message: 'Failed to logout all devices', type: "error" });
      }
    }
  };

  // ─── Types for filter ──────────────────────────────────────────
  const typeOptions = useMemo(() => {
    const types = new Set();
    behaviorLogs?.forEach((log) => {
      if (log.type) types.add(log.type);
    });
    return Array.from(types);
  }, [behaviorLogs]);

  const userName = getUserName(profile);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading behavior logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Security & Behavior"
        subtitle="Monitor your behavior logs and account security"
        breadcrumbs={["Student", "Security"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {userName && (
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-lg text-sm font-medium text-indigo-700">
                <User className="h-4 w-4" />
                {userName}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              <Key className="h-4 w-4" />
              Change Password
            </button>
            <button
              onClick={handleLogoutAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout All
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Total Records"
            value={stats.total}
            subtext="All behavior records"
            icon={Shield}
            color="student"
            delay={0.05}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Positive"
            value={stats.positive}
            subtext="Good behavior"
            icon={ThumbsUp}
            color="emerald"
            delay={0.1}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Negative"
            value={stats.negative}
            subtext="Needs improvement"
            icon={ThumbsDown}
            color="rose"
            delay={0.15}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Neutral"
            value={stats.neutral}
            subtext="Miscellaneous"
            icon={Minus}
            color="cyan"
            delay={0.2}
          />
        </div>
      </div>

      {/* ─── Security Status Banner ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Your account is secure</p>
              <p className="text-xs text-gray-500">
                {stats.total === 0 
                  ? "No behavior records found." 
                  : `${stats.positive} positive, ${stats.negative} negative, and ${stats.neutral} neutral behavior records.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full">
              {stats.total} records
            </span>
            {stats.negative === 0 && stats.total > 0 && (
              <span className="px-3 py-1.5 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Clean Record
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Filters ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search behavior logs by description, type, or action..."
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showFilters || filterType !== "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Type
              {filterType !== "all" && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                    filterType === "all"
                      ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {typeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                      filterType === type
                        ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {filterType !== "all" && (
                  <button
                    onClick={() => setFilterType("all")}
                    className="px-3 py-1.5 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Behavior Logs ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Behavior Records</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {filteredLogs.length} of {behaviorLogs.length} records
            </p>
          </div>
          <span className="text-xs font-medium text-gray-400">
            {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <PremiumEmptyState
            icon={Shield}
            title={searchTerm ? "No matching records found" : "No behavior records"}
            description={
              searchTerm 
                ? `No records found matching "${searchTerm}". Try adjusting your search or clear the filter.`
                : "Your behavior records will appear here once they are logged by your teachers."
            }
            action={searchTerm ? { 
              label: "Clear Search", 
              onClick: () => setSearchTerm("")
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log, index) => (
              <BehaviorLogCard key={log.id} log={log} index={index} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Password Change Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <PasswordChangeModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            onSubmit={handleChangePassword}
            loading={isPasswordSubmitting}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Security & Behavior Module</p>
      </div>
    </div>
  );
}

export default Security;