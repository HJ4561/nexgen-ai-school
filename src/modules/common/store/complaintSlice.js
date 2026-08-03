// src/store/complaints/complaintSlice.js

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchComplaints,
  fetchComplaintById,
  createComplaint,
} from "./complaintThunks";

const initialState = {
  complaints: [],
  selectedComplaint: null,
  loading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    clearSelectedComplaint: (state) => {
      state.selectedComplaint = null;
    },

    clearComplaintError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ==========================
      // Fetch Complaints
      // ==========================
      .addCase(fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================
      // Fetch Complaint By Id
      // ==========================
      .addCase(fetchComplaintById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedComplaint = action.payload;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==========================
      // Create Complaint
      // ==========================
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;

        // Add newly created complaint at the top
        state.complaints.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSelectedComplaint,
  clearComplaintError,
} = complaintSlice.actions;

export default complaintSlice.reducer;