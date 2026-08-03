/**
 * ============================================
 * ATTENDANCE CHART COMPONENT
 * ============================================
 * 
 * Purpose: Displays student attendance trend with area chart
 * Features:
 * - Area chart with gradient fill
 * - Status-based dots (Present, Leave, Absent)
 * - Attendance percentage display
 * - Trend indicator (up/down/flat) comparing halves
 * - Custom tooltip with status color coding
 * - Legend for status colors
 * - Empty state with icon
 * - Responsive chart sizing
 * 
 * Dependencies:
 * - recharts for chart rendering (AreaChart)
 * - lucide-react for icons (TrendingUp, TrendingDown, Minus, CalendarX2)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <AttendanceChart />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { TrendingUp, TrendingDown, Minus, CalendarX2 } from "lucide-react";

import Card from '@/components/ui/Card'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/**
 * ============================================
 * STATUS STYLES
 * ============================================
 * 
 * Maps attendance status to visual properties
 * - Present: Green (#10B981)
 * - Leave: Amber (#D97706)
 * - Absent: Red (#E11D48)
 * 
 * @constant {Object} STATUS_STYLES
 */
const STATUS_STYLES = {
  Present: { color: "#10B981", label: "Present" },
  Leave: { color: "#D97706", label: "Leave" },
  Absent: { color: "#E11D48", label: "Absent" },
};

/**
 * ============================================
 * STATUS VALUE MAPPING
 * ============================================
 * 
 * Converts status to numeric value for chart rendering
 * - Present: 100%
 * - Leave: 50%
 * - Absent: 0%
 * 
 * @param {string} status - Attendance status
 * @returns {number} Numeric value for chart
 */
const statusValue = (status) =>
  status === "Present" ? 100 : status === "Leave" ? 50 : 0;

/**
 * ============================================
 * CUSTOM DOT SUB-COMPONENT
 * ============================================
 * 
 * Renders custom data points on the chart
 * White circle with status-colored border
 * 
 * @param {Object} props - Recharts dot props
 * @param {number} props.cx - X position
 * @param {number} props.cy - Y position
 * @param {Object} props.payload - Data payload
 * @returns {JSX.Element} Custom dot
 */
const CustomDot = ({ cx, cy, payload }) => {
  const style = STATUS_STYLES[payload.status] || STATUS_STYLES.Absent;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fff"
      stroke={style.color}
      strokeWidth={2.5}
    />
  );
};

/**
 * ============================================
 * CUSTOM ACTIVE DOT SUB-COMPONENT
 * ============================================
 * 
 * Renders custom data points on hover
 * Larger dot with glow effect
 * 
 * @param {Object} props - Recharts active dot props
 * @param {number} props.cx - X position
 * @param {number} props.cy - Y position
 * @param {Object} props.payload - Data payload
 * @returns {JSX.Element} Custom active dot
 */
const CustomActiveDot = ({ cx, cy, payload }) => {
  const style = STATUS_STYLES[payload.status] || STATUS_STYLES.Absent;
  return (
    <g>
      <circle cx={cx} cy={cy} r={9} fill={style.color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={style.color} stroke="#fff" strokeWidth={2} />
    </g>
  );
};

/**
 * ============================================
 * CUSTOM TOOLTIP SUB-COMPONENT
 * ============================================
 * 
 * Renders custom tooltip with status color indicator
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label (date)
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const style = STATUS_STYLES[point.status] || STATUS_STYLES.Absent;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: style.color }}
        />
        <span className="text-sm font-semibold text-text-primary">{style.label}</span>
      </div>
    </div>
  );
};

/**
 * ============================================
 * LEGEND SUB-COMPONENT
 * ============================================
 * 
 * Renders color legend for attendance statuses
 * 
 * @returns {JSX.Element} Legend UI
 */
const Legend = () => (
  <div className="mt-4 flex items-center justify-center gap-5">
    {Object.values(STATUS_STYLES).map((style) => (
      <div key={style.label} className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: style.color }}
        />
        <span className="text-xs text-text-secondary">{style.label}</span>
      </div>
    ))}
  </div>
);

