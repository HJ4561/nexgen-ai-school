/**
 * ============================================
 * AUTH LAYOUT
 * ============================================
 * 
 * Purpose: Wrapper for all authentication pages
 * Pages: Login, Register, ForgotPassword, PendingApproval
 * 
 * Features:
 * - Light navy tint background with subtle dot grid pattern
 * - Centered white card with shadow
 * - School logo above the card
 * - Uses Outlet for nested routes
 * 
 * Usage:
 * <Route path="/login" element={<AuthLayout />}>
 *   <Route index element={<Login />} />
 * </Route>
 * ============================================
 */

import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

/**
 * AuthLayout Component
 * 
 * Provides a consistent layout for all authentication pages
 * 
 * Layout Structure:
 * 1. Full viewport with gradient background
 * 2. School logo (GraduationCap icon + "School ERP" text)
 * 3. White card container for auth forms
 * 4. Outlet renders nested routes (Login, Register, etc.)
 * 
 * @returns {JSX.Element} Auth layout with outlet for child routes
 * 
 * @example
 * // In router configuration:
 * <Route path="/auth" element={<AuthLayout />}>
 *   <Route path="login" element={<Login />} />
 *   <Route path="register" element={<Register />} />
 *   <Route path="forgot-password" element={<ForgotPassword />} />
 * </Route>
 */
function AuthLayout() {
  return (
    /*
      bg-[#EEF2F7]          → very light navy tint (brand-light)
      bg-[radial-gradient…] → dot pattern using inline bg-image style
      We use a style prop for the dot pattern since Tailwind v4 can't
      build arbitrary background-image values reliably.
    */
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        backgroundColor: '#EEF2F7',
        backgroundImage: 'radial-gradient(circle, #1E3A5F1A 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Logo above card */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary">
          <GraduationCap size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold text-brand-primary tracking-tight">
          School ERP
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-modal bg-surface p-8 shadow-soft">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;










