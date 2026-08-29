// src/modules/student/store/studentThunks.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import studentService from "@/modules/student/services/studentService";
import paymentService from "@/modules/payments/services/paymentService";

// ─── API Endpoint Constants ──────────────────────────────────────────────
const API_BASE = "/api";

const ENDPOINTS = {
  PROFILE: `${API_BASE}/auth/profile/`,
  ATTENDANCE: `${API_BASE}/attendance/attendance/`,
  BEHAVIOR_LOGS: `${API_BASE}/attendance/behavior-logs/`,
  RESULTS: `${API_BASE}/exams/results/`,
  GRADE_SCALE: `${API_BASE}/exams/grade-scale/`,
  EXAMS: `${API_BASE}/exams/exams/`,
  ASSIGNMENTS: `${API_BASE}/assignments/assignments/`,
  SUBMISSIONS: `${API_BASE}/assignments/submissions/`,
  TIMETABLE: `${API_BASE}/academics/timetable/`,
  FEES: `${API_BASE}/finance/fees/`,
  PAYMENTS: `${API_BASE}/finance/payments/`,
  FEE_HISTORY: `${API_BASE}/finance/fee-history/`,
  NOTIFICATIONS: `${API_BASE}/communication/notifications/`,
  MESSAGES: `${API_BASE}/communication/messages/`,
  EVENTS: `${API_BASE}/events/events/`,
  EVENT_PARTICIPATION: `${API_BASE}/events/event-participation/`,
  CERTIFICATES: `${API_BASE}/events/certificates/`,
  BUS_STUDENTS: `${API_BASE}/transport/bus-students/`,
  TRANSPORT_ATTENDANCE: `${API_BASE}/transport/transport-attendance/`,
  ROUTES: `${API_BASE}/transport/routes/`,
  BOOK_ISSUES: `${API_BASE}/library/book-issues/`,
  BOOK_ISSUE_HISTORY: `${API_BASE}/library/book-issue-history/`,
  MENU_ITEMS: `${API_BASE}/canteen/menu-items/`,
  ORDER_ITEMS: `${API_BASE}/canteen/order-items/`,
  CATEGORIES: `${API_BASE}/canteen/categories/`,
  ENTRY_EXIT_LOGS: `${API_BASE}/security/entry-exit-logs/`,
  DOCUMENTS: `${API_BASE}/documents/documents/`,
  PREDICTIONS: `${API_BASE}/analytics/predictions/`,
  RECOMMENDATIONS: `${API_BASE}/analytics/recommendations/`,
  STUDENT_GOALS: `${API_BASE}/analytics/student-goals/`,
  STUDENT_SKILLS: `${API_BASE}/analytics/student-skills/`,
  SKILL_MAPPING: `${API_BASE}/analytics/skill-mapping/`,
};

// ─── Profile ──────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  "student/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getProfile();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "student/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const response = await studentService.updateProfile(data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update profile"
      );
    }
  }
);

// ─── Assignments ──────────────────────────────────────────────────────────

export const fetchAssignments = createAsyncThunk(
  "student/fetchAssignments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getAssignments(params);
      console.log("📋 fetchAssignments response:", response);
      
      let data = [];
      if (response?.results && Array.isArray(response.results)) {
        data = response.results;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      
      console.log("📋 Extracted assignments:", data.length, "records");
      return data;
    } catch (error) {
      console.error("❌ fetchAssignments error:", error);
      return [];
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  "student/fetchSubmissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getSubmissions(params);
      console.log("📋 fetchSubmissions response:", response);
      
      let data = [];
      if (response?.results && Array.isArray(response.results)) {
        data = response.results;
      } else if (response && Array.isArray(response)) {
        data = response;
      }
      
      console.log("📋 Extracted submissions:", data.length, "records");
      return data;
    } catch (error) {
      console.error("❌ fetchSubmissions error:", error);
      return [];
    }
  }
);

export const submitAssignment = createAsyncThunk(
  "student/submitAssignment",
  async (submissionData, { rejectWithValue, dispatch }) => {
    try {
      console.log("📤 submitAssignment thunk called with:", submissionData);
      
      // Pass the data as-is to the service
      const response = await studentService.submitAssignment(submissionData);
      console.log("✅ submitAssignment response:", response);
      
      // Refresh data after successful submission
      await Promise.all([
        dispatch(fetchAssignments()),
        dispatch(fetchSubmissions()),
      ]);
      
      return response.data || response;
    } catch (error) {
      console.error("❌ submitAssignment error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to submit assignment"
      );
    }
  }
);

