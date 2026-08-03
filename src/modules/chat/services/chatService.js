// src/services/chatService.js (MOCK)
import {
  connectChatSocket,
  sendChatMessage,
  disconnectChatSocket,
  setPendingResolve,
} from './chatSocket';

/* ---------- In‑memory mock data ---------- */
let nextSessionId = 1;
const sessions = [];
const messagesStore = {}; // key: sessionId → array of messages

/* ---------- Helper ---------- */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------- Exported functions ---------- */

export const createSession = async ({ bot_type = 'general', title = 'New Chat', active_child = null }) => {
  await delay(200);
  const session = {
    id: nextSessionId++,
    bot_type,
    title,
    active_child,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);
  messagesStore[session.id] = [];
  return session;
};

export const startChatSocket = (sessionId, token) => {
   setCurrentSessionId(sessionId);
  connectChatSocket(
    sessionId,
    token,
    (message) => {
      // Store incoming assistant messages
      if (messagesStore[sessionId]) {
        messagesStore[sessionId].push(message);
      }
    },
    (error) => console.error('[Mock] Socket error', error)
  );
  return Promise.resolve();
};

export const sendMessageOverSocket = async (content) => {
  // Guess the current session ID from the socket (we can track it)
  // We'll retrieve it from the first argument of connectChatSocket via a module variable
  // For simplicity, we assume the last session created is the active one.
  // Better approach: export a function to set active session from thunks.
  // Here we use a simple module variable `currentSessionId`.
  const sid = currentSessionId;
  if (sid && messagesStore[sid]) {
    messagesStore[sid].push({
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    });
  }

  sendChatMessage(content);

  // Wait for the assistant reply via the pendingResolve mechanism
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      setPendingResolve(null);
      reject(new Error('Mock reply timeout'));
    }, 5000);

    setPendingResolve((reply) => {
      clearTimeout(timeout);
      resolve(reply);
    });
  });
};

// Keep track of the current session id (set when socket connects)
let currentSessionId = null;
export const setCurrentSessionId = (id) => {
  currentSessionId = id;
};

export const fetchSessions = async () => {
  await delay(100);
  return sessions.slice().sort((a, b) => b.id - a.id);
};

export const loadSessionMessages = async (sessionId) => {
  await delay(100);
  return messagesStore[sessionId] || [];
};

export const deleteSession = async (sessionId) => {
  await delay(100);
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index !== -1) sessions.splice(index, 1);
  delete messagesStore[sessionId];
  return sessionId;
};

export const closeChatSocket = () => {
    
  disconnectChatSocket();
};