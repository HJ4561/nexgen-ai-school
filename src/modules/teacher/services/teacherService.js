/**
 * ============================================
 * TEACHER SERVICE
 * ============================================
 * 
 * Purpose: Handles all teacher-related API calls
 * Used by: teacherThunks and teacher components
 * 
 * Features:
 * - Profile management
 * - Class and student management
 * - Attendance tracking
 * - Timetable operations
 * - Assignment CRUD operations
 * - Grade management
 * - Behavior logs
 * - Complaint handling
 * - Notification management
 * - Settings and password management
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * 
 * API Endpoints:
 * - /teacher/profile
 * - /teacher/classes
 * - /teacher/attendance
 * - /teacher/timetable
 * - /teacher/assignments
 * - /teacher/grades
 * - /teacher/behavior-logs
 * - /teacher/complaints
 * - /teacher/notifications
 * - /teacher/settings
 * - /teacher/change-password
 * ============================================
 */

import api from '@/services/api';

/**
 * ============================================
 * TEACHER SERVICE
 * ============================================
 * 
 * Service object containing all teacher-related API methods
 */
export const teacherService = {
  // ─── Profile ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET PROFILE
   * ============================================
   * 
   * Fetches the authenticated teacher's profile information
   * 
   * @returns {Promise<Object>} Teacher profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const profile = await teacherService.getProfile();
   * console.log(profile.full_name);
   */
  getProfile: async () => {
    const response = await api.get('/teacher/profile');
    return response.data;
  },

  /**
   * ============================================
   * UPDATE PROFILE
   * ============================================
   * 
   * Updates the authenticated teacher's profile information
   * 
   * @param {Object} data - Profile data to update
   * @param {string} data.full_name - Teacher's full name
   * @param {string} data.email - Teacher's email address
   * @param {string} data.phone - Teacher's phone number
   * @param {string} data.specialization - Teacher's specialization
   * @returns {Promise<Object>} Updated profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await teacherService.updateProfile({
   *   full_name: 'Dr. Sarah Jenkins',
   *   phone: '+92-300-1234567'
   * });
   */
  updateProfile: async (data) => {
    const response = await api.put('/teacher/profile', data);
    return response.data;
  },

  // ─── Classes ─────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET CLASSES
   * ============================================
   * 
   * Fetches all classes assigned to the teacher
   * 
   * @returns {Promise<Array>} Array of class objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const classes = await teacherService.getClasses();
   * console.log(`Teaching ${classes.length} classes`);
   */
  getClasses: async () => {
    const response = await api.get('/teacher/classes');
    return response.data;
  },

  /**
   * ============================================
   * GET STUDENTS
   * ============================================
   * 
   * Fetches students for a specific class
   * 
   * @param {number} classId - Class section ID
   * @returns {Promise<Array>} Array of student objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const students = await teacherService.getStudents(1);
   * students.forEach(s => console.log(s.full_name));
   */
  getStudents: async (classId) => {
    const response = await api.get(`/teacher/classes/${classId}/students`);
    return response.data;
  },

  // ─── Attendance ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET ATTENDANCE
   * ============================================
   * 
   * Fetches attendance records for a specific class and date
   * 
   * @param {number} classId - Class section ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Attendance records
   * @throws {Error} If the request fails
   * 
   * @example
   * const attendance = await teacherService.getAttendance(1, '2026-07-15');
   */
  getAttendance: async (classId, date) => {
    const response = await api.get(`/teacher/attendance`, { params: { classId, date } });
    return response.data;
  },

  /**
   * ============================================
   * MARK ATTENDANCE
   * ============================================
   * 
   * Marks attendance for students in a class
   * 
   * @param {Object} data - Attendance data
   * @param {number} data.classId - Class section ID
   * @param {string} data.date - Date in YYYY-MM-DD format
   * @param {Array} data.records - Array of { studentId, status }
   * @param {string} data.records[].status - 'Present', 'Absent', or 'Late'
   * @returns {Promise<Object>} Created attendance records
   * @throws {Error} If the request fails
   * 
   * @example
   * const result = await teacherService.markAttendance({
   *   classId: 1,
   *   date: '2026-07-15',
   *   records: [
   *     { studentId: 101, status: 'Present' },
   *     { studentId: 102, status: 'Absent' }
   *   ]
   * });
   */
  markAttendance: async (data) => {
    const response = await api.post('/teacher/attendance', data);
    return response.data;
  },

  /**
   * ============================================
   * UPDATE ATTENDANCE
   * ============================================
   * 
   * Updates an existing attendance record
   * 
   * @param {number} id - Attendance record ID
   * @param {Object} data - Updated attendance data
   * @param {string} data.status - New status ('Present', 'Absent', or 'Late')
   * @returns {Promise<Object>} Updated attendance record
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await teacherService.updateAttendance(123, {
   *   status: 'Present'
   * });
   */
  updateAttendance: async (id, data) => {
    const response = await api.put(`/teacher/attendance/${id}`, data);
    return response.data;
  },

  // ─── Timetable ───────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET TIMETABLE
   * ============================================
   * 
   * Fetches the teacher's weekly timetable
   * 
   * @returns {Promise<Array>} Timetable entries
   * @throws {Error} If the request fails
   * 
   * @example
   * const timetable = await teacherService.getTimetable();
   * // Returns: [{ day: 'Monday', startTime: '09:00', subject: 'Math', class: '10-A' }]
   */
  getTimetable: async () => {
    const response = await api.get('/teacher/timetable');
    return response.data;
  },

  // ─── Assignments ─────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET ASSIGNMENTS
   * ============================================
   * 
   * Fetches all assignments created by the teacher
   * 
   * @returns {Promise<Array>} Array of assignment objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const assignments = await teacherService.getAssignments();
   */
  getAssignments: async () => {
    const response = await api.get('/teacher/assignments');
    return response.data;
  },

  /**
   * ============================================
   * CREATE ASSIGNMENT
   * ============================================
   * 
   * Creates a new assignment
   * 
   * @param {Object} data - Assignment data
   * @param {string} data.title - Assignment title
   * @param {string} data.description - Assignment description
   * @param {number} data.subject_id - Subject ID
   * @param {number} data.class_section_id - Class section ID
   * @param {string} data.due_date - Due date in YYYY-MM-DD format
   * @param {string} data.attachment_url - Optional attachment URL
   * @returns {Promise<Object>} Created assignment
   * @throws {Error} If the request fails
   * 
   * @example
   * const assignment = await teacherService.createAssignment({
   *   title: 'Quadratic Equations Quiz',
   *   description: 'Solve 10 quadratic equations',
   *   subject_id: 1,
   *   class_section_id: 1,
   *   due_date: '2026-07-20'
   * });
   */
  createAssignment: async (data) => {
    const response = await api.post('/teacher/assignments', data);
    return response.data;
  },

  /**
   * ============================================
   * UPDATE ASSIGNMENT
   * ============================================
   * 
   * Updates an existing assignment
   * 
   * @param {number} id - Assignment ID
   * @param {Object} data - Updated assignment data
   * @returns {Promise<Object>} Updated assignment
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await teacherService.updateAssignment(1, {
   *   title: 'Updated Quiz Title'
   * });
   */
  updateAssignment: async (id, data) => {
    const response = await api.put(`/teacher/assignments/${id}`, data);
    return response.data;
  },

  /**
   * ============================================
   * DELETE ASSIGNMENT
   * ============================================
   * 
   * Deletes an assignment by ID
   * 
   * @param {number} id - Assignment ID
   * @returns {Promise<Object>} Deletion confirmation
   * @throws {Error} If the request fails
   * 
   * @example
   * await teacherService.deleteAssignment(1);
   */
  deleteAssignment: async (id) => {
    const response = await api.delete(`/teacher/assignments/${id}`);
    return response.data;
  },

  /**
   * ============================================
   * GET SUBMISSIONS
   * ============================================
   * 
   * Fetches submissions for a specific assignment
   * 
   * @param {number} assignmentId - Assignment ID
   * @returns {Promise<Array>} Array of submission objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const submissions = await teacherService.getSubmissions(1);
   * console.log(`${submissions.length} students submitted`);
   */
  getSubmissions: async (assignmentId) => {
    const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  /**
   * ============================================
   * GRADE SUBMISSION
   * ============================================
   * 
   * Grades a student's submission
   * 
   * @param {number} submissionId - Submission ID
   * @param {Object} data - Grade data
   * @param {number} data.marks - Marks obtained
   * @param {string} data.feedback - Optional feedback text
   * @returns {Promise<Object>} Updated submission with grade
   * @throws {Error} If the request fails
   * 
   * @example
   * const graded = await teacherService.gradeSubmission(15, {
   *   marks: 85,
   *   feedback: 'Excellent work!'
   * });
   */
  gradeSubmission: async (submissionId, data) => {
    const response = await api.put(`/teacher/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  // ─── Grades ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET GRADES
   * ============================================
   * 
   * Fetches all grades for the teacher's classes
   * 
   * @returns {Promise<Array>} Array of grade objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const grades = await teacherService.getGrades();
   */
  getGrades: async () => {
    const response = await api.get('/teacher/grades');
    return response.data;
  },

  /**
   * ============================================
   * SAVE GRADES
   * ============================================
   * 
   * Saves or updates multiple grades (bulk operation)
   * 
   * @param {Array} data - Array of grade objects
   * @param {number} data[].studentId - Student ID
   * @param {number} data[].subjectId - Subject ID
   * @param {number} data[].obtainedMarks - Marks obtained
   * @param {number} data[].totalMarks - Total marks
   * @param {string} data[].examType - Type of exam
   * @returns {Promise<Object>} Saved grades confirmation
   * @throws {Error} If the request fails
   * 
   * @example
   * const saved = await teacherService.saveGrades([
   *   { studentId: 101, subjectId: 1, obtainedMarks: 85, totalMarks: 100 },
   *   { studentId: 102, subjectId: 1, obtainedMarks: 72, totalMarks: 100 }
   * ]);
   */
  saveGrades: async (data) => {
    const response = await api.post('/teacher/grades', data);
    return response.data;
  },

  /**
   * ============================================
   * PUBLISH GRADES
   * ============================================
   * 
   * Publishes grades to make them visible to students
   * 
   * @param {Object} data - Publication data
   * @param {number} data.classId - Class section ID
   * @param {string} data.examType - Exam type to publish
   * @param {string} data.publishDate - Publication date
   * @returns {Promise<Object>} Publication confirmation
   * @throws {Error} If the request fails
   * 
   * @example
   * const result = await teacherService.publishGrades({
   *   classId: 1,
   *   examType: 'Mid Term',
   *   publishDate: '2026-07-20'
   * });
   */
  publishGrades: async (data) => {
    const response = await api.post('/teacher/grades/publish', data);
    return response.data;
  },

  // ─── Behavior Logs ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET BEHAVIOR LOGS
   * ============================================
   * 
   * Fetches behavior logs for the teacher's students
   * 
   * @param {Object} params - Query parameters (optional)
   * @param {number} params.studentId - Filter by student ID
   * @param {string} params.severity - Filter by severity (Low, Medium, High)
   * @param {string} params.startDate - Start date filter
   * @param {string} params.endDate - End date filter
   * @returns {Promise<Array>} Behavior log entries
   * @throws {Error} If the request fails
   * 
   * @example
   * const logs = await teacherService.getBehaviorLogs({ severity: 'High' });
   */
  getBehaviorLogs: async (params) => {
    const response = await api.get('/teacher/behavior-logs', { params });
    return response.data;
  },

  /**
   * ============================================
   * CREATE BEHAVIOR LOG
   * ============================================
   * 
   * Creates a new behavior log entry
   * 
   * @param {Object} data - Behavior log data
   * @param {number} data.studentId - Student ID
   * @param {string} data.description - Behavior description
   * @param {string} data.severity - Severity level (Low, Medium, High)
   * @param {string} data.actionTaken - Action taken
   * @returns {Promise<Object>} Created behavior log
   * @throws {Error} If the request fails
   * 
   * @example
   * const log = await teacherService.createBehaviorLog({
   *   studentId: 101,
   *   description: 'Disruptive behavior in class',
   *   severity: 'Medium',
   *   actionTaken: 'Verbal warning given'
   * });
   */
  createBehaviorLog: async (data) => {
    const response = await api.post('/teacher/behavior-logs', data);
    return response.data;
  },

  // ─── Complaints ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET COMPLAINTS
   * ============================================
   * 
   * Fetches all complaints filed by or related to the teacher
   * 
   * @returns {Promise<Array>} Array of complaint objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const complaints = await teacherService.getComplaints();
   */
  getComplaints: async () => {
    const response = await api.get('/teacher/complaints');
    return response.data;
  },

  /**
   * ============================================
   * CREATE COMPLAINT
   * ============================================
   * 
   * Creates a new complaint
   * 
   * @param {Object} data - Complaint data
   * @param {string} data.complaint_type - Type of complaint
   * @param {string} data.description - Complaint description
   * @param {string} data.against_user - User being complained about
   * @param {string} data.attachment_url - Optional attachment URL
   * @returns {Promise<Object>} Created complaint
   * @throws {Error} If the request fails
   * 
   * @example
   * const complaint = await teacherService.createComplaint({
   *   complaint_type: 'Facilities',
   *   description: 'Broken projector in Room 402',
   *   against_user: 'Maintenance Department'
   * });
   */
  createComplaint: async (data) => {
    const response = await api.post('/teacher/complaints', data);
    return response.data;
  },

  /**
   * ============================================
   * UPDATE COMPLAINT
   * ============================================
   * 
   * Updates an existing complaint
   * 
   * @param {number} id - Complaint ID
   * @param {Object} data - Updated complaint data
   * @returns {Promise<Object>} Updated complaint
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await teacherService.updateComplaint(1, {
   *   status: 'Resolved'
   * });
   */
  updateComplaint: async (id, data) => {
    const response = await api.put(`/teacher/complaints/${id}`, data);
    return response.data;
  },

  // ─── Notifications ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET NOTIFICATIONS
   * ============================================
   * 
   * Fetches all notifications for the teacher
   * 
   * @returns {Promise<Array>} Array of notification objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const notifications = await teacherService.getNotifications();
   */
  getNotifications: async () => {
    const response = await api.get('/teacher/notifications');
    return response.data;
  },

  /**
   * ============================================
   * MARK NOTIFICATION READ
   * ============================================
   * 
   * Marks a single notification as read
   * 
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   * @throws {Error} If the request fails
   * 
   * @example
   * await teacherService.markNotificationRead(5);
   */
  markNotificationRead: async (id) => {
    const response = await api.put(`/teacher/notifications/${id}/read`);
    return response.data;
  },

  /**
   * ============================================
   * MARK ALL NOTIFICATIONS READ
   * ============================================
   * 
   * Marks all notifications as read
   * 
   * @returns {Promise<Object>} Confirmation of update
   * @throws {Error} If the request fails
   * 
   * @example
   * await teacherService.markAllNotificationsRead();
   */
  markAllNotificationsRead: async () => {
    const response = await api.put('/teacher/notifications/read-all');
    return response.data;
  },

  // ─── Settings ────────────────────────────────────────────────────────────

  /**
   * ============================================
   * UPDATE SETTINGS
   * ============================================
   * 
   * Updates teacher settings and preferences
   * 
   * @param {Object} data - Settings data
   * @param {string} data.theme - UI theme preference
   * @param {string} data.language - Language preference
   * @param {boolean} data.emailNotifications - Email notification preference
   * @param {string} data.timezone - Timezone setting
   * @returns {Promise<Object>} Updated settings
   * @throws {Error} If the request fails
   * 
   * @example
   * const settings = await teacherService.updateSettings({
   *   theme: 'dark',
   *   emailNotifications: true
   * });
   */
  updateSettings: async (data) => {
    const response = await api.put('/teacher/settings', data);
    return response.data;
  },

  /**
   * ============================================
   * CHANGE PASSWORD
   * ============================================
   * 
   * Changes the teacher's password
   * 
   * @param {Object} data - Password change data
   * @param {string} data.current_password - Current password
   * @param {string} data.new_password - New password
   * @param {string} data.confirm_password - Confirm new password
   * @returns {Promise<Object>} Password change confirmation
   * @throws {Error} If the request fails
   * 
   * @example
   * const result = await teacherService.changePassword({
   *   current_password: 'old123',
   *   new_password: 'new456',
   *   confirm_password: 'new456'
   * });
   */
  changePassword: async (data) => {
    const response = await api.put('/teacher/change-password', data);
    return response.data;
  },
};

export default teacherService;