/**
 * ============================================
 * ATTENDANCE REGISTER PAGE (Teacher)
 * ============================================
 * 
 * Purpose: Teacher attendance management page
 * Used by: Teacher users only
 * 
 * Features:
 * - View attendance by class and date
 * - Mark attendance for all students
 * - Edit existing attendance records
 * - Locked records (cannot be edited)
 * - Export attendance as CSV
 * - Student behavior logs
 * - Statistics display
 * - Loading and error states
 * 
 * Flow:
 * 1. Select class and date
 * 2. View existing attendance or mark new
 * 3. Edit attendance (if not locked)
 * 4. Save changes
 * 
 * Dependencies:
 * - Teacher thunks for API operations
 * - UI components for display
 * - BehaviorLogDrawer for behavior tracking
 * ============================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileEdit, Save, Edit2, X } from 'lucide-react';

import PageHeader from "@/components/layout/PageHeader";
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  fetchTeacherClasses,
  fetchTeacherStudents,
  fetchAttendance,
  createAttendance,
  updateAttendance,
} from '@/modules/teacher/store/teacherThunks';

import AttendanceFilters from "@/components/teacher/AttendanceFilters";
import AttendanceStats from "@/components/teacher/AttendanceStats";
import AttendanceTable from "@/components/teacher/AttendanceTable";
import BehaviorLogDrawer from "@/components/teacher/BehaviorLogDrawer";

/**
 * AttendanceManagement Component
 * 
 * @component
 * @returns {JSX.Element} Rendered attendance management page
 * 
 * @example
 * // In router:
 * <Route path="/teacher/attendance" element={<AttendanceManagement />} />
 */
