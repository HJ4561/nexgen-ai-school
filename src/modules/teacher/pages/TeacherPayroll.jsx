// src/modules/teacher/pages/TeacherPayroll.jsx

/**
 * ============================================
 * TEACHER PAYROLL PAGE - FULLY FUNCTIONAL
 * ============================================
 * 
 * Purpose: View payroll and salary history
 * Used by: Teacher module routes
 * 
 * Features:
 * - View payroll records with real API data
 * - View salary history with changed_by_name
 * - View payroll summary statistics
 * - Filter by month/year
 * - Card and Table views
 * - Download payslip as PDF/HTML
 * - Print payslip
 * - Responsive design
 * - Toast notifications
 * - Loading states
 * 
 * API Endpoints (from Smart_School_API_Documentation):
 * - GET /api/hr/payroll/ - Get payroll records
 * - GET /api/hr/salary-history/ - Get salary history
 * - GET /api/hr/payroll/summary/ - Get payroll summary
 * 
 * USAGE OF NEW API FIELDS:
 * - employee_name instead of employee?.name
 * - changed_by_name instead of changed_by?.name (nullable)
 * - employee_name in salary history
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { toast } from "react-hot-toast";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  FileText,
  Grid,
  List,
  X,
  Printer,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  PieChart,
  Banknote,
  Building2,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Redux ──────────────────────────────────────────────────────────────
import {
  fetchPayroll,
  fetchSalaryHistory,
  fetchPayrollSummary,
} from "../store/teacherThunks";

import {
  selectTeacherPayroll,
  selectTeacherSalaryHistory,
  selectTeacherLoading,
  selectTeacherSubmitting,
  selectTeacherError,
  selectTeacherSuccessMessage,
  selectTeacherProfile,
  selectTeacherPayrollSummary,
} from "../store/teacherSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

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

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "Rs. 0";
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount === 0) return "Rs. 0";
  
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};

const getMonthName = (monthString) => {
  if (!monthString) return "—";
  const [year, month] = monthString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
};

const getStatusBadge = (status) => {
  const statusMap = {
    paid: {
      icon: <CheckCircle className="w-3 h-3" />,
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Paid",
    },
    pending: {
      icon: <Clock className="w-3 h-3" />,
      className: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Pending",
    },
    failed: {
      icon: <AlertCircle className="w-3 h-3" />,
      className: "bg-red-100 text-red-700 border-red-200",
      label: "Failed",
    },
  };

  const config = statusMap[status] || statusMap.paid;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

const getInitials = (name) => {
  if (!name || name === "Unknown") return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getRandomColor = (id) => {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-pink-100 text-pink-700",
  ];
  return colors[(id || 0) % colors.length] || colors[0];
};

// ─── Animation Variants ──────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, subtitle, icon: Icon, color, isLoading, trend }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    teal: "bg-teal-50 text-teal-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
    gray: "bg-gray-50 text-gray-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          {isLoading ? (
            <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          )}
          {subtitle && !isLoading && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colors[color] || 'from-gray-100 to-gray-200'} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colors[color] ? 'text-' + color + '-600' : 'text-gray-600'}`} />
        </div>
      </div>
      {trend !== undefined && trend !== null && !isLoading && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'}`}>
          {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : '0%'} from last month
        </div>
      )}
    </motion.div>
  );
};

// ─── Payslip Generator ─────────────────────────────────────────────────

const generatePayslipHTML = (payroll, employeeName, schoolName = "Smart School") => {
  const totalEarnings = (payroll.basic_salary || 0) + (payroll.allowances || 0);
  const totalDeductions = payroll.deductions || 0;
  const netPay = payroll.net_salary || 0;
  const monthName = getMonthName(payroll.month);
  const paidDate = formatDate(payroll.paid_date);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payslip - ${monthName}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .payslip {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669, #0d9488);
          padding: 30px 40px;
          color: white;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header .subtitle {
          font-size: 14px;
          opacity: 0.85;
          margin-top: 4px;
        }
        .header .meta {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 13px;
          opacity: 0.9;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 12px;
        }
        .content { padding: 30px 40px; }
        .employee-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: #f8fafc;
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 24px;
        }
        .employee-info .label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .employee-info .value {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .summary-item {
          background: #f8fafc;
          padding: 16px;
          border-radius: 10px;
          text-align: center;
        }
        .summary-item .amount {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 4px;
        }
        .summary-item .amount.green { color: #059669; }
        .summary-item .amount.red { color: #dc2626; }
        .summary-item .label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .breakdown {
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .breakdown .row {
          display: flex;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .breakdown .row:last-child { border-bottom: none; }
        .breakdown .row .label { color: #475569; font-size: 14px; }
        .breakdown .row .value { font-weight: 600; color: #0f172a; font-size: 14px; }
        .breakdown .row.total {
          background: #f8fafc;
          font-weight: 700;
          padding: 12px 16px;
        }
        .breakdown .row.total .label { font-weight: 700; color: #0f172a; }
        .breakdown .row.total .value { color: #059669; font-size: 16px; }
        .footer {
          padding: 16px 40px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        @media (max-width: 600px) {
          .header { padding: 20px; }
          .content { padding: 20px; }
          .employee-info { grid-template-columns: 1fr; }
          .summary-grid { grid-template-columns: 1fr; }
          .footer { padding: 12px 20px; }
        }
        .print-button {
          position: fixed;
          bottom: 30px;
          right: 30px;
          background: #059669;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
          transition: all 0.3s;
          z-index: 1000;
        }
        .print-button:hover {
          background: #047857;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.5);
        }
        @media print {
          body { background: white; padding: 20px; }
          .print-button { display: none; }
          .payslip { box-shadow: none; border: 1px solid #e2e8f0; }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">
        🖨️ Print Payslip
      </button>
      <div class="payslip">
        <div class="header">
          <h1>${schoolName}</h1>
          <div class="subtitle">Official Payslip</div>
          <div class="meta">
            <span>📅 ${monthName}</span>
            <span>📄 Payslip #${payroll.id || 'N/A'}</span>
            <span>📆 ${paidDate}</span>
          </div>
        </div>
        <div class="content">
          <div class="employee-info">
            <div>
              <div class="label">Employee</div>
              <div class="value">${employeeName || 'You'}</div>
            </div>
            <div>
              <div class="label">Status</div>
              <div class="value" style="color: #059669;">Paid</div>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Total Earnings</div>
              <div class="amount green">${formatCurrency(totalEarnings)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Deductions</div>
              <div class="amount red">${formatCurrency(totalDeductions)}</div>
            </div>
            <div class="summary-item">
              <div class="label">Net Pay</div>
              <div class="amount" style="color: #0f172a;">${formatCurrency(netPay)}</div>
            </div>
          </div>

          <div class="breakdown">
            <div class="row">
              <span class="label">Basic Salary</span>
              <span class="value">${formatCurrency(payroll.basic_salary || 0)}</span>
            </div>
            ${payroll.allowances > 0 ? `
            <div class="row">
              <span class="label">Allowances</span>
              <span class="value">${formatCurrency(payroll.allowances)}</span>
            </div>` : ''}
            ${payroll.bonus > 0 ? `
            <div class="row">
              <span class="label">Bonus</span>
              <span class="value">${formatCurrency(payroll.bonus)}</span>
            </div>` : ''}
            ${payroll.deductions > 0 ? `
            <div class="row">
              <span class="label">Deductions</span>
              <span class="value" style="color: #dc2626;">${formatCurrency(payroll.deductions)}</span>
            </div>` : ''}
            ${payroll.tax > 0 ? `
            <div class="row">
              <span class="label">Tax</span>
              <span class="value" style="color: #dc2626;">${formatCurrency(payroll.tax)}</span>
            </div>` : ''}
            <div class="row total">
              <span class="label">Net Pay</span>
              <span class="value">${formatCurrency(netPay)}</span>
            </div>
          </div>
        </div>
        <div class="footer">
          This is a computer-generated payslip. No signature required.
          <br>
          Generated on ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
};

// ─── Payroll Detail Modal ──────────────────────────────────────────────

const PayrollDetailModal = ({ isOpen, payroll, onClose, onDownload }) => {
  if (!isOpen || !payroll) return null;

  const totalEarnings = (payroll.basic_salary || 0) + (payroll.allowances || 0);
  const totalDeductions = payroll.deductions || 0;
  const netPay = payroll.net_salary || 0;
  
  const employeeName = payroll.employee_name || payroll.employee?.name || 'You';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-lg bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Payroll Details</p>
                <h3 className="text-base sm:text-lg font-bold">{getMonthName(payroll.month)}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(payroll.status || 'paid')}
          </div>

          {employeeName && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Employee</p>
                <p className="text-sm font-medium text-gray-800">{employeeName}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500">Net Pay</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(netPay)}</p>
            {payroll.paid_date && (
              <p className="text-xs text-gray-400 mt-1">Paid on {formatDate(payroll.paid_date)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Earnings</p>
              <p className="text-sm font-semibold text-emerald-700 mt-1">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">Deductions</p>
              <p className="text-sm font-semibold text-red-700 mt-1">{formatCurrency(totalDeductions)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings Breakdown</p>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">{formatCurrency(payroll.basic_salary || 0)}</span>
              </div>
              {payroll.allowances > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allowances</span>
                  <span className="font-medium">{formatCurrency(payroll.allowances)}</span>
                </div>
              )}
              {payroll.bonus > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bonus</span>
                  <span className="font-medium">{formatCurrency(payroll.bonus)}</span>
                </div>
              )}
            </div>
          </div>

          {payroll.deductions > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</p>
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Deductions</span>
                  <span className="font-medium">{formatCurrency(payroll.deductions || 0)}</span>
                </div>
                {payroll.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(payroll.tax)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400">
            {payroll.created_at && <p>Created: {formatDateTime(payroll.created_at)}</p>}
            {payroll.updated_at && <p>Updated: {formatDateTime(payroll.updated_at)}</p>}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto order-last sm:order-first"
          >
            Close
          </button>
          <button
            onClick={() => onDownload(payroll)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Download Payslip
          </button>
          <button
            onClick={() => onDownload(payroll, true)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Salary History Modal ──────────────────────────────────────────────

const SalaryHistoryModal = ({ isOpen, history, onClose }) => {
  if (!isOpen || !history || history.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-[95%] sm:max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-xl sm:rounded-t-2xl px-4 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80">Salary History</p>
                <h3 className="text-base sm:text-lg font-bold">All Salary Changes</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {history.map((item, index) => {
              const changedByName = item.changed_by_name || item.changed_by?.name || 'System';
              const employeeName = item.employee_name || item.employee?.name || null;
              
              return (
                <div key={item.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDateTime(item.created_at)}
                      </p>
                      {employeeName && (
                        <p className="text-xs text-gray-500">Employee: {employeeName}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">{item.reason || 'Salary adjustment'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through">{formatCurrency(item.old_salary)}</span>
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.new_salary)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Changed by: {changedByName}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {history.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No salary history available</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

export default function TeacherPayroll() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // ─── Redux State ──────────────────────────────────────────────────────
  const payroll = useSelector(selectTeacherPayroll);
  const salaryHistory = useSelector(selectTeacherSalaryHistory);
  const payrollSummary = useSelector(selectTeacherPayrollSummary);
  const loading = useSelector(selectTeacherLoading);
  const submitting = useSelector(selectTeacherSubmitting);
  const error = useSelector(selectTeacherError);
  const successMessage = useSelector(selectTeacherSuccessMessage);
  const profile = useSelector(selectTeacherProfile);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("card");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    try {
      console.log('📊 Fetching payroll data...');
      
      await Promise.all([
        dispatch(fetchPayroll()),
        dispatch(fetchSalaryHistory()),
        dispatch(fetchPayrollSummary()),
      ]);
      
      setDataFetched(true);
      console.log('✅ Payroll data fetched successfully');
    } catch (err) {
      console.error("❌ Failed to fetch data:", err);
      toast.error("Failed to load payroll. Please refresh.");
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // ─── GSAP Animations ──────────────────────────────────────────────────

  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // ─── Computed Values ─────────────────────────────────────────────────

  const filteredPayroll = useMemo(() => {
    let filtered = Array.isArray(payroll) ? [...payroll] : [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.month || "").toLowerCase().includes(search) ||
        (p.employee_name || "").toLowerCase().includes(search)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(p => (p.status || 'paid') === filterStatus);
    }

    return filtered;
  }, [payroll, searchTerm, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredPayroll.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredPayroll.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const payrollArray = Array.isArray(payroll) ? payroll : [];
    
    const total = payrollArray.length;
    const paid = payrollArray.filter(p => (p.status || 'paid') === 'paid').length;
    const pending = payrollArray.filter(p => p.status === 'pending').length;
    const failed = payrollArray.filter(p => p.status === 'failed').length;
    
    let totalEarnings = 0;
    let totalDeductions = 0;
    let totalNetPay = 0;
    
    payrollArray.forEach(p => {
      totalEarnings += (p.basic_salary || 0) + (p.allowances || 0);
      totalDeductions += (p.deductions || 0);
      totalNetPay += (p.net_salary || 0);
    });

    return {
      total,
      paid,
      pending,
      failed,
      totalEarnings,
      totalDeductions,
      netPay: totalNetPay,
    };
  }, [payroll]);

  // Use payrollSummary from Redux if available, otherwise use calculated stats
  const summary = useMemo(() => {
    if (payrollSummary && Object.keys(payrollSummary).length > 0) {
      return payrollSummary;
    }
    return {
      total_earnings: stats.totalEarnings,
      total_deductions: stats.totalDeductions,
      net_pay: stats.netPay,
      total_paid: stats.paid,
      total_pending: stats.pending,
      total_records: stats.total,
      average_salary: stats.total > 0 ? Math.round(stats.netPay / stats.total) : 0,
      last_payment_date: payroll.length > 0 ? payroll[0]?.paid_date : null,
    };
  }, [payrollSummary, stats, payroll]);

  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleViewPayroll = (payrollItem) => {
    setSelectedPayroll(payrollItem);
    setIsDetailOpen(true);
  };

  const handleDownloadPayslip = useCallback(async (payrollItem, print = false) => {
    setDownloading(true);
    try {
      const employeeName = payrollItem.employee_name || profile?.name || 'Employee';
      const schoolName = import.meta.env.VITE_SCHOOL_NAME || 'Smart School';
      
      const htmlContent = generatePayslipHTML(payrollItem, employeeName, schoolName);
      
      if (print) {
        // Open in new window and print
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          toast.error("Please allow popups to print payslip");
        }
        return;
      }

      // Download as HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const monthName = getMonthName(payrollItem.month).replace(/\s/g, '_');
      link.download = `Payslip_${monthName}_${payrollItem.id || 'N/A'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Payslip downloaded successfully!");
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast.error("Failed to download payslip. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [profile]);

  const handleViewHistory = () => {
    setIsHistoryOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDataFetched(false);
    await fetchAllData();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
    setShowFilters(false);
  };

  // ─── Loading State ────────────────────────────────────────────────────

  if (loading && !dataFetched && payroll.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading payroll...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto py-4 sm:py-6">
      
      {/* ─── Page Header ──────────────────────────────────────────────── */}
      <PageHeader
        title="Payroll"
        subtitle="View your salary and payment history"
        breadcrumbs={["Teacher", "Payroll"]}
        bgColor="bg-emerald-50"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing || loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleViewHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all"
            >
              <History className="h-4 w-4" />
              <span className="hidden xs:inline">Salary History</span>
              <span className="xs:hidden">History</span>
            </button>
          </div>
        }
      />

      {/* ─── Success/Error Messages ────────────────────────────────── */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{successMessage}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </motion.div>
      )}

      {/* ─── Stats Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Records"
          value={summary.total_records || stats.total}
          icon={FileText}
          color="blue"
          isLoading={loading}
        />
        <StatCard
          title="Paid"
          value={summary.total_paid || stats.paid}
          icon={CheckCircle}
          color="emerald"
          isLoading={loading}
        />
        <StatCard
          title="Pending"
          value={summary.total_pending || stats.pending}
          icon={Clock}
          color="amber"
          isLoading={loading}
        />
        <StatCard
          title="Net Pay"
          value={formatCurrency(summary.net_pay || stats.netPay)}
          icon={Wallet}
          color="purple"
          isLoading={loading}
        />
        <StatCard
          title="Avg Salary"
          value={formatCurrency(summary.average_salary || 0)}
          icon={DollarSign}
          color="indigo"
          isLoading={loading}
        />
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by month or employee..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Card View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showFilters || hasActiveFilters
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center">
                  {(filterStatus !== "all" ? 1 : 0) + (searchTerm ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["all", "paid", "pending", "failed"].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                          className={`px-3 py-1.5 text-xs rounded-lg transition-all capitalize ${
                            filterStatus === status
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === "all" ? "All" : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quick Stats</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">{filteredPayroll.length}</p>
                        <p className="text-[10px] text-gray-500">Filtered</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-sm font-semibold text-gray-800">{stats.paid}</p>
                        <p className="text-[10px] text-gray-500">Paid</p>
                      </div>
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
                    >
                      <X className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Results Summary ─────────────────────────────────────────── */}
      {filteredPayroll.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-5 border border-emerald-100"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Payroll Overview</p>
                <p className="text-xs text-gray-500">
                  {filteredPayroll.length} records • 
                  <span className="text-emerald-600 ml-1">{stats.paid} paid</span>
                  {stats.pending > 0 && <span className="text-amber-600 ml-1">{stats.pending} pending</span>}
                  {stats.failed > 0 && <span className="text-red-600 ml-1">{stats.failed} failed</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-200 text-emerald-800 text-xs font-medium rounded-full">
                {filteredPayroll.length} Total
              </span>
              {summary.last_payment_date && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  Last: {formatDate(summary.last_payment_date)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Payroll List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredPayroll.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-gray-100">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {hasActiveFilters ? "No matching records found" : "No payroll records"}
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {hasActiveFilters 
              ? "Try adjusting your search or filters to see more results."
              : "You don't have any payroll records yet."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "card" ? (
        // ─── Card View ──────────────────────────────────────────────
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {pageItems.map((record) => {
            const totalEarnings = (record.basic_salary || 0) + (record.allowances || 0);
            const totalDeductions = record.deductions || 0;
            const netPay = record.net_salary || 0;
            const employeeName = record.employee_name || record.employee?.name || null;
            const status = record.status || 'paid';
            
            return (
              <motion.div
                key={record.id}
                variants={itemVariants}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 hover:shadow-md transition-all duration-200 ${
                  status === 'paid' ? 'border-gray-100' : 
                  status === 'pending' ? 'border-amber-200 bg-amber-50/20' : 
                  'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {getMonthName(record.month)}
                      </h4>
                      {employeeName && (
                        <p className="text-xs text-gray-500">Employee: {employeeName}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatDate(record.paid_date)}
                      </p>
                    </div>
                    {getStatusBadge(status)}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Net Pay</span>
                      <span className="font-bold text-gray-900">{formatCurrency(netPay)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Earnings: {formatCurrency(totalEarnings)}</span>
                      <span>Deductions: {formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewPayroll(record)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </button>
                    <button
                      onClick={() => handleDownloadPayslip(record)}
                      disabled={downloading}
                      className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                      title="Download Payslip"
                    >
                      {downloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // ─── Table View ──────────────────────────────────────────────
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earnings</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((record) => {
                  const totalEarnings = (record.basic_salary || 0) + (record.allowances || 0);
                  const totalDeductions = record.deductions || 0;
                  const netPay = record.net_salary || 0;
                  const employeeName = record.employee_name || record.employee?.name || '—';
                  const status = record.status || 'paid';
                  
                  return (
                    <tr key={record.id} className={`hover:bg-gray-50 transition-colors ${
                      status === 'pending' ? 'bg-amber-50/20' : 
                      status === 'failed' ? 'bg-red-50/20' : ''
                    }`}>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-800">
                          {getMonthName(record.month)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{employeeName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {formatDate(record.paid_date)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-emerald-600">{formatCurrency(totalEarnings)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-red-600">{formatCurrency(totalDeductions)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(netPay)}</span>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewPayroll(record)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPayslip(record)}
                            disabled={downloading}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                            title="Download Payslip"
                          >
                            {downloading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-gray-500">
              {filteredPayroll.length} records • 
              <span className="text-emerald-600 ml-1">{stats.paid} paid</span>
              {stats.pending > 0 && <span className="text-amber-600 ml-1">{stats.pending} pending</span>}
              {stats.failed > 0 && <span className="text-red-600 ml-1">{stats.failed} failed</span>}
            </div>
            <div className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Pagination ─────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-500">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredPayroll.length)}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredPayroll.length)} of {filteredPayroll.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-gray-400 py-4">
        <p>© 2024 Smart School Management System • Payroll Module</p>
        <p className="mt-1">
          {filteredPayroll.length} records • 
          {filterStatus !== "all" ? ` Status: ${filterStatus}` : " All"}
          {searchTerm ? ` • Search: "${searchTerm}"` : ""}
        </p>
      </div>

      {/* ─── Payroll Detail Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isDetailOpen && selectedPayroll && (
          <PayrollDetailModal
            isOpen={isDetailOpen}
            payroll={selectedPayroll}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedPayroll(null);
            }}
            onDownload={handleDownloadPayslip}
          />
        )}
      </AnimatePresence>

      {/* ─── Salary History Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isHistoryOpen && (
          <SalaryHistoryModal
            isOpen={isHistoryOpen}
            history={salaryHistory}
            onClose={() => setIsHistoryOpen(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}