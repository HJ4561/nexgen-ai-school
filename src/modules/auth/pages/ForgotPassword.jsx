/**
 * ============================================
 * FORGOT PASSWORD PAGE
 * ============================================
 * 
 * Purpose: Allow users to reset their password via email OTP
 * Used by: All users (admin, teacher, student, parent)
 * 
 * Flow:
 * 1. User enters email â†’ Request OTP
 * 2. User enters 6-digit OTP + new password
 * 3. OTP verified â†’ Password reset â†’ Success page
 * 
 * Features:
 * - Email input with validation
 * - OTP input with auto-focus and paste support
 * - Resend OTP with countdown timer
 * - Password strength indicator
 * - Show/hide password toggle
 * - Step-by-step flow (email â†’ reset â†’ done)
 * - Redux integration for API calls
 * ============================================
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PasswordStrength from "@/components/common/PasswordStrength";
import { requestOtp, confirmOtpAndReset } from "@/modules/auth/store/authThunks";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

/**
 * ForgotPassword Component
 * 
 * @component
 * @returns {JSX.Element} Rendered forgot password page
 */
function ForgotPassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // â”€â”€â”€ Steps: 'email' | 'reset' | 'done' â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const otpRefs = useRef([]);

  // â”€â”€â”€ Countdown for Resend OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // â”€â”€â”€ Step 1: Send OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSendOtp = useCallback(async (e) => {
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
  }, [dispatch, email]);

  // â”€â”€â”€ Resend OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleResendOtp = useCallback(async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtp(Array(OTP_LENGTH).fill(''));
    setResendTimer(RESEND_SECONDS);
    setError('');
    try {
      await dispatch(requestOtp({ email })).unwrap();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  }, [dispatch, email, resendTimer, isResending]);

  // â”€â”€â”€ OTP Box Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleOtpChange = useCallback((index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    setError('');
    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (!/^[0-9]+$/.test(pasted)) return;
    e.preventDefault();

    const digits = pasted.slice(0, OTP_LENGTH).split('');
    const next = Array(OTP_LENGTH).fill('');
    digits.forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
  }, []);

  // â”€â”€â”€ Step 2: Verify OTP + Reset Password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleResetPassword = useCallback(async (e) => {
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
  }, [dispatch, email, otp, newPassword, confirmPassword]);

  // â”€â”€â”€ Go Back to Email Step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const goBackToEmail = useCallback(() => {
    setStep('email');
    setError('');
    setOtp(Array(OTP_LENGTH).fill(''));
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  // â”€â”€â”€ Step 3: Done â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (step === 'done') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={28} className="md:w-10 md:h-10 text-emerald-600" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Password Reset Complete</h2>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
          </div>
          <Link to="/login">
            <Button type="button" fullWidth tone="brand" className="mt-2">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* â”€â”€ Back Button (Reset Step Only) â”€â”€ */}
        {step === 'reset' && (
          <button
            onClick={goBackToEmail}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            type="button"
          >
            <ArrowLeft size={18} />
            Back to email
          </button>
        )}

        {/* â”€â”€ Header â”€â”€ */}
        <div>
          {step === 'email' && (
            <>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Forgot Password?</h2>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                Enter your email and we'll send you a 6-digit verification code.
              </p>
            </>
          )}
          {step === 'reset' && (
            <>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Verify & Reset Password</h2>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold text-gray-800">{email}</span> and set a new password.
              </p>
            </>
          )}
        </div>

        {/* â”€â”€ Error Message â”€â”€ */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm md:text-base text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* â”€â”€ Step 1: Email Form â”€â”€ */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => { setError(''); setEmail(e.target.value); }}
              leftIcon={<Mail size={16} />}
              required
              className="w-full"
            />
            <Button type="submit" fullWidth loading={loading} tone="brand" className="mt-2">
              Send Verification Code
            </Button>
          </form>
        )}

        {/* â”€â”€ Step 2: OTP + New Password â”€â”€ */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* OTP Inputs */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div 
                className="flex justify-center gap-2 sm:gap-3" 
                onPaste={handleOtpPaste}
              >
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
                    className="h-12 w-10 sm:w-11 rounded-xl border-2 border-gray-200 text-center text-lg sm:text-xl font-semibold text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Resend OTP */}
            <div className="text-center text-sm text-gray-600">
              {resendTimer > 0 ? (
                <>Resend code in <span className="font-medium text-gray-800">{resendTimer}s</span></>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend code'}
                </button>
              )}
            </div>

            {/* Divider */}
            <hr className="border-gray-200" />

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
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
                className="w-full"
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
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
              className="w-full"
            />

            <Button type="submit" fullWidth loading={loading} tone="brand" leftIcon={<ShieldCheck size={18} />} className="mt-2">
              Verify & Reset Password
            </Button>
          </form>
        )}

        {/* â”€â”€ Back to Login â”€â”€ */}
        <p className="text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;