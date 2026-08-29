import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/services/api";

const ITEMS_PER_PAGE = 10;

export function useBehaviorData() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Fetch Logs --------------------------------------------------
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/attendance/behavior-logs/");
      const data = response.data?.results || response.data || [];
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch behavior logs:", err);
      setError(err.message || "Failed to load behavior logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- Filtering --------------------------------------------------
  const filteredByDate = useMemo(() => {
    return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [logs]);

  const filtered = useMemo(() => {
    let result = logs;
    
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (log) =>
          log.student_name?.toLowerCase().includes(searchLower) ||
          log.description?.toLowerCase().includes(searchLower) ||
          log.reported_by_name?.toLowerCase().includes(searchLower) ||
          log.teacher_name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filterSeverity !== "all") {
      result = result.filter((log) => log.severity === filterSeverity);
    }
    
    return result;
  }, [logs, search, filterSeverity]);

  // --- Pagination --------------------------------------------------
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // --- Stats ------------------------------------------------------
  const stats = useMemo(() => {
    const total = logs.length;
    const positive = logs.filter((l) => l.type === "positive").length;
    const negative = logs.filter((l) => l.type === "negative").length;
    const neutral = logs.filter((l) => l.type === "neutral").length;
    return { total, positive, negative, neutral };
  }, [logs]);

  // --- Recent Logs ------------------------------------------------
  const recentLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [logs]);

  return {
    logs,
    loading,
    error,
    search,
    setSearch,
    filterSeverity,
    setFilterSeverity,
    filteredByDate,
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    itemsPerPage: ITEMS_PER_PAGE,
    stats,
    recentLogs,
    refetch: fetchLogs,
  };
}
