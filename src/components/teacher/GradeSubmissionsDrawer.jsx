/**
 * ============================================
 * CREATE ASSIGNMENT DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Drawer for creating or editing assignments
 * Features:
 * - Create/Edit mode switching
 * - Assignment title input
 * - Description text area
 * - Subject and Class dropdown selectors
 * - Due date picker
 * - Optional attachment URL input
 * - Form validation with required fields
 * - Teacher role theming
 * - Informational notice about assignment visibility
 * 
 * Dependencies:
 * - lucide-react for icons (AlertCircle, Send)
 * - @/components/ui/Input for text and date fields
 * - @/components/ui/TextArea for description
 * - @/components/ui/Select for dropdowns
 * - @/components/ui/Button for action buttons
 * - @/components/admin/Drawer for sliding panel
 * 
 * Usage:
 * <CreateAssignmentDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   mode="create"
 *   formData={formData}
 *   setFormData={setFormData}
 *   onSave={handleSave}
 *   loading={isSaving}
 *   classOptions={classOptions}
 *   subjectOptions={subjectOptions}
 * />
 * ============================================
 */

import { AlertCircle, Send } from 'lucide-react';
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Drawer from "@/components/admin/Drawer";

/**
 * ============================================
 * CREATE ASSIGNMENT DRAWER COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders a drawer for creating or editing assignments
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {string} props.mode - Current mode ('create' | 'edit')
 * @param {Object} props.formData - Form data object containing assignment fields
 * @param {Function} props.setFormData - Setter function for form data
 * @param {Function} props.onSave - Callback function to save the assignment
 * @param {boolean} props.loading - Loading state for save operation
 * @param {Array} props.classOptions - Array of class options for dropdown
 * @param {Array} props.subjectOptions - Array of subject options for dropdown
 * @returns {JSX.Element} Create assignment drawer UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [formData, setFormData] = useState({
 *   title: '',
 *   description: '',
 *   subject: '',
 *   class_section: '',
 *   due_date: '',
 *   attachment_url: ''
 * });
 * 
 * <CreateAssignmentDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   mode="create"
 *   formData={formData}
 *   setFormData={setFormData}
 *   onSave={handleSave}
 *   loading={isSaving}
 *   classOptions={classes}
 *   subjectOptions={subjects}
 * />
 * ============================================
 */
export default function CreateAssignmentDrawer({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  onSave,
  loading,
  classOptions,
  subjectOptions,
}) {
  /**
   * ============================================
   * MODE DETECTION
   * ============================================
   * 
   * Determines if the drawer is in create or edit mode
   */
  const isCreate = mode === 'create';

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={isCreate ? 'Create New Assignment' : 'Edit Assignment'}
      width="max-w-[440px]"
      footer={
        // ─── Drawer Footer with Action Buttons ───
        <div className="flex gap-3">
          <Button
            variant="outline"
            tone="teacher"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            tone="teacher"
            fullWidth
            leftIcon={<Send size={14} />}
            onClick={onSave}
            disabled={loading || !formData.title || !formData.subject || !formData.class_section || !formData.due_date}
          >
            {isCreate ? 'Publish' : 'Update'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Assignment Title ─── */}
        <Input
          label="Assignment Title"
          tone="teacher"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Final Semester Research Paper"
          required
        />

        {/* ─── Description ─── */}
        <TextArea
          label="Description"
          tone="teacher"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detailed instructions for students..."
          rows={3}
        />

        {/* ─── Subject Selector ─── */}
        <Select
          label="Subject"
          tone="teacher"
          value={formData.subject}
          onChange={(val) => setFormData(prev => ({ ...prev, subject: val }))}
          options={subjectOptions.filter(opt => opt.value !== 'all')}
          placeholder="Select subject"
          required
        />

        {/* ─── Class Selector ─── */}
        <Select
          label="Class & Section"
          tone="teacher"
          value={formData.class_section}
          onChange={(val) => setFormData(prev => ({ ...prev, class_section: val }))}
          options={classOptions.filter(opt => opt.value !== 'all')}
          placeholder="Select class"
          required
        />

        {/* ─── Due Date ─── */}
        <Input
          label="Due Date"
          type="date"
          tone="teacher"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />

        {/* ─── Attachment URL (Optional) ─── */}
        <Input
          label="Attachment URL (Optional)"
          tone="teacher"
          value={formData.attachment_url}
          onChange={(e) => setFormData(prev => ({ ...prev, attachment_url: e.target.value }))}
          placeholder="https://storage.school.com/file.pdf"
        />

        {/* ─── Information Notice ─── */}
        <div className="p-3 bg-[var(--color-teacher-light)] rounded-lg border border-[var(--color-teacher-primary)]/20">
          <p className="text-xs text-[var(--color-teacher-text)] flex items-center gap-2">
            <AlertCircle size={14} />
            This assignment will be visible to all students in the selected class immediately after publishing.
          </p>
        </div>
      </div>
    </Drawer>
  );
}