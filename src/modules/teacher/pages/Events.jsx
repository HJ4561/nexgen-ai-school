/**
 * ============================================
 * TEACHER EVENTS COMPONENT
 * ============================================
 * 
 * Purpose: Displays school events and participations for teachers
 * Used by: Teacher module routes
 * 
 * Features:
 * - List of upcoming and past events
 * - Featured event highlight with countdown
 * - Filter by All/Upcoming/Past events
 * - Event details drawer with participant list
 * - Quick insights stats (upcoming/past counts)
 * - Upcoming events sidebar
 * - Export schedule functionality
 * - Responsive grid layout
 * 
 * Dependencies:
 * - lucide-react for icons
 * - @/components/layout/PageHeader for page header
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicators
 * - @/components/admin/Drawer for event details
 * - @/mocks/Teachermock for mock data
 * 
 * Usage:
 * <Route path="/teacher/events" element={<TeacherEvents />} />
 * ============================================
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  ChevronRight,
  Download,
  Filter,
  Search,
  CalendarDays,
  X,
} from 'lucide-react';

// ─── Reusable Components ──────────────────────────────────────────────────
import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

// ─── Mock Data ────────────────────────────────────────────────────────────
import { MOCK_EVENTS, MOCK_PARTICIPATIONS } from "@/mocks/Teachermock";

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FORMAT DATE
 * ============================================
 * 
 * Formats a date string to "MMM DD, YYYY" format
 * 
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * ============================================
 * FORMAT TIME
 * ============================================
 * 
 * Formats a date string to time (HH:MM AM/PM)
 * 
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted time (e.g., "09:00 AM")
 */
const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * ============================================
 * IS UPCOMING
 * ============================================
 * 
 * Checks if an event date is in the future
 * 
 * @param {string} dateStr - ISO date string
 * @returns {boolean} True if the event is upcoming
 */
const isUpcoming = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) >= new Date();
};

/**
 * ============================================
 * IS PAST
 * ============================================
 * 
 * Checks if an event date is in the past
 * 
 * @param {string} dateStr - ISO date string
 * @returns {boolean} True if the event is past
 */
const isPast = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

// ─── Event Detail Drawer ──────────────────────────────────────────────────

