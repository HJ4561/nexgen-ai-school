/**
 * ============================================
 * INVENTORY TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Displays inventory items in a tabular format
 * Features:
 * - Column-based data rendering
 * - Empty state handling
 * - Key extraction for React reconciliation
 * - Customizable columns
 * - Optional mobile actions
 * - Row animation support
 * - Admin-themed styling
 * 
 * Dependencies:
 * - @/components/ui/Table for table structure
 * - @/components/ui/Badge for status indicators
 * 
 * Usage:
 * <InventoryTable
 *   data={inventoryData}
 *   columns={columns}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   animateRows={true}
 *   mobileActions={mobileActions}
 * />
 * ============================================
 */

import React from 'react';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * INVENTORY TABLE COMPONENT
 * ============================================
 * 
 * Renders a table of inventory items
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Array of inventory items to display
 * @param {Array} props.columns - Column configuration for the table
 * @param {Function} props.onEdit - Callback function when edit action is triggered
 * @param {Function} props.onDelete - Callback function when delete action is triggered
 * @param {boolean} props.animateRows - Whether to animate table rows (default: false)
 * @param {Function} props.mobileActions - Mobile-specific action renderer
 * @returns {JSX.Element} Inventory table UI
 * 
 * @example
 * const columns = [
 *   { header: 'Item', accessor: (row) => row.name },
 *   { header: 'Category', accessor: (row) => row.category },
 *   { header: 'Quantity', accessor: (row) => row.quantity }
 * ];
 * 
 * <InventoryTable
 *   data={inventoryItems}
 *   columns={columns}
 *   onEdit={(item) => openEditDrawer(item)}
 *   onDelete={(item) => confirmDelete(item)}
 *   animateRows={true}
 *   mobileActions={(row) => (
 *     <button onClick={() => handleAction(row)}>Action</button>
 *   )}
 * />
 * ============================================
 */
const InventoryTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  animateRows, 
  mobileActions 
}) => {
  /**
   * ============================================
   * EMPTY STATE HANDLING
   * ============================================
   * 
   * Displays a fallback UI when no inventory items are available
   */
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No inventory items found
      </div>
    );
  }

  return (
    <Table
      data={data}
      columns={columns}
      keyExtractor={(row) => row.id}
      emptyMessage="No inventory items found"
    />
  );
};

export default InventoryTable;