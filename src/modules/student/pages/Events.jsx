/**
 * ============================================
 * STUDENT EVENTS & PARTICIPATIONS COMPONENT
 * ============================================
 * 
 * Purpose: Displays student's event participation history and certificates
 * Used by: Student module routes
 * 
 * Features:
 * - Participation history with numbered ticket stub design
 * - Certificate display with seal design
 * - Statistics tiles (Events joined, Certificates, Podium finishes)
 * - Event details modal with full information
 * - Certificate verification details
 * - Loading state with spinner
 * - Empty states for no data
 * - Role-based theming (student primary color)
 * - Responsive design
 * 
 * Design Notes:
 * This page is a personal record of a student's history —
 * part timeline, part awards case. The visual language leans
 * into that: participation entries read like numbered ticket
 * stubs (they ARE chronological, so numbering earns its keep),
 * and certificates read like small sealed credentials, with a
 * circular seal mark and a formal, ledger-like frame. Headings
 * use a serif for a slightly ceremonial tone; everything else
 * stays quiet so the two signature card types can carry the
 * page.
 * 
 * Dependencies:
 * - lucide-react for icons
 * - @/components/ui/Card for containers
 * - @/components/ui/Badge for status indicators
 * - @/components/ui/Button for action buttons
 * - @/modules/student/store/studentThunks for data fetching
 * - react-redux for state management
 * 
 * Usage:
 * <Route path="/student/events" element={<Events />} />
 * ============================================
 */

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  CalendarDays,
  Users,
  Award,
  X,
  ArrowUpRight,
  Trophy,
  ScrollText,
  Hash,
} from "lucide-react";

import {
  fetchParticipations,
  fetchCertificates,
} from "@/modules/student/store/studentThunks";

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/**
 * ============================================
 * TONE STYLES
 * ============================================
 * 
 * Color schemes for different stat tiles
 * - indigo: Primary student color
 * - amber: Warm/gold color for events
 * - emerald: Green for certificates
 * - rose: Pink/red for achievements
 */
const TONE_STYLES = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", ring: "ring-indigo-500/15" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-500/15" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-500/15" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", ring: "ring-rose-500/15" },
};

/**
 * ============================================
 * STAT TILE COMPONENT
 * ============================================
 * 
 * Ledger-strip style: a quiet top rule, a large serif numeral,
 * and a small icon mark rather than a heavy icon block.
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Stat label
 * @param {number|string} props.value - Stat value
 * @param {string} props.subtext - Additional text below value
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.tone - Color tone (indigo, amber, emerald, rose)
 * @returns {JSX.Element} Stat tile UI
 */
function StatTile({ label, value, subtext, icon: Icon, tone = "indigo" }) {
  const t = TONE_STYLES[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-student-border/60 bg-surface px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top accent bar */}
      <div className={`absolute inset-x-0 top-0 h-0.75 ${t.bg}`} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.ring} ring-4 ${t.text} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
      </div>

      <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>

      {subtext && (
        <p className="mt-1.5 text-xs font-medium text-text-secondary">
          {subtext}
        </p>
      )}
    </div>
  );
}

/**
 * ============================================
 * DETAIL ROW COMPONENT
 * ============================================
 * 
 * Used in the modal to display detail items with icons
 * 
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.label - Detail label
 * @param {string} props.value - Detail value
 * @returns {JSX.Element} Detail row UI
 */
function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-student-primary/10 text-student-primary">
        <Icon size={16} strokeWidth={2.25} />
      </div>
      <div className="pt-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * ============================================
 * PARTICIPATION CARD COMPONENT
 * ============================================
 * 
 * A numbered ticket stub. The dashed divider + notches nod to
 * a real stub without overdoing it; the number is genuine
 * information (position in the history), not decoration.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.participation - Participation data
 * @param {number} props.index - Index in the list (for numbering)
 * @param {Function} props.onViewDetails - Callback to view details
 * @returns {JSX.Element} Participation card UI
 */
function ParticipationCard({ participation, index, onViewDetails }) {
  const isWinner = Boolean(participation.position);

  return (
    <Card className="group relative overflow-visible border-student-border/60 transition-all duration-300 hover:border-student-primary/30 hover:shadow-md hover:shadow-student-primary/5">
      <div className="flex items-stretch gap-0">
        {/* Stub number panel */}
        <div className="relative flex w-16 shrink-0 flex-col items-center justify-center border-r border-dashed border-student-border/70 pr-4">
          <span className="font-serif text-2xl font-semibold text-student-primary/70">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-text-muted">
            Entry
          </span>

          {/* notch cutouts, top and bottom */}
          <span className="absolute -top-2 -right-2.25 h-4 w-4 rounded-full bg-page" />
          <span className="absolute -bottom-2 -right-2.25 h-4 w-4 rounded-full bg-page" />
        </div>

        <div className="flex flex-1 flex-col gap-4 pl-5 py-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-text-primary">
              {participation.event_name}
            </h3>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} className="text-text-muted" />
                {new Date(participation.event_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-text-muted" />
                {participation.role}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isWinner && (
              <Badge variant="success" className="gap-1">
                <Trophy size={12} />
                {participation.position}
              </Badge>
            )}

            {participation.certificate && (
              <Badge variant="info" className="gap-1">
                <Award size={12} />
                Certificate earned
              </Badge>
            )}

            <Button
              variant="outline"
              tone="student"
              size="sm"
              onClick={() => onViewDetails(participation)}
              className="group/btn text-xs py-1.5 px-3 transition-all duration-200 hover:bg-student-primary hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                Details
                <ArrowUpRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * ============================================
 * CERTIFICATE CARD COMPONENT
 * ============================================
 * 
 * A small sealed credential: a circular "seal" mark instead of
 * a plain icon tile, a hairline inset frame, and the citation
 * set in serif italics like an actual certificate would print it.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.certificate - Certificate data
 * @param {Function} props.onViewDetails - Callback to view details
 * @returns {JSX.Element} Certificate card UI
 */
function CertificateCard({ certificate, onViewDetails }) {
  return (
    <Card className="group relative overflow-hidden border-student-border/60 transition-all duration-300 hover:-translate-y-1 hover:border-student-primary/30 hover:shadow-lg hover:shadow-student-primary/6">
      <div className="pointer-events-none absolute inset-2 rounded-xl border border-dashed border-student-primary/15" />

      <div className="relative flex flex-col gap-4 p-1">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-student-primary/25 bg-student-primary/5 text-student-primary transition-transform duration-300 group-hover:rotate-12">
            <Award size={20} strokeWidth={2} />
          </div>

          <Badge variant="secondary" className="capitalize text-[10px] py-0.5 px-2">
            {certificate.cert_type || "Merit"}
          </Badge>
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold tracking-tight text-text-primary">
            Certificate of Recognition
          </h3>
          <p className="mt-1.5 line-clamp-2 font-serif text-sm italic leading-6 text-text-secondary">
            "{certificate.generated_text}"
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-student-border/50 pt-3">
          <span className="flex items-center gap-1 text-[11px] font-mono tracking-wide text-text-muted">
            <Hash size={11} />
            {certificate.id}
          </span>

          <Button
            variant="outline"
            tone="student"
            size="sm"
            onClick={() => onViewDetails(certificate)}
            className="group/btn text-xs py-1.5 px-3 transition-all duration-200 hover:bg-student-primary hover:text-white"
          >
            <span className="flex items-center gap-1">
              View
              <ArrowUpRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * ============================================
 * EVENT DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Modal displaying detailed information about a participation or certificate
 * 
 * @param {Object} props - Component props
 * @param {Object} props.item - Selected item (participation or certificate)
 * @param {Function} props.onClose - Close modal callback
 * @returns {JSX.Element|null} Modal UI or null
 */
function EventDetailsModal({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!item) return null;

  const isCertificateType = Object.prototype.hasOwnProperty.call(item, "generated_text");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-start justify-between bg-student-primary px-6 py-5 text-white">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                {isCertificateType ? `${item.cert_type || "Merit"} award` : `Role: ${item.role || "Participant"}`}
              </span>
              {!isCertificateType && item.position && (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-100">
                  <Trophy size={12} />
                  {item.position}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl font-semibold">
              {isCertificateType ? "Certificate Verification" : item.event_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="rounded-lg p-2 transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-text-secondary">
              {isCertificateType ? "Citation" : "Summary"}
            </h3>
            <p className={`leading-7 text-text-secondary bg-slate-50 p-4 rounded-xl border border-dashed border-student-border/60 ${isCertificateType ? "font-serif italic" : ""}`}>
              {isCertificateType
                ? item.generated_text
                : "You registered for this event and your participation was confirmed and recorded."}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailRow
              icon={ScrollText}
              label="Record ID"
              value={`#${item.id}`}
            />

            <DetailRow
              icon={CalendarDays}
              label={isCertificateType ? "Issued" : "Event date"}
              value={new Date(item.created_at || item.event_date).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />

            {!isCertificateType && (
              <DetailRow
                icon={Users}
                label="Role"
                value={item.role}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-student-border/60 px-6 py-4">
          <Button variant="outline" tone="student" onClick={onClose} className="transition-all hover:bg-slate-100">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================
 * EMPTY STATE COMPONENT
 * ============================================
 * 
 * Shared empty state with copy tuned to which section it's representing
 * 
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @returns {JSX.Element} Empty state UI
 */
function EmptyState({ icon: Icon, title, description }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <div className="py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-student-primary/30 text-student-primary">
          <Icon size={26} strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-text-primary">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
          {description}
        </p>
      </div>
    </Card>
  );
}

/**
 * ============================================
 * EVENTS COMPONENT
 * ============================================
 * 
 * Main component for student events and participations
 * 
 * @returns {JSX.Element} Events page
 * 
 * @example
 * // In student routes
 * <Route path="/student/events" element={<Events />} />
 * ============================================
 */
function Events() {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    participations = [],
    certificates = [],
    loading,
  } = useSelector((state) => state.student);

  // ─── Local State ─────────────────────────────────────────────────────
  const [selectedItem, setSelectedItem] = useState(null);

  // ─── Data Fetching ───────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParticipations());
    dispatch(fetchCertificates());
  }, [dispatch]);

  // ─── Computed Values ─────────────────────────────────────────────────
  const totalRegistered = participations.length;
  const certificatesList = certificates || [];
  const achievementsCount = participations.filter((item) => item.position).length;

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-student-border border-t-student-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-b border-student-border/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-student-primary">
            <ScrollText size={13} />
            Your record
          </span>

          <h1 className="font-serif text-4xl font-semibold tracking-tight text-text-primary">
            Participations &amp; Credentials
          </h1>

          <p className="max-w-xl text-sm text-text-secondary">
            Every event you've taken part in, and every certificate you've earned along the way.
          </p>
        </div>
      </div>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatTile
          label="Events joined"
          value={totalRegistered}
          subtext="Total registrations"
          icon={Users}
          tone="amber"
        />

        <StatTile
          label="Certificates"
          value={certificatesList.length}
          subtext="Earned so far"
          icon={Award}
          tone="emerald"
        />

        <StatTile
          label="Podium finishes"
          value={achievementsCount}
          subtext="Ranked results"
          icon={Trophy}
          tone="rose"
        />
      </div>

      {/* ─── Participations ──────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
            Participation History
          </h2>
          {participations.length > 0 && (
            <span className="text-sm font-medium text-text-muted bg-slate-100 px-2.5 py-0.5 rounded-full">
              {participations.length} {participations.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {participations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No events yet"
            description="Once you register for an event, it will show up here as a numbered entry in your history."
          />
        ) : (
          <div className="space-y-3">
            {participations.map((item, i) => (
              <ParticipationCard
                key={`participation-${item.id}`}
                participation={item}
                index={i}
                onViewDetails={setSelectedItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Certificates ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-text-primary">
            Earned Certificates
          </h2>
          {certificatesList.length > 0 && (
            <span className="text-sm font-medium text-text-muted bg-slate-100 px-2.5 py-0.5 rounded-full">
              {certificatesList.length} {certificatesList.length === 1 ? "certificate" : "certificates"}
            </span>
          )}
        </div>

        {certificatesList.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certificates yet"
            description="Certificates appear here as soon as one is issued for an event you've completed."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {certificatesList.map((cert) => (
              <CertificateCard
                key={`cert-${cert.id}`}
                certificate={cert}
                onViewDetails={setSelectedItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Details Modal ────────────────────────────────────────────────── */}
      {selectedItem && (
        <EventDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default Events;