/**
 * ============================================
 * FEE EDIT CHALLAN DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Edit fee/challan details in a sliding drawer
 * Features:
 * - Student information display
 * - Amount editing with PKR currency
 * - Due date picker
 * - Optional reason for change field
 * - Form validation indicators (required fields)
 * - Save and Cancel actions
 * - Loading state for save operation
 * - Responsive drawer layout
 * 
 * Dependencies:
 * - lucide-react for icons (Save)
 * - @/components/ui/Button for action buttons
 * - @/components/admin/Drawer for sliding panel
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <FeeEditChallanDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={selectedFee}
 *   onChange={handleFeeChange}
 *   onSave={handleSave}
 *   loading={isSubmitting}
 * />
 * ============================================
 */

import { Save } from 'lucide-react';
import Button from "@/components/ui/Button";
import Drawer from "@/components/admin/Drawer";
import { formatCurrency } from "@/utils/helpers";

/**
 * ============================================
 * FEE EDIT CHALLAN DRAWER COMPONENT
 * ============================================
 * 
 * Renders a drawer for editing fee/challan details
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.fee - Fee object with all details
 * @param {Function} props.onChange - Callback function when form fields change
 * @param {Function} props.onSave - Callback function to save changes
 * @param {boolean} props.loading - Loading state for save operation
 * @returns {JSX.Element|null} Edit challan drawer or null if no fee
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [fee, setFee] = useState({ amount: 1000, due_date: '2024-12-31' });
 * 
 * <FeeEditChallanDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={fee}
 *   onChange={setFee}
 *   onSave={() => saveFee(fee)}
 *   loading={isSaving}
 * />
 * ============================================
 */
export default function FeeEditChallanDrawer({
  isOpen,
  onClose,
  fee,
  onChange,
  onSave,
  loading,
}) {
  // Return null if no fee is selected
  if (!fee) return null;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Edit Challan"
      width="max-w-[350px]"
      footer={
        // ─── Drawer Footer with Action Buttons ───
        <div className="flex gap-3">
          <Button variant="outline" tone="admin" fullWidth onClick={onClose}>
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
        {/* ─── Student Information ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Student
          </label>
          <p className="text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-dim)] p-3 rounded-lg border border-gray-200">
            {fee.student_name} ({fee.roll_number || '—'})
          </p>
        </div>

        {/* ─── Amount Field ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Amount (PKR) <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="number"
            value={fee.amount || ''}
            onChange={(e) => onChange({ ...fee, amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* ─── Due Date Field ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Due Date <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="date"
            value={fee.due_date ? new Date(fee.due_date).toISOString().slice(0, 10) : ''}
            onChange={(e) => onChange({ ...fee, due_date: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>

        {/* ─── Reason for Change ─── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Reason for Change
          </label>
          <textarea
            value={fee.reason || ''}
            onChange={(e) => onChange({ ...fee, reason: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
            rows={2}
            placeholder="Optional reason"
          />
        </div>
      </div>
    </Drawer>
  );
}