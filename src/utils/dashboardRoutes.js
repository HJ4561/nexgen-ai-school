// src/utils/dashboardRoutes.js
// ======================================================
// Dashboard Sidebar Routes Configuration
// Defines sidebar navigation items for each user role
// Each object contains:
// - label: Text displayed in the sidebar
// - path: Route path for navigation
// - icon: Lucide React icon component
// - badge: Optional badge text (e.g., "New", "Beta")
// ======================================================

import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Building2,
  CalendarDays,
  Wallet,
  Receipt,
  Package,
  Wrench,
  Award,
  ClipboardList,
  Megaphone,
  ClipboardCheck,
  FileText,
  Clock3,
  NotebookPen,
  Bell,
  Settings,
  Calendar,
  ShieldAlert,
  Handshake,
  Utensils,
  BookCopy,
  Database,
  FolderOpen,
  BookMarked,
  FileQuestion,
  UserCog,
  UsersRound,
  Briefcase,
  School,
  Layers,
  Grid,
  FileCheck,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Tag,
  MapPin,
  User,
  Library as LibraryIcon,
  MessageSquare,
  Sparkles,
  File,
  Shield,
  UserPlus,
  BarChart3,
  Target,
  Brain,
  History,
  Fingerprint,
  DoorOpen,
  UserCircle,
  Activity,
  Bot,
  Bus,
  Book,
  Coffee,
  FileArchive,
  Gauge,
  Lightbulb,
  ListChecks,
  ScrollText,
  TicketCheck,
  Upload,
  Eye,
  // --- New icons for teacher routes ---
  Users as StudentsIcon,
  GraduationCap as ExamsIcon,
  Activity as BehaviorIcon,
  Handshake as PTMIcon,
  MessageSquare as MessagesIcon,
  User as ProfileIcon,
} from "lucide-react";

/* ======================================================
   ADMIN SIDEBAR ROUTES
   Accessible only by Admin users
====================================================== */
export const adminRoutes = [
  // ─── Dashboard ──────────────────────────────────────────────────────────
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  // ─── User Management ──────────────────────────────────────────────────
  {
    label: "User Approvals",
    path: "/admin/user-approvals",
    icon: UserCheck,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Students",
    path: "/admin/students",
    icon: Users,
  },
  {
    label: "Teachers",
    path: "/admin/teachers",
    icon: UserCog,
  },
  {
    label: "Parents",
    path: "/admin/parents",
    icon: UsersRound,
  },
  {
    label: "Staff",
    path: "/admin/staff",
    icon: Briefcase,
  },

  // ─── Academics ──────────────────────────────────────────────────────────
  {
    label: "Classes",
    path: "/admin/academics/classes",
    icon: School,
  },
  {
    label: "Sections",
    path: "/admin/academics/sections",
    icon: Layers,
  },
  {
    label: "Subjects",
    path: "/admin/academics/subjects",
    icon: BookOpen,
  },
  {
    label: "Rooms",
    path: "/admin/academics/rooms",
    icon: Grid,
  },
  {
    label: "Class Subjects",
    path: "/admin/academics/class-subjects",
    icon: ClipboardList,
  },
  {
    label: "Timetable",
    path: "/admin/academics/timetable",
    icon: CalendarDays,
  },

  // ─── Assignments ────────────────────────────────────────────────────────
  {
    label: "Assignments",
    path: "/admin/assignments",
    icon: ClipboardList,
  },
  {
    label: "Submissions",
    path: "/admin/submissions",
    icon: FileCheck,
  },

  // ─── Exams ─────────────────────────────────────────────────────────────
  {
    label: "Exams",
    path: "/admin/exams",
    icon: BookMarked,
  },
  {
    label: "Results",
    path: "/admin/results",
    icon: Award,
  },

  // ─── Attendance ────────────────────────────────────────────────────────
  {
    label: "Attendance",
    path: "/admin/attendance",
    icon: Clock,
  },
  {
    label: "Behavior Logs",
    path: "/admin/behavior-logs",
    icon: AlertCircle,
  },

  // ─── PTM (Parent-Teacher Meetings) ────────────────────────────────────
  {
    label: "PTM",
    path: "/admin/ptm",
    icon: Handshake,
  },

  // ─── Finance ───────────────────────────────────────────────────────────
  {
    label: "Fees",
    path: "/admin/fees",
    icon: Wallet,
  },
  {
    label: "Payments",
    path: "/admin/payments",
    icon: Receipt,
  },
  {
    label: "Expenses",
    path: "/admin/expenses",
    icon: TrendingUp,
  },
  {
    label: "Inventory",
    path: "/admin/inventory",
    icon: Package,
  },

  // ─── HR (Human Resources) ─────────────────────────────────────────────
  {
    label: "HR",
    path: "/admin/hr",
    icon: Building2,
  },

  // ─── Transport ─────────────────────────────────────────────────────────
  {
    label: "Transport",
    path: "/admin/transport",
    icon: MapPin,
  },

  // ─── Library ──────────────────────────────────────────────────────────
  {
    label: "Library",
    path: "/admin/library",
    icon: LibraryIcon,
  },

  // ─── Canteen ──────────────────────────────────────────────────────────
  {
    label: "Canteen",
    path: "/admin/canteen",
    icon: Utensils,
  },

  // ─── Security ─────────────────────────────────────────────────────────
  {
    label: "Security",
    path: "/admin/security",
    icon: Shield,
  },
  {
    label: "Access Logs",
    path: "/admin/access-logs",
    icon: Shield,
  },
  {
    label: "Visitors",
    path: "/admin/visitors",
    icon: UserPlus,
  },

  // ─── Communication ────────────────────────────────────────────────────
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: Bell,
  },
  {
    label: "Messages",
    path: "/admin/messages",
    icon: MessageSquare,
  },
  {
    label: "Announcements",
    path: "/admin/announcements",
    icon: Megaphone,
  },
  {
    label: "Events",
    path: "/admin/events",
    icon: Calendar,
  },
  {
    label: "Complaints",
    path: "/admin/complaints",
    icon: AlertCircle,
  },

  // ─── Documents ──────────────────────────────────────────────────────
  {
    label: "Documents",
    path: "/admin/documents",
    icon: FolderOpen,
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Predictions",
    path: "/admin/predictions",
    icon: Sparkles,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: File,
  },

  // ─── System ────────────────────────────────────────────────────────────
  {
    label: "System",
    path: "/admin/system-logs",
    icon: Database,
  },

  // ─── Settings ─────────────────────────────────────────────────────────
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

/* ======================================================
   TEACHER SIDEBAR ROUTES - COMPLETE
   Accessible only by Teacher users
   Based on Smart School API Documentation
====================================================== */
export const teacherRoutes = [
  // ─── Dashboard ──────────────────────────────────────────────────────────
  {
    label: "Dashboard",
    path: "/teacher/dashboard",
    icon: LayoutDashboard,
  },

  // ─── Academic Management ──────────────────────────────────────────────
  {
    label: "Students",
    path: "/teacher/students",
    icon: StudentsIcon,
  },
  {
    label: "Attendance",
    path: "/teacher/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Marks Entry",
    path: "/teacher/marks-entry",
    icon: FileText,
  },
  {
    label: "Assignments",
    path: "/teacher/assignments",
    icon: NotebookPen,
  },
  {
    label: "Submissions",          // ← NEW
    path: "/teacher/submissions",   // ← NEW
    icon: Upload,                   // ← NEW
    badge: "Grade",                 // ← Optional: shows a "Grade" badge
  },
  {
    label: "Timetable",
    path: "/teacher/timetable",
    icon: Clock3,
  },
  {
    label: "Exams",
    path: "/teacher/exams",
    icon: ExamsIcon,
  },
  {
    label: "Behavior Logs",
    path: "/teacher/behavior-logs",
    icon: BehaviorIcon,
  },
  {
    label: "PTM",
    path: "/teacher/ptm",
    icon: PTMIcon,
  },

  // ─── Communication ────────────────────────────────────────────────────
  {
    label: "Messages",
    path: "/teacher/messages",
    icon: MessagesIcon,
  },
  {
    label: "Complaints",
    path: "/teacher/complaints",
    icon: AlertCircle,
  },
  {
    label: "Notifications",
    path: "/teacher/notifications",
    icon: Bell,
  },

  // ─── Events ──────────────────────────────────────────────────────────
  {
    label: "Events",
    path: "/teacher/events",
    icon: Calendar,
  },

  // ─── HR ──────────────────────────────────────────────────────────────
  {
    label: "Leaves",
    path: "/teacher/leaves",
    icon: CalendarDays,
  },
  {
    label: "Payroll",
    path: "/teacher/payroll",
    icon: Wallet,
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  {
    label: "Predictions",
    path: "/teacher/predictions",
    icon: Sparkles,
  },
  {
    label: "Recommendations",
    path: "/teacher/recommendations",
    icon: Lightbulb,
  },

  // ─── Profile & Settings ──────────────────────────────────────────────
  {
    label: "My Profile",
    path: "/teacher/profile",
    icon: ProfileIcon,
  },
  {
    label: "Settings",
    path: "/teacher/settings",
    icon: Settings,
  },
];

/* ======================================================
   STUDENT SIDEBAR ROUTES - COMPLETE
   Accessible only by Student users
   Based on Smart School API Documentation
====================================================== */
export const studentRoutes = [
  // ─── Dashboard ──────────────────────────────────────────────────────────
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },

  // ─── Profile ──────────────────────────────────────────────────────────
  {
    label: "My Profile",
    path: "/student/profile",
    icon: User,
  },

  // ─── Academics ────────────────────────────────────────────────────────
  {
    label: "Attendance",
    path: "/student/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Assignments",
    path: "/student/assignments",
    icon: NotebookPen,
  },
  {
    label: "Submissions",
    path: "/student/submissions",
    icon: Upload,
  },
  {
    label: "Exams & Results",
    path: "/student/exams",
    icon: Award,
  },
  {
    label: "Report Card",
    path: "/student/report-card",
    icon: ScrollText,
  },
  {
    label: "Timetable",
    path: "/student/timetable",
    icon: CalendarDays,
  },

  // ─── Financial ────────────────────────────────────────────────────────
  {
    label: "Fees & Payments",
    path: "/student/fees",
    icon: Wallet,
  },

  // ─── Extracurricular ──────────────────────────────────────────────────
  {
    label: "Events",
    path: "/student/events",
    icon: Calendar,
  },
  {
    label: "Transport",
    path: "/student/transport",
    icon: Bus,
  },
  {
    label: "Library",
    path: "/student/library",
    icon: LibraryIcon,
  },
  {
    label: "Canteen",
    path: "/student/canteen",
    icon: Coffee,
  },

  // ─── Communication ────────────────────────────────────────────────────
  {
    label: "Complaints",
    path: "/student/complaints",
    icon: AlertCircle,
  },
  {
    label: "Notifications",
    path: "/student/notifications",
    icon: Bell,
  },

  // ─── Security ─────────────────────────────────────────────────────────
  {
    label: "Security",
    path: "/student/security",
    icon: Shield,
  },

  // ─── Documents ──────────────────────────────────────────────────────
  {
    label: "Documents",
    path: "/student/documents",
    icon: FileArchive,
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  {
    label: "Analytics",
    path: "/student/analytics",
    icon: Gauge,
  },

  // ─── AI Chat ──────────────────────────────────────────────────────────
  {
    label: "AI Chat Assistant",
    path: "/student/chat",
    icon: Bot,
    badge: "Beta",
  },

  // ─── Settings ─────────────────────────────────────────────────────────
  {
    label: "Settings",
    path: "/student/settings",
    icon: Settings,
  },
];

/* ======================================================
   PARENT SIDEBAR ROUTES - COMPLETE
   Accessible only by Parent users
   Based on Smart School API Documentation
====================================================== */
export const parentRoutes = [
  // ─── Dashboard ──────────────────────────────────────────────────────────
  {
    label: "Dashboard",
    path: "/parent/dashboard",
    icon: LayoutDashboard,
  },

  // ─── Profile ──────────────────────────────────────────────────────────
  {
    label: "My Profile",
    path: "/parent/profile",
    icon: User,
  },

  // ─── Child Management ────────────────────────────────────────────────
  {
    label: "Attendance",
    path: "/parent/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Grades",
    path: "/parent/grades",
    icon: FileText,
  },
  {
    label: "Behavior Logs",
    path: "/parent/behavior-logs",
    icon: ShieldAlert,
  },
  {
    label: "Student Details",
    path: "/parent/student-details",
    icon: UserCircle,
  },

  // ─── Financial ────────────────────────────────────────────────────────
  {
    label: "Fees & Payments",
    path: "/parent/fees",
    icon: Wallet,
  },
  {
    label: "Finance",
    path: "/parent/finance",
    icon: DollarSign,
  },

  // ─── Communication ────────────────────────────────────────────────────
  {
    label: "Messages",
    path: "/parent/messages",
    icon: MessageSquare,
  },
  {
    label: "Complaints",
    path: "/parent/complaints",
    icon: AlertCircle,
  },
  {
    label: "Notifications",
    path: "/parent/notifications",
    icon: Bell,
  },

  // ─── Events ──────────────────────────────────────────────────────────
  {
    label: "Events",
    path: "/parent/events",
    icon: Calendar,
  },
  {
    label: "Calendar",
    path: "/parent/calendar",
    icon: CalendarDays,
  },

  // ─── Transport ─────────────────────────────────────────────────────────
  {
    label: "Transport",
    path: "/parent/transport",
    icon: MapPin,
  },

  // ─── Library ──────────────────────────────────────────────────────────
  {
    label: "Library",
    path: "/parent/library",
    icon: LibraryIcon,
  },

  // ─── Canteen ──────────────────────────────────────────────────────────
  {
    label: "Canteen",
    path: "/parent/canteen",
    icon: Utensils,
  },

  // ─── PTM ──────────────────────────────────────────────────────────────
  {
    label: "PTM",
    path: "/parent/ptm",
    icon: Handshake,
  },

  // ─── Certificates ──────────────────────────────────────────────────────
  {
    label: "Certificates",
    path: "/parent/certificates",
    icon: Award,
  },

  // ─── Submissions ──────────────────────────────────────────────────────
  {
    label: "Submissions",
    path: "/parent/submissions",
    icon: FileCheck,
  },

  // ─── Security ─────────────────────────────────────────────────────────
  {
    label: "Security",
    path: "/parent/security",
    icon: Shield,
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  {
    label: "Analytics",
    path: "/parent/analytics",
    icon: BarChart3,
  },

  // ─── AI Chat ──────────────────────────────────────────────────────────
  {
    label: "AI Chat Assistant",
    path: "/parent/chat",
    icon: MessageSquare,
    badge: "Beta",
  },

  // ─── Settings ─────────────────────────────────────────────────────────
  {
    label: "Settings",
    path: "/parent/settings",
    icon: Settings,
  },
];

// ─── Export all routes for use in other files ──────────────────────────
export default {
  adminRoutes,
  teacherRoutes,
  studentRoutes,
  parentRoutes,
};