export default function AttendanceManagement() {
  const dispatch = useDispatch();
  const { classes, students, attendance } = useSelector(state => state.teacher);

  // ─── State ──────────────────────────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );

  const [localAttendance, setLocalAttendance] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const [mode, setMode] = useState('view');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ─── Fetch Data on Mount ──────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTeacherClasses());
    dispatch(fetchAttendance());
  }, [dispatch]);

  // ─── Set default class ──────────────────────────────────────────────────
  useEffect(() => {
    if (classes?.length > 0 && !selectedClass) setSelectedClass(String(classes[0].id));
  }, [classes, selectedClass]);

  // ─── Fetch students when class changes ──────────────────────────────────
  useEffect(() => {
    if (selectedClass) dispatch(fetchTeacherStudents(Number(selectedClass)));
  }, [selectedClass, dispatch]);

  // ─── Reset local on class/date change ──────────────────────────────────
  useEffect(() => {
    setLocalAttendance({});
    setMode('view');
    setSaveMessage('');
    setSaveError('');
  }, [selectedClass, attendanceDate]);

  // ─── Derive localAttendance from API data ──────────────────────────────
  useEffect(() => {
    if (!attendance.data || !Array.isArray(attendance.data)) return;
    const filtered = attendance.data.filter(
      rec => rec.class_section === Number(selectedClass) && rec.date === attendanceDate
    );
    const map = {};
    filtered.forEach(rec => {
      map[rec.student] = { status: rec.status, id: rec.id, is_locked: rec.is_locked };
    });
    setLocalAttendance(map);
    setMode('view');
  }, [attendance.data, selectedClass, attendanceDate]);

  // ─── Derived students array ──────────────────────────────────────────────
  const classStudents = useMemo(() => {
    if (!selectedClass || !students) return [];
    return students[Number(selectedClass)] || [];
  }, [selectedClass, students]);

  // ─── Check if any records exist ──────────────────────────────────────────
  const hasRecords = Object.keys(localAttendance).length > 0;

  // ─── Statistics ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = classStudents.length;
    let present = 0, absent = 0, leave = 0;
    classStudents.forEach(s => {
      const status = localAttendance[s.id]?.status || 'Present';
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Leave') leave++;
    });
    return { total, present, absent, leave };
  }, [classStudents, localAttendance]);

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleStatusChange = useCallback((studentId, newStatus) => {
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), status: newStatus },
    }));
  }, []);

  const openBehaviorDrawer = useCallback((student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  }, []);

  const closeBehaviorDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleStartMarking = () => {
    const initial = {};
    classStudents.forEach(s => {
      initial[s.id] = { status: 'Present', id: undefined, is_locked: false };
    });
    setLocalAttendance(initial);
    setMode('mark');
    setSaveMessage('');
    setSaveError('');
  };

  const handleSaveMarked = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const promises = classStudents.map(async (student) => {
        const record = localAttendance[student.id];
        const status = record?.status || 'Present';
        return dispatch(createAttendance({
          student: student.id,
          class_section: Number(selectedClass),
          date: attendanceDate,
          status,
        })).unwrap();
      });
      await Promise.all(promises);
      setSaveMessage('Attendance saved!');
      dispatch(fetchAttendance());
    } catch (err) {
      let errorMsg = 'Save failed.';
      try {
        const errorData = JSON.parse(err.message || err);
        if (errorData.non_field_errors) errorMsg = 'Attendance already marked by another teacher for this class/date.';
        else if (errorData.detail) errorMsg = errorData.detail;
      } catch { errorMsg = err.message || errorMsg; }
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdits = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      const promises = classStudents.map(async (student) => {
        const record = localAttendance[student.id];
        if (!record) return null;
        const { id, is_locked, status } = record;
        if (is_locked) return null;
        return dispatch(updateAttendance({
          id,
          student: student.id,
          class_section: Number(selectedClass),
          date: attendanceDate,
          status,
        })).unwrap();
      });
      await Promise.all(promises);
      setSaveMessage('Changes saved.');
      dispatch(fetchAttendance());
      setMode('view');
    } catch (err) {
      let errorMsg = 'Update failed.';
      try {
        const errorData = JSON.parse(err.message || err);
        if (errorData.detail) errorMsg = errorData.detail;
      } catch { errorMsg = err.message || errorMsg; }
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (attendance.data && Array.isArray(attendance.data)) {
      const map = {};
      attendance.data.forEach(rec => {
        map[rec.student] = {
          status: rec.status,
          id: rec.id,
          is_locked: rec.is_locked,
        };
      });
      setLocalAttendance(map);
    } else {
      setLocalAttendance({});
    }
    setMode('view');
    setSaveMessage('');
    setSaveError('');
  };

  const handleExportCSV = () => {
    if (!classStudents.length) return;
    const headers = ['Roll No', 'Name', 'Status'];
    const rows = classStudents.map(s => {
      const status = localAttendance[s.id]?.status || 'Present';
      return [s.roll_number, s.full_name, status];
    });
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => `"${val}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${attendanceDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isLoading = attendance.loading;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[var(--color-surface-dim)] min-h-screen">
      {/* ─── Page Header ────────────────────────────────────────────────── */}
      <PageHeader
        title="Attendance Management"
        subtitle="Record student attendance and submit behavior reports."
        breadcrumbs={['Teacher', 'Attendance']}
        tone="teacher"
        titleClassName="text-[var(--color-teacher-primary)]"
        action={
          <Button variant="outline" tone="teacher" size="sm" leftIcon={<FileEdit size={16} />} onClick={handleExportCSV}>
            Export CSV
          </Button>
        }
      />

      {/* ─── Filters ────────────────────────────────────────────────────── */}
      <AttendanceFilters
        classes={classes}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        attendanceDate={attendanceDate}
        setAttendanceDate={setAttendanceDate}
      />

      {/* ─── Loading State ────────────────────────────────────────────── */}
      {isLoading && <LoadingSpinner size="lg" />}

      {/* ─── Loaded Content ────────────────────────────────────────────── */}
      {!isLoading && selectedClass && classStudents.length > 0 && (
        <>
          {/* Empty State */}
          {!hasRecords && mode !== 'mark' && (
            <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-10 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileEdit size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No attendance recorded for this date.</h3>
              <p className="text-sm text-gray-500 mb-6">You can mark attendance for all students now.</p>
              <Button variant="primary" tone="teacher" onClick={handleStartMarking} leftIcon={<Edit2 size={16} />}>
                Mark Attendance
              </Button>
            </div>
          )}

          {/* Marking Mode */}
          {mode === 'mark' && (
            <>
              <AttendanceStats stats={stats} />
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                <AttendanceTable
                  students={classStudents}
                  localAttendance={localAttendance}
                  onStatusChange={handleStatusChange}
                  onBehaviorClick={openBehaviorDrawer}
                  readOnly={false}
                />
                <div className="px-6 py-4 bg-[var(--color-surface-dim)]/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    {saveMessage && <span className="text-green-600 text-sm">{saveMessage}</span>}
                    {saveError && <span className="text-red-600 text-sm">{saveError}</span>}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" tone="teacher" onClick={handleCancel} leftIcon={<X size={16} />}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      tone="teacher"
                      onClick={handleSaveMarked}
                      disabled={isSaving}
                      leftIcon={<Save size={16} />}
                    >
                      {isSaving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* View/Edit Mode */}
          {hasRecords && (mode === 'view' || mode === 'edit') && (
            <>
              <AttendanceStats stats={stats} />
              <div className="bg-white rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                <AttendanceTable
                  students={classStudents}
                  localAttendance={localAttendance}
                  onStatusChange={mode === 'edit' ? handleStatusChange : undefined}
                  onBehaviorClick={openBehaviorDrawer}
                  readOnly={mode !== 'edit'}
                />
                <div className="px-6 py-4 bg-[var(--color-surface-dim)]/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div>
                    {saveMessage && <span className="text-green-600 text-sm">{saveMessage}</span>}
                    {saveError && <span className="text-red-600 text-sm">{saveError}</span>}
                  </div>
                  <div className="flex gap-3">
                    {mode === 'view' && (
                      <Button
                        variant="outline"
                        tone="teacher"
                        onClick={() => setMode('edit')}
                        disabled={Object.values(localAttendance).every(r => r.is_locked)}
                        leftIcon={<Edit2 size={16} />}
                      >
                        Edit
                      </Button>
                    )}
                    {mode === 'edit' && (
                      <>
                        <Button variant="outline" tone="teacher" onClick={handleCancel} leftIcon={<X size={16} />}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          tone="teacher"
                          onClick={handleSaveEdits}
                          disabled={isSaving}
                          leftIcon={<Save size={16} />}
                        >
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── No Students State ────────────────────────────────────────────── */}
      {!isLoading && selectedClass && classStudents.length === 0 && (
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-10 flex items-center justify-center">
          <p className="text-gray-500">No students found for this class.</p>
        </div>
      )}

      {/* ─── Behavior Log Drawer ────────────────────────────────────────── */}
      <BehaviorLogDrawer
        isOpen={drawerOpen}
        onClose={closeBehaviorDrawer}
        student={selectedStudent}
      />
    </div>
  );
}


















