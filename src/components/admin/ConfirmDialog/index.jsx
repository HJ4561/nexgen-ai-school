// src/components/admin/ConfirmDialog/index.jsx
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ConfirmDialog = ({
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Action failed. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={submitting ? undefined : onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-4 bg-red-50 text-red-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
        {message && <p className="text-sm text-gray-500 mb-4">{message}</p>}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
            {error}
          </div>
        )}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
