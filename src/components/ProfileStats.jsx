/**
 * ============================================
 * PROFILE STATS COMPONENT
 * ============================================
 * 
 * Purpose: Display user profile statistics in a visual grid
 * Features:
 * - Total Students count
 * - Students on Scholarship (any percentage)
 * - Students with 100% Scholarship
 * - Students with No Scholarship
 * - Total Teachers count
 * - Total Parents count
 * - Color-coded cards with role-based theming
 * - Staggered animation on load
 * - Hover effects with elevation
 * - Responsive grid layout (2/3/6 columns)
 * 
 * Dependencies:
 * - @/components/admin/animations for stagger animations
 * 
 * Usage:
 * <ProfileStats
 *   students={studentsList}
 *   teachers={teachersList}
 *   parents={parentsList}
 * />
 * ============================================
 */

import { StaggerGroup, StaggerItem } from "@/components/admin/animations"

/**
 * ============================================
 * BORDER COLOR MAPPING
 * ============================================
 * 
 * Maps stat types to CSS color variables
 * Used for card top border and text color
 * 
 * @constant {Object} borderColorMap
 * @property {string} admin - Admin primary color
 * @property {string} student - Student primary color
 * @property {string} teacher - Teacher primary color
 * @property {string} parent - Parent primary color
 * @property {string} success - Success color
 * @property {string} warning - Warning color
 * @property {string} muted - Muted text color
 */
const borderColorMap = {
  admin: 'var(--color-admin-primary)',
  student: 'var(--color-student-primary)',
  teacher: 'var(--color-teacher-primary)',
  parent: 'var(--color-parent-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  muted: 'var(--color-text-muted)',
};

/**
 * ============================================
 * PROFILE STATS COMPONENT
 * ============================================
 * 
 * Renders user statistics in an animated card grid
 * 
 * @param {Object} props - Component props
 * @param {Array} props.students - Array of student objects
 * @param {Array} props.teachers - Array of teacher objects
 * @param {Array} props.parents - Array of parent objects
 * @returns {JSX.Element} Profile statistics grid
 * 
 * @example
 * const students = [
 *   { id: 1, name: 'John', scholarship_percentage: 50 },
 *   { id: 2, name: 'Jane', scholarship_percentage: 100 }
 * ];
 * const teachers = [{ id: 1, name: 'Mr. Smith' }];
 * const parents = [{ id: 1, name: 'Mrs. Doe' }];
 * 
 * <ProfileStats
 *   students={students}
 *   teachers={teachers}
 *   parents={parents}
 * />
 * ============================================
 */
export default function ProfileStats({ students, teachers, parents }) {
  /**
   * ============================================
   * STATS CONFIGURATION
   * ============================================
   * 
   * Defines the statistics to display with their configurations
   * 
   * @constant {Array} stats
   * @property {string} label - Display label for the stat
   * @property {number} value - The statistic value
   * @property {string} color - Color key from borderColorMap
   */
  const stats = [
    { 
      label: "Total Students", 
      value: students.length, 
      color: "admin" 
    },
    {
      label: "On Scholarship",
      value: students.filter(s => s.scholarship_percentage > 0).length,
      color: "success"
    },
    {
      label: "100% Scholarship",
      value: students.filter(s => s.scholarship_percentage === 100).length,
      color: "warning"
    },
    {
      label: "No Scholarship",
      value: students.filter(s => s.scholarship_percentage === 0).length,
      color: "muted"
    },
    { 
      label: "Total Teachers", 
      value: teachers.length, 
      color: "teacher" 
    },
    { 
      label: "Total Parents", 
      value: parents.length, 
      color: "parent" 
    },
  ];

  return (
    <StaggerGroup 
      as="div" 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {stats.map((stat) => (
        <StaggerItem key={stat.label}>
          {/* ─── Stat Card ─── */}
          <div
            className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 border-t-4 transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
            style={{ 
              borderTopColor: borderColorMap[stat.color] || 'var(--color-text-muted)' 
            }}
          >
            {/* Label */}
            <p className="text-xs text-[var(--color-text-muted)]">
              {stat.label}
            </p>
            
            {/* Value with color */}
            <p
              className="text-2xl font-bold"
              style={{ 
                color: borderColorMap[stat.color] || 'var(--color-text-primary)' 
              }}
            >
              {stat.value}
            </p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}