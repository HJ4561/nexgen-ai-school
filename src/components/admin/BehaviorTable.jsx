/**
 * ============================================
 * BEHAVIOR TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays behavior logs in a responsive table format
 * Features:
 * - Responsive design with mobile-first approach
 * - Desktop table view with all columns
 * - Mobile card view with compact information
 * - Severity badges with color coding
 * - Type badges with icons (Positive/Negative/Neutral)
 * - Pagination controls
 * - View details action with eye icon
 * - Avatar with student initials
 * - Empty state with helpful message
 * - Role-based theming (admin primary color)
 * 
 * Dependencies:
 * - lucide-react for icons (Eye, User, Calendar, AlertCircle, CheckCircle)
 * - @/components/ui/Badge for severity indicators
 * - @/components/ui/Card for container
 * - @/components/admin/Pagination for page controls
 * - @/utils/behaviorHelpers for formatting utilities
 * 
 * Usage:
 * <BehaviorTable
 *   data={paginatedData}
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 *   onPageChange={goToPage}
 *   onView={handleView}
 * />
 * ============================================
 */

import React from "react";
import { Eye, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Pagination from "@/components/admin/Pagination";
import { formatDate } from "@/utils/behaviorHelpers";

/**
 * ============================================
 * BEHAVIOR TABLE COMPONENT
 * ============================================
 * 
 * Renders a responsive table of behavior logs with pagination
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of behavior log objects to display
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Callback function when page changes
 * @param {Function} props.onView - Callback function when view button is clicked
 * @returns {JSX.Element} Behavior table with pagination
 * 
 * @example
 * const [page, setPage] = useState(1);
 * 
 * <BehaviorTable
 *   data={logs.slice((page-1)*10, page*10)}
 *   currentPage={page}
 *   totalPages={Math.ceil(logs.length / 10)}
 *   totalItems={logs.length}
 *   itemsPerPage={10}
 *   onPageChange={setPage}
 *   onView={(log) => openDrawer(log)}
 * />
 * ============================================
 */
const BehaviorTable = ({ 
  data, 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange,
  onView 
}) => {
  // ─── Helper Functions ──────────────────────────────────────────────

  /**
   * ============================================
   * GET STUDENT INITIALS
   * ============================================
   * 
   * Extracts initials from student name for avatar
   * 
   * @param {string} name - Student's full name
   * @returns {string} Uppercase initials (max 2 characters)
   */
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  /**
   * ============================================
   * GET TYPE BADGE
   * ============================================
   * 
   * Returns the appropriate badge configuration for behavior type
   * 
   * @param {string} type - Behavior type (positive, negative, neutral)
   * @returns {Object} { className: string, icon: Component, label: string }
   */
  const getTypeBadge = (type) => {
    const types = {
      positive: {
        className: "bg-green-100 text-green-700 border-green-200",
        icon: CheckCircle,
        label: "Positive",
      },
      negative: {
        className: "bg-red-100 text-red-700 border-red-200",
        icon: AlertCircle,
        label: "Negative",
      },
      neutral: {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: AlertCircle,
        label: "Neutral",
      },
    };
    const typeKey = type || "neutral";
    return types[typeKey];
  };

  /**
   * ============================================
   * GET SEVERITY BADGE
   * ============================================
   * 
   * Returns the appropriate badge styling for severity level
   * 
   * @param {string} severity - Severity level (low, medium, high)
   * @returns {string} CSS class names
   */
  const getSeverityBadge = (severity) => {
    const classes = {
      low: "bg-green-100 text-green-700 border-green-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-red-100 text-red-700 border-red-200",
    };
    return classes[severity] || classes.low;
  };

  // ─── Empty State ────────────────────────────────────────────────────

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

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      {/* ─── Desktop Table ────────────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Student
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Teacher
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((log) => {
              const typeInfo = getTypeBadge(log.type);
              const TypeIcon = typeInfo.icon;
              const severityClass = getSeverityBadge(log.severity);
              
              return (
                <tr
                  key={log.id}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  onClick={() => onView(log)}
                >
                  {/* Student Column */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {getInitials(log.student_name)}
                      </div>
                      <span className="font-medium text-gray-800">{log.student_name}</span>
                    </div>
                  </td>

                  {/* Type Column */}
                  <td className="px-4 py-3.5">
                    <Badge className={`text-xs flex items-center gap-1.5 px-2.5 py-1 ${typeInfo.className}`}>
                      <TypeIcon className="w-3 h-3" />
                      {typeInfo.label}
                    </Badge>
                  </td>

                  {/* Description Column */}
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-gray-600 truncate max-w-xs">
                      {log.description || "N/A"}
                    </p>
                  </td>

                  {/* Severity Column */}
                  <td className="px-4 py-3.5">
                    <Badge className={`text-xs px-2.5 py-1 capitalize ${severityClass}`}>
                      {log.severity || "low"}
                    </Badge>
                  </td>

                  {/* Date Column */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(log.created_at)}</span>
                    </div>
                  </td>

                  {/* Teacher Column */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{log.reported_by_name || log.teacher_name || "Unknown"}</span>
                    </div>
                  </td>

                  {/* Actions Column */}
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

      {/* ─── Mobile Cards ────────────────────────────────────────────── */}
      <div className="block md:hidden divide-y divide-gray-100">
        {data.map((log) => {
          const typeInfo = getTypeBadge(log.type);
          const TypeIcon = typeInfo.icon;
          const severityClass = getSeverityBadge(log.severity);
          
          return (
            <div
              key={log.id}
              className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
              onClick={() => onView(log)}
            >
              {/* Header: Student Name + Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                    {getInitials(log.student_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{log.student_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {log.reported_by_name || log.teacher_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(log);
                  }}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors shrink-0"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Body: Type, Severity, Description */}
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`text-xs flex items-center gap-1.5 px-2.5 py-1 ${typeInfo.className}`}>
                    <TypeIcon className="w-3 h-3" />
                    {typeInfo.label}
                  </Badge>
                  <Badge className={`text-xs px-2.5 py-1 capitalize ${severityClass}`}>
                    {log.severity || "low"}
                  </Badge>
                </div>
                
                {log.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {log.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* ─── Pagination ────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100 px-4 py-3">
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