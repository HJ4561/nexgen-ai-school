/**
 * ============================================
 * LANDING NAVBAR COMPONENT
 * ============================================
 * 
 * Purpose: Navigation bar for the public landing page
 * Used by: HomePage (public landing)
 * 
 * Features:
 * - Sticky navigation with backdrop blur
 * - Scroll-based background opacity
 * - Desktop and mobile responsive
 * - Hamburger menu for mobile
 * - Smooth transitions
 * - Logo with gradient text
 * - Navigation links with hover underline
 * - Sign In and Register buttons
 * - Dark theme matching hero section
 * 
 * Dependencies:
 * - react-router-dom for navigation
 * - lucide-react for icons
 * - Custom animations CSS
 * 
 * Usage:
 * <LandingNavbar />
 * ============================================
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import './animations.css';

/**
 * ============================================
 * NAVIGATION LINKS
 * ============================================
 * 
 * Navigation links for the landing page
 * Each link scrolls to the corresponding section
 * 
 * @constant {Array} NAV_LINKS
 * @property {string} label - Display label for the link
 * @property {string} href - Anchor href for the section
 */
const NAV_LINKS = [
  { label: 'Home',    href: '#hero'    },
  { label: 'Roles',   href: '#roles'   },
  { label: 'Modules', href: '#modules' },
];

/**
 * ============================================
 * LANDING NAVBAR COMPONENT
 * ============================================
 * 
 * Renders the landing page navigation bar
 * 
 * @returns {JSX.Element} Landing navbar UI
 * 
 * @example
 * // In HomePage
 * <LandingNavbar />
 */
function LandingNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /**
   * ============================================
   * SCROLL EVENT HANDLER
   * ============================================
   * 
   * Tracks scroll position to apply background opacity
   * When scrolled > 16px, navbar becomes more opaque
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e1a]/95 backdrop-blur-md shadow-soft border-b border-white/10'
          : 'bg-[#0a0e1a]/40 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ─── Logo ────────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-admin-primary via-teacher-primary to-parent-primary flex items-center justify-center shadow-lg shadow-admin-primary/20">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span
              className="font-bold text-lg"
              style={{
                background: 'linear-gradient(to right, #2563EB, #059669, #7C3AED)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              School ERP
            </span>
          </button>

          {/* ─── Desktop Navigation Links ────────────────────────────── */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-link text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ─── Desktop Action Buttons ────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-brand-primary hover:brightness-110 text-white px-5 py-2 rounded-button transition-all"
            >
              Register Now
            </button>
          </div>

          {/* ─── Mobile Hamburger Menu ────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden text-white/80 hover:text-white p-1 transition-colors"
          >
            <span className="relative block w-5.5 h-5.5">
              <Menu
                size={22}
                className={`absolute inset-0 transition-all duration-200 ${menuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}
              />
              <X
                size={22}
                className={`absolute inset-0 transition-all duration-200 ${menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ────────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden border-t border-white/10 bg-[#0a0e1a] transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {/* Mobile Navigation Links */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-medium text-white/70 py-2"
            >
              {link.label}
            </a>
          ))}
          
          {/* Mobile Action Buttons */}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-sm font-medium text-white bg-white/5 border border-white/15 rounded-button py-2 hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full text-sm font-semibold bg-brand-primary text-white rounded-button py-2 hover:brightness-110 transition-all"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default LandingNavbar;