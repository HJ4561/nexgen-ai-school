/**
 * ============================================
 * EVENT TABLE COMPONENT
 * ============================================
 * 
 * Purpose: Display events in a responsive table
 * Used by: Admin - Event Management page
 * 
 * Features:
 * - Event name and venue display
 * - Date and time formatting
 * - Status badges (Scheduled, Upcoming, Completed)
 * - Action buttons (Edit, Delete, View Participants)
 * - Participant count display
 * - Pagination support
 * - Responsive table with mobile views
 * - Role-based color theming
 * 
 * Dependencies:
 * - Badge component for status
 * - ResponsiveTable for data display
 * - Pagination for navigation
 * - Helpers for formatting
 * - Lucide React icons
 * ============================================
 */

import { Edit, Trash2, Users, MapPin } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Pagination from '@/components/ui/Pagination';
import { formatDate, getStatus } from "@/utils/helpers";
import { Edit, Trash2, Users, MapPin, Eye } from 'lucide-react';  // Add Eye for view
/**
 * EventTable Component
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.data - Event data
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total pages
 * @param {number} props.totalItems - Total items
 * @param {number} props.itemsPerPage - Items per page
 * @param {Function} props.onPageChange - Called when page changes
 * @param {Function} props.onEdit - Called when Edit is clicked
 * @param {Function} props.onDelete - Called when Delete is clicked
 * @param {Function} props.getParticipantCount - Get participant count for an event
 * @param {Function} props.onViewParticipants - Called when View Participants is clicked
 * @returns {JSX.Element} Rendered table with pagination
 * 
 * @example
 * <EventTable
 *   data={events}
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   totalItems={totalItems}
 *   itemsPerPage={10}
 *   onPageChange={handlePageChange}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   getParticipantCount={getParticipantCount}
 *   onViewParticipants={handleViewParticipants}
 * />
 */
export default function EventTable({
  data,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onViewParticipants,  // Changed from getParticipantCount
  getStatusColor,      // Add these
  getStatusIcon,       // Add these
  getStatusLabel,      // Add these
  formatDate,          // Add these
  loading,             // Add these
}) {
  // ─── Table Columns ────────────────────────────────────────────────────
  const columns = [
    {
      key: 'event',
      label: 'Event Details',
      highlight: true,
      mobile: { role: 'title' },
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.event_name}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.venue}</p>
        </div>
      ),
    },
    {
      key: 'venue',
      label: 'Venue',
      mobile: { role: 'detail', label: 'Venue' },
      render: (row) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">{row.venue}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      mobile: { role: 'detail', label: 'Date & Time' },
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{formatDate(row.event_date)}</span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {new Date(row.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      mobile: { role: 'badge' },
      render: (row) => {
        const status = getStatus(row.event_date);
        const colorMap = {
          Completed: 'bg-gray-100 text-gray-500',
          Upcoming: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
          Scheduled: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
        };
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colorMap[status.label]}`}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      mobile: { role: 'hidden' },
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Edit */}
          <button
            onClick={() => onEdit(row)}
            className="p-1.5 rounded-lg text-[var(--color-admin-primary)] bg-[var(--color-admin-light)] transition-colors"
            title="Edit Event"
          >
            <Edit size={15} />
          </button>
          {/* Delete */}
          <button
            onClick={() => onDelete(row)}
            className="p-1.5 rounded-lg text-[var(--color-danger)] bg-[var(--color-danger-bg)] transition-colors"
            title="Delete Event"
          >
            <Trash2 size={15} />
          </button>
          {/* View Participants */}
          <button
            onClick={() => onViewParticipants(row)}
            className="p-1.5 rounded-lg text-[var(--color-teacher-primary)] bg-[var(--color-teacher-light)] transition-colors"
            title="Manage Participants"
          >
            <Users size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      {/* ─── Table ────────────────────────────────────────────────────── */}
      <ResponsiveTable
        columns={columns}
        data={data}
        animateRows={true}
        keyField="id"
        emptyMessage="No events found."
        mobileActions={(row) => (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => onEdit(row)}
              className="text-sm font-medium text-[var(--color-admin-primary)] hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-admin-light)] rounded-lg flex-1 justify-center"
            >
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={() => onDelete(row)}
              className="text-sm font-medium text-[var(--color-danger)] hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-danger-bg)] rounded-lg flex-1 justify-center"
            >
              <Trash2 size={14} /> Delete
            </button>
            <button
              onClick={() => onViewParticipants(row)}
              className="text-sm font-medium text-[var(--color-teacher-primary)] hover:underline flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-teacher-light)] rounded-lg flex-1 justify-center"
            >
              <Users size={14} /> View
            </button>
          </div>
        )}
      />

      {/* ─── Pagination ────────────────────────────────────────────────── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}























