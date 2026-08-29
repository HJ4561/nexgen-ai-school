import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Same palette as ChatCompact / ChatArea / PromptCards / MessageBubble — keep these in sync.
const INDIGO = '#6366f1';
const CYAN = '#06b6d4';
const MUTED = '#64748b';
const BORDER = 'rgba(15, 23, 42, 0.08)';

export default function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl w-fit border"
      style={{
        background: '#ffffff',
        borderColor: BORDER,
        boxShadow: '0 2px 8px -4px rgba(15,23,42,0.08)',
      }}
    >
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${INDIGO}1f, ${CYAN}1f)` }}
      >
        <DotLottieReact
          src="/animations/Live chatbot.lottie"
          loop
          autoplay
          style={{ width: 40, height: 40 }}
          className="sm:w-[48px] sm:h-[48px] md:w-[56px] md:h-[56px]"
        />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <DotLottieReact
          src="/animations/Chatbot typing.lottie"
          loop
          autoplay
          style={{ width: 32, height: 32 }}
          className="sm:w-[40px] sm:h-[40px] md:w-[48px] md:h-[48px]"
        />
        <span className="text-[10px] sm:text-[11px] tracking-wide text-gray-500 whitespace-nowrap">
          Scholar is typing…
        </span>
      </div>
    </div>
  );
}