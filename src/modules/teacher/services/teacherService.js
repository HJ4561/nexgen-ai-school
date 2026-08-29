// src/modules/teacher/services/teacherService.js

/**
 * ============================================
 * TEACHER SERVICE - COMPLETE
 * ============================================
 * 
 * Purpose: Handles all teacher-related API calls
 * Used by: teacherThunks and teacher components
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - /api/users/students/ - Student management (GET, GET/{id})
 * - /api/users/teachers/ - Teacher management (GET, GET/{id})
 * - /api/users/staff/ - Staff management (GET)
 * - /api/users/parents/ - Parent management (GET)
 * - /api/academics/classes/ - Class information (GET)
 * - /api/academics/sections/ - Sections (GET)
 * - /api/academics/subjects/ - Subjects (GET)
 * - /api/academics/rooms/ - Rooms (GET)
 * - /api/academics/class-subjects/ - Class subjects (GET)
 * - /api/academics/timetable/ - Timetable (GET)
 * - /api/attendance/attendance/ - Attendance (GET, POST, PATCH/{id})
 * - /api/attendance/behavior-logs/ - Behavior logs (GET, POST)
 * - /api/assignments/assignments/ - Assignments (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/assignments/submissions/ - Submissions (GET, PATCH/{id})
 * - /api/exams/exams/ - Exams (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/exams/results/ - Results (GET, POST, PATCH/{id})
 * - /api/exams/grade-scale/ - Grade scale (GET)
 * - /api/exams/questions/ - Questions (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/exams/student-answers/ - Student answers (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/exams/ai-auto-checking/ - AI auto checking (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/communication/messages/ - Messages (GET, POST, PATCH/{id}, DELETE/{id})
 * - /api/communication/notifications/ - Notifications (GET, PATCH/{id})
 * - /api/ptm/ptm/ - PTM (GET)
 * - /api/ptm/ptm-meetings/ - PTM meetings (GET, PATCH/{id})
 * - /api/ptm/ptm-attendees/ - PTM attendees (GET)
 * - /api/events/events/ - Events (GET)
 * - /api/events/event-participation/ - Event participation (GET, POST)
 * - /api/hr/leaves/ - Leave management (GET, POST)
 * - /api/hr/payroll/ - Payroll (GET)
 * ============================================
 */

import api from '@/services/api';

// ─── ENDPOINTS ─────────────────────────────────────────────────────────

const ENDPOINTS = {
  // Users & Roles (Teacher has read access to students, staff, parents)
  STUDENTS: '/users/students/',
  TEACHERS: '/users/teachers/',
  STAFF: '/users/staff/',
  PARENTS: '/users/parents/',
  
  // Academics (Teacher has read access)
  CLASSES: '/academics/classes/',
  SECTIONS: '/academics/sections/',
  SUBJECTS: '/academics/subjects/',
  ROOMS: '/academics/rooms/',
  CLASS_SUBJECTS: '/academics/class-subjects/',
  TIMETABLE: '/academics/timetable/',
  
  // Attendance (Teacher has CRUD)
  ATTENDANCE: '/attendance/attendance/',
  BEHAVIOR_LOGS: '/attendance/behavior-logs/',
  
  // Assignments (Teacher has CRUD)
  ASSIGNMENTS: '/assignments/assignments/',
  SUBMISSIONS: '/assignments/submissions/',
  
  // Exams (Teacher has CRUD)
  EXAMS: '/exams/exams/',
  RESULTS: '/exams/results/',
  GRADE_SCALE: '/exams/grade-scale/',
  QUESTIONS: '/exams/questions/',
  STUDENT_ANSWERS: '/exams/student-answers/',
  AI_AUTO_CHECKING: '/exams/ai-auto-checking/',
  
  // Communication (Teacher has CRUD for messages, read for notifications)
  MESSAGES: '/communication/messages/',
  NOTIFICATIONS: '/communication/notifications/',
  
  // PTM (Teacher has read/update)
  PTM: '/ptm/ptm/',
  PTM_MEETINGS: '/ptm/ptm-meetings/',
  PTM_ATTENDEES: '/ptm/ptm-attendees/',
  
  // Events (Teacher has read/create)
  EVENTS: '/events/events/',
  EVENT_PARTICIPATION: '/events/event-participation/',
  
  LEAVES: '/hr/leaves/',
LEAVE_HISTORY: '/hr/leave-history/',

  // HR (Teacher has read for self)
  LEAVES: '/hr/leaves/',
  PAYROLL: '/hr/payroll/',
  LEAVE_HISTORY: '/hr/leave-history/',
  SALARY_HISTORY: '/hr/salary-history/',
   PAYROLL_SUMMARY: '/hr/payroll/summary/',
  
  // Analytics (Teacher has read)
  PREDICTIONS: '/analytics/predictions/',
  RECOMMENDATIONS: '/analytics/recommendations/',
  STUDENT_GOALS: '/analytics/student-goals/',
  STUDENT_SKILLS: '/analytics/student-skills/',
  
  // Profile (Teacher's own profile)
  PROFILE: '/users/teachers/me',
  
  // Complaints
  COMPLAINTS: '/complaints/',
};

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
 * GET PROFILE
 * Fetches the authenticated teacher's profile information
 * Uses: GET /api/users/teachers/me
 */
