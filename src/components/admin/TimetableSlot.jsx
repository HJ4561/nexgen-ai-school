/**
 * ============================================
 * TIMETABLE SLOT COMPONENT
 * ============================================
 * 
 * Purpose: Renders a single cell in the timetable grid
 * Features:
 * - Empty slot with "Add" button (dashed border, hover effects)
 * - Occupied slot with subject, teacher, and room info
 * - Color-coded left border based on subject color
 * - Responsive sizing (mobile vs desktop)
 * - Click handlers for add/edit actions
 * - Hover effects with transitions
 * - Truncated text for long names
 * 
 * Dependencies:
 * - lucide-react for icons (Plus, Building)
 * 
 * Usage:
 * <TimetableSlot
 *   entry={entry}
 *   time="09:00"
 *   day="Monday"
 *   onAdd={handleAdd}
 *   onEdit={handleEdit}
 *   subjectName="Math"
 *   teacherName="Mr. Smith"
 *   roomName="101"
 *   colorTone="admin"
 * />
 * ============================================
 */

import { Plus, Building } from "lucide-react";

/**
 * ============================================
 * TIMETABLE SLOT COMPONENT
 * ============================================
 * 
 * Renders a single timetable cell with add/edit functionality
 * 
 * @param {Object} props - Component props
 * @param {Object|null} props.entry - Entry data or null if empty
 * @param {string} props.time - Time slot (e.g., "09:00")
 * @param {string} props.day - Day name (e.g., "Monday")
 * @param {Function} props.onAdd - Callback when empty slot is clicked
 * @param {Function} props.onEdit - Callback when occupied slot is clicked
 * @param {string} props.subjectName - Subject name for display
 * @param {string} props.teacherName - Teacher name for display
 * @param {string} props.roomName - Room name for display
 * @param {string} props.colorTone - Color theme for border (admin, teacher, student, parent)
 * @returns {JSX.Element} Timetable slot UI
 * 
 * @example
 * // Empty slot
 * <TimetableSlot
 *   entry={null}
 *   time="09:00"
 *   day="Monday"
 *   onAdd={() => openAddDrawer('Monday', '09:00')}
 *   onEdit={() => {}}
 * />
 * 
 * // Occupied slot
 * <TimetableSlot
 *   entry={entryData}
 *   time="10:00"
 *   day="Monday"
 *   onAdd={() => {}}
 *   onEdit={() => openEditDrawer(entryData)}
 *   subjectName="Mathematics"
 *   teacherName="Mr. Smith"
 *   roomName="101"
 *   colorTone="teacher"
 * />
 * ============================================
 */
export default function TimetableSlot({
  entry,
  time,
  day,
  onAdd,
  onEdit,
  subjectName,
  teacherName,
  roomName,
  colorTone,
}) {
  // ─── Check if slot is empty ──────────────────────────────────────
  const isEmpty = !entry;

  // ─── Empty Slot ────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <div
        className="p-0.5 md:p-1.5 min-h-[55px] md:min-h-[80px] cursor-pointer transition-colors hover:bg-[var(--color-admin-light)]/30 bg-white"
        onClick={() => onAdd(day, time)}
      >
        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:border-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)]/20 transition-all">
          {/* Add button - visible on hover */}
          <div className="flex flex-col items-center opacity-30 hover:opacity-70 transition-opacity">
            <Plus size={14} className="md:size-4 text-[var(--color-admin-primary)]" />
            <span className="text-[6px] md:text-[8px] font-bold uppercase text-[var(--color-admin-primary)] hidden sm:block">
              Add
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Occupied Slot ─────────────────────────────────────────────────
  return (
    <div
      className="p-0.5 md:p-1.5 min-h-[55px] md:min-h-[80px] cursor-pointer transition-colors hover:bg-[var(--color-admin-light)]/30"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(entry);
      }}
    >
      <div
        className="h-full rounded-lg p-1.5 md:p-2 border-l-4 cursor-pointer hover:shadow-md transition-all"
        style={{
          borderLeftColor: `var(--color-${colorTone || 'admin'}-primary)`,
          background: "rgba(255,255,255,0.7)",
        }}
      >
        {/* ─── Subject Name ─── */}
        <p className="text-[10px] md:text-xs font-bold text-[var(--color-text-primary)] truncate">
          {subjectName || entry.subject}
        </p>
        
        {/* ─── Teacher Name (hidden on small mobile) ─── */}
        <p className="text-[8px] md:text-[10px] text-[var(--color-text-muted)] truncate hidden sm:block">
          {teacherName || entry.teacher}
        </p>
        
        {/* ─── Room (hidden on mobile, visible on desktop) ─── */}
        <div className="flex items-center gap-0.5 mt-0.5 hidden md:flex">
          <Building size={10} className="text-[var(--color-text-muted)]" />
          <span className="text-[8px] md:text-[9px] text-[var(--color-text-muted)] truncate">
            {roomName || entry.room}
          </span>
        </div>
      </div>
    </div>
  );
}