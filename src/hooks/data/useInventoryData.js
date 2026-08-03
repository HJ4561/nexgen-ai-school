import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePagination } from "@/hooks/data";
import { 
  fetchInventory,
  fetchInventorySummary 
} from '@/modules/admin/store/academicsThunks';
import { CATEGORIES, getStatus, LOW_STOCK_THRESHOLD, ITEMS_PER_PAGE } from '@/utils/helpers';

export function useInventoryData() {
  const dispatch = useDispatch();
  const { inventory = [], inventorySummary = {}, loading, error } = useSelector(state => state.academics || {});
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchInventorySummary());
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data = [...inventory];
    
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(item => 
        item.item_name?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
      );
    }
    
    if (filterCategory !== 'all') {
      data = data.filter(item => item.category === filterCategory);
    }
    
    return data;
  }, [inventory, search, filterCategory]);

  const categoryOptions = useMemo(() => {
    const cats = [...new Set(inventory.map(item => item.category))];
    return ['All Categories', ...cats];
  }, [inventory]);

  const pagination = usePagination(filteredData, ITEMS_PER_PAGE);

  // Calculate stats
  const stats = useMemo(() => {
    const total = inventory.length;
    const categories = new Set(inventory.map(item => item.category)).size;
    const lowStock = inventory.filter(i => i.total_quantity < LOW_STOCK_THRESHOLD).length;
    const categoriesList = [...new Set(inventory.map(item => item.category))].map(name => ({
      name,
      count: inventory.filter(i => i.category === name).length
    }));
    
    return {
      total,
      categories,
      lowStock,
      categoriesList
    };
  }, [inventory]);

  return {
    inventory,
    inventoryLoading: loading,
    inventoryUpdating: loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    categoryOptions,
    paginatedData: pagination.paginatedData,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    goToPage: pagination.goToPage,
    itemsPerPage: ITEMS_PER_PAGE,
    stats,
    lowStockItems: inventory.filter(i => i.total_quantity < LOW_STOCK_THRESHOLD),
    refetch: () => {
      dispatch(fetchInventory());
      dispatch(fetchInventorySummary());
    },
    error
  };
}




export default useInventoryData;
