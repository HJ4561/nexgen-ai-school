// src/components/parent/fees/PaymentHistory.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { History, Download, Eye, CheckCircle, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { selectPayments, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const PaymentHistory = () => {
  const payments = useSelector(selectPayments);
  const selectedChild = useSelector(selectSelectedChild);

  // Filter payments by selected child
  const filteredPayments = useMemo(() => {
    let filtered = payments;
    if (selectedChild) {
      filtered = payments.filter(p => p.student === selectedChild || p.student_id === selectedChild);
    }
    return filtered.slice(0, 5); // Show last 5 payments
  }, [payments, selectedChild]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  if (filteredPayments.length === 0) {
    return (
      <Card className="p-4 md:p-6 text-center border border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <History className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-500">No payment history found</p>
          <p className="text-xs text-gray-400">Payments will appear here once made</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Payments</h3>
        </div>
        <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {filteredPayments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-2"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <History className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {payment.payment_method || 'Online Payment'}
                </p>
                <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {formatCurrency(payment.amount_paid)}
                </p>
                <Badge className={`${getStatusBadge(payment.status)} text-[10px] flex items-center gap-1`}>
                  {getStatusIcon(payment.status)}
                  {payment.status || 'Completed'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {payment.receipt_url && (
                  <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Download receipt">
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="View details">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PaymentHistory;