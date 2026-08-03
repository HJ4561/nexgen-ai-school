/**
 * ============================================
 * MESSAGE BUBBLE COMPONENT
 * ============================================
 * 
 * Purpose: Renders individual chat messages with user/bot avatars
 * Features:
 * - User and AI message styling with role-based colors
 * - Role-based theming matching sidebar and floating button
 * - Animated Lottie avatars (User: Nerdy Boy, AI: Live Chatbot)
 * - Compact mode for floating chat widget
 * - Responsive sizing (desktop vs mobile)
 * - Timestamp display with "You" / "ScholarAI" labels
 * - Gradient backgrounds for user messages
 * - Shadow effects with role color
 * 
 * Dependencies:
 * - @lottiefiles/dotlottie-react for avatar animations
 * - react-redux for user role selection
 * 
 * Usage:
 * <MessageBubble
 *   message={messageObject}
 *   compact={false}
 * />
 * ============================================
 */

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSelector } from "react-redux";

/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 * 
 * Base colors used throughout the component
 * Kept in sync with FloatingChatButton.jsx and Sidebar.jsx
 * 
 * @constant {string} INDIGO - Primary indigo color
 * @constant {string} BLUE - Blue color
 * @constant {string} CYAN - Cyan color
 * @constant {string} INK - Dark text color
 * @constant {string} MUTED - Muted text color
 * @constant {string} BORDER - Border color with transparency
 */
const INDIGO = "#6366f1";
const BLUE = "#3b82f6";
const CYAN = "#06b6d4";
const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "rgba(15,23,42,0.08)";

/**
 * ============================================
 * ROLE THEME MAPPING
 * ============================================
 * 
 * Maps user roles to color themes
 * Kept in sync with FloatingChatButton.jsx and Sidebar.jsx
 * So the "You" bubble matches the same role color used everywhere else
 * 
 * @constant {Object} ROLE_THEMES
 * @property {Object} admin - Blue theme
 * @property {Object} teacher - Green theme
 * @property {Object} student - Amber theme
 * @property {Object} parent - Purple theme
 */
const ROLE_THEMES = {
  admin: { primary: "#1d4ed8", hover: "#1e40af" },
  teacher: { primary: "#059669", hover: "#047857" },
  student: { primary: "#d97706", hover: "#b45309" },
  parent: { primary: "#7c3aed", hover: "#6d28d9" },
};

/**
 * ============================================
 * DEFAULT THEME
 * ============================================
 * 
 * Fallback theme for unknown/missing roles
 * Uses original indigo → blue gradient
 * 
 * @constant {Object} DEFAULT_THEME
 */
const DEFAULT_THEME = { primary: INDIGO, hover: BLUE };

/**
 * ============================================
 * AVATAR COMPONENT
 * ============================================
 * 
 * Renders animated Lottie avatar for user or AI
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isUser - Whether the avatar is for a user
 * @param {boolean} props.compact - Whether in compact mode (floating widget)
 * @returns {JSX.Element} Avatar component
 * 
 * @example
 * <Avatar isUser={true} compact={false} />
 * <Avatar isUser={false} compact={true} />
 */
function Avatar({ isUser, compact }) {
  /**
   * ============================================
   * AVATAR SIZE LOGIC
   * ============================================
   * 
   * lg: breakpoints key off the browser's viewport width, not the width of
   * whatever panel this sits inside. That's correct on the wide expanded
   * /ai-workspace page, but ChatCompact is a fixed ~320px floating widget —
   * on any desktop-width screen the lg: classes still fired and forced a
   * 72px avatar into that narrow panel. `compact` locks the small size
   * regardless of viewport when this is rendered inside that widget.
   */
  const sizeClasses = compact
    ? "w-8 h-8"
    : "w-8 h-8 lg:w-18 lg:h-18";

  return (
    <div
      className={`flex-shrink-0 ${sizeClasses} rounded-full overflow-hidden border flex items-center justify-center`}
      style={{
        background: `linear-gradient(135deg, ${INDIGO}20, ${CYAN}20)`,
        borderColor: BORDER,
      }}
    >
      <div className={sizeClasses}>
        <DotLottieReact
          src={
            isUser
              ? "/animations/Nerdy Boy blinking eyes.lottie"
              : "/animations/Live chatbot.lottie"
          }
          autoplay
          loop
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}

/**
 * ============================================
 * MESSAGE BUBBLE COMPONENT
 * ============================================
 * 
 * Renders a single chat message with avatar and timestamp
 * 
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object containing content, role, and created_at
 * @param {string} props.message.content - Message text content
 * @param {string} props.message.role - Message role ('user' or 'assistant')
 * @param {string} props.message.created_at - Message timestamp
 * @param {boolean} props.compact - Whether in compact mode (floating widget)
 * @returns {JSX.Element} Message bubble UI
 * 
 * @example
 * const message = {
 *   content: 'Hello, how can I help?',
 *   role: 'assistant',
 *   created_at: '2024-01-15T10:30:00Z'
 * };
 * 
 * <MessageBubble message={message} compact={false} />
 * ============================================
 */
export default function MessageBubble({ message, compact = false }) {
  // ─── Determine if message is from user ────────────────────────────
  const isUser = message.role === "user";
  
  // ─── Get user role for theming ─────────────────────────────────────
  const role = useSelector((s) => s.auth?.user?.role_name);
  const theme = ROLE_THEMES[role?.toLowerCase()] || DEFAULT_THEME;

  // ─── Responsive sizing ──────────────────────────────────────────────
  const bubbleWidthClasses = compact
    ? "max-w-[78%]"
    : "max-w-[78%] sm:max-w-[72%] lg:max-w-[65%]";
  
  const bubbleTextClasses = compact
    ? "text-[13px] leading-5 py-2"
    : "text-[13px] lg:text-sm leading-5 lg:leading-6 py-2 lg:py-2.5";

  return (
    <div
      className={`flex flex-col ${
        isUser ? "items-end" : "items-start"
      } gap-1`}
    >
      <div
        className={`flex items-end gap-1.5 sm:gap-2 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* ─── Avatar ─── */}
        <Avatar isUser={isUser} compact={compact} />

        {/* ─── Message Bubble ─── */}
        <div className={`${bubbleWidthClasses} min-w-0 break-words`}>
          <div
            className={`px-3 ${bubbleTextClasses} rounded-2xl border whitespace-pre-wrap ${
              isUser
                ? "rounded-br-md text-white"
                : "rounded-bl-md text-slate-900"
            }`}
            style={
              isUser
                ? {
                    // User message: Gradient background with role color
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.hover})`,
                    borderColor: "transparent",
                    boxShadow: `0 4px 12px ${theme.primary}2e`,
                  }
                : {
                    // AI message: White background with subtle border
                    background: "#ffffff",
                    borderColor: BORDER,
                    color: INK,
                  }
            }
          >
            {message.content}
          </div>

          {/* ─── Timestamp ─── */}
          <div
            className={`mt-1 text-[10px] ${
              isUser ? "text-right pr-1" : "pl-1"
            }`}
            style={{ color: MUTED }}
          >
            {isUser ? "You" : "ScholarAI"} •{" "}
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}