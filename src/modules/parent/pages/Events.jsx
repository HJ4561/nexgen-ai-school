/**
 * ============================================
 * PARENT EVENTS COMPONENT
 * ============================================
 * 
 * Purpose: Parent events dashboard for tracking child event participation
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for switching between children
 * - Event overview statistics (participations, certificates, positions)
 * - Participation history list with filters
 * - GSAP entrance animations
 * - Data fetching on mount (parent links, events, certificates)
 * - Responsive layout
 * 
 * Dependencies:
 * - react-redux for state management
 * - gsap for animations
 * - @/components/layout/PageHeader for page header
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent event components
 * 
 * Usage:
 * <Route path="/parent/events" element={<Events />} />
 * ============================================
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gsap } from "gsap";

import PageHeader from "@/components/layout/PageHeader";

import ChildEventSelector from "@/components/parent/events/ChildEventSelector";
import EventOverview from "@/components/parent/events/EventOverview";
import ParticipationList from "@/components/parent/events/ParticipationList";

import {
  fetchParentLinks,
  fetchEvents,
  fetchCertificates,
} from "@/modules/parent/store/parentThunks";

/**
 * ============================================
 * PARENT EVENTS COMPONENT
 * ============================================
 * 
 * Renders the parent events dashboard
 * 
 * @returns {JSX.Element} Parent events page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/events" element={<Events />} />
 * ============================================
 */
const Events = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the events page
   */
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const selectorRef = useRef(null);
  const overviewRef = useRef(null);
  const listRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Parent-child links for child selector
   * - Events data for participation tracking
   * - Certificates earned by children
   */
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchEvents());
    dispatch(fetchCertificates());
  }, [dispatch]);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Animates page sections on load with staggered timing:
   * - Header: fade in + slide up
   * - Child Selector: fade in + slide up
   * - Overview: fade in + slide up
   * - Participation List: fade in + slide up
   * 
   * Uses power3.out easing for smooth transitions
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ─── Header ───
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        // ─── Child Selector ───
        .fromTo(
          selectorRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.25"
        )
        // ─── Overview ───
        .fromTo(
          overviewRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        // ─── Participation List ───
        .fromTo(
          listRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <div ref={headerRef}>
        <PageHeader
          title="Event Participation"
          subtitle="View your child's participation in school events, competitions, and extracurricular activities."
          breadcrumbs={["Parent", "Events"]}
        />
      </div>

      {/* ─── Child Selector ───────────────────────────────────────────── */}
      <div ref={selectorRef}>
        <ChildEventSelector />
      </div>

      {/* ─── Overview Cards ───────────────────────────────────────────── */}
      <div ref={overviewRef}>
        <EventOverview />
      </div>

      {/* ─── Participation History ────────────────────────────────────── */}
      <div ref={listRef}>
        <ParticipationList />
      </div>
    </div>
  );
};

export default Events;