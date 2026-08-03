/**
 * ============================================
 * PARENT SERVICE
 * ============================================
 * 
 * Purpose: Handles all parent-related API calls
 * Used by: parentThunks and parent components
 * 
 * Features:
 * - Profile management
 * - Parent-Student links management
 * - Attendance tracking
 * - Grade management
 * - Behavior log management
 * - Fee and payment management
 * - Notification management
 * - Complaint management
 * - Event participation tracking
 * - Certificate management
 * - Assignment submissions
 * - AI Chat sessions and messages
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * - @/mocks/parentMock for mock data fallbacks
 * 
 * API Endpoints:
 * - /auth/profile
 * - /parent-links
 * - /parent/attendance
 * - /parent/grades
 * - /parent/behavior-logs
 * - /parent/fees
 * - /parent/payments
 * - /parent/notifications
 * - /parent/complaints
 * - /parent/events/participations
 * - /parent/certificates
 * - /parent/submissions
 * - /parent/chat/sessions
 * - /parent/chat/messages
 * ============================================
 */

import * as mockData from "@/mocks/parentMock";
import api from "@/services/api";

/**
 * ============================================
 * PARENT SERVICE
 * ============================================
 * 
 * Service object containing all parent-related API methods
 */
const parentService = {
  // ─── Profile ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET PROFILE
   * ============================================
   * 
   * Fetches the authenticated parent's profile information
   * 
   * @returns {Promise<Object>} Parent profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const profile = await parentService.getProfile();
   * console.log(profile.full_name);
   */
  getProfile: async () => {
    const { data } = await api.get("/auth/profile");
    return data;
  },

  // ─── Parent-Student Links ──────────────────────────────────────────────

  /**
   * ============================================
   * GET PARENT LINKS
   * ============================================
   * 
   * Fetches all parent-student links for the authenticated parent
   * 
   * @returns {Promise<Array>} Array of parent-student link objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const links = await parentService.getParentLinks();
   * links.forEach(link => console.log(link.student_name));
   */
  getParentLinks: async () => {
    const { data } = await api.get("/parent-links/");
    return data;
  },

  /**
   * ============================================
   * GET PARENT LINK BY ID
   * ============================================
   * 
   * Fetches a specific parent-student link by ID
   * 
   * @param {number} id - Parent link ID
   * @returns {Promise<Object>} Parent-student link object
   * 
   * @example
   * const link = await parentService.getParentLinkById(1);
   */
  getParentLinkById: async (id) =>
    mockData.parentLinks.find((item) => item.id === Number(id)),

  /**
   * ============================================
   * CREATE PARENT LINK
   * ============================================
   * 
   * Creates a new parent-student link
   * 
   * @param {Object} data - Link data
   * @param {string} data.relation - Parent's relation to child
   * @param {string} data.roll_number - Student's roll number
   * @returns {Promise<Object>} Created link
   * 
   * @example
   * const link = await parentService.createParentLink({
   *   relation: 'Father',
   *   roll_number: '2024-CS-021'
   * });
   */
  createParentLink: async (data) => ({
    id: Date.now(),
    parent: 1,
    student: Date.now(),
    relation: data.relation,
    is_primary_contact: false,
    student_roll_number: data.roll_number,
    student_name: "Mock Student",
    roll_number: data.roll_number,
  }),

  /**
   * ============================================
   * UPDATE PARENT LINK
   * ============================================
   * 
   * Updates an existing parent-student link
   * 
   * @param {number} id - Link ID
   * @param {Object} data - Updated link data
   * @returns {Promise<Object>} Updated link
   * 
   * @example
   * const updated = await parentService.updateParentLink(1, {
   *   relation: 'Guardian'
   * });
   */
  updateParentLink: async (id, data) => ({
    id,
    ...data,
  }),

  /**
   * ============================================
   * PATCH PARENT LINK
   * ============================================
   * 
   * Partially updates an existing parent-student link
   * 
   * @param {number} id - Link ID
   * @param {Object} data - Partial link data
   * @returns {Promise<Object>} Updated link
   */
  patchParentLink: async (id, data) => ({
    id,
    ...data,
  }),

  /**
   * ============================================
   * DELETE PARENT LINK
   * ============================================
   * 
   * Deletes a parent-student link by ID
   * 
   * @param {number} id - Link ID
   * @returns {Promise<Object>} Deletion confirmation
   * 
   * @example
   * await parentService.deleteParentLink(1);
   */
  deleteParentLink: async (id) => ({
    success: true,
    id,
  }),

  // ─── Attendance ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET ATTENDANCE
   * ============================================
   * 
   * Fetches attendance records for all children
   * 
   * @returns {Promise<Array>} Array of attendance records
   * @throws {Error} If the request fails
   * 
   * @example
   * const attendance = await parentService.getAttendance();
   * const present = attendance.filter(a => a.status === 'Present');
   */
  getAttendance: async () => {
    const { data } = await api.get("/parent/attendance");
    return data;
  },

  /**
   * ============================================
   * GET ATTENDANCE BY ID
   * ============================================
   * 
   * Fetches a specific attendance record by ID
   * 
   * @param {number} id - Attendance record ID
   * @returns {Promise<Object>} Attendance record
   */
  getAttendanceById: async (id) =>
    mockData.attendance.find((item) => item.id === Number(id)),

  // ─── Grades ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET GRADES
   * ============================================
   * 
   * Fetches grade records for all children
   * 
   * @returns {Promise<Array>} Array of grade records
   * @throws {Error} If the request fails
   * 
   * @example
   * const grades = await parentService.getGrades();
   * const mathGrade = grades.find(g => g.subject_name === 'Mathematics');
   */
  getGrades: async () => {
    const { data } = await api.get("/parent/grades");
    return data;
  },

  /**
   * ============================================
   * GET GRADE BY ID
   * ============================================
   * 
   * Fetches a specific grade record by ID
   * 
   * @param {number} id - Grade record ID
   * @returns {Promise<Object>} Grade record
   */
  getGradeById: async (id) =>
    mockData.grades.find((item) => item.id === Number(id)),

  // ─── Behavior Logs ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET BEHAVIOR LOGS
   * ============================================
   * 
   * Fetches behavior logs for all children
   * 
   * @returns {Promise<Array>} Array of behavior log records
   * @throws {Error} If the request fails
   * 
   * @example
   * const logs = await parentService.getBehaviorLogs();
   * const highSeverity = logs.filter(l => l.severity === 'High');
   */
  getBehaviorLogs: async () => {
    const { data } = await api.get("/parent/behavior-logs");
    return data;
  },

  /**
   * ============================================
   * GET BEHAVIOR LOG BY ID
   * ============================================
   * 
   * Fetches a specific behavior log by ID
   * 
   * @param {number} id - Behavior log ID
   * @returns {Promise<Object>} Behavior log record
   */
  getBehaviorLogById: async (id) =>
    mockData.behaviorLogs.find((item) => item.id === Number(id)),

  // ─── Fees ────────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET FEES
   * ============================================
   * 
   * Fetches fee records for all children
   * 
   * @returns {Promise<Array>} Array of fee records
   * @throws {Error} If the request fails
   * 
   * @example
   * const fees = await parentService.getFees();
   * const unpaid = fees.filter(f => f.status === 'Pending');
   */
  getFees: async () => {
    const { data } = await api.get("/parent/fees");
    return data;
  },

  /**
   * ============================================
   * GET FEE BY ID
   * ============================================
   * 
   * Fetches a specific fee record by ID
   * 
   * @param {number} id - Fee record ID
   * @returns {Promise<Object>} Fee record
   */
  getFeeById: async (id) =>
    mockData.fees.find((item) => item.id === Number(id)),

  // ─── Payments ────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET PAYMENTS
   * ============================================
   * 
   * Fetches payment history for all children
   * 
   * @returns {Promise<Array>} Array of payment records
   * @throws {Error} If the request fails
   * 
   * @example
   * const payments = await parentService.getPayments();
   * const totalPaid = payments.reduce((sum, p) => sum + p.amount_paid, 0);
   */
  getPayments: async () => {
    const { data } = await api.get("/parent/payments");
    return data;
  },

  /**
   * ============================================
   * GET PAYMENT BY ID
   * ============================================
   * 
   * Fetches a specific payment record by ID
   * 
   * @param {number} id - Payment record ID
   * @returns {Promise<Object>} Payment record
   */
  getPaymentById: async (id) =>
    mockData.payments.find((item) => item.id === Number(id)),

  // ─── Notifications ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET NOTIFICATIONS
   * ============================================
   * 
   * Fetches all notifications for the parent
   * 
   * @returns {Promise<Array>} Array of notification objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const notifications = await parentService.getNotifications();
   * const unread = notifications.filter(n => !n.is_read);
   */
  getNotifications: async () => {
    const { data } = await api.get("/parent/notifications");
    return data;
  },

  // ─── Complaints ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET COMPLAINTS
   * ============================================
   * 
   * Fetches all complaints filed by the parent
   * 
   * @returns {Promise<Array>} Array of complaint objects
   * 
   * @example
   * const complaints = await parentService.getComplaints();
   */
  getComplaints: async () => {
    const { data } = await api.get("/parent/complaints");
    return data;
  },

  /**
   * ============================================
   * GET COMPLAINT BY ID
   * ============================================
   * 
   * Fetches a specific complaint by ID
   * 
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Complaint object
   */
  getComplaintById: async (id) => {
    const { data } = await api.get(`/parent/complaints/${id}`);
    return data;
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
   * @returns {Promise<Object>} Created complaint
   * 
   * @example
   * const complaint = await parentService.createComplaint({
   *   complaint_type: 'Academic',
   *   description: 'Teacher is not responding to emails',
   *   against_user: 'Mr. Smith'
   * });
   */
  createComplaint: async (data) => {
    const { data: response } = await api.post("/parent/complaints", data);
    return response;
  },

  // ─── Events ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET EVENTS
   * ============================================
   * 
   * Fetches event participations for all children
   * 
   * @returns {Promise<Array>} Array of event participation records
   * @throws {Error} If the request fails
   * 
   * @example
   * const events = await parentService.getEvents();
   * const upcoming = events.filter(e => new Date(e.event_date) > new Date());
   */
  getEvents: async () => {
    const { data } = await api.get("/parent/events/participations");
    return data;
  },

  // ─── Certificates ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET CERTIFICATES
   * ============================================
   * 
   * Fetches all certificates earned by children
   * 
   * @returns {Promise<Array>} Array of certificate objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const certificates = await parentService.getCertificates();
   * console.log(`Total certificates: ${certificates.length}`);
   */
  getCertificates: async () => {
    const { data } = await api.get("/parent/certificates");
    console.log(data);
    return data;
  },

  /**
   * ============================================
   * GET CERTIFICATE BY ID
   * ============================================
   * 
   * Fetches a specific certificate by ID
   * 
   * @param {number} id - Certificate ID
   * @returns {Promise<Object>} Certificate object
   */
  getCertificateById: async (id) =>
    mockData.certificates.find((item) => item.id === Number(id)),

  // ─── Assignment Submissions ────────────────────────────────────────────

  /**
   * ============================================
   * GET SUBMISSIONS
   * ============================================
   * 
   * Fetches all assignment submissions for children
   * 
   * @returns {Promise<Array>} Array of submission objects
   * 
   * @example
   * const submissions = await parentService.getSubmissions();
   * const graded = submissions.filter(s => s.marks !== null);
   */
  getSubmissions: async () => mockData.submissions,

  /**
   * ============================================
   * GET SUBMISSION BY ID
   * ============================================
   * 
   * Fetches a specific submission by ID
   * 
   * @param {number} id - Submission ID
   * @returns {Promise<Object>} Submission object
   */
  getSubmissionById: async (id) =>
    mockData.submissions.find((item) => item.id === Number(id)),

  // ─── Chat Sessions ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET CHAT SESSIONS
   * ============================================
   * 
   * Fetches all chat sessions for the parent
   * 
   * @returns {Promise<Array>} Array of chat session objects
   * 
   * @example
   * const sessions = await parentService.getChatSessions();
   * console.log(`Total sessions: ${sessions.length}`);
   */
  getChatSessions: async () => mockData.chatSessions,

  /**
   * ============================================
   * GET CHAT SESSION BY ID
   * ============================================
   * 
   * Fetches a specific chat session by ID
   * 
   * @param {number} id - Session ID
   * @returns {Promise<Object>} Chat session object
   */
  getChatSessionById: async (id) =>
    mockData.chatSessions.find((item) => item.id === Number(id)),

  /**
   * ============================================
   * CREATE CHAT SESSION
   * ============================================
   * 
   * Creates a new chat session
   * 
   * @param {Object} data - Session data
   * @param {string} data.title - Session title
   * @returns {Promise<Object>} Created session
   * 
   * @example
   * const session = await parentService.createChatSession({
   *   title: 'Attendance Inquiry'
   * });
   */
  createChatSession: async (data) => ({
    id: Date.now(),
    bot_type: "general",
    title: data.title,
    active_child: 1,
    created_at: new Date().toISOString(),
  }),

  // ─── Chat Messages ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET CHAT MESSAGES
   * ============================================
   * 
   * Fetches all chat messages
   * 
   * @returns {Promise<Array>} Array of chat message objects
   * 
   * @example
   * const messages = await parentService.getChatMessages();
   * console.log(`Total messages: ${messages.length}`);
   */
  getChatMessages: async () => mockData.chatMessages,

  /**
   * ============================================
   * GET CHAT MESSAGE BY ID
   * ============================================
   * 
   * Fetches a specific chat message by ID
   * 
   * @param {number} id - Message ID
   * @returns {Promise<Object>} Chat message object
   */
  getChatMessageById: async (id) =>
    mockData.chatMessages.find((item) => item.id === Number(id)),

  /**
   * ============================================
   * CREATE CHAT MESSAGE
   * ============================================
   * 
   * Creates a new chat message
   * 
   * @param {Object} data - Message data
   * @param {number} data.session - Session ID
   * @param {string} data.content - Message content
   * @returns {Promise<Object>} Created message
   * 
   * @example
   * const message = await parentService.createChatMessage({
   *   session: 1,
   *   content: 'How many absences does my child have?'
   * });
   */
  createChatMessage: async (data) => ({
    id: Date.now(),
    session: data.session,
    role: "user",
    content: data.content,
    created_at: new Date().toISOString(),
  }),
};

export default parentService;