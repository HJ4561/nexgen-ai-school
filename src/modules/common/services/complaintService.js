/**
 * ============================================
 * COMPLAINT SERVICE
 * ============================================
 * 
 * Purpose: Handles complaint-related API calls across all roles
 * Used by: Admin, Teacher, Student, Parent modules
 * 
 * Features:
 * - Fetch all complaints
 * - Fetch complaint by ID
 * - Create new complaint
 * - Role-based API endpoints
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * 
 * API Endpoints:
 * - GET  /{role}/complaints
 * - GET  /{role}/complaints/{id}
 * - POST /{role}/complaints
 * 
 * Role-based endpoints:
 * - admin/complaints
 * - teacher/complaints
 * - student/complaints
 * - parent/complaints
 * 
 * Usage:
 * import complaintService from '@/services/complaintService';
 * 
 * // Get all complaints (admin)
 * const complaints = await complaintService.getComplaints('admin');
 * 
 * // Get complaint by ID (student)
 * const complaint = await complaintService.getComplaintById('student', 1);
 * 
 * // Create complaint (teacher)
 * const newComplaint = await complaintService.createComplaint('teacher', {
 *   complaint_type: 'Academic',
 *   description: 'Issue description'
 * });
 * ============================================
 */

import api from "@/services/api";

/**
 * ============================================
 * COMPLAINT SERVICE
 * ============================================
 * 
 * Service object containing all complaint-related API methods
 * 
 * @example
 * // Admin getting all complaints
 * const complaints = await complaintService.getComplaints('admin');
 * 
 * // Student getting a specific complaint
 * const complaint = await complaintService.getComplaintById('student', 5);
 * 
 * // Teacher creating a complaint
 * const newComplaint = await complaintService.createComplaint('teacher', {
 *   complaint_type: 'Facilities',
 *   description: 'Broken projector in Room 402',
 *   against_user: 'Maintenance Department'
 * });
 */
const complaintService = {
  /**
   * ============================================
   * GET COMPLAINTS
   * ============================================
   * 
   * Fetches all complaints for a specific role
   * 
   * @param {string} role - User role ('admin', 'teacher', 'student', 'parent')
   * @returns {Promise<Array>} Array of complaint objects
   * @throws {Error} If the request fails
   * 
   * @example
   * // Admin viewing all complaints
   * const complaints = await complaintService.getComplaints('admin');
   * console.log(`Total complaints: ${complaints.length}`);
   * 
   * // Student viewing their own complaints
   * const myComplaints = await complaintService.getComplaints('student');
   * const open = myComplaints.filter(c => c.status === 'open');
   */
  getComplaints: async (role) => {
    const { data } = await api.get(`/${role}/complaints`);
    return data;
  },

  /**
   * ============================================
   * GET COMPLAINT BY ID
   * ============================================
   * 
   * Fetches a specific complaint by ID for a given role
   * 
   * @param {string} role - User role ('admin', 'teacher', 'student', 'parent')
   * @param {number} id - Complaint ID
   * @returns {Promise<Object>} Complaint object with full details
   * @throws {Error} If the request fails or complaint not found
   * 
   * @example
   * // Admin viewing a specific complaint
   * const complaint = await complaintService.getComplaintById('admin', 1);
   * console.log(complaint.status);
   * 
   * // Teacher viewing a complaint
   * const complaint = await complaintService.getComplaintById('teacher', 5);
   * console.log(complaint.description);
   */
  getComplaintById: async (role, id) => {
    const { data } = await api.get(`/${role}/complaints/${id}`);
    return data;
  },

  /**
   * ============================================
   * CREATE COMPLAINT
   * ============================================
   * 
   * Creates a new complaint for a specific role
   * 
   * @param {string} role - User role ('admin', 'teacher', 'student', 'parent')
   * @param {Object} complaintData - Complaint data
   * @param {string} complaintData.complaint_type - Type of complaint (Academic, Behavior, Transport, Facilities, Fees, Other)
   * @param {string} complaintData.description - Detailed complaint description
   * @param {string} complaintData.against_user - User being complained about (optional)
   * @param {string} complaintData.attachment_url - Optional attachment URL
   * @returns {Promise<Object>} Created complaint object
   * @throws {Error} If the request fails
   * 
   * @example
   * // Student creating a complaint
   * const complaint = await complaintService.createComplaint('student', {
   *   complaint_type: 'Academic',
   *   description: 'Teacher is not responding to emails about grades',
   *   against_user: 'Mr. Smith'
   * });
   * 
   * // Teacher creating a complaint
   * const complaint = await complaintService.createComplaint('teacher', {
   *   complaint_type: 'Facilities',
   *   description: 'The projector in Room 402 is not working properly',
   *   attachment_url: 'https://storage.com/photo.jpg'
   * });
   * 
   * // Parent creating a complaint
   * const complaint = await complaintService.createComplaint('parent', {
   *   complaint_type: 'Transport',
   *   description: 'School bus arrived 30 minutes late today',
   *   against_user: 'Transport Department'
   * });
   */
  createComplaint: async (role, complaintData) => {
    const { data } = await api.post(
      `/${role}/complaints`,
      complaintData
    );
    return data;
  },
};

export default complaintService;