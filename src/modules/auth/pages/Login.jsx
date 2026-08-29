// src/modules/auth/pages/Login.jsx

/**
 * ============================================
 * LOGIN PAGE - CLEAN MODERN
 * ============================================
 * 
 * Clean, modern login page with role selection
 * Features:
 * - Clean typography
 * - Smooth animations
 * - Role-based styling
 * - Responsive design
 * ============================================
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Eye,
  EyeOff,
  Crown,
  GraduationCap,
  BookOpen,
  Users,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { loginUser } from "@/modules/auth/store/authThunks";

const ROLES = [
  { value: 'admin', label: 'Admin', icon: '👑' },
  { value: 'teacher', label: 'Teacher', icon: '📚' },
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👦' },
  { value: 'staff', label: 'Staff', icon: '💼' },
];

const ROLE_STYLES = {
  admin: {
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    dot: 'bg-blue-600',
    btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    hover: 'hover:bg-blue-50',
    gradient: 'from-blue-600 to-blue-700',
  },
  teacher: {
    light: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'text-purple-600',
    dot: 'bg-purple-600',
    btn: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    hover: 'hover:bg-purple-50',
    gradient: 'from-purple-600 to-purple-700',
  },
  student: {
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    hover: 'hover:bg-emerald-50',
    gradient: 'from-emerald-600 to-emerald-700',
  },
  parent: {
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    dot: 'bg-amber-600',
    btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    hover: 'hover:bg-amber-50',
    gradient: 'from-amber-600 to-amber-700',
  },
  staff: {
    light: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    dot: 'bg-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    hover: 'hover:bg-rose-50',
    gradient: 'from-rose-600 to-rose-700',
  },
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth || { loading: false, error: null });

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser({
        email: form.email,
        password: form.password,
        role: selectedRole,
      })).unwrap();

      navigate(`/${selectedRole}/dashboard`);

    } catch (err) {
      console.error('❌ Login error:', err);
    }
  };

  const activeStyle = ROLE_STYLES[selectedRole] || ROLE_STYLES.student;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">
          Sign in to your account to continue
        </p>
      </div>

      {/* Role Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Sign in as
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {ROLES.map((role) => {
            const style = ROLE_STYLES[role.value];
            const active = selectedRole === role.value;
            return (
              <motion.button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex flex-col items-center gap-1 py-3 rounded-xl
                  text-xs font-medium transition-all duration-200
                  ${active
                    ? `${style.light} ${style.border} ${style.text} shadow-sm ring-2 ring-offset-1 ${style.border.replace('border-', 'ring-')}`
                    : 'bg-transparent border-2 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                {active && (
                  <motion.span
                    layoutId="activeDot"
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${style.dot} ring-2 ring-white`}
                  />
                )}
                <span className="text-lg">{role.icon}</span>
                <span className="text-[10px]">{role.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className={`
            relative rounded-xl transition-all duration-200
            ${focusedField === 'email' ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
          `}>
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="name@school.edu"
              value={form.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <Link
              to="/forgot-password"
              className={`text-xs ${activeStyle.text} hover:opacity-80 transition-opacity font-medium`}
            >
              Forgot password?
            </Link>
          </div>
          <div className={`
            relative rounded-xl transition-all duration-200
            ${focusedField === 'password' ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
          `}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="w-full px-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none transition-all text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-3 px-4 rounded-xl text-white font-medium
            bg-gradient-to-r ${activeStyle.gradient}
            shadow-lg shadow-indigo-500/25
            hover:shadow-xl transition-all duration-200
            disabled:opacity-70 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          `}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className={`font-medium ${activeStyle.text} hover:opacity-80 transition-opacity`}
        >
          Sign up
        </Link>
      </p>
    </motion.div>
  );
}

export default Login;