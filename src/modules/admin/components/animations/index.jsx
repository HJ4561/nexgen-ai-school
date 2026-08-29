import { useLayoutEffect, useEffect, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

const EASE = [0.22, 1, 0.36, 1];

// ─── FadeIn ──────────────────────────────────────────────────────────────
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

// ─── StaggerGroup ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

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

export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// ─── useChartReveal ─────────────────────────────────────────────────────
export function useChartReveal(containerRef, setup, deps = []) {
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      setup();
    }, containerRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── useCountUp ─────────────────────────────────────────────────────────
export function useCountUp(value, { duration = 1.2, decimals = 0, start = true } = {}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!start || value == null || Number.isNaN(value)) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: value,
      duration,
      ease: "power2.out",
      onUpdate: () => setDisplay(Number(obj.val.toFixed(decimals))),
    });
    return () => tween.kill();
  }, [value, duration, decimals, start]);
  return display;
}
