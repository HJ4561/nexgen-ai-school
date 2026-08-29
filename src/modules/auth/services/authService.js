// src/modules/auth/services/authService.js
import api from "@/services/api";

class AuthService {
  /**
   * ============================================
   * LOGIN
   * ============================================
   * 
   * Login user with email and password
   * Stores tokens in localStorage for subsequent requests
   * 
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {string} credentials.role - Optional role (default: 'admin')
   * @returns {Promise<Object>} User data with tokens
   */
  async login(credentials) {
    try {
      const response = await api.post("/token/", {
        email: credentials.email,
        password: credentials.password,
      });

      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error("Invalid response from server: missing tokens");
      }

      // ✅ Get user info if available, or use provided role
      const user = response.data.user || null;
      const role = credentials.role || user?.role || "student";

      // ✅ Store auth data in localStorage
      const authData = {
        access,
        refresh,
        user: user,
        role: role,
        user_id: user?.id || null,
      };

      localStorage.setItem("auth_data", JSON.stringify(authData));
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("user_role", role);

      if (user?.id) {
        localStorage.setItem("user_id", String(user.id));
      }

      console.log("✅ Login successful, tokens stored:", {
        hasAccess: !!access,
        hasRefresh: !!refresh,
        role: role,
      });

      return {
        ...response.data,
        role: role,
      };
    } catch (error) {
      console.error("❌ Login error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * ============================================
   * REFRESH TOKEN
   * ============================================
   * 
   * Refresh access token using refresh token
   * 
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post("/token/refresh/", {
        refresh: refreshToken,
      });

      const { access } = response.data;

      if (access) {
        // ✅ Update stored tokens
        const authData = this.getAuthData();
        authData.access = access;
        localStorage.setItem("auth_data", JSON.stringify(authData));
        localStorage.setItem("access_token", access);
        console.log("✅ Token refreshed successfully");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Token refresh error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * ============================================
   * REGISTER
   * ============================================
   * 
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user data
   */
  async register(userData) {
    try {
      const response = await api.post("/register/", userData);
      return response.data;
    } catch (error) {
      console.error("❌ Register error:", error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * ============================================
   * GET PROFILE
   * ============================================
   * 
   * Get current user profile based on role
   * 
   * @param {string} role - User role (student, teacher, admin, parent, staff)
   * @returns {Promise<Object>} User profile data
   */
  async getProfile(role) {
    try {
      // Try role-specific endpoint first
      const response = await api.get(`/users/${role}/me/`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          // Fallback to generic endpoint
          const response = await api.get("/users/me/");
          return response.data;
        } catch (err) {
          // Return basic info if all fails
          console.warn("⚠️ Could not fetch profile, using fallback");
          return {
            id: 0,
            role_name: role || "student",
            status: "Active",
          };
        }
      }
      throw error;
    }
  }

  /**
   * ============================================
   * GET AUTH DATA
   * ============================================
   * 
   * Get auth data from localStorage
   * 
   * @returns {Object} Auth data
   */
  getAuthData() {
    try {
      const data = localStorage.getItem("auth_data");
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * ============================================
   * GET TOKEN
   * ============================================
   * 
   * Get access token from localStorage
   * 
   * @returns {string|null} Access token
   */
  getToken() {
    const authData = this.getAuthData();
    return authData.access || localStorage.getItem("access_token") || null;
  }

  /**
   * ============================================
   * GET REFRESH TOKEN
   * ============================================
   * 
   * Get refresh token from localStorage
   * 
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    const authData = this.getAuthData();
    return authData.refresh || localStorage.getItem("refresh_token") || null;
  }

  /**
   * ============================================
   * GET USER ROLE
   * ============================================
   * 
   * Get user role from localStorage
   * 
   * @returns {string|null} User role
   */
  getUserRole() {
    const authData = this.getAuthData();
    return authData.role || localStorage.getItem("user_role") || null;
  }

  /**
   * ============================================
   * IS AUTHENTICATED
   * ============================================
   * 
   * Check if user is authenticated
   * 
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * ============================================
   * LOGOUT
   * ============================================
   * 
   * Logout user and clear all auth data
   */
  logout() {
    localStorage.removeItem("auth_data");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("auth_data");
    
    console.log("👋 Logged out, auth data cleared");
    
    // ✅ Redirect to login if not already there
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  /**
   * ============================================
   * UPDATE AUTH DATA
   * ============================================
   * 
   * Update auth data in localStorage
   * 
   * @param {Object} data - Updated auth data
   */
  updateAuthData(data) {
    const current = this.getAuthData();
    const updated = { ...current, ...data };
    localStorage.setItem("auth_data", JSON.stringify(updated));
    
    if (data.access) {
      localStorage.setItem("access_token", data.access);
    }
    if (data.refresh) {
      localStorage.setItem("refresh_token", data.refresh);
    }
    if (data.role) {
      localStorage.setItem("user_role", data.role);
    }
  }
}

export default new AuthService();