/**
 * ============================================
 * CATEGORY LIST COMPONENT
 * ============================================
 * 
 * Purpose: Displays a list of categories as interactive pill buttons
 * Features:
 * - Shows categories as clickable badges
 * - Displays total count of categories
 * - Handles empty state gracefully
 * - Supports click handlers for category selection
 * 
 * Dependencies:
 * - @/components/ui/Card for container styling
 * - @/components/ui/Badge for count display
 * 
 * Usage:
 * <CategoryList
 *   categories={['Math', 'Science', 'English']}
 *   totalCategories={10}
 *   onCategoryClick={(category) => filterByCategory(category)}
 * />
 * ============================================
 */

import React from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

/**
 * ============================================
 * CATEGORY LIST COMPONENT
 * ============================================
 * 
 * Renders a list of category pills that can be clicked for filtering
 * 
 * @param {Object} props - Component props
 * @param {Array} props.categories - Array of category strings to display
 * @param {number} props.totalCategories - Total number of categories (may differ from displayed count)
 * @param {Function} props.onCategoryClick - Callback function when a category is clicked
 * @returns {JSX.Element} Category list UI
 * 
 * @example
 * const categories = ['Math', 'Science', 'English', 'History'];
 * 
 * <CategoryList
 *   categories={categories}
 *   totalCategories={categories.length}
 *   onCategoryClick={(cat) => console.log('Selected:', cat)}
 * />
 * ============================================
 */
const CategoryList = ({ categories, totalCategories, onCategoryClick }) => {
  /**
   * ============================================
   * EMPTY STATE HANDLING
   * ============================================
   * 
   * Displays a fallback UI when no categories are available
   * Shows a card with a "No categories found" message
   */
  if (!categories || categories.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
        <p className="text-gray-500 text-sm">No categories found</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {/* ─── Header with count badge ─── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Categories</h3>
        <Badge className="bg-gray-100 text-gray-600">
          {categories.length} total
        </Badge>
      </div>

      {/* ─── Category pills ─── */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryClick?.(category)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
          >
            {category}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default CategoryList;