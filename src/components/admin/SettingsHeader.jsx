/**
 * ============================================
 * SETTINGS HEADER COMPONENT
 * ============================================
 * 
 * Purpose: Page header for Account Settings with role-based theming
 * Features:
 * - Role-based color theming (admin, teacher, student, parent)
 * - Animated settings icon with rotate effect
 * - Decorative dot grid texture
 * - Ambient glow effect
 * - Gradient background
 * - Responsive layout (flex flex-col md:flex-row column on mobile, row on desktop)
 * - Subtle backdrop blur on right panel
 * - Tracking-widest label with sparkle icon
 * 
 * Dependencies:
 * - lucide-react for icons (Settings, Sparkles)
 * - CSS custom properties for theming
 * - color-mix for dynamic color generation
 * 
 * Usage:
 * <SettingsHeader role="admin" />
 * ============================================
 */

import { Settings, Sparkles } from "lucide-react";

/**
 * ============================================
 * SETTINGS HEADER COMPONENT
 * ============================================
 * 
 * Renders a styled page header for account settings
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Settings header UI
 * 
 * @example
 * // Admin user
 * <SettingsHeader role="admin" />
 * 
 * // Teacher user
 * <SettingsHeader role="teacher" />
 * ============================================
 */
const SettingsHeader = ({ role }) => {
  /**
   * ============================================
   * ROLE-BASED COLOR MAPPING
   * ============================================
   * 
   * Determines color scheme based on user role
   * - admin: Admin primary color
   * - teacher: Teacher primary color
   * - student: Student primary color
   * - parent: Parent primary color
   * - default: Brand primary color
   * 
   * @constant {string} primaryColor - Primary text/icon color
   * @constant {string} lightColor - Light background color
   */
  const key = role?.toLowerCase() || "brand";
  const primaryColor = `var(--color-${key}-primary)`;
  const lightColor = `var(--color-${key}-light)`;

  /**
   * ============================================
   * DYNAMIC COLOR DERIVATIVES
   * ============================================
   * 
   * Generates theme-aware tints using CSS color-mix
   * - wash: Used for background gradient (8% opacity)
   * - orb: Used for ambient glow effect (22% opacity)
   * - ring: Used for icon container ring (18% opacity)
   * 
   * These allow for consistent theming without requiring
   * separate design tokens for every shade variation.
   */
  const wash = `color-mix(in srgb, ${primaryColor} 8%, transparent)`;
  const orb = `color-mix(in srgb, ${primaryColor} 22%, transparent)`;
  const ring = `color-mix(in srgb, ${primaryColor} 18%, transparent)`;

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface p-4 shadow-sm md:p-10"
      style={{ background: `linear-gradient(135deg, ${wash}, transparent 60%)` }}
    >
      {/* ─── Decorative Texture ─── */}
      {/* Faint dot grid gives the panel some material without competing with content */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
      >
        <defs>
          <pattern id="settings-dots" width="18" height="18" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill={primaryColor} opacity="0.15" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#settings-dots)" />
      </svg>

      {/* ─── Ambient Glow ─── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
        style={{ background: orb }}
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* =====================================
            LEFT SECTION
            Icon + Title + Description
        ===================================== */}

        <div className="flex items-center gap-5">
          {/* ─── Settings Icon ─── */}
          <div
            className="group flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-4 transition-transform duration-300 hover:-rotate-6 hover:scale-105"
            style={{ 
              background: lightColor, 
              boxShadow: `0 8px 24px -8px ${orb}`,
              "--tw-ring-color": ring 
            }}
          >
            <Settings
              size={30}
              style={{ color: primaryColor }}
              className="transition-transform duration-500 group-hover:rotate-90"
            />
          </div>

          {/* ─── Title and Description ─── */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              <Sparkles size={13} />
              Settings
            </span>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Account Settings
            </h1>

            <p className="mt-2 max-w-md text-text-secondary">
              Manage your profile information, account security, and application preferences.
            </p>
          </div>
        </div>

        {/* =====================================
            RIGHT SECTION
            Info panel with accent border
        ===================================== */}

        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-surface/70 px-6 py-4 backdrop-blur-sm">
          {/* Accent border */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1"
            style={{ background: primaryColor }}
          />

          <p className="text-sm font-semibold text-text-primary">
            Keep your profile updated
          </p>

          <p className="mt-1 max-w-xs text-sm text-text-secondary">
            Make sure your personal information is accurate so teachers, parents and
            administrators can reach you whenever needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;