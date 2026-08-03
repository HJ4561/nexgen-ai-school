import React from 'react';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import Badge from '@/components/ui/Badge';

const InventoryTable = ({ data, onEdit, onDelete }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-lg font-semibold text-gray-800">No inventory items found</h3>
        <p className="text-gray-500">Add your first inventory item to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Threshold</th>
            <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
            <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((item) => {
            const isLowStock = item.total_quantity <= (item.threshold || 10);
            return (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-xs text-gray-500">#{item.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                    {item.category || 'Uncategorized'}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <span className={isLowStock ? 'text-rose-600 font-semibold' : 'text-gray-900'}>
                    {item.total_quantity || 0} units
                  </span>
                  {isLowStock && (
                    <span className="ml-2 text-xs text-rose-500">⚠️ Low Stock</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-600">{item.threshold || 10} units</td>
                <td className="px-4 py-3.5 text-gray-600">{item.assigned_to_room || '—'}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit && onEdit(item)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(item)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;