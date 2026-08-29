import api from "@/services/api";

const ENDPOINTS = {
  USERS: "/api/users/users/",
  STUDENTS: "/api/users/students/",
  TEACHERS: "/api/users/teachers/",
  PARENTS: "/api/users/parents/",
  STAFF: "/api/users/staff/",
  CLASSES: "/api/academics/classes/",
  SECTIONS: "/api/academics/sections/",
  SUBJECTS: "/api/academics/subjects/",
  ROOMS: "/api/academics/rooms/",
  CLASS_SUBJECTS: "/api/academics/class-subjects/",
  TIMETABLE: "/api/academics/timetable/",
};

// --- Role Configuration -------------------------------------------------

export const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    value: "admin",
    color: "bg-purple-600",
    permissions: ["all"],
  },
  teacher: {
    label: "Teacher",
    value: "teacher",
    color: "bg-blue-600",
    permissions: ["view_students", "manage_attendance", "manage_assignments"],
  },
  student: {
    label: "Student",
    value: "student",
    color: "bg-green-600",
    permissions: ["view_own_profile", "view_own_attendance"],
  },
  parent: {
    label: "Parent",
    value: "parent",
    color: "bg-orange-600",
    permissions: ["view_child_profile", "view_child_attendance"],
  },
  staff: {
    label: "Staff",
    value: "staff",
    color: "bg-gray-600",
    permissions: ["view_own_profile", "manage_transport"],
  },
};

export const ROLE_OPTIONS = Object.values(ROLE_CONFIG).map(role => ({
  label: role.label,
  value: role.value,
}));

// --- User Management --------------------------------------------------
export const getUsers = async (params) => {
  return api.get(ENDPOINTS.USERS, { params });
};

export const createUser = async (data) => {
  return api.post(ENDPOINTS.USERS, data);
};

export const updateUser = async (id, data) => {
  return api.patch(`${ENDPOINTS.USERS}${id}/`, data);
};

export const deleteUser = async (id) => {
  return api.delete(`${ENDPOINTS.USERS}${id}/`);
};

// --- Parent Profiles --------------------------------------------------
export const getParentProfiles = async (params) => {
  return api.get(ENDPOINTS.PARENTS, { params });
};

export const getParentProfile = async (id) => {
  return api.get(`${ENDPOINTS.PARENTS}${id}/`);
};

export const createParentProfile = async (data) => {
  return api.post(ENDPOINTS.PARENTS, data);
};

export const updateParentProfile = async (id, data) => {
  return api.patch(`${ENDPOINTS.PARENTS}${id}/`, data);
};

export const deleteParentProfile = async (id) => {
  return api.delete(`${ENDPOINTS.PARENTS}${id}/`);
};

// --- Student Profiles --------------------------------------------------
export const getStudentProfiles = async (params) => {
  return api.get(ENDPOINTS.STUDENTS, { params });
};

export const getStudentProfile = async (id) => {
  return api.get(`${ENDPOINTS.STUDENTS}${id}/`);
};

export const createStudentProfile = async (data) => {
  return api.post(ENDPOINTS.STUDENTS, data);
};

export const updateStudentProfile = async (id, data) => {
  return api.patch(`${ENDPOINTS.STUDENTS}${id}/`, data);
};

export const deleteStudentProfile = async (id) => {
  return api.delete(`${ENDPOINTS.STUDENTS}${id}/`);
};

// --- Teacher Profiles --------------------------------------------------
export const getTeacherProfiles = async (params) => {
  return api.get(ENDPOINTS.TEACHERS, { params });
};

export const getTeacherProfile = async (id) => {
  return api.get(`${ENDPOINTS.TEACHERS}${id}/`);
};

export const createTeacherProfile = async (data) => {
  return api.post(ENDPOINTS.TEACHERS, data);
};

export const updateTeacherProfile = async (id, data) => {
  return api.patch(`${ENDPOINTS.TEACHERS}${id}/`, data);
};

export const deleteTeacherProfile = async (id) => {
  return api.delete(`${ENDPOINTS.TEACHERS}${id}/`);
};

// --- Staff Profiles --------------------------------------------------
export const getStaffProfiles = async (params) => {
  return api.get(ENDPOINTS.STAFF, { params });
};

