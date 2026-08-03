// src/components/admin/FeeDetailDrawer/utils.js
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount || 0);

export const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

export const STATUS_BADGE = {
  paid: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  partial: "bg-blue-100 text-blue-700 border-blue-200",
  waived: "bg-gray-100 text-gray-700 border-gray-200",
};
