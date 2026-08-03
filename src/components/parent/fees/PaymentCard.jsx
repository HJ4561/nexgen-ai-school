/**
 * ============================================
 * PAYMENT CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays payment details and processes fee payments
 * Features:
 * - Fee details display (month, payable, paid, remaining)
 * - Due date display
 * - Stripe payment integration
 * - Secure payment gateway badge
 * - Loading state during payment
 * - Success handling with fee/payment refresh
 * - Empty state when no fee is selected
 * - Role-based theming (parent)
 * - Sticky positioning
 * 
 * Dependencies:
 * - lucide-react for icons (Wallet, CalendarDays, BadgeDollarSign, ShieldCheck, CreditCard)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action button
 * - @/modules/payments/StripePaymentModal for payment processing
 * - @/modules/parent/store/parentThunks for API calls
 * - react-redux for state management
 * 
 * Usage:
 * <PaymentCard />
 * ============================================
 */

import { useDispatch, useSelector } from "react-redux";
import {
  Wallet,
  CalendarDays,
  BadgeDollarSign,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StripePaymentModal from "@/modules/payments/StripePaymentModal";
import { createPaymentIntent } from "@/modules/parent/store/parentThunks";
import {
  fetchFees,
  fetchPayments,
} from "@/modules/parent/store/parentThunks";

/**
 * ============================================
 * PAYMENT CARD COMPONENT
 * ============================================
 * 
 * Renders a payment card for fee processing
 * 
 * @returns {JSX.Element} Payment card UI
 * 
 * @example
 * // In parent fee management
 * <PaymentCard />
 * ============================================
 */
const PaymentCard = () => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves selectedFee and loading from Redux store
   */
  const { selectedFee, loading } = useSelector(
    (state) => state.parent
  );

  /**
   * ============================================
   * STRIPE PAYMENT STATE
   * ============================================
   * 
   * - clientSecret: Stripe payment intent client secret
   * - showStripe: Controls Stripe modal visibility
   */
  const [clientSecret, setClientSecret] = useState("");
  const [showStripe, setShowStripe] = useState(false);

  /**
   * ============================================
   * NO FEE SELECTED
   * ============================================
   * 
   * Displays an empty state when no fee is selected
   * Shows a prompt to select an unpaid fee from the table
   */
  if (!selectedFee) {
    return (
      <Card
        hover={false}
        className="flex min-h-[760px] items-center justify-center"
      >
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-parent-light">
            <Wallet size={42} className="text-parent-primary" />
          </div>

          <h3 className="mt-6 text-2xl font-semibold">
            No Fee Selected
          </h3>

          <p className="mt-3 text-text-secondary">
            Select an unpaid fee from the table to continue with payment.
          </p>
        </div>
      </Card>
    );
  }

  /**
   * ============================================
   * HELPERS
   * ============================================
   * 
   * Utility functions for calculations and formatting
   */

  /**
   * Calculate remaining amount for the selected fee
   */
  const remaining = selectedFee
    ? Number(selectedFee.amount) - Number(selectedFee.amount_paid || 0)
    : 0;

  /**
   * Format amount as PKR currency
   */
  const formatCurrency = (value) =>
    `Rs. ${Number(value).toLocaleString()}`;

  /**
   * ============================================
   * STRIPE PAYMENT HANDLER
   * ============================================
   * 
   * Creates a payment intent and initializes Stripe payment
   * - Dispatches createPaymentIntent with fee_id
   * - Sets client secret on success
   * - Shows Stripe payment modal
   * - Handles errors with user feedback
   */
  const handlePayment = async () => {
    try {
      const response = await dispatch(
        createPaymentIntent({
          fee_id: selectedFee.id,
        })
      ).unwrap();

      console.log("Payment Intent:", response);

      if (!response.client_secret) {
        throw new Error("No client_secret returned from backend.");
      }

      setClientSecret(response.client_secret);
      setShowStripe(true);
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
        error?.message ||
        "Unable to initialize payment."
      );
    }
  };

  return (
    <>
      <Card hover={false} className="sticky top-6">
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="rounded-xl bg-orange-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-600 text-white">
              <CreditCard size={26} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-orange-900">
                Secure Payment
              </h2>
              <p className="text-text-secondary">Powered by Stripe</p>
            </div>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────────────────── */}
        <div className="mt-8 space-y-5">
          {/* ─── Fee Month ─── */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-orange-500" />
              <span className="font-semibold">Fee Month</span>
            </div>
            <span className="font-bold text-orange-800">
              {new Date(selectedFee.month).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </span>
          </div>

          {/* ─── Payable Fee ─── */}
          <div className="flex items-center justify-between rounded-xl bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <BadgeDollarSign className="text-orange-500" />
              <span className="font-semibold">Payable Fee</span>
            </div>
            <span className="font-bold text-orange-800">
              {formatCurrency(selectedFee.amount)}
            </span>
          </div>

          {/* ─── Paid Amount ─── */}
          <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-5">
            <span className="font-semibold">Paid</span>
            <span className="font-bold text-green-700">
              {formatCurrency(selectedFee.amount_paid)}
            </span>
          </div>

          {/* ─── Remaining Amount ─── */}
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-5">
            <span className="font-semibold">Remaining</span>
            <span className="font-bold text-red-600">
              {formatCurrency(remaining)}
            </span>
          </div>

          {/* ─── Due Date ─── */}
          <div className="rounded-xl border border-amber-200 p-5">
            <p className="text-sm text-text-secondary">Due Date</p>
            <p className="mt-2 text-xl font-semibold text-orange-800">
              {new Date(selectedFee.due_date).toLocaleDateString()}
            </p>
          </div>

          {/* ─── Payment Gateway ─── */}
          <div className="rounded-xl border border-amber-200 p-5">
            <p className="mb-4 text-sm font-medium text-text-secondary">
              Payment Gateway
            </p>
            <div className="flex items-center justify-between rounded-xl border border-orange-400 bg-orange-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <CreditCard className="text-orange-600" size={20} />
                <span className="text-lg font-semibold text-orange-700">
                  Stripe
                </span>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Secure
              </span>
            </div>
          </div>

          {/* ─── Pay Button ─── */}
          <Button
            tone="parent"
            size="lg"
            loading={loading}
            leftIcon={<CreditCard size={18} />}
            className="w-full"
            onClick={handlePayment}
          >
            Pay {formatCurrency(remaining)}
          </Button>

          {/* ─── Security Notice ─── */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck size={18} className="mt-1 text-blue-600" />
              <p className="text-sm leading-6 text-blue-700">
                Your payment will be processed securely through Stripe. After
                successful payment your fee status will automatically update.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Stripe Payment Modal ──────────────────────────────────── */}
      <StripePaymentModal
        open={showStripe}
        clientSecret={clientSecret}
        onClose={() => {
          setShowStripe(false);
          setClientSecret("");
        }}
        onSuccess={() => {
          setShowStripe(false);
          setClientSecret("");
          dispatch(fetchFees());
          dispatch(fetchPayments());
          alert("Payment Successful");
        }}
      />
    </>
  );
};

export default PaymentCard;