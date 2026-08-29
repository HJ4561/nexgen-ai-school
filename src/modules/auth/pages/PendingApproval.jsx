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
 * ============================================
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Hourglass, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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
  const [isChecking, setIsChecking] = useState(false);

  // ─── Toast Helpers ──────────────────────────────────────────────────────
  const showToastMessage = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, []);

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
    const storedEmail = sessionStorage.getItem('pending_email');
    const storedPassword = sessionStorage.getItem('pending_password');

    if (storedEmail && storedPassword) {
      // Small delay to allow component to mount
      const timer = setTimeout(() => {
        handleCheckStatus();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // No credentials found, show message and redirect after delay
      showToastMessage('No pending registration found. Please login.', 'error');
      setTimeout(() => navigate('/login'), 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ─── Handler: Check Status ──────────────────────────────────────────────
  const handleCheckStatus = useCallback(async () => {
    const storedEmail = sessionStorage.getItem('pending_email');
    const storedPassword = sessionStorage.getItem('pending_password');

    // If no credentials, redirect to login
    if (!storedEmail || !storedPassword) {
      showToastMessage('No pending registration found. Please login.', 'error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (isChecking) return;
    setIsChecking(true);

    try {
      // Step 1: Login (to get token)
      await dispatch(loginUser({ email: storedEmail, password: storedPassword })).unwrap();

      // Step 2: Profile fetch (status check)
      await dispatch(fetchUserProfile()).unwrap();

      // If we get here and user is not active, show pending message
      if (user?.status !== 'Active') {
        showToastMessage('Your account is still pending approval. Please wait.', 'info');
      }
    } catch (err) {
      // Error already in Redux state
      showToastMessage('Your account is still pending approval. Please wait.', 'info');
    } finally {
      setIsChecking(false);
    }
  }, [dispatch, navigate, showToastMessage, user?.status, isChecking]);

  // ─── Handler: Back to Login ──────────────────────────────────────────────
  const handleBackToLogin = useCallback(() => {
    // Clear stored credentials
    sessionStorage.removeItem('pending_email');
    sessionStorage.removeItem('pending_password');
    navigate('/login');
  }, [navigate]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6 text-center">
        
        {/* Icon */}
        <div className="relative flex justify-center pt-2">
          <div
            className="h-20 w-20 md:h-24 md:w-24 flex items-center justify-center rounded-full bg-amber-50/80"
            style={{ animation: 'pending-float 6s ease-in-out infinite' }}
          >
            <div className="h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full bg-amber-100">
              <MoreHorizontal size={32} className="md:w-10 md:h-10 text-amber-600" />
            </div>
          </div>
          <div className="absolute -top-1 right-[calc(50%-1.5rem)] md:right-[calc(50%-1.75rem)] h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-white shadow-md">
            <Hourglass size={14} className="md:w-4 md:h-4 text-amber-600" strokeWidth={2.2} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Account Under Review</h2>
          <p className="mt-2 text-sm md:text-base text-gray-600 px-2">
            Thank you for registering! Your account is currently being reviewed by
            our administration team. You'll be able to access all features once
            your registration is approved.
          </p>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Status: Pending Verification
        </div>

        {/* Redux Error (if any) */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Refresh Status button */}
        <Button
          type="button"
          fullWidth
          loading={isChecking || loading}
          tone="brand"
          leftIcon={
            <RefreshCw 
              size={18} 
              className={isChecking || loading ? 'animate-spin' : ''} 
            />
          }
          onClick={handleCheckStatus}
          disabled={isChecking || loading}
        >
          {isChecking || loading ? 'Checking...' : 'Refresh Status'}
        </Button>

        {/* Back to Login */}
        <Button
          variant="secondary"
          type="button"
          fullWidth
          onClick={handleBackToLogin}
          className="mt-2"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Login
        </Button>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-4 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 max-w-full md:max-w-md animate-in slide-in-from-bottom-4 duration-300">
            <div className={`flex items-center gap-2 rounded-xl px-4 md:px-5 py-3 text-xs md:text-sm font-medium shadow-lg ${
              toastType === 'success' ? 'bg-emerald-600 text-white' :
              toastType === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {toastType === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
              {toastType === 'error' && <AlertCircle size={18} className="shrink-0" />}
              {toastType === 'info' && <Hourglass size={18} className="shrink-0" />}
              <span className="break-words">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pending-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pending-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PendingApproval;