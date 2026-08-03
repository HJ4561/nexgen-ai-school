/**
 * ============================================
 * HOME PAGE — Public landing page
 * ============================================
 * 
 * Purpose: Public landing page for School AI ERP
 * Used by: Unauthenticated users
 * 
 * Sections:
 * 1. LandingNavbar — dark floating nav (permanent dark theme)
 * 2. Hero — DARK navy bg, headline, buttons
 * 3. Role Cards — 4 colorful cards on light surface
 * 4. Modules — 8 feature tiles with subtle pattern
 * 5. CTA — Vibrant gradient background with floating card
 * 6. Footer — dark, matches navbar/hero
 * 
 * Features:
 * - Smooth scroll behavior
 * - Scroll-reveal animations
 * - Role-based registration
 * - Responsive design
 * - Dashboard preview
 * 
 * Route: <Route path="/" element={<HomePage />} />
 * 
 * Dependencies:
 * - React Router for navigation
 * - UI components (Footer)
 * - Custom animations CSS
 * ============================================
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, GraduationCap, BookOpen, Users,
  CheckCircle, Bell, Award, ChevronRight,
  Star, ClipboardList, FileText, MessageSquare,
  Calendar, BarChart3, TrendingUp, Settings,
} from 'lucide-react';

import LandingNavbar from "@/modules/public/LandingNavbar";
import Footer from "@/components/layout/Footer";
import './animations.css';

// ─── Scroll-reveal hook ─────────────────────────────────────────────────────────

/**
 * ============================================
 * USE REVEAL HOOK
 * ============================================
 * 
 * Custom hook for scroll-triggered reveal animations
 * Uses Intersection Observer API
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Visibility threshold (default: 0.15)
 * @param {string} options.rootMargin - Root margin (default: '0px 0px -40px 0px')
 * @returns {Array} [ref, isVisible] - Ref to attach and visibility state
 * 
 * @example
 * const [ref, isVisible] = useReveal({ threshold: 0.2 });
 * return <div ref={ref} className={isVisible ? 'visible' : 'hidden'}>Content</div>
 */
function useReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

// ─── Role cards config ─────────────────────────────────────────────────────────

/**
 * ============================================
 * ROLES CONFIGURATION
 * ============================================
 * 
 * Defines the four user roles with their properties
 * - Admin: Full control
 * - Teacher: Teach, grade, track
 * - Student: Academic life organized
 * - Parent: Stay close to child's progress
 */
const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    tagline: 'Full control, zero guesswork',
    icon: Shield,
    bg: 'bg-admin-light',
    border: 'border-admin-border',
    iconBg: 'bg-admin-primary',
    text: 'text-admin-text',
    accent: 'text-admin-primary',
    features: [
      'Approve & manage all user accounts',
      'Generate monthly fee challans',
      'Monitor school-wide attendance',
      'Post events & announcements',
      'Manage inventory & complaints',
    ],
  },
  {
    key: 'teacher',
    label: 'Teacher',
    tagline: 'Teach, grade, track — all in one',
    icon: GraduationCap,
    bg: 'bg-teacher-light',
    border: 'border-teacher-border',
    iconBg: 'bg-teacher-primary',
    text: 'text-teacher-text',
    accent: 'text-teacher-primary',
    features: [
      'Mark daily class attendance',
      'Enter exam & quiz marks',
      'Post assignments with deadlines',
      'Review & grade submissions',
      'Chat with parents directly',
    ],
  },
  {
    key: 'student',
    label: 'Student',
    tagline: 'Your academic life, organized',
    icon: BookOpen,
    bg: 'bg-student-light',
    border: 'border-student-border',
    iconBg: 'bg-student-primary',
    text: 'text-student-text',
    accent: 'text-student-primary',
    features: [
      'View report cards by term',
      'Check monthly attendance',
      'Submit & track assignments',
      'Download report card as PDF',
      'Stay updated on school events',
    ],
  },
  {
    key: 'parent',
    label: 'Parent',
    tagline: "Stay close to your child's progress",
    icon: Users,
    bg: 'bg-parent-light',
    border: 'border-parent-border',
    iconBg: 'bg-parent-primary',
    text: 'text-parent-text',
    accent: 'text-parent-primary',
    features: [
      'Toggle between multiple children',
      'View fee invoices & history',
      "Track child's attendance & grades",
      'Message subject teachers',
      'Get instant notifications',
    ],
  },
];

