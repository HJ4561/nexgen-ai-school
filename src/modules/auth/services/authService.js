// src/modules/auth/services/authService.js
import api from "@/services/api";

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials) {
    const response = await api.post("/token/", {
      email: credentials.email,
      password: credentials.password,
    });
    
    if (response.data) {
      response.data.role = credentials.role || "admin";
    }
    
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const response = await api.post("/token/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const response = await api.post("/register/", userData);
    return response.data;
  }

  /**
   * Get current user profile based on role
   */
  async getProfile(role) {
    try {
      // Try role-specific endpoint
      const response = await api.get(`/users/${role}/me/`);
      return response.data;
    } catch (error) {
      try {
        // Fallback to generic
        const response = await api.get("/users/me/");
        return response.data;
      } catch (err) {
        // Return basic info
        return {
          id: 0,
          role_name: role || "admin",
          status: "Active",
        };
      }
    }
  }

  /**
   * Logout user (clear tokens)
   */
  logout() {
    localStorage.removeItem("auth_data");
    localStorage.removeItem("user_role");
  }
}

export default new AuthService();
