/**
 * ============================================
 * TIMETABLE MANAGEMENT MOCK DATA
 * ============================================
 * 
 * Purpose: Mock data for timetable management module
 * Used for: Development, testing, and demo environments
 * 
 * Data Types:
 * - Class Sections: Available class sections
 * - Subjects: Available subjects
 * - Teachers: Available teachers
 * - Rooms: Available rooms
 * - Days: Week days
 * - Time Slots: Available time slots
 * - Timetable Entries: Scheduled classes
 * 
 * Usage:
 * import { MOCK_CLASS_SECTIONS, MOCK_TIMETABLE, DAYS } from '@/mocks/Timetablemanagement';
 * ============================================
 */

// ─── Timetable Mock Data ──────────────────────────────────────────────────────

/**
 * ============================================
 * MOCK CLASS SECTIONS
 * ============================================
 * 
 * Class sections from Academic Structure
 * 
 * @constant {Array} MOCK_CLASS_SECTIONS
 * @property {number} id - Class section ID
 * @property {string} name - Class section display name
 */
export const MOCK_CLASS_SECTIONS = [
  { id: 1, name: "Grade 10-A" },
  { id: 2, name: "Grade 10-B" },
  { id: 3, name: "Grade 9-A" },
  { id: 4, name: "Grade 9-B" },
  { id: 5, name: "Grade 8-A" },
  { id: 6, name: "Grade 8-B" },
];

/**
 * ============================================
 * MOCK SUBJECTS
 * ============================================
 * 
 * Available subjects for timetable scheduling
 * 
 * @constant {Array} MOCK_SUBJECTS
 * @property {number} id - Subject ID
 * @property {string} name - Subject name
 */
export const MOCK_SUBJECTS = [
  { id: 1, name: "Mathematics" },
  { id: 2, name: "Physics" },
  { id: 3, name: "English Literature" },
  { id: 4, name: "Chemistry" },
  { id: 5, name: "Biology" },
  { id: 6, name: "Computer Science" },
  { id: 7, name: "History" },
  { id: 8, name: "Physical Education" },
  { id: 9, name: "Algebra II" },
  { id: 10, name: "Philosophy" },
];

/**
 * ============================================
 * MOCK TEACHERS
 * ============================================
 * 
 * Available teachers for timetable scheduling
 * 
 * @constant {Array} MOCK_TEACHERS
 * @property {number} id - Teacher ID
 * @property {string} name - Teacher's full name
 */
export const MOCK_TEACHERS = [
  { id: 1, name: "Dr. Sarah Smith" },
  { id: 2, name: "Dr. Richard Feynman" },
  { id: 3, name: "Prof. John Doe" },
  { id: 4, name: "Mr. Alan Turing" },
  { id: 5, name: "Dr. Jane Goodall" },
  { id: 6, name: "Coach Carter" },
  { id: 7, name: "Ms. Clara Oswald" },
  { id: 8, name: "Dr. Socrates" },
];

/**
 * ============================================
 * MOCK ROOMS
 * ============================================
 * 
 * Available rooms for timetable scheduling
 * 
 * @constant {Array} MOCK_ROOMS
 * @property {number} id - Room ID
 * @property {string} name - Room name/number
 */
export const MOCK_ROOMS = [
  { id: 1, name: "Room 102" },
  { id: 2, name: "Room 205" },
  { id: 3, name: "Room 302" },
  { id: 4, name: "Lab 04" },
  { id: 5, name: "Lab 02" },
  { id: 6, name: "Hall 05" },
  { id: 7, name: "Science Lab 01" },
  { id: 8, name: "Ground 01" },
];

/**
 * ============================================
 * DAYS
 * ============================================
 * 
 * Week days for timetable
 * 
 * @constant {Array} DAYS
 */
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * ============================================
 * TIME SLOTS
 * ============================================
 * 
 * Available time slots for scheduling
 * 
 * @constant {Array} TIME_SLOTS
 */
export const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00'
];

// ─── Timetable Entries ──────────────────────────────────────────────────────

