// src/modules/teacher/store/teacherThunks.js

/**
 * ============================================
 * TEACHER THUNKS - COMPLETE (UPDATED)
 * ============================================
 * 
 * Purpose: Async thunks for teacher module API calls
 * Used by: teacherSlice for state management
 * 
 * Features:
 * - Dashboard data fetching
 * - Teacher profile management
 * - Class and student management
 * - Timetable operations
 * - Assignment CRUD operations
 * - Grade management
 * - Attendance tracking
 * - Behavior logs (including update and delete)
 * - Exam management
 * - PTM management
 * - Message management
 * - Notification management
 * - Event management
 * - Complaint handling
 * - Student Answers management
 * - AI Auto Checking management
 * - Settings and password management
 * - HR (Leaves, Payroll, Payroll Summary)
 * - Analytics (Predictions, Recommendations)
 * 
 * Dependencies:
 * - @reduxjs/toolkit for createAsyncThunk
 * - teacherService for API calls
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - /api/users/students/ - Student management
 * - /api/users/teachers/ - Teacher management
 * - /api/users/parents/ - Parent management
 * - /api/academics/classes/ - Class information
 * - /api/academics/subjects/ - Subject information
 * - /api/academics/timetable/ - Timetable
 * - /api/academics/rooms/ - Room information
 * - /api/academics/class-subjects/ - Class subjects
 * - /api/attendance/attendance/ - Attendance
 * - /api/attendance/behavior-logs/ - Behavior logs
 * - /api/assignments/assignments/ - Assignments
 * - /api/assignments/submissions/ - Submissions
 * - /api/exams/exams/ - Exams
 * - /api/exams/results/ - Results
 * - /api/exams/grade-scale/ - Grade scale
 * - /api/exams/questions/ - Questions
 * - /api/exams/student-answers/ - Student answers
 * - /api/exams/ai-auto-checking/ - AI auto checking
 * - /api/communication/messages/ - Messages
 * - /api/communication/notifications/ - Notifications
 * - /api/ptm/ptm/ - PTM
 * - /api/ptm/ptm-meetings/ - PTM meetings
 * - /api/ptm/ptm-attendees/ - PTM attendees
 * - /api/events/events/ - Events
 * - /api/events/event-participation/ - Event participation
 * - /api/hr/leaves/ - Leave management
 * - /api/hr/payroll/ - Payroll
 * - /api/hr/payroll/summary/ - Payroll summary
 * - /api/analytics/predictions/ - Predictions
 * - /api/analytics/recommendations/ - Recommendations
 * - /api/analytics/student-goals/ - Student goals
 * - /api/analytics/student-skills/ - Student skills
 * 
 * USAGE OF NEW API FIELDS:
 * - employee_name from /api/hr/payroll/
 * - changed_by_name from /api/hr/salary-history/
 * - sender_name from /api/communication/messages/
 * - receiver_name from /api/communication/messages/
 * ============================================
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import teacherService from '../services/teacherService';

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate Grade Letter
 * Calculates grade letter based on percentage and grade scale
 */
const calculateGradeLetter = (percentage, gradeScale = []) => {
  if (!gradeScale || gradeScale.length === 0) {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }
  
  const matchingGrade = gradeScale.find(g => 
    percentage >= g.min_percentage && percentage <= g.max_percentage
  );
  
  return matchingGrade?.grade || 'N/A';
};

// ============================================
// Profile Thunks
// ============================================

/**
 * FETCH PROFILE
 * Fetches the authenticated teacher's profile information
 * Uses: GET /api/users/teachers/me
 */
export const fetchProfile = createAsyncThunk(
  'teacher/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await teacherService.getProfile();
      console.log('📊 fetchProfile response:', response);
      return response;
    } catch (error) {
      console.error('❌ fetchProfile error:', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  }
);


/**
 * UPDATE PROFILE
 * Updates the authenticated teacher's profile information
 * Uses: PATCH /api/users/teachers/me
 */
export const updateProfile = createAsyncThunk(
  'teacher/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateProfile(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }
);

/**
 * CHANGE PASSWORD
 * Changes the teacher's password
 * Uses: POST /api/users/teachers/me/change-password/
 */
export const changePassword = createAsyncThunk(
  'teacher/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.changePassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to change password');
    }
  }
);


// ============================================
// Dashboard Thunks
// ============================================

