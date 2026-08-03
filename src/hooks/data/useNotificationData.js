import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePagination } from "@/hooks/data";
import { 
  fetchNotifications,
  fetchUnreadCount 
} from '@/modules/admin/store/adminNotificationThunks';
import { fetchAllUsers } from '@/modules/admin/store/adminThunks';

// Mock data for development
const MOCK_NOTIFICATIONS = [
  { id: 1, message: 'New student registration pending approval', type: 'approval', is_read: false, created_at: new Date().toISOString() },
  { id: 2, message: 'Fee payment received from Class 10-A', type: 'fee', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, message: 'Complaint #45 has been resolved', type: 'complaint', is_read: true, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, message: 'Behavior report submitted for Student XYZ', type: 'behavior', is_read: false, created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: 5, message: 'Fee challans generated for Class 10-A', type: 'fee', is_read: false, created_at: new Date(Date.now() - 14400000).toISOString() },
];

const MOCK_USERS = [
  { id: 1, full_name: 'Ahmed Khan', email: 'ahmed@example.com', role_name: 'Teacher' },
  { id: 2, full_name: 'Sara Ali', email: 'sara@example.com', role_name: 'Student' },
  { id: 3, full_name: 'Usman Malik', email: 'usman@example.com', role_name: 'Parent' },
];

const ITEMS_PER_PAGE = 10;

export function useNotificationData() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Use API data if available, otherwise use mock data
  const apiNotifications = useSelector(state => state.adminNotification?.notifications || []);
  const apiUsers = useSelector(state => state.admin?.users || []);
  const apiUnreadCount = useSelector(state => state.adminNotification?.unreadCount || 0);

  const notifications = apiNotifications.length > 0 ? apiNotifications : MOCK_NOTIFICATIONS;
  const users = apiUsers.length > 0 ? apiUsers : MOCK_USERS;
  const unreadCount = apiUnreadCount > 0 ? apiUnreadCount : MOCK_NOTIFICATIONS.filter(n => !n.is_read).length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchNotifications()),
          dispatch(fetchUnreadCount()),
          dispatch(fetchAllUsers()),
        ]);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const filteredData = useMemo(() => {
    let data = [...notifications];
    if (filter === 'unread') {
      data = data.filter(n => !n.is_read);
    } else if (filter === 'read') {
      data = data.filter(n => n.is_read);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(n => 
        n.message?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [notifications, filter, search]);

  const pagination = usePagination(filteredData, ITEMS_PER_PAGE);

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
    recipients: users.length,
  };

  return {
    notifications: pagination.paginatedData,
    users,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    unreadCount,
    stats,
    paginatedData: pagination.paginatedData,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    totalItems: pagination.totalItems,
    goToPage: pagination.goToPage,
    itemsPerPage: ITEMS_PER_PAGE,
    refetch: () => {
      dispatch(fetchNotifications());
      dispatch(fetchUnreadCount());
    }
  };
}



export default useNotificationData;
