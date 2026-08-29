import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const CategoryList = ({ categories = [], totalCategories = 0, onCategoryClick }) => {
  return (
    <Card className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <Layers className="w-5 h-5 text-purple-500 px-4 sm:px-6 lg:px-8" />
          <h3 className="text-lg md:text-xl md:text-2xl font-semibold text-gray-900 px-4 sm:px-6 lg:px-8">Categories</h3>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-4 sm:px-6 lg:px-8">
            {totalCategories}
          </Badge>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-6 text-gray-500 px-4 sm:px-6 lg:px-8">
          <Layers className="w-12 h-12 mx-auto text-gray-300 mb-2 px-4 sm:px-6 lg:px-8" />
          <p>No categories found</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto px-4 sm:px-6 lg:px-8">
          {categories.map((cat) => (
            <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" key={cat.name || cat}
              onClick={() => onCategoryClick && onCategoryClick(cat.name || cat)}
              className="w-full flex flex-col md:flex-row items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group px-4 sm:px-6 lg:px-8"
            >
              <span className="text-sm md:text-base md:text-base font-medium text-gray-700 px-4 sm:px-6 lg:px-8">{cat.name || cat}</span>
              <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
                <Badge className="bg-gray-100 text-gray-600 border-gray-200 px-4 sm:px-6 lg:px-8">
                  {cat.count || 0}
                </Badge>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity px-4 sm:px-6 lg:px-8" />
              </div>
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default CategoryList;