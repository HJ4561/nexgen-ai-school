// src/modules/auth/pages/Login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, Eye, EyeOff } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🏫</div>
          <h2 className="text-2xl font-bold text-gray-800">Smart School</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-5 gap-2">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`
                  p-2 rounded-xl border-2 text-center transition-all duration-200
                  ${selectedRole === role.value 
                    ? 'bg-blue-100 border-blue-500 shadow-md scale-105' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <div className="text-2xl">{role.icon}</div>
                <div className="text-xs font-medium mt-1">{role.label}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
