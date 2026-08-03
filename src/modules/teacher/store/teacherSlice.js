/**
 * ============================================
 * TEACHER SLICE
 * ============================================
 * 
 * Purpose: Redux slice for teacher module state management
 * Used by: All teacher components and pages
 * 
 * Features:
 * - Timetable management
 * - Attendance tracking
 * - Behavior logs
 * - Assignments and submissions
 * - Grade management
 * - Dashboard statistics
 * - Teacher classes and students
 * 
 * Dependencies:
 * - @reduxjs/toolkit for slice creation
 * - teacherThunks for async actions
 * 
 * State Structure:
 * - timetable: { data, loading, error }
 * - attendance: { data, loading, error, saving }
 * - behaviorLogs: { data, loading, error }
 * - dashboard: { summary, trend, loading, error }
 * - assignments: []
 * - submissions: []
 * - grades: []
 * - classes: []
 * - students: {}
 * ============================================
 */

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTeacherTimetable,
  fetchAttendance,
  createAttendance,
  updateAttendance,
  fetchBehaviorLogs,
  createBehaviorLog,
  fetchTeacherDashboard,
} from './teacherThunks';

/**
 * ============================================
 * INITIAL STATE
 * ============================================
 * 
 * Default state for the teacher slice
 */
const initialState = {
  // ─── Core Data ──────────────────────────────────────────────────────
  classes: [],
  students: [],
  assignments: [],
  submissions: [],
  loading: false,
  error: null,
  submitting: false,
  successMessage: null,

  // ─── Grades ────────────────────────────────────────────────────────
  grades: [],
  gradesLoading: false,
  gradesError: null,
  gradesSubmitting: false,

  // ─── Timetable ────────────────────────────────────────────────────
  timetable: {
    data: [],
    loading: false,
    error: null,
  },

  // ─── Attendance ──────────────────────────────────────────────────
  attendance: {
    data: [], // array of attendance objects for current class/date
    loading: false,
    error: null,
    saving: false,
  },

  // ─── Behavior Logs ───────────────────────────────────────────────
  behaviorLogs: {
    data: [],
    loading: false,
    error: null,
  },

  // ─── Dashboard ────────────────────────────────────────────────────
  dashboard: {
    summary: {
      todayClasses: 0,
      pendingAssignments: 0,
      attendancePercentage: 0,
      notificationsCount: 0,
    },
    trend: [],
    loading: false,
    error: null,
  },
};

/**
 * ============================================
 * TEACHER SLICE
 * ============================================
 * 
 * Contains reducers and actions for teacher state management
 */
