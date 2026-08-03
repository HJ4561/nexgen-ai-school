// src/components/admin/EnhancedTable.jsx
import React from "react";
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

/**
 * EnhancedTable - A professional table component with sorting, selection, and responsive design
 * 
 * Features:
 * - Sortable columns with visual indicators
 * - Row selection with checkbox
 * - Empty state handling
 * - Loading skeleton
 * - Responsive design
 * - Customizable cell rendering
 */
export const EnhancedTable = ({
  columns = [],
  data = [],
  loading = false,
  selectedIds = new Set(),
  onSelectAll,
  onSelectOne,
  onSort,
  sortField,
  sortDir,
  emptyMessage = "No data found",
  emptyIcon: EmptyIcon,
  rowKey = "id",
  className = "",
  ...props
}) => {
  // Sortable header component
  const SortableHeader = ({ field, label, align = "left", className = "" }) => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => onSort?.(field)}
        className={`px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors ${
          align === "right" ? "text-right" : "text-left"
        } ${className}`}
      >
        <div className={`flex items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
          {label}
          {isSorted ? (
            sortDir === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />
          )}
        </div>
      </th>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3.5">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3.5">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {EmptyIcon && (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <EmptyIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {onSelectAll && (
              <th className="px-4 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 focus:ring-blue-500"
                />
              </th>
            )}
            {columns.map((col, idx) => (
              col.sortable ? (
                <SortableHeader
                  key={idx}
                  field={col.field}
                  label={col.label}
                  align={col.align || "left"}
                  className={col.headerClassName}
                />
              ) : (
                <th
                  key={idx}
                  className={`px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.headerClassName || ""}`}
                >
                  <div className="flex items-center gap-2">
                    {col.icon && <span className="text-gray-400">{col.icon}</span>}
                    {col.label}
                  </div>
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((row, rowIdx) => (
            <tr
              key={row[rowKey] || rowIdx}
              className={`hover:bg-blue-50/30 transition-colors group ${
                selectedIds.has(row[rowKey]) ? "bg-blue-50/40" : ""
              }`}
            >
              {onSelectOne && (
                <td className="px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row[rowKey])}
                    onChange={() => onSelectOne(row[rowKey])}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </td>
              )}
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-4 py-3.5 ${col.align === "right" ? "text-right" : "text-left"} ${col.cellClassName || ""}`}
                >
                  {col.render ? col.render(row) : row[col.field] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnhancedTable;
