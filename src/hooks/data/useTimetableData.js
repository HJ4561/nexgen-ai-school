// src/hooks/data/useTimetableData.js

/**
 * ============================================
 * USE TIMETABLE DATA HOOK
 * ============================================
 * 
 * Purpose: Custom hook for managing teacher timetable data
 * Used by: Teacher - Timetable Management page
 * 
 * Data Sources:
 * - fetchTimetable: Teacher's timetable entries
 * - fetchTeacherClasses: Teacher's assigned classes
 * 
 * Features:
 * - Fetch data on mount
 * - Enrich entries with subject and class names
 * - Time slot management (60-minute slots)
 * - Current day detection
 * - Today's classes tracking
 * - Completion status for slots
 * - Grid data structure for calendar view
 * - Mobile-friendly sorted list
 * - Up next class detection
 * - Progress calculation
 * 
 * Time Configuration:
 * - TIME_SLOTS: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"]
 * - BREAK_SLOT: "10:00" (recess period)
 * - Slot duration: 60 minutes
 * 
 * Returns:
 * - loading: Loading state
 * - error: Error message
 * - enrichedEntries: Enriched timetable entries
 * - stats: Statistics object
 * - todayEntries: Today's entries
 * - gridData: Matrix for calendar view
 * - allScheduleItems: Sorted list for mobile
 * - upNext: Next upcoming class
 * - progressPercent: Today's progress percentage
 * - todayShort: Current day short name
 * ============================================
 */

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTimetable, 
  fetchTeacherClasses,
  fetchSections,
  fetchSubjects,
  fetchRooms,
} from "@/modules/teacher/store/teacherThunks";
import {
  selectTeacherTimetable,
  selectTeacherClasses,
  selectTeacherSections,
  selectTeacherSubjects,
  selectTeacherRooms,
  selectTeacherLoading,
  selectTeacherError,
} from "@/modules/teacher/store/teacherSlice";
import { SUBJECT_LIST } from '@/utils/SubjectMapping';

// ─── Time Configuration ──────────────────────────────────────────────
// 60-minute slots from 8:00 AM to 1:00 PM
export const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];
export const BREAK_SLOT = "10:00";   // recess period

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Get current day short name
 * @returns {string} Day abbreviation (Mon, Tue, etc.)
 */
