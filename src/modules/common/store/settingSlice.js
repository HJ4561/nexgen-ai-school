import { createSlice } from "@reduxjs/toolkit";

import {
  fetchProfile,
  updateProfile,
  replaceProfile,
  changePassword,
} from "./settingThunks";

const initialState = {
  profile: {},

  loading: false,

  updating: false,

  passwordLoading: false,

  success: null,

  error: null,
};

const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {
    clearSettingsState: (state) => {
      state.success = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /*
      ===========================================
      Fetch Profile
      ===========================================
      */

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })

      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /*
      ===========================================
      Update Profile (PATCH)
      ===========================================
      */

      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.success =
          "Profile updated successfully.";
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /*
      ===========================================
      Replace Profile (PUT)
      ===========================================
      */

      .addCase(replaceProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(replaceProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.profile = action.payload;
        state.success =
          "Profile replaced successfully.";
      })

      .addCase(replaceProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      /*
      ===========================================
      Change Password
      ===========================================
      */

      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.error = null;
      })

      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.success =
          action.payload.message ||
          "Password updated successfully.";
      })

      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSettingsState,
} = settingsSlice.actions;

export default settingsSlice.reducer;