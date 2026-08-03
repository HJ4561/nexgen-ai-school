// src/modules/admin/pages/EventManagement/hooks/useEventData.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePagination } from "@/hooks/data";
import {
  fetchEvents,
  fetchParticipants,
  fetchCertificates,
} from "@/modules/admin/store/adminEventThunks";
import { fetchStudents } from "@/modules/admin/store/adminThunks";
import { getStatus } from '@/utils/helpers';

const ITEMS_PER_PAGE = 10;

export function useEventData() {
  const dispatch = useDispatch();
  const adminEventState = useSelector((state) => state.adminEvent) || {};

  const {
    events = [],
    participants = {},   // ← changed to object
    certificates = [],
    loading = false,
    error = null,
  } = adminEventState;

  const { students = [] } = useSelector((state) => state.admin || {});

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(null);

  // ─── Fetch students if not already loaded ──────────────────────────
  useEffect(() => {
    if (students.length === 0) {
      dispatch(fetchStudents());
    }
  }, [students.length, dispatch]);

  // ─── Fetch events & certificates ────────────────────────────────────
  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchCertificates())
  }, [dispatch]);

  // ─── Fetch participants when event selected ────────────────────────
  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchParticipants(selectedEventId));
    }
  }, [selectedEventId, dispatch]);

  // ─── Filtered events ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = events;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => e.event_name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      const statusMap = { scheduled: 'Scheduled', upcoming: 'Upcoming', completed: 'Completed' };
      list = list.filter(e => getStatus(e.event_date).label === statusMap[filterStatus]);
    }
    return list;
  }, [events, search, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    resetPage,
    totalItems,
  } = usePagination(filtered, ITEMS_PER_PAGE);

  useEffect(() => { resetPage(); }, [search, filterStatus]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const participantList = Object.values(participants).flat();
    const totalParticipants = participantList.length;
    const judges = participantList.filter(p => p.role === 'Judge').length;
    const volunteers = participantList.filter(p => p.role === 'Volunteer').length;
    const registered = participantList.filter(p => p.role === 'Participant').length;

    return {
      total: events.length,
      scheduled: events.filter(e => getStatus(e.event_date).label === 'Scheduled').length,
      upcoming: events.filter(e => getStatus(e.event_date).label === 'Upcoming').length,
      completed: events.filter(e => getStatus(e.event_date).label === 'Completed').length,
      participants: totalParticipants,
      judges,
      volunteers,
      registered,
    };
  }, [events, participants]);

  // ─── Get participants for a specific event ─────────────────────────
  const getEventParticipants = useCallback((eventId) => {
    return participants[eventId] || [];
  }, [participants]);

  // ─── Get participant count for an event ────────────────────────────
  const getParticipantCount = useCallback((eventId) => {
    return participants[eventId]?.length || 0;
  }, [participants]);

  const refetch = useCallback(() => {
    dispatch(fetchEvents());
    dispatch(fetchCertificates());
  }, [dispatch]);

  return {
    events,
    participants,
    certificates,
    students,
    loading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    selectedEventId,
    setSelectedEventId,
    filtered,
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    resetPage,
    itemsPerPage: ITEMS_PER_PAGE,
    stats,
    getEventParticipants,
    getParticipantCount,
    refetch,
  };
}






export default useEventData;
