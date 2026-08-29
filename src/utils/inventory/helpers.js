export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    "in-stock": "success",
    "low-stock": "warning",
    "out-of-stock": "danger",
    "discontinued": "secondary",
  };
  return colors[status] || "secondary";
};

export const getStatusLabel = (status) => {
  const labels = {
    "in-stock": "In Stock",
    "low-stock": "Low Stock",
    "out-of-stock": "Out of Stock",
    "discontinued": "Discontinued",
  };
  return labels[status] || status;
};

// --- getStatus (Alias for getStatusLabel) ------------------------------
export const getStatus = (status) => {
  return getStatusLabel(status);
};

export const calculateInventoryValue = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
};

export const filterInventoryItems = (items, filters) => {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(item => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const match = item.name?.toLowerCase().includes(searchLower) ||
                    item.sku?.toLowerCase().includes(searchLower) ||
                    item.category?.toLowerCase().includes(searchLower);
      if (!match) return false;
    }
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    return true;
  });
};

export const sortInventoryItems = (items, sortBy, sortOrder = "asc") => {
  if (!items || !Array.isArray(items)) return [];
  const sorted = [...items];
  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
};

export const getUniqueCategories = (items) => {
  if (!items || !Array.isArray(items)) return [];
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  return Array.from(categories);
};

export const calculateInventoryStats = (items) => {
  if (!items || !Array.isArray(items)) {
    return {
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    };
  }
  
  return {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    lowStockCount: items.filter(item => item.status === "low-stock").length,
    outOfStockCount: items.filter(item => item.status === "out-of-stock").length,
  };
};

export const getInventoryStats = (items) => {
  return calculateInventoryStats(items);
};

export const getCategoryStyle = (category) => {
  const styles = {
    'Electronics': 'bg-blue-100 text-blue-700 border-blue-200',
    'Furniture': 'bg-green-100 text-green-700 border-green-200',
    'Stationery': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Equipment': 'bg-purple-100 text-purple-700 border-purple-200',
    'Books': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Supplies': 'bg-orange-100 text-orange-700 border-orange-200',
    'Sports': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Uniform': 'bg-pink-100 text-pink-700 border-pink-200',
    'Other': 'bg-gray-100 text-gray-700 border-gray-200',
    'Default': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[category] || styles.Default;
};

export default {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
  getStatus,
  calculateInventoryValue,
  filterInventoryItems,
  sortInventoryItems,
  getUniqueCategories,
  calculateInventoryStats,
  getInventoryStats,
  getCategoryStyle,
};