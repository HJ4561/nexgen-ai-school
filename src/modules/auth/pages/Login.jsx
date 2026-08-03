// src/modules/auth/pages/Login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { loginUser } from "@/modules/auth/store/authThunks";

const ROLES = [
  { value: 'admin', label: 'Admin', icon: '👑' },
  { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'parent', label: 'Parent', icon: '👨‍👩‍👦' },
  { value: 'staff', label: 'Staff', icon: '👔' },
];

// Presentational-only — same ROLES values/labels drive functionality.
const ROLE_ICONS = {
  admin: Crown,
  teacher: GraduationCap,
  student: BookOpen,
  parent: Users,
  staff: Briefcase,
};

// Maps each role onto its token set from the @theme block.
// Staff falls back to brand-secondary since no staff-* tokens exist yet.
const ROLE_STYLES = {
  admin: {
    light: 'bg-admin-light',
    border: 'border-admin-border',
    text: 'text-admin-text',
    icon: 'text-admin-primary',
    dot: 'bg-admin-primary',
    btn: 'bg-admin-primary hover:bg-admin-hover',
  },
  teacher: {
    light: 'bg-teacher-light',
    border: 'border-teacher-border',
    text: 'text-teacher-text',
    icon: 'text-teacher-primary',
    dot: 'bg-teacher-primary',
    btn: 'bg-teacher-primary hover:bg-teacher-hover',
  },
  student: {
    light: 'bg-student-light',
    border: 'border-student-border',
    text: 'text-student-text',
    icon: 'text-student-primary',
    dot: 'bg-student-primary',
    btn: 'bg-student-primary hover:bg-student-hover',
  },
  parent: {
    light: 'bg-parent-light',
    border: 'border-parent-border',
    text: 'text-parent-text',
    icon: 'text-parent-primary',
    dot: 'bg-parent-primary',
    btn: 'bg-parent-primary hover:bg-parent-hover',
  },
  staff: {
    light: 'bg-brand-secondary/10',
    border: 'border-brand-secondary/30',
    text: 'text-brand-secondary',
    icon: 'text-brand-secondary',
    dot: 'bg-brand-secondary',
    btn: 'bg-brand-secondary hover:opacity-90',
  },
};

function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Login attempt with role:', selectedRole);

    try {
      const result = await dispatch(loginUser({
        email: form.email,
        password: form.password,
        role: selectedRole,
      })).unwrap();

      console.log('✅ Login successful!');
      console.log('📍 Redirecting to:', `/${selectedRole}/dashboard`);

      window.location.href = `/${selectedRole}/dashboard`;

    } catch (err) {
      console.error('❌ Login error:', err);
    }
  };

  const activeStyle = ROLE_STYLES[selectedRole];

  return (
    <div className="w-full max-w-md mx-auto space-y-8 font-sans">
      <div className="text-center">
  <h2 className="text-3xl font-semibold text-text-primary">Sign in</h2>
  <p className="text-sm text-text-secondary mt-1">
    Enter your details to access your dashboard.
  </p>
</div>

      {/* Role selector */}
      <div>
        <label className="block text-xs font-medium tracking-wide uppercase text-text-muted mb-3">
          Sign in as
        </label>
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-surface-muted rounded-card">
          {ROLES.map((role) => {
            const Icon = ROLE_ICONS[role.value];
            const style = ROLE_STYLES[role.value];
            const active = selectedRole === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`
                  relative flex flex-col items-center gap-1 py-2.5 rounded-button
                  text-xs font-medium leading-tight transition-all duration-200 border
                  ${active
                    ? `${style.light} ${style.border} ${style.text} shadow-soft`
                    : 'bg-transparent border-transparent text-text-muted hover:text-text-secondary'
                  }
                `}
              >
                {active && (
                  <span
                    className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse-dot`}
                  />
                )}
                <Icon
                  size={16}
                  strokeWidth={active ? 2.25 : 1.75}
                  className={active ? style.icon : ''}
                />
                <span className="truncate max-w-full">{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-danger-bg border border-danger/20 text-danger-text px-4 py-3 rounded-input text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="name@school.edu"
          value={form.email}
          onChange={handleChange}
          leftIcon={<Mail size={16} />}
          required
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-text-muted hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className={`text-xs ${activeStyle.text} hover:opacity-80 transition-opacity`}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          className={`!rounded-button !shadow-soft transition-colors ${activeStyle.btn}`}
        >
          {loading ? (
            'Signing in...'
          ) : (
            <span className="flex items-center justify-center gap-2">
              Sign In <ArrowRight size={16} />
            </span>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Don't have an account?{' '}
        <Link
          to="/register"
          className={`font-medium ${activeStyle.text} hover:opacity-80 transition-opacity`}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default Login;