import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronRight,
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
  Video,
} from 'lucide-react';

const Sidebar = ({ title = "Smart School", subtitle = "Admin Panel", items = [], tone = "admin", onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Debug: Log items received
  console.log('🟢 Sidebar received items:', items);
  console.log('🟢 Items count:', items?.length || 0);

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const theme = {
    activeBg: 'bg-blue-600',
    indicator: 'bg-blue-600',
    logoBg: 'bg-blue-500/20',
    iconcolor: 'text-blue-500',
  };

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

      <div className="flex h-full flex-col bg-gradient-to-b from-[#111827] via-[#0f172a] to-[#080d16] text-white w-64 border-r border-white/5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center border-b border-white/5 px-4 py-4 shrink-0">
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
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-2.5 py-3">
          <ul className="space-y-1">
            {items.map((item, idx) => {
              // Divider
              if (item.type === "divider") {
                return (
                  <li key={`divider-${idx}`} className="px-3 pt-4 pb-1.5 first:pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">
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
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    <span className="text-sm font-medium leading-none truncate">
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-2.5 pb-4 pt-2 border-t border-white/5 shrink-0">
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200"
          >
            <LogOut size={17} className="shrink-0" />
            <span className="text-sm font-medium leading-none">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
