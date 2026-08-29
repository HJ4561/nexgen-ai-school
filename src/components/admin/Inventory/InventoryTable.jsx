/**
 * Inventory Table Component
 * ============================================
 */

import React from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const InventoryTable = ({ items, onEdit, onDelete, onView }) => {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-text-secondary">
        No inventory items found.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-stock': return <Badge color="success">In Stock</Badge>;
      case 'low-stock': return <Badge color="warning">Low Stock</Badge>;
      case 'out-of-stock': return <Badge color="danger">Out of Stock</Badge>;
      default: return <Badge color="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full">
        <thead>
          <tr className="border-b border-student-border bg-student-light/40">
            <th className="p-3 text-left text-xs font-semibold uppercase">Name</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">SKU</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">Category</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">Quantity</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">Price</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">Status</th>
            <th className="p-3 text-left text-xs font-semibold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 hover:bg-student-light/30">
              <td className="p-3 font-medium">{item.name}</td>
              <td className="p-3 text-text-secondary">{item.sku || 'N/A'}</td>
              <td className="p-3 text-text-secondary">{item.category || 'N/A'}</td>
              <td className="p-3 font-medium">{item.quantity}</td>
              <td className="p-3 font-medium">${item.price?.toFixed(2) || '0.00'}</td>
              <td className="p-3">{getStatusBadge(item.status)}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  {onView && (
                    <Button size="sm" variant="outline" onClick={() => onView(item)}>
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button size="sm" tone="student" onClick={() => onEdit(item)}>
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" tone="danger" variant="outline" onClick={() => onDelete(item)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;