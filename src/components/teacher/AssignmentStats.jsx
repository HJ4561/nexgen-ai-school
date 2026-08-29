/**
 * ============================================
 * ASSIGNMENT STATS COMPONENT
 * ============================================
 * 
 * Purpose: Display assignment statistics in card format
 * Used by: Teacher - Assignment Management page
 * 
 * Features:
 * - Total assignments count
 * - Active assignments count
 * - Completed assignments count
 * - Total submissions count
 * - Teacher role theming
 * - Staggered animation on load
 * - Hover effects
 * 
 * Dependencies:
 * - StatCard component for data display
 * - Animation components for stagger effect
 * - Lucide React icons
 * ============================================
 */

import StatCard from "@/components/common/StatCard";
import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import { StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

/**
 * AssignmentStats Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.stats - Statistics data object
 * @param {number} props.stats.total - Total assignments
 * @param {number} props.stats.active - Active assignments
 * @param {number} props.stats.completed - Completed assignments
 * @param {number} props.stats.totalSubmissions - Total submissions received
 * @returns {JSX.Element} Rendered stats cards
 * 
 * @example
 * <AssignmentStats stats={{
 *   total: 12,
 *   active: 5,
 *   completed: 7,
 *   totalSubmissions: 45
 * }} />
 */
export default function AssignmentStats({ stats }) {
  const cards = [
    { label: 'Total Assignments', value: stats.total, icon: <BookOpen size={14} />, footerText: 'All time', footerColor: 'neutral' },
    { label: 'Active', value: stats.active, icon: <CheckCircle size={14} />, footerText: 'In progress', footerColor: 'success' },
    { label: 'Completed', value: stats.completed, icon: <Clock size={14} />, footerText: 'Finished', footerColor: 'neutral' },
    { label: 'Submissions', value: stats.totalSubmissions, icon: <Users size={14} />, footerText: 'Total received', footerColor: 'success' },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 items-stretch px-4 sm:px-6 lg:px-8">
      {cards.map((card, index) => (
        <StaggerItem key={index} className="h-full px-4 sm:px-6 lg:px-8">
          <div
            className={`
              h-full rounded-xl 
              border-t-[3px] border-t-[var(--color-teacher-primary)]
              border border-gray-100
              bg-white shadow-sm
              transition-all duration-200 
              hover:shadow-md hover:-translate-y-0.5
            `}
          >
            <StatCard
              label={card.label}
              value={card.value}
              tone="teacher"
              footerText={card.footerText}
              footerColor={card.footerColor}
              footerIcon={card.icon}
              glow
              className="h-full border-0 px-4 sm:px-6 lg:px-8"
            />
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}