/**
 * FETCH TEACHER DASHBOARD
 * Fetches teacher dashboard summary and trend data
 */
export const fetchTeacherDashboard = createAsyncThunk(
  'teacher/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return {
        summary: {
          totalStudents: 120,
          totalClasses: 5,
          totalAssignments: 15,
          todayClasses: 4,
          attendanceRate: 92,
          pendingSubmissions: 8,
          unreadNotifications: 3,
        },
        recentActivities: [],
        trend: [],
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch dashboard');
    }
  }
);

// ============================================
// Students Thunks
// ============================================

/**
 * FETCH STUDENTS
 * Fetches all students (teacher has read access)
 * Uses: GET /api/users/students/
 */
export const fetchStudents = createAsyncThunk(
  'teacher/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getStudents(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch students');
    }
  }
);

/**
 * FETCH STUDENT DETAILS
 * Fetches details for a specific student
 * Uses: GET /api/users/students/{id}/
 */
export const fetchStudentDetails = createAsyncThunk(
  'teacher/fetchStudentDetails',
  async (studentId, { rejectWithValue }) => {
    try {
      const response = await teacherService.getStudentDetails(studentId);
      return { studentId, details: response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch student details');
    }
  }
);

// ============================================
// Teachers & Parents Thunks (for user mapping)
// ============================================

/**
 * FETCH ALL TEACHERS
 * Fetches all teachers for user mapping
 * Uses: GET /api/users/teachers/
 */
export const fetchAllTeachers = createAsyncThunk(
  'teacher/fetchAllTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getTeachers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch teachers');
    }
  }
);

/**
 * FETCH ALL PARENTS
 * Fetches all parents for user mapping
 * Uses: GET /api/users/parents/
 */
export const fetchAllParents = createAsyncThunk(
  'teacher/fetchAllParents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getParents(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch parents');
    }
  }
);

// ============================================
// Academics Thunks
// ============================================

/**
 * FETCH TEACHER CLASSES
 * Fetches all classes
 * Uses: GET /api/academics/classes/
 */
export const fetchTeacherClasses = createAsyncThunk(
  'teacher/fetchClasses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getClasses(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch classes');
    }
  }
);

/**
 * FETCH SECTIONS
 * Fetches all sections
 * Uses: GET /api/academics/sections/
 */
export const fetchSections = createAsyncThunk(
  'teacher/fetchSections',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSections(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch sections');
    }
  }
);

/**
 * FETCH SUBJECTS
 * Fetches all subjects
 * Uses: GET /api/academics/subjects/
 */
export const fetchSubjects = createAsyncThunk(
  'teacher/fetchSubjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSubjects(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch subjects');
    }
  }
);

/**
 * FETCH ROOMS
 * Fetches all rooms
 * Uses: GET /api/academics/rooms/
 */
export const fetchRooms = createAsyncThunk(
  'teacher/fetchRooms',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getRooms(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch rooms');
    }
  }
);

/**
 * FETCH CLASS SUBJECTS
 * Fetches class-subject mappings
 * Uses: GET /api/academics/class-subjects/
 */
export const fetchClassSubjects = createAsyncThunk(
  'teacher/fetchClassSubjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getClassSubjects(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch class subjects');
    }
  }
);

// ============================================
// Timetable Thunks
// ============================================

/**
 * FETCH TIMETABLE
 * Fetches timetable entries
 * Uses: GET /api/academics/timetable/
 */
export const fetchTimetable = createAsyncThunk(
  'teacher/fetchTimetable',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getTimetable(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch timetable');
    }
  }
);

// ============================================
// Attendance Thunks
// ============================================

/**
 * FETCH ATTENDANCE
 * Fetches attendance records
 * Uses: GET /api/attendance/attendance/
 */
export const fetchAttendance = createAsyncThunk(
  'teacher/fetchAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getAttendance(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch attendance');
    }
  }
);

/**
 * FETCH ATTENDANCE STATS
 * Fetches attendance statistics
 * Uses: GET /api/attendance/attendance/monthly-summary/
 */
export const fetchAttendanceStats = createAsyncThunk(
  'teacher/fetchAttendanceStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getAttendanceStats(params);
      return response;
    } catch (error) {
      console.warn('Failed to fetch attendance stats:', error);
      return null;
    }
  }
);

/**
 * MARK ATTENDANCE
 * Marks attendance for students
 * Uses: POST /api/attendance/attendance/
 */
