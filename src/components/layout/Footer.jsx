/**
 * ============================================
 * FOOTER COMPONENT
 * ============================================
 * 
 * Purpose: Public footer for landing page and public pages
 * Features:
 * - Dark theme matching hero/navbar (bg-[#0a0e1a])
 * - Logo with signature gradient (admin→teacher→parent)
 * - Navigation links with hover effects
 * - Contact information with icons
 * - Copyright notice
 * - Sign In / Register buttons
 * - No Redux or auth dependency
 * 
 * Design Notes:
 * - Permanent dark theme bookends the dark hero: dark → light → dark
 * - Text contrast raised: headings/logo → white, body/links → white/65-70,
 *   fine print → white/40 (fine print is conventionally low contrast)
 * - Link hovers move toward white (more contrast pattern used elsewhere)
 * - Logo mark uses signature gradient matching hero accent word and navbar logo
 * 
 * Dependencies:
 * - react-router-dom for navigation
 * - lucide-react for icons (GraduationCap, Mail, Phone, MapPin)
 * 
 * Usage:
 * <Footer />
 * ============================================
 */

import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

/**
 * ============================================
 * FOOTER NAVIGATION LINKS
 * ============================================
 * 
 * Navigation links shown in the footer
 * Each link has a label and href to the corresponding section
 * 
 * @constant {Array} FOOTER_LINKS
 * @property {string} label - Display label for the link
 * @property {string} href - Anchor href for the link
 */
const FOOTER_LINKS = [
  { label: 'Home',    href: '#hero'    },
  { label: 'Roles',   href: '#roles'   },
  { label: 'Modules', href: '#modules' },
];

/**
 * ============================================
 * FOOTER COMPONENT
 * ============================================
 * 
 * Renders the public footer with brand, navigation, and contact info
 * 
 * @returns {JSX.Element} Footer UI
 * 
 * @example
 * // In layout or landing page
 * <Layout>
 *   <HeroSection />
 *   <FeaturesSection />
 *   <Footer />
 * </Layout>
 * ============================================
 */
function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0a0e1a] pt-12 pb-6 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ─── Top Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-10 border-b border-white/10">

          {/* ─── Brand Section ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {/* Logo mark with signature gradient */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-admin-primary via-teacher-primary to-parent-primary flex items-center justify-center">
                <GraduationCap size={15} className="text-white" />
              </div>
              <span className="font-bold text-white">School AI</span>
            </div>
            <p className="text-sm text-white/65 leading-relaxed max-w-xs">
              A complete school management ERP — built for admins, teachers, students, and parents.
            </p>
          </div>

          {/* ─── Navigation Links ─── */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Navigation
            </p>
            <div className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-white/65 hover:text-white hover:underline underline-offset-4 decoration-white/30 transition-colors w-fit"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* ─── Contact Section ─── */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">
              Contact
            </p>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-white/45 shrink-0" />
                <a
                  href="mailto:info@schoolai.edu.pk"
                  className="text-sm text-white/65 hover:text-white transition-colors"
                >
                  info@schoolai.edu.pk
                </a>
              </div>
              {/* Phone */}
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-white/45 shrink-0" />
                <a
                  href="tel:+923000000000"
                  className="text-sm text-white/65 hover:text-white transition-colors"
                >
                  +92-300-0000000
                </a>
              </div>
              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-white/45 shrink-0 mt-0.5" />
                <p className="text-sm text-white/65">
                  Lahore, Punjab, Pakistan
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          {/* Copyright */}
          <p className="text-xs text-white/40">
            © 2026 School AI ERP. All rights reserved.
          </p>
          
          {/* Auth Links */}
          <div className="flex gap-5">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;