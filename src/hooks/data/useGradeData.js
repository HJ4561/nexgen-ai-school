// // src/modules/teacher/pages/GradeManagement/hooks/useGradeData.js

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchGrades } from @/store/teacher/teacherThunks';
// import {
//   getClassName,
//   getSubjectName,
//   getClassIdFromSubject,
// } from "@/utils/classSubjectMapping';

// const DEFAULT_TOTAL_MARKS = {
//   Quiz: 10,
//   Assignment: 10,
//   'Mid-Term': 50,
//   Final: 50,
// };

// export function useGradeData() {
//   const dispatch = useDispatch();
//   const { grades = [], gradesLoading: loading, gradesError: error } = useSelector(state => state.teacher || {});

//   // ─── Only one filter: subject (combined with class) ──────────────
//   const [filterSubject, setFilterSubject] = useState('');
//   const [filterExamType, setFilterExamType] = useState('');

//   // ─── Fetch on mount ──────────────────────────────────────────────
//   useEffect(() => {
//     dispatch(fetchGrades());
//   }, [dispatch]);

//   // ─── Combined Subject + Class options ──────────────────────────
//   const subjectOptions = useMemo(() => {
//     // Get unique subject IDs from grades
//     const uniqueSubjects = [...new Set(grades.map(g => g.subject).filter(Boolean))];
    
//     // Build options with combined label
//     return [
//       { value: '', label: 'All Subjects & Classes' },
//       ...uniqueSubjects.map(id => {
//         const subjectName = getSubjectName(id);
//         const classId = getClassIdFromSubject(id);
//         const className = classId ? getClassName(classId) : 'Unknown Class';
//         return {
//           value: id,
//           label: `${subjectName} – ${className}`,
//         };
//       }),
//     ];
//   }, [grades]);

//   // ─── Exam type options ──────────────────────────────────────────
//   const examTypeOptions = useMemo(() => {
//     const unique = [...new Set(grades.map(g => g.exam_type).filter(Boolean))];
//     return [
//       { value: '', label: 'All Exams' },
//       ...unique.map(type => ({ value: type, label: type })),
//     ];
//   }, [grades]);

//   // ─── Filtered grades ─────────────────────────────────────────────
//   const filtered = useMemo(() => {
//     let list = grades;
//     if (filterSubject) {
//       list = list.filter(g => g.subject === parseInt(filterSubject));
//     }
//     if (filterExamType) {
//       list = list.filter(g => g.exam_type === filterExamType);
//     }
//     return list;
//   }, [grades, filterSubject, filterExamType]);

//   // ─── Stats ────────────────────────────────────────────────────────
//   const stats = useMemo(() => {
//     const marks = filtered.map(g => parseFloat(g.obtained_marks) || 0);
//     const avg = marks.length ? (marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
//     const highest = marks.length ? Math.max(...marks) : 0;
//     const lowest = marks.length ? Math.min(...marks) : 0;
//     return {
//       avg: parseFloat(avg.toFixed(1)),
//       highest,
//       lowest,
//     };
//   }, [filtered]);

//   const refetch = useCallback(() => {
//     dispatch(fetchGrades());
//   }, [dispatch]);

//   return {
//     grades,
//     filtered,
//     loading,
//     error,
//     filterSubject,
//     setFilterSubject,
//     filterExamType,
//     setFilterExamType,
//     subjectOptions,      
//     examTypeOptions,
//     stats,
//     refetch,
//   };
// }
// src/modules/teacher/pages/GradeManagement/hooks/useGradeData.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGrades } from "@/modules/teacher/store/teacherThunks";
import { getClassName, getSubjectName, getClassIdFromSubject } from "@/utils/SubjectMapping";

export function useGradeData() {
  const dispatch = useDispatch();
  const { grades = [], gradesLoading: loading, gradesError: error } = useSelector(state => state.teacher || {});
  const { students = [] } = useSelector(state => state.admin || {}); // ← get students

  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');

  useEffect(() => {
    dispatch(fetchGrades());
  }, [dispatch]);

  // ─── Enrich grades with student_name ──────────────────────────────
  const enrichedGrades = useMemo(() => {
    return grades.map((g) => {
      const student = students.find(s => s.id === g.student);
      return {
        ...g,
        student_name: student?.full_name || `Student ${g.student}`,
      };
    });
  }, [grades, students]);

  // ─── Options and filters use enrichedGrades ──────────────────────
  const classOptions = useMemo(() => {
    const classSet = new Set();
    enrichedGrades.forEach(g => {
      const classId = getClassIdFromSubject(g.subject);
      if (classId) classSet.add(classId);
    });
    return [
      { value: '', label: 'All Classes' },
      ...Array.from(classSet).map(id => ({ value: id, label: getClassName(id) })),
    ];
  }, [enrichedGrades]);

  const subjectOptions = useMemo(() => {
    const unique = [...new Set(enrichedGrades.map(g => g.subject).filter(Boolean))];
    return [
      { value: '', label: 'All Subjects' },
      ...unique.map(id => ({ value: id, label: getSubjectName(id) })),
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
    const marks = filtered.map(g => parseFloat(g.obtained_marks) || 0);
    const avg = marks.length ? (marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
    const highest = marks.length ? Math.max(...marks) : 0;
    const lowest = marks.length ? Math.min(...marks) : 0;
    return {
      avg: parseFloat(avg.toFixed(1)),
      highest,
      lowest,
    };
  }, [filtered]);

  const refetch = useCallback(() => {
    dispatch(fetchGrades());
  }, [dispatch]);

  return {
    grades: enrichedGrades,   // ← use enrichedGrades
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
