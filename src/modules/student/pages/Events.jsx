// src/modules/student/pages/Events.jsx

/**
 * ============================================
 * STUDENT EVENTS & PARTICIPATIONS - MODERN UI/UX
 * ============================================
 * 
 * Design Philosophy:
 * - Clean, minimal, professional
 * - Card-based layout with depth
 * - Smooth micro-interactions
 * - Clear visual hierarchy
 * - Responsive and accessible
 * 
 * API Endpoints:
 * - GET /api/events/events/ - List events
 * - GET /api/events/event-participation/ - List participations
 * - GET /api/events/certificates/ - List certificates
 * 
 * USAGE OF NEW API FIELDS:
 * - organizer_name, event_name, student_name (READ-ONLY)
 * ============================================
 */

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Users,
  Award,
  X,
  ArrowUpRight,
  Trophy,
  ScrollText,
  Hash,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Medal,
  Star,
  ExternalLink,
  User,
  Sparkles,
  TrendingUp,
  Clock as ClockIcon,
  Layers,
  Zap,
  Crown,
  Gift,
  Heart,
  Target,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchParticipations,
  fetchCertificates,
  fetchEvents,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentParticipations,
  selectStudentCertificates,
  selectStudentEvents,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getEventName = (item) => {
  if (item.event_name && item.event_name !== 'null') return item.event_name;
  if (item.event) {
    if (typeof item.event === 'string') return item.event;
    if (item.event.name) return item.event.name;
    if (item.event.event_name) return item.event.event_name;
  }
  return "Event";
};

const getOrganizerName = (item) => {
  if (item.organizer_name && item.organizer_name !== 'null') return item.organizer_name;
  if (item.organizer) {
    if (typeof item.organizer === 'string') return item.organizer;
    if (item.organizer.name) return item.organizer.name;
    if (item.organizer.user_name) return item.organizer.user_name;
  }
  return null;
};

const getStudentName = (item) => {
  if (item.student_name && item.student_name !== 'null') return item.student_name;
  if (item.student) {
    if (typeof item.student === 'string') return item.student;
    if (item.student.name) return item.student.name;
    if (item.student.user_name) return item.student.user_name;
  }
  return null;
};

