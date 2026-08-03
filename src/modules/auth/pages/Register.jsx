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
 * 4. Submits → API call → Redirect to pending-approval
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
  IdCard, Hash,
} from 'lucide-react';

import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import PasswordStrength from "@/components/composite/PasswordStrength";
import { registerUser } from "@/modules/auth/store/authThunks";
import { formatCNIC } from '@/utils/formatter';

// ─── Role cards config ────────────────────────────────────────────────────────
const ROLES = [
  {
    key: 'teacher',
    label: 'Teacher',
    icon: GraduationCap,
    selected: 'border-teacher-border bg-teacher-light text-teacher-text',
    unselected: 'border-border bg-surface-dim text-text-muted hover:border-teacher-border hover:bg-teacher-light',
    iconColor: 'text-teacher-primary',
  },
  {
    key: 'student',
    label: 'Student',
    icon: BookOpen,
    selected: 'border-student-border bg-student-light text-student-text',
    unselected: 'border-border bg-surface-dim text-text-muted hover:border-student-border hover:bg-student-light',
    iconColor: 'text-student-primary',
  },
  {
    key: 'parent',
    label: 'Parent',
    icon: Users,
    selected: 'border-parent-border bg-parent-light text-parent-text',
    unselected: 'border-border bg-surface-dim text-text-muted hover:border-parent-border hover:bg-parent-light',
    iconColor: 'text-parent-primary',
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
 * 
 * @example
 * // In router:
 * <Route path="/register" element={<Register />} />
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

  // ─── Handlers ──────────────────────────────────────────────────────────
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

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Create account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Select your role, fill in your details, and wait for admin approval.
        </p>
      </div>

      {/* Role selector cards */}
      <div className="grid grid-cols-3 gap-3">
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
              className={[
                'flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 px-2 transition-all duration-150 cursor-pointer',
                isSelected ? role.selected : role.unselected,
              ].join(' ')}
            >
              <Icon
                size={20}
                className={isSelected ? role.iconColor : 'text-text-muted'}
              />
              <span className="text-xs font-semibold">{role.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error banner - Shows both Redux API error AND local validation error */}
      {(error || localError) && (
        <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── Common fields ──────────────────────────────────────── */}
        <Input
          label="Full Name"
          type="text"
          name="full_name"
          placeholder="Muhammad Ali"
          tone={selectedRole}
          value={form.full_name}
          onChange={handleChange}
          leftIcon={<User size={16} />}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@school.edu"
          tone={selectedRole}
          value={form.email}
          onChange={handleChange}
          leftIcon={<Mail size={16} />}
          required
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
              className="text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          required
        />

        <PasswordStrength password={form.password} />

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
              className="text-text-muted hover:text-text-primary transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          required
        />

        {/* ── Student extra ──────────────────────────────────────── */}
        {selectedRole === 'student' && (
          <div className="space-y-4 pt-2 border-t border-surface-muted">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted pt-2">
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

        {/* ── Teacher extra ──────────────────────────────────────── */}
        {selectedRole === 'teacher' && (
          <div className="space-y-4 pt-2 border-t border-surface-muted">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted pt-2">
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
              leftIcon={<IdCard size={16} />}
              required
            />
          </div>
        )}

        {/* ── Parent extra ──────────────────────────────────────── */}
        {selectedRole === 'parent' && (
          <div className="space-y-4 pt-2 border-t border-surface-muted">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted pt-2">
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
              leftIcon={<Hash size={16} />}
              helperText="Must match your child's registered roll number exactly"
              required
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
        >
          Create Account
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-primary hover:text-brand-hover transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default Register;


















