// src/modules/parent/store/parentThunks.js

/**
 * ============================================
 * PARENT THUNKS - COMPLETE
 * ============================================
 * 
 * Purpose: Async thunks for parent API calls
 * Used by: parentSlice
 * 
 * USAGE OF NEW API FIELDS:
 * - user_name from parent profile (read-only)
 * - student_name from parent links (read-only)
 * - class_name from student data (read-only)
 * - teacher_name from behavior logs (read-only)
 * - sender_name from notifications (read-only)
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import { createAsyncThunk } from "@reduxjs/toolkit";
import parentService from "../services/parentService";

// ─── Helper: Extract data safely ─────────────────────────────────────────────────────

const extractData = (response) => {
  return response.data?.results || response.data || [];
};

const extractSingle = (response) => {
  return response.data || response;
};

// ─── Profile ──────────────────────────────────────────────────────────────────────

export const fetchProfile = createAsyncThunk(
  "parent/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.getProfile();
      const data = extractSingle(response);
      
      // Debug: Check for new API fields
      console.log("📊 Parent Profile fields:", Object.keys(data));
      console.log("📊 user_name:", data.user_name);
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "parent/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      // ⚠️ DO NOT send read-only fields like user_name, user, etc.
      const cleanData = { ...data };
      delete cleanData.user_name;
      delete cleanData.user;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      
      const response = await parentService.updateProfile(cleanData);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update profile"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "parent/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await parentService.changePassword(data);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to change password"
      );
    }
  }
);

export const logoutAll = createAsyncThunk(
  "parent/logoutAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.logoutAll();
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to logout all devices"
      );
    }
  }
);

// ─── Parent Links ──────────────────────────────────────────────────────────────────

export const fetchParentLinks = createAsyncThunk(
  "parent/fetchParentLinks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.getParentLinks();
      const data = extractData(response);
      
      // Debug: Check for new API fields
      if (data.length > 0) {
        console.log("📊 Parent Link fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch parent links"
      );
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  "parent/fetchStudentById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await parentService.getStudentById(id);
      const data = extractSingle(response);
      
      // Debug: Check for new API fields
      console.log("📊 Student fields:", Object.keys(data));
      console.log("📊 user_name:", data.user_name);
      console.log("📊 class_name:", data.class_name);
      console.log("📊 parent_name:", data.parent_name);
      
      return { studentId: id, data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch student"
      );
    }
  }
);

// ─── Academics ──────────────────────────────────────────────────────────────────────

export const fetchClasses = createAsyncThunk(
  "parent/fetchClasses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getClasses(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch classes"
      );
    }
  }
);

export const fetchSections = createAsyncThunk(
  "parent/fetchSections",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getSections(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch sections"
      );
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  "parent/fetchSubjects",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getSubjects(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch subjects"
      );
    }
  }
);

export const fetchClassSubjects = createAsyncThunk(
  "parent/fetchClassSubjects",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getClassSubjects(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Class Subject fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
        console.log("📊 subject_name:", data[0].subject_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch class subjects"
      );
    }
  }
);

export const fetchTimetable = createAsyncThunk(
  "parent/fetchTimetable",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getTimetable(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Timetable fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
        console.log("📊 section_name:", data[0].section_name);
        console.log("📊 subject_name:", data[0].subject_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
        console.log("📊 room_name:", data[0].room_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch timetable"
      );
    }
  }
);

export const fetchRooms = createAsyncThunk(
  "parent/fetchRooms",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getRooms(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch rooms"
      );
    }
  }
);

// ─── Attendance ────────────────────────────────────────────────────────────────────

export const fetchAttendance = createAsyncThunk(
  "parent/fetchAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getAttendance(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Attendance fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
        console.log("📊 marked_by_name:", data[0].marked_by_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch attendance"
      );
    }
  }
);

// ✅ FIX: Export fetchAttendanceStats
export const fetchAttendanceStats = createAsyncThunk(
  "parent/fetchAttendanceStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getAttendance(params);
      const data = extractData(response);
      
      // Calculate stats from attendance data
      const total = data.length;
      const present = data.filter(a => a.status === "present" || a.status === "Present").length;
      const absent = data.filter(a => a.status === "absent" || a.status === "Absent").length;
      const late = data.filter(a => a.status === "late" || a.status === "Late").length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      
      const stats = {
        total,
        present,
        absent,
        late,
        percentage,
        present_days: present,
        total_days: total,
      };
      
      console.log("📊 Attendance Stats:", stats);
      
      return stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch attendance stats"
      );
    }
  }
);

export const fetchBehaviorLogs = createAsyncThunk(
  "parent/fetchBehaviorLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBehaviorLogs(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Behavior Log fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch behavior logs"
      );
    }
  }
);

// ✅ ADD THIS - fetchBehaviorStats
export const fetchBehaviorStats = createAsyncThunk(
  "parent/fetchBehaviorStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBehaviorLogs(params);
      const data = extractData(response);
      
      // Calculate stats from behavior logs
      const total = data.length;
      const positive = data.filter(l => l.type === "positive" || l.type === "Positive").length;
      const negative = data.filter(l => l.type === "negative" || l.type === "Negative").length;
      const neutral = data.filter(l => l.type === "neutral" || l.type === "Neutral").length;
      const low = data.filter(l => l.severity === "low" || l.severity === "Low").length;
      const medium = data.filter(l => l.severity === "medium" || l.severity === "Medium").length;
      const high = data.filter(l => l.severity === "high" || l.severity === "High").length;
      
      const stats = {
        total,
        positive,
        negative,
        neutral,
        low,
        medium,
        high,
      };
      
      console.log("📊 Behavior Stats:", stats);
      
      return stats;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch behavior stats"
      );
    }
  }
);

// ─── Exams ─────────────────────────────────────────────────────────────────────────

export const fetchExams = createAsyncThunk(
  "parent/fetchExams",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getExams(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Exam fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
        console.log("📊 subject_name:", data[0].subject_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch exams"
      );
    }
  }
);

// ✅ fetchResults - Main export
export const fetchResults = createAsyncThunk(
  "parent/fetchResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getResults(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Result fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 exam_name:", data[0].exam_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch results"
      );
    }
  }
);
export const fetchComplaints = createAsyncThunk(
  "parent/fetchComplaints",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getComplaints(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch complaints"
      );
    }
  }
);

// ✅ ADD THIS - createComplaint
export const createComplaint = createAsyncThunk(
  "parent/createComplaint",
  async (data, { rejectWithValue }) => {
    try {
      // ⚠️ DO NOT send read-only fields
      const cleanData = { ...data };
      delete cleanData.created_at;
      delete cleanData.updated_at;
      delete cleanData.id;
      
      const response = await parentService.createComplaint(cleanData);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create complaint"
      );
    }
  }
);
// ✅ ADD THIS - fetchGrades alias for backward compatibility
export const fetchGrades = fetchResults;

export const fetchGradeScale = createAsyncThunk(
  "parent/fetchGradeScale",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getGradeScale(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch grade scale"
      );
    }
  }
);

// ✅ fetchGradeSummary - Main export
export const fetchGradeSummary = createAsyncThunk(
  "parent/fetchGradeSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getResults(params);
      const data = extractData(response);
      
      // Calculate grade summary
      const subjects = data.map(r => ({
        name: r.exam?.name || r.exam_name || "Exam",
        marks: r.marks_obtained || 0,
        total_marks: r.exam?.total_marks || 100,
        grade: r.grade || "N/A",
      }));
      
      const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
      const totalPossible = subjects.reduce((sum, s) => sum + s.total_marks, 0);
      const average = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0;
      
      const summary = {
        average,
        highest: Math.max(...subjects.map(s => s.marks), 0),
        lowest: Math.min(...subjects.map(s => s.marks), 0),
        total: subjects.length,
        subjects: subjects,
        percentage: average,
      };
      
      console.log("📊 Grade Summary:", summary);
      
      return summary;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch grade summary"
      );
    }
  }
);

// ─── Assignments ──────────────────────────────────────────────────────────────────

export const fetchAssignments = createAsyncThunk(
  "parent/fetchAssignments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getAssignments(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Assignment fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
        console.log("📊 subject_name:", data[0].subject_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch assignments"
      );
    }
  }
);

export const fetchSubmissions = createAsyncThunk(
  "parent/fetchSubmissions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getSubmissions(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Submission fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 assignment_title:", data[0].assignment_title);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch submissions"
      );
    }
  }
);

// ─── Finance ─────────────────────────────────────────────────────────────────────────

export const fetchFeeStructures = createAsyncThunk(
  "parent/fetchFeeStructures",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getFeeStructures(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Fee Structure fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fee structures"
      );
    }
  }
);

export const fetchFees = createAsyncThunk(
  "parent/fetchFees",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getFees(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Fee fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 fee_structure_title:", data[0].fee_structure_title);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fees"
      );
    }
  }
);

// ✅ FIX: Export fetchFeeSummary
export const fetchFeeSummary = createAsyncThunk(
  "parent/fetchFeeSummary",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getFees(params);
      const data = extractData(response);
      
      const total = data.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const paid = data.filter(f => f.status === "paid" || f.status === "Paid")
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const pending = data.filter(f => f.status === "pending" || f.status === "Pending")
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const overdue = data.filter(f => f.status === "overdue" || f.status === "Overdue")
        .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      
      const summary = {
        total,
        paid,
        pending,
        overdue,
        percentage: total > 0 ? Math.round((paid / total) * 100) : 0,
      };
      
      console.log("📊 Fee Summary:", summary);
      
      return summary;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fee summary"
      );
    }
  }
);

export const fetchPayments = createAsyncThunk(
  "parent/fetchPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getPayments(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Payment fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 fee_title:", data[0].fee_title);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch payments"
      );
    }
  }
);

export const fetchFeeHistory = createAsyncThunk(
  "parent/fetchFeeHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getFeeHistory(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Fee History fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 changed_by_name:", data[0].changed_by_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch fee history"
      );
    }
  }
);

// ─── Communication ──────────────────────────────────────────────────────────────────

export const fetchMessages = createAsyncThunk(
  "parent/fetchMessages",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getMessages(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Message fields:", Object.keys(data[0]));
        console.log("📊 sender_name:", data[0].sender_name);
        console.log("📊 receiver_name:", data[0].receiver_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "parent/sendMessage",
  async (data, { rejectWithValue }) => {
    try {
      // ⚠️ DO NOT send read-only fields like sender_name, receiver_name
      const cleanData = { ...data };
      delete cleanData.sender_name;
      delete cleanData.receiver_name;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      
      const response = await parentService.sendMessage(cleanData);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to send message"
      );
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  "parent/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getNotifications(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Notification fields:", Object.keys(data[0]));
        console.log("📊 user_name:", data[0].user_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch notifications"
      );
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "parent/markNotificationAsRead",
  async (id, { rejectWithValue }) => {
    try {
      await parentService.markNotificationAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "parent/markAllNotificationsAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.markAllNotificationsAsRead();
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to mark all as read"
      );
    }
  }
);

// ─── PTM ────────────────────────────────────────────────────────────────────────────

export const fetchPTM = createAsyncThunk(
  "parent/fetchPTM",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getPTM(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 PTM fields:", Object.keys(data[0]));
        console.log("📊 class_name:", data[0].class_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch PTM"
      );
    }
  }
);

export const fetchPTMMeetings = createAsyncThunk(
  "parent/fetchPTMMeetings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getPTMMeetings(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 PTM Meeting fields:", Object.keys(data[0]));
        console.log("📊 ptm_name:", data[0].ptm_name);
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 teacher_name:", data[0].teacher_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch PTM meetings"
      );
    }
  }
);

export const fetchPTMAttendees = createAsyncThunk(
  "parent/fetchPTMAttendees",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getPTMAttendees(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 PTM Attendee fields:", Object.keys(data[0]));
        console.log("📊 parent_name:", data[0].parent_name);
        console.log("📊 meeting_label:", data[0].meeting_label);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch PTM attendees"
      );
    }
  }
);

export const updatePTMAttendee = createAsyncThunk(
  "parent/updatePTMAttendee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // ⚠️ DO NOT send read-only fields like parent_name, meeting_label
      const cleanData = { ...data };
      delete cleanData.parent_name;
      delete cleanData.meeting_label;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      
      const response = await parentService.updatePTMAttendee(id, cleanData);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update PTM attendee"
      );
    }
  }
);

// ─── Transport ──────────────────────────────────────────────────────────────────────

export const fetchBuses = createAsyncThunk(
  "parent/fetchBuses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBuses(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Bus fields:", Object.keys(data[0]));
        console.log("📊 bus_number:", data[0].bus_number);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch buses"
      );
    }
  }
);

export const fetchRoutes = createAsyncThunk(
  "parent/fetchRoutes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getRoutes(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch routes"
      );
    }
  }
);

export const fetchBusStops = createAsyncThunk(
  "parent/fetchBusStops",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBusStops(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Bus Stop fields:", Object.keys(data[0]));
        console.log("📊 route_name:", data[0].route_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch bus stops"
      );
    }
  }
);

export const fetchBusStudents = createAsyncThunk(
  "parent/fetchBusStudents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBusStudents(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Bus Student fields:", Object.keys(data[0]));
        console.log("📊 bus_number:", data[0].bus_number);
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 pickup_stop_name:", data[0].pickup_stop_name);
        console.log("📊 drop_stop_name:", data[0].drop_stop_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch bus students"
      );
    }
  }
);

export const fetchTransportAttendance = createAsyncThunk(
  "parent/fetchTransportAttendance",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getTransportAttendance(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Transport Attendance fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 bus_number:", data[0].bus_number);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch transport attendance"
      );
    }
  }
);

// ─── Library ────────────────────────────────────────────────────────────────────────

export const fetchBooks = createAsyncThunk(
  "parent/fetchBooks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBooks(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Book fields:", Object.keys(data[0]));
        console.log("📊 category_name:", data[0].category_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch books"
      );
    }
  }
);

export const fetchBookIssues = createAsyncThunk(
  "parent/fetchBookIssues",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBookIssues(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Book Issue fields:", Object.keys(data[0]));
        console.log("📊 book_title:", data[0].book_title);
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch book issues"
      );
    }
  }
);

export const fetchBookIssueHistory = createAsyncThunk(
  "parent/fetchBookIssueHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getBookIssueHistory(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Book Issue History fields:", Object.keys(data[0]));
        console.log("📊 book_title:", data[0].book_title);
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 changed_by_name:", data[0].changed_by_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch book issue history"
      );
    }
  }
);

// ─── Canteen ────────────────────────────────────────────────────────────────────────

export const fetchCategories = createAsyncThunk(
  "parent/fetchCategories",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getCategories(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchMenuItems = createAsyncThunk(
  "parent/fetchMenuItems",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getMenuItems(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Menu Item fields:", Object.keys(data[0]));
        console.log("📊 category_name:", data[0].category_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch menu items"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "parent/fetchOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getOrders(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Order fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 item_name:", data[0].item_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch orders"
      );
    }
  }
);

// ─── Security ───────────────────────────────────────────────────────────────────────

export const fetchVisitors = createAsyncThunk(
  "parent/fetchVisitors",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getVisitors(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Visitor fields:", Object.keys(data[0]));
        console.log("📊 approved_by_name:", data[0].approved_by_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch visitors"
      );
    }
  }
);

export const fetchAccessLogs = createAsyncThunk(
  "parent/fetchAccessLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getAccessLogs(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Access Log fields:", Object.keys(data[0]));
        console.log("📊 user_name:", data[0].user_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch access logs"
      );
    }
  }
);

export const fetchEntryExitLogs = createAsyncThunk(
  "parent/fetchEntryExitLogs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getEntryExitLogs(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Entry/Exit Log fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch entry/exit logs"
      );
    }
  }
);

// ─── Events ─────────────────────────────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  "parent/fetchEvents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getEvents(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Event fields:", Object.keys(data[0]));
        console.log("📊 organizer_name:", data[0].organizer_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch events"
      );
    }
  }
);

export const fetchEventParticipations = createAsyncThunk(
  "parent/fetchEventParticipations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getEventParticipations(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Event Participation fields:", Object.keys(data[0]));
        console.log("📊 event_name:", data[0].event_name);
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch event participations"
      );
    }
  }
);

export const createEventParticipation = createAsyncThunk(
  "parent/createEventParticipation",
  async (data, { rejectWithValue }) => {
    try {
      // ⚠️ DO NOT send read-only fields
      const cleanData = { ...data };
      delete cleanData.event_name;
      delete cleanData.student_name;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      
      const response = await parentService.createEventParticipation(cleanData);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create event participation"
      );
    }
  }
);

// ─── Documents ──────────────────────────────────────────────────────────────────────

export const fetchDocuments = createAsyncThunk(
  "parent/fetchDocuments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getDocuments(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Document fields:", Object.keys(data[0]));
        console.log("📊 user_name:", data[0].user_name);
        console.log("📊 doc_type_name:", data[0].doc_type_name);
        console.log("📊 uploaded_by_name:", data[0].uploaded_by_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch documents"
      );
    }
  }
);

export const fetchDocumentTypes = createAsyncThunk(
  "parent/fetchDocumentTypes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getDocumentTypes(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch document types"
      );
    }
  }
);

// ─── Analytics ───────────────────────────────────────────────────────────────────────

export const fetchPredictions = createAsyncThunk(
  "parent/fetchPredictions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getPredictions(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Prediction fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch predictions"
      );
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  "parent/fetchRecommendations",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getRecommendations(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Recommendation fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch recommendations"
      );
    }
  }
);

export const fetchStudentGoals = createAsyncThunk(
  "parent/fetchStudentGoals",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getStudentGoals(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Student Goal fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch student goals"
      );
    }
  }
);

export const fetchStudentSkills = createAsyncThunk(
  "parent/fetchStudentSkills",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getStudentSkills(params);
      const data = extractData(response);
      
      if (data.length > 0) {
        console.log("📊 Student Skill fields:", Object.keys(data[0]));
        console.log("📊 student_name:", data[0].student_name);
        console.log("📊 skill_name:", data[0].skill_name);
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch student skills"
      );
    }
  }
);

export const fetchSkillMapping = createAsyncThunk(
  "parent/fetchSkillMapping",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getSkillMapping(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch skill mapping"
      );
    }
  }
);

export const fetchParentEngagement = createAsyncThunk(
  "parent/fetchParentEngagement",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getParentEngagement(params);
      const data = extractSingle(response);
      
      console.log("📊 Parent Engagement fields:", Object.keys(data));
      console.log("📊 parent_name:", data.parent_name);
      
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch parent engagement"
      );
    }
  }
);

// ─── Chat ───────────────────────────────────────────────────────────────────────────

export const fetchChatSessions = createAsyncThunk(
  "parent/fetchChatSessions",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await parentService.getChatSessions(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch chat sessions"
      );
    }
  }
);

export const createChatSession = createAsyncThunk(
  "parent/createChatSession",
  async (data, { rejectWithValue }) => {
    try {
      const response = await parentService.createChatSession(data);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create chat session"
      );
    }
  }
);

export const updateChatSession = createAsyncThunk(
  "parent/updateChatSession",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await parentService.updateChatSession(id, data);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update chat session"
      );
    }
  }
);

export const deleteChatSession = createAsyncThunk(
  "parent/deleteChatSession",
  async (id, { rejectWithValue }) => {
    try {
      await parentService.deleteChatSession(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete chat session"
      );
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  "parent/fetchChatMessages",
  async (params, { rejectWithValue }) => {
    try {
      const response = await parentService.getChatMessages(params);
      return extractData(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch chat messages"
      );
    }
  }
);

export const createChatMessage = createAsyncThunk(
  "parent/createChatMessage",
  async (data, { rejectWithValue }) => {
    try {
      const response = await parentService.createChatMessage(data);
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create chat message"
      );
    }
  }
);

// ─── Dashboard ──────────────────────────────────────────────────────────────────────

export const fetchParentDashboard = createAsyncThunk(
  "parent/fetchParentDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await parentService.getDashboard();
      return extractSingle(response);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch dashboard"
      );
    }
  }
);