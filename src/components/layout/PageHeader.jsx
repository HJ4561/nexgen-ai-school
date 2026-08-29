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
 * - Responsive layout (flex flex-col md:flex-row)
 * - Decorative depth layers
 * - Entrance animation
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
  // Resolve background class
  const background = bgColor || "bg-gradient-to-r from-white via-slate-50 to-blue-50";

  return (
    <div
      className={`
        relative
        flex flex-col
        gap-4 sm:gap-5
        overflow-hidden rounded-card
        border border-slate-200
        p-3 sm:p-4 md:p-6
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 sm:-right-14 -top-10 sm:-top-14 h-32 sm:h-48 w-32 sm:w-48 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden="true"
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
          ============================================ */}
      <div className="relative min-w-0 flex-1">
        {/* ─── Breadcrumbs ─── */}
        {breadcrumbs.length > 0 && (
          <div className="mb-2 sm:mb-3 flex flex-wrap items-center gap-1 text-[10px] sm:text-xs font-medium uppercase tracking-wide text-text-secondary">
            <Home size={10} className="sm:w-3 sm:h-3 shrink-0 opacity-60" />
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-1">
                  <ChevronRight size={10} className="sm:w-3 sm:h-3 opacity-40" />
                  <span className={isLast ? "text-text-primary" : "opacity-70"}>
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Title with Icon ─── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {Icon && (
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl bg-white/70 text-text-primary shadow-sm backdrop-blur-sm">
              <Icon size={16} className="sm:w-[18px] sm:h-[18px] md:w-5 md:h-5" strokeWidth={2.25} />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text-primary break-words">
            {title}
          </h1>
        </div>

        {/* ─── Subtitle ─── */}
        {subtitle && (
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-text-secondary break-words">
            {subtitle}
          </p>
        )}
      </div>

      {/* ============================================
          RIGHT SECTION
          ============================================ */}
      {action && (
        <div className="relative shrink-0 mt-2 sm:mt-0">
          {action}
        </div>
      )}

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