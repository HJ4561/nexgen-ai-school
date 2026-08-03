/**
 * ============================================
 * GRADE MANAGEMENT COMPONENT
 * ============================================
 * 
 * Purpose: Teacher grade management with view/edit and bulk entry modes
 * Used by: Teacher module routes
 * 
 * Features:
 * - Two tabs: View & Edit, Bulk Entry
 * - Grade filtering by subject, exam type, and date
 * - Grade statistics overview
 * - Individual grade editing with draft save
 * - Bulk grade entry for multiple students
 * - Export CSV functionality
 * - Save Draft and Finalize & Publish actions
 * - Toast notifications for user feedback
 * - Sticky footer with action buttons
 * - Role-based theming (teacher primary color)
 * 
 * Dependencies:
 * - lucide-react for icons
 * - @/components/layout/PageHeader for page header
 * - @/components/ui/Button for action buttons
 * - @/components/ui/LoadingSpinner for loading state
 * - @/components/teacher/GradeStats for statistics
 * - @/components/teacher/GradeFilters for filtering
 * - @/components/teacher/GradeTable for grade display
 * - @/components/teacher/BulkGradeEntry for bulk entry
 * - @/hooks for data and action hooks
 * - @/components/admin/animations for animations
 * 
 * Usage:
 * <Route path="/teacher/marks-entry" element={<GradeManagement />} />
 * ============================================
 */

import { useState } from 'react';
import { CheckCircle, AlertCircle, X, Download, Send, Save } from 'lucide-react';

import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import GradeStats from "@/components/teacher/GradeStats";
import GradeFilters from "@/components/teacher/GradeFilters";
import GradeTable from "@/components/teacher/GradeTable";
import BulkGradeEntry from "@/components/teacher/BulkGradeEntry";
import { fetchTeacherClasses } from "@/modules/teacher/store/teacherThunks";
import { useGradeData } from "@/hooks";
import { useGradeActions } from "@/hooks";
import { useBulkGradeData } from "@/hooks";
import { useBulkGradeActions } from "@/hooks";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations";

/**
 * ============================================
 * TABS CONFIGURATION
 * ============================================
 * 
 * Available tabs for grade management
 * - view: Individual grade viewing and editing
 * - bulk: Bulk grade entry for multiple students
 */
const TABS = [
  { id: 'view', label: 'View & Edit' },
  { id: 'bulk', label: 'Bulk Entry' },
];

/**
 * ============================================
 * GRADE MANAGEMENT COMPONENT
 * ============================================
 * 
 * Renders the teacher grade management page
 * 
 * @returns {JSX.Element} Grade management page
 * 
 * @example
 * // In teacher routes
 * <Route path="/teacher/marks-entry" element={<GradeManagement />} />
 * ============================================
 */
