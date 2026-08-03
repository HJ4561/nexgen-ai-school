// src/modules/admin/pages/ComplaintManagement/hooks/useComplaintActions.js

import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateComplaintStatus } from "@/modules/admin/store/adminComplaintThunks";
import { sendNotification } from "@/modules/admin/store/adminThunks";
export function useComplaintActions({ refetch, showToast }) {
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
      // 1. Update the complaint
      const updated = await dispatch(
        updateComplaintStatus({ id, status, admin_remarks })
      ).unwrap();

      // 2. Send a notification to the reporter
      if (selectedComplaint?.reporter) {
        const message = `Your complaint (#${id}) has been updated to "${status}". Admin remarks: ${admin_remarks || 'None provided.'}`;
        await dispatch(
          sendNotification({
            message,
            receiver_id: selectedComplaint.reporter, // reporter's user ID
          })
        ).unwrap();
        showToast('Complaint updated and reporter notified!', 'success');
      } else {
        showToast('Complaint updated (no reporter to notify).', 'info');
      }

      setIsDrawerOpen(false);
      setSelectedComplaint(null);
      refetch();
    } catch (err) {
      showToast(`Failed: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Export CSV ──────────────────────────────────────────────────────
  const exportCSV = (complaints) => {
    if (!complaints || complaints.length === 0) {
      showToast("No data to export.", "error");
      return;
    }
    try {
      const headers = ["ID", "Reporter", "Type", "Status", "Created At"];
      const rows = complaints.map((c) => [
        c.id,
        c.reporter_name,
        c.complaint_type,
        c.status,
        new Date(c.created_at).toLocaleDateString(),
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `complaints_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("CSV exported!", "success");
    } catch (err) {
      showToast("Failed to export", "error");
    }
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
  };
}


export default useComplaintActions;