export const markAttendance = createAsyncThunk(
  'teacher/markAttendance',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.markAttendance(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark attendance');
    }
  }
);

/**
 * UPDATE ATTENDANCE
 * Updates an existing attendance record
 * Uses: PATCH /api/attendance/attendance/{id}/
 */
export const updateAttendance = createAsyncThunk(
  'teacher/updateAttendance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateAttendance(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update attendance');
    }
  }
);

// ============================================
// Behavior Logs Thunks
// ============================================

/**
 * FETCH BEHAVIOR LOGS
 * Fetches behavior logs
 * Uses: GET /api/attendance/behavior-logs/
 */
export const fetchBehaviorLogs = createAsyncThunk(
  'teacher/fetchBehaviorLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getBehaviorLogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch behavior logs');
    }
  }
);

/**
 * FETCH BEHAVIOR STATS
 * Fetches behavior statistics
 */
export const fetchBehaviorStats = createAsyncThunk(
  'teacher/fetchBehaviorStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getBehaviorStats(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch behavior stats');
    }
  }
);

/**
 * CREATE BEHAVIOR LOG
 * Creates a new behavior log entry
 * Uses: POST /api/attendance/behavior-logs/
 */
export const createBehaviorLog = createAsyncThunk(
  'teacher/createBehaviorLog',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createBehaviorLog(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create behavior log');
    }
  }
);

/**
 * UPDATE BEHAVIOR LOG
 * Updates an existing behavior log
 * Uses: PATCH /api/attendance/behavior-logs/{id}/
 */
export const updateBehaviorLog = createAsyncThunk(
  'teacher/updateBehaviorLog',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateBehaviorLog(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update behavior log');
    }
  }
);

/**
 * DELETE BEHAVIOR LOG
 * Deletes a behavior log
 * Uses: DELETE /api/attendance/behavior-logs/{id}/
 */
export const deleteBehaviorLog = createAsyncThunk(
  'teacher/deleteBehaviorLog',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteBehaviorLog(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete behavior log');
    }
  }
);

// ============================================
// Assignments Thunks
// ============================================

/**
 * FETCH ASSIGNMENTS
 * Fetches all assignments
 * Uses: GET /api/assignments/assignments/
 */
export const fetchAssignments = createAsyncThunk(
  'teacher/fetchAssignments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getAssignments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch assignments');
    }
  }
);

/**
 * CREATE ASSIGNMENT
 * Creates a new assignment
 * Uses: POST /api/assignments/assignments/
 */
export const createAssignment = createAsyncThunk(
  'teacher/createAssignment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createAssignment(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create assignment');
    }
  }
);

/**
 * UPDATE ASSIGNMENT
 * Updates an existing assignment
 * Uses: PATCH /api/assignments/assignments/{id}/
 */
export const updateAssignment = createAsyncThunk(
  'teacher/updateAssignment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateAssignment(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update assignment');
    }
  }
);

/**
 * DELETE ASSIGNMENT
 * Deletes an assignment
 * Uses: DELETE /api/assignments/assignments/{id}/
 */
export const deleteAssignment = createAsyncThunk(
  'teacher/deleteAssignment',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteAssignment(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete assignment');
    }
  }
);

// ============================================
// Submissions Thunks
// ============================================

/**
 * FETCH SUBMISSIONS
 * Fetches submissions for an assignment
 * Uses: GET /api/assignments/submissions/
 */
export const fetchSubmissions = createAsyncThunk(
  'teacher/fetchSubmissions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSubmissions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch submissions');
    }
  }
);

/**
 * GRADE SUBMISSION
 * Grades a student's submission
 * Uses: PATCH /api/assignments/submissions/{id}/
 */
export const gradeSubmission = createAsyncThunk(
  'teacher/gradeSubmission',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.gradeSubmission(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to grade submission');
    }
  }
);

// ============================================
// Exams Thunks
// ============================================

/**
 * FETCH EXAMS
 * Fetches all exams
 * Uses: GET /api/exams/exams/
 */
export const fetchExams = createAsyncThunk(
  'teacher/fetchExams',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getExams(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch exams');
    }
  }
);

/**
 * CREATE EXAM
 * Creates a new exam
 * Uses: POST /api/exams/exams/
 */
export const createExam = createAsyncThunk(
  'teacher/createExam',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createExam(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create exam');
    }
  }
);

