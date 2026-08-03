/**
 * ============================================
 * STUDENT SLICE
 * ============================================
 * 
 * Purpose: Redux slice for student module state management
 * Used by: All student components and pages
 * 
 * Features:
 * - Dashboard statistics
 * - Profile management
 * - Academics (attendance, report card, assignments, submissions)
 * - Finance (fees, payments, payment intents)
 * - Timetable & Events
 * - Complaints
 * - Notifications
 * - AI Chat sessions and messages
 * - Loading and error states
 * 
 * Dependencies:
 * - @reduxjs/toolkit for slice creation
 * - studentThunks for async actions
 * 
 * State Structure:
 * - dashboard: { attendancePercentage, pendingAssignments, feeDue, unreadNotifications }
 * - profile: Object
 * - attendance: Array
 * - reportCard: Object
 * - assignments: Array
 * - submissions: Array
 * - fees: Array
 * - payments: Array
 * - selectedFee: Object|null
 * - paymentIntent: Object|null
 * - timetable: Array
 * - events: Array
 * - participations: Array
 * - certificates: Array
 * - complaints: Array
 * - notifications: Array
 * - unreadCount: Number
 * - chatSessions: Array
 * - activeSession: Number|null
 * - chatMessages: Array
 * - loading: Boolean
 * - submitting: Boolean
 * - error: String|null
 * - successMessage: String|null
 * ============================================
 */

import { createSlice } from "@reduxjs/toolkit";
import * as studentThunks from "./studentThunks";

/**
 * ============================================
 * INITIAL STATE
 * ============================================
 * 
 * Default state for the student slice
 */
