/**
 * ============================================
 * REGISTER PAGE
 * ============================================
 * 
 * Purpose: User registration form with role-based fields
 * Used by: All users (admin, teacher, student, parent)
 * 
 * Features:
 * - Role selection cards (Teacher, Student, Parent)
 * - Dynamic form fields based on selected role
 * - Password strength indicator
 * - CNIC formatting for teachers
 * - Class selection for students
 * - Child roll number and relation for parents
 * - Redux integration for API calls
 * - Redirect to pending approval on success
 * 
 * Flow:
 * 1. User selects role
 * 2. Fills common fields (name, email, password)
 * 3. Fills role-specific fields
 * 4. Submits â†’ API call â†’ Redirect to pending-approval
 * 
 * Dependencies:
 * - Redux for auth state management
 * - React Router for navigation
 * - UI components (Input, Select, Button, PasswordStrength)
 * - Formatter for CNIC formatting
 * ============================================
 */

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail, Eye, EyeOff, User, BookOpen,
  GraduationCap, Users,
  IdCard, Hash, AlertCircle,
} from 'lucide-react';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PasswordStrength from "@/components/common/PasswordStrength";
import { registerUser } from "@/modules/auth/store/authThunks";
import { formatCNIC } from '@/utils/formatter';

// â”€â”€â”€ Role cards config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ROLES = [
  {
    key: 'teacher',
    label: 'Teacher',
    icon: GraduationCap,
    selected: 'border-purple-400 bg-purple-50 text-purple-700',
    unselected: 'border-gray-200 bg-gray-50 text-gray-500 hover:border-purple-300 hover:bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    key: 'student',
    label: 'Student',
    icon: BookOpen,
    selected: 'border-emerald-400 bg-emerald-50 text-emerald-700',
    unselected: 'border-gray-200 bg-gray-50 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'parent',
    label: 'Parent',
    icon: Users,
    selected: 'border-amber-400 bg-amber-50 text-amber-700',
    unselected: 'border-gray-200 bg-gray-50 text-gray-500 hover:border-amber-300 hover:bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

// Submit button tone per role
const SUBMIT_TONE = {
  teacher: 'teacher',
  student: 'student',
  parent: 'parent',
};

// Class options - values are NUMBERS as backend expects integer
const CLASS_OPTIONS = [
  { value: 181, label: 'Class 1 - A' },
  { value: 182, label: 'Class 1 - B' },
  { value: 183, label: 'Class 1 - C' },
  { value: 184, label: 'Class 2 - A' },
  { value: 185, label: 'Class 2 - B' },
  { value: 186, label: 'Class 2 - C' },
  { value: 187, label: 'Class 3 - A' },
  { value: 188, label: 'Class 3 - B' },
  { value: 189, label: 'Class 3 - C' },
  { value: 190, label: 'Class 4 - A' },
  { value: 191, label: 'Class 4 - B' },
  { value: 192, label: 'Class 4 - C' },
  { value: 193, label: 'Class 5 - A' },
  { value: 194, label: 'Class 5 - B' },
  { value: 195, label: 'Class 5 - C' },
  { value: 196, label: 'Class 6 - A' },
  { value: 197, label: 'Class 6 - B' },
  { value: 198, label: 'Class 6 - C' },
  { value: 199, label: 'Class 7 - A' },
  { value: 200, label: 'Class 7 - B' },
  { value: 201, label: 'Class 7 - C' },
  { value: 202, label: 'Class 8 - A' },
  { value: 203, label: 'Class 8 - B' },
  { value: 204, label: 'Class 8 - C' },
  { value: 205, label: 'Class 9 - A' },
  { value: 206, label: 'Class 9 - B' },
  { value: 207, label: 'Class 9 - C' },
  { value: 208, label: 'Class 10 - A' },
  { value: 209, label: 'Class 10 - B' },
  { value: 210, label: 'Class 10 - C' },
];

const RELATION_OPTIONS = [
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Guardian', label: 'Guardian' },
];

/**
 * Register Component
 * 
 * @component
 * @returns {JSX.Element} Rendered register page
 */
function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state for loading and error
  const { loading, error } = useSelector((state) => state.auth);

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({
    // Common
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    // Student (only class_id is needed for API)
    class_id: '',
    // Teacher (only cnic is needed for API)
    cnic: '',
    // Parent
    child_roll_number: '',
    relation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function handleChange(e) {
    let name, value;
    // Case 1: Standard DOM event (Input, Select native)
    if (e && e.target) {
      name = e.target.name;
      value = e.target.value;
    }
    // Case 2: Custom Select component passes { name, value } directly
    else if (e && typeof e === 'object' && 'name' in e && 'value' in e) {
      name = e.name;
      value = e.value;
    }
    // Case 3: Fallback
    else {
      console.warn('Unhandled event structure:', e);
      return;
    }
    if (name === 'cnic') {
      const formatted = formatCNIC(value);
      setForm({ ...form, [name]: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
    setLocalError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    // ---- Frontend Validations ----
    if (!selectedRole) {
      setLocalError('Please select your role to continue.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    // ---- Map Frontend Role to Backend Role (Case Sensitive!) ----
    const roleMap = {
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
    };
    const roleName = roleMap[selectedRole];

    // ---- Prepare Base Payload ----
    const userData = {
      full_name: form.full_name,
      email: form.email,
      password: form.password,
      role_name: roleName,
    };

    // ---- Add Role-Specific Fields (ONLY what API expects) ----
    if (selectedRole === 'student') {
      // Backend expects 'class_section_id' (integer)
      if (!form.class_id) {
        setLocalError('Please select a class.');
        return;
      }
      userData.class_section_id = parseInt(form.class_id, 10);
    }

    if (selectedRole === 'teacher') {
      if (!form.cnic) {
        setLocalError('CNIC is required for Teacher registration.');
        return;
      }
      userData.cnic = form.cnic;
    }

    if (selectedRole === 'parent') {
      if (!form.child_roll_number) {
        setLocalError('Child Roll Number is required.');
        return;
      }
      if (!form.relation) {
        setLocalError('Relation is required.');
        return;
      }
      userData.child_roll_number = form.child_roll_number;
      userData.relation = form.relation;
    }

    try {
      // ---- Dispatch Redux Thunk ----
      await dispatch(registerUser(userData)).unwrap();

      // ---- Success: Redirect ----
      sessionStorage.setItem('pending_email', form.email);
      sessionStorage.setItem('pending_password', form.password);
      navigate('/pending-approval');
    } catch (err) {
      console.error('Registration failed:', err);
    }
  }

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="w-full max-w-[95%] sm:max-w-md mx-auto space-y-4 sm:space-y-5 md:space-y-6 font-sans px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Create account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Select your role, fill in your details, and wait for admin approval.
        </p>
      </div>

      {/* Role selector cards */}
      <div>
        <label className="block text-[10px] sm:text-xs font-medium tracking-wide uppercase text-gray-400 mb-2 sm:mb-3">
          Select Role
        </label>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.key;

            return (
              <button
                key={role.key}
                type="button"
                onClick={() => {
                  setSelectedRole(role.key);
                  setLocalError('');
                }}
                className={`
                  flex flex-col items-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl border-2 
                  py-2.5 sm:py-3 md:py-4 px-2 transition-all duration-150 cursor-pointer
                  ${isSelected ? role.selected : role.unselected}
                `}
              >
                <Icon
                  size={18}
                  className={isSelected ? role.iconColor : 'text-gray-400'}
                />
                <span className="text-[10px] sm:text-xs font-semibold">{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner - Shows both Redux API error AND local validation error */}
      {(error || localError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-red-700">{error || localError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* â”€â”€ Common fields â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Input
          label="Full Name"
          type="text"
          name="full_name"
          placeholder="Muhammad Ali"
          tone={selectedRole}
          value={form.full_name}
          onChange={handleChange}
          leftIcon={<User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          required
          className="text-sm sm:text-base"
        />
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@school.edu"
          tone={selectedRole}
          value={form.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          required
          className="text-sm sm:text-base"
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Min. 8 characters"
          tone={selectedRole}
          value={form.password}
          onChange={handleChange}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          }
          required
          className="text-sm sm:text-base"
        />

        <div className="mt-1">
          <PasswordStrength password={form.password} />
        </div>

        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          name="confirm_password"
          placeholder="Repeat password"
          tone={selectedRole}
          value={form.confirm_password}
          onChange={handleChange}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          }
          required
          className="text-sm sm:text-base"
        />

        {/* â”€â”€ Student extra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {selectedRole === 'student' && (
          <div className="space-y-3 sm:space-y-4 pt-2 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 pt-2">
              Student Details
            </p>
            <Select
              label="Class"
              name="class_id"
              options={CLASS_OPTIONS}
              placeholder="Select class"
              tone={selectedRole}
              value={form.class_id}
              onChange={(value) => handleChange({ name: 'class_id', value })}
              required
            />
          </div>
        )}

        {/* â”€â”€ Teacher extra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {selectedRole === 'teacher' && (
          <div className="space-y-3 sm:space-y-4 pt-2 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 pt-2">
              Teacher Details
            </p>
            <Input
              label="CNIC"
              type="text"
              name="cnic"
              tone={selectedRole}
              placeholder="XXXXX-XXXXXXX-X"
              value={form.cnic}
              maxLength={15}
              onChange={handleChange}
              leftIcon={<IdCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              required
              className="text-sm sm:text-base"
            />
          </div>
        )}

        {/* â”€â”€ Parent extra â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {selectedRole === 'parent' && (
          <div className="space-y-3 sm:space-y-4 pt-2 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 pt-2">
              Parent Details
            </p>
            <Input
              label="Child's Roll Number"
              type="text"
              name="child_roll_number"
              tone={selectedRole}
              placeholder="e.g. STU-2024-001"
              value={form.child_roll_number}
              onChange={handleChange}
              leftIcon={<Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              helperText="Must match your child's registered roll number exactly"
              required
              className="text-sm sm:text-base"
            />
            <Select
              label="Relation to Child"
              name="relation"
              tone={selectedRole}
              options={RELATION_OPTIONS}
              placeholder="Select relation"
              value={form.relation}
              onChange={(value) => handleChange({ name: 'relation', value })}
              required
            />
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          fullWidth
          loading={loading}
          tone={SUBMIT_TONE[selectedRole] || 'brand'}
          className="text-sm sm:text-base py-2.5 sm:py-3"
        >
          Create Account
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-[11px] sm:text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;