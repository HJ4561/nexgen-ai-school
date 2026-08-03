/**
 * ============================================
 * MONTHLY FEE TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays monthly fee invoices in a responsive table
 * Features:
 * - Month, original fee, payable fee, paid amount, remaining balance
 * - Due date and status badge
 * - View and Pay action buttons
 * - Responsive design (table on desktop, card list on mobile)
 * - Fee details modal for detailed view
 * - Selected fee highlighting
 * - Role-based theming (parent)
 * - Empty state with icon
 * 
 * Dependencies:
 * - lucide-react for icons (Eye, CreditCard, Receipt, Calendar)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Badge for status indicator
 * - @/components/parent/fees/FeeDetailsModal for detailed view
 * - @/modules/parent/store/parentSlice for state management
 * - react-redux for state management
 * 
 * Usage:
 * <MonthlyFeeTable />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Eye,
  CreditCard,
  Receipt,
  Calendar,
} from "lucide-react";

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

import FeeDetailsModal from "./FeeDetailsModal";

import { setSelectedFee } from "@/modules/parent/store/parentSlice";

/**
 * ============================================
 * MONTHLY FEE TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive fee table with view and pay actions
 * 
 * @returns {JSX.Element} Monthly fee table UI
 * 
 * @example
 * // In parent dashboard
 * <MonthlyFeeTable />
 * ============================================
 */
const MonthlyFeeTable = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves fees, parentLinks, selectedChild, and selectedFee from Redux store
   */
  const {
    fees = [],
    parentLinks = [],
    selectedChild,
    selectedFee,
  } = useSelector((state) => state.parent);

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
   * CHILD FEES
   * ============================================
   * 
   * Filters fees for the selected child
   */
  const childFees = useMemo(() => {
    if (!currentChild) return [];
    return fees.filter(
      (fee) => fee.student_name === currentChild.student_name
    );
  }, [fees, currentChild]);

  /**
   * ============================================
   * VIEW MODAL STATE
   * ============================================
   * 
   * Tracks the fee being viewed in the details modal
   */
  const [viewFee, setViewFee] = useState(null);

  /**
   * ============================================
   * HELPERS
   * ============================================
   * 
   * Utility functions for formatting and status mapping
   */

  /**
   * Format amount as PKR currency
   */
  const formatCurrency = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString()}`;

  /**
   * Calculate remaining amount for a fee
   */
  const remainingAmount = (fee) =>
    Number(fee.amount) - Number(fee.amount_paid || 0);

  /**
   * Map fee status to Badge variant
   * - Paid: success (green)
   * - Partial: warning (yellow)
   * - Pending: danger (red)
   */
  const getStatusVariant = (status) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Partial":
        return "warning";
      case "Pending":
        return "danger";
      default:
        return "secondary";
    }
  };

  /**
   * Format month to "Month Year" format
   */
  const formatMonth = (month) =>
    new Date(month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  /**
   * Format date to "DD MMM YYYY" format
   */
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  /**
   * ============================================
   * SELECT FEE FOR PAYMENT
   * ============================================
   * 
   * Dispatches setSelectedFee action with the selected fee
   * 
   * @param {Object} fee - Fee object to select
   */
  const handleSelectFee = (fee) => {
    dispatch(setSelectedFee(fee));
  };

  return (
    <>
      <Card hover={false}>
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary">
            Monthly Fee Statement
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            View fee invoices and payment status.
          </p>
        </div>

        {/* ─── Empty State ────────────────────────────────────────── */}
        {childFees.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-parent-border py-12 text-center">
            <Receipt size={28} className="text-text-secondary/50" />
            <p className="text-sm font-medium text-text-primary">
              No fee records yet
            </p>
            <p className="text-xs text-text-secondary">
              Fee invoices will show up here once they're issued.
            </p>
          </div>
        )}

        {/* ─── Desktop / Tablet Table (md and up) ───────────────── */}
        {childFees.length > 0 && (
          <div className="hidden md:block overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-parent-light/40 border-b border-parent-border">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Month</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Original</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Payable</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Paid</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Remaining</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Due Date</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-text-secondary">Actions</th>
                </tr>
              </thead>

              <tbody>
                {childFees.map((fee) => (
                  <tr
                    key={fee.id}
                    className={`border-b border-slate-200 transition-colors ${
                      selectedFee?.id === fee.id
                        ? "bg-parent-light/30"
                        : "hover:bg-parent-light/20"
                    }`}
                  >
                    {/* Month */}
                    <td className="p-4 font-medium text-text-primary whitespace-nowrap">
                      {formatMonth(fee.month)}
                    </td>

                    {/* Original Fee */}
                    <td className="p-4 text-text-secondary whitespace-nowrap">
                      {formatCurrency(fee.original_amount)}
                    </td>

                    {/* Payable Fee */}
                    <td className="p-4 whitespace-nowrap">
                      {formatCurrency(fee.amount)}
                    </td>

                    {/* Amount Paid */}
                    <td className="p-4 text-green-600 font-medium whitespace-nowrap">
                      {formatCurrency(fee.amount_paid)}
                    </td>

                    {/* Remaining */}
                    <td className="p-4 font-semibold text-red-600 whitespace-nowrap">
                      {formatCurrency(remainingAmount(fee))}
                    </td>

                    {/* Due Date */}
                    <td className="p-4 text-text-secondary whitespace-nowrap">
                      {formatDate(fee.due_date)}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <Badge variant={getStatusVariant(fee.status)}>
                        {fee.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* View Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          tone="parent"
                          leftIcon={<Eye size={16} />}
                          onClick={() => setViewFee(fee)}
                        >
                          View
                        </Button>

                        {/* Pay Button (conditional) */}
                        {fee.status !== "Paid" && (
                          <Button
                            size="sm"
                            tone="parent"
                            leftIcon={<CreditCard size={16} />}
                            onClick={() => handleSelectFee(fee)}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── Mobile Card List (below md) ──────────────────────── */}
        {childFees.length > 0 && (
          <div className="md:hidden flex flex-col gap-3">
            {childFees.map((fee) => (
              <div
                key={fee.id}
                className={`rounded-xl border p-4 transition-colors ${
                  selectedFee?.id === fee.id
                    ? "border-parent-border bg-parent-light/30"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* ─── Top row: month + status ─── */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary leading-tight">
                      {formatMonth(fee.month)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                      <Calendar size={12} />
                      Due {formatDate(fee.due_date)}
                    </p>
                  </div>

                  <Badge variant={getStatusVariant(fee.status)}>
                    {fee.status}
                  </Badge>
                </div>

                {/* ─── Amount grid ─── */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-parent-light/30 p-3 text-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                      Payable
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-text-primary">
                      {formatCurrency(fee.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                      Paid
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-green-600">
                      {formatCurrency(fee.amount_paid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-text-secondary">
                      Remaining
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-red-600">
                      {formatCurrency(remainingAmount(fee))}
                    </p>
                  </div>
                </div>

                {/* ─── Actions ─── */}
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    tone="parent"
                    className="flex-1"
                    leftIcon={<Eye size={16} />}
                    onClick={() => setViewFee(fee)}
                  >
                    View
                  </Button>

                  {fee.status !== "Paid" && (
                    <Button
                      size="sm"
                      tone="parent"
                      className="flex-1"
                      leftIcon={<CreditCard size={16} />}
                      onClick={() => handleSelectFee(fee)}
                    >
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ─── Fee Details Modal ────────────────────────────────────── */}
      <FeeDetailsModal
        open={Boolean(viewFee)}
        fee={viewFee}
        onClose={() => setViewFee(null)}
      />
    </>
  );
};

export default MonthlyFeeTable;