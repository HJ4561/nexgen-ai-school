// src/components/admin/FeeDetailDrawer/index.jsx
import React, { useState } from "react";
import { X, Calendar, CreditCard, Receipt } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount || 0);

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

const STATUS_BADGE = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
  waived: "bg-gray-100 text-gray-700 border-gray-200",
};

const FeeDetailDrawer = ({ fee, onRecordPayment, onClose }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payment, setPayment] = useState({
    amount_paid: fee.balance || "",
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: "cash",
    transaction_id: "",
    receipt_no: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError(null);
    if (!payment.amount_paid || Number(payment.amount_paid) <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    setSubmitting(true);
    try {
      await onRecordPayment({ ...payment, amount_paid: Number(payment.amount_paid) });
      setShowPaymentForm(false);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Couldn't record payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Fee Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Fee Summary */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-800">{fee.studentName}</p>
                <p className="text-sm text-gray-500">{fee.studentEmail}</p>
              </div>
              <Badge className={STATUS_BADGE[fee.status] || "bg-gray-100 text-gray-700"}>
                {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold text-gray-800">{formatCurrency(fee.amount)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600">Paid</p>
                <p className="font-semibold text-green-700">{formatCurrency(fee.paidAmount)}</p>
              </div>
              <div className={`rounded-xl p-3 ${fee.balance > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-xs ${fee.balance > 0 ? "text-red-600" : "text-gray-500"}`}>Balance</p>
                <p className={`font-semibold ${fee.balance > 0 ? "text-red-700" : "text-gray-800"}`}>
                  {formatCurrency(fee.balance)}
                </p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
              <Calendar className="w-3.5 h-3.5" /> Due{" "}
              {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : "—"}
              {fee.isOverdue && <span className="text-red-600 font-medium ml-1">(Overdue)</span>}
            </p>
          </div>

          {/* Record Payment */}
          {fee.balance > 0 && (
            <div>
              {!showPaymentForm ? (
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => setShowPaymentForm(true)}
                >
                  <CreditCard className="w-4 h-4" />
                  Record a Payment
                </Button>
              ) : (
                <form onSubmit={handleRecordPayment} className="space-y-3 border border-gray-100 rounded-xl p-4">
                  {error && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                      <input
                        type="number"
                        min="0"
                        max={fee.balance}
                        value={payment.amount_paid}
                        onChange={(e) => setPayment({ ...payment, amount_paid: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                      <input
                        type="date"
                        value={payment.payment_date}
                        onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
                      <select
                        value={payment.payment_method}
                        onChange={(e) => setPayment({ ...payment, payment_method: e.target.value })}
                        className={inputClass}
                      >
                        <option value="cash">Cash</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="online">Online</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Receipt No.</label>
                      <input
                        type="text"
                        value={payment.receipt_no}
                        onChange={(e) => setPayment({ ...payment, receipt_no: e.target.value })}
                        className={inputClass}
                        placeholder="RCPT-0003"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentForm(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Save Payment"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Payment History */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Payment History</p>
            {fee.payments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {fee.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{formatCurrency(p.amount_paid)}</p>
                        <p className="text-xs text-gray-500">
                          {p.payment_date ? new Date(p.payment_date).toLocaleDateString() : "—"} • {p.payment_method}
                          {p.receipt_no ? ` • ${p.receipt_no}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeDetailDrawer;