// src/modules/student/pages/Timetable.jsx

/**
 * ============================================
 * STUDENT TIMETABLE - COMPLETE
 * ============================================
 * 
 * Purpose: View weekly class schedule
 * 
 * API Endpoints:
 * - GET /api/academics/timetable/ - List timetable entries
 * 
 * USAGE OF NEW API FIELDS:
 * - class_name from timetable (read-only)
 * - section_name from timetable (read-only)
 * - subject_name from timetable (read-only)
 * - teacher_name from timetable (read-only)
 * - room_name from timetable (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Calendar,
  Clock3,
  MapPin,
  User,
  BookOpen,
  GraduationCap,
  Users,
  BookMarked,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  X,
  School,
  UserCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Award,
  Star,
  TrendingUp,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from '@/components/ui/Card';
import StatCard from "@/components/common/StatCard";
import { fetchTimetable } from "@/modules/student/store/studentThunks";
import { selectStudentTimetable, selectStudentLoading, selectStudentError } from "@/modules/student/store/studentSlice";

// ─── Constants ──────────────────────────────────────────────────────────

const DAYS = ["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DAY_SHORT = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const DAY_ORDER = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

const TIME_SLOTS = {
  morning: { label: "Morning", icon: Sunrise, color: "text-amber-500", bg: "bg-amber-50" },
  afternoon: { label: "Afternoon", icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
  evening: { label: "Evening", icon: Sunset, color: "text-purple-500", bg: "bg-purple-50" },
};

// ─── Smart Name Resolution ────────────────────────────────────────────

const getSubjectName = (lecture) => {
  if (!lecture) return "N/A";
  // ✅ 1. PRIORITY: Use subject_name from API (new field!)
  if (lecture.subject_name && lecture.subject_name !== 'null') return lecture.subject_name;
  // 2. FALLBACK: Use subject object
  if (lecture.subject) {
    if (typeof lecture.subject === 'string') return lecture.subject;
    if (lecture.subject.name) return lecture.subject.name;
    if (lecture.subject.subject_name) return lecture.subject.subject_name;
  }
  return "N/A";
};

const getTeacherName = (lecture) => {
  if (!lecture) return "N/A";
  // ✅ 1. PRIORITY: Use teacher_name from API (new field!)
  if (lecture.teacher_name && lecture.teacher_name !== 'null') return lecture.teacher_name;
  // 2. FALLBACK: Use teacher object
  if (lecture.teacher) {
    if (typeof lecture.teacher === 'string') return lecture.teacher;
    if (lecture.teacher.name) return lecture.teacher.name;
    if (lecture.teacher.teacher_name) return lecture.teacher.teacher_name;
  }
  return "N/A";
};

const getRoomName = (lecture) => {
  if (!lecture) return "N/A";
  // ✅ 1. PRIORITY: Use room_name from API (new field!)
  if (lecture.room_name && lecture.room_name !== 'null') return lecture.room_name;
  // 2. FALLBACK: Use room object
  if (lecture.room) {
    if (typeof lecture.room === 'string') return lecture.room;
    if (lecture.room.name) return lecture.room.name;
    if (lecture.room.room_name) return lecture.room.room_name;
  }
  return "N/A";
};

const getClassName = (lecture) => {
  if (!lecture) return "N/A";
  // ✅ 1. PRIORITY: Use class_name from API (new field!)
  if (lecture.class_name && lecture.class_name !== 'null') return lecture.class_name;
  // 2. FALLBACK: Use class_obj object
  if (lecture.class_obj) {
    if (typeof lecture.class_obj === 'string') return lecture.class_obj;
    if (lecture.class_obj.name) return lecture.class_obj.name;
    if (lecture.class_obj.class_name) return lecture.class_obj.class_name;
  }
  return "N/A";
};

const getSectionName = (lecture) => {
  if (!lecture) return "N/A";
  // ✅ 1. PRIORITY: Use section_name from API (new field!)
  if (lecture.section_name && lecture.section_name !== 'null') return lecture.section_name;
  // 2. FALLBACK: Use section object
  if (lecture.section) {
    if (typeof lecture.section === 'string') return lecture.section;
    if (lecture.section.name) return lecture.section.name;
    if (lecture.section.section_name) return lecture.section.section_name;
  }
  return "N/A";
};

// ─── Get Day from API response ──────────────────────────────────────────

const getDay = (lecture) => {
  if (!lecture) return "N/A";
  const dayMap = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };
  const dayValue = lecture.day || lecture.day_of_week || "N/A";
  return dayMap[dayValue?.toLowerCase()] || dayValue;
};

const getStartTime = (lecture) => {
  if (!lecture) return "N/A";
  const time = lecture.start_time || lecture.start || "N/A";
  return time !== "N/A" ? time.slice(0, 5) : "N/A";
};

const getEndTime = (lecture) => {
  if (!lecture) return "N/A";
  const time = lecture.end_time || lecture.end || "N/A";
  return time !== "N/A" ? time.slice(0, 5) : "N/A";
};

// ─── Get Time Slot ──────────────────────────────────────────────────────

const getTimeSlot = (time) => {
  if (!time || time === "N/A") return "morning";
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

// ─── Get Class Color ──────────────────────────────────────────────────────

const getClassColor = (subjectName) => {
  const colors = [
    { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500", hover: "hover:border-blue-300", ring: "ring-blue-200" },
    { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", hover: "hover:border-emerald-300", ring: "ring-emerald-200" },
    { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500", hover: "hover:border-purple-300", ring: "ring-purple-200" },
    { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", hover: "hover:border-amber-300", ring: "ring-amber-200" },
    { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500", hover: "hover:border-rose-300", ring: "ring-rose-200" },
    { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500", hover: "hover:border-indigo-300", ring: "ring-indigo-200" },
    { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500", hover: "hover:border-cyan-300", ring: "ring-cyan-200" },
    { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", dot: "bg-pink-500", hover: "hover:border-pink-300", ring: "ring-pink-200" },
  ];
  
  let hash = 0;
  const str = subjectName || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
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

// ─── Time Slot Badge ──────────────────────────────────────────────────

function TimeSlotBadge({ time }) {
  const slot = getTimeSlot(time);
  const config = TIME_SLOTS[slot];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Timetable() {
  const dispatch = useDispatch();
  const timetable = useSelector(selectStudentTimetable);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const containerRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  // ─── Fetch Data ──────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTimetable());
  }, [dispatch, retryCount]);

  // ─── Debug new API fields ──────────────────────────────────────
  useEffect(() => {
    if (timetable && timetable.length > 0) {
      console.log("📊 Timetable fields:", Object.keys(timetable[0]));
      console.log("📊 class_name:", timetable[0].class_name);
      console.log("📊 section_name:", timetable[0].section_name);
      console.log("📊 subject_name:", timetable[0].subject_name);
      console.log("📊 teacher_name:", timetable[0].teacher_name);
      console.log("📊 room_name:", timetable[0].room_name);
    }
  }, [timetable]);

  // ─── GSAP Animations ──────────────────────────────────────────────
  useEffect(() => {
    if (loading || !timetable?.length) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      const statCards = document.querySelectorAll('.stat-card-animate');
      if (statCards.length) {
        tl.fromTo(statCards, 
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }
        );
      }

      const classItems = document.querySelectorAll('.class-item-animate');
      if (classItems.length) {
        tl.fromTo(classItems,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.05 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, timetable]);

  // ─── Filtered Timetable ──────────────────────────────────────────────

  const filteredTimetable = useMemo(() => {
    if (!timetable || !Array.isArray(timetable)) return [];
    
    let filtered = timetable.filter((lecture) => {
      const day = getDay(lecture);
      const matchesDay = selectedDay === "All" || day === selectedDay;
      
      const subjectName = getSubjectName(lecture);
      const teacherName = getTeacherName(lecture);
      const roomName = getRoomName(lecture);
      const className = getClassName(lecture);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = searchTerm === "" || 
        subjectName.toLowerCase().includes(searchLower) ||
        teacherName.toLowerCase().includes(searchLower) ||
        roomName.toLowerCase().includes(searchLower) ||
        className.toLowerCase().includes(searchLower);
      
      return matchesDay && matchesSearch;
    });

    // Sort by day order
    filtered.sort((a, b) => {
      const dayA = getDay(a);
      const dayB = getDay(b);
      return (DAY_ORDER[dayA] || 999) - (DAY_ORDER[dayB] || 999);
    });

    return filtered;
  }, [timetable, selectedDay, searchTerm]);

  // ─── Statistics ──────────────────────────────────────────────────────

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = timetable?.filter((lecture) => getDay(lecture) === today) || [];
  
  const teachers = new Set(
    timetable?.map((lecture) => getTeacherName(lecture))
  ).size;
  
  const subjects = new Set(
    timetable?.map((lecture) => getSubjectName(lecture))
  ).size;

  const rooms = new Set(
    timetable?.map((lecture) => getRoomName(lecture))
  ).size;

  // ─── Loading State ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-14 w-14 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Class Timetable"
            subtitle="View your weekly class schedule"
            breadcrumbs={["Student", "Timetable"]}
            bgColor="bg-indigo-50"
          />
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">Error loading timetable</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── No Data State ─────────────────────────────────────────────────────

  if (!timetable || timetable.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Class Timetable"
            subtitle="View your weekly class schedule"
            breadcrumbs={["Student", "Timetable"]}
            bgColor="bg-indigo-50"
          />
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Calendar size={56} className="mx-auto text-gray-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700">No Timetable Available</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              Your timetable has not been published yet. Please check back later or contact your teacher.
            </p>
            <button 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Class Timetable"
          subtitle="View your weekly class schedule, subjects, and upcoming lectures"
          breadcrumbs={["Student", "Timetable"]}
          bgColor="bg-indigo-50"
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                <School className="h-3.5 w-3.5" />
                {timetable.length} classes
              </span>
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
          }
        />

        {/* ─── Statistics Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card-animate">
            <StatCard
              label="Today's Classes"
              value={todaysClasses.length}
              tone="student"
              footerIcon={<Calendar className="h-4 w-4" />}
            />
          </div>
          <div className="stat-card-animate">
            <StatCard
              label="Weekly Classes"
              value={timetable?.length || 0}
              tone="student"
              footerIcon={<BookMarked className="h-4 w-4" />}
            />
          </div>
          <div className="stat-card-animate">
            <StatCard
              label="Subjects"
              value={subjects}
              tone="student"
              footerIcon={<GraduationCap className="h-4 w-4" />}
            />
          </div>
          <div className="stat-card-animate">
            <StatCard
              label="Teachers"
              value={teachers}
              tone="student"
              footerIcon={<Users className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* ─── Today's Classes Highlight ────────────────────────────── */}
        {todaysClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50/50 border border-indigo-100 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  Today's Classes ({today})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {todaysClasses.length} class{todaysClasses.length !== 1 ? 'es' : ''} scheduled
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(today)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All →
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {todaysClasses.slice(0, 6).map((cls, idx) => {
                const subjectName = getSubjectName(cls);
                const color = getClassColor(subjectName);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 ${color.bg} ${color.text} rounded-lg border ${color.border} text-xs font-medium shadow-sm`}
                  >
                    {subjectName}
                  </span>
                );
              })}
              {todaysClasses.length > 6 && (
                <span className="px-3 py-1.5 text-xs font-medium text-gray-500">
                  +{todaysClasses.length - 6} more
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── Filters ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by subject, teacher, or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                showFilters || selectedDay !== "All"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={14} />
              Day
              {selectedDay !== "All" && (
                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Day Filter Chips */}
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
                  {DAYS.map((day) => {
                    const isActive = selectedDay === day;
                    const displayName = day === "All" ? "All" : (DAY_SHORT[day] || day);
                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                          isActive
                            ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                  {selectedDay !== "All" && (
                    <button
                      onClick={() => setSelectedDay("All")}
                      className="px-3 py-1.5 text-xs rounded-lg text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Schedule Content ────────────────────────────────────────── */}
        <div className="space-y-3">
          {filteredTimetable.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Calendar size={48} className="mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-700">
                No Classes Found
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                {selectedDay !== "All" 
                  ? `There are no classes scheduled for ${selectedDay}.`
                  : searchTerm 
                    ? `No classes found matching "${searchTerm}".`
                    : "You have no classes scheduled for this week."}
              </p>
              {(selectedDay !== "All" || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDay("All");
                    setSearchTerm("");
                  }}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredTimetable.map((lecture, index) => {
              const subjectName = getSubjectName(lecture);
              const teacherName = getTeacherName(lecture);
              const roomName = getRoomName(lecture);
              const className = getClassName(lecture);
              const sectionName = getSectionName(lecture);
              const day = getDay(lecture);
              const startTime = getStartTime(lecture);
              const endTime = getEndTime(lecture);
              const color = getClassColor(subjectName);
              const isExpanded = expandedClass === lecture?.id;

              return (
                <motion.div
                  key={lecture?.id || index}
                  className={`class-item-animate group rounded-2xl border ${color.border} ${color.bg} transition-all duration-300 hover:shadow-md ${color.hover} overflow-hidden`}
                >
                  <div
                    className="p-4 sm:p-5 cursor-pointer"
                    onClick={() => setExpandedClass(isExpanded ? null : lecture?.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left: Subject Info */}
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${color.bg} ${color.text} shadow-sm border ${color.border}`}>
                          <BookOpen size={18} className="sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate">
                              {subjectName}
                            </h3>
                            {className !== "N/A" && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${color.bg} ${color.text} border ${color.border}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                                {className}{sectionName !== "N/A" ? ` - ${sectionName}` : ""}
                              </span>
                            )}
                            <TimeSlotBadge time={startTime} />
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{day}</span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1">
                              <Clock3 size={12} className="text-blue-500" />
                              {startTime} - {endTime}
                            </span>
                            {roomName !== "N/A" && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} className="text-gray-400" />
                                  {roomName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Teacher & Expand */}
                      <div className="flex items-center gap-2 ml-13 sm:ml-0">
                        {teacherName !== "N/A" && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg ${color.bg} border ${color.border}`}>
                            <User size={12} className={color.text} />
                            <span className="text-xs font-medium text-gray-700 truncate max-w-[80px] sm:max-w-[120px]">
                              {teacherName}
                            </span>
                          </div>
                        )}
                        <ChevronDown 
                          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} 
                        />
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
                          <div className="pt-4 mt-4 border-t border-gray-200/50 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                              <p className="text-xs text-gray-500">Class</p>
                              <p className="text-sm font-medium text-gray-700 mt-0.5">{className}</p>
                            </div>
                            {sectionName !== "N/A" && (
                              <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                                <p className="text-xs text-gray-500">Section</p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">{sectionName}</p>
                              </div>
                            )}
                            {teacherName !== "N/A" && (
                              <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                                <p className="text-xs text-gray-500">Teacher</p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">{teacherName}</p>
                              </div>
                            )}
                            {roomName !== "N/A" && (
                              <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                                <p className="text-xs text-gray-500">Room</p>
                                <p className="text-sm font-medium text-gray-700 mt-0.5">{roomName}</p>
                              </div>
                            )}
                            <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                              <p className="text-xs text-gray-500">Day</p>
                              <p className="text-sm font-medium text-gray-700 mt-0.5">{day}</p>
                            </div>
                            <div className={`${color.bg} rounded-xl p-3 border ${color.border}`}>
                              <p className="text-xs text-gray-500">Time</p>
                              <p className="text-sm font-medium text-gray-700 mt-0.5">{startTime} - {endTime}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ─── Footer Stats ────────────────────────────────────────────── */}
        {filteredTimetable.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-200 pt-4">
            <span>
              Showing {filteredTimetable.length} class{filteredTimetable.length !== 1 ? 'es' : ''}
              {selectedDay !== "All" && ` on ${selectedDay}`}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {teachers} Teacher{teachers !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-300">•</span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                {subjects} Subject{subjects !== 1 ? 's' : ''}
              </span>
              {rooms > 0 && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    {rooms} Room{rooms !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

export default Timetable;