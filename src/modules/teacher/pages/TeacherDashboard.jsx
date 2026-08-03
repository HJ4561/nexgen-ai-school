/**
 * ============================================
 * TEACHER DASHBOARD COMPONENT
 * ============================================
 * 
 * Purpose: Main dashboard for teacher users
 * Used by: Teacher module routes
 * 
 * Features:
 * - Welcome message with teacher name
 * - Today's schedule display
 * - Attendance trend chart (last 7 days)
 * - Quick action buttons (Attendance, Assignment, Upload, Complaint)
 * - Up next class widget
 * - Role-based theming (teacher primary color)
 * - Loading and error states
 * - Real-time slot highlighting
 * 
 * Dependencies:
 * - react-redux for state management
 * - recharts for trend chart
 * - lucide-react for icons
 * - @/components/layout/PageHeader for page header
 * - @/components/composite/StatCard for stats
 * - @/components/admin/animations for animations
 * - @/utils/SubjectMapping for subject name resolution
 * - teacherThunks for data fetching
 * 
 * Usage:
 * <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
 * ============================================
 */

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ChevronRight,
  Building,
  Users,
  Bell,
  ClipboardPlus,
  Upload,
  MessageCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/composite/StatCard";
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import {
  fetchTeacherDashboard,
  fetchTeacherTimetable,
  fetchTeacherClasses,
} from "@/modules/teacher/store/teacherThunks";
import { SUBJECT_LIST } from "@/utils/SubjectMapping";

// ─── Animation Components ──────────────────────────────────────────────
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations";

// ─── Helpers ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * GET CURRENT DAY SHORT
 * ============================================
 * 
 * Returns the abbreviated name of the current day
 * 
 * @returns {string} Three-letter day abbreviation (e.g., 'Mon', 'Tue')
 * 
 * @example
 * const today = getCurrentDayShort(); // 'Mon'
 */
const getCurrentDayShort = () => {
  const map = {
    Sunday: 'Sun', Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
    Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
  };
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return map[dayName];
};

/**
 * ============================================
 * GET CURRENT TIME
 * ============================================
 * 
 * Returns the current time in HH:MM format
 * 
 * @returns {string} Current time (e.g., '09:30')
 * 
 * @example
 * const now = getCurrentTime(); // '09:30'
 */
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * ============================================
 * IS CURRENT SLOT
 * ============================================
 * 
 * Checks if a given time slot is currently active
 * 
 * @param {string} dayShort - Three-letter day abbreviation (e.g., 'Mon')
 * @param {string} startTime - Start time in HH:MM format (e.g., '09:00')
 * @returns {boolean} True if the slot is currently active
 * 
 * @example
 * const isNow = isCurrentSlot('Mon', '09:00');
 */
const isCurrentSlot = (dayShort, startTime) => {
  const currentDay = getCurrentDayShort();
  if (dayShort !== currentDay) return false;
  const now = getCurrentTime();
  const [h, m] = startTime.split(':').map(Number);
  const slotStart = h * 60 + m;
  const [nH, nM] = now.split(':').map(Number);
  const nowMinutes = nH * 60 + nM;
  return nowMinutes >= slotStart && nowMinutes < slotStart + 60;
};

/**
 * ============================================
 * TEACHER DASHBOARD COMPONENT
 * ============================================
 * 
 * Renders the main teacher dashboard with schedule and stats
 * 
 * @returns {JSX.Element} Teacher dashboard UI
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
 * ============================================
 */
