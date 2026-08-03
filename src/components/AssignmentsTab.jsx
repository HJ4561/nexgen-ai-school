/**
 * ============================================
 * ASSIGNMENTS TAB COMPONENT
 * ============================================
 * 
 * Purpose: Displays and manages assignments in a tabular format
 * Features:
 * - View assignments with details (title, subject, class, due date)
 * - Submission status tracking (Submitted, Pending, Late, Not Submitted)
 * - Grade display with color coding
 * - Filtering by subject, status, and date range
 * - Export functionality for assignment data
 * - Responsive table design
 * 
 * Dependencies:
 * - lucide-react for icons (FileText, CheckCircle, Clock, AlertCircle, Download)
 * - @/components/ui/Card for container
 * - @/components/ui/Badge for status indicators
 * - @/components/ui/Button for actions
 * - @/components/ui/Select for filters
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <AssignmentsTab
 *   assignments={assignmentData}
 *   role="teacher"
 *   onViewAssignment={handleViewAssignment}
 *   onGradeAssignment={handleGradeAssignment}
 * />
 * ============================================
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Search,
  Filter
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { formatDate, getInitials } from '@/utils/helpers';

/**
 * ============================================
 * ASSIGNMENTS TAB COMPONENT
 * ============================================
 * 
 * Renders a comprehensive assignment management interface
 * 
 * @param {Object} props - Component props
 * @param {Array} props.assignments - Array of assignment objects
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @param {Function} props.onViewAssignment - Callback when viewing an assignment
 * @param {Function} props.onGradeAssignment - Callback when grading an assignment
 * @param {Function} props.onExport - Callback for exporting assignment data
 * @returns {JSX.Element} Assignment management UI
 * 
 * @example
 * const assignments = [
 *   { id: 1, title: 'Math Homework', subject: 'Math', due_date: '2024-01-15', status: 'submitted' },
 * ];
 * 
 * <AssignmentsTab
 *   assignments={assignments}
 *   role="teacher"
 *   onViewAssignment={(id) => console.log('Viewing:', id)}
 *   onGradeAssignment={(id) => console.log('Grading:', id)}
 * />
 * ============================================
 */
