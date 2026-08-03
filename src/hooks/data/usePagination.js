import { useState, useMemo } from "react";

export function usePagination(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));
  };

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    resetPage,
    itemsPerPage,
    totalItems: data.length,
  };
}

export default usePagination;