export const updateSubmission = createAsyncThunk(
  "student/updateSubmission",
  async ({ id, submissionData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.updateSubmission(id, submissionData);
      dispatch(fetchAssignments());
      dispatch(fetchSubmissions());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update submission"
      );
    }
  }
);

export const deleteSubmission = createAsyncThunk(
  "student/deleteSubmission",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await studentService.deleteSubmission(id);
      dispatch(fetchAssignments());
      dispatch(fetchSubmissions());
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete submission"
      );
    }
  }
);

// ─── Attendance ──────────────────────────────────────────────────────────

export const fetchAttendance = createAsyncThunk(
  "student/fetchAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getAttendance(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch attendance"
      );
    }
  }
);

export const fetchBehaviorLogs = createAsyncThunk(
  "student/fetchBehaviorLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getBehaviorLogs(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch behavior logs"
      );
    }
  }
);

// ─── Report Card ─────────────────────────────────────────────────────────

export const fetchReportCard = createAsyncThunk(
  "student/fetchReportCard",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getReportCard(params);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch report card"
      );
    }
  }
);

// ─── Results ──────────────────────────────────────────────────────────────

export const fetchResults = createAsyncThunk(
  "student/fetchResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getResults(params);
      console.log("📋 fetchResults response:", response);
      const data = response?.results || [];
      console.log("📋 Extracted results:", data.length, "records");
      return data;
    } catch (error) {
      console.error("❌ fetchResults error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch results"
      );
    }
  }
);

// ─── Grade Scale ─────────────────────────────────────────────────────────

export const fetchGradeScale = createAsyncThunk(
  "student/fetchGradeScale",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getGradeScale(params);
      console.log("📋 fetchGradeScale response:", response);
      const data = response?.results || [];
      console.log("📋 Extracted grade scale:", data.length, "records");
      return data;
    } catch (error) {
      console.error("❌ fetchGradeScale error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch grade scale"
      );
    }
  }
);

// ─── Exams ───────────────────────────────────────────────────────────────

export const fetchExams = createAsyncThunk(
  "student/fetchExams",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getExams(params);
      console.log("📋 fetchExams response:", response);
      const data = response?.results || [];
      console.log("📋 Extracted exams:", data.length, "records");
      return data;
    } catch (error) {
      console.error("❌ fetchExams error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch exams"
      );
    }
  }
);

// ─── Timetable ──────────────────────────────────────────────────────────

export const fetchTimetable = createAsyncThunk(
  "student/fetchTimetable",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getTimetable(params);
      const data = response?.results || response || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("❌ Fetch timetable error:", error);
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch timetable"
      );
    }
  }
);

// ─── Finance ──────────────────────────────────────────────────────────────

export const fetchFees = createAsyncThunk(
  "student/fetchFees",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getFees(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fees"
      );
    }
  }
);

export const fetchPayments = createAsyncThunk(
  "student/fetchPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getPayments(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch payments"
      );
    }
  }
);

export const fetchFeeHistory = createAsyncThunk(
  "student/fetchFeeHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getFeeHistory(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fee history"
      );
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  "student/createPaymentIntent",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentService.createPaymentIntent(paymentData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create payment intent"
      );
    }
  }
);

export const confirmPayment = createAsyncThunk(
  "student/confirmPayment",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await paymentService.confirmPayment(data);
      dispatch(fetchFees());
      dispatch(fetchPayments());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to confirm payment"
      );
    }
  }
);

// ─── Events ──────────────────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  "student/fetchEvents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getEvents(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch events"
      );
    }
  }
);

export const fetchParticipations = createAsyncThunk(
  "student/fetchParticipations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getParticipations(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch participations"
      );
    }
  }
);

export const registerForEvent = createAsyncThunk(
  "student/registerForEvent",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.registerForEvent(data);
      dispatch(fetchParticipations());
      dispatch(fetchEvents());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to register for event"
      );
    }
  }
);

export const fetchCertificates = createAsyncThunk(
  "student/fetchCertificates",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getCertificates(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch certificates"
      );
    }
  }
);

// ─── Transport ──────────────────────────────────────────────────────────

export const fetchBusStudents = createAsyncThunk(
  "student/fetchBusStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getBusStudents(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch bus students"
      );
    }
  }
);

export const fetchTransportAttendance = createAsyncThunk(
  "student/fetchTransportAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getTransportAttendance(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch transport attendance"
      );
    }
  }
);

export const fetchRoutes = createAsyncThunk(
  "student/fetchRoutes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getRoutes(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch routes"
      );
    }
  }
);

// ─── Library ──────────────────────────────────────────────────────────

export const fetchBookIssues = createAsyncThunk(
  "student/fetchBookIssues",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getBookIssues(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch book issues"
      );
    }
  }
);

