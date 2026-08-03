/**
 * ============================================
 * FORGOT PASSWORD PAGE
 * ============================================
 * 
 * Purpose: Allow users to reset their password via email OTP
 * Used by: All users (admin, teacher, student, parent)
 * 
 * Flow:
 * 1. User enters email → Request OTP
 * 2. User enters 6-digit OTP + new password
 * 3. OTP verified → Password reset → Success page
 * 
 * Features:
 * - Email input with validation
 * - OTP input with auto-focus and paste support
 * - Resend OTP with countdown timer
 * - Password strength indicator
 * - Show/hide password toggle
 * - Step-by-step flow (email → reset → done)
 * - Redux integration for API calls
 * 
 * Dependencies:
 * - Redux for auth state management
 * - React Router for navigation
 * - UI components (Input, Button, PasswordStrength)
 * ============================================
 */

import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

import Input from '@/components/ui/Input'; import Button from '@/components/ui/Button'; import PasswordStrength from "@/components/composite/PasswordStrength";
import { requestOtp, confirmOtpAndReset } from "@/modules/auth/store/authThunks";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

/**
 * ForgotPassword Component
 * 
 * @component
 * @returns {JSX.Element} Rendered forgot password page
 * 
 * @example
 * // In router:
 * <Route path="/forgot-password" element={<ForgotPassword />} />
 */
function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // ─── Steps: 'email' | 'reset' | 'done' ──────────────────────────────
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const otpRefs = useRef([]);

  // ─── Countdown for Resend OTP ──────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // ─── Step 1: Send OTP ──────────────────────────────────────────────
  async function handleSendOtp(e) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await dispatch(requestOtp({ email })).unwrap();
      setStep('reset');
      setResendTimer(RESEND_SECONDS);
      setOtp(Array(OTP_LENGTH).fill(''));
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  }

  // ─── Resend OTP ──────────────────────────────────────────────────────
  function handleResendOtp() {
    if (resendTimer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setResendTimer(RESEND_SECONDS);
    setError('');
    dispatch(requestOtp({ email }))
      .unwrap()
      .catch((err) => setError(err.message || 'Failed to resend OTP.'));
  }

  // ─── OTP Box Handlers ──────────────────────────────────────────────
  function handleOtpChange(index, value) {
    if (!/^[0-9]?$/.test(value)) return;
    setError('');
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^[0-9]+$/.test(pasted)) return;
    e.preventDefault();

    const digits = pasted.slice(0, OTP_LENGTH).split('');
    const next = Array(OTP_LENGTH).fill('');
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  }

  // ─── Step 2: Verify OTP + Reset Password ────────────────────────────
  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await dispatch(confirmOtpAndReset({
        email,
        token: code,
        new_password: newPassword,
      })).unwrap();

      setStep('done');
    } catch (err) {
      setError(err.message || 'Invalid OTP or password reset failed.');
    }
  }

  // ─── Step 3: Done ──────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg">
            <CheckCircle2 size={28} className="text-success-text" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Password reset</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link to="/login">
          <Button type="button" fullWidth tone="brand">
            Back to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        {step === 'email' && (
          <>
            <h2 className="text-2xl font-bold text-text-primary">Forgot password?</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Enter your email and we'll send you a 6-digit verification code.
            </p>
          </>
        )}
        {step === 'reset' && (
          <>
            <h2 className="text-2xl font-bold text-text-primary">Verify & Reset Password</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Enter the 6-digit code sent to <span className="font-semibold text-text-primary">{email}</span> and set a new password.
            </p>
          </>
        )}
      </div>

      {/* ── Error Message ── */}
      {error && (
        <div className="rounded-input bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {error}
        </div>
      )}

      {/* ── Step 1: Email Form ── */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="name@school.edu"
            value={email}
            onChange={(e) => { setError(''); setEmail(e.target.value); }}
            leftIcon={<Mail size={16} />}
            required
          />
          <Button type="submit" fullWidth loading={loading} tone="brand">
            Send Verification Code
          </Button>
        </form>
      )}

      {/* ── Step 2: OTP + New Password ── */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* OTP Inputs */}
          <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="h-12 w-11 rounded-input border-2 border-surface-muted text-center text-lg font-semibold text-text-primary focus:border-brand-primary focus:outline-none transition-colors"
              />
            ))}
          </div>

          {/* Resend OTP */}
          <div className="text-center text-sm text-text-secondary">
            {resendTimer > 0 ? (
              <>Resend code in <span className="font-medium text-text-primary">{resendTimer}s</span></>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="font-medium text-brand-primary hover:text-brand-hover transition-colors"
              >
                Resend code
              </button>
            )}
          </div>

          {/* Divider */}
          <hr className="border-surface-muted" />

          {/* New Password */}
          <div className="space-y-1">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="new_password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => { setError(''); setNewPassword(e.target.value); }}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <PasswordStrength password={newPassword} />
          </div>

          <Input
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            name="confirm_password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => { setError(''); setConfirmPassword(e.target.value); }}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-text-muted hover:text-text-primary transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />

          <Button type="submit" fullWidth loading={loading} tone="brand" leftIcon={<ShieldCheck size={18} />}>
            Verify & Reset Password
          </Button>
        </form>
      )}

      {/* ── Back to Login ── */}
      <p className="text-center text-sm text-text-secondary">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-brand-primary hover:text-brand-hover transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;















