/**
 * ============================================
 * GRADE TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Display and edit grades in a table format
 * Used by: Teacher - Grade Management page
 * 
 * Features:
 * - Student name, subject, exam type display
 * - Editable obtained marks with validation
 * - Editable total marks
 * - Automatic grade calculation (A+, A, B, C, D, F)
 * - Color-coded grades
 * - Draft changes tracking
 * - Responsive table design
 * 
 * Grade Scale:
 * - A+: 90-100%
 * - A: 80-89%
 * - B: 70-79%
 * - C: 60-69%
 * - D: 50-59%
 * - F: Below 50%
 * 
 * Dependencies:
 * - ResponsiveTable for data display
 * - Badge component for status
 * - Subject mapping for subject names
 * ============================================
 */

import { useMemo, useCallback } from 'react';
import { ResponsiveTable } from "@/components/admin/ResponsiveTable";
import Badge from '@/components/ui/Badge';
import { getSubjectName } from '@/utils/SubjectMapping';

// ─── Default total marks per exam type ──────────────────────────────────
const DEFAULT_TOTAL_MARKS = {
  Quiz: 10,
  Assignment: 10,
  'Mid-Term': 50,
  Final: 50,
};

/**
 * GradeTable Component
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.grades - Array of grade objects
 * @param {Object} props.draftGrades - Draft changes keyed by grade ID
 * @param {Function} props.onMarkChange - Called when a mark is changed
 * @returns {JSX.Element} Rendered grade table
 * 
 * @example
 * <GradeTable
 *   grades={grades}
 *   draftGrades={draftGrades}
 *   onMarkChange={handleMarkChange}
 * />
 */
export default function GradeTable({
  grades,
  draftGrades,
  onMarkChange,
}) {
  // ─── Helper: Get grade letter based on percentage ──────────────────
  const getGrade = (marks) => {
    if (marks >= 90) return { label: 'A+', color: 'teacher' };
    if (marks >= 80) return { label: 'A', color: 'teacher' };
    if (marks >= 70) return { label: 'B', color: 'neutral' };
    if (marks >= 60) return { label: 'C', color: 'neutral' };
    if (marks >= 50) return { label: 'D', color: 'student' };
    return { label: 'F', color: 'danger' };
  };

  // ─── Helper: Get CSS classes for grade badge ──────────────────────
  const getGradeClass = (label) => {
    const map = {
      'A+': 'bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)]',
      'A': 'bg-[var(--color-teacher-light)] text-[var(--color-teacher-primary)]',
      'B': 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
      'C': 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
      'D': 'bg-[var(--color-student-light)] text-[var(--color-student-primary)]',
      'F': 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
    };
    return map[label] || 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]';
  };

  // ─── Get the total marks to display ──────────────────────────────────
  const getTotalMarks = (row) => {
    // If draft has a value, use it
    if (draftGrades[row.id]?.total_marks !== undefined) {
      return draftGrades[row.id].total_marks;
    }
    // If grade has a total_marks, use it
    if (row.total_marks) return row.total_marks;
    // Otherwise, fallback to default based on exam type
    return DEFAULT_TOTAL_MARKS[row.exam_type] || 100;
  };

  // ─── Table Columns ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: 'student_name',
      label: 'Student Name',
      render: (row) => row.student_name,
      mobile: { role: 'title' },
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => getSubjectName(row.subject),
    },
    {
      key: 'exam_type',
      label: 'Exam Type',
      render: (row) => row.exam_type,
    },
    {
      key: 'obtained_marks',
      label: 'Obtained Marks',
      render: (row) => {
        const draft = draftGrades[row.id];
        const value = draft?.obtained_marks !== undefined ? draft.obtained_marks : row.obtained_marks;
        const total = getTotalMarks(row);
        const isLow = parseFloat(value) < (total * 0.5);
        return (
          <input
            type="number"
            min="0"
            max={total}
            step="0.01"
            value={value}
            onChange={(e) => onMarkChange(row.id, 'obtained_marks', e.target.value)}
            className={`w-20 px-2 py-1.5 border rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-[var(--color-teacher-primary)] outline-none transition-all ${
              isLow
                ? 'border-[var(--color-danger)]/30 text-[var(--color-danger)] focus:ring-[var(--color-danger)]/20'
                : 'border-gray-200 text-[var(--color-text-primary)] focus:ring-[var(--color-teacher-primary)]/20'
            }`}
          />
        );
      },
    },
    {
      key: 'total_marks',
      label: 'Total Marks',
      render: (row) => {
        const draft = draftGrades[row.id];
        const value = draft?.total_marks !== undefined ? draft.total_marks : getTotalMarks(row);
        return (
          <input
            type="number"
            min="0"
            max="999"
            step="0.01"
            value={value}
            onChange={(e) => onMarkChange(row.id, 'total_marks', e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold text-center focus:ring-2 focus:ring-[var(--color-teacher-primary)] outline-none transition-all text-[var(--color-text-primary)]"
          />
        );
      },
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (row) => {
        const obtained = draftGrades[row.id]?.obtained_marks ?? row.obtained_marks;
        const total = getTotalMarks(row);
        const percentage = total > 0 ? (obtained / total) * 100 : 0;
        const grade = getGrade(percentage);
        const cls = getGradeClass(grade.label);
        return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{grade.label}</span>;
      },
    },
  ], [draftGrades, onMarkChange]);

  const mobileActions = useCallback((row) => null, []);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
      {/* ─── Header ────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[var(--color-surface-dim)]/30">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[var(--color-teacher-primary)] rounded-full" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Student Grading Roster</h3>
          <Badge tone="teacher" className="text-[10px]">
            {grades.length} Students
          </Badge>
        </div>
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <ResponsiveTable
        columns={columns}
        animateRows={true}
        data={grades}
        keyField="id"
        emptyMessage="No grades found. Adjust filters to view student grades."
        mobileActions={mobileActions}
      />
    </div>
  );
}

















