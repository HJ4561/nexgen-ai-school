// src/modules/admin/pages/HR/index.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, X, RefreshCw, AlertCircle, CheckCircle,
  Edit, Trash2, Eye, Search, Filter, ChevronDown,
  Building2, Users, Calendar, DollarSign, TrendingUp,
  User, Briefcase, Clock, FileText, Award, CreditCard,
  CalendarDays, UserCheck, UserX, Mail, Phone, MapPin
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Constants ──────────────────────────────────────────────────────────
const DEPARTMENTS_API = "/hr/departments/";
const EMPLOYEES_API = "/hr/employees/";
const LEAVES_API = "/hr/leaves/";
const PAYROLL_API = "/hr/payroll/";
const USERS_API = "/users/users/";

// ─── Constants ──────────────────────────────────────────────────────────────
const LEAVE_TYPES = {
  sick: { label: "Sick Leave", color: "bg-red-50 text-red-700 border-red-200" },
  casual: { label: "Casual Leave", color: "bg-blue-50 text-blue-700 border-blue-200" },
  annual: { label: "Annual Leave", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  maternity: { label: "Maternity Leave", color: "bg-purple-50 text-purple-700 border-purple-200" },
  paternity: { label: "Paternity Leave", color: "bg-amber-50 text-amber-700 border-amber-200" },
  unpaid: { label: "Unpaid Leave", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const LEAVE_STATUS = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", color: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const EMPLOYEE_STATUS = {
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  inactive: { label: "Inactive", color: "bg-gray-50 text-gray-700 border-gray-200" },
  on_leave: { label: "On Leave", color: "bg-amber-50 text-amber-700 border-amber-200" },
  terminated: { label: "Terminated", color: "bg-red-50 text-red-700 border-red-200" },
};

const PAYMENT_METHODS = {
  bank: { label: "Bank Transfer", color: "bg-blue-50 text-blue-700 border-blue-200" },
  cash: { label: "Cash", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cheque: { label: "Cheque", color: "bg-purple-50 text-purple-700 border-purple-200" },
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
    return dateString;
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
    return dateString;
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── Tab Configuration ──────────────────────────────────────────────────────
const TABS = [
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "employees", label: "Employees", icon: Users },
  { id: "leaves", label: "Leaves", icon: Calendar },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "performance", label: "Performance", icon: TrendingUp },
];

// ─── Department Modal ──────────────────────────────────────────────────────
const DepartmentModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Create Department" : "Edit Department"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Department Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Computer Science"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Department description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.name} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Create Department" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Employee Modal ──────────────────────────────────────────────────────
const EmployeeModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, departments, users }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Employee" : "Edit Employee"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User <span className="text-red-500">*</span></label>
            <select
              value={formData.user || ""}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select user...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.name || u.username || `User ${u.id}`} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Designation <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Senior Teacher"
              value={formData.designation || ""}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Department <span className="text-red-500">*</span></label>
            <select
              value={formData.department || ""}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select department...</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Salary <span className="text-red-500">*</span></label>
            <input
              type="number"
              placeholder="e.g., 60000"
              value={formData.salary || ""}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Join Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.join_date || ""}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status || "active"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Leave Balance</label>
            <input
              type="number"
              placeholder="e.g., 20"
              value={formData.leave_balance || ""}
              onChange={(e) => setFormData({ ...formData, leave_balance: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.user || !formData.designation || !formData.department || !formData.salary || !formData.join_date} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Employee" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Leave Modal ──────────────────────────────────────────────────────────
const LeaveModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, employees }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Request Leave" : "Update Leave"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Employee <span className="text-red-500">*</span></label>
            <select
              value={formData.employee || ""}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select employee...</option>
              {employees.map(e => {
                const userName = e.user_name || e.name || `Employee ${e.id}`;
                return <option key={e.id} value={e.id}>{userName}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Leave Type <span className="text-red-500">*</span></label>
            <select
              value={formData.leave_type || "casual"}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {Object.entries(LEAVE_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
            <textarea
              rows={2}
              placeholder="Reason for leave..."
              value={formData.reason || ""}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status || "pending"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.employee || !formData.leave_type || !formData.start_date || !formData.end_date} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Request Leave" : "Update Leave"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Payroll Modal ──────────────────────────────────────────────────────
const PayrollModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, employees }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Create Payroll" : "Edit Payroll"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Employee <span className="text-red-500">*</span></label>
            <select
              value={formData.employee || ""}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select employee...</option>
              {employees.map(e => {
                const userName = e.user_name || e.name || `Employee ${e.id}`;
                return <option key={e.id} value={e.id}>{userName}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Month <span className="text-red-500">*</span></label>
            <input
              type="month"
              value={formData.month || ""}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Basic Salary <span className="text-red-500">*</span></label>
              <input
                type="number"
                placeholder="e.g., 60000"
                value={formData.basic_salary || ""}
                onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Allowances</label>
              <input
                type="number"
                placeholder="e.g., 5000"
                value={formData.allowances || ""}
                onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Deductions</label>
              <input
                type="number"
                placeholder="e.g., 1000"
                value={formData.deductions || ""}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paid Date</label>
              <input
                type="date"
                value={formData.paid_date || ""}
                onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.employee || !formData.month || !formData.basic_salary} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Create Payroll" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Details Modal ──────────────────────────────────────────────────────
const DetailsModal = ({ isOpen, onClose, data, type, employees, departments, users }) => {
  if (!isOpen || !data) return null;

  const getUserName = (userId) => {
    if (!userId) return "—";
    const user = users?.find(u => u.id === userId);
    return user?.full_name || user?.name || user?.username || "—";
  };

  const getUserEmail = (userId) => {
    if (!userId) return "—";
    const user = users?.find(u => u.id === userId);
    return user?.email || "—";
  };

  const getEmployeeName = (employeeId) => {
    if (!employeeId) return "—";
    const emp = employees?.find(e => e.id === employeeId);
    if (emp) {
      return getUserName(emp.user);
    }
    return "—";
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentId) return "—";
    const dept = departments?.find(d => d.id === departmentId);
    return dept?.name || "—";
  };

  const renderContent = () => {
    switch (type) {
      case "employee":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 mt-1">{getUserName(data.user)}</p></div>
            <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-gray-800 mt-1">{getUserEmail(data.user)}</p></div>
            <div><p className="text-xs text-gray-500">Designation</p><p className="font-medium text-gray-800 mt-1">{data.designation || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Department</p><p className="font-medium text-gray-800 mt-1">{getDepartmentName(data.department)}</p></div>
            <div><p className="text-xs text-gray-500">Salary</p><p className="font-medium text-gray-800 mt-1">{formatCurrency(data.salary)}</p></div>
            <div><p className="text-xs text-gray-500">Join Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(data.join_date)}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><Badge className={`${EMPLOYEE_STATUS[data.status]?.color || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{EMPLOYEE_STATUS[data.status]?.label || data.status}</Badge></div>
            <div><p className="text-xs text-gray-500">Leave Balance</p><p className="font-medium text-gray-800 mt-1">{data.leave_balance || 0}</p></div>
          </div>
        );
      case "leave":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Employee</p><p className="font-medium text-gray-800 mt-1">{getEmployeeName(data.employee)}</p></div>
            <div><p className="text-xs text-gray-500">Leave Type</p><Badge className={`${LEAVE_TYPES[data.leave_type]?.color || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{LEAVE_TYPES[data.leave_type]?.label || data.leave_type}</Badge></div>
            <div><p className="text-xs text-gray-500">Start Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(data.start_date)}</p></div>
            <div><p className="text-xs text-gray-500">End Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(data.end_date)}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><Badge className={`${LEAVE_STATUS[data.status]?.color || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{LEAVE_STATUS[data.status]?.label || data.status}</Badge></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Reason</p><p className="text-gray-600 mt-1">{data.reason || "—"}</p></div>
          </div>
        );
      case "payroll":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Employee</p><p className="font-medium text-gray-800 mt-1">{getEmployeeName(data.employee)}</p></div>
            <div><p className="text-xs text-gray-500">Month</p><p className="font-medium text-gray-800 mt-1">{data.month || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Basic Salary</p><p className="font-medium text-gray-800 mt-1">{formatCurrency(data.basic_salary)}</p></div>
            <div><p className="text-xs text-gray-500">Allowances</p><p className="font-medium text-gray-800 mt-1">{formatCurrency(data.allowances || 0)}</p></div>
            <div><p className="text-xs text-gray-500">Deductions</p><p className="font-medium text-gray-800 mt-1">{formatCurrency(data.deductions || 0)}</p></div>
            <div><p className="text-xs text-gray-500">Net Pay</p><p className="font-medium text-green-600 mt-1">{formatCurrency((data.basic_salary || 0) + (data.allowances || 0) - (data.deductions || 0))}</p></div>
            <div><p className="text-xs text-gray-500">Paid Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(data.paid_date)}</p></div>
          </div>
        );
      case "department":
        return (
          <div className="space-y-4">
            <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 mt-1">{data.name || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Description</p><p className="text-gray-600 mt-1">{data.description || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600 mt-1">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      default:
        return <p>No details available</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            {type === "department" && <Building2 className="w-5 h-5 text-blue-600" />}
            {type === "employee" && <User className="w-5 h-5 text-blue-600" />}
            {type === "leave" && <Calendar className="w-5 h-5 text-blue-600" />}
            {type === "payroll" && <DollarSign className="w-5 h-5 text-blue-600" />}
            {type === "department" ? "Department Details" : 
             type === "employee" ? "Employee Details" : 
             type === "leave" ? "Leave Details" : "Payroll Details"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main HR Component ─────────────────────────────────────────────────────
const HR = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("departments");
  
  // Data States
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLeaveType, setFilterLeaveType] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selection
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Delete
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalType, setModalType] = useState("department");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({});
  
  const itemsPerPage = 10;

  // ─── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptsRes, employeesRes, leavesRes, payrollRes, usersRes] = await Promise.all([
        api.get(DEPARTMENTS_API),
        api.get(EMPLOYEES_API),
        api.get(LEAVES_API),
        api.get(PAYROLL_API),
        api.get(USERS_API),
      ]);
      
      // Handle paginated responses
      const deptsData = deptsRes.data?.results || deptsRes.data || [];
      const employeesData = employeesRes.data?.results || employeesRes.data || [];
      const leavesData = leavesRes.data?.results || leavesRes.data || [];
      const payrollData = payrollRes.data?.results || payrollRes.data || [];
      const usersData = usersRes.data?.results || usersRes.data || [];
      
      setDepartments(deptsData);
      setEmployees(employeesData);
      setLeaves(leavesData);
      setPayroll(payrollData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch HR data:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(error.response?.data?.detail || "Failed to load HR data");
      }
      setDepartments([]);
      setEmployees([]);
      setLeaves([]);
      setPayroll([]);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    showToast("HR data refreshed", "success");
  };

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getUserName = useCallback((userId) => {
    if (!userId) return "—";
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.name || user?.username || "—";
  }, [users]);

  const getUserEmail = useCallback((userId) => {
    if (!userId) return "—";
    const user = users.find(u => u.id === userId);
    return user?.email || "—";
  }, [users]);

  const getDepartmentName = useCallback((deptId) => {
    if (!deptId) return "—";
    const dept = departments.find(d => d.id === deptId);
    return dept?.name || "—";
  }, [departments]);

  const getEmployeeName = useCallback((employeeId) => {
    if (!employeeId) return "—";
    const emp = employees.find(e => e.id === employeeId);
    if (emp) {
      return getUserName(emp.user);
    }
    return "—";
  }, [employees, getUserName]);

  // ─── Filtered Data ─────────────────────────────────────────────────────
  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (dept.name?.toLowerCase() || "").includes(search) ||
             (dept.description?.toLowerCase() || "").includes(search);
    });
  }, [departments, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      if (filterDepartment !== "all" && emp.department !== parseInt(filterDepartment)) return false;
      if (filterStatus !== "all" && emp.status !== filterStatus) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const userName = getUserName(emp.user).toLowerCase();
      const deptName = getDepartmentName(emp.department).toLowerCase();
      return userName.includes(search) ||
             (emp.designation?.toLowerCase() || "").includes(search) ||
             deptName.includes(search);
    });
  }, [employees, searchTerm, filterStatus, filterDepartment, getUserName, getDepartmentName]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      if (filterStatus !== "all" && leave.status !== filterStatus) return false;
      if (filterLeaveType !== "all" && leave.leave_type !== filterLeaveType) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const empName = getEmployeeName(leave.employee).toLowerCase();
      return empName.includes(search) ||
             (leave.reason?.toLowerCase() || "").includes(search) ||
             (leave.leave_type?.toLowerCase() || "").includes(search);
    });
  }, [leaves, searchTerm, filterStatus, filterLeaveType, getEmployeeName]);

  const filteredPayroll = useMemo(() => {
    return payroll.filter(p => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const empName = getEmployeeName(p.employee).toLowerCase();
      return empName.includes(search) ||
             (p.month?.toLowerCase() || "").includes(search);
    });
  }, [payroll, searchTerm, getEmployeeName]);

  // ─── Pagination ────────────────────────────────────────────────────────
  const getPageItems = (items) => {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      items: items.slice(startIndex, startIndex + itemsPerPage),
      totalPages,
      startIndex,
    };
  };

  const deptPage = getPageItems(filteredDepartments);
  const empPage = getPageItems(filteredEmployees);
  const leavePage = getPageItems(filteredLeaves);
  const payrollPage = getPageItems(filteredPayroll);

  // ─── Stats ─────────────────────────────────────────────────────────────
const stats = useMemo(() => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const pendingLeaves = leaves.filter(l => l.status === "pending").length;
  
  // Safer payroll calculation with proper number parsing
  const totalPayroll = payroll.reduce((sum, p) => {
    const basic = parseFloat(p.basic_salary) || 0;
    const allowances = parseFloat(p.allowances) || 0;
    const deductions = parseFloat(p.deductions) || 0;
    const netPay = basic + allowances - deductions;
    return sum + netPay;
  }, 0);
  
  return { totalEmployees, activeEmployees, pendingLeaves, totalPayroll };
}, [employees, leaves, payroll]);

  // ─── CRUD Operations ──────────────────────────────────────────────────
  
  // ─── Department CRUD ──────────────────────────────────────────────────
  const handleSaveDepartment = async () => {
    if (!formData.name) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || "",
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${DEPARTMENTS_API}${selectedItem.id}/`, payload);
        setDepartments(departments.map(d => d.id === selectedItem.id ? { ...d, ...response.data } : d));
        showToast("Department updated successfully", "success");
      } else {
        const response = await api.post(DEPARTMENTS_API, payload);
        setDepartments([response.data, ...departments]);
        showToast("Department created successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save department:", error);
      showToast(error.response?.data?.detail || "Failed to save department", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${DEPARTMENTS_API}${deletingItem.id}/`);
      setDepartments(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Department deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
      showToast(error.response?.data?.detail || "Failed to delete department", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Employee CRUD ──────────────────────────────────────────────────
  const handleSaveEmployee = async () => {
    if (!formData.user || !formData.designation || !formData.department || !formData.salary || !formData.join_date) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        user: parseInt(formData.user),
        designation: formData.designation,
        department: parseInt(formData.department),
        salary: parseFloat(formData.salary),
        join_date: formData.join_date,
        status: formData.status || "active",
        leave_balance: parseInt(formData.leave_balance) || 20,
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${EMPLOYEES_API}${selectedItem.id}/`, payload);
        setEmployees(employees.map(e => e.id === selectedItem.id ? { ...e, ...response.data } : e));
        showToast("Employee updated successfully", "success");
      } else {
        const response = await api.post(EMPLOYEES_API, payload);
        setEmployees([response.data, ...employees]);
        showToast("Employee added successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save employee:", error);
      showToast(error.response?.data?.detail || "Failed to save employee", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${EMPLOYEES_API}${deletingItem.id}/`);
      setEmployees(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Employee deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      showToast(error.response?.data?.detail || "Failed to delete employee", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Leave CRUD ──────────────────────────────────────────────────────
  const handleSaveLeave = async () => {
    if (!formData.employee || !formData.leave_type || !formData.start_date || !formData.end_date) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee: parseInt(formData.employee),
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason || "",
        status: formData.status || "pending",
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${LEAVES_API}${selectedItem.id}/`, payload);
        setLeaves(leaves.map(l => l.id === selectedItem.id ? { ...l, ...response.data } : l));
        showToast("Leave updated successfully", "success");
      } else {
        const response = await api.post(LEAVES_API, payload);
        setLeaves([response.data, ...leaves]);
        showToast("Leave request created successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save leave:", error);
      showToast(error.response?.data?.detail || "Failed to save leave", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLeave = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${LEAVES_API}${deletingItem.id}/`);
      setLeaves(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Leave deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete leave:", error);
      showToast(error.response?.data?.detail || "Failed to delete leave", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Payroll CRUD ──────────────────────────────────────────────────
const handleSavePayroll = async () => {
  if (!formData.employee || !formData.month || !formData.basic_salary) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  setSaving(true);
  try {
    const payload = {
      employee: parseInt(formData.employee),
      month: formData.month,
      basic_salary: parseFloat(formData.basic_salary) || 0,
      allowances: parseFloat(formData.allowances) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      paid_date: formData.paid_date || null,
    };

    if (modalMode === "edit" && selectedItem) {
      const response = await api.patch(`${PAYROLL_API}${selectedItem.id}/`, payload);
      setPayroll(payroll.map(p => p.id === selectedItem.id ? { ...p, ...response.data } : p));
      showToast("Payroll updated successfully", "success");
    } else {
      const response = await api.post(PAYROLL_API, payload);
      setPayroll([response.data, ...payroll]);
      showToast("Payroll created successfully", "success");
    }
    setModalOpen(false);
    setFormData({});
    setSelectedItem(null);
  } catch (error) {
    console.error("Failed to save payroll:", error);
    showToast(error.response?.data?.detail || "Failed to save payroll", "error");
  } finally {
    setSaving(false);
  }
};

  const handleDeletePayroll = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${PAYROLL_API}${deletingItem.id}/`);
      setPayroll(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Payroll deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete payroll:", error);
      showToast(error.response?.data?.detail || "Failed to delete payroll", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Open Modal Helper ──────────────────────────────────────────────
  const openModal = (type, mode, item = null) => {
    setModalType(type);
    setModalMode(mode);
    setSelectedItem(item);
    
    let initialFormData = {};
    
    if (type === "department") {
      initialFormData = { name: "", description: "" };
    } else if (type === "employee") {
      initialFormData = { user: "", designation: "", department: "", salary: "", join_date: "", status: "active", leave_balance: 20 };
    } else if (type === "leave") {
      initialFormData = { employee: "", leave_type: "casual", start_date: "", end_date: "", reason: "", status: "pending" };
    } else if (type === "payroll") {
      initialFormData = { employee: "", month: "", basic_salary: "", allowances: 0, deductions: 0, paid_date: "" };
    }
    
    if (item && mode === "edit") {
      setFormData({ ...item });
    } else {
      setFormData(initialFormData);
    }
    
    setModalOpen(true);
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="Human Resources" subtitle="Manage departments, employees, leaves, and payroll" breadcrumbs={["Admin", "HR"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading HR data...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Human Resources" 
          subtitle={`Manage departments, employees, leaves, and payroll${employees.length > 0 ? ` — ${employees.length} employees` : ""}`}
          breadcrumbs={["Admin", "HR"]}
          action={
            <div className="flex items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button 
                onClick={() => {
                  if (activeTab === "departments") openModal("department", "add");
                  else if (activeTab === "employees") openModal("employee", "add");
                  else if (activeTab === "leaves") openModal("leave", "add");
                  else if (activeTab === "payroll") openModal("payroll", "add");
                }} 
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> 
                {activeTab === "departments" ? "Add Department" : 
                 activeTab === "employees" ? "Add Employee" : 
                 activeTab === "leaves" ? "Request Leave" : "Create Payroll"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading HR data</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Employees</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            <p className="text-xs text-gray-400 mt-1">All staff members</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Employees</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.activeEmployees}</p>
            <p className="text-xs text-gray-400 mt-1">Currently working</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Leaves</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pendingLeaves}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payroll</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalPayroll)}</p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "departments" && departments.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{departments.length}</span>
                  )}
                  {tab.id === "employees" && employees.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{employees.length}</span>
                  )}
                  {tab.id === "leaves" && leaves.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{leaves.length}</span>
                  )}
                  {tab.id === "payroll" && payroll.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{payroll.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── Tab Content ────────────────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* ─── Search & Filters ────────────────────────────────────────── */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "departments" ? "Search departments..." :
                    activeTab === "employees" ? "Search by name, designation, or department..." :
                    activeTab === "leaves" ? "Search by employee or reason..." :
                    "Search by employee or month..."
                  }
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeTab === "employees" && (
                  <>
                    <select value={filterDepartment} onChange={(e) => { setFilterDepartment(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Departments</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Status</option>
                      {Object.entries(EMPLOYEE_STATUS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                    {filterDepartment !== "all" && <button onClick={() => { setFilterDepartment("all"); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
                  </>
                )}
                {activeTab === "leaves" && (
                  <>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Status</option>
                      {Object.entries(LEAVE_STATUS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                    <select value={filterLeaveType} onChange={(e) => { setFilterLeaveType(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Types</option>
                      {Object.entries(LEAVE_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                    {filterStatus !== "all" && <button onClick={() => { setFilterStatus("all"); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── Departments Tab ───────────────────────────────────────── */}
          {activeTab === "departments" && (
            <div className="overflow-x-auto">
              {departments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Departments Found</p><p className="text-sm text-gray-400 mt-1">Create a department to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deptPage.items.map((dept) => (
                      <tr key={dept.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{dept.name}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{dept.description || "—"}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(dept.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(dept); setSelectedType("department"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openModal("department", "edit", dept)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeletingItem(dept); setDeleteType("department"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {departments.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={deptPage.totalPages} startIndex={deptPage.startIndex} itemsShown={deptPage.items.length} totalItems={filteredDepartments.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Employees Tab ──────────────────────────────────────────── */}
          {activeTab === "employees" && (
            <div className="overflow-x-auto">
              {employees.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Employees Found</p><p className="text-sm text-gray-400 mt-1">Add an employee to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {empPage.items.map((emp) => {
                      const statusInfo = EMPLOYEE_STATUS[emp.status] || { label: emp.status, color: "bg-gray-50 text-gray-700 border-gray-200" };
                      return (
                        <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><User className="w-4 h-4 text-blue-600" /></div>
                              <div>
                                <p className="font-medium text-gray-900">{getUserName(emp.user)}</p>
                                <p className="text-xs text-gray-400">{getUserEmail(emp.user)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{emp.designation || "—"}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getDepartmentName(emp.department)}</td>
                          <td className="px-4 py-3.5 text-sm font-medium text-gray-700">{formatCurrency(emp.salary)}</td>
                          <td className="px-4 py-3.5"><Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge></td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedItem(emp); setSelectedType("employee"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => openModal("employee", "edit", emp)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => { setDeletingItem(emp); setDeleteType("employee"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {employees.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={empPage.totalPages} startIndex={empPage.startIndex} itemsShown={empPage.items.length} totalItems={filteredEmployees.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Leaves Tab ────────────────────────────────────────────── */}
          {activeTab === "leaves" && (
            <div className="overflow-x-auto">
              {leaves.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Calendar className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Leave Records Found</p><p className="text-sm text-gray-400 mt-1">Request a leave to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leavePage.items.map((leave) => {
                      const typeInfo = LEAVE_TYPES[leave.leave_type] || { label: leave.leave_type, color: "bg-gray-50 text-gray-700 border-gray-200" };
                      const statusInfo = LEAVE_STATUS[leave.status] || { label: leave.status, color: "bg-gray-50 text-gray-700 border-gray-200" };
                      return (
                        <tr key={leave.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5 font-medium text-gray-900">{getEmployeeName(leave.employee)}</td>
                          <td className="px-4 py-3.5"><Badge className={`${typeInfo.color} text-xs`}>{typeInfo.label}</Badge></td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-700">{formatDate(leave.start_date)}</span>
                              <span className="text-xs text-gray-500">to {formatDate(leave.end_date)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge></td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedItem(leave); setSelectedType("leave"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => openModal("leave", "edit", leave)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => { setDeletingItem(leave); setDeleteType("leave"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {leaves.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={leavePage.totalPages} startIndex={leavePage.startIndex} itemsShown={leavePage.items.length} totalItems={filteredLeaves.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Payroll Tab ────────────────────────────────────────────── */}
{activeTab === "payroll" && (
  <div className="overflow-x-auto">
    {payroll.length === 0 ? (
      <div className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><DollarSign className="w-10 h-10 text-gray-400" /></div>
          <div><p className="text-gray-500 font-medium text-lg">No Payroll Records Found</p><p className="text-sm text-gray-400 mt-1">Create a payroll record to get started.</p></div>
        </div>
      </div>
    ) : (
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Salary</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Allowances</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deductions</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Pay</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {payrollPage.items.map((p) => {
            // Safely calculate net pay with number parsing
            const basic = parseFloat(p.basic_salary) || 0;
            const allowances = parseFloat(p.allowances) || 0;
            const deductions = parseFloat(p.deductions) || 0;
            const netPay = basic + allowances - deductions;
            
            return (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                <td className="px-4 py-3.5 font-medium text-gray-900">{getEmployeeName(p.employee)}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{p.month || "—"}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{formatCurrency(basic)}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{formatCurrency(allowances)}</td>
                <td className="px-4 py-3.5 text-sm text-gray-600">{formatCurrency(deductions)}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-emerald-600">{formatCurrency(netPay)}</td>
                <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setSelectedItem(p); setSelectedType("payroll"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openModal("payroll", "edit", p)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { setDeletingItem(p); setDeleteType("payroll"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
    {payroll.length > 0 && (
      <Pagination currentPage={currentPage} totalPages={payrollPage.totalPages} startIndex={payrollPage.startIndex} itemsShown={payrollPage.items.length} totalItems={filteredPayroll.length} onPageChange={setCurrentPage} />
    )}
  </div>
)}

          {/* ─── Performance Tab ────────────────────────────────────────── */}
          {activeTab === "performance" && (
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Analytics</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Performance metrics and analytics will be displayed here using data from 
                  Student Goals, Predictions, Recommendations, and Skill Mapping endpoints.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50"><Award className="w-5 h-5 text-blue-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Goal Completion</p>
                        <p className="text-lg font-bold text-gray-800">—</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50"><TrendingUp className="w-5 h-5 text-emerald-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Performance</p>
                        <p className="text-lg font-bold text-gray-800">—</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50"><FileText className="w-5 h-5 text-amber-600" /></div>
                      <div>
                        <p className="text-xs text-gray-500">Skills Acquired</p>
                        <p className="text-lg font-bold text-gray-800">—</p>
                      </div>
                    </div>
                  </Card>
                </div>
                <p className="text-sm text-gray-400 mt-6">
                  Connect to Analytics endpoints to view performance data.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      
      {/* Department Modal */}
      {modalOpen && modalType === "department" && (
        <DepartmentModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveDepartment}
          loading={saving}
        />
      )}

      {/* Employee Modal */}
      {modalOpen && modalType === "employee" && (
        <EmployeeModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveEmployee}
          loading={saving}
          departments={departments}
          users={users}
        />
      )}

      {/* Leave Modal */}
      {modalOpen && modalType === "leave" && (
        <LeaveModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveLeave}
          loading={saving}
          employees={employees}
        />
      )}

      {/* Payroll Modal */}
      {modalOpen && modalType === "payroll" && (
        <PayrollModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSavePayroll}
          loading={saving}
          employees={employees}
        />
      )}

      {/* Details Modal */}
      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedItem(null); }}
        data={selectedItem}
        type={selectedType}
        employees={employees}
        departments={departments}
        users={users}
      />

      {/* ─── Confirm Dialogs ─────────────────────────────────────────────── */}
      {deletingItem && deleteType === "department" && (
        <ConfirmDialog open={true} title="Delete Department" message={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteDepartment} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "employee" && (
        <ConfirmDialog open={true} title="Delete Employee" message={`Are you sure you want to delete this employee? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteEmployee} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "leave" && (
        <ConfirmDialog open={true} title="Delete Leave" message={`Are you sure you want to delete this leave request? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteLeave} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "payroll" && (
        <ConfirmDialog open={true} title="Delete Payroll" message={`Are you sure you want to delete this payroll record? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeletePayroll} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {/* ─── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default HR;