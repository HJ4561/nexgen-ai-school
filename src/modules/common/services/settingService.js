// src/services/settingsService.js

import api from "@/services/api";

const settingsService = {
  /**
   * GET /auth/profile
   */
  getProfile: async () => {
    const { data } = await api.get("/auth/profile");
    return data;
  },

  /**
   * PATCH /auth/profile
   */
  updateProfile: async (profileData) => {
    const { data } = await api.patch(
      "/auth/profile",
      profileData
    );
    return data;
  },

  /**
   * PUT /auth/profile
   */
  replaceProfile: async (profileData) => {
    const { data } = await api.put(
      "/auth/profile",
      profileData
    );
    return data;
  },

  /**
   * PUT /auth/change-password
   */
  changePassword: async (passwordData) => {
    const { data } = await api.put(
      "/auth/change-password",
      passwordData
    );
    return data;
  },
};

export default settingsService;
