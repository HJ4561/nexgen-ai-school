/**
 * ============================================
 * TEACHER THUNKS
 * ============================================
 * 
 * Purpose: Async thunks for teacher module API calls
 * Used by: teacherSlice for state management
 * 
 * Features:
 * - Dashboard data fetching
 * - Teacher profile management
 * - Timetable operations
 * - Assignment CRUD operations
 * - Grade management
 * - Attendance tracking
 * - Behavior logs
 * - Complaint handling
 * - Notification management
 * - Settings and password management
 * 
 * Dependencies:
 * - @reduxjs/toolkit for createAsyncThunk
 * - @/services/api for API calls
 * 
 * API Endpoints:
 * - /teacher/dashboard
 * - /teacher/profile
 * - /teacher/classes
 * - /teacher/timetable
 * - /teacher/assignments
 * - /teacher/grades
 * - /teacher/attendance
 * - /teacher/behavior-logs
 * - /teacher/complaints
 * - /teacher/notifications
 * - /teacher/settings
 * ============================================
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// ─── Dashboard ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH TEACHER DASHBOARD
 * ============================================
 * 
 * Fetches teacher dashboard summary and trend data
 * 
 * @returns {Promise<Object>} Dashboard data with summary and trend
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchTeacherDashboard())
 *   .unwrap()
 *   .then(data => console.log(data.summary))
 *   .catch(error => console.error(error));
 */
