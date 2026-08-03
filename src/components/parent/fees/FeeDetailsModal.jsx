/**
 * ============================================
 * FEE DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Displays detailed fee information in a modal
 * Features:
 * - Student name and due date
 * - Original fee, payable fee, amount paid, and remaining balance
 * - Status badge with color coding (Paid, Partial, Unpaid)
 * - Currency formatting (PKR)
 * - Keyboard accessibility (Escape to close)
 * - Body scroll locking when open
 * - Responsive grid layout
 * - Parent role theming
 * 
 * Dependencies:
 * - lucide-react for icons (X, CalendarDays, Wallet, CreditCard, BadgeDollarSign, CheckCircle)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicator
 * 
 * Usage:
 * <FeeDetailsModal
 *   open={isOpen}
 *   fee={selectedFee}
 *   onClose={() => setIsOpen(false)}
 * />
 * ============================================
 */

import { useEffect } from "react";

import {
  X,
  CalendarDays,
  Wallet,
  CreditCard,
  BadgeDollarSign,
  CheckCircle,
} from "lucide-react";

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * DETAIL ROW SUB-COMPONENT
 * ============================================
 * 
 * Renders a labeled detail item with icon
 * 
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.label - Detail label
 * @param {string} props.value - Detail value
 * @returns {JSX.Element} Detail row UI
 */
const DetailRow = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
    <div className="rounded-lg bg-parent-light p-2">
      <Icon size={18} className="text-parent-primary" />
    </div>

    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary">
        {label}
      </p>

      <p className="mt-1 font-medium text-text-primary">
        {value}
      </p>
    </div>
  </div>
);

/**
 * ============================================
 * FEE DETAILS MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal with detailed fee information
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Object} props.fee - Fee object with all details
 * @param {string} props.fee.student_name - Name of the student
 * @param {string} props.fee.month - Fee month (YYYY-MM)
 * @param {string} props.fee.due_date - Payment due date
 * @param {number} props.fee.original_amount - Original fee amount
 * @param {number} props.fee.amount - Final payable amount
 * @param {number} props.fee.amount_paid - Amount already paid
 * @param {string} props.fee.status - Payment status (Paid, Partial, Unpaid)
 * @param {Function} props.onClose - Callback function to close the modal
 * @returns {JSX.Element|null} Fee details modal or null if not open
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [selectedFee, setSelectedFee] = useState(null);
 * 
 * <FeeDetailsModal
 *   open={isOpen}
 *   fee={selectedFee}
 *   onClose={() => setIsOpen(false)}
 * />
 * ============================================
 */
const FeeDetailsModal = ({
  open,
  fee,
  onClose,
}) => {
  /**
   * ============================================
   * ESCAPE KEY HANDLER & SCROLL LOCK
   * ============================================
   * 
   * - Closes modal when Escape key is pressed
   * - Locks body scroll when modal is open
   * - Restores scroll when modal closes
   * - Cleanup on unmount
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Lock body scroll
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Restore body scroll
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Return null if modal is not open or no fee is selected
  if (!open || !fee) return null;

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
   * CURRENCY FORMATTER
   * ============================================
   * 
   * Formats a number as PKR currency with commas
   * 
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (amount) =>
    `PKR ${Number(amount).toLocaleString()}`;

  /**
   * ============================================
   * STATUS BADGE VARIANT MAPPING
   * ============================================
   * 
   * Maps fee status to Badge component variants
   * - Paid: success (green)
   * - Partial: warning (yellow)
   * - Unpaid: danger (red)
   */
  const badgeVariant = {
    Paid: "success",
    Partial: "warning",
    Unpaid: "danger",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* ─── Backdrop ─── */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* ─── Modal Container ─── */}
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="bg-parent-primary px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              {/* Badge */}
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                Fee Invoice
              </span>

              {/* Month/Year Title */}
              <h2 className="mt-3 text-2xl font-bold">
                {new Date(fee.month).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────── */}
        <div className="grid gap-4 p-6 md:grid-cols-2">
          {/* Student */}
          <DetailRow
            icon={Wallet}
            label="Student"
            value={fee.student_name}
          />

          {/* Due Date */}
          <DetailRow
            icon={CalendarDays}
            label="Due Date"
            value={new Date(fee.due_date).toLocaleDateString()}
          />

          {/* Original Fee */}
          <DetailRow
            icon={BadgeDollarSign}
            label="Original Fee"
            value={formatCurrency(fee.original_amount)}
          />

          {/* Payable Fee */}
          <DetailRow
            icon={CreditCard}
            label="Payable Fee"
            value={formatCurrency(fee.amount)}
          />

          {/* Amount Paid */}
          <DetailRow
            icon={CheckCircle}
            label="Amount Paid"
            value={formatCurrency(fee.amount_paid)}
          />

          {/* Remaining */}
          <DetailRow
            icon={Wallet}
            label="Remaining"
            value={formatCurrency(remaining)}
          />
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t px-6 py-4">
          {/* Status Badge */}
          <Badge variant={badgeVariant[fee.status]}>
            {fee.status}
          </Badge>

          {/* Close Button */}
          <Button
            tone="parent"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeeDetailsModal;