/**
 * ============================================
 * PARENT FEES & PAYMENTS COMPONENT
 * ============================================
 * 
 * Purpose: Parent fees and payments dashboard for managing child fees
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for switching between children
 * - Fee overview statistics (total, paid, remaining, invoices)
 * - Monthly fee table with payment status
 * - Payment card for secure payments
 * - Payment history list
 * - Fee notice with payment reminders
 * - Data fetching on mount (parent links, fees, payments)
 * - Responsive grid layout
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/components/layout/PageHeader for page header
 * - @/modules/parent/store/parentThunks for data fetching
 * - Various parent fee components
 * 
 * Usage:
 * <Route path="/parent/fees" element={<FeesPayments />} />
 * ============================================
 */

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import PageHeader from "@/components/layout/PageHeader";

import ChildFeeSelector from "@/components/parent/fees/ChildFeeSelector";
import FeeOverview from "@/components/parent/fees/FeeOverview";
import MonthlyFeeTable from "@/components/parent/fees/MonthlyFeeTable";
import PaymentCard from "@/components/parent/fees/PaymentCard";
import PaymentHistory from "@/components/parent/fees/PaymentHistory";
import FeeNotice from "@/components/parent/fees/FeeNotice";

import {
  fetchParentLinks,
  fetchFees,
  fetchPayments,
} from "@/modules/parent/store/parentThunks";

/**
 * ============================================
 * PARENT FEES & PAYMENTS COMPONENT
 * ============================================
 * 
 * Renders the parent fees and payments dashboard
 * 
 * @returns {JSX.Element} Parent fees and payments page
 * 
 * @example
 * // In parent routes
 * <Route path="/parent/fees" element={<FeesPayments />} />
 * ============================================
 */
const FeesPayments = () => {
  const dispatch = useDispatch();

  // ─── Data Fetching ───────────────────────────────────────────────────

  /**
   * ============================================
   * FETCH DATA ON MOUNT
   * ============================================
   * 
   * Dispatches actions to fetch:
   * - Parent-child links for child selector
   * - Fee records for all children
   * - Payment history for all children
   */
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchFees());
    dispatch(fetchPayments());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <PageHeader
        title="Fees & Payments"
        subtitle="View fee invoices, payment history and manage outstanding payments."
        breadcrumbs={["Parent", "Fees & Payments"]}
      />

      {/* ─── Child Selector ───────────────────────────────────────────── */}
      <ChildFeeSelector />

      {/* ─── Overview Cards ───────────────────────────────────────────── */}
      <FeeOverview />

      {/* ─── Fee Table + Payment Card ──────────────────────────────────── */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Monthly Fee Table (2/3 columns) */}
        <div className="xl:col-span-2">
          <MonthlyFeeTable />
        </div>

        {/* Payment Card (1/3 columns) */}
        <PaymentCard />
      </div>

      {/* ─── Payment History ───────────────────────────────────────────── */}
      <PaymentHistory />

      {/* ─── Fee Notice ────────────────────────────────────────────────── */}
      <FeeNotice />
    </div>
  );
};

export default FeesPayments;