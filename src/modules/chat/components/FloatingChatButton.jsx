import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import { toggleCompact } from "../../../store/chat/chatSlice";

/* =========================
   Role → theme map
   Mirrors the CSS variables:
   --color-{role}-primary / -hover / -light / -border / -text
========================= */
const ROLE_THEMES = {
  admin: {
    primary: "#1d4ed8",
    hover: "#1e40af",
    light: "#eff6ff",
    border: "#dbeafe",
    text: "#1e3a8a",
  },
  teacher: {
    primary: "#059669",
    hover: "#047857",
    light: "#ecfdf5",
    border: "#d1fae5",
    text: "#065f46",
  },
  student: {
    primary: "#d97706",
    hover: "#b45309",
    light: "#fffbeb",
    border: "#fef3c7",
    text: "#92400e",
  },
  parent: {
    primary: "#7c3aed",
    hover: "#6d28d9",
    light: "#f5f3ff",
    border: "#ede9fe",
    text: "#5b21b6",
  },
};

// Fallback (original teal/cyan/blue) for unknown/missing roles
const DEFAULT_THEME = {
  primary: "#14b8a6", // teal-500
  hover: "#0e7490", // cyan-700-ish
  light: "#ecfeff",
  border: "#99f6e4",
  text: "#0f766e",
};

export default function FloatingChatButton() {
  const dispatch = useDispatch();
  const location = useLocation();

  // NOTE: the auth slice stores this as `role_name` (see PromptCards.jsx,
  // Sidebar's `tone` prop derives from the same field). Reading `role` here
  // was always undefined, which silently fell through to DEFAULT_THEME —
  // that's why this button never matched the sidebar's role color.
  const roleName = useSelector((state) => state.auth?.user?.role_name || state.auth?.user?.role);

  if (location.pathname === "/ai-workspace") {
    return null;
  }

  const theme = ROLE_THEMES[roleName?.toLowerCase()] || DEFAULT_THEME;

 return (
  <motion.div
    className="fixed bottom-4 right-4 md:bottom-6 md:right-12 z-50 group"
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{
      duration: 0.5,
      ease: "easeOut",
    }}
  >
    {/* Tooltip (Desktop Only) */}
    <motion.div
      initial={{ opacity: 0, x: 15 }}
      whileHover={{ opacity: 1, x: 0 }}
      style={{
        backgroundColor: theme.text,
      }}
      className="
        hidden md:block
        absolute
        right-24
        top-1/2
        -translate-y-1/2
        whitespace-nowrap
        rounded-full
        px-4
        py-2
        text-sm
        font-medium
        text-white
        shadow-xl
        pointer-events-none
      "
    >
      Ask Nova AI
    </motion.div>

    {/* Pulse */}
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ backgroundColor: theme.primary }}
      animate={{
        scale: [1, 1.7],
        opacity: [0.35, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "easeOut",
      }}
    />

    {/* Rotating Glow */}
    <motion.div
      className="absolute -inset-1 rounded-full blur-md"
      style={{
        backgroundImage: `linear-gradient(90deg, ${theme.primary}, ${theme.hover}, ${theme.text})`,
      }}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "linear",
      }}
    />

    {/* Button */}
    <motion.button
      onClick={() => dispatch(toggleCompact())}
      animate={{
        y: [0, -8, 0],
        rotate: [0, 2, -2, 0],
        scale: [1, 1.04, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{
        scale: 0.94,
      }}
      style={{
        backgroundImage: `linear-gradient(135deg, ${theme.primary}, ${theme.hover})`,
        boxShadow: `0 18px 45px ${theme.primary}70`,
        border: `3px solid ${theme.border}66`,
      }}
      className="
        relative
        flex
        h-16
        w-16
        md:h-20
        md:w-20
        items-center
        justify-center
        overflow-hidden
        rounded-full
        backdrop-blur-xl
      "
    >
      {/* Glass Reflection */}
      <div
        className="
          absolute
          left-2
          top-2
          h-16
          w-10
          md:h-28
          md:w-16
          rounded-full
          bg-white/40
          blur-sm
        "
      />

      {/* Robot Animation */}
      <DotLottieReact
        src="../../../../public/animations/hello animation.lottie"
        autoplay
        loop
        className="relative z-10 h-14 w-14 md:h-20 md:w-20"
      />
    </motion.button>
  </motion.div>
);
}
