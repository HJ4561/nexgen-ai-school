/**
 * ============================================
 * FEE CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays student fee information in a card format
 * Features:
 * - Shows fee amount, payment status, due date
 * - Paid amount and remaining balance calculation
 * - "Pay Now" button for unpaid fees
 * - Success message for completed payments
 * - Status badges (Paid, Partial, Unpaid)
 * - Responsive card design with gradient background
 * - Hover effects and transitions
 * 
 * Dependencies:
 * - @/ui/Card/Card for container
 * - lucide-react for icons (CalendarDays, Wallet, CircleDollarSign, CheckCircle2)
 * 
 * Usage:
 * <FeeCard
 *   month="June 2026"
 *   originalAmount={5000}
 *   amount={4500}
 *   amountPaid={0}
 *   dueDate="30 June 2026"
 *   status="Unpaid"
 *   onPay={handlePayment}
 * />
 * ============================================
 */

import Card from "@/ui/Card/Card";
import {
  CalendarDays,
  Wallet,
  CircleDollarSign,
  CheckCircle2,
} from "lucide-react";

/**
 * ============================================
 * FEE CARD COMPONENT
 * ============================================
 * 
 * Renders a card displaying fee information with payment actions
 * 
 * @param {Object} props - Component props
 * @param {string} props.month - Fee month or billing period
 * @param {number} props.originalAmount - Original fee before discounts
 * @param {number} props.amount - Final payable amount
 * @param {number} props.amountPaid - Amount already paid (default: 0)
 * @param {string} props.dueDate - Payment due date
 * @param {string} props.paidDate - Date payment was completed
 * @param {string} props.status - Payment status (Paid | Partial | Unpaid)
 * @param {Function} props.onPay - Function executed when user clicks Pay Now
 * @param {string} props.bgColor - Custom background classes
 * @param {string} props.className - Additional custom classes
 * @returns {JSX.Element} Fee card UI
 * 
 * @example
 * // Unpaid Fee
 * <FeeCard
 *   month="June 2026"
 *   originalAmount={5000}
 *   amount={4500}
 *   amountPaid={0}
 *   dueDate="30 June 2026"
 *   status="Unpaid"
 *   onPay={handlePayment}
 * />
 * 
 * // Partial Payment
 * <FeeCard
 *   month="May 2026"
 *   originalAmount={5000}
 *   amount={5000}
 *   amountPaid={3000}
 *   dueDate="31 May 2026"
 *   status="Partial"
 *   onPay={handlePayment}
 * />
 * 
 * // Paid Fee
 * <FeeCard
 *   month="April 2026"
 *   originalAmount={5000}
 *   amount={5000}
 *   amountPaid={5000}
 *   dueDate="30 April 2026"
 *   paidDate="25 April 2026"
 *   status="Paid"
 * />
 * ============================================
 */
function FeeCard({
  month,
  originalAmount,
  amount,
  amountPaid = 0,
  dueDate,
  paidDate,
  status = "Unpaid",
  onPay,
  bgColor,
  className = "",
}) {
  /**
   * ============================================
   * CALCULATE REMAINING BALANCE
   * ============================================
   * 
   * Determines the outstanding amount to be paid
   * Used to show remaining balance and control payment button visibility
   */
  const remaining = amount - amountPaid;

  /**
   * ============================================
   * STATUS BADGE STYLES
   * ============================================
   * 
   * Maps payment status to appropriate color styles
   * - Paid: Green (success)
   * - Partial: Yellow (warning)
   * - Unpaid: Red (danger)
   */
  const statusStyles = {
    Paid: "bg-success-bg text-success-text",
    Partial: "bg-warning-bg text-warning-text",
    Unpaid: "bg-danger-bg text-danger-text",
  };

  return (
    <Card
      hover
      bgColor={bgColor}
      className={`
        bg-gradient-to-br
        from-white
        via-slate-50
        to-blue-50
        ${className}
      `}
    >
      {/* ============================================
          CARD HEADER
          Displays month, fee amount, and payment status
          ============================================ */}
      <div className="flex items-start justify-between">
        <div>
          {/* Fee Month */}
          <p className="text-sm text-text-secondary">
            {month}
          </p>

          {/* Final Payable Amount */}
          <h3 className="mt-2 text-3xl font-bold text-text-primary">
            Rs. {amount}
          </h3>
        </div>

        {/* Payment Status Badge */}
        <div
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            font-medium
            ${statusStyles[status]}
          `}
        >
          {status}
        </div>
      </div>

      {/* ============================================
          FEE DETAILS SECTION
          Original fee, paid amount, remaining balance, dates
          ============================================ */}
      <div className="mt-6 space-y-4">
        {/* Original Fee */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">
            Original Fee
          </span>

          <span className="font-semibold">
            Rs. {originalAmount}
          </span>
        </div>

        {/* Amount Paid */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">
            Paid
          </span>

          <span className="font-semibold text-success">
            Rs. {amountPaid}
          </span>
        </div>

        {/* Remaining Balance */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">
            Remaining
          </span>

          <span className="font-semibold text-danger">
            Rs. {remaining}
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-3 text-text-secondary">
          <CalendarDays size={18} />

          <span>
            Due: {dueDate}
          </span>
        </div>

        {/* Payment Date (conditional) */}
        {paidDate && (
          <div className="flex items-center gap-3 text-text-secondary">
            <CheckCircle2 size={18} />

            <span>
              Paid: {paidDate}
            </span>
          </div>
        )}
      </div>

      {/* ============================================
          PAYMENT ACTION
          Shown only if there is remaining balance
          ============================================ */}
      {remaining > 0 && (
        <button
          onClick={onPay}
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-button
            bg-gradient-to-r
            from-brand-primary
            to-parent-primary
            px-4
            py-3
            font-medium
            text-white
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
          "
        >
          <Wallet size={18} />
          Pay Now
        </button>
      )}

      {/* ============================================
          PAYMENT COMPLETED STATE
          Shown when status is "Paid"
          ============================================ */}
      {status === "Paid" && (
        <div
          className="
            mt-6
            flex
            items-center
            justify-center
            gap-2
            rounded-button
            bg-success-bg
            px-4
            py-3
            font-medium
            text-success-text
          "
        >
          <CircleDollarSign
            size={18}
          />
          Payment Completed
        </div>
      )}
    </Card>
  );
}

export default FeeCard;