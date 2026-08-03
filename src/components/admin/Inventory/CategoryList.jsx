import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const CategoryList = ({ categories = [], totalCategories = 0, onCategoryClick }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
            {totalCategories}
          </Badge>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Layers className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p>No categories found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat.name || cat}
              onClick={() => onCategoryClick && onCategoryClick(cat.name || cat)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-medium text-gray-700">{cat.name || cat}</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                  {cat.count || 0}
                </Badge>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CategoryList;