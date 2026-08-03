/**
 * ============================================
 * BADGE COMPONENT
 * ============================================
 * 
 * Purpose: Reusable badge component for status indicators
 * Features:
 * - Multiple variants (default, success, warning, danger, info)
 * - Color-coded styles for each variant
 * - Custom className support
 * - Consistent rounded pill styling
 * - Flexible content children
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="warning">Pending</Badge>
 * <Badge variant="danger">Overdue</Badge>
 * <Badge className="text-xs">Custom</Badge>
 * ============================================
 */

import React from 'react';

/**
 * ============================================
 * BADGE COMPONENT
 * ============================================
 * 
 * Renders a styled badge with variant support
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Badge variant (default, success, warning, danger, info)
 * @returns {JSX.Element} Styled badge
 * 
 * @example
 * // Success badge
 * <Badge variant="success">Active</Badge>
 * 
 * // Warning badge with custom class
 * <Badge variant="warning" className="text-xs font-bold">
 *   Pending
 * </Badge>
 * 
 * // Default badge
 * <Badge>Default</Badge>
 * ============================================
 */
export const Badge = ({ children, className, variant }) => {
  /**
   * ============================================
   * VARIANT CLASSES
   * ============================================
   * 
   * Maps variant names to Tailwind color classes
   * 
   * @constant {Object} variantClasses
   * @property {string} default - Gray theme
   * @property {string} success - Green theme
   * @property {string} warning - Yellow theme
   * @property {string} danger - Red theme
   * @property {string} info - Blue theme
   */
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${variant ? variantClasses[variant] : variantClasses.default}
      ${className || ''}
    `}>
      {children}
    </span>
  );
};

export default Badge;