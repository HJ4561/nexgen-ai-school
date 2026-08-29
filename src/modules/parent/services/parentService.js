// src/modules/parent/services/parentService.js

/**
 * ============================================
 * PARENT SERVICE - COMPLETE
 * ============================================
 * 
 * Purpose: Handles all parent-related API calls
 * Used by: parentThunks and parent components
 * 
 * USAGE OF NEW API FIELDS:
 * - user_name from parent profile (read-only)
 * - student_name from parent links (read-only)
 * - class_name from student data (read-only)
 * - teacher_name from behavior logs (read-only)
 * - sender_name from notifications (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import api from "@/services/api";

// ─── API Endpoint Constants ──────────────────────────────────────────────────────────
const API_BASE = "/api";

const ENDPOINTS = {
  // Auth & Profile
  PROFILE: `${API_BASE}/users/parents/me/`,
  CHANGE_PASSWORD: `${API_BASE}/auth/change-password/`,
  LOGOUT_ALL: `${API_BASE}/auth/logout-all/`,
  
  // Parent Links (Students)
  PARENT_LINKS: `${API_BASE}/users/parents/`,
  STUDENTS: `${API_BASE}/users/students/`,
  
  // Academics
  CLASSES: `${API_BASE}/academics/classes/`,
  SECTIONS: `${API_BASE}/academics/sections/`,
  SUBJECTS: `${API_BASE}/academics/subjects/`,
  CLASS_SUBJECTS: `${API_BASE}/academics/class-subjects/`,
  TIMETABLE: `${API_BASE}/academics/timetable/`,
  ROOMS: `${API_BASE}/academics/rooms/`,
  
  // Attendance
  ATTENDANCE: `${API_BASE}/attendance/attendance/`,
  BEHAVIOR_LOGS: `${API_BASE}/attendance/behavior-logs/`,
  
  // Exams & Grades
  EXAMS: `${API_BASE}/exams/exams/`,
  RESULTS: `${API_BASE}/exams/results/`,
  GRADE_SCALE: `${API_BASE}/exams/grade-scale/`,
  QUESTIONS: `${API_BASE}/exams/questions/`,
  STUDENT_ANSWERS: `${API_BASE}/exams/student-answers/`,
  AI_AUTO_CHECKING: `${API_BASE}/exams/ai-auto-checking/`,
  
  // Assignments
  ASSIGNMENTS: `${API_BASE}/assignments/assignments/`,
  SUBMISSIONS: `${API_BASE}/assignments/submissions/`,
  
  // Finance
  FEE_STRUCTURES: `${API_BASE}/finance/fee-structures/`,
  FEES: `${API_BASE}/finance/fees/`,
  PAYMENTS: `${API_BASE}/finance/payments/`,
  FEE_HISTORY: `${API_BASE}/finance/fee-history/`,
  EXPENSES: `${API_BASE}/finance/expenses/`,
  
  // Communication
  MESSAGES: `${API_BASE}/communication/messages/`,
  NOTIFICATIONS: `${API_BASE}/communication/notifications/`,
  NOTIFICATION_LOG: `${API_BASE}/communication/notification-log/`,
  
  // PTM
  PTM: `${API_BASE}/ptm/ptm/`,
  PTM_MEETINGS: `${API_BASE}/ptm/ptm-meetings/`,
  PTM_ATTENDEES: `${API_BASE}/ptm/ptm-attendees/`,
  
  // Transport
  BUSES: `${API_BASE}/transport/buses/`,
  ROUTES: `${API_BASE}/transport/routes/`,
  BUS_STOPS: `${API_BASE}/transport/bus-stops/`,
  BUS_STUDENTS: `${API_BASE}/transport/bus-students/`,
  TRANSPORT_ATTENDANCE: `${API_BASE}/transport/transport-attendance/`,
  
  // Library
  BOOKS: `${API_BASE}/library/books/`,
  BOOK_ISSUES: `${API_BASE}/library/book-issues/`,
  BOOK_ISSUE_HISTORY: `${API_BASE}/library/book-issue-history/`,
  
  // Canteen
  CANTEEN_CATEGORIES: `${API_BASE}/canteen/categories/`,
  MENU_ITEMS: `${API_BASE}/canteen/menu-items/`,
  ORDER_ITEMS: `${API_BASE}/canteen/order-items/`,
  
  // Security
  VISITORS: `${API_BASE}/security/visitors/`,
  ACCESS_LOGS: `${API_BASE}/security/access-logs/`,
  ENTRY_EXIT_LOGS: `${API_BASE}/security/entry-exit-logs/`,
  
  // Events
  EVENTS: `${API_BASE}/events/events/`,
  EVENT_PARTICIPATION: `${API_BASE}/events/event-participation/`,
  
  // Documents
  DOCUMENTS: `${API_BASE}/documents/documents/`,
  DOCUMENT_TYPES: `${API_BASE}/documents/document-types/`,
  
  // Analytics
  PREDICTIONS: `${API_BASE}/analytics/predictions/`,
  RECOMMENDATIONS: `${API_BASE}/analytics/recommendations/`,
  STUDENT_GOALS: `${API_BASE}/analytics/student-goals/`,
  STUDENT_SKILLS: `${API_BASE}/analytics/student-skills/`,
  SKILL_MAPPING: `${API_BASE}/analytics/skill-mapping/`,
  PARENT_ENGAGEMENT: `${API_BASE}/analytics/parent-engagement/`,
  
  // Chat
  CHAT_SESSIONS: `${API_BASE}/chat/sessions/`,
  CHAT_MESSAGES: `${API_BASE}/chat/messages/`,
  
  // Dashboard
  DASHBOARD: `${API_BASE}/parent/dashboard/`,
};

// ─── Helper: Extract name from response ─────────────────────────────────────────────

export const getNameFromResponse = (data) => {
  if (!data) return null;
  // Priority: Use user_name from API (new field!)
  if (data.user_name && data.user_name !== 'null') return data.user_name;
  if (data.name) return data.name;
  if (data.full_name) return data.full_name;
  if (data.user) {
    if (typeof data.user === 'string') return data.user;
    if (data.user.name) return data.user.name;
    if (data.user.user_name) return data.user.user_name;
  }
  return null;
};

export const getStudentNameFromResponse = (data) => {
  if (!data) return null;
  if (data.student_name && data.student_name !== 'null') return data.student_name;
  if (data.student) {
    if (typeof data.student === 'string') return data.student;
    if (data.student.name) return data.student.name;
    if (data.student.student_name) return data.student.student_name;
  }
  return null;
};

export const getClassNameFromResponse = (data) => {
  if (!data) return null;
  if (data.class_name && data.class_name !== 'null') return data.class_name;
  if (data.class_obj) {
    if (typeof data.class_obj === 'string') return data.class_obj;
    if (data.class_obj.name) return data.class_obj.name;
    if (data.class_obj.class_name) return data.class_obj.class_name;
  }
  return null;
};

export const getTeacherNameFromResponse = (data) => {
  if (!data) return null;
  if (data.teacher_name && data.teacher_name !== 'null') return data.teacher_name;
  if (data.teacher) {
    if (typeof data.teacher === 'string') return data.teacher;
    if (data.teacher.name) return data.teacher.name;
    if (data.teacher.teacher_name) return data.teacher.teacher_name;
  }
  return null;
};

// ─── Parent Service ──────────────────────────────────────────────────────────────────

const parentService = {
  // ─── Profile ──────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/users/parents/me/
   * Returns parent profile with user_name, email, phone, address
   */
  getProfile: () => api.get(ENDPOINTS.PROFILE),
  
  /**
   * PATCH /api/users/parents/me/
   * Update parent profile (DO NOT send user_name)
   */
  updateProfile: (data) => api.patch(ENDPOINTS.PROFILE, data),
  
  /**
   * POST /api/auth/change-password/
   * Change parent password
   */
  changePassword: (data) => api.post(ENDPOINTS.CHANGE_PASSWORD, data),
  
  /**
   * POST /api/auth/logout-all/
   * Logout from all devices
   */
  logoutAll: () => api.post(ENDPOINTS.LOGOUT_ALL),

  // ─── Parent Links ──────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/users/parents/
   * Returns parent-student links with student_name field
   */
  getParentLinks: () => api.get(ENDPOINTS.PARENT_LINKS),
  
  /**
   * GET /api/users/students/{id}/
   * Returns student details with user_name, class_name, parent_name
   */
  getStudentById: (id) => api.get(`${ENDPOINTS.STUDENTS}${id}/`),

  // ─── Academics ──────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/academics/classes/
   * Returns classes with name, description, academic_year
   */
  getClasses: (params) => api.get(ENDPOINTS.CLASSES, { params }),
  
  /**
   * GET /api/academics/sections/
   * Returns sections with class_name field
   */
  getSections: (params) => api.get(ENDPOINTS.SECTIONS, { params }),
  
  /**
   * GET /api/academics/subjects/
   * Returns subjects with name, code, description
   */
  getSubjects: (params) => api.get(ENDPOINTS.SUBJECTS, { params }),
  
  /**
   * GET /api/academics/class-subjects/
   * Returns class subjects with class_name, subject_name, teacher_name
   */
  getClassSubjects: (params) => api.get(ENDPOINTS.CLASS_SUBJECTS, { params }),
  
  /**
   * GET /api/academics/timetable/
   * Returns timetable with class_name, section_name, subject_name, teacher_name, room_name
   */
  getTimetable: (params) => api.get(ENDPOINTS.TIMETABLE, { params }),
  
  /**
   * GET /api/academics/rooms/
   * Returns rooms with name, location, capacity
   */
  getRooms: (params) => api.get(ENDPOINTS.ROOMS, { params }),

  // ─── Attendance ────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/attendance/attendance/
   * Returns attendance with student_name, teacher_name, marked_by_name
   */
  getAttendance: (params) => api.get(ENDPOINTS.ATTENDANCE, { params }),
  
  /**
   * GET /api/attendance/behavior-logs/
   * Returns behavior logs with student_name, teacher_name
   */
  getBehaviorLogs: (params) => api.get(ENDPOINTS.BEHAVIOR_LOGS, { params }),

  // ─── Exams ─────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/exams/exams/
   * Returns exams with class_name, subject_name, teacher_name
   */
  getExams: (params) => api.get(ENDPOINTS.EXAMS, { params }),
  
  /**
   * GET /api/exams/results/
   * Returns results with student_name, exam_name
   */
  getResults: (params) => api.get(ENDPOINTS.RESULTS, { params }),
  
  /**
   * GET /api/exams/grade-scale/
   * Returns grade scale with grade, min_percentage, max_percentage, gpa
   */
  getGradeScale: (params) => api.get(ENDPOINTS.GRADE_SCALE, { params }),
  
  /**
   * GET /api/exams/questions/
   * Returns questions with exam_name
   */
  getQuestions: (params) => api.get(ENDPOINTS.QUESTIONS, { params }),
  
  /**
   * GET /api/exams/student-answers/
   * Returns student answers with student_name, exam_name
   */
  getStudentAnswers: (params) => api.get(ENDPOINTS.STUDENT_ANSWERS, { params }),
  
  /**
   * GET /api/exams/ai-auto-checking/
   * Returns AI auto checking with student_name, exam_name, reviewed_by_teacher_name
   */
  getAIAutoChecking: (params) => api.get(ENDPOINTS.AI_AUTO_CHECKING, { params }),

  // ─── Assignments ──────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/assignments/assignments/
   * Returns assignments with class_name, subject_name, teacher_name
   */
  getAssignments: (params) => api.get(ENDPOINTS.ASSIGNMENTS, { params }),
  
  /**
   * GET /api/assignments/submissions/
   * Returns submissions with student_name, assignment_title
   */
  getSubmissions: (params) => api.get(ENDPOINTS.SUBMISSIONS, { params }),

  // ─── Finance ─────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/finance/fee-structures/
   * Returns fee structures with class_name
   */
  getFeeStructures: (params) => api.get(ENDPOINTS.FEE_STRUCTURES, { params }),
  
  /**
   * GET /api/finance/fees/
   * Returns fees with student_name, fee_structure_title
   */
  getFees: (params) => api.get(ENDPOINTS.FEES, { params }),
  
  /**
   * GET /api/finance/payments/
   * Returns payments with student_name, fee_title
   */
  getPayments: (params) => api.get(ENDPOINTS.PAYMENTS, { params }),
  
  /**
   * GET /api/finance/fee-history/
   * Returns fee history with student_name, changed_by_name
   */
  getFeeHistory: (params) => api.get(ENDPOINTS.FEE_HISTORY, { params }),
  
  /**
   * GET /api/finance/expenses/
   * Returns expenses with paid_by_name
   */
  getExpenses: (params) => api.get(ENDPOINTS.EXPENSES, { params }),

  // ─── Communication ──────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/communication/messages/
   * Returns messages with sender_name, receiver_name
   */
  getMessages: (params) => api.get(ENDPOINTS.MESSAGES, { params }),
  
  /**
   * POST /api/communication/messages/
   * Send a message (DO NOT send sender_name or receiver_name)
   */
  sendMessage: (data) => api.post(ENDPOINTS.MESSAGES, data),
  
  /**
   * GET /api/communication/notifications/
   * Returns notifications with user_name
   */
  getNotifications: (params) => api.get(ENDPOINTS.NOTIFICATIONS, { params }),
  
  /**
   * PATCH /api/communication/notifications/{id}/
   * Mark notification as read (DO NOT send user_name)
   */
  markNotificationAsRead: (id) => api.patch(`${ENDPOINTS.NOTIFICATIONS}${id}/`, { is_read: true }),
  
  /**
   * POST /api/communication/notifications/mark-all-read/
   * Mark all notifications as read
   */
  markAllNotificationsAsRead: () => api.post(`${ENDPOINTS.NOTIFICATIONS}mark-all-read/`),
  
  /**
   * GET /api/communication/notification-log/
   * Returns notification log with notification_title
   */
  getNotificationLog: (params) => api.get(ENDPOINTS.NOTIFICATION_LOG, { params }),

  // ─── PTM ────────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/ptm/ptm/
   * Returns PTM with class_name
   */
  getPTM: (params) => api.get(ENDPOINTS.PTM, { params }),
  
  /**
   * GET /api/ptm/ptm-meetings/
   * Returns PTM meetings with ptm_name, student_name, teacher_name
   */
  getPTMMeetings: (params) => api.get(ENDPOINTS.PTM_MEETINGS, { params }),
  
  /**
   * GET /api/ptm/ptm-attendees/
   * Returns PTM attendees with parent_name, meeting_label
   */
  getPTMAttendees: (params) => api.get(ENDPOINTS.PTM_ATTENDEES, { params }),
  
  /**
   * PATCH /api/ptm/ptm-attendees/{id}/
   * Update PTM attendee (DO NOT send parent_name)
   */
  updatePTMAttendee: (id, data) => api.patch(`${ENDPOINTS.PTM_ATTENDEES}${id}/`, data),

  // ─── Transport ──────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/transport/buses/
   * Returns buses with bus_number, status
   */
  getBuses: (params) => api.get(ENDPOINTS.BUSES, { params }),
  
  /**
   * GET /api/transport/routes/
   * Returns routes with name, description, start_point, end_point
   */
  getRoutes: (params) => api.get(ENDPOINTS.ROUTES, { params }),
  
  /**
   * GET /api/transport/bus-stops/
   * Returns bus stops with route_name
   */
  getBusStops: (params) => api.get(ENDPOINTS.BUS_STOPS, { params }),
  
  /**
   * GET /api/transport/bus-students/
   * Returns bus students with bus_number, student_name, pickup_stop_name, drop_stop_name
   */
  getBusStudents: (params) => api.get(ENDPOINTS.BUS_STUDENTS, { params }),
  
  /**
   * GET /api/transport/transport-attendance/
   * Returns transport attendance with student_name, bus_number
   */
  getTransportAttendance: (params) => api.get(ENDPOINTS.TRANSPORT_ATTENDANCE, { params }),

  // ─── Library ────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/library/books/
   * Returns books with category_name
   */
  getBooks: (params) => api.get(ENDPOINTS.BOOKS, { params }),
  
  /**
   * GET /api/library/book-issues/
   * Returns book issues with book_title, student_name
   */
  getBookIssues: (params) => api.get(ENDPOINTS.BOOK_ISSUES, { params }),
  
  /**
   * GET /api/library/book-issue-history/
   * Returns book issue history with book_title, student_name, changed_by_name
   */
  getBookIssueHistory: (params) => api.get(ENDPOINTS.BOOK_ISSUE_HISTORY, { params }),

  // ─── Canteen ────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/canteen/categories/
   * Returns canteen categories with name, description
   */
  getCategories: (params) => api.get(ENDPOINTS.CANTEEN_CATEGORIES, { params }),
  
  /**
   * GET /api/canteen/menu-items/
   * Returns menu items with category_name
   */
  getMenuItems: (params) => api.get(ENDPOINTS.MENU_ITEMS, { params }),
  
  /**
   * GET /api/canteen/order-items/
   * Returns order items with student_name, item_name
   */
  getOrders: (params) => api.get(ENDPOINTS.ORDER_ITEMS, { params }),

  // ─── Security ───────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/security/visitors/
   * Returns visitors with approved_by_name
   */
  getVisitors: (params) => api.get(ENDPOINTS.VISITORS, { params }),
  
  /**
   * GET /api/security/access-logs/
   * Returns access logs with user_name
   */
  getAccessLogs: (params) => api.get(ENDPOINTS.ACCESS_LOGS, { params }),
  
  /**
   * GET /api/security/entry-exit-logs/
   * Returns entry/exit logs with student_name
   */
  getEntryExitLogs: (params) => api.get(ENDPOINTS.ENTRY_EXIT_LOGS, { params }),

  // ─── Events ─────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/events/events/
   * Returns events with organizer_name
   */
  getEvents: (params) => api.get(ENDPOINTS.EVENTS, { params }),
  
  /**
   * GET /api/events/event-participation/
   * Returns event participation with event_name, student_name
   */
  getEventParticipations: (params) => api.get(ENDPOINTS.EVENT_PARTICIPATION, { params }),
  
  /**
   * POST /api/events/event-participation/
   * Create event participation (DO NOT send event_name or student_name)
   */
  createEventParticipation: (data) => api.post(ENDPOINTS.EVENT_PARTICIPATION, data),

  // ─── Documents ──────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/documents/documents/
   * Returns documents with user_name, doc_type_name, uploaded_by_name
   */
  getDocuments: (params) => api.get(ENDPOINTS.DOCUMENTS, { params }),
  
  /**
   * GET /api/documents/document-types/
   * Returns document types with name, description
   */
  getDocumentTypes: (params) => api.get(ENDPOINTS.DOCUMENT_TYPES, { params }),

  // ─── Analytics ───────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/analytics/predictions/
   * Returns predictions with student_name
   */
  getPredictions: (params) => api.get(ENDPOINTS.PREDICTIONS, { params }),
  
  /**
   * GET /api/analytics/recommendations/
   * Returns recommendations with student_name
   */
  getRecommendations: (params) => api.get(ENDPOINTS.RECOMMENDATIONS, { params }),
  
  /**
   * GET /api/analytics/student-goals/
   * Returns student goals with student_name
   */
  getStudentGoals: (params) => api.get(ENDPOINTS.STUDENT_GOALS, { params }),
  
  /**
   * GET /api/analytics/student-skills/
   * Returns student skills with student_name, skill_name
   */
  getStudentSkills: (params) => api.get(ENDPOINTS.STUDENT_SKILLS, { params }),
  
  /**
   * GET /api/analytics/skill-mapping/
   * Returns skill mapping with name, category
   */
  getSkillMapping: (params) => api.get(ENDPOINTS.SKILL_MAPPING, { params }),
  
  /**
   * GET /api/analytics/parent-engagement/
   * Returns parent engagement with parent_name
   */
  getParentEngagement: (params) => api.get(ENDPOINTS.PARENT_ENGAGEMENT, { params }),

  // ─── Chat ───────────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/chat/sessions/
   * Returns chat sessions
   */
  getChatSessions: (params) => api.get(ENDPOINTS.CHAT_SESSIONS, { params }),
  
  /**
   * POST /api/chat/sessions/
   * Create chat session
   */
  createChatSession: (data) => api.post(ENDPOINTS.CHAT_SESSIONS, data),
  
  /**
   * PATCH /api/chat/sessions/{id}/
   * Update chat session
   */
  updateChatSession: (id, data) => api.patch(`${ENDPOINTS.CHAT_SESSIONS}${id}/`, data),
  
  /**
   * DELETE /api/chat/sessions/{id}/
   * Delete chat session
   */
  deleteChatSession: (id) => api.delete(`${ENDPOINTS.CHAT_SESSIONS}${id}/`),
  
  /**
   * GET /api/chat/messages/
   * Returns chat messages
   */
  getChatMessages: (params) => api.get(ENDPOINTS.CHAT_MESSAGES, { params }),
  
  /**
   * POST /api/chat/messages/
   * Create chat message
   */
  createChatMessage: (data) => api.post(ENDPOINTS.CHAT_MESSAGES, data),

  // ─── Dashboard ──────────────────────────────────────────────────────────────────────
  
  /**
   * GET /api/parent/dashboard/
   * Returns parent dashboard data
   */
  getDashboard: () => api.get(ENDPOINTS.DASHBOARD),
};

export default parentService;