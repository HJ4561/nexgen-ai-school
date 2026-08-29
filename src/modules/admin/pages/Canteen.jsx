// src/modules/admin/pages/Canteen.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, Plus, Edit, Trash2, Utensils, ShoppingCart,
  DollarSign, Clock, X, RefreshCw, AlertCircle, Eye,
  Filter, ChevronDown, Users, Calendar, CheckCircle,
  XCircle, User, FileText, Menu, Grid3x3, List,
  Save, Package, Tag, Info, ShoppingBag, Coffee,
  Grid, BookOpen, Hash
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// --- API Endpoints ------------------------------------------------------
const CATEGORIES_API = "/canteen/categories/";
const MENU_ITEMS_API = "/canteen/menu-items/";
const ORDER_ITEMS_API = "/canteen/order-items/";

// --- Helper Functions --------------------------------------------------
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
  if (!dateString) return "Ã¢â‚¬â€";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Ã¢â‚¬â€";
  }
};

const getStatusColor = (status, stock) => {
  if (status === "available" && stock > 0) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "unavailable" || stock === 0) {
    return "bg-red-50 text-red-700 border-red-200";
  } else if (stock <= 5) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
};

const getStatusLabel = (status, stock) => {
  if (status === "unavailable" || stock === 0) return "Out of Stock";
  if (stock <= 5) return "Low Stock";
  return "Available";
};

