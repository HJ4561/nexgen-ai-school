/**
 * ============================================
 * PARENT DASHBOARD COMPONENT
 * ============================================
 * 
 * Purpose: Main dashboard for parent users
 * Used by: Parent module routes
 * 
 * Features:
 * - Personalized greeting with time-based message
 * - Hand wave animation
 * - Child selector for switching between children
 * - Attendance summary card
 * - Grade summary card
 * - Active events card
 * - GSAP entrance animations
 * - Lottie animations (hand wave, register)
 * - Data fetching on mount (profile, links, attendance, grades, events)
 * - Responsive grid layout
 * 
 * Dependencies:
 * - react-redux for state management
 * - @lottiefiles/dotlottie-react for animations
 * - gsap for GSAP animations
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent dashboard components
 * 
 * Usage:
 * <Route path="/parent/dashboard" element={<ParentDashboard />} />
 * ============================================
 */

import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";

import {
  fetchProfile,
  fetchParentLinks,
  fetchAttendance,
  fetchGrades,
  fetchEvents,
} from "@/modules/parent/store/parentThunks";
import ChildSelector from "@/components/parent/ChildSelector";
import AttendanceSummaryCard from "@/components/parent/AttendanceSummaryCard";
import GradeSummaryCard from "@/components/parent/GradeSummaryCard";
import ActiveEventsCard from "@/components/parent/ActiveEventsCard";

/**
 * ============================================
 * PARENT DASHBOARD COMPONENT
 * ============================================
 * 
 * Renders the parent dashboard with personalized greeting and overview
 * 
 * @returns {JSX.Element} Parent dashboard page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/dashboard" element={<ParentDashboard />} />
 * ============================================
 */
const ParentDashboard = () => {
  const dispatch = useDispatch();

  // ─── GSAP Refs ───────────────────────────────────────────────────────

  /**
   * ============================================
   * ANIMATION REFS
   * ============================================
   * 
   * Refs for animating different sections of the dashboard
   */
  const containerRef = useRef(null);
  const bannerRef = useRef(null);
  const greetingRef = useRef(null);
  const waveRef = useRef(null);
  const subtitleRef = useRef(null);
  const todayRef = useRef(null);
  const animationRef = useRef(null);
  const selectorRef = useRef(null);
  const cardsRef = useRef(null);

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Parent profile information
   * - Parent-child links for child selector
   * - Attendance records for all children
   * - Grade records for all children
   * - Events for participation tracking
   */
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchParentLinks());
    dispatch(fetchAttendance());
    dispatch(fetchGrades());
    dispatch(fetchEvents());
  }, [dispatch]);

  // ─── Computed Values ─────────────────────────────────────────────────

  /**
   * ============================================
   * TIME-BASED GREETING
   * ============================================
   * 
   * Returns a greeting based on the current time of day
   * - Morning: 12 AM - 11:59 AM
   * - Afternoon: 12 PM - 4:59 PM
   * - Evening: 5 PM - 11:59 PM
   * 
   * @returns {string} Time-based greeting
   */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  }, []);

  /**
   * ============================================
   * TODAY'S DATE
   * ============================================
   * 
   * Returns the current date in a formatted string
   * Format: "Monday, January 1, 2024"
   * 
   * @returns {string} Formatted date string
   */
  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // ─── Redux State ────────────────────────────────────────────────────

  const { profile } = useSelector((state) => state.parent);

  // ─── Entrance Animations ─────────────────────────────────────────────

  /**
   * ============================================
   * GSAP ENTRANCE ANIMATIONS
   * ============================================
   * 
   * Animates page sections on load with staggered timing:
   * - Banner: fade in + slide up + scale
   * - Greeting: fade in + slide left
   * - Wave: pop in with rotation
   * - Subtitle: fade in + slide up
   * - Today: fade in + slide up + scale
   * - Animation: pop in with rotation
   * - Child Selector: fade in + slide up
   * - Dashboard Cards: fade in + slide up
   * 
   * Also adds:
   * - Idle float animation on Lottie animation
   * - Periodic wave wiggle animation
   * 
   * Uses power3.out easing for smooth transitions
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // ─── Banner ───
      tl.fromTo(
        bannerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        // ─── Greeting ───
        .fromTo(
          greetingRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.35"
        )
        // ─── Wave ───
        .fromTo(
          waveRef.current,
          { opacity: 0, scale: 0, rotate: -30 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.5)" },
          "-=0.25"
        )
        // ─── Subtitle ───
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        // ─── Today ───
        .fromTo(
          todayRef.current,
          { opacity: 0, y: 12, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          "-=0.3"
        )
        // ─── Animation ───
        .fromTo(
          animationRef.current,
          { opacity: 0, scale: 0.7, rotate: 8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
          "-=0.6"
        )
        // ─── Child Selector ───
        .fromTo(
          selectorRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55 },
          "-=0.3"
        )
        // ─── Dashboard Cards ───
        .fromTo(
          cardsRef.current,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );

      // ─── Idle Float Animation ───
      // Gentle up/down motion on the Lottie animation
      gsap.to(animationRef.current, {
        y: -8,
        duration: 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      // ─── Wave Wiggle Animation ───
      // Periodic hand wave wiggle with delay
      gsap.to(waveRef.current, {
        rotate: 14,
        duration: 0.15,
        ease: "power1.inOut",
        repeat: 5,
        yoyo: true,
        repeatDelay: 3.5,
        delay: 1.5,
        transformOrigin: "70% 70%",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-8">
      {/* ─── Header Banner ───────────────────────────────────────────────── */}
      <div
        ref={bannerRef}
        className="overflow-hidden rounded-2xl bg-linear-to-r from-parent-primary to-parent-hover p-6 text-white shadow-lg"
      >
        <div className="flex flex-col-reverse items-center gap-6 lg:flex-row lg:justify-between">
          {/* ─── Left Side ─── */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <h1 ref={greetingRef} className="text-3xl font-bold leading-tight">
                {greeting}, {profile?.full_name?.split(" ")[0] || "Parent"}
              </h1>

              <div ref={waveRef} className="h-12 w-12 shrink-0">
                <DotLottieReact
                  src="/animations/hand wave.lottie"
                  autoplay
                  loop
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>

            <p ref={subtitleRef} className="mt-3 max-w-xl text-white/90">
              Here's an overview of your child's academic progress,
              attendance, grades, and upcoming school activities.
            </p>

            <div
              ref={todayRef}
              className="mt-6 inline-block rounded-xl bg-white/10 px-5 py-3 backdrop-blur"
            >
              <p className="text-sm text-white/80">Today</p>
              <p className="font-semibold">{today}</p>
            </div>
          </div>

          {/* ─── Right Animation ─── */}
          <div
            ref={animationRef}
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 shrink-0"
          >
            <DotLottieReact
              src="../../../../public/animations/register.lottie"
              autoplay
              loop
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* ─── Child Selector ────────────────────────────────────────────── */}
      <div ref={selectorRef}>
        <ChildSelector />
      </div>

      {/* ─── Dashboard Cards ────────────────────────────────────────────── */}
      <div ref={cardsRef} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AttendanceSummaryCard />
        <GradeSummaryCard />
        <ActiveEventsCard />
      </div>
    </div>
  );
};

export default ParentDashboard;