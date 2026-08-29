// src/components/parent/behavior/BehaviorLogList.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Eye, Filter, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/admin/Pagination';
import { selectBehaviorLogs, selectBehaviorFilters } from '@/modules/parent/store/parentSlice';
import { setBehaviorFilters, resetBehaviorFilters } from '@/modules/parent/store/parentThunks';

const ITEMS_PER_PAGE = 10;

const BehaviorLogList = ({ role }) => {
  const dispatch = useDispatch();
  const logs = useSelector(selectBehaviorLogs);
  const filters = useSelector(selectBehaviorFilters);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter(log => log.type === filters.type);
    }

    if (filters.severity && filters.severity !== 'All') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.description?.toLowerCase().includes(search) ||
        log.action_taken?.toLowerCase().includes(search) ||
        log.teacher?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [logs, filters]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ──────────────────────────────────────────────────
  const handleSearchChange = useCallback((e) => {
    dispatch(setBehaviorFilters({ search: e.target.value }));
    setCurrentPage(1);
  }, [dispatch]);

  const handleFilterChange = useCallback((key, value) => {
    dispatch(setBehaviorFilters({ [key]: value }));
    setCurrentPage(1);
  }, [dispatch]);

  const clearFilters = useCallback(() => {
    dispatch(resetBehaviorFilters());
    setCurrentPage(1);
  }, [dispatch]);

  // ─── Helper Functions ──────────────────────────────────────────
  const getTypeBadge = (type) => {
    return type === 'positive'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-700 border-red-200';
  };

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* ─── Filters ──────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description or action..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs md:text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.type || 'All'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs md:text-sm min-w-[100px]"
              >
                <option value="All">All Types</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
              </select>
              <select
                value={filters.severity || 'All'}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs md:text-sm min-w-[100px]"
              >
                <option value="All">All Severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {(filters.search || (filters.type && filters.type !== 'All') || (filters.severity && filters.severity !== 'All')) && (
                <button onClick={clearFilters} className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                  <X className="w-3 h-3 md:w-3.5 md:h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── List ────────────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100">
        {pageItems.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="flex flex-col items-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-500 font-medium">No behavior logs found</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  {filters.search || filters.type !== 'All' || filters.severity !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Behavior logs will appear here when recorded'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {pageItems.map((log) => (
                <div key={log.id} className="p-4 hover:bg-blue-50/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <Badge className={`${getTypeBadge(log.type)} text-[10px]`}>
                          {log.type || '—'}
                        </Badge>
                        <Badge className={`${getSeverityBadge(log.severity)} text-[10px]`}>
                          {log.severity || '—'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{log.description || '—'}</p>
                      {log.action_taken && (
                        <p className="text-xs text-gray-500 mt-1">Action: {log.action_taken}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>{formatDate(log.date)}</span>
                        {log.teacher && <span>• {log.teacher}</span>}
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors ml-2">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getTypeBadge(log.type)} text-xs whitespace-nowrap`}>
                          {log.type || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700 truncate max-w-[200px] block">
                          {log.description || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getSeverityBadge(log.severity)} text-xs whitespace-nowrap`}>
                          {log.severity || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{log.teacher || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {filteredLogs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsShown={pageItems.length}
          totalItems={filteredLogs.length}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default BehaviorLogList;