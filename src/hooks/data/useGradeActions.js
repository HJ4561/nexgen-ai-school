// src/modules/teacher/pages/GradeManagement/hooks/useGradeActions.js

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateGrade } from "@/modules/teacher/store/teacherThunks";

export function useGradeActions({ refetch, showToast }) {
  const dispatch = useDispatch();

  const [draftGrades, setDraftGrades] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // ─── Handle mark change ──────────────────────────────────
const handleMarkChange = (gradeId, field, value) => {
  setDraftGrades(prev => ({
    ...prev,
    [gradeId]: {
      ...prev[gradeId],
      [field]: value,
    },
  }));
};

  // ─── Save Draft (local only) ────────────────────────────
  const handleSaveDraft = () => {
    setSaveMessage(' Draft saved locally');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ─── Finalize & Publish ─────────────────────────────────
  const handleFinalize = async (originalGrades) => {
    const changedEntries = Object.entries(draftGrades).filter(([id, changes]) => {
      const original = originalGrades.find(g => g.id === parseInt(id));
      if (!original) return false;
      return Object.keys(changes).some(key => changes[key] != original[key]);
    });

    if (changedEntries.length === 0) {
      showToast('No changes to publish.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const promises = changedEntries.map(([id, changes]) => {
        const payload = {};
        if (changes.obtained_marks !== undefined) payload.obtained_marks = changes.obtained_marks;
        if (changes.total_marks !== undefined) payload.total_marks = changes.total_marks;
        return dispatch(updateGrade({ id: parseInt(id), ...payload })).unwrap();
      });
      await Promise.all(promises);
      showToast(` ${promises.length} grades updated successfully!`, 'success');
      setDraftGrades({});
      refetch();
    } catch (err) {
      showToast(` Failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Export CSV ──────────────────────────────────────────
  const exportCSV = (grades) => {
    if (!grades || grades.length === 0) {
      showToast('No data to export.', 'error');
      return;
    }
    try {
      const headers = ['Student', 'Subject', 'Exam Type', 'Obtained Marks', 'Total Marks', 'Grade'];
      const rows = grades.map(g => {
        const percentage = (g.obtained_marks / g.total_marks) * 100;
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : 'C';
        return [g.student_name, getSubjectName(g.subject), g.exam_type, g.obtained_marks, g.total_marks, grade];
      });
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('CSV exported!', 'success');
    } catch (err) {
      showToast('Failed to export', 'error');
    }
  };

  return {
    draftGrades,
    handleMarkChange,
    isSaving,
    saveMessage,
    handleSaveDraft,
    handleFinalize,
    exportCSV,
  };
}


export default useGradeActions;
