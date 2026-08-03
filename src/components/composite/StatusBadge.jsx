/**
 * ============================================
 * STATUS BADGE COMPONENT
 * ============================================
 * 
 * Purpose: Reusable badge for displaying status with color coding
 * Features:
 * - Status-specific color schemes
 * - Support for common status types (Resolved, Pending, Open, Closed, Active, Inactive)
 * - Fallback for unknown statuses
 * - Consistent styling with Badge component
 * - Customizable with additional className
 * 
 * Supported Status Types:
 * - Resolved: Green
 * - Pending: Yellow
 * - Open: Red
 * - Closed: Gray
 * - Active: Green
 * - Inactive: Gray
 * 
 * Dependencies:
 * - @/components/ui/Badge for base styling
 * 
 * Usage:
 * <StatusBadge status="Pending" />
 * <StatusBadge status="Resolved" className="text-xs" />
 * ============================================
 */

import React from 'react';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * STATUS BADGE COMPONENT
 * ============================================
 * 
 * Renders a color-coded badge for status display
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value (Resolved, Pending, Open, Closed, Active, Inactive)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Status badge UI
 * 
 * @example
 * // Pending status
 * <StatusBadge status="Pending" />
 * 
 * // Resolved status with custom class
 * <StatusBadge status="Resolved" className="text-xs font-bold" />
 * 
 * // Unknown status (falls back to gray)
 * <StatusBadge status="Unknown" />
 * ============================================
 */
export const StatusBadge = ({ status, className = '' }) => {
  /**
   * ============================================
   * GET STATUS CONFIGURATION
   * ============================================
   * 
   * Maps status to display label and color classes
   * 
   * @param {string} status - Status value
   * @returns {Object} Configuration with label and className
   * 
   * Color mapping:
   * - Resolved/Active: Green (success)
   * - Pending: Yellow (warning)
   * - Open: Red (danger)
   * - Closed/Inactive: Gray (neutral)
   */
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-300' };
      case 'pending':
        return { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
      case 'open':
        return { label: 'Open', className: 'bg-red-100 text-red-700 border-red-300' };
      case 'closed':
        return { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-300' };
      case 'active':
        return { label: 'Active', className: 'bg-green-100 text-green-700 border-green-300' };
      case 'inactive':
        return { label: 'Inactive', className: 'bg-gray-100 text-gray-700 border-gray-300' };
      default:
        // Fallback for unknown statuses
        return { label: status || 'Unknown', className: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;