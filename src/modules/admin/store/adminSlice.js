// src/modules/admin/store/adminSlice.js
import { createSlice } from "@reduxjs/toolkit";
import * as thunks from "./adminThunks";

const initialState = {
  // Behavior Logs
  behaviorLogs: {
    data: [],
    stats: null,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Students
  students: {
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Teachers
  teachers: {
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Fees
  fees: {
    data: [],
    stats: null,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Complaints
  complaints: {
    data: [],
    stats: null,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Timetable
  timetable: {
    data: [],
    loading: false,
    error: null,
  },
  // Events
  events: {
    data: [],
    loading: false,
    error: null,
  },
  // Users
  users: {
    data: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
    loading: false,
    error: null,
  },
  // Dashboard
  dashboardData: {
    stats: null,
    loading: false,
    error: null,
  },
  // UI State
  ui: {
    selectedTab: "overview",
    isDrawerOpen: false,
    selectedItem: null,
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setSelectedTab: (state, action) => {
      state.ui.selectedTab = action.payload;
    },
    setDrawerOpen: (state, action) => {
      state.ui.isDrawerOpen = action.payload;
    },
    setSelectedItem: (state, action) => {
      state.ui.selectedItem = action.payload;
    },
    clearState: () => initialState,
  },
  extraReducers: (builder) => {
    // ============= Behavior Logs =============
    builder
      .addCase(thunks.fetchBehaviorLogs.pending, (state) => {
        state.behaviorLogs.loading = true;
        state.behaviorLogs.error = null;
      })
      .addCase(thunks.fetchBehaviorLogs.fulfilled, (state, action) => {
        state.behaviorLogs.loading = false;
        state.behaviorLogs.data = action.payload.results || action.payload;
        state.behaviorLogs.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchBehaviorLogs.rejected, (state, action) => {
        state.behaviorLogs.loading = false;
        state.behaviorLogs.error = action.error.message;
      })
      .addCase(thunks.fetchBehaviorStats.fulfilled, (state, action) => {
        state.behaviorLogs.stats = action.payload;
      })
      .addCase(thunks.updateBehaviorLogStatus.fulfilled, (state, action) => {
        const index = state.behaviorLogs.data.findIndex(
          (log) => log.id === action.payload.id
        );
        if (index !== -1) {
          state.behaviorLogs.data[index] = action.payload;
        }
      })
      .addCase(thunks.createBehaviorLog.fulfilled, (state, action) => {
        state.behaviorLogs.data.unshift(action.payload);
      });

    // ============= Students =============
    builder
      .addCase(thunks.fetchStudents.pending, (state) => {
        state.students.loading = true;
        state.students.error = null;
      })
      .addCase(thunks.fetchStudents.fulfilled, (state, action) => {
        state.students.loading = false;
        state.students.data = action.payload.results || action.payload;
        state.students.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchStudents.rejected, (state, action) => {
        state.students.loading = false;
        state.students.error = action.error.message;
      })
      .addCase(thunks.createStudent.fulfilled, (state, action) => {
        state.students.data.unshift(action.payload);
      })
      .addCase(thunks.updateStudent.fulfilled, (state, action) => {
        const index = state.students.data.findIndex(
          (student) => student.id === action.payload.id
        );
        if (index !== -1) {
          state.students.data[index] = action.payload;
        }
      })
      .addCase(thunks.deleteStudent.fulfilled, (state, action) => {
        state.students.data = state.students.data.filter(
          (student) => student.id !== action.payload
        );
      });

    // ============= Teachers =============
    builder
      .addCase(thunks.fetchTeachers.pending, (state) => {
        state.teachers.loading = true;
        state.teachers.error = null;
      })
      .addCase(thunks.fetchTeachers.fulfilled, (state, action) => {
        state.teachers.loading = false;
        state.teachers.data = action.payload.results || action.payload;
        state.teachers.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchTeachers.rejected, (state, action) => {
        state.teachers.loading = false;
        state.teachers.error = action.error.message;
      })
      .addCase(thunks.createTeacher.fulfilled, (state, action) => {
        state.teachers.data.unshift(action.payload);
      })
      .addCase(thunks.updateTeacher.fulfilled, (state, action) => {
        const index = state.teachers.data.findIndex(
          (teacher) => teacher.id === action.payload.id
        );
        if (index !== -1) {
          state.teachers.data[index] = action.payload;
        }
      })
      .addCase(thunks.deleteTeacher.fulfilled, (state, action) => {
        state.teachers.data = state.teachers.data.filter(
          (teacher) => teacher.id !== action.payload
        );
      });

    // ============= Fees =============
    builder
      .addCase(thunks.fetchFees.pending, (state) => {
        state.fees.loading = true;
        state.fees.error = null;
      })
      .addCase(thunks.fetchFees.fulfilled, (state, action) => {
        state.fees.loading = false;
        state.fees.data = action.payload.results || action.payload;
        state.fees.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchFees.rejected, (state, action) => {
        state.fees.loading = false;
        state.fees.error = action.error.message;
      })
      .addCase(thunks.fetchFeeStats.fulfilled, (state, action) => {
        state.fees.stats = action.payload;
      })
      .addCase(thunks.createFee.fulfilled, (state, action) => {
        state.fees.data.unshift(action.payload);
      })
      .addCase(thunks.updateFee.fulfilled, (state, action) => {
        const index = state.fees.data.findIndex(
          (fee) => fee.id === action.payload.id
        );
        if (index !== -1) {
          state.fees.data[index] = action.payload;
        }
      });

    // ============= Complaints =============
    builder
      .addCase(thunks.fetchComplaints.pending, (state) => {
        state.complaints.loading = true;
        state.complaints.error = null;
      })
      .addCase(thunks.fetchComplaints.fulfilled, (state, action) => {
        state.complaints.loading = false;
        state.complaints.data = action.payload.results || action.payload;
        state.complaints.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchComplaints.rejected, (state, action) => {
        state.complaints.loading = false;
        state.complaints.error = action.error.message;
      })
      .addCase(thunks.fetchComplaintStats.fulfilled, (state, action) => {
        state.complaints.stats = action.payload;
      })
      .addCase(thunks.updateComplaintStatus.fulfilled, (state, action) => {
        const index = state.complaints.data.findIndex(
          (complaint) => complaint.id === action.payload.id
        );
        if (index !== -1) {
          state.complaints.data[index] = action.payload;
        }
      })
      .addCase(thunks.assignComplaint.fulfilled, (state, action) => {
        const index = state.complaints.data.findIndex(
          (complaint) => complaint.id === action.payload.id
        );
        if (index !== -1) {
          state.complaints.data[index] = action.payload;
        }
      });

    // ============= Timetable =============
    builder
      .addCase(thunks.fetchTimetable.pending, (state) => {
        state.timetable.loading = true;
        state.timetable.error = null;
      })
      .addCase(thunks.fetchTimetable.fulfilled, (state, action) => {
        state.timetable.loading = false;
        state.timetable.data = action.payload.results || action.payload;
      })
      .addCase(thunks.fetchTimetable.rejected, (state, action) => {
        state.timetable.loading = false;
        state.timetable.error = action.error.message;
      })
      .addCase(thunks.createTimetableEntry.fulfilled, (state, action) => {
        state.timetable.data.push(action.payload);
      })
      .addCase(thunks.updateTimetableEntry.fulfilled, (state, action) => {
        const index = state.timetable.data.findIndex(
          (entry) => entry.id === action.payload.id
        );
        if (index !== -1) {
          state.timetable.data[index] = action.payload;
        }
      })
      .addCase(thunks.deleteTimetableEntry.fulfilled, (state, action) => {
        state.timetable.data = state.timetable.data.filter(
          (entry) => entry.id !== action.payload
        );
      });

    // ============= Events =============
    builder
      .addCase(thunks.fetchEvents.pending, (state) => {
        state.events.loading = true;
        state.events.error = null;
      })
      .addCase(thunks.fetchEvents.fulfilled, (state, action) => {
        state.events.loading = false;
        state.events.data = action.payload.results || action.payload;
      })
      .addCase(thunks.fetchEvents.rejected, (state, action) => {
        state.events.loading = false;
        state.events.error = action.error.message;
      })
      .addCase(thunks.createEvent.fulfilled, (state, action) => {
        state.events.data.unshift(action.payload);
      })
      .addCase(thunks.updateEvent.fulfilled, (state, action) => {
        const index = state.events.data.findIndex(
          (event) => event.id === action.payload.id
        );
        if (index !== -1) {
          state.events.data[index] = action.payload;
        }
      })
      .addCase(thunks.deleteEvent.fulfilled, (state, action) => {
        state.events.data = state.events.data.filter(
          (event) => event.id !== action.payload
        );
      });

    // ============= Users =============
    builder
      .addCase(thunks.fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(thunks.fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.data = action.payload.results || action.payload;
        state.users.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: action.payload.results?.length || 0,
        };
      })
      .addCase(thunks.fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.error.message;
      })
      .addCase(thunks.createUser.fulfilled, (state, action) => {
        state.users.data.unshift(action.payload);
      })
      .addCase(thunks.updateUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
      })
      .addCase(thunks.deleteUser.fulfilled, (state, action) => {
        state.users.data = state.users.data.filter(
          (user) => user.id !== action.payload
        );
      })
      .addCase(thunks.approveUser.fulfilled, (state, action) => {
        const index = state.users.data.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
      });

    // ============= Dashboard =============
    builder
      .addCase(thunks.fetchDashboardStats.pending, (state) => {
        state.dashboardData.loading = true;
        state.dashboardData.error = null;
      })
      .addCase(thunks.fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardData.loading = false;
        state.dashboardData.stats = action.payload;
      })
      .addCase(thunks.fetchDashboardStats.rejected, (state, action) => {
        state.dashboardData.loading = false;
        state.dashboardData.error = action.error.message;
      });
  },
});

export const {
  setSelectedTab,
  setDrawerOpen,
  setSelectedItem,
  clearState,
} = adminSlice.actions;

export default adminSlice.reducer;