const getCurrentDayShort = () => {
  const map = { Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat" };
  return map[new Date().toLocaleDateString("en-US", { weekday: "long" })];
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

/**
 * Check if a slot is currently active (60-minute duration)
 * @param {string} dayShort - Day abbreviation
 * @param {string} startTime - Slot start time in HH:MM
 * @returns {boolean} True if slot is currently active
 */
export const isCurrentSlot = (dayShort, startTime) => {
  const currentDay = getCurrentDayShort();
  if (dayShort !== currentDay) return false;
  const now = getCurrentTime();
  const [h, m] = startTime.split(":").map(Number);
  const slotStart = h * 60 + m;
  const [nH, nM] = now.split(":").map(Number);
  const nowMinutes = nH * 60 + nM;
  return nowMinutes >= slotStart && nowMinutes < slotStart + 60;
};

/**
 * Check if a slot is completed (60-minute duration)
 * @param {string} dayShort - Day abbreviation
 * @param {string} startTime - Slot start time in HH:MM
 * @returns {boolean} True if slot is completed
 */
export const isSlotCompleted = (dayShort, startTime) => {
  const currentDay = getCurrentDayShort();
  if (dayShort !== currentDay) return false;
  const now = getCurrentTime();
  const [h, m] = startTime.split(":").map(Number);
  const slotStart = h * 60 + m;
  const [nH, nM] = now.split(":").map(Number);
  const nowMinutes = nH * 60 + nM;
  return nowMinutes > slotStart + 60;
};

/**
 * useTimetableData Hook
 * 
 * @param {Object} params - Query parameters for fetching timetable
 * @param {number} params.class_id - Filter by class ID
 * @param {number} params.teacher_id - Filter by teacher ID
 * @param {string} params.day - Filter by day
 * @returns {Object} Timetable data and management functions
 * 
 * @example
 * const {
 *   loading,
 *   enrichedEntries,
 *   stats,
 *   gridData,
 *   upNext,
 *   progressPercent
 * } = useTimetableData();
 */
export function useTimetableData(params = {}) {
  const dispatch = useDispatch();
  
  // Use selectors to get data from Redux store
  const timetable = useSelector(selectTeacherTimetable);
  const classes = useSelector(selectTeacherClasses);
  const sections = useSelector(selectTeacherSections);
  const subjects = useSelector(selectTeacherSubjects);
  const rooms = useSelector(selectTeacherRooms);
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);

  // ─── Fetch Data on Mount ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchTimetable(params));
    if (!classes?.length) {
      dispatch(fetchTeacherClasses());
      dispatch(fetchSections());
      dispatch(fetchSubjects());
      dispatch(fetchRooms());
    }
  }, [dispatch, JSON.stringify(params)]);

  // ─── Enrich entries with names ──────────────────────────────────
  const enrichedEntries = useMemo(() => {
    if (!timetable || !Array.isArray(timetable)) return [];
    
    return timetable.map(entry => {
      const subjectInfo = subjects?.find(s => s.id === entry.subject);
      const classInfo = classes?.find(c => c.id === entry.class_obj || c.id === entry.class_section);
      const sectionInfo = sections?.find(s => s.id === entry.section);
      const roomInfo = rooms?.find(r => r.id === entry.room);
      
      return {
        ...entry,
        subjectName: subjectInfo?.name || `Subject ${entry.subject}`,
        className: classInfo?.name || `Class ${entry.class_obj || entry.class_section}`,
        sectionName: sectionInfo?.name || `Section ${entry.section}`,
        roomName: roomInfo?.name || `Room ${entry.room}`,
        startSlot: entry.start_time?.slice(0, 5) || entry.start_time,
      };
    }).filter(entry => TIME_SLOTS.includes(entry.startSlot)); // only defined slots
  }, [timetable, classes, sections, subjects, rooms]);

  // ─── Today's Entries ──────────────────────────────────────────────
  const todayShort = getCurrentDayShort();
  const todayEntries = useMemo(
    () => enrichedEntries.filter(e => e.day === todayShort),
    [enrichedEntries, todayShort]
  );

  // ─── Statistics ──────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: enrichedEntries.length,
    today: todayEntries.length,
    completedToday: todayEntries.filter(e => isSlotCompleted(e.day, e.startSlot)).length,
  }), [enrichedEntries, todayEntries]);

  // ─── Grid Data (Matrix for Calendar View) ──────────────────────
  const gridData = useMemo(() => {
    const matrix = {};
    TIME_SLOTS.forEach(time => {
      matrix[time] = {};
      DAYS.forEach(day => { matrix[time][day] = null; });
    });
    enrichedEntries.forEach(entry => {
      if (matrix[entry.startSlot] && matrix[entry.startSlot][entry.day] !== undefined) {
        matrix[entry.startSlot][entry.day] = entry;
      }
    });
    return matrix;
  }, [enrichedEntries]);

  // ─── Mobile Sorted List ──────────────────────────────────────────
  const allScheduleItems = useMemo(() => {
    const dayOrder = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5 };
    return [...enrichedEntries].sort((a, b) => {
      if (a.day !== b.day) return dayOrder[a.day] - dayOrder[b.day];
      return a.start_time.localeCompare(b.start_time);
    });
  }, [enrichedEntries]);

  // ─── Up Next Class ──────────────────────────────────────────────
  const upNext = useMemo(() => {
    const now = getCurrentTime();
    return todayEntries
      .filter(e => e.startSlot > now)
      .sort((a, b) => a.startSlot.localeCompare(b.startSlot))[0] || null;
  }, [todayEntries]);

  // ─── Progress Calculation ──────────────────────────────────────
  const progressPercent = stats.today > 0
    ? Math.round((stats.completedToday / stats.today) * 100)
    : 0;

  // ─── Refresh Function ──────────────────────────────────────────
  const refresh = () => {
    dispatch(fetchTimetable(params));
    dispatch(fetchTeacherClasses());
    dispatch(fetchSections());
    dispatch(fetchSubjects());
    dispatch(fetchRooms());
  };

  // ─── Helper Functions ──────────────────────────────────────────
  const getClassName = (classId) => {
    const cls = classes?.find(c => c.id === classId);
    return cls?.name || `Class ${classId}`;
  };

  const getSectionName = (sectionId) => {
    const section = sections?.find(s => s.id === sectionId);
    return section?.name || `Section ${sectionId}`;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects?.find(s => s.id === subjectId);
    return subject?.name || `Subject ${subjectId}`;
  };

  const getRoomName = (roomId) => {
    const room = rooms?.find(r => r.id === roomId);
    return room?.name || `Room ${roomId}`;
  };

  return {
    loading,
    error,
    enrichedEntries,
    stats,
    todayEntries,
    gridData,
    allScheduleItems,
    upNext,
    progressPercent,
    todayShort,
    refresh,
    // Helper functions
    getClassName,
    getSectionName,
    getSubjectName,
    getRoomName,
    // Raw data
    timetable,
    classes,
    sections,
    subjects,
    rooms,
  };
}

export default useTimetableData;