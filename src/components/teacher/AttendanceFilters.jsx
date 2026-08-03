/**
 * ============================================
 * ATTENDANCE FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for attendance management
 * Features:
 * - Class dropdown selector
 * - Date picker input
 * - Responsive grid layout (1 column mobile, 2 columns desktop)
 * - Consistent card styling with border and shadow
 * 
 * Dependencies:
 * - @/components/ui/Input for date field
 * - @/components/ui/Select for class dropdown
 * 
 * Usage:
 * <AttendanceFilters
 *   classes={classesList}
 *   selectedClass={selectedClass}
 *   setSelectedClass={setSelectedClass}
 *   attendanceDate={attendanceDate}
 *   setAttendanceDate={setAttendanceDate}
 * />
 * ============================================
 */

import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * ============================================
 * ATTENDANCE FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for attendance management
 * 
 * @param {Object} props - Component props
 * @param {Array} props.classes - Array of class objects for dropdown
 * @param {string} props.selectedClass - Currently selected class ID
 * @param {Function} props.setSelectedClass - Setter function for selected class
 * @param {string} props.attendanceDate - Currently selected date
 * @param {Function} props.setAttendanceDate - Setter function for attendance date
 * @returns {JSX.Element} Attendance filters UI
 * 
 * @example
 * const [selectedClass, setSelectedClass] = useState('');
 * const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
 * const classes = [{ id: 1, name: 'Class 10-A' }, { id: 2, name: 'Class 10-B' }];
 * 
 * <AttendanceFilters
 *   classes={classes}
 *   selectedClass={selectedClass}
 *   setSelectedClass={setSelectedClass}
 *   attendanceDate={attendanceDate}
 *   setAttendanceDate={setAttendanceDate}
 * />
 * ============================================
 */
const AttendanceFilters = ({
  classes,
  selectedClass,
  setSelectedClass,
  attendanceDate,
  setAttendanceDate
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ─── Class Filter Dropdown ─── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Class</label>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select Class</option>
            {classes?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
        </div>

        {/* ─── Date Filter Input ─── */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Date</label>
          <Input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceFilters;