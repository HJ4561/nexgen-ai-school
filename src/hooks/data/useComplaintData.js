// src/hooks/data/useComplaintData.js

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages } from '@/modules/teacher/store/teacherThunks';
import { 
  selectTeacherMessages, 
  selectTeacherLoading, 
  selectTeacherError 
} from '@/modules/teacher/store/teacherSlice';

export function useComplaintData() {
  const dispatch = useDispatch();
  
  // Use the selectors that now exist
  const messages = useSelector(selectTeacherMessages) || [];
  const loading = useSelector(selectTeacherLoading);
  const error = useSelector(selectTeacherError);
  
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    console.log('🔄 Fetching complaint data...');
    dispatch(fetchMessages());
  }, [dispatch, refetchTrigger]);

  // Transform messages to complaint format
  const complaints = useMemo(() => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return [];
    }
    
    console.log('📋 Raw messages:', messages);
    
    return messages.map((msg) => ({
      id: msg.id,
      subject: msg.subject || 'Complaint',
      complaint_type: msg.subject || 'General',
      description: msg.message || msg.content || '',
      message: msg.message || msg.content || '',
      status: msg.status || 'pending',
      priority: msg.priority || 'medium',
      created_at: msg.created_at,
      updated_at: msg.updated_at,
      against_user: msg.receiver || msg.receiver_id,
      user: msg.sender || msg.sender_id,
      reporter: msg.sender || msg.sender_id,
      reporter_name: msg.sender_name || msg.sender?.name || `User ${msg.sender || msg.sender_id}`,
      category: msg.category || 'General',
      resolution_notes: msg.resolution_notes || null,
      admin_remarks: msg.admin_remarks || null,
      is_read: msg.is_read || false,
    }));
  }, [messages]);

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return {
    complaints,
    loading,
    error,
    refetch,
  };
}

export default useComplaintData;