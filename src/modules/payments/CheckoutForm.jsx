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

import React, { useState, useCallback } from "react";
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
 * @param {Function} props.onError - Callback function when payment fails
 * @param {Function} props.onClose - Callback function to close modal
 * @param {Object} props.paymentIntent - Payment intent object (optional)
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
  onError,
  onClose,
  paymentIntent,
}) {
  const stripe = useStripe();
  const elements = useElements();

  // ─── State Management ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle | processing | succeeded | failed

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
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Don't proceed if Stripe or elements are not available
    if (!stripe || !elements) {
      setError("Payment system is not initialized. Please try again.");
      setPaymentStatus('failed');
      return;
    }

    setLoading(true);
    setPaymentStatus('processing');
    setError("");

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: intent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      // Handle payment error
      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        setPaymentStatus('failed');
        if (onError) onError(stripeError);
        setLoading(false);
        return;
      }

      // Handle successful payment
      if (intent?.status === "succeeded") {
        setPaymentStatus('succeeded');
        if (onSuccess) onSuccess(intent);
      } else if (intent?.status === "requires_action") {
        // Payment requires additional authentication (3DS)
        setError("Additional authentication is required. Please follow the prompts.");
        setPaymentStatus('processing');
        setLoading(false);
        return;
      } else {
        setError("Payment status: " + (intent?.status || "Unknown"));
        setPaymentStatus('failed');
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setPaymentStatus('failed');
      if (onError) onError(err);
      setLoading(false);
    }
  }, [stripe, elements, onSuccess, onError]);

  /**
   * ============================================
   * FORMAT CURRENCY
   * ============================================
   * 
   * Formats the amount in PKR currency with proper locale support
   */
  const formatCurrency = useCallback((value) => {
    if (!value) return "0";
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return "0";
    return num.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }, []);

  /**
   * ============================================
   * HANDLE CLOSE
   * ============================================
   * 
   * Called when user cancels or closes the form
   */
  const handleClose = useCallback(() => {
    if (paymentStatus === 'processing') {
      // Optionally show a confirmation dialog before closing during processing
      if (window.confirm('Payment is in progress. Are you sure you want to cancel?')) {
        if (onClose) onClose();
      }
    } else {
      if (onClose) onClose();
    }
  }, [onClose, paymentStatus]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
            <CreditCard size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
              Stripe Secure Checkout
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Your payment is encrypted and protected.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Amount Display ────────────────────────────────────────────── */}
      {amount && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-5">
          <p className="text-xs sm:text-sm text-slate-500">Amount to Pay</p>
          <h2 className="mt-0.5 sm:mt-1 text-2xl sm:text-3xl font-bold text-green-700 break-words">
            PKR {formatCurrency(amount)}
          </h2>
        </div>
      )}

      {/* ─── Stripe Payment Element ────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <PaymentElement 
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
          }}
        />
      </div>

      {/* ─── Error Display ──────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="text-sm font-medium text-red-600 break-words">{error}</p>
        </div>
      )}

      {/* ─── Payment Status ────────────────────────────────────────────── */}
      {paymentStatus === 'succeeded' && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 sm:p-4">
          <p className="text-sm font-medium text-green-700 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Payment successful!
          </p>
        </div>
      )}

      {/* ─── Security Notice ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 sm:p-4">
        <ShieldCheck className="text-green-600 shrink-0 mt-0.5" size={18} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-700">Secure Payment</p>
          <p className="text-xs sm:text-sm text-slate-500">
            Your card information is never stored on our servers.
          </p>
        </div>
      </div>

      {/* ─── Action Buttons ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 order-2 sm:order-1"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!stripe || loading || paymentStatus === 'succeeded'}
          className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : paymentStatus === 'succeeded' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Paid
            </>
          ) : (
            <>
              <Lock size={16} />
              Pay Securely
            </>
          )}
        </button>
      </div>

      {/* ─── Footer Note ────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-400">
        <p>Powered by Stripe • Secure • PCI compliant</p>
      </div>
    </form>
  );
}

export default CheckoutForm;