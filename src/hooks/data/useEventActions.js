import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createEvent, updateEvent, deleteEvent, addParticipant, removeParticipant, generateCertificate } from "@/modules/admin/store/adminEventThunks";
import { useSelector } from 'react-redux';
export function useEventActions({ refetch, showToast}) {
    const { participants = [] } = useSelector(state => state.adminEvent);
  const dispatch = useDispatch();

  // ─── Event Drawer ───────────────────────────
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [eventDrawerMode, setEventDrawerMode] = useState('add');
  const [eventFormData, setEventFormData] = useState({ event_name: '', event_date: '', venue: '' });

  // ─── Participant Drawer ────────────────────
  const [isParticipantDrawerOpen, setIsParticipantDrawerOpen] = useState(false);
  const [participantEvent, setParticipantEvent] = useState(null);

  // ─── Add Participant Drawer ────────────────
  const [isAddParticipantDrawerOpen, setIsAddParticipantDrawerOpen] = useState(false);
  const [newParticipantData, setNewParticipantData] = useState({ student_name: '', role: 'Participant', position: '' });

  // ─── Certificate ────────────────────────────
  const [certificateEventId, setCertificateEventId] = useState(null);

  // ─── Delete ──────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ─── Handlers ─────────────────────────────────
  const handleAddEvent = () => {
    setEventDrawerMode('add');
    setEventFormData({ event_name: '', event_date: '', venue: '' });
    setIsEventDrawerOpen(true);
  };

  const handleEditEvent = (event) => {
    setEventDrawerMode('edit');
    setEventFormData({ ...event });
    setIsEventDrawerOpen(true);
  };

  const handleDeleteEvent = (event) => {
    setDeleteTarget(event);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteEvent(deleteTarget.id)).unwrap();
      showToast('Event deleted successfully!', 'success');
      refetch();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
    setIsDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleSaveEvent = async () => {
    try {
      if (eventDrawerMode === 'add') {
        await dispatch(createEvent(eventFormData)).unwrap();
        showToast('Event created!', 'success');
      } else {
        await dispatch(updateEvent(eventFormData)).unwrap();
        showToast('Event updated!', 'success');
      }
      setIsEventDrawerOpen(false);
      refetch();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  const handleOpenParticipants = (event) => {
    setParticipantEvent(event);
    setIsParticipantDrawerOpen(true);
  };

  const handleRemoveParticipant = async (participantId) => {
    try {
      await dispatch(removeParticipant(participantId)).unwrap();
      showToast('Participant removed', 'success');
      refetch();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };


// src/modules/admin/pages/EventManagement/hooks/useEventActions.js

const handleAddNewParticipant = async () => {
  if (!participantEvent || !newParticipantData.student_id) {
    showToast('Please select a student.', 'error');
    return;
  }
  try {
    const payload = {
      event: participantEvent.id,
      student: newParticipantData.student_id,
      role: newParticipantData.role,
      position: newParticipantData.position || 'Participant', // default if not set
    };
    await dispatch(addParticipant(payload)).unwrap();
    showToast('Participant added!', 'success');
    setIsAddParticipantDrawerOpen(false);
    setNewParticipantData({ student_id: '', role: 'Participant', position: '' });
    refetch();
  } catch (err) {
    showToast(`Failed: ${err.message}`, 'error');
  }
};


  const handleGenerateCertificates = async (eventId) => {
    const eventParticipants = participants.filter(p => p.event === eventId);
    if (eventParticipants.length === 0) {
      showToast('No participants to generate certificates for.', 'error');
      return;
    }
    try {
      for (const p of eventParticipants) {
        await dispatch(generateCertificate({
          student_id: p.student,
          cert_type: 'event',
        })).unwrap();
      }
      showToast(`Generated ${eventParticipants.length} certificates!`, 'success');
      refetch();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  return {
    // Event drawer
    isEventDrawerOpen,
    setIsEventDrawerOpen,
    eventDrawerMode,
    eventFormData,
    setEventFormData,
    handleAddEvent,
    handleEditEvent,
    handleSaveEvent,

    // Participant drawer
    isParticipantDrawerOpen,
    setIsParticipantDrawerOpen,
    participantEvent,
    setParticipantEvent,
    handleOpenParticipants,

    // Add participant
    isAddParticipantDrawerOpen,
    setIsAddParticipantDrawerOpen,
    newParticipantData,
    setNewParticipantData,
    handleAddNewParticipant,

    // Certificate
    certificateEventId,
    setCertificateEventId,
    handleGenerateCertificates,

    // Delete
    deleteTarget,
    setDeleteTarget,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteEvent,
    confirmDelete,

    // Participant removal
    handleRemoveParticipant,
  };
}



export default useEventActions;
