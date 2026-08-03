/**
 * ============================================
 * COMPLAINT FORM COMPONENT
 * ============================================
 * 
 * Purpose: Submit a new complaint with role-based styling
 * Features:
 * - Complaint type dropdown selection (Academic, Behavior, Transport, Facilities, Fees, Other)
 * - Rich text description with validation
 * - Optional attachment URL field
 * - Form validation with error messages
 * - Reset functionality
 * - Loading state during submission
 * - Role-based styling (admin, teacher, student, parent)
 * - Auto-clear form on successful submission
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/components/ui for form components
 * - @/modules/common/store/complaintThunks for API calls
 * 
 * Usage:
 * <ComplaintForm role="student" />
 * ============================================
 */

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

import { createComplaint } from "@/modules/common/store/complaintThunks";

/**
 * ============================================
 * COMPLAINT TYPE OPTIONS
 * ============================================
 * 
 * Available complaint categories for the dropdown
 * 
 * @constant {Array} complaintTypes
 * @property {string} value - The value stored in form state
 * @property {string} label - The display label shown to user
 */
const complaintTypes = [
  {
    value: "",
    label: "Select Complaint Type",
  },
  {
    value: "Academic",
    label: "Academic",
  },
  {
    value: "Behavior",
    label: "Behavior",
  },
  {
    value: "Transport",
    label: "Transport",
  },
  {
    value: "Facilities",
    label: "Facilities",
  },
  {
    value: "Fees",
    label: "Fees",
  },
  {
    value: "Other",
    label: "Other",
  },
];

/**
 * ============================================
 * INITIAL FORM STATE
 * ============================================
 * 
 * Default values for the complaint form
 * 
 * @constant {Object} initialForm
 * @property {string} complaint_type - Selected complaint category
 * @property {string} description - Complaint description text
 * @property {string} attachment_url - Optional attachment link
 */
const initialForm = {
  complaint_type: "",
  description: "",
  attachment_url: "",
};

/**
 * ============================================
 * COMPLAINT FORM COMPONENT
 * ============================================
 * 
 * Renders a form for submitting complaints with validation
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Complaint form UI
 * 
 * @example
 * // Student submitting a complaint
 * <ComplaintForm role="student" />
 * 
 * // Teacher submitting a complaint
 * <ComplaintForm role="teacher" />
 * ============================================
 */
const ComplaintForm = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE SELECTION
   * ============================================
   * 
   * Retrieves loading state from Redux store
   * Used to disable button during API call
   */
  const loading = useSelector(
    (state) => state.complaints.loading
  );

  /**
   * ============================================
   * FORM STATE MANAGEMENT
   * ============================================
   * 
   * Manages form data and validation errors
   */
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

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
   * HANDLE SELECT CHANGE
   * ============================================
   * 
   * Updates complaint type on dropdown selection
   * Clears validation error for complaint type
   * 
   * @param {string} value - Selected complaint type value
   */
  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      complaint_type: value,
    }));

    setErrors((prev) => ({
      ...prev,
      complaint_type: "",
    }));
  };

  /**
   * ============================================
   * FORM VALIDATION
   * ============================================
   * 
   * Validates all form fields before submission
   * Checks for:
   * - Complaint type selection
   * - Description is not empty
   * 
   * @returns {boolean} True if validation passes
   */
  const validate = () => {
    const validationErrors = {};

    // Check if complaint type is selected
    if (!formData.complaint_type) {
      validationErrors.complaint_type = "Please select a complaint type.";
    }

    // Check if description is provided
    if (!formData.description.trim()) {
      validationErrors.description = "Description is required.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  /**
   * ============================================
   * RESET FORM
   * ============================================
   * 
   * Resets form to initial state and clears all errors
   */
  const handleReset = () => {
    setFormData(initialForm);
    setErrors({});
  };

  /**
   * ============================================
   * HANDLE FORM SUBMISSION
   * ============================================
   * 
   * Processes form submission:
   * 1. Validates form data
   * 2. Dispatches createComplaint action
   * 3. Resets form on success
   * 4. Handles errors
   * 
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validate()) return;

    try {
      // Dispatch create complaint action
      await dispatch(
        createComplaint({
          role,
          complaintData: formData,
        })
      ).unwrap();

      // Reset form on success
      handleReset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Card hover={false} tone={role}>
      {/* ─── Header Section ─── */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Submit Complaint
        </h2>

        <p className="mt-2 text-sm text-text-secondary">
          Fill in the details below to submit a new complaint.
        </p>
      </div>

      {/* ─── Complaint Form ─── */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Complaint Type Dropdown */}
        <Select
          label="Complaint Type"
          name="complaint_type"
          tone={role}
          value={formData.complaint_type}
          options={complaintTypes}
          onChange={handleSelectChange}
          error={errors.complaint_type}
        />

        {/* Description Text Area */}
        <TextArea
          label="Description"
          name="description"
          tone={role}
          rows={5}
          placeholder="Write your complaint..."
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        {/* Attachment URL Input */}
        <Input
          label="Attachment URL"
          name="attachment_url"
          tone={role}
          placeholder="https://example.com/file.pdf"
          value={formData.attachment_url}
          onChange={handleChange}
        />

        {/* ─── Form Actions ─── */}
        <div className="flex justify-end gap-3 pt-2">
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
            loading={loading}
          >
            Submit Complaint
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ComplaintForm;