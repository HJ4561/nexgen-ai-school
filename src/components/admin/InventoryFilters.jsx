/**
 * ============================================
 * INVENTORY FILTERS COMPONENT
 * ============================================
 * 
 * Purpose: Filtering controls for Inventory Management
 * Provides:
 * - Search input for inventory items
 * - Category filter dropdown
 * - Responsive layout with flexible wrapping
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Search)
 * - @/components/ui/Input for search field
 * - @/components/ui/Select for category dropdown
 * 
 * Usage:
 * <InventoryFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterCategory={filterCategory}
 *   setFilterCategory={setFilterCategory}
 *   categoryOptions={categoryOptions}
 * />
 * ============================================
 */

import React from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * ============================================
 * INVENTORY FILTERS COMPONENT
 * ============================================
 * 
 * Renders filter controls for inventory management
 * 
 * @param {Object} props - Component props
 * @param {string} props.search - Current search query value
 * @param {Function} props.setSearch - Setter function for search state
 * @param {string} props.filterCategory - Current category filter value
 * @param {Function} props.setFilterCategory - Setter function for category filter
 * @param {Array} props.categoryOptions - Array of category options for dropdown
 * @returns {JSX.Element} Inventory filters UI
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const [filterCategory, setFilterCategory] = useState('all');
 * const categories = ['Electronics', 'Furniture', 'Supplies'];
 * 
 * <InventoryFilters
 *   search={search}
 *   setSearch={setSearch}
 *   filterCategory={filterCategory}
 *   setFilterCategory={setFilterCategory}
 *   categoryOptions={categories}
 * />
 * ============================================
 */
const InventoryFilters = ({ 
  search, 
  setSearch, 
  filterCategory, 
  setFilterCategory, 
  categoryOptions 
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
      {/* ─── Search Input ─── */}
      <div className="flex-1 min-w-[200px] relative">
        {/* Search icon */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* ─── Category Filter Dropdown ─── */}
      <div className="w-48">
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categoryOptions?.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default InventoryFilters;