export const getStaffProfile = async (id) => {
  return api.get(`${ENDPOINTS.STAFF}${id}/`);
};

export const createStaffProfile = async (data) => {
  return api.post(ENDPOINTS.STAFF, data);
};

export const updateStaffProfile = async (id, data) => {
  return api.patch(`${ENDPOINTS.STAFF}${id}/`, data);
};

export const deleteStaffProfile = async (id) => {
  return api.delete(`${ENDPOINTS.STAFF}${id}/`);
};

// --- Admin Profiles --------------------------------------------------
export const getAdminProfiles = async (params) => {
  return api.get(ENDPOINTS.USERS, { params });
};

export const getAdminProfile = async (id) => {
  return api.get(`${ENDPOINTS.USERS}${id}/`);
};

export const createAdminProfile = async (data) => {
  return api.post(ENDPOINTS.USERS, data);
};

export const updateAdminProfile = async (id, data) => {
  return api.patch(`${ENDPOINTS.USERS}${id}/`, data);
};

export const deleteAdminProfile = async (id) => {
  return api.delete(`${ENDPOINTS.USERS}${id}/`);
};

// --- Merge Users ---------------------------------------------------------
export const mergeWithUsers = (profiles, users) => {
  if (!profiles || !users) return profiles || [];
  
  return profiles.map(profile => {
    const user = users.find(u => u.id === profile.user);
    return {
      ...profile,
      user: user || null,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      status: user?.status || 'inactive',
    };
  });
};

// --- Role Profile (Generic) ---------------------------------------------
export const createRoleProfile = async (role, data) => {
  const endpoints = {
    admin: ENDPOINTS.USERS,
    teacher: ENDPOINTS.TEACHERS,
    student: ENDPOINTS.STUDENTS,
    parent: ENDPOINTS.PARENTS,
    staff: ENDPOINTS.STAFF,
  };
  
  const endpoint = endpoints[role];
  if (!endpoint) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return api.post(endpoint, data);
};

export const updateRoleProfile = async (role, id, data) => {
  const endpoints = {
    admin: ENDPOINTS.USERS,
    teacher: ENDPOINTS.TEACHERS,
    student: ENDPOINTS.STUDENTS,
    parent: ENDPOINTS.PARENTS,
    staff: ENDPOINTS.STAFF,
  };
  
  const endpoint = endpoints[role];
  if (!endpoint) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return api.patch(`${endpoint}${id}/`, data);
};

export const deleteRoleProfile = async (role, id) => {
  const endpoints = {
    admin: ENDPOINTS.USERS,
    teacher: ENDPOINTS.TEACHERS,
    student: ENDPOINTS.STUDENTS,
    parent: ENDPOINTS.PARENTS,
    staff: ENDPOINTS.STAFF,
  };
  
  const endpoint = endpoints[role];
  if (!endpoint) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return api.delete(`${endpoint}${id}/`);
};

export const getRoleProfiles = async (role, params) => {
  const endpoints = {
    admin: ENDPOINTS.USERS,
    teacher: ENDPOINTS.TEACHERS,
    student: ENDPOINTS.STUDENTS,
    parent: ENDPOINTS.PARENTS,
    staff: ENDPOINTS.STAFF,
  };
  
  const endpoint = endpoints[role];
  if (!endpoint) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return api.get(endpoint, { params });
};

export const getRoleProfile = async (role, id) => {
  const endpoints = {
    admin: ENDPOINTS.USERS,
    teacher: ENDPOINTS.TEACHERS,
    student: ENDPOINTS.STUDENTS,
    parent: ENDPOINTS.PARENTS,
    staff: ENDPOINTS.STAFF,
  };
  
  const endpoint = endpoints[role];
  if (!endpoint) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  return api.get(`${endpoint}${id}/`);
};

// --- Admin Service ------------------------------------------------------

const adminService = {
  // Users
  getUsers: (params) => api.get(ENDPOINTS.USERS, { params }),
  createUser: (data) => api.post(ENDPOINTS.USERS, data),
  updateUser: (id, data) => api.patch(`${ENDPOINTS.USERS}${id}/`, data),
  deleteUser: (id) => api.delete(`${ENDPOINTS.USERS}${id}/`),
  
  // Students
  getStudents: (params) => api.get(ENDPOINTS.STUDENTS, { params }),
  createStudent: (data) => api.post(ENDPOINTS.STUDENTS, data),
  updateStudent: (id, data) => api.patch(`${ENDPOINTS.STUDENTS}${id}/`, data),
  deleteStudent: (id) => api.delete(`${ENDPOINTS.STUDENTS}${id}/`),
  
  // Teachers
  getTeachers: (params) => api.get(ENDPOINTS.TEACHERS, { params }),
  createTeacher: (data) => api.post(ENDPOINTS.TEACHERS, data),
  updateTeacher: (id, data) => api.patch(`${ENDPOINTS.TEACHERS}${id}/`, data),
  deleteTeacher: (id) => api.delete(`${ENDPOINTS.TEACHERS}${id}/`),
  
  // Parents
  getParents: (params) => api.get(ENDPOINTS.PARENTS, { params }),
  createParent: (data) => api.post(ENDPOINTS.PARENTS, data),
  updateParent: (id, data) => api.patch(`${ENDPOINTS.PARENTS}${id}/`, data),
  deleteParent: (id) => api.delete(`${ENDPOINTS.PARENTS}${id}/`),
  
  // Staff
  getStaff: (params) => api.get(ENDPOINTS.STAFF, { params }),
  createStaff: (data) => api.post(ENDPOINTS.STAFF, data),
  updateStaff: (id, data) => api.patch(`${ENDPOINTS.STAFF}${id}/`, data),
  deleteStaff: (id) => api.delete(`${ENDPOINTS.STAFF}${id}/`),
  
  // Academics
  getClasses: (params) => api.get(ENDPOINTS.CLASSES, { params }),
  createClass: (data) => api.post(ENDPOINTS.CLASSES, data),
  updateClass: (id, data) => api.patch(`${ENDPOINTS.CLASSES}${id}/`, data),
  deleteClass: (id) => api.delete(`${ENDPOINTS.CLASSES}${id}/`),
  
  getSections: (params) => api.get(ENDPOINTS.SECTIONS, { params }),
  createSection: (data) => api.post(ENDPOINTS.SECTIONS, data),
  updateSection: (id, data) => api.patch(`${ENDPOINTS.SECTIONS}${id}/`, data),
  deleteSection: (id) => api.delete(`${ENDPOINTS.SECTIONS}${id}/`),
  
  getSubjects: (params) => api.get(ENDPOINTS.SUBJECTS, { params }),
  createSubject: (data) => api.post(ENDPOINTS.SUBJECTS, data),
  updateSubject: (id, data) => api.patch(`${ENDPOINTS.SUBJECTS}${id}/`, data),
  deleteSubject: (id) => api.delete(`${ENDPOINTS.SUBJECTS}${id}/`),
  
  getRooms: (params) => api.get(ENDPOINTS.ROOMS, { params }),
  createRoom: (data) => api.post(ENDPOINTS.ROOMS, data),
  updateRoom: (id, data) => api.patch(`${ENDPOINTS.ROOMS}${id}/`, data),
  deleteRoom: (id) => api.delete(`${ENDPOINTS.ROOMS}${id}/`),
  
  getClassSubjects: (params) => api.get(ENDPOINTS.CLASS_SUBJECTS, { params }),
  createClassSubject: (data) => api.post(ENDPOINTS.CLASS_SUBJECTS, data),
  updateClassSubject: (id, data) => api.patch(`${ENDPOINTS.CLASS_SUBJECTS}${id}/`, data),
  deleteClassSubject: (id) => api.delete(`${ENDPOINTS.CLASS_SUBJECTS}${id}/`),
  
  getTimetable: (params) => api.get(ENDPOINTS.TIMETABLE, { params }),
  createTimetable: (data) => api.post(ENDPOINTS.TIMETABLE, data),
  updateTimetable: (id, data) => api.patch(`${ENDPOINTS.TIMETABLE}${id}/`, data),
  deleteTimetable: (id) => api.delete(`${ENDPOINTS.TIMETABLE}${id}/`),
};

export default adminService;