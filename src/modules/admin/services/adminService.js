// src/modules/admin/services/adminService.js
//
// Smart School Management System - Admin Service
// Complete API service for all admin operations
//
// IMPORTANT SCHEMA NOTE (from the API docs):
// /api/users/users/        → base account: { id, name, email, password, role, status }
// /api/users/students/     → profile: { id, user, class_obj, parent, admission_no, dob, gender, address, phone, admission_date }
// /api/users/teachers/     → profile: { id, user, employee, qualification, experience, join_date, subject_specialization, phone, status }
// /api/users/staff/        → profile: { id, user, employee, designation, department, join_date, phone, status }
// /api/users/parents/      → profile: { id, user, occupation, phone, address }
//
// The profile endpoints only return the numeric `user` FK, not the name/email —
// so any screen that needs user details has to fetch both endpoints and join them client-side.
// That join is centralized here (mergeWithUsers) so every page gets it for free.
//

import api from "@/services/api";

// ─── Constants ──────────────────────────────────────────────────────────────
const ENDPOINTS = {
  users: "/users/users/",
  students: "/users/students/",
  teachers: "/users/teachers/",
  staff: "/users/staff/",
  parents: "/users/parents/",
};

// ─── Helper Functions ──────────────────────────────────────────────────────
const list = (path, params = {}) => api.get(path, { params }).then((r) => r.data);
const retrieve = (path, id) => api.get(`${path}${id}/`).then((r) => r.data);
const create = (path, payload) => api.post(path, payload).then((r) => r.data);
const update = (path, id, payload) => api.patch(`${path}${id}/`, payload).then((r) => r.data);
const remove = (path, id) => api.delete(`${path}${id}/`).then((r) => r.data);

// Unwraps either a raw array or a DRF-style { results: [...] } page.
const asArray = (response) => response?.results ?? response ?? [];

// ─── Joins a profile record with its matching base Users record ──────────
export function mergeWithUsers(profiles, users) {
  const usersById = new Map(users.map((u) => [u.id, u]));
  return profiles.map((profile) => {
    const account = usersById.get(profile.user) || {};
    return {
      ...profile,
      profileId: profile.id,
      userId: profile.user,
      name: account.name,
      email: account.email,
      role: account.role,
      status: account.status,
      accountIsActive: account.is_active,
    };
  });
}

// ─── Users (base accounts) ─────────────────────────────────────────────────
export const getUsers = (params = {}) => list(ENDPOINTS.users, params).then(asArray);
export const getUser = (id) => retrieve(ENDPOINTS.users, id);
export const createUser = (payload) => create(ENDPOINTS.users, payload);
export const updateUser = (id, payload) => update(ENDPOINTS.users, id, payload);
export const deleteUser = (id) => remove(ENDPOINTS.users, id);
export const approveUser = (id) => updateUser(id, { status: "active" });
export const rejectUser = (id) => updateUser(id, { status: "rejected" });

// ─── Students ───────────────────────────────────────────────────────────────
export const getStudentProfiles = (params = {}) => list(ENDPOINTS.students, params).then(asArray);
export const getStudents = async (params = {}) => {
  const [profiles, users] = await Promise.all([
    getStudentProfiles(params),
    getUsers()
  ]);
  return mergeWithUsers(profiles, users);
};
export const createStudent = (payload) => create(ENDPOINTS.students, payload);
export const updateStudentProfile = (id, payload) => update(ENDPOINTS.students, id, payload);
export const deleteStudentProfile = (id) => remove(ENDPOINTS.students, id);

// ─── Teachers ───────────────────────────────────────────────────────────────
export const getTeacherProfiles = (params = {}) => list(ENDPOINTS.teachers, params).then(asArray);
export const getTeachers = async (params = {}) => {
  const [profiles, users] = await Promise.all([
    getTeacherProfiles(params),
    getUsers()
  ]);
  return mergeWithUsers(profiles, users);
};
export const createTeacher = (payload) => create(ENDPOINTS.teachers, payload);
export const updateTeacherProfile = (id, payload) => update(ENDPOINTS.teachers, id, payload);
export const deleteTeacherProfile = (id) => remove(ENDPOINTS.teachers, id);

// ─── Staff ──────────────────────────────────────────────────────────────────
export const getStaffProfiles = (params = {}) => list(ENDPOINTS.staff, params).then(asArray);
export const getStaff = async (params = {}) => {
  const [profiles, users] = await Promise.all([
    getStaffProfiles(params),
    getUsers()
  ]);
  return mergeWithUsers(profiles, users);
};
export const createStaffMember = (payload) => create(ENDPOINTS.staff, payload);
export const updateStaffProfile = (id, payload) => update(ENDPOINTS.staff, id, payload);
export const deleteStaffProfile = (id) => remove(ENDPOINTS.staff, id);

