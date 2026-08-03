// src/store/complaints/complaintThunk.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import complaintService from "@/modules/common/services/complaintService"

// ==========================
// Get All Complaints
// payload = role
// Example:
// dispatch(fetchComplaints("student"))
// ==========================
export const fetchComplaints = createAsyncThunk(
  "complaints/fetchComplaints",
  async (role, { rejectWithValue }) => {
    try {
      const data = await complaintService.getComplaints(role);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch complaints."
      );
    }
  }
);

// ==========================
// Get Complaint By ID
// payload = { role, id }
// ==========================
export const fetchComplaintById = createAsyncThunk(
  "complaints/fetchComplaintById",
  async ({ role, id }, { rejectWithValue }) => {
    try {
      const data = await complaintService.getComplaintById(role, id);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch complaint."
      );
    }
  }
);

// ==========================
// Create Complaint
// payload = { role, complaintData }
// ==========================
export const createComplaint = createAsyncThunk(
  "complaints/createComplaint",
  async ({ role, complaintData }, { rejectWithValue }) => {
    try {
      const data = await complaintService.createComplaint(
        role,
        complaintData
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create complaint."
      );
    }
  }
);

