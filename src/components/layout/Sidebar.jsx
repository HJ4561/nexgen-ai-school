// src/components/layout/Sidebar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  UsersRound,
  Briefcase,
  UserCheck,
  School,
  BookOpen,
  Calendar,
  ClipboardList,
  FileCheck,
  BookMarked,
  Award,
  Clock,
  AlertCircle,
  DollarSign,
  Wallet,
  TrendingUp,
  Package,
  MessageSquare,
  Bell,
  Megaphone,
  CalendarDays,
  Settings,
  LogOut,
  Building2,
  Layers,
  Grid,
  Bus,
  Library,
  Utensils,
  Shield,
  Database,
  Sparkles,
  File,
  Menu,
  X,
} from 'lucide-react';

const Sidebar = ({ 
  title = "Smart School", 
  subtitle = "Admin Panel", 
  items = [], 
  onLogout,
  onCloseMobile // Add this prop for mobile close
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close sidebar
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    if (onCloseMobile) {
      onCloseMobile();
    }
  }, [onCloseMobile]);

  // Handle item click
  const handleItemClick = useCallback(() => {
    if (isMobile) {
      closeSidebar();
    }
  }, [isMobile, closeSidebar]);

  // If no items, show a message
  if (!items || items.length === 0) {
    return (
      <div className="flex h-full flex-col bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#080d16] text-white w-64 border-r border-white/5 shadow-2xl">
        <div className="flex items-center border-b border-white/5 px-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg bg-blue-500/20">
              <GraduationCap size={20} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                {title}
              </p>
              <p className="text-[11px] text-white/40 font-medium leading-tight mt-0.5 truncate">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-white/40 text-sm text-center">No menu items available</p>
        </div>
        <div className="px-2.5 pb-4 pt-2 border-t border-white/5">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200"
          >
            <LogOut size={17} className="shrink-0" />
            <span className="text-sm font-medium leading-none">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          transition: background 0.2s;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827] px-3 sm:px-4 py-3 flex items-center justify-between border-b border-white/5">
        <button
          onClick={toggleSidebar}
          className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X size={22} className="sm:w-6 sm:h-6" /> : <Menu size={22} className="sm:w-6 sm:h-6" />}
        </button>
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-500/20">
            <GraduationCap size={16} className="sm:w-[18px] sm:h-[18px] text-blue-500" />
          </div>
          <span className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
            {title}
          </span>
        </div>
        <div className="w-8 sm:w-10" />
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 sm:w-72 lg:w-64
          bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#080d16] text-white
          border-r border-white/5 shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col h-screen
        `}
      >
        {/* Header - hidden on mobile */}
        <div className="hidden lg:flex items-center border-b border-white/5 px-4 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg bg-blue-500/20">
              <GraduationCap size={20} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                {title}
              </p>
              <p className="text-[11px] text-white/40 font-medium leading-tight mt-0.5 truncate">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-3 mt-14 lg:mt-0">
          <ul className="space-y-0.5 sm:space-y-1">
            {items.map((item, idx) => {
              if (item.type === "divider") {
                return (
                  <li key={`divider-${idx}`} className="px-3 pt-3 sm:pt-4 pb-1.5 first:pt-1">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/25">
                      {item.label}
                    </span>
                  </li>
                );
              }

              const Icon = item.icon;

              return (
                <li key={item.path || item.label}>
                  <NavLink
                    to={item.path}
                    onClick={handleItemClick}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={15} className="sm:w-[17px] sm:h-[17px] shrink-0" />
                    <span className="font-medium leading-none truncate">
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-2.5 pb-3 sm:pb-4 pt-2 border-t border-white/5 shrink-0">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-2.5 sm:gap-3 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200"
          >
            <LogOut size={15} className="sm:w-[17px] sm:h-[17px] shrink-0" />
            <span className="text-xs sm:text-sm font-medium leading-none">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && isMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;