import { createSlice } from '@reduxjs/toolkit';
import {
  initChat,
  sendMessage,
  disconnectChat,
  loadHistory,
  openSession,
  removeSession,
  clearAllHistory,
} from './chatThunks';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessions: [],
    currentSession: null,
    messages: [],
    isCompactOpen: false,
    loading: false,
    error: null,
    activeChild: null,
  },
  reducers: {
    toggleCompact: (state) => {
      state.isCompactOpen = !state.isCompactOpen;
    },
    closeCompact: (state) => {
      state.isCompactOpen = false;
    },
    setActiveChild: (state, action) => {
      state.activeChild = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentSession = null;
      state.messages = [];
    },
    addSessionToList: (state, action) => {
      state.sessions.unshift(action.payload);
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // initChat
      .addCase(initChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(initChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.sessions.unshift(action.payload);
        // Skip when sendMessage created this session internally for a first
        // message — action.meta.arg.resetMessages is false in that case —
        // so the optimistic user bubble already in state.messages survives.
        if (action.meta.arg.resetMessages !== false) {
          state.messages = [];
        }
      })
      .addCase(initChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state, action) => {
        state.loading = true;
        // Optimistically show the user's message right away, before the
        // assistant's reply comes back. action.meta.arg is the original
        // { content } passed to dispatch(sendMessage(...)).
        state.messages.push({
          role: 'user',
          content: action.meta.arg.content,
          created_at: new Date().toISOString(),
          pending: true, // lets the UI mark it as "sending" if desired
        });
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { assistantMessage } = action.payload;

        // Clear the pending flag on the user message we already pushed.
        const lastUser = [...state.messages].reverse().find((m) => m.role === 'user' && m.pending);
        if (lastUser) delete lastUser.pending;

        state.messages.push(assistantMessage);

        // Auto‑title the session after first user message
        if (state.currentSession && state.messages.length === 2) {
          state.currentSession.title = state.messages[0].content.slice(0, 40);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;

        // Roll back the optimistic user message so the UI doesn't show a
        // message that never actually sent. Mark it failed instead if you'd
        // rather keep it visible with a retry affordance.
        const idx = [...state.messages].reverse().findIndex((m) => m.role === 'user' && m.pending);
        if (idx !== -1) {
          state.messages.splice(state.messages.length - 1 - idx, 1);
        }
      })
      // loadHistory
      .addCase(loadHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // openSession
      .addCase(openSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(openSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload.session;
        state.messages = action.payload.messages;
      })
      .addCase(openSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // removeSession
      .addCase(removeSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeSession.fulfilled, (state, action) => {
        state.loading = false;
        const sessionId = action.payload;
        state.sessions = state.sessions.filter((s) => s.id !== sessionId);
        if (state.currentSession?.id === sessionId) {
          state.currentSession = null;
          state.messages = [];
        }
      })
      .addCase(removeSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // clearAllHistory
      .addCase(clearAllHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearAllHistory.fulfilled, (state) => {
        state.loading = false;
        state.sessions = [];
        state.currentSession = null;
        state.messages = [];
      })
      .addCase(clearAllHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // disconnectChat
      .addCase(disconnectChat.fulfilled, () => {});
  },
});

export const {
  toggleCompact,
  closeCompact,
  setActiveChild,
  clearCurrentChat,
  addSessionToList,
  setCurrentSession,
  setMessages,
} = chatSlice.actions;

export default chatSlice.reducer;