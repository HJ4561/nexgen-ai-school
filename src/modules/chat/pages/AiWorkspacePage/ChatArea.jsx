import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Send, Paperclip, Mic } from 'lucide-react';
import gsap from 'gsap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { sendMessage } from '@/store/chat/chatThunks';
import MessageBubble from '@/modules/chat/components/MessageBubble';
import TypingIndicator from '@/modules/chat/components/TypingIndicator';
import PromptCards from '@/modules/chat/components/PromptCards';
import RobotGreeting from '@/modules/chat/components/RobotGreeting';
// import ChildSelector from '../../components/ChildSelector'; // removed

// Same palette as ChatCompact / MessageBubble / TypingIndicator — keep in sync.
const INDIGO = '#6366f1';
const BLUE = '#3b82f6';
const CYAN = '#06b6d4';
const ACCENT = '#10b981';
const INK = '#0f172a';
const MUTED = '#64748b';
const BORDER = 'rgba(15, 23, 42, 0.08)';

export default function ChatArea() {
  const dispatch = useDispatch();
  const { messages, loading, currentSession } = useSelector((s) => s.chat);
  const [input, setInput] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const messagesEndRef = useRef(null);

  const rootRef = useRef(null);
  const orbARef = useRef(null);
  const orbBRef = useRef(null);
  const orbCRef = useRef(null);
  const listRef = useRef(null);
  const inputBarRef = useRef(null);
  const inputWrapRef = useRef(null);
  const sendBtnRef = useRef(null);
  const introRef = useRef(null);
  const contentRef = useRef(null);
  const prevMsgCount = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Intro splash: play once on open, then fade out to reveal the chat UI
  useEffect(() => {
    if (!showIntro) return;
    gsap.set(contentRef.current, { opacity: 0, scale: 0.98 });

    const timer = setTimeout(() => {
      const tl = gsap.timeline({ onComplete: () => setShowIntro(false) });
      tl.to(introRef.current, {
        opacity: 0,
        scale: 1.08,
        duration: 0.5,
        ease: 'power2.inOut',
      }).to(
        contentRef.current,
        { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' },
        '-=0.35'
      );
    }, 1400); // roughly one loop of the intro animation before dismissing

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ambient orb drift (subtle, low-opacity in light mode) + page-load entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inputBarRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)', delay: showIntro ? 1.6 : 0.15 }
      );

      const drift = (el, dur, dx, dy) => {
        if (!el) return;
        gsap.to(el, {
          x: dx,
          y: dy,
          duration: dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      };
      drift(orbARef.current, 14, 60, 40);
      drift(orbBRef.current, 18, -50, 30);
      drift(orbCRef.current, 22, 40, -50);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Stagger-in animation for newly arrived messages
  useEffect(() => {
    if (!listRef.current) return;
    const nodes = listRef.current.querySelectorAll('[data-msg]');
    const newCount = messages.length - prevMsgCount.current;

    if (newCount > 0) {
      const newest = Array.from(nodes).slice(-newCount);
      gsap.fromTo(
        newest,
        { opacity: 0, y: 18, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out', stagger: 0.08 }
      );
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    gsap
      .timeline()
      .to(sendBtnRef.current, { scale: 0.85, duration: 0.1, ease: 'power2.out' })
      .to(sendBtnRef.current, { scale: 1, duration: 0.25, ease: 'back.out(3)' })
      .fromTo(
        sendBtnRef.current,
        { boxShadow: `0 0 0 0 ${ACCENT}55` },
        { boxShadow: `0 0 0 12px ${ACCENT}00`, duration: 0.6, ease: 'power1.out' },
        '<'
      );

    dispatch(sendMessage({ content: input.trim() }));
    setInput('');
  };

  const handleFocus = () => {
    gsap.to(inputWrapRef.current, {
      boxShadow: `0 0 0 3px ${INDIGO}22`,
      borderColor: 'rgba(99,102,241,0.45)',
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleBlur = () => {
    gsap.to(inputWrapRef.current, {
      boxShadow: '0 0 0 0px transparent',
      borderColor: BORDER,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  return (
    <main
      ref={rootRef}
      className="relative flex-1 flex flex-col overflow-hidden min-h-0 min-w-0 h-full"
      style={{ background: '#f8fafc' }}
    >
      {/* Soft ambient background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="orbA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={INDIGO} stopOpacity="0.14" />
            <stop offset="100%" stopColor={INDIGO} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.12" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={CYAN} stopOpacity="0.1" />
            <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle ref={orbARef} cx="18%" cy="20%" r="180" className="sm:hidden" fill="url(#orbA)" />
        <circle ref={orbARef} cx="18%" cy="20%" r="260" className="hidden sm:block" fill="url(#orbA)" />
        <circle ref={orbBRef} cx="85%" cy="15%" r="150" className="sm:hidden" fill="url(#orbB)" />
        <circle ref={orbBRef} cx="85%" cy="15%" r="220" className="hidden sm:block" fill="url(#orbB)" />
        <circle ref={orbCRef} cx="50%" cy="90%" r="200" className="sm:hidden" fill="url(#orbC)" />
        <circle ref={orbCRef} cx="50%" cy="90%" r="300" className="hidden sm:block" fill="url(#orbC)" />
      </svg>

      {/* Intro splash — plays once when the chat UI opens */}
      {showIntro && (
        <div
          ref={introRef}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 px-6"
          style={{ background: '#f8fafc' }}
        >
          <div className="w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[400px] lg:h-[400px]">
            <DotLottieReact
              src="/animations/Guy talking to Robot _ AI Help.lottie"
              autoplay
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="text-[10px] sm:text-xs tracking-widest uppercase text-center" style={{ color: MUTED }}>
            Waking up ScholarAI…
          </p>
        </div>
      )}

      {/* Content — this is the scroll container; only it scrolls, not the whole page */}
      <div
        ref={contentRef}
        className="relative z-10 flex-1 w-full min-h-0 overflow-y-auto overscroll-contain"
      >
        <div
          className={`max-w-[900px] mx-auto w-full flex flex-col items-center px-4 sm:px-6 pb-32 sm:pb-32 lg:pb-28 ${
            messages.length === 0 && !loading
              ? 'justify-center min-h-full'
              : 'justify-start pt-6 sm:pt-8'
          }`}
        >
          {messages.length === 0 && !loading ? (
            <>
              <RobotGreeting />
              <PromptCards />
            </>
          ) : (
            <div ref={listRef} className="w-full space-y-3 sm:space-y-4">
              {messages.map((msg, i) => (
                <div data-msg key={i}>
                  <MessageBubble message={msg} />
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div
        ref={inputBarRef}
        className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 lg:bottom-8 lg:left-[calc(256px+48px)] lg:right-[48px] max-w-[900px] mx-auto z-40"
      >
        <div
          ref={inputWrapRef}
          className="rounded-full p-1.5 pl-3 sm:p-2 sm:pl-6 flex items-center gap-1.5 sm:gap-3 border transition-colors"
          style={{
            background: '#ffffff',
            borderColor: BORDER,
            boxShadow:
              '0 20px 40px -16px rgba(15,23,42,0.16), 0 4px 12px -4px rgba(15,23,42,0.06)',
          }}
        >
         
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type your prompt here"
            className="flex-1 min-w-0 bg-transparent border-none outline-none focus:ring-0 text-sm sm:text-base"
            style={{ color: INK }}
          />
          <div className="flex items-center gap-1 sm:gap-2 pr-0.5 sm:pr-1 shrink-0">
           
            <button
              ref={sendBtnRef}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 sm:p-3 rounded-full flex items-center justify-center active:scale-95 transition-all disabled:opacity-40 text-white shrink-0"
              style={{
                background:
                  !input.trim() || loading
                    ? '#e2e8f0'
                    : `linear-gradient(135deg, ${INDIGO}, ${BLUE} 55%, ${CYAN})`,
              }}
            >
              <Send size={18} className="sm:hidden" />
              <Send size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>
        <p
          className="text-center mt-2 sm:mt-3 text-[9px] sm:text-[10px] uppercase tracking-widest px-2"
          style={{ color: '#94a3b8' }}
        >
          ScholarAI can make mistakes. Verify your research.
        </p>
      </div>
    </main>
  );
}
