/**
 * ============================================
 * PARTICIPANT DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Drawer for viewing and managing event participants
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Role summary cards (Judge, Participant, Volunteer)
 * - Participant list with role and position badges
 * - Remove participant functionality
 * - Empty state with icon
 * - Admin role theming
 * 
 * Dependencies:
 * - Drawer component for slide-out panel
 * - Button component for actions
 * - Lucide React icons
 * ============================================
 */

import { Users, UserMinus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Drawer from "@/components/admin/Drawer";

/**
 * ParticipantDrawer Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Called when drawer closes
 * @param {Object} props.event - Event data object
 * @param {Array} props.participants - List of participants
 * @param {Function} props.onRemove - Called when Remove is clicked
 * @returns {JSX.Element} Rendered drawer
 * 
 * @example
 * <ParticipantDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   event={selectedEvent}
 *   participants={participants}
 *   onRemove={handleRemoveParticipant}
 * />
 */
export default function ParticipantDrawer({
  isOpen,
  onClose,
  event,
  participants,
  onRemove,
}) {
  // ─── Return null if no event ──────────────────────────────────────────
  if (!event) return null;

  // ─── Ensure participants is an array ──────────────────────────────────
  const participantList = Array.isArray(participants) ? participants : [];

  // ─── Role Colors ──────────────────────────────────────────────────────
  const roleColors = {
    Participant: 'bg-[var(--color-student-light)] text-[var(--color-student-primary)]',
    Volunteer: 'bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)]',
    Judge: 'bg-[var(--color-admin-light)] text-[var(--color-admin-primary)]',
  };

  // ─── Role Counts ──────────────────────────────────────────────────────
  const roleCounts = {
    Judge: participantList.filter(p => p.role === 'Judge').length,
    Participant: participantList.filter(p => p.role === 'Participant').length,
    Volunteer: participantList.filter(p => p.role === 'Volunteer').length,
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={`Participants — ${event.event_name}`}
      width="max-w-[350px]"
      footer={
        <button
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          onClick={onClose}
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {/* ─── Role Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="text-center p-2 bg-[var(--color-surface-dim)] rounded-lg">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">{count}</p>
              <p className="text-[8px] text-[var(--color-text-muted)] uppercase">{role}s</p>
            </div>
          ))}
        </div>

        {/* ─── Participants List ────────────────────────────────────── */}
        {participantList.length === 0 ? (
          <div className="text-center py-8">
            <Users size={32} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-muted)]">No participants registered</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {participantList.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-[var(--color-surface-dim)] rounded-lg"
              >
                <div>
                  {/* Student Name */}
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {p.student_name || p.student?.name || p.student || "Unknown Student"}
                  </p>
                  {/* Role Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleColors[p.role] || roleColors.Participant}`}>
                    {p.role}
                  </span>
                  {/* Position (if any) */}
                  {p.position && (
                    <span className="ml-1 text-[10px] text-[var(--color-text-muted)]">({p.position})</span>
                  )}
                </div>
                {/* Remove Button */}
                <button
                  onClick={() => onRemove(p.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                  title="Remove Participant"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}