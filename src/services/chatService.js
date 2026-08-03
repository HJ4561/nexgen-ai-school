import api from './api';

// Chat session management
export const createSession = async (data) => {
  const response = await api.post('/chat/sessions/', data);
  return response.data;
};

export const fetchSessions = async () => {
  const response = await api.get('/chat/sessions/');
  return response.data.results || response.data || [];
};

export const loadSessionMessages = async (sessionId) => {
  const response = await api.get('/chat/sessions/' + sessionId + '/messages/');
  return response.data.results || response.data || [];
};

export const deleteSession = async (sessionId) => {
  await api.delete('/chat/sessions/' + sessionId + '/');
  return sessionId;
};

// Socket management
let socket = null;
let messageListeners = [];
let pendingMessages = {};

export const startChatSocket = (sessionId, token) => {
  return new Promise((resolve, reject) => {
    try {
      // Close any existing socket
      closeChatSocket();
      
      // Use the same base URL as the API
      const baseUrl = 'https://school-backend-new-rho.vercel.app';
      // Convert http to ws
      const wsBase = baseUrl.replace(/^https/, 'wss').replace(/^http/, 'ws');
      
      // Construct WebSocket URL
      const wsUrl = wsBase + '/ws/chat/' + sessionId + '/?token=' + token;
      
      console.log('Connecting to WebSocket:', wsUrl);
      socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('Chat socket connected');
        resolve();
      };
      
      socket.onerror = (error) => {
        console.error('Chat socket error:', error);
        reject(error);
      };
      
      socket.onclose = () => {
        console.log('Chat socket closed');
        socket = null;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Socket message received:', data);
          
          // Handle different message types
          if (data.type === 'response' || data.type === 'message') {
            const messageId = data.message_id || data.id || Date.now();
            // Resolve pending promises
            if (pendingMessages[messageId]) {
              pendingMessages[messageId].resolve(data);
              delete pendingMessages[messageId];
            }
            // Notify all listeners
            messageListeners.forEach(listener => listener(data));
          }
        } catch (error) {
          console.error('Failed to parse socket message:', error);
        }
      };
      
    } catch (error) {
      reject(error);
    }
  });
};

export const sendMessageOverSocket = (content) => {
  return new Promise((resolve, reject) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      reject(new Error('Socket not connected. Please refresh and try again.'));
      return;
    }
    
    const messageId = Date.now();
    const message = {
      type: 'message',
      content: content,
      message_id: messageId,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending message over socket:', message);
    
    pendingMessages[messageId] = { resolve, reject };
    socket.send(JSON.stringify(message));
    
    setTimeout(() => {
      if (pendingMessages[messageId]) {
        const error = new Error('Response timeout');
        pendingMessages[messageId].reject(error);
        delete pendingMessages[messageId];
      }
    }, 30000);
  });
};

export const closeChatSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  pendingMessages = {};
  messageListeners = [];
};

export const addMessageListener = (listener) => {
  if (typeof listener === 'function') {
    messageListeners.push(listener);
  }
};

export const removeMessageListener = (listener) => {
  messageListeners = messageListeners.filter(l => l !== listener);
};

window.addEventListener('beforeunload', () => {
  closeChatSocket();
});
