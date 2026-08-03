/**
 * ============================================
 * STUDENT THUNKS
 * ============================================
 * 
 * Purpose: Async thunks for student module API calls
 * Used by: studentSlice for state management
 * 
 * Features:
 * - Profile management
 * - Academics (attendance, report card, assignments, submissions)
 * - Finance (fees, payments, payment intents)
 * - Events (events, participations, certificates)
 * - Complaints (fetch, create, update)
 * - Notifications (fetch, mark read, mark all read)
 * - AI Chat (sessions, messages, create, delete)
 * 
 * Dependencies:
 * - @reduxjs/toolkit for createAsyncThunk
 * - @/modules/student/services/studentService for student API calls
 * - @/modules/payments/services/paymentService for payment API calls
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

import { createAsyncThunk } from "@reduxjs/toolkit";
import studentService from "@/modules/student/services/studentService";
import paymentService from "@/modules/payments/services/paymentService";

// ─── Profile & Dashboard ──────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH PROFILE
 * ============================================
 * 
 * Fetches the authenticated student's profile information
 * 
 * @returns {Promise<Object>} Student profile data
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchProfile())
 *   .unwrap()
 *   .then(profile => console.log(profile.full_name))
 *   .catch(error => console.error(error));
 */
export const fetchProfile = createAsyncThunk(
  "student/fetchProfile",
  async (_, thunkAPI) => {
    try {
      return await studentService.getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Academics ─────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH ATTENDANCE
 * ============================================
 * 
 * Fetches the student's attendance records
 * 
 * @returns {Promise<Array>} Array of attendance records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchAttendance())
 *   .unwrap()
 *   .then(attendance => console.log(attendance.length))
 *   .catch(error => console.error(error));
 */
export const fetchAttendance = createAsyncThunk(
  "student/fetchAttendance",
  async (_, thunkAPI) => {
    try {
      return await studentService.getAttendance();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH REPORT CARD
 * ============================================
 * 
 * Fetches the student's report card with grades
 * 
 * @returns {Promise<Object>} Report card data
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchReportCard())
 *   .unwrap()
 *   .then(reportCard => console.log(reportCard.grades))
 *   .catch(error => console.error(error));
 */
export const fetchReportCard = createAsyncThunk(
  "student/fetchReportCard",
  async (_, thunkAPI) => {
    try {
      return await studentService.getReportCard();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Assignments ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH ASSIGNMENTS
 * ============================================
 * 
 * Fetches all assignments for the student
 * 
 * @returns {Promise<Array>} Array of assignment objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchAssignments())
 *   .unwrap()
 *   .then(assignments => console.log(assignments.length))
 *   .catch(error => console.error(error));
 */
export const fetchAssignments = createAsyncThunk(
  "student/fetchAssignments",
  async (_, thunkAPI) => {
    try {
      return await studentService.getAssignments();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH SUBMISSIONS
 * ============================================
 * 
 * Fetches all submissions made by the student
 * 
 * @returns {Promise<Array>} Array of submission objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchSubmissions())
 *   .unwrap()
 *   .then(submissions => console.log(submissions.length))
 *   .catch(error => console.error(error));
 */
export const fetchSubmissions = createAsyncThunk(
  "student/fetchSubmissions",
  async (_, thunkAPI) => {
    try {
      return await studentService.getSubmissions();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);

/**
 * ============================================
 * SUBMIT ASSIGNMENT
 * ============================================
 * 
 * Submits an assignment with file and comments
 * Refetches assignments after successful submission
 * 
 * @param {Object} submissionData - Submission data
 * @param {number} submissionData.assignmentId - Assignment ID
 * @param {string} submissionData.file_url - URL of the submitted file
 * @param {string} submissionData.comment - Optional comment
 * @returns {Promise<Object>} Created submission
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(submitAssignment({
 *   assignmentId: 1,
 *   file_url: 'https://storage.com/file.pdf',
 *   comment: 'Please review my assignment'
 * }))
 *   .unwrap()
 *   .then(() => console.log('Assignment submitted!'))
 *   .catch(error => console.error(error));
 */
export const submitAssignment = createAsyncThunk(
  "student/submitAssignment",
  async (submissionData, thunkAPI) => {
    try {
      const response = await studentService.submitAssignment(submissionData);
      thunkAPI.dispatch(fetchAssignments());
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * UPDATE SUBMISSION
 * ============================================
 * 
 * Updates an existing submission (e.g., replacing file)
 * Refetches assignments and submissions after successful update
 * 
 * @param {Object} params - Update parameters
 * @param {number} params.id - Submission ID
 * @param {Object} params.submissionData - Updated submission data
 * @returns {Promise<Object>} Updated submission
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(updateSubmission({
 *   id: 1,
 *   submissionData: {
 *     file_url: 'https://storage.com/updated-file.pdf'
 *   }
 * }))
 *   .unwrap()
 *   .then(() => console.log('Submission updated!'))
 *   .catch(error => console.error(error));
 */
export const updateSubmission = createAsyncThunk(
  "student/updateSubmission",
  async ({ id, submissionData }, thunkAPI) => {
    try {
      const response = await studentService.updateSubmission(id, submissionData);
      thunkAPI.dispatch(fetchAssignments());
      thunkAPI.dispatch(fetchSubmissions());
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

/**
 * ============================================
 * DELETE SUBMISSION
 * ============================================
 * 
 * Deletes a submission by ID
 * Refetches assignments and submissions after successful deletion
 * 
 * @param {number} id - Submission ID
 * @returns {Promise<number>} Deleted submission ID
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(deleteSubmission(1))
 *   .unwrap()
 *   .then(id => console.log(`Submission ${id} deleted`))
 *   .catch(error => console.error(error));
 */
export const deleteSubmission = createAsyncThunk(
  "student/deleteSubmission",
  async (id, thunkAPI) => {
    try {
      await studentService.deleteSubmission(id);
      thunkAPI.dispatch(fetchAssignments());
      thunkAPI.dispatch(fetchSubmissions());
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

// ─── Finance ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH FEES
 * ============================================
 * 
 * Fetches all fee records for the student
 * 
 * @returns {Promise<Array>} Array of fee objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchFees())
 *   .unwrap()
 *   .then(fees => console.log(fees.length))
 *   .catch(error => console.error(error));
 */
export const fetchFees = createAsyncThunk(
  "student/fetchFees",
  async (_, thunkAPI) => {
    try {
      return await studentService.getFees();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH PAYMENTS
 * ============================================
 * 
 * Fetches all payment history for the student
 * 
 * @returns {Promise<Array>} Array of payment objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchPayments())
 *   .unwrap()
 *   .then(payments => console.log(payments.length))
 *   .catch(error => console.error(error));
 */
export const fetchPayments = createAsyncThunk(
  "student/fetchPayments",
  async (_, thunkAPI) => {
    try {
      return await studentService.getPayments();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * CREATE PAYMENT INTENT
 * ============================================
 * 
 * Creates a Stripe payment intent for a fee
 * 
 * @param {Object} paymentData - Payment data
 * @param {number} paymentData.fee_id - Fee ID to pay
 * @returns {Promise<Object>} Payment intent with client_secret
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createPaymentIntent({ fee_id: 1 }))
 *   .unwrap()
 *   .then(intent => console.log(intent.client_secret))
 *   .catch(error => console.error(error));
 */
export const createPaymentIntent = createAsyncThunk(
  "student/createPaymentIntent",
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.createPaymentIntent(paymentData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// ─── Events ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH EVENTS
 * ============================================
 * 
 * Fetches all upcoming events
 * 
 * @returns {Promise<Array>} Array of event objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchEvents())
 *   .unwrap()
 *   .then(events => console.log(events.length))
 *   .catch(error => console.error(error));
 */
export const fetchEvents = createAsyncThunk(
  "student/fetchEvents",
  async (_, thunkAPI) => {
    try {
      return await studentService.getEvents();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH PARTICIPATIONS
 * ============================================
 * 
 * Fetches all event participations for the student
 * 
 * @returns {Promise<Array>} Array of participation objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchParticipations())
 *   .unwrap()
 *   .then(participations => console.log(participations.length))
 *   .catch(error => console.error(error));
 */
export const fetchParticipations = createAsyncThunk(
  "student/fetchParticipations",
  async (_, thunkAPI) => {
    try {
      return await studentService.getParticipations();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH CERTIFICATES
 * ============================================
 * 
 * Fetches all certificates earned by the student
 * 
 * @returns {Promise<Array>} Array of certificate objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchCertificates())
 *   .unwrap()
 *   .then(certificates => console.log(certificates.length))
 *   .catch(error => console.error(error));
 */
export const fetchCertificates = createAsyncThunk(
  "student/fetchCertificates",
  async (_, { rejectWithValue }) => {
    try {
      const data = await studentService.getCertificates();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

// ─── Complaints ──────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH COMPLAINTS
 * ============================================
 * 
 * Fetches all complaints filed by the student
 * 
 * @returns {Promise<Array>} Array of complaint objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchComplaints())
 *   .unwrap()
 *   .then(complaints => console.log(complaints.length))
 *   .catch(error => console.error(error));
 */
export const fetchComplaints = createAsyncThunk(
  "student/fetchComplaints",
  async (_, thunkAPI) => {
    try {
      return await studentService.getComplaints();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * CREATE COMPLAINT
 * ============================================
 * 
 * Creates a new complaint
 * Refetches complaints after successful creation
 * 
 * @param {Object} complaintData - Complaint data
 * @param {string} complaintData.complaint_type - Type of complaint
 * @param {string} complaintData.description - Complaint description
 * @param {string} complaintData.against_user - User being complained about
 * @returns {Promise<Object>} Created complaint
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createComplaint({
 *   complaint_type: 'Academic',
 *   description: 'Teacher is not grading assignments on time',
 *   against_user: 'Mr. Smith'
 * }))
 *   .unwrap()
 *   .then(() => console.log('Complaint created!'))
 *   .catch(error => console.error(error));
 */
export const createComplaint = createAsyncThunk(
  "student/createComplaint",
  async (complaintData, thunkAPI) => {
    try {
      const response = await studentService.createComplaint(complaintData);
      thunkAPI.dispatch(fetchComplaints());
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * UPDATE COMPLAINT
 * ============================================
 * 
 * Updates an existing complaint
 * Refetches complaints after successful update
 * 
 * @param {Object} params - Update parameters
 * @param {number} params.id - Complaint ID
 * @param {Object} params.complaintData - Updated complaint data
 * @returns {Promise<Object>} Updated complaint
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(updateComplaint({
 *   id: 1,
 *   complaintData: { status: 'Resolved' }
 * }))
 *   .unwrap()
 *   .then(() => console.log('Complaint updated!'))
 *   .catch(error => console.error(error));
 */
export const updateComplaint = createAsyncThunk(
  "student/updateComplaint",
  async ({ id, complaintData }, thunkAPI) => {
    try {
      const response = await studentService.updateComplaint(id, complaintData);
      thunkAPI.dispatch(fetchComplaints());
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Notifications ──────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH NOTIFICATIONS
 * ============================================
 * 
 * Fetches all notifications for the student
 * 
 * @returns {Promise<Array>} Array of notification objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchNotifications())
 *   .unwrap()
 *   .then(notifications => console.log(notifications.length))
 *   .catch(error => console.error(error));
 */
export const fetchNotifications = createAsyncThunk(
  "student/fetchNotifications",
  async (_, thunkAPI) => {
    try {
      return await studentService.getNotifications();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH UNREAD NOTIFICATIONS
 * ============================================
 * 
 * Fetches the count of unread notifications
 * 
 * @returns {Promise<number>} Number of unread notifications
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchUnreadNotifications())
 *   .unwrap()
 *   .then(count => console.log(`Unread: ${count}`))
 *   .catch(error => console.error(error));
 */
export const fetchUnreadNotifications = createAsyncThunk(
  "student/fetchUnreadNotifications",
  async (_, thunkAPI) => {
    try {
      return await studentService.getUnreadNotifications();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * MARK NOTIFICATION READ
 * ============================================
 * 
 * Marks a single notification as read
 * Refetches notifications and unread count after success
 * 
 * @param {number} notificationId - Notification ID
 * @returns {Promise<number>} Notification ID
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(markNotificationRead(5))
 *   .unwrap()
 *   .then(id => console.log(`Notification ${id} marked as read`))
 *   .catch(error => console.error(error));
 */
export const markNotificationRead = createAsyncThunk(
  "student/markNotificationRead",
  async (notificationId, thunkAPI) => {
    try {
      await studentService.markNotificationRead(notificationId);
      thunkAPI.dispatch(fetchNotifications());
      thunkAPI.dispatch(fetchUnreadNotifications());
      return notificationId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * MARK ALL NOTIFICATIONS READ
 * ============================================
 * 
 * Marks all notifications as read
 * Refetches notifications and unread count after success
 * 
 * @returns {Promise<void>}
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(markAllNotificationsRead())
 *   .unwrap()
 *   .then(() => console.log('All notifications marked as read'))
 *   .catch(error => console.error(error));
 */
export const markAllNotificationsRead = createAsyncThunk(
  "student/markAllNotificationsRead",
  async (_, thunkAPI) => {
    try {
      await studentService.markAllNotificationsRead();
      thunkAPI.dispatch(fetchNotifications());
      thunkAPI.dispatch(fetchUnreadNotifications());
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── AI Chat ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH CHAT SESSIONS
 * ============================================
 * 
 * Fetches all chat sessions for the student
 * 
 * @returns {Promise<Array>} Array of chat session objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchChatSessions())
 *   .unwrap()
 *   .then(sessions => console.log(sessions.length))
 *   .catch(error => console.error(error));
 */
export const fetchChatSessions = createAsyncThunk(
  "student/fetchChatSessions",
  async (_, thunkAPI) => {
    try {
      return await studentService.getChatSessions();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * FETCH CHAT MESSAGES
 * ============================================
 * 
 * Fetches all messages for a chat session
 * 
 * @param {number} sessionId - Session ID
 * @returns {Promise<Array>} Array of message objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchChatMessages(1))
 *   .unwrap()
 *   .then(messages => console.log(messages.length))
 *   .catch(error => console.error(error));
 */
export const fetchChatMessages = createAsyncThunk(
  "student/fetchChatMessages",
  async (sessionId, thunkAPI) => {
    try {
      return await studentService.getChatMessages(sessionId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * CREATE CHAT SESSION
 * ============================================
 * 
 * Creates a new chat session
 * Refetches chat sessions after successful creation
 * 
 * @param {Object} sessionData - Session data
 * @param {string} sessionData.title - Session title
 * @param {string} sessionData.bot_type - Bot type (general, etc.)
 * @returns {Promise<Object>} Created session
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createChatSession({
 *   title: 'Math Help',
 *   bot_type: 'tutor'
 * }))
 *   .unwrap()
 *   .then(session => console.log(`Session ${session.id} created`))
 *   .catch(error => console.error(error));
 */
export const createChatSession = createAsyncThunk(
  "student/createChatSession",
  async (sessionData, thunkAPI) => {
    try {
      const response = await studentService.createChatSession(sessionData);
      thunkAPI.dispatch(fetchChatSessions());
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * DELETE CHAT SESSION
 * ============================================
 * 
 * Deletes a chat session by ID
 * Refetches chat sessions after successful deletion
 * 
 * @param {number} sessionId - Session ID
 * @returns {Promise<number>} Deleted session ID
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(deleteChatSession(1))
 *   .unwrap()
 *   .then(id => console.log(`Session ${id} deleted`))
 *   .catch(error => console.error(error));
 */
export const deleteChatSession = createAsyncThunk(
  "student/deleteChatSession",
  async (sessionId, thunkAPI) => {
    try {
      await studentService.deleteChatSession(sessionId);
      thunkAPI.dispatch(fetchChatSessions());
      return sessionId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);