const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    // ─── Error & Success Management ──────────────────────────────────

    /** Clear any error in the state */
    clearTeacherError: (state) => {
      state.error = null;
    },

    /** Clear any success message in the state */
    clearTeacherSuccess: (state) => {
      state.successMessage = null;
    },

    // ─── Assignments ──────────────────────────────────────────────────

    /** Set assignments data */
    fetchAssignmentsSuccess: (state, action) => {
      state.assignments = action.payload;
    },

    /** Add a new assignment to the list */
    createAssignmentSuccess: (state, action) => {
      state.assignments.push(action.payload);
    },

    /** Update an existing assignment */
    updateAssignmentSuccess: (state, action) => {
      const index = state.assignments.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.assignments[index] = action.payload;
    },

    /** Remove a deleted assignment */
    deleteAssignmentSuccess: (state, action) => {
      state.assignments = state.assignments.filter((a) => a.id !== action.payload);
    },

    // ─── Submissions ──────────────────────────────────────────────────

    /** Set submissions data */
    fetchSubmissionsSuccess: (state, action) => {
      state.submissions = action.payload;
    },

    /** Update a submission (e.g., after grading) */
    updateSubmissionSuccess: (state, action) => {
      const index = state.submissions.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) state.submissions[index] = action.payload;
    },

    // ─── Grades ──────────────────────────────────────────────────────

    /** Start fetching grades - set loading state */
    fetchGradesStart: (state) => {
      state.gradesLoading = true;
      state.gradesError = null;
    },

    /** Successfully fetched grades */
    fetchGradesSuccess: (state, action) => {
      state.gradesLoading = false;
      state.grades = action.payload;
    },

    /** Failed to fetch grades */
    fetchGradesFailure: (state, action) => {
      state.gradesLoading = false;
      state.gradesError = action.payload;
    },

    /** Start updating a grade */
    updateGradeStart: (state) => {
      state.gradesSubmitting = true;
    },

    /** Successfully updated a grade */
    updateGradeSuccess: (state, action) => {
      state.gradesSubmitting = false;
      const index = state.grades.findIndex((g) => g.id === action.payload.id);
      if (index !== -1) state.grades[index] = action.payload;
    },

    /** Failed to update a grade */
    updateGradeFailure: (state, action) => {
      state.gradesSubmitting = false;
      state.gradesError = action.payload;
    },

    // ─── Teacher Classes ─────────────────────────────────────────────

    /** Start fetching teacher classes */
    fetchTeacherClassesStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    /** Successfully fetched teacher classes */
    fetchTeacherClassesSuccess: (state, action) => {
      state.loading = false;
      state.classes = action.payload;
    },

    /** Failed to fetch teacher classes */
    fetchTeacherClassesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ─── Teacher Students ────────────────────────────────────────────

    /** Start fetching students for a class */
    fetchTeacherStudentsStart: (state) => {
      state.loading = true;
    },

    /** Successfully fetched students for a class */
    fetchTeacherStudentsSuccess: (state, action) => {
      state.loading = false;
      const { classSectionId, students } = action.payload;
      state.students[classSectionId] = students;
    },

    /** Failed to fetch students */
    fetchTeacherStudentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },

  /**
   * ============================================
   * EXTRA REDUCERS
   * ============================================
   * 
   * Handles async thunk actions for API calls
   */
  extraReducers: (builder) => {
    builder
      // ─── Timetable ──────────────────────────────────────────────────

      /** Fetching timetable - pending */
      .addCase(fetchTeacherTimetable.pending, (state) => {
        state.timetable.loading = true;
        state.timetable.error = null;
      })
      /** Fetching timetable - fulfilled */
      .addCase(fetchTeacherTimetable.fulfilled, (state, action) => {
        state.timetable.loading = false;
        state.timetable.data = action.payload;
      })
      /** Fetching timetable - rejected */
      .addCase(fetchTeacherTimetable.rejected, (state, action) => {
        state.timetable.loading = false;
        state.timetable.error = action.payload;
      })

      // ─── Dashboard ──────────────────────────────────────────────────

      /** Fetching dashboard - pending */
      .addCase(fetchTeacherDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      /** Fetching dashboard - fulfilled */
      .addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.summary = action.payload.summary;
        state.dashboard.trend = action.payload.trend;
      })
      /** Fetching dashboard - rejected */
      .addCase(fetchTeacherDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      })

      // ─── Attendance ─────────────────────────────────────────────────

      /** Fetching attendance - pending */
      .addCase(fetchAttendance.pending, (state) => {
        state.attendance.loading = true;
        state.attendance.error = null;
      })
      /** Fetching attendance - fulfilled */
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendance.loading = false;
        state.attendance.data = action.payload;
      })
      /** Fetching attendance - rejected */
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.attendance.loading = false;
        state.attendance.error = action.payload;
      })

      /** Creating attendance - pending */
      .addCase(createAttendance.pending, (state) => {
        state.attendance.saving = true;
      })
      /** Creating attendance - fulfilled */
      .addCase(createAttendance.fulfilled, (state) => {
        state.attendance.saving = false;
        // optionally push new record
      })
      /** Creating attendance - rejected */
      .addCase(createAttendance.rejected, (state) => {
        state.attendance.saving = false;
      })

      /** Updating attendance - pending */
      .addCase(updateAttendance.pending, (state) => {
        state.attendance.saving = true;
      })
      /** Updating attendance - fulfilled */
      .addCase(updateAttendance.fulfilled, (state) => {
        state.attendance.saving = false;
        // update record in array
      })
      /** Updating attendance - rejected */
      .addCase(updateAttendance.rejected, (state) => {
        state.attendance.saving = false;
      })

      // ─── Behavior Logs ─────────────────────────────────────────────

      /** Fetching behavior logs - pending */
      .addCase(fetchBehaviorLogs.pending, (state) => {
        state.behaviorLogs.loading = true;
      })
      /** Fetching behavior logs - fulfilled */
      .addCase(fetchBehaviorLogs.fulfilled, (state, action) => {
        state.behaviorLogs.loading = false;
        state.behaviorLogs.data = action.payload;
      })
      /** Fetching behavior logs - rejected */
      .addCase(fetchBehaviorLogs.rejected, (state, action) => {
        state.behaviorLogs.loading = false;
        state.behaviorLogs.error = action.payload;
      })

      // ─── Generic Matchers ───────────────────────────────────────────

      /**
       * Matches any pending teacher action
       * Sets appropriate loading/submitting state
       */
      builder.addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/pending'),
        (state) => {
          if (action.type.includes('create') || action.type.includes('update') || action.type.includes('delete')) {
            state.submitting = true;
          } else {
            state.loading = true;
          }
          state.error = null;
          state.successMessage = null;
        }
      )

      /**
       * Matches any fulfilled teacher action
       * Clears loading/submitting states
       */
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
          state.submitting = false;
        }
      )

      /**
       * Matches any rejected teacher action
       * Sets error message and clears loading/submitting states
       */
      .addMatcher(
        (action) => action.type.startsWith('teacher/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.submitting = false;
          state.error = action.payload || 'Something went wrong.';
        }
      );
  },
});

// ─── Export Actions ──────────────────────────────────────────────────────

export const {
  clearTeacherError,
  clearTeacherSuccess,
  fetchAssignmentsSuccess,
  createAssignmentSuccess,
  updateAssignmentSuccess,
  deleteAssignmentSuccess,
  fetchSubmissionsSuccess,
  updateSubmissionSuccess,
  fetchGradesStart,
  fetchGradesSuccess,
  fetchGradesFailure,
  updateGradeStart,
  updateGradeSuccess,
  updateGradeFailure,
  fetchTeacherClassesStart,
  fetchTeacherClassesSuccess,
  fetchTeacherClassesFailure,
  fetchTeacherStudentsStart,
  fetchTeacherStudentsSuccess,
  fetchTeacherStudentsFailure,
} = teacherSlice.actions;

// ─── Export Reducer ──────────────────────────────────────────────────────

export default teacherSlice.reducer;