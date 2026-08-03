/**
 * ============================================
 * ATTENDANCE CHART COMPONENT
 * ============================================
 * 
 * Purpose: Displays attendance trends and breakdown for parent view
 * Features:
 * - Monthly attendance trend area chart
 * - Status breakdown donut chart (Present, Absent, Leave)
 * - Range selector (3M, 6M, 1Y)
 * - Overall attendance rate display
 * - Status legend with counts
 * - Custom tooltips
 * - Empty state handling
 * - Parent role theming
 * 
 * Dependencies:
 * - recharts for chart rendering (AreaChart, PieChart, etc.)
 * - lucide-react for icons (TrendingUp, CalendarRange)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <AttendanceChart />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, CalendarRange } from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * CONFIGURATION
 * ============================================
 * 
 * Status colors for attendance records
 * - present: Green
 * - absent: Red
 * - leave: Amber
 * 
 * Range options for trend chart
 * - 3M: Last 3 months
 * - 6M: Last 6 months
 * - 1Y: Last 12 months
 */
const STATUS_COLORS = {
  present: "#22c55e",
  absent: "#ef4444",
  leave: "#f59e0b",
};

const RANGES = [
  { key: "3m", label: "3M", months: 3 },
  { key: "6m", label: "6M", months: 6 },
  { key: "12m", label: "1Y", months: 12 },
];

/**
 * ============================================
 * MONTH LABEL HELPER
 * ============================================
 * 
 * Returns abbreviated month name from a Date object
 * 
 * @param {Date} d - Date object
 * @returns {string} Abbreviated month name (e.g., "Jan")
 */
const monthLabel = (d) =>
  d.toLocaleDateString("en-US", { month: "short" });

/**
 * ============================================
 * CHART TOOLTIP COMPONENT
 * ============================================
 * 
 * Custom tooltip for the area chart
 * Shows month and attendance percentage
 * 
 * @param {Object} props - Recharts tooltip props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Tooltip data payload
 * @param {string} props.label - Tooltip label (month)
 * @returns {JSX.Element|null} Tooltip UI or null
 */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="text-xs font-semibold text-text-secondary">{label}</p>
      <p className="mt-1 text-lg font-bold text-parent-primary">
        {payload[0].value}%
        <span className="ml-1 text-xs font-medium text-text-secondary">
          attendance
        </span>
      </p>
    </div>
  );
};

/**
 * ============================================
 * ATTENDANCE CHART COMPONENT
 * ============================================
 * 
 * Renders attendance trends and breakdown charts
 * 
 * @returns {JSX.Element} Attendance chart UI
 * 
 * @example
 * // In parent dashboard
 * <AttendanceChart />
 * ============================================
 */
const AttendanceChart = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const { attendance = [], selectedChild, parentLinks = [] } = useSelector(
    (state) => state.parent
  );

  // ─── Local State ──────────────────────────────────────────────────────
  const [range, setRange] = useState("6m");

  /**
   * ============================================
   * SELECTED STUDENT
   * ============================================
   * 
   * Finds the current student from parentLinks
   * based on the selectedChild ID
   */
  const selectedStudent = parentLinks.find(
    (item) => item.student === selectedChild
  );

  /**
   * ============================================
   * FILTER TO SELECTED CHILD
   * ============================================
   * 
   * Filters attendance records for the selected child
   */
  const childAttendance = useMemo(() => {
    if (!selectedStudent) return [];
    return attendance.filter(
      (a) => a.student_name === selectedStudent.student_name
    );
  }, [attendance, selectedStudent]);

  /**
   * ============================================
   * BUILD MONTHLY TREND SERIES
   * ============================================
   * 
   * Creates monthly attendance trend data for the selected range
   * - Creates buckets for each month in the range
   * - Counts present days vs total days per month
   * - Calculates attendance rate percentage
   */
  const monthsBack = RANGES.find((r) => r.key === range)?.months ?? 6;

  const trendData = useMemo(() => {
    const now = new Date();
    const buckets = [];

    // Create buckets for each month in the range
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: monthLabel(d),
        present: 0,
        total: 0,
      });
    }

    // Populate buckets with attendance data
    childAttendance.forEach((record) => {
      const d = new Date(record.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.find((b) => b.key === key);
      if (!bucket) return;

      bucket.total += 1;
      if (record.status?.toLowerCase() === "present") {
        bucket.present += 1;
      }
    });

    // Calculate attendance rate for each month
    return buckets.map((b) => ({
      label: b.label,
      rate: b.total ? Math.round((b.present / b.total) * 100) : 0,
    }));
  }, [childAttendance, monthsBack]);

  /**
   * ============================================
   * STATUS BREAKDOWN
   * ============================================
   * 
   * Counts attendance records by status
   * Creates data for the donut chart
   * - present: Green
   * - absent: Red
   * - leave: Amber
   */
  const statusData = useMemo(() => {
    const counts = { present: 0, absent: 0, leave: 0 };
    childAttendance.forEach((r) => {
      const key = r.status?.toLowerCase();
      if (counts[key] !== undefined) counts[key] += 1;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
        color: STATUS_COLORS[status],
      }));
  }, [childAttendance]);

  /**
   * ============================================
   * OVERALL ATTENDANCE RATE
   * ============================================
   * 
   * Calculates the overall attendance rate
   * based on all attendance records
   */
  const totalDays = childAttendance.length;
  const overallRate = totalDays
    ? Math.round(
        (childAttendance.filter((r) => r.status?.toLowerCase() === "present")
          .length /
          totalDays) *
          100
      )
    : 0;

  const isEmpty = totalDays === 0;

  return (
    <Card className="h-full">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-parent-primary/10 p-3">
            <TrendingUp size={22} className="text-parent-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">
              Attendance Trend
            </h3>
            <p className="text-sm text-text-secondary">
              Monthly attendance rate
            </p>
          </div>
        </div>

        {/* ─── Range Toggle ────────────────────────────────────── */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-muted p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`
                rounded-md px-3 py-1.5 text-xs font-semibold transition
                ${
                  range === r.key
                    ? "bg-white text-parent-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        // ─── Empty State ────────────────────────────────────────
        <div className="mt-6 rounded-xl bg-surface-muted p-10 text-center">
          <CalendarRange size={32} className="mx-auto text-text-secondary" />
          <p className="mt-3 text-sm text-text-secondary">
            No attendance records yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-5">
          {/* ─── Trend Area Chart (60%) ────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-text-primary">
                {overallRate}%
              </span>
              <span className="text-sm text-text-secondary">
                overall attendance rate
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="attendanceFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--parent-primary, #6366f1)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--parent-primary, #6366f1)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke="var(--border, #e5e7eb)"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-secondary, #6b7280)" }}
                />

                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-secondary, #6b7280)" }}
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                />

                <Tooltip content={<ChartTooltip />} />

                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--parent-primary, #6366f1)"
                  strokeWidth={3}
                  fill="url(#attendanceFill)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ─── Status Breakdown Donut (40%) ──────────────────── */}
          <div className="flex flex-col items-center justify-center lg:col-span-2">
            <div className="relative h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} days`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center total */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text-primary">
                  {totalDays}
                </span>
                <span className="text-xs text-text-secondary">days</span>
              </div>
            </div>

            {/* ─── Legend ────────────────────────────────────────── */}
            <div className="mt-4 grid w-full grid-cols-2 gap-x-4 gap-y-2">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs text-text-secondary">
                    {entry.name}
                  </span>
                  <span className="ml-auto text-xs font-semibold text-text-primary">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AttendanceChart;