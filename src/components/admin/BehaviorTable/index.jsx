// src/components/admin/BehaviorTable/index.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

// UI Components
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/admin/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

// Utils
import { formatDate, getSeverityBadgeClass, getStatusBadgeClass } from "@/modules/admin/pages/BehaviorLogs/utils/helpers";

const BehaviorTable = ({
  logs = [],
  onLogClick,
  onStatusUpdate,
  pagination,
  loading,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const columns = [
    { key: "student_name", label: "Student" },
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "severity", label: "Severity" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "actions", label: "Actions" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon="??"
        title="No Behavior Logs Found"
        description="Start tracking student behavior by adding a new log."
        actionText="Add Log"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onLogClick(log)}
              onMouseEnter={() => setSelectedRow(log.id)}
              onMouseLeave={() => setSelectedRow(null)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {log.student_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {log.student_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.student_class} � {log.student_section}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900 capitalize">
                  {log.type}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs truncate">
                  {log.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getSeverityBadgeClass(log.severity)}>
                  {log.severity}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={getStatusBadgeClass(log.status)}>
                  {log.status?.replace("_", " ")}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(log.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLogClick(log);
                    }}
                  >
                    View
                  </Button>
                  {log.status === "pending" && (
                    <Button
                      size="sm"
                      className="text-xs bg-green-500 hover:bg-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusUpdate(log.id, "resolved");
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default BehaviorTable;
