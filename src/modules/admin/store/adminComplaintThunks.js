// src/modules/admin/store/adminComplaintThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// ─── Fetch complaints ──────────────────────────────────────────────────
export const fetchComplaints = createAsyncThunk(
    'adminComplaint/fetchComplaints',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/complaints', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Fetch complaint detail ──────────────────────────────────────────
export const fetchComplaintDetail = createAsyncThunk(
    'adminComplaint/fetchComplaintDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/complaints/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Update complaint status ──────────────────────────────────────────
export const updateComplaintStatus = createAsyncThunk(
    'adminComplaint/updateComplaintStatus',
    async ({ id, status, resolution, admin_remarks }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/complaints/${id}`, { 
                status, 
                resolution,
                admin_remarks,
                resolution_notes: resolution || admin_remarks,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Update complaint (alias for updateComplaintStatus) ──────────────
export const updateComplaint = createAsyncThunk(
    'adminComplaint/updateComplaint',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/admin/complaints/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Create complaint ──────────────────────────────────────────────────
export const createComplaint = createAsyncThunk(
    'adminComplaint/createComplaint',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/complaints', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Delete complaint ──────────────────────────────────────────────────
export const deleteComplaint = createAsyncThunk(
    'adminComplaint/deleteComplaint',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/admin/complaints/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Fetch behavior logs ──────────────────────────────────────────────
export const fetchBehaviorLogs = createAsyncThunk(
    'adminComplaint/fetchBehaviorLogs',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/behavior-logs', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// ─── Fetch behavior log detail ────────────────────────────────────────
export const fetchBehaviorLogDetail = createAsyncThunk(
    'adminComplaint/fetchBehaviorLogDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/behavior-logs/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export default {
    fetchComplaints,
    fetchComplaintDetail,
    updateComplaintStatus,
    updateComplaint,
    createComplaint,
    deleteComplaint,
    fetchBehaviorLogs,
    fetchBehaviorLogDetail,
};