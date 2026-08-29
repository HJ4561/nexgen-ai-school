// src/modules/public/LandingNavbar.jsx
import React, { useEffect, useState, useCallback } from 'react';
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

  /**
   * ============================================
   * HANDLE NAVIGATION
   * ============================================
   * 
   * Closes mobile menu and navigates to the given path
   * 
   * @param {string} path - Path to navigate to
   */
  const handleNavigate = useCallback((path) => {
    setMenuOpen(false);
    navigate(path);
  }, [navigate]);

  /**
   * ============================================
   * HANDLE LINK CLICK
   * ============================================
   * 
   * Closes mobile menu when a link is clicked
   */
  const handleLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e1a]/95 backdrop-blur-md shadow-lg border-b border-white/10'
          : 'bg-[#0a0e1a]/40 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* ─── Logo ────────────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all"
            aria-label="Go to homepage"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-600 via-emerald-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <GraduationCap size={14} className="sm:w-[16px] sm:h-[16px] text-white" />
            </div>
            <span
              className="font-bold text-base sm:text-lg"
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
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={handleLinkClick}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-500 after:transition-all hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* ─── Desktop Action Buttons ────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('/login')}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg hover:bg-white/5"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/register')}
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl"
            >
              Register Now
            </button>
          </div>

          {/* ─── Mobile Hamburger Menu ────────────────────────────────── */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <span className="relative block w-5 h-5 sm:w-5.5 sm:h-5.5">
              <Menu
                size={20}
                className={`absolute inset-0 transition-all duration-200 ${
                  menuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                size={20}
                className={`absolute inset-0 transition-all duration-200 ${
                  menuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ────────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden border-t border-white/10 bg-[#0a0e1a] transition-all duration-300 ease-out ${
          menuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 border-t-transparent'
        }`}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-1">
          {/* Mobile Navigation Links */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={handleLinkClick}
              className="block text-sm font-medium text-white/70 hover:text-white py-2.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          
          {/* Mobile Action Buttons */}
          <div className="pt-4 flex flex-col gap-2.5 border-t border-white/10 mt-2">
            <button
              type="button"
              onClick={() => handleNavigate('/login')}
              className="w-full text-sm font-medium text-white bg-white/5 border border-white/15 rounded-xl py-2.5 px-4 hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/register')}
              className="w-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-4 transition-all shadow-lg shadow-blue-600/25"
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