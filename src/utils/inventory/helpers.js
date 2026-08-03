// ─── Format Currency ──────────────────────────────────────────────────────
export const formatCurrency = (amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount === 0) {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(0);
  }
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(numAmount);
};

// ─── Get Status Color ──────────────────────────────────────────────────────
export const getStatusColor = (status) => {
  const colors = {
    available: 'bg-green-100 text-green-700 border-green-200',
    low: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    unavailable: 'bg-red-100 text-red-700 border-red-200',
    damaged: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

// ─── Get Status Label ──────────────────────────────────────────────────────
export const getStatusLabel = (status) => {
  const labels = {
    available: 'Available',
    low: 'Low Stock',
    unavailable: 'Unavailable',
    damaged: 'Damaged',
  };
  return labels[status] || status || 'Unknown';
};

// ─── Get Status ────────────────────────────────────────────────────────────
export const getStatus = (status) => {
  const statusMap = {
    available: { label: 'Available', className: 'bg-green-100 text-green-700 border-green-200' },
    low: { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    unavailable: { label: 'Unavailable', className: 'bg-red-100 text-red-700 border-red-200' },
    damaged: { label: 'Damaged', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  };
  return statusMap[status] || { label: status || 'Unknown', className: 'bg-gray-100 text-gray-700 border-gray-200' };
};

// ─── Get Category Style ────────────────────────────────────────────────────
export const getCategoryStyle = (category) => {
  const styles = {
    stationery: 'bg-blue-50 text-blue-700 border-blue-200',
    furniture: 'bg-amber-50 text-amber-700 border-amber-200',
    equipment: 'bg-purple-50 text-purple-700 border-purple-200',
    electronics: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    supplies: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    books: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return styles[category?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
};

// ─── Format Date ───────────────────────────────────────────────────────────
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ─── Get Inventory Stats ──────────────────────────────────────────────────
export const getInventoryStats = (items) => {
  const total = items.length;
  const totalItems = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalValue = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
  const available = items.filter(i => i.status === 'available').length;
  const lowStock = items.filter(i => Number(i.quantity) <= 5 && i.status !== 'unavailable').length;
  const damaged = items.filter(i => i.status === 'damaged').length;
  return { total, totalItems, totalValue, available, lowStock, damaged };
};

// ─── Filter Inventory Items ──────────────────────────────────────────────
export const filterInventoryItems = (items, searchTerm, filterCategory, filterStatus) => {
  let filtered = items;

  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      (item.name || '').toLowerCase().includes(search) ||
      (item.category || '').toLowerCase().includes(search) ||
      (item.supplier || '').toLowerCase().includes(search)
    );
  }

  if (filterCategory && filterCategory !== 'all') {
    filtered = filtered.filter(item => item.category === filterCategory);
  }

  if (filterStatus && filterStatus !== 'all') {
    filtered = filtered.filter(item => item.status === filterStatus);
  }

  return filtered;
};

// ─── Get Unique Categories ────────────────────────────────────────────────
export const getUniqueCategories = (items) => {
  const categories = new Set();
  items.forEach(item => {
    if (item.category) categories.add(item.category);
  });
  return Array.from(categories);
};
