/**
 * ============================================
 * BEHAVIOR STATS COMPONENT
 * ============================================
 * 
 * Purpose: Displays behavior statistics and trends
 * Features:
 * - Trend line chart showing behavior patterns over time
 * - Recent logs list with quick view functionality
 * - Severity-based color coding (High, Medium, Low)
 * - Interactive tooltips on chart hover
 * 
 * Dependencies:
 * - recharts for trend visualization
 * - lucide-react for icons (ChevronRight)
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <BehaviorStats
 *   logs={behaviorLogs}
 *   recentLogs={recentLogs}
 *   onViewDetail={handleViewDetail}
 * />
 * ============================================
 */

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronRight } from "lucide-react";
import { getSeverityBadgeClass, formatDate } from "@/utils/helpers";

/**
 * ============================================
 * BEHAVIOR STATS COMPONENT
 * ============================================
 * 
 * Renders behavior statistics dashboard with trend chart and recent logs
 * 
 * @param {Object} props - Component props
 * @param {Array} props.logs - Array of behavior log objects
 * @param {Array} props.recentLogs - Array of recent behavior logs (max 3)
 * @param {Function} props.onViewDetail - Callback function when a log is clicked
 * @returns {JSX.Element} Behavior statistics dashboard
 * 
 * @example
 * const logs = [...]; // Array of behavior logs
 * const recentLogs = logs.slice(0, 3);
 * 
 * <BehaviorStats
 *   logs={logs}
 *   recentLogs={recentLogs}
 *   onViewDetail={(log) => openDrawer(log)}
 * />
 * ============================================
 */
export default function BehaviorStats({ logs, recentLogs, onViewDetail }) {
  /**
   * ============================================
   * TREND DATA COMPUTATION
   * ============================================
   * 
   * Processes raw logs into grouped date-based trend data
   * Groups by date (YYYY-MM-DD) and severity (High, Medium, Low)
   * 
   * @returns {Array} Sorted array of daily severity counts
   * 
   * @example
   * // Returns:
   * [
   *   { date: '2026-07-10', High: 2, Medium: 1, Low: 0 },
   *   { date: '2026-07-11', High: 0, Medium: 2, Low: 1 }
   * ]
   * ============================================
   */
  const trendData = useMemo(() => {
    if (!logs || logs.length === 0) {
      console.log('No logs available');
      return [];
    }

    console.log('Raw logs count:', logs.length);

    // Group logs by date (YYYY-MM-DD) and severity
    const grouped = {};
    logs.forEach((log) => {
      // Use 'date' field if available, else fallback to 'created_at'
      const dateString = log.date || log.created_at;
      if (!dateString) {
        console.warn('Missing date for log:', log);
        return;
      }
      const date = dateString.split("T")[0]; // "2026-07-10"
      if (!grouped[date]) {
        grouped[date] = { date, High: 0, Medium: 0, Low: 0 };
      }
      if (log.severity === "High") grouped[date].High += 1;
      else if (log.severity === "Medium") grouped[date].Medium += 1;
      else if (log.severity === "Low") grouped[date].Low += 1;
    });

    // Convert to array and sort by date
    const result = Object.values(grouped).sort((a, b) => (a.date > b.date ? 1 : -1));
    console.log('Processed trendData:', result);
    return result;
  }, [logs]);

  /**
   * ============================================
   * SEVERITY COLOR MAPPING
   * ============================================
   * 
   * Maps severity levels to their corresponding color variables
   * 
   * @constant {Object} colors
   * @property {string} High - Danger color (red)
   * @property {string} Medium - Warning color (yellow)
   * @property {string} Low - Success color (green)
   * ============================================
   */
  const colors = {
    High: "var(--color-danger)",
    Medium: "var(--color-warning)",
    Low: "var(--color-success)",
  };

  /**
   * ============================================
   * CUSTOM TOOLTIP COMPONENT
   * ============================================
   * 
   * Renders custom tooltip for chart hover interactions
   * Shows date and severity counts with color coding
   * 
   * @param {Object} props - Recharts tooltip props
   * @param {boolean} props.active - Whether tooltip is active
   * @param {Array} props.payload - Tooltip data payload
   * @param {string} props.label - Tooltip label (date)
   * @returns {JSX.Element|null} Tooltip UI or null if inactive
   * ============================================
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-xs px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  /**
   * ============================================
   * DATA AVAILABILITY CHECK
   * ============================================
   * 
   * Determines if there's any meaningful data to display
   * Checks if any severity count is greater than zero
   * 
   * @constant {boolean} hasData
   * @returns {boolean} True if data exists and has values
   * ============================================
   */
  const hasData = trendData.length > 0 && trendData.some(d => d.High > 0 || d.Medium > 0 || d.Low > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 lg:grid-cols-5 gap-5 px-4 sm:px-6 lg:px-8">
      {/* ─── Trend Chart (60%) ─── */}
      <div className="lg:col-span-3 bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 px-4 sm:px-6 lg:px-8">
        <h3 className="text-sm md:text-base md:text-base font-semibold text-[var(--color-text-primary)] mb-4 px-4 sm:px-6 lg:px-8">
          Behavior Trends Over Time
        </h3>
        {!hasData ? (
          // Empty state when no data is available
          <div className="flex flex-col md:flex-row items-center justify-center h-48 text-sm md:text-base md:text-base text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
            {trendData.length === 0
              ? 'No behavior data available to display trends.'
              : 'All severity counts are zero.'}
          </div>
        ) : (
          // Trend chart with three severity lines
          <div className="h-64 w-full px-4 sm:px-6 lg:px-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="High"
                  stroke={colors.High}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Medium"
                  stroke={colors.Medium}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="Low"
                  stroke={colors.Low}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ─── Recent Logs (40%) ─── */}
      <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm md:text-base md:text-base font-semibold text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
            Recent Logs
          </h3>
          {recentLogs.length > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
              Latest {recentLogs.length} entries
            </span>
          )}
        </div>
        {recentLogs.length === 0 ? (
          // Empty state when no recent logs
          <div className="text-center py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-sm md:text-base md:text-base text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">No logs yet</p>
          </div>
        ) : (
          // List of recent logs with click-to-view functionality
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 px-4 sm:px-6 lg:px-8">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="group bg-[var(--color-surface-dim)] rounded-lg p-3 hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-sm px-4 sm:px-6 lg:px-8"
                onClick={() => onViewDetail(log)}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                  <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
                    {/* Student name */}
                    <p className="text-sm md:text-base md:text-base font-medium text-[var(--color-text-primary)] truncate px-4 sm:px-6 lg:px-8">
                      {log.student_name}
                    </p>
                    {/* Description */}
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5 px-4 sm:px-6 lg:px-8">
                      {log.description}
                    </p>
                    {/* Metadata: reporter and date */}
                    <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 mt-1 px-4 sm:px-6 lg:px-8">
                      <span className="text-[10px] text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                        {log.reported_by_name}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
                      <span className="text-[10px] text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* ─── Severity badge on the RIGHT ─── */}
                  <span
                    className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${getSeverityBadgeClass(
                      log.severity
                    )}`}
                  >
                    {log.severity}
                  </span>
                  <ChevronRight size={14} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1 px-4 sm:px-6 lg:px-8" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}