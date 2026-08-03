// src/modules/common/store/notificationSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notificationThunk";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload?.count || 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.unreadCount = 0;
      });

    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload?.results || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Mark as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.meta.arg;
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.is_read = true;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });

    // Mark All as Read
    builder
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => {
          n.is_read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
