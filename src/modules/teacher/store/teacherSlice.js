// src/modules/teacher/store/teacherSlice.js

/**
 * ============================================
 * TEACHER SLICE - COMPLETE (UPDATED WITH USER MAPPING)
 * ============================================
 * 
 * Purpose: Redux slice for teacher module state management
 * Used by: All teacher components and pages
 * 
 * FIXES:
 * - Proper handling of Django REST Framework API responses ({ results: [...] })
 * - Safe array extraction for all data types
 * - Fallback to empty arrays when data is invalid
 * - Proper student name extraction from nested objects
 * - Attendance stats calculation from API data
 * - Fixed updateBehaviorLog and deleteBehaviorLog references
 * - Added userMap for mapping user IDs to names (for messages, etc.)
 * - Added fetchAllTeachers and fetchAllParents thunks
 * ============================================
 */

import { createSlice } from '@reduxjs/toolkit';
import * as teacherThunks from './teacherThunks';

// ─── Helper: Extract array from API response ──────────────────────────

const extractArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.results && Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data)) return payload.data;
  return [];
};

// ─── Initial State ──────────────────────────────────────────────────────

const initialState = {
  // Profile
  profile: null,
  
  // Dashboard
  dashboard: {
    summary: {
      totalStudents: 0,
      totalClasses: 0,
      totalAssignments: 0,
      todayClasses: 0,
      attendanceRate: 0,
      pendingSubmissions: 0,
      unreadNotifications: 0,
    },
    recentActivities: [],
    trend: [],
    loading: false,
    error: null,
  },

  // Academics
  classes: [],
  sections: [],
  subjects: [],
  rooms: [],
  classSubjects: [],
  timetable: [],
  
  // Students
  students: [],
  studentDetails: {},
  
  // ─── NEW: For user mapping ─────────────────────────────────────────────
  teachers: [],
  parents: [],
  userMap: {}, // Maps user ID to display name (for messages, etc.)
  
  // Attendance
  attendance: [],
  attendanceStats: {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: 0,
    percentage: 0,
    monthly_data: [],
    total_days: 0,
    present_days: 0,
  },
  
  // Behavior Logs
  behaviorLogs: [],
  behaviorStats: {
    total: 0,
    positive: 0,
    negative: 0,
    low: 0,
    medium: 0,
    high: 0,
  },
  
  // Assignments
  assignments: [],
  submissions: [],
  
  // Exams
  exams: [],
  results: [],
  gradeScale: [],
  questions: [],
  studentAnswers: [],
  aiAutoChecking: [],
  
  // Grades
  grades: [],
  
  // PTM
  ptm: [],
  ptmMeetings: [],
  ptmAttendees: [],
  
  // Communication
  messages: [],
  notifications: [],
  unreadCount: 0,
  
  // Events
  events: [],
  eventParticipations: [],
  
  // Complaints
  complaints: [],
  
  // HR
  leaves: [],
  payroll: [],
  salaryHistory: [],
  
  payrollSummary: {
  total_earnings: 0,
  total_deductions: 0,
  net_pay: 0,
  total_paid: 0,
  total_pending: 0,
  average_salary: 0,
  last_payment_date: null,
  next_payment_date: null,
},

  // Analytics
  predictions: [],
  recommendations: [],
  studentGoals: [],
  studentSkills: [],
  
  // Settings
  settings: {
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    timezone: 'Asia/Karachi',
  },
  
  // UI State
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

// ─── Slice ──────────────────────────────────────────────────────────────

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    // Profile
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfileLocal: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Students
    setStudentDetails: (state, action) => {
      const { studentId, details } = action.payload;
      state.studentDetails[studentId] = details;
    },

    // Attendance
    setAttendanceStats: (state, action) => {
      state.attendanceStats = { ...state.attendanceStats, ...action.payload };
    },

    // Behavior Logs
    setBehaviorStats: (state, action) => {
      state.behaviorStats = { ...state.behaviorStats, ...action.payload };
    },

    // Assignments
    addAssignmentLocal: (state, action) => {
      state.assignments.unshift(action.payload);
    },
    updateAssignmentLocal: (state, action) => {
      const index = state.assignments.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.assignments[index] = { ...state.assignments[index], ...action.payload };
      }
    },
    deleteAssignmentLocal: (state, action) => {
      state.assignments = state.assignments.filter(a => a.id !== action.payload);
    },

    // Submissions
    updateSubmissionLocal: (state, action) => {
      const index = state.submissions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.submissions[index] = { ...state.submissions[index], ...action.payload };
      }
    },

    // Exams
    addExamLocal: (state, action) => {
      state.exams.unshift(action.payload);
    },
    updateExamLocal: (state, action) => {
      const index = state.exams.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.exams[index] = { ...state.exams[index], ...action.payload };
      }
    },
    deleteExamLocal: (state, action) => {
      state.exams = state.exams.filter(e => e.id !== action.payload);
    },

    // Results
    addResultLocal: (state, action) => {
      state.results.push(action.payload);
    },
    updateResultLocal: (state, action) => {
      const index = state.results.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.results[index] = { ...state.results[index], ...action.payload };
      }
    },

    // Questions
    addQuestionLocal: (state, action) => {
      state.questions.push(action.payload);
    },
    updateQuestionLocal: (state, action) => {
      const index = state.questions.findIndex(q => q.id === action.payload.id);
      if (index !== -1) {
        state.questions[index] = { ...state.questions[index], ...action.payload };
      }
    },
    deleteQuestionLocal: (state, action) => {
      state.questions = state.questions.filter(q => q.id !== action.payload);
    },

    // Student Answers
    addStudentAnswerLocal: (state, action) => {
      state.studentAnswers.push(action.payload);
    },
    updateStudentAnswerLocal: (state, action) => {
      const index = state.studentAnswers.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.studentAnswers[index] = { ...state.studentAnswers[index], ...action.payload };
      }
    },
    deleteStudentAnswerLocal: (state, action) => {
      state.studentAnswers = state.studentAnswers.filter(a => a.id !== action.payload);
    },

    // AI Auto Checking
    addAIAutoCheckingLocal: (state, action) => {
      state.aiAutoChecking.push(action.payload);
    },
    updateAIAutoCheckingLocal: (state, action) => {
      const index = state.aiAutoChecking.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.aiAutoChecking[index] = { ...state.aiAutoChecking[index], ...action.payload };
      }
    },
    deleteAIAutoCheckingLocal: (state, action) => {
      state.aiAutoChecking = state.aiAutoChecking.filter(a => a.id !== action.payload);
    },

    // Messages
    addMessageLocal: (state, action) => {
      state.messages.unshift(action.payload);
    },
    updateMessageLocal: (state, action) => {
      const index = state.messages.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload };
      }
    },
    deleteMessageLocal: (state, action) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    markMessageReadLocal: (state, action) => {
      const message = state.messages.find(m => m.id === action.payload);
      if (message) {
        message.is_read = true;
      }
    },

    // Notifications
    markNotificationReadLocal: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.is_read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsReadLocal: (state) => {
      state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
      state.unreadCount = 0;
    },

    // Complaints
    addComplaintLocal: (state, action) => {
      state.complaints.unshift(action.payload);
    },
    updateComplaintLocal: (state, action) => {
      const index = state.complaints.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.complaints[index] = { ...state.complaints[index], ...action.payload };
      }
    },

    // Events
    addEventParticipationLocal: (state, action) => {
      state.eventParticipations.push(action.payload);
    },

    // PTM
    updatePTMMeetingLocal: (state, action) => {
      const index = state.ptmMeetings.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.ptmMeetings[index] = { ...state.ptmMeetings[index], ...action.payload };
      }
    },

    // HR Local Updates
    addLeaveLocal: (state, action) => {
      state.leaves.unshift(action.payload);
    },
    updateLeaveLocal: (state, action) => {
      const index = state.leaves.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.leaves[index] = { ...state.leaves[index], ...action.payload };
      }
    },

    // ─── User Map Helpers ────────────────────────────────────────────────
    addToUserMap: (state, action) => {
      const { id, name } = action.payload;
      if (id && name) {
        state.userMap[id] = name;
      }
    },
    updateUserMap: (state, action) => {
      state.userMap = { ...state.userMap, ...action.payload };
    },

    // Error & Success Management
    clearTeacherError: (state) => {
      state.error = null;
    },
    clearTeacherSuccess: (state) => {
      state.successMessage = null;
    },
    clearTeacherState: () => initialState,
  },

  // ─── Extra Reducers ──────────────────────────────────────────────────
  
  extraReducers: (builder) => {
    builder
      // ─── Profile ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(teacherThunks.fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profile';
      })
      
      .addCase(teacherThunks.updateProfile.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateProfile.fulfilled, (state, action) => {
        state.submitting = false;
        state.profile = { ...state.profile, ...action.payload };
        state.successMessage = 'Profile updated successfully';
      })
      .addCase(teacherThunks.updateProfile.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update profile';
      })
      
      .addCase(teacherThunks.changePassword.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.changePassword.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Password changed successfully';
      })
      .addCase(teacherThunks.changePassword.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to change password';
      })

      // ─── Dashboard ──────────────────────────────────────────────────
      .addCase(teacherThunks.fetchTeacherDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(teacherThunks.fetchTeacherDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.summary = action.payload.summary || state.dashboard.summary;
        state.dashboard.recentActivities = action.payload.recentActivities || [];
        state.dashboard.trend = action.payload.trend || [];
      })
      .addCase(teacherThunks.fetchTeacherDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload || 'Failed to fetch dashboard';
      })

      // ─── Classes ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchTeacherClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchTeacherClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = extractArray(action.payload).map(c => ({
          id: c.id,
          name: c.name || 'Class',
          ...c
        }));
        console.log('✅ Classes loaded:', state.classes.length);
      })
      .addCase(teacherThunks.fetchTeacherClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch classes';
        state.classes = [];
      })

      // ─── Sections ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchSections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchSections.fulfilled, (state, action) => {
        state.loading = false;
        state.sections = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchSections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch sections';
        state.sections = [];
      })

      // ─── Subjects ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch subjects';
        state.subjects = [];
      })

      // ─── Rooms ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch rooms';
        state.rooms = [];
      })

      // ─── Class Subjects ──────────────────────────────────────────────
      .addCase(teacherThunks.fetchClassSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchClassSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.classSubjects = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchClassSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch class subjects';
        state.classSubjects = [];
      })

      // ─── Students ─────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        const students = extractArray(action.payload);
        state.students = students.map(s => ({
          id: s.id,
          name: s.name || s.user?.name || s.full_name || 'Unknown',
          roll_no: s.roll_no || s.admission_no || '—',
          admission_no: s.admission_no || '—',
          class: s.class_obj?.name || s.class_name,
          section: s.section?.name || s.section_name,
          ...s
        }));
        // ─── Add students to userMap ───────────────────────────────────
        state.students.forEach(student => {
          if (student.id && student.name) {
            state.userMap[student.id] = student.name;
          }
        });
        console.log('✅ Students loaded:', state.students.length);
      })
      .addCase(teacherThunks.fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch students';
        state.students = [];
      })
      
      .addCase(teacherThunks.fetchStudentDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchStudentDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { studentId, details } = action.payload;
        state.studentDetails[studentId] = details;
        // ─── Add student to userMap ───────────────────────────────────
        if (details.id && (details.name || details.user?.name)) {
          state.userMap[details.id] = details.name || details.user?.name || `Student ${details.id}`;
        }
      })
      .addCase(teacherThunks.fetchStudentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch student details';
      })

      // ─── Teachers (for user mapping) ────────────────────────────────────
      .addCase(teacherThunks.fetchAllTeachers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAllTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = extractArray(action.payload);
        // ─── Add teachers to userMap ───────────────────────────────────
        state.teachers.forEach(teacher => {
          const name = teacher.name || teacher.user?.name || null;
          if (teacher.id && name) {
            state.userMap[teacher.id] = name;
          }
        });
        console.log('✅ Teachers loaded:', state.teachers.length);
      })
      .addCase(teacherThunks.fetchAllTeachers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch teachers';
        state.teachers = [];
      })

      // ─── Parents (for user mapping) ────────────────────────────────────
      .addCase(teacherThunks.fetchAllParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAllParents.fulfilled, (state, action) => {
        state.loading = false;
        state.parents = extractArray(action.payload);
        // ─── Add parents to userMap ───────────────────────────────────
        state.parents.forEach(parent => {
          const name = parent.name || parent.user?.name || null;
          if (parent.id && name) {
            state.userMap[parent.id] = name;
          }
        });
        console.log('✅ Parents loaded:', state.parents.length);
      })
      .addCase(teacherThunks.fetchAllParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch parents';
        state.parents = [];
      })

      // ─── Timetable ─────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchTimetable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchTimetable.fulfilled, (state, action) => {
        state.loading = false;
        state.timetable = extractArray(action.payload).map(t => ({
          ...t,
          class_name: t.class_obj?.name || t.class_name || 'Class',
          subject_name: t.subject?.name || t.subject_name || 'Subject',
          teacher_name: t.teacher?.name || t.teacher_name || 'Teacher',
          room_name: t.room?.name || t.room_name || 'Room',
          section_name: t.section?.name || t.section_name || 'A',
        }));
        console.log('✅ Timetable loaded:', state.timetable.length);
      })
      .addCase(teacherThunks.fetchTimetable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch timetable';
        state.timetable = [];
      })

      // ─── Attendance ──────────────────────────────────────────────────
      .addCase(teacherThunks.fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const attendance = extractArray(action.payload);
        state.attendance = attendance.map(a => ({
          ...a,
          student_name: a.student_name || a.student?.name || 'Unknown',
          status: a.status || 'present'
        }));
        console.log('✅ Attendance loaded:', state.attendance.length);
      })
      .addCase(teacherThunks.fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch attendance';
        state.attendance = [];
      })
      
      // ─── Attendance Stats ────────────────────────────────────────────
      .addCase(teacherThunks.fetchAttendanceStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAttendanceStats.fulfilled, (state, action) => {
        state.loading = false;
        const stats = action.payload;
        if (stats) {
          const monthlyData = stats.monthly_data || [];
          const total = monthlyData.reduce((sum, d) => sum + (d.total || 0), 0);
          const present = monthlyData.reduce((sum, d) => sum + (d.present || 0), 0);
          
          state.attendanceStats = {
            present: stats.present || present || 0,
            absent: stats.absent || (total - present) || 0,
            late: stats.late || 0,
            leave: stats.leave || 0,
            total: stats.total || total || 0,
            percentage: stats.percentage || (total > 0 ? Math.round((present / total) * 100) : 0),
            monthly_data: monthlyData.length > 0 ? monthlyData : stats.monthly_data || [],
            total_days: stats.total_days || total || 0,
            present_days: stats.present_days || present || 0,
          };
        } else {
          const attendanceArray = Array.isArray(state.attendance) ? state.attendance : [];
          const total = attendanceArray.length;
          const present = attendanceArray.filter(a => a.status === 'present').length;
          const absent = attendanceArray.filter(a => a.status === 'absent').length;
          const late = attendanceArray.filter(a => a.status === 'late').length;
          const leave = attendanceArray.filter(a => a.status === 'leave').length;
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          
          state.attendanceStats = {
            present,
            absent,
            late,
            leave,
            total,
            percentage,
            monthly_data: [],
            total_days: total,
            present_days: present,
          };
        }
        console.log('✅ Attendance Stats:', state.attendanceStats);
      })
      .addCase(teacherThunks.fetchAttendanceStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch attendance stats';
      })
      
      .addCase(teacherThunks.markAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.markAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        state.attendance.push(action.payload);
        state.successMessage = 'Attendance marked successfully';
      })
      .addCase(teacherThunks.markAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to mark attendance';
      })
      
      .addCase(teacherThunks.updateAttendance.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateAttendance.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.attendance.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
        state.successMessage = 'Attendance updated successfully';
      })
      .addCase(teacherThunks.updateAttendance.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update attendance';
      })

      // ─── Behavior Logs ──────────────────────────────────────────────
      .addCase(teacherThunks.fetchBehaviorLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchBehaviorLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.behaviorLogs = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchBehaviorLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch behavior logs';
        state.behaviorLogs = [];
      })
      
      .addCase(teacherThunks.fetchBehaviorStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchBehaviorStats.fulfilled, (state, action) => {
        state.loading = false;
        const stats = action.payload || {};
        state.behaviorStats = {
          total: stats.total || 0,
          positive: stats.positive || 0,
          negative: stats.negative || 0,
          low: stats.low || 0,
          medium: stats.medium || 0,
          high: stats.high || 0,
        };
      })
      .addCase(teacherThunks.fetchBehaviorStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch behavior stats';
      })
      
      .addCase(teacherThunks.createBehaviorLog.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createBehaviorLog.fulfilled, (state, action) => {
        state.submitting = false;
        state.behaviorLogs.unshift(action.payload);
        state.successMessage = 'Behavior log created successfully';
      })
      .addCase(teacherThunks.createBehaviorLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create behavior log';
      })

      // ─── Update Behavior Log ─────────────────────────────────────────
      .addCase(teacherThunks.updateBehaviorLog.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateBehaviorLog.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.behaviorLogs.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.behaviorLogs[index] = action.payload;
        }
        state.successMessage = 'Behavior log updated successfully';
      })
      .addCase(teacherThunks.updateBehaviorLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update behavior log';
      })

      // ─── Delete Behavior Log ─────────────────────────────────────────
      .addCase(teacherThunks.deleteBehaviorLog.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteBehaviorLog.fulfilled, (state, action) => {
        state.submitting = false;
        state.behaviorLogs = state.behaviorLogs.filter(l => l.id !== action.payload);
        state.successMessage = 'Behavior log deleted successfully';
      })
      .addCase(teacherThunks.deleteBehaviorLog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete behavior log';
      })

      // ─── Assignments ─────────────────────────────────────────────────
      .addCase(teacherThunks.fetchAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = extractArray(action.payload).map(a => ({
          ...a,
          title: a.title || 'Untitled',
          status: a.status || 'active',
        }));
        console.log('✅ Assignments loaded:', state.assignments.length);
      })
      .addCase(teacherThunks.fetchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch assignments';
        state.assignments = [];
      })
      
      .addCase(teacherThunks.createAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        state.assignments.unshift(action.payload);
        state.successMessage = 'Assignment created successfully';
      })
      .addCase(teacherThunks.createAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create assignment';
      })
      
      .addCase(teacherThunks.updateAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.assignments.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
        state.successMessage = 'Assignment updated successfully';
      })
      .addCase(teacherThunks.updateAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update assignment';
      })
      
      .addCase(teacherThunks.deleteAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        state.assignments = state.assignments.filter(a => a.id !== action.payload);
        state.successMessage = 'Assignment deleted successfully';
      })
      .addCase(teacherThunks.deleteAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete assignment';
      })

      // ─── Submissions ──────────────────────────────────────────────────
      .addCase(teacherThunks.fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch submissions';
        state.submissions = [];
      })
      
      .addCase(teacherThunks.gradeSubmission.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.gradeSubmission.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.submissions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
        state.successMessage = 'Submission graded successfully';
      })
      .addCase(teacherThunks.gradeSubmission.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to grade submission';
      })

      // ─── Grades ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchTeacherGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchTeacherGrades.fulfilled, (state, action) => {
        state.loading = false;
        state.grades = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchTeacherGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch grades';
        state.grades = [];
      })
      
      .addCase(teacherThunks.saveTeacherGrades.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.saveTeacherGrades.fulfilled, (state) => {
        state.submitting = false;
        state.successMessage = 'Grades saved successfully';
      })
      .addCase(teacherThunks.saveTeacherGrades.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to save grades';
      })

      // ─── Exams ───────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.exams = extractArray(action.payload);
        console.log('✅ Exams loaded:', state.exams.length);
      })
      .addCase(teacherThunks.fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exams';
        state.exams = [];
      })
      
      .addCase(teacherThunks.createExam.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createExam.fulfilled, (state, action) => {
        state.submitting = false;
        state.exams.unshift(action.payload);
        state.successMessage = 'Exam created successfully';
      })
      .addCase(teacherThunks.createExam.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create exam';
      })
      
      .addCase(teacherThunks.updateExam.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateExam.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.exams.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.exams[index] = action.payload;
        }
        state.successMessage = 'Exam updated successfully';
      })
      .addCase(teacherThunks.updateExam.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update exam';
      })
      
      .addCase(teacherThunks.deleteExam.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteExam.fulfilled, (state, action) => {
        state.submitting = false;
        state.exams = state.exams.filter(e => e.id !== action.payload);
        state.successMessage = 'Exam deleted successfully';
      })
      .addCase(teacherThunks.deleteExam.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete exam';
      })

      // ─── Results ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch results';
        state.results = [];
      })
      
      .addCase(teacherThunks.createResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createResult.fulfilled, (state, action) => {
        state.submitting = false;
        state.results.push(action.payload);
        state.successMessage = 'Result created successfully';
      })
      .addCase(teacherThunks.createResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create result';
      })
      
      .addCase(teacherThunks.updateResult.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateResult.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.results.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.results[index] = action.payload;
        }
        state.successMessage = 'Result updated successfully';
      })
      .addCase(teacherThunks.updateResult.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update result';
      })

      // ─── Grade Scale ──────────────────────────────────────────────────
      .addCase(teacherThunks.fetchGradeScale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchGradeScale.fulfilled, (state, action) => {
        state.loading = false;
        state.gradeScale = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchGradeScale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch grade scale';
        state.gradeScale = [];
      })

      // ─── Questions ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch questions';
        state.questions = [];
      })
      
      .addCase(teacherThunks.createQuestion.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createQuestion.fulfilled, (state, action) => {
        state.submitting = false;
        state.questions.push(action.payload);
        state.successMessage = 'Question created successfully';
      })
      .addCase(teacherThunks.createQuestion.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create question';
      })
      
      .addCase(teacherThunks.updateQuestion.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateQuestion.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.questions.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
        state.successMessage = 'Question updated successfully';
      })
      .addCase(teacherThunks.updateQuestion.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update question';
      })
      
      .addCase(teacherThunks.deleteQuestion.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteQuestion.fulfilled, (state, action) => {
        state.submitting = false;
        state.questions = state.questions.filter(q => q.id !== action.payload);
        state.successMessage = 'Question deleted successfully';
      })
      .addCase(teacherThunks.deleteQuestion.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete question';
      })

      // ─── Student Answers ──────────────────────────────────────────────
      .addCase(teacherThunks.fetchStudentAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchStudentAnswers.fulfilled, (state, action) => {
        state.loading = false;
        state.studentAnswers = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchStudentAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch student answers';
        state.studentAnswers = [];
      })
      
      .addCase(teacherThunks.createStudentAnswer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createStudentAnswer.fulfilled, (state, action) => {
        state.submitting = false;
        state.studentAnswers.push(action.payload);
        state.successMessage = 'Student answer created successfully';
      })
      .addCase(teacherThunks.createStudentAnswer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create student answer';
      })
      
      .addCase(teacherThunks.updateStudentAnswer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateStudentAnswer.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.studentAnswers.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.studentAnswers[index] = action.payload;
        }
        state.successMessage = 'Student answer updated successfully';
      })
      .addCase(teacherThunks.updateStudentAnswer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update student answer';
      })
      
      .addCase(teacherThunks.deleteStudentAnswer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteStudentAnswer.fulfilled, (state, action) => {
        state.submitting = false;
        state.studentAnswers = state.studentAnswers.filter(a => a.id !== action.payload);
        state.successMessage = 'Student answer deleted successfully';
      })
      .addCase(teacherThunks.deleteStudentAnswer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete student answer';
      })

      // ─── AI Auto Checking ─────────────────────────────────────────────
      .addCase(teacherThunks.fetchAIAutoChecking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchAIAutoChecking.fulfilled, (state, action) => {
        state.loading = false;
        state.aiAutoChecking = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchAIAutoChecking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch AI auto checking';
        state.aiAutoChecking = [];
      })
      
      .addCase(teacherThunks.createAIAutoChecking.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createAIAutoChecking.fulfilled, (state, action) => {
        state.submitting = false;
        state.aiAutoChecking.push(action.payload);
        state.successMessage = 'AI auto checking created successfully';
      })
      .addCase(teacherThunks.createAIAutoChecking.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to create AI auto checking';
      })
      
      .addCase(teacherThunks.updateAIAutoChecking.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateAIAutoChecking.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.aiAutoChecking.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.aiAutoChecking[index] = action.payload;
        }
        state.successMessage = 'AI auto checking updated successfully';
      })
      .addCase(teacherThunks.updateAIAutoChecking.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update AI auto checking';
      })
      
      .addCase(teacherThunks.deleteAIAutoChecking.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteAIAutoChecking.fulfilled, (state, action) => {
        state.submitting = false;
        state.aiAutoChecking = state.aiAutoChecking.filter(a => a.id !== action.payload);
        state.successMessage = 'AI auto checking deleted successfully';
      })
      .addCase(teacherThunks.deleteAIAutoChecking.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete AI auto checking';
      })

      // ─── PTM ──────────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchPTM.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchPTM.fulfilled, (state, action) => {
        state.loading = false;
        state.ptm = extractArray(action.payload);
        console.log('✅ PTM loaded:', state.ptm.length);
      })
      .addCase(teacherThunks.fetchPTM.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch PTM';
        state.ptm = [];
      })
      
      .addCase(teacherThunks.fetchPTMMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchPTMMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.ptmMeetings = extractArray(action.payload);
        console.log('✅ PTM Meetings loaded:', state.ptmMeetings.length);
      })
      .addCase(teacherThunks.fetchPTMMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch PTM meetings';
        state.ptmMeetings = [];
      })
      
      .addCase(teacherThunks.fetchPTMAttendees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchPTMAttendees.fulfilled, (state, action) => {
        state.loading = false;
        state.ptmAttendees = extractArray(action.payload);
        console.log('✅ PTM Attendees loaded:', state.ptmAttendees.length);
      })
      .addCase(teacherThunks.fetchPTMAttendees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch PTM attendees';
        state.ptmAttendees = [];
      })
      
      .addCase(teacherThunks.updatePTMMeeting.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updatePTMMeeting.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.ptmMeetings.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.ptmMeetings[index] = action.payload;
        }
        state.successMessage = 'PTM meeting updated successfully';
      })
      .addCase(teacherThunks.updatePTMMeeting.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update PTM meeting';
      })

      // ─── Messages ─────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchMessages.fulfilled, (state, action) => {
  state.loading = false;
  const messages = extractArray(action.payload);
  state.messages = messages.map(m => ({
    ...m,
    // If backend provides sender_name/receiver_name, use them
    // Otherwise, try to get from userMap or fallback
    sender_name: m.sender_name || m.sender_name_from_backend || null,
    receiver_name: m.receiver_name || m.receiver_name_from_backend || null,
    is_read: m.is_read || false,
  }));
  console.log('✅ Messages loaded:', state.messages.length);
  // Log sample message to see what fields we have
  if (state.messages.length > 0) {
    console.log('📋 Sample message fields:', Object.keys(state.messages[0]));
  }
})
      .addCase(teacherThunks.fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch messages';
        state.messages = [];
      })
      
      .addCase(teacherThunks.sendMessage.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.sendMessage.fulfilled, (state, action) => {
        state.submitting = false;
        state.messages.unshift(action.payload);
        state.successMessage = 'Message sent successfully';
      })
      .addCase(teacherThunks.sendMessage.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to send message';
      })
      
      .addCase(teacherThunks.updateMessage.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateMessage.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        state.successMessage = 'Message updated successfully';
      })
      .addCase(teacherThunks.updateMessage.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update message';
      })
      
      .addCase(teacherThunks.deleteMessage.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.deleteMessage.fulfilled, (state, action) => {
        state.submitting = false;
        state.messages = state.messages.filter(m => m.id !== action.payload);
        state.successMessage = 'Message deleted successfully';
      })
      .addCase(teacherThunks.deleteMessage.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to delete message';
      })

      // ─── Notifications ─────────────────────────────────────────────────
      .addCase(teacherThunks.fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const notifications = extractArray(action.payload);
        state.notifications = notifications.map(n => ({
          ...n,
          is_read: n.is_read || false,
        }));
        state.unreadCount = notifications.filter(n => !n.is_read).length;
        console.log('✅ Notifications loaded:', state.notifications.length, 'Unread:', state.unreadCount);
      })
      .addCase(teacherThunks.fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
        state.notifications = [];
        state.unreadCount = 0;
      })
      
      .addCase(teacherThunks.markNotificationRead.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.markNotificationRead.fulfilled, (state, action) => {
        state.submitting = false;
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.successMessage = 'Notification marked as read';
      })
      .addCase(teacherThunks.markNotificationRead.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to mark notification as read';
      })
      
      .addCase(teacherThunks.markAllNotificationsRead.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.markAllNotificationsRead.fulfilled, (state) => {
        state.submitting = false;
        state.notifications = state.notifications.map(n => ({ ...n, is_read: true }));
        state.unreadCount = 0;
        state.successMessage = 'All notifications marked as read';
      })
      .addCase(teacherThunks.markAllNotificationsRead.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      })

      // ─── Events ──────────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch events';
        state.events = [];
      })
      
      .addCase(teacherThunks.fetchEventParticipations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchEventParticipations.fulfilled, (state, action) => {
        state.loading = false;
        state.eventParticipations = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchEventParticipations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch event participations';
        state.eventParticipations = [];
      })
      
      .addCase(teacherThunks.createEventParticipation.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createEventParticipation.fulfilled, (state, action) => {
        state.submitting = false;
        state.eventParticipations.push(action.payload);
        state.successMessage = 'Registered for event successfully';
      })
      .addCase(teacherThunks.createEventParticipation.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to register for event';
      })

      // ─── Complaints ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchComplaints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchComplaints.fulfilled, (state, action) => {
        state.loading = false;
        state.complaints = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchComplaints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch complaints';
        state.complaints = [];
      })
      
      .addCase(teacherThunks.createComplaint.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createComplaint.fulfilled, (state, action) => {
        state.submitting = false;
        state.complaints.unshift(action.payload);
        state.successMessage = 'Complaint submitted successfully';
      })
      .addCase(teacherThunks.createComplaint.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to submit complaint';
      })
      
      .addCase(teacherThunks.updateComplaint.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.updateComplaint.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.complaints.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.complaints[index] = action.payload;
        }
        state.successMessage = 'Complaint updated successfully';
      })
      .addCase(teacherThunks.updateComplaint.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to update complaint';
      })

      // ─── HR: Leaves ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaves';
        state.leaves = [];
      })
      
      .addCase(teacherThunks.createLeave.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(teacherThunks.createLeave.fulfilled, (state, action) => {
        state.submitting = false;
        state.leaves.unshift(action.payload);
        state.successMessage = 'Leave request submitted successfully';
      })
      .addCase(teacherThunks.createLeave.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Failed to submit leave request';
      })

      // ─── HR: Payroll ──────────────────────────────────────────────────────
      .addCase(teacherThunks.fetchPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payroll = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch payroll';
        state.payroll = [];
      })
      
      
      .addCase(teacherThunks.fetchSalaryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchSalaryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.salaryHistory = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchSalaryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch salary history';
        state.salaryHistory = [];
      })
      .addCase(teacherThunks.fetchPayrollSummary.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(teacherThunks.fetchPayrollSummary.fulfilled, (state, action) => {
  state.loading = false;
  state.payrollSummary = action.payload || state.payrollSummary;
})
.addCase(teacherThunks.fetchPayrollSummary.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || 'Failed to fetch payroll summary';
  // Keep existing summary data
})

      // ─── Analytics: Predictions ──────────────────────────────────────────
      .addCase(teacherThunks.fetchPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch predictions';
        state.predictions = [];
      })

      // ─── Analytics: Recommendations ──────────────────────────────────────
      .addCase(teacherThunks.fetchRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch recommendations';
        state.recommendations = [];
      })

      // ─── Analytics: Student Goals ──────────────────────────────────────────
      .addCase(teacherThunks.fetchStudentGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchStudentGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.studentGoals = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchStudentGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch student goals';
        state.studentGoals = [];
      })

      // ─── Analytics: Student Skills ──────────────────────────────────────────
      .addCase(teacherThunks.fetchStudentSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(teacherThunks.fetchStudentSkills.fulfilled, (state, action) => {
        state.loading = false;
        state.studentSkills = extractArray(action.payload);
      })
      .addCase(teacherThunks.fetchStudentSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch student skills';
        state.studentSkills = [];
      });
  },
});

