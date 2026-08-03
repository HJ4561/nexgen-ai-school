import { createAsyncThunk } from "@reduxjs/toolkit";
import settingsService from "@/modules/common/services/settingService"

/**
 * ===========================================
 * Fetch Profile
 * GET /auth/profile
 * ===========================================
 */
export const fetchProfile = createAsyncThunk(
  "settings/fetchProfile",
  async (role, { rejectWithValue }) => {
    try {
      console.log("role", role);
      return await settingsService.getProfile(role);

    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch profile."
      );
    }
  }
);

/**
 * ===========================================
 * Update Profile
 * PATCH /auth/profile
 * ===========================================
 */
export const updateProfile = createAsyncThunk(
  "settings/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      return await settingsService.updateProfile(profileData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
        error.message ||
        "Failed to update profile."
      );
    }
  }
);

/**
 * ===========================================
 * Replace Profile
 * PUT /auth/profile
 * ===========================================
 */
export const replaceProfile = createAsyncThunk(
  "settings/replaceProfile",
  async ({ role, profileData }, { rejectWithValue }) => {
    try {
      return await settingsService.replaceProfile(
        role,
        profileData
      );
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to replace profile."
      );
    }
  }
);

/**
 * ===========================================
 * Change Password
 * PUT /auth/change-password
 * ===========================================
 */
export const changePassword = createAsyncThunk(
  "settings/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      return await settingsService.changePassword(
        passwordData
      );
    } catch (error) {
      return rejectWithValue(
        error.message ||
          "Failed to change password."
      );
    }
  }
);

