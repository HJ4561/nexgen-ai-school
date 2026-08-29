/**
 * ============================================
 * PARENT FINANCE PAGE
 * ============================================
 * 
 * Purpose: Finance management for parents
 * Used by: Parent module routes
 * 
 * Features:
 * - Fee summary dashboard
 * - Fee schedule for children
 * - Payment history
 * - Fee payment with Stripe
 * - Fee structure viewing
 * - Outstanding fees tracking
 * 
 * Dependencies:
 * - react for component
 * - react-redux for state management
 * - lucide-react for icons
 * - @/components/ui/Card for containers
 * - @/components/ui/Button for actions
 * - @/modules/parent/store/parentThunks for data fetching
 * 
 * Usage:
 * <Route path="/parent/finance" element={<ParentFinance />} />
 * ============================================
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  fetchFeeStructures,
  fetchFees,
  fetchFeeSummary,
  fetchPayments,
} from "@/modules/parent/store/parentThunks";
import {
  selectSelectedChild,
  selectFees,
  selectFeeSummary,
  selectPayments,
  selectFeeStructures,  // ✅ Now this exists in parentSlice
  selectParentLoading,
} from "@/modules/parent/store/parentSlice";
import StripePaymentModal from "@/modules/payments/StripePaymentModal";

const ParentFinance = () => {
  const dispatch = useDispatch();
  const selectedChild = useSelector(selectSelectedChild);
  const fees = useSelector(selectFees);
  const feeSummary = useSelector(selectFeeSummary);
  const payments = useSelector(selectPayments);
  const feeStructures = useSelector(selectFeeStructures);  // ✅ Using the selector
  const loading = useSelector(selectParentLoading);

  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (selectedChild) {
      dispatch(fetchFeeStructures({ student_id: selectedChild }));
      dispatch(fetchFees({ student_id: selectedChild }));
      dispatch(fetchFeeSummary({ student_id: selectedChild }));
      dispatch(fetchPayments({ student_id: selectedChild }));
    }
  }, [dispatch, selectedChild]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handlePayment = async (fee) => {
    setSelectedFee(fee);
    setIsProcessing(true);
    
    try {
      // Simulate payment intent creation
      // In a real implementation, you would call your payment service
      const mockClientSecret = `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setClientSecret(mockClientSecret);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Payment initialization failed:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge color="success">Paid</Badge>;
      case "pending":
        return <Badge color="warning">Pending</Badge>;
      case "overdue":
        return <Badge color="danger">Overdue</Badge>;
      case "cancelled":
        return <Badge color="secondary">Cancelled</Badge>;
      default:
        return <Badge color="secondary">{status || "N/A"}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "PKR 0";
    return `PKR ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPayments = payments.filter((payment) => {
    if (selectedMonth === "all") return true;
    if (!payment.payment_date) return false;
    const month = new Date(payment.payment_date).getMonth();
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month] === selectedMonth;
  });

  // ─── Helper functions for fee data ────────────────────────────────

  const getFeeStructureName = (fee) => {
    if (fee.fee_structure_title) return fee.fee_structure_title;
    if (fee.fee_structure?.title) return fee.fee_structure.title;
    if (fee.title) return fee.title;
    if (fee.fee_structure_name) return fee.fee_structure_name;
    if (fee.fee_structure?.fee_structure_title) return fee.fee_structure.fee_structure_title;
    return "Fee";
  };

  const getFeeMonth = (fee) => {
    if (fee.month) return fee.month;
    if (fee.fee_structure?.month) return fee.fee_structure.month;
    if (fee.frequency) return fee.frequency;
    if (fee.fee_structure?.frequency) return fee.fee_structure.frequency;
    return null;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      <PageHeader
        title="Finance"
        subtitle="View and manage your children's fees and payments"
        breadcrumbs={["Parent", "Finance"]}
        bgColor="bg-parent-light"
      />

      {/* ─── Fee Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Wallet size={18} />
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{formatCurrency(feeSummary?.total)}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <CheckCircle2 size={18} />
            <p className="text-xs text-gray-500">Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(feeSummary?.paid)}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Clock size={18} />
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(feeSummary?.pending)}</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-rose-600">
            <TrendingDown size={18} />
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(feeSummary?.overdue)}</p>
        </Card>
      </div>

      {/* ─── Fee Schedule ────────────────────────────────────────────────── */}
      <Card>
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Fee Schedule</h3>
          {!fees || fees.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">No fees found for the selected child.</p>
              <p className="text-sm text-gray-400 mt-1">All fees are up to date.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-text-primary">{getFeeStructureName(fee)}</p>
                      {getStatusBadge(fee.status)}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-secondary">
                      <span>Due: {formatDate(fee.due_date)}</span>
                      {getFeeMonth(fee) && <span>Month: {getFeeMonth(fee)}</span>}
                      {fee.student_name && (
                        <span className="text-blue-600">Student: {fee.student_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-lg font-semibold text-text-primary">
                      {formatCurrency(fee.amount)}
                    </span>
                    {fee.status?.toLowerCase() !== "paid" && fee.status?.toLowerCase() !== "cancelled" && (
                      <Button
                        size="sm"
                        tone="student"
                        onClick={() => handlePayment(fee)}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5"
                      >
                        {isProcessing && selectedFee?.id === fee.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CreditCard size={14} />
                        )}
                        {isProcessing && selectedFee?.id === fee.id ? "Processing..." : "Pay Now"}
                      </Button>
                    )}
                    {fee.status?.toLowerCase() === "paid" && (
                      <span className="text-sm text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ─── Fee Structures ───────────────────────────────────────────────── */}
      {feeStructures && feeStructures.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Fee Structures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeStructures.map((structure) => (
                <div key={structure.id} className="rounded-lg border border-gray-100 p-4 shadow-sm">
                  <p className="font-medium text-text-primary">{structure.title || "Structure"}</p>
                  {structure.class_name && (
                    <p className="text-sm text-gray-500">Class: {structure.class_name}</p>
                  )}
                  <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(structure.amount)}</p>
                  <p className="text-sm text-text-secondary">{structure.frequency || "Monthly"}</p>
                  {structure.description && (
                    <p className="text-xs text-gray-400 mt-1">{structure.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ─── Payment History ───────────────────────────────────────────────── */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Payment History</h3>
            {payments && payments.length > 0 && (
              <div className="relative w-full sm:w-40">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="all">All Months</option>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {!payments || filteredPayments.length === 0 ? (
            <div className="py-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-secondary">No payment history found.</p>
              <p className="text-sm text-gray-400 mt-1">Your payments will appear here once you make a payment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-full align-middle">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Receipt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(payment.payment_date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {payment.fee_title || payment.description || "Fee Payment"}
                          {payment.student_name && (
                            <span className="block text-xs text-gray-400">Student: {payment.student_name}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {formatCurrency(payment.amount_paid || payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {payment.payment_method || "Online"}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                        <td className="px-4 py-3">
                          {payment.receipt_no ? (
                            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                              <Download size={14} />
                              Receipt
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ─── Stripe Payment Modal ───────────────────────────────────────── */}
      <StripePaymentModal
        open={showPaymentModal}
        clientSecret={clientSecret}
        onClose={() => {
          setShowPaymentModal(false);
          setClientSecret("");
          setSelectedFee(null);
          setIsProcessing(false);
        }}
        onSuccess={() => {
          setShowPaymentModal(false);
          setClientSecret("");
          setSelectedFee(null);
          setIsProcessing(false);
          // Refresh data
          if (selectedChild) {
            dispatch(fetchFees({ student_id: selectedChild }));
            dispatch(fetchFeeSummary({ student_id: selectedChild }));
            dispatch(fetchPayments({ student_id: selectedChild }));
          }
          alert("Payment successful!");
        }}
      />
    </div>
  );
};

export default ParentFinance;