// ─── Export Actions ──────────────────────────────────────────────────────

export const {
  // Profile
  setProfile,
  updateProfileLocal,
  
  // Settings
  updateSettings,
  
  // Students
  setStudentDetails,
  
  // Attendance
  setAttendanceStats,
  
  // Behavior Logs
  setBehaviorStats,
  
  // Assignments
  addAssignmentLocal,
  updateAssignmentLocal,
  deleteAssignmentLocal,
  
  // Submissions
  updateSubmissionLocal,
  
  // Exams
  addExamLocal,
  updateExamLocal,
  deleteExamLocal,
  
  // Results
  addResultLocal,
  updateResultLocal,
  
  // Questions
  addQuestionLocal,
  updateQuestionLocal,
  deleteQuestionLocal,
  
  // Student Answers
  addStudentAnswerLocal,
  updateStudentAnswerLocal,
  deleteStudentAnswerLocal,
  
  // AI Auto Checking
  addAIAutoCheckingLocal,
  updateAIAutoCheckingLocal,
  deleteAIAutoCheckingLocal,
  
  // Messages
  addMessageLocal,
  updateMessageLocal,
  deleteMessageLocal,
  markMessageReadLocal,
  
  // Notifications
  markNotificationReadLocal,
  markAllNotificationsReadLocal,
  
  // Complaints
  addComplaintLocal,
  updateComplaintLocal,
  
  // Events
  addEventParticipationLocal,
  
  // PTM
  updatePTMMeetingLocal,
  
  // HR
  addLeaveLocal,
  updateLeaveLocal,
  
  // User Map
  addToUserMap,
  updateUserMap,
  
  // Error & Success
  clearTeacherError,
  clearTeacherSuccess,
  clearTeacherState,
} = teacherSlice.actions;

