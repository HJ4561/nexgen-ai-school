import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Same palette as ChatCompact / ChatArea / PromptCards / MessageBubble — keep these in sync.
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const MUTED = '#64748b';
const BORDER = 'rgba(15, 23, 42, 0.08)';

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
