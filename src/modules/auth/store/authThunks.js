// src/modules/auth/store/authThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../services/authService";

/**
 * Login user with email, password, and role
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      const authData = {
        access: response.access,
        refresh: response.refresh,
        role: credentials.role || "admin",
      };
      localStorage.setItem("auth_data", JSON.stringify(authData));
      localStorage.setItem("user_role", credentials.role || "admin");
      
      return response;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
                           error.response.data?.message || 
                           "Invalid email or password";
        return rejectWithValue(errorMessage);
      } else if (error.request) {
        return rejectWithValue("Network error - Please check your connection");
      } else {
        return rejectWithValue(error.message || "Login failed");
      }
    }
  }
);

/**
 * Fetch user profile based on role
 */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const role = localStorage.getItem("user_role") || "admin";
      const response = await authService.getProfile(role);
      
      if (!response) {
        const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
        return {
          id: 0,
          role_name: role,
          status: "Active",
          email: authData.email || "",
        };
      }
      
      return response;
    } catch (error) {
      const role = localStorage.getItem("user_role") || "admin";
      return {
        id: 0,
        role_name: role,
        status: "Active",
      };
    }
  }
);

/**
 * Refresh access token
 */
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
      if (!authData.refresh) {
        return rejectWithValue("No refresh token available");
      }
      
      const response = await authService.refreshToken(authData.refresh);
      
      authData.access = response.access;
      localStorage.setItem("auth_data", JSON.stringify(authData));
      
      return response;
    } catch (error) {
      localStorage.removeItem("auth_data");
      localStorage.removeItem("user_role");
      return rejectWithValue("Session expired - Please login again");
    }
  }
);

/**
 * Register a new user
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
 * Request OTP for password reset
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
 * Forgot Password - Request OTP
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
 * Confirm OTP and Reset Password
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
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async () => {
    authService.logout();
    return null;
  }
);
