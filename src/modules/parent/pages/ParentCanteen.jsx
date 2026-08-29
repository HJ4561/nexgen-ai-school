/**
 * ============================================
 * PARENT CANTEEN COMPONENT
 * ============================================
 * 
 * Purpose: View menu items and order history
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for filtering by child
 * - Canteen statistics
 * - Menu items with categories
 * - Order history
 * - View order details
 * - Filter by category and status
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/canteen/menu-items/ - Get menu items
 * - GET /api/canteen/order-items/ - Get orders
 * 
 * Usage:
 * <Route path="/parent/canteen" element={<ParentCanteen />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Utensils,
  Search,
  Eye,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchParentLinks,
  fetchMenuItems,
  fetchOrders,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const ITEMS_PER_PAGE = 10;

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

const formatCurrency = (amount) => {
  if (!amount) return "PKR 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getOrderStatusBadge = (status) => {
  const config = {
    placed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    preparing: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: RefreshCw },
    ready: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    delivered: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: CheckCircle },
    cancelled: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  };
  const info = config[status] || config.placed;
  const Icon = info.icon;
  return (
    <Badge className={`${info.color} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Placed"}
    </Badge>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children }) => {
  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm pr-8 sm:pr-10 min-h-[36px] sm:min-h-[42px]"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Order Detail Drawer ────────────────────────────────────────────────

const OrderDetailDrawer = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Order Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order ID</label>
            <p className="text-sm text-gray-800">#{order.id}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            {getOrderStatusBadge(order.status)}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Student</label>
            <p className="text-sm text-gray-800">{order.student_name || "—"}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Items</label>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{order.menu_item_name || "Item"}</span>
                <span className="text-sm text-gray-700">x{order.quantity || 1}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500">Price per item</span>
                <span className="text-sm text-gray-700">{formatCurrency(order.price)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">Total Amount</span>
              <span className="text-lg font-bold text-gray-800">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Order Date</label>
            <p className="text-sm text-gray-600">{formatDate(order.order_date)}</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full min-h-[36px] sm:min-h-[40px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentCanteen = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  // Use direct state access since selectMenuItems and selectOrders don't exist
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const menuItems = useSelector((state) => state.parent.menuItems || []);
  const orders = useSelector((state) => state.parent.orders || []);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchMenuItems());
    dispatch(fetchOrders());
  }, [dispatch]);

  // ─── Categories for filter ────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = new Set();
    menuItems.forEach(item => {
      if (item.category) cats.add(item.category);
      if (item.category_name) cats.add(item.category_name);
    });
    return Array.from(cats);
  }, [menuItems]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (selectedChild) {
      filtered = filtered.filter(o => o.student === selectedChild || o.student_id === selectedChild);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.student_name?.toLowerCase().includes(search) ||
        o.menu_item_name?.toLowerCase().includes(search)
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(o => o.category === filterCategory || o.category_name === filterCategory);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    return filtered;
  }, [orders, selectedChild, searchTerm, filterCategory, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalItems: menuItems.length,
    totalOrders: orders.length,
    placed: orders.filter(o => o.status === "placed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }), [menuItems, orders]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    setCurrentPage(1);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterCategory !== "all" || filterStatus !== "all";

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && menuItems.length === 0 && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Canteen" subtitle="View menu items and order history" breadcrumbs={["Parent", "Canteen"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading canteen data...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Canteen"
          subtitle="View menu items and order history"
          breadcrumbs={["Parent", "Canteen"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
                />
              </div>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading canteen data</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Items</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Available items</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.totalOrders}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All orders</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Placed</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.placed}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Pending fulfillment</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.delivered}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Completed orders</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Menu Items Section */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-blue-600" />
            Menu Items ({menuItems.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {menuItems.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No menu items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 sm:p-4">
              {menuItems.slice(0, 6).map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category_name || item.category || "Category"}</p>
                    </div>
                    <Badge className={item.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold text-emerald-600 mt-1">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Orders List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            Order History ({filteredOrders.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No orders found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {pageItems.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{order.menu_item_name || "Item"}</p>
                        <p className="text-xs text-gray-500">{order.student_name || "Student"}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(order.order_date)}</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">{formatCurrency(order.total_amount)}</p>
                      </div>
                      <div className="text-right">
                        {getOrderStatusBadge(order.status)}
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="block mt-2 p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Student</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm font-medium text-gray-800">{order.menu_item_name || "Item"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{order.student_name || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm text-gray-600">{order.quantity || 1}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm font-semibold text-gray-800">{formatCurrency(order.total_amount)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{formatDate(order.order_date)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          {getOrderStatusBadge(order.status)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredOrders.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default ParentCanteen;