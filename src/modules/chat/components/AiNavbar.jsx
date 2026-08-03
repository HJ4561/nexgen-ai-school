import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Settings, Bell, LogOut, Sparkles, Menu } from 'lucide-react';

// Same palette as ChatArea / Sidebar / MessageBubble — keep in sync.
// Sidebar now uses a dark navy (#0e1527 → #0a101c) background with an
// indigo-500 accent, so the navbar mirrors that instead of the old
// violet/blue/cyan gradient.
const NAVY_TOP = '#0e1527';
const NAVY_BOTTOM = '#0a101c';
const INDIGO = '#6366f1';
const INDIGO_LIGHT = '#818cf8';

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AiNavbar({
  userName,
  userRole,
  onLogout,
  onSettingsClick,
  notificationCount = 0,
  onNotificationClick,
  onMenuClick,
}) {
  const barRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      barRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (notificationCount > 0 && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.35, ease: 'back.out(3)' }
      );
    }
  }, [notificationCount]);

  return (
    <header
      ref={barRef}
      className="relative flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b shrink-0 gap-2"
      style={{
        background: `linear-gradient(180deg, ${NAVY_TOP}e6, ${NAVY_BOTTOM}e6)`,
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      }}
    >
      {/* left: menu toggle (mobile) + workspace identity */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden -ml-1 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: INDIGO,
            boxShadow: `0 4px 14px -4px ${INDIGO}66`,
          }}
        >
          <Sparkles size={15} className="text-white sm:hidden" />
          <Sparkles size={16} className="text-white hidden sm:block" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-sm font-semibold text-white tracking-tight truncate">AI Workspace</p>
          <p className="text-[11px] text-white/40 hidden sm:block">ScholarAI is ready to help</p>
        </div>
      </div>

      {/* right: actions + user */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={onNotificationClick}
          className="relative p-1.5 sm:p-2 rounded-lg text-white/50 hover:text-white transition-colors"
          onMouseEnter={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(255,255,255,0.06)', duration: 0.2 })
          }
          onMouseLeave={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.2 })
          }
          aria-label="Notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span
              ref={badgeRef}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
              style={{ background: INDIGO }}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        <button
          onClick={onSettingsClick}
          className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-lg text-white/50 hover:text-white transition-colors"
          onMouseEnter={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(255,255,255,0.06)', duration: 0.2 })
          }
          onMouseLeave={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.2 })
          }
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        <div className="flex items-center gap-2.5 pl-0 sm:pl-1">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{
              background: INDIGO,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.08)`,
            }}
          >
            {initials(userName)}
          </div>
          <div className="leading-tight hidden md:block">
            <p className="text-sm font-medium text-white truncate max-w-[120px]">
              {userName || 'User'}
            </p>
            <p className="text-[11px] text-white/40 capitalize">{userRole}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="ml-0.5 sm:ml-1 p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-red-400 transition-colors"
          onMouseEnter={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(248,113,113,0.1)', duration: 0.2 })
          }
          onMouseLeave={(e) =>
            gsap.to(e.currentTarget, { backgroundColor: 'rgba(255,255,255,0)', duration: 0.2 })
          }
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
