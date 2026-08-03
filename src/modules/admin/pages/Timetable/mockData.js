// Mock data for TimetableManagement
export const MOCK_CLASSES = [
  { id: 1, class_name: 'Class 10', section: 'A' },
  { id: 2, class_name: 'Class 10', section: 'B' },
  { id: 3, class_name: 'Class 9', section: 'A' },
  { id: 4, class_name: 'Class 9', section: 'B' },
];

export const MOCK_SUBJECTS = [
  { id: 1, subject_name: 'Mathematics', class_section: 1 },
  { id: 2, subject_name: 'English', class_section: 1 },
  { id: 3, subject_name: 'Science', class_section: 1 },
  { id: 4, subject_name: 'Mathematics', class_section: 2 },
  { id: 5, subject_name: 'English', class_section: 2 },
  { id: 6, subject_name: 'Science', class_section: 2 },
  { id: 7, subject_name: 'Mathematics', class_section: 3 },
  { id: 8, subject_name: 'English', class_section: 3 },
  { id: 9, subject_name: 'Science', class_section: 3 },
];

export const MOCK_TEACHERS = [
  { id: 1, full_name: 'Mr. John Smith' },
  { id: 2, full_name: 'Ms. Sarah Johnson' },
  { id: 3, full_name: 'Dr. Mike Brown' },
  { id: 4, full_name: 'Prof. David Wilson' },
];

export const MOCK_ROOMS = [
  { id: 1, name: 'Room 101', location: 'Building A' },
  { id: 2, name: 'Room 102', location: 'Building A' },
  { id: 3, name: 'Room 103', location: 'Building A' },
  { id: 4, name: 'Room 201', location: 'Building B' },
];

export const MOCK_TIMETABLE = [
  { id: 1, class_section: 1, day: 'Mon', subject: 1, teacher: 1, room: 1, start_time: '08:00', end_time: '09:00' },
  { id: 2, class_section: 1, day: 'Mon', subject: 2, teacher: 2, room: 2, start_time: '09:00', end_time: '10:00' },
  { id: 3, class_section: 1, day: 'Tue', subject: 3, teacher: 3, room: 3, start_time: '08:00', end_time: '09:00' },
  { id: 4, class_section: 2, day: 'Mon', subject: 4, teacher: 1, room: 4, start_time: '08:00', end_time: '09:00' },
  { id: 5, class_section: 2, day: 'Tue', subject: 5, teacher: 2, room: 1, start_time: '09:00', end_time: '10:00' },
  { id: 6, class_section: 3, day: 'Wed', subject: 7, teacher: 4, room: 2, start_time: '08:00', end_time: '09:00' },
];