// ─── Module tiles ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * MODULES CONFIGURATION
 * ============================================
 * 
 * Feature modules displayed on the landing page
 * Each module has a unique color theme
 */
const MODULES = [
  { label: 'Attendance Tracking',  icon: CheckCircle,   bg: 'bg-admin-light',   iconColor: 'text-admin-primary',   border: 'border-admin-border'   },
  { label: 'Fee Management',       icon: FileText,      bg: 'bg-teacher-light', iconColor: 'text-teacher-primary', border: 'border-teacher-border' },
  { label: 'Assignments & Grades', icon: ClipboardList, bg: 'bg-student-light', iconColor: 'text-student-primary', border: 'border-student-border' },
  { label: 'AI Role Chatbots',     icon: MessageSquare, bg: 'bg-parent-light',  iconColor: 'text-parent-primary',  border: 'border-parent-border'  },
  { label: 'Events & Activities',  icon: Calendar,      bg: 'bg-admin-light',   iconColor: 'text-admin-primary',   border: 'border-admin-border'   },
  { label: 'Analytics Dashboard',  icon: BarChart3,     bg: 'bg-teacher-light', iconColor: 'text-teacher-primary', border: 'border-teacher-border' },
  { label: 'Notifications Hub',    icon: Bell,          bg: 'bg-student-light', iconColor: 'text-student-primary', border: 'border-student-border' },
  { label: 'Complaint Management', icon: Settings,      bg: 'bg-parent-light',  iconColor: 'text-parent-primary',  border: 'border-parent-border'  },
];

// ─── Mobile hero role badge strip ──────────────────────────────────────────────

/**
 * ============================================
 * MOBILE ROLE BADGES
 * ============================================
 * 
 * Compact role badges shown on mobile view
 */
const MOBILE_ROLE_BADGES = [
  { label: 'Admin',   bg: 'bg-admin-primary'   },
  { label: 'Teacher', bg: 'bg-teacher-primary' },
  { label: 'Student', bg: 'bg-student-primary' },
  { label: 'Parent',  bg: 'bg-parent-primary'  },
];

// ─── Dashboard preview ─────────────────────────────────────────────────────────

/**
 * ============================================
 * DASHBOARD PREVIEW COMPONENT
 * ============================================
 * 
 * Mini dashboard preview for the hero section
 * Shows stats cards and activity chart
 * 
 * @returns {JSX.Element} Dashboard preview UI
 */
