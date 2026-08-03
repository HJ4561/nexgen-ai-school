/**
 * ============================================
 * PAGE HEADER COMPONENT
 * ============================================
 * 
 * Purpose: Reusable page header for dashboard pages
 * Features:
 * - Page title and subtitle display
 * - Breadcrumb navigation with home marker
 * - Optional icon badge next to title
 * - Action section for buttons/filters/search bars
 * - Themeable background per dashboard
 * - Responsive layout (flex column on mobile, row on desktop)
 * - Decorative depth layers (soft highlight + dot grid)
 * - Entrance animation (fade + slide)
 * - Custom styling support
 * 
 * Dependencies:
 * - lucide-react for icons (ChevronRight, Home)
 * 
 * Usage:
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Welcome back, Fazail"
 *   breadcrumbs={["Dashboard", "Students", "Attendance"]}
 *   icon={Users}
 *   action={<Button>Add Student</Button>}
 *   bgColor="bg-student-light"
 * />
 * ============================================
 */

import { ChevronRight, Home } from "lucide-react";

/**
 * ============================================
 * PAGE HEADER COMPONENT
 * ============================================
 * 
 * Renders a page header with title, breadcrumbs, and actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Main page heading
 * @param {string} props.subtitle - Additional description text
 * @param {Array} props.breadcrumbs - Array of breadcrumb items
 * @param {JSX} props.action - JSX displayed on the right side
 * @param {Component} props.icon - Optional lucide icon component shown in a badge
 * @param {string} props.bgColor - Tailwind background class (falls back to neutral gradient)
 * @param {string} props.className - Additional custom classes
 * @returns {JSX.Element} Page header UI
 * 
 * @example
 * // Basic usage
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Welcome back, Fazail"
 * />
 * 
 * // With breadcrumbs and theme
 * <PageHeader
 *   title="Attendance"
 *   subtitle="Manage student attendance"
 *   bgColor="bg-student-light"
 *   breadcrumbs={["Dashboard", "Students", "Attendance"]}
 * />
 * 
 * // With icon and action button
 * <PageHeader
 *   title="Students"
 *   subtitle="Manage all students"
 *   icon={Users}
 *   action={<Button>Add Student</Button>}
 * />
 * ============================================
 */
function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  icon: Icon,
  bgColor,
  className = "",
}) {
  // Resolve background class (custom or default gradient)
  const background = bgColor || "bg-gradient-to-r from-white via-slate-50 to-blue-50";

  return (
    <div
      className={`
        relative
        flex
        flex-col
        gap-5
        overflow-hidden
        rounded-card
        border
        border-slate-200
        p-6
        shadow-soft
        opacity-0
        [animation-fill-mode:forwards]
        animate-[pageheader-in_0.5s_ease-out]

        md:flex-row
        md:items-center
        md:justify-between

        ${background}
        ${className}
      `}
    >
      {/* ─── Decorative Depth Layers ─── */}
      {/* Soft highlight glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-white/40 blur-3xl"
      />
      {/* Faint dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          color: "rgba(15, 23, 42, 0.06)",
        }}
      />

      {/* ============================================
          LEFT SECTION
          Breadcrumbs, Title, and Subtitle
          ============================================ */}
      <div className="relative">
        {/* ─── Breadcrumbs ─── */}
        {breadcrumbs.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
            <Home size={12} className="shrink-0 opacity-60" />
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <ChevronRight size={12} className="opacity-40" />
                  <span className={isLast ? "text-text-primary" : "opacity-70"}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Title with Icon ─── */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 text-text-primary shadow-sm backdrop-blur-sm">
              <Icon size={20} strokeWidth={2.25} />
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
        </div>

        {/* ─── Subtitle ─── */}
        {subtitle && (
          <p className="mt-2 max-w-xl text-text-secondary">{subtitle}</p>
        )}
      </div>

      {/* ============================================
          RIGHT SECTION
          Usually contains buttons, filters, search bars, or other actions
          ============================================ */}
      {action && <div className="relative shrink-0">{action}</div>}

      {/* ─── Entrance Animation Styles ─── */}
      <style>{`
        @keyframes pageheader-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[pageheader-in_0\\.5s_ease-out\\] { 
            animation: none !important; 
            opacity: 1 !important; 
            transform: none !important; 
          }
        }
      `}</style>
    </div>
  );
}

export default PageHeader;