// ─── Export Selectors ──────────────────────────────────────────────────────

// Profile Selectors
export const selectTeacherProfile = (state) => state.teacher?.profile || null;
export const selectTeacherLoading = (state) => state.teacher?.loading || false;
export const selectTeacherSubmitting = (state) => state.teacher?.submitting || false;
export const selectTeacherError = (state) => state.teacher?.error || null;
export const selectTeacherSuccessMessage = (state) => state.teacher?.successMessage || null;

// Dashboard Selectors
export const selectTeacherDashboard = (state) => state.teacher?.dashboard || {};
export const selectTeacherDashboardSummary = (state) => state.teacher?.dashboard?.summary || {};

// Academics Selectors
export const selectTeacherClasses = (state) => state.teacher?.classes || [];
export const selectTeacherSections = (state) => state.teacher?.sections || [];
export const selectTeacherSubjects = (state) => state.teacher?.subjects || [];
export const selectTeacherRooms = (state) => state.teacher?.rooms || [];
export const selectTeacherClassSubjects = (state) => state.teacher?.classSubjects || [];
export const selectTeacherTimetable = (state) => state.teacher?.timetable || [];

// Students Selectors
export const selectTeacherStudents = (state) => state.teacher?.students || [];
export const selectTeacherStudentDetails = (state) => state.teacher?.studentDetails || {};
export const selectTeacherStudentById = (state, studentId) => state.teacher?.studentDetails?.[studentId] || null;