// ─── Parents ────────────────────────────────────────────────────────────────
export const getParentProfiles = (params = {}) => list(ENDPOINTS.parents, params).then(asArray);
export const getParents = async (params = {}) => {
  const [profiles, users] = await Promise.all([
    getParentProfiles(params),
    getUsers()
  ]);
  return mergeWithUsers(profiles, users);
};
export const createParent = (payload) => create(ENDPOINTS.parents, payload);
export const updateParentProfile = (id, payload) => update(ENDPOINTS.parents, id, payload);
export const deleteParentProfile = (id) => remove(ENDPOINTS.parents, id);

// ─── Academics ─────────────────────────────────────────────────────────────
export const getClasses = (params = {}) => list("/academics/classes/", params);
export const getSubjects = (params = {}) => list("/academics/subjects/", params);
export const getTimetable = (params = {}) => list("/academics/timetable/", params);

// ─── Assignments ────────────────────────────────────────────────────────────
export const getAssignments = (params = {}) => list("/assignments/assignments/", params);
export const getSubmissions = (params = {}) => list("/assignments/submissions/", params);

// ─── Exams ──────────────────────────────────────────────────────────────────
export const getExams = (params = {}) => list("/exams/exams/", params);
export const getResults = (params = {}) => list("/exams/results/", params);

// ─── Attendance ─────────────────────────────────────────────────────────────
export const getAttendance = (params = {}) => list("/attendance/attendance/", params);

/**
 * Get attendance for a specific student
 * @param {number|string} studentId - Student ID
 * @param {Object} params - Query parameters
 * @returns {Promise} Student attendance records
 */
