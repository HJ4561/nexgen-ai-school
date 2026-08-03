import { useState, useEffect, useMemo } from 'react';

export const useBulkGradeData = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studentGradeData, setStudentGradeData] = useState([]);

  const classOptions = ['10-A', '10-B', '9-A', '9-B', '8-A'];
  const subjectOptions = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
  const examTypeOptions = ['Mid-Term', 'Final', 'Quiz', 'Assignment'];

  const hasSubjects = subjectOptions.length > 0;

  useEffect(() => {
    if (selectedClass && selectedSubject && selectedExamType) {
      // Mock student data
      const mockStudents = [
        { id: 1, name: 'John Doe', score: 0 },
        { id: 2, name: 'Jane Smith', score: 0 },
        { id: 3, name: 'Bob Johnson', score: 0 },
        { id: 4, name: 'Alice Brown', score: 0 },
        { id: 5, name: 'Charlie Wilson', score: 0 },
      ];
      setStudentGradeData(mockStudents);
    } else {
      setStudentGradeData([]);
    }
  }, [selectedClass, selectedSubject, selectedExamType]);

  const updateStudentMark = (studentId, score) => {
    setStudentGradeData(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, score }
          : student
      )
    );
  };

  return {
    classOptions,
    subjectOptions,
    examTypeOptions,
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
    selectedExamType,
    setSelectedExamType,
    examDate,
    setExamDate,
    studentGradeData,
    updateStudentMark,
    hasSubjects,
  };
};


export default useBulkGradeData;
