// src/modules/student/pages/Canteen.jsx

/**
 * ============================================
 * STUDENT CANTEEN PAGE - FULLY FUNCTIONAL
 * ============================================
 * 
 * Purpose: Browse menu, place orders, and view order history
 * Used by: Student module routes
 * 
 * Features:
 * - View menu items with real API data
 * - Filter by category
 * - Search menu items
 * - Add items to cart
 * - Place orders
 * - View order history with ALL details
 * - Category icons based on category name
 * - Responsive design
 * - Toast notifications
 * - Loading states
 * 
 * API Endpoints:
 * - GET /api/canteen/menu-items/ - Get menu items
 * - GET /api/canteen/categories/ - Get categories
 * - GET /api/canteen/order-items/ - Get orders (Order History)
 * - POST /api/canteen/order-items/ - Create order
 * - GET /api/canteen/order-items/{id}/ - Get single order details
 * 
 * USAGE OF NEW API FIELDS:
 * - category_name from menu-items
 * - student_name from order-items
 * - item_name from order-items
 * 
 * Usage:
 * <Route path="/student/canteen" element={<Canteen />} />
 * ============================================
 */

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Utensils,
  ShoppingCart,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Wallet,
  Receipt,
  Package,
  Layers,
  TrendingUp,
  TrendingDown,
  ChefHat,
  XCircle,
  Pizza,
  Sandwich,
  Cookie,
  IceCream,
  Cake,
  Apple,
  Drumstick,
  Salad,
  Soup,
  GlassWater,
  Donut,
  Grape,
  Milk,
  Beer,
  Coffee as CoffeeIcon,
  User,
  DollarSign,
  ClipboardList,
  Store,
  MapPin,
  Phone,
  Clock as ClockIcon,
  CreditCard,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import {
  fetchMenuItems,
  fetchCategories,
  fetchOrders,
  createOrder,
} from "@/modules/student/store/studentThunks";
import {
  selectStudentMenuItems,
  selectStudentCategories,
  selectStudentOrders,
  selectStudentLoading,
  selectStudentSubmitting,
  selectStudentError,
} from "@/modules/student/store/studentSlice";

// ─── Category Icon Mapping ────────────────────────────────────────────────

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  
  const iconMap = {
    'pizza': Pizza,
    'pizzas': Pizza,
    'sandwich': Sandwich,
    'sandwiches': Sandwich,
    'burger': Drumstick,
    'burgers': Drumstick,
    'snack': Cookie,
    'snacks': Cookie,
    'ice cream': IceCream,
    'icecream': IceCream,
    'dessert': Cake,
    'desserts': Cake,
    'cake': Cake,
    'cakes': Cake,
    'fruit': Apple,
    'fruits': Apple,
    'salad': Salad,
    'salads': Salad,
    'soup': Soup,
    'soups': Soup,
    'drink': Coffee,
    'drinks': Coffee,
    'beverage': Coffee,
    'beverages': Coffee,
    'juice': Grape,
    'juices': Grape,
    'milk': Milk,
    'dairy': Milk,
    'donut': Donut,
    'donuts': Donut,
    'pastry': Cake,
    'bread': Sandwich,
    'meat': Drumstick,
    'chicken': Drumstick,
    'fish': Drumstick,
    'vegetable': Salad,
    'veggie': Salad,
    'water': GlassWater,
    'soda': Beer,
    'coffee': CoffeeIcon,
    'tea': CoffeeIcon,
  };
  
  const Icon = iconMap[name] || Utensils;
  return Icon;
};

// ─── Toast Notification ───────────────────────────────────────────────

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border ${colors[type]} px-5 py-4 shadow-2xl backdrop-blur-sm max-w-md`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-gray-800">{message}</span>
    </motion.div>
  );
}

// ─── Premium Stat Card ─────────────────────────────────────────────────

function PremiumStatCard({ label, value, subtext, icon: Icon, color, delay }) {
  const colorMap = {
    blue: { bg: "bg-gradient-to-br from-blue-50 to-blue-100/30", text: "text-blue-600", ring: "ring-blue-400/30" },
    emerald: { bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/30", text: "text-emerald-600", ring: "ring-emerald-400/30" },
    amber: { bg: "bg-gradient-to-br from-amber-50 to-amber-100/30", text: "text-amber-600", ring: "ring-amber-400/30" },
    rose: { bg: "bg-gradient-to-br from-rose-50 to-rose-100/30", text: "text-rose-600", ring: "ring-rose-400/30" },
    purple: { bg: "bg-gradient-to-br from-purple-50 to-purple-100/30", text: "text-purple-600", ring: "ring-purple-400/30" },
    teal: { bg: "bg-gradient-to-br from-teal-50 to-teal-100/30", text: "text-teal-600", ring: "ring-teal-400/30" },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay || 0, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`group relative overflow-hidden rounded-2xl ${c.bg} border border-gray-100 p-4 sm:p-5 transition-all duration-300 hover:shadow-xl`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
            {label}
          </p>
          <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ring-4 ${c.ring} ${c.text} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
            <Icon size={17} strokeWidth={2.5} className={c.text} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>
        {subtext && (
          <p className="mt-1 text-[10px] sm:text-xs font-medium text-gray-500">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Menu Item Card ────────────────────────────────────────────────────

function MenuItemCard({ item, onAddToCart, isInCart }) {
  const [quantity, setQuantity] = useState(isInCart ? 1 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const handleAdd = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    onAddToCart(item, newQty);
  };

  const handleRemove = () => {
    const newQty = Math.max(0, quantity - 1);
    setQuantity(newQty);
    onAddToCart(item, newQty);
  };

  const CategoryIcon = getCategoryIcon(item.category?.name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 ${
        isHovered ? "shadow-xl border-blue-200" : "shadow-sm"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              isHovered ? "scale-110" : "scale-100"
            }`}>
              <CategoryIcon className="h-6 w-6 text-blue-600" />
            </div>
            {item.is_available && (
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">
                  {item.name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {item.category?.name && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      <Layers className="h-3 w-3" />
                      {item.category.name}
                    </span>
                  )}
                  <span className="text-sm font-bold text-blue-600">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {item.is_available ? (
                  <div className="flex items-center gap-1.5">
                    {quantity > 0 ? (
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                          onClick={handleRemove}
                          className="p-1 rounded-md hover:bg-red-50 text-red-500 transition-all"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold text-gray-900">
                          {quantity}
                        </span>
                        <button
                          onClick={handleAdd}
                          className="p-1 rounded-md hover:bg-emerald-50 text-emerald-500 transition-all"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAdd}
                        className="relative px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105 active:scale-95"
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                    <XCircle className="h-3 w-3" />
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            {item.description && (
              <p className="text-xs text-gray-500 mt-1.5">
                {item.description}
              </p>
            )}

            {item.details && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showDetails ? 'Less' : 'More'} details
                <ChevronDown className={`h-3 w-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
            )}

            <AnimatePresence>
              {showDetails && item.details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    {item.details}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Cart Sidebar ──────────────────────────────────────────────────────

function CartSidebar({ cart, onUpdateQuantity, onRemoveItem, onCheckout, isOpen, onClose, submitting }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-96 bg-white shadow-2xl flex flex-col"
          >
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Your Cart</h3>
                    <p className="text-sm text-white/80">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Your cart is empty</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    Browse the menu and add delicious items you'd like to order
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category?.name);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-100 transition-all"
                    >
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 rounded-md hover:bg-red-50 transition-colors ml-1"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Subtotal</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={onCheckout}
                disabled={cart.length === 0 || submitting}
                className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  cart.length > 0 && !submitting
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Order History Card ──────────────────────────────────────────────

function OrderHistoryCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const getStatusConfig = (status) => {
    const map = {
      placed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock, label: "Placed" },
      preparing: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: ChefHat, label: "Preparing" },
      ready: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: CheckCircle, label: "Ready" },
      served: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Served" },
      cancelled: { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, label: "Cancelled" },
    };
    return map[status?.toLowerCase()] || map.placed;
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // Get order items with proper data
  const orderItems = order.items || order.order_items || [];

  // Calculate total items count
  const totalItems = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Receipt className="h-5 w-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  Order #{order.id || 'N/A'}
                </p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(order.order_date || order.created_at)}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(order.total_amount)}
                </span>
                {order.student_name && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <User className="h-3 w-3" />
                    {order.student_name}
                  </span>
                )}
                {totalItems > 0 && (
                  <span className="text-gray-400">• {totalItems} items</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-gray-400">
              {isExpanded ? "Hide details" : "Show details"}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="pt-3 border-t border-gray-100 space-y-3">
                {/* Order Details Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="text-sm font-semibold text-gray-900">#{order.id || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="text-sm font-bold text-blue-600">{formatPrice(order.total_amount)}</p>
                  </div>
                </div>

                {/* Order Items */}
                {orderItems.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Order Items ({totalItems} items)
                    </p>
                    <div className="space-y-1.5">
                      {orderItems.map((item, idx) => {
                        const CategoryIcon = getCategoryIcon(item.category_name || item.category?.name);
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <CategoryIcon className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-gray-700 truncate">{item.item_name || item.name || `Item ${idx + 1}`}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <span className="text-gray-900 font-medium flex-shrink-0">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No items details available</p>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {order.created_at && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>Ordered: {formatDate(order.created_at)}</span>
                    </div>
                  )}
                  {order.updated_at && order.updated_at !== order.created_at && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Updated: {formatDate(order.updated_at)}</span>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Note:</span> {order.notes}
                    </p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-gray-900">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────

function PremiumEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-12 sm:p-16 text-center border border-gray-100"
    >
      <div className="relative mx-auto h-24 w-24">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-blue-100/30 animate-pulse" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl">
          <Icon size={40} className="text-blue-600" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-900">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

function Canteen() {
  const dispatch = useDispatch();
  const menuItems = useSelector(selectStudentMenuItems);
  const categories = useSelector(selectStudentCategories);
  const orders = useSelector(selectStudentOrders);
  const loading = useSelector(selectStudentLoading);
  const submitting = useSelector(selectStudentSubmitting);
  const error = useSelector(selectStudentError);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // ─── Load Data ──────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchMenuItems()),
        dispatch(fetchCategories()),
        dispatch(fetchOrders()),
      ]);
      console.log("✅ Canteen data loaded");
    } catch (err) {
      console.error("❌ Error loading canteen data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // ─── Stats ──────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalItems = menuItems?.length || 0;
    const availableItems = menuItems?.filter((item) => item.is_available).length || 0;
    const totalOrders = orders?.length || 0;
    const activeOrders = orders?.filter((o) => 
      o.status?.toLowerCase() !== "served" && o.status?.toLowerCase() !== "cancelled"
    ).length || 0;
    const totalSpent = orders?.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) || 0;

    return { totalItems, availableItems, totalOrders, activeOrders, totalSpent };
  }, [menuItems, orders]);

  // ─── Filter Menu Items ─────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    
    let filtered = menuItems.filter((item) => {
      const matchesCategory = filterCategory === "all" || 
        (item.category?.id === parseInt(filterCategory) || 
         item.category?.name?.toLowerCase() === filterCategory);
      const matchesSearch = searchTerm === "" || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (a.is_available && !b.is_available) return -1;
      if (!a.is_available && b.is_available) return 1;
      return 0;
    });

    return filtered;
  }, [menuItems, filterCategory, searchTerm]);

  // ─── Cart Functions ─────────────────────────────────────────────────

  const handleAddToCart = (item, quantity) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (quantity === 0) {
          return prev.filter(i => i.id !== item.id);
        }
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity } : i
        );
      }
      if (quantity > 0) {
        setToast({ message: `${item.name} added to cart!`, type: "success" });
        return [...prev, { ...item, quantity }];
      }
      return prev;
    });
  };

  const handleUpdateQuantity = (itemId, quantity) => {
    setCart(prev => {
      if (quantity <= 0) {
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      );
    });
  };

  const handleRemoveItem = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const orderData = {
      items: cart.map(item => ({
        menu_item: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    };

    try {
      await dispatch(createOrder(orderData)).unwrap();
      setCart([]);
      setIsCartOpen(false);
      setToast({ message: "🎉 Order placed successfully!", type: "success" });
      await loadData();
    } catch (err) {
      console.error("Order failed:", err);
      setToast({ message: "Failed to place order. Please try again.", type: "error" });
    }
  };

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // ─── Loading State ──────────────────────────────────────────────────

  if (loading && !menuItems?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        
        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>

        <PageHeader
          title="Canteen"
          subtitle="Browse the menu, customize your order, and enjoy delicious meals"
          breadcrumbs={["Student", "Canteen"]}
          bgColor="bg-blue-50"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-white/80 rounded-xl hover:bg-white transition-all disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
          <PremiumStatCard
            label="Menu Items"
            value={stats.totalItems}
            subtext={`${stats.availableItems} available`}
            icon={Utensils}
            color="blue"
            delay={0.05}
          />
          <PremiumStatCard
            label="Total Orders"
            value={stats.totalOrders}
            subtext="All time"
            icon={Receipt}
            color="emerald"
            delay={0.1}
          />
          <PremiumStatCard
            label="Active Orders"
            value={stats.activeOrders}
            subtext="In progress"
            icon={Clock}
            color="amber"
            delay={0.15}
          />
          <PremiumStatCard
            label="Total Spent"
            value={`$${stats.totalSpent.toFixed(0)}`}
            subtext="Lifetime"
            icon={Wallet}
            color="purple"
            delay={0.2}
          />
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 p-4 rounded-xl text-center border border-red-200"
          >
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load canteen data: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition-all bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                showFilters || filterCategory !== "all"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter size={16} />
              Categories
              {filterCategory !== "all" && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                  1
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory("all")}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                      filterCategory === "all"
                        ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {categories?.map((category) => {
                    const CategoryIcon = getCategoryIcon(category.name);
                    return (
                      <button
                        key={category.id}
                        onClick={() => setFilterCategory(category.name?.toLowerCase() || category.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-all flex items-center gap-1.5 ${
                          filterCategory === (category.name?.toLowerCase() || category.id)
                            ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <CategoryIcon className="h-3 w-3" />
                        {category.name}
                      </button>
                    );
                  })}
                  {filterCategory !== "all" && (
                    <button
                      onClick={() => setFilterCategory("all")}
                      className="px-3 py-1.5 text-xs rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Menu Grid */}
        <div className="mt-6">
          {filteredItems.length === 0 ? (
            <PremiumEmptyState
              icon={Utensils}
              title={searchTerm ? "No matching items found" : "No menu items available"}
              description={
                searchTerm 
                  ? `No items found matching "${searchTerm}". Try adjusting your search.`
                  : filterCategory !== "all"
                  ? `No items in the "${filterCategory}" category. Try changing the filter.`
                  : "The canteen menu is currently empty. Check back later!"
              }
              action={searchTerm || filterCategory !== "all" ? { 
                label: "Clear Filters", 
                onClick: () => {
                  setSearchTerm("");
                  setFilterCategory("all");
                }
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                  isInCart={cart.some(i => i.id === item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        {orders && orders.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Order History
              </h2>
              <span className="text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 px-2.5 py-0.5 rounded-full">
                {orders.length}
              </span>
              <span className="text-xs text-gray-400">
                (Click on an order to view details)
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <OrderHistoryCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Cart Sidebar */}
        <CartSidebar
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          submitting={submitting}
        />

        <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
          <p>© 2024 Smart School Management System • Canteen Module</p>
          <p className="mt-1">
            {stats.totalItems} menu items • {stats.totalOrders} orders placed
          </p>
        </div>
      </div>
    </div>
  );
}

export default Canteen;