import React from "react";

const BehaviorFilters = ({ filters, onFilterChange, onSearch, onClear }) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search students..."
        value={filters.search || ""}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={filters.type || "all"}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Types</option>
        <option value="positive">Positive</option>
        <option value="negative">Negative</option>
        <option value="neutral">Neutral</option>
      </select>
      <select
        value={filters.severity || "all"}
        onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Severities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Clear
      </button>
    </div>
  );
};

export default BehaviorFilters;