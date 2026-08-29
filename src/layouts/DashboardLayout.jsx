// src/layouts/DashboardLayout.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { logout } from "@/modules/auth/store/authSlice";

// --- Import routes from dashboardRoutes ------------------------------
import {
  adminRoutes,
  teacherRoutes,
  studentRoutes,
  parentRoutes,
} from "@/utils/dashboardRoutes";

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

// --- Map roles to routes ----------------------------------------------
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

  // --- Detect role properly --------------------------------------
  const role = useMemo(() => {
    const roleFromUser = user?.role || user?.role_name || user?.user_type || '';
    const roleFromStorage = localStorage.getItem('user_role') || '';
    const finalRole = roleFromUser || roleFromStorage || 'admin';
    
    const validRoles = ['admin', 'teacher', 'student', 'parent'];
    return validRoles.includes(finalRole) ? finalRole : 'admin';
  }, [user]);

  const config = useMemo(() => rolePortalConfig[role] || defaultConfig, [role]);
  const sidebarItems = useMemo(() => routesMap[role] || [], [role]);

  // --- Notification count --------------------------------------------
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(0);
  }, []);

  // --- Logout handler -------------------------------------------------
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  // --- Navigation handlers --------------------------------------------
  const handleSettings = useCallback(() => {
    navigate(config.settingsPath);
  }, [navigate, config.settingsPath]);

  const handleNotifications = useCallback(() => {
    navigate(config.notificationsPath);
  }, [navigate, config.notificationsPath]);

  // --- State and refs -------------------------------------------------
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // --- Detect mobile screen -------------------------------------------
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Auto-close sidebar on route change (mobile) --------------------
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isMobileSidebarOpen]);

  // --- Scroll handler ------------------------------------------------
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

  const scrollToTop = useCallback(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // --- Toggle sidebar ------------------------------------------------
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  // --- Prevent body scroll when sidebar is open on mobile ------------
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileSidebarOpen]);

  // --- Render --------------------------------------------------------
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileSidebar}
          aria-hidden="true"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
              closeMobileSidebar();
            }
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative z-50 h-full transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-2xl lg:shadow-none
        `}
      >
        <Sidebar
          title={config.title}
          subtitle={config.subtitle}
          tone={role}
          items={sidebarItems}
          onLogout={handleLogout}
          onCloseMobile={closeMobileSidebar}
        />
      </div>

      {/* Main Content Area - REMOVED padding to eliminate space between sidebar and content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Navbar */}
        <Navbar
          userName={user?.full_name || user?.name || 'User'}
          userRole={role}
          onLogout={handleLogout}
          onSettingsClick={handleSettings}
          notificationCount={unreadCount}
          onNotificationClick={handleNotifications}
          onMenuClick={toggleMobileSidebar}
          isMobile={isMobile}
        />

        {/* Main content with proper scrolling - REMOVED padding */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto bg-gray-50"
        >
          {/* Content wrapper with NO padding - sidebar sits flush */}
          <div className="w-full min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-20 lg:bottom-24 right-3 sm:right-4 md:right-6 lg:right-8 z-30 p-2.5 lg:p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <svg 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardLayout;