import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  Plus, Home, Clock, MessageSquare,
  Trash2, X, 
} from 'lucide-react';
import { clearCurrentChat, setCurrentSession } from '@/store/chat/chatSlice';
import { removeSession, loadHistory, disconnectChat, clearAllHistory } from '@/store/chat/chatThunks';

// Role → theme map (kept in sync with FloatingChatButton.jsx so the sidebar,
// floating button, and any other role-aware chrome all agree on the same
// colors per role).
const ROLE_THEMES = {
  admin: {
    primary: '#1d4ed8',
    hover: '#1e40af',
    soft: '#93c5fd',
  },
  teacher: {
    primary: '#059669',
    hover: '#047857',
    soft: '#6ee7b7',
  },
  student: {
    primary: '#d97706',
    hover: '#b45309',
    soft: '#fcd34d',
  },
  parent: {
    primary: '#7c3aed',
    hover: '#6d28d9',
    soft: '#c4b5fd',
  },
};

// Fallback (original teal) for unknown/missing roles
const DEFAULT_THEME = {
  primary: '#14b8a6',
  hover: '#0e7490',
  soft: '#5eead4',
};

// Role → Dashboard mapping
const dashboardPaths = {
  Admin: '/admin/dashboard',
  Teacher: '/teacher/dashboard',
  Student: '/student/dashboard',
  Parent: '/parent/dashboard',
};

// Format a timestamp the way the reference design shows it:
// today -> "10:45 AM", otherwise -> "Yesterday" / "May 18" style label.
function formatSessionTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, currentSession } = useSelector((s) => s.chat);
  const role = useSelector((s) => s.auth.user?.role_name) || '';
  const theme = ROLE_THEMES[role.toLowerCase()] || DEFAULT_THEME;

  // Exposed as CSS custom properties for dynamic theming
  const themeVars = {
    '--role-primary': theme.primary,
    '--role-hover': theme.hover,
    '--role-soft-bg': `${theme.primary}1a`,
    '--role-logo-bg': `${theme.primary}26`,
    '--role-soft-text': theme.soft,
  };

  const dashboardPath = dashboardPaths[role] || '';

  useEffect(() => {
    dispatch(loadHistory());
  }, [dispatch]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeOnMobile = () => onClose();

  const handleNewChat = () => {
    dispatch(disconnectChat());
    dispatch(clearCurrentChat());
    closeOnMobile();
  };

  const handleSelectSession = (session) => {
    dispatch(setCurrentSession(session));
    closeOnMobile();
  };

  const handleDelete = (e, sessionId) => {
    e.stopPropagation();
    dispatch(removeSession(sessionId));
  };

  const handleClearHistory = () => {
    dispatch(clearAllHistory());
  };

  const goToDashboard = () => {
    if (dashboardPath) {
      navigate(dashboardPath);
      closeOnMobile();
    }
  };

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] sm:max-w-[80vw] md:max-w-none
          bg-gradient-to-b from-[#0e1527] to-[#0a101c] text-slate-200 
          flex flex-col border-r border-white/5 h-full
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:z-auto md:w-72 md:max-w-none md:translate-x-0
        `}
        style={themeVars}
      >
        {/* Logo + close button */}
        <div className="p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--role-logo-bg)] rounded-xl flex items-center justify-center overflow-hidden shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9">
                <DotLottieReact
                  src="/animations/Live chatbot.lottie"
                  autoplay
                  loop
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
              ScholarAI
            </h1>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 sm:px-4 mb-2 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[var(--role-primary)] text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-[var(--role-hover)] transition"
          >
            <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Dashboard link */}
        {dashboardPath && (
          <nav className="px-3 sm:px-4 mt-1 shrink-0">
            <button
              onClick={goToDashboard}
              className={`w-full flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-lg text-left text-xs sm:text-sm transition
                ${!currentSession ? 'bg-[var(--role-soft-bg)] text-[var(--role-soft-text)] font-medium' : 'hover:bg-white/5 text-slate-400'}
              `}
            >
              <Home className="w-4 h-4 sm:w-[16px] sm:h-[16px]" />
              <span>Dashboard</span>
            </button>
          </nav>
        )}

        {/* History Section */}
        <div className="mt-3 sm:mt-4 px-3 sm:px-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 px-1 mb-2 shrink-0">
            <Clock className="w-3 h-3 sm:w-[12px] sm:h-[12px] text-slate-500" />
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">History</p>
          </div>

          <div
            className="flex-1 space-y-0.5 overflow-y-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Hide scrollbar for Chrome/Safari */}
            <style>{`
              .flex-1::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`flex items-center justify-between px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg cursor-pointer group transition ${
                  currentSession?.id === session.id
                    ? 'bg-[var(--role-soft-bg)] text-[var(--role-soft-text)]'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-2.5 truncate min-w-0 flex-1">
                  <MessageSquare className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px] shrink-0 text-slate-500" />
                  <span className="text-xs sm:text-sm truncate">
                    {session.title || 'Untitled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
                  <span className="text-[9px] sm:text-[11px] text-slate-500 whitespace-nowrap">
                    {formatSessionTime(session.updatedAt || session.createdAt)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition p-0.5"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Robot animation - pinned at bottom */}
          <div className="flex justify-center py-2 shrink-0">
            <div className="w-32 h-32 sm:w-36 sm:h-36">
              <DotLottieReact
                src="/animations/Mapping for machine learning.lottie"
                autoplay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Clear History Button */}
        {sessions.length > 0 && (
          <div className="p-3 sm:p-4 pt-1 shrink-0">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-red-500/10 text-red-400 text-xs sm:text-sm font-medium hover:bg-red-500/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px]" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}