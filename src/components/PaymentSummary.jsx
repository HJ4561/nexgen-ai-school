/**
 * ============================================
 * PAYMENT SUMMARY COMPONENT
 * ============================================
 * 
 * Purpose: Displays payment summary statistics
 * Features:
 * - Total invoices count
 * - Paid invoices count
 * - Pending invoices count
 * - Overdue invoices count
 * - Color-coded summary items with icons
 * - Role-based theming (parent)
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (Receipt, CheckCircle, AlertTriangle, Clock3)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <PaymentSummary />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Receipt,
  CheckCircle,
  AlertTriangle,
  Clock3,
} from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * SUMMARY ITEM SUB-COMPONENT
 * ============================================
 * 
 * Renders a single summary item with icon, label, and value
 * 
 * @param {Object} props - Component props
 * @param {Component} props.icon - Lucide icon component
 * @param {string} props.label - Item label
 * @param {number} props.value - Item value
 * @param {string} props.color - Color classes for the icon container
 * @returns {JSX.Element} Summary item UI
 */
const SummaryItem = ({
  icon: Icon,
  label,
  value,
  color,
}) => (
  <div className="flex flex-col md:flex-row items-center justify-between rounded-xl border border-slate-200 p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
      <div className={`flex flex-col md:flex-row h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
      <span className="font-medium text-text-primary px-4 sm:px-6 lg:px-8">{label}</span>
    </div>
    <span className="text-xl md:text-2xl md:text-2xl font-bold text-text-primary px-4 sm:px-6 lg:px-8">{value}</span>
  </div>
);

/**
 * ============================================
 * PAYMENT SUMMARY COMPONENT
 * ============================================
 * 
 * Renders a payment summary with invoice statistics
 * 
 * @returns {JSX.Element} Payment summary UI
 * 
 * @example
 * // In parent fee management
 * <PaymentSummary />
 * ============================================
 */
const PaymentSummary = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves fees, parentLinks, and selectedChild from Redux store
   */
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
   * SUMMARY STATISTICS
   * ============================================
   * 
   * Calculates payment summary statistics:
   * - invoices: Total number of fee invoices
   * - paid: Number of paid invoices
   * - pending: Number of pending invoices
   * - overdue: Number of overdue invoices
   */
  const summary = useMemo(() => {
    return {
      invoices: childFees.length,
      paid: childFees.filter((fee) => fee.status === "Paid").length,
      pending: childFees.filter((fee) => fee.status === "Pending").length,
      overdue: childFees.filter((fee) => fee.status === "Overdue").length,
    };
  }, [childFees]);

  return (
    <Card hover={false} className="h-full px-4 sm:px-6 lg:px-8">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl md:text-2xl font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
          Payment Summary
        </h2>

        <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
          Overview of fee invoices.
        </p>
      </div>

      {/* ─── Summary Items ──────────────────────────────────────── */}
      <div className="space-y-4 px-4 sm:px-6 lg:px-8">
        {/* Total Invoices */}
        <SummaryItem
          icon={Receipt}
          label="Invoices"
          value={summary.invoices}
          color="bg-blue-100 text-blue-600"
        />

        {/* Paid */}
        <SummaryItem
          icon={CheckCircle}
          label="Paid"
          value={summary.paid}
          color="bg-green-100 text-green-600"
        />

        {/* Pending */}
        <SummaryItem
          icon={Clock3}
          label="Pending"
          value={summary.pending}
          color="bg-yellow-100 text-yellow-600"
        />

        {/* Overdue */}
        <SummaryItem
          icon={AlertTriangle}
          label="Overdue"
          value={summary.overdue}
          color="bg-red-100 text-red-600"
        />
      </div>
    </Card>
  );
};

export default PaymentSummary;