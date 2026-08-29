// src/modules/auth/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  fetchUserProfile, 
  refreshAccessToken 
} from "./authThunks";

// ─── Get initial auth state from localStorage ──────────────────────────

const getInitialAuth = () => {
  try {
    const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
    const role = authData.role || localStorage.getItem("user_role") || null;
    
    return {
      isAuthenticated: !!authData.access,
      user: authData.user || null,
      role: role,
      accessToken: authData.access || null,
      refreshToken: authData.refresh || null,
      loading: false,
      error: null,
    };
  } catch {
    return {
      isAuthenticated: false,
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
    };
  }
};

const initialState = getInitialAuth();

// ─── Slice ──────────────────────────────────────────────────────────────

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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
    },
    setUser: (state, action) => {
      state.user = action.payload.user || state.user;
      state.role = action.payload.role || state.role;
      state.isAuthenticated = true;
      if (action.payload.access) {
        state.accessToken = action.payload.access;
      }
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh;
      }
    },
  },
  extraReducers: (builder) => {
    // ─── Login ──────────────────────────────────────────────────────
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
        state.user = action.payload.user || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      });

    // ─── Register ────────────────────────────────────────────────────
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

    // ─── Fetch Profile ──────────────────────────────────────────────
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

    // ─── Refresh Token ──────────────────────────────────────────────
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.role = null;
        state.user = null;
        state.error = action.payload || "Session expired";
      });

    // ─── Logout ──────────────────────────────────────────────────────
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

// ─── Export Actions ──────────────────────────────────────────────────────

export const { 
  clearAuthError, 
  setAuthState, 
  resetAuth, 
  logout,
  setUser,
} = authSlice.actions;

// ─── Export Selectors ──────────────────────────────────────────────────────

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;

// ─── Export Reducer ──────────────────────────────────────────────────────

export default authSlice.reducer;