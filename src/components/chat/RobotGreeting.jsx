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
      // Entrance animation
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }
      );

      // Gentle idle float - responsive amplitude
      const floatAmount = window.innerWidth < 640 ? -4 : -8;
      gsap.to(wrapRef.current, {
        y: floatAmount,
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

  // Responsive sizes
  const containerSize = {
    width: window.innerWidth < 480 ? 120 : window.innerWidth < 640 ? 150 : 200,
    height: window.innerWidth < 480 ? 120 : window.innerWidth < 640 ? 150 : 200,
  };

  const glowSize = {
    width: window.innerWidth < 480 ? 120 : window.innerWidth < 640 ? 150 : 180,
    height: window.innerWidth < 480 ? 120 : window.innerWidth < 640 ? 150 : 180,
  };

  return (
    <div 
      ref={wrapRef} 
      className="relative flex flex-col items-center mb-2 sm:mb-3 select-none px-2 sm:px-4"
    >
      {/* Glow effect - hidden on very small screens */}
      <div
        ref={glowRef}
        className="absolute rounded-full pointer-events-none hidden xs:block"
        style={{
          width: glowSize.width,
          height: glowSize.height,
          background: `radial-gradient(circle, ${VIOLET}40 0%, ${CYAN}20 60%, transparent 75%)`,
          filter: 'blur(10px)',
        }}
      />
      
      {/* Robot animation container */}
      <div 
        className="relative"
        style={{ 
          width: containerSize.width, 
          height: containerSize.height 
        }}
      >
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