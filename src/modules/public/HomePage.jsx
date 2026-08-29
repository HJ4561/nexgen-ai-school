// src/modules/public/HomePage.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
const ROLES = [
  {
    key: 'admin',
    label: 'Admin',
    tagline: 'Full control, zero guesswork',
    icon: Shield,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-600',
    text: 'text-blue-800',
    accent: 'text-blue-600',
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
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-600',
    text: 'text-emerald-800',
    accent: 'text-emerald-600',
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
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-600',
    text: 'text-amber-800',
    accent: 'text-amber-600',
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
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    iconBg: 'bg-purple-600',
    text: 'text-purple-800',
    accent: 'text-purple-600',
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
const MODULES = [
  { label: 'Attendance Tracking',  icon: CheckCircle,   bg: 'bg-blue-50',   iconColor: 'text-blue-600',   border: 'border-blue-200'   },
  { label: 'Fee Management',       icon: FileText,      bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'border-emerald-200' },
  { label: 'Assignments & Grades', icon: ClipboardList, bg: 'bg-amber-50',  iconColor: 'text-amber-600',  border: 'border-amber-200'  },
  { label: 'AI Role Chatbots',     icon: MessageSquare, bg: 'bg-purple-50', iconColor: 'text-purple-600',  border: 'border-purple-200'  },
  { label: 'Events & Activities',  icon: Calendar,      bg: 'bg-blue-50',   iconColor: 'text-blue-600',   border: 'border-blue-200'   },
  { label: 'Analytics Dashboard',  icon: BarChart3,     bg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'border-emerald-200' },
  { label: 'Notifications Hub',    icon: Bell,          bg: 'bg-amber-50',  iconColor: 'text-amber-600',  border: 'border-amber-200'  },
  { label: 'Complaint Management', icon: Settings,      bg: 'bg-purple-50', iconColor: 'text-purple-600',  border: 'border-purple-200'  },
];

// ─── Mobile hero role badge strip ──────────────────────────────────────────────
const MOBILE_ROLE_BADGES = [
  { label: 'Admin',   bg: 'bg-blue-600'   },
  { label: 'Teacher', bg: 'bg-emerald-600' },
  { label: 'Student', bg: 'bg-amber-600'  },
  { label: 'Parent',  bg: 'bg-purple-600'  },
];

// ─── Dashboard preview ─────────────────────────────────────────────────────────
function DashboardPreview() {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Background glow */}
      <div
        aria-hidden="true" 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-emerald-500/20 to-purple-500/20 blur-3xl rounded-3xl scale-95 pointer-events-none animate-blob-slow"
      />
      <div className="relative bg-white/95 backdrop-blur-md border border-white/50 shadow-soft rounded-2xl p-4 sm:p-5 animate-enter" style={{ '--stagger': 5 }}>
        {/* Window controls */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-gray-400 text-[10px] sm:text-xs italic">Dashboard Preview</span>
          <div aria-hidden="true" className="w-12 sm:w-16 h-3.5 bg-gray-100 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {[
            { label: 'Students', color: 'bg-blue-600',   Icon: Users         },
            { label: 'Teachers', color: 'bg-emerald-600', Icon: GraduationCap },
            { label: 'Classes',  color: 'bg-amber-600',  Icon: BookOpen      },
            { label: 'Events',   color: 'bg-purple-600', Icon: Calendar      },
          ].map((s, i) => {
            const Icon = s.Icon;
            return (
              <div
                key={s.label}
                className="bg-gray-50 rounded-xl p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-1.5 animate-fade-in"
                style={{ '--stagger': i + 6 }}
              >
                <div aria-hidden="true" className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${s.color} flex items-center justify-center`}>
                  <Icon size={11} className="sm:w-[13px] sm:h-[13px] text-white" />
                </div>
                <p className="text-gray-500 text-[10px] sm:text-xs text-center leading-tight">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Activity Chart */}
        <div aria-hidden="true" className="bg-gray-50 rounded-xl p-2 sm:p-3">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p className="text-gray-500 text-[10px] sm:text-xs font-medium">Activity Overview</p>
            <TrendingUp size={11} className="sm:w-[13px] sm:h-[13px] text-emerald-600" />
          </div>
          <div className="flex items-end gap-0.5 sm:gap-1 h-12 sm:h-16">
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
          <div className="flex justify-between mt-1 sm:mt-1.5 px-0.5">
            {['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((m) => (
              <span key={m} className="text-gray-400 text-[7px] sm:text-[9px]">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reveal wrapper ─────────────────────────────────────────────────────────────
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

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage() {
  const navigate = useNavigate();

  // ─── Navigate with role ──────────────────────────────────────────────
  const handleRegister = useCallback((role) => {
    navigate(`/register${role ? `?role=${role}` : ''}`);
  }, [navigate]);

  // ─── Set smooth scroll behavior ──────────────────────────────────────────
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <LandingNavbar />

      {/* ══════════════════════════════ HERO (dark) ═══════════════════════════ */}
      <section
        id="hero"
        className="relative bg-[#0a0e1a] bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.22),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.20),transparent_55%)] pt-16 sm:pt-20 pb-20 sm:pb-28 overflow-hidden"
      >
        {/* Background decorations */}
        <div aria-hidden="true" className="absolute inset-0 bg-grid-dark pointer-events-none" />
        <div aria-hidden="true" className="absolute top-0 left-1/3 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-500/25 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div aria-hidden="true" className="absolute bottom-0 right-1/4 w-48 sm:w-64 md:w-72 h-48 sm:w-64 md:h-72 bg-purple-500/25 rounded-full blur-3xl pointer-events-none animate-blob-slow" />
        <div aria-hidden="true" className="absolute top-1/3 right-1/4 w-40 sm:w-56 md:w-64 h-40 sm:w-56 md:h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-blob-slow" />

        <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-4 pl-0 sm:pl-4 lg:pl-6">
              <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm text-white/80 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full animate-enter" style={{ '--stagger': 0 }}>
                <Star size={8} className="sm:w-[10px] sm:h-[10px] text-amber-400 animate-pulse-soft" aria-hidden="true" />
                Complete School ERP — Admin, Teacher, Student, Parent
              </span>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight animate-enter" style={{ '--stagger': 1 }}>
                One platform for{' '}
                <span className="bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">every role</span>{' '}
                in your school
              </h1>

              <p className="text-sm sm:text-base text-white/65 leading-relaxed max-w-lg animate-enter" style={{ '--stagger': 2 }}>
                Attendance, grades, assignments, fee management, parent
                communication, all connected under one intelligent system.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 animate-enter" style={{ '--stagger': 3 }}>
                <button
                  type="button"
                  onClick={() => handleRegister()}
                  className="group flex items-center gap-2 bg-blue-600 hover:brightness-110 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-blue-600/25"
                >
                  Register Now
                  <ChevronRight size={12} className="sm:w-[14px] sm:h-[14px]" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-colors text-sm"
                >
                  Sign In
                </button>
              </div>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 animate-enter" style={{ '--stagger': 4 }}>
                {[
                  'No payment required',
                  'All 4 roles included',
                  'AI chatbot per role',
                ].map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 text-white/75 text-[10px] sm:text-[11px] font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                  >
                    <CheckCircle size={8} className="sm:w-[10px] sm:h-[10px] text-emerald-400" aria-hidden="true" />
                    {t}
                  </span>
                ))}
              </div>

              {/* Mobile role badges */}
              <div className="flex flex-wrap gap-1 pt-1 lg:hidden animate-enter" style={{ '--stagger': 5 }} aria-hidden="true">
                {MOBILE_ROLE_BADGES.map((b) => (
                  <span
                    key={b.label}
                    className={`${b.bg} text-white text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg`}
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
      <section id="roles" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10 sm:mb-12 lg:mb-16">
            <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Tailored Experiences
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Built for every role in your school
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-500 max-w-md mx-auto text-sm">
              Each dashboard is purpose-built. Everyone gets exactly what they need.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {ROLES.map((role, i) => {
              const Icon = role.icon;
              return (
                <Reveal
                  key={role.key}
                  index={i}
                  className={`${role.bg} border ${role.border} rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
                >
                  {/* Background gradient */}
                  <div
                    className="absolute bottom-0 right-0 w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                    style={{
                      background: `radial-gradient(circle at bottom right, ${role.accent.replace('text-', '')}, transparent 70%)`,
                    }}
                  />

                  {/* Blurred circle behind icon */}
                  <div
                    className="absolute -top-4 -left-8 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl opacity-10 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${role.accent.replace('text-', '')}, transparent 70%)`,
                    }}
                  />

                  {/* Role header */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${role.iconBg} shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={16} className="sm:w-[18px] sm:h-[18px] text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${role.text}`}>{role.label}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{role.tagline}</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="space-y-1.5 sm:space-y-2 flex-1 relative z-10">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                        <CheckCircle size={11} className="sm:w-[13px] sm:h-[13px] ${role.accent} shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Register CTA */}
                  <button
                    type="button"
                    onClick={() => handleRegister(role.key)}
                    className={`group w-full flex items-center justify-center gap-1.5 ${role.iconBg} hover:opacity-90 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all hover:shadow-lg relative z-10`}
                  >
                    Get started as {role.label}
                    <ChevronRight size={11} className="sm:w-[13px] sm:h-[13px]" aria-hidden="true" />
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ MODULES ═══════════════════════════════ */}
      <section id="modules" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white to-blue-50/20 relative">
        <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10 sm:mb-12 lg:mb-16">
            <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Everything You Need
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Powerful modules, all connected
            </h2>
            <p className="mt-2 sm:mt-3 text-gray-500 max-w-md mx-auto text-sm">
              From fee management to AI chatbots — every module talks to every other.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <Reveal
                  key={mod.label}
                  index={i}
                  className={`${mod.bg} border ${mod.border} rounded-2xl p-3 sm:p-4 lg:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/70 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon size={18} className="sm:w-[22px] sm:h-[22px] ${mod.iconColor}" aria-hidden="true" />
                  </div>
                  <p className="text-[11px] sm:text-sm font-semibold text-gray-800 leading-tight">{mod.label}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ CTA ════════════════════════════════════ */}
      <section className="py-14 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-500/15 via-emerald-500/15 to-purple-500/15 relative overflow-hidden">
        <div className="max-w-xl mx-auto relative px-4 sm:px-6">
          <Reveal className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/40 text-center px-6 sm:px-8 py-8 sm:py-10 lg:py-12 overflow-hidden">
            {/* Top accent bar */}
            <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600" />

            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-emerald-600 to-purple-600 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-blue-600/20">
              <GraduationCap size={20} className="sm:w-[24px] sm:h-[24px] text-white" aria-hidden="true" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
              Ready to get started?
            </h2>
            <p className="text-sm text-gray-500 mb-6 sm:mb-8 max-w-sm mx-auto">
              Register your account and wait for admin approval. Takes under 2 minutes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleRegister()}
                className="group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:scale-[1.02]"
              >
                Register Now
                <ChevronRight size={14} className="sm:w-[16px] sm:h-[16px]" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl transition-colors"
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