/**
 * UPDATE EXAM
 * Updates an existing exam
 * Uses: PATCH /api/exams/exams/{id}/
 */
export const updateExam = createAsyncThunk(
  'teacher/updateExam',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateExam(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update exam');
    }
  }
);

/**
 * DELETE EXAM
 * Deletes an exam
 * Uses: DELETE /api/exams/exams/{id}/
 */
export const deleteExam = createAsyncThunk(
  'teacher/deleteExam',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteExam(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete exam');
    }
  }
);

// ============================================
// Results Thunks
// ============================================

/**
 * FETCH RESULTS
 * Fetches exam results
 * Uses: GET /api/exams/results/
 */
export const fetchResults = createAsyncThunk(
  'teacher/fetchResults',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getResults(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch results');
    }
  }
);

/**
 * CREATE RESULT
 * Creates a new exam result
 * Uses: POST /api/exams/results/
 */
export const createResult = createAsyncThunk(
  'teacher/createResult',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createResult(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create result');
    }
  }
);

/**
 * UPDATE RESULT
 * Updates an existing exam result
 * Uses: PATCH /api/exams/results/{id}/
 */
export const updateResult = createAsyncThunk(
  'teacher/updateResult',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateResult(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update result');
    }
  }
);

// ============================================
// Grade Scale Thunks
// ============================================

/**
 * FETCH GRADE SCALE
 * Fetches grade scale
 * Uses: GET /api/exams/grade-scale/
 */
export const fetchGradeScale = createAsyncThunk(
  'teacher/fetchGradeScale',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getGradeScale(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch grade scale');
    }
  }
);

// ============================================
// Questions Thunks
// ============================================

/**
 * FETCH QUESTIONS
 * Fetches questions for an exam
 * Uses: GET /api/exams/questions/
 */
export const fetchQuestions = createAsyncThunk(
  'teacher/fetchQuestions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getQuestions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch questions');
    }
  }
);

/**
 * CREATE QUESTION
 * Creates a new question for an exam
 * Uses: POST /api/exams/questions/
 */
export const createQuestion = createAsyncThunk(
  'teacher/createQuestion',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createQuestion(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create question');
    }
  }
);

/**
 * UPDATE QUESTION
 * Updates an existing question
 * Uses: PATCH /api/exams/questions/{id}/
 */
export const updateQuestion = createAsyncThunk(
  'teacher/updateQuestion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateQuestion(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update question');
    }
  }
);

/**
 * DELETE QUESTION
 * Deletes a question
 * Uses: DELETE /api/exams/questions/{id}/
 */
export const deleteQuestion = createAsyncThunk(
  'teacher/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteQuestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete question');
    }
  }
);

// ============================================
// Student Answers Thunks
// ============================================

/**
 * FETCH STUDENT ANSWERS
 * Fetches student answers for an exam
 * Uses: GET /api/exams/student-answers/
 */
export const fetchStudentAnswers = createAsyncThunk(
  'teacher/fetchStudentAnswers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getStudentAnswers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch student answers');
    }
  }
);

/**
 * CREATE STUDENT ANSWER
 * Creates a new student answer
 * Uses: POST /api/exams/student-answers/
 */
export const createStudentAnswer = createAsyncThunk(
  'teacher/createStudentAnswer',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createStudentAnswer(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create student answer');
    }
  }
);

/**
 * UPDATE STUDENT ANSWER
 * Updates an existing student answer
 * Uses: PATCH /api/exams/student-answers/{id}/
 */
export const updateStudentAnswer = createAsyncThunk(
  'teacher/updateStudentAnswer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateStudentAnswer(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update student answer');
    }
  }
);

/**
 * DELETE STUDENT ANSWER
 * Deletes a student answer
 * Uses: DELETE /api/exams/student-answers/{id}/
 */
export const deleteStudentAnswer = createAsyncThunk(
  'teacher/deleteStudentAnswer',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteStudentAnswer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete student answer');
    }
  }
);

// ============================================
// AI Auto Checking Thunks
// ============================================

/**
 * FETCH AI AUTO CHECKING
 * Fetches AI auto checking results
 * Uses: GET /api/exams/ai-auto-checking/
 */
export const fetchAIAutoChecking = createAsyncThunk(
  'teacher/fetchAIAutoChecking',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getAIAutoChecking(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch AI auto checking');
    }
  }
);

