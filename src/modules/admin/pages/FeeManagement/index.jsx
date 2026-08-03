// src/modules/admin/pages/FeeManagement/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Wallet,
  XCircle,
  Calendar,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import FeeFormModal from "@/components/admin/FeeFormModal";
import FeeDetailDrawer from "@/components/admin/FeeDetailDrawer";
import FeeStats from "@/components/admin/FeeStats";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

/* ============================================================================
 * HELPERS
 * ========================================================================== */

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount || 0);

const STATUS_BADGE = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
  waived: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_ICONS = {
  paid: <CheckCircle className="w-3.5 h-3.5" />,
  pending: <Clock className="w-3.5 h-3.5" />,
  overdue: <AlertCircle className="w-3.5 h-3.5" />,
  partial: <Wallet className="w-3.5 h-3.5" />,
  waived: <XCircle className="w-3.5 h-3.5" />,
};

/* ============================================================================
 * API FUNCTIONS
 * ========================================================================== */

const getStudents = async () => {
  try {
    const response = await api.get("/users/students/");
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};

const getFeeStructures = async () => {
  try {
    const response = await api.get("/finance/fee-structures/");
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error("Failed to fetch fee structures:", error);
    return [];
  }
};

const getFees = async () => {
  try {
    const response = await api.get("/finance/fees/");
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error("Failed to fetch fees:", error);
    return [];
  }
};

const createFee = async (payload) => {
  const response = await api.post("/finance/fees/", payload);
  return response.data;
};

const updateFee = async (id, payload) => {
  const response = await api.patch(`/finance/fees/${id}/`, payload);
  return response.data;
};

const deleteFee = async (id) => {
  await api.delete(`/finance/fees/${id}/`);
};

const getPayments = async () => {
  try {
    const response = await api.get("/finance/payments/");
    return response.data?.results || response.data || [];
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return [];
  }
};

const createPayment = async (payload) => {
  const response = await api.post("/finance/payments/", payload);
  return response.data;
};

const createFeeHistoryEntry = async (payload) => {
  try {
    const response = await api.post("/finance/fee-history/", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create fee history:", error);
    return null;
  }
};

/* ============================================================================
 * ENHANCED FEE FUNCTIONS
 * ========================================================================== */

async function getFeesWithDetails() {
  const [fees, students, feeStructures, payments] = await Promise.all([
    getFees(),
    getStudents(),
    getFeeStructures(),
    getPayments(),
  ]);

  const studentsById = new Map(students.map((s) => [s.id, s]));
  const structuresById = new Map(feeStructures.map((fs) => [fs.id, fs]));

  const paymentsByFee = new Map();
  payments.forEach((p) => {
    const feePayments = paymentsByFee.get(p.fee) || [];
    feePayments.push(p);
    paymentsByFee.set(p.fee, feePayments);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enrichedFees = fees.map((fee) => {
    const student = studentsById.get(fee.student);
    const structure = structuresById.get(fee.fee_structure);
    const feePayments = paymentsByFee.get(fee.id) || [];
    const paidAmount = feePayments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
    const amount = Number(fee.amount || 0);
    const balance = Math.max(0, amount - paidAmount);
    const dueDate = fee.due_date ? new Date(fee.due_date) : null;
    const isOverdue = dueDate && dueDate < today && fee.status !== "paid" && fee.status !== "waived";

    return {
      ...fee,
      studentName: student?.user?.name || student?.name || "Unknown student",
      studentEmail: student?.user?.email || student?.email || "",
      feeTypeLabel: structure?.title || "Fee",
      paidAmount,
      balance,
      isOverdue,
      payments: feePayments,
    };
  });

  const stats = enrichedFees.reduce(
    (acc, fee) => {
      acc.total += 1;
      acc.collected += fee.paidAmount;
      acc.outstanding += fee.balance;
      if (fee.status === "pending") acc.pending += 1;
      if (fee.isOverdue) acc.overdue += 1;
      return acc;
    },
    { total: 0, collected: 0, outstanding: 0, pending: 0, overdue: 0 }
  );

  return { fees: enrichedFees, stats };
}

async function recordPayment(fee, paymentData, changedByUserId) {
  const payment = await createPayment({
    fee: fee.id,
    amount_paid: paymentData.amount_paid,
    payment_date: paymentData.payment_date,
    payment_method: paymentData.payment_method,
    transaction_id: paymentData.transaction_id,
    receipt_no: paymentData.receipt_no,
  });

  const newPaidTotal = fee.paidAmount + Number(paymentData.amount_paid || 0);
  const newStatus = newPaidTotal >= Number(fee.amount) ? "paid" : newPaidTotal > 0 ? "partial" : fee.status;

  if (newStatus !== fee.status) {
    await updateFee(fee.id, { status: newStatus });
    await createFeeHistoryEntry({
      fee: fee.id,
      old_status: fee.status,
      new_status: newStatus,
      old_amount: fee.amount,
      new_amount: fee.amount,
      changed_by: changedByUserId,
      reason: "Payment received",
    }).catch(() => {});
  }

  return { payment, newStatus };
}

/* ============================================================================
 * MAIN PAGE
 * ========================================================================== */

const PAGE_SIZE = 10;

const FeeManagement = () => {
  const currentUserId = useSelector((state) => state.auth?.user?.id);

  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({ total: 0, collected: 0, outstanding: 0, pending: 0, overdue: 0 });
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [viewingFee, setViewingFee] = useState(null);
  const [deletingFee, setDeletingFee] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [{ fees: feeData, stats: statData }, studentData, structureData] = await Promise.all([
        getFeesWithDetails(),
        getStudents(),
        getFeeStructures(),
      ]);
      setFees(feeData);
      setStats(statData);
      setStudents(studentData);
      setFeeStructures(structureData);
    } catch (error) {
      console.error("Failed to fetch fees:", error);
      setLoadError("Couldn't load fee records.");
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    return fees.filter((fee) => {
      if (filterStatus !== "all" && fee.status !== filterStatus) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return fee.studentName?.toLowerCase().includes(term) || fee.feeTypeLabel?.toLowerCase().includes(term);
    });
  }, [fees, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const openAdd = () => {
    setEditingFee(null);
    setModalOpen(true);
  };
  const openEdit = (fee) => {
    setEditingFee(fee);
    setModalOpen(true);
  };

  const handleSubmitFee = async (payload) => {
    if (editingFee) {
      await updateFee(editingFee.id, payload);
    } else {
      await createFee(payload);
    }
    setModalOpen(false);
    await fetchAll();
  };

  const handleDeleteFee = async () => {
    await deleteFee(deletingFee.id);
    setFees((prev) => prev.filter((f) => f.id !== deletingFee.id));
    setDeletingFee(null);
  };

  const handleRecordPayment = async (paymentPayload) => {
    await recordPayment(viewingFee, paymentPayload, currentUserId);
    setViewingFee(null);
    await fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader 
          title="Fee Management" 
          subtitle={`Manage student fees and track payments${fees.length > 0 ? ` — ${fees.length} total fees` : ""}`}
          breadcrumbs={["Admin", "Finance", "Fee Management"]}
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
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Fee
              </button>
            </div>
          }
        />

        {loadError && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Stats */}
        <FeeStats stats={stats} formatCurrency={formatCurrency} />

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm border-gray-100">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name or fee type..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="partial">Partial</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Fee Type</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {searchTerm || filterStatus !== "all" ? "No fees match your filters" : "No fees found"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm || filterStatus !== "all" ? "Try adjusting your search or status filter" : "Add a fee to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((fee) => (
                    <tr key={fee.id} className={`hover:bg-blue-50/30 transition-colors group ${fee.isOverdue ? "bg-red-50/20" : ""}`}>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {fee.studentName?.charAt(0) || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{fee.studentName}</p>
                            <p className="text-xs text-gray-500 truncate">{fee.studentEmail || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">{fee.feeTypeLabel}</Badge>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-semibold text-gray-800 text-sm">{formatCurrency(fee.amount)}</span>
                        {fee.balance > 0 && fee.status !== "pending" && (
                          <span className="block text-xs text-red-500">{formatCurrency(fee.balance)} owed</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className={`text-sm ${fee.isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                            {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : "—"}
                          </span>
                          {fee.isOverdue && <span className="text-xs text-red-600 font-medium">(Overdue)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <Badge className={`${STATUS_BADGE[fee.status] || "bg-gray-100 text-gray-700"} text-xs flex items-center gap-1 px-2.5 py-1`}>
                          {STATUS_ICONS[fee.status]}
                          {fee.status ? fee.status.charAt(0).toUpperCase() + fee.status.slice(1) : "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setViewingFee(fee)} 
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openEdit(fee)} 
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeletingFee(fee)} 
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" 
                            title="Delete"
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

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filtered.length}
            onPageChange={(p) => setCurrentPage(Math.max(1, Math.min(totalPages, p)))}
          />
        </Card>
      </div>

      {/* Modals */}
      {modalOpen && (
        <FeeFormModal
          initialData={editingFee}
          students={students}
          feeStructures={feeStructures}
          onSubmit={handleSubmitFee}
          onClose={() => setModalOpen(false)}
        />
      )}

      {viewingFee && (
        <FeeDetailDrawer
          fee={viewingFee}
          onRecordPayment={handleRecordPayment}
          onClose={() => setViewingFee(null)}
        />
      )}

      {deletingFee && (
        <ConfirmDialog
          title="Delete this fee record?"
          message={`This removes the ${formatCurrency(deletingFee.amount)} fee for ${deletingFee.studentName}. Any linked payments will no longer be associated with an active fee.`}
          confirmLabel="Delete Fee"
          onConfirm={handleDeleteFee}
          onCancel={() => setDeletingFee(null)}
        />
      )}
    </FadeIn>
  );
};

export default FeeManagement;