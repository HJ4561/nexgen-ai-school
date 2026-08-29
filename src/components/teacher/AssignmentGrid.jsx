/**
 * ============================================
 * ASSIGNMENT GRID COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Purpose: Displays assignments in a responsive grid layout
 * Features:
 * - Grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
 * - Empty state with icon and message
 * - Maps assignments to AssignmentCard components
 * - Passes through callbacks for edit, delete, grade
 * - Teacher role theming
 * 
 * Dependencies:
 * - lucide-react for icons (BookOpen)
 * - @/components/teacher/AssignmentCard for individual assignment display
 * 
 * Usage:
 * <AssignmentGrid
 *   assignments={assignmentsList}
 *   getClassName={getClassName}
 *   getSubjectName={getSubjectName}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onGrade={handleGrade}
 *   submissions={submissionsList}
 *   getSubmissionsForAssignment={getSubmissionsForAssignment}
 * />
 * ============================================
 */

import { BookOpen } from 'lucide-react';
import AssignmentCard from './AssignmentCard';

/**
 * ============================================
 * ASSIGNMENT GRID COMPONENT (TEACHER VIEW)
 * ============================================
 * 
 * Renders a responsive grid of assignment cards
 * 
 * @param {Object} props - Component props
 * @param {Array} props.assignments - Array of assignment objects
 * @param {Function} props.getClassName - Function to get class name from class_id
 * @param {Function} props.getSubjectName - Function to get subject name from subject_id
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {Function} props.onGrade - Callback when grade button is clicked
 * @param {Array} props.submissions - Array of submission objects
 * @param {Function} props.getSubmissionsForAssignment - Function to get submissions for a specific assignment
 * @returns {JSX.Element} Assignment grid UI
 * 
 * @example
 * const assignments = [
 *   { id: 1, title: 'Math Homework', class_id: 1, subject_id: 1 }
 * ];
 * 
 * <AssignmentGrid
 *   assignments={assignments}
 *   getClassName={(id) => 'Class 10-A'}
 *   getSubjectName={(id) => 'Mathematics'}
 *   onEdit={(assignment) => openEditDrawer(assignment)}
 *   onDelete={(assignment) => confirmDelete(assignment)}
 *   onGrade={(assignment) => openGradeDrawer(assignment)}
 *   submissions={submissions}
 *   getSubmissionsForAssignment={(id) => submissions.filter(s => s.assignment === id)}
 * />
 * ============================================
 */
export default function AssignmentGrid({
  assignments,
  getClassName,
  getSubjectName,
  onEdit,
  onDelete,
  onGrade,
  submissions,
  getSubmissionsForAssignment,
}) {
  /**
   * ============================================
   * EMPTY STATE
   * ============================================
   * 
   * Displays a friendly empty state when no assignments exist
   * Shows a book icon and prompts to create a new assignment
   */
  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-center mb-4 px-4 sm:px-6 lg:px-8">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-dim)] flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 lg:px-8">
            <BookOpen size={32} className="text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
          </div>
        </div>
        <p className="text-sm md:text-base md:text-base text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8">No assignments found</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 px-4 sm:px-6 lg:px-8">Create a new assignment to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 lg:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      {assignments.map((assignment) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          submissions={getSubmissionsForAssignment(assignment.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onGrade={onGrade}
          getClassName={getClassName}
          getSubjectName={getSubjectName}
        />
      ))}
    </div>
  );
}