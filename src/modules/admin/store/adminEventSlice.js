// src/store/admin/adminEventSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  participants: {},   // ← changed from [] to {}
  certificates: [],
  loading: false,
  error: null,
  submitting: false,
  successMessage: null,
};

const adminEventSlice = createSlice({
  name: 'adminEvent',
  initialState,
  reducers: {
    clearEventError: (state) => { state.error = null; },
    clearEventSuccess: (state) => { state.successMessage = null; },
    // Events
    fetchEventsSuccess: (state, action) => {
      state.events = action.payload;
    },
    createEventSuccess: (state, action) => {
      state.events.push(action.payload);
    },
    updateEventSuccess: (state, action) => {
      const index = state.events.findIndex(e => e.id === action.payload.id);
      if (index !== -1) state.events[index] = action.payload;
    },
    deleteEventSuccess: (state, action) => {
      state.events = state.events.filter(e => e.id !== action.payload);
      delete state.participants[action.payload]; // remove participants for deleted event
    },

    // Participants (stored per event)
    fetchParticipantsSuccess: (state, action) => {
    const { eventId, data } = action.payload;
    state.participants[eventId] = data; // already filtered
    },
    addParticipantSuccess: (state, action) => {
      const newParticipant = action.payload;
      const eventId = newParticipant.event;
      if (state.participants[eventId]) {
        state.participants[eventId].push(newParticipant);
      } else {
        state.participants[eventId] = [newParticipant];
      }
    },
    removeParticipantSuccess: (state, action) => {
      const participantId = action.payload;
      for (const eventId in state.participants) {
        const list = state.participants[eventId];
        const index = list.findIndex(p => p.id === participantId);
        if (index !== -1) {
          list.splice(index, 1);
          if (list.length === 0) {
            delete state.participants[eventId];
          }
          break;
        }
      }
    },

    // Certificates
    fetchCertificatesSuccess: (state, action) => {
      state.certificates = action.payload;
    },
    generateCertificateSuccess: (state, action) => {
      state.certificates.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('adminEvent/') && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('create') || action.type.includes('update') || action.type.includes('delete')) {
            state.submitting = true;
          } else {
            state.loading = true;
          }
          state.error = null;
          state.successMessage = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('adminEvent/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.submitting = false;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('adminEvent/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.submitting = false;
          state.error = action.payload || 'Something went wrong.';
        }
      );
  },
});

export const {
  clearEventError,
  clearEventSuccess,
  fetchEventsSuccess,
  createEventSuccess,
  updateEventSuccess,
  deleteEventSuccess,
  fetchParticipantsSuccess,
  addParticipantSuccess,
  removeParticipantSuccess,
  fetchCertificatesSuccess,
  generateCertificateSuccess,
} = adminEventSlice.actions;

export default adminEventSlice.reducer;