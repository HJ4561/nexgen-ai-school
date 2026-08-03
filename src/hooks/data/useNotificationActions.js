import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  markNotificationRead,
  markAllNotificationsRead,
  sendNotification
} from '@/modules/admin/store/adminNotificationThunks';

export function useNotificationActions({ refetch, showToast }) {
  const dispatch = useDispatch();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sendForm, setSendForm] = useState({ 
    recipientType: 'role', 
    target_role: 'Student', 
    message: '' 
  });

  const handleMarkRead = async (id) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
      await refetch();
      showToast('Notification marked as read', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to mark notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      await refetch();
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to mark all notifications', 'error');
    }
  };

  const handleSend = async () => {
    try {
      await dispatch(sendNotification(sendForm)).unwrap();
      await refetch();
      showToast('Notification sent successfully', 'success');
      setIsDrawerOpen(false);
      setSendForm({ recipientType: 'role', target_role: 'Student', message: '' });
    } catch (error) {
      showToast(error.message || 'Failed to send notification', 'error');
    }
  };

  return {
    isDrawerOpen,
    setIsDrawerOpen,
    sendForm,
    setSendForm,
    handleMarkRead,
    handleMarkAllRead,
    handleSend
  };
}


export default useNotificationActions;
