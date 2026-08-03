/**
 * ============================================
 * PENDING APPROVAL PAGE
 * ============================================
 * 
 * Purpose: Show pending approval status for newly registered users
 * Used by: Users who have registered but not yet approved
 * 
 * Features:
 * - Real API integration with Redux
 * - Auto-checks approval status on load
 * - Redirects to dashboard when approved (status === 'Active')
 * - Uses sessionStorage for temporary credentials
 * - Toast notifications for status updates
 * - Role-based redirect mapping
 * 
 * Flow:
 * 1. User registers → credentials stored in sessionStorage
 * 2. User redirected to PendingApproval
 * 3. Auto-check status on page load
 * 4. If approved → redirect to dashboard
 * 5. If pending → show waiting screen with refresh button
 * 
 * Dependencies:
 * - Redux for auth state management
 * - React Router for navigation
 * - UI components (Button)
 * ============================================
 */

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Hourglass, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

import Button from '@/components/ui/Button';
import { loginUser, fetchUserProfile } from "@/modules/auth/store/authThunks";

// ─── Role redirect map ──────────────────────────────────────────────────────
const ROLE_REDIRECTS = {
  admin: '/admin/dashboard',
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  parent: '/parent/dashboard',
};

/**
 * PendingApproval Component
 * 
 * @component
 * @returns {JSX.Element} Rendered pending approval page
 * 
 * @example
 * // In router:
 * <Route path="/pending-approval" element={<PendingApproval />} />
 */
function PendingApproval() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // ─── Local State ──────────────────────────────────────────────────────
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // ─── Effect 1: Auto-redirect if user is Active ──────────────────────────
  useEffect(() => {
    if (isAuthenticated && user?.status === 'Active') {
      const role = user?.role_name?.toLowerCase();
      const redirectPath = ROLE_REDIRECTS[role] || '/login';
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, navigate]);

  // ─── Effect 2: Auto-check status on page load ──────────────────────────
  useEffect(() => {
    // Check status automatically on page load
    const storedEmail = sessionStorage.getItem('pending_email');
    const storedPassword = sessionStorage.getItem('pending_password');

    if (storedEmail && storedPassword) {
      handleCheckStatus(); // automatically check
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ─── Handler: Check Status ──────────────────────────────────────────────
  const handleCheckStatus = async () => {
    const storedEmail = sessionStorage.getItem('pending_email');
    const storedPassword = sessionStorage.getItem('pending_password');

    // If no credentials, redirect to login
    if (!storedEmail || !storedPassword) {
      setToastMessage('No pending registration found. Please login.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      navigate('/login');
      return;
    }

    try {
      // Step 1: Login (to get token)
      await dispatch(loginUser({ email: storedEmail, password: storedPassword })).unwrap();

      // Step 2: Profile fetch (status check)
      await dispatch(fetchUserProfile()).unwrap();

      // Step 3: Show toast - Still pending (if redirect didn't happen)
      setToastMessage('Status refreshed. Your account is still pending approval.');
      setToastType('info');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      // Error already in Redux state
      setToastMessage('Your account is still pending approval. Please wait.');
      setToastType('info');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 text-center relative">
      {/* Icon */}
      <div className="relative flex justify-center pt-2">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-bg/50"
          style={{ animation: 'pending-float 6s ease-in-out infinite' }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-bg">
            <MoreHorizontal size={32} className="text-warning-text" />
          </div>
        </div>
        <div className="absolute -top-1 right-[calc(50%-3rem)] flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-soft">
          <Hourglass size={12} strokeWidth={2.2} className="text-warning-text" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Account Under Review</h2>
        <p className="mt-2 text-sm text-text-secondary px-2">
          Thank you for registering! Your account is currently being reviewed by
          our administration team. You'll be able to access all features once
          your registration is approved.
        </p>
      </div>

      {/* Status badge */}
      <div className="inline-flex items-center gap-2 rounded-input border border-warning-text/20 bg-warning-bg px-4 py-2 text-sm font-medium text-warning-text">
        <span className="h-2 w-2 rounded-full bg-warning-text animate-pulse" />
        Status: Pending Verification
      </div>

      {/* Redux Error (if any) */}
      {error && (
        <div className="rounded-input bg-danger-bg px-4 py-3 text-sm text-danger-text border border-danger-border">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Refresh Status button */}
      <Button
        type="button"
        fullWidth
        loading={loading}
        tone="brand"
        leftIcon={<RefreshCw size={18} className={loading ? 'animate-spin' : ''} />}
        onClick={handleCheckStatus}
      >
        Refresh Status
      </Button>

      {/* Back to Login */}
      <Button
        variant="secondary"
        type="button"
        fullWidth
        onClick={() => navigate('/login')}
      >
        Back to Login
      </Button>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-white shadow-dropdown">
          {toastType === 'success' ? (
            <CheckCircle2 size={18} className="text-success-text" />
          ) : toastType === 'error' ? (
            <AlertCircle size={18} className="text-danger-text" />
          ) : (
            <Hourglass size={18} className="text-warning-text" />
          )}
          {toastMessage}
        </div>
      )}

      <style>{`
        @keyframes pending-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default PendingApproval;















