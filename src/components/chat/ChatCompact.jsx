import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Maximize2, Send, Bot, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import gsap from 'gsap';
import { closeCompact } from '@/store/chat/chatSlice';
import { sendMessage } from '@/store/chat/chatThunks';
import { useNavigate } from 'react-router-dom';
import MessageBubble from '@/components/chat/MessageBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const PANEL = 'rgba(255, 255, 255, 0.92)';
const BORDER = 'rgba(15, 23, 42, 0.08)';
const INDIGO = '#6366f1';
const BLUE = '#3b82f6';
const CYAN = '#06b6d4';
const ACCENT = '#10b981';
const INK = '#0f172a';
const MUTED = '#64748b';

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

  // â”€â”€â”€ Entrance Animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Stagger-in Animation for New Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Auto-scroll to Latest Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current;
    const frame = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, loading, isCompactOpen]);

  // â”€â”€â”€ Lock Body Scroll on Mobile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Animation Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const animateClose = useCallback((after) => {
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
  }, []);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSend = useCallback(async () => {
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
  }, [input, loading, dispatch]);

  const handleFocus = useCallback(() => {
    gsap.to(inputWrapRef.current, {
      boxShadow: `0 0 0 3px ${INDIGO}22`,
      borderColor: 'rgba(99,102,241,0.45)',
      duration: 0.2,
      ease: 'power2.out',
    });
  }, []);

  const handleBlur = useCallback(() => {
    gsap.to(inputWrapRef.current, {
      boxShadow: '0 0 0 0px transparent',
      borderColor: BORDER,
      duration: 0.2,
      ease: 'power2.out',
    });
  }, []);

  const handleExpand = useCallback(() => {
    animateClose(() => {
      dispatch(closeCompact());
      navigate('/ai-workspace');
    });
  }, [animateClose, dispatch, navigate]);

  const handleClose = useCallback(() => {
    animateClose(() => dispatch(closeCompact()));
  }, [animateClose, dispatch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div
      ref={panelRef}
      className="
        fixed z-50 flex flex-col overflow-hidden rounded-2xl border
        inset-x-3 bottom-3 max-h-[85dvh] w-auto
        sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-80 sm:max-h-[500px] sm:rounded-2xl
        md:right-8 md:bottom-8 md:w-96
        lg:right-12 lg:bottom-8
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
      {/* â”€â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className="relative overflow-hidden p-3 sm:p-3.5 flex items-center justify-between shrink-0"
        style={{
          background: `linear-gradient(110deg, ${INDIGO} 0%, ${BLUE} 55%, ${CYAN} 110%)`,
        }}
      >
        <Sparkles size={48} className="absolute -right-2 -top-2 opacity-15 rotate-12 text-white sm:w-14 sm:h-14" />

        <div className="flex items-center gap-2 sm:gap-3 relative text-white min-w-0 flex-1">
          <div
            ref={headerIconRef}
            className="rounded-full p-1.5 shrink-0"
            style={{ background: 'rgba(255,255,255,0.22)' }}
          >
            <Bot size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-semibold text-xs sm:text-sm tracking-wide truncate">
              Scholar AI Assistant
            </span>
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/85">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block animate-pulse shrink-0"
                style={{ background: ACCENT }}
              />
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-white shrink-0">
          <button
            onClick={handleExpand}
            className="p-1.5 sm:p-2 hover:bg-white/20 active:bg-white/25 rounded-lg transition-colors"
            aria-label="Expand chat"
          >
            <Maximize2 size={14} className="sm:w-[15px] sm:h-[15px]" />
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 sm:p-2 hover:bg-white/20 active:bg-white/25 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={14} className="sm:w-[15px] sm:h-[15px]" />
          </button>
        </div>
      </div>

      {/* â”€â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto overscroll-contain"
        style={{ background: '#f8fafc' }}
      >
        {messages.map((msg, i) => (
          <div data-msg key={i}>
            <MessageBubble message={msg} compact />
          </div>
        ))}
        {loading && <TypingIndicator />}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-4 sm:mt-8 gap-2" style={{ color: MUTED }}>
            <div
              className="rounded-full p-2 sm:p-3"
              style={{
                background: `linear-gradient(135deg, ${INDIGO}14, ${CYAN}14)`,
                border: `1px solid ${BORDER}`,
              }}
            >
              <DotLottieReact
                src="../../../../public/animations/Robot-Says-Hi.lottie"
                autoplay
                loop
                className="relative z-10 h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
              />
            </div>
            <p className="text-center text-xs sm:text-sm" style={{ color: MUTED }}>
              Ask me anything...
            </p>
          </div>
        )}
      </div>

      {/* â”€â”€â”€ Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        className="p-2 sm:p-3 border-t shrink-0"
        style={{ borderColor: BORDER, background: '#ffffff' }}
      >
        <div
          ref={inputWrapRef}
          className="flex items-center gap-1 sm:gap-2 rounded-xl border px-1 transition-colors"
          style={{ background: '#f8fafc', borderColor: BORDER }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask ScholarAI..."
            className="flex-1 bg-transparent px-2 py-2.5 sm:py-2 text-base sm:text-sm focus:outline-none placeholder:text-gray-400"
            style={{ color: INK }}
            aria-label="Type your message"
          />
          <button
            ref={sendBtnRef}
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 sm:p-2.5 rounded-full disabled:opacity-30 transition-colors text-white shrink-0 mx-1"
            style={{
              background: !input.trim() || loading
                ? '#e2e8f0'
                : `linear-gradient(135deg, ${INDIGO}, ${BLUE} 55%, ${CYAN})`,
            }}
            aria-label="Send message"
          >
            <Send size={14} className="sm:w-[16px] sm:h-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}