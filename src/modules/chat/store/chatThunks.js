import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  createSession,
  startChatSocket,
  sendMessageOverSocket,
  closeChatSocket,
  fetchSessions,
  loadSessionMessages,
  deleteSession,
} from '@/modules/chat/services/chatService';

const getToken = (thunkAPI) => {
  const state = thunkAPI.getState();
  return state.auth.token; // or wherever your token lives
};

export const initChat = createAsyncThunk(
  'chat/initChat',
  // resetMessages: true when the user explicitly starts a new chat (clears
  // the message list). sendMessage sets this to false when it creates a
  // session on the fly for a first message, so it doesn't wipe out the
  // optimistic user bubble that was just pushed in sendMessage.pending.
  async ({ bot_type = 'general', title = 'New Chat', activeChild = null, resetMessages = true }, thunkAPI) => {
    const token = getToken(thunkAPI);
    const session = await createSession({ bot_type, title, active_child: activeChild });
    await startChatSocket(session.id, token);
    return session;
  }
);

// The user's message is pushed into state optimistically (see chatSlice's
// sendMessage.pending case) so it renders immediately, before the assistant
// replies. This thunk only needs to resolve with the assistant's reply.
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content }, thunkAPI) => {
    const state = thunkAPI.getState();
    let session = state.chat.currentSession;
    if (!session) {
      session = await thunkAPI.dispatch(initChat({ resetMessages: false })).unwrap();
    }
    const assistantMessage = await sendMessageOverSocket(content);
    return { assistantMessage };
  }
);

export const loadHistory = createAsyncThunk(
  'chat/loadHistory',
  async (_, thunkAPI) => {
    const sessions = await fetchSessions();
    return sessions;
  }
);

export const openSession = createAsyncThunk(
  'chat/openSession',
  async (sessionId, thunkAPI) => {
    const messages = await loadSessionMessages(sessionId);
    const session = thunkAPI.getState().chat.sessions.find(s => s.id === sessionId);
    return { session, messages };
  }
);

export const removeSession = createAsyncThunk(
  'chat/removeSession',
  async (sessionId, thunkAPI) => {
    await deleteSession(sessionId);
    return sessionId;
  }
);

// Deletes every session currently in state. There's no bulk-clear endpoint
// wired up in chatService yet, so this fans out a deleteSession call per
// session and waits for them all to finish. If the backend later exposes a
// single "clear all" endpoint, swap the Promise.all below for that call.
export const clearAllHistory = createAsyncThunk(
  'chat/clearAllHistory',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const sessionIds = state.chat.sessions.map((s) => s.id);
    await Promise.all(sessionIds.map((id) => deleteSession(id)));
    return sessionIds;
  }
);

export const disconnectChat = createAsyncThunk('chat/disconnect', async () => {
  closeChatSocket();
});
