// src/store/admin/complaintSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  complaints: [],
  selectedComplaint: null,
  logs: [],
  selectedLog: null,
  behaviorLoading: false,
  behaviorError: null,
  loading: false,
  error: null,
  updating: false,
};

const admincomplaintSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    fetchComplaintsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchComplaintsSuccess: (state, action) => {
      state.loading = false;
      state.complaints = action.payload;
    },
    fetchComplaintsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchComplaintDetailStart: (state) => {
      state.loading = true;
    },
    fetchComplaintDetailSuccess: (state, action) => {
      state.loading = false;
      state.selectedComplaint = action.payload;
    },
    fetchComplaintDetailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateComplaintStart: (state) => {
      state.updating = true;
    },
    updateComplaintSuccess: (state, action) => {
      state.updating = false;
      const index = state.complaints.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.complaints[index] = action.payload;
      }
      if (state.selectedComplaint?.id === action.payload.id) {
        state.selectedComplaint = action.payload;
      }
    },
    updateComplaintFailure: (state, action) => {
      state.updating = false;
      state.error = action.payload;
    },
     // ─── Behavior Logs ──────────────────────────────────────────────
    fetchBehaviorLogsStart: (state) => {
      state.behaviorLoading = true;
      state.behaviorError = null;
    },
    fetchBehaviorLogsSuccess: (state, action) => {
      state.behaviorLoading = false;
      state.behaviorLogs = action.payload;
    },
    fetchBehaviorLogsFailure: (state, action) => {
      state.behaviorLoading = false;
      state.behaviorError = action.payload;
    },
    fetchBehaviorLogDetailStart: (state) => {
      state.behaviorLoading = true;
    },
    fetchBehaviorLogDetailSuccess: (state, action) => {
      state.behaviorLoading = false;
      state.selectedBehaviorLog = action.payload;
    },
    fetchBehaviorLogDetailFailure: (state, action) => {
      state.behaviorLoading = false;
      state.behaviorError = action.payload;
    },
    clearSelectedBehaviorLog: (state) => {
      state.selectedBehaviorLog = null;
    },
  },
});

export const {
  fetchComplaintsStart,
  fetchComplaintsSuccess,
  fetchComplaintsFailure,
  fetchComplaintDetailStart,
  fetchComplaintDetailSuccess,
  fetchComplaintDetailFailure,
  updateComplaintStart,
  updateComplaintSuccess,
  updateComplaintFailure,
  fetchBehaviorLogsStart,
  fetchBehaviorLogsSuccess,
  fetchBehaviorLogsFailure,
  fetchBehaviorLogDetailStart,
  fetchBehaviorLogDetailSuccess,
  fetchBehaviorLogDetailFailure,
  clearSelectedBehaviorLog,
} = admincomplaintSlice.actions;

export default admincomplaintSlice.reducer;