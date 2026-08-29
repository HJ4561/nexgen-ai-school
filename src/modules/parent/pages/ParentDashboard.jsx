// src/modules/parent/pages/ParentDashboard.jsx

/**
 * ============================================
 * PARENT DASHBOARD - COMPLETE
 * ============================================
 * 
 * Purpose: Main dashboard for parent users
 * Used by: Parent module routes
 * 
 * USAGE OF NEW API FIELDS:
 * - user_name from parent profile (read-only)
 * - student_name from parent links (read-only)
 * - class_name from student data (read-only)
 * - teacher_name from behavior logs (read-only)
 * - sender_name from notifications (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Calendar, DollarSign, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  X, User, School, GraduationCap, Award, Wallet,
  Eye, ChevronRight, Sparkles, Bell, MessageSquare,
  RefreshCw, Activity, Clock, Star, Zap,
  ShieldCheck, Crown, Medal, Trophy, BarChart3,
  PieChart, Target, Home, Bus, Library, Coffee,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Thunks ──────────────────────────────────────────────────────────
import {
  fetchProfile,
  fetchParentLinks,
  fetchStudentById,
  fetchAttendance,
  fetchAttendanceStats,
  fetchResults,
  fetchGradeSummary,
  fetchEvents,
  fetchEventParticipations,
  fetchFees,
  fetchFeeSummary,
  fetchNotifications,
  fetchBehaviorLogs,
} from "@/modules/parent/store/parentThunks";

// ─── Selectors ──────────────────────────────────────────────────────
import {
  selectParentProfile,
  selectParentLinks,
  selectSelectedChild,
  selectAttendanceStats,
  selectGradeSummary,
  selectUpcomingEvents,
  selectFeeSummary,
  selectParentLoading,
  selectParentError,
  selectUnreadCount,
  selectBehaviorStats,
} from "@/modules/parent/store/parentSlice";

// ─── Actions ──────────────────────────────────────────────────────
import { setSelectedChild } from "@/modules/parent/store/parentSlice";

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

// ─── Child Selector Component ─────────────────────────────────────────

const ChildSelector = ({ children, selectedChild, onSelect, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="animate-pulse h-5 w-5 rounded bg-gray-200" />
          <div className="animate-pulse h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <p className="text-sm">No children linked to your account</p>
        </div>
      </div>
    );
  }

  // ✅ Get student_name from API
  const getChildName = (child) => {
    return child.student_name || child.student?.name || `Child ${child.id}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Select Child</p>
            <p className="text-xs text-gray-500">Choose a child to view dashboard</p>
          </div>
        </div>
        
        <div className="flex-1 sm:max-w-xs relative">
          <select
            value={selectedChild || ""}
            onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm pr-10"
          >
            <option value="">All Children</option>
            {children.map((child) => (
              <option key={child.id} value={child.student || child.id}>
                {getChildName(child)}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="hidden sm:inline">•</span>
          <span>{children.length} child{children.length > 1 ? 'ren' : ''}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard Stats Component ─────────────────────────────────────────

const DashboardStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Children",
      value: stats.totalChildren,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
      borderColor: "border-indigo-500",
    },
    {
      label: "Attendance",
      value: `${stats.attendanceRate}%`,
      icon: Activity,
      color: "bg-emerald-50 text-emerald-600",
      borderColor: "border-emerald-500",
    },
    {
      label: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-500",
    },
    {
      label: "Pending Fees",
      value: `PKR ${stats.pendingFees.toLocaleString()}`,
      icon: Wallet,
      color: "bg-amber-50 text-amber-600",
      borderColor: "border-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2 }}
            className={`bg-white rounded-xl border-l-4 ${item.borderColor} p-4 shadow-sm hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {item.value}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// ─── Attendance Summary Card ──────────────────────────────────────────

const AttendanceSummaryCard = ({ stats }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Attendance</h3>
        </div>
        <button 
          onClick={() => navigate('/parent/attendance')}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">{stats.attendanceRate || 0}%</span>
          <span className="text-sm text-gray-500 mb-1">Attendance Rate</span>
        </div>
        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(stats.attendanceRate || 0, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats.totalDays || 0} total days, {stats.presentDays || 0} present
        </p>
      </div>
    </motion.div>
  );
};

// ─── Grade Summary Card ──────────────────────────────────────────────

const GradeSummaryCard = ({ summary }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Grades</h3>
        </div>
        <button 
          onClick={() => navigate('/parent/grades')}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">{summary.average || 0}%</span>
          <span className="text-sm text-gray-500 mb-1">Average Grade</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.subjects?.slice(0, 3).map((subject, idx) => (
            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
              {subject.name}: {subject.grade || subject.marks}%
            </span>
          ))}
          {(summary.subjects?.length || 0) > 3 && (
            <span className="text-xs text-gray-400">+{summary.subjects.length - 3} more</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Active Events Card ──────────────────────────────────────────────

const ActiveEventsCard = ({ events }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Events</h3>
        </div>
        <button 
          onClick={() => navigate('/parent/events')}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="mt-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-gray-900">{events?.length || 0}</span>
          <span className="text-sm text-gray-500 mb-1">Upcoming Events</span>
        </div>
        <div className="mt-2 space-y-2">
          {events?.slice(0, 3).map((event, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate max-w-[150px]">
                {event.event_name || event.name || "Event"}
              </span>
              <span className="text-xs text-gray-500">
                {event.event_date ? new Date(event.event_date).toLocaleDateString() : "TBD"}
              </span>
            </div>
          ))}
          {(!events || events.length === 0) && (
            <p className="text-sm text-gray-400">No upcoming events</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

const ParentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Redux State ────────────────────────────────────────────────────
  const profile = useSelector(selectParentProfile);
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const attendanceStats = useSelector(selectAttendanceStats);
  const gradeSummary = useSelector(selectGradeSummary);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const feeSummary = useSelector(selectFeeSummary);
  const unreadCount = useSelector(selectUnreadCount);
  const behaviorStats = useSelector(selectBehaviorStats);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ─────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── GSAP Refs ───────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const bannerRef = useRef(null);
  const greetingRef = useRef(null);
  const waveRef = useRef(null);
  const subtitleRef = useRef(null);
  const animationRef = useRef(null);
  const selectorRef = useRef(null);
  const statsRef = useRef(null);
  const cardsRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────
  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchProfile()).unwrap(),
        dispatch(fetchParentLinks()).unwrap(),
        dispatch(fetchAttendance()).unwrap(),
        dispatch(fetchAttendanceStats({})).unwrap(),
        dispatch(fetchResults()).unwrap(),
        dispatch(fetchGradeSummary({})).unwrap(),
        dispatch(fetchEvents()).unwrap(),
        dispatch(fetchEventParticipations()).unwrap(),
        dispatch(fetchFees()).unwrap(),
        dispatch(fetchFeeSummary({})).unwrap(),
        dispatch(fetchNotifications()).unwrap(),
        dispatch(fetchBehaviorLogs()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading parent dashboard:", err);
      setToast({ message: "Failed to load dashboard data", type: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // ─── Load child details when selected ──────────────────────────────
  useEffect(() => {
    if (selectedChild) {
      dispatch(fetchStudentById(selectedChild));
    }
  }, [dispatch, selectedChild]);

  // ─── Refresh ──────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Dashboard refreshed", type: "info" });
  };

  // ─── Select Child ──────────────────────────────────────────────────
  const handleSelectChild = (childId) => {
    dispatch(setSelectedChild(childId));
  };

  // ─── Computed Values ─────────────────────────────────────────────────
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-PK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // ─── Get parent name from API ──────────────────────────────────────
  // ✅ user_name from profile
  const parentName = profile?.user_name || profile?.full_name || profile?.name || "Parent";
  const firstName = parentName.split(' ')[0] || "Parent";

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalChildren: children?.length || 0,
    attendanceRate: attendanceStats?.percentage || 0,
    pendingFees: feeSummary?.pending || 0,
    upcomingEvents: upcomingEvents?.length || 0,
    totalDays: attendanceStats?.total_days || attendanceStats?.total || 0,
    presentDays: attendanceStats?.present_days || attendanceStats?.present || 0,
  }), [children, attendanceStats, feeSummary, upcomingEvents]);

  // ─── Entrance Animations ─────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        bannerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        .fromTo(
          greetingRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.35"
        )
        .fromTo(
          waveRef.current,
          { opacity: 0, scale: 0, rotate: -30 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.5)" },
          "-=0.25"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        .fromTo(
          animationRef.current,
          { opacity: 0, scale: 0.7, rotate: 8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
          "-=0.6"
        )
        .fromTo(
          selectorRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.3"
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          cardsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );

      // Idle float animation on Lottie
      gsap.to(animationRef.current, {
        y: -8,
        duration: 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      // Wave wiggle animation
      gsap.to(waveRef.current, {
        rotate: 14,
        duration: 0.15,
        ease: "power1.inOut",
        repeat: 5,
        yoyo: true,
        repeatDelay: 3.5,
        delay: 1.5,
        transformOrigin: "70% 70%",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ─── Debug: Log API fields ──────────────────────────────────────────
  useEffect(() => {
    if (profile) {
      console.log("📊 Parent Profile - user_name:", profile.user_name);
    }
    if (children?.length > 0) {
      console.log("📊 Parent Links - student_name:", children[0]?.student_name);
    }
  }, [profile, children]);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <PageHeader 
          title="Dashboard" 
          subtitle="Welcome to your parent dashboard" 
          breadcrumbs={["Parent", "Dashboard"]}
          bgColor="bg-indigo-50"
        />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-100 border-t-indigo-600"></div>
          <p className="mt-6 text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 p-4 lg:p-6">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <PageHeader 
        title="Dashboard" 
        subtitle={`${greeting}, ${firstName}! Here's an overview of your children's progress.`}
        breadcrumbs={["Parent", "Dashboard"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
              <Users className="h-3.5 w-3.5" />
              {children.length} children
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

      {/* ─── Error Message ────────────────────────────────────────────── */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading dashboard</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header Banner ───────────────────────────────────────────────── */}
      <div
        ref={bannerRef}
        className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
      >
        <div className="flex flex-col lg:flex-row items-center gap-6 p-6 md:p-8">
          {/* Left Side */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <h1 ref={greetingRef} className="text-2xl md:text-3xl font-bold leading-tight">
                {greeting}, {firstName}! 👋
              </h1>
            </div>

            <p ref={subtitleRef} className="mt-2 text-sm text-white/90 max-w-xl mx-auto lg:mx-0">
              Here's an overview of your child's academic progress, attendance, grades, and upcoming school activities.
            </p>

            <div className="mt-4 inline-block rounded-xl bg-white/10 px-5 py-2 backdrop-blur">
              <p className="text-xs text-white/80">Today</p>
              <p className="text-sm font-semibold">{today}</p>
            </div>
          </div>

          {/* Right Animation */}
          <div
            ref={animationRef}
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 shrink-0"
          >
            <DotLottieReact
              src="/animations/register.lottie"
              autoplay
              loop
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* ─── Child Selector ────────────────────────────────────────────── */}
      <div ref={selectorRef} className="mt-6">
        <ChildSelector 
          children={children}
          selectedChild={selectedChild}
          onSelect={handleSelectChild}
          loading={loading}
        />
      </div>

      {/* ─── Dashboard Stats ────────────────────────────────────────────── */}
      <div ref={statsRef} className="mt-6">
        <DashboardStats stats={stats} loading={loading} />
      </div>

      {/* ─── Dashboard Cards ────────────────────────────────────────────── */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <AttendanceSummaryCard stats={stats} />
        <GradeSummaryCard summary={gradeSummary} />
        <ActiveEventsCard events={upcomingEvents} />
      </div>

      {/* ─── Quick Actions ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-gray-700">Quick Actions</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Users, label: 'Children', path: '/parent/children', color: 'indigo' },
            { icon: GraduationCap, label: 'Grades', path: '/parent/grades', color: 'purple' },
            { icon: Wallet, label: 'Fees', path: '/parent/fees', color: 'amber' },
            { icon: Activity, label: 'Attendance', path: '/parent/attendance', color: 'emerald' },
            { icon: MessageSquare, label: 'Messages', path: '/parent/messages', color: 'blue' },
            { icon: Bell, label: 'Notifications', path: '/parent/notifications', color: 'rose' },
          ].map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className={`flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 hover:bg-${action.color}-50 text-${action.color}-600 transition-all`}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center text-xs text-gray-400 py-4 border-t border-gray-200"
      >
        <p>© 2024 Smart School Management System • Parent Dashboard</p>
      </motion.div>
    </div>
  );
};

export default ParentDashboard;