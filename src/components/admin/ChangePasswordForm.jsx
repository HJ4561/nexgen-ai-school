/**
 * ============================================
 * CHANGE PASSWORD FORM COMPONENT
 * ============================================
 * 
 * Purpose: Secure password change form with validation
 * Features:
 * - Three-field form: Current, New, and Confirm password
 * - Show/Hide password toggle for each field
 * - Client-side validation with error messages
 * - Role-based styling (admin, teacher, student, parent)
 * - Loading state during submission
 * - Auto-clear form on successful update
 * 
 * Dependencies:
 * - react-redux for state management
 * - lucide-react for icons (Eye, EyeOff)
 * - @/components/ui for form components
 * - @/modules/common/store/settingThunks for API calls
 * 
 * Usage:
 * <ChangePasswordForm role="admin" />
 * ============================================
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { changePassword } from "@/modules/common/store/settingThunks";

/**
 * ============================================
 * CHANGE PASSWORD FORM COMPONENT
 * ============================================
 * 
 * Renders a password change form with validation and toggle visibility
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Password change form UI
 * 
 * @example
 * // Admin user changing password
 * <ChangePasswordForm role="admin" />
 * 
 * // Teacher user changing password
 * <ChangePasswordForm role="teacher" />
 * ============================================
 */
const ChangePasswordForm = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE SELECTION
   * ============================================
   * 
   * Retrieves loading state from Redux store
   * Used to disable button during API call
   */
  const { passwordLoading } = useSelector(
    (state) => state.settings
  );

  /**
   * ============================================
   * FORM STATE MANAGEMENT
   * ============================================
   * 
   * Manages form data and validation errors
   */
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});

  /**
   * ============================================
   * PASSWORD VISIBILITY TOGGLE
   * ============================================
   * 
   * Tracks show/hide state for each password field
   * Allows users to view their password while typing
   */
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  /**
   * ============================================
   * HANDLE INPUT CHANGE
   * ============================================
   * 
   * Updates form data on input change
   * Clears validation error for the field being edited
   * 
   * @param {Object} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * ============================================
   * FORM VALIDATION
   * ============================================
   * 
   * Validates all form fields before submission
   * Checks for:
   * - Empty fields (old, new, confirm passwords)
   * - Password confirmation match
   * 
   * @returns {boolean} True if validation passes
   */
  const validate = () => {
    const newErrors = {};

    // Check if old password is provided
    if (!formData.old_password.trim()) {
      newErrors.old_password = "Old password is required.";
    }

    // Check if new password is provided
    if (!formData.new_password.trim()) {
      newErrors.new_password = "New password is required.";
    }

    // Check if confirm password is provided
    if (!formData.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password.";
    }

    // Check if passwords match
    if (
      formData.new_password &&
      formData.confirm_password &&
      formData.new_password !== formData.confirm_password
    ) {
      newErrors.confirm_password = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /**
   * ============================================
   * TOGGLE PASSWORD VISIBILITY
   * ============================================
   * 
   * Toggles password visibility for a specific field
   * 
   * @param {string} field - Field name ('old', 'new', 'confirm')
   */
  const togglePassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  /**
   * ============================================
   * HANDLE FORM SUBMISSION
   * ============================================
   * 
   * Processes form submission:
   * 1. Validates form data
   * 2. Dispatches changePassword action
   * 3. Clears form on success
   * 4. Handles errors
   * 
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validate()) return;

    try {
      // Dispatch password change action
      await dispatch(
        changePassword({
          old_password: formData.old_password,
          new_password: formData.new_password,
        })
      ).unwrap();

      // Clear form on success
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      setErrors({});
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card tone={role}>
      {/* ─── Header Section ─── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Change Password
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Choose a strong password to keep your account secure.
        </p>
      </div>

      {/* ─── Password Form ─── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current Password Field */}
        <Input
          label="Current Password"
          name="old_password"
          type={showPassword.old ? "text" : "password"}
          value={formData.old_password}
          onChange={handleChange}
          error={errors.old_password}
          rightIcon={
            showPassword.old ? (
              <EyeOff
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("old")}
              />
            ) : (
              <Eye
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("old")}
              />
            )
          }
        />

        {/* New Password Field */}
        <Input
          label="New Password"
          name="new_password"
          type={showPassword.new ? "text" : "password"}
          value={formData.new_password}
          onChange={handleChange}
          error={errors.new_password}
          rightIcon={
            showPassword.new ? (
              <EyeOff
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("new")}
              />
            ) : (
              <Eye
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("new")}
              />
            )
          }
        />

        {/* Confirm Password Field */}
        <Input
          label="Confirm Password"
          name="confirm_password"
          type={showPassword.confirm ? "text" : "password"}
          value={formData.confirm_password}
          onChange={handleChange}
          error={errors.confirm_password}
          rightIcon={
            showPassword.confirm ? (
              <EyeOff
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("confirm")}
              />
            ) : (
              <Eye
                className="cursor-pointer"
                size={18}
                onClick={() => togglePassword("confirm")}
              />
            )
          }
        />

        {/* ─── Submit Button ─── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            tone={role}
            loading={passwordLoading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChangePasswordForm;