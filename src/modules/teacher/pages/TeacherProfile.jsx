// src/modules/teacher/pages/TeacherProfile.jsx

/**
 * ============================================
 * TEACHER PROFILE - PREMIUM CLEAN (UPDATED)
 * ============================================
 * 
 * Clean, professional teacher profile with:
 * - Modern design
 * - Smooth animations
 * - Full colored header
 * - Real data integration
 * - Responsive design
 * - Stats from API
 * - Updated to use new API field names (user_name, etc.)
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
} from "lucide-react";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchProfile,
  updateProfile,
  changePassword,
  fetchStudents,
  fetchAssignments,
  fetchAttendanceStats,
  fetchTeacherClasses,
} from "../store/teacherThunks";

import {
  selectTeacherProfile,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
  selectTeacherStudents,
  selectTeacherAssignments,
  selectTeacherAttendanceStats,
  selectTeacherClasses,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

// Helper to get teacher name from various possible locations
const getTeacherName = (profile) => {
  if (!profile) return "Teacher";
  // Check all possible name locations (new API fields first)
  return profile.user_name || 
         profile.name || 
         profile.full_name || 
         profile.user?.name || 
         profile.user_data?.name || 
         "Teacher";
};

// Helper to get teacher email from various possible locations
const getTeacherEmail = (profile) => {
  if (!profile) return "No email";
  return profile.email || 
         profile.user?.email || 
         profile.user_data?.email || 
         profile.user_email ||
         "No email";
};

const getInitials = (name) => {
  if (!name || name === "Teacher") return "T";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "T";
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

// ─── Password Modal ─────────────────────────────────────────────────────

function PasswordModal({ isOpen, onClose, onSubmit, loading }) {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!passwordData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!passwordData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = "Password must be at least 6 characters";
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(passwordData);
    }
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              <div>
                <p className="text-xs text-white/80">Security</p>
                <h3 className="text-lg font-bold">Change Password</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showPassword.current ? "text" : "password"}
                name="current_password"
                value={passwordData.current_password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 ${
                  errors.current_password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200"
                }`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.current ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="new_password"
                value={passwordData.new_password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 ${
                  errors.new_password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200"
                }`}
                placeholder="Enter new password (min 6 characters)"
              />
              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10 ${
                  errors.confirm_password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-200"
                }`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
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

function TeacherProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ─── Redux State ──────────────────────────────────────────────────────
  const profile = useSelector(selectTeacherProfile);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);
  
  // Stats from Redux
  const students = useSelector(selectTeacherStudents);
  const assignments = useSelector(selectTeacherAssignments);
  const attendanceStats = useSelector(selectTeacherAttendanceStats);
  const classes = useSelector(selectTeacherClasses);

  // ─── Local State ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    qualification: "",
    subject_specialization: "",
    experience: "",
    join_date: "",
    status: "",
    school: "",
    bio: "",
  });
  const [dataFetched, setDataFetched] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  // ─── Calculate Stats ──────────────────────────────────────────────────
  const totalStudents = students?.length || 0;
  const totalSubjects = profile?.subject_specialization ? 1 : 0;
  const totalAssignments = assignments?.length || 0;
  const attendanceRate = attendanceStats?.percentage || 0;

  // ─── Get Name and Email using helpers ──────────────────────────────
  const fullName = getTeacherName(profile);
  const userEmail = getTeacherEmail(profile);

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
        await dispatch(fetchStudents({})).unwrap();
        await dispatch(fetchAssignments({})).unwrap();
        await dispatch(fetchAttendanceStats({})).unwrap();
        await dispatch(fetchTeacherClasses({})).unwrap();
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
      const employeeData = profile.employee || {};

      // Use getTeacherName and getTeacherEmail helpers
      const name = getTeacherName(profile);
      const email = getTeacherEmail(profile);

      setFormData({
        name: name,
        email: email,
        phone: profile.phone || "",
        address: employeeData.address || profile.address || "",
        qualification: profile.qualification || "",
        subject_specialization: profile.subject_specialization || "",
        experience: profile.experience ? `${profile.experience} years` : "",
        join_date: profile.join_date ? formatDate(profile.join_date) : "",
        status: profile.status || "Active",
        school: profile.school || "",
        bio: employeeData.bio || profile.bio || "",
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
        qualification: formData.qualification,
        subject_specialization: formData.subject_specialization,
        experience: parseInt(formData.experience) || 0,
        status: formData.status,
        address: formData.address,
        bio: formData.bio,
      };
      await dispatch(updateProfile(updateData)).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      await dispatch(changePassword(data)).unwrap();
      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err || "Failed to change password");
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && !dataFetched) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <PageHeader 
          title="Profile" 
          subtitle="Teacher profile" 
          breadcrumbs={["Teacher", "Profile"]} 
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
          subtitle="Teacher profile" 
          breadcrumbs={["Teacher", "Profile"]} 
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
          subtitle="Teacher profile" 
          breadcrumbs={["Teacher", "Profile"]} 
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
  const displayName = formData.name || fullName || "Teacher";
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
        breadcrumbs={["Teacher", "Profile"]} 
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
                  Teacher
                </span>
              </div>
              <p className="text-sm text-white/80">{displayEmail}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined: {formData.join_date || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {formData.qualification || "No qualification"}
                </span>
                <span className="flex items-center gap-1">
                  <BookMarked className="h-3.5 w-3.5" />
                  {formData.subject_specialization || "No specialization"}
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
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
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
          label="Students" 
          value={totalStudents} 
          icon={Users} 
          color="blue" 
          delay={0.05} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Subjects" 
          value={totalSubjects} 
          icon={BookOpen} 
          color="purple" 
          delay={0.1} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Assignments" 
          value={totalAssignments} 
          icon={FileCheck} 
          color="emerald" 
          delay={0.15} 
          isLoading={statsLoading} 
        />
        <StatCard 
          label="Attendance" 
          value={attendanceRate ? `${attendanceRate}%` : "0%"} 
          icon={BarChart3} 
          color="amber" 
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
              label="Qualification" 
              value={formData.qualification} 
              icon={GraduationCap} 
              isEditing={isEditing}
              name="qualification"
              onChange={handleInputChange}
            />
            <InfoItem 
              label="Experience" 
              value={formData.experience || "—"} 
              icon={Award} 
              isEditing={isEditing}
              name="experience"
              onChange={handleInputChange}
              placeholder="Years of experience"
            />
            <InfoItem 
              label="Subject Specialization" 
              value={formData.subject_specialization || "—"} 
              icon={BookMarked} 
              isEditing={isEditing}
              name="subject_specialization"
              onChange={handleInputChange}
            />
            <InfoItem 
              label="Address" 
              value={formData.address || "—"} 
              icon={MapPin} 
              isEditing={isEditing}
              name="address"
              onChange={handleInputChange}
            />
          </div>

          {isEditing && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                placeholder="Write a short bio about yourself..."
              />
            </div>
          )}
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
              <InfoItem label="Role" value="Teacher" icon={UserCheck} />
              <InfoItem label="School" value={formData.school || "—"} icon={School} />
              <InfoItem label="Join Date" value={formData.join_date || "—"} icon={CalendarDays} />
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Security
            </h2>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">
                  Change Password
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─── Quick Actions ────────────────────────────────────────────── */}
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
            icon={Users} 
            label="Students" 
            color="blue" 
            onClick={() => navigate("/teacher/students")}
          />
          <QuickAction 
            icon={BookOpen} 
            label="Classes" 
            color="purple" 
            onClick={() => navigate("/teacher/classes")}
          />
          <QuickAction 
            icon={FileCheck} 
            label="Assignments" 
            color="emerald" 
            onClick={() => navigate("/teacher/assignments")}
          />
          <QuickAction 
            icon={Calendar} 
            label="Timetable" 
            color="amber" 
            onClick={() => navigate("/teacher/timetable")}
          />
          <QuickAction 
            icon={BarChart3} 
            label="Attendance" 
            color="rose" 
            onClick={() => navigate("/teacher/attendance")}
          />
          <QuickAction 
            icon={Settings} 
            label="Settings" 
            color="gray" 
            onClick={() => navigate("/teacher/settings")}
          />
        </div>
      </motion.div>

      {/* ─── Password Modal ──────────────────────────────────────────── */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
        loading={submitting}
      />
    </motion.div>
  );
}

export default TeacherProfile;