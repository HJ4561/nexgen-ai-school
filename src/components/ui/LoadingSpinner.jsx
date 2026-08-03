/**
 * ============================================
 * LOADING SPINNER COMPONENT
 * ============================================
 * 
 * Purpose: Reusable loading spinner indicator
 * Features:
 * - Multiple size options (sm, md, lg)
 * - Centered container with padding
 * - Animated spin effect
 * - Blue accent color
 * - Custom className support
 * - Consistent styling across the app
 * 
 * Dependencies:
 * - React
 * 
 * Usage:
 * <LoadingSpinner size="lg" />
 * <LoadingSpinner size="sm" className="mt-4" />
 * ============================================
 */

import React from 'react';

/**
 * ============================================
 * LOADING SPINNER COMPONENT
 * ============================================
 * 
 * Renders an animated loading spinner
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg) (default: 'md')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Loading spinner UI
 * 
 * @example
 * // Large spinner
 * <LoadingSpinner size="lg" />
 * 
 * // Small spinner with custom class
 * <LoadingSpinner size="sm" className="mt-8" />
 * 
 * // Default medium spinner
 * <LoadingSpinner />
 * ============================================
 */
export const LoadingSpinner = ({ size = 'md', className }) => {
  /**
   * ============================================
   * SIZE CLASSES
   * ============================================
   * 
   * Maps size prop to Tailwind width/height classes
   * 
   * @constant {Object} sizeClasses
   * @property {string} sm - Small (16px)
   * @property {string} md - Medium (32px)
   * @property {string} lg - Large (48px)
   */
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className={`
        animate-spin rounded-full border-b-2 border-blue-600
        ${sizeClasses[size] || sizeClasses.md}
        ${className || ''}
      `} />
    </div>
  );
};

export default LoadingSpinner;