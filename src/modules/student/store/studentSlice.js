// src/modules/student/store/studentSlice.js

import { createSlice } from "@reduxjs/toolkit";
import * as studentThunks from "./studentThunks";

const initialState = {
  dashboard: {
    attendancePercentage: 0,
    pendingAssignments: 0,
    feeDue: 0,
    unreadNotifications: 0,
  },
  profile: null,
  attendance: [],
  behaviorLogs: [],
  reportCard: null,
  results: [],
  gradeScale: [],
  exams: [],
  assignments: [],
  submissions: [],
  fees: [],
  payments: [],
  feeHistory: [],
  selectedFee: null,
  paymentIntent: null,
  timetable: [],
  events: [],
  participations: [],
  certificates: [],
  complaints: [],
  notifications: [],
  unreadCount: 0,
  busStudents: [],
  transportAttendance: [],
  routes: [],
  bookIssues: [],
  bookIssueHistory: [],
  menuItems: [],
  orders: [],
  categories: [],
  entryExitLogs: [],
  documents: [],
  documentTypes: [],
  predictions: [],
  recommendations: [],
  studentGoals: [],
  studentSkills: [],
  skillMapping: [],
  chatSessions: [],
  activeSession: null,
  chatMessages: [],
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
  // ✅ NEW: Track profile update attempt
  profileUpdateAttempted: false,
};

