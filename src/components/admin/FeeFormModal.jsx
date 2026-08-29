// src/components/admin/FeeFormModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = ["pending", "partial", "paid", "overdue", "waived"];
const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * @param {object|null} initialData - enriched fee record when editing, null when creating
 * @param {Array} students - merged student records, for the student dropdown
 * @param {Array} feeStructures - fee-structure records, for the fee-type dropdown
 * @param {(payload) => Promise<void>} onSubmit
 * @param {() => void} onClose
 */
export default function FeeFormModal({ initialData, students, feeStructures, onSubmit, onClose }) {
  const isEdit = Boolean(initialData);
  const [values, setValues] = useState({
    student: initialData?.student ?? "",
    fee_structure: initialData?.fee_structure ?? "",
    amount: initialData?.amount ?? "",
    due_date: initialData?.due_date ?? "",
    status: initialData?.status ?? "pending",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleStructureChange = (id) => {
    const structure = feeStructures.find((fs) => String(fs.id) === String(id));
    setValues((v) => ({
      ...v,
      fee_structure: id,
      amount: v.amount || structure?.amount || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!values.student || !values.amount || !values.due_date) {
      setError("Student, amount, and due date are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        student: Number(values.student),
        fee_structure: values.fee_structure ? Number(values.fee_structure) : null,
        amount: Number(values.amount),
      });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{isEdit ? "Edit Fee" : "Add Fee"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <Field label="Student" required>
            <select
              value={values.student}
              onChange={(e) => setValues({ ...values, student: e.target.value })}
              className={inputClass}
              disabled={isEdit}
            >
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s.profileId} value={s.profileId}>
                  {s.name} {s.admission_no ? `(${s.admission_no})` : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fee Type">
            <select
              value={values.fee_structure}
              onChange={(e) => handleStructureChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Custom / none</option>
              {feeStructures.map((fs) => (
                <option key={fs.id} value={fs.id}>{fs.title} — PKR {fs.amount}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (PKR)" required>
              <input
                type="number"
                min="0"
                value={values.amount}
                onChange={(e) => setValues({ ...values, amount: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Due Date" required>
              <input
                type="date"
                value={values.due_date}
                onChange={(e) => setValues({ ...values, due_date: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              value={values.status}
              onChange={(e) => setValues({ ...values, status: e.target.value })}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}