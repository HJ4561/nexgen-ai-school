/**
 * ============================================
 * PERFORMANCE INSIGHTS CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays attendance trend and subject mastery insights
 * Features:
 * - Attendance trend area chart (rolling 14-day presence rate)
 * - Subject mastery radar chart ("seal" design)
 * - Current attendance rate with delta indicator
 * - Strongest subject identification
 * - Report-card aesthetic (ink navy + gold seal)
 * - Role-based theming (parent primary color)
 * - Empty state handling
 * - Responsive grid layout
 * 
 * Palette — report-card aesthetic: ink navy + gold seal
 * Kept out of Tailwind since recharts needs raw hex for fills.
 * 
 * Dependencies:
 * - recharts for chart rendering (AreaChart, RadarChart)
 * - lucide-react for icons (TrendingUp, Sparkles)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <PerformanceInsightsCard />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { TrendingUp, Sparkles } from "lucide-react";

import Card from '@/components/ui/Card'

/**
 * ============================================
 * PALETTE — REPORT-CARD AESTHETIC
 * ============================================
 * 
 * Ink navy + gold seal color scheme
 * Kept out of Tailwind since recharts needs raw hex for fills.
 * 
 * @constant {string} INK - Navy ink color
 * @constant {string} GOLD - Gold seal color
 * @constant {string} BLUE - Blue accent color
 * @constant {string} GRID - Grid line color
 */
const INK = "#1E2A45";
const GOLD = "#C89B3C";
const BLUE = "#4C6EF5";
const GRID = "#E7E4D8";

/**
 * ============================================
 * DATE FORMATTER
 * ============================================
 * 
 * Formats date to short format (e.g., "Jan 15")
 * 
 * @param {string} dateStr - Date string
 * @returns {string} Formatted date
 */
const formatShortDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

/**
 * ============================================
 * ATTENDANCE TOOLTIP
 * ============================================
 * 
 * Custom tooltip for the attendance trend chart
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label (date)
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const AttendanceTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">
        {payload[0].value}% present
      </p>
    </div>
  );
};

/**
 * ============================================
 * PERFORMANCE INSIGHTS CARD COMPONENT
 * ============================================
 * 
 * Renders attendance trend and subject mastery insights
 * 
 * @returns {JSX.Element} Performance insights card UI
 * 
 * @example
 * // In parent dashboard
 * <PerformanceInsightsCard />
 * ============================================
 */
