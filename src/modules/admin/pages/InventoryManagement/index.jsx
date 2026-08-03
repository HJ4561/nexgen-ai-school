import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Eye, X, RefreshCw,
  AlertCircle, CheckCircle, Loader2, Package,
  TrendingUp, TrendingDown, Filter, ChevronDown,
  Download, Calendar, DollarSign, Building, Users, FileText
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// Import from central components
import StatsCards from "@/components/admin/Inventory/StatsCards";
import InventoryFilters from "@/components/admin/Inventory/InventoryFilters";
import InventoryTable from "@/components/admin/Inventory/InventoryTable";
import InventoryDrawer from "@/components/admin/Inventory/InventoryDrawer";

// Import helper functions from inventory helpers
import { 
  formatCurrency, 
  getStatusColor, 
  getStatusLabel, 
  getStatus,
  getCategoryStyle,
  formatDate,
  getInventoryStats,
  filterInventoryItems,
  getUniqueCategories
} from "@/utils/inventory/helpers";

const INVENTORY_API = "/inventory/items/";

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "",
    price: "",
    supplier: "",
    location: "",
    status: "available",
    description: "",
  });
  const pageSize = 10;

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    try {
      const response = await api.get(INVENTORY_API);
      const data = response.data?.results || response.data || [];
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch inventory items:", error);
      if (error.response?.status === 401) {
        setErrorMessage("Authentication failed. Please login again.");
        showToast("Authentication failed. Please login again.", "error");
      } else if (error.response?.status === 404) {
        setErrorMessage("Inventory endpoint not found.");
        showToast("Inventory module not available", "error");
      } else if (error.response?.status === 403) {
        setErrorMessage("You don't have permission to view inventory.");
        showToast("Permission denied", "error");
      } else {
        setErrorMessage(error.response?.data?.detail || "Failed to load inventory");
        showToast("Failed to load inventory", "error");
      }
      setItems([]);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const openAddDrawer = () => {
    setDrawerMode("add");
    setEditingItem(null);
    setFormData({
      name: "",
      category: "",
      quantity: "",
      unit: "",
      price: "",
      supplier: "",
      location: "",
      status: "available",
      description: "",
    });
    setDrawerOpen(true);
  };

  const openEditDrawer = (item) => {
    setDrawerMode("edit");
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity || "",
      unit: item.unit || "",
      price: item.price || "",
      supplier: item.supplier || "",
      location: item.location || "",
      status: item.status || "available",
      description: item.description || "",
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity) || 0,
        unit: formData.unit,
        price: Number(formData.price) || 0,
        supplier: formData.supplier,
        location: formData.location,
        status: formData.status,
        description: formData.description,
      };

      if (drawerMode === "edit" && editingItem) {
        const url = INVENTORY_API + editingItem.id + "/";
        const response = await api.patch(url, payload);
        setItems(items.map(i => i.id === editingItem.id ? { ...i, ...response.data } : i));
        showToast("Item updated successfully", "success");
      } else {
        const response = await api.post(INVENTORY_API, payload);
        setItems([response.data, ...items]);
        showToast("Item created successfully", "success");
      }
      setDrawerOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
      showToast(error.response?.data?.detail || "Failed to save item", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const url = INVENTORY_API + deletingItem.id + "/";
      await api.delete(url);
      setItems(items.filter(i => i.id !== deletingItem.id));
      showToast("Item deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
      showToast("Failed to delete item", "error");
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("all");
    setFilterStatus("all");
  };

  const filteredItems = useMemo(() => {
    return filterInventoryItems(items, searchTerm, filterCategory, filterStatus);
  }, [items, searchTerm, filterCategory, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = filterCategory !== "all" || filterStatus !== "all" || searchTerm;

  const stats = useMemo(() => {
    return getInventoryStats(items);
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading inventory...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <PageHeader
          title="Inventory Management"
          subtitle="Manage school inventory and supplies"
          breadcrumbs={["Admin", "Inventory"]}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchItems}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                disabled={loading}
              >
                <RefreshCw className={"w-4 h-4 " + (loading ? "animate-spin" : "")} />
                Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={openAddDrawer}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          }
        />

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading inventory</p>
              <p className="text-amber-600">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <InventoryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Table */}
        <InventoryTable
          pageItems={pageItems}
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          totalItems={filteredItems.length}
          onPageChange={setCurrentPage}
          onView={setSelectedItem}
          onEdit={openEditDrawer}
          onDelete={setDeletingItem}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Inventory Drawer */}
      <InventoryDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        mode={drawerMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        saving={saving}
      />

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title="Delete this item?"
          message={"This permanently removes \"" + deletingItem.name + "\" from inventory. This action cannot be undone."}
          confirmLabel="Delete Item"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={"fixed bottom-6 right-6 z-50 " + (toast.type === "success" ? "bg-emerald-600" : "bg-red-600") + " text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2"}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default InventoryManagement;
