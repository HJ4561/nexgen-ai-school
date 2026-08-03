// src/services/api.js
import axios from "axios";

const API_BASE_URL = "https://school-backend-new-rho.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
    const token = authData.access || localStorage.getItem("access_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token attached:", token.substring(0, 20) + "...");
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 by redirecting to login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If token expired (401) and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authData = JSON.parse(localStorage.getItem("auth_data") || "{}");
        const refreshToken = authData.refresh;
        
        if (refreshToken) {
          console.log("🔄 Attempting token refresh...");
          const response = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            { refresh: refreshToken }
          );
          
          const { access } = response.data;
          authData.access = access;
          localStorage.setItem("auth_data", JSON.stringify(authData));
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          console.log("✅ Token refreshed, retrying request");
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);
        localStorage.removeItem("auth_data");
        localStorage.removeItem("user_role");
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
