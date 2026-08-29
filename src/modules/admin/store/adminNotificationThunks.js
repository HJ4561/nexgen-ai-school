// src/modules/admin/store/adminNotificationThunks.js

import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'adminNotification/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/notifications');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
    'adminNotification/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/notifications/unread-count');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Mark notification as read
export const markNotificationRead = createAsyncThunk(
    'adminNotification/markRead',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Mark all notifications as read
export const markAllNotificationsRead = createAsyncThunk(
    'adminNotification/markAllRead',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.put('/admin/notifications/read-all');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Send notification
export const sendNotification = createAsyncThunk(
    'adminNotification/send',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/notifications', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);