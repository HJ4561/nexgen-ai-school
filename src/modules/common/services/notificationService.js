// src/modules/common/services/notificationService.js
import api from "@/services/api";

class NotificationService {
  // Use mock data instead of API
  async getUnreadCount() {
    // Mock data - returns 0 unread notifications
    return { count: 0 };
  }

  async getNotifications(params = {}) {
    // Mock data - returns empty array
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }

  async markAsRead(id) {
    // Mock success
    return { success: true };
  }

  async markAllAsRead() {
    // Mock success
    return { success: true };
  }

  // Keep real API for other methods if needed
  async createNotification(data) {
    const response = await api.post("/notifications/", data);
    return response.data;
  }
}

export default new NotificationService();
