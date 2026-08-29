// src/modules/admin/pages/Payments.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Eye, Filter, Download,
  Clock, CheckCircle, XCircle, AlertCircle,
  ChevronDown, CreditCard, Wallet, Banknote, Receipt,
  TrendingUp, DollarSign, X,
  RefreshCw, Loader2, Mail, Copy, Check
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

const PAYMENT_METHOD_ICONS = {
  cash: <Banknote className="w-4 h-4" />,
  card: <CreditCard className="w-4 h-4" />,
  online: <Wallet className="w-4 h-4" />,
  bank: <Wallet className="w-4 h-4" />,
  cheque: <Receipt className="w-4 h-4" />,
};

const PAYMENT_METHOD_LABELS = {
  cash: "Cash", 
  card: "Card", 
  online: "Online", 
  bank: "Bank Transfer", 
  cheque: "Cheque"
};

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_ICONS = {
  completed: <CheckCircle className="w-3.5 h-3.5" />,
  pending: <Clock className="w-3.5 h-3.5" />,
  failed: <XCircle className="w-3.5 h-3.5" />,
  refunded: <AlertCircle className="w-3.5 h-3.5" />,
};

const STATUS_LABELS = {
  completed: "Completed", 
  pending: "Pending", 
  failed: "Failed", 
  refunded: "Refunded"
};

const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return new Intl.NumberFormat("en-PK", { 
      style: "currency", 
      currency: "PKR", 
      maximumFractionDigits: 0 
    }).format(0);
  }
  return new Intl.NumberFormat("en-PK", { 
    style: "currency", 
    currency: "PKR", 
    maximumFractionDigits: 0 
  }).format(numAmount);
};

const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  return new Date(dateString).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
};

const truncateText = (text, maxLen = 14) => {
  if (!text) return "Ã¢â‚¬â€";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
};

const MethodBadge = ({ method }) => {
  if (!method) return <Badge className="bg-gray-100 text-gray-700 text-xs">Ã¢â‚¬â€</Badge>;
  return (
    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex items-center gap-1.5 px-2.5 py-1">
      {PAYMENT_METHOD_ICONS[method] || PAYMENT_METHOD_ICONS.cash}
      {PAYMENT_METHOD_LABELS[method] || method}
    </Badge>
  );
};

