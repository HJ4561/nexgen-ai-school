// src/modules/teacher/hooks/useAssignmentActions.js

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  createAssignment,
  updateAssignment,
  deleteAssignment,
  gradeSubmission,  // Changed from updateSubmission to gradeSubmission
} from '@/modules/teacher/store/teacherThunks';

export function useAssignmentActions({ refetch, showToast }) {
  const dispatch = useDispatch();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [formData, setFormData] = useState({});
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOpen = () => {
    setEditMode('add');
    setFormData({
      title: '',
      description: '',
      due_date: '',
      total_marks: 100,
      status: 'active',
    });
    setIsCreateDrawerOpen(true);
  };

  const handleEditOpen = (assignment) => {
    setEditMode('edit');
    setFormData(assignment);
    setIsCreateDrawerOpen(true);
  };

  const handleSaveAssignment = async () => {
    setIsSubmitting(true);
    try {
      if (editMode === 'add') {
        await dispatch(createAssignment(formData)).unwrap();
        showToast('Assignment created successfully', 'success');
      } else {
        await dispatch(updateAssignment({ id: formData.id, data: formData })).unwrap();
        showToast('Assignment updated successfully', 'success');
      }
      await refetch();
      setIsCreateDrawerOpen(false);
    } catch (error) {
      showToast(error.message || 'Failed to save assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    
    try {
      await dispatch(deleteAssignment(id)).unwrap();
      await refetch();
      showToast('Assignment deleted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to delete assignment', 'error');
    }
  };

  const openGradeDrawer = (assignment) => {
    setSelectedAssignment(assignment);
    setIsGradeDrawerOpen(true);
  };

  // Handle grading a submission - uses gradeSubmission from teacherThunks
  const handleGradeSubmit = async (submissionId, marks, feedback) => {
    setIsSubmitting(true);
    try {
      await dispatch(gradeSubmission({ 
        id: submissionId, 
        data: { 
          marks_obtained: marks,
          feedback: feedback,
          status: 'graded'
        } 
      })).unwrap();
      await refetch();
      showToast('Grade submitted successfully', 'success');
      setEditingSubmission(null);
      setIsGradeDrawerOpen(false);
    } catch (error) {
      showToast(error.message || 'Failed to submit grade', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkGrade = async (submissions, grades) => {
    setIsSubmitting(true);
    try {
      const promises = submissions.map((submission, index) => {
        const gradeData = grades[index] || {};
        return dispatch(gradeSubmission({
          id: submission.id,
          data: {
            marks_obtained: gradeData.marks,
            feedback: gradeData.feedback || '',
            status: 'graded'
          }
        })).unwrap();
      });
      await Promise.all(promises);
      await refetch();
      showToast('All grades submitted successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to submit grades', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({});
    setEditMode('add');
    setSelectedAssignment(null);
    setEditingSubmission(null);
  };

  return {
    // Create/Edit Drawer
    isCreateDrawerOpen,
    setIsCreateDrawerOpen,
    editMode,
    formData,
    setFormData,
    handleCreateOpen,
    handleEditOpen,
    handleSaveAssignment,
    handleFormChange,
    resetForm,
    isSubmitting,
    
    // Delete
    handleDelete,
    
    // Grade Drawer
    isGradeDrawerOpen,
    setIsGradeDrawerOpen,
    selectedAssignment,
    setSelectedAssignment,
    editingSubmission,
    setEditingSubmission,
    openGradeDrawer,
    handleGradeSubmit,
    handleBulkGrade,
  };
}

export default useAssignmentActions;