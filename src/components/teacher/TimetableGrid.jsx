/**
 * ============================================
 * TIMETABLE GRID COMPONENT (ADMIN VIEW)
 * ============================================
 * 
 * Purpose: Renders a visual timetable grid with time slots and days
 * Features:
 * - Grid layout with time rows and day columns
 * - Recess row with Utensils icon (at 10:00)
 * - Interactive slots with add/edit functionality
 * - Color-coded entries by subject
 * - Responsive with horizontal scroll on mobile
 * - Background highlighting for recess period
 * - Compact desktop and mobile layouts
 * 
 * Dependencies:
 * - @/utils/helpers for DAYS and TIME_SLOTS constants
 * - @/components/admin/TimetableSlot for individual slot rendering
 * - lucide-react for icons (Utensils)
 * 
 * Usage:
 * <TimetableGrid
 *   gridData={gridData}
 *   onAddSlot={handleAddSlot}
 *   onEditSlot={handleEditSlot}
 * />
 * ============================================
 */

import { DAYS, TIME_SLOTS } from "@/utils/helpers";
import TimetableSlot from "./TimetableSlot";
import { Utensils } from "lucide-react";

/**
 * ============================================
 * TIMETABLE GRID COMPONENT
 * ============================================
 * 
 * Renders a responsive timetable grid with time slots and days
 * 
 * @param {Object} props - Component props
 * @param {Object} props.gridData - Grid data object structured as gridData[time][day]
 * @param {Function} props.onAddSlot - Callback when an empty slot is clicked
 * @param {Function} props.onEditSlot - Callback when an occupied slot is clicked
 * @returns {JSX.Element} Timetable grid UI
 * 
 * @example
 * const gridData = {
 *   '09:00': {
 *     'Monday': { id: 1, subject: 'Math', teacher: 'Mr. Smith', room: '101' },
 *     'Tuesday': { id: 2, subject: 'Science', teacher: 'Ms. Jones', room: '102' }
 *   }
 * };
 * 
 * <TimetableGrid
 *   gridData={gridData}
 *   onAddSlot={(day, time) => openAddDrawer(day, time)}
 *   onEditSlot={(entry) => openEditDrawer(entry)}
 * />
 * ============================================
 */
export default function TimetableGrid({
  gridData,
  onAddSlot,
  onEditSlot,
}) {
  /**
   * ============================================
   * RECESS TIME CONFIGURATION
   * ============================================
   * 
   * Defines the time slot for recess (10:00)
   * This row displays a special "Recess" cell spanning all days
   */
  const RECESS_TIME = "10:00";

  return (
    <div className="overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8">
      <div className="min-w-[700px] md:min-w-0 px-4 sm:px-6 lg:px-8">
        {/* ─── Header Row ─── */}
        <div className="grid grid-cols-[60px_repeat(6,1fr)] md:grid-cols-[80px_repeat(6,1fr)] border-b border-gray-200 bg-[var(--color-surface-dim)]/30 px-4 sm:px-6 lg:px-8">
          {/* Time column header */}
          <div className="p-2 md:p-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
            Time
          </div>
          {/* Day headers */}
          {DAYS.map((day) => (
            <div key={day} className="p-2 md:p-3 text-center text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
              {day}
            </div>
          ))}
        </div>

        {/* ─── Body Rows ─── */}
        {TIME_SLOTS.map((time) => {
          // Check if this time slot is the recess period
          const isRecess = time === RECESS_TIME;
          
          return (
            <div
              key={`row-${time}`}
              className={`grid grid-cols-[60px_repeat(6,1fr)] md:grid-cols-[80px_repeat(6,1fr)] border-b border-gray-100 last:border-0 ${
                isRecess ? "bg-[var(--color-surface-dim)]/20" : ""
              }`}
            >
              {/* ─── Time Label ─── */}
              <div className="p-2 md:p-3 flex flex-col md:flex-row items-center justify-center text-[10px] md:text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface-dim)]/30 px-4 sm:px-6 lg:px-8">
                {time}
              </div>

              {/* ─── Day Cells ─── */}
              {DAYS.map((day) => {
                // Get entry for this time and day from gridData
                const entry = gridData[time]?.[day] || null;

                // ─── Recess Row ───
                if (isRecess) {
                  // Only render the first day's cell spanning all columns
                  if (day === DAYS[0]) {
                    return (
                      <div
                        key={`${time}-${day}`}
                        className="col-span-6 p-1 md:p-2 flex flex-col md:flex-row items-center justify-center text-[10px] md:text-xs text-[var(--color-text-muted)] italic gap-1 md:gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8"
                      >
                        <Utensils size={16} className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
                        <span className="font-medium uppercase tracking-wider px-4 sm:px-6 lg:px-8">Recess</span>
                      </div>
                    );
                  }
                  return null;
                }

                // ─── Regular Slot ───
                return (
                  <TimetableSlot
                    key={`${time}-${day}`}
                    entry={entry}
                    time={time}
                    day={day}
                    onAdd={onAddSlot}
                    onEdit={onEditSlot}
                    subjectName={entry?.subject_name || entry?.subject}
                    teacherName={entry?.teacher_name || entry?.teacher}
                    roomName={entry?.room_name || entry?.room}
                    colorTone={entry?.colorTone || 'admin'}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}