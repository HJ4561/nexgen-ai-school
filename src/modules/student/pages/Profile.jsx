// src/modules/student/pages/Profile.jsx

/**
 * ============================================
 * STUDENT PROFILE - PREMIUM CLEAN
 * ============================================
 * 
 * Clean, professional student profile with:
 * - Modern design matching Teacher Profile
 * - Smooth animations
 * - Full colored header with gradient
 * - Real data integration
 * - Responsive design
 * - Stats from API
 * - Updated to use new API field names (user_name, class_name, parent_name)
 * ============================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "@/components/layout/PageHeader";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Edit,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  Star,
  TrendingUp,
  School,
  Camera,
  Settings,
  LogOut,
  Bell,
  MessageSquare,
  Users,
  FileCheck,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  X,
  Save,
  ChevronRight,
  UserCircle,
  BookMarked,
  Briefcase,
  Building2,
  UserCheck,
  CalendarDays,
  CreditCard,
  Hash,
} from "lucide-react";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchProfile,
  updateProfile,
  fetchAttendance,
  fetchResults,
  fetchFees,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentProfile,
  selectStudentAttendance,
  selectStudentResults,
  selectStudentFees,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

// Helper to get student name from various possible locations
const getStudentName = (profile) => {
  if (!profile) return "Student";
  // Check all possible name locations (new API fields first)
  return profile.user_name || 
         profile.name || 
         profile.full_name || 
         profile.user?.name || 
         profile.user_data?.name || 
         "Student";
};

// Helper to get student email from various possible locations
const getStudentEmail = (profile) => {
  if (!profile) return "No email";
  return profile.email || 
         profile.user?.email || 
         profile.user_data?.email || 
         profile.user_email ||
         "No email";
};

// Helper to get student class from various possible locations
const getStudentClass = (profile) => {
  if (!profile) return "Not assigned";
  return profile.class_name || 
         profile.class_obj?.name || 
         profile.class_obj || 
         "Not assigned";
};

// Helper to get parent name
const getParentName = (profile) => {
  if (!profile) return null;
  return profile.parent_name || 
         profile.parent?.name || 
         profile.parent || 
         null;
};

const getInitials = (name) => {
  if (!name || name === "Student") return "S";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "S";
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

// ─── Components ─────────────────────────────────────────────────────────

// ─── Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    active: { bg: "bg-white/20", text: "text-white", dot: "bg-white", label: "Active" },
    inactive: { bg: "bg-white/20", text: "text-white", dot: "bg-gray-400", label: "Inactive" },
    pending: { bg: "bg-white/20", text: "text-white", dot: "bg-yellow-400", label: "Pending" },
    suspended: { bg: "bg-white/20", text: "text-white", dot: "bg-red-400", label: "Suspended" },
  };
  const style = styles[status?.toLowerCase()] || styles.active;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} backdrop-blur-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color = "indigo", delay = 0, isLoading = false }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          {isLoading ? (
            <div className="h-7 w-12 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Info Item ─────────────────────────────────────────────────────────

function InfoItem({ label, value, icon: Icon, isEditing, name, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-2 sm:gap-4">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="flex-1 max-w-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
        />
      ) : (
        <span className="text-sm font-medium text-gray-900 text-right sm:text-left">{value || "—"}</span>
      )}
    </div>
  );
}

// ─── Quick Action ──────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, color = "indigo", onClick }) {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    gray: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    teal: "bg-teal-50 text-teal-600 hover:bg-teal-100",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-xl ${colors[color]} transition-all`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium mt-2">{label}</span>
    </motion.button>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="mt-4 text-sm text-gray-500">Loading profile...</p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Redux State ──────────────────────────────────────────────────────
  const profile = useSelector(selectStudentProfile);
  const attendance = useSelector(selectStudentAttendance);
  const results = useSelector(selectStudentResults);
  const fees = useSelector(selectStudentFees);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    admission_no: "",
    status: "",
    class: "",
    parent: "",
  });
  const [dataFetched, setDataFetched] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // ─── Calculate Stats ──────────────────────────────────────────────────
  const totalAttendance = attendance?.length || 0;
  const attendancePct = attendance?.length > 0 
    ? Math.round((attendance.filter(a => a.status?.toLowerCase() === "present").length / attendance.length) * 100)
    : 0;
  const resultsCount = results?.length || 0;
  const avgScore = results?.length > 0 
    ? Math.round(results.reduce((sum, r) => sum + (parseFloat(r.marks_obtained) || 0), 0) / results.length)
    : 0;
  const pendingFees = fees?.filter(f => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "overdue").length || 0;

  // ─── Get Name, Email, Class, Parent using helpers ──────────────────
  const fullName = getStudentName(profile);
  const userEmail = getStudentEmail(profile);
  const classDisplay = getStudentClass(profile);
  const parentName = getParentName(profile);

  // ─── Fetch Profile ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchProfile()).unwrap();
        setDataFetched(true);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
        setDataFetched(true);
      }
    };
    fetchData();
  }, [dispatch]);

  // ─── Fetch Stats ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        await dispatch(fetchAttendance({})).unwrap();
        await dispatch(fetchResults({})).unwrap();
        await dispatch(fetchFees({})).unwrap();
      } catch (err) {
        console.error("❌ Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [dispatch]);

  // ─── Populate form when profile loads ────────────────────────────────
  useEffect(() => {
    if (profile) {
      // Extract user data from profile (handling both old and new API formats)
      const userData = profile.user || {};

      // Use getStudentName and getStudentEmail helpers
      const name = getStudentName(profile);
      const email = getStudentEmail(profile);
      const classDisplay = getStudentClass(profile);
      const parentName = getParentName(profile);

      setFormData({
        name: name,
        email: email,
        phone: profile.phone || "",
        address: profile.address || "",
        dob: profile.dob ? formatDate(profile.dob) : "",
        gender: profile.gender || "",
        admission_no: profile.admission_no || "",
        status: profile.status || "Active",
        class: classDisplay,
        parent: parentName || "",
      });
    }
  }, [profile]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob,
      };
      await dispatch(updateProfile(updateData)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && !dataFetched) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <PageHeader 
          title="Profile" 
          subtitle="Student profile" 
          breadcrumbs={["Student", "Profile"]} 
          bgColor="bg-indigo-50" 
        />
        <LoadingState />
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────
  if (error && !dataFetched) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <PageHeader 
          title="Profile" 
          subtitle="Student profile" 
          breadcrumbs={["Student", "Profile"]} 
          bgColor="bg-indigo-50" 
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Failed to load profile</h3>
            <p className="text-gray-500 mt-2 max-w-md">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── No Data ─────────────────────────────────────────────────────────
  if (!profile) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <PageHeader 
          title="Profile" 
          subtitle="Student profile" 
          breadcrumbs={["Student", "Profile"]} 
          bgColor="bg-indigo-50" 
        />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No profile data</h3>
            <p className="text-gray-500 mt-2">Your profile information is not available.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  const displayName = formData.name || fullName || "Student";
  const displayEmail = formData.email || userEmail || "No email";
  const initials = getInitials(displayName);
  const userStatus = formData.status || "active";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto pb-12"
    >
      <PageHeader 
        title="Profile" 
        subtitle="Manage your personal information" 
        breadcrumbs={["Student", "Profile"]} 
        bgColor="bg-indigo-50" 
      />

      {/* ─── Profile Header - Full Color ────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-indigo-500/25 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <Camera className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>

            {/* Name & Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {displayName}
                </h1>
                <StatusBadge status={userStatus} />
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" />
                  Student
                </span>
              </div>
              <p className="text-sm text-white/80">{displayEmail}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined: {formData.dob || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <School className="h-3.5 w-3.5" />
                  Class: {formData.class || "Not assigned"}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  Admission: {formData.admission_no || "N/A"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors text-sm font-medium backdrop-blur-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard 
          label="Attendance" 
          value={attendancePct ? `${attendancePct}%` : "0%"} 
          icon={BarChart3} 
          color="emerald" 
          delay={0.05} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Results" 
          value={resultsCount} 
          icon={GraduationCap} 
          color="purple" 
          delay={0.1} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Pending Fees" 
          value={pendingFees} 
          icon={CreditCard} 
          color="amber" 
          delay={0.15} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Avg Score" 
          value={avgScore ? `${avgScore}%` : "0%"} 
          icon={Award} 
          color="blue" 
          delay={0.2} 
          isLoading={statsLoading} 
        />
      </div>

      {/* ─── Details Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Personal Details */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-indigo-500" />
            Personal Details
          </h2>
          <div className="space-y-0.5">
            <InfoItem 
              label="Full Name" 
              value={formData.name} 
              icon={User} 
              isEditing={isEditing}
              name="name"
              onChange={handleInputChange}
            />
            <InfoItem 
              label="Email Address" 
              value={formData.email} 
              icon={Mail} 
              isEditing={isEditing}
              name="email"
              onChange={handleInputChange}
              type="email"
            />
            <InfoItem 
              label="Phone Number" 
              value={formData.phone} 
              icon={Phone} 
              isEditing={isEditing}
              name="phone"
              onChange={handleInputChange}
              type="tel"
            />
            <InfoItem 
              label="Date of Birth" 
              value={formData.dob || "—"} 
              icon={Calendar} 
              isEditing={isEditing}
              name="dob"
              onChange={handleInputChange}
              type="date"
            />
            <InfoItem 
              label="Gender" 
              value={formData.gender || "—"} 
              icon={User} 
              isEditing={isEditing}
              name="gender"
              onChange={handleInputChange}
              placeholder="Male/Female/Other"
            />
            <InfoItem 
              label="Address" 
              value={formData.address || "—"} 
              icon={MapPin} 
              isEditing={isEditing}
              name="address"
              onChange={handleInputChange}
            />
            {formData.parent && (
              <InfoItem 
                label="Parent" 
                value={formData.parent} 
                icon={Users} 
                isEditing={false}
              />
            )}
          </div>
        </motion.div>

        {/* Quick Info & Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {/* Quick Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Quick Info
            </h2>
            <div className="space-y-0.5">
              <InfoItem label="Status" value={userStatus} icon={Shield} />
              <InfoItem label="Role" value="Student" icon={UserCheck} />
              <InfoItem label="Class" value={formData.class || "Not assigned"} icon={School} />
              <InfoItem label="Admission No." value={formData.admission_no || "—"} icon={Hash} />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction 
                icon={Calendar} 
                label="Timetable" 
                color="blue" 
                onClick={() => navigate("/student/timetable")}
              />
              <QuickAction 
                icon={GraduationCap} 
                label="Report Card" 
                color="purple" 
                onClick={() => navigate("/student/report-card")}
              />
              <QuickAction 
                icon={CreditCard} 
                label="Fees" 
                color="amber" 
                onClick={() => navigate("/student/fees")}
              />
              <QuickAction 
                icon={BookOpen} 
                label="Library" 
                color="rose" 
                onClick={() => navigate("/student/library")}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Actions Bottom ────────────────────────────────────── */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6"
      >
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction 
            icon={Calendar} 
            label="Timetable" 
            color="blue" 
            onClick={() => navigate("/student/timetable")}
          />
          <QuickAction 
            icon={GraduationCap} 
            label="Report Card" 
            color="purple" 
            onClick={() => navigate("/student/report-card")}
          />
          <QuickAction 
            icon={CreditCard} 
            label="Fees" 
            color="amber" 
            onClick={() => navigate("/student/fees")}
          />
          <QuickAction 
            icon={BookOpen} 
            label="Library" 
            color="rose" 
            onClick={() => navigate("/student/library")}
          />
          <QuickAction 
            icon={BookOpen} 
            label="Exams" 
            color="emerald" 
            onClick={() => navigate("/student/exams")}
          />
          <QuickAction 
            icon={Settings} 
            label="Settings" 
            color="gray" 
            onClick={() => navigate("/student/settings")}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Profile;