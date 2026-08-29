import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const LowStockItems = ({ items = [], totalLowStock = 0 }) => {
  return (
    <Card className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <AlertTriangle className="w-5 h-5 text-amber-500 px-4 sm:px-6 lg:px-8" />
          <h3 className="text-lg md:text-xl md:text-2xl font-semibold text-gray-900 px-4 sm:px-6 lg:px-8">Low Stock Items</h3>
          {totalLowStock > 0 && (
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 sm:px-6 lg:px-8">
              {totalLowStock} items
            </Badge>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500 px-4 sm:px-6 lg:px-8">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-2 px-4 sm:px-6 lg:px-8" />
          <p>All items are well-stocked!</p>
          <p className="text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8">No low stock items to display.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto px-4 sm:px-6 lg:px-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100 hover:shadow-sm transition-all px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 lg:px-8">
                  <Package className="w-4 h-4 text-amber-600 px-4 sm:px-6 lg:px-8" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 px-4 sm:px-6 lg:px-8">{item.item_name}</p>
                  <p className="text-xs text-gray-500 px-4 sm:px-6 lg:px-8">{item.category} • {item.assigned_to_room || 'Unassigned'}</p>
                </div>
              </div>
              <div className="text-right px-4 sm:px-6 lg:px-8">
                <p className="font-semibold text-amber-600 px-4 sm:px-6 lg:px-8">{item.total_quantity} units</p>
                <p className="text-xs text-gray-400 px-4 sm:px-6 lg:px-8">Threshold: {item.threshold || 10}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LowStockItems;