function DashboardPreview() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-br from-admin-primary/20 via-teacher-primary/20 to-parent-primary/20 blur-3xl rounded-3xl scale-95 pointer-events-none animate-blob-slow"
      />
      <div className="relative bg-white/95 backdrop-blur-md border border-white/50 shadow-soft rounded-2xl p-5 animate-enter" style={{ '--stagger': 5 }}>
        {/* Window controls */}
        <div className="flex items-center justify-between mb-4">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
          </div>
          <span className="text-text-muted text-xs italic">Dashboard Preview</span>
          <div aria-hidden="true" className="w-16 h-3.5 bg-surface-dim rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Students', color: 'bg-admin-primary',   Icon: Users         },
            { label: 'Teachers', color: 'bg-teacher-primary', Icon: GraduationCap },
            { label: 'Classes',  color: 'bg-student-primary', Icon: BookOpen      },
            { label: 'Events',   color: 'bg-parent-primary',  Icon: Calendar      },
          ].map((s, i) => {
            const Icon = s.Icon;
            return (
              <div
                key={s.label}
                className="bg-surface-dim rounded-xl p-3 flex flex-col items-center gap-1.5 animate-fade-in"
                style={{ '--stagger': i + 6 }}
              >
                <div aria-hidden="true" className={`w-7 h-7 rounded-lg ${s.color} flex items-center justify-center`}>
                  <Icon size={13} className="text-white" />
                </div>
                <p className="text-text-secondary text-xs text-center leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Activity Chart */}
        <div aria-hidden="true" className="bg-surface-dim rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-text-secondary text-xs font-medium">Activity Overview</p>
            <TrendingUp size={13} className="text-success" />
          </div>
          <div className="flex items-end gap-1 h-16">
            {[35, 55, 45, 70, 60, 80, 72, 90].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm animate-grow-bar"
                style={{
                  height: `${h}%`,
                  backgroundColor: `rgba(37,99,235,${0.35 + i * 0.07})`,
                  '--stagger': i,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">
            {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
              <span key={m} className="text-text-muted text-[9px]">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reveal wrapper ─────────────────────────────────────────────────────────────

/**
 * ============================================
 * REVEAL WRAPPER COMPONENT
 * ============================================
 * 
 * Wraps content with scroll-triggered reveal animation
 * 
 * @param {Object} props - Component props
 * @param {string} props.as - HTML tag to render as (default: 'div')
 * @param {number} props.index - Stagger index for animation delay
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Child content
 * @returns {JSX.Element} Reveal wrapper
 */
function Reveal({ as: Tag = 'div', index = 0, className = '', children, ...rest }) {
  const [ref, isVisible] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ '--stagger': index }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * ============================================
 * HOME PAGE COMPONENT
 * ============================================
 * 
 * Renders the public landing page
 * 
 * @returns {JSX.Element} Landing page
 * 
 * @example
 * // In router:
 * <Route path="/" element={<HomePage />} />
 */
function HomePage() {
  const navigate = useNavigate();

  // ─── Set smooth scroll behavior ──────────────────────────────────────────

  /**
   * ============================================
   * SMOOTH SCROLL
   * ============================================
   * 
   * Sets smooth scrolling behavior on mount
   * Restores previous behavior on unmount
   */
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface font-sans">
      <LandingNavbar />

      {/* ══════════════════════════════ HERO (dark) ═══════════════════════════ */}
      <section
        id="hero"
        className="relative bg-[#0a0e1a] bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.22),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.20),transparent_55%)] pt-20 pb-28 px-4 overflow-hidden"
      >
        {/* Background decorations */}
        <div aria-hidden="true" className="absolute inset-0 bg-grid-dark pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 left-1/3 w-96 h-96 bg-admin-primary/25 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div aria-hidden="true" className="absolute bottom-0 right-1/4 w-72 h-72 bg-parent-primary/25 rounded-full blur-3xl pointer-events-none animate-blob-slow" />
        <div aria-hidden="true" className="absolute top-1/3 right-1/4 w-64 h-64 bg-teacher-primary/15 rounded-full blur-3xl pointer-events-none animate-blob-slow" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 pl-6">
              <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm text-white/80 text-xs font-medium px-3 py-1 rounded-full animate-enter" style={{ '--stagger': 0 }}>
                <Star size={10} className="text-student-primary animate-pulse-soft" aria-hidden="true" />
                Complete School ERP — Admin, Teacher, Student, Parent
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight animate-enter" style={{ '--stagger': 1 }}>
                One platform for{' '}
                <span className="bg-linear-to-r from-admin-primary via-teacher-primary to-parent-primary bg-clip-text text-transparent whitespace-nowrap">every role</span>{' '}
                in your school
              </h1>

              <p className="text-sm sm:text-base text-white/65 leading-relaxed max-w-lg animate-enter" style={{ '--stagger': 2 }}>
                Attendance, grades, assignments, fee management, parent
                communication, all connected under one intelligent system.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 animate-enter" style={{ '--stagger': 3 }}>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="group flex items-center gap-2 bg-brand-primary hover:brightness-110 text-white font-semibold px-5 py-2.5 rounded-button transition-all text-sm shadow-lg shadow-brand-primary/25"
                >
                  Register Now
                  <ChevronRight size={14} aria-hidden="true" className="chevron-nudge" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium px-5 py-2.5 rounded-button transition-colors text-sm"
                >
                  Sign In
                </button>
              </div>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2 pt-1 animate-enter" style={{ '--stagger': 4 }}>
                {[
                  'No payment required',
                  'All 4 roles included',
                  'AI chatbot per role',
                ].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/75 text-[11px] font-medium px-2.5 py-1 rounded-full"
                  >
                    <CheckCircle size={10} className="text-teacher-primary" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>

              {/* Mobile role badges */}
              <div className="flex flex-wrap gap-1.5 pt-1 lg:hidden animate-enter" style={{ '--stagger': 5 }} aria-hidden="true">
                {MOBILE_ROLE_BADGES.map((b) => (
                  <span
                    key={b.label}
                    className={`${b.bg} text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg`}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Dashboard Preview (Desktop) */}
            <div className="hidden lg:block">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ ROLE CARDS (light) ════════════════════ */}
      <section id="roles" className="py-24 px-4 bg-surface-dim">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-2">
              Tailored Experiences
            </p>
            <h2 className="text-3xl font-bold text-text-primary">
              Built for every role in your school
            </h2>
            <p className="mt-3 text-text-secondary max-w-md mx-auto text-sm">
              Each dashboard is purpose-built. Everyone gets exactly what they need.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <Reveal
                  key={role.key}
                  index={i}
                  className={`${role.bg} border ${role.border} rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Background gradient */}
                  <div
                    className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-opacity duration-500 group-hover:opacity-50"
                    style={{
                      background: `radial-gradient(circle at bottom right, ${role.accent.replace('text-', 'var(--color-')}, transparent 70%)`,
                    }}
                  />

                  {/* Blurred circle behind icon */}
                  <div
                    className="absolute -top-8 -left-8 w-20 h-20 rounded-full blur-2xl opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${role.accent.replace('text-', 'var(--color-')}, transparent 70%)`,
                    }}
                  />

                  {/* Role header */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-xl ${role.iconBg} shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={18} className="text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${role.text}`}>{role.label}</p>
                      <p className="text-xs text-text-muted leading-tight">{role.tagline}</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-2 flex-1 relative z-10">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle size={13} className={`${role.accent} shrink-0 mt-0.5`} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Register CTA */}
                  <button
                    type="button"
                    onClick={() => navigate(`/register?role=${role.key}`)}
                    className={`group w-full flex items-center justify-center gap-1.5 ${role.iconBg} hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-lg relative z-10`}
                  >
                    Get started as {role.label}
                    <ChevronRight size={13} aria-hidden="true" className="chevron-nudge" />
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ MODULES ═══════════════════════════════ */}
      <section id="modules" className="py-24 px-4 bg-linear-to-b from-surface to-admin-light/20 bg-dots-light relative">
        <div className="max-w-7xl mx-auto relative">
          <Reveal className="text-center mb-16">
            <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest mb-2">
              Everything You Need
            </p>
            <h2 className="text-3xl font-bold text-text-primary">
              Powerful modules, all connected
            </h2>
            <p className="mt-3 text-text-secondary max-w-md mx-auto text-sm">
              From fee management to AI chatbots — every module talks to every other.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Reveal
                  key={mod.label}
                  index={i}
                  className={`${mod.bg} border ${mod.border} rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/70 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon size={22} className={mod.iconColor} aria-hidden="true" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-tight">{mod.label}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA ════════════════════════════════════ */}
      <section className="py-20 px-4 bg-linear-to-br from-admin-primary/15 via-teacher-primary/15 to-parent-primary/15 relative overflow-hidden">
        <div className="max-w-xl mx-auto relative">
          <Reveal className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40 text-center px-8 py-12 overflow-hidden">
            {/* Top accent bar */}
            <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-admin-primary via-teacher-primary to-parent-primary" />

            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-admin-primary via-teacher-primary to-parent-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-primary/20">
              <GraduationCap size={24} className="text-white" aria-hidden="true" />
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Ready to get started?
            </h2>
            <p className="text-text-secondary text-sm mb-8 max-w-sm mx-auto">
              Register your account and wait for admin approval. Takes under 2 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="group flex items-center justify-center gap-2 bg-brand-primary hover:bg-admin-primary text-white font-semibold px-8 py-3 rounded-button transition-all shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:scale-[1.02]"
              >
                Register Now
                <ChevronRight size={16} aria-hidden="true" className="chevron-nudge" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-surface hover:bg-surface-muted border border-surface-muted text-text-primary font-medium px-8 py-3 rounded-button transition-colors"
              >
                Sign In
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;