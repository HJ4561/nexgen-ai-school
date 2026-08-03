// src/modules/admin/store/adminThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "../services/adminService";

// ============= Behavior Logs =============
export const fetchBehaviorLogs = createAsyncThunk(
  "admin/fetchBehaviorLogs",
  async (params) => {
    const response = await adminService.getBehaviorLogs(params);
    return response;
  }
);

export const fetchBehaviorStats = createAsyncThunk(
  "admin/fetchBehaviorStats",
  async () => {
    const response = await adminService.getBehaviorStats();
    return response;
  }
);

export const updateBehaviorLogStatus = createAsyncThunk(
  "admin/updateBehaviorLogStatus",
  async ({ logId, status }) => {
    const response = await adminService.updateBehaviorLogStatus(logId, status);
    return response;
  }
);

export const createBehaviorLog = createAsyncThunk(
  "admin/createBehaviorLog",
  async (data) => {
    const response = await adminService.createBehaviorLog(data);
    return response;
  }
);

export const exportBehaviorLogs = createAsyncThunk(
  "admin/exportBehaviorLogs",
  async (params) => {
    const response = await adminService.exportBehaviorLogs(params);
    return response;
  }
);

// ============= Students =============
export const fetchStudents = createAsyncThunk(
  "admin/fetchStudents",
  async (params) => {
    const response = await adminService.getStudents(params);
    return response;
  }
);

export const createStudent = createAsyncThunk(
  "admin/createStudent",
  async (data) => {
    const response = await adminService.createStudent(data);
    return response;
  }
);

export const updateStudent = createAsyncThunk(
  "admin/updateStudent",
  async ({ id, data }) => {
    const response = await adminService.updateStudent(id, data);
    return response;
  }
);

export const deleteStudent = createAsyncThunk(
  "admin/deleteStudent",
  async (id) => {
    await adminService.deleteStudent(id);
    return id;
  }
);

// ============= Teachers =============
export const fetchTeachers = createAsyncThunk(
  "admin/fetchTeachers",
  async (params) => {
    const response = await adminService.getTeachers(params);
    return response;
  }
);

export const createTeacher = createAsyncThunk(
  "admin/createTeacher",
  async (data) => {
    const response = await adminService.createTeacher(data);
    return response;
  }
);

export const updateTeacher = createAsyncThunk(
  "admin/updateTeacher",
  async ({ id, data }) => {
    const response = await adminService.updateTeacher(id, data);
    return response;
  }
);

export const deleteTeacher = createAsyncThunk(
  "admin/deleteTeacher",
  async (id) => {
    await adminService.deleteTeacher(id);
    return id;
  }
);

// ============= Parents =============
export const fetchParents = createAsyncThunk(
  "admin/fetchParents",
  async (params) => {
    const response = await adminService.getParents(params);
    return response;
  }
);

// ============= Fees =============
export const fetchFees = createAsyncThunk(
  "admin/fetchFees",
  async (params) => {
    const response = await adminService.getFees(params);
    return response;
  }
);

export const fetchFeeStats = createAsyncThunk(
  "admin/fetchFeeStats",
  async () => {
    const response = await adminService.getFeeStats();
    return response;
  }
);

export const createFee = createAsyncThunk(
  "admin/createFee",
  async (data) => {
    const response = await adminService.createFee(data);
    return response;
  }
);

export const updateFee = createAsyncThunk(
  "admin/updateFee",
  async ({ id, data }) => {
    const response = await adminService.updateFee(id, data);
    return response;
  }
);

export const deleteFeeChallan = createAsyncThunk(
  "admin/deleteFeeChallan",
  async (id) => {
    await adminService.deleteFeeChallan(id);
    return id;
  }
);

export const recordPayment = createAsyncThunk(
  "admin/recordPayment",
  async (data) => {
    const response = await adminService.recordPayment(data);
    return response;
  }
);

export const generateChallans = createAsyncThunk(
  "admin/generateChallans",
  async (data) => {
    const response = await adminService.generateChallans(data);
    return response;
  }
);

