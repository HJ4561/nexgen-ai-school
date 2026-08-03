/**
 * ============================================
 * EVENT OVERVIEW COMPONENT
 * ============================================
 * 
 * Purpose: Displays event participation statistics for parent view
 * Features:
 * - Total participations count
 * - Certificates earned count
 * - First positions count
 * - Unique events participated in
 * - Color-coded stat cards with icons
 * - Role-based theming (parent)
 * - Responsive grid layout (1/2/4 columns)
 * 
 * Dependencies:
 * - lucide-react for icons (Trophy, Award, Medal, CalendarDays)
 * - @/components/composite/StatCard for statistic display
 * - react-redux for state management
 * 
 * Usage:
 * <EventOverview />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Trophy,
  Award,
  Medal,
  CalendarDays,
} from "lucide-react";

import StatCard from "@/components/composite/StatCard";

/**
 * ============================================
 * EVENT OVERVIEW COMPONENT
 * ============================================
 * 
 * Renders event participation statistics in a visual card grid
 * 
 * @returns {JSX.Element} Event overview UI
 * 
 * @example
 * // In parent dashboard
 * <EventOverview />
 * ============================================
 */
const EventOverview = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    events = [],
    certificates = [],
    parentLinks = [],
    selectedChild,
  } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * CHILD EVENTS
   * ============================================
   * 
   * Filters events for the selected child
   */
  const childEvents = useMemo(() => {
    if (!currentChild) return [];
    return events.filter(
      (event) => event.student_name === currentChild.student_name
    );
  }, [events, currentChild]);

  /**
   * ============================================
   * CHILD CERTIFICATES
   * ============================================
   * 
   * Filters certificates for the selected child
   */
  const childCertificates = useMemo(() => {
    if (!currentChild) return [];
    return certificates.filter(
      (certificate) => certificate.student_name === currentChild.student_name
    );
  }, [certificates, currentChild]);

  /**
   * ============================================
   * STATISTICS
   * ============================================
   * 
   * Calculates event statistics for the selected child:
   * - total: Total number of event participations
   * - certificates: Number of certificates earned
   * - firstPositions: Number of first place wins
   * - participatedEvents: Number of unique events participated in
   */
  const stats = useMemo(() => {
    // Count first place positions
    const firstPositions = childEvents.filter(
      (event) => event.position === "1st Place"
    ).length;

    // Count unique event names (using Set)
    const participatedEvents = new Set(
      childEvents.map((event) => event.event_name)
    ).size;

    return {
      total: childEvents.length,
      certificates: childCertificates.length,
      firstPositions,
      participatedEvents,
    };
  }, [childEvents, childCertificates]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {/* ─── Participations ─── */}
      <StatCard
        label="Participations"
        value={stats.total}
        icon={<CalendarDays size={22} />}
        tone="parent"
        footerText="Total Events"
        footerColor="primary"
      />

      {/* ─── Certificates ─── */}
      <StatCard
        label="Certificates"
        value={stats.certificates}
        icon={<Award size={22} />}
        tone="parent"
        footerText="Certificates Earned"
        footerColor="success"
      />

      {/* ─── First Positions ─── */}
      <StatCard
        label="First Positions"
        value={stats.firstPositions}
        icon={<Medal size={22} />}
        tone="parent"
        footerText="Gold Finishes"
        footerColor="warning"
      />

      {/* ─── Unique Events ─── */}
      <StatCard
        label="Unique Events"
        value={stats.participatedEvents}
        icon={<Trophy size={22} />}
        tone="parent"
        footerText="Different Events"
        footerColor="info"
      />
    </div>
  );
};

export default EventOverview;