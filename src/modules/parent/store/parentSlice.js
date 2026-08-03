/**
 * ============================================
 * PARENT SLICE
 * ============================================
 * 
 * Purpose: Redux slice for parent module state management
 * Used by: All parent components and pages
 * 
 * Features:
 * - Profile management
 * - Parent-Student links management
 * - Child selection
 * - Academics (attendance, grades, behavior logs, submissions, certificates)
 * - Finance (fees, payments, payment intents)
 * - Communication (notifications, complaints)
 * - Events participation
 * - AI Chat sessions and messages
 * - Loading and error states
 * - Term filtering for grades
 * 
 * Dependencies:
 * - @reduxjs/toolkit for slice creation
 * - parentThunks for async actions
 * 
 * State Structure:
 * - profile: Object
 * - parentLinks: Array
 * - selectedChild: number|null
 * - selectedTerm: string
 * - attendance: Array
 * - grades: Array
 * - behaviorLogs: Array
 * - selectedBehavior: Object|null
 * - behaviorFilters: { severity, search }
 * - submissions: Array
 * - certificates: Array
 * - fees: Array
 * - payments: Array
 * - selectedFee: Object|null
 * - paymentIntent: Object|null
 * - notifications: Array
 * - complaints: Array
 * - events: Array
 * - chatSessions: Array
 * - chatMessages: Array
 * - loading: Boolean
 * - error: String|null
 * ============================================
 */

import { createSlice } from "@reduxjs/toolkit";

import {
  fetchProfile,
  fetchParentLinks,
  fetchAttendance,
  fetchGrades,
  fetchBehaviorLogs,
  fetchFees,
  fetchPayments,
  fetchNotifications,
  fetchComplaints,
  fetchEvents,
  fetchCertificates,
  fetchSubmissions,
  fetchChatSessions,
  fetchChatMessages,
  createComplaint,
  createChatSession,
  createChatMessage,
  createPaymentIntent,
} from "./parentThunks";

/**
 * ============================================
 * INITIAL STATE
 * ============================================
 * 
 * Default state for the parent slice
 */
const initialState = {
  // ─── Profile ──────────────────────────────────────────────────────
  profile: {},

  // ─── Parent Links ──────────────────────────────────────────────
  parentLinks: [],
  selectedChild: null,
  selectedTerm: "All",

  // ─── Academics ──────────────────────────────────────────────────
  attendance: [],
  grades: [],
  behaviorLogs: [],
  selectedBehavior: null,
  behaviorFilters: {
    severity: "All",
    search: "",
  },
  submissions: [],
  certificates: [],

  // ─── Finance ──────────────────────────────────────────────────────
  fees: [],
  payments: [],
  selectedFee: null,
  paymentIntent: null,

  // ─── Communication ──────────────────────────────────────────────
  notifications: [],
  complaints: [],

  // ─── Events ──────────────────────────────────────────────────────
  events: [],

  // ─── Chat ──────────────────────────────────────────────────────
  chatSessions: [],
  chatMessages: [],

  // ─── UI State ──────────────────────────────────────────────────
  loading: false,
  error: null,
};

/**
 * ============================================
 * PARENT SLICE
 * ============================================
 * 
 * Contains reducers and actions for parent state management
 */
