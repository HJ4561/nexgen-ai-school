import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// Fetch complaints
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

// Fetch complaint detail
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

// Update complaint status
export const updateComplaintStatus = createAsyncThunk(
    'adminComplaint/updateComplaintStatus',
    async ({ id, status, resolution }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/complaints/${id}`, { status, resolution });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch behavior logs
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

// Fetch behavior log detail
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
