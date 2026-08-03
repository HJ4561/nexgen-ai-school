import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboardStats, fetchApprovals } from '@/modules/admin/store/adminThunks';
import { fetchNotifications } from '@/modules/admin/store/adminNotificationThunks';
import { fetchEvents } from '@/modules/admin/store/adminEventThunks';

// Mock data for development when API fails
const MOCK_STATS = {
  total_students: 1250,
  total_teachers: 85,
  total_parents: 980,
  monthly_revenue: 21500,
  open_complaints: 12,
  avg_attendance: 87,
  pending_approvals: 8,
  fee_collection_chart: [
    { month: 'Jan', collected: 12000 },
    { month: 'Feb', collected: 15000 },
    { month: 'Mar', collected: 18000 },
    { month: 'Apr', collected: 20000 },
    { month: 'May', collected: 21500 },
    { month: 'Jun', collected: 19500 },
  ],
  attendance_trend: [
    { day: 'Mon', percentage: 85 },
    { day: 'Tue', percentage: 88 },
    { day: 'Wed', percentage: 82 },
    { day: 'Thu', percentage: 90 },
    { day: 'Fri', percentage: 87 },
    { day: 'Sat', percentage: 75 },
  ]
};

const MOCK_APPROVALS = [
  { id: 1, full_name: 'Ahmed Khan', email: 'ahmed@example.com', role_name: 'Teacher', status: 'pending' },
  { id: 2, full_name: 'Sara Ali', email: 'sara@example.com', role_name: 'Student', status: 'pending' },
  { id: 3, full_name: 'Usman Malik', email: 'usman@example.com', role_name: 'Parent', status: 'pending' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, message: 'New student registration pending approval', type: 'approval', is_read: false, created_at: new Date().toISOString() },
  { id: 2, message: 'Fee payment received from Class 10-A', type: 'fee', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, message: 'Complaint #45 has been resolved', type: 'complaint', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, message: 'Behavior report submitted for Student XYZ', type: 'behavior', is_read: false, created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, message: 'Fee challans generated for Class 10-A', type: 'fee', is_read: false, created_at: new Date(Date.now() - 14400000).toISOString() },
];

const MOCK_EVENTS = [
  { id: 1, event_name: 'Annual Sports Day', event_date: new Date(Date.now() + 86400000 * 5).toISOString(), venue: 'School Ground' },
  { id: 2, event_name: 'Parent-Teacher Meeting', event_date: new Date(Date.now() + 86400000 * 12).toISOString(), venue: 'Auditorium' },
  { id: 3, event_name: 'Science Exhibition', event_date: new Date(Date.now() + 86400000 * 20).toISOString(), venue: 'Science Lab' },
];

export function useDashboardData() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const approvals = useSelector((state) => state.admin?.approvals || []);
  const notifications = useSelector((state) => state.adminNotification?.notifications || []);
  const events = useSelector((state) => state.adminEvent?.events || []);

  // Use API data if available, otherwise use mock data
  const hasApiData = stats && Object.keys(stats).length > 0 && stats.total_students > 0;
  const finalStats = hasApiData ? stats : MOCK_STATS;
  const finalApprovals = approvals.length > 0 ? approvals : MOCK_APPROVALS;
  const finalNotifications = notifications.length > 0 ? notifications : MOCK_NOTIFICATIONS;
  const finalEvents = events.length > 0 ? events : MOCK_EVENTS;

  const pendingApprovals = useMemo(() => {
    return (finalApprovals || []).filter((a) => a.status === 'pending' || a.status === 'Pending').slice(0, 5);
  }, [finalApprovals]);

  const recentNotifications = useMemo(() => {
    return (finalNotifications || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [finalNotifications]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (finalEvents || [])
      .filter((e) => new Date(e.event_date) >= now)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      .slice(0, 3);
  }, [finalEvents]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await dispatch(fetchAdminDashboardStats()).unwrap();
        setStats(statsData);
        await Promise.all([
          dispatch(fetchApprovals()),
          dispatch(fetchNotifications()),
          dispatch(fetchEvents()),
        ]);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        // Use mock data on error
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return {
    loading,
    error,
    stats: finalStats,
    pendingApprovals,
    recentNotifications,
    upcomingEvents,
  };
}

