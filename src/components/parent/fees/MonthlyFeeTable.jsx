// src/components/parent/fees/MonthlyFeeTable.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, X, Eye, CreditCard, Calendar, DollarSign } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/admin/Pagination';
import { selectFees, selectSelectedChild } from '@/modules/parent/store/parentSlice';
import { setSelectedFee } from '@/modules/parent/store/parentThunks';

const ITEMS_PER_PAGE = 10;

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const MonthlyFeeTable = () => {
  const dispatch = useDispatch();
  const fees = useSelector(selectFees);
  const selectedChild = useSelector(selectSelectedChild);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filteredFees = useMemo(() => {
    let filtered = fees;

    // Filter by selected child
    if (selectedChild) {
      filtered = filtered.filter(f => f.student === selectedChild || f.student_id === selectedChild);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.fee_title?.toLowerCase().includes(search) ||
        f.fee_description?.toLowerCase().includes(search) ||
        f.student_name?.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(f => f.status === filterStatus);
    }

    return filtered;
  }, [fees, selectedChild, searchTerm, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredFees.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredFees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ──────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('All');
    setCurrentPage(1);
  }, []);

  const handlePayFee = useCallback((fee) => {
    dispatch(setSelectedFee(fee));
    // Scroll to payment card
    const paymentCard = document.getElementById('payment-card');
    if (paymentCard) {
      paymentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [dispatch]);

  // ─── Helper Functions ──────────────────────────────────────────
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return status;
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

  return (
    <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Monthly Fee Invoices
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:flex-none relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-48 pl-9 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs md:text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-xs md:text-sm min-w-[100px]"
              >
                <option value="All">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              {(searchTerm || filterStatus !== 'All') && (
                <button onClick={clearFilters} className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                  <X className="w-3 h-3 md:w-3.5 md:h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        {pageItems.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-500 font-medium">No fee invoices found</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  {searchTerm || filterStatus !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Fee invoices will appear here when generated'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {pageItems.map((fee) => (
                <div key={fee.id} className="p-4 hover:bg-emerald-50/30 transition-colors border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{fee.fee_title || 'Fee Invoice'}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge className={`${getStatusBadge(fee.status)} text-[10px]`}>
                          {getStatusLabel(fee.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatDate(fee.due_date)}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mt-1">{formatCurrency(fee.amount)}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handlePayFee(fee)}
                        disabled={fee.status === 'paid'}
                        className={`p-2 rounded-lg transition-all ${fee.status === 'paid' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-emerald-50 text-emerald-600'}`}
                        title="Pay now"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Title</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((fee) => (
                    <tr key={fee.id} className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[150px]">
                            {fee.fee_title || 'Fee Invoice'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800">{formatCurrency(fee.amount)}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(fee.due_date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getStatusBadge(fee.status)} text-xs whitespace-nowrap`}>
                          {getStatusLabel(fee.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handlePayFee(fee)}
                            disabled={fee.status === 'paid'}
                            className={`p-2 rounded-lg transition-all ${fee.status === 'paid' ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-emerald-50 text-emerald-600'}`}
                            title="Pay now"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {filteredFees.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsShown={pageItems.length}
          totalItems={filteredFees.length}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default MonthlyFeeTable;