getProfile: async () => {
  const response = await api.get(ENDPOINTS.PROFILE);
  console.log('📊 getProfile API response:', response.data);
  return response.data;
},

  /**
   * UPDATE PROFILE
   * Updates the authenticated teacher's profile information
   * Uses: PATCH /api/users/teachers/me/
   */
  updateProfile: async (data) => {
    const response = await api.patch(`${ENDPOINTS.TEACHERS}me/`, data);
    return response.data;
  },

  /**
   * CHANGE PASSWORD
   * Changes the teacher's password
   * Uses: POST /api/users/teachers/me/change-password/
   */
  changePassword: async (data) => {
    const response = await api.post(`${ENDPOINTS.TEACHERS}me/change-password/`, data);
    return response.data;
  },

  // ─── Users & Roles ───────────────────────────────────────────────────────

  /**
   * GET STUDENTS
   * Fetches all students (teacher has read access)
   * Uses: GET /api/users/students/
   */
  getStudents: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENTS, { params });
    return response.data;
  },

  /**
   * GET STUDENT DETAILS
   * Fetches details for a specific student
   * Uses: GET /api/users/students/{id}/
   */
  getStudentDetails: async (id) => {
    const response = await api.get(`${ENDPOINTS.STUDENTS}${id}/`);
    return response.data;
  },

  /**
   * GET TEACHERS
   * Fetches all teachers (teacher has read access)
   * Uses: GET /api/users/teachers/
   */
  getTeachers: async (params = {}) => {
    const response = await api.get(ENDPOINTS.TEACHERS, { params });
    return response.data;
  },

  /**
   * GET TEACHER BY ID
   * Fetches a specific teacher's details
   * Uses: GET /api/users/teachers/{id}/
   */
  getTeacherById: async (id) => {
    const response = await api.get(`${ENDPOINTS.TEACHERS}${id}/`);
    return response.data;
  },

  /**
   * GET STAFF
   * Fetches all staff (teacher has read access)
   * Uses: GET /api/users/staff/
   */
  getStaff: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STAFF, { params });
    return response.data;
  },

  /**
   * GET PARENTS
   * Fetches all parents (teacher has read access)
   * Uses: GET /api/users/parents/
   */
  getParents: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PARENTS, { params });
    return response.data;
  },

  // ─── Academics ───────────────────────────────────────────────────────────

  /**
   * GET CLASSES
   * Fetches all classes
   * Uses: GET /api/academics/classes/
   */
  getClasses: async (params = {}) => {
    const response = await api.get(ENDPOINTS.CLASSES, { params });
    return response.data;
  },

  /**
   * GET CLASS BY ID
   * Fetches a specific class
   * Uses: GET /api/academics/classes/{id}/
   */
  getClassById: async (id) => {
    const response = await api.get(`${ENDPOINTS.CLASSES}${id}/`);
    return response.data;
  },

  /**
   * GET SECTIONS
   * Fetches all sections
   * Uses: GET /api/academics/sections/
   */
  getSections: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SECTIONS, { params });
    return response.data;
  },

  /**
   * GET SUBJECTS
   * Fetches all subjects
   * Uses: GET /api/academics/subjects/
   */
  getSubjects: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SUBJECTS, { params });
    return response.data;
  },

  /**
   * GET ROOMS
   * Fetches all rooms
   * Uses: GET /api/academics/rooms/
   */
  getRooms: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ROOMS, { params });
    return response.data;
  },

  /**
   * GET CLASS SUBJECTS
   * Fetches class-subject mappings
   * Uses: GET /api/academics/class-subjects/
   */
  getClassSubjects: async (params = {}) => {
    const response = await api.get(ENDPOINTS.CLASS_SUBJECTS, { params });
    return response.data;
  },

  /**
   * GET TIMETABLE
   * Fetches timetable entries
   * Uses: GET /api/academics/timetable/
   */
  getTimetable: async (params = {}) => {
    const response = await api.get(ENDPOINTS.TIMETABLE, { params });
    return response.data;
  },

