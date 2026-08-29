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
        <div className={`flex flex-col md:flex-row items-center gap-1.5 ${align === "right" ? "justify-end" : ""}`}>
          {label}
          {isSorted ? (
            sortDir === "asc" ? (
              <ChevronUp className="w-3.5 h-3.5 text-blue-500 px-4 sm:px-6 lg:px-8" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-blue-500 px-4 sm:px-6 lg:px-8" />
            )
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 px-4 sm:px-6 lg:px-8" />
          )}
        </div>
      </th>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto px-4 sm:px-6 lg:px-8">
        <div class="overflow-x-auto -mx-4 sm:mx-6 lg:mx-8 sm:mx-6 lg:mx-8 sm:mx-0"><div class="inline-block md:hidden min-w-full align-middle"><table className="w-full px-4 sm:px-6 lg:px-8">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 px-4 sm:px-6 lg:px-8">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3.5 px-4 sm:px-6 lg:px-8">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse px-4 sm:px-6 lg:px-8" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse px-4 sm:px-6 lg:px-8">
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3.5 px-4 sm:px-6 lg:px-8">
                    <div className="h-3 w-24 bg-gray-100 rounded px-4 sm:px-6 lg:px-8" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table></div></div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="flex flex-col md:flex-row-col items-center justify-center py-16 px-4 px-4 sm:px-6 lg:px-8">
        {EmptyIcon && (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex flex-col md:flex-row items-center justify-center mb-4 px-4 sm:px-6 lg:px-8">
            <EmptyIcon className="w-8 h-8 text-gray-400 px-4 sm:px-6 lg:px-8" />
          </div>
        )}
        <p className="text-gray-500 font-medium px-4 sm:px-6 lg:px-8">{emptyMessage}</p>
        <p className="text-sm md:text-base md:text-base text-gray-400 mt-1 px-4 sm:px-6 lg:px-8">Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto px-4 sm:px-6 lg:px-8">
      <div class="overflow-x-auto -mx-4 sm:mx-6 lg:mx-8 sm:mx-6 lg:mx-8 sm:mx-0"><div class="inline-block md:hidden min-w-full align-middle"><table className="w-full px-4 sm:px-6 lg:px-8">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100 px-4 sm:px-6 lg:px-8">
            {onSelectAll && (
              <th className="px-4 py-3.5 w-10 px-4 sm:px-6 lg:px-8">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.size === data.length}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 focus:ring-blue-500 px-4 sm:px-6 lg:px-8"
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
                  <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                    {col.icon && <span className="text-gray-400 px-4 sm:px-6 lg:px-8">{col.icon}</span>}
                    {col.label}
                  </div>
                </th>
              )
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 px-4 sm:px-6 lg:px-8">
          {data.map((row, rowIdx) => (
            <tr
              key={row[rowKey] || rowIdx}
              className={`hover:bg-blue-50/30 transition-colors group ${
                selectedIds.has(row[rowKey]) ? "bg-blue-50/40" : ""
              }`}
            >
              {onSelectOne && (
                <td className="px-4 py-3.5 px-4 sm:px-6 lg:px-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row[rowKey])}
                    onChange={() => onSelectOne(row[rowKey])}
                    className="rounded border-gray-300 focus:ring-blue-500 px-4 sm:px-6 lg:px-8"
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
      </table></div></div>
    </div>
  );
};

export default EnhancedTable;
