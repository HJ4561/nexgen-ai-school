import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Send, Bot, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { closeCompact } from '@/store/chat/chatSlice';
import { sendMessage } from '@/store/chat/chatThunks';
import { useNavigate } from 'react-router-dom';
import MessageBubble from '@/modules/chat/components/MessageBubble';
import TypingIndicator from '@/modules/chat/components/TypingIndicator';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// ── Palette ──────────────────────────────────────────────────────────────
// Clean light surface with a soft indigo → blue → cyan accent, used sparingly.
const PANEL = 'rgba(255, 255, 255, 0.92)';   // frosted white panel fill
const BORDER = 'rgba(15, 23, 42, 0.08)';     // hairline border
const INDIGO = '#6366f1';
const BLUE = '#3b82f6';
const CYAN = '#06b6d4';
const ACCENT = '#10b981';                    // "online" pulse / send glow
const INK = '#0f172a';                       // primary text
const MUTED = '#64748b';                     // secondary text

export default function ChatCompact() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, loading, isCompactOpen } = useSelector((s) => s.chat);
  const [input, setInput] = useState('');

  const panelRef = useRef(null);
  const headerIconRef = useRef(null);
  const listRef = useRef(null);
  const sendBtnRef = useRef(null);
  const inputWrapRef = useRef(null);
  const prevMsgCount = useRef(0);
  const closingRef = useRef(false);

  // Entrance animation + ambient header icon float
  useEffect(() => {
    if (!isCompactOpen || !panelRef.current) return;
    closingRef.current = false;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      );

      gsap.to(headerIconRef.current, {
        y: -3,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, panelRef);

    return () => ctx.revert();
  }, [isCompactOpen]);

  // Stagger-in animation for newly arrived messages
  useEffect(() => {
    if (!listRef.current) return;
    const nodes = listRef.current.querySelectorAll('[data-msg]');
    const newCount = messages.length - prevMsgCount.current;

    if (newCount > 0) {
      const newest = Array.from(nodes).slice(-newCount);
      gsap.fromTo(
        newest,
        { opacity: 0, y: 10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out', stagger: 0.06 }
      );
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  // Auto-scroll to the latest message whenever the list grows, the typing
  // indicator appears/disappears, or the panel is (re)opened. Runs after
  // the stagger animation above kicks off so it lands on the newest bubble
  // rather than mid-transition.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    const frame = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, loading, isCompactOpen]);

  // Lock body scroll on mobile while the panel is open, so dragging inside
  // the message list doesn't also scroll/bounce the page behind it.
  useEffect(() => {
    if (!isCompactOpen) return;
    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (!isMobile) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isCompactOpen]);

  if (!isCompactOpen) return null;

  const animateClose = (after) => {
    if (closingRef.current) return;
    closingRef.current = true;
    gsap.to(panelRef.current, {
      opacity: 0,
      y: 14,
      scale: 0.96,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: after,
    });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    gsap
      .timeline()
      .to(sendBtnRef.current, { scale: 0.85, duration: 0.1, ease: 'power2.out' })
      .to(sendBtnRef.current, { scale: 1, duration: 0.25, ease: 'back.out(3)' })
      .fromTo(
        sendBtnRef.current,
        { boxShadow: `0 0 0 0 ${ACCENT}55` },
        { boxShadow: `0 0 0 10px ${ACCENT}00`, duration: 0.6, ease: 'power1.out' },
        '<'
      );

    dispatch(sendMessage({ content: input.trim() }));
    setInput('');
  };

  const handleFocus = () => {
    gsap.to(inputWrapRef.current, {
      boxShadow: `0 0 0 3px ${INDIGO}22`,
      borderColor: 'rgba(99,102,241,0.45)',
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const handleBlur = () => {
    gsap.to(inputWrapRef.current, {
      boxShadow: '0 0 0 0px transparent',
      borderColor: BORDER,
      duration: 0.2,
      ease: 'power2.out',
    });
  };

  const handleExpand = () => {
    animateClose(() => {
      dispatch(closeCompact());
      navigate('/ai-workspace');
    });
  };

  const handleClose = () => {
    animateClose(() => dispatch(closeCompact()));
  };

  return (
    <div
      ref={panelRef}
      className="
        fixed z-50 flex flex-col overflow-hidden rounded-2xl border
        inset-x-3 bottom-3 max-h-[85dvh]
        sm:inset-x-auto sm:right-12 sm:bottom-6 sm:w-80 sm:max-h-none
      "
      style={{
        background: PANEL,
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderColor: BORDER,
        boxShadow:
          '0 20px 40px -16px rgba(15,23,42,0.18), 0 4px 12px -4px rgba(15,23,42,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden p-3 flex items-center justify-between shrink-0"
        style={{
          background: `linear-gradient(110deg, ${INDIGO} 0%, ${BLUE} 55%, ${CYAN} 110%)`,
        }}
      >
        <Sparkles size={56} className="absolute -right-3 -top-3 opacity-15 rotate-12 text-white" />

        <div className="flex items-center gap-2 relative text-white min-w-0">
          <div
            ref={headerIconRef}
            className="rounded-full p-1.5 shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            <Bot size={18} />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold text-sm tracking-wide truncate">Scholar AI Assistant</span>
            <span className="flex items-center gap-1 text-[11px] text-white/85">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-pulse shrink-0"
                style={{ background: ACCENT }}
              />
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 relative text-white shrink-0">
          <button
            onClick={handleExpand}
            className="p-2 sm:p-1.5 hover:bg-white/20 active:bg-white/25 rounded-lg transition-colors"
            aria-label="Expand chat"
          >
            <Maximize2 size={15} />
          </button>
          <button
            onClick={handleClose}
            className="p-2 sm:p-1.5 hover:bg-white/20 active:bg-white/25 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto overscroll-contain sm:max-h-80"
        style={{ background: '#f8fafc' }}
      >
        {messages.map((msg, i) => (
          <div data-msg key={i}>
            <MessageBubble message={msg} compact />
          </div>
        ))}
        {loading && <TypingIndicator />}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-8 gap-2" style={{ color: MUTED }}>
            <div
              className="rounded-full p-3"
              style={{
                background: `linear-gradient(135deg, ${INDIGO}14, ${CYAN}14)`,
                border: `1px solid ${BORDER}`,
              }}
            >
              <DotLottieReact
                src="../../../../public/animations/Robot-Says-Hi.lottie"
                autoplay
                loop
                className="relative z-10 h-24 w-24 sm:h-28 sm:w-28"
              />
            </div>
            <p className="text-center text-sm" style={{ color: MUTED }}>Ask me anything...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="p-3 border-t shrink-0"
        style={{ borderColor: BORDER, background: '#ffffff' }}
      >
        <div
          ref={inputWrapRef}
          className="flex items-center gap-2 rounded-xl border px-1 transition-colors"
          style={{ background: '#f8fafc', borderColor: BORDER }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask ScholarAI..."
            // text-base (16px) on mobile prevents iOS Safari from auto-zooming
            // the page when the input gains focus; sm:text-sm restores the
            // original desktop size.
            className="flex-1 bg-transparent px-2 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none"
            style={{ color: INK }}
          />
          <button
            ref={sendBtnRef}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2.5 sm:p-2 rounded-full disabled:opacity-30 transition-colors text-white shrink-0"
            style={{
              background: !input.trim() || loading
                ? '#e2e8f0'
                : `linear-gradient(135deg, ${INDIGO}, ${BLUE} 55%, ${CYAN})`,
            }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
