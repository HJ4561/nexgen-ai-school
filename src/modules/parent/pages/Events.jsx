/**
 * ============================================
 * PARENT EVENTS COMPONENT
 * ============================================
 * 
 * Purpose: View and register for school events
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for filtering events by child
 * - Event statistics (total, upcoming, registered)
 * - Upcoming events list with registration
 * - Event details drawer
 * - Filter by event type
 * - Search by event name
 * - Pagination for events
 * - Responsive design
 * - GSAP animations
 * 
 * API Endpoints:
 * - GET /api/events/event-participation/ - Get event participations
 * - POST /api/events/event-participation/ - Register for event
 * - GET /api/events/events/ - Get event details
 * 
 * Usage:
 * <Route path="/parent/events" element={<Events />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  User,
  Plus,
  CalendarDays,
  Award,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchParentLinks,
  fetchEvents,
  createEventParticipation,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectEvents,
  selectUpcomingEvents,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const ITEMS_PER_PAGE = 6;

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

const getEventTypeBadge = (type) => {
  const colors = {
    sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
    academic: "bg-blue-50 text-blue-700 border-blue-200",
    cultural: "bg-purple-50 text-purple-700 border-purple-200",
    workshop: "bg-amber-50 text-amber-700 border-amber-200",
    seminar: "bg-rose-50 text-rose-700 border-rose-200",
    other: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return (
    <Badge className={`${colors[type] || colors.other} text-xs`}>
      {type?.charAt(0).toUpperCase() + type?.slice(1) || "Event"}
    </Badge>
  );
};

const getStatusBadge = (status) => {
  const config = {
    upcoming: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    ongoing: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    completed: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: XCircle },
    cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
  };
  const info = config[status] || config.upcoming;
  const Icon = info.icon;
  return (
    <Badge className={`${info.color} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Upcoming"}
    </Badge>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children }) => {
  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm pr-8 sm:pr-10 min-h-[36px] sm:min-h-[42px]"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Event Card ──────────────────────────────────────────────────────────

const EventCard = ({ event, onRegister, onView, loading }) => {
  const isUpcoming = event.status === "upcoming" || new Date(event.event_date) >= new Date();
  const isRegistered = event.is_participating || false;

  return (
    <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800">{event.event_name || event.name}</h4>
              {getEventTypeBadge(event.event_type || event.type)}
            </div>
          </div>
          {getStatusBadge(event.status || "upcoming")}
        </div>

        {/* Details */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location || "Location TBD"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(event.event_date || event.date)}</span>
          </div>
          {event.max_participants && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="w-3.5 h-3.5" />
              <span>Max {event.max_participants} participants</span>
            </div>
          )}
          {event.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
              {event.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(event)}
            className="flex-1 min-h-[32px]"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Details
          </Button>
          {isUpcoming && !isRegistered && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRegister(event)}
              disabled={loading}
              className="flex-1 min-h-[32px]"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Register
            </Button>
          )}
          {isRegistered && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex-1 justify-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

// ─── Event Detail Drawer ────────────────────────────────────────────────

const EventDetailDrawer = ({ isOpen, onClose, event, onRegister, loading }) => {
  if (!isOpen || !event) return null;

  const isUpcoming = event.status === "upcoming" || new Date(event.event_date) >= new Date();
  const isRegistered = event.is_participating || false;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Event Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{event.event_name || event.name}</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {getEventTypeBadge(event.event_type || event.type)}
              {getStatusBadge(event.status || "upcoming")}
            </div>
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
                <p className="text-sm text-gray-800">{formatDateTime(event.event_date || event.date)}</p>
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
            {event.organizer && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Organized By</p>
                  <p className="text-sm text-gray-800">{event.organizer}</p>
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

          {isUpcoming && !isRegistered && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onRegister(event)}
              disabled={loading}
              className="w-full min-h-[40px]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Register for Event
            </Button>
          )}
          {isRegistered && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">You are registered for this event</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full min-h-[36px] sm:min-h-[40px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const Events = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const events = useSelector(selectEvents);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchEvents());
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedChild) {
      filtered = filtered.filter(e => e.student === selectedChild || e.student_id === selectedChild);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        (e.event_name?.toLowerCase().includes(search) || e.name?.toLowerCase().includes(search)) ||
        (e.description?.toLowerCase().includes(search)) ||
        (e.location?.toLowerCase().includes(search))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(e => (e.event_type || e.type) === filterType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(e => (e.status) === filterStatus);
    }

    return filtered;
  }, [events, selectedChild, searchTerm, filterType, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: events.length,
    upcoming: upcomingEvents.length,
    registered: events.filter(e => e.is_participating).length,
  }), [events, upcomingEvents]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    // This would dispatch setSelectedChild
    setCurrentPage(1);
  };

  const handleRegister = async (event) => {
    setRegistering(true);
    try {
      await dispatch(createEventParticipation({
        event_id: event.id,
        student_id: selectedChild || event.student || event.student_id,
      })).unwrap();
      showToast("Successfully registered for event!", "success");
      dispatch(fetchEvents());
    } catch (error) {
      showToast(error || "Failed to register for event", "error");
    } finally {
      setRegistering(false);
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterType !== "all" || filterStatus !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Events" subtitle="View and register for school events" breadcrumbs={["Parent", "Events"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Events"
          subtitle="View and register for school events"
          breadcrumbs={["Parent", "Events"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
                />
              </div>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading events</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-3 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Events</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All events</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Available to register</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.registered}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Your participations</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Types</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Events Grid */}
      {pageItems.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <Calendar className="w-12 h-12 text-gray-300" />
            <p className="text-sm sm:text-base text-gray-500 font-medium">No events found</p>
            <p className="text-xs sm:text-sm text-gray-400">
              {hasActiveFilters || selectedChild ? 'Try adjusting your filters' : 'Check back later for upcoming events'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {pageItems.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              onView={handleViewDetails}
              loading={registering}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsShown={pageItems.length}
          totalItems={filteredEvents.length}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Event Detail Drawer */}
      <EventDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
        onRegister={handleRegister}
        loading={registering}
      />
    </div>
  );
};

export default Events;