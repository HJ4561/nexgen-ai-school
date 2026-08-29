/**
 * ============================================
 * PAYMENT MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Record a payment for a student's fee
 * Features:
 * - Student name display
 * - Amount paid input with validation
 * - Outstanding amount display
 * - Payment method selection (Cash, Bank Transfer, Cheque, Other)
 * - Payment date picker
 * - Optional notes field
 * - Loading state during submission
 * - Modal with backdrop blur
 * - Responsive design
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (X)
 * - @/components/ui/Button for action buttons
 * 
 * Usage:
 * <PaymentModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSave={handleSave}
 *   formData={paymentData}
 *   setFormData={setPaymentData}
 *   loading={isSubmitting}
 *   studentName="John Doe"
 *   amountDue="Rs 5,000"
 * />
 * ============================================
 */

import { X } from 'lucide-react';
import Button from "@/components/ui/Button";

/**
 * ============================================
 * PAYMENT MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal for recording fee payments
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Function} props.onSave - Callback function to save the payment
 * @param {Object} props.formData - Form data object containing payment fields
 * @param {Function} props.setFormData - Setter function for form data
 * @param {boolean} props.loading - Loading state for save operation
 * @param {string} props.studentName - Name of the student making payment
 * @param {string} props.amountDue - Outstanding amount display string
 * @returns {JSX.Element|null} Payment modal or null if not open
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [formData, setFormData] = useState({
 *   amount_paid: '',
 *   payment_method: 'Cash',
 *   payment_date: new Date().toISOString().slice(0, 10),
 *   notes: ''
 * });
 * 
 * <PaymentModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onSave={handleSave}
 *   formData={formData}
 *   setFormData={setFormData}
 *   loading={isSaving}
 *   studentName="John Doe"
 *   amountDue="Rs 5,000"
 * />
 * ============================================
 */
export default function PaymentModal({
  isOpen,
  onClose,
  onSave,
  formData,
  setFormData,
  loading,
  studentName,
  amountDue,
}) {
  // Return null if modal is not open
  if (!isOpen) return null;

  /**
   * ============================================
   * HANDLE SUBMIT
   * ============================================
   * 
   * Prevents default form submission and triggers save callback
   * 
   * @param {Object} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* ─── Modal Container ─── */}
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Record Payment
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── Body ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Student Name (Conditional) */}
          {studentName && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                Student
              </label>
              <p className="text-sm font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface-dim)] p-2 rounded-lg border border-gray-200">
                {studentName}
              </p>
            </div>
          )}

          {/* ─── Amount Paid ─── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Amount Paid <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.amount_paid}
              onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent outline-none"
              step="0.01"
              min="0"
              required
              disabled={loading}
              placeholder="Enter amount"
            />
            {/* Outstanding amount display */}
            {amountDue && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Outstanding: {amountDue}
              </p>
            )}
          </div>

          {/* ─── Payment Method ─── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ─── Payment Date ─── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          {/* ─── Notes ─── */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent outline-none"
              rows={2}
              placeholder="Optional notes"
              disabled={loading}
            />
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="flex-shrink-0 flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <Button
            variant="outline"
            tone="admin"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            tone="admin"
            onClick={handleSubmit}
            disabled={loading || !formData.amount_paid}
          >
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}