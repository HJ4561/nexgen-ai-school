import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSelector } from "react-redux";

// Palette
const INDIGO = "#6366f1";
const BLUE = "#3b82f6";
const CYAN = "#06b6d4";
const INK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "rgba(15,23,42,0.08)";

// Role → theme map (kept in sync with FloatingChatButton.jsx / Sidebar.jsx
// so the "You" bubble matches the same role color used everywhere else).
const ROLE_THEMES = {
  admin: { primary: "#1d4ed8", hover: "#1e40af" },
  teacher: { primary: "#059669", hover: "#047857" },
  student: { primary: "#d97706", hover: "#b45309" },
  parent: { primary: "#7c3aed", hover: "#6d28d9" },
};

// Fallback (original indigo → blue) for unknown/missing roles.
const DEFAULT_THEME = { primary: INDIGO, hover: BLUE };

function Avatar({ isUser, compact }) {
  // lg: breakpoints key off the browser's viewport width, not the width of
  // whatever panel this sits inside. That's correct on the wide expanded
  // /ai-workspace page, but ChatCompact is a fixed ~320px floating widget —
  // on any desktop-width screen the lg: classes still fired and forced a
  // 72px avatar into that narrow panel. `compact` locks the small size
  // regardless of viewport when this is rendered inside that widget.
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

export default function MessageBubble({ message, compact = false }) {
  const isUser = message.role === "user";
  const role = useSelector((s) => s.auth?.user?.role_name);
  const theme = ROLE_THEMES[role?.toLowerCase()] || DEFAULT_THEME;
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
        <Avatar isUser={isUser} compact={compact} />

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
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.hover})`,
                    borderColor: "transparent",
                    boxShadow: `0 4px 12px ${theme.primary}2e`,
                  }
                : {
                    background: "#ffffff",
                    borderColor: BORDER,
                    color: INK,
                  }
            }
          >
            {message.content}
          </div>

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
