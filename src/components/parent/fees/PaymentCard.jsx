// src/components/parent/fees/PaymentCard.jsx
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Lock, Shield, CheckCircle, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { selectSelectedFee, selectPaymentIntent } from '@/modules/parent/store/parentSlice';
import { createPaymentIntent, clearPaymentIntent } from '@/modules/parent/store/parentThunks';

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const PaymentCard = () => {
  const dispatch = useDispatch();
  const selectedFee = useSelector(selectSelectedFee);
  const paymentIntent = useSelector(selectPaymentIntent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = useCallback(async () => {
    if (!selectedFee) {
      setError('Please select a fee to pay');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await dispatch(createPaymentIntent({
        fee_id: selectedFee.id,
        amount: selectedFee.amount,
        currency: 'PKR'
      })).unwrap();

      setSuccess(true);
      // In a real implementation, you would redirect to Stripe checkout
      // or use Stripe Elements to collect payment details
      console.log('Payment intent created:', result);
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dispatch, selectedFee]);

  const handleClearSelection = useCallback(() => {
    dispatch(clearPaymentIntent());
    setSuccess(false);
    setError(null);
  }, [dispatch]);

  return (
    <Card id="payment-card" className="p-4 md:p-6 border-l-4 border-l-emerald-500 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-emerald-600" />
        <h3 className="text-base md:text-lg font-semibold text-gray-800">Make Payment</h3>
      </div>

      {selectedFee ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Fee Title</span>
              <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                {selectedFee.fee_title || 'Fee Invoice'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(selectedFee.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">Due Date</span>
              <span className="text-sm font-medium text-gray-800">
                {selectedFee.due_date ? new Date(selectedFee.due_date).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : '—'}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">Payment initiated successfully!</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              onClick={handlePayment}
              disabled={loading || success}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Paid
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                </>
              )}
            </button>

            {(selectedFee || success) && (
              <button
                onClick={handleClearSelection}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                {success ? 'Clear' : 'Cancel'}
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Secure
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Encrypted
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Select a fee invoice to make a payment</p>
          <p className="text-xs text-gray-400 mt-1">Click the payment icon next to any invoice</p>
        </div>
      )}
    </Card>
  );
};

export default PaymentCard;