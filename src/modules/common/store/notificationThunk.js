import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

/**
 * Fetch unread notification count for admin
 */
export const fetchUnreadCount = createAsyncThunk(
  'adminNotification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Failed to fetch admin unread count:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

/**
 * Fetch all notifications for a specific role
 */
export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAllNotifications',
  async ({ role, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? '/admin/notifications'
        : `/${role}/notifications`;
      
      const response = await api.get(endpoint, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${role} notifications:`, error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * Fetch notifications (alias for fetchAllNotifications)
 */
export const fetchNotifications = fetchAllNotifications;

/**
 * Fetch unread notifications for a specific role
 */
export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnreadNotifications',
  async (role, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin' 
        ? '/admin/notifications/unread'
        : `/${role}/notifications/unread`;
      
      const response = await api.get(endpoint);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error(`Failed to fetch ${role} unread notifications:`, error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ role, notificationId }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? `/admin/notifications/${notificationId}/read`
        : `/${role}/notifications/${notificationId}/read`;
      
      const response = await api.patch(endpoint);
      return { id: notificationId, ...response.data };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as read');
    }
  }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (role, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? '/admin/notifications/read-all'
        : `/${role}/notifications/read-all`;
      
      const response = await api.patch(endpoint);
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async ({ role, notificationId }, { rejectWithValue }) => {
    try {
      const endpoint = role === 'admin'
        ? `/admin/notifications/${notificationId}`
        : `/${role}/notifications/${notificationId}`;
      
      const response = await api.delete(endpoint);
      return { id: notificationId, ...response.data };
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);