// src/modules/teacher/pages/TeacherPTM.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Handshake,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Grid,
  List,
  AlertCircle,
  RefreshCw,
  Loader2,
  MapPin,
  Save,
  UserCheck,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchPTM,
  updatePTMMeeting,
} from "../store/teacherThunks";

import {
  selectTeacherPTM,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  try {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timeString;
  }
};

const getStatusBadge = (status) => {
  const statusMap = {
    scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    pending: { label: "Pending", color: "bg-purple-100 text-purple-700 border-purple-200", icon: Clock },
  };
  const config = statusMap[status] || statusMap.scheduled;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const getStatusColor = (status) => {
  const map = {
    scheduled: "border-l-blue-500",
    completed: "border-l-emerald-500",
    cancelled: "border-l-red-500",
    in_progress: "border-l-amber-500",
    pending: "border-l-purple-500",
  };
  return map[status] || "border-l-gray-500";
};

const getRandomColor = (id) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-pink-100 text-pink-700",
  ];
  return colors[id % colors.length] || colors[0];
};

const getInitials = (name) => {
  if (!name) return "S";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
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
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
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

// ─── Meeting Detail Modal ──────────────────────────────────────────────

const MeetingDetailModal = ({ isOpen, meeting, onClose, onUpdate, loading }) => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [parentFeedback, setParentFeedback] = useState("");
  const [actionPlan, setActionPlan] = useState("");

  useEffect(() => {
    if (meeting) {
      // Try different possible field names
      setStatus(meeting.status || meeting.meeting_status || "scheduled");
      setNotes(meeting.notes || meeting.meeting_notes || "");
      setParentFeedback(meeting.parent_feedback || meeting.feedback || "");
      setActionPlan(meeting.action_plan || meeting.plan || "");
    }
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  // Extract names from nested objects or direct fields
  const studentName = meeting.student?.name || 
                      meeting.student_name || 
                      meeting.user?.name || 
                      meeting.full_name || 
                      "Student";

  const teacherName = meeting.teacher?.name || 
                      meeting.teacher_name || 
                      meeting.user?.name || 
                      "Teacher";

  const parentName = meeting.parent?.name || 
                     meeting.parent_name || 
                     meeting.parent_full_name || 
                     "Parent";

  const meetingDate = meeting.meeting_date || meeting.date || meeting.scheduled_date;
  const startTime = meeting.start_time || meeting.start || meeting.time_from;
  const endTime = meeting.end_time || meeting.end || meeting.time_to;
  const location = meeting.location || meeting.room || meeting.venue || meeting.place;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(meeting.id, { 
      status, 
      notes, 
      parent_feedback: parentFeedback, 
      action_plan: actionPlan 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Handshake className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">PTM Meeting Details</p>
                <h3 className="text-base sm:text-lg font-bold">{studentName}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-medium text-gray-800">{studentName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Teacher</p>
              <p className="text-sm font-medium text-gray-800">{teacherName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(meetingDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Time</p>
              <p className="text-sm font-medium text-gray-800">
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
            </div>
          </div>

          {location && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-800">{location}</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Add meeting notes..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Parent Feedback</label>
            <textarea
              value={parentFeedback}
              onChange={(e) => setParentFeedback(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Parent feedback..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Action Plan</label>
            <textarea
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Action plan for next steps..."
            />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Meeting
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherPTM() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const ptm = useSelector(selectTeacherPTM);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

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
      console.log('📊 Fetching PTM data...');
      await dispatch(fetchPTM());
      setDataFetched(true);
      console.log('✅ PTM data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load PTM data. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Get meetings from PTM data ──────────────────────────────────────

  const meetings = useMemo(() => {
    if (!ptm) return [];
    
    console.log('📊 Raw PTM data:', ptm);
    
    // If ptm is an array
    if (Array.isArray(ptm)) {
      // Check if each item has a meetings array
      if (ptm.length > 0 && ptm[0].meetings) {
        const allMeetings = ptm.flatMap(p => p.meetings || []);
        console.log('📊 Extracted meetings from nested structure:', allMeetings.length);
        return allMeetings;
      }
      // If ptm is already an array of meetings
      console.log('📊 PTM is already an array of meetings:', ptm.length);
      return ptm;
    }
    
    // If ptm has results property
    if (ptm.results && Array.isArray(ptm.results)) {
      console.log('📊 PTM has results array:', ptm.results.length);
      return ptm.results;
    }
    
    console.log('📊 No meetings found in PTM data');
    return [];
  }, [ptm]);

  // ─── Debug meetings structure ────────────────────────────────────────

  useEffect(() => {
    if (meetings.length > 0) {
      console.log('📊 Meetings data structure - first item:', meetings[0]);
      console.log('📊 All meetings:', meetings);
    }
  }, [meetings]);

  // ─── Computed Values ─────────────────────────────────────────────────

  const filteredMeetings = useMemo(() => {
    let filtered = Array.isArray(meetings) ? [...meetings] : [];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(m => {
        const studentName = m.student?.name || m.student_name || "";
        const parentName = m.parent?.name || m.parent_name || "";
        const notes = m.notes || m.meeting_notes || "";
        return studentName.toLowerCase().includes(search) ||
               parentName.toLowerCase().includes(search) ||
               notes.toLowerCase().includes(search);
      });
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(m => {
        const status = m.status || m.meeting_status || m.state || 'scheduled';
        return status === filterStatus;
      });
    }
    
    if (filterDate) {
      filtered = filtered.filter(m => {
        const date = m.meeting_date || m.date || m.scheduled_date;
        return date === filterDate;
      });
    }

    return filtered;
  }, [meetings, searchTerm, filterStatus, filterDate]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredMeetings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const meetingsArray = Array.isArray(meetings) ? meetings : [];
    
    console.log('📊 Calculating stats for meetings:', meetingsArray.length);
    
    // Helper to get status from various possible field names
    const getStatus = (meeting) => {
      return meeting.status || 
             meeting.meeting_status || 
             meeting.state || 
             meeting.meeting_state ||
             'scheduled';
    };
    
    const total = meetingsArray.length;
    const scheduled = meetingsArray.filter(m => getStatus(m) === 'scheduled' || getStatus(m) === 'pending').length;
    const completed = meetingsArray.filter(m => getStatus(m) === 'completed' || getStatus(m) === 'done').length;
    const cancelled = meetingsArray.filter(m => getStatus(m) === 'cancelled' || getStatus(m) === 'canceled').length;
    const inProgress = meetingsArray.filter(m => getStatus(m) === 'in_progress' || getStatus(m) === 'ongoing').length;

    // Count attendees - check various possible field names
    const attendees = meetingsArray.filter(m => {
      return m.parent_attended === true || 
             m.attended === true || 
             m.is_attended === true ||
             m.parent_present === true;
    }).length;

    console.log('📊 Stats calculated:', { total, scheduled, completed, cancelled, inProgress, attendees });

    return {
      total,
      scheduled,
      completed,
      cancelled,
      inProgress,
      attendees,
    };
  }, [meetings]);

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterDate;

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewMeeting = (meeting) => {
    console.log('📊 Viewing meeting:', meeting);
    setSelectedMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleUpdateMeeting = async (id, data) => {
    try {
      await dispatch(updatePTMMeeting({ id, data })).unwrap();
      toast.success("Meeting updated successfully!");
      setIsModalOpen(false);
      setSelectedMeeting(null);
      await fetchAllData();
    } catch (err) {
      toast.error(err || "Failed to update meeting");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDate("");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && meetings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading PTM data...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="PTM"
        subtitle="Manage Parent-Teacher Meetings"
        breadcrumbs={["Teacher", "PTM"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
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

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Meetings"
          value={stats.total}
          icon={Handshake}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Clock}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={UserCheck}
          color="purple"
          isLoading={loading}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Attendees"
          value={stats.attendees}
          icon={Users}
          color="indigo"
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
                placeholder="Search by student or parent name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
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
                  {(filterStatus !== "all" ? 1 : 0) + (filterDate ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "scheduled", "in_progress", "completed", "cancelled"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === "all" ? "All" : status.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    {filterDate && (
                      <button
                        onClick={() => setFilterDate("")}
                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                      >
                        Clear date
                      </button>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
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
      {filteredMeetings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-5 border border-indigo-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <Handshake className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">PTM Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredMeetings.length} meetings • 
                  <span className="text-amber-600 ml-1">{stats.scheduled} scheduled</span> •
                  <span className="text-purple-600 ml-1">{stats.inProgress} in progress</span> •
                  <span className="text-emerald-600 ml-1">{stats.completed} completed</span> •
                  <span className="text-indigo-600 ml-1">{stats.attendees} attendees</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-medium rounded-full">
                {filteredMeetings.length} Total
              </span>
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {filterStatus.replace("_", " ")}
                </span>
              )}
              {filterDate && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  {formatDate(filterDate)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Meetings List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Handshake className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching meetings found" : "No PTM meetings available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "There are no PTM meetings scheduled at the moment."}
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
      ) : viewMode === "card" ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((meeting) => {
            const status = meeting.status || meeting.meeting_status || 'scheduled';
            const statusColor = getStatusColor(status);
            const studentName = meeting.student?.name || meeting.student_name || "Unknown";
            const parentName = meeting.parent?.name || meeting.parent_name || "No parent";
            const colorClass = getRandomColor(meeting.id || 0);
            const meetingDate = meeting.meeting_date || meeting.date || meeting.scheduled_date;
            const startTime = meeting.start_time || meeting.start || meeting.time_from;
            const endTime = meeting.end_time || meeting.end || meeting.time_to;
            const location = meeting.location || meeting.room || meeting.venue;
            const notes = meeting.notes || meeting.meeting_notes;
            const parentFeedback = meeting.parent_feedback || meeting.feedback;
            
            return (
              <motion.div
                key={meeting.id || Math.random()}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border-l-4 ${statusColor} border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${colorClass}`}>
                        {getInitials(studentName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {studentName}
                        </h4>
                        <p className="text-xs text-gray-500">{parentName}</p>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(meetingDate)}</span>
                      <span className="text-gray-300">|</span>
                      <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                    </div>
                    {location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{location}</span>
                      </div>
                    )}
                    {notes && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{notes}</p>
                    )}
                    {parentFeedback && (
                      <div className="flex items-start gap-2 text-xs text-gray-500 mt-1">
                        <span className="text-gray-400">💬</span>
                        <span className="line-clamp-1 text-gray-600">"{parentFeedback}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewMeeting(meeting)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View & Manage
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Parent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date & Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((meeting) => {
                  const status = meeting.status || meeting.meeting_status || 'scheduled';
                  const studentName = meeting.student?.name || meeting.student_name || "Unknown";
                  const parentName = meeting.parent?.name || meeting.parent_name || "—";
                  const meetingDate = meeting.meeting_date || meeting.date || meeting.scheduled_date;
                  const startTime = meeting.start_time || meeting.start || meeting.time_from;
                  const endTime = meeting.end_time || meeting.end || meeting.time_to;
                  
                  return (
                    <tr key={meeting.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getRandomColor(meeting.id || 0)}`}>
                            {getInitials(studentName)}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{parentName}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">
                          {formatDate(meetingDate)}<br />
                          <span className="text-xs text-gray-400">{formatTime(startTime)} - {formatTime(endTime)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewMeeting(meeting)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                          title="View & Manage"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredMeetings.length} meetings • 
              <span className="text-amber-600 ml-1">{stats.scheduled} scheduled</span> •
              <span className="text-emerald-600 ml-1">{stats.completed} completed</span> •
              <span className="text-indigo-600 ml-1">{stats.attendees} attendees</span>
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMeetings.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredMeetings.length)} of {filteredMeetings.length} meetings
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • PTM Module</p>
      </div>

      {/* ─── Meeting Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && selectedMeeting && (
          <MeetingDetailModal
            isOpen={isModalOpen}
            meeting={selectedMeeting}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedMeeting(null);
            }}
            onUpdate={handleUpdateMeeting}
            loading={submitting}
          />
        )}
      </AnimatePresence>

    </div>
  );
}