const StatusBadge = ({ status }) => {
  if (!status) return <Badge className="bg-gray-100 text-gray-700 text-xs">Ã¢â‚¬â€</Badge>;
  return (
    <Badge className={`${STATUS_STYLES[status] || "bg-gray-100 text-gray-700"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
      {STATUS_ICONS[status] || <AlertCircle className="w-3.5 h-3.5" />}
      {STATUS_LABELS[status] || status}
    </Badge>
  );
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modal, setModal] = useState({ mode: null, payment: null });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const pageSize = 10;

  useEffect(() => { fetchPayments(); fetchStudents(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterMethod, filterStatus, dateFrom, dateTo]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get("/users/students/");
      const data = response.data?.results || response.data || [];
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    setRefreshing(false);
    setErrored(false);
    try {
      const response = await api.get("/finance/payments/");
      const data = response.data?.results || response.data || [];
      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
      setErrored(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    await fetchStudents();
    setRefreshing(false);
  };

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const now = new Date();
    const thisMonth = payments.filter((p) => {
      const d = new Date(p.payment_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const completed = payments.filter((p) => p.status === "completed").length;
    const pending = payments.filter((p) => p.status === "pending").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    const methodCounts = payments.reduce((acc, p) => {
      acc[p.payment_method] = (acc[p.payment_method] || 0) + 1;
      return acc;
    }, {});
    const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const lastMonthTotal = payments.filter((p) => {
      const d = new Date(p.payment_date);
      return d.getMonth() === now.getMonth() - 1 && d.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const trend = lastMonthTotal > 0 ? ((thisMonth - lastMonthTotal) / lastMonthTotal) * 100 : 0;
    return { total, thisMonth, completed, pending, failed, topMethod, trend };
  }, [payments]);

  const filtered = useMemo(() => {
    let rows = payments.filter((payment) => {
      if (filterMethod !== "all" && payment.payment_method !== filterMethod) return false;
      if (filterStatus !== "all" && payment.status !== filterStatus) return false;
      if (dateFrom && new Date(payment.payment_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(payment.payment_date) > new Date(dateTo + "T23:59:59")) return false;
      if (!searchTerm) return true;
      const studentName = (payment.student_name || payment.student?.name || "").toLowerCase();
      const txId = (payment.transaction_id || "").toLowerCase();
      const receipt = (payment.receipt_no || "").toLowerCase();
      return studentName.includes(searchTerm) || txId.includes(searchTerm) || receipt.includes(searchTerm);
    });
    rows.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
    return rows;
  }, [payments, filterMethod, filterStatus, dateFrom, dateTo, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = filterMethod !== "all" || filterStatus !== "all" || dateFrom || dateTo || searchTerm;

  const clearFilters = () => {
    setSearchInput("");
    setFilterMethod("all");
    setFilterStatus("all");
    setDateFrom("");
    setDateTo("");
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageItems.length && pageItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageItems.map((p) => p.id)));
    }
  };
  
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    if (filtered.length === 0) { showToast("Nothing to export", "error"); return; }
    const headers = ["Student", "Receipt No", "Amount", "Method", "Date", "Transaction ID", "Status"];
    const rows = filtered.map((p) => [
      p.student_name || p.student?.name || "Unknown",
      p.receipt_no || "",
      p.amount_paid || 0,
      p.payment_method || "",
      formatDate(p.payment_date),
      p.transaction_id || "",
      p.status || "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Exported " + filtered.length + " payments", "success");
  };

  const openAdd = () => {
    setModal({ 
      mode: "add", 
      payment: {
        student: "",
        amount_paid: "",
        payment_method: "cash",
        status: "completed",
        payment_date: new Date().toISOString().slice(0, 10),
        transaction_id: "",
        receipt_no: "",
      }
    });
  };
  
  const openView = (payment) => setModal({ mode: "view", payment });
  const openEdit = (payment) => setModal({ mode: "edit", payment: { ...payment } });
  const closeModal = () => setModal({ mode: null, payment: null });

  const handleAddPayment = async () => {
    const { payment } = modal;
    if (!payment) return;
    setSaving(true);
    try {
      const response = await api.post("/finance/payments/", {
        student: payment.student,
        amount_paid: payment.amount_paid,
        payment_method: payment.payment_method,
        status: payment.status,
        payment_date: payment.payment_date,
        transaction_id: payment.transaction_id,
        receipt_no: payment.receipt_no,
      });
      setPayments((prev) => [response.data, ...prev]);
      showToast("Payment recorded successfully", "success");
      closeModal();
    } catch (error) {
      showToast("Couldn't record payment", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    const { payment } = modal;
    if (!payment) return;
    setSaving(true);
    try {
      await api.patch(`/finance/payments/${payment.id}/`, {
        amount_paid: payment.amount_paid,
        payment_method: payment.payment_method,
        status: payment.status,
        transaction_id: payment.transaction_id,
      });
      setPayments((prev) => prev.map((p) => (p.id === payment.id ? { ...p, ...payment } : p)));
      showToast("Payment updated successfully", "success");
      closeModal();
    } catch (error) {
      showToast("Couldn't save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    setSaving(true);
    try {
      await api.delete(`/finance/payments/${deletingPayment.id}/`);
      setPayments((prev) => prev.filter((p) => p.id !== deletingPayment.id));
      showToast("Payment deleted", "success");
      setDeletingPayment(null);
    } catch (error) {
      showToast("Couldn't delete", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSendReceipt = async (payment) => {
    try {
      await api.post(`/finance/payments/${payment.id}/send-receipt/`);
      showToast("Receipt sent for " + (payment.receipt_no || "payment"), "success");
    } catch (error) {
      showToast("Couldn't send receipt", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm("Delete " + selectedIds.size + " selected payment(s)?")) return;
    try {
      await Promise.all([...selectedIds].map((id) => api.delete(`/finance/payments/${id}/`)));
      setPayments((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      showToast("Deleted " + selectedIds.size + " payments", "success");
      setSelectedIds(new Set());
    } catch (error) {
      showToast("Some deletions failed", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 px-4 sm:px-6 lg:px-8">
          <PageHeader 
            title="Payments" 
            subtitle="Track and manage all payment transactions across the school" 
            breadcrumbs={["Admin", "Finance", "Payments"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading payments...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <PageHeader 
          title="Payments" 
          subtitle={`Track and manage all payment transactions across the school${payments.length > 0 ? ` Ã¢â‚¬â€ ${payments.length} total payments` : ""}`}
          breadcrumbs={["Admin", "Finance", "Payments"]}
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button 
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>Couldn't load payments. Please refresh.</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Collected</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.total)}</p>
            <p className="text-xs text-gray-400 mt-1">{payments.length} transactions</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.thisMonth)}</p>
            <p className="text-xs text-gray-400 mt-1">Current month collections</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
            <p className="text-xs text-gray-400 mt-1">Successful payments</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting confirmation</p>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Average Payment</p>
                <p className="text-lg font-bold text-blue-700">
                  {payments.length > 0 ? formatCurrency(stats.total / payments.length) : formatCurrency(0)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Most Used Method</p>
                <p className="text-lg font-bold text-purple-700">
                  {stats.topMethod ? PAYMENT_METHOD_LABELS[stats.topMethod] || stats.topMethod.toUpperCase() : "N/A"}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/10">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Latest Receipt</p>
                <p className="text-lg font-bold text-emerald-700">
                  {payments.length > 0 ? "#" + (payments[0]?.receipt_no || "N/A") : "N/A"}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Receipt className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student, transaction ID, or receipt..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap items-end gap-4 mt-4 pt-4 border-t border-gray-200/50">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Reset Dates
                </button>
              </div>
            )}

            {selectedIds.size > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mt-4">
                <span className="text-sm text-blue-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {selectedIds.size} selected
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete selected
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={pageItems.length > 0 && selectedIds.size === pageItems.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student / Receipt</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {hasActiveFilters ? "No payments match your filters" : "No payments recorded yet"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {hasActiveFilters ? "Try adjusting your search or filters" : "Record a payment to get started"}
                        </p>
                        {hasActiveFilters && (
                          <button 
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all mt-2"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((payment) => (
                    <tr
                      key={payment.id}
                      className={`hover:bg-blue-50/30 transition-colors group ${selectedIds.has(payment.id) ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(payment.id)}
                          onChange={() => toggleSelectOne(payment.id)}
                          className="rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {payment.student_name?.charAt(0) || payment.student?.name?.charAt(0) || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">
                              {payment.student_name || payment.student?.name || "Unknown Student"}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Receipt className="w-3 h-3" />
                              <span>{payment.receipt_no || "No receipt"}</span>
                              {payment.receipt_no && (
                                <button 
                                  onClick={() => copyToClipboard(payment.receipt_no)}
                                  className="text-gray-300 hover:text-blue-500 transition-colors"
                                  title="Copy receipt number"
                                >
                                  {copiedId === payment.receipt_no ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-800 text-sm">{formatCurrency(payment.amount_paid)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <MethodBadge method={payment.payment_method} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">{formatDate(payment.payment_date)}</span>
                          <span className="text-xs text-gray-400">{formatTime(payment.payment_date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            {truncateText(payment.transaction_id, 14) || "N/A"}
                          </span>
                          {payment.transaction_id && (
                            <button 
                              onClick={() => copyToClipboard(payment.transaction_id)}
                              className="text-gray-300 hover:text-blue-500 transition-colors"
                              title="Copy transaction ID"
                            >
                              {copiedId === payment.transaction_id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            title="View details"
                            onClick={() => openView(payment)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            title="Edit payment"
                            onClick={() => openEdit(payment)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            title="Delete payment"
                            onClick={() => setDeletingPayment(payment)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button 
                            title="Email receipt"
                            onClick={() => handleSendReceipt(payment)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Add Payment Modal */}
      {modal.mode === "add" && modal.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Record Payment</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Student <span className="text-red-500">*</span></label>
                <select
                  value={modal.payment.student || ""}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, student: Number(e.target.value) } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} {student.admission_no ? `(${student.admission_no})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount (PKR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={modal.payment.amount_paid || ""}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, amount_paid: Number(e.target.value) } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                <select
                  value={modal.payment.payment_method || "cash"}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, payment_method: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={modal.payment.status || "completed"}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, status: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={modal.payment.payment_date || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, payment_date: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                <input
                  type="text"
                  placeholder="Enter transaction ID"
                  value={modal.payment.transaction_id || ""}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, transaction_id: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Receipt Number</label>
                <input
                  type="text"
                  placeholder="Enter receipt number"
                  value={modal.payment.receipt_no || ""}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, receipt_no: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="primary" onClick={handleAddPayment} disabled={saving} className="w-full sm:w-auto flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Record Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal.mode === "view" && modal.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Payment Details</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium text-gray-800">{modal.payment.student_name || modal.payment.student?.name || "Unknown"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Receipt Number</p>
                  <p className="font-medium text-gray-800 font-mono">{modal.payment.receipt_no || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(modal.payment.amount_paid)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <MethodBadge method={modal.payment.payment_method} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-800">{formatDate(modal.payment.payment_date)} at {formatTime(modal.payment.payment_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Status</p>
                  <StatusBadge status={modal.payment.status} />
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 break-all">
                    {modal.payment.transaction_id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal.mode === "edit" && modal.payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Edit Payment</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount Paid (PKR)</label>
                <input
                  type="number"
                  value={modal.payment.amount_paid || 0}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, amount_paid: Number(e.target.value) } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Payment Method</label>
                <select
                  value={modal.payment.payment_method || "cash"}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, payment_method: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={modal.payment.status || "pending"}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, status: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={modal.payment.transaction_id || ""}
                  onChange={(e) => setModal((m) => ({ ...m, payment: { ...m.payment, transaction_id: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                  placeholder="Enter transaction ID"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={closeModal} disabled={saving} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={saving} className="w-full sm:w-auto flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingPayment && (
        <ConfirmDialog
          open={true}
          title="Delete this payment?"
          message={`This removes the ${formatCurrency(deletingPayment.amount_paid)} payment from ${deletingPayment.student_name || deletingPayment.student?.name || "this student"}.`}
          confirmLabel="Delete Payment"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPayment(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <XCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Payments;