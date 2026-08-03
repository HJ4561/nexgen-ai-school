/**
 * ============================================
 * TYPING INDICATOR COMPONENT
 * ============================================
 * 
 * Purpose: Displays a typing indicator with animated robot avatar
 * Features:
 * - Animated robot avatar (Live chatbot Lottie)
 * - Typing animation (Chatbot typing Lottie)
 * - Soft shadow and border styling
 * - Gradient background on avatar
 * - Color palette synced with ChatCompact/ChatArea/PromptCards/MessageBubble
 * - Non-intrusive design with muted text
 * 
 * Dependencies:
 * - @lottiefiles/dotlottie-react for animations
 * 
 * Usage:
 * <TypingIndicator />
 * ============================================
 */

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 * 
 * Same palette as ChatCompact / ChatArea / PromptCards / MessageBubble
 * Keep these in sync across all chat components.
 * 
 * @constant {string} INDIGO - Primary indigo color
 * @constant {string} CYAN - Secondary cyan color
 * @constant {string} MUTED - Muted text color
 * @constant {string} BORDER - Border color with transparency
 */
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const MUTED = '#64748b';
const BORDER = 'rgba(15, 23, 42, 0.08)';

/**
 * ============================================
 * TYPING INDICATOR COMPONENT
 * ============================================
 * 
 * Renders a typing indicator with animated robot and typing dots
 * 
 * @returns {JSX.Element} Typing indicator UI
 * 
 * @example
 * // Show when AI is generating a response
 * {isTyping && <TypingIndicator />}
 * ============================================
 */
export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl w-fit border"
      style={{
        background: '#ffffff',
        borderColor: BORDER,
        boxShadow: '0 2px 8px -4px rgba(15,23,42,0.08)',
      }}
    >
      {/* ─── Robot Avatar ─── */}
      <div
        className="rounded-full flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${INDIGO}1f, ${CYAN}1f)` }}
      >
        <DotLottieReact
          src="/animations/Live chatbot.lottie"
          loop
          autoplay
          style={{ width: 56, height: 56 }}
        />
      </div>

      {/* ─── Typing Animation + Label ─── */}
      <span className="text-[11px] tracking-wide" style={{ color: MUTED }}>
        <DotLottieReact
          src="/animations/Chatbot typing.lottie"
          loop
          autoplay
          style={{ width: 56, height: 56 }}
        />
        Scholar is typing…
      </span>
    </div>
  );
}