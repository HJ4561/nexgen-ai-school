// src/modules/admin/pages/AdminSettings/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Save, Bell, CheckCircle, AlertCircle,
  Calendar, DollarSign, RefreshCw, AlertTriangle, Download,
  Trash2, X, EyeOff, Eye, Search, Filter
} from 'lucide-react';

// ─── Reusable Components ──────────────────────────────────────────────
import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import Card from "@/components/ui/Card";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations";

// ─── API ──────────────────────────────────────────────────────────────
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
const USERS_API = "/users/users/";
const NOTIFICATIONS_API = "/communication/notifications/";
const STUDENTS_API = "/users/students/";
const TEACHERS_API = "/users/teachers/";
const PARENTS_API = "/users/parents/";
const PAYMENTS_API = "/finance/payments/";
const FEES_API = "/finance/fees/";
const COMPLAINTS_API = "/complaints/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Change Password Modal ─────────────────────────────────────────────
const ChangePasswordModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    onSubmit({ currentPassword: oldPassword, newPassword });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={onClose} type="button" disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
export default function AdminSettings() {
  const navigate = useNavigate();
  
  // ─── Get user ID from localStorage ──────────────────────────────────
  const userId = useMemo(() => {
    try {
      const authData = localStorage.getItem('auth_data');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed?.user?.id || parsed?.id || null;
      }
    } catch (e) {
      console.error('Failed to parse auth data:', e);
    }
    return null;
  }, []);

  // ─── State ──────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // ─── Data State ──────────────────────────────────────────────────────
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [complaints, setComplaints] = useState([]);

  // ─── UI State ──────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'default',
    onConfirm: null,
  });

  // ─── Toast Helper ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Safe Fetch Helper ──────────────────────────────────────────────
  const safeFetch = async (url, fallbackData = []) => {
    try {
      const response = await api.get(url);
      return response.data?.results || response.data || fallbackData;
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error.message);
      return fallbackData;
    }
  };

  // ─── Fetch All Data ──────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current user info - use the correct endpoint
      let user = null;
      if (userId) {
        try {
          const userResponse = await api.get(`${USERS_API}${userId}/`);
          user = userResponse.data || {};
        } catch (error) {
          console.warn('Failed to fetch user data:', error);
          // Try to get user from localStorage as fallback
          try {
            const authData = localStorage.getItem('auth_data');
            if (authData) {
              const parsed = JSON.parse(authData);
              user = parsed?.user || parsed || {};
            }
          } catch (e) {
            console.error('Failed to parse auth data:', e);
          }
        }
      }

      setUserData(user);
      setProfileForm({
        full_name: user?.full_name || user?.name || '',
        email: user?.email || '',
      });

      // Fetch all other data in parallel
      const [
        notificationsData,
        studentsData,
        teachersData,
        parentsData,
        paymentsData,
        feesData,
        complaintsData,
      ] = await Promise.all([
        safeFetch(NOTIFICATIONS_API),
        safeFetch(STUDENTS_API),
        safeFetch(TEACHERS_API),
        safeFetch(PARENTS_API),
        safeFetch(PAYMENTS_API),
        safeFetch(FEES_API),
        safeFetch(COMPLAINTS_API),
      ]);

      setNotifications(notificationsData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setParents(parentsData);
      setPayments(paymentsData);
      setFees(feesData);
      setComplaints(complaintsData);

    } catch (error) {
      console.error("Failed to fetch settings data:", error);
      setError("Failed to load settings data. Please try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalTeachers = teachers.length;
    const totalParents = parents.length;
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const totalFees = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const openComplaints = complaints.filter(c => c.status === "pending" || c.status === "in-progress").length;

    return {
      totalStudents,
      totalTeachers,
      totalParents,
      totalRevenue,
      totalFees,
      openComplaints,
    };
  }, [students, teachers, parents, payments, fees, complaints]);

  // ─── Fee Stats ──────────────────────────────────────────────────────
  const feeStats = useMemo(() => {
    const totalBase = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const totalScholarship = fees.reduce((sum, f) => sum + (Number(f.discount || 0) || 0), 0);
    const activeChallans = fees.filter(f => f.status === "pending").length;

    return {
      activeChallans,
      totalRevenue,
      totalScholarship,
      totalBase,
    };
  }, [fees, payments]);

  // ─── Unread Count ──────────────────────────────────────────────────
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  // ─── Handlers ────────────────────────────────────────────────────

  // Update profile
  const handleProfileUpdate = async () => {
    if (!userData?.id) return;
    setIsUpdating(true);
    try {
      await api.patch(`${USERS_API}${userData.id}/`, {
        full_name: profileForm.full_name,
        name: profileForm.full_name,
        email: profileForm.email,
      });
      showToast('Profile updated successfully!', 'success');
      await fetchAllData();
    } catch (error) {
      console.error("Failed to update profile:", error);
      showToast(error.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const handleChangePassword = async (payload) => {
    setIsChangingPassword(true);
    try {
      await api.patch(`${USERS_API}${userData.id}/change-password/`, payload);
      showToast('Password changed successfully!', 'success');
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      showToast(error.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => 
        api.patch(`${NOTIFICATIONS_API}${id}/`, { is_read: true })
      ));
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      showToast(`Marked ${unreadIds.length} notifications as read`, 'success');
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  // Generate monthly fee challans
  const handleGenerateChallans = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post('/finance/generate-challans/', {
        month: new Date().toISOString().slice(0, 7) + '-01',
      });
      const result = response.data || {};
      showToast(`Challans generated: ${result.created || 0} created, ${result.skipped_existing || 0} skipped.`, 'success');
      await fetchAllData();
    } catch (error) {
      console.error("Failed to generate challans:", error);
      showToast(error.response?.data?.detail || 'Failed to generate challans', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Dialog Handlers ──────────────────────────────────────────────
  const showConfirmDialog = (title, message, confirmText, variant, onConfirm) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      confirmText,
      variant,
      onConfirm: () => {
        onConfirm();
        setDialogState({ ...dialogState, isOpen: false });
      },
    });
  };

  const closeDialog = () => setDialogState({ ...dialogState, isOpen: false });

  // Deactivate account
  const handleDeactivateAccount = () => {
    showConfirmDialog(
      'Deactivate Account?',
      'This action will permanently delete your admin account. You will lose access to the system. Are you sure?',
      'Deactivate',
      'danger',
      async () => {
        if (!userData?.id) return;
        try {
          await api.delete(`${USERS_API}${userData.id}/`);
          showToast('Account deactivated. Logging out...', 'success');
          localStorage.removeItem('auth_data');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } catch (error) {
          console.error("Failed to deactivate account:", error);
          showToast(error.response?.data?.detail || 'Failed to deactivate account', 'error');
        }
      }
    );
  };

  // Export data
  const handleExportData = () => {
    const rows = [
      ['Admin ID', userData?.id || ''],
      ['Name', profileForm.full_name],
      ['Email', profileForm.email],
      ['Total Students', stats.totalStudents],
      ['Total Teachers', stats.totalTeachers],
      ['Total Parents', stats.totalParents],
      ['Active Challans', feeStats.activeChallans],
      ['Total Revenue', feeStats.totalRevenue],
      ['Total Scholarship', feeStats.totalScholarship],
      ['Open Complaints', stats.openComplaints],
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Export downloaded successfully.', 'success');
  };

  // Clear cache
  const handleClearCache = () => {
    showConfirmDialog(
      'Clear Cache?',
      'This will clear all locally stored data and log you out. Proceed?',
      'Clear',
      'default',
      () => {
        localStorage.clear();
        window.location.href = '/login';
      }
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
          <PageHeader
            title="Admin Settings"
            subtitle="Manage your profile, fee cycles, and security settings."
            breadcrumbs={['Admin', 'Settings']}
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading settings...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300 ${toast.type === "success" ? "border-emerald-200" : "border-red-200"}`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Admin Settings"
          subtitle="Manage your profile, fee cycles, and security settings."
          breadcrumbs={['Admin', 'Settings']}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">Role: Admin</Badge>
            </div>
          }
        />
      </FadeIn>

      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading settings</p>
            <p className="text-amber-600">{error}</p>
          </div>
        </div>
      )}

      {/* ─── Row 1: Stats Overview ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
          <p className="text-xs text-gray-400 mt-1">Active students</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalTeachers}</p>
          <p className="text-xs text-gray-400 mt-1">Total teachers</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Total collected</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open Complaints</p>
          <p className="text-2xl font-bold text-amber-600">{stats.openComplaints}</p>
          <p className="text-xs text-gray-400 mt-1">Pending resolution</p>
        </Card>
      </div>

      {/* ─── Row 2: Profile + Notifications ────────────────────────── */}
      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <StaggerItem>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Admin ID
                </label>
                <div className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {userData?.id || '—'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleProfileUpdate}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
                >
                  {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update Profile
                </button>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Notifications Card */}
        <StaggerItem>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-600" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">Unread Notifications</p>
                  <p className="text-xs text-gray-500">
                    You have {unreadCount} unread notification{unreadCount !== 1 && 's'}
                  </p>
                </div>
                <span className="text-2xl font-bold text-blue-600">{unreadCount}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${!n.is_read ? 'bg-blue-50/30 border border-blue-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className={`mt-0.5 p-1 rounded-full ${!n.is_read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Bell size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-800 truncate">{n.title || n.message || "Notification"}</p>
                      <p className="text-[10px] text-gray-500">{formatDate(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                    )}
                  </div>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All as Read
                </button>
              )}

              <button
                onClick={() => navigate('/admin/notifications')}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Bell className="w-4 h-4" />
                View All Notifications
              </button>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Row 3: Monthly Fee Cycle + Danger Zone ────────────────── */}
      <StaggerGroup className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Fee Cycle Card */}
        <StaggerItem className="lg:col-span-3">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 shadow-lg text-white relative overflow-hidden hover:shadow-xl transition-shadow">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Monthly Fee Cycle
                </h3>
                <Badge className="bg-white/20 text-white border-none text-[10px]">
                  {feeStats.activeChallans > 0 ? 'Active' : 'No pending'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Active Challans</p>
                  <p className="text-xs font-semibold">{feeStats.activeChallans}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Revenue</p>
                  <p className="text-xs font-semibold">{formatCurrency(feeStats.totalRevenue)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                  <p className="text-[9px] text-white/60 uppercase tracking-wider">Scholarship</p>
                  <p className="text-xs font-semibold">{formatCurrency(feeStats.totalScholarship)}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider">Expected Revenue</p>
                    <p className="text-lg font-bold">{formatCurrency(feeStats.totalRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/50 line-through">
                      {formatCurrency(feeStats.totalBase)}
                    </p>
                    <p className="text-[9px] text-emerald-300 font-semibold">
                      - {formatCurrency(feeStats.totalScholarship)}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{
                      width: `${feeStats.totalBase > 0 ? Math.min((feeStats.totalRevenue / feeStats.totalBase) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateChallans}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-700 bg-white rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isGenerating ? 'Generating...' : 'Run Monthly Cycle'}
              </button>
              <p className="text-[9px] text-white/50 text-center mt-2">
                Generate challans for current month
              </p>
            </div>
          </div>
        </StaggerItem>

        {/* Danger Zone */}
        <StaggerItem className="lg:col-span-7">
          <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-500">These actions are irreversible.</p>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Export Data */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">Export Data</p>
                  <p className="text-sm text-gray-500">Download settings summary as CSV</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Clear Cache */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">Clear Cache</p>
                  <p className="text-sm text-gray-500">Clear local storage and log out</p>
                </div>
                <button
                  onClick={handleClearCache}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear & Logout
                </button>
              </div>

              {/* Deactivate Account */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-red-600">Deactivate Account</p>
                  <p className="text-sm text-gray-500">Permanently delete your admin account</p>
                </div>
                <button
                  onClick={handleDeactivateAccount}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 shadow-md shadow-red-600/25 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerGroup>

      {/* ─── Change Password Modal ─── */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePassword}
        loading={isChangingPassword}
      />

      {/* ─── Confirm Dialog ─── */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText="Cancel"
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}