/**
 * ============================================
 * TIMETABLE MOBILE LIST COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Displays timetable in a mobile-friendly list format
 * Features:
 * - Groups entries by day
 * - Shows day headers (Mon, Tue, Wed, etc.)
 * - Status indicators (Now, Completed, Upcoming)
 * - Color-coded borders based on status
 * - Subject name, class, and room display
 * - Time slot display
 * - Responsive list layout
 * 
 * Dependencies:
 * - @/hooks/useTimetableData for status helper functions
 * 
 * Usage:
 * <TimetableMobileList allScheduleItems={scheduleItems} />
 * ============================================
 */

import { isCurrentSlot, isSlotCompleted } from "@/hooks/useTimetableData";

/**
 * ============================================
 * CONSTANTS
 * ============================================
 * 
 * Day abbreviations and full display names
 * - DAYS: Short day names for grouping
 * - DAY_DISPLAY: Full day names for display
 */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_DISPLAY = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };

/**
 * ============================================
 * TIMETABLE MOBILE LIST COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders a mobile-friendly timetable list
 * 
 * @param {Object} props - Component props
 * @param {Array} props.allScheduleItems - Array of schedule entry objects
 * @param {string} props.allScheduleItems.day - Day abbreviation (Mon, Tue, etc.)
 * @param {string} props.allScheduleItems.startSlot - Time slot (e.g., "09:00")
 * @param {string} props.allScheduleItems.subjectName - Subject name
 * @param {string} props.allScheduleItems.className - Class name
 * @param {string} props.allScheduleItems.roomName - Room name
 * @returns {JSX.Element} Timetable mobile list UI
 * 
 * @example
 * const scheduleItems = [
 *   { id: 1, day: 'Mon', startSlot: '09:00', subjectName: 'Mathematics', className: '10-A', roomName: '101' },
 *   { id: 2, day: 'Mon', startSlot: '10:00', subjectName: 'Science', className: '10-A', roomName: '102' }
 * ];
 * 
 * <TimetableMobileList allScheduleItems={scheduleItems} />
 * ============================================
 */
export default function TimetableMobileList({ allScheduleItems }) {
  /**
   * ============================================
   * GROUP ENTRIES BY DAY
   * ============================================
   * 
   * Groups schedule entries by day for organized display
   * Creates an object with day keys and arrays of entries
   */
  const grouped = allScheduleItems.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = [];
    acc[entry.day].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-4 p-3 px-4 sm:px-6 lg:px-8">
      {DAYS.map(day => {
        const dayEntries = grouped[day] || [];
        // Skip days with no entries
        if (dayEntries.length === 0) return null;
        
        return (
          <div key={day}>
            {/* ─── Day Header ─── */}
            <h3 className="text-sm md:text-base md:text-base font-bold text-[var(--color-text-primary)] mb-2 px-4 sm:px-6 lg:px-8">{DAY_DISPLAY[day]}</h3>
            
            {/* ─── Day Entries ─── */}
            <div className="space-y-2 px-4 sm:px-6 lg:px-8">
              {dayEntries.map(entry => {
                // ─── Status Determination ───
                const timeKey = entry.startSlot;
                const isNow = isCurrentSlot(entry.day, timeKey);
                const isComplete = isSlotCompleted(entry.day, timeKey);
                
                // ─── Status Styles ───
                let statusColor = 'border-gray-200';
                let statusText = '';
                if (isNow) { 
                  statusColor = 'border-[var(--color-teacher-primary)] bg-[var(--color-teacher-light)]'; 
                  statusText = 'Now'; 
                } else if (isComplete) { 
                  statusColor = 'border-gray-300 bg-gray-50'; 
                  statusText = 'Completed'; 
                } else { 
                  statusColor = 'border-blue-200 bg-white'; 
                  statusText = 'Upcoming'; 
                }

                return (
                  <div 
                    key={entry.id} 
                    className={`flex flex-col md:flex-row items-center p-3 rounded-lg border-l-4 shadow-sm ${statusColor}`}
                  >
                    {/* ─── Entry Details ─── */}
                    <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
                      <p className="text-sm md:text-base md:text-base font-semibold text-[var(--color-text-primary)] truncate px-4 sm:px-6 lg:px-8">
                        {entry.subjectName}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">
                        {entry.className} • {entry.roomName}
                      </p>
                    </div>
                    
                    {/* ─── Time & Status ─── */}
                    <div className="text-right shrink-0 ml-2 px-4 sm:px-6 lg:px-8">
                      <p className="text-xs font-medium text-[var(--color-text-primary)] px-4 sm:px-6 lg:px-8">
                        {entry.startSlot}
                      </p>
                      {statusText && (
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          isNow ? 'bg-[var(--color-teacher-primary)] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {statusText}
                        </span>
                      )}
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