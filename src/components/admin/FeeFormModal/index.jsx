// src/components/admin/FeeFormModal/index.jsx
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const FEE_STATUS_OPTIONS = ["pending", "partial", "paid", "overdue", "waived"];

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm md:text-base md:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

const FeeFormModal = ({ initialData, students, feeStructures, onSubmit, onClose }) => {
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
    setValues((v) => ({ ...v, fee_structure: id, amount: v.amount || structure?.amount || "" }));
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
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row items-center justify-center p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-black/50 px-4 sm:px-6 lg:px-8" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-gray-100 px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg md:text-xl md:text-2xl font-semibold text-gray-800 px-4 sm:px-6 lg:px-8">{isEdit ? "Edit Fee" : "Add Fee"}</h2>
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 px-4 sm:px-6 lg:px-8" aria-label="Close">
            <X className="w-5 h-5 px-4 sm:px-6 lg:px-8" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 space-y-4 px-4 sm:px-6 lg:px-8">
          {error && <div className="text-sm md:text-base md:text-base text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 px-4 sm:px-6 lg:px-8">{error}</div>}

          <div className="space-y-1 px-4 sm:px-6 lg:px-8">
            <label className="block md:hidden text-xs font-medium text-gray-600 mb-1 px-4 sm:px-6 lg:px-8">
              Student <span className="text-red-500 px-4 sm:px-6 lg:px-8">*</span>
            </label>
            <select
              value={values.student}
              onChange={(e) => setValues({ ...values, student: e.target.value })}
              className={inputClass}
              disabled={isEdit}
            >
              <option value="">Select a student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.admission_no ? `(${s.admission_no})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 px-4 sm:px-6 lg:px-8">
            <label className="block md:hidden text-xs font-medium text-gray-600 mb-1 px-4 sm:px-6 lg:px-8">Fee Type</label>
            <select
              value={values.fee_structure}
              onChange={(e) => handleStructureChange(e.target.value)}
              className={inputClass}
            >
              <option value="">Custom / none</option>
              {feeStructures.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.title} — PKR {fs.amount}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            <div className="space-y-1 px-4 sm:px-6 lg:px-8">
              <label className="block md:hidden text-xs font-medium text-gray-600 mb-1 px-4 sm:px-6 lg:px-8">
                Amount (PKR) <span className="text-red-500 px-4 sm:px-6 lg:px-8">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={values.amount}
                onChange={(e) => setValues({ ...values, amount: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="space-y-1 px-4 sm:px-6 lg:px-8">
              <label className="block md:hidden text-xs font-medium text-gray-600 mb-1 px-4 sm:px-6 lg:px-8">
                Due Date <span className="text-red-500 px-4 sm:px-6 lg:px-8">*</span>
              </label>
              <input
                type="date"
                value={values.due_date}
                onChange={(e) => setValues({ ...values, due_date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1 px-4 sm:px-6 lg:px-8">
            <label className="block md:hidden text-xs font-medium text-gray-600 mb-1 px-4 sm:px-6 lg:px-8">Status</label>
            <select
              value={values.status}
              onChange={(e) => setValues({ ...values, status: e.target.value })}
              className={inputClass}
            >
              {FEE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-end gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 pt-2 px-4 sm:px-6 lg:px-8">
            <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-8" disabled={submitting}>
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Fee"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeeFormModal;