const studentSlice = createSlice({
  name: "student",
  initialState,

  reducers: {
    setSelectedFee(state, action) {
      state.selectedFee = action.payload;
    },
    clearSelectedFee(state) {
      state.selectedFee = null;
    },
    setActiveSession(state, action) {
      state.activeSession = action.payload;
    },
    appendMessage(state, action) {
      state.chatMessages.push(action.payload);
    },
    clearChatMessages(state) {
      state.chatMessages = [];
    },
    clearPaymentIntent(state) {
      state.paymentIntent = null;
    },
    clearStudentState() {
      return initialState;
    },
    clearStudentError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
    updateDashboard(state, action) {
      state.dashboard = { ...state.dashboard, ...action.payload };
    },
    // ✅ NEW: Reset profile update flag
    resetProfileUpdateAttempt(state) {
      state.profileUpdateAttempted = false;
    },
  },

  extraReducers: (builder) => {
    builder
      // ─── Profile ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(studentThunks.fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })
      // ✅ UPDATED: Profile update now shows a message instead of updating
      .addCase(studentThunks.updateProfile.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(studentThunks.updateProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.profile = { ...state.profile, ...action.payload };
        state.successMessage = "Profile updated successfully.";
      })
      .addCase(studentThunks.updateProfile.rejected, (state, action) => {
        state.submitting = false;
        // Show a user-friendly message
        state.error = "Profile updates are managed by school administration. Please contact your school office for any changes.";
        state.profileUpdateAttempted = true;
      })
      // ✅ NEW: Password change
      .addCase(studentThunks.changePassword.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(studentThunks.changePassword.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = "Password changed successfully!";
      })
      .addCase(studentThunks.changePassword.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to change password";
      })

      // ─── Attendance ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
        const total = action.payload.length;
        const present = action.payload.filter(a => a.status?.toLowerCase() === "present").length;
        state.dashboard.attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;
      })
      .addCase(studentThunks.fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch attendance";
      })
      .addCase(studentThunks.fetchBehaviorLogs.fulfilled, (state, action) => {
        state.behaviorLogs = action.payload;
      })

      // ─── Report Card ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchReportCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchReportCard.fulfilled, (state, action) => {
        state.loading = false;
        state.reportCard = action.payload;
      })
      .addCase(studentThunks.fetchReportCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch report card";
      })

      // ─── Results ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        console.log("✅ Results updated in Redux:", state.results.length, "records");
      })
      .addCase(studentThunks.fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch results";
      })

      // ─── Grade Scale ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchGradeScale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchGradeScale.fulfilled, (state, action) => {
        state.loading = false;
        state.gradeScale = action.payload;
        console.log("✅ Grade Scale updated in Redux:", state.gradeScale.length, "records");
      })
      .addCase(studentThunks.fetchGradeScale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch grade scale";
      })

      // ─── Exams ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = action.payload;
        console.log("✅ Exams updated in Redux:", state.exams.length, "records");
      })
      .addCase(studentThunks.fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch exams";
        state.exams = [];
      })

      // ─── Timetable ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetable = action.payload || [];
      })
      .addCase(studentThunks.fetchTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch timetable";
      })

      // ─── Assignments ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        const data = Array.isArray(action.payload) ? action.payload : [];
        state.assignments = data;
        state.dashboard.pendingAssignments = data.filter(
          a => a.status === "pending" || a.status === "assigned" || a.status === "active"
        ).length;
        console.log("✅ Assignments updated in Redux:", state.assignments.length, "records");
      })
      .addCase(studentThunks.fetchAssignments.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.assignments = [];
        console.log("ℹ️ fetchAssignments returned empty (handled gracefully)");
      })

      // ─── Submissions ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(studentThunks.fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        const data = Array.isArray(action.payload) ? action.payload : [];
        state.submissions = data;
        console.log("✅ Submissions updated in Redux:", state.submissions.length, "records");
      })
      .addCase(studentThunks.fetchSubmissions.rejected, (state) => {
        state.loading = false;
        state.error = null;
        state.submissions = [];
        console.log("ℹ️ fetchSubmissions returned empty (handled gracefully)");
      })

      // ─── Submit Assignment ────────────────────────────────────────────
      .addCase(studentThunks.submitAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(studentThunks.submitAssignment.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = "Assignment submitted successfully!";
      })
      .addCase(studentThunks.submitAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to submit assignment";
      })

      .addCase(studentThunks.deleteSubmission.fulfilled, (state, action) => {
        state.submissions = state.submissions.filter(
          (submission) => submission.id !== action.payload
        );
        state.successMessage = "Submission deleted successfully.";
      })
      .addCase(studentThunks.updateSubmission.fulfilled, (state) => {
        state.successMessage = "Submission updated successfully.";
      })

      // ─── Finance ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchFees.fulfilled, (state, action) => {
        state.fees = action.payload || [];
        const pendingFees = (action.payload || []).filter(f => f.status === "pending" || f.status === "overdue");
        state.dashboard.feeDue = pendingFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      })
      .addCase(studentThunks.fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload || [];
      })
      .addCase(studentThunks.fetchFeeHistory.fulfilled, (state, action) => {
        state.feeHistory = action.payload || [];
      })
      .addCase(studentThunks.createPaymentIntent.fulfilled, (state, action) => {
        state.paymentIntent = action.payload;
        state.successMessage = "Payment initialized successfully.";
      })

      // ─── Events ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload || [];
      })
      .addCase(studentThunks.fetchParticipations.fulfilled, (state, action) => {
        state.participations = action.payload || [];
      })
      .addCase(studentThunks.registerForEvent.fulfilled, (state, action) => {
        if (action.payload) {
          state.participations.push(action.payload);
        }
        state.successMessage = "Successfully registered for the event.";
      })
      .addCase(studentThunks.fetchCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload || [];
      })

      // ─── Transport ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchBusStudents.fulfilled, (state, action) => {
        state.busStudents = action.payload || [];
      })
      .addCase(studentThunks.fetchTransportAttendance.fulfilled, (state, action) => {
        state.transportAttendance = action.payload || [];
      })
      .addCase(studentThunks.fetchRoutes.fulfilled, (state, action) => {
        state.routes = action.payload || [];
      })

      // ─── Library ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchBookIssues.fulfilled, (state, action) => {
        state.bookIssues = action.payload || [];
      })
      .addCase(studentThunks.fetchBookIssueHistory.fulfilled, (state, action) => {
        state.bookIssueHistory = action.payload || [];
      })

      // ─── Canteen ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload || [];
      })
      .addCase(studentThunks.fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload || [];
      })
      .addCase(studentThunks.fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload || [];
      })
      .addCase(studentThunks.createOrder.fulfilled, (state, action) => {
        if (action.payload) {
          state.orders.push(action.payload);
        }
        state.successMessage = "Order placed successfully.";
      })

      // ─── Security ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchEntryExitLogs.fulfilled, (state, action) => {
        state.entryExitLogs = action.payload || [];
      })

      // ─── Documents ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload || [];
      })
      .addCase(studentThunks.fetchDocumentTypes.fulfilled, (state, action) => {
        state.documentTypes = action.payload || [];
      })

      // ─── Analytics ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchPredictions.fulfilled, (state, action) => {
        state.predictions = action.payload || [];
      })
      .addCase(studentThunks.fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload || [];
      })
      .addCase(studentThunks.fetchStudentGoals.fulfilled, (state, action) => {
        state.studentGoals = action.payload || [];
      })
      .addCase(studentThunks.fetchStudentSkills.fulfilled, (state, action) => {
        state.studentSkills = action.payload || [];
      })
      .addCase(studentThunks.fetchSkillMapping.fulfilled, (state, action) => {
        state.skillMapping = action.payload || [];
      })

      // ─── Complaints ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload || [];
      })
      .addCase(studentThunks.createComplaint.fulfilled, (state, action) => {
        if (action.payload) {
          state.complaints.push(action.payload);
        }
        state.successMessage = "Complaint submitted successfully.";
      })
      .addCase(studentThunks.updateComplaint.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.complaints.findIndex(c => c.id === action.payload.id);
          if (index !== -1) {
            state.complaints[index] = action.payload;
          }
        }
        state.successMessage = "Complaint updated successfully.";
      })

      // ─── Notifications ──────────────────────────────────────────────────
      .addCase(studentThunks.fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload || [];
        state.dashboard.unreadNotifications = (action.payload || []).filter(n => !n.is_read).length;
      })
      .addCase(studentThunks.fetchUnreadNotifications.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0;
        state.dashboard.unreadNotifications = action.payload || 0;
      })
      .addCase(studentThunks.markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (item) => item.id === action.payload
        );
        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.dashboard.unreadNotifications = state.unreadCount;
        }
        state.successMessage = "Notification marked as read.";
      })
      .addCase(studentThunks.markAllNotificationsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((item) => ({
          ...item,
          is_read: true,
        }));
        state.unreadCount = 0;
        state.dashboard.unreadNotifications = 0;
        state.successMessage = "All notifications marked as read.";
      })

      // ─── AI Chat ──────────────────────────────────────────────────────
      .addCase(studentThunks.fetchChatSessions.fulfilled, (state, action) => {
        state.chatSessions = action.payload || [];
      })
      .addCase(studentThunks.fetchChatMessages.fulfilled, (state, action) => {
        state.chatMessages = action.payload || [];
      })
      .addCase(studentThunks.createChatSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.chatSessions.push(action.payload);
          state.activeSession = action.payload.id;
        }
        state.successMessage = "Chat session created successfully.";
      })
      .addCase(studentThunks.sendChatMessage.fulfilled, (state, action) => {
        if (action.payload) {
          state.chatMessages.push(action.payload);
        }
      })
      .addCase(studentThunks.deleteChatSession.fulfilled, (state, action) => {
        const { deletedId, clearActive } = action.payload;
        state.chatSessions = state.chatSessions.filter(s => s.id !== deletedId);
        if (clearActive) {
          state.activeSession = null;
          state.chatMessages = [];
        }
        state.successMessage = "Chat session deleted successfully.";
      });
  },
});

