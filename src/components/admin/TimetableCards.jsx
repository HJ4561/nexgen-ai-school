/**
 * ============================================
 * TIMETABLE CARDS COMPONENT
 * ============================================
 * 
 * Purpose: Displays timetable entries in a card-based layout
 * Features:
 * - Day-by-day grouping with headers
 * - Time slot display with entry details
 * - Occupied slots with subject, teacher, room, and time
 * - Empty slots with add functionality
 * - Color-coded border accents (admin, teacher, student, parent)
 * - Click to edit occupied slots
 * - Click empty slot to add new entry
 * - Hover and active states
 * - Responsive grid layout
 * 
 * Dependencies:
 * - lucide-react for icons (Building, Clock, CalendarDays, Plus)
 * - @/utils/helpers for TIME_SLOTS configuration
 * 
 * Usage:
 * <TimetableCards
 *   entries={timetableEntries}
 *   onEdit={handleEdit}
 *   onAdd={handleAdd}
 *   selectedClass={selectedClass}
 *   DAYS={daysOfWeek}
 * />
 * ============================================
 */

import { Building, Clock, CalendarDays, Plus } from "lucide-react";
import { TIME_SLOTS } from "@/utils/helpers";

/**
 * ============================================
 * TIMETABLE CARDS COMPONENT
 * ============================================
 * 
 * Renders a card-based timetable with day grouping
 * 
 * @param {Object} props - Component props
 * @param {Array} props.entries - Array of timetable entry objects
 * @param {Function} props.onEdit - Callback when an occupied slot is clicked
 * @param {Function} props.onAdd - Callback when an empty slot is clicked
 * @param {string|number} props.selectedClass - Currently selected class ID
 * @param {Array} props.DAYS - Array of day names (e.g., ['Monday', 'Tuesday', ...])
 * @returns {JSX.Element} Timetable cards UI
 * 
 * @example
 * const entries = [
 *   { id: 1, day: 'Monday', start_time: '09:00', end_time: '10:00', subject: 'Math', teacher: 'Mr. Smith', room: '101' }
 * ];
 * 
 * <TimetableCards
 *   entries={entries}
 *   onEdit={(entry) => openEditDrawer(entry)}
 *   onAdd={(day, time) => openAddDrawer(day, time)}
 *   selectedClass="10-A"
 *   DAYS={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
 * />
 * ============================================
 */
export default function TimetableCards({ entries, onEdit, onAdd, selectedClass, DAYS }) {
  /**
   * ============================================
   * NO CLASS SELECTED
   * ============================================
   * 
   * Displays a prompt when no class is selected
   */
  if (!selectedClass) {
    return (
      <div className="py-12 text-center text-[var(--color-text-muted)] text-sm">
        Please select a class to view timetable.
      </div>
    );
  }

  /**
   * ============================================
   * GET ENTRIES BY DAY
   * ============================================
   * 
   * Filters entries for a specific day
   * 
   * @param {string} day - Day name
   * @returns {Array} Filtered entries
   */
  const getEntriesByDay = (day) => {
    return entries.filter((e) => e.day === day);
  };

  /**
   * ============================================
   * GET ENTRY
   * ============================================
   * 
   * Finds an entry for a specific day and time
   * 
   * @param {string} day - Day name
   * @param {string} time - Time slot (HH:MM format)
   * @returns {Object|null} Matching entry or null
   */
  const getEntry = (day, time) => {
    return entries.find(
      (e) => e.day === day && e.start_time?.slice(0, 5) === time
    );
  };

  /**
   * ============================================
   * GET NEXT TIME SLOT
   * ============================================
   * 
   * Returns the next time slot in the TIME_SLOTS array
   * Used for displaying the end time in empty slots
   * 
   * @param {string} time - Current time slot
   * @returns {string} Next time slot or current if last
   */
  const getNextTimeSlot = (time) => {
    const index = TIME_SLOTS.indexOf(time);
    return index < TIME_SLOTS.length - 1 ? TIME_SLOTS[index + 1] : time;
  };

  /**
   * ============================================
   * HANDLE EMPTY SLOT CLICK
   * ============================================
   * 
   * Triggers the onAdd callback with day and time
   * 
   * @param {string} day - Day name
   * @param {string} time - Time slot
   */
  const handleEmptySlotClick = (day, time) => {
    onAdd(day, time);
  };

  /**
   * ============================================
   * COLOR TONE MAPPING
   * ============================================
   * 
   * Determines accent color based on subject index
   * Cycles through: admin, teacher, student, parent
   */
  const colorTones = ['admin', 'teacher', 'student', 'parent'];

  return (
    <div className="space-y-6">
      {DAYS.map((day) => {
        const dayEntries = getEntriesByDay(day);

        return (
          <div key={day} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {/* ─── Day Header ─── */}
            <div className="bg-[var(--color-surface-dim)] px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[var(--color-admin-primary)]" />
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {day}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] ml-auto">
                  {dayEntries.length} classes
                </span>
              </div>
            </div>

            {/* ─── Time Slots ─── */}
            <div className="p-3 grid grid-cols-1 gap-2">
              {TIME_SLOTS.map((time) => {
                const entry = getEntry(day, time);
                const isOccupied = !!entry;

                if (isOccupied) {
                  // ─── Occupied Slot ───
                  const colorTone = colorTones[(entry.subject || 0) % colorTones.length];
                  const borderColor = `var(--color-${colorTone}-primary)`;

                  return (
                    <div
                      key={`${day}-${time}`}
                      onClick={() => onEdit(entry)}
                      className="relative bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:shadow-md overflow-hidden"
                    >
                      {/* Accent border — flush to the left edge */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{ backgroundColor: borderColor }}
                      />
                      
                      <div className="pl-4 pr-3 py-2.5">
                        <div className="flex items-start justify-between">
                          {/* Subject and Teacher */}
                          <div>
                            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                              {entry.subject_name || entry.subject}
                            </p>
                            <p className="text-[11px] text-[var(--color-text-secondary)]">
                              {entry.teacher_name || entry.teacher || "Unassigned"}
                            </p>
                          </div>
                          {/* Time */}
                          <div className="flex flex-col items-end text-[10px] text-[var(--color-text-muted)] shrink-0 ml-2">
                            <span>{time}</span>
                            <span>- {entry.end_time}</span>
                          </div>
                        </div>
                        {/* Room */}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--color-text-muted)]">
                          <Building size={12} />
                          <span>{entry.room_name || entry.room || "—"}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ─── Empty Slot ───
                return (
                  <div
                    key={`${day}-${time}-empty`}
                    onClick={() => handleEmptySlotClick(day, time)}
                    className="relative bg-white rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)]/10 transition-all active:scale-[0.98] overflow-hidden"
                  >
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Plus size={14} className="text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {time} - {getNextTimeSlot(time)}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)]">Available</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}