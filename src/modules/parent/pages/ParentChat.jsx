/**
 * ============================================
 * PARENT CHAT COMPONENT
 * ============================================
 * 
 * Purpose: AI chat assistant for parents
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Chat interface with AI assistant
 * - Message history
 * - Chat session management
 * - Send messages
 * - Typing indicator
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/chat/sessions/ - Get chat sessions
 * - POST /api/chat/sessions/ - Create session
 * - GET /api/chat/messages/ - Get messages
 * - POST /api/chat/messages/ - Send message
 * 
 * Usage:
 * <Route path="/parent/chat" element={<ParentChat />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  Send,
  RefreshCw,
  AlertCircle,
  User,
  Bot,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/admin/animations/index.jsx";

import {
  fetchChatSessions,
  createChatSession,
  fetchChatMessages,
  createChatMessage,
  deleteChatSession,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getTimeAgo = (dateString) => {
  if (!dateString) return "—";
  try {
    const now = new Date();
    const diff = now - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateString);
  } catch {
    return "—";
  }
};

// ─── Message Bubble Component ──────────────────────────────────────────

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
      }`}>
        {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
      </div>
      <div className={`max-w-[75%] sm:max-w-[70%] ${isUser ? 'order-first' : ''}`}>
        <div className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-sm sm:text-base ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
        }`}>
          {message.content}
        </div>
        <div className={`text-[10px] sm:text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
          {getTimeAgo(message.created_at)}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentChat = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  // Use direct state access since selectors don't exist
  const sessions = useSelector((state) => state.parent.chatSessions || []);
  const messages = useSelector((state) => state.parent.chatMessages || []);
  const currentSession = useSelector((state) => state.parent.activeSession || null);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs ─────────────────────────────────────────────────────────────
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchChatSessions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSessionId) {
      dispatch(fetchChatMessages({ session_id: selectedSessionId }));
    }
  }, [dispatch, selectedSessionId]);

  // ─── Auto-scroll to bottom ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const result = await dispatch(createChatSession({
        title: `Chat ${sessions.length + 1}`,
        context: "Parent Support",
      })).unwrap();
      setSelectedSessionId(result.id);
      setIsMobileSidebarOpen(false);
    } catch (error) {
      showToast(error || "Failed to create chat", "error");
    }
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    try {
      await dispatch(deleteChatSession(sessionId)).unwrap();
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
      showToast("Chat session deleted", "success");
    } catch (error) {
      showToast(error || "Failed to delete chat", "error");
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || sending || !selectedSessionId) return;

    setSending(true);
    try {
      await dispatch(createChatMessage({
        session_id: selectedSessionId,
        content: input.trim(),
        role: "user",
        type: "text",
      })).unwrap();
      setInput("");
    } catch (error) {
      showToast(error || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="AI Chat Assistant"
          subtitle="Get help and answers from ScholarAI"
          breadcrumbs={["Parent", "Chat"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Button
                variant="primary"
                size="sm"
                onClick={handleNewChat}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                New Chat
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading chat</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <Card className="overflow-hidden border border-gray-100 h-[calc(100vh-280px)] min-h-[400px] flex flex-col sm:flex-row">
        {/* Sidebar - Sessions */}
        <div className={`${isMobileSidebarOpen ? 'block' : 'hidden'} sm:block absolute sm:relative inset-0 sm:inset-auto z-10 sm:z-auto bg-white sm:bg-transparent w-full sm:w-64 md:w-72 border-r border-gray-200 flex-shrink-0`}>
          <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chats ({sessions.length})
            </h3>
            <button
              className="sm:hidden p-1 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] p-2 space-y-1">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No chats yet</p>
                <Button variant="outline" size="sm" onClick={handleNewChat} className="mt-2">
                  Start a chat
                </Button>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title || "Chat"}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(session.created_at)}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Chat Header */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <button
                className="sm:hidden p-1.5 rounded-lg hover:bg-gray-200"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {currentSession ? (
                <div>
                  <p className="text-sm font-medium text-gray-800">{currentSession.title || "Chat"}</p>
                  <p className="text-xs text-gray-500">{formatDate(currentSession.created_at)}</p>
                </div>
              ) : selectedSessionId ? (
                <div>
                  <p className="text-sm font-medium text-gray-800">Chat</p>
                  <p className="text-xs text-gray-500">Loading...</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Select or start a chat</p>
              )}
            </div>
            {selectedSessionId && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                <Bot className="w-3 h-3 mr-1" />
                AI Assistant
              </Badge>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {!selectedSessionId ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-16 h-16 text-gray-300 mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">Welcome to ScholarAI Chat</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">
                  Ask me anything about your child's education, school policies, or general questions.
                </p>
                <Button variant="primary" size="sm" onClick={handleNewChat} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-12 h-12 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  isUser={message.role === "user"}
                />
              ))
            )}
            {sending && (
              <div className="flex items-center gap-2 text-gray-400">
                <Bot className="w-5 h-5" />
                <span className="text-sm">ScholarAI is typing...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2.5 sm:p-3 border-t border-gray-100 bg-white shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base resize-none min-h-[40px] max-h-[120px]"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  disabled={!selectedSessionId}
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendMessage}
                disabled={!input.trim() || sending || !selectedSessionId}
                className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-4"
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParentChat;