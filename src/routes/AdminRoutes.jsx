// src/routes/AdminRoutes.jsx

// ✅ CORRECT: No .jsx for package imports
import { Route, Navigate } from "react-router-dom";
import RoleRoute from "./RolesRoutes.jsx";
import AiWorkspacePage from "@/modules/chat/pages/AiWorkspacePage/AiWorkspacePage.jsx";

// Core Admin Pages
import AdminDashboard from "@/modules/admin/pages/AdminDashboard.jsx";
import Settings from "@/modules/admin/pages/Settings.jsx";

// User Management
import UserProfileManagement from "@/modules/admin/pages/UserProfileManagement.jsx";
import Students from "@/modules/admin/pages/Students.jsx";
import Teachers from "@/modules/admin/pages/Teachers.jsx";
import Parents from "@/modules/admin/pages/Parents.jsx";
import Staff from "@/modules/admin/pages/Staff.jsx";
import PendingApprovals from "@/modules/admin/pages/PendingApprovals.jsx";

// Academics
import Classes from "@/modules/admin/pages/Classes.jsx";
import Subjects from "@/modules/admin/pages/Subjects.jsx";
import Sections from "@/modules/admin/pages/Sections.jsx";
import Rooms from "@/modules/admin/pages/Rooms.jsx";
import ClassSubjects from "@/modules/admin/pages/ClassSubjects.jsx";
import Timetable from "@/modules/admin/pages/Timetable.jsx";

// Assignments
import Assignments from "@/modules/admin/pages/Assignments.jsx";
import Submissions from "@/modules/admin/pages/Submissions.jsx";

// Exams
import Exams from "@/modules/admin/pages/Exams.jsx";
import Results from "@/modules/admin/pages/Results.jsx";

// Attendance
import Attendance from "@/modules/admin/pages/Attendance.jsx";
import BehaviorLogs from "@/modules/admin/pages/BehaviorLogs.jsx";

// PTM
import PTM from "@/modules/admin/pages/PTM.jsx";

// Finance
import FeeManagement from "@/modules/admin/pages/FeeManagement.jsx";
import Payments from "@/modules/admin/pages/Payments.jsx";
import Expenses from "@/modules/admin/pages/Expenses.jsx";
import InventoryManagement from "@/modules/admin/pages/InventoryManagement.jsx";

// HR
import HR from "@/modules/admin/pages/HR.jsx";

// Operations - Combined Pages
import Transport from "@/modules/admin/pages/Transport.jsx";
import Library from "@/modules/admin/pages/Library.jsx";
import Canteen from "@/modules/admin/pages/Canteen.jsx";
import Security from "@/modules/admin/pages/Security.jsx";
import AccessLogs from "@/modules/admin/pages/AccessLogs.jsx";
import Visitors from "@/modules/admin/pages/Visitors.jsx";

// Communication
import NotificationManagement from "@/modules/admin/pages/NotificationManagement.jsx";
import Messages from "@/modules/admin/pages/Messages.jsx";
import Announcements from "@/modules/admin/pages/Announcements.jsx";
import EventManagement from "@/modules/admin/pages/EventManagement.jsx";
import ComplaintManagement from "@/modules/admin/pages/ComplaintManagement.jsx";

// Documents
import Documents from "@/modules/admin/pages/Documents.jsx";

// System
import SystemLogs from "@/modules/admin/pages/SystemLogs.jsx";