const AssignmentsTab = ({
  assignments = [],
  role = 'admin',
  onViewAssignment,
  onGradeAssignment,
  onExport,
}) => {
  // ─── State Management ───
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  /**
   * ============================================
   * STATUS COLOR MAPPING
   * ============================================
   * 
   * Maps assignment status to color schemes and icons
   * 
   * @constant {Object} statusConfig
   */
  const statusConfig = {
    submitted: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Submitted',
    },
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      label: 'Pending',
    },
    late: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertCircle,
      label: 'Late',
    },
    'not-submitted': {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: FileText,
      label: 'Not Submitted',
    },
  };

  /**
   * ============================================
   * SUBJECT OPTIONS
   * ============================================
   * 
   * Extracts unique subjects from assignments for filtering
   * 
   * @constant {Array} subjectOptions
   */
  const subjectOptions = useMemo(() => {
    const subjects = ['all', ...new Set(assignments.map(a => a.subject).filter(Boolean))];
    return subjects.map(s => ({
      value: s,
      label: s === 'all' ? 'All Subjects' : s,
    }));
  }, [assignments]);

  /**
   * ============================================
   * STATUS OPTIONS
   * ============================================
   * 
   * Defines filter options for assignment status
   * 
   * @constant {Array} statusOptions
   */
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'pending', label: 'Pending' },
    { value: 'late', label: 'Late' },
    { value: 'not-submitted', label: 'Not Submitted' },
  ];

  /**
   * ============================================
   * FILTERED ASSIGNMENTS
   * ============================================
   * 
   * Applies search and filter logic to assignments
   * - Search by title or student name
   * - Filter by subject
   * - Filter by status
   */
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(term) ||
        a.student_name?.toLowerCase().includes(term) ||
        a.teacher_name?.toLowerCase().includes(term)
      );
    }

    // Apply subject filter
    if (filterSubject !== 'all') {
      filtered = filtered.filter(a => a.subject === filterSubject);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }

    return filtered;
  }, [assignments, searchTerm, filterSubject, filterStatus]);

  /**
   * ============================================
   * GET STATUS CONFIGURATION
   * ============================================
   * 
   * Returns status configuration for a given status key
   * 
   * @param {string} status - Status key
   * @returns {Object} Status configuration object
   */
  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig['not-submitted'];
  };

  /**
   * ============================================
   * RENDER STATUS BADGE
   * ============================================
   * 
   * Renders a status badge with appropriate color and icon
   * 
   * @param {string} status - Status key
   * @returns {JSX.Element} Status badge component
   */
  const renderStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border text-[10px] font-medium flex items-center gap-1.5`}>
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  /**
   * ============================================
   * RENDER GRADE
   * ============================================
   * 
   * Renders grade with color coding based on value
   * 
   * @param {string|number} grade - Grade value
   * @returns {JSX.Element} Grade display
   */
  const renderGrade = (grade) => {
    if (!grade) return '—';
    
    let colorClass = 'text-gray-600';
    const gradeStr = String(grade);
    
    if (gradeStr.startsWith('A')) colorClass = 'text-green-600 font-bold';
    else if (gradeStr.startsWith('B')) colorClass = 'text-blue-600';
    else if (gradeStr.startsWith('C')) colorClass = 'text-yellow-600';
    else if (gradeStr.startsWith('D') || gradeStr.startsWith('F')) colorClass = 'text-red-600 font-bold';
    
    return <span className={colorClass}>{grade}</span>;
  };

  return (
    <Card tone={role} className="p-0 overflow-hidden">
      {/* ─── Header with Filters ─── */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <FileText size={20} className="text-[var(--color-admin-primary)]" />
            Assignments
            <Badge className="bg-gray-100 text-gray-600 text-xs ml-2">
              {filteredAssignments.length}
            </Badge>
          </h3>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              tone={role}
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={onExport}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search 
                size={15} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" 
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, student, or teacher..."
                className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-admin-primary)] outline-none"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <Select
            value={filterSubject}
            onChange={(val) => setFilterSubject(val)}
            options={subjectOptions}
            tone={role}
            size="sm"
            className="min-w-[150px]"
          />

          {/* Status Filter */}
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val)}
            options={statusOptions}
            tone={role}
            size="sm"
            className="min-w-[150px]"
          />
        </div>
      </div>

      {/* ─── Assignments Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--color-surface-dim)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Assignment
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Class
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Student
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Grade
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAssignments.length === 0 ? (
              // ─── Empty State ───
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No assignments found</p>
                  <p className="text-xs mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              // ─── Assignment Rows ───
              filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-[var(--color-surface-dim)] transition-colors">
                  {/* Assignment Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-[var(--color-text-muted)]" />
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">
                        {assignment.title}
                      </span>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {assignment.subject}
                  </td>

                  {/* Class */}
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {assignment.class_name || assignment.class || '—'}
                  </td>

                  {/* Student */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-student-light)] flex items-center justify-center text-[var(--color-student-primary)] text-[10px] font-bold">
                        {getInitials(assignment.student_name || assignment.student)}
                      </div>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {assignment.student_name || assignment.student}
                      </span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    {formatDate(assignment.due_date)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {renderStatusBadge(assignment.status)}
                  </td>

                  {/* Grade */}
                  <td className="px-4 py-3 text-sm font-medium">
                    {renderGrade(assignment.grade)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewAssignment?.(assignment.id)}
                        className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
                        title="View Details"
                      >
                        <FileText size={14} />
                      </button>
                      {role !== 'student' && (
                        <button
                          onClick={() => onGradeAssignment?.(assignment.id)}
                          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-green-600 hover:bg-green-50 transition-colors"
                          title="Grade Assignment"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Footer with Summary ─── */}
      <div className="px-4 py-3 border-t border-gray-200 bg-[var(--color-surface-dim)]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          <span>
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </span>
          <div className="flex gap-4">
            <span>
              Submitted: {assignments.filter(a => a.status === 'submitted').length}
            </span>
            <span>
              Pending: {assignments.filter(a => a.status === 'pending').length}
            </span>
            <span>
              Late: {assignments.filter(a => a.status === 'late').length}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AssignmentsTab;