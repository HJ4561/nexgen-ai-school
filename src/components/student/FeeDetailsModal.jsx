/**
 * ============================================
 * FEE DETAILS MODAL COMPONENT (STUDENT VIEW)
 * ============================================
 * 
 * Purpose: Displays detailed fee information in a modal for student view
 * Features:
 * - Fee month and status display
 * - Original fee and payable fee breakdown
 * - Paid amount and remaining balance
 * - Due date and paid date
 * - Status badge with color coding (Paid, Partial, Pending)
 * - Currency formatting for all amounts
 * - Responsive grid layout
 * - Student role theming
 * 
 * Dependencies:
 * - lucide-react for icons (Calendar, CheckCircle, Clock, Wallet, BadgeDollarSign, X)
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicator
 * 
 * Usage:
 * <FeeDetailsModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={selectedFee}
 * />
 * ============================================
 */

import {
  Calendar,
  CheckCircle,
  Clock,
  Wallet,
  BadgeDollarSign,
  X,
} from "lucide-react";

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

/**
 * ============================================
 * FEE DETAILS MODAL COMPONENT (STUDENT VIEW)
 * ============================================
 * 
 * Renders a modal with detailed fee information for students
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Object} props.fee - Fee object with all details
 * @param {string} props.fee.month - Fee month (YYYY-MM)
 * @param {number} props.fee.original_amount - Original fee amount
 * @param {number} props.fee.amount - Final payable amount
 * @param {number} props.fee.amount_paid - Amount already paid
 * @param {string} props.fee.status - Payment status (Paid, Partial, Pending)
 * @param {string} props.fee.due_date - Payment due date
 * @param {string} props.fee.paid_date - Payment completion date
 * @returns {JSX.Element|null} Fee details modal or null if no fee
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedFee, setSelectedFee] = useState(null);
 * 
 * <FeeDetailsModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   fee={selectedFee}
 * />
 * ============================================
 */
function FeeDetailsModal({
  open,
  onClose,
  fee,
}) {
  // Return null if no fee is selected
  if (!fee) return null;

  /**
   * ============================================
   * REMAINING BALANCE
   * ============================================
   * 
   * Calculates the remaining amount to be paid
   */
  const remaining = Number(fee.amount) - Number(fee.amount_paid);

  /**
   * ============================================
   * STATUS BADGE VARIANT MAPPING
   * ============================================
   * 
   * Maps fee status to Badge component variants
   * - Paid: success (green)
   * - Partial: warning (yellow)
   * - Pending: danger (red)
   */
  const statusVariant = {
    Paid: "success",
    Partial: "warning",
    Pending: "danger",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Fee Details"
    >
      <div className="space-y-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-xl bg-student-light p-5">
          <div>
            <h2 className="text-xl font-bold text-student-text">
              {new Date(fee.month).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Monthly Tuition Fee
            </p>
          </div>

          {/* Status Badge */}
          <Badge variant={statusVariant[fee.status]}>
            {fee.status}
          </Badge>
        </div>

        {/* ─── Amounts ────────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original Fee */}
          <div className="rounded-xl border border-student-border p-4">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-student-primary" />
              <span className="font-medium">Original Fee</span>
            </div>
            <p className="mt-3 text-2xl font-bold">
              Rs. {Number(fee.original_amount).toLocaleString()}
            </p>
          </div>

          {/* Payable Fee */}
          <div className="rounded-xl border border-student-border p-4">
            <div className="flex items-center gap-2">
              <BadgeDollarSign size={18} className="text-student-primary" />
              <span className="font-medium">Payable Fee</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-student-text">
              Rs. {Number(fee.amount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* ─── Payment ────────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Paid Amount */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              <span className="font-medium">Paid</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-green-700">
              Rs. {Number(fee.amount_paid).toLocaleString()}
            </p>
          </div>

          {/* Remaining Amount */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <span className="font-medium">Remaining</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-red-600">
              Rs. {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ─── Dates ────────────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Due Date */}
          <div className="rounded-xl bg-student-light p-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-student-primary" />
              <span className="font-medium">Due Date</span>
            </div>
            <p className="mt-3 font-semibold">
              {new Date(fee.due_date).toLocaleDateString()}
            </p>
          </div>

          {/* Paid Date */}
          <div className="rounded-xl bg-student-light p-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-student-primary" />
              <span className="font-medium">Paid Date</span>
            </div>
            <p className="mt-3 font-semibold">
              {fee.paid_date
                ? new Date(fee.paid_date).toLocaleDateString()
                : "-"}
            </p>
          </div>
        </div>

        {/* ─── Footer ────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            tone="student"
            leftIcon={<X size={16} />}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FeeDetailsModal;