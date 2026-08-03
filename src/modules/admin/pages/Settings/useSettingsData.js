import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, fetchAllUsers } from '@/modules/admin/store/adminThunks';
import { fetchNotifications } from '@/modules/admin/store/adminNotificationThunks';

export function useSettingsData() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.admin || {});
  const { notifications = [], unreadCount = 0 } = useSelector(state => state.adminNotification || {});
  
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_parents: 0,
    open_complaints: 0
  });
  
  const [feeStats, setFeeStats] = useState({
    activeChallans: 0,
    totalRevenue: 0,
    totalScholarship: 0,
    totalBase: 0
  });

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(fetchNotifications());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Calculate stats from users data
  useEffect(() => {
    if (user) {
      // In a real app, these would come from the API
      setStats({
        total_students: 150,
        total_teachers: 25,
        total_parents: 120,
        open_complaints: 5
      });
      
      setFeeStats({
        activeChallans: 45,
        totalRevenue: 250000,
        totalScholarship: 15000,
        totalBase: 265000
      });
    }
  }, [user]);

  const adminId = user?.id || null;

  return {
    user,
    adminId,
    feeStats,
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    refetch: () => {
      dispatch(fetchSettings());
      dispatch(fetchNotifications());
      dispatch(fetchAllUsers());
    }
  };
}
