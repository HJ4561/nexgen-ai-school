/**
 * ============================================
 * FEE EDIT STRUCTURE DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Edit fee structure for a class/section in a sliding drawer
 * Features:
 * - Class & Section information display
 * - Monthly fee editing with PKR currency
 * - Dynamic drawer title with class name
 * - Save and Cancel actions
 * - Loading state for save operation
 * - Responsive drawer layout
 * - Class lookup for display name
 * 
 * Dependencies:
 * - lucide-react for icons (Save)
 * - @/components/ui/Button for action buttons
 * - @/components/admin/Drawer for sliding panel
 * 
 * Usage:
 * <FeeEditStructureDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={selectedFee}
 *   classes={classList}
 *   onChange={handleFeeChange}
 *   onSave={handleSave}
 *   loading={isSubmitting}
 * />
 * ============================================
 */

import { Save } from 'lucide-react';
import Button from "@/components/ui/Button";
import Drawer from "@/components/admin/Drawer";

/**
 * ============================================
 * FEE EDIT STRUCTURE DRAWER COMPONENT
 * ============================================
 * 
 * Renders a drawer for editing fee structure details
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.fee - Fee structure object with all details
 * @param {Array} props.classes - Array of class objects for lookup
 * @param {Function} props.onChange - Callback function when form fields change
 * @param {Function} props.onSave - Callback function to save changes
 * @param {boolean} props.loading - Loading state for save operation
 * @returns {JSX.Element|null} Edit structure drawer or null if no fee
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [fee, setFee] = useState({ class_section: 1, monthly_fee: 5000 });
 * const classes = [{ id: 1, class_name: '10', section: 'A' }];
 * 
 * <FeeEditStructureDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={fee}
 *   classes={classes}
 *   onChange={setFee}
 *   onSave={() => saveFeeStructure(fee)}
 *   loading={isSaving}
 * />
 * ============================================
 */
export default function FeeEditStructureDrawer({
  isOpen,
  onClose,
  fee,
  classes,
  onChange,
  onSave,
  loading,
}) {
  // Return null if no fee is selected
  if (!fee) return null;

  /**
   * ============================================
   * GET CLASS DISPLAY NAME
   * ============================================
   * 
   * Looks up class name and section from class ID
   * Returns formatted string "Class-Section" or fallback
   * 
   * @param {number} classSectionId - The class section ID
   * @returns {string} Formatted class display name
   */
  const getClassDisplay = (classSectionId) => {
    if (!classSectionId) return 'Unknown';
    const cls = classes.find((c) => c.id === classSectionId);
    return cls ? `${cls.class_name}-${cls.section}` : `Class ${classSectionId}`;
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={`Edit Fee — ${getClassDisplay(fee.class_section)}`}
      width="max-w-[350px]"
      footer={
        // ─── Drawer Footer with Action Buttons ───
        <div className="flex gap-3">
          <Button
            variant="outline"
            tone="admin"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            tone="admin"
            fullWidth
            leftIcon={<Save size={14} />}
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Class & Section Display ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Class & Section
          </label>
          <p className="text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-dim)] p-3 rounded-lg border border-gray-200">
            {getClassDisplay(fee.class_section)}
          </p>
        </div>

        {/* ─── Monthly Fee Field ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Monthly Fee (PKR) <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="number"
            value={fee.monthly_fee || ''}
            onChange={(e) =>
              onChange({ ...fee, monthly_fee: parseFloat(e.target.value) || 0 })
            }
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
            placeholder="Enter fee amount"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </Drawer>
  );
}