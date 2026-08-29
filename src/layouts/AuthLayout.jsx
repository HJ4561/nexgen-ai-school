// src/layouts/AuthLayout.jsx

/**
 * ============================================
 * AUTH LAYOUT - CLEAN MODERN
 * ============================================
 * 
 * Purpose: Wrapper for all authentication pages
 * Pages: Login, Register, ForgotPassword, PendingApproval
 * 
 * Features:
 * - Clean gradient background
 * - Centered card with subtle shadow
 * - School branding
 * - Responsive design
 * ============================================
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full opacity-10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">NexGen School</h1>
            <p className="text-xs text-gray-400">Management System</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 NexGen School. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}

export default AuthLayout;