export const getStudentAttendance = async (studentId, params = {}) => {
  try {
    const response = await api.get(`/attendance/students/${studentId}/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    throw error;
  }
};

/**
 * Create a new attendance record
 * @param {Object} data - Attendance data
 * @returns {Promise} Created attendance record
 */
export const createAttendance = async (data) => {
  try {
    const response = await api.post('/attendance/attendance/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating attendance:', error);
    throw error;
  }
};

/**
 * Update an attendance record
 * @param {number|string} id - Attendance record ID
 * @param {Object} data - Updated attendance data
 * @returns {Promise} Updated attendance record
 */
export const updateAttendance = async (id, data) => {
  try {
    const response = await api.put(`/attendance/attendance/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

/**
 * Delete an attendance record
 * @param {number|string} id - Attendance record ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteAttendance = async (id) => {
  try {
    const response = await api.delete(`/attendance/attendance/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

/**
 * Get attendance statistics
 * @param {Object} params - Query parameters
 * @returns {Promise} Attendance statistics
 */
export const getAttendanceStats = async (params = {}) => {
  try {
    const response = await api.get('/attendance/stats/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    throw error;
  }
};

/**
 * Get attendance report
 * @param {Object} params - Report parameters
 * @returns {Promise} Attendance report
 */
export const getAttendanceReport = async (params = {}) => {
  try {
    const response = await api.get('/attendance/report/', { params });
    return response.data;
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
};

/**
 * Mark bulk attendance
 * @param {Array} data - Array of attendance records
 * @returns {Promise} Bulk creation confirmation
 */
export const markBulkAttendance = async (data) => {
  try {
    const response = await api.post('/attendance/bulk/', data);
    return response.data;
  } catch (error) {
    console.error('Error marking bulk attendance:', error);
    throw error;
  }
};

/**
 * Get attendance by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Object} params - Additional parameters
 * @returns {Promise} Attendance records in date range
 */
export const getAttendanceByDateRange = async (startDate, endDate, params = {}) => {
  try {
    const response = await api.get('/attendance/range/', { 
      params: { start_date: startDate, end_date: endDate, ...params } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance by date range:', error);
    throw error;
  }
};

// ─── Behavior Logs ──────────────────────────────────────────────────────────
export const getBehaviorLogs = (params = {}) => list("/attendance/behavior-logs/", params);

/**
 * Create a behavior log entry
 * @param {Object} data - Behavior log data
 * @returns {Promise} Created behavior log
 */
export const createBehaviorLog = async (data) => {
  try {
    const response = await api.post('/attendance/behavior-logs/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating behavior log:', error);
    throw error;
  }
};

// ─── Finance ────────────────────────────────────────────────────────────────
export const getFees = (params = {}) => list("/finance/fees/", params);
export const getPayments = (params = {}) => list("/finance/payments/", params);

// ─── Events ─────────────────────────────────────────────────────────────────
export const getEvents = (params = {}) => list("/events/events/", params);
export const getEventParticipants = (eventId, params = {}) => list(`/events/events/${eventId}/participants/`, params);
export const getEventCertificates = (eventId, params = {}) => list(`/events/events/${eventId}/certificates/`, params);
export const createEvent = (payload) => create("/events/events/", payload);
export const updateEvent = (id, payload) => update("/events/events/", id, payload);
export const deleteEvent = (id) => remove("/events/events/", id);
export const addEventParticipant = (eventId, data) => create(`/events/events/${eventId}/participants/`, data);
export const removeEventParticipant = (eventId, participantId) => remove(`/events/events/${eventId}/participants/${participantId}/`);
export const generateCertificates = (eventId, participantIds) => create(`/events/events/${eventId}/certificates/`, { participant_ids: participantIds });

// ─── Communication ─────────────────────────────────────────────────────────
export const getNotifications = (params = {}) => list("/communication/notifications/", params);

// ─── Role Configuration ────────────────────────────────────────────────────
export const ROLE_CONFIG = {
  student: {
    label: "Student",
    getProfiles: getStudentProfiles,
    getMerged: getStudents,
    createProfile: createStudent,
    updateProfile: updateStudentProfile,
    deleteProfile: deleteStudentProfile,
    fields: [
      { name: "admission_no", label: "Admission No.", type: "text", placeholder: "ADM-2025-002" },
      { name: "class_obj", label: "Class ID", type: "number", placeholder: "1" },
      { name: "parent", label: "Parent (User ID)", type: "number", placeholder: "1" },
      { name: "dob", label: "Date of Birth", type: "date" },
      { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other"] },
      { name: "address", label: "Address", type: "text", placeholder: "Johar Town, Lahore" },
      { name: "phone", label: "Phone", type: "text", placeholder: "03011234567" },
      { name: "admission_date", label: "Admission Date", type: "date" },
    ],
  },
  teacher: {
    label: "Teacher",
    getProfiles: getTeacherProfiles,
    getMerged: getTeachers,
    createProfile: createTeacher,
    updateProfile: updateTeacherProfile,
    deleteProfile: deleteTeacherProfile,
    fields: [
      { name: "employee", label: "Employee (HR ID)", type: "number", placeholder: "1" },
      { name: "qualification", label: "Qualification", type: "text", placeholder: "M.Ed" },
      { name: "experience", label: "Experience (years)", type: "number", placeholder: "5" },
      { name: "join_date", label: "Join Date", type: "date" },
      { name: "subject_specialization", label: "Subject Specialization", type: "text", placeholder: "Mathematics" },
      { name: "phone", label: "Phone", type: "text", placeholder: "03021234567" },
    ],
  },
  staff: {
    label: "Staff",
    getProfiles: getStaffProfiles,
    getMerged: getStaff,
    createProfile: createStaffMember,
    updateProfile: updateStaffProfile,
    deleteProfile: deleteStaffProfile,
    fields: [
      { name: "employee", label: "Employee (HR ID)", type: "number", placeholder: "1" },
      { name: "designation", label: "Designation", type: "text", placeholder: "Librarian" },
      { name: "department", label: "Department", type: "text", placeholder: "Library" },
      { name: "join_date", label: "Join Date", type: "date" },
      { name: "phone", label: "Phone", type: "text", placeholder: "03031234567" },
    ],
  },
  parent: {
    label: "Parent",
    getProfiles: getParentProfiles,
    getMerged: getParents,
    createProfile: createParent,
    updateProfile: updateParentProfile,
    deleteProfile: deleteParentProfile,
    fields: [
      { name: "occupation", label: "Occupation", type: "text", placeholder: "Engineer" },
      { name: "phone", label: "Phone", type: "text", placeholder: "03001234567" },
      { name: "address", label: "Address", type: "text", placeholder: "Model Town, Lahore" },
    ],
  },
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  try {
    const [students, teachers, parents, staff, users] = await Promise.all([
      getStudents(),
      getTeachers(),
      getParents(),
      getStaff(),
      getUsers(),
    ]);

    const pendingApprovals = (users || []).filter(
      user => user.status === "pending" || user.status === "Pending"
    );

    return {
      total_students: students?.length || 0,
      total_teachers: teachers?.length || 0,
      total_parents: parents?.length || 0,
      total_staff: staff?.length || 0,
      pending_approvals: pendingApprovals.length,
      open_complaints: 0,
      avg_attendance: 0,
      monthly_revenue: 0,
    };
  } catch (error) {
    console.warn('Dashboard stats error:', error.message);
    return {
      total_students: 0,
      total_teachers: 0,
      total_parents: 0,
      total_staff: 0,
      pending_approvals: 0,
      open_complaints: 0,
      avg_attendance: 0,
      monthly_revenue: 0,
    };
  }
};

// ─── Role Profile Operations ──────────────────────────────────────────────
/**
 * Creates a full profile: POST the base Users record first,
 * then POST the role-specific profile with `user: <new id>`.
 */
export async function createRoleProfile(role, { name, email, password, status = "active", ...profileFields }) {
  const config = ROLE_CONFIG[role];
  if (!config) throw new Error(`Unknown role: ${role}`);

  const account = await createUser({ name, email, password, role, status });

  try {
    const profile = await config.createProfile({ ...profileFields, user: account.id });
    return mergeWithUsers([profile], [account])[0];
  } catch (err) {
    await deleteUser(account.id).catch(() => {});
    throw err;
  }
}

/**
 * Updates both halves of a profile.
 */
export async function updateRoleProfile(role, { userId, profileId, accountFields = {}, profileFields = {} }) {
  const config = ROLE_CONFIG[role];
  if (!config) throw new Error(`Unknown role: ${role}`);

  const [account, profile] = await Promise.all([
    Object.keys(accountFields).length ? updateUser(userId, accountFields) : getUser(userId),
    Object.keys(profileFields).length ? config.updateProfile(profileId, profileFields) : Promise.resolve({ id: profileId, user: userId }),
  ]);

  return mergeWithUsers([profile], [account])[0];
}

/**
 * Deletes the role profile and its underlying Users account together.
 */
export async function deleteRoleProfile(role, { userId, profileId }) {
  const config = ROLE_CONFIG[role];
  if (!config) throw new Error(`Unknown role: ${role}`);

  await config.deleteProfile(profileId);
  await deleteUser(userId);
}

// ─── Combined Class AdminService ──────────────────────────────────────────
class AdminService {
  // Users
  getUsers = getUsers;
  getUser = getUser;
  createUser = createUser;
  updateUser = updateUser;
  deleteUser = deleteUser;
  approveUser = approveUser;
  rejectUser = rejectUser;

  // Students
  getStudents = getStudents;
  getStudentProfiles = getStudentProfiles;
  createStudent = createStudent;
  updateStudent = updateStudentProfile;
  deleteStudent = deleteStudentProfile;

  // Teachers
  getTeachers = getTeachers;
  getTeacherProfiles = getTeacherProfiles;
  createTeacher = createTeacher;
  updateTeacher = updateTeacherProfile;
  deleteTeacher = deleteTeacherProfile;

  // Staff
  getStaff = getStaff;
  getStaffProfiles = getStaffProfiles;
  createStaff = createStaffMember;
  updateStaff = updateStaffProfile;
  deleteStaff = deleteStaffProfile;

  // Parents
  getParents = getParents;
  getParentProfiles = getParentProfiles;
  createParent = createParent;
  updateParent = updateParentProfile;
  deleteParent = deleteParentProfile;

  // Academics
  getClasses = getClasses;
  getSubjects = getSubjects;
  getTimetable = getTimetable;

  // Assignments
  getAssignments = getAssignments;
  getSubmissions = getSubmissions;

  // Exams
  getExams = getExams;
  getResults = getResults;

  // Attendance
  getAttendance = getAttendance;
  getStudentAttendance = getStudentAttendance;
  createAttendance = createAttendance;
  updateAttendance = updateAttendance;
  deleteAttendance = deleteAttendance;
  getAttendanceStats = getAttendanceStats;
  getAttendanceReport = getAttendanceReport;
  markBulkAttendance = markBulkAttendance;
  getAttendanceByDateRange = getAttendanceByDateRange;
  getBehaviorLogs = getBehaviorLogs;
  createBehaviorLog = createBehaviorLog;

  // Finance
  getFees = getFees;
  getPayments = getPayments;

  // Events
  getEvents = getEvents;
  getEventParticipants = getEventParticipants;
  getEventCertificates = getEventCertificates;
  createEvent = createEvent;
  updateEvent = updateEvent;
  deleteEvent = deleteEvent;
  addEventParticipant = addEventParticipant;
  removeEventParticipant = removeEventParticipant;
  generateCertificates = generateCertificates;

  // Communication
  getNotifications = getNotifications;

  // Dashboard
  getDashboardStats = getDashboardStats;

  // Role-based operations
  createRoleProfile = createRoleProfile;
  updateRoleProfile = updateRoleProfile;
  deleteRoleProfile = deleteRoleProfile;
  mergeWithUsers = mergeWithUsers;
  ROLE_CONFIG = ROLE_CONFIG;
}

// ─── Default Export ────────────────────────────────────────────────────────
export default new AdminService();