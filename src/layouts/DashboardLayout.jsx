import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import { logout } from "../modules/auth/store/authSlice";

// ─── Import routes from dashboardRoutes ──────────────────────────────
import {
  adminRoutes,
  teacherRoutes,
  studentRoutes,
  parentRoutes,
} from "../utils/dashboardRoutes";

import FloatingChatButton from "../modules/chat/components/FloatingChatButton";
import ChatCompact from "../modules/chat/components/ChatCompact";
import AiSidebar from "../modules/chat/pages/AiWorkspacePage/Sidebar";
import AiNavbar from "../modules/chat/components/AiNavbar";

// ─── Notification thunks ──────────────────────────────
import { fetchUnreadCount, fetchUnreadNotifications } from '../modules/common/store/notificationThunk';

const rolePortalConfig = {
  admin: {
    title: "Admin Portal",
    subtitle: "Oversee everything",
    settingsPath: "/admin/settings",
    notificationsPath: "/admin/notifications",
  },
  teacher: {
    title: "Teacher Portal",
    subtitle: "Empower your class",
    settingsPath: "/teacher/settings",
    notificationsPath: "/teacher/notifications",
  },
  student: {
    title: "Student Portal",
    subtitle: "Achieve your goals",
    settingsPath: "/student/settings",
    notificationsPath: "/student/notifications",
  },
  parent: {
    title: "Parent Portal",
    subtitle: "Support your child",
    settingsPath: "/parent/settings",
    notificationsPath: "/parent/notifications",
  },
};

const defaultConfig = {
  title: "School AI",
  subtitle: "Personalized Assistant",
  settingsPath: "/settings",
  notificationsPath: "/notifications",
};

// ─── Map roles to routes ──────────────────────────────────────────────
const routesMap = {
  admin: adminRoutes,
  teacher: teacherRoutes,
  student: studentRoutes,
  parent: parentRoutes,
};

const SCROLL_TOP_THRESHOLD = 20;

function DashboardLayout() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Fix: Detect role properly ──────────────────────────────────────
  // Check multiple sources for role
  const roleFromUser = user?.role || user?.role_name || user?.user_type || '';
  const roleFromStorage = localStorage.getItem('user_role') || '';
  const role = roleFromUser || roleFromStorage || 'admin';

  console.log('📋 DashboardLayout - User:', user);
  console.log('📋 DashboardLayout - Role from user:', roleFromUser);
  console.log('📋 DashboardLayout - Role from storage:', roleFromStorage);
  console.log('📋 DashboardLayout - Final Role:', role);

  const config = rolePortalConfig[role] || defaultConfig;
  const sidebarItems = routesMap[role] || [];

  console.log('📋 DashboardLayout - Sidebar Items count:', sidebarItems?.length || 0);

  const isAdmin = role === 'admin';
  const adminUnread = useSelector(
    (state) => state.adminNotification?.unreadCount || 0
  );
  const commonUnreadList = useSelector(
    (state) => state.notifications?.unreadNotifications || []
  );
  const unreadCount = isAdmin ? adminUnread : commonUnreadList.length;

  useEffect(() => {
    if (isAdmin) {
      try { dispatch(fetchUnreadCount()); } catch (e) { console.log('fetchUnreadCount not available'); }
    } else {
      try { 
        const roleParam = role || 'student';
        dispatch(fetchUnreadNotifications(roleParam)); 
      } catch (e) { 
        console.log('fetchUnreadNotifications not available'); 
      }
    }
  }, [dispatch, isAdmin, role]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isAiWorkspace = location.pathname === '/ai-workspace';
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const mainRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const handleScroll = () => {
      setShowScrollTop(el.scrollTop > SCROLL_TOP_THRESHOLD);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToTop = () => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-dim">
      {isAiWorkspace ? (
        <AiSidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          title={config.title}
          subtitle={config.subtitle}
          tone={role}
          items={sidebarItems}
          onLogout={handleLogout}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        {isAiWorkspace ? (
          <AiNavbar
            userName={user?.full_name || user?.name || 'User'}
            userRole={role}
            onLogout={handleLogout}
            onSettingsClick={() => navigate(config.settingsPath)}
            notificationCount={unreadCount}
            onNotificationClick={() => navigate(config.notificationsPath)}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        ) : (
          <Navbar
            userName={user?.full_name || user?.name || 'User'}
            userRole={role}
            onLogout={handleLogout}
            onSettingsClick={() => navigate(config.settingsPath)}
            notificationCount={unreadCount}
            onNotificationClick={() => navigate(config.notificationsPath)}
          />
        )}

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto"
        >
          <Outlet />
        </main>

      </div>

      <FloatingChatButton />
      <ChatCompact />
    </div>
  );
}

export default DashboardLayout;