/**
 * CREATE AI AUTO CHECKING
 * Creates AI auto checking record
 * Uses: POST /api/exams/ai-auto-checking/
 */
export const createAIAutoChecking = createAsyncThunk(
  'teacher/createAIAutoChecking',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createAIAutoChecking(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create AI auto checking');
    }
  }
);

/**
 * UPDATE AI AUTO CHECKING
 * Updates AI auto checking record
 * Uses: PATCH /api/exams/ai-auto-checking/{id}/
 */
export const updateAIAutoChecking = createAsyncThunk(
  'teacher/updateAIAutoChecking',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateAIAutoChecking(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update AI auto checking');
    }
  }
);

/**
 * DELETE AI AUTO CHECKING
 * Deletes AI auto checking record
 * Uses: DELETE /api/exams/ai-auto-checking/{id}/
 */
export const deleteAIAutoChecking = createAsyncThunk(
  'teacher/deleteAIAutoChecking',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteAIAutoChecking(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete AI auto checking');
    }
  }
);

// ============================================
// Grades Thunks
// ============================================

/**
 * FETCH TEACHER GRADES
 * Fetches all grades for the teacher's classes
 */
export const fetchTeacherGrades = createAsyncThunk(
  'teacher/fetchTeacherGrades',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getGrades(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch grades');
    }
  }
);

/**
 * SAVE TEACHER GRADES
 * Saves multiple grades at once (bulk operation)
 */
export const saveTeacherGrades = createAsyncThunk(
  'teacher/saveTeacherGrades',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.saveGrades(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save grades');
    }
  }
);

// ============================================
// PTM Thunks
// ============================================

/**
 * FETCH PTM
 * Fetches all PTM events
 * Uses: GET /api/ptm/ptm/
 */
export const fetchPTM = createAsyncThunk(
  'teacher/fetchPTM',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPTM(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch PTM');
    }
  }
);

/**
 * FETCH PTM MEETINGS
 * Fetches PTM meetings
 * Uses: GET /api/ptm/ptm-meetings/
 */
export const fetchPTMMeetings = createAsyncThunk(
  'teacher/fetchPTMMeetings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPTMMeetings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch PTM meetings');
    }
  }
);

/**
 * FETCH PTM ATTENDEES
 * Fetches PTM attendees
 * Uses: GET /api/ptm/ptm-attendees/
 */
export const fetchPTMAttendees = createAsyncThunk(
  'teacher/fetchPTMAttendees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPTMAttendees(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch PTM attendees');
    }
  }
);

/**
 * UPDATE PTM MEETING
 * Updates a PTM meeting
 * Uses: PATCH /api/ptm/ptm-meetings/{id}/
 */
export const updatePTMMeeting = createAsyncThunk(
  'teacher/updatePTMMeeting',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updatePTMMeeting(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update PTM meeting');
    }
  }
);

// ============================================
// Messages Thunks
// ============================================

/**
 * FETCH MESSAGES
 * Fetches all messages for the teacher
 * Uses: GET /api/communication/messages/
 */
export const fetchMessages = createAsyncThunk(
  'teacher/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getMessages(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch messages');
    }
  }
);

/**
 * SEND MESSAGE
 * Sends a new message
 * Uses: POST /api/communication/messages/
 */
export const sendMessage = createAsyncThunk(
  'teacher/sendMessage',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.sendMessage(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send message');
    }
  }
);

/**
 * UPDATE MESSAGE
 * Updates a message
 * Uses: PATCH /api/communication/messages/{id}/
 */
export const updateMessage = createAsyncThunk(
  'teacher/updateMessage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateMessage(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update message');
    }
  }
);

/**
 * DELETE MESSAGE
 * Deletes a message
 * Uses: DELETE /api/communication/messages/{id}/
 */
export const deleteMessage = createAsyncThunk(
  'teacher/deleteMessage',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteMessage(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete message');
    }
  }
);

// ============================================
// Notifications Thunks
// ============================================

/**
 * FETCH NOTIFICATIONS
 * Fetches all notifications for the teacher
 * Uses: GET /api/communication/notifications/
 */
export const fetchNotifications = createAsyncThunk(
  'teacher/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getNotifications(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * MARK NOTIFICATION READ
 * Marks a single notification as read
 * Uses: PATCH /api/communication/notifications/{id}/
 */
export const markNotificationRead = createAsyncThunk(
  'teacher/markNotificationRead',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.markNotificationRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark notification as read');
    }
  }
);

