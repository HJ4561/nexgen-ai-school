// src/modules/parent/store/parentSlice.js

/**
 * ============================================
 * PARENT SLICE - COMPLETE
 * ============================================
 * 
 * Purpose: Redux slice for parent module state management
 * Used by: All parent components and pages
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

import { createSlice } from "@reduxjs/toolkit";
import * as parentThunks from "./parentThunks";

const initialState = {
  // ─── Profile ──────────────────────────────────────────────────────
  profile: null,
  
  // ─── Parent Links (Children) ────────────────────────────────────
  parentLinks: [],
  selectedChild: null,
  selectedTerm: null,
  childDetails: {},
  
  // ─── Dashboard ──────────────────────────────────────────────────
  dashboardStats: {
    totalChildren: 0,
    attendanceRate: 0,
    pendingFees: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
  },
  
  // ─── Academics ──────────────────────────────────────────────────
  classes: [],
  sections: [],
  subjects: [],
  classSubjects: [],
  timetable: [],
  rooms: [],
  exams: [],
  
  // ─── Attendance ──────────────────────────────────────────────────
  attendance: [],
  attendanceStats: {
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0,
    present_days: 0,
    total_days: 0,
  },
  
  // ─── Behavior Logs ──────────────────────────────────────────────
  behaviorLogs: [],
  behaviorStats: {
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    low: 0,
    medium: 0,
    high: 0,
  },
  
  // ─── Grades & Exams ────────────────────────────────────────────
  results: [],
  gradeScale: [],
  gradeSummary: {
    average: 0,
    highest: 0,
    lowest: 0,
    total: 0,
    subjects: [],
    percentage: 0,
  },
  
  // ─── Assignments ────────────────────────────────────────────────
  assignments: [],
  submissions: [],
  
  // ─── Finance ──────────────────────────────────────────────────
  feeStructures: [],
  fees: [],
  payments: [],
  feeHistory: [],
  feeSummary: {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    percentage: 0,
  },
  selectedFee: null,
  paymentIntent: null,
  
  // ─── Communication ──────────────────────────────────────────────
  notifications: [],
  unreadCount: 0,
  messages: [],
  complaints: [],
  
  // ─── PTM ──────────────────────────────────────────────────────────
  ptm: [],
  ptmMeetings: [],
  ptmAttendees: [],
  
  // ─── Transport ──────────────────────────────────────────────────
  buses: [],
  routes: [],
  busStops: [],
  busStudents: [],
  transportAttendance: [],
  
  // ─── Library ──────────────────────────────────────────────────
  books: [],
  bookIssues: [],
  bookIssueHistory: [],
  
  // ─── Canteen ──────────────────────────────────────────────────
  categories: [],
  menuItems: [],
  orders: [],
  
  // ─── Security ──────────────────────────────────────────────────
  visitors: [],
  accessLogs: [],
  entryExitLogs: [],
  
  // ─── Events ──────────────────────────────────────────────────
  events: [],
  eventParticipations: [],
  
  // ─── Documents ──────────────────────────────────────────────────
  documents: [],
  documentTypes: [],
  
  // ─── Analytics ──────────────────────────────────────────────────
  predictions: [],
  recommendations: [],
  studentGoals: [],
  studentSkills: [],
  skillMapping: [],
  parentEngagement: null,
  
  // ─── Chat ──────────────────────────────────────────────────────
  chatSessions: [],
  chatMessages: [],
  activeSession: null,
  
  // ─── UI State ──────────────────────────────────────────────────
  loading: false,
  error: null,
  success: false,
};

const parentSlice = createSlice({
  name: "parent",
  initialState,
  
  reducers: {
    // ─── Child Management ──────────────────────────────────────────
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    
    clearSelectedChild: (state) => {
      state.selectedChild = null;
    },
    
    clearChildDetails: (state) => {
      state.childDetails = {};
    },
    
    // ─── Term Management ──────────────────────────────────────────
    setSelectedTerm: (state, action) => {
      state.selectedTerm = action.payload;
    },
    
    clearSelectedTerm: (state) => {
      state.selectedTerm = null;
    },
    
    // ─── Finance ────────────────────────────────────────────────────
    setSelectedFee: (state, action) => {
      state.selectedFee = action.payload;
    },
    
    clearSelectedFee: (state) => {
      state.selectedFee = null;
    },
    
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    
    // ─── Chat ──────────────────────────────────────────────────────
    setActiveChatSession: (state, action) => {
      state.activeSession = action.payload;
    },
    
    clearChatMessages: (state) => {
      state.chatMessages = [];
    },
    
    addChatMessageLocal: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    
    clearChatSession: (state) => {
      state.activeSession = null;
      state.chatMessages = [];
    },
    
    // ─── Reset ──────────────────────────────────────────────────────
    clearParentState: () => initialState,
    
    clearError: (state) => {
      state.error = null;
    },
    
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  
  extraReducers: (builder) => {
    // ─── Profile ──────────────────────────────────────────────────
    builder
      .addCase(parentThunks.fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        console.log("✅ Profile loaded with user_name:", action.payload?.user_name);
      })
      .addCase(parentThunks.fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })
      
      .addCase(parentThunks.updateProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload };
        state.success = true;
      })

      // ─── Parent Links ──────────────────────────────────────────────
      .addCase(parentThunks.fetchParentLinks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchParentLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.parentLinks = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Parent links loaded with student_name:", action.payload[0]?.student_name);
        }
        if (!state.selectedChild && action.payload?.length) {
          state.selectedChild = action.payload[0]?.student || action.payload[0]?.id;
        }
      })
      .addCase(parentThunks.fetchParentLinks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch children";
      })
      
      .addCase(parentThunks.fetchStudentById.fulfilled, (state, action) => {
        const { studentId, data } = action.payload;
        state.childDetails[studentId] = data;
        console.log("✅ Student details loaded:", {
          user_name: data.user_name,
          class_name: data.class_name,
          parent_name: data.parent_name,
        });
      })

      // ─── Attendance ────────────────────────────────────────────────
      .addCase(parentThunks.fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Attendance loaded with student_name:", action.payload[0]?.student_name);
        }
      })
      .addCase(parentThunks.fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch attendance";
      })

      // ─── Attendance Stats ──────────────────────────────────────────
      .addCase(parentThunks.fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        state.attendanceStats = action.payload;
        console.log("✅ Attendance Stats loaded:", action.payload);
      })
      .addCase(parentThunks.fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch attendance stats";
      })

      // ─── Behavior Logs ────────────────────────────────────────────
      .addCase(parentThunks.fetchBehaviorLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchBehaviorLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.behaviorLogs = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Behavior logs loaded with student_name:", action.payload[0]?.student_name);
          console.log("✅ Behavior logs loaded with teacher_name:", action.payload[0]?.teacher_name);
        }
        // Calculate stats
        const logs = action.payload || [];
        state.behaviorStats = {
          total: logs.length,
          positive: logs.filter(l => l.type === "positive").length,
          negative: logs.filter(l => l.type === "negative").length,
          neutral: logs.filter(l => l.type === "neutral").length,
          low: logs.filter(l => l.severity === "low").length,
          medium: logs.filter(l => l.severity === "medium").length,
          high: logs.filter(l => l.severity === "high").length,
        };
      })
      .addCase(parentThunks.fetchBehaviorLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch behavior logs";
      })

      // ─── Timetable ────────────────────────────────────────────────
      .addCase(parentThunks.fetchTimetable.fulfilled, (state, action) => {
        state.timetable = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Timetable loaded with fields:", {
            class_name: action.payload[0]?.class_name,
            section_name: action.payload[0]?.section_name,
            subject_name: action.payload[0]?.subject_name,
            teacher_name: action.payload[0]?.teacher_name,
            room_name: action.payload[0]?.room_name,
          });
        }
      })

      // ─── Results ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Results loaded with student_name:", action.payload[0]?.student_name);
          console.log("✅ Results loaded with exam_name:", action.payload[0]?.exam_name);
        }
      })
      .addCase(parentThunks.fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch results";
      })

      // ─── Grade Summary ──────────────────────────────────────────────
      .addCase(parentThunks.fetchGradeSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchGradeSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.gradeSummary = action.payload;
        console.log("✅ Grade Summary loaded:", action.payload);
      })
      .addCase(parentThunks.fetchGradeSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch grade summary";
      })

      // ─── Assignments ──────────────────────────────────────────────
      .addCase(parentThunks.fetchAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Assignments loaded:", {
            class_name: action.payload[0]?.class_name,
            subject_name: action.payload[0]?.subject_name,
            teacher_name: action.payload[0]?.teacher_name,
          });
        }
      })

      .addCase(parentThunks.fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Submissions loaded with student_name:", action.payload[0]?.student_name);
          console.log("✅ Submissions loaded with assignment_title:", action.payload[0]?.assignment_title);
        }
      })

      // ─── Fees ──────────────────────────────────────────────────────
      .addCase(parentThunks.fetchFeeStructures.fulfilled, (state, action) => {
        state.feeStructures = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Fee Structures loaded with class_name:", action.payload[0]?.class_name);
        }
      })

      .addCase(parentThunks.fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.fees = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Fees loaded with student_name:", action.payload[0]?.student_name);
          console.log("✅ Fees loaded with fee_structure_title:", action.payload[0]?.fee_structure_title);
        }
      })
      .addCase(parentThunks.fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch fees";
      })

      // ─── Fee Summary ──────────────────────────────────────────────
      .addCase(parentThunks.fetchFeeSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(parentThunks.fetchFeeSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.feeSummary = action.payload;
        console.log("✅ Fee Summary loaded:", action.payload);
      })
      .addCase(parentThunks.fetchFeeSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch fee summary";
      })

      // ─── Payments ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Payments loaded with student_name:", action.payload[0]?.student_name);
          console.log("✅ Payments loaded with fee_title:", action.payload[0]?.fee_title);
        }
      })

      // ─── Notifications ──────────────────────────────────────────────
      .addCase(parentThunks.fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Notifications loaded with user_name:", action.payload[0]?.user_name);
        }
        state.unreadCount = action.payload?.filter(n => !n.is_read).length || 0;
      })

      // ─── Messages ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Messages loaded:", {
            sender_name: action.payload[0]?.sender_name,
            receiver_name: action.payload[0]?.receiver_name,
          });
        }
      })

      // ─── Events ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Events loaded with organizer_name:", action.payload[0]?.organizer_name);
        }
      })

      .addCase(parentThunks.fetchEventParticipations.fulfilled, (state, action) => {
        state.eventParticipations = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Event Participations loaded:", {
            event_name: action.payload[0]?.event_name,
            student_name: action.payload[0]?.student_name,
          });
        }
      })

      // ─── PTM ──────────────────────────────────────────────────────
      .addCase(parentThunks.fetchPTM.fulfilled, (state, action) => {
        state.ptm = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ PTM loaded with class_name:", action.payload[0]?.class_name);
        }
      })

      .addCase(parentThunks.fetchPTMMeetings.fulfilled, (state, action) => {
        state.ptmMeetings = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ PTM Meetings loaded:", {
            ptm_name: action.payload[0]?.ptm_name,
            student_name: action.payload[0]?.student_name,
            teacher_name: action.payload[0]?.teacher_name,
          });
        }
      })

      .addCase(parentThunks.fetchPTMAttendees.fulfilled, (state, action) => {
        state.ptmAttendees = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ PTM Attendees loaded:", {
            parent_name: action.payload[0]?.parent_name,
            meeting_label: action.payload[0]?.meeting_label,
          });
        }
      })

      // ─── Transport ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchBusStudents.fulfilled, (state, action) => {
        state.busStudents = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Bus Students loaded:", {
            bus_number: action.payload[0]?.bus_number,
            student_name: action.payload[0]?.student_name,
            pickup_stop_name: action.payload[0]?.pickup_stop_name,
            drop_stop_name: action.payload[0]?.drop_stop_name,
          });
        }
      })

      .addCase(parentThunks.fetchTransportAttendance.fulfilled, (state, action) => {
        state.transportAttendance = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Transport Attendance loaded:", {
            student_name: action.payload[0]?.student_name,
            bus_number: action.payload[0]?.bus_number,
          });
        }
      })

      // ─── Library ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchBookIssues.fulfilled, (state, action) => {
        state.bookIssues = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Book Issues loaded:", {
            book_title: action.payload[0]?.book_title,
            student_name: action.payload[0]?.student_name,
          });
        }
      })

      .addCase(parentThunks.fetchBookIssueHistory.fulfilled, (state, action) => {
        state.bookIssueHistory = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Book Issue History loaded:", {
            book_title: action.payload[0]?.book_title,
            student_name: action.payload[0]?.student_name,
            changed_by_name: action.payload[0]?.changed_by_name,
          });
        }
      })

      // ─── Canteen ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        if (action.payload?.length > 0) {
          console.log("✅ Orders loaded:", {
            student_name: action.payload[0]?.student_name,
            item_name: action.payload[0]?.item_name,
          });
        }
      })

      // ─── Analytics ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchParentEngagement.fulfilled, (state, action) => {
        state.parentEngagement = action.payload;
        console.log("✅ Parent Engagement loaded with parent_name:", action.payload?.parent_name);
      })

      // ─── Dashboard ──────────────────────────────────────────────────
      .addCase(parentThunks.fetchParentDashboard.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })

      // ─── Generic Handlers ──────────────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith("parent/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("parent/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("parent/") && action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.error = null;
        }
      );
  },
});

// ─── Export Actions ──────────────────────────────────────────────────────

export const {
  // Child Management
  setSelectedChild,
  clearSelectedChild,
  clearChildDetails,
  
  // Term Management
  setSelectedTerm,
  clearSelectedTerm,
  
  // Finance
  setSelectedFee,
  clearSelectedFee,
  clearPaymentIntent,
  
  // Chat
  setActiveChatSession,
  clearChatMessages,
  addChatMessageLocal,
  clearChatSession,
  
  // Reset
  clearParentState,
  clearError,
  clearSuccess,
} = parentSlice.actions;

// ─── Selectors ──────────────────────────────────────────────────────────

// ─── Profile Selectors ──────────────────────────────────────────────
export const selectParentProfile = (state) => state.parent.profile;
export const selectParentUserName = (state) => state.parent.profile?.user_name || state.parent.profile?.name;
export const selectParentLoading = (state) => state.parent.loading;
export const selectParentError = (state) => state.parent.error;

// ─── Child Selectors ──────────────────────────────────────────────
export const selectParentLinks = (state) => state.parent.parentLinks;
export const selectSelectedChild = (state) => state.parent.selectedChild;
export const selectChildDetails = (state) => state.parent.childDetails;
export const selectSelectedChildName = (state) => {
  const childId = state.parent.selectedChild;
  if (!childId) return null;
  const link = state.parent.parentLinks.find(
    l => l.student === childId || l.id === childId
  );
  return link?.student_name || link?.student?.name || `Child ${childId}`;
};
export const selectSelectedChildClass = (state) => {
  const childId = state.parent.selectedChild;
  if (!childId) return null;
  const details = state.parent.childDetails[childId];
  return details?.class_name || details?.class_obj?.name || null;
};
export const selectChildrenNames = (state) => {
  return state.parent.parentLinks.map(link => ({
    id: link.student || link.id,
    name: link.student_name || link.student?.name || `Child ${link.id}`,
    class: link.class_name || link.class_obj?.name,
  }));
};

// ─── Dashboard Selectors ──────────────────────────────────────────
export const selectDashboardStats = (state) => state.parent.dashboardStats;

// ─── Attendance Selectors ──────────────────────────────────────────
export const selectAttendance = (state) => state.parent.attendance;
export const selectAttendanceStats = (state) => state.parent.attendanceStats;
export const selectAttendanceByChild = (state, childId) => 
  state.parent.attendance.filter(a => a.student === childId || a.student_id === childId);

// ─── Behavior Selectors ──────────────────────────────────────────────
export const selectBehaviorLogs = (state) => state.parent.behaviorLogs;
export const selectBehaviorStats = (state) => state.parent.behaviorStats;
export const selectBehaviorLogsByChild = (state, childId) => 
  state.parent.behaviorLogs.filter(l => l.student === childId || l.student_id === childId);

// ─── Grade Selectors ──────────────────────────────────────────────
export const selectResults = (state) => state.parent.results;
export const selectGradeSummary = (state) => state.parent.gradeSummary;
export const selectGradeScale = (state) => state.parent.gradeScale;
export const selectResultsByChild = (state, childId) => 
  state.parent.results.filter(r => r.student === childId || r.student_id === childId);
export const selectGrades = (state) => state.parent.results;
export const selectGradesByChild = (state, childId) => 
  state.parent.results.filter(r => r.student === childId || r.student_id === childId);

// ─── Term Selectors ──────────────────────────────────────────────
export const selectSelectedTerm = (state) => state.parent.selectedTerm;

// ─── Finance Selectors ──────────────────────────────────────────────
export const selectFees = (state) => state.parent.fees;
export const selectFeeSummary = (state) => state.parent.feeSummary;
export const selectPayments = (state) => state.parent.payments;
export const selectFeeStructures = (state) => state.parent.feeStructures; // ✅ ADDED
export const selectFeesByChild = (state, childId) => 
  state.parent.fees.filter(f => f.student === childId || f.student_id === childId);

// ─── Notification Selectors ──────────────────────────────────────────
export const selectNotifications = (state) => state.parent.notifications;
export const selectUnreadCount = (state) => state.parent.unreadCount;

// ─── Events Selectors ──────────────────────────────────────────────
export const selectEvents = (state) => state.parent.events;
export const selectEventParticipations = (state) => state.parent.eventParticipations;
export const selectUpcomingEvents = (state) => {
  const events = state.parent.events || [];
  const now = new Date();
  return events.filter(event => {
    try {
      return new Date(event.event_date) >= now;
    } catch {
      return false;
    }
  });
};

// ─── Transport Selectors ──────────────────────────────────────────────
export const selectBusStudents = (state) => state.parent.busStudents;
export const selectTransportAttendance = (state) => state.parent.transportAttendance;
export const selectRoutes = (state) => state.parent.routes;

// ─── Chat Selectors ──────────────────────────────────────────────────
export const selectChatSessions = (state) => state.parent.chatSessions;
export const selectChatMessages = (state) => state.parent.chatMessages;
export const selectActiveSession = (state) => state.parent.activeSession;

// ─── Complaint Selectors ──────────────────────────────────────────────
export const selectComplaints = (state) => state.parent.complaints;
export const selectPendingComplaints = (state) => 
  state.parent.complaints.filter(c => c.status === "pending" || c.status === "Pending");
export const selectResolvedComplaints = (state) => 
  state.parent.complaints.filter(c => c.status === "resolved" || c.status === "Resolved");
export const selectComplaintsByChild = (state, childId) => 
  state.parent.complaints.filter(c => c.student === childId || c.student_id === childId);

// ─── Default Export ──────────────────────────────────────────────────────

export default parentSlice.reducer;