/**
 * ============================================
 * MOCK TIMETABLE
 * ============================================
 * 
 * Scheduled timetable entries
 * 
 * @constant {Array} MOCK_TIMETABLE
 * @property {number} id - Timetable entry ID
 * @property {number} class_section_id - Class section ID
 * @property {string} class_section - Class section display name
 * @property {number} subject_id - Subject ID
 * @property {string} subject - Subject name
 * @property {number} teacher_id - Teacher ID
 * @property {string} teacher - Teacher's name
 * @property {number} room_id - Room ID
 * @property {string} room - Room name
 * @property {string} day - Day of week (Mon, Tue, Wed, Thu, Fri, Sat)
 * @property {string} start_time - Start time (HH:MM)
 * @property {string} end_time - End time (HH:MM)
 * 
 * @example
 * // Get all entries for Grade 10-A
 * const grade10A = MOCK_TIMETABLE.filter(e => e.class_section_id === 1);
 * 
 * // Get all entries for a specific teacher
 * const teacherEntries = MOCK_TIMETABLE.filter(e => e.teacher_id === 1);
 */
export const MOCK_TIMETABLE = [
  // ─── Grade 10-A ───
  {
    id: 1,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 1,
    subject: "Mathematics",
    teacher_id: 1,
    teacher: "Dr. Sarah Smith",
    room_id: 1,
    room: "Room 102",
    day: "Mon",
    start_time: "08:00",
    end_time: "09:00",
  },
  {
    id: 2,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 7,
    subject: "History",
    teacher_id: 7,
    teacher: "Ms. Clara Oswald",
    room_id: 2,
    room: "Room 205",
    day: "Mon",
    start_time: "08:00",
    end_time: "09:00",
  },
  {
    id: 3,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 3,
    subject: "English Literature",
    teacher_id: 3,
    teacher: "Prof. John Doe",
    room_id: 2,
    room: "Room 205",
    day: "Tue",
    start_time: "08:00",
    end_time: "09:00",
  },
  {
    id: 4,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 6,
    subject: "Computer Science",
    teacher_id: 4,
    teacher: "Mr. Alan Turing",
    room_id: 4,
    room: "Lab 04",
    day: "Tue",
    start_time: "09:00",
    end_time: "10:00",
  },
  {
    id: 5,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 10,
    subject: "Philosophy",
    teacher_id: 8,
    teacher: "Dr. Socrates",
    room_id: 6,
    room: "Hall 05",
    day: "Thu",
    start_time: "11:00",
    end_time: "12:00",
  },
  {
    id: 6,
    class_section_id: 1,
    class_section: "Grade 10-A",
    subject_id: 8,
    subject: "Physical Education",
    teacher_id: 6,
    teacher: "Coach Carter",
    room_id: 8,
    room: "Ground 01",
    day: "Thu",
    start_time: "09:00",
    end_time: "10:00",
  },

  // ─── Grade 10-B ───
  {
    id: 7,
    class_section_id: 2,
    class_section: "Grade 10-B",
    subject_id: 2,
    subject: "Physics",
    teacher_id: 2,
    teacher: "Dr. Richard Feynman",
    room_id: 7,
    room: "Science Lab 01",
    day: "Wed",
    start_time: "08:00",
    end_time: "09:00",
  },
  {
    id: 8,
    class_section_id: 2,
    class_section: "Grade 10-B",
    subject_id: 4,
    subject: "Chemistry",
    teacher_id: 2,
    teacher: "Dr. Richard Feynman",
    room_id: 5,
    room: "Lab 02",
    day: "Mon",
    start_time: "09:00",
    end_time: "10:00",
  },
  {
    id: 9,
    class_section_id: 2,
    class_section: "Grade 10-B",
    subject_id: 5,
    subject: "Biology",
    teacher_id: 5,
    teacher: "Dr. Jane Goodall",
    room_id: 5,
    room: "Lab 02",
    day: "Tue",
    start_time: "11:00",
    end_time: "12:00",
  },

  // ─── Grade 9-A ───
  {
    id: 10,
    class_section_id: 3,
    class_section: "Grade 9-A",
    subject_id: 9,
    subject: "Algebra II",
    teacher_id: 1,
    teacher: "Dr. Sarah Smith",
    room_id: 1,
    room: "Room 102",
    day: "Wed",
    start_time: "11:00",
    end_time: "12:00",
  },
];