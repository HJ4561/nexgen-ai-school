/**
 * ============================================
 * FORMATTER UTILITIES
 * ============================================
 * 
 * Purpose: Collection of formatting functions for:
 * - CNIC numbers
 * - Currency (PKR)
 * - Numbers
 * - Dates
 * 
 * Usage:
 * import { formatCurrency, formatDate } from '@/utils/formatter';
 * ============================================
 */

/**
 * Format CNIC (Computerized National Identity Card) number
 * Converts raw digits to format: 12345-1234567-1
 * 
 * @param {string} value - Raw CNIC input
 * @returns {string} Formatted CNIC with dashes
 * 
 * @example
 * formatCNIC('1234512345671') // "12345-1234567-1"
 */
export function formatCNIC(value) {
  // Extract only digits
  const digits = value.replace(/\D/g, '');
  // Limit to 13 digits (standard CNIC length)
  const trimmed = digits.slice(0, 13);
  
  // Insert dashes at positions 5 and 12
  let formatted = trimmed;
  if (trimmed.length > 4) {
    formatted = trimmed.slice(0, 5) + '-' + trimmed.slice(5);
  }
  if (trimmed.length > 12) {
    formatted = formatted.slice(0, 13) + '-' + formatted.slice(13);
  }
  return formatted;
}

/**
 * Format a number as PKR currency
 * 
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default 'PKR')
 * @param {string} locale - Locale string (default 'en-PK')
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1500) // "Rs 1,500"
 * formatCurrency(2500, 'USD', 'en-US') // "$2,500"
 */
export const formatCurrency = (amount, currency = 'PKR', locale = 'en-PK') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format a number with commas
 * 
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 * 
 * @example
 * formatNumber(1000000) // "1,000,000"
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a date to a readable string
 * 
 * @param {string|Date} date - The date to format
 * @param {string} locale - Locale string (default 'en-US')
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate('2024-01-15') // "Jan 15, 2024"
 * formatDate(new Date()) // current date
 */
export const formatDate = (date, locale = 'en-US') => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};