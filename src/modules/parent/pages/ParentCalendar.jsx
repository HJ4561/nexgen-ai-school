/**
 * ============================================
 * PARENT CALENDAR COMPONENT
 * ============================================
 * 
 * Purpose: View school calendar and events
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Month/year navigation
 * - Calendar view with events
 * - Event types color coding
 * - Event details on click
 * - Filter by event type
 * - Upcoming events list
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/events/events/ - Get events
 * - GET /api/ptm/ptm/ - Get PTM events
 * 
 * Usage:
 * <Route path="/parent/calendar" element={<ParentCalendar />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Users,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Filter,
  List,
  Grid,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations/index.jsx";

import {
  fetchEvents,
} from "@/modules/parent/store/parentThunks";

import {
  selectEvents,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

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

const formatTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const EVENT_COLORS = {
  sports: "bg-emerald-100 border-emerald-500 text-emerald-700",
  academic: "bg-blue-100 border-blue-500 text-blue-700",
  cultural: "bg-purple-100 border-purple-500 text-purple-700",
  workshop: "bg-amber-100 border-amber-500 text-amber-700",
  seminar: "bg-rose-100 border-rose-500 text-rose-700",
  ptm: "bg-indigo-100 border-indigo-500 text-indigo-700",
  holiday: "bg-red-100 border-red-500 text-red-700",
  other: "bg-gray-100 border-gray-500 text-gray-700",
};

const getEventColor = (type) => {
  return EVENT_COLORS[type] || EVENT_COLORS.other;
};

// ─── Event Detail Modal ────────────────────────────────────────────────

const EventDetailModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white rounded-t-xl sm:rounded-t-2xl border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Event Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{event.name || event.event_name}</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={`${getEventColor(event.event_type || event.type)} text-xs`}>
                {event.event_type || event.type || "Event"}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="text-sm text-gray-800">
                  {formatDate(event.event_date || event.date)}
                  {event.start_time && ` at ${formatTime(event.start_time)}`}
                </p>
              </div>
            </div>
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-800">{event.location}</p>
                </div>
              </div>
            )}
            {event.max_participants && (
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-sm text-gray-800">Max {event.max_participants} participants</p>
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

const ParentCalendar = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const events = useSelector(selectEvents);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  // ─── Calendar Helpers ────────────────────────────────────────────────
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDate = (date) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return events.filter(e => {
      const eventDate = e.event_date || e.date;
      return eventDate && eventDate.startsWith(dateStr);
    });
  };

  // ─── Navigation ──────────────────────────────────────────────────────
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    if (filterType === "all") return events;
    return events.filter(e => (e.event_type || e.type) === filterType);
  }, [events, filterType]);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Calendar" subtitle="View school calendar" breadcrumbs={["Parent", "Calendar"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Calendar"
          subtitle="View school calendar and events"
          breadcrumbs={["Parent", "Calendar"]}
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading calendar</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Controls */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth} className="min-h-[32px] sm:min-h-[36px]">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 min-w-[140px] text-center">
              {new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
            </h3>
            <Button variant="outline" size="sm" onClick={nextMonth} className="min-h-[32px] sm:min-h-[36px]">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday} className="min-h-[32px] sm:min-h-[36px]">
              Today
            </Button>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("month")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "month" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <Grid className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[30px]"
          >
            <option value="all">All Events</option>
            <option value="sports">Sports</option>
            <option value="academic">Academic</option>
            <option value="cultural">Cultural</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="ptm">PTM</option>
            <option value="holiday">Holiday</option>
          </select>
        </div>
      </Card>

      {/* Calendar Grid */}
      {viewMode === "month" ? (
        <Card className="p-3 sm:p-4 border border-gray-100">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1.5 sm:py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: getFirstDayOfMonth(month, year) }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDate(day);
              const isToday = new Date().getDate() === day && 
                            new Date().getMonth() === month && 
                            new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`aspect-square p-1 sm:p-1.5 rounded-lg border transition-colors ${
                    isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <span className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    <div className="flex-1 space-y-0.5 mt-0.5 overflow-y-auto max-h-[60px] sm:max-h-[80px]">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEventModalOpen(true);
                          }}
                          className={`text-[8px] sm:text-[10px] px-1 rounded truncate cursor-pointer ${getEventColor(event.event_type || event.type)}`}
                        >
                          {event.name || event.event_name}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] sm:text-[10px] text-gray-500 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        // List View
        <Card className="p-0 overflow-hidden border border-gray-100">
          <div className="divide-y divide-gray-100">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events found</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsEventModalOpen(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getEventColor(event.event_type || event.type)}`} />
                        <h4 className="text-sm font-medium text-gray-800">{event.name || event.event_name}</h4>
                        <Badge className={`${getEventColor(event.event_type || event.type)} text-[10px]`}>
                          {event.event_type || event.type || "Event"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.event_date || event.date)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="min-h-[28px]">
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
};

export default ParentCalendar;