export const fetchTeacherDashboard = createAsyncThunk(
  'teacher/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH TEACHER PROFILE
 * ============================================
 * 
 * Fetches teacher profile information
 * 
 * @returns {Promise<Object>} Teacher profile data
 * @throws {string} Error message from API
 */
export const fetchTeacherProfile = createAsyncThunk(
  'teacher/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Classes ─────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH TEACHER CLASSES
 * ============================================
 * 
 * Fetches all classes assigned to the teacher
 * 
 * @returns {Promise<Array>} Array of class objects
 * @throws {string} Error message from API
 */
export const fetchTeacherClasses = createAsyncThunk(
  'teacher/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/classes');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * FETCH TEACHER STUDENTS
 * ============================================
 * 
 * Fetches students for a specific class
 * 
 * @param {number} classId - Class section ID
 * @returns {Promise<Object>} Students data with classId
 * @throws {string} Error message from API
 */
export const fetchTeacherStudents = createAsyncThunk(
  'teacher/fetchStudents',
  async (classId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teacher/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Timetable ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH TEACHER TIMETABLE
 * ============================================
 * 
 * Fetches the teacher's weekly timetable
 * 
 * @returns {Promise<Array>} Timetable entries
 * @throws {string} Error message from API
 */
export const fetchTeacherTimetable = createAsyncThunk(
  'teacher/fetchTimetable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/timetable');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Assignments ────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH ASSIGNMENTS
 * ============================================
 * 
 * Fetches all assignments for the teacher
 * 
 * @returns {Promise<Array>} Array of assignment objects
 * @throws {string} Error message from API
 */
export const fetchAssignments = createAsyncThunk(
  'teacher/fetchAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/assignments');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * CREATE ASSIGNMENT
 * ============================================
 * 
 * Creates a new assignment
 * 
 * @param {Object} data - Assignment data (title, description, subject, class_section, due_date)
 * @returns {Promise<Object>} Created assignment object
 * @throws {string} Error message from API
 */
export const createAssignment = createAsyncThunk(
  'teacher/createAssignment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/assignments', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * UPDATE ASSIGNMENT
 * ============================================
 * 
 * Updates an existing assignment
 * 
 * @param {Object} params - { id, ...data }
 * @param {number} params.id - Assignment ID
 * @param {Object} params.data - Updated assignment data
 * @returns {Promise<Object>} Updated assignment object
 * @throws {string} Error message from API
 */
export const updateAssignment = createAsyncThunk(
  'teacher/updateAssignment',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teacher/assignments/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * DELETE ASSIGNMENT
 * ============================================
 * 
 * Deletes an assignment by ID
 * 
 * @param {number} id - Assignment ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {string} Error message from API
 */
export const deleteAssignment = createAsyncThunk(
  'teacher/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/teacher/assignments/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * FETCH SUBMISSIONS
 * ============================================
 * 
 * Fetches submissions for a specific assignment
 * 
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Array>} Array of submission objects
 * @throws {string} Error message from API
 */
export const fetchSubmissions = createAsyncThunk(
  'teacher/fetchSubmissions',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * UPDATE SUBMISSION
 * ============================================
 * 
 * Updates a submission (e.g., adding marks and feedback)
 * 
 * @param {Object} params - { id, ...data }
 * @param {number} params.id - Submission ID
 * @param {Object} params.data - Updated submission data (marks, feedback)
 * @returns {Promise<Object>} Updated submission object
 * @throws {string} Error message from API
 */
export const updateSubmission = createAsyncThunk(
  'teacher/updateSubmission',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teacher/submissions/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Grades ─────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH GRADES
 * ============================================
 * 
 * Fetches all grades for the teacher's classes
 * 
 * @returns {Promise<Array>} Array of grade objects
 * @throws {string} Error message from API
 */
export const fetchGrades = createAsyncThunk(
  'teacher/fetchGrades',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/grades');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * UPDATE GRADE
 * ============================================
 * 
 * Updates a single grade
 * 
 * @param {Object} params - { id, ...data }
 * @param {number} params.id - Grade ID
 * @param {Object} params.data - Updated grade data
 * @returns {Promise<Object>} Updated grade object
 * @throws {string} Error message from API
 */
export const updateGrade = createAsyncThunk(
  'teacher/updateGrade',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teacher/grades/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * SAVE GRADES
 * ============================================
 * 
 * Saves multiple grades at once (bulk operation)
 * 
 * @param {Object} data - Array of grade objects to save
 * @returns {Promise<Object>} Saved grades confirmation
 * @throws {string} Error message from API
 */
export const saveGrades = createAsyncThunk(
  'teacher/saveGrades',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/grades/save', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * PUBLISH GRADES
 * ============================================
 * 
 * Publishes grades to make them visible to students
 * 
 * @param {Object} data - Publication data
 * @returns {Promise<Object>} Publication confirmation
 * @throws {string} Error message from API
 */
export const publishGrades = createAsyncThunk(
  'teacher/publishGrades',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/grades/publish', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Attendance ────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH ATTENDANCE
 * ============================================
 * 
 * Fetches attendance records with optional filters
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.classId - Class section ID
 * @param {string} params.date - Date (YYYY-MM-DD)
 * @returns {Promise<Array>} Attendance records
 * @throws {string} Error message from API
 */
export const fetchAttendance = createAsyncThunk(
  'teacher/fetchAttendance',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/attendance', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * MARK ATTENDANCE
 * ============================================
 * 
 * Marks attendance for students
 * 
 * @param {Object} data - Attendance data
 * @param {number} data.classId - Class section ID
 * @param {string} data.date - Date (YYYY-MM-DD)
 * @param {Array} data.records - Array of { studentId, status }
 * @returns {Promise<Object>} Created attendance records
 * @throws {string} Error message from API
 */
export const markAttendance = createAsyncThunk(
  'teacher/markAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/attendance', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * UPDATE ATTENDANCE
 * ============================================
 * 
 * Updates an existing attendance record
 * 
 * @param {Object} params - { id, ...data }
 * @param {number} params.id - Attendance record ID
 * @param {Object} params.data - Updated attendance data
 * @returns {Promise<Object>} Updated attendance record
 * @throws {string} Error message from API
 */
export const updateAttendance = createAsyncThunk(
  'teacher/updateAttendance',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teacher/attendance/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * CREATE ATTENDANCE
 * ============================================
 * 
 * Creates new attendance records (alias for markAttendance)
 * 
 * @param {Object} data - Attendance data
 * @returns {Promise<Object>} Created attendance records
 * @throws {string} Error message from API
 */
export const createAttendance = createAsyncThunk(
  'teacher/createAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/attendance', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * FETCH ATTENDANCE REPORT
 * ============================================
 * 
 * Fetches attendance report with filters
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.classId - Class section ID
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Attendance report data
 * @throws {string} Error message from API
 */
export const fetchAttendanceReport = createAsyncThunk(
  'teacher/fetchAttendanceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/attendance/report', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Behavior Logs ─────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH BEHAVIOR LOGS
 * ============================================
 * 
 * Fetches behavior logs with optional filters
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.studentId - Student ID (optional)
 * @param {string} params.severity - Severity level (optional)
 * @returns {Promise<Array>} Behavior log entries
 * @throws {string} Error message from API
 */
export const fetchBehaviorLogs = createAsyncThunk(
  'teacher/fetchBehaviorLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/behavior-logs', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
 * @throws {string} Error message from API
 */
export const createBehaviorLog = createAsyncThunk(
  'teacher/createBehaviorLog',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/behavior-logs', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Complaints ────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH COMPLAINTS
 * ============================================
 * 
 * Fetches all complaints for the teacher
 * 
 * @returns {Promise<Array>} Array of complaint objects
 * @throws {string} Error message from API
 */
export const fetchComplaints = createAsyncThunk(
  'teacher/fetchComplaints',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/complaints');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

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
 * @returns {Promise<Object>} Created complaint
 * @throws {string} Error message from API
 */
export const createComplaint = createAsyncThunk(
  'teacher/createComplaint',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/teacher/complaints', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Notifications ─────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH NOTIFICATIONS
 * ============================================
 * 
 * Fetches all notifications for the teacher
 * 
 * @returns {Promise<Array>} Array of notification objects
 * @throws {string} Error message from API
 */
export const fetchNotifications = createAsyncThunk(
  'teacher/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * MARK NOTIFICATION READ
 * ============================================
 * 
 * Marks a single notification as read
 * 
 * @param {number} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 * @throws {string} Error message from API
 */
export const markNotificationRead = createAsyncThunk(
  'teacher/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/teacher/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * MARK ALL NOTIFICATIONS READ
 * ============================================
 * 
 * Marks all notifications as read
 * 
 * @returns {Promise<Object>} Confirmation of update
 * @throws {string} Error message from API
 */
export const markAllNotificationsRead = createAsyncThunk(
  'teacher/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.put('/teacher/notifications/read-all');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ─── Settings ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH SETTINGS
 * ============================================
 * 
 * Fetches teacher settings
 * 
 * @returns {Promise<Object>} Settings data
 * @throws {string} Error message from API
 */
export const fetchSettings = createAsyncThunk(
  'teacher/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/teacher/settings');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * UPDATE SETTINGS
 * ============================================
 * 
 * Updates teacher settings
 * 
 * @param {Object} data - Settings data
 * @returns {Promise<Object>} Updated settings
 * @throws {string} Error message from API
 */
export const updateSettings = createAsyncThunk(
  'teacher/updateSettings',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.put('/teacher/settings', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * ============================================
 * CHANGE PASSWORD
 * ============================================
 * 
 * Changes teacher password
 * 
 * @param {Object} params - Password change data
 * @param {string} params.currentPassword - Current password
 * @param {string} params.newPassword - New password
 * @returns {Promise<Object>} Password change confirmation
 * @throws {string} Error message from API
 */
export const changePassword = createAsyncThunk(
  'teacher/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.put('/teacher/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);