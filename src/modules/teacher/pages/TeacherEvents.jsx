// src/modules/teacher/pages/TeacherEvents.jsx

/**
 * ============================================
 * TEACHER EVENTS - COMPLETE (UPDATED WITH API NAME FIELDS)
 * ============================================
 * 
 * Purpose: View and manage events
 * Used by: Teacher module routes
 * 
 * Features:
 * - View events list
 * - Register for events
 * - Event statistics
 * - Filter by type and status
 * - Search events
 * - View event details
 * - Responsive design
 * - Full screen visibility
 * - GSAP animations
 * - Toast notifications
 * - NO MOCK DATA - All data from API
 * - Uses common PageHeader component
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/events/events/ - Get events
 * - POST /api/events/event-participation/ - Register for event
 * - GET /api/events/event-participation/ - Get participations
 * 
 * USAGE OF NEW API FIELDS:
 * - organizer_name instead of organizer (nullable)
 * - event_name available in event-participation responses
 * - student_name available in event-participation responses
 * 
 * Usage:
 * <Route path="/teacher/events" element={<TeacherEvents />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  User,
  Plus,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  Grid,
  List,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  Sparkles,
  Zap,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchEvents,
  fetchEventParticipations,
  createEventParticipation,
} from "../store/teacherThunks";

import {
  selectTeacherEvents,
  selectTeacherEventParticipations,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
} from "../store/teacherSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const EVENT_TYPES = {
  sports: { label: "Sports", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  academic: { label: "Academic", color: "bg-blue-100 text-blue-700 border-blue-200" },
  cultural: { label: "Cultural", color: "bg-purple-100 text-purple-700 border-purple-200" },
  workshop: { label: "Workshop", color: "bg-amber-100 text-amber-700 border-amber-200" },
  seminar: { label: "Seminar", color: "bg-rose-100 text-rose-700 border-rose-200" },
  other: { label: "Other", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

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

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getTypeBadge = (type) => {
  const config = EVENT_TYPES[type] || EVENT_TYPES.other;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
};

const getStatusBadge = (eventDate) => {
  const isUpcoming = new Date(eventDate) >= new Date();
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isUpcoming ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
    }`}>
      {isUpcoming ? 'Upcoming' : 'Past'}
    </span>
  );
};

const isUpcoming = (eventDate) => {
  return new Date(eventDate) >= new Date();
};

const getDaysRemaining = (eventDate) => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffTime = event - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading, trend }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
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
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(trend)}% from last month
        </div>
      )}
    </motion.div>
  );
};

// ─── Event Detail Modal ────────────────────────────────────────────────

const EventDetailModal = ({ isOpen, event, onClose, onRegister, loading, isRegistered }) => {
  if (!isOpen || !event) return null;

  // ✅ Use new API field: organizer_name (nullable)
  const organizerName = event.organizer_name || event.organizer || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Event Details</p>
                <h3 className="text-base sm:text-lg font-bold">{event.name}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getTypeBadge(event.event_type)}
            {getStatusBadge(event.event_date)}
            {isRegistered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-100 text-emerald-700 border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                Registered
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm text-gray-800">{event.location || "Location TBD"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm text-gray-800">{formatDateTime(event.event_date)}</p>
                {isUpcoming(event.event_date) && (
                  <p className="text-xs text-emerald-600">
                    {getDaysRemaining(event.event_date)} days remaining
                  </p>
                )}
              </div>
            </div>
            {event.max_participants && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm text-gray-800">Max {event.max_participants} participants</p>
                </div>
              </div>
            )}
            {organizerName && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Organized By</p>
                  <p className="text-sm text-gray-800">{organizerName}</p>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm leading-relaxed">
                {event.description}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
          >
            Close
          </button>
          {isUpcoming(event.event_date) && !isRegistered && (
            <button
              onClick={() => onRegister(event.id)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Register for Event
                </>
              )}
            </button>
          )}
          {isRegistered && (
            <button className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-center gap-2 w-full sm:w-auto">
              <CheckCircle className="w-4 h-4" />
              Already Registered
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherEvents() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);

  // ─── Redux State ──────────────────────────────────────────────────────
  const events = useSelector(selectTeacherEvents);
  const participations = useSelector(selectTeacherEventParticipations);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [registering, setRegistering] = useState(false);

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
      console.log('📊 Fetching events data...');
      
      await Promise.all([
        dispatch(fetchEvents()),
        dispatch(fetchEventParticipations()),
      ]);
      
      setDataFetched(true);
      console.log('✅ All events data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load events. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Log data when it changes ──────────────────────────────────────

  useEffect(() => {
    console.log('📊 Events loaded:', events?.length || 0);
    console.log('📊 Participations loaded:', participations?.length || 0);
  }, [events, participations]);

  // ─── GSAP Animations ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Computed Values ─────────────────────────────────────────────────

  const filteredEvents = useMemo(() => {
    let filtered = Array.isArray(events) ? [...events] : [];
    
    console.log('📊 Filtering events - raw count:', filtered.length);

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.name || "").toLowerCase().includes(search) ||
        (e.description || "").toLowerCase().includes(search) ||
        (e.location || "").toLowerCase().includes(search) ||
        // ✅ Search also in organizer_name
        (e.organizer_name || e.organizer || "").toLowerCase().includes(search)
      );
    }
    
    if (filterType !== "all") {
      filtered = filtered.filter(e => e.event_type === filterType);
    }
    
    if (filterStatus === "upcoming") {
      filtered = filtered.filter(e => new Date(e.event_date) >= new Date());
    } else if (filterStatus === "past") {
      filtered = filtered.filter(e => new Date(e.event_date) < new Date());
    }

    console.log('📊 Filtered events count:', filtered.length);
    return filtered;
  }, [events, searchTerm, filterType, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const eventsArray = Array.isArray(events) ? events : [];
    const participationsArray = Array.isArray(participations) ? participations : [];
    const now = new Date();
    
    return {
      total: eventsArray.length,
      upcoming: eventsArray.filter(e => new Date(e.event_date) >= now).length,
      past: eventsArray.filter(e => new Date(e.event_date) < now).length,
      registered: participationsArray.length,
    };
  }, [events, participations]);

  const isRegistered = (eventId) => {
    return Array.isArray(participations) && participations.some(p => {
      const event = p.event || p.event_id;
      return String(event) === String(eventId);
    });
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const handleRegister = async (eventId) => {
    setRegistering(true);
    try {
      await dispatch(createEventParticipation({ event: eventId })).unwrap();
      toast.success("Successfully registered for the event!");
      await fetchAllData();
      setIsDetailOpen(false);
    } catch (err) {
      toast.error(err || "Failed to register for event");
    } finally {
      setRegistering(false);
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
    setFilterType("all");
    setFilterStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Events"
        subtitle="View and manage events"
        breadcrumbs={["Teacher", "Events"]}
        bgColor="bg-purple-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all disabled:opacity-50"
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Events"
          value={stats.total}
          icon={Calendar}
          color="indigo"
          isLoading={loading}
        />
        <StatCard
          title="Upcoming"
          value={stats.upcoming}
          icon={Sparkles}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Past"
          value={stats.past}
          icon={Clock}
          color="gray"
          isLoading={loading}
        />
        <StatCard
          title="Registered"
          value={stats.registered}
          icon={CheckCircle}
          color="purple"
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
                placeholder="Search events by name, location, organizer, or description..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  {(filterType !== "all" ? 1 : 0) + (filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
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
                  {/* Type Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterType("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterType === "all"
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {Object.keys(EVENT_TYPES).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterType === type
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "all"
                            ? "bg-purple-50 text-purple-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterStatus("upcoming")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "upcoming"
                            ? "bg-emerald-50 text-emerald-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Upcoming
                      </button>
                      <button
                        onClick={() => setFilterStatus("past")}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                          filterStatus === "past"
                            ? "bg-gray-100 text-gray-600 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Past
                      </button>
                    </div>
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
      {filteredEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-5 border border-purple-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Events Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredEvents.length} events • 
                  <span className="text-emerald-600 ml-1">{stats.upcoming} upcoming</span> •
                  <span className="text-gray-500 ml-1">{stats.past} past</span> •
                  <span className="text-purple-600 ml-1">{stats.registered} registered</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                {filteredEvents.length} Total
              </span>
              {filterType !== "all" && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full capitalize">
                  {filterType}
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                  {filterStatus}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Events List ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching events found" : "No events available"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "There are no events available at the moment. Check back later for updates."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "card" ? (
        // ─── Card View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((event) => {
            const registered = isRegistered(event.id);
            const upcoming = isUpcoming(event.event_date);
            // ✅ Use new API field: organizer_name (nullable)
            const organizerName = event.organizer_name || event.organizer || null;
            
            return (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {event.name}
                        </h4>
                        {getTypeBadge(event.event_type)}
                      </div>
                    </div>
                    {getStatusBadge(event.event_date)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{event.location || "Location TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    {organizerName && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{organizerName}</span>
                      </div>
                    )}
                    {upcoming && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{getDaysRemaining(event.event_date)} days remaining</span>
                      </div>
                    )}
                    {event.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{event.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    {upcoming && !registered && (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={registering}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Register
                      </button>
                    )}
                    {registered && (
                      <span className="flex-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg flex items-center justify-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Registered
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // ─── Table View ──────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((event) => {
                  const registered = isRegistered(event.id);
                  const upcoming = isUpcoming(event.event_date);
                  // ✅ Use new API field: organizer_name (nullable)
                  const organizerName = event.organizer_name || event.organizer || null;
                  
                  return (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{event.name}</p>
                          {organizerName && (
                            <p className="text-xs text-gray-500">Organizer: {organizerName}</p>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {getTypeBadge(event.event_type)}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{event.location || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{formatDate(event.event_date)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(event.event_date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(event)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {upcoming && !registered && (
                            <button
                              onClick={() => handleRegister(event.id)}
                              disabled={registering}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Register"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          {registered && (
                            <span className="text-emerald-600" title="Registered">
                              <CheckCircle className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredEvents.length} events • 
              <span className="text-emerald-600 ml-1">{stats.upcoming} upcoming</span> •
              <span className="text-gray-500 ml-1">{stats.past} past</span>
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
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredEvents.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
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
                      ? 'bg-purple-600 text-white'
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
        <p>© 2024 Smart School Management System • Events Module</p>
        <p className="mt-1">
          {filteredEvents.length} events • 
          {filterType !== "all" ? ` Filtered by: ${filterType}` : " All types"}
          {filterStatus !== "all" ? ` • ${filterStatus}` : ""}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Event Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedEvent && (
          <EventDetailModal
            isOpen={isDetailOpen}
            event={selectedEvent}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedEvent(null);
            }}
            onRegister={handleRegister}
            loading={registering}
            isRegistered={isRegistered(selectedEvent.id)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}