// src/modules/admin/pages/ComplaintManagement/hooks/useComplaintData.js

import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePagination } from "@/hooks/data";
import { fetchComplaints } from "@/modules/admin/store/adminComplaintThunks";

const ITEMS_PER_PAGE = 10;

export function useComplaintData() {
  const dispatch = useDispatch();
  const { complaints = [], loading = false, error = null } = useSelector(
    (state) => state.adminComplaint
  );

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // ─── Fetch Data ──────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  // ─── Filtered Data ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = complaints;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.id?.toString().includes(q) ||
          c.reporter_name?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") {
      list = list.filter((c) => c.status === filterStatus);
    }
    if (filterType !== "all") {
      list = list.filter((c) => c.complaint_type === filterType);
    }
    return list;
  }, [complaints, search, filterStatus, filterType]);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "Open").length;
    const inProgress = complaints.filter((c) => c.status === "In Progress").length;
    const resolved = complaints.filter((c) => c.status === "Resolved").length;
    return { total, open, inProgress, resolved };
  }, [complaints]);

  // ─── Latest Complaints ───────────────────────────────────────────────
  const latestComplaints = useMemo(() => {
    return [...complaints]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [complaints]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    resetPage,
    totalItems,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  useEffect(() => {
    resetPage();
  }, [search, filterStatus, filterType]);

  const refetch = useCallback(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  return {
    complaints,
    loading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    resetPage,
    itemsPerPage: ITEMS_PER_PAGE,
    stats,
    latestComplaints,
    refetch,
  };
}




export default useComplaintData;
