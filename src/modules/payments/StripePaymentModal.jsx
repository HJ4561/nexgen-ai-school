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
}) {
  // ─── Early return if no client secret ──────────────────────────────
  // Prevents rendering the modal without a valid payment intent
  if (!clientSecret) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Secure Payment"
      size="md"
    >
      {/* ─── Stripe Provider ──────────────────────────────────────────── */}
      {/* Provides Stripe context to the CheckoutForm */}
      <StripeProvider clientSecret={clientSecret}>
        {/* ─── Checkout Form ──────────────────────────────────────────── */}
        {/* Renders the payment form with PaymentElement */}
        <CheckoutForm onSuccess={onSuccess} />
      </StripeProvider>
    </Modal>
  );
}

export default StripePaymentModal;