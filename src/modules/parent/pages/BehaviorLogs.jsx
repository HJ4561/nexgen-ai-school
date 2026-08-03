/**
 * ============================================
 * PARENT BEHAVIOR LOGS COMPONENT
 * ============================================
 * 
 * Purpose: Parent behavior logs dashboard for tracking child behavior
 * Used by: Parent module routes
 * 
 * Features:
 * - Behavior page header
 * - Child selector for switching between children
 * - Behavior overview statistics (total, low, medium, high)
 * - Behavior log list with filters
 * - GSAP entrance animations
 * - Data fetching on mount
 * - Responsive layout
 * 
 * Dependencies:
 * - react-redux for state management
 * - gsap for animations
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent behavior components
 * 
 * Usage:
 * <Route path="/parent/behavior-logs" element={<BehaviorLogs />} />
 * ============================================
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gsap } from "gsap";

import {
  fetchParentLinks,
  fetchBehaviorLogs,
} from "@/modules/parent/store/parentThunks";

import BehaviorHeader from "@/components/parent/behavior/BehaviorHeader";
import ChildBehaviorSelector from "@/components/parent/behavior/ChildBehaviorSelector";
import BehaviorOverview from "@/components/parent/behavior/BehaviorOverview";
import BehaviorLogList from "@/components/parent/behavior/BehaviorLogList";

/**
 * ============================================
 * PARENT BEHAVIOR LOGS COMPONENT
 * ============================================
 * 
 * Renders the parent behavior logs dashboard
 * 
 * @returns {JSX.Element} Parent behavior logs page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/behavior-logs" element={<BehaviorLogs />} />
 * ============================================
 */
const BehaviorLogs = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the behavior logs page
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
   * - Behavior logs for all children
   */
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchBehaviorLogs());
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
   * - Log List: fade in + slide up
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
        // ─── Log List ───
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
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div ref={headerRef}>
        <BehaviorHeader />
      </div>

      {/* ─── Child Selector ───────────────────────────────────────────── */}
      <div ref={selectorRef}>
        <ChildBehaviorSelector />
      </div>

      {/* ─── Overview Cards ───────────────────────────────────────────── */}
      <div ref={overviewRef}>
        <BehaviorOverview />
      </div>

      {/* ─── Behavior Logs ────────────────────────────────────────────── */}
      <div ref={listRef}>
        <BehaviorLogList role="parent" />
      </div>
    </div>
  );
};

export default BehaviorLogs;