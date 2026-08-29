/**
 * ============================================
 * LATEST COMPLAINTS COMPONENT
 * ============================================
 * 
 * Purpose: Displays the most recent complaints in a compact list
 * Features:
 * - Shows latest complaints with status badges
 * - Complaint type and description display
 * - Reporter information with role-based styling
 * - Creation date with relative time
 * - Click to view details
 * - Responsive card layout
 * - Scrollable list with max height
 * - Empty state handling
 * 
 * Dependencies:
 * - lucide-react for icons (MessageSquare, Clock, CheckCircle, AlertCircle)
 * - @/components/ui/Badge for status indicators
 * - @/components/common/StatusBadge for status display
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <LatestComplaints
 *   complaints={recentComplaints}
 *   onViewComplaint={handleViewComplaint}
 *   role="admin"
 * />
 * ============================================
 */

import React from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate, getInitials } from '@/utils/helpers';

/**
 * ============================================
 * LATEST COMPLAINTS COMPONENT
 * ============================================
 * 
 * Renders a list of the most recent complaints
 * 
 * @param {Object} props - Component props
 * @param {Array} props.complaints - Array of complaint objects
 * @param {Function} props.onViewComplaint - Callback when a complaint is clicked
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @param {number} props.maxItems - Maximum number of complaints to display (default: 5)
 * @returns {JSX.Element} Latest complaints list UI
 * 
 * @example
 * const complaints = [
 *   { id: 1, complaint_type: 'Behavior', description: '...', status: 'pending', created_at: '2024-01-15' }
 * ];
 * 
 * <LatestComplaints
 *   complaints={complaints}
 *   onViewComplaint={(complaint) => openDetails(complaint)}
 *   role="admin"
 *   maxItems={5}
 * />
 * ============================================
 */
const LatestComplaints = ({ 
  complaints = [], 
  onViewComplaint, 
  role = 'admin',
  maxItems = 5 
}) => {
  /**
   * ============================================
   * STATUS COLOR MAPPING
   * ============================================
   * 
   * Maps complaint status to badge colors
   * 
   * @param {string} status - Complaint status
   * @returns {string} CSS classes for the badge
   */
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  /**
   * ============================================
   * STATUS ICON MAPPING
   * ============================================
   * 
   * Returns appropriate icon based on complaint status
   * 
   * @param {string} status - Complaint status
   * @returns {JSX.Element} Icon component
   */
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-500" />;
      case 'open':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <MessageSquare size={14} className="text-gray-400" />;
    }
  };

  /**
   * ============================================
   * GET ROLE COLOR
   * ============================================
   * 
   * Returns role-based color for reporter avatar
   * 
   * @param {string} reporterRole - Role of the reporter
   * @returns {string} CSS classes for the avatar
   */
  const getRoleColor = (reporterRole) => {
    switch (reporterRole?.toLowerCase()) {
      case 'student':
        return 'bg-[var(--color-student-light)] text-[var(--color-student-primary)]';
      case 'teacher':
        return 'bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)]';
      case 'parent':
        return 'bg-[var(--color-parent-light)] text-[var(--color-parent-primary)]';
      default:
        return 'bg-[var(--color-admin-light)] text-[var(--color-admin-primary)]';
    }
  };

  // Take only the most recent complaints
  const recentComplaints = complaints.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-4">
      {/* â”€â”€â”€ Header â”€â”€â”€ */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--color-admin-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Latest Complaints
          </h3>
        </div>
        <Badge className="bg-[var(--color-admin-light)] text-[var(--color-admin-primary)] text-[10px]">
          {recentComplaints.length}
        </Badge>
      </div>

      {/* â”€â”€â”€ Complaint List â”€â”€â”€ */}
      {recentComplaints.length === 0 ? (
        // â”€â”€â”€ Empty State â”€â”€â”€
        <div className="text-center py-6">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-[var(--color-text-muted)]">No complaints yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {recentComplaints.map((complaint) => {
            const initials = getInitials(complaint.reporter_name || complaint.user_name);
            const roleColor = getRoleColor(complaint.reporter_role || complaint.user_role);
            
            return (
              <div
                key={complaint.id}
                className="group p-3 bg-[var(--color-surface-dim)] rounded-lg hover:bg-white transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-sm"
                onClick={() => onViewComplaint?.(complaint)}
              >
                <div className="flex items-start gap-3">
                  {/* â”€â”€â”€ Reporter Avatar â”€â”€â”€ */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${roleColor}`}>
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* â”€â”€â”€ Complaint Header â”€â”€â”€ */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {complaint.complaint_type}
                      </span>
                      <StatusBadge 
                        status={complaint.status} 
                        className="text-[10px] px-2 py-0.5"
                      />
                    </div>

                    {/* â”€â”€â”€ Description â”€â”€â”€ */}
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                      {complaint.description}
                    </p>

                    {/* â”€â”€â”€ Reporter and Date â”€â”€â”€ */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {complaint.reporter_name || complaint.user_name || 'Unknown'}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-[var(--color-text-muted)]" />
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatDate(complaint.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* â”€â”€â”€ Status Icon â”€â”€â”€ */}
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(complaint.status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€â”€ View All Link â”€â”€â”€ */}
      {recentComplaints.length > 0 && complaints.length > maxItems && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
          <button
            onClick={() => onViewComplaint?.('all')}
            className="text-xs font-medium text-[var(--color-admin-primary)] hover:underline transition-colors"
          >
            View all {complaints.length} complaints â†’
          </button>
        </div>
      )}
    </div>
  );
};

export default LatestComplaints;