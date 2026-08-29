// src/components/layout/Footer.jsx
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = [
  { label: 'Home',    href: '#hero'    },
  { label: 'Roles',   href: '#roles'   },
  { label: 'Modules', href: '#modules' },
];

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#0a0e1a] pt-8 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ─── Top Row ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pb-6 sm:pb-10 border-b border-white/10">

          {/* ─── Brand Section ─── */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-admin-primary via-teacher-primary to-parent-primary flex items-center justify-center">
                <GraduationCap size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
              </div>
              <span className="font-bold text-white text-sm sm:text-base">School AI</span>
            </div>
            <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-xs">
              A complete school management ERP — built for admins, teachers, students, and parents.
            </p>
          </div>

          {/* ─── Navigation Links ─── */}
          <div className="mt-2 sm:mt-0">
            <p className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 sm:mb-4">
              Navigation
            </p>
            <div className="space-y-2 sm:space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-xs sm:text-sm text-white/65 hover:text-white hover:underline underline-offset-4 decoration-white/30 transition-colors w-fit"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* ─── Contact Section ─── */}
          <div className="mt-2 sm:mt-0">
            <p className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 sm:mb-4">
              Contact
            </p>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail size={12} className="sm:w-[14px] sm:h-[14px] text-white/45 shrink-0" />
                <a
                  href="mailto:info@schoolai.edu.pk"
                  className="text-xs sm:text-sm text-white/65 hover:text-white transition-colors break-all"
                >
                  info@schoolai.edu.pk
                </a>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Phone size={12} className="sm:w-[14px] sm:h-[14px] text-white/45 shrink-0" />
                <a
                  href="tel:+923000000000"
                  className="text-xs sm:text-sm text-white/65 hover:text-white transition-colors"
                >
                  +92-300-0000000
                </a>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin size={12} className="sm:w-[14px] sm:h-[14px] text-white/45 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-white/65">
                  Lahore, Punjab, Pakistan
                </p>
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ─── */}
          <div className="mt-2 sm:mt-0">
            <p className="text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-widest mb-3 sm:mb-4">
              Quick Actions
            </p>
            <div className="flex flex-col gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-left text-xs sm:text-sm text-white/65 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-left text-xs sm:text-sm text-white/65 hover:text-white transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row ─── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 sm:pt-6">
          <p className="text-[10px] sm:text-xs text-white/40 text-center sm:text-left">
            © {new Date().getFullYear()} School AI ERP. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-5">
            <a
              href="#"
              className="text-[10px] sm:text-xs text-white/40 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[10px] sm:text-xs text-white/40 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;