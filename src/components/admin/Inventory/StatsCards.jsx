import React from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Layers } from 'lucide-react';
import Card from '@/components/ui/Card';

const StatsCards = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Items',
      value: stats.total_items || stats.total || 0,
      icon: Package,
      color: 'blue',
    },
    {
      label: 'Categories',
      value: stats.total_categories || stats.categories?.length || 0,
      icon: Layers,
      color: 'purple',
    },
    {
      label: 'Low Stock Items',
      value: stats.low_stock_items || stats.lowStock || 0,
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      label: 'Total Quantity',
      value: stats.total_quantity || 0,
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${colorMap[item.color]} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;