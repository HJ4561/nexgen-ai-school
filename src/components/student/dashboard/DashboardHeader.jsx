/**
 * ============================================
 * STUDENT DASHBOARD HEADER
 * ============================================
 * 
 * Purpose: Welcome banner and profile card for student dashboard
 * Used by: Student - Dashboard page
 * 
 * Features:
 * - Dynamic greeting (Morning/Afternoon/Evening)
 * - Waving hand animation
 * - Current date display
 * - Student profile card
 * - Lottie animations
 * - GSAP animations for smooth UI
 * - Hover effects on profile card
 * 
 * Dependencies:
 * - Redux for student profile data
 * - GSAP for animations
 * - Lottie for animated elements
 * - ProfileCard component
 * ============================================
 */

import { useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { gsap } from "gsap";

import ProfileCard from "@/components/composite/ProfileCard";

/**
 * DashboardHeader Component
 * 
 * @component
 * @returns {JSX.Element|null} Rendered dashboard header or null if no profile
 * 
 * @example
 * // In StudentDashboard:
 * <DashboardHeader />
 */
const DashboardHeader = () => {
  const { profile } = useSelector((state) => state.student);

  // ─── Refs ──────────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const bannerRef = useRef(null);
  const greetingRef = useRef(null);
  const waveRef = useRef(null);
  const subtitleRef = useRef(null);
  const todayRef = useRef(null);
  const animationRef = useRef(null);
  const profileCardRef = useRef(null);

  // ─── Computed Values ──────────────────────────────────────────────
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Banner entrance
      tl.fromTo(
        bannerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
        // Greeting text
        .fromTo(
          greetingRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.35"
        )
        // Waving hand — pop in then a little wiggle
        .fromTo(
          waveRef.current,
          { opacity: 0, scale: 0, rotate: -30 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.5)" },
          "-=0.25"
        )
        // Subtitle
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          "-=0.2"
        )
        // Today pill
        .fromTo(
          todayRef.current,
          { opacity: 0, y: 12, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5 },
          "-=0.3"
        )
        // Right-side lottie animation
        .fromTo(
          animationRef.current,
          { opacity: 0, scale: 0.7, rotate: 8 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "back.out(1.7)" },
          "-=0.6"
        )
        // Profile card
        .fromTo(
          profileCardRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.3"
        );

      // Subtle idle float on the lottie animation
      gsap.to(animationRef.current, {
        y: -8,
        duration: 2.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      // Gentle periodic wave wiggle (like re-waving every so often)
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
  }, [profile]);

  // ─── Hover Handlers ──────────────────────────────────────────────
  const handleProfileEnter = () => {
    gsap.to(profileCardRef.current, {
      y: -4,
      scale: 1.01,
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const handleProfileLeave = () => {
    gsap.to(profileCardRef.current, {
      y: 0,
      scale: 1,
      boxShadow: "0 0px 0px rgba(0,0,0,0)",
      duration: 0.35,
      ease: "power2.out",
    });
  };

  // ─── Render ──────────────────────────────────────────────────────
  if (!profile) return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ==========================================
          Welcome Banner
      ========================================== */}

      <div
        ref={bannerRef}
        className="rounded-2xl bg-gradient-to-r from-student-primary to-student-hover p-6 text-white shadow-lg overflow-hidden"
      >
        <div className="flex flex-col-reverse items-center gap-6 lg:flex-row lg:justify-between">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
              <h1 ref={greetingRef} className="text-3xl font-bold leading-tight">
                {greeting}, {profile?.full_name?.split(" ")[0] || "Student"}
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
              Welcome back! Here's an overview of your academic progress
              and today's activities.
            </p>

            <div
              ref={todayRef}
              className="mt-6 inline-block rounded-xl bg-white/10 px-5 py-3 backdrop-blur"
            >
              <p className="text-sm text-white/80">Today</p>
              <p className="font-semibold">{today}</p>
            </div>
          </div>

          {/* Right Animation */}
          <div
            ref={animationRef}
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 flex-shrink-0"
          >
            <DotLottieReact
              src="/animations/Student.lottie"
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

      {/* ==========================================
          Profile Card
      ========================================== */}

      <div
        ref={profileCardRef}
        onMouseEnter={handleProfileEnter}
        onMouseLeave={handleProfileLeave}
        className="rounded-2xl"
      >
        <ProfileCard
          name={profile.full_name}
          role={profile.role_name}
          roleType={profile.role_name?.toLowerCase()}
          email={profile.email}
          subtitle={`User id: ${profile.id}`}
          meta1={`Status: ${profile.status}`}
          meta2={`Joined: ${new Date(
            profile.created_at
          ).toLocaleDateString()}`}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;