export const fetchBookIssueHistory = createAsyncThunk(
  "student/fetchBookIssueHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getBookIssueHistory(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch book issue history"
      );
    }
  }
);

// ─── Canteen ──────────────────────────────────────────────────────────

export const fetchMenuItems = createAsyncThunk(
  "student/fetchMenuItems",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getMenuItems(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch menu items"
      );
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "student/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getCategories(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch categories"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "student/createOrder",
  async (orderData, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.createOrder(orderData);
      dispatch(fetchOrders());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create order"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "student/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getOrders(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch orders"
      );
    }
  }
);

// ─── Security ──────────────────────────────────────────────────────────

export const fetchEntryExitLogs = createAsyncThunk(
  "student/fetchEntryExitLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getEntryExitLogs(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch entry/exit logs"
      );
    }
  }
);

// ─── Documents ──────────────────────────────────────────────────────────

export const fetchDocuments = createAsyncThunk(
  "student/fetchDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getDocuments(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch documents"
      );
    }
  }
);

export const fetchDocumentTypes = createAsyncThunk(
  "student/fetchDocumentTypes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getDocumentTypes(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch document types"
      );
    }
  }
);

// ─── Analytics ──────────────────────────────────────────────────────────

export const fetchPredictions = createAsyncThunk(
  "student/fetchPredictions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getPredictions(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch predictions"
      );
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  "student/fetchRecommendations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getRecommendations(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch recommendations"
      );
    }
  }
);

export const fetchStudentGoals = createAsyncThunk(
  "student/fetchStudentGoals",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudentGoals(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch student goals"
      );
    }
  }
);

export const fetchStudentSkills = createAsyncThunk(
  "student/fetchStudentSkills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudentSkills(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch student skills"
      );
    }
  }
);

export const fetchSkillMapping = createAsyncThunk(
  "student/fetchSkillMapping",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getSkillMapping(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch skill mapping"
      );
    }
  }
);

// ─── Complaints ──────────────────────────────────────────────────────────

export const fetchComplaints = createAsyncThunk(
  "student/fetchComplaints",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getComplaints(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch complaints"
      );
    }
  }
);

export const createComplaint = createAsyncThunk(
  "student/createComplaint",
  async (complaintData, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.createComplaint(complaintData);
      dispatch(fetchComplaints());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create complaint"
      );
    }
  }
);

export const updateComplaint = createAsyncThunk(
  "student/updateComplaint",
  async ({ id, complaintData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.updateComplaint(id, complaintData);
      dispatch(fetchComplaints());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update complaint"
      );
    }
  }
);

// ─── Notifications ──────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  "student/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getNotifications(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch notifications"
      );
    }
  }
);

export const fetchUnreadNotifications = createAsyncThunk(
  "student/fetchUnreadNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const count = await studentService.getUnreadNotifications();
      return count || 0;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch unread notifications"
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "student/markNotificationRead",
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      await studentService.markNotificationRead(notificationId);
      dispatch(fetchNotifications());
      dispatch(fetchUnreadNotifications());
      return notificationId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "student/markAllNotificationsRead",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await studentService.markAllNotificationsRead();
      dispatch(fetchNotifications());
      dispatch(fetchUnreadNotifications());
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to mark all notifications as read"
      );
    }
  }
);

// ─── AI Chat ──────────────────────────────────────────────────────────────

export const fetchChatSessions = createAsyncThunk(
  "student/fetchChatSessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await studentService.getChatSessions(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch chat sessions"
      );
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  "student/fetchChatMessages",
  async (params, { rejectWithValue }) => {
    try {
      const response = await studentService.getChatMessages(params);
      return response?.results || response || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch chat messages"
      );
    }
  }
);

export const createChatSession = createAsyncThunk(
  "student/createChatSession",
  async (sessionData, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.createChatSession(sessionData);
      dispatch(fetchChatSessions());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create chat session"
      );
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "student/sendChatMessage",
  async (messageData, { rejectWithValue, dispatch }) => {
    try {
      const response = await studentService.sendChatMessage(messageData);
      dispatch(fetchChatMessages({ session_id: messageData.session }));
      return response.data || response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to send chat message"
      );
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  "student/deleteChatSession",
  async (sessionId, { rejectWithValue, dispatch, getState }) => {
    try {
      await studentService.deleteChatSession(sessionId);
      dispatch(fetchChatSessions());
      
      const { student } = getState();
      if (student.activeSession === sessionId) {
        return { deletedId: sessionId, clearActive: true };
      }
      return { deletedId: sessionId, clearActive: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete chat session"
      );
    }
  }
);