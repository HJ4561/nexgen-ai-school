/**
 * ============================================
 * AI NAVBAR COMPONENT
 * ============================================
 * 
 * Purpose: Top navigation bar for AI Workspace with user controls
 * Features:
 * - Gradient background with blur effect (dark navy theme)
 * - Workspace identity with Sparkles icon
 * - Mobile menu toggle
 * - Notification bell with animated badge
 * - Settings button
 * - User avatar with initials
 * - User name and role display
 * - Logout button with hover effects
 * - GSAP animations on mount and badge updates
 * - Responsive design (mobile/desktop)
 * 
 * Dependencies:
 * - gsap for animations
 * - lucide-react for icons (Settings, Bell, LogOut, Sparkles, Menu)
 * 
 * Usage:
 * <AiNavbar
 *   userName="John Doe"
 *   userRole="admin"
 *   onLogout={handleLogout}
 *   onSettingsClick={handleSettings}
 *   notificationCount={5}
 *   onNotificationClick={handleNotification}
 *   onMenuClick={handleMenuToggle}
 * />
 * ============================================
 */

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Settings, Bell, LogOut, Sparkles, Menu } from 'lucide-react';

/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 * 
 * Same palette as ChatArea / Sidebar / MessageBubble — keep in sync.
 * Sidebar uses a dark navy (#0e1527 → #0a101c) background with an
 * indigo-500 accent, so the navbar mirrors that instead of the old
 * violet/blue/cyan gradient.
 * 
 * @constant {string} NAVY_TOP - Top gradient color
 * @constant {string} NAVY_BOTTOM - Bottom gradient color
 * @constant {string} INDIGO - Primary accent color
 * @constant {string} INDIGO_LIGHT - Lighter accent color
 */
const NAVY_TOP = '#0e1527';
const NAVY_BOTTOM = '#0a101c';
const INDIGO = '#6366f1';
const INDIGO_LIGHT = '#818cf8';

/**
 * ============================================
 * GET USER INITIALS
 * ============================================
 * 
 * Extracts initials from a user's full name
 * - If single name: returns first letter
 * - If multiple names: returns first and last initials
 * - Fallback: returns '?'
 * 
 * @param {string} name - User's full name
 * @returns {string} Uppercase initials (max 2 characters)
 * 
 * @example
 * initials('John Doe') // "JD"
 * initials('Jane') // "JA"
 * initials('') // "?"
 */
function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * ============================================
 * AI NAVBAR COMPONENT
 * ============================================
 * 
 * Renders the main navigation bar with user controls
 * 
 * @param {Object} props - Component props
 * @param {string} props.userName - User's full name
 * @param {string} props.userRole - User's role (admin, teacher, student, parent)
 * @param {Function} props.onLogout - Callback for logout action
 * @param {Function} props.onSettingsClick - Callback for settings button
 * @param {number} props.notificationCount - Number of unread notifications
 * @param {Function} props.onNotificationClick - Callback for notification bell
 * @param {Function} props.onMenuClick - Callback for mobile menu toggle
 * @returns {JSX.Element} AI Navbar UI
 * 
 * @example
 * <AiNavbar
 *   userName="John Doe"
 *   userRole="admin"
 *   onLogout={() => dispatch(logout())}
 *   onSettingsClick={() => navigate('/settings')}
 *   notificationCount={3}
 *   onNotificationClick={() => openNotifications()}
 *   onMenuClick={() => toggleMobileMenu()}
 * />
 * ============================================
 */
export default function AiNavbar({
  userName,
  userRole,
  onLogout,
  onSettingsClick,
  notificationCount = 0,
  onNotificationClick,
  onMenuClick,
}) {
  // ─── Refs for GSAP animations ──────────────────────────────────────
  const barRef = useRef(null);
  const badgeRef = useRef(null);

  /**
   * ============================================
   * MOUNT ANIMATION
   * ============================================
   * 
   * Fades in the navbar from top on initial render
   * Duration: 0.5s with power2.out easing
   */
  useEffect(() => {
    gsap.fromTo(
      barRef.current,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  /**
   * ============================================
   * BADGE ANIMATION
   * ============================================
   * 
   * Animates the notification badge when count changes
   * Pops in with scale effect using back.out easing
   * Only triggers when notificationCount > 0
   */
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
      {/* =====================================
          LEFT SECTION
          Menu toggle + Workspace identity
      ===================================== */}

      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
        {/* ─── Mobile Menu Toggle ─── */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden -ml-1 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <Menu size={20} />
          </button>
        )}

        {/* ─── Workspace Icon ─── */}
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

        {/* ─── Workspace Identity ─── */}
        <div className="leading-tight min-w-0">
          <p className="text-sm font-semibold text-white tracking-tight truncate">
            AI Workspace
          </p>
          <p className="text-[11px] text-white/40 hidden sm:block">
            ScholarAI is ready to help
          </p>
        </div>
      </div>

      {/* =====================================
          RIGHT SECTION
          Actions + User profile
      ===================================== */}

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* ─── Notification Bell ─── */}
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
          {/* Notification badge */}
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

        {/* ─── Settings Button (desktop only) ─── */}
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

        {/* ─── Divider ─── */}
        <div className="hidden sm:block w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* ─── User Profile ─── */}
        <div className="flex items-center gap-2.5 pl-0 sm:pl-1">
          {/* User Avatar */}
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{
              background: INDIGO,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.08)`,
            }}
          >
            {initials(userName)}
          </div>
          {/* User Name & Role (desktop only) */}
          <div className="leading-tight hidden md:block">
            <p className="text-sm font-medium text-white truncate max-w-[120px]">
              {userName || 'User'}
            </p>
            <p className="text-[11px] text-white/40 capitalize">{userRole}</p>
          </div>
        </div>

        {/* ─── Logout Button ─── */}
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