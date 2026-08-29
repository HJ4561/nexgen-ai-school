/**
 * ============================================
 * ACTIVE EVENTS CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays upcoming/active events for the selected child
 * Features:
 * - Event name and date display
 * - Role in the event
 * - Position badge (1st, 2nd, 3rd)
 * - Certificate availability indicator
 * - View All link
 * - Scrollable list with max height
 * - Empty state with icon
 * - Hover effects on event cards
 * - Role-based theming (parent)
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays, Trophy, ChevronRight)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <ActiveEventsCard />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  CalendarDays,
  Trophy,
  ChevronRight,
} from "lucide-react";

import Card from '@/components/ui/Card'

/**
 * ============================================
 * ACTIVE EVENTS CARD COMPONENT
 * ============================================
 * 
 * Renders a list of upcoming events for the selected child
 * 
 * @returns {JSX.Element} Active events card UI
 * 
 * @example
 * // In parent dashboard
 * <ActiveEventsCard />
 * ============================================
 */
const ActiveEventsCard = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves events, selectedChild, and parentLinks from Redux store
   */
  const { events, selectedChild, parentLinks } =
    useSelector((state) => state.parent);

  /**
   * ============================================
   * SELECTED STUDENT
   * ============================================
   * 
   * Finds the current student from parentLinks
   */
  const selectedStudent = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * SELECTED CHILD EVENTS
   * ============================================
   * 
   * Filters events for the selected student
   */
  const childEvents = useMemo(() => {
    if (!selectedStudent) return [];

    return events.filter(
      (event) => event.student_name === selectedStudent.student_name
    );
  }, [events, selectedStudent]);

  return (
    <Card className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="rounded-lg bg-parent-primary/10 p-3">
            <CalendarDays size={22} className="text-parent-primary" />
          </div>

          {/* Title */}
          <div>
            <h3 className="font-semibold text-text-primary">
              Active Events
            </h3>
            <p className="text-sm text-text-secondary">
              Upcoming Activities
            </p>
          </div>
        </div>

        {/* View All Link */}
        <button
          className="flex items-center gap-1 text-sm font-medium text-parent-primary hover:underline"
        >
          View All
          <ChevronRight size={16} />
        </button>
      </div>

      {/* ─── Body ────────────────────────────────────────────────── */}
      <div
        className="
          mt-6 space-y-4
          max-h-96 overflow-y-auto
          pr-1
          scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        {childEvents.length === 0 ? (
          // ─── Empty State ──────────────────────────────────────────
          <div className="rounded-xl bg-surface-muted p-4 text-center">
            <CalendarDays size={32} className="mx-auto text-text-secondary" />
            <p className="mt-3 text-sm text-text-secondary">
              No upcoming events.
            </p>
          </div>
        ) : (
          // ─── Event List ──────────────────────────────────────────
          childEvents.map((event) => (
            <div
              key={event.id}
              className="
                flex items-start justify-between
                rounded-xl
                border border-border
                p-4 transition
                hover:border-parent-primary"
            >
              {/* ─── Event Details ─── */}
              <div className="flex gap-3">
                {/* Trophy Icon */}
                <div className="rounded-lg bg-parent-primary/10 p-2">
                  <Trophy size={20} className="text-parent-primary" />
                </div>

                <div>
                  {/* Event Name */}
                  <h4 className="font-semibold text-text-primary">
                    {event.event_name}
                  </h4>

                  {/* Event Date */}
                  <p className="mt-1 text-sm text-text-secondary">
                    {event.event_date}
                  </p>

                  {/* Role */}
                  <p className="mt-2 text-xs text-text-secondary">
                    {event.role}
                  </p>
                </div>
              </div>

              {/* ─── Status Indicators ─── */}
              <div className="text-right">
                {/* Position Badge */}
                {event.position && (
                  <span
                    className="
                      rounded-full
                      bg-green-100
                      px-3 py-1
                      text-xs font-semibold
                      text-green-700"
                  >
                    {event.position}
                  </span>
                )}

                {/* Certificate Status */}
                {event.certificate && (
                  <p className="mt-2 text-xs text-parent-primary">
                    Certificate Available
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ActiveEventsCard;