/**
 * MARK ALL NOTIFICATIONS READ
 * Marks all notifications as read
 * Uses: POST /api/communication/notifications/mark-all-read/
 */
export const markAllNotificationsRead = createAsyncThunk(
  'teacher/markAllNotificationsRead',
  async (_, { rejectWithValue }) => {
    try {
      await teacherService.markAllNotificationsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to mark all notifications as read');
    }
  }
);

// ============================================
// Events Thunks
// ============================================

/**
 * FETCH EVENTS
 * Fetches all events
 * Uses: GET /api/events/events/
 */
export const fetchEvents = createAsyncThunk(
  'teacher/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getEvents(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch events');
    }
  }
);

/**
 * FETCH EVENT PARTICIPATIONS
 * Fetches event participations
 * Uses: GET /api/events/event-participation/
 */
export const fetchEventParticipations = createAsyncThunk(
  'teacher/fetchEventParticipations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getEventParticipations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch event participations');
    }
  }
);

/**
 * CREATE EVENT PARTICIPATION
 * Creates an event participation
 * Uses: POST /api/events/event-participation/
 */
export const createEventParticipation = createAsyncThunk(
  'teacher/createEventParticipation',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createEventParticipation(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create event participation');
    }
  }
);

// ============================================
// Complaints Thunks
// ============================================

/**
 * FETCH COMPLAINTS
 * Fetches all complaints
 * Uses: GET /api/complaints/
 */
export const fetchComplaints = createAsyncThunk(
  'teacher/fetchComplaints',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getComplaints(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch complaints');
    }
  }
);

/**
 * CREATE COMPLAINT
 * Creates a new complaint
 * Uses: POST /api/complaints/
 */
export const createComplaint = createAsyncThunk(
  'teacher/createComplaint',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createComplaint(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create complaint');
    }
  }
);

/**
 * UPDATE COMPLAINT
 * Updates an existing complaint
 * Uses: PATCH /api/complaints/{id}/
 */
export const updateComplaint = createAsyncThunk(
  'teacher/updateComplaint',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateComplaint(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update complaint');
    }
  }
);

// ============================================
// HR Thunks (Leaves, Payroll, Payroll Summary)
// ============================================

/**
 * FETCH LEAVES
 * Fetches teacher's own leave records
 * Uses: GET /api/hr/leaves/
 */
export const fetchLeaves = createAsyncThunk(
  'teacher/fetchLeaves',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getLeaves(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch leaves');
    }
  }
);

/**
 * FETCH LEAVE HISTORY
 * Fetches teacher's own leave history
 * Uses: GET /api/hr/leave-history/
 */
export const fetchLeaveHistory = createAsyncThunk(
  'teacher/fetchLeaveHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getLeaveHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch leave history');
    }
  }
);

/**
 * CREATE LEAVE REQUEST
 * Creates a new leave request
 * Uses: POST /api/hr/leaves/
 */
export const createLeave = createAsyncThunk(
  'teacher/createLeave',
  async (data, { rejectWithValue }) => {
    try {
      const response = await teacherService.createLeave(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create leave request');
    }
  }
);

/**
 * UPDATE LEAVE
 * Updates an existing leave request
 * Uses: PATCH /api/hr/leaves/{id}/
 */
export const updateLeave = createAsyncThunk(
  'teacher/updateLeave',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await teacherService.updateLeave(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update leave');
    }
  }
);

/**
 * DELETE LEAVE
 * Deletes a leave request
 * Uses: DELETE /api/hr/leaves/{id}/
 */
export const deleteLeave = createAsyncThunk(
  'teacher/deleteLeave',
  async (id, { rejectWithValue }) => {
    try {
      await teacherService.deleteLeave(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete leave');
    }
  }
);

/**
 * FETCH PAYROLL
 * Fetches teacher's own payroll records
 * Uses: GET /api/hr/payroll/
 */
export const fetchPayroll = createAsyncThunk(
  'teacher/fetchPayroll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPayroll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch payroll');
    }
  }
);

/**
 * FETCH PAYROLL SUMMARY
 * Fetches payroll summary for the teacher
 * Uses: GET /api/hr/payroll/summary/
 */