/**
 * CREATE LEAVE REQUEST
 * Creates a new leave request
 * Uses: POST /api/hr/leaves/
 */
createLeave: async (data) => {
  const response = await api.post(ENDPOINTS.LEAVES, data);
  return response.data;
},

/**
 * GET LEAVE HISTORY
 * Fetches teacher's own leave history
 * Uses: GET /api/hr/leave-history/
 */
getLeaveHistory: async (params = {}) => {
  const response = await api.get(ENDPOINTS.LEAVE_HISTORY, { params });
  return response.data;
},

/**
 * UPDATE LEAVE
 * Updates an existing leave request (if allowed)
 * Uses: PATCH /api/hr/leaves/{id}/
 */
updateLeave: async (id, data) => {
  const response = await api.patch(`${ENDPOINTS.LEAVES}${id}/`, data);
  return response.data;
},

/**
 * DELETE LEAVE
 * Deletes a leave request (if pending)
 * Uses: DELETE /api/hr/leaves/{id}/
 */
deleteLeave: async (id) => {
  const response = await api.delete(`${ENDPOINTS.LEAVES}${id}/`);
  return response.data;
},
  // ─── Attendance ──────────────────────────────────────────────────────────

  /**
   * GET ATTENDANCE
   * Fetches attendance records
   * Uses: GET /api/attendance/attendance/
   */
  getAttendance: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ATTENDANCE, { params });
    return response.data;
  },

  /**
   * MARK ATTENDANCE
   * Marks attendance for students
   * Uses: POST /api/attendance/attendance/
   */
  markAttendance: async (data) => {
    const response = await api.post(ENDPOINTS.ATTENDANCE, data);
    return response.data;
  },

  /**
   * UPDATE ATTENDANCE
   * Updates an existing attendance record
   * Uses: PATCH /api/attendance/attendance/{id}/
   */
  updateAttendance: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.ATTENDANCE}${id}/`, data);
    return response.data;
  },

  /**
   * GET ATTENDANCE STATS
   * Fetches attendance statistics
   * Uses: GET /api/attendance/attendance/monthly-summary/
   */
  getAttendanceStats: async (params = {}) => {
    try {
      const response = await api.get(`${ENDPOINTS.ATTENDANCE}monthly-summary/`, { params });
      return response.data;
    } catch (error) {
      console.warn('Attendance stats endpoint error:', error.response?.data);
      return null;
    }
  },

  /**
   * GET BEHAVIOR LOGS
   * Fetches behavior logs
   * Uses: GET /api/attendance/behavior-logs/
   */
  getBehaviorLogs: async (params = {}) => {
    const response = await api.get(ENDPOINTS.BEHAVIOR_LOGS, { params });
    return response.data;
  },

  /**
   * CREATE BEHAVIOR LOG
   * Creates a new behavior log entry
   * Uses: POST /api/attendance/behavior-logs/
   */
  createBehaviorLog: async (data) => {
    const response = await api.post(ENDPOINTS.BEHAVIOR_LOGS, data);
    return response.data;
  },

  /**
   * GET BEHAVIOR STATS
   * Fetches behavior statistics
   */
  getBehaviorStats: async (params = {}) => {
    const response = await api.get(`${ENDPOINTS.BEHAVIOR_LOGS}stats/`, { params });
    return response.data;
  },

  /**
   * UPDATE BEHAVIOR LOG
   * Updates an existing behavior log
   * Uses: PATCH /api/attendance/behavior-logs/{id}/
   */
  updateBehaviorLog: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.BEHAVIOR_LOGS}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE BEHAVIOR LOG
   * Deletes a behavior log
   * Uses: DELETE /api/attendance/behavior-logs/{id}/
   */
  deleteBehaviorLog: async (id) => {
    const response = await api.delete(`${ENDPOINTS.BEHAVIOR_LOGS}${id}/`);
    return response.data;
  },

  // ─── Assignments ─────────────────────────────────────────────────────────

  /**
   * GET ASSIGNMENTS
   * Fetches all assignments
   * Uses: GET /api/assignments/assignments/
   */
  getAssignments: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ASSIGNMENTS, { params });
    return response.data;
  },

  /**
   * CREATE ASSIGNMENT
   * Creates a new assignment
   * Uses: POST /api/assignments/assignments/
   */
  createAssignment: async (data) => {
    const response = await api.post(ENDPOINTS.ASSIGNMENTS, data);
    return response.data;
  },

  /**
   * UPDATE ASSIGNMENT
   * Updates an existing assignment
   * Uses: PATCH /api/assignments/assignments/{id}/
   */
  updateAssignment: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.ASSIGNMENTS}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE ASSIGNMENT
   * Deletes an assignment
   * Uses: DELETE /api/assignments/assignments/{id}/
   */
  deleteAssignment: async (id) => {
    const response = await api.delete(`${ENDPOINTS.ASSIGNMENTS}${id}/`);
    return response.data;
  },

  /**
   * GET SUBMISSIONS
   * Fetches submissions for an assignment
   * Uses: GET /api/assignments/submissions/
   */
  getSubmissions: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SUBMISSIONS, { params });
    return response.data;
  },

  /**
   * GRADE SUBMISSION
   * Grades a student's submission
   * Uses: PATCH /api/assignments/submissions/{id}/
   */
  gradeSubmission: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.SUBMISSIONS}${id}/`, data);
    return response.data;
  },

  // ─── Exams ──────────────────────────────────────────────────────────────

  /**
   * GET EXAMS
   * Fetches all exams
   * Uses: GET /api/exams/exams/
   */
  getExams: async (params = {}) => {
    const response = await api.get(ENDPOINTS.EXAMS, { params });
    return response.data;
  },

  /**
   * CREATE EXAM
   * Creates a new exam
   * Uses: POST /api/exams/exams/
   */
  createExam: async (data) => {
    const response = await api.post(ENDPOINTS.EXAMS, data);
    return response.data;
  },

  /**
   * UPDATE EXAM
   * Updates an existing exam
   * Uses: PATCH /api/exams/exams/{id}/
   */
  updateExam: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.EXAMS}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE EXAM
   * Deletes an exam
   * Uses: DELETE /api/exams/exams/{id}/
   */
  deleteExam: async (id) => {
    const response = await api.delete(`${ENDPOINTS.EXAMS}${id}/`);
    return response.data;
  },

  /**
   * GET RESULTS
   * Fetches exam results
   * Uses: GET /api/exams/results/
   */
  getResults: async (params = {}) => {
    const response = await api.get(ENDPOINTS.RESULTS, { params });
    return response.data;
  },

  /**
   * CREATE RESULT
   * Creates a new exam result
   * Uses: POST /api/exams/results/
   */
  createResult: async (data) => {
    const response = await api.post(ENDPOINTS.RESULTS, data);
    return response.data;
  },

  /**
   * UPDATE RESULT
   * Updates an existing exam result
   * Uses: PATCH /api/exams/results/{id}/
   */
  updateResult: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.RESULTS}${id}/`, data);
    return response.data;
  },

  /**
   * GET GRADE SCALE
   * Fetches grade scale
   * Uses: GET /api/exams/grade-scale/
   */
  getGradeScale: async (params = {}) => {
    const response = await api.get(ENDPOINTS.GRADE_SCALE, { params });
    return response.data;
  },

  /**
   * GET QUESTIONS
   * Fetches questions for an exam
   * Uses: GET /api/exams/questions/
   */
  getQuestions: async (params = {}) => {
    const response = await api.get(ENDPOINTS.QUESTIONS, { params });
    return response.data;
  },

  /**
   * CREATE QUESTION
   * Creates a new question for an exam
   * Uses: POST /api/exams/questions/
   */
  createQuestion: async (data) => {
    const response = await api.post(ENDPOINTS.QUESTIONS, data);
    return response.data;
  },

  /**
   * UPDATE QUESTION
   * Updates an existing question
   * Uses: PATCH /api/exams/questions/{id}/
   */
  updateQuestion: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.QUESTIONS}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE QUESTION
   * Deletes a question
   * Uses: DELETE /api/exams/questions/{id}/
   */
  deleteQuestion: async (id) => {
    const response = await api.delete(`${ENDPOINTS.QUESTIONS}${id}/`);
    return response.data;
  },

  /**
   * GET STUDENT ANSWERS
   * Fetches student answers for an exam
   * Uses: GET /api/exams/student-answers/
   */
  getStudentAnswers: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENT_ANSWERS, { params });
    return response.data;
  },

  /**
   * CREATE STUDENT ANSWER
   * Creates a new student answer
   * Uses: POST /api/exams/student-answers/
   */
  createStudentAnswer: async (data) => {
    const response = await api.post(ENDPOINTS.STUDENT_ANSWERS, data);
    return response.data;
  },

  /**
   * UPDATE STUDENT ANSWER
   * Updates an existing student answer
   * Uses: PATCH /api/exams/student-answers/{id}/
   */
  updateStudentAnswer: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.STUDENT_ANSWERS}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE STUDENT ANSWER
   * Deletes a student answer
   * Uses: DELETE /api/exams/student-answers/{id}/
   */
  deleteStudentAnswer: async (id) => {
    const response = await api.delete(`${ENDPOINTS.STUDENT_ANSWERS}${id}/`);
    return response.data;
  },

  /**
   * GET AI AUTO CHECKING
   * Fetches AI auto checking results
   * Uses: GET /api/exams/ai-auto-checking/
   */
  getAIAutoChecking: async (params = {}) => {
    const response = await api.get(ENDPOINTS.AI_AUTO_CHECKING, { params });
    return response.data;
  },

  /**
   * CREATE AI AUTO CHECKING
   * Creates AI auto checking record
   * Uses: POST /api/exams/ai-auto-checking/
   */
  createAIAutoChecking: async (data) => {
    const response = await api.post(ENDPOINTS.AI_AUTO_CHECKING, data);
    return response.data;
  },

  /**
   * UPDATE AI AUTO CHECKING
   * Updates AI auto checking record
   * Uses: PATCH /api/exams/ai-auto-checking/{id}/
   */
  updateAIAutoChecking: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.AI_AUTO_CHECKING}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE AI AUTO CHECKING
   * Deletes AI auto checking record
   * Uses: DELETE /api/exams/ai-auto-checking/{id}/
   */
  deleteAIAutoChecking: async (id) => {
    const response = await api.delete(`${ENDPOINTS.AI_AUTO_CHECKING}${id}/`);
    return response.data;
  },

  // ─── PTM ─────────────────────────────────────────────────────────────────

  /**
   * GET PTM
   * Fetches all PTM events
   * Uses: GET /api/ptm/ptm/
   */
  getPTM: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PTM, { params });
    return response.data;
  },

  /**
   * GET PTM MEETINGS
   * Fetches PTM meetings
   * Uses: GET /api/ptm/ptm-meetings/
   */
  getPTMMeetings: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PTM_MEETINGS, { params });
    return response.data;
  },

  /**
   * UPDATE PTM MEETING
   * Updates a PTM meeting
   * Uses: PATCH /api/ptm/ptm-meetings/{id}/
   */
  updatePTMMeeting: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.PTM_MEETINGS}${id}/`, data);
    return response.data;
  },

  /**
   * GET PTM ATTENDEES
   * Fetches PTM attendees
   * Uses: GET /api/ptm/ptm-attendees/
   */
  getPTMAttendees: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PTM_ATTENDEES, { params });
    return response.data;
  },

  // ─── Messages ────────────────────────────────────────────────────────────

  /**
   * GET MESSAGES
   * Fetches all messages for the teacher
   * Uses: GET /api/communication/messages/
   */
  getMessages: async (params = {}) => {
  try {
    const response = await api.get(ENDPOINTS.MESSAGES, { params });
    return response.data;
  } catch (error) {
    console.error('❌ getMessages error:', error);
    return { results: [] };
  }
},

  /**
   * SEND MESSAGE
   * Sends a new message
   * Uses: POST /api/communication/messages/
   */
  sendMessage: async (data) => {
    const response = await api.post(ENDPOINTS.MESSAGES, data);
    return response.data;
  },

  /**
   * UPDATE MESSAGE
   * Updates a message
   * Uses: PATCH /api/communication/messages/{id}/
   */
  updateMessage: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.MESSAGES}${id}/`, data);
    return response.data;
  },

  /**
   * DELETE MESSAGE
   * Deletes a message
   * Uses: DELETE /api/communication/messages/{id}/
   */
  deleteMessage: async (id) => {
    const response = await api.delete(`${ENDPOINTS.MESSAGES}${id}/`);
    return response.data;
  },

  // ─── Notifications ──────────────────────────────────────────────────────

  /**
   * GET NOTIFICATIONS
   * Fetches all notifications for the teacher
   * Uses: GET /api/communication/notifications/
   */
  getNotifications: async (params = {}) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS, { params });
    return response.data;
  },

  /**
   * MARK NOTIFICATION READ
   * Marks a single notification as read
   * Uses: PATCH /api/communication/notifications/{id}/
   */
  markNotificationRead: async (id) => {
    const response = await api.patch(`${ENDPOINTS.NOTIFICATIONS}${id}/`, { is_read: true });
    return response.data;
  },

  /**
   * MARK ALL NOTIFICATIONS READ
   * Marks all notifications as read
   * Uses: POST /api/communication/notifications/mark-all-read/
   */
  markAllNotificationsRead: async () => {
    const response = await api.post(`${ENDPOINTS.NOTIFICATIONS}mark-all-read/`);
    return response.data;
  },

  // ─── Events ─────────────────────────────────────────────────────────────

  /**
   * GET EVENTS
   * Fetches all events
   * Uses: GET /api/events/events/
   */
  getEvents: async (params = {}) => {
    const response = await api.get(ENDPOINTS.EVENTS, { params });
    return response.data;
  },

  /**
   * GET EVENT PARTICIPATIONS
   * Fetches event participations
   * Uses: GET /api/events/event-participation/
   */
  getEventParticipations: async (params = {}) => {
    const response = await api.get(ENDPOINTS.EVENT_PARTICIPATION, { params });
    return response.data;
  },

  /**
   * CREATE EVENT PARTICIPATION
   * Creates an event participation
   * Uses: POST /api/events/event-participation/
   */
  createEventParticipation: async (data) => {
    const response = await api.post(ENDPOINTS.EVENT_PARTICIPATION, data);
    return response.data;
  },

  // ─── HR (Teacher's own records) ────────────────────────────────────────

  /**
   * GET LEAVES
   * Fetches teacher's own leave records
   * Uses: GET /api/hr/leaves/
   */
  getLeaves: async (params = {}) => {
    const response = await api.get(ENDPOINTS.LEAVES, { params });
    return response.data;
  },

  /**
   * CREATE LEAVE REQUEST
   * Creates a new leave request
   * Uses: POST /api/hr/leaves/
   */
  createLeave: async (data) => {
    const response = await api.post(ENDPOINTS.LEAVES, data);
    return response.data;
  },

  /**
   * GET PAYROLL
   * Fetches teacher's own payroll records
   * Uses: GET /api/hr/payroll/
   */
  getPayroll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PAYROLL, { params });
    return response.data;
  },

  /**
 * GET PAYROLL SUMMARY
 * Fetches payroll summary for the teacher
 * Uses: GET /api/hr/payroll/summary/
 */
getPayrollSummary: async (params = {}) => {
  try {
    const response = await api.get(ENDPOINTS.PAYROLL_SUMMARY, { params });
    return response.data;
  } catch (error) {
    console.warn('Payroll summary endpoint error:', error.response?.data);
    // Return null to indicate no data, or return a default summary
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
},
  /**
   * GET SALARY HISTORY
   * Fetches teacher's own salary history
   * Uses: GET /api/hr/salary-history/
   */
  getSalaryHistory: async (params = {}) => {
    const response = await api.get(ENDPOINTS.SALARY_HISTORY, { params });
    return response.data;
  },

  // ─── Analytics ──────────────────────────────────────────────────────────

  /**
   * GET PREDICTIONS
   * Fetches predictions for the teacher's students
   * Uses: GET /api/analytics/predictions/
   */
  getPredictions: async (params = {}) => {
    const response = await api.get(ENDPOINTS.PREDICTIONS, { params });
    return response.data;
  },

  /**
   * GET RECOMMENDATIONS
   * Fetches recommendations for the teacher
   * Uses: GET /api/analytics/recommendations/
   */
  getRecommendations: async (params = {}) => {
    const response = await api.get(ENDPOINTS.RECOMMENDATIONS, { params });
    return response.data;
  },

  /**
   * GET STUDENT GOALS
   * Fetches student goals
   * Uses: GET /api/analytics/student-goals/
   */
  getStudentGoals: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENT_GOALS, { params });
    return response.data;
  },

  /**
   * GET STUDENT SKILLS
   * Fetches student skills
   * Uses: GET /api/analytics/student-skills/
   */
  getStudentSkills: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENT_SKILLS, { params });
    return response.data;
  },

  // ─── Grades ─────────────────────────────────────────────────────────────

  /**
   * GET GRADES
   * Fetches all grades for the teacher's classes
   */
  getGrades: async (params = {}) => {
    const response = await api.get(ENDPOINTS.RESULTS, { params });
    return response.data;
  },

  /**
   * SAVE GRADES
   * Saves multiple grades at once (bulk operation)
   */
  saveGrades: async (data) => {
    const response = await api.post(`${ENDPOINTS.RESULTS}bulk/`, data);
    return response.data;
  },

  // ─── Complaints ──────────────────────────────────────────────────────────

  /**
   * GET COMPLAINTS
   * Fetches all complaints
   * Uses: GET /api/complaints/
   */
  getComplaints: async (params = {}) => {
    const response = await api.get(ENDPOINTS.COMPLAINTS, { params });
    return response.data;
  },

  /**
   * CREATE COMPLAINT
   * Creates a new complaint
   * Uses: POST /api/complaints/
   */
  createComplaint: async (data) => {
    const response = await api.post(ENDPOINTS.COMPLAINTS, data);
    return response.data;
  },

  /**
   * UPDATE COMPLAINT
   * Updates an existing complaint
   * Uses: PATCH /api/complaints/{id}/
   */
  updateComplaint: async (id, data) => {
    const response = await api.patch(`${ENDPOINTS.COMPLAINTS}${id}/`, data);
    return response.data;
  },
};

export default teacherService;