/**
 * ============================================
 * ATTENDANCE CHART COMPONENT
 * ============================================
 * 
 * Renders attendance trend chart with status indicators
 * 
 * @returns {JSX.Element} Attendance chart UI
 * 
 * @example
 * // In student dashboard
 * <AttendanceChart />
 * ============================================
 */
const AttendanceChart = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves attendance from Redux store
   */
  const { attendance = [] } = useSelector((state) => state.student);

  /**
   * ============================================
   * CHART DATA
   * ============================================
   * 
   * Processes attendance records for chart display
   * Takes last 10 records and formats date and status value
   */
  const chartData = useMemo(() => {
    return attendance.slice(-10).map((item) => ({
      day: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      attendance: statusValue(item.status),
      status: item.status,
    }));
  }, [attendance]);

  /**
   * ============================================
   * ATTENDANCE PERCENTAGE
   * ============================================
   * 
   * Calculates overall attendance percentage
   * Based on all attendance records, not just visible window
   */
  const attendancePercentage = useMemo(() => {
    if (!attendance.length) return 0;
    const present = attendance.filter((item) => item.status === "Present").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  /**
   * ============================================
   * TREND CALCULATION
   * ============================================
   * 
   * Compares the average of the second half of the visible
   * window against the first half, so the badge reflects the recent
   * direction rather than a single noisy data point.
   * 
   * - up: Trend is improving (delta > 4)
   * - down: Trend is declining (delta < -4)
   * - flat: No significant change
   */
  const trend = useMemo(() => {
    if (chartData.length < 4) return null;

    const mid = Math.floor(chartData.length / 2);
    const firstHalf = chartData.slice(0, mid);
    const secondHalf = chartData.slice(mid);

    const avg = (arr) => arr.reduce((sum, d) => sum + d.attendance, 0) / arr.length;
    const delta = Math.round(avg(secondHalf) - avg(firstHalf));

    if (delta > 4) return { direction: "up", delta };
    if (delta < -4) return { direction: "down", delta };
    return { direction: "flat", delta };
  }, [chartData]);

  /**
   * ============================================
   * TREND UI CONFIGURATION
   * ============================================
   * 
   * Determines icon and styling based on trend direction
   */
  const TrendIcon =
    trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;

  const trendTone =
    trend?.direction === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend?.direction === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-slate-500 bg-slate-100";

  return (
    <Card hover={false} className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Attendance Trend</h2>
          <p className="mt-1 text-sm text-text-secondary">Last 10 attendance records.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Trend Badge */}
          {trend && (
            <div className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${trendTone}`}>
              <TrendIcon size={13} strokeWidth={2.5} />
              {trend.direction === "flat" ? "Steady" : `${Math.abs(trend.delta)}%`}
            </div>
          )}

          {/* Attendance Percentage */}
          <div className="rounded-xl bg-student-light px-4 py-2">
            <p className="text-xs text-text-secondary">Attendance</p>
            <h3 className="text-lg font-bold text-student-primary">
              {attendancePercentage}%
            </h3>
          </div>
        </div>
      </div>

      {/* ─── Chart ────────────────────────────────────────────────── */}
      {chartData.length === 0 ? (
        // ─── Empty State ──────────────────────────────────────────
        <div className="flex h-80 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300">
          <CalendarX2 size={36} className="text-slate-400" />
          <p className="text-sm text-text-secondary">No attendance records yet.</p>
        </div>
      ) : (
        <>
          {/* ─── Area Chart ──────────────────────────────────────── */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="attendanceStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />

                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickLine={false}
                  axisLine={{ stroke: "#EEF2F7" }}
                />

                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 12, fill: "#94A3B8" }}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3" }} />

                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="url(#attendanceStroke)"
                  strokeWidth={3}
                  fill="url(#attendanceGradient)"
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Legend ───────────────────────────────────────────── */}
          <Legend />
        </>
      )}
    </Card>
  );
};

export default AttendanceChart;