export default function TeacherDashboard() {
  // ─── Redux State ──────────────────────────────────────────────────────
  const dispatch = useDispatch();
  const { dashboard, timetable, classes } = useSelector((state) => state.teacher);
  const user = useSelector((state) => state.auth.user);
  const teacherName = user?.first_name || user?.full_name || 'Teacher';

  const { summary, trend, loading, error } = dashboard;

  // ─── Data Fetching ──────────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Dashboard data (stats and trends)
   * - Timetable for today's schedule
   * - Classes for subject/class name resolution
   */
  useEffect(() => {
    dispatch(fetchTeacherDashboard());
    dispatch(fetchTeacherTimetable());
    dispatch(fetchTeacherClasses());
  }, [dispatch]);

  // ─── Data Enrichment ──────────────────────────────────────────────────

  /**
   * ============================================
   * ENRICHED TIMETABLE
   * ============================================
   * 
   * Enhances timetable entries with:
   * - Subject name from SUBJECT_LIST
   * - Class display name from classes data
   * - Room name
   * - Formatted start time
   */
  const enrichedTimetable = useMemo(() => {
    return (timetable.data || []).map((entry) => {
      const subjectInfo = SUBJECT_LIST.find((s) => s.id === entry.subject);
      const classInfo = classes.find((c) => c.id === entry.class_section);
      return {
        ...entry,
        subjectName: subjectInfo?.subject_name || `Subject ${entry.subject}`,
        className: classInfo ? `${classInfo.class_name}-${classInfo.section}` : `Class ${entry.class_section}`,
        roomName: `Room ${entry.room}`,
        startSlot: entry.start_time.slice(0, 5),
      };
    });
  }, [timetable.data, classes]);

  // ─── Today's Schedule ─────────────────────────────────────────────────

  /**
   * ============================================
   * TODAY'S SCHEDULE
   * ============================================
   * 
   * Filters and sorts today's timetable entries
   * Only shows classes for the current day
   */
  const todayShort = getCurrentDayShort();
  const todaySchedule = useMemo(() => {
    return enrichedTimetable
      .filter((entry) => entry.day === todayShort)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [enrichedTimetable, todayShort]);

  /**
   * ============================================
   * UP NEXT
   * ============================================
   * 
   * Finds the next upcoming class for today
   * Returns null if no more classes today
   */
  const upNext = useMemo(() => {
    const now = getCurrentTime();
    return todaySchedule
      .filter((e) => e.startSlot > now)
      .sort((a, b) => a.startSlot.localeCompare(b.startSlot))[0] || null;
  }, [todaySchedule]);

  // ─── Loading & Error States ─────────────────────────────────────────

  if (loading || timetable.loading || classes.length === 0) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-[var(--color-surface-dim)] min-h-screen">
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title={`Welcome back, ${teacherName}`}
          subtitle="Here is your academic overview for today."
          breadcrumbs={['Teacher', 'Dashboard']}
          tone="teacher"
          titleClassName="text-[var(--color-teacher-primary)]"
          action={
            <Link to="/teacher/attendance">
              <Button
                variant="primary"
                tone="teacher"
                size="sm"
                leftIcon={<Users size={16} />}
              >
                Take Attendance
              </Button>
            </Link>
          }
        />
      </FadeIn>

      {/* ─── Stats Cards ────────────────────────────────────────────── */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Classes */}
        <StaggerItem className="h-full">
          <div className="h-full rounded-xl border-t-[3px] border-t-[var(--color-teacher-primary)] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
            <StatCard
              label="Today's Classes"
              value={summary.todayClasses}
              tone="teacher"
              footerColor="success"
              footerIcon={<TrendingUp size={14} />}
              footerText="Live Now"
              className="h-full"
            >
              <div className="absolute top-3 right-3">
                <Badge tone="teacher" className="text-[10px]">Live</Badge>
              </div>
            </StatCard>
          </div>
        </StaggerItem>

        {/* Pending Assignments */}
        <StaggerItem className="h-full">
          <div className="h-full rounded-xl border-t-[3px] border-t-[var(--color-admin-primary)] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
            <StatCard
              label="Pending Assignments"
              value={summary.pendingAssignments}
              tone="admin"
              footerColor="warning"
              footerText="High priority"
              footerIcon={<TrendingUp size={14} />}
              className="h-full"
            >
              <div className="absolute top-3 right-3">
                <Badge tone="admin" className="text-[10px]">Pending</Badge>
              </div>
            </StatCard>
          </div>
        </StaggerItem>

        {/* Attendance Marked */}
        <StaggerItem className="h-full">
          <div className="h-full rounded-xl border-t-[3px] border-t-[var(--color-parent-primary)] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
            <StatCard
              label="Attendance Marked"
              value={`${summary.attendancePercentage}%`}
              tone="parent"
              footerColor="success"
              footerText="Today"
              className="h-full"
            >
              <div className="absolute top-3 right-3">
                <Badge tone="parent" className="text-[10px]">Completed</Badge>
              </div>
            </StatCard>
          </div>
        </StaggerItem>

        {/* Notifications */}
        <StaggerItem className="h-full">
          <div className="h-full rounded-xl border-t-[3px] border-t-[var(--color-student-primary)] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
            <StatCard
              label="Notifications"
              value={summary.notificationsCount}
              tone="student"
              footerColor="neutral"
              footerIcon={<Bell size={14} />}
              footerText="Unread"
              className="h-full"
            >
              <div className="absolute top-3 right-3">
                <Badge tone="student" className="text-[10px]">New</Badge>
              </div>
            </StatCard>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Main Layout ──────────────────────────────────────────────── */}
      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule & Chart */}
        <StaggerItem className="lg:col-span-2 space-y-6">
          {/* ─── Today's Schedule ──────────────────────────────────────── */}
          <FadeIn y={10} delay={0.1} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Today's Schedule
              </h3>
              <Link to="/teacher/timetable">
                <Button variant="link" tone="teacher" size="sm">
                  View Full Calendar
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {todaySchedule.length === 0 ? (
                <p className="text-text-secondary">No classes today.</p>
              ) : (
                todaySchedule.map((entry) => {
                  const isNow = isCurrentSlot(entry.day, entry.startSlot);
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Time */}
                      <div className="flex flex-col items-center min-w-[80px] border-r border-gray-200 pr-4">
                        <span className="text-xs text-text-secondary uppercase">
                          {entry.startSlot}
                        </span>
                        <span className="text-sm font-bold text-text-primary">
                          {entry.startSlot}
                        </span>
                      </div>

                      {/* Subject & Details */}
                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isNow && (
                            <Badge tone="teacher" className="text-[10px] animate-pulse">
                              In Progress
                            </Badge>
                          )}
                          <h4 className="font-medium text-text-primary">
                            {entry.subjectName}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Building size={14} />
                            <span>{entry.roomName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{entry.className}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link to="/teacher/attendance" className="ml-auto">
                        <Button variant="primary" tone="teacher" size="sm">
                          Mark Attendance
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </FadeIn>

          {/* ─── Attendance Trend Chart ──────────────────────────────── */}
          <FadeIn y={10} delay={0.2}>
            <div className="bg-white p-5 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-text-primary mb-4">
                Attendance Trend (Last 7 Days)
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
                      }
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="attendanceRate"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ fill: '#059669', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>
        </StaggerItem>

        {/* ─── Right Column: Quick Actions + Up Next ────────────────── */}
        <StaggerItem className="space-y-6">
          {/* ─── Quick Actions ──────────────────────────────────────────── */}
          <FadeIn y={10} delay={0.15}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-[15px] font-medium text-neutral-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/teacher/attendance">
                  <Button variant="outline" tone="teacher" size="md" fullWidth leftIcon={<Users size={16} />}>
                    Attendance
                  </Button>
                </Link>
                <Link to="/teacher/assignments">
                  <Button variant="outline" tone="teacher" size="md" fullWidth leftIcon={<ClipboardPlus size={16} />}>
                    Assignment
                  </Button>
                </Link>
                <Link to="/teacher/marks-entry">
                  <Button variant="outline" tone="teacher" size="md" fullWidth leftIcon={<Upload size={16} />}>
                    Upload
                  </Button>
                </Link>
                <Link to="/teacher/complaints">
                  <Button variant="outline" tone="teacher" size="md" fullWidth leftIcon={<MessageCircle size={16} />}>
                    Complaint
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>

          {/* ─── Up Next ────────────────────────────────────────────────── */}
          <FadeIn y={10} delay={0.25}>
            <div className="bg-teacher-primary rounded-xl p-5 text-on-primary shadow-soft">
              <div className="flex items-center gap-2">
                <ChevronRight size={18} className="text-white" />
                <h4 className="font-label-sm font-bold uppercase tracking-wider text-white">Up Next</h4>
              </div>
              {upNext ? (
                <>
                  <h3 className="text-xl text-white font-bold mt-2">{upNext.subjectName}</h3>
                  <p className="text-sm text-white/80">
                    {upNext.className} • {upNext.startSlot}
                  </p>
                  <Link to="/teacher/attendance">
                    <Button
                      variant="primary"
                      tone="teacher"
                      className="mt-4 text-teacher-primary hover:bg-on-primary/90"
                    >
                      Take Attendance
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-white/80 mt-2">No more classes today</p>
              )}
            </div>
          </FadeIn>
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}