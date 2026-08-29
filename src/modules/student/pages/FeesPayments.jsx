// src/modules/student/pages/FeesPayments.jsx

/**
 * ============================================
 * STUDENT FEES & PAYMENTS - COMPLETE
 * ============================================
 * 
 * Features:
 * - View all fee records
 * - View payment history
 * - View fee history (changes)
 * - Pay fees via Stripe
 * - Search and filter fees
 * - Sort fees by various fields
 * - Detailed fee view
 * - Real-time stats
 * - Premium UI/UX
 * 
 * API Endpoints:
 * - GET /api/finance/fees/ - List fees
 * - GET /api/finance/payments/ - List payments
 * - GET /api/finance/fee-history/ - List fee history
 * - POST /api/finance/payments/ - Create payment
 * 
 * USAGE OF NEW API FIELDS:
 * - student_name from fees (read-only)
 * - fee_structure_title from fees (read-only)
 * - student_name from payments (read-only)
 * - fee_title from payments (read-only)
 * - student_name from fee-history (read-only)
 * - changed_by_name from fee-history (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  FileText,
  Receipt,
  History,
  Building,
  User,
  Banknote,
  DollarSign,
  Shield,
  Lock,
  Sparkles,
  X,
  Hash,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StripePaymentModal from "@/modules/payments/StripePaymentModal";

import {
  fetchFees,
  fetchPayments,
  fetchFeeHistory,
  createPaymentIntent,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentFees,
  selectStudentPayments,
  selectStudentFeeHistory,
  selectStudentLoading,
  selectStudentSubmitting,
  selectStudentSelectedFee,
  selectFeeDue,
} from "@/modules/student/store/studentSlice";
import { setSelectedFee, clearSelectedFee } from "@/modules/student/store/studentSlice";

// ─── Smart Name Resolution ────────────────────────────────────────────

const getStudentName = (item) => {
  if (!item) return null;
  if (item.student_name && item.student_name !== 'null') return item.student_name;
  if (item.student) {
    if (typeof item.student === 'string') return item.student;
    if (item.student.name) return item.student.name;
    if (item.student.student_name) return item.student.student_name;
  }
  return null;
};

const getFeeTitle = (item) => {
  if (!item) return "Fee";
  // ✅ 1. PRIORITY: Use fee_structure_title from API (new field!)
  if (item.fee_structure_title && item.fee_structure_title !== 'null') {
    return item.fee_structure_title;
  }
  // ✅ 2. FALLBACK: Use fee_title from API (new field!)
  if (item.fee_title && item.fee_title !== 'null') {
    return item.fee_title;
  }
  // ✅ 3. FALLBACK: Use fee_structure object
  if (item.fee_structure) {
    if (typeof item.fee_structure === 'string') return item.fee_structure;
    if (item.fee_structure.title) return item.fee_structure.title;
    if (item.fee_structure.fee_structure_title) return item.fee_structure.fee_structure_title;
  }
  // ✅ 4. Check if it's a fee object directly
  if (item.title) return item.title;
  return "Fee";
};

const getChangedByName = (item) => {
  if (!item) return null;
  if (item.changed_by_name && item.changed_by_name !== 'null') return item.changed_by_name;
  if (item.changed_by) {
    if (typeof item.changed_by === 'string') return item.changed_by;
    if (item.changed_by.name) return item.changed_by.name;
    if (item.changed_by.changed_by_name) return item.changed_by.changed_by_name;
  }
  return null;
};

// ─── Toast ──────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    info: { icon: Sparkles, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  };

  const { icon: Icon, bg, border, text } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border ${border} ${bg} px-5 py-3.5 shadow-xl backdrop-blur-sm`}
    >
      <Icon className={`h-5 w-5 ${text}`} />
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, subtext, icon: Icon, color, delay }) => {
  const colors = {
    purple: { bg: "from-purple-50 to-purple-100/50", text: "text-purple-600", ring: "ring-purple-400/20" },
    emerald: { bg: "from-emerald-50 to-emerald-100/50", text: "text-emerald-600", ring: "ring-emerald-400/20" },
    amber: { bg: "from-amber-50 to-amber-100/50", text: "text-amber-600", ring: "ring-amber-400/20" },
    blue: { bg: "from-blue-50 to-blue-100/50", text: "text-blue-600", ring: "ring-blue-400/20" },
    rose: { bg: "from-rose-50 to-rose-100/50", text: "text-rose-600", ring: "ring-rose-400/20" },
    indigo: { bg: "from-indigo-50 to-indigo-100/50", text: "text-indigo-600", ring: "ring-indigo-400/20" },
  };

  const c = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {label}
          </p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-4 ${c.ring} ${c.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon size={18} strokeWidth={2} className={c.text} />
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ─── Fee Summary Cards ─────────────────────────────────────────────────

function FeeSummaryCards({ fees }) {
  const stats = useMemo(() => {
    const total = fees?.length || 0;
    const pending = fees?.filter(f => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "overdue").length || 0;
    const paid = fees?.filter(f => f.status?.toLowerCase() === "paid").length || 0;
    const overdue = fees?.filter(f => f.status?.toLowerCase() === "overdue").length || 0;
    const totalAmount = fees?.reduce((sum, f) => sum + (Number(f.amount) || 0), 0) || 0;
    const paidAmount = fees?.filter(f => f.status?.toLowerCase() === "paid")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0) || 0;
    const dueAmount = fees?.filter(f => f.status?.toLowerCase() === "pending" || f.status?.toLowerCase() === "overdue")
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0) || 0;

    return { total, pending, paid, overdue, totalAmount, paidAmount, dueAmount };
  }, [fees]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const cards = [
    {
      title: "Total Fees",
      value: stats.total,
      subValue: formatCurrency(stats.totalAmount),
      icon: FileText,
      color: "purple",
    },
    {
      title: "Paid",
      value: stats.paid,
      subValue: formatCurrency(stats.paidAmount),
      icon: CheckCircle,
      color: "emerald",
    },
    {
      title: "Pending",
      value: stats.pending,
      subValue: formatCurrency(stats.dueAmount),
      icon: Clock,
      color: "amber",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      subValue: formatCurrency(stats.dueAmount),
      icon: AlertCircle,
      color: "rose",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <StatCard
            key={card.title}
            label={card.title}
            value={card.value}
            subtext={card.subValue}
            icon={Icon}
            color={card.color}
            delay={index * 0.05}
          />
        );
      })}
    </div>
  );
}

// ─── Fee Schedule Table ───────────────────────────────────────────────

function FeeScheduleTable({ fees, onView, onPay }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusConfig = (status) => {
    const map = {
      paid: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Paid" },
      pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
      overdue: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle, label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle, label: "Cancelled" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const filteredFees = useMemo(() => {
    if (!fees) return [];
    
    let filtered = fees.filter((fee) => {
      const matchesStatus = filterStatus === "all" || fee.status?.toLowerCase() === filterStatus;
      const feeTitle = getFeeTitle(fee);
      const studentName = getStudentName(fee);
      const matchesSearch = searchTerm === "" || 
        feeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (studentName && studentName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "due_date":
          comparison = new Date(a.due_date) - new Date(b.due_date);
          break;
        case "amount":
          comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
          break;
        case "status":
          comparison = (a.status || "").localeCompare(b.status || "");
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [fees, filterStatus, searchTerm, sortBy, sortOrder]);

  const statusOptions = ["all", "paid", "pending", "overdue", "cancelled"];

  if (!fees || fees.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
            <FileText className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800">No fees found</h3>
          <p className="mt-1.5 text-sm text-gray-500 max-w-sm">
            You don't have any fee records at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search fees by title or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              showFilters || filterStatus !== "all"
                ? "bg-purple-50 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Filter size={16} />
            Filters
            {filterStatus !== "all" && (
              <span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">
                1
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => { setFilterStatus(status); setShowFilters(false); }}
                        className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all ${
                          filterStatus === status
                            ? "bg-purple-50 text-purple-700 font-medium border border-purple-200"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {status === "all" ? "All" : status}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort By</label>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="due_date">Due Date</option>
                      <option value="amount">Amount</option>
                      <option value="status">Status</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                    >
                      {sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setSearchTerm("");
                      setSortBy("due_date");
                      setSortOrder("asc");
                      setShowFilters(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFees.map((fee) => {
              const statusConfig = getStatusConfig(fee.status);
              const StatusIcon = statusConfig.icon;
              const isOverdue = fee.status?.toLowerCase() === "overdue";
              const isPending = fee.status?.toLowerCase() === "pending";
              const feeTitle = getFeeTitle(fee);
              const studentName = getStudentName(fee);

              return (
                <motion.tr
                  key={fee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-gray-50/50 transition-colors ${isOverdue ? "bg-rose-50/30" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {feeTitle}
                      </p>
                      {studentName && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <User size={11} />
                          {studentName}
                        </p>
                      )}
                      {fee.fee_structure?.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">
                          {fee.fee_structure.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(fee.due_date)}</span>
                      {isOverdue && (
                        <span className="text-xs text-rose-600 font-medium ml-1">(Overdue)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(fee.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon size={12} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(fee)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"
                        title="View Details"
                      >
                        <Eye size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
                      </button>
                      {isPending && (
                        <button
                          onClick={() => onPay(fee)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-all"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Showing {filteredFees.length} of {fees.length} fee{fees.length > 1 ? "s" : ""}
        </p>
        <p className="text-xs text-gray-400">
          Total: {formatCurrency(fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0))}
        </p>
      </div>
    </div>
  );
}

// ─── Payment Panel ─────────────────────────────────────────────────────

function PaymentPanel({ selectedFee, loading, onPay }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (!selectedFee) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center h-full flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
          <CreditCard size={28} className="text-gray-300" />
        </div>
        <p className="text-sm text-gray-500 mt-3">Select a fee to pay</p>
        <p className="text-xs text-gray-400 mt-0.5">Click "Pay Now" on any pending fee</p>
      </div>
    );
  }

  const feeTitle = getFeeTitle(selectedFee);
  const studentName = getStudentName(selectedFee);
  const isPending = selectedFee.status?.toLowerCase() === "pending";
  const isOverdue = selectedFee.status?.toLowerCase() === "overdue";
  const isPaid = selectedFee.status?.toLowerCase() === "paid";
  const canPay = isPending || isOverdue;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50/50">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-800">Payment Summary</h3>
        </div>
        {studentName && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <User size={11} />
            {studentName}
          </p>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs text-gray-500">Fee Title</p>
          <p className="text-sm font-medium text-gray-800 mt-0.5">{feeTitle}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Amount Due</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedFee.amount)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Due Date</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(selectedFee.due_date)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium mt-0.5 ${
              isPending ? "bg-amber-100 text-amber-700" :
              isOverdue ? "bg-rose-100 text-rose-700" :
              isPaid ? "bg-emerald-100 text-emerald-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {selectedFee.status?.charAt(0).toUpperCase() + selectedFee.status?.slice(1)}
            </span>
          </div>
        </div>

        {selectedFee.fee_structure?.description && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Description</p>
            <p className="text-sm text-gray-600 mt-0.5">{selectedFee.fee_structure.description}</p>
          </div>
        )}

        {selectedFee.fee_structure?.frequency && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Frequency</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{selectedFee.fee_structure.frequency}</p>
          </div>
        )}

        <button
          onClick={onPay}
          disabled={!canPay || loading}
          className={`w-full py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            canPay && !loading
              ? "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </>
          ) : canPay ? (
            <>
              <CreditCard size={16} />
              Pay Now
            </>
          ) : isPaid ? (
            <>
              <CheckCircle size={16} className="text-emerald-600" />
              Already Paid
            </>
          ) : (
            "Not Available"
          )}
        </button>

        {isPaid && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs justify-center bg-emerald-50 rounded-lg p-2">
            <CheckCircle size={14} />
            This fee has been paid successfully
          </div>
        )}

        {isOverdue && (
          <div className="flex items-center gap-2 text-rose-600 text-xs justify-center bg-rose-50 rounded-lg p-2">
            <AlertCircle size={14} />
            This fee is overdue. Please pay immediately.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Payment History ──────────────────────────────────────────────────

function PaymentHistory({ payments, fees }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getFeeTitleForPayment = (payment) => {
    // ✅ 1. PRIORITY: Use fee_title from API (new field!)
    if (payment.fee_title && payment.fee_title !== 'null') {
      return payment.fee_title;
    }
    // ✅ 2. FALLBACK: Find fee by ID and get title
    if (payment.fee) {
      const fee = fees?.find(f => f.id === payment.fee);
      if (fee) return getFeeTitle(fee);
    }
    return "Unknown Fee";
  };

  const getStudentNameForPayment = (payment) => {
    // ✅ 1. PRIORITY: Use student_name from API (new field!)
    if (payment.student_name && payment.student_name !== 'null') {
      return payment.student_name;
    }
    // ✅ 2. FALLBACK: Find fee by ID and get student name
    if (payment.fee) {
      const fee = fees?.find(f => f.id === payment.fee);
      if (fee) return getStudentName(fee);
    }
    return null;
  };

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
            <History size={28} className="text-gray-300" />
          </div>
          <h4 className="text-sm font-medium text-gray-800 mt-3">No payment history</h4>
          <p className="text-xs text-gray-400">Your payment history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <History size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">Payment History</h3>
          <span className="ml-auto text-xs text-gray-400">{payments.length} payment{payments.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {payments.map((payment) => {
          const studentName = getStudentNameForPayment(payment);
          const feeTitle = getFeeTitleForPayment(payment);
          
          return (
            <div key={payment.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{feeTitle}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(payment.payment_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard size={12} />
                      {payment.payment_method || "Unknown"}
                    </span>
                    {payment.transaction_id && (
                      <span className="flex items-center gap-1">
                        <Hash size={12} />
                        {payment.transaction_id}
                      </span>
                    )}
                    {studentName && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <User size={11} />
                        {studentName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(payment.amount_paid)}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle size={10} />
                    Completed
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fee History ──────────────────────────────────────────────────────

function FeeHistoryLog({ history, fees }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getFeeTitleForHistory = (entry) => {
    // ✅ 1. Check if entry has fee object
    if (entry.fee) {
      return getFeeTitle(entry.fee);
    }
    return "Unknown Fee";
  };

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-800">Fee Change History</h3>
          <span className="ml-auto text-xs text-gray-400">{history.length} changes</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {history.map((entry) => {
          const feeTitle = getFeeTitleForHistory(entry);
          const changedByName = getChangedByName(entry);
          
          return (
            <div key={entry.id} className="p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">{feeTitle}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        entry.old_status ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-400"
                      }`}>
                        {entry.old_status || "—"}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        entry.new_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        entry.new_status === "pending" ? "bg-amber-100 text-amber-700" :
                        entry.new_status === "overdue" ? "bg-rose-100 text-rose-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {entry.new_status || "—"}
                      </span>
                    </span>
                    {entry.old_amount && entry.new_amount && (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-gray-400">{formatCurrency(entry.old_amount)}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-medium text-gray-700">{formatCurrency(entry.new_amount)}</span>
                      </span>
                    )}
                    {changedByName && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <User size={11} />
                        {changedByName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {formatDate(entry.created_at)}
                </div>
              </div>
              {entry.reason && (
                <p className="text-xs text-gray-400 mt-1 italic">{entry.reason}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Fee Details Modal ───────────────────────────────────────────────

const FeeDetailsModal = ({ open, fee, onClose }) => {
  if (!open || !fee) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusConfig = (status) => {
    const map = {
      paid: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Paid" },
      pending: { color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
      overdue: { color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle, label: "Overdue" },
      cancelled: { color: "bg-gray-100 text-gray-700 border-gray-200", icon: XCircle, label: "Cancelled" },
    };
    return map[status?.toLowerCase()] || map.pending;
  };

  const statusConfig = getStatusConfig(fee.status);
  const StatusIcon = statusConfig.icon;
  const feeTitle = getFeeTitle(fee);
  const studentName = getStudentName(fee);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-3">
              <div className="mb-1 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium bg-white/20 text-white border-white/30`}>
                  <StatusIcon size={12} />
                  {statusConfig.label}
                </span>
              </div>
              <h2 className="text-xl font-bold truncate">{feeTitle}</h2>
              {studentName && (
                <p className="text-sm text-white/70 flex items-center gap-1 mt-0.5">
                  <User size={14} />
                  {studentName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</p>
              <p className="text-lg font-bold text-gray-800">{formatCurrency(fee.amount)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Status</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border mt-1 ${statusConfig.color}`}>
                <StatusIcon size={12} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Due Date</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDate(fee.due_date)}</p>
          </div>

          {fee.fee_structure?.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Description</p>
              <p className="text-sm text-gray-600 mt-0.5">{fee.fee_structure.description}</p>
            </div>
          )}

          {fee.fee_structure?.frequency && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Frequency</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{fee.fee_structure.frequency}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Fee ID</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">#FEE-{String(fee.id).padStart(4, '0')}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

function FeesPayments() {
  const dispatch = useDispatch();
  const fees = useSelector(selectStudentFees);
  const payments = useSelector(selectStudentPayments);
  const feeHistory = useSelector(selectStudentFeeHistory);
  const selectedFee = useSelector(selectStudentSelectedFee);
  const loading = useSelector(selectStudentLoading);
  const submitting = useSelector(selectStudentSubmitting);
  const feeDue = useSelector(selectFeeDue);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [showStripe, setShowStripe] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchFees()).unwrap(),
        dispatch(fetchPayments()).unwrap(),
        dispatch(fetchFeeHistory()).unwrap(),
      ]);
    } catch (err) {
      console.error("Error loading fees data:", err);
      setToast({ message: "Failed to load fees data", type: "error" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    setToast({ message: "Fees refreshed", type: "info" });
  };

  const handleViewFee = (fee) => {
    dispatch(setSelectedFee(fee));
    setDetailsOpen(true);
  };

  const handleSelectFee = (fee) => {
    dispatch(setSelectedFee(fee));
  };

  const handlePayment = async () => {
    if (!selectedFee) return;
    
    try {
      const response = await dispatch(
        createPaymentIntent({ fee_id: selectedFee.id })
      ).unwrap();

      if (!response.client_secret) {
        throw new Error("No client_secret returned from backend.");
      }

      setClientSecret(response.client_secret);
      setShowStripe(true);
    } catch (error) {
      console.error(error);
      setToast({ 
        message: error?.message || "Unable to initialize payment.", 
        type: "error" 
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowStripe(false);
    setClientSecret("");
    loadData();
    dispatch(clearSelectedFee());
    setToast({ message: "Payment Successful! 🎉", type: "success" });
  };

  if (loading && !fees?.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Fees & Payments"
          subtitle="View your fee schedule, payment history and securely pay outstanding fees"
          breadcrumbs={["Student", "Fees & Payments"]}
          bgColor="bg-purple-50"
          actions={
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white/80 rounded-lg hover:bg-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          }
        />

        <div className="mt-6" />

        {/* ─── Fee Due Alert ──────────────────────────────────────────── */}
        {feeDue > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">You have pending fees</p>
                  <p className="text-xs text-gray-500">
                    Total due: <span className="font-semibold text-amber-700">
                      ${feeDue.toFixed(0)}
                    </span> — Please pay before the due date.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const firstPending = fees?.find(f => f.status?.toLowerCase() === "pending");
                  if (firstPending) {
                    dispatch(setSelectedFee(firstPending));
                    document.querySelector('.payment-panel-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-all"
              >
                Pay Now
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── Summary Cards ──────────────────────────────────────────── */}
        <FeeSummaryCards fees={fees} />

        {/* ─── Table & Payment Panel ────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
          <div className="xl:col-span-2 min-w-0">
            <FeeScheduleTable fees={fees} onView={handleViewFee} onPay={handleSelectFee} />
          </div>
          <div className="min-w-0 payment-panel-section">
            <PaymentPanel selectedFee={selectedFee} loading={submitting} onPay={handlePayment} />
          </div>
        </div>

        {/* ─── Payment History ────────────────────────────────────────── */}
        <div className="mt-6">
          <PaymentHistory payments={payments} fees={fees} />
        </div>

        {/* ─── Fee History ────────────────────────────────────────────── */}
        <div className="mt-6">
          <FeeHistoryLog history={feeHistory} fees={fees} />
        </div>

        {/* ─── Footer ────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Finance Module</p>
          <p className="mt-1 flex items-center justify-center gap-2">
            <Shield size={12} className="text-gray-300" />
            Secure payments powered by Stripe
          </p>
        </div>

        {/* ─── Fee Details Modal ──────────────────────────────────────── */}
        <AnimatePresence>
          {detailsOpen && (
            <FeeDetailsModal
              open={detailsOpen}
              fee={selectedFee}
              onClose={() => {
                setDetailsOpen(false);
                dispatch(clearSelectedFee());
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Stripe Payment Modal ────────────────────────────────────── */}
      <StripePaymentModal
        open={showStripe}
        clientSecret={clientSecret}
        onClose={() => {
          setShowStripe(false);
          setClientSecret("");
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default FeesPayments;