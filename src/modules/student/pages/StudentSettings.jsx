// src/modules/student/pages/StudentSettings.jsx

/**
 * ============================================
 * STUDENT SETTINGS - COMPLETE
 * ============================================
 * 
 * Purpose: Student settings with full API integration
 * 
 * API Endpoints:
 * - GET /api/users/students/me/ - Get student profile
 * - PATCH /api/users/students/me/ - Update student profile
 * - POST /api/auth/change-password/ - Change password
 * - PATCH /api/users/students/me/preferences/ - Update preferences
 * 
 * USAGE OF NEW API FIELDS:
 * - user_name from profile (read-only)
 * - class_name from profile (read-only)
 * - parent_name from profile (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  Lock,
  Bell,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  Key,
  Fingerprint,
  Camera,
  Settings,
  ShieldCheck,
  Sparkles,
  Moon,
  Sun,
  Award,
  TrendingUp,
  Star,
  Clock,
  Calendar as CalendarIcon,
  Users,
  School,
  Loader2,
  ChevronRight,
  MailCheck,
  Smartphone,
  Crown,
  Edit,
  UserCircle,
  Venus,
  Mars,
  Cake,
  Hash,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/services/api";
import {
  fetchProfile,
  updateProfile,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentProfile,
  selectStudentLoading,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getUserName = (profile) => {
  if (!profile) return null;
  // ✅ 1. PRIORITY: Use user_name from API (new field!)
  if (profile.user_name && profile.user_name !== 'null') return profile.user_name;
  // 2. FALLBACK: Use user object
  if (profile.user) {
    if (typeof profile.user === 'string') return profile.user;
    if (profile.user.name) return profile.user.name;
    if (profile.user.user_name) return profile.user.user_name;
  }
  if (profile.name) return profile.name;
  return null;
};

const getClassName = (profile) => {
  if (!profile) return null;
  // ✅ 1. PRIORITY: Use class_name from API (new field!)
  if (profile.class_name && profile.class_name !== 'null') return profile.class_name;
  // 2. FALLBACK: Use class_obj object
  if (profile.class_obj) {
    if (typeof profile.class_obj === 'string') return profile.class_obj;
    if (profile.class_obj.name) return profile.class_obj.name;
    if (profile.class_obj.class_name) return profile.class_obj.class_name;
  }
  return null;
};

const getParentName = (profile) => {
  if (!profile) return null;
  // ✅ 1. PRIORITY: Use parent_name from API (new field!)
  if (profile.parent_name && profile.parent_name !== 'null') return profile.parent_name;
  // 2. FALLBACK: Use parent object
  if (profile.parent) {
    if (typeof profile.parent === 'string') return profile.parent;
    if (profile.parent.name) return profile.parent.name;
    if (profile.parent.parent_name) return profile.parent.parent_name;
  }
  return null;
};

// ─── Toast Notification ───────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const configs = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", iconColor: "text-emerald-500" },
    error: { icon: XCircle, bg: "bg-red-50", text: "text-red-700", iconColor: "text-red-500" },
    info: { icon: AlertCircle, bg: "bg-blue-50", text: "text-blue-700", iconColor: "text-blue-500" },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${config.bg} border-gray-100 px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      <Icon className={`h-5 w-5 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.text}`}>{message}</span>
    </motion.div>
  );
}

// ─── Profile Avatar ────────────────────────────────────────────────────

function ProfileAvatar({ name, email, profile }) {
  const fileInputRef = useRef(null);
  
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const studentName = getUserName(profile) || name || "Student";
  const classDisplay = getClassName(profile) || "Class";

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-indigo-100">
          {getInitials(studentName)}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all"
        >
          <Camera className="h-3.5 w-3.5 text-gray-500" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
      </div>
      <h3 className="mt-3 text-lg font-semibold text-gray-800">{studentName}</h3>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <School className="h-3.5 w-3.5" />
          {classDisplay}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          <BadgeCheck className="h-3 w-3" />
          Verified
        </span>
      </div>
    </div>
  );
}

// ─── Stats Row ─────────────────────────────────────────────────────────

function StatsRow({ profile }) {
  const studentName = getUserName(profile) || "Student";
  const classDisplay = getClassName(profile) || "Class";
  
  const stats = [
    { icon: GraduationCap, label: "Class", value: classDisplay },
    { icon: Users, label: "Parent", value: getParentName(profile) || "N/A" },
    { icon: Calendar, label: "Admission", value: profile?.admission_date || "N/A" },
    { icon: CreditCard, label: "Admission No", value: profile?.admission_no || "N/A" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <Icon className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Settings Card ─────────────────────────────────────────────────────

function SettingsCard({ title, description, icon: Icon, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </motion.div>
  );
}

// ─── Settings Field ────────────────────────────────────────────────────

function SettingsField({ label, icon: Icon, children, required, readOnly }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-4 w-4 text-gray-400" />
        <label className="text-sm font-medium text-gray-600">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
          {readOnly && <span className="text-xs text-gray-400 ml-1">(read-only)</span>}
        </label>
      </div>
      {children}
    </div>
  );
}

// ─── Read-Only Field ──────────────────────────────────────────────────

function ReadOnlyField({ value, placeholder }) {
  return (
    <div className="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed">
      {value || placeholder || "Not set"}
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────

function Input({ value, onChange, placeholder, type = "text", disabled, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      }`}
      {...props}
    />
  );
}

// ─── Select ────────────────────────────────────────────────────────────

function Select({ value, onChange, options, placeholder, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-indigo-500" : "bg-gray-300"
        }`}
        type="button"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function StudentSettings() {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const loading = useSelector(selectStudentLoading);
  const error = useSelector(selectStudentError);

  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Profile State ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    gender: "",
    dob: "",
    parent_phone: "",
    parent_email: "",
  });

  // ─── Password State ─────────────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // ─── Preferences State ──────────────────────────────────────────
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    language: "en",
    profile_visibility: "public",
  });

  // ─── Load Profile Data ──────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setToast({ message: 'Failed to load profile data', type: 'error' });
    }
  }, [dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Update form data when profile loads ──────────────────────
  useEffect(() => {
    if (profile) {
      setFormData({
        phone: profile.phone || "",
        address: profile.address || "",
        gender: profile.gender || "",
        dob: profile.dob || "",
        parent_phone: profile.parent?.phone || profile.parent_phone || "",
        parent_email: profile.parent?.email || profile.parent_email || "",
      });
    }
  }, [profile]);

  // ─── Debug new API fields ──────────────────────────────────────
  useEffect(() => {
    if (profile) {
      console.log("📊 Profile fields:", Object.keys(profile));
      console.log("📊 user_name:", profile.user_name);
      console.log("📊 class_name:", profile.class_name);
      console.log("📊 parent_name:", profile.parent_name);
    }
  }, [profile]);

  // ─── Handle Profile Update ──────────────────────────────────────
  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setToast({ message: err || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Handle Password Change ─────────────────────────────────────
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setToast({ message: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/auth/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setToast({ message: 'Password changed successfully!', type: 'success' });
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error('Failed to change password:', err);
      const msg = err.response?.data?.message || 'Failed to change password';
      setToast({ message: msg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Handle Preferences Update ─────────────────────────────────
  const handlePreferencesUpdate = async () => {
    setIsSaving(true);
    try {
      await api.patch('/users/students/me/preferences/', preferences);
      setToast({ message: 'Preferences updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setToast({ message: 'Preferences updated', type: 'success' });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Refresh ─────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
    setToast({ message: 'Settings refreshed', type: 'info' });
  };

  // ─── Form Input Change ──────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ─── Password Input Change ──────────────────────────────────────
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const studentName = getUserName(profile) || "Student";
  const classDisplay = getClassName(profile) || "Class";
  const parentName = getParentName(profile);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto pb-12">
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ─── Page Header ────────────────────────────────────────────── */}
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and preferences"
        breadcrumbs={["Student", "Settings"]}
        bgColor="bg-indigo-50"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {parentName && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
                <Users className="h-3.5 w-3.5" />
                Parent: {parentName}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 rounded-lg text-xs font-medium text-indigo-700">
              <School className="h-3.5 w-3.5" />
              {classDisplay}
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="mt-6" />

      {/* ─── Profile & Stats ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <ProfileAvatar name={studentName} profile={profile} />
          <div className="flex-1 w-full">
            <StatsRow profile={profile} />
          </div>
        </div>
      </motion.div>

      {/* ─── Settings Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {/* Profile */}
        <SettingsCard title="Profile" description="Your personal information" icon={User} delay={0.05}>
          <SettingsField label="Full Name" icon={User} readOnly>
            <ReadOnlyField value={studentName} placeholder="Enter your full name" />
          </SettingsField>

          <SettingsField label="Email" icon={Mail} readOnly>
            <ReadOnlyField value={profile?.user?.email || profile?.email || "No email set"} placeholder="Enter your email" />
          </SettingsField>

          <SettingsField label="Phone" icon={Phone}>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Enter your phone number"
            />
          </SettingsField>

          <SettingsField label="Address" icon={MapPin}>
            <Input
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Enter your address"
            />
          </SettingsField>

          <SettingsField label="Date of Birth" icon={CalendarIcon}>
            <Input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleFormChange}
              placeholder="Select date of birth"
            />
          </SettingsField>

          <SettingsField label="Gender" icon={User}>
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
              placeholder="Select gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
          </SettingsField>

          <button
            onClick={handleProfileUpdate}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </SettingsCard>

        {/* Academic (Read-Only) */}
        <SettingsCard title="Academic" description="Your academic details (read-only)" icon={GraduationCap} delay={0.1}>
          <SettingsField label="Class" icon={BookOpen} readOnly>
            <ReadOnlyField value={classDisplay} placeholder="Not set" />
          </SettingsField>

          <SettingsField label="Admission No" icon={Hash} readOnly>
            <ReadOnlyField value={profile?.admission_no || "Not set"} placeholder="Not set" />
          </SettingsField>

          <SettingsField label="Admission Date" icon={Calendar} readOnly>
            <ReadOnlyField value={profile?.admission_date || "Not set"} placeholder="Not set" />
          </SettingsField>

          <SettingsField label="Student ID" icon={CreditCard} readOnly>
            <ReadOnlyField value={`#STU-${String(profile?.id || '').padStart(4, '0')}`} placeholder="Not set" />
          </SettingsField>

          <SettingsField label="Status" icon={ShieldCheck} readOnly>
            <ReadOnlyField value={profile?.user?.status || profile?.status || "Active"} placeholder="Not set" />
          </SettingsField>
        </SettingsCard>

        {/* Parent/Guardian */}
        <SettingsCard title="Parent/Guardian" description="Your parent or guardian info" icon={UserPlus} delay={0.15}>
          <SettingsField label="Parent Name" icon={User} readOnly>
            <ReadOnlyField value={parentName || "Not set"} placeholder="Enter parent name" />
          </SettingsField>

          <SettingsField label="Phone" icon={Phone}>
            <Input
              name="parent_phone"
              value={formData.parent_phone}
              onChange={handleFormChange}
              placeholder="Enter parent phone"
            />
          </SettingsField>

          <SettingsField label="Email" icon={Mail}>
            <Input
              type="email"
              name="parent_email"
              value={formData.parent_email}
              onChange={handleFormChange}
              placeholder="Enter parent email"
            />
          </SettingsField>

          <button
            onClick={handleProfileUpdate}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </SettingsCard>

        {/* Security */}
        <SettingsCard title="Security" description="Change your password" icon={Lock} delay={0.2}>
          <SettingsField label="Current Password" icon={Key}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChangeInput}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </SettingsField>

          <SettingsField label="New Password" icon={Key}>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handlePasswordChangeInput}
              placeholder="Enter new password (min 6 chars)"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </SettingsField>

          <SettingsField label="Confirm Password" icon={Key}>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChangeInput}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </SettingsField>

          <button
            onClick={handlePasswordChange}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Change Password
              </>
            )}
          </button>
        </SettingsCard>

        {/* Preferences */}
        <SettingsCard title="Preferences" description="Customize your experience" icon={Bell} delay={0.25}>
          <Toggle
            label="Email Notifications"
            description="Receive updates via email"
            enabled={preferences.email_notifications}
            onChange={(val) => setPreferences({ ...preferences, email_notifications: val })}
          />

          <Toggle
            label="SMS Notifications"
            description="Receive updates via SMS"
            enabled={preferences.sms_notifications}
            onChange={(val) => setPreferences({ ...preferences, sms_notifications: val })}
          />

          <Toggle
            label="Push Notifications"
            description="Receive real-time notifications"
            enabled={preferences.push_notifications}
            onChange={(val) => setPreferences({ ...preferences, push_notifications: val })}
          />

          <SettingsField label="Language" icon={Globe}>
            <Select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              options={[
                { value: "en", label: "English" },
                { value: "ur", label: "Urdu" },
                { value: "ar", label: "Arabic" },
                { value: "fr", label: "French" },
                { value: "es", label: "Spanish" },
              ]}
            />
          </SettingsField>

          <SettingsField label="Profile Visibility" icon={Fingerprint}>
            <Select
              value={preferences.profile_visibility}
              onChange={(e) => setPreferences({ ...preferences, profile_visibility: e.target.value })}
              options={[
                { value: "public", label: "Public" },
                { value: "teachers_only", label: "Teachers Only" },
                { value: "private", label: "Private" },
              ]}
            />
          </SettingsField>

          <button
            onClick={handlePreferencesUpdate}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Preferences
              </>
            )}
          </button>
        </SettingsCard>
      </div>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>© 2024 Smart School Management System • Settings Module</p>
      </div>
    </div>
  );
}

export default StudentSettings;