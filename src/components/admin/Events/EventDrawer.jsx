/**
 * ============================================
 * EVENT DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Drawer for creating/editing events
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Create new events
 * - Edit existing events
 * - Date and time picker with UTC conversion
 * - Venue input
 * - Admin role theming
 * - Loading state for save button
 * 
 * Date/Time Handling:
 * - User selects local date and time
 * - Converts to UTC ISO string for API
 * - Displays local time when editing
 * 
 * Dependencies:
 * - Drawer component for slide-out panel
 * - Button component for actions
 * ============================================
 */

import { useState, useEffect } from 'react';
import Button from "@/components/ui/Button";
import Drawer from "@/components/admin/Drawer";

/**
 * EventDrawer Component
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Called when drawer closes
 * @param {string} props.mode - 'add' or 'edit' mode
 * @param {Object} props.formData - Event form data
 * @param {Function} props.setFormData - Update form data
 * @param {Function} props.onSave - Called when Save is clicked
 * @param {boolean} props.loading - Loading state for save button
 * @returns {JSX.Element} Rendered drawer form
 * 
 * @example
 * <EventDrawer
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 *   mode="add"
 *   formData={formData}
 *   setFormData={setFormData}
 *   onSave={handleSave}
 *   loading={loading}
 * />
 */
export default function EventDrawer({
  isOpen,
  onClose,
  mode,
  formData,
  setFormData,
  onSave,
  loading,
}) {
  // ─── Local State ──────────────────────────────────────────────────────
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // ─── When drawer opens, convert UTC → local for display ──────────────
  useEffect(() => {
    if (isOpen && formData.event_date) {
      const dt = new Date(formData.event_date);
      if (!isNaN(dt)) {
        // Local date in YYYY-MM-DD
        const localDate = dt.toLocaleDateString('en-CA');
        // Local time in HH:MM (24-hour)
        const localTime = dt.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        setDate(localDate);
        setTime(localTime);
      }
    }
  }, [isOpen, formData.event_date]);

  // ─── Convert local date+time → UTC ISO and update parent ────────────
  const updateParent = (newDate, newTime) => {
    if (newDate && newTime) {
      // Create a Date object from local date+time (no timezone offset)
      const localDT = new Date(`${newDate}T${newTime}:00`);
      // Convert to UTC ISO string
      const isoString = localDT.toISOString();
      setFormData({ ...formData, event_date: isoString });
    } else {
      setFormData({ ...formData, event_date: '' });
    }
  };

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    if (time) {
      updateParent(newDate, time);
    } else {
      // Default time 09:00 if time not set yet
      const defaultTime = '09:00';
      setTime(defaultTime);
      updateParent(newDate, defaultTime);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date) {
      updateParent(date, newTime);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Create New Event' : 'Edit Event'}
      width="max-w-[350px]"
      footer={
        <div className="flex gap-3">
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[var(--color-admin-primary)] rounded-lg hover:bg-[var(--color-admin-hover)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onSave}
            disabled={loading || !formData.name || !formData.event_date || !formData.venue}
          >
            {loading ? 'Saving...' : mode === 'add' ? 'Create' : 'Save'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Event Name ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Event Name <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Annual Science Symposium"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>

        {/* ─── Date & Time ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Date <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Time <span className="text-[var(--color-danger)]">*</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={handleTimeChange}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* ─── Venue ────────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            Venue <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={formData.venue || ''}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="e.g., Main Auditorium"
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-transparent text-sm"
          />
        </div>
      </div>
    </Drawer>
  );
}