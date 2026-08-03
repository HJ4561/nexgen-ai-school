/**
 * ============================================
 * ANIMATION TOOLKIT
 * ============================================
 * 
 * Purpose: Single reusable animation toolkit for the entire application
 * 
 * Features:
 * - FadeIn / StaggerGroup / StaggerItem -> Framer Motion, scroll-triggered,
 *   flicker-free by design (declarative "initial" state, no flash of
 *   unstyled content)
 * - useChartReveal -> GSAP + ScrollTrigger, for SVG chart draw-in animations
 *   (bars, donut, sparkline)
 * - useCountUp -> GSAP powered number count-up
 * 
 * Usage:
 *   import { FadeIn, StaggerGroup, StaggerItem, useChartReveal, useCountUp }
 *     from "@/components/admin/animations";
 * ============================================
 */

import { useLayoutEffect, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

/**
 * ============================================
 * GSAP EASING CONFIGURATION
 * ============================================
 * 
 * Custom easing curve for smooth animations
 * 
 * @constant {Array} EASE - [cubic-bezier] easing values
 * @example
 * transition: { ease: EASE }
 * ============================================
 */
const EASE = [0.22, 1, 0.36, 1];

/**
 * ============================================
 * FADE IN COMPONENT
 * ============================================
 * 
 * Fade + slide in animation when the element scrolls into view.
 * Use for cards / sections. Runs once by default.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {number} props.delay - Animation delay in seconds (default: 0)
 * @param {number} props.x - Horizontal slide offset in pixels (default: 0)
 * @param {number} props.y - Vertical slide offset in pixels (default: 24)
 * @param {number} props.duration - Animation duration in seconds (default: 0.7)
 * @param {boolean} props.once - Whether animation should run only once (default: true)
 * @param {number} props.amount - How much of the element must be visible (default: 0.2)
 * @param {string} props.className - Additional CSS classes (default: "")
 * @returns {JSX.Element} Animated motion.div component
 * 
 * @example
 * <FadeIn y={30} delay={0.2}>
 *   <Card>Content</Card>
 * </FadeIn>
 * ============================================
 */
export function FadeIn({
  children,
  delay = 0,
  x = 0,
  y = 24,
  duration = 0.7,
  once = true,
  amount = 0.2,
  className = "",
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ============================================
 * STAGGER GROUP VARIANTS
 * ============================================
 * 
 * Framer Motion variants for staggered child animations
 * 
 * @constant {Object} containerVariants - Parent container stagger configuration
 * @constant {Object} itemVariants - Individual child item animation configuration
 * ============================================
 */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * ============================================
 * STAGGER GROUP COMPONENT
 * ============================================
 * 
 * Wrap a list/grid in StaggerGroup, wrap each child in StaggerItem.
 * Children animate in one-by-one on scroll.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to stagger
 * @param {string} props.className - Additional CSS classes (default: "")
 * @param {boolean} props.once - Whether animation should run only once (default: true)
 * @param {number} props.amount - How much of the element must be visible (default: 0.15)
 * @param {string} props.as - HTML element to render as (default: "div")
 * @returns {JSX.Element} Animated container component
 * 
 * @example
 * <StaggerGroup className="grid grid-cols-3">
 *   <StaggerItem><Card>Item 1</Card></StaggerItem>
 *   <StaggerItem><Card>Item 2</Card></StaggerItem>
 *   <StaggerItem><Card>Item 3</Card></StaggerItem>
 * </StaggerGroup>
 * ============================================
 */
export function StaggerGroup({
  children,
  className = "",
  once = true,
  amount = 0.15,
  as = "div",
}) {
  const MotionTag = motion[as] ?? motion.div;
  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * ============================================
 * STAGGER ITEM COMPONENT
 * ============================================
 * 
 * Individual item to be used inside StaggerGroup
 * Each child animates with a staggered delay
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child element to animate
 * @param {string} props.className - Additional CSS classes (default: "")
 * @returns {JSX.Element} Animated item component
 * 
 * @example
 * <StaggerItem><Card>Animated Card</Card></StaggerItem>
 * ============================================
 */
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

/**
 * ============================================
 * USE CHART REVEAL HOOK
 * ============================================
 * 
 * GSAP animation hook for SVG chart draw-in animations
 * Supports: bars, donut, sparkline charts
 * 
 * @param {React.RefObject} containerRef - Ref to the container element
 * @param {Function} setup - GSAP animation setup function
 * @param {Array} deps - Dependencies array for useEffect
 * @returns {void}
 * 
 * @example
 * useChartReveal(chartRef, () => {
 *   gsap.from(".bar", {
 *     scaleY: 0,
 *     duration: 1,
 *     stagger: 0.1,
 *     transformOrigin: "bottom"
 *   });
 * }, [data]);
 * ============================================
 */
export function useChartReveal(containerRef, setup, deps = []) {
  const isFirstRun = useRef(true);
  
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        setup();
      }, containerRef);
      return () => ctx.revert();
    }, 100);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * ============================================
 * USE COUNT UP HOOK
 * ============================================
 * 
 * GSAP powered number count-up animation.
 * Animates a number from 0 -> target value whenever value changes.
 * 
 * @param {number} value - Target value to count up to
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in seconds (default: 1.2)
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @param {boolean} options.start - Whether to start animation (default: true)
 * @returns {number} Current animated display value
 * 
 * @example
 * const count = useCountUp(1000, { duration: 2, decimals: 0 });
 * // Count animates from 0 to 1000 over 2 seconds
 * 
 * const price = useCountUp(99.99, { duration: 1.5, decimals: 2 });
 * // Count animates from 0 to 99.99 with 2 decimal places
 * ============================================
 */
export function useCountUp(value, { duration = 1.2, decimals = 0, start = true } = {}) {
  const [display, setDisplay] = useState(0);
  const previousValue = useRef(0);
  
  useEffect(() => {
    // Skip if not started or value is invalid
    if (!start || value == null || Number.isNaN(value)) return;
    
    // If value is same as previous, don't re-animate
    if (previousValue.current === value) return;
    previousValue.current = value;
    
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setDisplay(Number(obj.val.toFixed(decimals)));
      },
      onComplete: () => {
        setDisplay(value);
      }
    });
    return () => {
      tween.kill();
    };
  }, [value, duration, decimals, start]);
  
  return display;
}