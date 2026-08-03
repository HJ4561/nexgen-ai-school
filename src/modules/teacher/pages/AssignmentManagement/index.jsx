/**
 * ============================================
 * ASSIGNMENT MANAGEMENT COMPONENT
 * ============================================
 * 
 * Purpose: Teacher assignment management with CRUD operations
 * Used by: Teacher module routes
 * 
 * Features:
 * - Create, edit, and delete assignments
 * - View assignments in a responsive grid
 * - Filter by status, class, and subject
 * - Assignment statistics overview
 * - Grade student submissions
 * - Toast notifications for user feedback
 * - Role-based theming (teacher primary color)
 * - Responsive design with animations
 * 
 * Dependencies:
 * - lucide-react for icons
 * - @/components/layout/PageHeader for page header
 * - @/components/ui/Button for action buttons
 * - @/components/ui/LoadingSpinner for loading state
 * - @/components/teacher/AssignmentStats for statistics
 * - @/components/teacher/AssignmentFilters for filtering
 * - @/components/teacher/AssignmentGrid for assignment display
 * - @/components/teacher/CreateAssignmentDrawer for create/edit
 * - @/components/teacher/GradeSubmissionsDrawer for grading
 * - @/hooks for data and action hooks
 * - @/components/admin/animations for animations
 * 
 * Usage:
 * <Route path="/teacher/assignments" element={<AssignmentManagement />} />
 * ============================================
 */

import { useState } from 'react';
import { CheckCircle, AlertCircle, X, Plus } from 'lucide-react';

import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import AssignmentStats from "@/components/teacher/AssignmentStats";
import AssignmentFilters from "@/components/teacher/AssignmentFilters";
import AssignmentGrid from "@/components/teacher/AssignmentGrid";
import CreateAssignmentDrawer from "@/components/teacher/CreateAssignmentDrawer";
import GradeSubmissionsDrawer from "@/components/teacher/GradeSubmissionsDrawer";

import { useAssignmentData } from "@/hooks";
import { useAssignmentActions } from "@/hooks";
import { FadeIn } from "@/components/admin/animations";

/**
 * ============================================
 * ASSIGNMENT MANAGEMENT COMPONENT
 * ============================================
 * 
 * Renders the teacher assignment management page
 * 
 * @returns {JSX.Element} Assignment management page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/assignments" element={<AssignmentManagement />} />
 * ============================================
 */
export default function AssignmentManagement() {
  // ─── Toast Notification State ──────────────────────────────────────────

  /**
   * ============================================
   * TOAST STATE
   * ============================================
   * 
   * Manages toast notifications for user feedback
   * - message: Display message
   * - type: 'success' or 'error'
   * - visible: Controls visibility
   */
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ message: '', type: '', visible: false }), 4000);
  };

  // ─── Data Hooks ─────────────────────────────────────────────────────────

  /**
   * ============================================
   * USE ASSIGNMENT DATA
   * ============================================
   * 
   * Provides assignment data, filters, and utility functions
   * - getClassName: Resolves class name from class ID
   * - getSubjectName: Resolves subject name from subject ID
   * - assignments: List of assignments
   * - submissions: List of submissions
   * - filters: Search, status, class, subject
   * - stats: Assignment statistics
   * - getSubmissionsForAssignment: Gets submissions for a specific assignment
   * - getSubjectsForClass: Gets subjects for a specific class
   */
  const {
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
    getSubjectsForClass,
  } = useAssignmentData();

  // ─── Action Hooks ──────────────────────────────────────────────────────

  /**
   * ============================================
   * USE ASSIGNMENT ACTIONS
   * ============================================
   * 
   * Provides assignment CRUD operations
   * - Create assignment drawer control
   * - Edit mode and form data management
   * - Save, delete, and grade operations
   * - Grade submissions drawer control
   */
  const {
    isCreateDrawerOpen,
    setIsCreateDrawerOpen,
    editMode,
    formData,
    setFormData,
    handleCreateOpen,
    handleEditOpen,
    handleSaveAssignment,
    handleDelete,
    isGradeDrawerOpen,
    setIsGradeDrawerOpen,
    selectedAssignment,
    setSelectedAssignment,
    editingSubmission,
    setEditingSubmission,
    openGradeDrawer,
    handleGradeSubmit,
  } = useAssignmentActions({ refetch, showToast });

  // ─── Loading & Error States ───────────────────────────────────────────

  if (loading && assignments.length === 0) return <LoadingSpinner size="lg" />;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[var(--color-surface-dim)] min-h-screen">
      {/* ─── Toast Notification ──────────────────────────────────────────── */}
      {toast.visible && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex items-start gap-3">
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="text-[var(--color-success)]" />
          ) : (
            <AlertCircle size={20} className="text-[var(--color-danger)]" />
          )}
          <p className="text-sm text-[var(--color-text-primary)]">{toast.message}</p>
          <button
            onClick={() => setToast({ ...toast, visible: false })}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Assignment Management"
          subtitle="Create, manage, and grade student assignments."
          breadcrumbs={['Teacher', 'Assignments']}
          tone="teacher"
          titleClassName="text-[var(--color-teacher-primary)]"
          action={
            <Button
              variant="primary"
              tone="teacher"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={handleCreateOpen}
            >
              Create New Assignment
            </Button>
          }
        />
      </FadeIn>

      {/* ─── Assignment Statistics ──────────────────────────────────────── */}
      <FadeIn y={15} delay={0.1}>
        <AssignmentStats stats={stats} />
      </FadeIn>

      {/* ─── Assignment Filters ─────────────────────────────────────────── */}
      <FadeIn y={10} delay={0.2}>
        <AssignmentFilters
          search={search}
          setSearch={setSearch}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterClass={filterClass}
          setFilterClass={setFilterClass}
          filterSubject={filterSubject}
          setFilterSubject={setFilterSubject}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
        />
      </FadeIn>

      {/* ─── Assignment Grid ────────────────────────────────────────────── */}
      <FadeIn y={15} delay={0.3}>
        <AssignmentGrid
          assignments={filtered}
          onEdit={handleEditOpen}
          onDelete={handleDelete}
          onGrade={openGradeDrawer}
          submissions={submissions}
          getSubmissionsForAssignment={getSubmissionsForAssignment}
          getClassName={getClassName}
          getSubjectName={getSubjectName}
        />
      </FadeIn>

      {/* ─── Create/Edit Assignment Drawer ──────────────────────────────── */}
      <CreateAssignmentDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        mode={editMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveAssignment}
        loading={loading}
        classOptions={classOptions}
        getSubjectsForClass={getSubjectsForClass}
      />

      {/* ─── Grade Submissions Drawer ───────────────────────────────────── */}
      <GradeSubmissionsDrawer
        isOpen={isGradeDrawerOpen}
        onClose={() => {
          setIsGradeDrawerOpen(false);
          setSelectedAssignment(null);
          setEditingSubmission(null);
        }}
        assignment={selectedAssignment}
        submissions={selectedAssignment ? getSubmissionsForAssignment(selectedAssignment.id) : []}
        editingSubmission={editingSubmission}
        setEditingSubmission={setEditingSubmission}
        onGrade={handleGradeSubmit}
        loading={loading}
      />
    </div>
  );
}