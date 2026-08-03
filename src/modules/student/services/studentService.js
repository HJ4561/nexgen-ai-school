/**
 * ============================================
 * STUDENT SERVICE
 * ============================================
 * 
 * Purpose: Handles all student-related API calls
 * Used by: studentThunks and student components
 * 
 * Features:
 * - Profile management (get, update)
 * - Attendance tracking
 * - Report card and grades
 * - Assignment management (get, submit, update, delete)
 * - Fee and payment management
 * - Event participations and certificates
 * - Complaint management (get, create, update)
 * - Notification management (get, mark read)
 * - AI Chat sessions and messages
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * - @/mocks/studentMock for mock data fallbacks
 * 
 * API Endpoints:
 * - /auth/profile
 * - /student/attendance
 * - /student/grades
 * - /student/assignments
 * - /student/submissions
 * - /student/fees
 * - /student/payments
 * - /student/events/participations
 * - /student/certificates
 * - /student/complaints
 * - /student/notifications
 * - /student/chat/sessions
 * - /student/chat/messages
 * ============================================
 */

import * as mockData from "@/mocks/studentMock";
import api from "@/services/api";

/**
 * ============================================
 * STUDENT SERVICE
 * ============================================
 * 
 * Service object containing all student-related API methods
 */
const studentService = {
  // ─── Profile ──────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET PROFILE
   * ============================================
   * 
   * Fetches the authenticated student's profile information
   * 
   * @returns {Promise<Object>} Student profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const profile = await studentService.getProfile();
   * console.log(profile.full_name);
   */
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  /**
   * ============================================
   * UPDATE PROFILE
   * ============================================
   * 
   * Updates the authenticated student's profile information
   * 
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.full_name - Student's full name
   * @param {string} profileData.email - Student's email address
   * @param {string} profileData.phone - Student's phone number
   * @param {string} profileData.address - Student's address
   * @returns {Promise<Object>} Updated profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await studentService.updateProfile({
   *   full_name: 'Fazail Nadeem',
   *   phone: '0300-1234567'
   * });
   */
  updateProfile: async (profileData) => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },

  // ─── Attendance ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET ATTENDANCE
   * ============================================
   * 
   * Fetches the student's attendance records
   * 
   * @returns {Promise<Array>} Array of attendance records
   * @throws {Error} If the request fails
   * 
   * @example
   * const attendance = await studentService.getAttendance();
   * console.log(`Present: ${attendance.filter(a => a.status === 'Present').length}`);
   */
  getAttendance: async () => {
    const { data } = await api.get("/student/attendance");
    return data;
  },

  // ─── Report Card ─────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET REPORT CARD
   * ============================================
   * 
   * Fetches the student's report card with grades
   * 
   * @returns {Promise<Object>} Report card data with academic_year, published_at, remarks, and grades
   * @throws {Error} If the request fails
   * 
   * @example
   * const reportCard = await studentService.getReportCard();
   * console.log(`Overall Grade: ${reportCard.grades.reduce((acc, g) => acc + g.obtained_marks, 0)}`);
   */
  getReportCard: async () => {
    const { data } = await api.get("/student/grades");
    return {
      academic_year: "2025-2026",
      published_at: new Date().toISOString(),
      remarks: "",
      grades: data,
    };
  },

  // ─── Assignments ─────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET ASSIGNMENTS
   * ============================================
   * 
   * Fetches all assignments for the student
   * 
   * @returns {Promise<Array>} Array of assignment objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const assignments = await studentService.getAssignments();
   * const pending = assignments.filter(a => a.status === 'Pending');
   */
  getAssignments: async () => {
    const { data } = await api.get("/student/assignments");
    return data;
  },

  /**
   * ============================================
   * SUBMIT ASSIGNMENT
   * ============================================
   * 
   * Submits an assignment with file and comments
   * 
   * @param {Object} submissionData - Submission data
   * @param {number} submissionData.assignmentId - Assignment ID
   * @param {string} submissionData.file_url - URL of the submitted file
   * @param {string} submissionData.comment - Optional comment
   * @returns {Promise<Object>} Created submission
   * @throws {Error} If the request fails
   * 
   * @example
   * const submission = await studentService.submitAssignment({
   *   assignmentId: 1,
   *   file_url: 'https://storage.com/file.pdf',
   *   comment: 'Please review my assignment'
   * });
   */
  submitAssignment: async (submissionData) => {
    const { data } = await api.post("/student/submissions", submissionData);
    return data;
  },

  /**
   * ============================================
   * GET SUBMISSIONS
   * ============================================
   * 
   * Fetches all submissions made by the student
   * 
   * @returns {Promise<Array>} Array of submission objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const submissions = await studentService.getSubmissions();
   * console.log(`Total submissions: ${submissions.length}`);
   */
  getSubmissions: async () => {
    const { data } = await api.get("/student/submissions");
    return data;
  },

  /**
   * ============================================
   * UPDATE SUBMISSION
   * ============================================
   * 
   * Updates an existing submission (e.g., replacing file)
   * 
   * @param {number} id - Submission ID
   * @param {Object} submissionData - Updated submission data
   * @returns {Promise<Object>} Updated submission
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await studentService.updateSubmission(1, {
   *   file_url: 'https://storage.com/updated-file.pdf'
   * });
   */
  updateSubmission: async (id, submissionData) => {
    const { data } = await api.patch(`/student/submissions/${id}`, submissionData);
    return data;
  },

  /**
   * ============================================
   * DELETE SUBMISSION
   * ============================================
   * 
   * Deletes a submission by ID
   * 
   * @param {number} id - Submission ID
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   * 
   * @example
   * await studentService.deleteSubmission(1);
   */
  deleteSubmission: async (id) => {
    console.log("deleting");
    await api.delete(`/student/submissions/${id}`);
  },

  // ─── Finance ─────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET FEES
   * ============================================
   * 
   * Fetches all fee records for the student
   * 
   * @returns {Promise<Array>} Array of fee objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const fees = await studentService.getFees();
   * const unpaid = fees.filter(f => f.status === 'Pending');
   */
  getFees: async () => {
    const { data } = await api.get("/student/fees");
    return data;
  },

  /**
   * ============================================
   * GET PAYMENTS
   * ============================================
   * 
   * Fetches all payment history for the student
   * 
   * @returns {Promise<Array>} Array of payment objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const payments = await studentService.getPayments();
   * console.log(`Total paid: ${payments.reduce((sum, p) => sum + p.amount_paid, 0)}`);
   */
  getPayments: async () => {
    const { data } = await api.get("/student/payments");
    return data;
  },

  // ─── Events ─────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET PARTICIPATIONS
   * ============================================
   * 
   * Fetches all event participations for the student
   * 
   * @returns {Promise<Array>} Array of participation objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const participations = await studentService.getParticipations();
   * const upcoming = participations.filter(p => new Date(p.event_date) > new Date());
   */
  getParticipations: async () => {
    const { data } = await api.get("/student/events/participations");
    return data;
  },

  /**
   * ============================================
   * GET CERTIFICATES
   * ============================================
   * 
   * Fetches all certificates earned by the student
   * 
   * @returns {Promise<Array>} Array of certificate objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const certificates = await studentService.getCertificates();
   * console.log(`Total certificates: ${certificates.length}`);
   */
  getCertificates: async () => {
    console.log("Inside getCertificates");

    try {
      const response = await api.get("/student/certificates");
      console.log("Full Response:", response);
      console.log("Data:", response.data);
      return response.data;
    } catch (error) {
      console.log("API Error:", error);
      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      throw error;
    }
  },

  // ─── Complaints ─────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET COMPLAINTS
   * ============================================
   * 
   * Fetches all complaints filed by the student
   * 
   * @returns {Promise<Array>} Array of complaint objects
   * 
   * @example
   * const complaints = await studentService.getComplaints();
   * console.log(`Open complaints: ${complaints.filter(c => c.status === 'Open').length}`);
   */
  getComplaints: async () => mockData.complaints,

  /**
   * ============================================
   * CREATE COMPLAINT
   * ============================================
   * 
   * Creates a new complaint
   * 
   * @param {Object} complaintData - Complaint data
   * @param {string} complaintData.complaint_type - Type of complaint
   * @param {string} complaintData.description - Complaint description
   * @param {string} complaintData.against_user - User being complained about
   * @returns {Promise<Object>} Created complaint
   * 
   * @example
   * const complaint = await studentService.createComplaint({
   *   complaint_type: 'Academic',
   *   description: 'Teacher is not grading assignments on time',
   *   against_user: 'Mr. Smith'
   * });
   */
  createComplaint: async (complaintData) => {
    return {
      success: true,
      message: "Complaint submitted successfully.",
      data: complaintData,
    };
  },

  /**
   * ============================================
   * UPDATE COMPLAINT
   * ============================================
   * 
   * Updates an existing complaint
   * 
   * @param {number} id - Complaint ID
   * @param {Object} complaintData - Updated complaint data
   * @returns {Promise<Object>} Updated complaint
   * 
   * @example
   * const updated = await studentService.updateComplaint(1, {
   *   status: 'Resolved'
   * });
   */
  updateComplaint: async (id, complaintData) => {
    return {
      success: true,
      message: "Complaint updated successfully.",
      id,
      data: complaintData,
    };
  },

  // ─── Notifications ──────────────────────────────────────────────────────

  /**
   * ============================================
   * GET NOTIFICATIONS
   * ============================================
   * 
   * Fetches all notifications for the student
   * 
   * @returns {Promise<Array>} Array of notification objects
   * 
   * @example
   * const notifications = await studentService.getNotifications();
   * const unread = notifications.filter(n => !n.is_read);
   */
  getNotifications: async () => mockData.notifications,

  /**
   * ============================================
   * GET UNREAD NOTIFICATIONS COUNT
   * ============================================
   * 
   * Returns the count of unread notifications
   * 
   * @returns {Promise<number>} Number of unread notifications
   * 
   * @example
   * const unreadCount = await studentService.getUnreadNotifications();
   * console.log(`You have ${unreadCount} unread notifications`);
   */
  getUnreadNotifications: async () =>
    mockData.notifications.filter((notification) => !notification.is_read).length,

  /**
   * ============================================
   * MARK NOTIFICATION READ
   * ============================================
   * 
   * Marks a single notification as read
   * 
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Confirmation of update
   * 
   * @example
   * await studentService.markNotificationRead(5);
   */
  markNotificationRead: async (id) => {
    return {
      success: true,
      id,
    };
  },

  /**
   * ============================================
   * MARK ALL NOTIFICATIONS READ
   * ============================================
   * 
   * Marks all notifications as read
   * 
   * @returns {Promise<Object>} Confirmation of update
   * 
   * @example
   * await studentService.markAllNotificationsRead();
   */
  markAllNotificationsRead: async () => {
    return {
      success: true,
    };
  },

  // ─── AI Chat ─────────────────────────────────────────────────────────────

  /**
   * ============================================
   * GET CHAT SESSIONS
   * ============================================
   * 
   * Fetches all chat sessions for the student
   * 
   * @returns {Promise<Array>} Array of chat session objects
   * 
   * @example
   * const sessions = await studentService.getChatSessions();
   * console.log(`Total sessions: ${sessions.length}`);
   */
  getChatSessions: async () => mockData.chatSessions,

  /**
   * ============================================
   * CREATE CHAT SESSION
   * ============================================
   * 
   * Creates a new chat session
   * 
   * @param {Object} sessionData - Session data
   * @param {string} sessionData.title - Session title
   * @param {string} sessionData.bot_type - Bot type (general, etc.)
   * @returns {Promise<Object>} Created session
   * 
   * @example
   * const session = await studentService.createChatSession({
   *   title: 'Math Help',
   *   bot_type: 'tutor'
   * });
   */
  createChatSession: async (sessionData) => {
    return {
      id: Date.now(),
      user_id: 3,
      title: sessionData.title ?? "New Chat",
      role: "student",
      bot_type: sessionData.bot_type ?? "general",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * ============================================
   * DELETE CHAT SESSION
   * ============================================
   * 
   * Deletes a chat session by ID
   * 
   * @param {number} sessionId - Session ID
   * @returns {Promise<Object>} Confirmation of deletion
   * 
   * @example
   * await studentService.deleteChatSession(1);
   */
  deleteChatSession: async (sessionId) => {
    return {
      success: true,
      sessionId,
    };
  },

  /**
   * ============================================
   * GET CHAT MESSAGES
   * ============================================
   * 
   * Fetches all messages for a chat session
   * 
   * @param {number} sessionId - Session ID
   * @returns {Promise<Array>} Array of message objects
   * 
   * @example
   * const messages = await studentService.getChatMessages(1);
   * console.log(`Total messages: ${messages.length}`);
   */
  getChatMessages: async (sessionId) =>
    mockData.chatMessages.filter((message) => message.session_id === sessionId),
};

export default studentService;