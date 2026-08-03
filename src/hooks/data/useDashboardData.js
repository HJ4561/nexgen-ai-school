// src/hooks/data/useDashboardData.js
import { useEffect, useState, useCallback } from "react";
import api from "@/services/api";

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("📊 Fetching dashboard data from API...");
      
      // Fetch all data in parallel
      const [
        studentsRes,
        teachersRes,
        parentsRes,
        staffRes,
        usersRes,
      ] = await Promise.all([
        api.get("/users/students/").catch(() => ({ data: { results: [] } })),
        api.get("/users/teachers/").catch(() => ({ data: { results: [] } })),
        api.get("/users/parents/").catch(() => ({ data: { results: [] } })),
        api.get("/users/staff/").catch(() => ({ data: { results: [] } })),
        api.get("/users/users/").catch(() => ({ data: { results: [] } })),
      ]);

      // Extract data
      const students = studentsRes.data?.results || studentsRes.data || [];
      const teachers = teachersRes.data?.results || teachersRes.data || [];
      const parents = parentsRes.data?.results || parentsRes.data || [];
      const staff = staffRes.data?.results || staffRes.data || [];
      const allUsers = usersRes.data?.results || usersRes.data || [];

      // Get pending approvals (users with status pending)
      const pending = allUsers.filter(user => user.status === "pending" || user.status === "Pending");

      console.log("✅ Students:", students.length);
      console.log("✅ Teachers:", teachers.length);
      console.log("✅ Parents:", parents.length);
      console.log("✅ Staff:", staff.length);
      console.log("✅ Pending Approvals:", pending.length);

      // Build stats object
      const dashboardStats = {
        total_students: students.length,
        total_teachers: teachers.length,
        total_parents: parents.length,
        total_staff: staff.length,
        monthly_revenue: 45000, // You can calculate from finance endpoints
        open_complaints: 0, // You can fetch from complaints endpoint
        pending_approvals: pending.length,
        avg_attendance: 92, // You can fetch from attendance endpoint
        fee_collection_chart: [
          { month: "Jan", collected: 35000 },
          { month: "Feb", collected: 38000 },
          { month: "Mar", collected: 42000 },
          { month: "Apr", collected: 40000 },
          { month: "May", collected: 45000 },
          { month: "Jun", collected: 43000 },
        ],
        attendance_trend: [
          { day: "Mon", percentage: 88 },
          { day: "Tue", percentage: 92 },
          { day: "Wed", percentage: 90 },
          { day: "Thu", percentage: 94 },
          { day: "Fri", percentage: 89 },
        ],
      };

      setStats(dashboardStats);
      setPendingApprovals(pending.slice(0, 5));

      // Mock notifications (you can fetch from /communication/notifications/)
      setRecentNotifications([
        { id: 1, message: "Welcome to the Admin Dashboard", is_read: false, type: "approval", created_at: new Date().toISOString() },
        { id: 2, message: "System is ready", is_read: true, type: "fee", created_at: new Date().toISOString() },
      ]);

      // Mock events (you can fetch from /events/events/)
      setUpcomingEvents([
        { id: 1, event_name: "Parent-Teacher Meeting", event_date: new Date(Date.now() + 86400000 * 7).toISOString(), venue: "School Hall" },
      ]);

    } catch (err) {
      console.error("❌ Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to fetch dashboard data");
      
      // Set fallback data
      setStats({
        total_students: 0,
        total_teachers: 0,
        total_parents: 0,
        total_staff: 0,
        monthly_revenue: 0,
        open_complaints: 0,
        pending_approvals: 0,
        avg_attendance: 0,
        fee_collection_chart: [],
        attendance_trend: [],
      });
      setPendingApprovals([]);
      setRecentNotifications([]);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    loading,
    error,
    stats,
    pendingApprovals,
    recentNotifications,
    upcomingEvents,
    refetch: fetchData,
  };
};

export default useDashboardData;
