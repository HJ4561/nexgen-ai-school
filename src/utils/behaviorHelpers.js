// src/utils/behaviorHelpers.js

/**
 * ============================================
 * BEHAVIOR HELPERS
 * ============================================
 * 
 * Purpose: Utility functions for behavior management
 * Features:
 * - Student initials generation
 * - Date formatting with localization
 * - Severity badge styling
 * - Type badge styling
 * - Status badge styling
 * 
 * Dependencies: None (pure functions)
 * 
 * Usage:
 * import { getInitials, formatDate, getSeverityBadgeClass } from "@/utils/behaviorHelpers";
 * ============================================
 */

/**
 * ============================================
 * GET INITIALS
 * ============================================
 * 
 * Extracts initials from a name
 * 
 * @param {string} name - Full name of the person
 * @param {number} max - Maximum number of initials (default: 2)
 * @returns {string} Uppercase initials
 * 
 * @example
 * getInitials("John Doe") // Returns "JD"
 * getInitials("Jane") // Returns "J"
 * getInitials("") // Returns "U" (Unknown)
 * getInitials("Muhammad Ali Khan", 3) // Returns "MAK"
 */
export const getInitials = (name, max = 2) => {
  // Handle empty or invalid input
  if (!name || typeof name !== 'string') return "U";
  
  // Trim and split by spaces
  const parts = name.trim().split(/\s+/);
  
  // If only one part, return first letter
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  // Get initials from first and last name
  const initials = parts
    .slice(0, max)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
  
  return initials || "U";
};

/**
 * ============================================
 * FORMAT DATE
 * ============================================
 * 
 * Formats a date string to a readable format
 * 
 * @param {string|Date} dateString - Date to format
 * @param {string} locale - Locale for formatting (default: 'en-PK')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate("2024-01-15T10:30:00Z") // Returns "15 Jan 2024"
 * formatDate(new Date()) // Returns current date
 * formatDate("") // Returns "N/A"
 */
export const formatDate = (dateString, locale = 'en-PK', options = {}) => {
  if (!dateString) return "N/A";
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    
    return date.toLocaleDateString(locale, { ...defaultOptions, ...options });
  } catch (error) {
    return "N/A";
  }
};

/**
 * ============================================
 * FORMAT DATETIME
 * ============================================
 * 
 * Formats a date string to include time
 * 
 * @param {string|Date} dateString - Date to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted date and time string
 * 
 * @example
 * formatDateTime("2024-01-15T10:30:00Z") // Returns "15 Jan 2024, 10:30 AM"
 */
