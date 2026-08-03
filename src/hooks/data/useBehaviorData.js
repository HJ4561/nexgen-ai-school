// src/hooks/data/useBehaviorData.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBehaviorLogs, fetchBehaviorStats } from "@/modules/admin/store/adminThunks";

export const useBehaviorData = (filters = {}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data, stats, pagination } = useSelector((state) => ({
    data: state.admin?.behaviorLogs?.data || [],
    stats: state.admin?.behaviorLogs?.stats || null,
    pagination: state.admin?.behaviorLogs?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
    },
  }));

  const fetchData = useCallback(
    async (filterParams) => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          dispatch(fetchBehaviorLogs(filterParams)).unwrap(),
          dispatch(fetchBehaviorStats()).unwrap(),
        ]);
      } catch (err) {
        setError(err.message || "Failed to fetch behavior data");
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  return {
    data,
    stats,
    pagination,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useBehaviorData;