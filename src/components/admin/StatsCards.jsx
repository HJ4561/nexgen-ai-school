/**
 * ============================================
 * STATS CARDS COMPONENT
 * ============================================
 * 
 * Purpose: Displays inventory statistics in a grid of cards
 * Features:
 * - Total Items count
 * - Categories count
 * - Low Stock items count
 * - Available items count
 * - Color-coded icons for each stat type
 * - Responsive grid layout (2 columns mobile, 4 columns desktop)
 * - Default values when stats are missing
 * 
 * Dependencies:
 * - lucide-react for icons (Package, AlertTriangle, CheckCircle, TrendingUp)
 * - @/components/ui/Card for container
 * 
 * Usage:
 * <StatsCards stats={inventoryStats} />
 * ============================================
 */

import React from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';

/**
 * ============================================
 * STATS CARDS COMPONENT
 * ============================================
 * 
 * Renders inventory statistics in a visual grid format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics object containing inventory counts
 * @param {number} props.stats.totalItems - Total number of inventory items
 * @param {number} props.stats.categories - Number of categories
 * @param {number} props.stats.lowStock - Number of low stock items
 * @param {number} props.stats.available - Number of available items
 * @returns {JSX.Element} Inventory statistics grid
 * 
 * @example
 * const stats = {
 *   totalItems: 150,
 *   categories: 12,
 *   lowStock: 8,
 *   available: 142
 * };
 * 
 * <StatsCards stats={stats} />
 * ============================================
 */
const StatsCards = ({ stats }) => {
  /**
   * ============================================
   * STAT ITEMS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} items
   * @property {string} label - Display label for the stat
   * @property {number} value - The statistic value (with fallback to 0)
   * @property {Component} icon - Lucide icon component
   * @property {string} color - Text color class for the icon
   * @property {string} bg - Background color class for the icon container
   */
  const items = [
    { 
      label: 'Total Items', 
      value: stats?.totalItems || 0, 
      icon: Package, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Categories', 
      value: stats?.categories || 0, 
      icon: TrendingUp, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50' 
    },
    { 
      label: 'Low Stock', 
      value: stats?.lowStock || 0, 
      icon: AlertTriangle, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-50' 
    },
    { 
      label: 'Available', 
      value: stats?.available || 0, 
      icon: CheckCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-50' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* ─── Render each stat card ─── */}
      {items.map((item, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon container with role-based color */}
            <div className={`p-2 rounded-lg ${item.bg}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            {/* Stat label and value */}
            <div>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;