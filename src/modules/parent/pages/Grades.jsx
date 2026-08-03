/**
 * ============================================
 * PARENT GRADES COMPONENT
 * ============================================
 * 
 * Purpose: Parent grades dashboard for tracking child academic performance
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and subtitle
 * - Child selector for switching between children
 * - Term selector for filtering by exam type
 * - Grade chart with subject performance visualization
 * - Grade overview statistics (average, subjects, highest, lowest)
 * - Subject performance table with detailed marks
 * - GSAP entrance animations
 * - Data fetching on mount (parent links, grades)
 * - Responsive layout
 * 
 * Dependencies:
 * - react-redux for state management
 * - gsap for animations
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent grade components
 * 
 * Usage:
 * <Route path="/parent/grades" element={<Grades />} />
 * ============================================
 */

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gsap } from "gsap";

import {
  fetchGrades,
  fetchParentLinks,
} from "@/modules/parent/store/parentThunks";

import ChildGradeSelector from "@/components/parent/grades/ChildGradeSelector";
import TermSelector from "@/components/parent/grades/TermSelector";
import GradeOverview from "@/components/parent/grades/GradeOverview";
import GradeChart from "@/components/parent/grades/GradeChart";
import SubjectPerformanceTable from "@/components/parent/grades/SubjectPerformanceTable";

/**
 * ============================================
 * PARENT GRADES COMPONENT
 * ============================================
 * 
 * Renders the parent grades dashboard
 * 
 * @returns {JSX.Element} Parent grades page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/grades" element={<Grades />} />
 * ============================================
 */
const Grades = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the grades page
   */
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const selectorRef = useRef(null);
  const chartRef = useRef(null);
  const overviewRef = useRef(null);
  const performanceRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Parent-child links for child selector
   * - Grade records for all children
   */
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchGrades());
  }, [dispatch]);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Animates page sections on load with staggered timing:
   * - Title: fade in + slide up
   * - Subtitle: fade in + slide up (shorter duration)
   * - Child Selector: fade in + slide up
   * - Grade Chart: fade in + slide up
   * - Grade Overview: fade in + slide up
   * - Performance Table: fade in + slide up
   * 
   * Uses power3.out easing for smooth transitions
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ─── Title ───
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        // ─── Subtitle ───
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45 },
          "-=0.25"
        )
        // ─── Child Selector ───
        .fromTo(
          selectorRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.2"
        )
        // ─── Grade Chart ───
        .fromTo(
          chartRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        )
        // ─── Grade Overview ───
        .fromTo(
          overviewRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        // ─── Performance Table ───
        .fromTo(
          performanceRef.current,
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
      <div>
        <h1 ref={titleRef} className="text-3xl font-bold text-text-primary">
          Academic Grades
        </h1>

        <p ref={subtitleRef} className="mt-2 text-text-secondary">
          View your child's academic performance, exam results and subject-wise grades.
        </p>
      </div>

      {/* ─── Selectors ──────────────────────────────────────────────────── */}
      <div ref={selectorRef} className="grid grid-cols-1 gap-6 lg:grid-cols-1">
        <ChildGradeSelector />
      </div>

      {/* ─── Grade Chart ────────────────────────────────────────────────── */}
      <div ref={chartRef}>
        <GradeChart />
      </div>

      {/* ─── Grade Overview ────────────────────────────────────────────── */}
      <div ref={overviewRef}>
        <GradeOverview />
      </div>

      {/* ─── Performance Table ──────────────────────────────────────────── */}
      <div ref={performanceRef} className="xl:col-span-8">
        <TermSelector />
        <SubjectPerformanceTable />
      </div>
    </div>
  );
};

export default Grades;