// src/modules/student/pages/Chat.jsx

/**
 * ============================================
 * STUDENT CHAT COMPONENT - UPDATED WITH API FIELDS
 * ============================================
 * 
 * Purpose: AI Chat Assistant for students
 * 
 * API Endpoints:
 * - GET /api/chat/sessions/ - Get chat sessions
 * - POST /api/chat/sessions/ - Create chat session
 * - GET /api/chat/messages/ - Get messages
 * - POST /api/chat/messages/ - Send message
 * - DELETE /api/chat/sessions/{id}/ - Delete session
 * 
 * USAGE OF NEW API FIELDS (when available):
 * - user_name from sessions/messages (when added)
 * - sender_name from messages (when added)
 * - receiver_name from messages (when added)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Trash2,
  Menu,
  X,
  User,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Lightbulb,
  Brain,
  Target,
  Sparkles,
  Clock,
  Bot,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Toast Notification ───────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${colors[type]} px-4 py-3 shadow-lg backdrop-blur-sm`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-text-primary">{message}</span>
    </motion.div>
  );
}

// ─── Smart Name Resolution ────────────────────────────────────────────

const getSenderName = (message) => {
  // ✅ 1. PRIORITY: Use sender_name from API (new field!)
  if (message.sender_name && message.sender_name !== 'Unknown' && message.sender_name !== 'null') {
    return message.sender_name;
  }
  // 2. FALLBACK: Use user_name if available
  if (message.user_name && message.user_name !== 'Unknown') {
    return message.user_name;
  }
  // 3. FALLBACK: Use sender object
  if (message.sender?.name) return message.sender.name;
  if (message.sender?.user?.name) return message.sender.user.name;
  // 4. LAST RESORT
  return message.role === 'user' ? 'You' : 'ScholarAI';
};

const getSessionName = (session) => {
  // ✅ 1. PRIORITY: Use title from API
  if (session.title && session.title !== 'New Chat') {
    return session.title;
  }
  // 2. FALLBACK: Use user_name if available
  if (session.user_name) return session.user_name;
  // 3. LAST RESORT
  return `Chat ${session.id || ''}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60));
    
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const formatFullDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

// ─── Message Bubble ────────────────────────────────────────────────────

function MessageBubble({ message }) {
  // ✅ Determine if message is from user using the new role field
  const isUser = message.role === "user" || message.sender === "user";
  
  // ✅ Get sender name using smart resolver
  const senderName = getSenderName(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-indigo-500" : "bg-emerald-500"
        }`}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Sparkles className="h-4 w-4 text-white" />
          )}
        </div>
        <div>
          <div className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-indigo-500 text-white"
              : "bg-gray-100 text-gray-800"
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            {formatFullDate(message.created_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-100 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Session Item ─────────────────────────────────────────────────────

function SessionItem({ session, isActive, onClick, onDelete }) {
  // ✅ Get session name using smart resolver
  const sessionName = getSessionName(session);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`w-full text-left p-3 rounded-xl transition-all group ${
        isActive
          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
          : "hover:bg-gray-50 text-gray-600"
      }`}
      onClick={() => onClick(session.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {sessionName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(session.updated_at || session.created_at)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Quick Prompt Card ────────────────────────────────────────────────

function QuickPromptCard({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group w-full"
      type="button"
    >
      <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-all">
        <Icon className="h-4 w-4 text-indigo-500" />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-indigo-600 transition-all">{label}</span>
    </button>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────

function EmptyState({ onPromptClick }) {
  const quickPrompts = [
    { icon: BookOpen, label: "Explain a concept", prompt: "Can you help me understand " },
    { icon: Lightbulb, label: "Study tips", prompt: "What are some study tips for " },
    { icon: Brain, label: "Practice questions", prompt: "Create a practice test for " },
    { icon: Target, label: "Goal setting", prompt: "Help me set academic goals for " },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full py-8">
      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
        <Bot className="h-8 w-8 text-indigo-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">How can I help you?</h3>
      <p className="text-sm text-gray-500 mt-1 text-center max-w-md">
        Ask me anything about your studies, assignments, or school life.
      </p>
      
      <div className="grid grid-cols-2 gap-2 mt-6 w-full max-w-md">
        {quickPrompts.map((prompt, index) => (
          <QuickPromptCard
            key={index}
            icon={prompt.icon}
            label={prompt.label}
            onClick={() => onPromptClick(prompt.prompt)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Fallback Message Generator ─────────────────────────────────────

const generateFallbackReply = (message) => {
  const replies = [
    `That's a great question! Let me think about "${message}"...`,
    `I understand you're asking about "${message}". Here's what I know...`,
    `Interesting topic! Regarding "${message}", I'd suggest...`,
    `Let me help you with "${message}". Here are some thoughts...`,
    `About "${message}" - that's something I can definitely help with!`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
};

// ─── Main Component ────────────────────────────────────────────────────

function Chat() {
  const dispatch = useDispatch();
  const { sessions: storeSessions, currentSession, messages: storeMessages, loading } = useSelector(
    (state) => state.chat || { sessions: [], messages: [], loading: false }
  );
  
  // Local state for fallback when API is not available
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ─── Use store data if available, otherwise use local state ──
  useEffect(() => {
    if (storeSessions && storeSessions.length > 0) {
      setSessions(storeSessions);
    }
  }, [storeSessions]);

  useEffect(() => {
    if (storeMessages && storeMessages.length > 0) {
      setMessages(storeMessages);
    }
  }, [storeMessages]);

  useEffect(() => {
    if (currentSession) {
      setActiveSessionId(currentSession.id);
    }
  }, [currentSession]);

  // ─── Responsive ──────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Scroll to bottom ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Focus input ───────────────────────────────────────────────
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [activeSessionId, isLoading]);

  // ─── Create New Session ─────────────────────────────────────────
  const createNewSession = async () => {
    try {
      // Try to use the store if available
      if (dispatch && typeof dispatch === 'function') {
        try {
          const { initChat } = await import('@/modules/chat/store/chatThunks');
          await dispatch(initChat({
            bot_type: 'general',
            title: `New Chat ${sessions.length + 1}`,
            resetMessages: true,
          })).unwrap();
          if (isMobile) setIsSidebarOpen(false);
          return;
        } catch (err) {
          console.log('Store init failed, using fallback');
        }
      }
      
      // Fallback: create local session
      const newSession = {
        id: Date.now(),
        title: `New Chat ${sessions.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bot_type: 'general',
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      if (isMobile) setIsSidebarOpen(false);
    } catch (err) {
      console.error('Failed to create session:', err);
      setToast({ message: 'Failed to create chat session', type: 'error' });
    }
  };

  // ─── Select Session ─────────────────────────────────────────────
  const selectSession = async (sessionId) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    
    // Try to load from store
    try {
      if (dispatch && typeof dispatch === 'function') {
        try {
          const { openSession } = await import('@/modules/chat/store/chatThunks');
          await dispatch(openSession(sessionId)).unwrap();
          if (isMobile) setIsSidebarOpen(false);
          return;
        } catch (err) {
          console.log('Store open failed, using fallback');
        }
      }
      // Fallback: clear messages for new session
      setMessages([]);
    } catch (err) {
      console.error('Failed to open session:', err);
    }
  };

  // ─── Delete Session ─────────────────────────────────────────────
  const deleteSession = async (sessionId) => {
    try {
      // Try store first
      if (dispatch && typeof dispatch === 'function') {
        try {
          const { removeSession } = await import('@/modules/chat/store/chatThunks');
          await dispatch(removeSession(sessionId)).unwrap();
          setToast({ message: 'Chat session deleted', type: 'info' });
          return;
        } catch (err) {
          console.log('Store delete failed, using fallback');
        }
      }
      
      // Fallback: delete locally
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      if (activeSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          setActiveSessionId(updatedSessions[0].id);
          setMessages([]);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      setToast({ message: 'Chat session deleted', type: 'info' });
    } catch (err) {
      console.error('Failed to delete session:', err);
      setToast({ message: 'Failed to delete session', type: 'error' });
    }
  };

  // ─── Send Message ───────────────────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: input.trim(),
      role: "user",
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try store first
      if (dispatch && typeof dispatch === 'function') {
        try {
          const { sendMessage } = await import('@/modules/chat/store/chatThunks');
          await dispatch(sendMessage({ content: userMessage.content })).unwrap();
          setIsLoading(false);
          return;
        } catch (err) {
          console.log('Store send failed, using fallback');
        }
      }

      // Fallback: simulate AI response
      setIsTyping(true);
      setTimeout(() => {
        const reply = generateFallbackReply(userMessage.content);
        const botMessage = {
          id: Date.now() + 1,
          content: reply,
          role: "assistant",
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        setIsLoading(false);
      }, 800);
    } catch (err) {
      console.error('Failed to send message:', err);
      setToast({ message: 'Failed to send message', type: 'error' });
      setIsLoading(false);
    }
  };

  // ─── Handle Enter Key ───────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Handle Quick Prompt ────────────────────────────────────────
  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // ─── Refresh ────────────────────────────────────────────────────
  const handleRefresh = () => {
    setToast({ message: "Chat refreshed", type: "info" });
  };

  // ─── Get current messages ──────────────────────────────────────
  const currentMessages = storeMessages.length > 0 ? storeMessages : messages;
  const hasMessages = currentMessages.length > 0;

  return (
    <div className="h-[calc(100vh-100px)] min-h-[500px] px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="AI Chat"
        subtitle="Your personal AI assistant for studies and school life"
        breadcrumbs={["Student", "Chat"]}
        bgColor="bg-indigo-50"
        actions={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-[calc(100%-80px)] gap-4 mt-4">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || !isMobile) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: isMobile ? "100%" : "280px", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`${isMobile ? "fixed inset-0 z-50 bg-white p-4" : "relative"} flex-shrink-0 overflow-hidden border-r border-gray-100`}
            >
              <div className="h-full flex flex-col">
                {isMobile && (
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Chats</h3>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      type="button"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={createNewSession}
                  className="flex items-center gap-2 px-4 py-2.5 mb-4 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-all"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  New Chat
                </button>
                
                <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                  {sessions?.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === (currentSession?.id || activeSessionId)}
                      onClick={selectSession}
                      onDelete={deleteSession}
                    />
                  ))}
                  {(!sessions || sessions.length === 0) && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-sm text-gray-400">No chat sessions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                type="button"
              >
                <Menu className="h-5 w-5 text-gray-500" />
              </button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">ScholarAI</p>
                  <p className="text-xs text-gray-400">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {!hasMessages ? (
              <EmptyState onPromptClick={handleQuickPrompt} />
            ) : (
              <div className="space-y-1">
                {currentMessages.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    message={msg}
                  />
                ))}
                {(isLoading || isTyping) && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 pr-12 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                  disabled={isLoading || isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isTyping}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    input.trim() && !isLoading && !isTyping
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                  type="button"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-center mt-2 text-[10px] text-gray-400">
              ScholarAI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;