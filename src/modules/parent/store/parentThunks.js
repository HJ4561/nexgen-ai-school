/**
 * ============================================
 * PARENT THUNKS
 * ============================================
 * 
 * Purpose: Async thunks for parent module API calls
 * Used by: parentSlice for state management
 * 
 * Features:
 * - Profile management
 * - Parent-Student links management (CRUD)
 * - Attendance tracking
 * - Grade management
 * - Behavior log management
 * - Fee and payment management
 * - Notification management
 * - Complaint management (fetch, create)
 * - Event participation tracking
 * - Certificate management
 * - Assignment submissions
 * - AI Chat sessions and messages (CRUD)
 * 
 * Dependencies:
 * - @reduxjs/toolkit for createAsyncThunk
 * - @/modules/parent/services/parentService for parent API calls
 * - @/modules/payments/services/paymentService for payment API calls
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
 * - /finance/stripe/create-payment-intent
 * ============================================
 */

import { createAsyncThunk } from "@reduxjs/toolkit";

import parentService from "@/modules/parent/services/parentService";
import paymentService from "@/modules/payments/services/paymentService";

// ─── Profile ──────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH PROFILE
 * ============================================
 * 
 * Fetches the authenticated parent's profile information
 * 
 * @returns {Promise<Object>} Parent profile data
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchProfile())
 *   .unwrap()
 *   .then(profile => console.log(profile.full_name))
 *   .catch(error => console.error(error));
 */
