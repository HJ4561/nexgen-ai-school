// src/modules/teacher/pages/GradeManagement/hooks/useGradeData.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTeacherGrades,
  fetchStudents,
  fetchTeacherClasses,
  fetchSubjects,
} from "@/modules/teacher/store/teacherThunks";
import {
  selectTeacherGrades,
  selectTeacherStudents,
  selectTeacherClasses,
  selectTeacherSubjects,
  selectTeacherLoading,
  selectTeacherError,
} from "@/modules/teacher/store/teacherSlice";
import { getClassName, getSubjectName, getClassIdFromSubject } from "@/utils/SubjectMapping";

export function useGradeData() {
  const dispatch = useDispatch();
  
  // Use selectors to get data from Redux store
  const grades = useSelector(selectTeacherGrades) || [];
  const students = useSelector(selectTeacherStudents) || [];
  const classes = useSelector(selectTeacherClasses) || [];
  const subjects = useSelector(selectTeacherSubjects) || [];
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);

  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');

  // ─── Fetch on mount ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTeacherGrades());
    if (!students?.length) {
      dispatch(fetchStudents());
    }
    if (!classes?.length) {
      dispatch(fetchTeacherClasses());
    }
    if (!subjects?.length) {
      dispatch(fetchSubjects());
    }
  }, [dispatch]);

  // ─── Enrich grades with student_name ──────────────────────────────
  const enrichedGrades = useMemo(() => {
    if (!grades || !Array.isArray(grades)) return [];
    
    return grades.map((g) => {
      const student = students?.find(s => s.id === g.student || s.id === g.student_id);
      const subject = subjects?.find(s => s.id === g.subject);
      
      return {
        ...g,
        student_name: student?.name || student?.full_name || `Student ${g.student || g.student_id}`,
        subject_name: subject?.name || getSubjectName(g.subject) || `Subject ${g.subject}`,
        class_name: getClassName(getClassIdFromSubject(g.subject)),
      };
    });
  }, [grades, students, subjects]);

  // ─── Options and filters use enrichedGrades ──────────────────────
  const classOptions = useMemo(() => {
    const classSet = new Set();
    enrichedGrades.forEach(g => {
      const classId = getClassIdFromSubject(g.subject);
      if (classId) classSet.add(classId);
    });
    return [
      { value: '', label: 'All Classes' },
      ...Array.from(classSet).map(id => ({ value: String(id), label: getClassName(id) })),
    ];
  }, [enrichedGrades]);

  const subjectOptions = useMemo(() => {
    const unique = [...new Set(enrichedGrades.map(g => g.subject).filter(Boolean))];
    return [
      { value: '', label: 'All Subjects' },
      ...unique.map(id => ({ 
        value: String(id), 
        label: getSubjectName(id) || `Subject ${id}` 
      })),
    ];
  }, [enrichedGrades]);

  const examTypeOptions = useMemo(() => {
    const unique = [...new Set(enrichedGrades.map(g => g.exam_type).filter(Boolean))];
    return [
      { value: '', label: 'All Exams' },
      ...unique.map(type => ({ value: type, label: type })),
    ];
  }, [enrichedGrades]);

  const filtered = useMemo(() => {
    let list = enrichedGrades;
    if (filterClass) {
      const classId = parseInt(filterClass);
      list = list.filter(g => getClassIdFromSubject(g.subject) === classId);
    }
    if (filterSubject) {
      list = list.filter(g => g.subject === parseInt(filterSubject));
    }
    if (filterExamType) {
      list = list.filter(g => g.exam_type === filterExamType);
    }
    return list;
  }, [enrichedGrades, filterClass, filterSubject, filterExamType]);

  // ─── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const marks = filtered.map(g => parseFloat(g.marks_obtained || g.obtained_marks || 0));
    const avg = marks.length ? (marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
    const highest = marks.length ? Math.max(...marks) : 0;
    const lowest = marks.length ? Math.min(...marks) : 0;
    const totalStudents = new Set(filtered.map(g => g.student || g.student_id)).size;
    
    return {
      avg: parseFloat(avg.toFixed(1)),
      highest,
      lowest,
      totalStudents,
      totalGrades: filtered.length,
    };
  }, [filtered]);

  const refetch = useCallback(() => {
    dispatch(fetchTeacherGrades());
    dispatch(fetchStudents());
    dispatch(fetchTeacherClasses());
    dispatch(fetchSubjects());
  }, [dispatch]);

  return {
    grades: enrichedGrades,
    filtered,
    loading,
    error,
    filterClass,
    setFilterClass,
    filterSubject,
    setFilterSubject,
    filterExamType,
    setFilterExamType,
    classOptions,
    subjectOptions,
    examTypeOptions,
    stats,
    refetch,
  };
}

export default useGradeData;