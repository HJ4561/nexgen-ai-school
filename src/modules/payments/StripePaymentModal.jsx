/**
 * ============================================
 * STRIPE PAYMENT MODAL COMPONENT
 * ============================================
 * 
 * Purpose: Modal wrapper for Stripe payment processing
 * Used by: Various payment flows (fees, etc.)
 * 
 * Features:
 * - Modal container with overlay
 * - StripeProvider integration
 * - CheckoutForm for payment processing
 * - Client secret validation
 * - Success callback handling
 * - Responsive modal size
 * 
 * Dependencies:
 * - @/components/ui/Modal for modal container
 * - StripeProvider for Stripe context
 * - CheckoutForm for payment UI
 * 
 * Usage:
 * <StripePaymentModal
 *   open={showStripe}
 *   clientSecret={clientSecret}
 *   onClose={() => setShowStripe(false)}
 *   onSuccess={handlePaymentSuccess}
 * />
 * ============================================
 */

import React, { useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import StripeProvider from "./StripeProvider";
import CheckoutForm from "./CheckoutForm";

/**
 * ============================================
 * STRIPE PAYMENT MODAL COMPONENT
 * ============================================
 * 
 * Renders a modal for Stripe payment processing
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {string} props.clientSecret - Stripe payment intent client secret
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {Function} props.onSuccess - Callback function when payment succeeds
 * @param {Function} props.onError - Callback function when payment fails
 * @param {number|string} props.amount - Amount to be charged (optional)
 * @param {Object} props.paymentIntent - Payment intent object (optional)
 * @returns {JSX.Element|null} Stripe payment modal or null if no clientSecret
 * 
 * @example
 * // In a payment component
 * const [showStripe, setShowStripe] = useState(false);
 * const [clientSecret, setClientSecret] = useState('');
 * 
 * const handlePayment = async () => {
 *   const response = await createPaymentIntent({ fee_id: 1 });
 *   setClientSecret(response.client_secret);
 *   setShowStripe(true);
 * };
 * 
 * <StripePaymentModal
 *   open={showStripe}
 *   clientSecret={clientSecret}
 *   onClose={() => {
 *     setShowStripe(false);
 *     setClientSecret('');
 *   }}
 *   onSuccess={() => {
 *     setShowStripe(false);
 *     setClientSecret('');
 *     dispatch(fetchFees());
 *     dispatch(fetchPayments());
 *     alert('Payment Successful');
 *   }}
 * />
 * 
 * @example
 * // Using with selected fee
 * <StripePaymentModal
 *   open={isPaymentModalOpen}
 *   clientSecret={stripeClientSecret}
 *   onClose={handleModalClose}
 *   onSuccess={handlePaymentSuccess}
 * />
 * ============================================
 */
function StripePaymentModal({
  open,
  clientSecret,
  onClose,
  onSuccess,
  onError,
  amount,
  paymentIntent,
}) {
  // ─── Early return if no client secret ──────────────────────────────
  // Prevents rendering the modal without a valid payment intent
  if (!clientSecret) return null;

  // ─── Handlers ──────────────────────────────────────────────────────────

  /**
   * ============================================
   * HANDLE SUCCESS
   * ============================================
   * 
   * Called when payment is successful
   * Calls onSuccess callback and optionally closes the modal
   * 
   * @param {Object} intent - Payment intent object from Stripe
   */
  const handleSuccess = useCallback((intent) => {
    if (onSuccess) {
      onSuccess(intent);
    }
  }, [onSuccess]);

  /**
   * ============================================
   * HANDLE ERROR
   * ============================================
   * 
   * Called when payment fails
   * Calls onError callback
   * 
   * @param {Object} error - Error object from Stripe
   */
  const handleError = useCallback((error) => {
    if (onError) {
      onError(error);
    }
  }, [onError]);

  /**
   * ============================================
   * HANDLE CLOSE
   * ============================================
   * 
   * Called when modal is closed
   * Calls onClose callback
   */
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Secure Payment"
      size="md"
      description="Complete your payment securely using Stripe"
    >
      {/* ─── Stripe Provider ──────────────────────────────────────────── */}
      {/* Provides Stripe context to the CheckoutForm */}
      <StripeProvider clientSecret={clientSecret}>
        {/* ─── Checkout Form ──────────────────────────────────────────── */}
        {/* Renders the payment form with PaymentElement */}
        <CheckoutForm
          amount={amount}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
          paymentIntent={paymentIntent}
        />
      </StripeProvider>
    </Modal>
  );
}

export default StripePaymentModal;