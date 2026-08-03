// src/modules/auth/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, logoutUser, fetchUserProfile, refreshAccessToken } from "./authThunks";

// Get initial auth state from localStorage
const getInitialAuth = () => {
  const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
  return {
    isAuthenticated: !!authData.access,
    user: null,
    role: authData.role || null,
    accessToken: authData.access || null,
    refreshToken: authData.refresh || null,
    loading: false,
    error: null,
  };
};

const initialState = getInitialAuth();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
    setAuthState: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetAuth: () => initialState,
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      localStorage.removeItem("auth_data");
      localStorage.removeItem("user_role");
    },
  },
  extraReducers: (builder) => {
    // ============= Login =============
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.role = action.payload.role || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      });

    // ============= Register =============
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });

    // ============= Fetch Profile =============
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      });

    // ============= Refresh Token =============
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.role = null;
        state.user = null;
      });

    // ============= Logout Thunk =============
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
    });
  },
});

export const { clearAuthError, setAuthState, resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;