// ─── NEW: User Mapping Selectors ──────────────────────────────────────────
export const selectAllTeachers = (state) => state.teacher?.teachers || [];
export const selectAllParents = (state) => state.teacher?.parents || [];
export const selectUserMap = (state) => state.teacher?.userMap || {};

// Attendance Selectors
export const selectTeacherAttendance = (state) => state.teacher?.attendance || [];
export const selectTeacherAttendanceStats = (state) => state.teacher?.attendanceStats || {};

// Behavior Logs Selectors
export const selectTeacherBehaviorLogs = (state) => state.teacher?.behaviorLogs || [];
export const selectTeacherBehaviorStats = (state) => state.teacher?.behaviorStats || {};

// Assignments Selectors
export const selectTeacherAssignments = (state) => state.teacher?.assignments || [];
export const selectTeacherSubmissions = (state) => state.teacher?.submissions || [];

// Exams Selectors
export const selectTeacherExams = (state) => state.teacher?.exams || [];
export const selectTeacherResults = (state) => state.teacher?.results || [];
export const selectTeacherGradeScale = (state) => state.teacher?.gradeScale || [];
export const selectTeacherQuestions = (state) => state.teacher?.questions || [];
export const selectTeacherStudentAnswers = (state) => state.teacher?.studentAnswers || [];
export const selectTeacherAIAutoChecking = (state) => state.teacher?.aiAutoChecking || [];

