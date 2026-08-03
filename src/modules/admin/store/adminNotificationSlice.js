// // src/store/admin/adminNotificationSlice.js

// import { createSlice } from '@reduxjs/toolkit';
// // ─── Load saved sent notifications from localStorage ──────────────
// const savedSent = JSON.parse(localStorage.getItem('sentNotifications') || '[]');
// const initialState = {
//   notifications: [],
//   sentNotifications: savedSent,
//   unreadCount: 0,
//   loading: false,
//   error: null,
//   submitting: false,
//   successMessage: null,
// };

// const adminNotificationSlice = createSlice({
//   name: 'adminNotification',
//   initialState,
//   reducers: {
//     clearNotificationError: (state) => { state.error = null; },
//     clearNotificationSuccess: (state) => { state.successMessage = null; },
//     // ─── Success Reducers ──────────────────────────────────────────
//     fetchNotificationsSuccess: (state, action) => {
//       state.notifications = action.payload;
//     },
//     fetchUnreadCountSuccess: (state, action) => {
//       state.unreadCount = action.payload;
//     },
//     markReadSuccess: (state, action) => {
//       const id = action.payload;
//       const notif = state.notifications.find(n => n.id === id);
//       if (notif) {
//         notif.is_read = true;
//         state.unreadCount = Math.max(0, state.unreadCount - 1);
//       }
//     },
//     markAllReadSuccess: (state) => {
//       state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
//       state.unreadCount = 0;
//     },
//   sendNotificationSuccess: (state, action) => {
//     // Get the original payload from meta.arg
//     const originalPayload = action.meta?.arg || {};

//     const newNotif = {
//       id: action.payload?.id || Date.now(),
//       message: originalPayload.message || action.payload?.detail || 'Notification sent',
//       created_at: new Date().toISOString(),
//       is_read: true,
//       receiver: originalPayload.receiver_id || originalPayload.target_role || 'All',
//       sender: 1, // admin
//     };

//     // Add to Redux state
//     state.sentNotifications.unshift(newNotif);
//     // Save to localStorage
//     localStorage.setItem('sentNotifications', JSON.stringify(state.sentNotifications));
//     },
//     clearSentNotifications: (state) => {
//     state.sentNotifications = [];
//     localStorage.removeItem('sentNotifications');
//    },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addMatcher(
//         (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/pending'),
//         (state, action) => {
//           if (action.type.includes('sendNotification')) {
//             state.submitting = true;
//           } else {
//             state.loading = true;
//           }
//           state.error = null;
//           state.successMessage = null;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/fulfilled'),
//         (state) => {
//           state.loading = false;
//           state.submitting = false;
//         }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.loading = false;
//           state.submitting = false;
//           state.error = action.payload || 'Something went wrong.';
//         }
//       );
//   },
// });

// export const {
//   clearNotificationError,
//   clearNotificationSuccess,
//   fetchNotificationsSuccess,
//   clearSentNotifications,
//   fetchUnreadCountSuccess,
//   markReadSuccess,
//   markAllReadSuccess,
//   sendNotificationSuccess,
// } = adminNotificationSlice.actions;

// export default adminNotificationSlice.reducer;
// src/store/admin/adminNotificationSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { sendNotification } from './adminNotificationThunks'; // import the thunk

// ─── Load saved sent notifications from localStorage ──────────────
const savedSent = JSON.parse(localStorage.getItem('sentNotifications') || '[]');

const initialState = {
  notifications: [],
  sentNotifications: savedSent,
  unreadCount: 0,
  loading: false,
  error: null,
  submitting: false,
  successMessage: null,
};

const adminNotificationSlice = createSlice({
  name: 'adminNotification',
  initialState,
  reducers: {
    clearNotificationError: (state) => { state.error = null; },
    clearNotificationSuccess: (state) => { state.successMessage = null; },
    // ─── Success Reducers ──────────────────────────────────────────
    fetchNotificationsSuccess: (state, action) => {
      state.notifications = action.payload;
    },
    fetchUnreadCountSuccess: (state, action) => {
      state.unreadCount = action.payload;
    },
    markReadSuccess: (state, action) => {
      const id = action.payload;
      const notif = state.notifications.find(n => n.id === id);
      if (notif) {
        notif.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadSuccess: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
      state.unreadCount = 0;
    },
    // We'll handle it via extraReducers
    clearSentNotifications: (state) => {
      state.sentNotifications = [];
      localStorage.removeItem('sentNotifications');
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── Handle sendNotification.fulfilled with meta.arg ──────
      .addCase(sendNotification.fulfilled, (state, action) => {
        const originalPayload = action.meta?.arg || {};
        const data = action.payload;

        // Build receiver display name
        let receiverDisplay = originalPayload.target_role || 'All';
        if (originalPayload.receiver_id) {
          // We don't have the user's name here, but we can store the ID
          receiverDisplay = `User ${originalPayload.receiver_id}`;
        }

        const newNotif = {
          id: data?.id || Date.now(),
          message: originalPayload.message || data?.detail || 'Notification sent',
          created_at: new Date().toISOString(),
          is_read: true,
          receiver: receiverDisplay,
          sender: 1,
        };

        state.sentNotifications.unshift(newNotif);
        localStorage.setItem('sentNotifications', JSON.stringify(state.sentNotifications));
      })

      // ─── Loading/error matchers ──────────────────────────────────
      .addMatcher(
        (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('sendNotification')) {
            state.submitting = true;
          } else {
            state.loading = true;
          }
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.submitting = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('adminNotification/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.submitting = false;
          state.error = action.payload || 'Something went wrong.';
        }
      );
  },
});

export const {
  clearNotificationError,
  clearNotificationSuccess,
  fetchNotificationsSuccess,
  fetchUnreadCountSuccess,
  markReadSuccess,
  markAllReadSuccess,
  clearSentNotifications,
  // sendNotificationSuccess is removed
} = adminNotificationSlice.actions;

export default adminNotificationSlice.reducer;