// ─── Toast Component ──────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: X, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    info: { icon: Sparkles, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  };

  const { icon: Icon, bg, border, text } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${border} ${bg} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      <Icon className={`h-5 w-5 ${text}`} />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, subtext, icon: Icon, color, delay }) => {
  const colors = {
    purple: { bg: "from-purple-50 to-purple-100/50", text: "text-purple-600", ring: "ring-purple-400/20" },
    emerald: { bg: "from-emerald-50 to-emerald-100/50", text: "text-emerald-600", ring: "ring-emerald-400/20" },
    amber: { bg: "from-amber-50 to-amber-100/50", text: "text-amber-600", ring: "ring-amber-400/20" },
    blue: { bg: "from-blue-50 to-blue-100/50", text: "text-blue-600", ring: "ring-blue-400/20" },
    rose: { bg: "from-rose-50 to-rose-100/50", text: "text-rose-600", ring: "ring-rose-400/20" },
    indigo: { bg: "from-indigo-50 to-indigo-100/50", text: "text-indigo-600", ring: "ring-indigo-400/20" },
  };

  const c = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-4 ${c.ring} ${c.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Participation Card ───────────────────────────────────────────────

const ParticipationCard = ({ participation, index, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isWinner = Boolean(participation.position || participation.rank);
  const position = participation.position || participation.rank;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const eventName = getEventName(participation);
  const organizerName = getOrganizerName(participation.event || participation);
  const studentName = getStudentName(participation);
  const eventDate = participation.event?.event_date || participation.event_date || participation.created_at;
  const eventLocation = participation.event?.location || participation.location;

  // Get position badge color
  const getPositionColor = (pos) => {
    const lower = String(pos).toLowerCase();
    if (lower.includes('1') || lower.includes('first') || lower.includes('gold')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (lower.includes('2') || lower.includes('second') || lower.includes('silver')) return 'bg-gray-200 text-gray-700 border-gray-300';
    if (lower.includes('3') || lower.includes('third') || lower.includes('bronze')) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:border-purple-200 hover:shadow-lg"
    >
      {/* Status bar */}
      <div className={`absolute left-0 top-0 h-full w-1 transition-colors duration-300 ${
        isWinner ? 'bg-amber-400' : 'bg-purple-400'
      }`} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 pl-6">
        {/* Entry number */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-sm font-medium text-gray-400">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {eventName}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-gray-400" />
                  {formatDate(eventDate)}
                </span>
                {eventLocation && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    {eventLocation}
                  </span>
                )}
                {organizerName && (
                  <span className="flex items-center gap-1.5">
                    <User size={12} className="text-gray-400" />
                    {organizerName}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isWinner && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPositionColor(position)}`}>
                  <Trophy size={11} />
                  {position}
                </span>
              )}
              {participation.certificate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Award size={11} />
                  Certificate
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onViewDetails(participation)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all shrink-0"
        >
          Details
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Certificate Card ─────────────────────────────────────────────────

const CertificateCard = ({ certificate, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const eventName = getEventName(certificate.event || certificate);
  const certType = certificate.cert_type || certificate.type || "Merit";
  const certName = certificate.name || eventName || `Certificate ${certificate.id}`;
  const issuedDate = certificate.issued_at || certificate.created_at;

  const typeColors = {
    merit: "border-amber-200 bg-amber-50 text-amber-700",
    participation: "border-blue-200 bg-blue-50 text-blue-700",
    achievement: "border-purple-200 bg-purple-50 text-purple-700",
    excellence: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const typeColor = typeColors[certType.toLowerCase()] || typeColors.merit;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:border-purple-200 hover:shadow-lg"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-50/0 group-hover:from-purple-50/30 group-hover:to-purple-50/10 transition-all duration-500" />

      {/* Decorative corner */}
      <div className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Award size={20} strokeWidth={2} className={typeColor.split(' ')[2]} />
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${typeColor}`}>
            {certType}
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {certName}
          </h3>
          {certificate.description && (
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {certificate.description}
            </p>
          )}
          {certificate.generated_text && (
            <p className="mt-1 text-xs italic text-gray-400 line-clamp-2">
              "{certificate.generated_text}"
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 mt-3">
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
            <Hash size={10} />
            #CER-{String(certificate.id).padStart(4, "0")}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <Calendar size={10} />
            {formatDate(issuedDate)}
          </span>
          <button
            onClick={() => onViewDetails(certificate)}
            className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            View
            <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl border border-gray-100 p-12 text-center"
  >
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200">
        <Icon size={28} className="text-gray-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-5 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  </motion.div>
);

// ─── Detail Modal ─────────────────────────────────────────────────────

const DetailModal = ({ item, onClose }) => {
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

  const isCertificate = Boolean(item.cert_type || item.type || item.generated_text);
  const eventName = getEventName(item);
  const organizerName = getOrganizerName(item.event || item);
  const studentName = getStudentName(item);
  const eventDate = item.event?.event_date || item.event_date || item.created_at;
  const eventLocation = item.event?.location || item.location;
  const position = item.position || item.rank;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium uppercase tracking-wide">
                  {isCertificate ? `${item.cert_type || item.type || "Merit"} Award` : "Participation"}
                </span>
                {!isCertificate && position && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-400/30 px-3 py-0.5 text-xs font-semibold text-amber-100">
                    <Trophy size={12} />
                    {position}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold truncate">
                {isCertificate ? item.name || eventName || "Certificate" : eventName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isCertificate ? (
            <>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  "{item.generated_text || item.description || "Certificate of achievement awarded for outstanding performance."}"
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Certificate ID</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">#CER-{String(item.id).padStart(4, "0")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Issued Date</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(item.issued_at || item.created_at)}</p>
                </div>
                {item.cert_type && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{item.cert_type}</p>
                  </div>
                )}
                {studentName && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Recipient</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{studentName}</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  You participated in this event and your involvement was recorded.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Participation ID</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">#PART-{String(item.id).padStart(4, "0")}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Event Date</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(eventDate)}</p>
                </div>
                {eventLocation && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Location</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{eventLocation}</p>
                  </div>
                )}
                {organizerName && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Organizer</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{organizerName}</p>
                  </div>
                )}
                {item.role && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Role</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{item.role}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

function Events() {
  const dispatch = useDispatch();
  const participations = useSelector(selectStudentParticipations);
  const certificates = useSelector(selectStudentCertificates);
  const events = useSelector(selectStudentEvents);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // ─── Load Data ──────────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchParticipations()).unwrap(),
        dispatch(fetchCertificates()).unwrap(),
        dispatch(fetchEvents()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading events data:", err);
      setToast({ message: "Failed to load events data", type: "error" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Events refreshed", type: "info" });
  };

  // ─── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = participations?.length || 0;
    const certified = certificates?.length || 0;
    const winners = participations?.filter((p) => p.position || p.rank).length || 0;
    const upcoming = events?.filter((e) => new Date(e.event_date) > new Date()).length || 0;
    return { total, certified, winners, upcoming };
  }, [participations, certificates, events]);

  // ─── Filters ────────────────────────────────────────────────────────
  const filteredParticipations = useMemo(() => {
    if (!participations) return [];
    let filtered = participations;

    if (filterType === "certificates") {
      filtered = filtered.filter((p) => p.certificate);
    } else if (filterType === "winners") {
      filtered = filtered.filter((p) => p.position || p.rank);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        getEventName(p).toLowerCase().includes(term) ||
        getOrganizerName(p.event || p)?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [participations, filterType, searchTerm]);

  // ─── Loading ────────────────────────────────────────────────────────
  if (loading && !participations?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Events & Participations"
          subtitle="Every event you've taken part in, and every certificate you've earned along the way"
          breadcrumbs={["Student", "Events"]}
          bgColor="bg-purple-50"
          actions={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white/80 rounded-lg hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        <div className="mt-6" />

        {/* ─── Stats ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Events Joined"
            value={stats.total}
            subtext="Total registrations"
            icon={Users}
            color="purple"
            delay={0.05}
          />
          <StatCard
            label="Certificates"
            value={stats.certified}
            subtext="Earned so far"
            icon={Award}
            color="emerald"
            delay={0.1}
          />
          <StatCard
            label="Podium Finishes"
            value={stats.winners}
            subtext="Ranked results"
            icon={Trophy}
            color="amber"
            delay={0.15}
          />
          <StatCard
            label="Upcoming Events"
            value={stats.upcoming}
            subtext="Coming soon"
            icon={Calendar}
            color="blue"
            delay={0.2}
          />
        </div>

        {/* ─── Filters ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                showFilters || filterType !== "all"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={16} />
              Filter
              {filterType !== "all" && (
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Filter Chips */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {["all", "certificates", "winners"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setFilterType(filter); setShowFilters(false); }}
                      className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                        filterType === filter
                          ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {filter === "all" ? "All" : filter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Results Count ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredParticipations.length} participation{filteredParticipations.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* ─── Participation List ────────────────────────────────────── */}
        {filteredParticipations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No participations yet"
            description={
              filterType !== "all" || searchTerm
                ? "No participations match your filters. Try adjusting your search."
                : "Once you register for an event, it will show up here."
            }
            action={(filterType !== "all" || searchTerm) ? { 
              label: "Clear Filters", 
              onClick: () => { setFilterType("all"); setSearchTerm(""); } 
            } : undefined}
          />
        ) : (
          <div className="space-y-3 mb-8">
            {filteredParticipations.map((item, index) => (
              <ParticipationCard
                key={item.id}
                participation={item}
                index={index}
                onViewDetails={setSelectedItem}
              />
            ))}
          </div>
        )}

        {/* ─── Certificates Section ───────────────────────────────────── */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Certificates</h2>
              {certificates?.length > 0 && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {certificates.length}
                </span>
              )}
            </div>
          </div>

          {certificates.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No certificates yet"
              description="Certificates appear here as soon as one is issued for an event you've completed."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onViewDetails={setSelectedItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Events Module</p>
        </div>

        {/* ─── Detail Modal ───────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedItem && (
            <DetailModal
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Events;