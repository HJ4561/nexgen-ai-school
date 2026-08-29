// src/modules/admin/pages/ComplaintManagement/hooks/useComplaintActions.js

import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateComplaintStatus } from "@/modules/admin/store/adminComplaintThunks";
import { sendNotification } from "@/modules/admin/store/adminThunks";

export function useComplaintActions({ refetch, showToast } = {}) {
  const dispatch = useDispatch();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Open Drawer ─────────────────────────────────────────────────────
  const handleView = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDrawerOpen(true);
  };

  // ─── Update Status + Send Notification ───────────────────────────
  const handleUpdate = async (id, status, admin_remarks) => {
    setIsSubmitting(true);
    try {
      // 1. Update the complaint using updateComplaintStatus
      const updated = await dispatch(
        updateComplaintStatus({ 
          id, 
          status, 
          resolution: admin_remarks,
          admin_remarks: admin_remarks,
        })
      ).unwrap();

      // 2. Send a notification to the reporter
      if (selectedComplaint?.reporter || selectedComplaint?.user) {
        const reporterId = selectedComplaint.reporter || selectedComplaint.user;
        const message = `Your complaint (#${id}) has been updated to "${status}". Admin remarks: ${admin_remarks || 'None provided.'}`;
        await dispatch(
          sendNotification({
            message,
            receiver_id: reporterId,
            title: `Complaint Update: ${status}`,
            type: 'complaint_update'
          })
        ).unwrap();
        if (showToast) {
          showToast('Complaint updated and reporter notified!', 'success');
        }
      } else {
        if (showToast) {
          showToast('Complaint updated (no reporter to notify).', 'info');
        }
      }

      setIsDrawerOpen(false);
      setSelectedComplaint(null);
      if (refetch) refetch();
    } catch (err) {
      if (showToast) {
        showToast(`Failed: ${err.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Export CSV ──────────────────────────────────────────────────────
  const exportCSV = (complaints) => {
    if (!complaints || complaints.length === 0) {
      if (showToast) showToast("No data to export.", "error");
      return;
    }
    try {
      const headers = ["ID", "Reporter", "Type", "Status", "Created At", "Priority"];
      const rows = complaints.map((c) => [
        c.id,
        c.reporter_name || c.user?.name || `User ${c.user || c.reporter}`,
        c.complaint_type || c.type || 'General',
        c.status || 'Pending',
        new Date(c.created_at || c.createdAt).toLocaleDateString(),
        c.priority || 'Medium',
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `complaints_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (showToast) showToast("CSV exported successfully!", "success");
    } catch (err) {
      if (showToast) showToast("Failed to export CSV", "error");
    }
  };

  // ─── Close Drawer ────────────────────────────────────────────────────
  const handleClose = () => {
    setIsDrawerOpen(false);
    setSelectedComplaint(null);
  };

  // ─── Reset State ─────────────────────────────────────────────────────
  const reset = () => {
    setSelectedComplaint(null);
    setIsDrawerOpen(false);
    setIsSubmitting(false);
  };

  return {
    selectedComplaint,
    setSelectedComplaint,
    isDrawerOpen,
    setIsDrawerOpen,
    isSubmitting,
    handleView,
    handleUpdate,
    exportCSV,
    handleClose,
    reset,
  };
}

export default useComplaintActions;