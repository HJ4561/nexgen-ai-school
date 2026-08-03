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
    soft: '#93c5fd',   // light tint used for text on the dark sidebar bg
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

// Fallback (original teal) for unknown/missing roles — matches
// FloatingChatButton's DEFAULT_THEME.
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

// Controlled component: the mobile open/close state and its hamburger
// trigger live in AiNavbar / DashboardLayout so there's a single mobile
// bar instead of this component rendering its own on top of AiNavbar.
export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, currentSession } = useSelector((s) => s.chat);
  const role = useSelector((s) => s.auth.user?.role_name) || '';   // empty string if missing
  const theme = ROLE_THEMES[role.toLowerCase()] || DEFAULT_THEME;

  // Exposed as CSS custom properties so Tailwind's bg-[var(--role-primary)]
  // (a static class name Tailwind can compile ahead of time) can reference a
  // value that actually changes at runtime per role.
  const themeVars = {
    '--role-primary': theme.primary,
    '--role-hover': theme.hover,
    '--role-soft-bg': `${theme.primary}1a`,   // ~10% alpha, for active-row backgrounds
    '--role-logo-bg': `${theme.primary}26`,   // ~15% alpha, matches old bg-indigo-500/15
    '--role-soft-text': theme.soft,
  };

  // Determine dashboard path, fallback to empty string if role unknown
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

  // Navigate to dashboard only if valid path exists
  const goToDashboard = () => {
    if (dashboardPath) {
      navigate(dashboardPath);
      closeOnMobile();
    }
  };

  return (
    <>
      {/* Backdrop (mobile only, shown when drawer is open) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw]
          bg-gradient-to-b from-[#0e1527] to-[#0a101c] text-slate-200 flex flex-col border-r border-white/5 h-full
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:static md:z-auto md:w-72 md:max-w-none md:translate-x-0
        `}
        style={themeVars}
      >
        {/* Logo (desktop) + close button (mobile) */}
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[var(--role-logo-bg)] rounded-xl flex items-center justify-center overflow-hidden">
              {/* Was hardcoded to w-18 h-18 (72px) inside a w-9 h-9 (36px) box —
                  same bug as MessageBubble's avatar: the animation got
                  cropped to whatever corner happened to land in the box
                  instead of being scaled down to fit it. */}
              <div className="w-9 h-9">
                <DotLottieReact
                  src="/animations/Live chatbot.lottie"
                  autoplay
                  loop
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100">ScholarAI</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-4 mb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--role-primary)] text-white text-sm font-semibold shadow-sm hover:bg-[var(--role-hover)] transition"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Dashboard link (kept for role-based navigation; not shown in reference design) */}
        {dashboardPath && (
          <nav className="px-4 mt-1">
            <button
              onClick={goToDashboard}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition
                ${!currentSession ? 'bg-[var(--role-soft-bg)] text-[var(--role-soft-text)] font-medium' : 'hover:bg-white/5 text-slate-400'}
              `}
            >
              <Home size={16} />
              <span>Dashboard</span>
            </button>
          </nav>
        )}

        {/* History */}
        <div className="mt-4 px-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-1.5 px-1 mb-2 shrink-0">
            <Clock size={12} className="text-slate-500" />
            <p className="text-[11px] font-medium text-slate-500">History</p>
          </div>

          <div
            className="space-y-0.5 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', maxHeight: '9rem' }}
          >
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition ${
                  currentSession?.id === session.id
                    ? 'bg-[var(--role-soft-bg)] text-[var(--role-soft-text)]'
                    : 'hover:bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare size={14} className="shrink-0 text-slate-500" />
                  <span className="text-sm truncate">{session.title || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  <span className="text-[11px] text-slate-500">
                    {formatSessionTime(session.updatedAt || session.createdAt)}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, session.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Robot — pinned here, outside the scrollable list above, so it
              stays visible no matter how many sessions there are.
              Sized to w-32/h-32 (128px), not w-72/h-72: at w-72 it was
              wider than the sidebar's own content area (w-72 minus px-4
              padding on each side) and would have overflowed. */}
          <div className="flex flex-1 items-center justify-center py-2">
            <div className="w-42 h-42">
              <DotLottieReact
                src="/animations/Mapping for machine learning.lottie"
                autoplay
                loop
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Clear History */}
        {sessions.length > 0 && (
          <div className="p-4 pt-2">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
