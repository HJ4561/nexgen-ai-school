/**
 * ============================================
 * ADD PARTICIPANT DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Drawer for adding participants to an event
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Student selection from dropdown
 * - Role selection (Participant, Judge, Volunteer)
 * - Position selection (1st Place, 2nd Place, 3rd Place, Winner, Participant, Organizer)
 * - Event name display
 * - Admin role theming
 * - Loading state for add button
 * 
 * Dependencies:
 * - Drawer component for slide-out panel
 * - UI components (Button, Select)
 * ============================================
 */

import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Drawer from "@/components/admin/Drawer";

// ─── Position Options ──────────────────────────────────────────────────
const POSITION_OPTIONS = [
  { value: '1st Place', label: '1st Place' },
  { value: '2nd Place', label: '2nd Place' },
  { value: '3rd Place', label: '3rd Place' },
  { value: 'Winner', label: 'Winner' },
  { value: 'Participant', label: 'Participant' },
  { value: 'Organizer', label: 'Organizer' },
];

/**
 * AddParticipantDrawer Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Called when drawer closes
 * @param {Object} props.event - Event data object
 * @param {Array} props.students - List of students for dropdown
 * @param {Object} props.formData - Form data { student_id, role, position }
 * @param {Function} props.setFormData - Update form data
 * @param {Function} props.onSave - Called when Add is clicked
 * @param {boolean} props.loading - Loading state for add button
 * @returns {JSX.Element} Rendered drawer form
 * 
 * @example
 * <AddParticipantDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   event={selectedEvent}
 *   students={students}
 *   formData={participantForm}
 *   setFormData={setParticipantForm}
 *   onSave={handleAddParticipant}
 *   loading={loading}
 * />
 */
export default function AddParticipantDrawer({
  isOpen,
  onClose,
  event,
  students,
  formData,
  setFormData,
  onSave,
  loading,
}) {
  // ─── Return null if no event ──────────────────────────────────────────
  if (!event) return null;

  // ─── Student Options ──────────────────────────────────────────────────
  const studentOptions = students.map(s => ({
    value: s.id,
    label: s.full_name,
  }));

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={`Add Participant – ${event.event_name}`}
      width="max-w-[350px]"
      footer={
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--color-admin-primary)] rounded-lg hover:bg-[var(--color-admin-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={loading || !formData.student_id}
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Student Selection ────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Student <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Select
            value={formData.student || ''}
            onChange={(val) => setFormData({ ...formData, student: val })}
            options={[
              { value: '', label: 'Select a student...' },
              ...studentOptions,
            ]}
            tone="admin"
            size="md"
            placeholder="Search student..."
          />
        </div>

        {/* ─── Role Selection ────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Role <span className="text-[var(--color-danger)]">*</span>
          </label>
          <Select
            value={formData.role}
            onChange={(val) => setFormData({ ...formData, role: val })}
            options={[
              { value: 'Participant', label: 'Participant' },
              { value: 'Judge', label: 'Judge' },
              { value: 'Volunteer', label: 'Volunteer' },
            ]}
            tone="admin"
            size="md"
          />
        </div>

        {/* ─── Position Selection ────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Position
          </label>
          <Select
            value={formData.position || ''}
            onChange={(val) => setFormData({ ...formData, position: val })}
            options={POSITION_OPTIONS}
            tone="admin"
            size="md"
            placeholder="Select position..."
          />
        </div>

        {/* ─── Event Info ────────────────────────────────────────────────── */}
        <div className="bg-[var(--color-surface-dim)] p-3 rounded-lg">
          <p className="text-xs text-[var(--color-text-muted)]">
            <span className="font-medium">Event:</span> {event.event_name}
          </p>
        </div>
      </div>
    </Drawer>
  );
}