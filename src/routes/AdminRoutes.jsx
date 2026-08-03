// src/utils/adminRoutes.jsx

import { Route, Navigate } from "react-router-dom";
import RoleRoute from "./RolesRoutes";
import AiWorkspacePage from "@/modules/chat/pages/AiWorkspacePage/AiWorkspacePage";

// Core Admin Pages
import AdminDashboard from "@/modules/admin/pages/AdminDashboard";
import Settings from "@/modules/admin/pages/Settings";

// User Management
import UserProfileManagement from "@/modules/admin/pages/UserProfileManagement";
import Students from "@/modules/admin/pages/Students";
import Teachers from "@/modules/admin/pages/Teachers";
import Parents from "@/modules/admin/pages/Parents";
import Staff from "@/modules/admin/pages/Staff";
import PendingApprovals from "@/modules/admin/pages/PendingApprovals";

// Academics
import Classes from "@/modules/admin/pages/Classes";
import Subjects from "@/modules/admin/pages/Subjects";
import Sections from "@/modules/admin/pages/Sections";
import Rooms from "@/modules/admin/pages/Rooms";
import ClassSubjects from "@/modules/admin/pages/ClassSubjects";
import Timetable from "@/modules/admin/pages/Timetable";

// Assignments
import Assignments from "@/modules/admin/pages/Assignments";
import Submissions from "@/modules/admin/pages/Submissions";

// Exams
import Exams from "@/modules/admin/pages/Exams";
import Results from "@/modules/admin/pages/Results";

// Attendance
import Attendance from "@/modules/admin/pages/Attendance";
import BehaviorLogs from "@/modules/admin/pages/BehaviorLogs";

// PTM
import PTM from "@/modules/admin/pages/PTM";

// Finance
import FeeManagement from "@/modules/admin/pages/FeeManagement";
import Payments from "@/modules/admin/pages/Payments";
import Expenses from "@/modules/admin/pages/Expenses";
import InventoryManagement from "@/modules/admin/pages/InventoryManagement";

// HR
import HR from "@/modules/admin/pages/HR";

// Operations - Combined Pages
import Transport from "@/modules/admin/pages/Transport";
import Library from "@/modules/admin/pages/Library";
import Canteen from "@/modules/admin/pages/Canteen";
import Security from "@/modules/admin/pages/Security";
import AccessLogs from "@/modules/admin/pages/AccessLogs";
import Visitors from "@/modules/admin/pages/Visitors";

// Communication
import NotificationManagement from "@/modules/admin/pages/NotificationManagement";
import Messages from "@/modules/admin/pages/Messages";
import Announcements from "@/modules/admin/pages/Announcements";
import EventManagement from "@/modules/admin/pages/EventManagement";
import ComplaintManagement from "@/modules/admin/pages/ComplaintManagement";

// Documents
import Documents from "@/modules/admin/pages/Documents";

// System
import SystemLogs from "@/modules/admin/pages/SystemLogs";

// Insights
import Analytics from "@/modules/admin/pages/Analytics";
import Predictions from "@/modules/admin/pages/Predictions";
import Reports from "@/modules/admin/pages/Reports";

// ─── Import icons for sidebar routes ──────────────────────────────────
import {
  LayoutDashboard,
  Users,
  UserCog,
  UsersRound,
  Briefcase,
  UserCheck,
  School,
  Layers,
  BookOpen,
  Grid,
  ClipboardList,
  Calendar,
  FileCheck,
  BookMarked,
  Award,
  Clock,
  AlertCircle,
  DollarSign,
  Wallet,
  TrendingUp,
  Package,
  Building2,
  Bus,
  MapPin,
  User,
  Library as LibraryIcon,
  Utensils,
  ShoppingCart,
  Shield,
  Bell,
  MessageSquare,
  Megaphone,
  CalendarDays,
  Sparkles,
  File,
  Database,
  Settings as SettingsIcon,
  Handshake,
  FolderOpen,
} from 'lucide-react';

// ─── Sidebar Routes Configuration ──────────────────────────────────────
export const adminRoutes = [
  // ─── Dashboard ──────────────────────────────────────────────────────────
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },

  // ─── User Management ──────────────────────────────────────────────────
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Teachers", icon: UserCog, path: "/admin/teachers" },
  { label: "Parents", icon: UsersRound, path: "/admin/parents" },
  { label: "Staff", icon: Briefcase, path: "/admin/staff" },
  { label: "User Approvals", icon: UserCheck, path: "/admin/user-approvals" },

  // ─── Academics ──────────────────────────────────────────────────────────
  { label: "Classes", icon: School, path: "/admin/academics/classes" },
  { label: "Sections", icon: Layers, path: "/admin/academics/sections" },
  { label: "Subjects", icon: BookOpen, path: "/admin/academics/subjects" },
  { label: "Rooms", icon: Grid, path: "/admin/academics/rooms" },
  { label: "Class Subjects", icon: ClipboardList, path: "/admin/academics/class-subjects" },
  { label: "Timetable", icon: Calendar, path: "/admin/academics/timetable" },

  // ─── Assignments ────────────────────────────────────────────────────────
  { label: "Assignments", icon: ClipboardList, path: "/admin/assignments" },
  { label: "Submissions", icon: FileCheck, path: "/admin/submissions" },

  // ─── Exams ─────────────────────────────────────────────────────────────
  { label: "Exams", icon: BookMarked, path: "/admin/exams" },
  { label: "Results", icon: Award, path: "/admin/results" },

  // ─── Attendance ────────────────────────────────────────────────────────
  { label: "Attendance", icon: Clock, path: "/admin/attendance" },
  { label: "Behavior Logs", icon: AlertCircle, path: "/admin/behavior-logs" },

  // ─── PTM ──────────────────────────────────────────────────────────────
  { label: "PTM", icon: Handshake, path: "/admin/ptm" },

  // ─── Finance ───────────────────────────────────────────────────────────
  { label: "Fees", icon: DollarSign, path: "/admin/fees" },
  { label: "Payments", icon: Wallet, path: "/admin/payments" },
  { label: "Expenses", icon: TrendingUp, path: "/admin/expenses" },
  { label: "Inventory", icon: Package, path: "/admin/inventory" },

  // ─── HR ──────────────────────────────────────────────────────────────
  { label: "HR", icon: Building2, path: "/admin/hr" },

  // ─── Transport ─────────────────────────────────────────────────────────
  { label: "Transport", icon: Bus, path: "/admin/transport" },

  // ─── Library ──────────────────────────────────────────────────────────
  { label: "Library", icon: LibraryIcon, path: "/admin/library" },

  // ─── Canteen ──────────────────────────────────────────────────────────
  { label: "Canteen", icon: Utensils, path: "/admin/canteen" },

  // ─── Security ─────────────────────────────────────────────────────────
  { label: "Security", icon: Shield, path: "/admin/security" },
  { label: "Access Logs", icon: Shield, path: "/admin/access-logs" },
  { label: "Visitors", icon: Users, path: "/admin/visitors" },

  // ─── Communication ────────────────────────────────────────────────────
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Messages", icon: MessageSquare, path: "/admin/messages" },
  { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
  { label: "Complaints", icon: AlertCircle, path: "/admin/complaints" },

  // ─── Documents ──────────────────────────────────────────────────────
  { label: "Documents", icon: FolderOpen, path: "/admin/documents" },

  // ─── Analytics ────────────────────────────────────────────────────────
  { label: "Analytics", icon: Sparkles, path: "/admin/analytics" },
  { label: "Predictions", icon: Sparkles, path: "/admin/predictions" },

  // ─── Reports ──────────────────────────────────────────────────────────
  { label: "Reports", icon: File, path: "/admin/reports" },

  // ─── System ────────────────────────────────────────────────────────────
  { label: "System", icon: Database, path: "/admin/system-logs" },

  // ─── Settings ─────────────────────────────────────────────────────────
  { label: "Settings", icon: SettingsIcon, path: "/admin/settings" },
];

// ─── React Router Routes ──────────────────────────────────────────────
const AdminRoutesComponent = (
  <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]} />}>
    <Route path="ai-chat" element={<AiWorkspacePage />} />
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    
    {/* Dashboard */}
    <Route path="dashboard" element={<AdminDashboard />} />
    
    {/* User Management */}
    <Route path="users" element={<UserProfileManagement />} />
    <Route path="students" element={<Students />} />
    <Route path="teachers" element={<Teachers />} />
    <Route path="parents" element={<Parents />} />
    <Route path="staff" element={<Staff />} />
    <Route path="user-approvals" element={<PendingApprovals />} />
    
    {/* Academics */}
    <Route path="academics/classes" element={<Classes />} />
    <Route path="academics/subjects" element={<Subjects />} />
    <Route path="academics/sections" element={<Sections />} />
    <Route path="academics/rooms" element={<Rooms />} />
    <Route path="academics/class-subjects" element={<ClassSubjects />} />
    <Route path="academics/timetable" element={<Timetable />} />
    
    {/* Assignments */}
    <Route path="assignments" element={<Assignments />} />
    <Route path="submissions" element={<Submissions />} />
    
    {/* Exams */}
    <Route path="exams" element={<Exams />} />
    <Route path="results" element={<Results />} />
    
    {/* Attendance */}
    <Route path="attendance" element={<Attendance />} />
    <Route path="behavior-logs" element={<BehaviorLogs />} />
    
    {/* PTM */}
    <Route path="ptm" element={<PTM />} />
    
    {/* Finance */}
    <Route path="fees" element={<FeeManagement />} />
    <Route path="payments" element={<Payments />} />
    <Route path="expenses" element={<Expenses />} />
    <Route path="inventory" element={<InventoryManagement />} />
    
    {/* HR */}
    <Route path="hr" element={<HR />} />
    
    {/* Transport */}
    <Route path="transport" element={<Transport />} />
    
    {/* Library */}
    <Route path="library" element={<Library />} />
    
    {/* Canteen */}
    <Route path="canteen" element={<Canteen />} />
    
    {/* Security */}
    <Route path="security" element={<Security />} />
    <Route path="access-logs" element={<AccessLogs />} />
    <Route path="visitors" element={<Visitors />} />
    
    {/* Communication */}
    <Route path="notifications" element={<NotificationManagement />} />
    <Route path="messages" element={<Messages />} />
    <Route path="announcements" element={<Announcements />} />
    <Route path="events" element={<EventManagement />} />
    <Route path="complaints" element={<ComplaintManagement />} />
    
    {/* Documents */}
    <Route path="documents" element={<Documents />} />
    
    {/* Analytics */}
    <Route path="analytics" element={<Analytics />} />
    <Route path="predictions" element={<Predictions />} />
    
    {/* Reports */}
    <Route path="reports" element={<Reports />} />
    
    {/* System */}
    <Route path="system-logs" element={<SystemLogs />} />
    
    {/* Settings */}
    <Route path="settings" element={<Settings />} />
    
    {/* Catch all */}
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Route>
);

export default AdminRoutesComponent;