// ============= Complaints =============
export const fetchComplaints = createAsyncThunk(
  "admin/fetchComplaints",
  async (params) => {
    const response = await adminService.getComplaints(params);
    return response;
  }
);

export const fetchComplaintStats = createAsyncThunk(
  "admin/fetchComplaintStats",
  async () => {
    const response = await adminService.getComplaintStats();
    return response;
  }
);

export const updateComplaintStatus = createAsyncThunk(
  "admin/updateComplaintStatus",
  async ({ id, status }) => {
    const response = await adminService.updateComplaintStatus(id, status);
    return response;
  }
);

export const assignComplaint = createAsyncThunk(
  "admin/assignComplaint",
  async ({ id, assigneeId }) => {
    const response = await adminService.assignComplaint(id, assigneeId);
    return response;
  }
);

// ============= Notifications =============
export const sendNotification = createAsyncThunk(
  "admin/sendNotification",
  async (data) => {
    const response = await adminService.sendNotification(data);
    return response;
  }
);

// ============= Timetable =============
export const fetchTimetable = createAsyncThunk(
  "admin/fetchTimetable",
  async (params) => {
    const response = await adminService.getTimetable(params);
    return response;
  }
);

export const createTimetableEntry = createAsyncThunk(
  "admin/createTimetableEntry",
  async (data) => {
    const response = await adminService.createTimetableEntry(data);
    return response;
  }
);

export const updateTimetableEntry = createAsyncThunk(
  "admin/updateTimetableEntry",
  async ({ id, data }) => {
    const response = await adminService.updateTimetableEntry(id, data);
    return response;
  }
);

export const deleteTimetableEntry = createAsyncThunk(
  "admin/deleteTimetableEntry",
  async (id) => {
    await adminService.deleteTimetableEntry(id);
    return id;
  }
);

// ============= Class Sections =============
export const fetchClassSections = createAsyncThunk(
  "admin/fetchClassSections",
  async (params) => {
    const response = await adminService.getClassSections(params);
    return response;
  }
);

// ============= Events =============
export const fetchEvents = createAsyncThunk(
  "admin/fetchEvents",
  async (params) => {
    const response = await adminService.getEvents(params);
    return response;
  }
);

export const createEvent = createAsyncThunk(
  "admin/createEvent",
  async (data) => {
    const response = await adminService.createEvent(data);
    return response;
  }
);

export const updateEvent = createAsyncThunk(
  "admin/updateEvent",
  async ({ id, data }) => {
    const response = await adminService.updateEvent(id, data);
    return response;
  }
);

export const deleteEvent = createAsyncThunk(
  "admin/deleteEvent",
  async (id) => {
    await adminService.deleteEvent(id);
    return id;
  }
);

// ============= Users =============
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params) => {
    const response = await adminService.getUsers(params);
    return response;
  }
);

export const createUser = createAsyncThunk(
  "admin/createUser",
  async (data) => {
    const response = await adminService.createUser(data);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, data }) => {
    const response = await adminService.updateUser(id, data);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id) => {
    await adminService.deleteUser(id);
    return id;
  }
);

export const approveUser = createAsyncThunk(
  "admin/approveUser",
  async (id) => {
    const response = await adminService.approveUser(id);
    return response;
  }
);

// ============= All Users =============
export const fetchAllUsers = createAsyncThunk(
  "admin/fetchAllUsers",
  async (params) => {
    const response = await adminService.getAllUsers(params);
    return response;
  }
);

// ============= Settings =============
export const fetchSettings = createAsyncThunk(
  "admin/fetchSettings",
  async (params) => {
    const response = await adminService.getSettings(params);
    return response;
  }
);

// ============= Change Password =============
export const changePassword = createAsyncThunk(
  "admin/changePassword",
  async (data) => {
    const response = await adminService.changePassword(data);
    return response;
  }
);

// ============= Dashboard =============
export const fetchDashboardStats = createAsyncThunk(
  "admin/fetchDashboardStats",
  async () => {
    const response = await adminService.getDashboardStats();
    return response;
  }
);
