/**
 * ============================================
 * AUTH MOCK DATA
 * ============================================
 * 
 * Purpose: Mock user data for demo authentication and role-based routing
 * Used for: Development, testing, and demo environments
 * In production, this data will come from the backend API
 * 
 * Data Types:
 * - Mock Users: User accounts with roles and credentials
 * - Mock Roles: Available system roles for forms and dropdowns
 * 
 * Usage:
 * import { mockUsers, mockRoles } from '@/mocks/authMock';
 * ============================================
 */

/**
 * ============================================
 * MOCK USERS
 * ============================================
 * 
 * Collection of user accounts for demo authentication
 * 
 * @constant {Array} mockUsers
 * @property {number} id - Unique user identifier
 * @property {string} full_name - User's full name
 * @property {string} email - User's email address (used for login)
 * @property {string} password - User's password (demo only)
 * @property {string} role - User role (admin, teacher, student, parent)
 * @property {string} status - Approval status (Approved, Pending)
 * @property {string|null} profile_image - URL to profile image (null if not set)
 * @property {string|null} token - Authentication token (null if not approved)
 * 
 * @example
 * // Login with admin credentials
 * const adminUser = mockUsers.find(u => u.email === 'admin@school.edu');
 * // password: '123456'
 * 
 * // Get all approved users
 * const approvedUsers = mockUsers.filter(u => u.status === 'Approved');
 */
export const mockUsers = [
  // ─── Admin User ───
  {
    id: 1,
    full_name: "Ahmed Khan",
    email: "admin@school.edu",
    password: "123456",
    role: "admin",
    status: "Approved",
    profile_image: null,
    token: "admin-jwt-token",
  },

  // ─── Teacher User ───
  {
    id: 2,
    full_name: "Ali Hassan",
    email: "teacher@school.edu",
    password: "123456",
    role: "teacher",
    status: "Approved",
    profile_image: null,
    token: "teacher-jwt-token",
  },

  // ─── Student User ───
  {
    id: 3,
    full_name: "Fazail Nadeem",
    email: "student@school.edu",
    password: "123456",
    role: "student",
    status: "Approved",
    profile_image: null,
    token: "student-jwt-token",
  },

  // ─── Parent User ───
  {
    id: 4,
    full_name: "Sara Ali",
    email: "parent@school.edu",
    password: "123456",
    role: "parent",
    status: "Approved",
    profile_image: null,
    token: "parent-jwt-token",
  },

  // ─── User Awaiting Admin Approval ───
  {
    id: 5,
    full_name: "Usman Tariq",
    email: "pending@school.edu",
    password: "123456",
    role: "student",
    status: "Pending",
    profile_image: null,
    token: null,
  },
];

/**
 * ============================================
 * MOCK ROLES
 * ============================================
 * 
 * Available system roles for forms, dropdowns, filters, and validations
 * 
 * @constant {Array} mockRoles
 * @property {number} id - Unique role identifier
 * @property {string} label - Display label for the role
 * @property {string} value - Role value (used in API calls)
 * 
 * @example
 * // Render role dropdown
 * <Select options={mockRoles} />
 * 
 * // Validate role
 * const isValidRole = mockRoles.some(r => r.value === userRole);
 */
export const mockRoles = [
  {
    id: 1,
    label: "Admin",
    value: "admin",
  },
  {
    id: 2,
    label: "Teacher",
    value: "teacher",
  },
  {
    id: 3,
    label: "Student",
    value: "student",
  },
  {
    id: 4,
    label: "Parent",
    value: "parent",
  },
];