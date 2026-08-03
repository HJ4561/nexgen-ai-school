import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Same palette as ChatArea / Sidebar / MessageBubble — keep in sync.
const VIOLET = '#8b5cf6';
const CYAN = '#22d3ee';

export default function RobotGreeting() {
  const wrapRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }
      );

      // Gentle idle float
      gsap.to(wrapRef.current, {
        y: -8,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Ambient glow pulse behind the animation
      gsap.to(glowRef.current, {
        scale: 1.15,
        opacity: 0.5,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative flex flex-col items-center mb-2 select-none">
      <div
        ref={glowRef}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180,
          height: 180,
          background: `radial-gradient(circle, ${VIOLET}40 0%, ${CYAN}20 60%, transparent 75%)`,
          filter: 'blur(10px)',
        }}
      />
      <div className="relative" style={{ width: 200, height: 200 }}>
        <DotLottieReact
          src="/animations/Live chatbot.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
