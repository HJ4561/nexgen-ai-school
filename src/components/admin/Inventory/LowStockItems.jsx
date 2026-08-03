import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const LowStockItems = ({ items = [], totalLowStock = 0 }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
          {totalLowStock > 0 && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200">
              {totalLowStock} items
            </Badge>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>All items are well-stocked!</p>
          <p className="text-sm">No low stock items to display.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.item_name}</p>
                  <p className="text-xs text-gray-500">{item.category} • {item.assigned_to_room || 'Unassigned'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-amber-600">{item.total_quantity} units</p>
                <p className="text-xs text-gray-400">Threshold: {item.threshold || 10}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LowStockItems;