/**
 * ============================================
 * YOUR PARTICIPATIONS COMPONENT
 * ============================================
 * 
 * Purpose: Displays student's event participation history
 * Features:
 * - Recent participations with date tiles
 * - Placement badges (1st, 2nd, 3rd)
 * - Certificate earned indicator
 * - Color-coded date tiles based on placement
 * - Scrollable list with max height
 * - Fade hint for overflow content
 * - View All link to events page
 * - Empty state with icon
 * - Staggered entrance animations
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays, Users, Trophy, Award, ArrowRight)
 * - react-router-dom for navigation
 * - @/components/ui/Card for container
 * - @/components/ui/Badge for placement indicators
 * - react-redux for state management
 * 
 * Usage:
 * <YourParticipations />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Trophy, Award, ArrowRight } from "lucide-react";
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

/**
 * ============================================
 * ROUTE CONSTANTS
 * ============================================
 * 
 * Adjust to match your router config
 */
const EVENTS_PAGE_PATH = "/student/events";

/**
 * ============================================
 * PLACEMENT COLOR HELPERS
 * ============================================
 * 
 * Color mapping for placement ranks
 * - 1st: Gold
 * - 2nd: Silver
 * - 3rd: Bronze
 * - Default: Purple
 * 
 * @constant {Object} PLACEMENT_COLORS
 */
const PLACEMENT_COLORS = {
  1: ["#FBBF24", "#D97706"],
  2: ["#CBD5E1", "#64748B"],
  3: ["#FDBA74", "#C2410C"],
  default: ["#A78BFA", "#6366F1"],
};

/**
 * Get placement colors based on rank
 * 
 * @param {string} position - Position string (e.g., "1st", "2nd", "3rd")
 * @returns {Array} Color array for gradient
 */
const getPlacementColors = (position) => {
  if (!position) return PLACEMENT_COLORS.default;
  const match = String(position).match(/\d/);
  const rank = match ? Number(match[0]) : null;
  return PLACEMENT_COLORS[rank] || PLACEMENT_COLORS.default;
};

/**
 * ============================================
 * DATE TILE SUB-COMPONENT
 * ============================================
 * 
 * Ticket-style date tile — the month/day live in one glanceable
 * block instead of being buried in a row of icon + text lines.
 * 
 * @param {Object} props - Component props
 * @param {string} props.date - Date string
 * @param {Array} props.colors - Gradient color array
 * @returns {JSX.Element} Date tile UI
 */
const DateTile = ({ date, colors }) => {
  const d = new Date(date);
  return (
    <div
      className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-90">
        {d.toLocaleDateString("en-US", { month: "short" })}
      </span>
      <span className="-mt-0.5 text-xl font-bold leading-none">{d.getDate()}</span>
    </div>
  );
};

/**
 * ============================================
 * YOUR PARTICIPATIONS COMPONENT
 * ============================================
 * 
 * Renders a list of student's event participations
 * 
 * @returns {JSX.Element} Participations list UI
 * 
 * @example
 * // In student dashboard
 * <YourParticipations />
 * ============================================
 */
const YourParticipations = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves participations from Redux store
   */
  const { participations = [] } = useSelector((state) => state.student);

  /**
   * ============================================
   * RECENT PARTICIPATIONS
   * ============================================
   * 
   * Sorts participations by event date (newest first)
   */
  const recentParticipations = useMemo(() => {
    return [...participations].sort(
      (a, b) => new Date(b.event_date) - new Date(a.event_date)
    );
  }, [participations]);

  return (
    <Card hover={false}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your Participations</h2>
          <p className="mt-1 text-sm text-text-secondary">
            A quick look at the events you've taken part in.
          </p>
        </div>

        {/* View All Link */}
        <Link
          to={EVENTS_PAGE_PATH}
          className="group flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-student-primary transition-colors hover:text-student-primary/80"
        >
          View all
          <ArrowRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* ─── Participation List ────────────────────────────────── */}
      {recentParticipations.length === 0 ? (
        // ─── Empty State ──────────────────────────────────────────
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center">
          <Users size={42} className="mx-auto text-slate-400" />
          <p className="mt-4 font-medium">No Participations Yet</p>
          <p className="mt-1 text-sm text-text-secondary">
            Events you register for will show up here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* ─── Scrollable List ──────────────────────────────────── */}
          <div className="events-scroll max-h-[520px] space-y-3 overflow-y-auto pr-1.5">
            {recentParticipations.map((participation, index) => {
              const colors = getPlacementColors(participation.position);

              return (
                <div
                  key={participation.id}
                  style={{
                    borderLeftColor: colors[1],
                    animationDelay: `${Math.min(index, 8) * 60}ms`,
                  }}
                  className="rounded-xl border border-slate-200 border-l-4 p-5 opacity-0
                             [animation-fill-mode:forwards] animate-[event-in_0.5s_ease-out]
                             transition-all duration-200 hover:-translate-y-0.5 hover:border-student-primary hover:shadow-sm"
                >
                  {/* ─── Title Row ─── */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <DateTile date={participation.event_date} colors={colors} />
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">
                          {participation.event_name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                          <Users size={14} />
                          {participation.role}
                        </p>
                      </div>
                    </div>

                    {/* Placement Badge */}
                    {participation.position && (
                      <Badge variant="success" className="gap-1 whitespace-nowrap">
                        <Trophy size={12} />
                        {participation.position}
                      </Badge>
                    )}
                  </div>

                  {/* ─── Event Date ─── */}
                  <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
                    <CalendarDays size={16} />
                    {new Date(participation.event_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>

                  {/* ─── Certificate Earned ─── */}
                  {participation.certificate && (
                    <div className="rounded-lg bg-student-light p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Award size={16} className="text-student-primary" />
                        <span className="font-medium">Certificate Earned</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ─── Fade Hint ────────────────────────────────────────── */}
          {recentParticipations.length > 3 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
      )}

      {/* ─── Styles ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes event-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .events-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .events-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .events-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .events-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .events-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[event-in"] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </Card>
  );
};

export default YourParticipations;