// src/components/parent/events/ParticipationList.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Eye, Calendar, MapPin, Trophy, Filter, ChevronDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/admin/Pagination';
import { selectEvents, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const ITEMS_PER_PAGE = 10;

const ParticipationList = () => {
  const dispatch = useDispatch();
  const events = useSelector(selectEvents);
  const selectedChild = useSelector(selectSelectedChild);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Filter by selected child
    if (selectedChild) {
      filtered = filtered.filter(e => e.student === selectedChild || e.student_id === selectedChild);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.event_name?.toLowerCase().includes(search) ||
        e.location?.toLowerCase().includes(search) ||
        e.description?.toLowerCase().includes(search)
      );
    }

    // Filter by type
    if (filterType !== 'All') {
      filtered = filtered.filter(e => e.event_type === filterType);
    }

    return filtered;
  }, [events, selectedChild, searchTerm, filterType]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ──────────────────────────────────────────────────
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('All');
    setCurrentPage(1);
  }, []);

  // ─── Helper Functions ──────────────────────────────────────────
  const getStatusBadge = (event) => {
    if (event.is_upcoming) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (event) => {
    if (event.is_upcoming) {
      return 'Upcoming';
    }
    return 'Completed';
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
                placeholder="Search events by name or location..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-xs md:text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                className="flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-xs md:text-sm min-w-[100px]"
              >
                <option value="All">All Types</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="arts">Arts</option>
                <option value="cultural">Cultural</option>
                <option value="competition">Competition</option>
              </select>
              {(searchTerm || filterType !== 'All') && (
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
                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
              </div>
              <div>
                <p className="text-base md:text-lg text-gray-500 font-medium">No events found</p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  {searchTerm || filterType !== 'All'
                    ? 'Try adjusting your filters'
                    : 'Events will appear here when your child participates'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden">
              {pageItems.map((event) => (
                <div key={event.id} className="p-4 hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <Trophy className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm truncate">{event.event_name || '—'}</p>
                          <p className="text-xs text-gray-500 truncate">{event.event_type || '—'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <Badge className={`${getStatusBadge(event)} text-[10px]`}>
                          {getStatusLabel(event)}
                        </Badge>
                        {event.location && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.event_date)}
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors ml-2">
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
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((event) => (
                    <tr key={event.id} className="hover:bg-purple-50/30 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <Trophy className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[150px]">
                            {event.event_name || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs whitespace-nowrap">
                          {event.event_type || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(event.event_date)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-[120px]">
                        {event.location || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${getStatusBadge(event)} text-xs whitespace-nowrap`}>
                          {getStatusLabel(event)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-all" title="View details">
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

      {filteredEvents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsShown={pageItems.length}
          totalItems={filteredEvents.length}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default ParticipationList;