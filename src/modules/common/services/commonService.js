/**
 * ============================================
 * COMMON SERVICE
 * ============================================
 * 
 * Purpose: Handles common/shared API calls across all modules
 * Used by: Multiple modules (admin, teacher, student, parent)
 * 
 * Features:
 * - Profile management (fetch, update, replace)
 * - Password management
 * - Complaint management (fetch, fetch by ID, create)
 * 
 * Dependencies:
 * - @/services/api for HTTP requests
 * 
 * API Endpoints:
 * - /auth/profile
 * - /auth/update-profile
 * - /auth/replace-profile
 * - /auth/change-password
 * - /complaints
 * - /complaints/{id}
 * - /complaints/create
 * 
 * Usage:
 * import commonService from '@/modules/common/services/commonService';
 * 
 * const profile = await commonService.getProfile();
 * ============================================
 */

import api from '@/services/api';

/**
 * ============================================
 * COMMON SERVICE
 * ============================================
 * 
 * Service object containing all common/shared API methods
 * 
 * @example
 * // Get current user profile
 * const profile = await commonService.getProfile();
 * 
 * // Update profile
 * const updated = await commonService.updateProfile({ full_name: 'John Doe' });
 * 
 * // Replace profile (full replacement)
 * const replaced = await commonService.replaceProfile({ full_name: 'Jane Doe', email: 'jane@email.com' });
 * 
 * // Change password
 * await commonService.changePassword({
 *   current_password: 'old123',
 *   new_password: 'new456'
 * });
 * 
 * // Get complaints
 * const complaints = await commonService.getComplaints();
 * 
 * // Get complaint by ID
 * const complaint = await commonService.getComplaintById(1);
 * 
 * // Create complaint
 * const newComplaint = await commonService.createComplaint({
 *   complaint_type: 'Academic',
 *   description: 'Issue description'
 * });
 */
export const commonService = {
  // --- Profile --------------------------------------------------------------

  /**
   * ============================================
   * GET PROFILE
   * ============================================
   * 
   * Fetches the authenticated user's profile information
   * 
   * @returns {Promise<Object>} User profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const profile = await commonService.getProfile();
   * console.log(profile.full_name);
   */
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  /**
   * ============================================
   * UPDATE PROFILE
   * ============================================
   * 
   * Updates the authenticated user's profile information (partial update)
   * 
   * @param {Object} profileData - Profile data to update
   * @param {string} profileData.full_name - User's full name
   * @param {string} profileData.email - User's email address
   * @param {string} profileData.phone - User's phone number
   * @param {string} profileData.address - User's address
   * @param {string} profileData.avatar - Profile image URL
   * @returns {Promise<Object>} Updated profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const updated = await commonService.updateProfile({
   *   full_name: 'John Doe',
   *   phone: '+92-300-1234567'
   * });
   */
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/update-profile', profileData);
    return data;
  },

  /**
   * ============================================
   * REPLACE PROFILE
   * ============================================
   * 
   * Replaces the entire user profile (full replacement)
   * 
   * @param {Object} profileData - Complete profile data
   * @param {string} profileData.full_name - User's full name
   * @param {string} profileData.email - User's email address
   * @param {string} profileData.phone - User's phone number
   * @param {string} profileData.address - User's address
   * @param {string} profileData.avatar - Profile image URL
   * @returns {Promise<Object>} Replaced profile data
   * @throws {Error} If the request fails
   * 
   * @example
   * const replaced = await commonService.replaceProfile({
   *   full_name: 'Jane Doe',
   *   email: 'jane@email.com',
   *   phone: '+92-300-7654321'
   * });
   */
  replaceProfile: async (profileData) => {
    const { data } = await api.put('/auth/replace-profile', profileData);
    return data;
  },

  /**
   * ============================================
   * CHANGE PASSWORD
   * ============================================
   * 
   * Changes the authenticated user's password
   * 
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.current_password - Current password
   * @param {string} passwordData.new_password - New password
   * @param {string} passwordData.confirm_password - Confirm new password
   * @returns {Promise<Object>} Password change confirmation
   * @throws {Error} If the request fails
   * 
   * @example
   * await commonService.changePassword({
   *   current_password: 'old123',
   *   new_password: 'new456',
   *   confirm_password: 'new456'
   * });
   */
  changePassword: async (passwordData) => {
    const { data } = await api.put('/auth/change-password', passwordData);
    return data;
  },

  // --- Complaints ---------------------------------------------------------

  /**
   * ============================================
   * GET COMPLAINTS
   * ============================================
   * 
   * Fetches all complaints
   * 
   * @param {string} role - User role (admin, teacher, student, parent)
   * @returns {Promise<Array>} Array of complaint objects
   * @throws {Error} If the request fails
   * 
   * @example
   * const complaints = await commonService.getComplaints('admin');
   * console.log(`Total complaints: ${complaints.length}`);
   */
  getComplaints: async (role) => {
    const endpoint = role === 'admin' ? '/admin/complaints' : `/${role}/complaints`;
    const { data } = await api.get(endpoint);
    return data;
  },

  /**
   * ============================================
   * GET COMPLAINT BY ID
   * ============================================
   * 
   * Fetches a specific complaint by ID
   * 
   * @param {number} id - Complaint ID
   * @param {string} role - User role
   * @returns {Promise<Object>} Complaint object
   * @throws {Error} If the request fails
   * 
   * @example
   * const complaint = await commonService.getComplaintById(1, 'admin');
   * console.log(complaint.status);
   */
  getComplaintById: async (id, role) => {
    const endpoint = role === 'admin' ? `/admin/complaints/${id}` : `/${role}/complaints/${id}`;
    const { data } = await api.get(endpoint);
    return data;
  },

  /**
   * ============================================
   * CREATE COMPLAINT
   * ============================================
   * 
   * Creates a new complaint
   * 
   * @param {Object} complaintData - Complaint data
   * @param {string} complaintData.complaint_type - Type of complaint
   * @param {string} complaintData.description - Complaint description
   * @param {string} complaintData.against_user - User being complained about
   * @param {string} complaintData.attachment_url - Optional attachment URL
   * @param {string} role - User role
   * @returns {Promise<Object>} Created complaint
   * @throws {Error} If the request fails
   * 
   * @example
   * const complaint = await commonService.createComplaint({
   *   complaint_type: 'Academic',
   *   description: 'Issue with grading',
   *   against_user: 'Mr. Smith'
   * }, 'student');
   */
  createComplaint: async (complaintData, role) => {
    const endpoint = role === 'admin' ? '/admin/complaints/create' : `/${role}/complaints/create`;
    const { data } = await api.post(endpoint, complaintData);
    return data;
  },
};

export default commonService;