export const {
  setSelectedFee,
  clearSelectedFee,
  setActiveSession,
  appendMessage,
  clearChatMessages,
  clearPaymentIntent,
  clearStudentState,
  clearStudentError,
  clearSuccessMessage,
  updateDashboard,
  resetProfileUpdateAttempt,
} = studentSlice.actions;

// ─── Export Selectors ──────────────────────────────────────────────────────

export const selectStudentProfile = (state) => state.student.profile;
export const selectStudentDashboard = (state) => state.student.dashboard;
export const selectStudentAttendance = (state) => state.student.attendance;
export const selectStudentBehaviorLogs = (state) => state.student.behaviorLogs;
export const selectStudentReportCard = (state) => state.student.reportCard;
export const selectStudentResults = (state) => state.student.results;
export const selectStudentGradeScale = (state) => state.student.gradeScale;
export const selectStudentExams = (state) => state.student.exams;
export const selectStudentTimetable = (state) => state.student.timetable;
export const selectStudentAssignments = (state) => state.student.assignments;
export const selectStudentSubmissions = (state) => state.student.submissions;
export const selectPendingAssignments = (state) => state.student.dashboard.pendingAssignments;
export const selectStudentFees = (state) => state.student.fees;
export const selectStudentPayments = (state) => state.student.payments;
export const selectStudentFeeHistory = (state) => state.student.feeHistory;
export const selectStudentSelectedFee = (state) => state.student.selectedFee;
export const selectStudentPaymentIntent = (state) => state.student.paymentIntent;
export const selectFeeDue = (state) => state.student.dashboard.feeDue;
export const selectStudentEvents = (state) => state.student.events;
export const selectStudentParticipations = (state) => state.student.participations;
export const selectStudentCertificates = (state) => state.student.certificates;
export const selectStudentBusStudents = (state) => state.student.busStudents;
export const selectStudentTransportAttendance = (state) => state.student.transportAttendance;
export const selectStudentRoutes = (state) => state.student.routes;
export const selectStudentBookIssues = (state) => state.student.bookIssues;
export const selectStudentBookIssueHistory = (state) => state.student.bookIssueHistory;
export const selectStudentMenuItems = (state) => state.student.menuItems;
export const selectStudentOrders = (state) => state.student.orders;
export const selectStudentCategories = (state) => state.student.categories;
export const selectStudentEntryExitLogs = (state) => state.student.entryExitLogs;
export const selectStudentDocuments = (state) => state.student.documents;
export const selectStudentDocumentTypes = (state) => state.student.documentTypes;
export const selectStudentPredictions = (state) => state.student.predictions;
export const selectStudentRecommendations = (state) => state.student.recommendations;
export const selectStudentGoals = (state) => state.student.studentGoals;
export const selectStudentSkills = (state) => state.student.studentSkills;
export const selectStudentSkillMapping = (state) => state.student.skillMapping;
export const selectStudentComplaints = (state) => state.student.complaints;
export const selectStudentNotifications = (state) => state.student.notifications;
export const selectStudentUnreadCount = (state) => state.student.unreadCount;
export const selectStudentChatSessions = (state) => state.student.chatSessions;
export const selectStudentChatMessages = (state) => state.student.chatMessages;
export const selectStudentActiveSession = (state) => state.student.activeSession;
export const selectStudentLoading = (state) => state.student.loading;
export const selectStudentSubmitting = (state) => state.student.submitting;
export const selectStudentError = (state) => state.student.error;
export const selectStudentSuccessMessage = (state) => state.student.successMessage;
export const selectProfileUpdateAttempted = (state) => state.student.profileUpdateAttempted;

export default studentSlice.reducer;