export const formatDateTime = (dateString, locale = 'en-PK') => {
  return formatDate(dateString, locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * ============================================
 * GET SEVERITY BADGE CLASS
 * ============================================
 * 
 * Returns CSS classes for severity badges
 * 
 * @param {string} severity - Severity level (low, medium, high, critical)
 * @returns {string} CSS class names
 * 
 * @example
 * getSeverityBadgeClass("low") // Returns "bg-blue-50 text-blue-700 border-blue-200"
 * getSeverityBadgeClass("high") // Returns "bg-red-50 text-red-700 border-red-200"
 */
export const getSeverityBadgeClass = (severity) => {
  const severityMap = {
    low: {
      className: "bg-blue-50 text-blue-700 border-blue-200",
      label: "Low",
    },
    medium: {
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      label: "Medium",
    },
    high: {
      className: "bg-red-50 text-red-700 border-red-200",
      label: "High",
    },
    critical: {
      className: "bg-red-100 text-red-800 border-red-300",
      label: "Critical",
    },
  };
  
  const defaultSeverity = severityMap.medium;
  return severityMap[severity?.toLowerCase()] || defaultSeverity;
};

/**
 * ============================================
 * GET SEVERITY LABEL
 * ============================================
 * 
 * Returns display label for severity level
 * 
 * @param {string} severity - Severity level
 * @returns {string} Display label
 */
export const getSeverityLabel = (severity) => {
  const severityMap = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };
  return severityMap[severity?.toLowerCase()] || severity || "Unknown";
};

/**
 * ============================================
 * GET SEVERITY COLOR
 * ============================================
 * 
 * Returns color class for severity level (for icons/text)
 * 
 * @param {string} severity - Severity level
 * @returns {string} Color class
 */
export const getSeverityColor = (severity) => {
  const colorMap = {
    low: "text-blue-600",
    medium: "text-yellow-600",
    high: "text-red-600",
    critical: "text-red-800",
  };
  return colorMap[severity?.toLowerCase()] || "text-gray-600";
};

/**
 * ============================================
 * GET TYPE BADGE CLASS
 * ============================================
 * 
 * Returns CSS classes for behavior type badges
 * 
 * @param {string} type - Behavior type (positive, negative, neutral)
 * @returns {Object} { className: string, label: string, icon: string }
 * 
 * @example
 * getTypeBadgeClass("positive") // Returns { className: "bg-green-50...", label: "Positive" }
 */
export const getTypeBadgeClass = (type) => {
  const typeMap = {
    positive: {
      className: "bg-green-50 text-green-700 border-green-200",
      label: "Positive",
      icon: "✅",
    },
    negative: {
      className: "bg-red-50 text-red-700 border-red-200",
      label: "Negative",
      icon: "❌",
    },
    neutral: {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: "Neutral",
      icon: "➖",
    },
  };
  
  const defaultType = typeMap.neutral;
  return typeMap[type?.toLowerCase()] || defaultType;
};

/**
 * ============================================
 * GET STATUS BADGE CLASS
 * ============================================
 * 
 * Returns CSS classes for status badges
 * 
 * @param {string} status - Status (pending, in-progress, resolved, rejected)
 * @returns {Object} { className: string, label: string }
 */
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    pending: {
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      label: "Pending",
    },
    "in-progress": {
      className: "bg-blue-50 text-blue-700 border-blue-200",
      label: "In Progress",
    },
    resolved: {
      className: "bg-green-50 text-green-700 border-green-200",
      label: "Resolved",
    },
    rejected: {
      className: "bg-red-50 text-red-700 border-red-200",
      label: "Rejected",
    },
    closed: {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: "Closed",
    },
  };
  
  return statusMap[status?.toLowerCase()] || {
    className: "bg-gray-50 text-gray-700 border-gray-200",
    label: status || "Unknown",
  };
};

/**
 * ============================================
 * GET STATUS LABEL
 * ============================================
 * 
 * Returns display label for status
 * 
 * @param {string} status - Status value
 * @returns {string} Display label
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    pending: "Pending",
    "in-progress": "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    closed: "Closed",
  };
  return statusMap[status?.toLowerCase()] || status || "Unknown";
};

/**
 * ============================================
 * TRUNCATE TEXT
 * ============================================
 * 
 * Truncates text to a specified length with ellipsis
 * 
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @param {string} suffix - Suffix to add (default: "...")
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = "...") => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * ============================================
 * GET COLOR FROM STATUS
 * ============================================
 * 
 * Returns Tailwind color class for status
 * 
 * @param {string} status - Status value
 * @returns {string} Color class
 */
export const getStatusColor = (status) => {
  const colorMap = {
    pending: "text-yellow-600",
    "in-progress": "text-blue-600",
    resolved: "text-green-600",
    rejected: "text-red-600",
    closed: "text-gray-600",
  };
  return colorMap[status?.toLowerCase()] || "text-gray-600";
};

// ─── Default Export ──────────────────────────────────────────────────────

export default {
  getInitials,
  formatDate,
  formatDateTime,
  getSeverityBadgeClass,
  getSeverityLabel,
  getSeverityColor,
  getTypeBadgeClass,
  getStatusBadgeClass,
  getStatusLabel,
  getStatusColor,
  truncateText,
};