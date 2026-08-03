import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssignments, fetchSubmissions } from "@/modules/teacher/store/teacherThunks";
import { getAssignmentStatus } from "@/utils/helpers";
import { getClassName, getSubjectName } from "@/utils/SubjectMapping";
export function useAssignmentData() {
  const dispatch = useDispatch();
  const { assignments = [], submissions = [], loading, error } = useSelector(state => state.teacher || {});

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  // ─── Fetch on mount ──────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  // ─── Class & subject options from assignments ──────────
  const classOptions = useMemo(() => {
    const unique = [...new Set(assignments.map(a => a.class_section))];
    return [
      { value: 'all', label: 'All Classes' },
      ...unique.map(c => ({
        value: String(c),
        label: getClassName(c),
      })),
    ];
  }, [assignments]);

  const subjectOptions = useMemo(() => {
    const unique = [...new Set(assignments.map(a => a.subject))];
    return [
      { value: 'all', label: 'All Subjects' },
      ...unique.map(s => ({
        value: String(s),
        label: getSubjectName(s),
      })),
    ];
  }, [assignments]);

  // ─── Filtered assignments ──────────────────────────────
  const filtered = useMemo(() => {
    let list = assignments;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      list = list.filter(a => getAssignmentStatus(a.due_date) === filterStatus);
    }
    if (filterClass !== 'all') {
      list = list.filter(a => a.class_section === parseInt(filterClass));
    }
    if (filterSubject !== 'all') {
      list = list.filter(a => a.subject === parseInt(filterSubject));
    }
    return list;
  }, [assignments, search, filterStatus, filterClass, filterSubject]);

  // ─── Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter(a => getAssignmentStatus(a.due_date) === 'Active').length;
    const completed = assignments.filter(a => getAssignmentStatus(a.due_date) === 'Completed').length;
    const totalSubmissions = submissions.length;
    return { total, active, completed, totalSubmissions };
  }, [assignments, submissions]);

  // ─── Helper to get submissions for an assignment ──────
  const getSubmissionsForAssignment = useCallback((assignmentId) => {
    return submissions.filter(s => s.assignment === assignmentId);
  }, [submissions]);

  const refetch = useCallback(() => {
    dispatch(fetchAssignments());
    dispatch(fetchSubmissions());
  }, [dispatch]);

  return {
    getClassName, 
    getSubjectName,
    assignments,
    submissions,
    loading,
    error,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    filterClass,
    setFilterClass,
    filterSubject,
    setFilterSubject,
    filtered,
    classOptions,
    subjectOptions,
    stats,
    getSubmissionsForAssignment,
    refetch,
  };
}




export default useAssignmentData;
