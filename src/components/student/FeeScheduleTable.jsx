/**
 * ============================================
 * FEE SCHEDULE TABLE COMPONENT (STUDENT VIEW)
 * ============================================
 * 
 * Purpose: Displays student fee schedule with filtering and search
 * Features:
 * - Monthly fee records with original, payable, paid, and remaining amounts
 * - Status badges with color coding (Paid, Partial, Pending)
 * - Status filter buttons (All, Paid, Partial, Pending)
 * - Search by month
 * - View and Pay action buttons
 * - Responsive design (table on desktop, cards on mobile)
 * - Student role theming
 * - Empty state handling
 * 
 * Dependencies:
 * - lucide-react for icons (Eye, CreditCard, Search)
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Card for container
 * 
 * Usage:
 * <FeeScheduleTable
 *   fees={feesList}
 *   onView={handleView}
 *   onPay={handlePay}
 * />
 * ============================================
 */

import { useMemo, useState } from "react";
import {
  Eye,
  CreditCard,
  Search,
} from "lucide-react";

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

/**
 * ============================================
 * FILTER OPTIONS
 * ============================================
 * 
 * Available status filter options
 * - All: Shows all fees
 * - Paid: Only paid fees
 * - Partial: Only partially paid fees
 * - Pending: Only pending fees
 */
const FILTERS = ["All", "Paid", "Partial", "Pending"];

/**
 * ============================================
 * FEE SCHEDULE TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive fee schedule table with filtering
 * 
 * @param {Object} props - Component props
 * @param {Array} props.fees - Array of fee objects
 * @param {Function} props.onView - Callback when view button is clicked
 * @param {Function} props.onPay - Callback when pay button is clicked
 * @returns {JSX.Element} Fee schedule table UI
 * 
 * @example
 * const fees = [
 *   { id: 1, month: '2024-01', amount: 5000, amount_paid: 5000, status: 'Paid' },
 *   { id: 2, month: '2024-02', amount: 5000, amount_paid: 0, status: 'Pending' }
 * ];
 * 
 * <FeeScheduleTable
 *   fees={fees}
 *   onView={(fee) => openDetailsModal(fee)}
 *   onPay={(fee) => openPaymentModal(fee)}
 * />
 * ============================================
 */
function FeeScheduleTable({
  fees = [],
  onView,
  onPay,
}) {
  /**
   * ============================================
   * FILTER STATE
   * ============================================
   * 
   * - statusFilter: Filters by fee status
   * - search: Filters by month name
   */
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  /**
   * ============================================
   * FILTERED FEES
   * ============================================
   * 
   * Applies status and search filters to the fees list
   * - Status: Exact match on status (or "All")
   * - Search: Case-insensitive match on month name
   */
  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      // Status filter
      const matchesStatus = statusFilter === "All" || fee.status === statusFilter;

      // Search filter (by month name)
      const month = new Date(fee.month).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const matchesSearch = month.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [fees, statusFilter, search]);

  /**
   * ============================================
   * STATUS BADGE STYLES
   * ============================================
   * 
   * Maps fee status to badge color classes
   * - Paid: Green
   * - Partial: Yellow
   * - Pending/Default: Red
   * 
   * @param {string} status - Fee status
   * @returns {string} Badge CSS classes
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Partial":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <Card className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-student-text">Fee Schedule</h2>
          <p className="mt-1 text-sm text-text-secondary">View your monthly fee records.</p>
        </div>

        {/* ─── Search Input ────────────────────────────────────── */}
        <div className="relative w-full max-w-xs">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            type="text"
            placeholder="Search month..."
            value={search}
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
              focus:border-student-primary"
          />
        </div>
      </div>

      {/* ─── Status Filters ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            size="sm"
            tone="student"
            variant={statusFilter === filter ? "primary" : "outline"}
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* ============================================
          DESKTOP TABLE
          ============================================ */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full">
          <thead className="bg-student-light">
            <tr className="text-left">
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Original</th>
              <th className="px-4 py-3">Payable</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Remaining</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredFees.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-text-secondary">
                  No fee records found.
                </td>
              </tr>
            ) : (
              filteredFees.map((fee) => {
                const remaining = Number(fee.amount) - Number(fee.amount_paid);

                return (
                  <tr key={fee.id} className="border-b transition hover:bg-student-light">
                    {/* Month */}
                    <td className="px-4 py-4">
                      {new Date(fee.month).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </td>

                    {/* Original Fee */}
                    <td className="px-4 py-4">Rs. {fee.original_amount}</td>

                    {/* Payable Fee */}
                    <td className="px-4 py-4">Rs. {fee.amount}</td>

                    {/* Amount Paid */}
                    <td className="px-4 py-4">Rs. {fee.amount_paid}</td>

                    {/* Remaining */}
                    <td className="px-4 py-4 font-semibold text-red-600">
                      Rs. {remaining}
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-4">
                      {new Date(fee.due_date).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(fee.status)}`}
                      >
                        {fee.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          tone="student"
                          leftIcon={<Eye size={16} />}
                          onClick={() => onView?.(fee)}
                        >
                          View
                        </Button>

                        {fee.status !== "Paid" && (
                          <Button
                            size="sm"
                            tone="student"
                            leftIcon={<CreditCard size={16} />}
                            onClick={() => onPay?.(fee)}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================
          MOBILE CARDS
          ============================================ */}
      <div className="space-y-4 lg:hidden">
        {filteredFees.length === 0 ? (
          // ─── Empty State ──────────────────────────────────────────
          <Card className="p-4 text-center text-text-secondary">
            No fee records found.
          </Card>
        ) : (
          filteredFees.map((fee) => {
            const remaining = Number(fee.amount) - Number(fee.amount_paid);

            return (
              <Card key={fee.id}>
                <div className="space-y-4">
                  {/* ─── Header: Month + Status ─── */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-student-text">
                      {new Date(fee.month).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(fee.status)}`}
                    >
                      {fee.status}
                    </span>
                  </div>

                  {/* ─── Amounts Grid ─── */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-secondary">Original</p>
                      <p className="font-medium">Rs. {fee.original_amount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Payable</p>
                      <p className="font-medium">Rs. {fee.amount}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Paid</p>
                      <p className="font-medium">Rs. {fee.amount_paid}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary">Remaining</p>
                      <p className="font-semibold text-red-600">Rs. {remaining}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-text-secondary">Due Date</p>
                      <p className="font-medium">
                        {new Date(fee.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* ─── Actions ─── */}
                  <div className="flex gap-3">
                    <Button
                      fullWidth
                      variant="outline"
                      tone="student"
                      leftIcon={<Eye size={16} />}
                      onClick={() => onView?.(fee)}
                    >
                      View
                    </Button>

                    {fee.status !== "Paid" && (
                      <Button
                        fullWidth
                        tone="student"
                        leftIcon={<CreditCard size={16} />}
                        onClick={() => onPay?.(fee)}
                      >
                        Pay
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
}

export default FeeScheduleTable;