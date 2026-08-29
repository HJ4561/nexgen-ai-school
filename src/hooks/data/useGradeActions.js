// src/modules/teacher/pages/GradeManagement/hooks/useGradeActions.js

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateResult } from "@/modules/teacher/store/teacherThunks";
import { getSubjectName } from "@/utils/SubjectMapping";

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
    setSaveMessage('📝 Draft saved locally');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // ─── Finalize & Publish ─────────────────────────────────
  const handleFinalize = async (originalGrades) => {
    const changedEntries = Object.entries(draftGrades).filter(([id, changes]) => {
      const original = originalGrades?.find(g => g.id === parseInt(id));
      if (!original) return false;
      return Object.keys(changes).some(key => {
        // Handle different field names
        const fieldMap = {
          'marks_obtained': 'marks_obtained',
          'obtained_marks': 'marks_obtained',
          'total_marks': 'total_marks',
        };
        const actualField = fieldMap[key] || key;
        return changes[key] != original[actualField];
      });
    });

    if (changedEntries.length === 0) {
      showToast('No changes to publish.', 'info');
      return;
    }

    setIsSaving(true);
    try {
      const promises = changedEntries.map(([id, changes]) => {
        const payload = {};
        if (changes.marks_obtained !== undefined) payload.marks_obtained = parseFloat(changes.marks_obtained);
        if (changes.obtained_marks !== undefined) payload.marks_obtained = parseFloat(changes.obtained_marks);
        if (changes.total_marks !== undefined) payload.total_marks = parseFloat(changes.total_marks);
        
        // Use updateResult from teacherThunks
        return dispatch(updateResult({ 
          id: parseInt(id), 
          data: payload 
        })).unwrap();
      });
      
      await Promise.all(promises);
      showToast(`✅ ${promises.length} grades updated successfully!`, 'success');
      setDraftGrades({});
      if (refetch) refetch();
    } catch (err) {
      showToast(`❌ Failed: ${err.message || 'Unknown error'}`, 'error');
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
      const headers = ['Student', 'Subject', 'Exam Type', 'Obtained Marks', 'Total Marks', 'Grade', 'Percentage'];
      const rows = grades.map(g => {
        const obtained = parseFloat(g.marks_obtained || g.obtained_marks || 0);
        const total = parseFloat(g.total_marks || 100);
        const percentage = total > 0 ? (obtained / total) * 100 : 0;
        const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
        
        return [
          g.student_name || `Student ${g.student || g.student_id}`,
          getSubjectName(g.subject) || `Subject ${g.subject}`,
          g.exam_type || 'General',
          obtained,
          total,
          grade,
          percentage.toFixed(1) + '%'
        ];
      });
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grades_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📊 CSV exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  // ─── Clear drafts ────────────────────────────────────────
  const clearDrafts = () => {
    setDraftGrades({});
    setSaveMessage('');
  };

  // ─── Get changed count ──────────────────────────────────
  const getChangedCount = (originalGrades) => {
    if (!originalGrades || !draftGrades) return 0;
    return Object.keys(draftGrades).filter(id => {
      const original = originalGrades.find(g => g.id === parseInt(id));
      if (!original) return false;
      const changes = draftGrades[id];
      return Object.keys(changes).some(key => {
        const fieldMap = {
          'marks_obtained': 'marks_obtained',
          'obtained_marks': 'marks_obtained',
          'total_marks': 'total_marks',
        };
        const actualField = fieldMap[key] || key;
        return changes[key] != original[actualField];
      });
    }).length;
  };

  return {
    draftGrades,
    handleMarkChange,
    isSaving,
    saveMessage,
    handleSaveDraft,
    handleFinalize,
    exportCSV,
    clearDrafts,
    getChangedCount,
  };
}

export default useGradeActions;