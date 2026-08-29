/**
 * ============================================
 * EVENT STATS COMPONENT
 * ============================================
 * 
 * Purpose: Display event statistics in card format
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Total events count
 * - Scheduled events count
 * - Upcoming events count
 * - Completed events count
 * - Total participants count
 * - Role-based color theming
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
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';
import { StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";
import StatCard from "@/components/common/StatCard";
import { Calendar, CheckCircle, Clock, Users, XCircle } from 'lucide-react';  // Add XCircle for cancelled

/**
 * EventStats Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.stats - Statistics data object
 * @param {number} props.stats.total - Total events
 * @param {number} props.stats.scheduled - Scheduled events
 * @param {number} props.stats.upcoming - Upcoming events
 * @param {number} props.stats.completed - Completed events
 * @param {number} props.stats.participants - Total participants
 * @returns {JSX.Element} Rendered stats cards
 * 
 * @example
 * <EventStats stats={{
 *   total: 12,
 *   scheduled: 5,
 *   upcoming: 3,
 *   completed: 4,
 *   participants: 156
 * }} />
 */
export default function EventStats({ stats }) {
  const cards = [
    {
      label: 'Total Events',
      value: stats.total || 0,
      tone: 'admin',
      footerText: `${stats.total || 0} total`,
      footerColor: 'success',
      footerIcon: <Calendar size={14} />,
    },
    {
      label: 'Ongoing',  // Changed from 'Scheduled'
      value: stats.ongoing || 0,
      tone: 'teacher',
      footerText: 'Active events',
      footerColor: 'success',
      footerIcon: <CheckCircle size={14} />,
    },
    {
      label: 'Upcoming',
      value: stats.upcoming || 0,
      tone: 'student',
      footerText: 'Coming soon',
      footerColor: 'warning',
      footerIcon: <Clock size={14} />,
    },
    {
      label: 'Completed',
      value: stats.completed || 0,
      tone: 'parent',
      footerText: 'Past events',
      footerColor: 'neutral',
      footerIcon: <CheckCircle size={14} />,
    },
    {
      label: 'Cancelled',  // Added cancelled
      value: stats.cancelled || 0,
      tone: 'parent',
      footerText: 'Cancelled events',
      footerColor: 'neutral',
      footerIcon: <CheckCircle size={14} />,
    },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 items-stretch px-4 sm:px-6 lg:px-8">
      {cards.map((card, index) => (
        <StaggerItem key={index} className="h-full px-4 sm:px-6 lg:px-8">
          <div
            className={`
              h-full rounded-xl overflow-hidden md:block md:hidden border-t-[3px] border-t-[var(--color-${card.tone}-primary)]
              bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] 
              transition-all duration-200 
              hover:shadow-md hover:-translate-y-0.5
            `}
          >
            <StatCard
              label={card.label}
              value={card.value}
              tone={card.tone}
              footerText={card.footerText}
              footerColor={card.footerColor}
              footerIcon={card.icon}
            />
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}















