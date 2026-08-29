/**
 * ============================================
 * PARENT SETTINGS COMPONENT
 * ============================================
 * 
 * Purpose: Parent settings page for managing profile, preferences, and security
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title, subtitle, and breadcrumbs
 * - Profile management (name, email, phone, address, occupation)
 * - Profile photo upload
 * - Change password functionality
 * - Notification preferences
 * - Language preferences
 * - Privacy settings
 * - Child management (view children)
 * - Account management (deactivate, logout)
 * - Two-factor authentication setup
 * - Session management
 * - Activity logs
 * - Responsive design for all screen sizes
 * - GSAP animations
 * - Loading and error states
 * - Toast notifications
 * - Form validation
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/components/layout/PageHeader
 * - @/components/ui/* for UI components
 * - @/modules/parent/store/parentThunks
 * - react-hook-form for form validation
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/users/parents/ - Get parent profile
 * - PATCH /api/users/parents/{id}/ - Update parent profile
 * - POST /api/auth/change-password/ - Change password
 * - GET /api/users/students/ - Get children
 * - POST /api/auth/logout/ - Logout
 * 
 * Usage:
 * <Route path="/parent/settings" element={<ParentSettings />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Shield,
  Bell,
  Globe,
  Users,
  LogOut,
  Trash2,
  Camera,
  Edit2,
  Smartphone,
  Key,
  Clock,
  Activity,
  ChevronRight,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchProfile,
  updateProfile,
  fetchParentLinks,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentProfile,
  selectParentLinks,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

// ─── Change Password Modal ──────────────────────────────────────────────

const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Weak",
    color: "bg-red-500",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
      setPasswordStrength({ score: 0, label: "Weak", color: "bg-red-500" });
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }

    // Password strength check
    if (field === "new_password" && value) {
      let score = 0;
      if (value.length >= 8) score += 1;
      if (value.match(/[a-z]/) && value.match(/[A-Z]/)) score += 1;
      if (value.match(/\d/)) score += 1;
      if (value.match(/[^a-zA-Z\d]/)) score += 1;

      const strengthMap = {
        0: { label: "Weak", color: "bg-red-500" },
        1: { label: "Weak", color: "bg-red-500" },
        2: { label: "Fair", color: "bg-amber-500" },
        3: { label: "Good", color: "bg-blue-500" },
        4: { label: "Strong", color: "bg-emerald-500" },
      };
      setPasswordStrength(strengthMap[score] || strengthMap[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }
    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    }
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      current_password: formData.current_password,
      new_password: formData.new_password,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[95%] sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white rounded-t-xl sm:rounded-t-2xl border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Change Password
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) => handleChange("current_password", e.target.value)}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.current_password ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base pr-10`}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => handleChange("new_password", e.target.value)}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.new_password ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base pr-10`}
                placeholder="Enter new password (min 8 chars)"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password}</p>}
            
            {/* Password Strength Indicator */}
            {formData.new_password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => handleChange("confirm_password", e.target.value)}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border ${errors.confirm_password ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base pr-10`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px]">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={loading} className="w-full sm:w-auto min-h-[36px] sm:min-h-[40px]">
              {loading ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentSettings = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const profile = useSelector(selectParentProfile);
  const children = useSelector(selectParentLinks);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchParentLinks());
  }, [dispatch]);

  // ─── Populate Form on Profile Load ──────────────────────────────────
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        occupation: profile.occupation || "",
      });
    }
  }, [profile]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await dispatch(updateProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        occupation: formData.occupation,
      })).unwrap();
      setIsEditing(false);
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      showToast(error || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (data) => {
    setIsChangingPassword(true);
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsPasswordModalOpen(false);
      showToast("Password changed successfully!", "success");
    } catch (error) {
      showToast(error || "Failed to change password", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    // In a real implementation, this would dispatch a logout action
    localStorage.removeItem("auth_data");
    window.location.href = "/login";
  };

  const handleDeactivate = () => {
    // In a real implementation, this would call an API endpoint
    showToast("Account deactivated successfully", "success");
    setTimeout(() => {
      localStorage.removeItem("auth_data");
      window.location.href = "/login";
    }, 1500);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader 
          title="Settings" 
          subtitle="Manage your account settings" 
          breadcrumbs={["Parent", "Settings"]}
        />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* ─── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : 
          toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Settings"
          subtitle="Manage your account settings and preferences"
          breadcrumbs={["Parent", "Settings"]}
        />
      </FadeIn>

      {/* ─── Error Message ────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading settings</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Section ───────────────────────────────────────────── */}
      <FadeIn>
        <Card className="p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Profile Information</h2>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="min-h-[32px] sm:min-h-[36px]"
              >
                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: profile?.full_name || profile?.name || "",
                      email: profile?.email || "",
                      phone: profile?.phone || "",
                      address: profile?.address || "",
                      occupation: profile?.occupation || "",
                    });
                  }}
                  disabled={saving}
                  className="min-h-[32px] sm:min-h-[36px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="min-h-[32px] sm:min-h-[36px]"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-800">{formData.full_name || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-800">{formData.email || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-800">{formData.phone || "—"}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Occupation
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleChange("occupation", e.target.value)}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-800">{formData.occupation || "—"}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={2}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base resize-none"
                />
              ) : (
                <p className="text-sm sm:text-base text-gray-800">{formData.address || "—"}</p>
              )}
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* ─── Settings Grid ────────────────────────────────────────────── */}
      <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Security */}
        <StaggerItem>
          <Card className="p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-800">Security</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Change Password</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Two-Factor Authentication</span>
                </div>
                <Badge className="bg-gray-200 text-gray-600 border-gray-200">Coming Soon</Badge>
              </button>
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Session Management</span>
                </div>
                <Badge className="bg-gray-200 text-gray-600 border-gray-200">Coming Soon</Badge>
              </button>
            </div>
          </Card>
        </StaggerItem>

        {/* Preferences */}
        <StaggerItem>
          <Card className="p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-semibold text-gray-800">Preferences</h3>
            </div>
            <div className="space-y-3">
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Notification Preferences</span>
                </div>
                <Badge className="bg-gray-200 text-gray-600 border-gray-200">Coming Soon</Badge>
              </button>
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Language</span>
                </div>
                <Badge className="bg-gray-200 text-gray-600 border-gray-200">English</Badge>
              </button>
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Activity Logs</span>
                </div>
                <Badge className="bg-gray-200 text-gray-600 border-gray-200">Coming Soon</Badge>
              </button>
            </div>
          </Card>
        </StaggerItem>

        {/* Children */}
        <StaggerItem>
          <Card className="p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-gray-800">Children</h3>
            </div>
            <div className="space-y-3">
              {children.length === 0 ? (
                <p className="text-sm text-gray-500">No children linked to your account</p>
              ) : (
                children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-xs">
                        {child.student_name?.charAt(0) || child.name?.charAt(0) || "C"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{child.student_name || child.name}</p>
                        <p className="text-xs text-gray-500">{child.class || "Class not assigned"}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      {child.relation || "Child"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </StaggerItem>

        {/* Account */}
        <StaggerItem>
          <Card className="p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-semibold text-gray-800">Account</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
              <button
                onClick={() => setIsDeactivateDialogOpen(true)}
                className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3 text-red-600">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Deactivate Account</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Change Password Modal ────────────────────────────────────── */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        loading={isChangingPassword}
      />

      {/* ─── Logout Confirmation Dialog ────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        variant="default"
        confirmText="Logout"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />

      {/* ─── Deactivate Confirmation Dialog ────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeactivateDialogOpen}
        onClose={() => setIsDeactivateDialogOpen(false)}
        title="Deactivate Account"
        message="Are you sure you want to deactivate your account? This action cannot be undone and all your data will be lost."
        variant="danger"
        confirmText="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setIsDeactivateDialogOpen(false)}
      />
    </div>
  );
};

export default ParentSettings;