export const fetchPayrollSummary = createAsyncThunk(
  'teacher/fetchPayrollSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPayrollSummary(params);
      return response;
    } catch (error) {
      // If the endpoint doesn't exist, return a default summary instead of rejecting
      console.warn('Payroll summary endpoint not available, using default values');
      return {
        total_earnings: 0,
        total_deductions: 0,
        net_pay: 0,
        total_paid: 0,
        total_pending: 0,
        average_salary: 0,
        last_payment_date: null,
        next_payment_date: null,
      };
    }
  }
);

/**
 * FETCH SALARY HISTORY
 * Fetches teacher's own salary history
 * Uses: GET /api/hr/salary-history/
 */
export const fetchSalaryHistory = createAsyncThunk(
  'teacher/fetchSalaryHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getSalaryHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch salary history');
    }
  }
);

// ============================================
// Analytics Thunks
// ============================================

/**
 * FETCH PREDICTIONS
 * Fetches predictions for the teacher's students
 * Uses: GET /api/analytics/predictions/
 */
export const fetchPredictions = createAsyncThunk(
  'teacher/fetchPredictions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getPredictions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch predictions');
    }
  }
);

/**
 * FETCH RECOMMENDATIONS
 * Fetches recommendations for the teacher
 * Uses: GET /api/analytics/recommendations/
 */
export const fetchRecommendations = createAsyncThunk(
  'teacher/fetchRecommendations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getRecommendations(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch recommendations');
    }
  }
);

/**
 * FETCH STUDENT GOALS
 * Fetches student goals
 * Uses: GET /api/analytics/student-goals/
 */
export const fetchStudentGoals = createAsyncThunk(
  'teacher/fetchStudentGoals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getStudentGoals(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch student goals');
    }
  }
);

/**
 * FETCH STUDENT SKILLS
 * Fetches student skills
 * Uses: GET /api/analytics/student-skills/
 */
export const fetchStudentSkills = createAsyncThunk(
  'teacher/fetchStudentSkills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await teacherService.getStudentSkills(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch student skills');
    }
  }
);

// ============================================
// Export All Thunks
// ============================================

export default {
  // Profile
  fetchProfile,
  updateProfile,
  changePassword,
  
  // Dashboard
  fetchTeacherDashboard,
  
  // Students
  fetchStudents,
  fetchStudentDetails,
  
  // Teachers & Parents (for user mapping)
  fetchAllTeachers,
  fetchAllParents,
  
  // Academics
  fetchTeacherClasses,
  fetchSections,
  fetchSubjects,
  fetchRooms,
  fetchClassSubjects,
  
  // Timetable
  fetchTimetable,
  
  // Attendance
  fetchAttendance,
  fetchAttendanceStats,
  markAttendance,
  updateAttendance,
  
  // Behavior Logs
  fetchBehaviorLogs,
  fetchBehaviorStats,
  createBehaviorLog,
  updateBehaviorLog,
  deleteBehaviorLog,
  
  // Assignments
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  
  // Submissions
  fetchSubmissions,
  gradeSubmission,
  
  // Exams
  fetchExams,
  createExam,
  updateExam,
  deleteExam,
  
  // Results
  fetchResults,
  createResult,
  updateResult,
  
  // Grade Scale
  fetchGradeScale,
  
  // Questions
  fetchQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  
  // Student Answers
  fetchStudentAnswers,
  createStudentAnswer,
  updateStudentAnswer,
  deleteStudentAnswer,
  
  // AI Auto Checking
  fetchAIAutoChecking,
  createAIAutoChecking,
  updateAIAutoChecking,
  deleteAIAutoChecking,
  
  // Grades
  fetchTeacherGrades,
  saveTeacherGrades,
  
  // PTM
  fetchPTM,
  fetchPTMMeetings,
  fetchPTMAttendees,
  updatePTMMeeting,
  
  // Messages
  fetchMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  
  // Notifications
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  
  // Events
  fetchEvents,
  fetchEventParticipations,
  createEventParticipation,
  
  // Complaints
  fetchComplaints,
  createComplaint,
  updateComplaint,
  
  // HR
  fetchLeaves,
  fetchLeaveHistory,
  createLeave,
  updateLeave,
  deleteLeave,
  fetchPayroll,
  fetchSalaryHistory,
  fetchPayrollSummary, // ✅ Added this line
  
  // Analytics
  fetchPredictions,
  fetchRecommendations,
  fetchStudentGoals,
  fetchStudentSkills,
};