// Grades Selectors
export const selectTeacherGrades = (state) => state.teacher?.grades || [];

// PTM Selectors
export const selectTeacherPTM = (state) => state.teacher?.ptm || [];
export const selectTeacherPTMMeetings = (state) => state.teacher?.ptmMeetings || [];
export const selectTeacherPTMAttendees = (state) => state.teacher?.ptmAttendees || [];

// Communication Selectors
export const selectTeacherMessages = (state) => state.teacher?.messages || [];
export const selectTeacherNotifications = (state) => state.teacher?.notifications || [];
export const selectTeacherUnreadCount = (state) => state.teacher?.unreadCount || 0;

// Events Selectors
export const selectTeacherEvents = (state) => state.teacher?.events || [];
export const selectTeacherEventParticipations = (state) => state.teacher?.eventParticipations || [];

// Complaints Selectors
export const selectTeacherComplaints = (state) => state.teacher?.complaints || [];

// Settings Selectors
export const selectTeacherSettings = (state) => state.teacher?.settings || {};

// HR Selectors
export const selectTeacherLeaves = (state) => state.teacher?.leaves || [];
export const selectTeacherPayroll = (state) => state.teacher?.payroll || [];
export const selectTeacherSalaryHistory = (state) => state.teacher?.salaryHistory || [];
export const selectTeacherPayrollSummary = (state) => state.teacher?.payrollSummary || {};


// Analytics Selectors
export const selectTeacherPredictions = (state) => state.teacher?.predictions || [];
export const selectTeacherRecommendations = (state) => state.teacher?.recommendations || [];
export const selectTeacherStudentGoals = (state) => state.teacher?.studentGoals || [];
export const selectTeacherStudentSkills = (state) => state.teacher?.studentSkills || [];

// ─── Export Reducer ──────────────────────────────────────────────────────

export default teacherSlice.reducer;