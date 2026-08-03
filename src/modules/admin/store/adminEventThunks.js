import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// Fetch events
export const fetchEvents = createAsyncThunk(
    'adminEvent/fetchEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/events');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch participants
export const fetchParticipants = createAsyncThunk(
    'adminEvent/fetchParticipants',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/events/participants');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch certificates
export const fetchCertificates = createAsyncThunk(
    'adminEvent/fetchCertificates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/events/certificates');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Participants ------------------------------------------------

export const addParticipant = createAsyncThunk(
    'adminEvent/addParticipant',
    async ({ eventId, studentId, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/events/${eventId}/participants`, { studentId, ...data });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const removeParticipant = createAsyncThunk(
    'adminEvent/removeParticipant',
    async ({ eventId, participantId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/admin/events/${eventId}/participants/${participantId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const generateCertificate = createAsyncThunk(
    'adminEvent/generateCertificate',
    async ({ eventId, participantId, data }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/events/${eventId}/certificates`, { participantId, ...data });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchEventParticipants = createAsyncThunk(
    'adminEvent/fetchEventParticipants',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/events/${eventId}/participants`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchEventCertificates = createAsyncThunk(
    'adminEvent/fetchEventCertificates',
    async (eventId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/events/${eventId}/certificates`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// --- Event CRUD --------------------------------------------------

export const createEvent = createAsyncThunk(
    'adminEvent/createEvent',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/events', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateEvent = createAsyncThunk(
    'adminEvent/updateEvent',
    async ({ id, ...data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/events/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'adminEvent/deleteEvent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/admin/events/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchEventById = createAsyncThunk(
    'adminEvent/fetchEventById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/admin/events/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