const ORDER_STATUS = {
  placed: { label: "Placed", color: "bg-blue-50 text-blue-700 border-blue-200" },
  preparing: { label: "Preparing", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  ready: { label: "Ready", color: "bg-green-50 text-green-700 border-green-200" },
  served: { label: "Served", color: "bg-purple-50 text-purple-700 border-purple-200" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
};

const ORDER_STATUS_ICONS = {
  placed: <Clock className="w-3 h-3 mr-1" />,
  preparing: <Clock className="w-3 h-3 mr-1" />,
  ready: <CheckCircle className="w-3 h-3 mr-1" />,
  served: <CheckCircle className="w-3 h-3 mr-1" />,
  cancelled: <XCircle className="w-3 h-3 mr-1" />,
};

const CATEGORY_COLORS = {
  food: "bg-orange-50 text-orange-700 border-orange-200",
  beverages: "bg-blue-50 text-blue-700 border-blue-200",
  snacks: "bg-yellow-50 text-yellow-700 border-yellow-200",
  desserts: "bg-purple-50 text-purple-700 border-purple-200",
  meals: "bg-green-50 text-green-700 border-green-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

// --- Category Modal -----------------------------------------------------
const CategoryModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            {mode === "add" ? "Add Category" : "Edit Category"}
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Snacks, Beverages"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter category description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
            <select
              value={formData.color || "default"}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="food">Food</option>
              <option value="beverages">Beverages</option>
              <option value="snacks">Snacks</option>
              <option value="desserts">Desserts</option>
              <option value="meals">Meals</option>
              <option value="default">Default</option>
            </select>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 order-2 sm:order-1">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.name} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Category" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Menu Item Modal ----------------------------------------------------
const MenuItemModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, categories }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0" />
            {mode === "add" ? "Add Menu Item" : "Edit Menu Item"}
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Item Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter item name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
            <select
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.title || "Category"}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Price (PKR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stock <span className="text-red-500">*</span></label>
              <input
                type="number"
                placeholder="0"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.is_available ? "available" : "unavailable"}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.value === "available" })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter item description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none text-sm"
            />
          </div>
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 order-2 sm:order-1">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.name || !formData.category || !formData.price} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {mode === "add" ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Order Modal --------------------------------------------------------
const OrderModal = ({ isOpen, onClose, formData, setFormData, onSave, loading, menuItems }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
            Create New Order
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Menu Item <span className="text-red-500">*</span></label>
            <select
              value={formData.menu_item || ""}
              onChange={(e) => setFormData({ ...formData, menu_item: Number(e.target.value) })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="">Select menu item...</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {formatCurrency(item.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={formData.quantity || 1}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Student</label>
            <input
              type="text"
              placeholder="Enter student name"
              value={formData.student || ""}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Order Status</label>
            <select
              value={formData.status || "placed"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="placed">Placed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 order-2 sm:order-1">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.menu_item || !formData.quantity} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

// --- View Details Modal ------------------------------------------------
const ViewDetailsModal = ({ isOpen, onClose, item, type }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg flex items-center gap-2">
            {type === "menu" ? <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /> : 
             type === "order" ? <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> : 
             <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
            {type === "menu" ? "Menu Item Details" : type === "order" ? "Order Details" : "Category Details"}
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {type === "menu" && (
              <>
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 break-words">{item.name || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Category</p><p className="font-medium text-gray-800 break-words">{item.category?.name || item.category || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Price</p><p className="font-medium text-gray-800">{formatCurrency(item.price)}</p></div>
                <div><p className="text-xs text-gray-500">Stock</p><p className="font-medium text-gray-800">{item.stock || 0}</p></div>
                <div className="col-span-1 sm:col-span-2"><p className="text-xs text-gray-500">Status</p><Badge className={getStatusColor(item.is_available !== false, item.stock || 0)}>{getStatusLabel(item.is_available !== false, item.stock || 0)}</Badge></div>
                <div className="col-span-1 sm:col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-gray-600 break-words">{item.description || "Ã¢â‚¬â€"}</p></div>
              </>
            )}
            {type === "order" && (
              <>
                <div><p className="text-xs text-gray-500">Item</p><p className="font-medium text-gray-800 break-words">{item.menu_item?.name || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Student</p><p className="font-medium text-gray-800 break-words">{item.student?.name || item.student || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Quantity</p><p className="font-medium text-gray-800">{item.quantity || 1}</p></div>
                <div><p className="text-xs text-gray-500">Total</p><p className="font-medium text-gray-800">{formatCurrency(item.total_amount || item.price || 0)}</p></div>
                <div><p className="text-xs text-gray-500">Status</p><Badge className={ORDER_STATUS[item.status]?.color || "bg-gray-50 text-gray-700 border-gray-200"}>{item.status ? ORDER_STATUS[item.status]?.label || item.status : "Ã¢â‚¬â€"}</Badge></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-800">{formatDate(item.order_date || item.created_at)}</p></div>
              </>
            )}
            {type === "category" && (
              <>
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 break-words">{item.name || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Color</p><Badge className={`${CATEGORY_COLORS[item.color] || CATEGORY_COLORS.default}`}>{item.color || "Default"}</Badge></div>
                <div className="col-span-1 sm:col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-gray-600 break-words">{item.description || "Ã¢â‚¬â€"}</p></div>
              </>
            )}
          </div>
        </div>
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Update Order Status Modal -----------------------------------------
const UpdateOrderStatusModal = ({ isOpen, onClose, order, onUpdate, loading }) => {
  const [status, setStatus] = useState(order?.status || "placed");
  
  useEffect(() => {
    if (order) {
      setStatus(order.status || "placed");
    }
  }, [order]);
  
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Update Order Status</h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            >
              <option value="placed">Placed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-6 pt-4 border-t border-gray-100">
          <button onClick={onClose} disabled={loading} className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={() => onUpdate(order.id, status)} disabled={loading || status === order.status} className="w-full sm:flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ----------------------------------------------------
const Canteen = () => {
  // --- State --------------------------------------------------------------
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("menu");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "", color: "default" });
  const [menuFormData, setMenuFormData] = useState({ name: "", category: "", price: "", stock: "", is_available: true, description: "" });
  const [orderFormData, setOrderFormData] = useState({ menu_item: "", quantity: 1, student: "", status: "placed" });
  const itemsPerPage = 10;

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch Data ----------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menuRes, categoriesRes, ordersRes] = await Promise.all([
        api.get(MENU_ITEMS_API),
        api.get(CATEGORIES_API),
        api.get(ORDER_ITEMS_API),
      ]);
      setMenuItems(menuRes.data?.results || menuRes.data || []);
      setCategories(categoriesRes.data?.results || categoriesRes.data || []);
      setOrders(ordersRes.data?.results || ordersRes.data || []);
    } catch (error) {
      console.error("Failed to fetch canteen data:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Canteen endpoint not found.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to access canteen data.");
      } else {
        setError(error.response?.data?.detail || "Failed to load canteen data");
      }
      setMenuItems([]);
      setCategories([]);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    showToast("Canteen data refreshed", "success");
  }, [fetchData, showToast]);

  // --- Helper Functions ---------------------------------------------------
  const getCategoryName = useCallback((category) => {
    if (!category) return "Ã¢â‚¬â€";
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category.name) return category.name;
    if (typeof category === 'object' && category.title) return category.title;
    return "Ã¢â‚¬â€";
  }, []);

  const getMenuItemName = useCallback((menuItemId) => {
    if (!menuItemId) return "Ã¢â‚¬â€";
    const item = menuItems.find(i => i.id === menuItemId);
    return item?.name || "Ã¢â‚¬â€";
  }, [menuItems]);

  const getOrderStatus = useCallback((status) => {
    return ORDER_STATUS[status] || { label: status || "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200" };
  }, []);

  // --- Filter Logic ------------------------------------------------------
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    const search = searchTerm.toLowerCase();
    return menuItems.filter(item => {
      return (item.name?.toLowerCase() || "").includes(search) ||
             getCategoryName(item.category).toLowerCase().includes(search) ||
             (item.price?.toString() || "").includes(search);
    });
  }, [menuItems, searchTerm, getCategoryName]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    const search = searchTerm.toLowerCase();
    return orders.filter(order => {
      return getMenuItemName(order.menu_item).toLowerCase().includes(search) ||
             (order.status?.toLowerCase() || "").includes(search) ||
             (order.student?.name || "").toLowerCase().includes(search);
    });
  }, [orders, searchTerm, getMenuItemName]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    const search = searchTerm.toLowerCase();
    return categories.filter(category => {
      return (category.name?.toLowerCase() || "").includes(search) ||
             (category.description?.toLowerCase() || "").includes(search);
    });
  }, [categories, searchTerm]);

  const currentItems = activeTab === "menu" ? filteredMenuItems : 
                       activeTab === "orders" ? filteredOrders : 
                       filteredCategories;
  const totalPages = Math.max(1, Math.ceil(currentItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  // --- Stats -------------------------------------------------------------
  const stats = useMemo(() => {
    const totalItems = menuItems.length;
    const availableItems = menuItems.filter(i => i.is_available !== false).length;
    const lowStockItems = menuItems.filter(i => i.is_available !== false && i.stock && i.stock <= 5).length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "placed" || o.status === "preparing").length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    return { totalItems, availableItems, lowStockItems, totalOrders, pendingOrders, totalRevenue, totalCategories: categories.length };
  }, [menuItems, orders, categories]);

  // --- CRUD Operations ----------------------------------------------------
  const handleSaveCategory = async () => {
    if (!categoryFormData.name) { 
      showToast("Please enter a category name", "error"); 
      return; 
    }
    setSaving(true);
    try {
      const payload = { 
        name: categoryFormData.name.trim(), 
        description: categoryFormData.description?.trim() || "", 
        color: categoryFormData.color || "default" 
      };
      if (modalMode === "edit" && selectedCategory) {
        const response = await api.patch(`${CATEGORIES_API}${selectedCategory.id}/`, payload);
        setCategories(prev => prev.map(c => c.id === selectedCategory.id ? { ...c, ...response.data } : c));
        showToast("Category updated", "success");
      } else {
        const response = await api.post(CATEGORIES_API, payload);
        setCategories(prev => [response.data, ...prev]);
        showToast("Category added", "success");
      }
      setCategoryModalOpen(false);
      setCategoryFormData({ name: "", description: "", color: "default" });
      setSelectedCategory(null);
    } catch (error) { 
      showToast(error.response?.data?.detail || "Failed to save category", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleSaveMenuItem = async () => {
    if (!menuFormData.name || !menuFormData.category || !menuFormData.price) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: menuFormData.name.trim(),
        category: Number(menuFormData.category),
        price: Number(menuFormData.price),
        stock: Number(menuFormData.stock) || 0,
        is_available: menuFormData.is_available !== false,
        description: menuFormData.description?.trim() || "",
      };
      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${MENU_ITEMS_API}${selectedItem.id}/`, payload);
        setMenuItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, ...response.data } : i));
        showToast("Item updated", "success");
      } else {
        const response = await api.post(MENU_ITEMS_API, payload);
        setMenuItems(prev => [response.data, ...prev]);
        showToast("Item added", "success");
      }
      setMenuModalOpen(false);
      setMenuFormData({ name: "", category: "", price: "", stock: "", is_available: true, description: "" });
      setSelectedItem(null);
    } catch (error) { 
      showToast(error.response?.data?.detail || "Failed to save item", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleAddOrder = async () => {
    if (!orderFormData.menu_item || !orderFormData.quantity) {
      showToast("Please select a menu item and quantity", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        menu_item: Number(orderFormData.menu_item),
        quantity: Number(orderFormData.quantity),
        student: orderFormData.student?.trim() || "",
        status: orderFormData.status || "placed",
      };
      const response = await api.post(ORDER_ITEMS_API, payload);
      setOrders(prev => [response.data, ...prev]);
      showToast("Order created", "success");
      setOrderModalOpen(false);
      setOrderFormData({ menu_item: "", quantity: 1, student: "", status: "placed" });
    } catch (error) { 
      showToast(error.response?.data?.detail || "Failed to create order", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setSaving(true);
    try {
      const response = await api.patch(`${ORDER_ITEMS_API}${orderId}/`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...response.data } : o));
      showToast(`Order status updated to ${ORDER_STATUS[status]?.label || status}`, "success");
      setStatusModalOpen(false);
      setSelectedOrder(null);
    } catch (error) { 
      showToast(error.response?.data?.detail || "Failed to update status", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      const apiUrl = activeTab === "menu" ? MENU_ITEMS_API : 
                     activeTab === "orders" ? ORDER_ITEMS_API : 
                     CATEGORIES_API;
      await api.delete(`${apiUrl}${deletingItem.id}/`);
      if (activeTab === "menu") {
        setMenuItems(prev => prev.filter(item => item.id !== deletingItem.id));
      } else if (activeTab === "orders") {
        setOrders(prev => prev.filter(order => order.id !== deletingItem.id));
      } else {
        setCategories(prev => prev.filter(cat => cat.id !== deletingItem.id));
      }
      showToast(`${activeTab === "menu" ? "Menu item" : activeTab === "orders" ? "Order" : "Category"} deleted`, "success");
      setDeletingItem(null);
    } catch (error) { 
      showToast(error.response?.data?.detail || "Failed to delete", "error"); 
    } finally { 
      setSaving(false); 
    }
  };

  const clearFilters = useCallback(() => { 
    setSearchTerm(""); 
    setCurrentPage(1); 
  }, []);

  // --- Tabs -------------------------------------------------------------
  const tabs = [
    { id: "menu", label: "Menu Items", icon: <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />, count: menuItems.length },
    { id: "orders", label: "Orders", icon: <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />, count: orders.length },
    { id: "categories", label: "Categories", icon: <Tag className="w-3 h-3 sm:w-4 sm:h-4" />, count: categories.length },
  ];

  // --- Loading State ----------------------------------------------------
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-6 md:space-y-8">
          <PageHeader 
            title="Canteen Management" 
            subtitle="Manage canteen menu, orders, and categories" 
            breadcrumbs={["Admin", "Canteen"]} 
          />
          <div className="flex flex-col items-center justify-center h-64 md:h-96">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-4 md:mt-6 text-sm text-gray-500 font-medium">Loading canteen data...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // --- Render ----------------------------------------------------------
  return (
    <FadeIn>
      <div className="space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8">
        <PageHeader 
          title="Canteen Management" 
          subtitle={`Manage canteen menu, orders, and categories${menuItems.length > 0 ? ` Ã¢â‚¬â€ ${menuItems.length} items, ${orders.length} orders` : ""}`}
          breadcrumbs={["Admin", "Canteen"]}
          action={
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                className="hidden sm:inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={() => {
                  if (activeTab === "menu") { 
                    setModalMode("add"); 
                    setMenuFormData({ name: "", category: "", price: "", stock: "", is_available: true, description: "" }); 
                    setMenuModalOpen(true); 
                  } else if (activeTab === "orders") { 
                    setOrderFormData({ menu_item: "", quantity: 1, student: "", status: "placed" }); 
                    setOrderModalOpen(true); 
                  } else { 
                    setModalMode("add"); 
                    setCategoryFormData({ name: "", description: "", color: "default" }); 
                    setCategoryModalOpen(true); 
                  }
                }}
                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden xs:inline">{activeTab === "menu" ? "Add Item" : activeTab === "orders" ? "Add Order" : "Add Category"}</span>
                <span className="xs:hidden">Add</span>
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 md:px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error loading canteen</p>
              <p className="text-amber-600 break-words">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Items</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalItems}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.availableItems} available</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Orders</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600">{stats.totalOrders}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">{stats.pendingOrders} pending</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Need restocking</p>
          </Card>
          <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Total sales</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-3 sm:gap-6 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(""); }}
                  className={`pb-2 sm:pb-3 px-1 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                    isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon} 
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.id.charAt(0).toUpperCase()}</span>
                  <Badge className={isActive ? "bg-blue-100 text-blue-600 text-[8px] sm:text-xs" : "bg-gray-100 text-gray-600 text-[8px] sm:text-xs"}>{tab.count}</Badge>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-3 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "menu" ? "Search by name, category, or price..." :
                    activeTab === "orders" ? "Search by item, student, or status..." :
                    "Search by name or description..."
                  }
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2 md:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm text-xs md:text-sm"
                  disabled={currentItems.length === 0}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {currentItems.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    {activeTab === "menu" ? <Utensils className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /> :
                     activeTab === "orders" ? <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-gray-400" /> :
                     <Tag className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                      No {activeTab === "menu" ? "Menu Items" : activeTab === "orders" ? "Orders" : "Categories"} Found
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-md px-2">
                      {searchTerm ? "Try adjusting your search terms" :
                       activeTab === "menu" ? "Add a menu item to get started" :
                       activeTab === "orders" ? "Orders will appear here once placed" :
                       "Add a category to organize your menu items"}
                    </p>
                  </div>
                  {!searchTerm && !error?.includes("not configured") && (
                    <button onClick={() => {
                        if (activeTab === "menu") { 
                          setModalMode("add"); 
                          setMenuFormData({ name: "", category: "", price: "", stock: "", is_available: true, description: "" }); 
                          setMenuModalOpen(true); 
                        } else if (activeTab === "orders") { 
                          setOrderFormData({ menu_item: "", quantity: 1, student: "", status: "placed" }); 
                          setOrderModalOpen(true); 
                        } else { 
                          setModalMode("add"); 
                          setCategoryFormData({ name: "", description: "", color: "default" }); 
                          setCategoryModalOpen(true); 
                        }
                      }}
                      className="mt-3 md:mt-4 inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                    >
                      <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      {activeTab === "menu" ? "Add Item" : activeTab === "orders" ? "Add Order" : "Add Category"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="divide-y divide-gray-100">
                    {pageItems.map((item) => {
                      if (activeTab === "menu") {
                        const stock = Number(item.stock) || 0;
                        const status = item.is_available !== false;
                        return (
                          <div key={item.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <Utensils className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm truncate">{item.name || "Ã¢â‚¬â€"}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">
                                    {getCategoryName(item.category)}
                                  </Badge>
                                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.price)}</span>
                                  <Badge className={stock === 0 ? "bg-red-50 text-red-700 border-red-200 text-[10px]" : stock <= 5 ? "bg-amber-50 text-amber-700 border-amber-200 text-[10px]" : "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"}>
                                    Stock: {stock}
                                  </Badge>
                                </div>
                                <div className="mt-1.5">
                                  <Badge className={getStatusColor(status, stock)}>{getStatusLabel(status, stock)}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button onClick={() => { setSelectedItem(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setModalMode("edit"); setSelectedItem(item); setMenuFormData({ name: item.name || "", category: item.category || "", price: item.price || "", stock: item.stock || "", is_available: item.is_available !== false, description: item.description || "" }); setMenuModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (activeTab === "orders") {
                        const status = getOrderStatus(item.status);
                        return (
                          <div key={item.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm truncate">{getMenuItemName(item.menu_item)}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                  <span className="text-xs text-gray-600">{item.student?.name || "Ã¢â‚¬â€"}</span>
                                  <span className="text-xs text-gray-500">Ãƒâ€”{item.quantity || 1}</span>
                                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.total_amount || item.price || 0)}</span>
                                </div>
                                <div className="mt-1.5">
                                  <Badge className={`${status.color} flex items-center gap-1 text-[10px]`}>
                                    {ORDER_STATUS_ICONS[item.status]}
                                    {status.label}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button onClick={() => { setSelectedOrder(item); setStatusModalOpen(true); }} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setSelectedOrder(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        const colorClass = CATEGORY_COLORS[item.color] || CATEGORY_COLORS.default;
                        const itemCount = menuItems.filter(i => i.category === item.id || i.category === item.id.toString()).length;
                        return (
                          <div key={item.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                                    <Tag className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-gray-900 text-sm truncate">{item.name || "Ã¢â‚¬â€"}</span>
                                </div>
                                <p className="text-xs text-gray-600 truncate">{item.description || "Ã¢â‚¬â€"}</p>
                                <div className="mt-1">
                                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{itemCount} items</Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button onClick={() => { setSelectedCategory(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setModalMode("edit"); setSelectedCategory(item); setCategoryFormData({ name: item.name || "", description: item.description || "", color: item.color || "default" }); setCategoryModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-100">
                        {activeTab === "menu" && (
                          <>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === "orders" && (
                          <>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === "categories" && (
                          <>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pageItems.map((item) => {
                        if (activeTab === "menu") {
                          const stock = Number(item.stock) || 0;
                          const status = item.is_available !== false;
                          return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <Utensils className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 truncate max-w-[150px]">{item.name || "Ã¢â‚¬â€"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs whitespace-nowrap">
                                  {getCategoryName(item.category)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 font-medium text-gray-900">{formatCurrency(item.price)}</td>
                              <td className="px-4 py-3.5">
                                <Badge className={stock === 0 ? "bg-red-50 text-red-700 border-red-200 text-xs" : stock <= 5 ? "bg-amber-50 text-amber-700 border-amber-200 text-xs" : "bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"}>
                                  {stock}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5">
                                <Badge className={getStatusColor(status, stock)}>{getStatusLabel(status, stock)}</Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setSelectedItem(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { setModalMode("edit"); setSelectedItem(item); setMenuFormData({ name: item.name || "", category: item.category || "", price: item.price || "", stock: item.stock || "", is_available: item.is_available !== false, description: item.description || "" }); setMenuModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        } else if (activeTab === "orders") {
                          const status = getOrderStatus(item.status);
                          return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <span className="font-medium text-gray-900 truncate max-w-[150px]">{getMenuItemName(item.menu_item)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-gray-700 truncate max-w-[120px]">{item.student?.name || "Ã¢â‚¬â€"}</td>
                              <td className="px-4 py-3.5 text-gray-700">{item.quantity || 1}</td>
                              <td className="px-4 py-3.5 font-medium text-gray-900">{formatCurrency(item.total_amount || item.price || 0)}</td>
                              <td className="px-4 py-3.5">
                                <Badge className={`${status.color} flex items-center gap-1 text-xs whitespace-nowrap`}>
                                  {ORDER_STATUS_ICONS[item.status]}
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setSelectedOrder(item); setStatusModalOpen(true); }} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" title="Update status">
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { setSelectedOrder(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        } else {
                          const colorClass = CATEGORY_COLORS[item.color] || CATEGORY_COLORS.default;
                          const itemCount = menuItems.filter(i => i.category === item.id || i.category === item.id.toString()).length;
                          return (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                                    <Tag className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-gray-900 truncate max-w-[150px]">{item.name || "Ã¢â‚¬â€"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-[200px]">{item.description || "Ã¢â‚¬â€"}</td>
                              <td className="px-4 py-3.5">
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">{itemCount}</Badge>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setSelectedCategory(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { setModalMode("edit"); setSelectedCategory(item); setCategoryFormData({ name: item.name || "", description: item.description || "", color: item.color || "default" }); setCategoryModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {currentItems.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              startIndex={startIndex} 
              itemsShown={pageItems.length} 
              totalItems={currentItems.length} 
              onPageChange={setCurrentPage} 
            />
          )}
        </Card>
      </div>

      {/* Modals */}
      <CategoryModal 
        isOpen={categoryModalOpen} 
        onClose={() => { setCategoryModalOpen(false); setSelectedCategory(null); }} 
        mode={modalMode} 
        formData={categoryFormData} 
        setFormData={setCategoryFormData} 
        onSave={handleSaveCategory} 
        loading={saving} 
      />
      <MenuItemModal 
        isOpen={menuModalOpen} 
        onClose={() => { setMenuModalOpen(false); setSelectedItem(null); }} 
        mode={modalMode} 
        formData={menuFormData} 
        setFormData={setMenuFormData} 
        onSave={handleSaveMenuItem} 
        loading={saving} 
        categories={categories} 
      />
      <OrderModal 
        isOpen={orderModalOpen} 
        onClose={() => { setOrderModalOpen(false); setOrderFormData({ menu_item: "", quantity: 1, student: "", status: "placed" }); }} 
        formData={orderFormData} 
        setFormData={setOrderFormData} 
        onSave={handleAddOrder} 
        loading={saving} 
        menuItems={menuItems} 
      />
      <ViewDetailsModal 
        isOpen={detailsModalOpen} 
        onClose={() => { setDetailsModalOpen(false); setSelectedItem(null); setSelectedOrder(null); setSelectedCategory(null); }} 
        item={selectedItem || selectedOrder || selectedCategory} 
        type={activeTab} 
      />
      <UpdateOrderStatusModal 
        isOpen={statusModalOpen} 
        onClose={() => { setStatusModalOpen(false); setSelectedOrder(null); }} 
        order={selectedOrder} 
        onUpdate={handleUpdateOrderStatus} 
        loading={saving} 
      />

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog 
          open={true} 
          title={`Delete ${activeTab === "menu" ? "Menu Item" : activeTab === "orders" ? "Order" : "Category"}`} 
          message={
            activeTab === "menu" ? `Are you sure you want to delete "${deletingItem.name}"?` : 
            activeTab === "orders" ? `Are you sure you want to delete this order for "${getMenuItemName(deletingItem.menu_item)}"?` : 
            `Are you sure you want to delete "${deletingItem.name}"?`
          } 
          confirmLabel="Delete" 
          onConfirm={handleDelete} 
          onCancel={() => setDeletingItem(null)} 
          loading={saving} 
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 ${
          toast.type === "success" ? "bg-emerald-600" : 
          toast.type === "error" ? "bg-red-600" : "bg-blue-600"
        } text-white text-xs md:text-sm px-4 md:px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2 max-w-full md:max-w-md`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          <span className="break-words">{toast.message}</span>
        </div>
      )}
    </FadeIn>
  );
};

export default Canteen;