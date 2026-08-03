// src/hooks/data/useFeeData.js
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFees, fetchFeeStats } from "@/modules/admin/store/adminThunks";

export const useFeeData = (filters = {}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data, stats } = useSelector((state) => ({
    data: state.admin?.fees?.data || [],
    stats: state.admin?.fees?.stats || null,
  }));

  const fetchData = useCallback(async (filterParams) => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        dispatch(fetchFees(filterParams)).unwrap(),
        dispatch(fetchFeeStats()).unwrap(),
      ]);
    } catch (err) {
      setError(err.message || "Failed to fetch fee data");
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData(filters);
  }, [filters, fetchData]);

  return {
    data,
    stats,
    loading,
    error,
    refetch: fetchData,
  };
};

export default useFeeData;
