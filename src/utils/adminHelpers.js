// --- Format Currency ------------------------------------------------------
export const formatCurrency = (amount) => {
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

// --- Get Status ------------------------------------------------------------
export const getStatus = (status) => {
  const statusMap = {
    available: { label: "Available", className: "bg-green-100 text-green-700 border-green-200" },
    low: { label: "Low Stock", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    unavailable: { label: "Unavailable", className: "bg-red-100 text-red-700 border-red-200" },
    damaged: { label: "Damaged", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  return statusMap[status] || { label: status || "Unknown", className: "bg-gray-100 text-gray-700 border-gray-200" };
};

// --- Get Category Style ----------------------------------------------------
export const getCategoryStyle = (category) => {
  const styles = {
    stationery: "bg-blue-50 text-blue-700 border-blue-200",
    furniture: "bg-amber-50 text-amber-700 border-amber-200",
    equipment: "bg-purple-50 text-purple-700 border-purple-200",
    electronics: "bg-indigo-50 text-indigo-700 border-indigo-200",
    supplies: "bg-emerald-50 text-emerald-700 border-emerald-200",
    books: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return styles[category?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200";
};

// --- Format Date -----------------------------------------------------------
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