const EventDetailDrawer = ({ isOpen, onClose, event, participants }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 truncate">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
            <span className="truncate">{event.event_name || "Event Details"}</span>
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Event Date & Time */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Date & Time
            </label>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(event.event_date)} • {formatTime(event.event_date)}</span>
            </div>
          </div>

          {/* Event Venue */}
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Venue
            </label>
            <div className="flex items-center gap-2 text-sm sm:text-base text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{event.venue || "Location TBD"}</span>
            </div>
          </div>

          {/* Participants Section */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Participants ({participants.length})
            </label>
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants yet.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-purple-50/30 transition-colors gap-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.student_name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{p.role} {p.position && `• ${p.position}`}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 self-start sm:self-center">
                      {p.role || "Participant"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

/**
 * ============================================
 * TEACHER EVENTS COMPONENT
 * ============================================
 * 
 * Renders the teacher events page with filtering and details
 * 
 * @returns {JSX.Element} Teacher events page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/events" element={<TeacherEvents />} />
 * ============================================
 */
export default function TeacherEvents() {
  // ─── State Management ──────────────────────────────────────────────────

  /** Array of all events */
  const [events] = useState(MOCK_EVENTS);

  /** Array of event participations */
  const [participations] = useState(MOCK_PARTICIPATIONS);

  /** Current filter value: 'all' | 'upcoming' | 'past' */
  const [filter, setFilter] = useState('all');

  /** Currently selected event for the drawer */
  const [selectedEvent, setSelectedEvent] = useState(null);

  /** Controls the event details drawer visibility */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ─── Computed Data ─────────────────────────────────────────────────────

  /**
   * ============================================
   * FILTERED EVENTS
   * ============================================
   * 
   * Filters events based on the selected filter
   * Sorts events by date (ascending)
   */
  const filteredEvents = useMemo(() => {
    let list = events;
    if (filter === 'upcoming') {
      list = list.filter(e => isUpcoming(e.event_date));
    } else if (filter === 'past') {
      list = list.filter(e => isPast(e.event_date));
    }
    return [...list].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events, filter]);

  /**
   * ============================================
   * FEATURED EVENT
   * ============================================
   * 
   * Gets the first upcoming event to feature
   * Falls back to the first event if no upcoming
   */
  const featuredEvent = useMemo(() => {
    const upcoming = filteredEvents.filter(e => isUpcoming(e.event_date));
    return upcoming.length > 0 ? upcoming[0] : filteredEvents[0];
  }, [filteredEvents]);

  /**
   * ============================================
   * GET EVENT PARTICIPANTS
   * ============================================
   * 
   * Returns all participations for a given event ID
   * 
   * @param {number} eventId - The event ID
   * @returns {Array} Array of participant objects
   */
  const getEventParticipants = (eventId) => {
    return participations.filter(p => p.event === eventId);
  };

  /**
   * ============================================
   * HANDLE EVENT CLICK
   * ============================================
   * 
   * Opens the drawer with the selected event details
   * 
   * @param {Object} event - The event object
   */
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    upcoming: filteredEvents.filter(e => isUpcoming(e.event_date)).length,
    past: filteredEvents.filter(e => isPast(e.event_date)).length,
    total: filteredEvents.length,
  }), [filteredEvents]);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Events"
        subtitle="Stay updated with school activities and academic deadlines."
        breadcrumbs={["Teacher", "Events"]}
        actions={
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[36px] sm:min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Export Schedule</span>
              <span className="xs:hidden">Export</span>
            </Button>
          </div>
        }
      />

      {/* ─── Filter Bar ────────────────────────────────────────────────── */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {['all', 'upcoming', 'past'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={`min-h-[32px] sm:min-h-[36px] text-xs sm:text-sm capitalize ${
                  filter === f ? '' : 'border-gray-200'
                }`}
              >
                {f === 'all' ? 'All Events' : f}
                {f === 'upcoming' && stats.upcoming > 0 && (
                  <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                    {stats.upcoming}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                value={new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                readOnly
                className="w-full sm:w-36 pl-9 pr-3 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-xs sm:text-sm min-h-[36px] sm:min-h-[40px]"
              />
            </div>
            <Button variant="outline" size="sm" className="min-h-[36px] sm:min-h-[40px]">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Filter</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* ─── Main Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mt-4 sm:mt-6">
        {/* ─── Left / Main Content ────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-5">
          {/* ─── Featured Event ────────────────────────────────────────── */}
          {featuredEvent && (
            <div
              className="relative overflow-hidden rounded-xl min-h-[240px] sm:min-h-[280px] flex flex-col justify-end p-4 sm:p-6 md:p-8 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -bottom-16 -left-16 w-48 sm:w-64 h-32 rounded-br-full bg-purple-500/10 border-2 border-purple-500/5" />
              <div className="absolute top-6 sm:top-10 right-6 sm:right-10 opacity-30">
                <Calendar className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 text-white/10" />
              </div>

              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <Badge className="bg-purple-600 text-white border-none text-[10px] uppercase tracking-widest">
                    Featured
                  </Badge>
                  {isUpcoming(featuredEvent.event_date) && (
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">
                      In {Math.ceil((new Date(featuredEvent.event_date) - new Date()) / (1000 * 60 * 60 * 24))} Days
                    </Badge>
                  )}
                </div>
                <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
                  {featuredEvent.event_name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-white/80 text-xs sm:text-sm md:text-base">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                    {formatDate(featuredEvent.event_date)} • {formatTime(featuredEvent.event_date)}
                  </span>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                    {featuredEvent.venue || "Location TBD"}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEventClick(featuredEvent)}
                  className="mt-3 sm:mt-4 min-h-[36px] sm:min-h-[40px]"
                >
                  View Details
                </Button>
              </div>
            </div>
          )}

          {/* ─── Event Grid ────────────────────────────────────────────── */}
          {filteredEvents.length === 0 ? (
            <Card className="p-8 sm:p-12 text-center border border-gray-100">
              <div className="flex flex-col items-center gap-3">
                <Calendar className="w-12 h-12 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">No events found</p>
                <p className="text-xs sm:text-sm text-gray-400">Try adjusting your filters</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredEvents.map((event) => {
                const participants = getEventParticipants(event.id);
                const count = participants.length;
                const isUpcomingEvent = isUpcoming(event.event_date);
                return (
                  <Card
                    key={event.id}
                    className="p-3 sm:p-4 hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-purple-600 transition-colors truncate max-w-[150px] sm:max-w-[200px]">
                            {event.event_name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event.event_date)}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[60px] sm:max-w-[100px]">{event.venue || "TBD"}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-[10px] shrink-0 ml-2 ${
                        isUpcomingEvent 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {isUpcomingEvent ? 'Upcoming' : 'Past'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{count} participant{count !== 1 && 's'}</span>
                      </div>
                      <span className="text-xs font-medium text-purple-600 flex items-center gap-0.5 group-hover:gap-1 transition-all">
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Sidebar ────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-5">
          {/* ─── Quick Stats ────────────────────────────────────────────── */}
          <Card className="p-4 sm:p-5 border border-gray-100">
            <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">Quick Insights</h4>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg text-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.upcoming}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-medium">Upcoming</p>
              </div>
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg text-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-gray-600">{stats.past}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-medium">Past</p>
              </div>
            </div>
          </Card>

          {/* ─── Upcoming Events List ────────────────────────────────── */}
          <Card className="p-4 sm:p-5 border border-gray-100">
            <h4 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">Upcoming Events</h4>
            {filteredEvents.filter(e => isUpcoming(e.event_date)).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredEvents
                  .filter(e => isUpcoming(e.event_date))
                  .slice(0, 4)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex flex-col items-center justify-center w-10 sm:w-12 bg-gray-50 rounded-lg py-1 shrink-0">
                        <span className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-gray-800">
                          {new Date(event.event_date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {event.event_name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate">{event.venue || "TBD"}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ─── Drawer for Event Details ──────────────────────────────────── */}
      <EventDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        participants={selectedEvent ? getEventParticipants(selectedEvent.id) : []}
      />
    </div>
  );
}