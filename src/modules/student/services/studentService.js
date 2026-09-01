// src/modules/student/services/studentService.js

import api from "@/services/api";

const studentService = {
  // ─── Profile ──────────────────────────────────────────────────────────────
  
  getProfile: async () => {
    const response = await api.get("/users/students/me/");
    return response.data;
  },

  // ✅ Students cannot update their profile directly
  // Profile updates must go through school administration
  // Only password changes are allowed
  updateProfile: async (profileData) => {
    // This will throw an error if called
    throw new Error('Profile updates are managed by school administration. Please contact your school office for any changes.');
  },

  // ─── Password Change ──────────────────────────────────────────────────────

  changePassword: async (passwordData) => {
    const response = await api.post("/auth/change-password/", passwordData);
    return response.data;
  },

  // ─── Attendance ──────────────────────────────────────────────────────────

  getAttendance: async (params = {}) => {
    const response = await api.get("/attendance/attendance/", { params });
    return response.data;
  },

  // ─── Behavior Logs ──────────────────────────────────────────────────────

  getBehaviorLogs: async (params = {}) => {
    const response = await api.get("/attendance/behavior-logs/", { params });
    return response.data;
  },

  // ─── Report Card / Grades ───────────────────────────────────────────────

  getReportCard: async (params = {}) => {
    try {
      const response = await api.get("/exams/results/", { params });
      
      const results = response.data?.results || response.data || [];
      
      const grades = results.map((item) => ({
        id: item.id,
        subject_name: item.exam?.name || item.subject_name || "General",
        teacher_name: item.teacher?.name || item.teacher_name || "N/A",
        exam_type: item.exam?.exam_type || item.exam_type || "General",
        obtained_marks: item.marks_obtained || 0,
        total_marks: item.exam?.total_marks || item.total_marks || 100,
        exam_date: item.exam?.date || item.created_at || new Date().toISOString(),
      }));

      return {
        academic_year: "2025-2026",
        published_at: new Date().toISOString(),
        remarks: response.data?.remarks || "No remarks available.",
        grades: grades,
      };
    } catch (error) {
      console.error("Error fetching report card:", error);
      return {
        academic_year: "2025-2026",
        published_at: new Date().toISOString(),
        remarks: "No results available.",
        grades: [],
      };
    }
  },

  // ─── Results ─────────────────────────────────────────────────────────────

  getResults: async (params = {}) => {
    const response = await api.get("/exams/results/", { params });
    console.log("📋 getResults raw response:", response.data);
    return response.data;
  },

  // ─── Grade Scale ─────────────────────────────────────────────────────────

  getGradeScale: async (params = {}) => {
    const response = await api.get("/exams/grade-scale/", { params });
    console.log("📋 getGradeScale raw response:", response.data);
    return response.data;
  },

  // ─── Exams ───────────────────────────────────────────────────────────────

  getExams: async (params = {}) => {
    const response = await api.get("/exams/exams/", { params });
    console.log("📋 getExams raw response:", response.data);
    return response.data;
  },

  // ─── Timetable ──────────────────────────────────────────────────────────

  getTimetable: async (params = {}) => {
    const response = await api.get("/academics/timetable/", { params });
    return response.data;
  },

  // ─── Assignments ─────────────────────────────────────────────────────────

  getAssignments: async (params = {}) => {
    try {
      const response = await api.get("/assignments/assignments/", { params });
      console.log("📋 getAssignments status:", response.status);
      return response.data;
    } catch (error) {
      console.error("❌ getAssignments error:", error.message);
      return { results: [] };
    }
  },

  getSubmissions: async (params = {}) => {
    try {
      const response = await api.get("/assignments/submissions/", { params });
      console.log("📋 getSubmissions status:", response.status);
      return response.data;
    } catch (error) {
      console.error("❌ getSubmissions error:", error.message);
      return { results: [] };
    }
  },

  submitAssignment: async (submissionData) => {
    // Check if we have a File object
    if (submissionData.file instanceof File) {
      const formData = new FormData();
      
      // Required fields
      formData.append('assignment', submissionData.assignment);
      formData.append('file', submissionData.file);
      
      // Optional fields
      if (submissionData.description) {
        formData.append('description', submissionData.description);
      }
      
      // Try adding student ID
      try {
        const authData = JSON.parse(localStorage.getItem('auth_data') || '{}');
        const studentId = authData.user_id || authData.id || localStorage.getItem('student_id');
        if (studentId) {
          formData.append('student', studentId);
          console.log('📎 Adding student ID:', studentId);
        }
      } catch (e) {
        console.warn('Could not get student ID:', e);
      }
      
      try {
        const response = await api.post("/assignments/submissions/", formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('❌ Submit error details:', error.response?.data);
        console.error('❌ Submit error status:', error.response?.status);
        console.error('❌ Submit error headers:', error.response?.headers);
        throw error;
      }
    }
    
    // If no file, send as JSON
    const response = await api.post("/assignments/submissions/", submissionData);
    return response.data;
  },

  updateSubmission: async (id, submissionData) => {
    const response = await api.patch(`/assignments/submissions/${id}/`, submissionData);
    return response.data;
  },

  deleteSubmission: async (id) => {
    await api.delete(`/assignments/submissions/${id}/`);
  },

  // ─── Finance ─────────────────────────────────────────────────────────────

  getFees: async (params = {}) => {
    const response = await api.get("/finance/fees/", { params });
    return response.data;
  },

  getPayments: async (params = {}) => {
    const response = await api.get("/finance/payments/", { params });
    return response.data;
  },

  getFeeHistory: async (params = {}) => {
    const response = await api.get("/finance/fee-history/", { params });
    return response.data;
  },

  // ─── Events ─────────────────────────────────────────────────────────────

  getEvents: async (params = {}) => {
    const response = await api.get("/events/events/", { params });
    return response.data;
  },

  getParticipations: async (params = {}) => {
    const response = await api.get("/events/event-participation/", { params });
    return response.data;
  },

  registerForEvent: async (data) => {
    const response = await api.post("/events/event-participation/", data);
    return response.data;
  },

  getCertificates: async (params = {}) => {
    const response = await api.get("/events/certificates/", { params });
    return response.data;
  },

  // ─── Transport ──────────────────────────────────────────────────────────

  getBusStudents: async (params = {}) => {
    const response = await api.get("/transport/bus-students/", { params });
    return response.data;
  },

  getTransportAttendance: async (params = {}) => {
    const response = await api.get("/transport/transport-attendance/", { params });
    return response.data;
  },

  getRoutes: async (params = {}) => {
    const response = await api.get("/transport/routes/", { params });
    return response.data;
  },

  // ─── Library ─────────────────────────────────────────────────────────────

  getBookIssues: async (params = {}) => {
    const response = await api.get("/library/book-issues/", { params });
    return response.data;
  },

  getBookIssueHistory: async (params = {}) => {
    const response = await api.get("/library/book-issue-history/", { params });
    return response.data;
  },

  // ─── Canteen ─────────────────────────────────────────────────────────────

  getMenuItems: async (params = {}) => {
    const response = await api.get("/canteen/menu-items/", { params });
    return response.data;
  },

  getCategories: async (params = {}) => {
    const response = await api.get("/canteen/categories/", { params });
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post("/canteen/order-items/", orderData);
    return response.data;
  },

  getOrders: async (params = {}) => {
    const response = await api.get("/canteen/order-items/", { params });
    return response.data;
  },

  // ─── Security ───────────────────────────────────────────────────────────

  getEntryExitLogs: async (params = {}) => {
    const response = await api.get("/security/entry-exit-logs/", { params });
    return response.data;
  },

  // ─── Documents ──────────────────────────────────────────────────────────

  getDocuments: async (params = {}) => {
    const response = await api.get("/documents/documents/", { params });
    return response.data;
  },

  getDocumentTypes: async (params = {}) => {
    const response = await api.get("/documents/document-types/", { params });
    return response.data;
  },

  // ─── Analytics ──────────────────────────────────────────────────────────

  getPredictions: async (params = {}) => {
    const response = await api.get("/analytics/predictions/", { params });
    return response.data;
  },

  getRecommendations: async (params = {}) => {
    const response = await api.get("/analytics/recommendations/", { params });
    return response.data;
  },

  getStudentGoals: async (params = {}) => {
    const response = await api.get("/analytics/student-goals/", { params });
    return response.data;
  },

  getStudentSkills: async (params = {}) => {
    const response = await api.get("/analytics/student-skills/", { params });
    return response.data;
  },

  getSkillMapping: async (params = {}) => {
    const response = await api.get("/analytics/skill-mapping/", { params });
    return response.data;
  },

  // ─── Complaints ─────────────────────────────────────────────────────────

  getComplaints: async (params = {}) => {
    const response = await api.get("/communication/messages/", { params });
    return response.data;
  },

  createComplaint: async (complaintData) => {
    const response = await api.post("/communication/messages/", {
      subject: complaintData.complaint_type,
      message: complaintData.description,
      receiver: complaintData.against_user || 1,
      student: complaintData.student_id,
    });
    return response.data;
  },

  updateComplaint: async (id, complaintData) => {
    const response = await api.patch(`/communication/messages/${id}/`, complaintData);
    return response.data;
  },

  // ─── Notifications ──────────────────────────────────────────────────────

  getNotifications: async (params = {}) => {
    try {
      const response = await api.get("/communication/notifications/", { params });
      return response.data;
    } catch (error) {
      console.warn("Notifications not available:", error);
      return { results: [] };
    }
  },

  getUnreadNotifications: async () => {
    try {
      const response = await api.get("/communication/notifications/?is_read=false");
      return response.data?.results?.length || response.data?.length || 0;
    } catch (error) {
      return 0;
    }
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/communication/notifications/${id}/`, { is_read: true });
    return response.data;
  },

  markAllNotificationsRead: async () => {
    try {
      const notifications = await api.get("/communication/notifications/?is_read=false");
      const items = notifications.data?.results || notifications.data || [];
      const promises = items.map(n => 
        api.patch(`/communication/notifications/${n.id}/`, { is_read: true })
      );
      await Promise.all(promises);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  // ─── AI Chat ─────────────────────────────────────────────────────────────

  getChatSessions: async (params = {}) => {
    try {
      const response = await api.get("/chat/sessions/", { params });
      return response.data;
    } catch (error) {
      return { results: [] };
    }
  },

  createChatSession: async (sessionData) => {
    try {
      const response = await api.post("/chat/sessions/", sessionData);
      return response.data;
    } catch (error) {
      return {
        id: Date.now(),
        title: sessionData.title ?? "New Chat",
        role: "student",
        bot_type: sessionData.bot_type ?? "general",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },

  deleteChatSession: async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}/`);
      return { success: true, sessionId };
    } catch (error) {
      return { success: true, sessionId };
    }
  },

  getChatMessages: async (params = {}) => {
    try {
      const response = await api.get("/chat/messages/", { params });
      return response.data;
    } catch (error) {
      return { results: [] };
    }
  },

  sendChatMessage: async (messageData) => {
    try {
      const response = await api.post("/chat/messages/", messageData);
      return response.data;
    } catch (error) {
      return {
        id: Date.now(),
        session: messageData.session,
        content: messageData.content,
        role: messageData.role || "user",
        created_at: new Date().toISOString(),
      };
    }
  },
};

export default studentService;