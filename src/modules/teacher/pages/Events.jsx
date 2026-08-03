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
} from 'lucide-react';

// ─── Reusable Components ──────────────────────────────────────────────────
import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Drawer from "@/components/admin/Drawer";

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
const isUpcoming = (dateStr) => new Date(dateStr) >= new Date();

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
const isPast = (dateStr) => new Date(dateStr) < new Date();

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
    return list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
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

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[var(--color-surface-dim)] min-h-screen">
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Upcoming Events"
        subtitle="Stay updated with school activities and academic deadlines."
        breadcrumbs={['Dashboard', 'Teacher', 'Events']}
        tone="teacher"
        titleClassName="text-[var(--color-teacher-primary)]"
        action={
          <div className="flex gap-3">
            <Button
              variant="outline"
              tone="teacher"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Export Schedule
            </Button>
          </div>
        }
      />

      {/* ─── Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'upcoming', 'past'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              tone="teacher"
              size="sm"
              className="whitespace-nowrap capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Events' : f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value="Oct 2023"
              readOnly
              className="pl-10 pr-4 py-2 bg-surface border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-teacher-primary"
            />
          </div>
          <Button variant="outline" tone="teacher" size="sm" leftIcon={<Filter size={16} />}>
            Filter
          </Button>
        </div>
      </div>

      {/* ─── Main Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================
            LEFT / MAIN CONTENT
            ============================================ */}
        <div className="lg:col-span-8 space-y-6">
          {/* ─── Featured Event ────────────────────────────────────────── */}
          {featuredEvent && (
            <div
              className="relative overflow-hidden rounded-xl min-h-[280px] flex flex-col justify-end p-6 md:p-8 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
              }}
            >
              {/* Decorative elements */}
              <div className="absolute -bottom-16 -left-16 w-64 h-32 rounded-br-full bg-teacher-primary/10 border-2 border-teacher-primary/5" />
              <div className="absolute top-10 right-10 opacity-30">
                <Calendar size={120} className="text-white/10" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone="teacher" className="text-[10px] uppercase tracking-widest">
                    Major Event
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px]">
                    In {Math.ceil((new Date(featuredEvent.event_date) - new Date()) / (1000 * 60 * 60 * 24))} Days
                  </Badge>
                </div>
                <h3 className="text-white text-2xl md:text-3xl font-bold leading-tight">
                  {featuredEvent.event_name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-teacher-primary" />
                    <span>{formatDate(featuredEvent.event_date)} • {formatTime(featuredEvent.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-teacher-primary" />
                    <span>{featuredEvent.venue}</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  tone="teacher"
                  className="mt-4 hover:bg-white/90"
                  onClick={() => handleEventClick(featuredEvent)}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}

          {/* ─── Event Grid ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((event) => {
              const participants = getEventParticipants(event.id);
              const count = participants.length;
              const isUpcomingEvent = isUpcoming(event.event_date);
              return (
                <div
                  key={event.id}
                  className="group bg-white p-5 rounded-lg border border-gray-200 hover:border-teacher-primary/40 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-teacher-light flex items-center justify-center text-teacher-primary">
                      <Calendar size={24} />
                    </div>
                    <Badge
                      tone={isUpcomingEvent ? 'teacher' : 'neutral'}
                      className="text-[10px] uppercase tracking-wide"
                    >
                      {isUpcomingEvent ? 'Upcoming' : 'Past'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-text-primary mt-3 group-hover:text-teacher-primary transition-colors">
                    {event.event_name}
                  </h4>
                  <div className="mt-2 space-y-1 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(event.event_date)} • {formatTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-text-secondary text-xs">
                      <Users size={14} />
                      <span>{count} participant{count !== 1 && 's'}</span>
                    </div>
                    <div className="text-teacher-primary text-sm font-medium flex items-center gap-1">
                      View Details
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================
            SIDEBAR
            ============================================ */}
        <div className="lg:col-span-4 space-y-6">
          {/* ─── Quick Stats ────────────────────────────────────────────── */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-text-primary mb-4">Quick Insights</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-teacher-light p-4 rounded-lg text-center">
                <Calendar size={24} className="text-teacher-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-teacher-primary">
                  {filteredEvents.filter(e => isUpcoming(e.event_date)).length}
                </p>
                <p className="text-xs text-text-secondary uppercase font-medium">Upcoming</p>
              </div>
              <div className="bg-surface-muted p-4 rounded-lg text-center">
                <Calendar size={24} className="text-text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-text-secondary">
                  {filteredEvents.filter(e => isPast(e.event_date)).length}
                </p>
                <p className="text-xs text-text-secondary uppercase font-medium">Past</p>
              </div>
            </div>
          </div>

          {/* ─── Upcoming Events List ────────────────────────────────── */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-text-primary mb-3">Upcoming Events</h4>
            <div className="space-y-3">
              {filteredEvents
                .filter(e => isUpcoming(e.event_date))
                .slice(0, 4)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-teacher-light/50 transition-colors cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex flex-col items-center justify-center w-12 bg-surface-muted rounded-lg py-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-text-primary">
                        {new Date(event.event_date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{event.event_name}</p>
                      <p className="text-xs text-text-secondary truncate">{event.venue}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Drawer for Event Details ──────────────────────────────────── */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedEvent?.event_name || 'Event Details'}
        width="max-w-md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {/* Event Date & Time */}
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Calendar size={16} />
              <span>{formatDate(selectedEvent.event_date)} • {formatTime(selectedEvent.event_date)}</span>
            </div>

            {/* Event Venue */}
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <MapPin size={16} />
              <span>{selectedEvent.venue}</span>
            </div>

            {/* Participants Section */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="font-semibold text-text-primary mb-3">Participants</h5>
              {getEventParticipants(selectedEvent.id).length === 0 ? (
                <p className="text-sm text-text-secondary">No participants yet.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {getEventParticipants(selectedEvent.id).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded bg-surface-muted/30 hover:bg-teacher-light/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-text-primary">{p.student_name}</p>
                        <p className="text-xs text-text-secondary">{p.role} {p.position && `• ${p.position}`}</p>
                      </div>
                      <Badge tone="neutral" className="text-[9px]">{p.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}