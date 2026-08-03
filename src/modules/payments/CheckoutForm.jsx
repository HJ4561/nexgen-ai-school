/**
 * ============================================
 * CHECKOUT FORM COMPONENT
 * ============================================
 * 
 * Purpose: Stripe payment checkout form for processing payments
 * Used by: StripePaymentModal and payment flows
 * 
 * Features:
 * - Stripe PaymentElement integration
 * - Secure payment processing
 * - Loading state during payment
 * - Error handling with user feedback
 * - Amount display with PKR currency
 * - Security indicators
 * - Payment success callback
 * 
 * Dependencies:
 * - @stripe/react-stripe-js for Stripe integration
 * - lucide-react for icons
 * - @/components/ui/Button for action buttons
 * 
 * Usage:
 * <CheckoutForm
 *   amount={5000}
 *   onSuccess={handlePaymentSuccess}
 * />
 * ============================================
 */

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import {
  ShieldCheck,
  Lock,
  CreditCard,
} from "lucide-react";

import Button from '@/components/ui/Button';

/**
 * ============================================
 * CHECKOUT FORM COMPONENT
 * ============================================
 * 
 * Renders a Stripe checkout form with secure payment processing
 * 
 * @param {Object} props - Component props
 * @param {number|string} props.amount - Amount to be charged (in PKR)
 * @param {Function} props.onSuccess - Callback function when payment succeeds
 * @returns {JSX.Element} Checkout form UI
 * 
 * @example
 * // Basic usage
 * <CheckoutForm
 *   amount={5000}
 *   onSuccess={(paymentIntent) => {
 *     console.log('Payment successful:', paymentIntent);
 *   }}
 * />
 * 
 * @example
 * // Used in StripePaymentModal
 * <Elements stripe={stripePromise} options={options}>
 *   <CheckoutForm
 *     amount={selectedFee.amount}
 *     onSuccess={() => handlePaymentSuccess()}
 *   />
 * </Elements>
 * ============================================
 */
function CheckoutForm({
  amount,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();

  // ─── State Management ──────────────────────────────────────────────────

  /**
   * ============================================
   * STATE
   * ============================================
   * 
   * - loading: Indicates payment processing state
   * - error: Error message to display to the user
   */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Handlers ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * HANDLE SUBMIT
   * ============================================
   * 
   * Processes the payment:
   * 1. Validates Stripe and elements are available
   * 2. Sets loading state
   * 3. Confirms payment with Stripe
   * 4. Handles errors if payment fails
   * 5. Calls onSuccess callback if payment succeeds
   * 
   * @param {Object} e - Form submit event
   * @returns {Promise<void>}
   * 
   * @example
   * // Triggered when user clicks "Pay Securely" button
   * // Payment intent is confirmed with Stripe
   * // On success, the modal closes and fees refresh
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't proceed if Stripe or elements are not available
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    // Handle payment error
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Handle successful payment
    if (paymentIntent?.status === "succeeded") {
      onSuccess?.(paymentIntent);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
            <CreditCard size={22} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Stripe Secure Checkout
            </h3>
            <p className="text-sm text-slate-500">
              Your payment is encrypted and protected.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Amount Display ────────────────────────────────────────────── */}
      {amount && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm text-slate-500">Amount to Pay</p>
          <h2 className="mt-1 text-3xl font-bold text-green-700">
            PKR {Number(amount).toLocaleString()}
          </h2>
        </div>
      )}

      {/* ─── Stripe Payment Element ────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <PaymentElement />
      </div>

      {/* ─── Error Display ──────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}

      {/* ─── Security Notice ────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
        <ShieldCheck className="text-green-600" size={22} />

        <div>
          <p className="font-medium text-slate-700">Secure Payment</p>
          <p className="text-sm text-slate-500">
            Your card information is never stored on our servers.
          </p>
        </div>
      </div>

      {/* ─── Submit Button ──────────────────────────────────────────────── */}
      <Button
        type="submit"
        fullWidth
        loading={loading}
        disabled={!stripe || loading}
        leftIcon={<Lock size={18} />}
        className="h-12"
      >
        {loading ? "Processing Payment..." : "Pay Securely"}
      </Button>
    </form>
  );
}

export default CheckoutForm;