const initialState = {
  // ─── Dashboard ──────────────────────────────────────────────────────
  dashboard: {
    attendancePercentage: 0,
    pendingAssignments: 0,
    feeDue: 0,
    unreadNotifications: 0,
  },

  // ─── Profile ──────────────────────────────────────────────────────
  profile: null,

  // ─── Academics ──────────────────────────────────────────────────
  attendance: [],
  reportCard: null,
  assignments: [],
  submissions: [],

  // ─── Finance ──────────────────────────────────────────────────────
  fees: [],
  payments: [],
  selectedFee: null,
  paymentIntent: null,

  // ─── Timetable & Events ────────────────────────────────────────
  timetable: [],
  events: [],
  participations: [],
  certificates: [],

  // ─── Complaints ──────────────────────────────────────────────────
  complaints: [],

  // ─── Notifications ──────────────────────────────────────────────
  notifications: [],
  unreadCount: 0,

  // ─── AI Chat ──────────────────────────────────────────────────────
  chatSessions: [],
  activeSession: null,
  chatMessages: [],

  // ─── UI State ──────────────────────────────────────────────────
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

/**
 * ============================================
 * STUDENT SLICE
 * ============================================
 * 
 * Contains reducers and actions for student state management
 */
const studentSlice = createSlice({
  name: "student",
  initialState,

  reducers: {
    // ─── AI Chat Reducers ────────────────────────────────────────────

    /**
     * ============================================
     * SET SELECTED FEE
     * ============================================
     * 
     * Sets the currently selected fee for payment
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with fee payload
     */
    setSelectedFee(state, action) {
      state.selectedFee = action.payload;
    },

    /**
     * ============================================
     * SET ACTIVE SESSION
     * ============================================
     * 
     * Sets the active chat session ID
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with session ID payload
     */
    setActiveSession(state, action) {
      state.activeSession = action.payload;
    },

    /**
     * ============================================
     * APPEND MESSAGE
     * ============================================
     * 
     * Adds a new message to the chat messages array
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with message payload
     */
    appendMessage(state, action) {
      state.chatMessages.push(action.payload);
    },

    /**
     * ============================================
     * CLEAR CHAT MESSAGES
     * ============================================
     * 
     * Clears all chat messages
     * 
     * @param {Object} state - Current state
     */
    clearChatMessages(state) {
      state.chatMessages = [];
    },

    // ─── Reset State ──────────────────────────────────────────────────

    /**
     * ============================================
     * CLEAR STUDENT STATE
     * ============================================
     * 
     * Resets the entire student state to initial values
     * 
     * @returns {Object} Initial state
     */
    clearStudentState() {
      return initialState;
    },

    /**
     * ============================================
     * CLEAR STUDENT ERROR
     * ============================================
     * 
     * Clears the current error message
     * 
     * @param {Object} state - Current state
     */
    clearStudentError(state) {
      state.error = null;
    },

    /**
     * ============================================
     * CLEAR SUCCESS MESSAGE
     * ============================================
     * 
     * Clears the current success message
     * 
     * @param {Object} state - Current state
     */
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
  },

  /**
   * ============================================
   * EXTRA REDUCERS
   * ============================================
   * 
   * Handles async thunk actions for API calls
   */
  extraReducers: (builder) => {
    builder
      // ─── Profile ──────────────────────────────────────────────────────

      /**
       * Fetch profile - fulfilled
       * Sets profile data
       */
      .addCase(studentThunks.fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      // ─── Attendance ──────────────────────────────────────────────────

      /**
       * Fetch attendance - fulfilled
       * Sets attendance records
       */
      .addCase(studentThunks.fetchAttendance.fulfilled, (state, action) => {
        state.attendance = action.payload;
      })

      // ─── Report Card ──────────────────────────────────────────────────

      /**
       * Fetch report card - fulfilled
       * Sets report card data
       */
      .addCase(studentThunks.fetchReportCard.fulfilled, (state, action) => {
        state.reportCard = action.payload;
      })

      // ─── Assignments ──────────────────────────────────────────────────

      /**
       * Fetch assignments - fulfilled
       * Sets assignments list
       */
      .addCase(studentThunks.fetchAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
      })

      /**
       * Fetch submissions - fulfilled
       * Sets submissions list
       */
      .addCase(studentThunks.fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })

      /**
       * Delete submission - fulfilled
       * Removes the deleted submission from the list
       */
      .addCase(studentThunks.deleteSubmission.fulfilled, (state, action) => {
        state.submissions = state.submissions.filter(
          (submission) => submission.id !== action.payload
        );
      })

      // ─── Finance ──────────────────────────────────────────────────────

      /**
       * Fetch fees - fulfilled
       * Sets fees list
       */
      .addCase(studentThunks.fetchFees.fulfilled, (state, action) => {
        state.fees = action.payload;
      })

      /**
       * Fetch payments - fulfilled
       * Sets payments list
       */
      .addCase(studentThunks.fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
      })

      /**
       * Create payment intent - fulfilled
       * Sets payment intent and success message
       */
      .addCase(studentThunks.createPaymentIntent.fulfilled, (state, action) => {
        state.paymentIntent = action.payload;
        state.successMessage = "Payment initialized successfully.";
      })

      // ─── Events ──────────────────────────────────────────────────────

      /**
       * Fetch events - fulfilled
       * Sets events list
       */
      .addCase(studentThunks.fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
      })

      /**
       * Fetch participations - fulfilled
       * Sets participations list
       */
      .addCase(studentThunks.fetchParticipations.fulfilled, (state, action) => {
        state.participations = action.payload;
      })

      /**
       * Fetch certificates - fulfilled
       * Sets certificates list
       */
      .addCase(studentThunks.fetchCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
      })

      // ─── Complaints ──────────────────────────────────────────────────

      /**
       * Fetch complaints - fulfilled
       * Sets complaints list
       */
      .addCase(studentThunks.fetchComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload;
      })

      /**
       * Create complaint - fulfilled
       * Sets success message
       */
      .addCase(studentThunks.createComplaint.fulfilled, (state) => {
        state.successMessage = "Complaint submitted successfully.";
      })

      /**
       * Update complaint - fulfilled
       * Sets success message
       */
      .addCase(studentThunks.updateComplaint.fulfilled, (state) => {
        state.successMessage = "Complaint updated successfully.";
      })

      // ─── Notifications ──────────────────────────────────────────────────

      /**
       * Fetch notifications - fulfilled
       * Sets notifications list
       */
      .addCase(studentThunks.fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })

      /**
       * Fetch unread notifications - fulfilled
       * Sets unread count
       */
      .addCase(studentThunks.fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      /**
       * Mark notification read - fulfilled
       * Updates notification read status and decrements unread count
       */
      .addCase(studentThunks.markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (item) => item.id === action.payload
        );

        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      /**
       * Mark all notifications read - fulfilled
       * Marks all notifications as read and resets unread count
       */
      .addCase(studentThunks.markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((item) => ({
          ...item,
          is_read: true,
        }));
        state.unreadCount = 0;
      })

      // ─── AI Chat ──────────────────────────────────────────────────────

      /**
       * Fetch chat sessions - fulfilled
       * Sets chat sessions list
       */
      .addCase(studentThunks.fetchChatSessions.fulfilled, (state, action) => {
        state.chatSessions = action.payload;
      })

      /**
       * Fetch chat messages - fulfilled
       * Sets chat messages list
       */
      .addCase(studentThunks.fetchChatMessages.fulfilled, (state, action) => {
        state.chatMessages = action.payload;
      })

      /**
       * Create chat session - fulfilled
       * Sets active session ID
       */
      .addCase(studentThunks.createChatSession.fulfilled, (state, action) => {
        state.activeSession = action.payload.id;
      })

      /**
       * Delete chat session - fulfilled
       * Clears active session and messages if deleted
       */
      .addCase(studentThunks.deleteChatSession.fulfilled, (state, action) => {
        if (state.activeSession === action.payload) {
          state.activeSession = null;
          state.chatMessages = [];
        }
      })

      // ─── Assignment Submission ──────────────────────────────────────

      /**
       * Submit assignment - fulfilled
       * Sets success message
       */
      .addCase(studentThunks.submitAssignment.fulfilled, (state) => {
        state.successMessage = "Assignment submitted successfully.";
      })

      // ─── Generic Matchers ─────────────────────────────────────────────

      /**
       * Matches any pending fetch action
       * Sets loading state
       */
      .addMatcher(
        (action) => action.type.startsWith("student/fetch") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      /**
       * Matches any pending submit action
       * Sets submitting state
       */
      .addMatcher(
        (action) =>
          action.type.startsWith("student/") &&
          !action.type.includes("fetch") &&
          action.type.endsWith("/pending"),
        (state) => {
          state.submitting = true;
          state.error = null;
          state.successMessage = null;
        }
      )

      /**
       * Matches any fulfilled student action
       * Clears loading and submitting states
       */
      .addMatcher(
        (action) => action.type.startsWith("student/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.submitting = false;
        }
      )

      /**
       * Matches any rejected student action
       * Sets error message and clears loading/submitting states
       */
      .addMatcher(
        (action) => action.type.startsWith("student/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.submitting = false;
          state.error = action.payload || "Something went wrong.";
        }
      );
  },
});

// ─── Export Actions ──────────────────────────────────────────────────────

export const {
  setSelectedFee,
  setActiveSession,
  appendMessage,
  clearChatMessages,
  clearStudentState,
  clearStudentError,
  clearSuccessMessage,
} = studentSlice.actions;

// ─── Export Reducer ──────────────────────────────────────────────────────

export default studentSlice.reducer;