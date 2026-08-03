/**
 * ============================================
 * PAYMENT HISTORY COMPONENT (STUDENT VIEW)
 * ============================================
 * 
 * Purpose: Displays student's payment history with search and receipt download
 * Features:
 * - Merges payments with fee data
 * - Search by month
 * - Transaction ID, method, and date display
 * - Receipt download button
 * - Responsive design (table on desktop, cards on mobile)
 * - Student role theming
 * - Empty state with icon
 * 
 * Dependencies:
 * - lucide-react for icons (Search, Download, CreditCard, Calendar, Receipt)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action buttons
 * 
 * Usage:
 * <PaymentHistory payments={paymentsList} fees={feesList} />
 * ============================================
 */

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  CreditCard,
  Calendar,
  Receipt,
} from "lucide-react";

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

/**
 * ============================================
 * PAYMENT HISTORY COMPONENT
 * ============================================
 * 
 * Renders a responsive payment history with search
 * 
 * @param {Object} props - Component props
 * @param {Array} props.payments - Array of payment objects
 * @param {Array} props.fees - Array of fee objects for merging
 * @returns {JSX.Element} Payment history UI
 * 
 * @example
 * const payments = [
 *   { id: 1, fee: 1, amount_paid: 5000, payment_method: 'Bank Transfer', transaction_id: 'TXN123', payment_date: '2024-01-15' }
 * ];
 * const fees = [{ id: 1, month: '2024-01' }];
 * 
 * <PaymentHistory payments={payments} fees={fees} />
 * ============================================
 */
function PaymentHistory({
  payments = [],
  fees = [],
}) {
  /**
   * ============================================
   * SEARCH STATE
   * ============================================
   * 
   * Filters payment history by month name
   */
  const [search, setSearch] = useState("");

  /**
   * ============================================
   * MERGE PAYMENTS WITH FEES
   * ============================================
   * 
   * 1. Maps each payment to include the associated fee data
   * 2. Filters by month name (case-insensitive)
   * 3. Sorts by payment date (newest first)
   */
  const paymentHistory = useMemo(() => {
    return payments
      .map((payment) => {
        const fee = fees.find((item) => item.id === payment.fee);
        return {
          ...payment,
          fee,
        };
      })
      .filter((payment) => {
        const month = payment.fee
          ? new Date(payment.fee.month).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "";
        return month.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  }, [payments, fees, search]);

  /**
   * ============================================
   * DOWNLOAD RECEIPT
   * ============================================
   * 
   * Placeholder function for receipt download
   * 
   * @param {Object} payment - Payment object
   */
  const downloadReceipt = (payment) => {
    alert(`Downloading receipt for Transaction:\n${payment.transaction_id}`);
  };

  return (
    <Card className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-student-text">Payment History</h2>
          <p className="mt-1 text-sm text-text-secondary">View all your successful payments.</p>
        </div>

        {/* ─── Search Input ────────────────────────────────────── */}
        <div className="relative w-full max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            value={search}
            placeholder="Search month..."
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              rounded-xl
              border
              border-student-border
              py-2
              pl-10
              pr-4
              outline-none
              transition
              focus:border-student-primary
            "
          />
        </div>
      </div>

      {/* ─── Empty State ────────────────────────────────────────── */}
      {paymentHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Receipt size={60} className="text-student-primary" />
          <h3 className="mt-5 text-xl font-semibold">No Payments Found</h3>
          <p className="mt-2 text-sm text-text-secondary">You haven't made any payments yet.</p>
        </div>
      ) : (
        <>
          {/* ============================================
              MOBILE CARDS
              ============================================ */}
          <div className="space-y-4 md:hidden">
            {paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-student-border bg-white p-4 shadow-sm"
              >
                {/* ─── Month + Amount ─── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-student-primary" />
                    <span className="font-semibold">
                      {payment.fee
                        ? new Date(payment.fee.month).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    Rs. {Number(payment.amount_paid).toLocaleString()}
                  </span>
                </div>

                {/* ─── Details ─── */}
                <div className="mt-4 space-y-2 text-sm">
                  {/* Payment Method */}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Method</span>
                    <div className="flex items-center gap-2 rounded-full bg-student-light px-3 py-1">
                      <CreditCard size={14} />
                      {payment.payment_method}
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="flex justify-between gap-4">
                    <span className="text-text-secondary">Transaction</span>
                    <span className="font-mono text-xs break-all text-right">
                      {payment.transaction_id}
                    </span>
                  </div>

                  {/* Payment Date */}
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Date</span>
                    <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* ─── Receipt Button ─── */}
                <Button
                  className="mt-5 w-full"
                  variant="outline"
                  tone="student"
                  leftIcon={<Download size={16} />}
                  onClick={() => downloadReceipt(payment)}
                >
                  Download Receipt
                </Button>
              </div>
            ))}
          </div>

          {/* ============================================
              DESKTOP TABLE
              ============================================ */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="bg-student-light">
                <tr>
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Transaction</th>
                  <th className="px-4 py-3 text-left">Payment Date</th>
                  <th className="px-4 py-3 text-center">Receipt</th>
                </tr>
              </thead>

              <tbody>
                {paymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b transition hover:bg-student-light"
                  >
                    {/* Month */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-student-primary" />
                        {payment.fee
                          ? new Date(payment.fee.month).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 font-semibold text-green-600">
                      Rs. {Number(payment.amount_paid).toLocaleString()}
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-student-light px-3 py-1">
                        <CreditCard size={16} />
                        {payment.payment_method}
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="px-4 py-4 font-mono text-xs">
                      {payment.transaction_id}
                    </td>

                    {/* Payment Date */}
                    <td className="px-4 py-4">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>

                    {/* Receipt Button */}
                    <td className="px-4 py-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        tone="student"
                        leftIcon={<Download size={16} />}
                        onClick={() => downloadReceipt(payment)}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

export default PaymentHistory;