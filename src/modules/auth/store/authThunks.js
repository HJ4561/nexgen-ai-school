// src/modules/auth/store/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

/**
 * ============================================
 * LOGIN USER
 * ============================================
 * 
 * Login user with email, password, and role
 * Stores tokens in localStorage
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @param {string} credentials.role - User role (admin, teacher, student, parent, staff)
 * @returns {Promise<Object>} User data with tokens and role
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      // ✅ Call authService.login which should return tokens
      const response = await authService.login(credentials);
      
      console.log("✅ Login response:", response);
      
      // ✅ Extract tokens from response
      const access = response.access;
      const refresh = response.refresh;
      
      if (!access || !refresh) {
        console.error("❌ Missing tokens in response:", response);
        return rejectWithValue("Invalid response from server: missing tokens");
      }
      
      // ✅ Get role from response or credentials
      const role = response.role || credentials.role || "student";
      
      // ✅ Store auth data in localStorage
      const authData = {
        access: access,
        refresh: refresh,
        role: role,
        user: response.user || null,
      };
      
      localStorage.setItem("auth_data", JSON.stringify(authData));
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_role", role);
      
      if (response.user?.id) {
        localStorage.setItem("user_id", String(response.user.id));
      }
      
      console.log("✅ Auth data stored in localStorage");
      
      // ✅ Return data for Redux state
      return {
        access: access,
        refresh: refresh,
        role: role,
        user: response.user || { email: credentials.email },
      };
    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                       error.response.data?.message || 
                       error.response.data?.error ||
                       "Invalid email or password";
      } else if (error.request) {
        errorMessage = "Network error - Please check your connection";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * ============================================
 * FETCH USER PROFILE
 * ============================================
 * 
 * Fetch user profile based on role
 * 
 * @returns {Promise<Object>} User profile data
 */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const role = auth.role || localStorage.getItem("user_role") || "student";
      
      const response = await authService.getProfile(role);
      
      if (!response) {
        // Return fallback data
        return {
          id: 0,
          role_name: role,
          status: "Active",
          email: "",
        };
      }
      
      return response;
    } catch (error) {
      const role = localStorage.getItem("user_role") || "student";
      return {
        id: 0,
        role_name: role,
        status: "Active",
      };
    }
  }
);

/**
 * ============================================
 * REFRESH ACCESS TOKEN
 * ============================================
 * 
 * Refresh access token using refresh token
 * 
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
      const refreshToken = authData.refresh || localStorage.getItem("refresh_token");
      
      if (!refreshToken) {
        return rejectWithValue("No refresh token available");
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      if (!response.access) {
        return rejectWithValue("Invalid refresh response");
      }
      
      // ✅ Update stored tokens
      authData.access = response.access;
      localStorage.setItem("auth_data", JSON.stringify(authData));
      localStorage.setItem("access_token", response.access);
      
      console.log("✅ Token refreshed successfully");
      
      return response;
    } catch (error) {
      console.error("❌ Token refresh error:", error);
      
      // Clear auth data on refresh failure
      localStorage.removeItem("auth_data");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      
      return rejectWithValue("Session expired - Please login again");
    }
  }
);

/**
 * ============================================
 * REGISTER USER
 * ============================================
 * 
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user data
 */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         "Registration failed";
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * ============================================
 * REQUEST OTP
 * ============================================
 * 
 * Request OTP for password reset
 * 
 * @param {string} email - User email
 * @returns {Promise<Object>} OTP response
 */
export const requestOtp = createAsyncThunk(
  "auth/requestOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.requestOtp(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Failed to send OTP");
    }
  }
);

/**
 * ============================================
 * FORGOT PASSWORD
 * ============================================
 * 
 * Forgot Password - Request OTP
 * 
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset response
 */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Failed to send reset email");
    }
  }
);

/**
 * ============================================
 * CONFIRM OTP AND RESET
 * ============================================
 * 
 * Confirm OTP and Reset Password
 * 
 * @param {Object} data - Reset data
 * @param {string} data.email - User email
 * @param {string} data.otp - OTP code
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>} Reset response
 */
export const confirmOtpAndReset = createAsyncThunk(
  "auth/confirmOtpAndReset",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.confirmOtpAndReset(email, otp, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Failed to reset password");
    }
  }
);

/**
 * ============================================
 * LOGOUT USER
 * ============================================
 * 
 * Logout user and clear all auth data
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    authService.logout();
    return null;
  }
);