export default function GradeManagement() {
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

  /**
   * ============================================
   * ACTIVE TAB STATE
   * ============================================
   * 
   * Controls which tab is currently active
   * - 'view': View & Edit tab
   * - 'bulk': Bulk Entry tab
   */
  const [activeTab, setActiveTab] = useState('view');

  // ─── View/Edit Tab Hooks ──────────────────────────────────────────────

  /**
   * ============================================
   * VIEW/EDIT HOOKS
   * ============================================
   * 
   * useGradeData: Provides grade data, filters, and stats
   * useGradeActions: Provides grade editing actions
   */
  const gradeData = useGradeData();
  const gradeActions = useGradeActions({ refetch: gradeData.refetch, showToast });

  // ─── Bulk Entry Tab Hooks ─────────────────────────────────────────────

  /**
   * ============================================
   * BULK ENTRY HOOKS
   * ============================================
   * 
   * useBulkGradeData: Provides bulk grade data and state
   * useBulkGradeActions: Provides bulk grade saving actions
   */
  const bulkData = useBulkGradeData();
  const bulkActions = useBulkGradeActions({ refetch: gradeData.refetch, showToast });

  // ─── Loading & Error States ───────────────────────────────────────────

  const { loading, error } = gradeData;

  if (loading && gradeData.grades.length === 0) return <LoadingSpinner size="lg" />;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-4 md:p-6 pb-28 bg-[var(--color-surface-dim)] min-h-screen">
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
          title="Grade Management"
          subtitle="Record academic marks and publish results for your assigned classes."
          breadcrumbs={['Teacher', 'Grades']}
          tone="teacher"
          titleClassName="text-[var(--color-teacher-primary)]"
          action={
            <div className="flex gap-3">
              <Button
                variant="outline"
                tone="teacher"
                size="sm"
                leftIcon={<Download size={16} />}
                onClick={() => gradeActions.exportCSV(gradeData.filtered)}
              >
                Export CSV
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* ─── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide py-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
              border ${
                activeTab === tab.id
                  ? 'border-[var(--color-teacher-primary)] bg-[var(--color-teacher-primary)] text-white shadow-md shadow-[var(--color-teacher-primary)]/30'
                  : 'border-gray-300 bg-white text-[var(--color-text-secondary)] hover:bg-gray-50 hover:border-gray-400'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── View & Edit Tab Content ────────────────────────────────────── */}
      {activeTab === 'view' && (
        <>
          {/* Filters and Stats */}
          <FadeIn y={10} delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <GradeFilters
                filterSubject={gradeData.filterSubject}
                setFilterSubject={gradeData.setFilterSubject}
                filterExamType={gradeData.filterExamType}
                setFilterExamType={gradeData.setFilterExamType}
                classOptions={gradeData.classOptions}
                subjectOptions={gradeData.subjectOptions}
                examTypeOptions={gradeData.examTypeOptions}
                filterExamDate={gradeData.filterExamDate}
                setFilterExamDate={gradeData.setFilterExamDate}
              />
              <GradeStats stats={gradeData.stats} />
            </div>
          </FadeIn>

          {/* Grade Table */}
          <GradeTable
            grades={gradeData.filtered}
            draftGrades={gradeActions.draftGrades}
            onMarkChange={gradeActions.handleMarkChange}
          />

          {/* ─── Sticky Footer Actions ──────────────────────────────────── */}
          <div className="fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-end gap-4 md:ml-[280px] bg-white/80 backdrop-blur-sm border-t border-gray-200">
            {gradeActions.saveMessage && (
              <span className="text-sm text-[var(--color-teacher-primary)] font-medium">
                {gradeActions.saveMessage}
              </span>
            )}
            <Button
              variant="outline"
              tone="teacher"
              leftIcon={<Save size={16} />}
              onClick={gradeActions.handleSaveDraft}
              disabled={gradeActions.isSaving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              tone="teacher"
              leftIcon={<Send size={16} />}
              onClick={() => gradeActions.handleFinalize(gradeData.grades)}
              disabled={gradeActions.isSaving}
            >
              {gradeActions.isSaving ? 'Publishing...' : 'Finalize & Publish'}
            </Button>
          </div>
        </>
      )}

      {/* ─── Bulk Entry Tab Content ────────────────────────────────────── */}
      {activeTab === 'bulk' && (
        <BulkGradeEntry
          classOptions={bulkData.classOptions}
          subjectOptions={bulkData.subjectOptions}
          examTypeOptions={bulkData.examTypeOptions}
          selectedClass={bulkData.selectedClass}
          setSelectedClass={bulkData.setSelectedClass}
          selectedSubject={bulkData.selectedSubject}
          setSelectedSubject={bulkData.setSelectedSubject}
          selectedExamType={bulkData.selectedExamType}
          setSelectedExamType={bulkData.setSelectedExamType}
          examDate={bulkData.examDate}
          setExamDate={bulkData.setExamDate}
          studentGradeData={bulkData.studentGradeData}
          updateStudentMark={bulkData.updateStudentMark}
          isSaving={bulkActions.isSaving}
          hasSubjects={bulkData.hasSubjects}
          onSave={() => bulkActions.saveGrades(
            bulkData.studentGradeData,
            bulkData.selectedSubject,
            bulkData.selectedExamType,
            bulkData.examDate
          )}
        />
      )}
    </div>
  );
}