// Insights
import Analytics from "@/modules/admin/pages/Analytics.jsx";
import Predictions from "@/modules/admin/pages/Predictions.jsx";
import Reports from "@/modules/admin/pages/Reports.jsx";

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
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Users", icon: Users, path: "/admin/users" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "Teachers", icon: UserCog, path: "/admin/teachers" },
  { label: "Parents", icon: UsersRound, path: "/admin/parents" },
  { label: "Staff", icon: Briefcase, path: "/admin/staff" },
  { label: "User Approvals", icon: UserCheck, path: "/admin/user-approvals" },
  { label: "Classes", icon: School, path: "/admin/academics/classes" },
  { label: "Sections", icon: Layers, path: "/admin/academics/sections" },
  { label: "Subjects", icon: BookOpen, path: "/admin/academics/subjects" },
  { label: "Rooms", icon: Grid, path: "/admin/academics/rooms" },
  { label: "Class Subjects", icon: ClipboardList, path: "/admin/academics/class-subjects" },
  { label: "Timetable", icon: Calendar, path: "/admin/academics/timetable" },
  { label: "Assignments", icon: ClipboardList, path: "/admin/assignments" },
  { label: "Submissions", icon: FileCheck, path: "/admin/submissions" },
  { label: "Exams", icon: BookMarked, path: "/admin/exams" },
  { label: "Results", icon: Award, path: "/admin/results" },
  { label: "Attendance", icon: Clock, path: "/admin/attendance" },
  { label: "Behavior Logs", icon: AlertCircle, path: "/admin/behavior-logs" },
  { label: "PTM", icon: Handshake, path: "/admin/ptm" },
  { label: "Fees", icon: DollarSign, path: "/admin/fees" },
  { label: "Payments", icon: Wallet, path: "/admin/payments" },
  { label: "Expenses", icon: TrendingUp, path: "/admin/expenses" },
  { label: "Inventory", icon: Package, path: "/admin/inventory" },
  { label: "HR", icon: Building2, path: "/admin/hr" },
  { label: "Transport", icon: Bus, path: "/admin/transport" },
  { label: "Library", icon: LibraryIcon, path: "/admin/library" },
  { label: "Canteen", icon: Utensils, path: "/admin/canteen" },
  { label: "Security", icon: Shield, path: "/admin/security" },
  { label: "Access Logs", icon: Shield, path: "/admin/access-logs" },
  { label: "Visitors", icon: Users, path: "/admin/visitors" },
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Messages", icon: MessageSquare, path: "/admin/messages" },
  { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
  { label: "Complaints", icon: AlertCircle, path: "/admin/complaints" },
  { label: "Documents", icon: FolderOpen, path: "/admin/documents" },
  { label: "Analytics", icon: Sparkles, path: "/admin/analytics" },
  { label: "Predictions", icon: Sparkles, path: "/admin/predictions" },
  { label: "Reports", icon: File, path: "/admin/reports" },
  { label: "System", icon: Database, path: "/admin/system-logs" },
  { label: "Settings", icon: SettingsIcon, path: "/admin/settings" },
];

// ─── React Router Routes ──────────────────────────────────────────────
const AdminRoutesComponent = (
  <Route path="/admin" element={<RoleRoute allowedRoles={["admin"]} />}>
    <Route path="ai-chat" element={<AiWorkspacePage />} />
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UserProfileManagement />} />
    <Route path="students" element={<Students />} />
    <Route path="teachers" element={<Teachers />} />
    <Route path="parents" element={<Parents />} />
    <Route path="staff" element={<Staff />} />
    <Route path="user-approvals" element={<PendingApprovals />} />
    <Route path="academics/classes" element={<Classes />} />
    <Route path="academics/subjects" element={<Subjects />} />
    <Route path="academics/sections" element={<Sections />} />
    <Route path="academics/rooms" element={<Rooms />} />
    <Route path="academics/class-subjects" element={<ClassSubjects />} />
    <Route path="academics/timetable" element={<Timetable />} />
    <Route path="assignments" element={<Assignments />} />
    <Route path="submissions" element={<Submissions />} />
    <Route path="exams" element={<Exams />} />
    <Route path="results" element={<Results />} />
    <Route path="attendance" element={<Attendance />} />
    <Route path="behavior-logs" element={<BehaviorLogs />} />
    <Route path="ptm" element={<PTM />} />
    <Route path="fees" element={<FeeManagement />} />
    <Route path="payments" element={<Payments />} />
    <Route path="expenses" element={<Expenses />} />
    <Route path="inventory" element={<InventoryManagement />} />
    <Route path="hr" element={<HR />} />
    <Route path="transport" element={<Transport />} />
    <Route path="library" element={<Library />} />
    <Route path="canteen" element={<Canteen />} />
    <Route path="security" element={<Security />} />
    <Route path="access-logs" element={<AccessLogs />} />
    <Route path="visitors" element={<Visitors />} />
    <Route path="notifications" element={<NotificationManagement />} />
    <Route path="messages" element={<Messages />} />
    <Route path="announcements" element={<Announcements />} />
    <Route path="events" element={<EventManagement />} />
    <Route path="complaints" element={<ComplaintManagement />} />
    <Route path="documents" element={<Documents />} />
    <Route path="analytics" element={<Analytics />} />
    <Route path="predictions" element={<Predictions />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system-logs" element={<SystemLogs />} />
    <Route path="settings" element={<Settings />} />
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Route>
);

export default AdminRoutesComponent;