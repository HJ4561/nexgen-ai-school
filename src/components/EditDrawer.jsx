/**
 * ============================================
 * EDIT DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Drawer for editing user profiles (Student, Teacher, Parent)
 * Used by: Admin - User Profile Management page
 * 
 * Features:
 * - Edit student profiles (class, guardian, DOB, scholarship)
 * - Edit teacher profiles (qualification, specialization, joining date)
 * - Edit parent profiles (name, email)
 * - Read-only fields (name, email, CNIC, roll number)
 * - Role-based field rendering
 * - Admin role theming
 * 
 * Field Types:
 * - Read-only: Full Name, Email, CNIC, Roll No, Registration No
 * - Editable: Class, Guardian Name, Guardian Phone, DOB, Scholarship
 * - Editable: Qualification, Specialization, Joining Date
 * 
 * Dependencies:
 * - Drawer component for slide-out panel
 * - Select component for dropdowns
 * ============================================
 */

import { useState, useEffect } from "react";
import Select from '@/components/ui/Select';
import Drawer from "@/components/admin/Drawer";

/**
 * EditDrawer Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Called when drawer closes
 * @param {Object} props.user - User data object
 * @param {string} props.role - User role (student, teacher, parent)
 * @param {Function} props.onSave - Called when Save Changes is clicked
 * @param {Array} props.classOptions - Available class options
 * @param {Array} props.scholarshipOptions - Available scholarship options
 * @returns {JSX.Element} Rendered drawer form
 * 
 * @example
 * <EditDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   user={selectedUser}
 *   role="student"
 *   onSave={handleSaveUser}
 *   classOptions={classOptions}
 *   scholarshipOptions={scholarshipOptions}
 * />
 */
function EditDrawer({
  isOpen,
  onClose,
  user,
  role,
  onSave,
  classOptions,
  scholarshipOptions,
}) {
  // ─── State ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(null);

  // ─── Update form data when user changes ──────────────────────────────
  useEffect(() => {
    if (user) {
      setFormData({ ...user });
    }
  }, [user]);

  // ─── Return null if closed or no data ────────────────────────────────
  if (!isOpen || !formData) return null;

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  // ─── Footer visibility ────────────────────────────────────────────────
  const showFooter = role === "student" || role === "teacher" || role === "parent";
  const footer = showFooter ? (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
      <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={onClose}
        className="flex-1 py-2.5 rounded-lg border border-gray-300 text-[var(--color-text-secondary)] font-medium hover:bg-gray-100 transition-colors px-4 sm:px-6 lg:px-8"
      >
        Cancel
      </Button>
      <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={handleSubmit}
        className="flex-1 py-2.5 rounded-lg bg-[var(--color-admin-primary)] text-white font-medium hover:bg-[var(--color-admin-hover)] transition-colors shadow-sm px-4 sm:px-6 lg:px-8"
      >
        Save Changes
      </Button>
    </div>
  ) : null;

  // ─── Title and Subtitle ──────────────────────────────────────────────
  const title =
    role === "student"
      ? "Edit Student Profile"
      : role === "teacher"
      ? "Edit Teacher Profile"
      : "Edit Parent Profile";

  const subtitle =
    role === "parent"
      ? "Update parent account details"
      : "Update profile details";

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={footer}
      width="max-w-[400px]"
    >
      <div className="flex flex-col md:flex-row-col gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
        {/* ─── STUDENT FIELDS ─────────────────────────────────────── */}
        {role === "student" && (
          <>
            {/* Full Name (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Full Name
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.full_name || "—"}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Email
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.email || "—"}
              </div>
            </div>

            {/* Roll Number (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Roll No.
              </label>
              <input
                type="text"
                value={formData.roll_number || "—"}
                readOnly
                className="w-full px-3.5 py-2.5 bg-[var(--color-surface-dim)] border border-gray-200 rounded-lg text-sm md:text-base md:text-base text-[var(--color-text-primary)] cursor-default px-4 sm:px-6 lg:px-8"
              />
            </div>

            {/* Registration Number (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Registration No.
              </label>
              <input
                type="text"
                value={formData.registration_number || "—"}
                readOnly
                className="w-full px-3.5 py-2.5 bg-[var(--color-surface-dim)] border border-gray-200 rounded-lg text-sm md:text-base md:text-base text-[var(--color-text-primary)] cursor-default px-4 sm:px-6 lg:px-8"
              />
            </div>

            {/* Class & Section (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Class & Section
              </label>
              <Select
                value={formData.class_section_id}
                onChange={(val) =>
                  setFormData({ ...formData, class_section_id: Number(val) })
                }
                options={classOptions}
                tone="admin"
                size="md"
                placeholder="Select class..."
              />
            </div>

            {/* Guardian Name (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.guardian_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, guardian_name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Guardian Phone (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Guardian Phone
              </label>
              <input
                type="text"
                value={formData.guardian_phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, guardian_phone: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="e.g. 03XX-XXXXXXX"
              />
            </div>

            {/* Date of Birth (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth || ""}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
              />
            </div>

            {/* Scholarship (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Scholarship Percentage
              </label>
              <Select
                value={formData.scholarship_percentage}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    scholarship_percentage: Number(val),
                  })
                }
                options={scholarshipOptions}
                tone="admin"
                size="md"
                required
              />
            </div>
          </>
        )}

        {/* ─── TEACHER FIELDS ─────────────────────────────────────── */}
        {role === "teacher" && (
          <>
            {/* Full Name (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Full Name
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.full_name || "—"}
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Email
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.email || "—"}
              </div>
            </div>

            {/* CNIC (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                CNIC
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.cnic || "—"}
              </div>
            </div>

            {/* Qualification (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Qualification
              </label>
              <input
                type="text"
                value={formData.qualification || ""}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="e.g. M.Sc. Physics"
              />
            </div>

            {/* Specialization (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization || ""}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="e.g. Mathematics"
              />
            </div>

            {/* Joining Date (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joining_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, joining_date: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
              />
            </div>
          </>
        )}

        {/* ─── PARENT FIELDS ──────────────────────────────────────── */}
        {role === "parent" && (
          <>
            {/* Full Name (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="Full name"
              />
            </div>

            {/* Email (editable) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:outline-none px-4 sm:px-6 lg:px-8"
                placeholder="email@example.com"
              />
            </div>

            {/* Status (read-only) */}
            <div>
              <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
                Status
              </label>
              <div className="text-sm md:text-base md:text-base text-[var(--color-text-primary)] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 px-4 sm:px-6 lg:px-8">
                {formData.status || "Active"}
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

export default EditDrawer;
















