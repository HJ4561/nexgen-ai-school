/**
 * ============================================
 * PROFILE FORM COMPONENT
 * ============================================
 * 
 * Purpose: Display and edit user profile information
 * Features:
 * - User avatar with initials
 * - Full name editing
 * - Email display (read-only)
 * - Phone number editing with validation
 * - Role display (read-only)
 * - Member since date display (read-only)
 * - Form validation
 * - Dirty state detection for save button
 * - Reset functionality
 * - Loading state during update
 * - Role-based theming
 * - Responsive grid layout
 * 
 * Dependencies:
 * - lucide-react for icons (User, Mail, Phone, Shield, Calendar)
 * - @/components/ui/Card for container
 * - @/components/ui/Input for form fields
 * - @/components/ui/Button for action buttons
 * - @/modules/common/store/settingThunks for API calls
 * 
 * Usage:
 * <ProfileForm role="admin" />
 * ============================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { updateProfile } from "@/modules/common/store/settingThunks";

/**
 * ============================================
 * INITIAL FORM STATE
 * ============================================
 * 
 * Default values for the profile form
 * 
 * @constant {Object} initialValues
 * @property {string} full_name - User's full name
 * @property {string} email - User's email address
 * @property {string} phone_number - User's phone number
 */
const initialValues = {
  full_name: "",
  email: "",
  phone_number: "",
};

/**
 * ============================================
 * PROFILE FORM COMPONENT
 * ============================================
 * 
 * Renders a profile management form with edit capabilities
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Profile form UI
 * 
 * @example
 * // Admin user profile
 * <ProfileForm role="admin" />
 * 
 * // Teacher user profile
 * <ProfileForm role="teacher" />
 * ============================================
 */
const ProfileForm = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE SELECTION
   * ============================================
   * 
   * Retrieves profile data and loading state from Redux store
   */
  const {
    profile = {},
    updating,
  } = useSelector(
    (state) => state.settings
  );

  /**
   * ============================================
   * FORM STATE MANAGEMENT
   * ============================================
   * 
   * Manages form data and validation errors
   */
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  /**
   * ============================================
   * POPULATE FORM
   * ============================================
   * 
   * Populates form fields when profile data loads
   */
  useEffect(() => {
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone_number: profile.phone_number || "",
    });
  }, [profile]);

  /**
   * ============================================
   * DETECT CHANGES
   * ============================================
   * 
   * Determines if form has unsaved changes
   * Compares current form data with original profile data
   * 
   * @returns {boolean} True if form has unsaved changes
   */
  const isDirty = useMemo(() => {
    return (
      formData.full_name !== (profile.full_name || "") ||
      formData.phone_number !== (profile.phone_number || "")
    );
  }, [formData, profile]);

  /**
   * ============================================
   * HANDLE INPUT CHANGE
   * ============================================
   * 
   * Updates form data on input change
   * Clears validation error for the field being edited
   * 
   * @param {Object} target - Input change event target
   * @param {string} target.name - Name attribute of the input
   * @param {string} target.value - Current value of the input
   */
  const handleChange = ({ target }) => {
    const { name, value } = target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /**
   * ============================================
   * FORM VALIDATION
   * ============================================
   * 
   * Validates form fields before submission
   * Checks for:
   * - Full name is not empty
   * - Phone number format (Pakistan: 03XXXXXXXXX)
   * 
   * @returns {boolean} True if validation passes
   */
  const validate = () => {
    const validationErrors = {};

    // Check if full name is provided
    if (!formData.full_name.trim()) {
      validationErrors.full_name = "Full name is required.";
    }

    // Check phone number format if provided
    if (formData.phone_number && !/^03\d{9}$/.test(formData.phone_number)) {
      validationErrors.phone_number = "Enter a valid phone number.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  /**
   * ============================================
   * RESET FORM
   * ============================================
   * 
   * Resets form to original profile data and clears errors
   */
  const handleReset = () => {
    setFormData({
      full_name: profile.full_name || "",
      email: profile.email || "",
      phone_number: profile.phone_number || "",
    });

    setErrors({});
  };

  /**
   * ============================================
   * HANDLE FORM SUBMISSION
   * ============================================
   * 
   * Processes form submission:
   * 1. Validates form data
   * 2. Dispatches updateProfile action
   * 
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validate()) return;

    await dispatch(
      updateProfile({
        full_name: formData.full_name,
      })
    );
  };

  /**
   * ============================================
   * ROLE-BASED COLOR MAPPING
   * ============================================
   * 
   * Determines color scheme based on user role
   * 
   * @constant {string} primaryColor - Primary text/icon color
   * @constant {string} lightColor - Light background color
   */
  const primaryColor = `var(--color-${role?.toLowerCase() || 'brand'}-primary)`;
  const lightColor = `var(--color-${role?.toLowerCase() || 'brand'}-light)`;

  return (
    <Card hover={false} tone={role}>
      {/* ─── Header Section ─── */}
      <div className="mb-8 flex flex-col items-center">
        {/* User Avatar */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full" style={{ background: lightColor }}>
          <User size={42} style={{ color: primaryColor }} />
        </div>

        {/* User Name */}
        <h2 className="mt-4 text-2xl font-bold">
          {profile.full_name}
        </h2>

        {/* User Role */}
        <p className="capitalize text-text-secondary">
          {role}
        </p>
      </div>

      {/* ─── Profile Form ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Full Name (Editable) */}
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            leftIcon={<User size={18} />}
            error={errors.full_name}
          />

          {/* Email (Read-Only) */}
          <Input
            label="Email"
            name="email"
            value={formData.email}
            disabled
            leftIcon={<Mail size={18} />}
          />

          {/* Phone Number (Editable) */}
          <Input
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            leftIcon={<Phone size={18} />}
            error={errors.phone_number}
          />

          {/* Role (Read-Only) */}
          <Input
            label="Role"
            value={role}
            disabled
            leftIcon={<Shield size={18} />}
          />

          {/* Member Since (Read-Only) */}
          <Input
            label="Member Since"
            value={
              profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "-"
            }
            disabled
            leftIcon={<Calendar size={18} />}
          />
        </div>

        {/* ─── Form Actions ─── */}
        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            tone={role}
            onClick={handleReset}
          >
            Reset
          </Button>

          <Button
            type="submit"
            tone={role}
            loading={updating}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileForm;