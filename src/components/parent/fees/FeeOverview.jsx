// src/components/parent/fees/FeeOverview.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, Wallet, CreditCard, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { selectFees, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const FeeOverview = () => {
  const fees = useSelector(selectFees);
  const selectedChild = useSelector(selectSelectedChild);

  const stats = useMemo(() => {
    // Filter fees by selected child
    let filteredFees = fees;
    if (selectedChild) {
      filteredFees = fees.filter(f => f.student === selectedChild || f.student_id === selectedChild);
    }

    const total = filteredFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const paid = filteredFees
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const pending = filteredFees
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const overdue = filteredFees
      .filter(f => f.status === 'overdue')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const totalInvoices = filteredFees.length;
    const paidInvoices = filteredFees.filter(f => f.status === 'paid').length;
    const pendingInvoices = filteredFees.filter(f => f.status === 'pending' || f.status === 'overdue').length;

    return {
      total,
      paid,
      pending,
      overdue,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      percentage: total > 0 ? Math.round((paid / total) * 100) : 0,
    };
  }, [fees, selectedChild]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fee</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0.5 md:mt-1">{formatCurrency(stats.total)}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.totalInvoices} invoices</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 md:mt-1">{formatCurrency(stats.paid)}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.percentage}% paid</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-0.5 md:mt-1">{formatCurrency(stats.pending)}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.pendingInvoices} invoices</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
            <p className="text-xl md:text-2xl font-bold text-red-600 mt-0.5 md:mt-1">{formatCurrency(stats.overdue)}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Needs attention</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeeOverview;