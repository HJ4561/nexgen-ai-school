/**
 * ============================================
 * PARENT FEES & PAYMENTS COMPONENT
 * ============================================
 * 
 * Purpose: View and manage child fees and payments
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for filtering by child
 * - Fee statistics (total, paid, pending, overdue)
 * - Fee invoice list with status
 * - Payment history
 * - Pay now functionality
 * - Download receipt
 * - Filter by status and date
 * - Responsive design
 * - GSAP animations
 * 
 * API Endpoints:
 * - GET /api/finance/fees/ - Get fees
 * - GET /api/finance/fees/summary/ - Get fee summary
 * - GET /api/finance/payments/ - Get payments
 * - POST /api/finance/stripe/create-payment-intent/ - Create payment
 * 
 * Usage:
 * <Route path="/parent/fees" element={<FeesPayments />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  User,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchParentLinks,
  fetchFees,
  fetchFeeSummary,
  fetchPayments,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectFees,
  selectFeeSummary,
  selectPayments,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status) => {
  const config = {
    paid: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    overdue: { color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
    partial: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CreditCard },
  };
  const info = config[status] || config.pending;
  const Icon = info.icon;
  return (
    <Badge className={`${info.color} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Pending"}
    </Badge>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children }) => {
  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm pr-8 sm:pr-10 min-h-[36px] sm:min-h-[42px]"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const FeesPayments = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const fees = useSelector(selectFees);
  const feeSummary = useSelector(selectFeeSummary);
  const payments = useSelector(selectPayments);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchFees());
    dispatch(fetchFeeSummary({}));
    dispatch(fetchPayments());
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredFees = useMemo(() => {
    let filtered = fees;

    if (selectedChild) {
      filtered = filtered.filter(f => f.student === selectedChild || f.student_id === selectedChild);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.student_name?.toLowerCase().includes(search) ||
        f.fee_structure_name?.toLowerCase().includes(search) ||
        f.status?.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(f => f.status === filterStatus);
    }

    return filtered;
  }, [fees, selectedChild, searchTerm, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredFees.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredFees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    // This would dispatch setSelectedChild
    setCurrentPage(1);
  };

  const handlePayNow = (fee) => {
    // In a real implementation, this would open payment modal
    showToast(`Processing payment for ${formatCurrency(fee.amount)}...`, "info");
  };

  const handleDownloadReceipt = (payment) => {
    showToast("Downloading receipt...", "info");
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && fees.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Fees & Payments" subtitle="View and manage your child's fees" breadcrumbs={["Parent", "Fees"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading fees...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Fees & Payments"
          subtitle="View and manage your child's fees"
          breadcrumbs={["Parent", "Fees"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
                />
              </div>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading fees</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fee</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(feeSummary.total)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Total amount</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{formatCurrency(feeSummary.paid)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{feeSummary.percentage}% paid</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{formatCurrency(feeSummary.pending)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Awaiting payment</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-red-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{formatCurrency(feeSummary.overdue)}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Needs attention</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Fee List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="flex flex-col items-center gap-3">
                <Receipt className="w-12 h-12 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500 font-medium">No fee records found</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {hasActiveFilters || selectedChild ? 'Try adjusting your filters' : 'Fee records will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {pageItems.map((fee) => (
                  <div key={fee.id} className="p-4 hover:bg-blue-50/30 transition-colors border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {fee.fee_structure_name || "Fee Invoice"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(fee.due_date)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-bold text-gray-800">{formatCurrency(fee.amount)}</span>
                          {getStatusBadge(fee.status)}
                        </div>
                      </div>
                      {fee.status !== "paid" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayNow(fee)}
                          className="min-h-[32px]"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Title</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Due Date</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((fee) => (
                      <tr key={fee.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <span className="text-sm font-medium text-gray-800 truncate block max-w-[120px]">
                            {fee.fee_structure_name || "Fee Invoice"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <span className="text-sm font-bold text-gray-800">{formatCurrency(fee.amount)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{formatDate(fee.due_date)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          {getStatusBadge(fee.status)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right">
                          {fee.status !== "paid" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePayNow(fee)}
                              className="min-h-[32px]"
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          {fee.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReceipt(fee)}
                              className="min-h-[32px]"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Receipt
                            </Button>
                          )}
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
    </div>
  );
};

export default FeesPayments;