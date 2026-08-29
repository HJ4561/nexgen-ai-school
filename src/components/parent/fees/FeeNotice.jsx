// src/components/parent/fees/FeeNotice.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle, Bell, Calendar, DollarSign } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

const FeeNotice = () => {
  const fees = useSelector(selectFees);
  const selectedChild = useSelector(selectSelectedChild);

  // Filter fees by selected child
  const childFees = useMemo(() => {
    let filtered = fees;
    if (selectedChild) {
      filtered = fees.filter(f => f.student === selectedChild || f.student_id === selectedChild);
    }
    return filtered;
  }, [fees, selectedChild]);

  const overdueFees = useMemo(() => {
    return childFees.filter(f => f.status === 'overdue');
  }, [childFees]);

  const pendingFees = useMemo(() => {
    return childFees.filter(f => f.status === 'pending');
  }, [childFees]);

  const upcomingFees = useMemo(() => {
    const now = new Date();
    const future = new Date(now);
    future.setDate(now.getDate() + 7);
    return childFees.filter(f => {
      if (f.status === 'paid' || f.status === 'overdue') return false;
      if (!f.due_date) return false;
      const dueDate = new Date(f.due_date);
      return dueDate >= now && dueDate <= future;
    });
  }, [childFees]);

  if (overdueFees.length === 0 && pendingFees.length === 0 && upcomingFees.length === 0) {
    return (
      <Card className="p-4 md:p-6 border border-emerald-100 bg-emerald-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-emerald-100">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">All fees are up to date!</p>
            <p className="text-sm text-gray-500">No pending or overdue fees for your child.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 border border-amber-200 bg-amber-50/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-amber-100 shrink-0">
          <Bell className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800">Payment Reminder</h4>
          <div className="space-y-2 mt-2">
            {overdueFees.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-700">
                    {overdueFees.length} overdue invoice{overdueFees.length > 1 ? 's' : ''}
                  </span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {formatCurrency(overdueFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0))}
                </Badge>
              </div>
            )}

            {pendingFees.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-700">
                    {pendingFees.length} pending invoice{pendingFees.length > 1 ? 's' : ''}
                  </span>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  {formatCurrency(pendingFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0))}
                </Badge>
              </div>
            )}

            {upcomingFees.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">
                    {upcomingFees.length} invoice{upcomingFees.length > 1 ? 's' : ''} due soon
                  </span>
                </div>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {formatCurrency(upcomingFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0))}
                </Badge>
              </div>
            )}
          </div>

          {(overdueFees.length > 0 || pendingFees.length > 0) && (
            <p className="text-xs text-gray-500 mt-3">
              Please make payments before the due date to avoid late fees.
              {overdueFees.length > 0 && ' Late fees have been applied to overdue invoices.'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeeNotice;