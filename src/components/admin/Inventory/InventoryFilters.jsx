// src/components/admin/Inventory/InventoryFilters.jsx
import React from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearFilters,
  categories = []
}) => {
  return (
    <Card className="p-4 border border-gray-100 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          >
            <option value="all">All Categories</option>
            {Array.isArray(categories) && categories.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="low">Low Stock</option>
            <option value="unavailable">Unavailable</option>
            <option value="damaged">Damaged</option>
          </select>
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
            rightIcon={<ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />}
          >
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="border-gray-200 px-3 text-gray-500"
              onClick={clearFilters}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-4 mt-4 pt-4 border-t border-gray-200/50">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min Quantity</label>
            <input
              type="number"
              min="0"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-24"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Quantity</label>
            <input
              type="number"
              min="0"
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-24"
              placeholder="100"
            />
          </div>
          <Button variant="outline" className="border-gray-200 text-sm" onClick={clearFilters}>
            Reset
          </Button>
        </div>
      )}
    </Card>
  );
};

export default InventoryFilters;