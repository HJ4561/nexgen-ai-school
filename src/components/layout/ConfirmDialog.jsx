// src/components/layout/ConfirmDialog.jsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getButtonClasses = (type) => {
    const base = 'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all';
    if (type === 'confirm') {
      if (variant === 'danger') {
        return `${base} text-white bg-red-600 hover:bg-red-700`;
      }
      if (variant === 'warning') {
        return `${base} text-white bg-amber-600 hover:bg-amber-700`;
      }
      return `${base} text-white bg-blue-600 hover:bg-blue-700`;
    }
    return `${base} text-gray-700 bg-white border border-gray-200 hover:bg-gray-50`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
            {variant === 'warning' && (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onCancel} className={getButtonClasses('cancel')}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={getButtonClasses('confirm')}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;