export const fetchProfile = createAsyncThunk(
  "parent/fetchProfile",
  async (_, thunkAPI) => {
    try {
      return await parentService.getProfile();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Parent-Student Links ──────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH PARENT LINKS
 * ============================================
 * 
 * Fetches all parent-student links for the authenticated parent
 * 
 * @returns {Promise<Array>} Array of parent-student link objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchParentLinks())
 *   .unwrap()
 *   .then(links => console.log(links.length))
 *   .catch(error => console.error(error));
 */
export const fetchParentLinks = createAsyncThunk(
  "parent/fetchParentLinks",
  async (_, thunkAPI) => {
    try {
      return await parentService.getParentLinks();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

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
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createParentLink({
 *   relation: 'Father',
 *   roll_number: '2024-CS-021'
 * }))
 *   .unwrap()
 *   .then(link => console.log('Link created:', link))
 *   .catch(error => console.error(error));
 */
export const createParentLink = createAsyncThunk(
  "parent/createParentLink",
  async (data, thunkAPI) => {
    try {
      return await parentService.createParentLink(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * UPDATE PARENT LINK
 * ============================================
 * 
 * Updates an existing parent-student link
 * 
 * @param {Object} params - Update parameters
 * @param {number} params.id - Link ID
 * @param {Object} params.data - Updated link data
 * @returns {Promise<Object>} Updated link
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(updateParentLink({
 *   id: 1,
 *   data: { relation: 'Guardian' }
 * }))
 *   .unwrap()
 *   .then(link => console.log('Link updated:', link))
 *   .catch(error => console.error(error));
 */
export const updateParentLink = createAsyncThunk(
  "parent/updateParentLink",
  async ({ id, data }, thunkAPI) => {
    try {
      return await parentService.updateParentLink(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * PATCH PARENT LINK
 * ============================================
 * 
 * Partially updates an existing parent-student link
 * 
 * @param {Object} params - Patch parameters
 * @param {number} params.id - Link ID
 * @param {Object} params.data - Partial link data
 * @returns {Promise<Object>} Updated link
 * @throws {string} Error message from API
 */
export const patchParentLink = createAsyncThunk(
  "parent/patchParentLink",
  async ({ id, data }, thunkAPI) => {
    try {
      return await parentService.patchParentLink(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

/**
 * ============================================
 * DELETE PARENT LINK
 * ============================================
 * 
 * Deletes a parent-student link by ID
 * 
 * @param {number} id - Link ID
 * @returns {Promise<Object>} Deletion confirmation
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(deleteParentLink(1))
 *   .unwrap()
 *   .then(() => console.log('Link deleted'))
 *   .catch(error => console.error(error));
 */
export const deleteParentLink = createAsyncThunk(
  "parent/deleteParentLink",
  async (id, thunkAPI) => {
    try {
      return await parentService.deleteParentLink(id);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Attendance ────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH ATTENDANCE
 * ============================================
 * 
 * Fetches attendance records for all children
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
  "parent/fetchAttendance",
  async (_, thunkAPI) => {
    try {
      return await parentService.getAttendance();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Grades ─────────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH GRADES
 * ============================================
 * 
 * Fetches grade records for all children
 * 
 * @returns {Promise<Array>} Array of grade records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchGrades())
 *   .unwrap()
 *   .then(grades => console.log(grades.length))
 *   .catch(error => console.error(error));
 */
export const fetchGrades = createAsyncThunk(
  "parent/fetchGrades",
  async (_, thunkAPI) => {
    try {
      return await parentService.getGrades();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Behavior Logs ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH BEHAVIOR LOGS
 * ============================================
 * 
 * Fetches behavior logs for all children
 * 
 * @returns {Promise<Array>} Array of behavior log records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchBehaviorLogs())
 *   .unwrap()
 *   .then(logs => console.log(logs.length))
 *   .catch(error => console.error(error));
 */
export const fetchBehaviorLogs = createAsyncThunk(
  "parent/fetchBehaviorLogs",
  async (_, thunkAPI) => {
    try {
      return await parentService.getBehaviorLogs();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Fees ───────────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH FEES
 * ============================================
 * 
 * Fetches fee records for all children
 * 
 * @returns {Promise<Array>} Array of fee records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchFees())
 *   .unwrap()
 *   .then(fees => console.log(fees.length))
 *   .catch(error => console.error(error));
 */
export const fetchFees = createAsyncThunk(
  "parent/fetchFees",
  async (_, thunkAPI) => {
    try {
      return await parentService.getFees();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Payments ───────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH PAYMENTS
 * ============================================
 * 
 * Fetches payment history for all children
 * 
 * @returns {Promise<Array>} Array of payment records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchPayments())
 *   .unwrap()
 *   .then(payments => console.log(payments.length))
 *   .catch(error => console.error(error));
 */
export const fetchPayments = createAsyncThunk(
  "parent/fetchPayments",
  async (_, thunkAPI) => {
    try {
      return await parentService.getPayments();
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
  "parent/createPaymentIntent",
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.createPaymentIntent(paymentData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// ─── Notifications ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH NOTIFICATIONS
 * ============================================
 * 
 * Fetches all notifications for the parent
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
  "parent/fetchNotifications",
  async (_, thunkAPI) => {
    try {
      return await parentService.getNotifications();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Complaints ─────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH COMPLAINTS
 * ============================================
 * 
 * Fetches all complaints filed by the parent
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
  "parent/fetchComplaints",
  async (_, thunkAPI) => {
    try {
      return await parentService.getComplaints();
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
 * 
 * @param {Object} data - Complaint data
 * @param {string} data.complaint_type - Type of complaint
 * @param {string} data.description - Complaint description
 * @param {string} data.against_user - User being complained about
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
  "parent/createComplaint",
  async (data, thunkAPI) => {
    try {
      return await parentService.createComplaint(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Events ─────────────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH EVENTS
 * ============================================
 * 
 * Fetches event participations for all children
 * 
 * @returns {Promise<Array>} Array of event participation records
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchEvents())
 *   .unwrap()
 *   .then(events => console.log(events.length))
 *   .catch(error => console.error(error));
 */
export const fetchEvents = createAsyncThunk(
  "parent/fetchEvents",
  async (_, thunkAPI) => {
    try {
      return await parentService.getEvents();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Certificates ───────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH CERTIFICATES
 * ============================================
 * 
 * Fetches all certificates earned by children
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
  "parent/fetchCertificates",
  async (_, thunkAPI) => {
    try {
      return await parentService.getCertificates();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Assignment Submissions ─────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH SUBMISSIONS
 * ============================================
 * 
 * Fetches all assignment submissions for children
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
  "parent/fetchSubmissions",
  async (_, thunkAPI) => {
    try {
      return await parentService.getSubmissions();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Chat Sessions ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH CHAT SESSIONS
 * ============================================
 * 
 * Fetches all chat sessions for the parent
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
  "parent/fetchChatSessions",
  async (_, thunkAPI) => {
    try {
      return await parentService.getChatSessions();
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
 * 
 * @param {Object} data - Session data
 * @param {string} data.title - Session title
 * @returns {Promise<Object>} Created session
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createChatSession({ title: 'Attendance Inquiry' }))
 *   .unwrap()
 *   .then(session => console.log('Session created:', session))
 *   .catch(error => console.error(error));
 */
export const createChatSession = createAsyncThunk(
  "parent/createChatSession",
  async (data, thunkAPI) => {
    try {
      return await parentService.createChatSession(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ─── Chat Messages ──────────────────────────────────────────────────────────────────

/**
 * ============================================
 * FETCH CHAT MESSAGES
 * ============================================
 * 
 * Fetches all chat messages
 * 
 * @returns {Promise<Array>} Array of chat message objects
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(fetchChatMessages())
 *   .unwrap()
 *   .then(messages => console.log(messages.length))
 *   .catch(error => console.error(error));
 */
export const fetchChatMessages = createAsyncThunk(
  "parent/fetchChatMessages",
  async (_, thunkAPI) => {
    try {
      return await parentService.getChatMessages();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

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
 * @throws {string} Error message from API
 * 
 * @example
 * dispatch(createChatMessage({
 *   session: 1,
 *   content: 'How many absences does my child have?'
 * }))
 *   .unwrap()
 *   .then(message => console.log('Message sent:', message))
 *   .catch(error => console.error(error));
 */
export const createChatMessage = createAsyncThunk(
  "parent/createChatMessage",
  async (data, thunkAPI) => {
    try {
      return await parentService.createChatMessage(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);