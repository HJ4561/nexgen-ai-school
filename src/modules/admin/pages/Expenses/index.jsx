// src/modules/admin/pages/Expenses/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Eye, Filter, Download,
  Calendar, Clock, CreditCard, Building, ShoppingBag,
  Utensils, BookOpen, Bus, Wrench, ChevronDown,
  DollarSign, Users, TrendingUp, TrendingDown, X,
  RefreshCw, FileText, Home, Briefcase, Package, Coffee,
  GraduationCap, Car, Settings, AlertCircle, CheckCircle,
  Copy, Check, Hash, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ---------- Constants ----------
const CATEGORY_ICONS = {
  utilities: <Wrench className="w-4 h-4" />,
  salary: <Users className="w-4 h-4" />,
  supplies: <Package className="w-4 h-4" />,
  food: <Coffee className="w-4 h-4" />,
  transport: <Car className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  maintenance: <Settings className="w-4 h-4" />,
  other: <CreditCard className="w-4 h-4" />,
};

const CATEGORY_LABELS = {
  utilities: "Utilities",
  salary: "Salary",
  supplies: "Supplies",
  food: "Food",
  transport: "Transport",
  education: "Education",
  maintenance: "Maintenance",
  other: "Other",
};

const CATEGORY_STYLES = {
  utilities: "bg-gray-100 text-gray-700 border-gray-200",
  salary: "bg-blue-50 text-blue-700 border-blue-200",
  supplies: "bg-amber-50 text-amber-700 border-amber-200",
  food: "bg-orange-50 text-orange-700 border-orange-200",
  transport: "bg-emerald-50 text-emerald-700 border-emerald-200",
  education: "bg-purple-50 text-purple-700 border-purple-200",
  maintenance: "bg-red-50 text-red-700 border-red-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

// ---------- Helpers ----------
const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const truncateText = (text, maxLen = 40) => {
  if (!text) return "—";
  return text.length > maxLen ? text.slice(0, maxLen) + "..." : text;
};

// ---------- Sub-components ----------
const CategoryBadge = ({ category }) => {
  if (!category) return <Badge className="bg-gray-100 text-gray-700 text-xs">—</Badge>;
  return (
    <Badge className={`${CATEGORY_STYLES[category] || "bg-gray-100 text-gray-700"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
      {CATEGORY_ICONS[category] || CATEGORY_ICONS.other}
      {CATEGORY_LABELS[category] || category}
    </Badge>
  );
};

// ---------- Main Component ----------
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modal, setModal] = useState({ mode: null, expense: null });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const pageSize = 10;

  // ---------- Effects ----------
  useEffect(() => { fetchExpenses(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterCategory, dateFrom, dateTo]);

  // ---------- API ----------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await api.get("/finance/expenses/");
      const data = response.data?.results || response.data || [];
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
      setErrored(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  // ---------- Stats ----------
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, curr) => sum + Number(curr.amount || 0), 0);
    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, curr) => sum + Number(curr.amount || 0), 0);
    const categories = {};
    expenses.forEach(exp => {
      const cat = exp.category || "other";
      categories[cat] = (categories[cat] || 0) + Number(exp.amount || 0);
    });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0];
    const avg = expenses.length > 0 ? total / expenses.length : 0;
    return { total, thisMonth, avg, categories, topCategory, count: expenses.length };
  }, [expenses]);

  // ---------- Filtering ----------
  const filtered = useMemo(() => {
    let rows = expenses.filter(exp => {
      if (filterCategory !== "all" && exp.category !== filterCategory) return false;
      if (dateFrom && new Date(exp.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(exp.date) > new Date(dateTo + "T23:59:59")) return false;
      if (!searchTerm) return true;
      const description = (exp.description || "").toLowerCase();
      const category = (exp.category || "").toLowerCase();
      return description.includes(searchTerm) || category.includes(searchTerm);
    });
    rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    return rows;
  }, [expenses, filterCategory, dateFrom, dateTo, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = filterCategory !== "all" || dateFrom || dateTo || searchTerm;

  const clearFilters = () => {
    setSearchInput("");
    setFilterCategory("all");
    setDateFrom("");
    setDateTo("");
  };

  // ---------- Actions ----------
  const handleExport = () => {
    if (filtered.length === 0) { showToast("Nothing to export", "error"); return; }
    const headers = ["Description", "Category", "Amount", "Date"];
    const rows = filtered.map((e) => [
      e.description || "",
      e.category || "",
      e.amount || 0,
      formatDate(e.date),
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} expenses`, "success");
  };

  const openAdd = () => setModal({ mode: "add", expense: null });
  const openView = (expense) => setModal({ mode: "view", expense });
  const openEdit = (expense) => setModal({ mode: "edit", expense: { ...expense } });
  const closeModal = () => setModal({ mode: null, expense: null });

  const handleAddExpense = async () => {
    const { expense } = modal;
    if (!expense) return;
    setSaving(true);
    try {
      const response = await api.post("/finance/expenses/", {
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
      });
      setExpenses((prev) => [response.data, ...prev]);
      showToast("Expense added successfully", "success");
      closeModal();
    } catch (error) {
      showToast("Couldn't add expense", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    const { expense } = modal;
    if (!expense) return;
    setSaving(true);
    try {
      await api.patch(`/finance/expenses/${expense.id}/`, {
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
      });
      setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...expense } : e)));
      showToast("Expense updated successfully", "success");
      closeModal();
    } catch (error) {
      showToast("Couldn't save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;
    setSaving(true);
    try {
      await api.delete(`/finance/expenses/${deletingExpense.id}/`);
      setExpenses((prev) => prev.filter((e) => e.id !== deletingExpense.id));
      showToast("Expense deleted", "success");
      setDeletingExpense(null);
    } catch (error) {
      showToast("Couldn't delete", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------
  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader 
          title="Expenses" 
          subtitle={`Track and manage all school expenses${expenses.length > 0 ? ` — ${expenses.length} total expenses` : ""}`}
          breadcrumbs={["Admin", "Finance", "Expenses"]}
          action={
            <div className="flex items-center gap-2.5">
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
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>Couldn't load expenses. Please refresh.</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.total)}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.count} transactions</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.thisMonth)}</p>
            <p className="text-xs text-gray-400 mt-1">Current month spending</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.avg)}</p>
            <p className="text-xs text-gray-400 mt-1">Per expense</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</p>
            <p className="text-2xl font-bold text-gray-800">{Object.keys(stats.categories).length}</p>
            <p className="text-xs text-gray-400 mt-1">
              Top: {stats.topCategory ? CATEGORY_LABELS[stats.topCategory] || stats.topCategory : "None"}
            </p>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.categories).slice(0, 4).map(([cat, amount]) => (
            <Card key={cat} className="p-3 bg-gray-50/50 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {CATEGORY_ICONS[cat] || CATEGORY_ICONS.other}
                  <span className="text-sm text-gray-600">{CATEGORY_LABELS[cat] || cat}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{formatCurrency(amount)}</span>
              </div>
            </Card>
          ))}
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
                  placeholder="Search by description or category..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="utilities">Utilities</option>
                  <option value="salary">Salary</option>
                  <option value="supplies">Supplies</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="education">Education</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
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

            {/* Expanded Filters */}
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3.5"><div className="h-3 w-32 bg-gray-100 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-6 w-24 bg-gray-100 rounded-full" /></td>
                      <td className="px-4 py-3.5"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-3 w-20 bg-gray-100 rounded" /></td>
                      <td className="px-4 py-3.5" />
                    </tr>
                  ))
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {hasActiveFilters ? "No expenses match your filters" : "No expenses recorded yet"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {hasActiveFilters ? "Try adjusting your search or filters" : "Add an expense to get started"}
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
                  pageItems.map((expense) => (
                    <tr key={expense.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{truncateText(expense.description, 40)}</p>
                          {expense.description && expense.description.length > 40 && (
                            <p className="text-xs text-gray-400 mt-0.5">{expense.description.length} characters</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <CategoryBadge category={expense.category} />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-gray-800 text-sm">
                          {formatCurrency(expense.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">{formatDate(expense.date)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            title="View details"
                            onClick={() => openView(expense)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit expense"
                            onClick={() => openEdit(expense)}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete expense"
                            onClick={() => setDeletingExpense(expense)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* Add Expense Modal */}
      {modal.mode === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Add New Expense</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter expense description"
                  value={modal.expense?.description || ""}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...(m.expense || {}), description: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={modal.expense?.category || "other"}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...(m.expense || {}), category: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="utilities">Utilities</option>
                  <option value="salary">Salary</option>
                  <option value="supplies">Supplies</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="education">Education</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount (PKR) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={modal.expense?.amount || ""}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...(m.expense || {}), amount: Number(e.target.value) } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={modal.expense?.date || new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...(m.expense || {}), date: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal.mode === "view" && modal.expense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Expense Details</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Description</p>
                <p className="font-medium text-gray-800">{modal.expense.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Category</p>
                  <CategoryBadge category={modal.expense.category} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(modal.expense.amount)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(modal.expense.date)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal.mode === "edit" && modal.expense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Edit Expense</h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={modal.expense.description || ""}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...m.expense, description: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={modal.expense.category || "other"}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...m.expense, category: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="utilities">Utilities</option>
                  <option value="salary">Salary</option>
                  <option value="supplies">Supplies</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="education">Education</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={modal.expense.amount || 0}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...m.expense, amount: Number(e.target.value) } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={modal.expense.date || ""}
                  onChange={(e) => setModal((m) => ({ ...m, expense: { ...m.expense, date: e.target.value } }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingExpense && (
        <ConfirmDialog
          title="Delete this expense?"
          message={`This removes the ${formatCurrency(deletingExpense.amount)} expense for "${deletingExpense.description || "this expense"}".`}
          confirmLabel="Delete Expense"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingExpense(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Expenses;