// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || "default-school";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ─── Helper Functions ──────────────────────────────────────────────────────

const getAuthData = () => {
  try {
    const data = localStorage.getItem("auth_data");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const getToken = () => {
  const authData = getAuthData();
  return authData.access || localStorage.getItem("access_token") || null;
};

const getRefreshToken = () => {
  const authData = getAuthData();
  return authData.refresh || localStorage.getItem("refresh_token") || null;
};

// ─── Clear Auth Data ──────────────────────────────────────────────────────

const clearAuthData = () => {
  localStorage.removeItem("auth_data");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user");
  localStorage.removeItem("user_id");
  sessionStorage.removeItem("access_token");
};

// ─── Request Interceptor ──────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Always ensure tenant header is present
    config.headers['X-Tenant-Slug'] = TENANT_SLUG;
    
    if (token) {
      // Try Bearer format (most common for JWT)
      config.headers.Authorization = `Bearer ${token}`;
      
      // If your backend uses Token format instead, uncomment this line and comment the one above:
      // config.headers.Authorization = `Token ${token}`;
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      hasTenant: true,
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      hasData: !!response.data,
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error(`❌ API Error:`, {
      url: originalRequest?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    
    // If it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          console.log("🔄 Attempting token refresh...");
          
          const response = await axios.post(
            `${API_BASE_URL}/token/refresh/`,
            { refresh: refreshToken },
            {
              headers: {
                'X-Tenant-Slug': TENANT_SLUG,
                'Content-Type': 'application/json',
              }
            }
          );
          
          const { access } = response.data;
          
          if (access) {
            // ✅ Update stored tokens
            const authData = getAuthData();
            authData.access = access;
            localStorage.setItem("auth_data", JSON.stringify(authData));
            localStorage.setItem("access_token", access);
            
            console.log("✅ Token refreshed successfully");
            
            // ✅ Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError.response?.data || refreshError.message);
          // Fall through to clear auth
        }
      } else {
        console.warn("⚠️ No refresh token available");
      }
    }
    
    // ✅ Clear auth on any 401 that couldn't be resolved
    if (error.response?.status === 401) {
      console.error("❌ Authentication failed, clearing auth data");
      clearAuthData();
      
      // ✅ Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;