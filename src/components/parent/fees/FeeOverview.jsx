/**
 * ============================================
 * FEE OVERVIEW COMPONENT
 * ============================================
 * 
 * Purpose: Displays fee statistics summary for parent view
 * Features:
 * - Total fee amount
 * - Total paid amount
 * - Remaining due amount
 * - Number of invoices
 * - Color-coded stat cards with icons
 * - Dynamic footer color based on remaining amount
 * - Role-based theming (parent)
 * - Responsive grid layout (1/2/4 columns)
 * 
 * Dependencies:
 * - lucide-react for icons (Wallet, CircleDollarSign, AlertTriangle, Receipt)
 * - @/components/composite/StatCard for statistic display
 * - react-redux for state management
 * 
 * Usage:
 * <FeeOverview />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Wallet,
  CircleDollarSign,
  AlertTriangle,
  Receipt,
} from "lucide-react";

import StatCard from "@/components/composite/StatCard";

/**
 * ============================================
 * FEE OVERVIEW COMPONENT
 * ============================================
 * 
 * Renders fee statistics in a visual card grid
 * 
 * @returns {JSX.Element} Fee overview UI
 * 
 * @example
 * // In parent dashboard
 * <FeeOverview />
 * ============================================
 */
const FeeOverview = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    fees = [],
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
   * SELECTED CHILD FEES
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
   * FEE STATISTICS
   * ============================================
   * 
   * Calculates fee statistics for the selected child:
   * - totalFee: Sum of all original fee amounts
   * - paidAmount: Sum of all paid amounts
   * - remaining: Payable fee minus paid amount
   * - invoices: Total number of fee invoices
   */
  const stats = useMemo(() => {
    // Total original fee
    const totalFee = childFees.reduce(
      (sum, fee) => sum + Number(fee.original_amount),
      0
    );

    // Total payable fee
    const payableFee = childFees.reduce(
      (sum, fee) => sum + Number(fee.amount),
      0
    );

    // Total paid amount
    const paidAmount = childFees.reduce(
      (sum, fee) => sum + Number(fee.amount_paid || 0),
      0
    );

    // Remaining balance
    const remaining = payableFee - paidAmount;

    return {
      totalFee,
      paidAmount,
      remaining,
      invoices: childFees.length,
    };
  }, [childFees]);

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
    `PKR ${amount.toLocaleString()}`;

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {/* ─── Total Fee ─── */}
      <StatCard
        label="Total Fee"
        value={formatCurrency(stats.totalFee)}
        icon={<Wallet size={22} />}
        tone="parent"
        footerText="Academic Year"
        footerColor="primary"
      />

      {/* ─── Total Paid ─── */}
      <StatCard
        label="Total Paid"
        value={formatCurrency(stats.paidAmount)}
        icon={<CircleDollarSign size={22} />}
        tone="parent"
        footerText="Amount Paid"
        footerColor="success"
      />

      {/* ─── Remaining Due ─── */}
      <StatCard
        label="Remaining Due"
        value={formatCurrency(stats.remaining)}
        icon={<AlertTriangle size={22} />}
        tone="parent"
        footerText="Pending Payment"
        footerColor={stats.remaining > 0 ? "warning" : "success"}
      />

      {/* ─── Invoices ─── */}
      <StatCard
        label="Invoices"
        value={stats.invoices}
        icon={<Receipt size={22} />}
        tone="parent"
        footerText="Monthly Bills"
        footerColor="info"
      />
    </div>
  );
};

export default FeeOverview;