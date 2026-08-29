/**
 * ============================================
 * STATS DONUT COMPONENT
 * ============================================
 * 
 * Purpose: Displays statistics as a donut chart with legend
 * Features:
 * - Animated donut pie chart with responsive sizing
 * - Count-up animation for total value
 * - Color-coded segments using role-based colors
 * - Interactive legend with hover effects
 * - Total count centered in donut
 * - Tooltip on hover
 * - Hover scaling animation on chart
 * - Legend item hover translation
 * 
 * Dependencies:
 * - recharts for donut chart rendering
 * - @/components/admin/animations for useCountUp hook
 * 
 * Usage:
 * <StatsDonut data={chartData} />
 * ============================================
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useCountUp } from "@/components/admin/animations"

/**
 * ============================================
 * COLOR PALETTE
 * ============================================
 * 
 * Defines the color scheme for chart segments
 * Colors correspond to: Admin, Teacher, Student, Parent, Danger
 * 
 * @constant {Array} COLORS
 * @property {string} 0 - Admin primary color
 * @property {string} 1 - Teacher primary color
 * @property {string} 2 - Student primary color
 * @property {string} 3 - Parent primary color
 * @property {string} 4 - Danger color (fallback)
 */
const COLORS = [
  "var(--color-admin-primary)",
  "var(--color-teacher-primary)",
  "var(--color-student-primary)",
  "var(--color-parent-primary)",
  "var(--color-danger)",
];

/**
 * ============================================
 * STATS DONUT COMPONENT
 * ============================================
 * 
 * Renders a donut chart with animated total and legend
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of data objects for the chart
 * @param {string} props.data.label - Label for the chart segment
 * @param {number} props.data.value - Numeric value for the segment
 * @returns {JSX.Element} Donut chart with legend
 * 
 * @example
 * const data = [
 *   { label: 'Admin', value: 12 },
 *   { label: 'Teacher', value: 45 },
 *   { label: 'Student', value: 230 },
 *   { label: 'Parent', value: 89 }
 * ];
 * 
 * <StatsDonut data={data} />
 * ============================================
 */
export default function StatsDonut({ data }) {
  /**
   * ============================================
   * TOTAL CALCULATION
   * ============================================
   * 
   * Calculates the sum of all data values
   * Used for the center total display
   */
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  /**
   * ============================================
   * ANIMATED TOTAL
   * ============================================
   * 
   * Uses useCountUp hook to animate the total from 0 to final value
   * Duration: 1.2 seconds with power2.out easing
   */
  const animatedTotal = useCountUp(total, { duration: 1.2 });

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-4 sm:gap-5 sm:p-6 sm:p-8 group px-4 sm:px-6 lg:px-8">
      {/* ─── Donut Chart ─── */}
      <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105 px-4 sm:px-6 lg:px-8">
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={48}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {/* Color each segment using the COLORS palette */}
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {/* Tooltip on hover */}
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              formatter={(value) => [`${value}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* ─── Center Total ─── */}
        <div className="absolute inset-0 flex flex-col md:flex-row-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <span className="text-xl md:text-2xl md:text-2xl font-bold text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
            {animatedTotal}
          </span>
          <span className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wider px-4 sm:px-6 lg:px-8">
            Total
          </span>
        </div>
      </div>

      {/* ─── Legend ─── */}
      <div className="flex flex-col md:flex-row-col gap-1.5 px-4 sm:px-6 lg:px-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 group/legend cursor-pointer transition-all hover:translate-x-1 px-4 sm:px-6 lg:px-8"
          >
            {/* Color indicator */}
            <span
              className="w-3 h-3 rounded-full transition-shadow group-hover/legend:shadow-md px-4 sm:px-6 lg:px-8"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            {/* Label and value */}
            <div className="flex flex-col md:flex-row items-center justify-between min-w-[150px] px-4 sm:px-6 lg:px-8">
              <span className="text-sm md:text-base md:text-base text-[var(--color-text-secondary)] group-hover/legend:text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                {item.label}
              </span>
              <span className="font-bold text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}