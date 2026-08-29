/**
 * ============================================
 * LOW STOCK ITEMS COMPONENT
 * ============================================
 * 
 * Purpose: Displays inventory items with low stock levels
 * Features:
 * - Shows items with low stock quantities
 * - Warning icon with yellow theme
 * - Item name and category display
 * - Quantity badge with red color for low stock
 * - Badge count showing total low stock items
 * - Limits display to 5 items with "more" indicator
 * - Empty state when all items are well stocked
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (AlertTriangle)
 * - @/components/ui/Card for container
 * - @/components/ui/Badge for count and quantity indicators
 * 
 * Usage:
 * <LowStockItems
 *   items={lowStockItems}
 *   totalLowStock={lowStockCount}
 * />
 * ============================================
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * LOW STOCK ITEMS COMPONENT
 * ============================================
 * 
 * Renders a list of inventory items with low stock levels
 * 
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of low stock inventory items
 * @param {number} props.totalLowStock - Total number of low stock items
 * @returns {JSX.Element} Low stock items list UI
 * 
 * @example
 * const lowStockItems = [
 *   { id: 1, item_name: 'Pencils', category: 'Supplies', total_quantity: 3 },
 *   { id: 2, item_name: 'Notebooks', category: 'Stationery', total_quantity: 2 }
 * ];
 * 
 * <LowStockItems
 *   items={lowStockItems}
 *   totalLowStock={lowStockItems.length}
 * />
 * ============================================
 */
const LowStockItems = ({ items, totalLowStock }) => {
  /**
   * ============================================
   * EMPTY STATE HANDLING
   * ============================================
   * 
   * Displays a success message when all items are well stocked
   * Shows green badge with "0 items" count
   */
  if (!items || items.length === 0) {
    return (
      <Card className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-2 px-4 sm:px-6 lg:px-8">
          <h3 className="font-semibold text-gray-900 px-4 sm:px-6 lg:px-8">Low Stock Items</h3>
          <Badge className="bg-green-100 text-green-700 px-4 sm:px-6 lg:px-8">0 items</Badge>
        </div>
        <p className="text-gray-500 text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8">All items are well stocked</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-3 px-4 sm:px-6 lg:px-8">
        <h3 className="font-semibold text-gray-900 flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <AlertTriangle size={18} className="text-yellow-500 px-4 sm:px-6 lg:px-8" />
          Low Stock Items
        </h3>
        <Badge className="bg-yellow-100 text-yellow-700 px-4 sm:px-6 lg:px-8">
          {items.length} items
        </Badge>
      </div>

      {/* ─── Low Stock Items List ─── */}
      <div className="space-y-2 px-4 sm:px-6 lg:px-8">
        {/* Display first 5 items */}
        {items.slice(0, 5).map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col md:flex-row items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100 px-4 sm:px-6 lg:px-8"
          >
            {/* Item details */}
            <div>
              <p className="text-sm md:text-base md:text-base font-medium text-gray-900 px-4 sm:px-6 lg:px-8">{item.item_name}</p>
              <p className="text-xs text-gray-500 px-4 sm:px-6 lg:px-8">{item.category}</p>
            </div>
            {/* Quantity badge */}
            <Badge className="bg-red-100 text-red-700 px-4 sm:px-6 lg:px-8">
              {item.total_quantity} units
            </Badge>
          </div>
        ))}
        
        {/* Show "more" indicator if there are additional items */}
        {items.length > 5 && (
          <p className="text-xs text-gray-400 text-center px-4 sm:px-6 lg:px-8">
            + {items.length - 5} more items
          </p>
        )}
      </div>
    </Card>
  );
};

export default LowStockItems;