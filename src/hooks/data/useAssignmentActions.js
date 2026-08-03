import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  createAssignment,
  updateAssignment,
  deleteAssignment,
  updateSubmission
} from '@/modules/teacher/store/teacherThunks';

export function useAssignmentActions({ refetch, showToast }) {
  const dispatch = useDispatch();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState('add');
  const [formData, setFormData] = useState({});
  const [isGradeDrawerOpen, setIsGradeDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);

  const handleCreateOpen = () => {
    setEditMode('add');
    setFormData({});
    setIsCreateDrawerOpen(true);
  };

  const handleEditOpen = (assignment) => {
    setEditMode('edit');
    setFormData(assignment);
    setIsCreateDrawerOpen(true);
  };

  const handleSaveAssignment = async () => {
    try {
      if (editMode === 'add') {
        await dispatch(createAssignment(formData)).unwrap();
        showToast('Assignment created successfully', 'success');
      } else {
        await dispatch(updateAssignment(formData)).unwrap();
        showToast('Assignment updated successfully', 'success');
      }
      await refetch();
      setIsCreateDrawerOpen(false);
    } catch (error) {
      showToast(error.message || 'Failed to save assignment', 'error');
    }
  };

  const handleDelete = async (id) => {
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

  const handleGradeSubmit = async (submissionId, marks, feedback) => {
    try {
      await dispatch(updateSubmission({ id: submissionId, marks, feedback })).unwrap();
      await refetch();
      showToast('Grade submitted successfully', 'success');
      setEditingSubmission(null);
    } catch (error) {
      showToast(error.message || 'Failed to submit grade', 'error');
    }
  };

  return {
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
    handleGradeSubmit
  };
}


export default useAssignmentActions;
