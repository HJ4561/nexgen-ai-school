/**
 * ============================================
 * PAYMENT HISTORY COMPONENT
 * ============================================
 * 
 * Purpose: Displays recent payment history for a child
 * Features:
 * - Payment amount, date, method, and transaction ID
 * - Status badges (Completed, Pending, Failed)
 * - Sorted by payment date (newest first)
 * - Limited to 5 most recent payments
 * - Empty state with icon
 * - View All button
 * - Role-based theming (parent)
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (Receipt, ArrowRight)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action button
 * - @/components/ui/Badge for status indicator
 * - react-redux for state management
 * 
 * Usage:
 * <PaymentHistory />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Receipt,
  ArrowRight,
} from "lucide-react";

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * PAYMENT HISTORY COMPONENT
 * ============================================
 * 
 * Renders a list of recent payments for the selected child
 * 
 * @returns {JSX.Element} Payment history UI
 * 
 * @example
 * // In parent fee management
 * <PaymentHistory />
 * ============================================
 */
const PaymentHistory = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves payments, parentLinks, and selectedChild from Redux store
   */
  const {
    payments = [],
    parentLinks = [],
    selectedChild,
  } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * CHILD PAYMENTS
   * ============================================
   * 
   * Filters payments for the selected child
   * Sorts by payment date (newest first)
   * Limits to 5 most recent payments
   */
  const childPayments = useMemo(() => {
    if (!currentChild) return [];

    return payments
      .filter(
        (payment) => payment.student_name === currentChild.student_name
      )
      .sort(
        (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
      )
      .slice(0, 5);
  }, [payments, currentChild]);

  /**
   * ============================================
   * BADGE VARIANT MAPPING
   * ============================================
   * 
   * Maps payment status to Badge component variants
   * - Completed: success (green)
   * - Pending: warning (yellow)
   * - Failed: danger (red)
   * - Unknown: neutral (gray)
   */
  const getVariant = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "Failed":
        return "danger";
      default:
        return "neutral";
    }
  };

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

  return (
    <Card hover={false}>
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between z-0">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Recent fee payments.
          </p>
        </div>

        {/* View All Button */}
        <Button
          variant="ghost"
          tone="parent"
          size="sm"
          rightIcon={<ArrowRight size={16} />}
        >
          View All
        </Button>
      </div>

      {/* ─── Empty State ────────────────────────────────────────── */}
      {childPayments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center">
          <Receipt size={40} className="text-slate-400" />
          <p className="mt-4 font-medium">No Payments Found</p>
          <p className="mt-1 text-sm text-text-secondary">
            Payment history will appear here.
          </p>
        </div>
      ) : (
        // ─── Payment List ──────────────────────────────────────────
        <div className="space-y-4">
          {childPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              {/* ─── Payment Details ─── */}
              <div>
                {/* Amount */}
                <h4 className="font-semibold text-text-primary">
                  {formatCurrency(payment.amount)}
                </h4>

                {/* Payment Date */}
                <p className="mt-1 text-sm text-text-secondary">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </p>

                {/* Payment Method */}
                <p className="mt-1 text-sm text-text-secondary">
                  {payment.payment_method}
                </p>

                {/* Transaction ID */}
                <p className="mt-1 text-xs text-slate-500">
                  Transaction ID: {payment.transaction_id}
                </p>
              </div>

              {/* ─── Status Badge ─── */}
              <Badge variant={getVariant(payment.status)}>
                {payment.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PaymentHistory;