// src/services/chatSocket.js (MOCK)
let onMessageCallback = null;
let onErrorCallback = null;
let mockConnected = false;
let pendingResolve = null;

const generateMockReply = (message) => ({
  role: 'assistant',
  content: `You said: "${message}". This is a mock reply.`,
  created_at: new Date().toISOString(),
});

export const connectChatSocket = (sessionId, token, onMessage, onError) => {
  disconnectChatSocket();
  mockConnected = true;
  onMessageCallback = onMessage;
  onErrorCallback = onError;
  console.log(`[Mock] Socket connected for session ${sessionId}`);
};

export const sendChatMessage = (message) => {
  if (!mockConnected) {
    console.warn('[Mock] Socket not connected');
    return;
  }
  console.log(`[Mock] Sending: ${message}`);

  setTimeout(() => {
    const reply = generateMockReply(message);
    if (onMessageCallback) onMessageCallback(reply);
    // Resolve the pending promise (used by sendMessageOverSocket)
    if (pendingResolve) {
      pendingResolve(reply);
      pendingResolve = null;
    }
  }, 800);
};

export const setPendingResolve = (resolve) => {
  pendingResolve = resolve;
};

export const disconnectChatSocket = () => {
  mockConnected = false;
  onMessageCallback = null;
  onErrorCallback = null;
  pendingResolve = null;
  console.log('[Mock] Socket disconnected');
};