const parentSlice = createSlice({
  name: "parent",
  initialState,

  reducers: {
    // ─── Child Management ──────────────────────────────────────────

    /**
     * ============================================
     * SET SELECTED CHILD
     * ============================================
     * 
     * Sets the currently selected child ID
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with child ID payload
     */
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },

    /**
     * ============================================
     * SET SELECTED TERM
     * ============================================
     * 
     * Sets the currently selected term for grade filtering
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with term payload
     */
    setSelectedTerm: (state, action) => {
      state.selectedTerm = action.payload;
    },

    // ─── Finance ──────────────────────────────────────────────────

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
    setSelectedFee: (state, action) => {
      state.selectedFee = action.payload;
    },

    /**
     * ============================================
     * CLEAR PAYMENT INTENT
     * ============================================
     * 
     * Clears the current payment intent
     * 
     * @param {Object} state - Current state
     */
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },

    /**
     * ============================================
     * CLEAR SELECTED FEE
     * ============================================
     * 
     * Clears the currently selected fee
     * 
     * @param {Object} state - Current state
     */
    clearSelectedFee: (state) => {
      state.selectedFee = null;
    },

    // ─── Behavior Logs ────────────────────────────────────────────

    /**
     * ============================================
     * SET SELECTED BEHAVIOR
     * ============================================
     * 
     * Sets the currently selected behavior log
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with behavior log payload
     */
    setSelectedBehavior: (state, action) => {
      state.selectedBehavior = action.payload;
    },

    /**
     * ============================================
     * SET BEHAVIOR FILTERS
     * ============================================
     * 
     * Updates behavior log filters
     * 
     * @param {Object} state - Current state
     * @param {Object} action - Action with filter updates
     */
    setBehaviorFilters: (state, action) => {
      state.behaviorFilters = {
        ...state.behaviorFilters,
        ...action.payload,
      };
    },

    /**
     * ============================================
     * RESET BEHAVIOR FILTERS
     * ============================================
     * 
     * Resets behavior log filters to default values
     * 
     * @param {Object} state - Current state
     */
    resetBehaviorFilters: (state) => {
      state.behaviorFilters = {
        severity: "All",
        search: "",
      };
    },

    // ─── Reset State ──────────────────────────────────────────────

    /**
     * ============================================
     * CLEAR PARENT STATE
     * ============================================
     * 
     * Resets the entire parent state to initial values
     * 
     * @returns {Object} Initial state
     */
    clearParentState: () => initialState,
  },

  /**
   * ============================================
   * EXTRA REDUCERS
   * ============================================
   * 
   * Handles async thunk actions for API calls
   */
  extraReducers: (builder) => {
    // ─── Profile ──────────────────────────────────────────────────

    /**
     * Fetch profile - fulfilled
     * Sets profile data
     */
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });

    // ─── Parent Links ──────────────────────────────────────────────

    /**
     * Fetch parent links - fulfilled
     * Sets parent links and auto-selects first child if none selected
     */
    builder.addCase(fetchParentLinks.fulfilled, (state, action) => {
      state.loading = false;
      state.parentLinks = action.payload;

      if (!state.selectedChild && action.payload.length) {
        state.selectedChild = action.payload[0].student;
      }
    });

    // ─── Academics ──────────────────────────────────────────────────

    /**
     * Fetch attendance - fulfilled
     * Sets attendance records
     */
    builder.addCase(fetchAttendance.fulfilled, (state, action) => {
      state.loading = false;
      state.attendance = action.payload;
    });

    /**
     * Fetch grades - fulfilled
     * Sets grade records
     */
    builder.addCase(fetchGrades.fulfilled, (state, action) => {
      state.loading = false;
      state.grades = action.payload;
    });

    /**
     * Fetch behavior logs - fulfilled
     * Sets behavior log records
     */
    builder.addCase(fetchBehaviorLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.behaviorLogs = action.payload;
    });

    // ─── Finance ──────────────────────────────────────────────────

    /**
     * Fetch fees - fulfilled
     * Sets fee records
     */
    builder.addCase(fetchFees.fulfilled, (state, action) => {
      state.loading = false;
      state.fees = action.payload;
    });

    /**
     * Fetch payments - fulfilled
     * Sets payment records
     */
    builder.addCase(fetchPayments.fulfilled, (state, action) => {
      state.loading = false;
      state.payments = action.payload;
    });

    /**
     * Create payment intent - fulfilled
     * Sets payment intent
     */
    builder.addCase(createPaymentIntent.fulfilled, (state, action) => {
      state.loading = false;
      state.paymentIntent = action.payload;
    });

    // ─── Communication ──────────────────────────────────────────────

    /**
     * Fetch notifications - fulfilled
     * Sets notification records
     */
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
    });

    /**
     * Fetch complaints - fulfilled
     * Sets complaint records
     */
    builder.addCase(fetchComplaints.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints = action.payload;
    });

    /**
     * Create complaint - fulfilled
     * Adds new complaint to the beginning of the list
     */
    builder.addCase(createComplaint.fulfilled, (state, action) => {
      state.loading = false;
      state.complaints.unshift(action.payload);
    });

    // ─── Events ──────────────────────────────────────────────────

    /**
     * Fetch events - fulfilled
     * Sets event participation records
     */
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.loading = false;
      state.events = action.payload;
    });

    // ─── Certificates ──────────────────────────────────────────────

    /**
     * Fetch certificates - fulfilled
     * Sets certificate records
     */
    builder.addCase(fetchCertificates.fulfilled, (state, action) => {
      state.loading = false;
      state.certificates = action.payload;
    });

    // ─── Assignment Submissions ──────────────────────────────────

    /**
     * Fetch submissions - fulfilled
     * Sets submission records
     */
    builder.addCase(fetchSubmissions.fulfilled, (state, action) => {
      state.loading = false;
      state.submissions = action.payload;
    });

    // ─── Chat ──────────────────────────────────────────────────

    /**
     * Fetch chat sessions - fulfilled
     * Sets chat session records
     */
    builder.addCase(fetchChatSessions.fulfilled, (state, action) => {
      state.loading = false;
      state.chatSessions = action.payload;
    });

    /**
     * Create chat session - fulfilled
     * Adds new session to the beginning of the list
     */
    builder.addCase(createChatSession.fulfilled, (state, action) => {
      state.loading = false;
      state.chatSessions.unshift(action.payload);
    });

    /**
     * Fetch chat messages - fulfilled
     * Sets chat message records
     */
    builder.addCase(fetchChatMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.chatMessages = action.payload;
    });

    /**
     * Create chat message - fulfilled
     * Adds new message to the end of the list
     */
    builder.addCase(createChatMessage.fulfilled, (state, action) => {
      state.loading = false;
      state.chatMessages.push(action.payload);
    });

    // ─── Generic Matchers ─────────────────────────────────────────────

    /**
     * Matches any pending parent action
     * Sets loading state and clears errors
     */
    builder.addMatcher(
      (action) => action.type.startsWith("parent/") && action.type.endsWith("/pending"),
      (state) => {
        state.loading = true;
        state.error = null;
      }
    );

    /**
     * Matches any rejected parent action
     * Clears loading state and sets error message
     */
    builder.addMatcher(
      (action) => action.type.startsWith("parent/") && action.type.endsWith("/rejected"),
      (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }
    );
  },
});

// ─── Export Actions ──────────────────────────────────────────────────────

export const {
  setSelectedChild,
  setSelectedTerm,
  setSelectedFee,
  clearPaymentIntent,
  setSelectedBehavior,
  setBehaviorFilters,
  resetBehaviorFilters,
  clearSelectedFee,
  clearParentState,
} = parentSlice.actions;

// ─── Export Reducer ──────────────────────────────────────────────────────

export default parentSlice.reducer;