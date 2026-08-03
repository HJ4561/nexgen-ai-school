import React from "react";
import { Eye, User, Calendar, AlertCircle, ChevronDown, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Pagination from "@/components/admin/Pagination";
import { getSeverityBadgeClass, formatDate } from "@/utils/behaviorHelpers";

const BehaviorTable = ({ 
  data, 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  onView 
}) => {
  if (data.length === 0) {
    return (
      <Card className="p-12 text-center border border-gray-100 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No behavior logs found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((log) => {
              const typeColors = {
                positive: "bg-green-100 text-green-700 border-green-200",
                negative: "bg-red-100 text-red-700 border-red-200",
                neutral: "bg-gray-100 text-gray-700 border-gray-200",
              };
              const typeLabels = {
                positive: "Positive",
                negative: "Negative",
                neutral: "Neutral",
              };
              const type = log.type || "neutral";
              
              return (
                <tr
                  key={log.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => onView(log)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {log.student_name?.charAt(0).toUpperCase() || "S"}
                      </div>
                      <span className="font-medium text-gray-800">{log.student_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={"text-xs flex items-center gap-1.5 px-2.5 py-1 " + typeColors[type]}>
                      {type === "positive" && <CheckCircle className="w-3 h-3" />}
                      {type === "negative" && <AlertCircle className="w-3 h-3" />}
                      {type === "neutral" && <AlertCircle className="w-3 h-3" />}
                      {typeLabels[type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {log.description || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={"text-xs px-2.5 py-1 capitalize " + getSeverityBadgeClass(log.severity)}>
                      {log.severity || "low"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(log.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{log.reported_by_name || log.teacher_name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(log);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="border-t border-gray-100">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={(currentPage - 1) * itemsPerPage}
          itemsShown={data.length}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </div>
    </Card>
  );
};

export default BehaviorTable;
