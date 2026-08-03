/**
 * ============================================
 * ROBOT GREETING COMPONENT
 * ============================================
 * 
 * Purpose: Animated robot avatar greeting for chat interface
 * Features:
 * - Lottie animation of live chatbot
 * - GSAP powered entrance animation (scale + fade)
 * - Gentle idle floating animation
 * - Ambient glow pulse effect
 * - Color palette synced with ChatArea/Sidebar/MessageBubble
 * - Cleanup on unmount
 * 
 * Dependencies:
 * - gsap for animations
 * - @lottiefiles/dotlottie-react for robot animation
 * 
 * Usage:
 * <RobotGreeting />
 * ============================================
 */

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 * 
 * Same palette as ChatArea / Sidebar / MessageBubble — keep in sync.
 * 
 * @constant {string} VIOLET - Primary violet color
 * @constant {string} CYAN - Secondary cyan color
 */
const VIOLET = '#8b5cf6';
const CYAN = '#22d3ee';

/**
 * ============================================
 * ROBOT GREETING COMPONENT
 * ============================================
 * 
 * Renders an animated robot avatar with greeting animations
 * 
 * @returns {JSX.Element} Robot greeting UI
 * 
 * @example
 * // Place in chat header or empty state
 * <RobotGreeting />
 * ============================================
 */
export default function RobotGreeting() {
  // ─── Refs for GSAP animations ──────────────────────────────────────
  const wrapRef = useRef(null);
  const glowRef = useRef(null);

  /**
   * ============================================
   * ANIMATION SETUP
   * ============================================
   * 
   * Configures three GSAP animations:
   * 1. Entrance: Fade in + slide up + scale from 0.9
   * 2. Idle Float: Gentle up/down bobbing (yoyo)
   * 3. Glow Pulse: Ambient glow scaling and opacity
   * 
   * All animations are cleaned up on unmount using gsap.context
   */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // ─── Entrance Animation ───
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }
      );

      // ─── Idle Float Animation ───
      gsap.to(wrapRef.current, {
        y: -8,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // ─── Ambient Glow Pulse ───
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.5,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, wrapRef);

    // Cleanup animations on unmount
    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center mb-2 select-none">
      {/* ─── Ambient Glow ─── */}
      <div
        ref={glowRef}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: `radial-gradient(circle, ${VIOLET}40 0%, ${CYAN}20 60%, transparent 75%)`,
          filter: 'blur(10px)',
        }}
      />

      {/* ─── Robot Animation ─── */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        <DotLottieReact
          src="/animations/Live chatbot.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}