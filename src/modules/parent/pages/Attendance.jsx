/**
 * ============================================
 * PARENT ATTENDANCE COMPONENT
 * ============================================
 * 
 * Purpose: Parent attendance dashboard for tracking child attendance
 * Used by: Parent module routes
 * 
 * Features:
 * - Child selector for switching between children
 * - Attendance statistics summary
 * - Attendance trend chart
 * - Monthly calendar view
 * - Detailed attendance table
 * - GSAP entrance animations
 * - Responsive grid layout
 * - Data fetching on mount
 * 
 * Dependencies:
 * - react-redux for state management
 * - gsap for animations
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent attendance components
 * 
 * Usage:
 * <Route path="/parent/attendance" element={<Attendance />} />
 * ============================================
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gsap } from "gsap";

import {
  fetchAttendance,
  fetchParentLinks,
} from "@/modules/parent/store/parentThunks";

import ChildSelector from "@/components/parent/ChildSelector";
import AttendanceCalendar from "@/components/parent/attendance/AttendanceCalendar";
import AttendanceTable from "@/components/parent/attendance/AttendanceTable";
import AttendanceChart from "@/components/parent/attendance/AttendanceChart";
import AttendanceStats from "@/components/parent/attendance/AttendanceStats";

/**
 * ============================================
 * PARENT ATTENDANCE COMPONENT
 * ============================================
 * 
 * Renders the parent attendance dashboard
 * 
 * @returns {JSX.Element} Parent attendance page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/attendance" element={<Attendance />} />
 * ============================================
 */
const Attendance = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the attendance page
   */
  const containerRef = useRef(null);
  const selectorRef = useRef(null);
  const statsRef = useRef(null);
  const chartRef = useRef(null);
  const calendarRef = useRef(null);
  const tableRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Parent-child links for child selector
   * - Attendance records for all children
   */
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchAttendance());
  }, [dispatch]);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Animates page sections on load with staggered timing:
   * - Child Selector: fade in + slide up
   * - Stats: fade in + slide up
   * - Chart: fade in + slide up
   * - Calendar: fade in + slide left
   * - Table: fade in + slide right
   * 
   * Uses power3.out easing for smooth transitions
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ─── Child Selector ───
      tl.fromTo(
        selectorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.55 }
      )
        // ─── Stats ───
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        // ─── Chart ───
        .fromTo(
          chartRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.35"
        )
        // ─── Calendar ───
        .fromTo(
          calendarRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.3"
        )
        // ─── Table ───
        .fromTo(
          tableRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.55 },
          "-=0.45"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ─── Child Selector ───────────────────────────────────────────── */}
      <div ref={selectorRef}>
        <ChildSelector
          title="Select Child"
          subtitle="Choose a child to view attendance."
        />
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────────── */}
      <div ref={statsRef}>
        <AttendanceStats />
      </div>

      {/* ─── Trend Chart ────────────────────────────────────────────────── */}
      <div ref={chartRef}>
        <AttendanceChart />
      </div>

      {/* ─── Main Layout ───────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Calendar (2/5 columns) */}
        <div ref={calendarRef} className="space-y-6 lg:col-span-2">
          <AttendanceCalendar />
        </div>

        {/* Table (3/5 columns) */}
        <div ref={tableRef} className="lg:col-span-3">
          <AttendanceTable />
        </div>
      </div>
    </div>
  );
};

export default Attendance;