const PerformanceInsightsCard = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves attendance, grades, selectedChild, and parentLinks
   */
  const { attendance, grades, selectedChild, parentLinks } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * SELECTED STUDENT
   * ============================================
   * 
   * Finds the current student from parentLinks
   */
  const selectedStudent = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * ATTENDANCE TREND
   * ============================================
   * 
   * Rolling 14-day presence rate
   * Groups attendance by date and calculates cumulative % present up to that point
   */
  const attendanceTrend = useMemo(() => {
    if (!selectedStudent) return [];

    const childRecords = attendance
      .filter((item) => item.student_name === selectedStudent.student_name)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Take last 14 records
    const last14 = childRecords.slice(-14);

    let seen = 0;
    let present = 0;

    return last14.map((item) => {
      seen += 1;
      if (item.status === "Present") present += 1;

      return {
        date: formatShortDate(item.date),
        rate: Math.round((present / seen) * 100),
      };
    });
  }, [attendance, selectedStudent]);

  /**
   * ============================================
   * TREND CALCULATIONS
   * ============================================
   * 
   * - latestRate: Most recent attendance rate
   * - firstRate: First recorded attendance rate
   * - trendDelta: Change between first and latest (positive = improvement)
   */
  const latestRate =
    attendanceTrend.length > 0
      ? attendanceTrend[attendanceTrend.length - 1].rate
      : null;

  const firstRate = attendanceTrend.length > 0 ? attendanceTrend[0].rate : null;

  const trendDelta =
    latestRate !== null && firstRate !== null ? latestRate - firstRate : 0;

  /**
   * ============================================
   * SUBJECT RADAR DATA
   * ============================================
   * 
   * Calculates average percentage per subject for the radar chart
   * Groups grades by subject and calculates mean percentage
   */
  const subjectRadar = useMemo(() => {
    if (!selectedStudent) return [];

    const childGrades = grades.filter(
      (item) => item.student_name === selectedStudent.student_name
    );

    const grouped = childGrades.reduce((acc, item) => {
      const pct =
        (Number(item.obtained_marks) / Number(item.total_marks || 100)) * 100;

      if (!acc[item.subject_name]) acc[item.subject_name] = { total: 0, count: 0 };

      acc[item.subject_name].total += pct;
      acc[item.subject_name].count += 1;

      return acc;
    }, {});

    return Object.entries(grouped).map(([subject, { total, count }]) => ({
      subject,
      score: Math.round(total / count),
    }));
  }, [grades, selectedStudent]);

  /**
   * ============================================
   * TOP SUBJECT
   * ============================================
   * 
   * Identifies the subject with the highest average score
   */
  const topSubject = useMemo(() => {
    if (subjectRadar.length === 0) return null;
    return subjectRadar.reduce((best, item) =>
      item.score > best.score ? item : best
    );
  }, [subjectRadar]);

  /**
   * ============================================
   * DATA AVAILABILITY
   * ============================================
   * 
   * Checks if there is any data to display
   */
  const hasData = attendanceTrend.length > 0 || subjectRadar.length > 0;

  return (
    <Card className="overflow-hidden">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-parent-primary/10 p-3">
          <Sparkles size={22} className="text-parent-primary" />
        </div>

        <div>
          <h3 className="font-semibold text-text-primary">
            Performance Insights
          </h3>

          <p className="text-sm text-text-secondary">
            Attendance trend and subject mastery
          </p>
        </div>
      </div>

      {!selectedStudent || !hasData ? (
        // ─── Empty State ──────────────────────────────────────────
        <p className="mt-8 text-sm text-text-secondary">
          Not enough data yet to generate insights for this child.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* ============================================
              ATTENDANCE TREND — AREA CHART (60%)
              ============================================ */}

          <div className="lg:col-span-3">
            <div className="mb-4 flex items-baseline justify-between">
              <p className="text-sm font-medium text-text-secondary">
                Attendance trend
              </p>

              {latestRate !== null && (
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-bold" style={{ color: INK }}>
                    {latestRate}%
                  </span>

                  {trendDelta !== 0 && (
                    <span
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        trendDelta > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      <TrendingUp
                        size={13}
                        className={trendDelta < 0 ? "rotate-180" : ""}
                      />
                      {Math.abs(trendDelta)}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={attendanceTrend}
                  margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BLUE} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke={GRID}
                    strokeDasharray="0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    width={36}
                  />

                  <Tooltip content={<AttendanceTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    fill="url(#attendanceFill)"
                    dot={false}
                    activeDot={{ r: 5, fill: BLUE, stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ============================================
              SUBJECT MASTERY — RADAR "SEAL" (40%)
              ============================================ */}

          <div className="relative lg:col-span-2">
            <p className="mb-4 text-sm font-medium text-text-secondary">
              Subject mastery
            </p>

            <div className="relative h-56">
              {/* Radial glow behind the medallion, gold-seal accent */}
              <div
                className="pointer-events-none absolute inset-0 m-auto h-32 w-32 rounded-full opacity-[0.14]"
                style={{
                  background: `radial-gradient(circle, ${GOLD} 0%, transparent 70%)`,
                }}
              />

              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subjectRadar} outerRadius="72%">
                  <PolarGrid stroke={GRID} />

                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "#6B7280" }}
                  />

                  <Radar
                    dataKey="score"
                    stroke={INK}
                    strokeWidth={2}
                    fill={INK}
                    fillOpacity={0.12}
                  />

                  <Tooltip
                    formatter={(value) => [`${value}%`, "Average"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* ─── Strongest Subject Indicator ─── */}
            {topSubject && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
                Strongest in{" "}
                <span className="font-medium text-text-primary">
                  {topSubject.subject}
                </span>{" "}
                ({topSubject.score}%)
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default PerformanceInsightsCard;