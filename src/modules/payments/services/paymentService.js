/**
 * ============================================
 * PAYMENT SERVICE
 * ============================================
 * 
 * Purpose: Handles all payment-related API calls
 * Used by: paymentThunks and payment components
 * 
 * Features:
 * - Stripe payment intent creation
 * - Secure payment processing
 * - Fee payment handling
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * 
 * API Endpoints:
 * - /finance/stripe/create-payment-intent
 * 
 * Usage:
 * import paymentService from '@/modules/payments/services/paymentService';
 * 
 * const intent = await paymentService.createPaymentIntent({ fee_id: 1 });
 * ============================================
 */

import api from "@/services/api";

/**
 * ============================================
 * PAYMENT SERVICE
 * ============================================
 * 
 * Service object containing all payment-related API methods
 */
const paymentService = {
  /**
   * ============================================
   * CREATE PAYMENT INTENT
   * ============================================
   * 
   * Creates a Stripe payment intent for processing a fee payment
   * 
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.fee_id - ID of the fee being paid
   * @param {number} paymentData.amount - Optional amount (defaults to fee amount)
   * @param {string} paymentData.currency - Currency code (default: 'usd')
   * @param {string} paymentData.payment_method_types - Array of payment method types
   * @returns {Promise<Object>} Payment intent with client_secret and id
   * @throws {Error} If the request fails
   * 
   * @example
   * // Create payment intent for a fee
   * const intent = await paymentService.createPaymentIntent({
   *   fee_id: 1,
   *   amount: 5000,
   *   currency: 'usd'
   * });
   * 
   * console.log(intent.client_secret); // Used for Stripe confirmation
   * console.log(intent.id); // Payment intent ID
   * 
   * @example
   * // Using with Redux thunk
   * dispatch(createPaymentIntent({ fee_id: 1 }))
   *   .unwrap()
   *   .then(intent => {
   *     // Open Stripe modal with client_secret
   *     setClientSecret(intent.client_secret);
   *   })
   *   .catch(error => console.error(error));
   */
  createPaymentIntent: async (paymentData) => {
    console.log("Sending payment data:", paymentData);

    const { data } = await api.post(
      "/finance/stripe/create-payment-intent",
      paymentData
    );

    console.log("Payment intent response:", data);

    return data;
  },
};

export default paymentService;