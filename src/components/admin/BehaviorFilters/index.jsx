// src/components/admin/BehaviorFilters/index.jsx
import React, { useState, useEffect } from "react";

// UI Components
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

// Icons
const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterOptions = {
  severity: [
    { value: "", label: "All Severities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ],
  type: [
    { value: "", label: "All Types" },
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
    { value: "academic", label: "Academic" },
    { value: "disciplinary", label: "Disciplinary" },
    { value: "social", label: "Social" },
  ],
  status: [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ],
};

const BehaviorFilters = ({
  filters = {},
  onFilterChange,
  onExport,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local filters with parent when filters prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      severity: "",
      type: "",
      status: "",
      dateRange: null,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = () => {
    return Object.values(localFilters).some(
      (value) => value && value !== "" && value !== null
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search - Always visible */}
        <div className="flex-1 min-w-[180px]">
          <Input
            type="text"
            placeholder="Search students or teachers..."
            value={localFilters.search || ""}
            onChange={(e) => handleChange("search", e.target.value)}
            prefix={<SearchIcon />}
            className="w-full"
          />
        </div>

        {/* Desktop: All filters visible */}
        <div className="hidden md:flex md:flex-row items-center gap-3 flex-wrap">
          <div className="w-36">
            <Select
              options={FilterOptions.severity}
              value={localFilters.severity || ""}
              onChange={(e) => handleChange("severity", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-36">
            <Select
              options={FilterOptions.type}
              value={localFilters.type || ""}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-36">
            <Select
              options={FilterOptions.status}
              value={localFilters.status || ""}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            {hasActiveFilters() && (
              <button
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                onClick={handleReset}
                disabled={loading}
              >
                Clear
              </button>
            )}
            <button
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              onClick={onExport}
              disabled={loading}
            >
              Export
            </button>
          </div>
        </div>

        {/* Mobile: Toggle filters */}
        <div className="flex md:hidden items-center gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
          <button
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            onClick={onExport}
            disabled={loading}
          >
            Export
          </button>
        </div>
      </div>

      {/* Mobile: Expanded filters */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 md:hidden space-y-3">
          <Select
            options={FilterOptions.severity}
            value={localFilters.severity || ""}
            onChange={(e) => handleChange("severity", e.target.value)}
            className="w-full"
          />
          <Select
            options={FilterOptions.type}
            value={localFilters.type || ""}
            onChange={(e) => handleChange("type", e.target.value)}
            className="w-full"
          />
          <Select
            options={FilterOptions.status}
            value={localFilters.status || ""}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full"
          />
          {hasActiveFilters() && (
            <button
              className="w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              onClick={handleReset}
              disabled={loading}
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active filter tags */}
      {hasActiveFilters() && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          {localFilters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              Search: {localFilters.search}
              <button
                onClick={() => handleChange("search", "")}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.severity && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full">
              Severity: {localFilters.severity}
              <button
                onClick={() => handleChange("severity", "")}
                className="hover:text-yellow-900"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              Type: {localFilters.type}
              <button
                onClick={() => handleChange("type", "")}
                className="hover:text-purple-900"
              >
                ×
              </button>
            </span>
          )}
          {localFilters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
              Status: {localFilters.status}
              <button
                onClick={() => handleChange("status", "")}
                className="hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BehaviorFilters;