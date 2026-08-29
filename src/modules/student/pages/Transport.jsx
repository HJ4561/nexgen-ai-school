// src/modules/student/pages/Transport.jsx

/**
 * ============================================
 * STUDENT TRANSPORT - COMPLETE
 * ============================================
 * 
 * Purpose: View bus route, stops, and transport attendance
 * 
 * API Endpoints:
 * - GET /api/transport/bus-students/ - List bus students
 * - GET /api/transport/transport-attendance/ - List transport attendance
 * - GET /api/transport/routes/ - List routes
 * - GET /api/transport/bus-stops/ - List bus stops
 * - GET /api/transport/buses/ - List buses
 * 
 * USAGE OF NEW API FIELDS:
 * - bus_number from bus-students (read-only)
 * - student_name from bus-students (read-only)
 * - pickup_stop_name from bus-students (read-only)
 * - drop_stop_name from bus-students (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Bus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  ChevronDown,
  Route,
  Navigation,
  User,
  Map,
  Compass,
  ArrowRight,
  CircleDot,
  CircleCheck,
  CircleAlert,
  Users,
  Shield,
  Clock as ClockIcon,
  CalendarDays,
  Home,
  School,
  Move,
  Truck,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Star,
  Sparkles,
  Gauge,
  Timer,
  Target,
  Zap,
  ShieldCheck,
  Crown,
  Medal,
  Trophy,
  Activity,
  BarChart3,
  Layers,
  Loader2,
  UserCircle,
  Mail,
  Phone,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/services/api";

import {
  fetchBusStudents,
  fetchTransportAttendance,
  fetchRoutes,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentBusStudents,
  selectStudentTransportAttendance,
  selectStudentRoutes,
  selectStudentLoading,
  selectStudentError,
  selectStudentProfile,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getBusNumber = (busStudent) => {
  if (!busStudent) return "N/A";
  // ✅ 1. PRIORITY: Use bus_number from API (new field!)
  if (busStudent.bus_number && busStudent.bus_number !== 'null') return busStudent.bus_number;
  // 2. FALLBACK: Use bus object
  if (busStudent.bus) {
    if (typeof busStudent.bus === 'string') return busStudent.bus;
    if (busStudent.bus.bus_no) return busStudent.bus.bus_no;
    if (busStudent.bus.bus_number) return busStudent.bus.bus_number;
  }
  return "N/A";
};

const getStudentName = (busStudent) => {
  if (!busStudent) return "N/A";
  // ✅ 1. PRIORITY: Use student_name from API (new field!)
  if (busStudent.student_name && busStudent.student_name !== 'null') return busStudent.student_name;
  // 2. FALLBACK: Use student object
  if (busStudent.student) {
    if (typeof busStudent.student === 'string') return busStudent.student;
    if (busStudent.student.name) return busStudent.student.name;
    if (busStudent.student.student_name) return busStudent.student.student_name;
  }
  return "N/A";
};

const getPickupStopName = (busStudent) => {
  if (!busStudent) return "N/A";
  // ✅ 1. PRIORITY: Use pickup_stop_name from API (new field!)
  if (busStudent.pickup_stop_name && busStudent.pickup_stop_name !== 'null') return busStudent.pickup_stop_name;
  // 2. FALLBACK: Use pickup_stop object
  if (busStudent.pickup_stop) {
    if (typeof busStudent.pickup_stop === 'string') return busStudent.pickup_stop;
    if (busStudent.pickup_stop.name) return busStudent.pickup_stop.name;
    if (busStudent.pickup_stop.pickup_stop_name) return busStudent.pickup_stop.pickup_stop_name;
  }
  return "N/A";
};

const getDropStopName = (busStudent) => {
  if (!busStudent) return "N/A";
  // ✅ 1. PRIORITY: Use drop_stop_name from API (new field!)
  if (busStudent.drop_stop_name && busStudent.drop_stop_name !== 'null') return busStudent.drop_stop_name;
  // 2. FALLBACK: Use drop_stop object
  if (busStudent.drop_stop) {
    if (typeof busStudent.drop_stop === 'string') return busStudent.drop_stop;
    if (busStudent.drop_stop.name) return busStudent.drop_stop.name;
    if (busStudent.drop_stop.drop_stop_name) return busStudent.drop_stop.drop_stop_name;
  }
  return "N/A";
};

const getRouteName = (busStudent, routes) => {
  if (!busStudent) return "N/A";
  const routeId = busStudent.route || busStudent.route_id || busStudent.bus?.route;
  if (!routeId) return "N/A";
  const route = routes?.find(r => r.id === routeId);
  return route?.name || route?.route_name || "N/A";
};

// ─── Toast ─────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
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
}

// ─── Premium Stat Card ─────────────────────────────────────────────────

function PremiumStatCard({ label, value, subtext, icon: Icon, color, delay }) {
  const colorMap = {
    indigo: { bg: "from-indigo-50 to-indigo-100/30", text: "text-indigo-600", ring: "ring-indigo-400/30" },
    emerald: { bg: "from-emerald-50 to-emerald-100/30", text: "text-emerald-600", ring: "ring-emerald-400/30" },
    amber: { bg: "from-amber-50 to-amber-100/30", text: "text-amber-600", ring: "ring-amber-400/30" },
    rose: { bg: "from-rose-50 to-rose-100/30", text: "text-rose-600", ring: "ring-rose-400/30" },
    blue: { bg: "from-blue-50 to-blue-100/30", text: "text-blue-600", ring: "ring-blue-400/30" },
    purple: { bg: "from-purple-50 to-purple-100/30", text: "text-purple-600", ring: "ring-purple-400/30" },
    cyan: { bg: "from-cyan-50 to-cyan-100/30", text: "text-cyan-600", ring: "ring-cyan-400/30" },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border border-gray-100/60 p-5 transition-all duration-300 hover:shadow-xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.ring} ring-4 ${c.text} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Bus Card ──────────────────────────────────────────────────────────

function BusCard({ busStudent, route, routes, onViewDetails, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const busNumber = getBusNumber(busStudent);
  const studentName = getStudentName(busStudent);
  const pickupStop = getPickupStopName(busStudent);
  const dropStop = getDropStopName(busStudent);
  const routeName = getRouteName(busStudent, routes);

  const bus = busStudent?.bus || {};
  const status = bus.status || "active";

  const getStatusConfig = (status) => {
    const map = {
      active: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle, label: "Active" },
      inactive: { color: "bg-gray-100 text-gray-700", icon: XCircle, label: "Inactive" },
      maintenance: { color: "bg-amber-100 text-amber-700", icon: AlertCircle, label: "Maintenance" },
      full: { color: "bg-rose-100 text-rose-700", icon: AlertCircle, label: "Full" },
    };
    return map[status?.toLowerCase()] || map.active;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200"
    >
      <div className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
          {/* Left: Bus Info */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 flex items-center justify-center flex-shrink-0">
              <Bus className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-semibold text-gray-800 truncate">
                  {busNumber}
                </h4>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <UserCircle className="h-3.5 w-3.5" />
                  {studentName}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {pickupStop} → {dropStop}
                </span>
                {routeName !== "N/A" && (
                  <span className="flex items-center gap-1">
                    <Route className="h-3.5 w-3.5" />
                    {routeName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all"
            >
              {isExpanded ? "Less" : "More"}
              <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => onViewDetails(busStudent)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium">Pickup Stop</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{pickupStop}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                  <p className="text-xs text-rose-700 font-medium">Dropoff Stop</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{dropStop}</p>
                </div>
                {routeName !== "N/A" && (
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <p className="text-xs text-purple-700 font-medium">Route</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{routeName}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">Student</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{studentName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">Bus Number</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{busNumber}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium">Status</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5 capitalize">{status}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Attendance Card ──────────────────────────────────────────────────

function AttendanceCard({ attendance, index }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff < 7) return `${diff} days ago`;
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (boarded, dropped) => {
    if (boarded && dropped) {
      return { 
        label: "Complete", 
        color: "bg-emerald-100 text-emerald-700", 
        icon: CheckCircle,
        border: "border-emerald-200",
      };
    } else if (boarded) {
      return { 
        label: "Boarded", 
        color: "bg-blue-100 text-blue-700", 
        icon: CircleCheck,
        border: "border-blue-200",
      };
    } else if (dropped) {
      return { 
        label: "Dropped", 
        color: "bg-amber-100 text-amber-700", 
        icon: CircleAlert,
        border: "border-amber-200",
      };
    } else {
      return { 
        label: "Missed", 
        color: "bg-rose-100 text-rose-700", 
        icon: XCircle,
        border: "border-rose-200",
      };
    }
  };

  const status = getStatusConfig(attendance.boarded, attendance.dropped);
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.05, 0.2) }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl border ${status.border} p-4 transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">
              {formatDate(attendance.date)}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              {attendance.boarding_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {attendance.boarding_time}
                </span>
              )}
              {attendance.dropped_time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {attendance.dropped_time}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Route Map ──────────────────────────────────────────────────────────

function RouteMap({ route }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!route) return null;

  const stops = route.stops || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div 
        className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/30 flex items-center justify-center">
              <Map className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{route.name}</h3>
              <p className="text-xs text-gray-500">
                {route.start_point || "Start"} → {route.end_point || "End"}
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="relative pl-8 space-y-4">
                {/* Start */}
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="absolute left-[-2px] top-7 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-gray-200" />
                  <p className="text-sm font-semibold text-gray-800">
                    {route.start_point || "Start"}
                  </p>
                  <p className="text-xs text-gray-500">Departure Point</p>
                </div>

                {/* Stops */}
                {stops.map((stop, idx) => (
                  <div key={stop.id || idx} className="relative">
                    <div className="absolute -left-8 top-1.5 h-4 w-4 rounded-full bg-blue-400 ring-4 ring-blue-100" />
                    {idx < stops.length - 1 && (
                      <div className="absolute left-[-2px] top-7 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <p className="text-sm font-medium text-gray-700">
                      {stop.name || `Stop ${idx + 1}`}
                    </p>
                    {stop.arrival_time && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stop.arrival_time}
                      </p>
                    )}
                  </div>
                ))}

                {/* End */}
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 h-5 w-5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                  <p className="text-sm font-semibold text-gray-800">
                    {route.end_point || "End"}
                  </p>
                  <p className="text-xs text-gray-500">Destination</p>
                </div>
              </div>

              {/* Route Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Stops</p>
                  <p className="text-sm font-semibold text-gray-800">{stops.length}</p>
                </div>
                {route.distance && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="text-sm font-semibold text-gray-800">{route.distance} km</p>
                  </div>
                )}
                {route.duration && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-800">{route.duration}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────

function PremiumEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
    >
      <div className="relative mx-auto h-20 w-20">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-300/30 animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon size={32} className="text-indigo-500" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ─── Transport Details Modal ──────────────────────────────────────────

function TransportModal({ busStudent, routes, onClose }) {
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

  if (!busStudent) return null;

  const busNumber = getBusNumber(busStudent);
  const studentName = getStudentName(busStudent);
  const pickupStop = getPickupStopName(busStudent);
  const dropStop = getDropStopName(busStudent);
  const routeName = getRouteName(busStudent, routes);

  const bus = busStudent?.bus || {};
  const status = bus.status || "active";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold truncate">{busNumber}</h3>
                <p className="text-sm text-white/80">
                  #{String(busStudent.id || '').padStart(4, '0')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <XCircle className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Student</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{studentName}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{status}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-gray-500">Route</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{routeName}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-emerald-700 font-medium">Pickup Stop</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{pickupStop}</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 col-span-2">
              <p className="text-xs text-rose-700 font-medium">Dropoff Stop</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{dropStop}</p>
            </div>
          </div>

          {bus.capacity && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Capacity</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">
                {bus.students_count || 0} / {bus.capacity} students
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Transport() {
  const dispatch = useDispatch();
  const busStudents = useSelector(selectStudentBusStudents);
  const transportAttendance = useSelector(selectStudentTransportAttendance);
  const routes = useSelector(selectStudentRoutes);
  const profile = useSelector(selectStudentProfile);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const containerRef = useRef(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Load Data ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchBusStudents()).unwrap(),
        dispatch(fetchTransportAttendance()).unwrap(),
        dispatch(fetchRoutes()).unwrap(),
      ]);
    } catch (err) {
      console.error("❌ Error loading transport data:", err);
      setToast({ message: "Failed to load transport data", type: "error" });
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Debug new API fields ──────────────────────────────────────
  useEffect(() => {
    if (busStudents && busStudents.length > 0) {
      console.log("📊 Bus Student fields:", Object.keys(busStudents[0]));
      console.log("📊 bus_number:", busStudents[0].bus_number);
      console.log("📊 student_name:", busStudents[0].student_name);
      console.log("📊 pickup_stop_name:", busStudents[0].pickup_stop_name);
      console.log("📊 drop_stop_name:", busStudents[0].drop_stop_name);
    }
    if (transportAttendance && transportAttendance.length > 0) {
      console.log("📊 Transport Attendance fields:", Object.keys(transportAttendance[0]));
    }
  }, [busStudents, transportAttendance]);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      const statCards = document.querySelectorAll('.stat-card-animate');
      if (statCards.length) {
        tl.fromTo(statCards, 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalBuses = busStudents?.length || 0;
    const activeBuses = busStudents?.filter((b) => {
      const status = b.bus?.status || b.status || "active";
      return status?.toLowerCase() === "active";
    }).length || 0;
    const attendanceCount = transportAttendance?.length || 0;
    const presentCount = transportAttendance?.filter((a) => a.boarded && a.dropped).length || 0;
    const attendanceRate = attendanceCount > 0 ? Math.round((presentCount / attendanceCount) * 100) : 0;

    return { totalBuses, activeBuses, attendanceCount, presentCount, attendanceRate };
  }, [busStudents, transportAttendance]);

  // ─── Filter bus students ──────────────────────────────────────
  const filteredBusStudents = useMemo(() => {
    if (!busStudents) return [];
    if (filterStatus === "all") return busStudents;
    if (filterStatus === "active") {
      return busStudents.filter((b) => {
        const status = b.bus?.status || b.status || "active";
        return status?.toLowerCase() === "active";
      });
    }
    if (filterStatus === "inactive") {
      return busStudents.filter((b) => {
        const status = b.bus?.status || b.status || "active";
        return status?.toLowerCase() !== "active";
      });
    }
    return busStudents;
  }, [busStudents, filterStatus]);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Transport data refreshed", type: "info" });
  };

  const handleViewDetails = (busStudent) => {
    setSelectedBus(busStudent);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedBus(null);
  };

  const profileName = profile?.user_name || profile?.name || "Student";

  if (loading && !busStudents?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading transport data...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Transport"
        subtitle="View your bus route, stops, and transport attendance"
        breadcrumbs={["Student", "Transport"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {profileName && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                <User className="h-3.5 w-3.5" />
                {profileName}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Total Buses"
            value={stats.totalBuses}
            subtext="Assigned to you"
            icon={Bus}
            color="indigo"
            delay={0.05}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Active"
            value={stats.activeBuses}
            subtext="Currently running"
            icon={CheckCircle}
            color="emerald"
            delay={0.1}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Attendance"
            value={`${stats.attendanceRate}%`}
            subtext={`${stats.presentCount}/${stats.attendanceCount} trips`}
            icon={Target}
            color="blue"
            delay={0.15}
          />
        </div>
        <div className="stat-card-animate">
          <PremiumStatCard
            label="Trips"
            value={stats.attendanceCount}
            subtext="Total recorded"
            icon={Calendar}
            color="purple"
            delay={0.2}
          />
        </div>
      </div>

      {/* ─── Error State ──────────────────────────────────────────────── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 p-4 rounded-xl text-center border border-rose-200"
        >
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm shadow-sm"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* ─── Bus List ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Your Buses</h2>
            {busStudents?.length > 0 && (
              <span className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-0.5 rounded-full">
                {busStudents.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showFilters || filterStatus !== "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Status
              {filterStatus !== "all" && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1 flex flex-wrap gap-2">
                {["all", "active", "inactive"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterStatus(filter)}
                    className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                      filterStatus === filter
                        ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {filter === "all" ? "All" : filter}
                  </button>
                ))}
                {filterStatus !== "all" && (
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="px-3 py-1.5 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredBusStudents.length === 0 ? (
          <PremiumEmptyState
            icon={Bus}
            title="No buses assigned"
            description={
              filterStatus !== "all"
                ? `No buses match the "${filterStatus}" filter. Try changing your filter.`
                : "You don't have any buses assigned to you at the moment."
            }
            action={filterStatus !== "all" ? { 
              label: "Show All", 
              onClick: () => setFilterStatus("all") 
            } : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredBusStudents.map((busStudent, index) => (
              <BusCard
                key={busStudent.id}
                busStudent={busStudent}
                routes={routes}
                onViewDetails={handleViewDetails}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Transport Attendance ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Recent Attendance</h2>
          {transportAttendance?.length > 0 && (
            <span className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-0.5 rounded-full">
              {transportAttendance.length}
            </span>
          )}
        </div>

        {transportAttendance.length === 0 ? (
          <PremiumEmptyState
            icon={Calendar}
            title="No attendance records"
            description="Your transport attendance records will appear here once you start using the service."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {transportAttendance.slice(0, 6).map((attendance, index) => (
              <AttendanceCard key={attendance.id} attendance={attendance} index={index} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ─── Route Map ────────────────────────────────────────────────── */}
      {routes && routes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Route Map</h2>
            <span className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-0.5 rounded-full">
              {routes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.slice(0, 2).map((route) => (
              <RouteMap key={route.id} route={route} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Details Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDetailsModal && selectedBus && (
          <TransportModal
            busStudent={selectedBus}
            routes={routes}
            onClose={handleCloseDetails}
          />
        )}
      </AnimatePresence>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Transport Module</p>
      </div>
    </div>
  );
}

export default Transport;