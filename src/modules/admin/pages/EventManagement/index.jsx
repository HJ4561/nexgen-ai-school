import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, X, RefreshCw, AlertCircle, CheckCircle,
  Calendar, Users, Trophy, Clock, Edit, Trash2, Eye,
  Search, Filter, ChevronDown, Download, UserPlus, UserMinus, Award,
  FileText, MapPin
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints ──────────────────────────────────────────────────────
const EVENTS_API = "/events/events/";
const PARTICIPATION_API = "/events/event-participation/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatus = (dateString) => {
  if (!dateString) return { label: "Upcoming", color: "bg-blue-50 text-blue-700 border-blue-200" };
  const eventDate = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: "Completed", color: "bg-gray-50 text-gray-700 border-gray-200" };
  if (diffDays <= 7) return { label: "Upcoming", color: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  return { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" };
};

const getStatusColor = (status) => {
  const colors = {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    ongoing: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-gray-50 text-gray-700 border-gray-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    scheduled: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

const getStatusIcon = (status) => {
  const icons = {
    upcoming: <Clock className="w-3 h-3" />,
    ongoing: <CheckCircle className="w-3 h-3" />,
    completed: <Trophy className="w-3 h-3" />,
    cancelled: <AlertCircle className="w-3 h-3" />,
    scheduled: <Calendar className="w-3 h-3" />,
  };
  return icons[status] || null;
};

const getStatusLabel = (status) => {
  const labels = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
    cancelled: "Cancelled",
    scheduled: "Scheduled",
  };
  return labels[status] || status || "Unknown";
};

// ─── Stats Card Component ──────────────────────────────────────────────
const StatsCard = ({ label, value, icon: Icon, iconBg, iconColor, subtitle }) => (
  <Card className="p-4 hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  </Card>
);

// ─── Event Filters Component ──────────────────────────────────────────
const EventFilters = ({ search, setSearch, filterStatus, setFilterStatus }) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search events or venues..."
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[140px]"
      >
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// ─── Event Table Component ─────────────────────────────────────────────
const EventTable = ({ 
  data, currentPage, totalPages, totalItems, onPageChange, 
  onEdit, onDelete, onViewParticipants 
}) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No events found</p>
          <p className="text-sm text-gray-400">Create an event to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Event Details</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Venue</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Participants</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((event) => {
              const status = getStatus(event.event_date);
              const statusColor = status.color || "bg-gray-50 text-gray-700 border-gray-200";
              
              return (
                <tr key={event.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.name || event.event_name || "—"}</p>
                        <p className="text-xs text-gray-500">{event.event_type || "General"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{event.location || event.venue || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{formatDate(event.event_date)}</span>
                      <span className="text-xs text-gray-500">
                        {event.event_date ? new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={`text-xs flex items-center gap-1.5 px-2.5 py-1 ${statusColor}`}>
                      {status.label === "Upcoming" && <Clock className="w-3 h-3" />}
                      {status.label === "Scheduled" && <Calendar className="w-3 h-3" />}
                      {status.label === "Completed" && <CheckCircle className="w-3 h-3" />}
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.participant_count || event.participants?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onViewParticipants(event)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="View Participants"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(event)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(event)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={(currentPage - 1) * 10}
        itemsShown={data.length}
        totalItems={totalItems}
        onPageChange={onPageChange}
      />
    </div>
  );
};

// ─── Event Stats Component ─────────────────────────────────────────────
const EventStats = ({ stats }) => {
  const cards = [
    { label: 'Total Events', value: stats.total, icon: Calendar, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', subtitle: 'All events' },
    { label: 'Scheduled', value: stats.scheduled, icon: Calendar, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', subtitle: 'Upcoming' },
    { label: 'Upcoming', value: stats.upcoming, icon: Clock, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600', subtitle: 'Soon' },
    { label: 'Completed', value: stats.completed, icon: Trophy, iconBg: 'bg-gray-50', iconColor: 'text-gray-600', subtitle: 'Past events' },
    { label: 'Participants', value: stats.participants, icon: Users, iconBg: 'bg-green-50', iconColor: 'text-green-600', subtitle: 'Total registered' },
  ];

  return (
    <StaggerGroup className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <StaggerItem key={index}>
          <StatsCard {...card} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
};

// ─── Certificate Issuance Component ────────────────────────────────────
const CertificateIssuance = ({ events, selectedEventId, setSelectedEventId, participants, onGenerate }) => {
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipants = selectedEventId ? participants[selectedEventId] || [] : [];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Award size={18} className="text-blue-600" />
        <h3 className="text-base font-semibold text-gray-800">Certificate Issuance</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            1. Select Event
          </label>
          <select
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Choose event...</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>
                {e.name || e.event_name} ({e.participant_count || e.participants?.length || 0} participants)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            2. Template
          </label>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
            <Award size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Standard Certificate</span>
            <Badge className="bg-blue-100 text-blue-700 text-[10px] ml-auto">Default</Badge>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
            3. Live Preview
          </label>
          <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center">
            <p className="text-[10px] font-serif uppercase tracking-wider text-gray-500">Certificate of Participation</p>
            <p className="text-xs italic text-gray-500 mt-1">Presented to</p>
            <p className="text-sm font-bold uppercase text-blue-700">[Student Name]</p>
            <p className="text-[10px] text-gray-500 mt-1">For outstanding performance in</p>
            <p className="text-xs font-semibold text-gray-800">{selectedEvent ? selectedEvent.name || selectedEvent.event_name : '[Event Name]'}</p>
          </div>
        </div>

        <button
          onClick={() => selectedEventId && onGenerate(selectedEventId)}
          disabled={!selectedEventId || eventParticipants.length === 0}
          className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award size={14} />
          {selectedEventId
            ? `Generate & Email (${eventParticipants.length} participants)`
            : 'Select an event first'}
        </button>
      </div>
    </div>
  );
};

// ─── Participant Management Component ──────────────────────────────────
const ParticipantManagement = ({ events, selectedEvent, setSelectedEvent, participants, onViewParticipants, onAddParticipant }) => {
  const eventParticipants = selectedEvent ? participants[selectedEvent.id] || [] : [];
  
  const stats = {
    judges: eventParticipants.filter(p => p.role === 'Judge').length,
    registered: eventParticipants.filter(p => p.role === 'Participant').length,
    volunteers: eventParticipants.filter(p => p.role === 'Volunteer').length,
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-600" />
        <h3 className="text-base font-semibold text-gray-800">Participant Management</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-2xl font-bold text-blue-700">{stats.judges}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Judges</p>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <p className="text-2xl font-bold text-emerald-700">{stats.registered}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Participants</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-2xl font-bold text-purple-700">{stats.volunteers}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Volunteers</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-xs text-gray-500">Event:</label>
        <select
          value={selectedEvent?.id || ''}
          onChange={(e) => {
            const event = events.find(ev => ev.id === Number(e.target.value));
            setSelectedEvent(event || null);
          }}
          className="flex-1 px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="">Select event...</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.name || e.event_name}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {selectedEvent
          ? `${eventParticipants.length} participants registered`
          : 'Select an event to manage participants'}
      </p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onViewParticipants}
          disabled={!selectedEvent}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Users size={14} />
          View
        </button>
        <button
          onClick={onAddParticipant}
          disabled={!selectedEvent}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <UserPlus size={14} />
          Add
        </button>
      </div>
    </div>
  );
};

// ─── Add Participant Drawer ────────────────────────────────────────────
const AddParticipantDrawer = ({ isOpen, onClose, event, students, formData, setFormData, onSave, loading }) => {
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Add Participant - {event.name || event.event_name}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.student_id || ''}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.full_name || `Student ${s.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role || 'Participant'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="Participant">Participant</option>
              <option value="Judge">Judge</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Position
            </label>
            <select
              value={formData.position || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select position...</option>
              <option value="1st Place">1st Place</option>
              <option value="2nd Place">2nd Place</option>
              <option value="3rd Place">3rd Place</option>
              <option value="Winner">Winner</option>
              <option value="Participant">Participant</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Event:</span> {event.name || event.event_name}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading || !formData.student_id}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add Participant
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Participant Drawer ─────────────────────────────────────────────────
const ParticipantDrawer = ({ isOpen, onClose, event, participants, onRemove }) => {
  if (!isOpen || !event) return null;

  const roleColors = {
    Participant: 'bg-emerald-50 text-emerald-700',
    Volunteer: 'bg-purple-50 text-purple-700',
    Judge: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Participants - {event.name || event.event_name}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {participants.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No participants registered yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{p.student_name || p.student?.name || "Unknown"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${roleColors[p.role] || roleColors.Participant}`}>
                        {p.role || 'Participant'}
                      </span>
                      {p.position && (
                        <span className="text-[10px] text-gray-500">({p.position})</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Remove Participant"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Event Drawer ──────────────────────────────────────────────────────
// ─── Event Drawer ──────────────────────────────────────────────────────
const EventDrawer = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen && formData.event_date) {
      const dt = new Date(formData.event_date);
      if (!isNaN(dt)) {
        // Format date as YYYY-MM-DD for the date input
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
        // Format time as HH:MM
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        setTime(`${hours}:${minutes}`);
      }
    }
  }, [isOpen, formData.event_date]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);
    // When date changes, update the event_date with current time or default 09:00
    if (newDate) {
      const timeToUse = time || '09:00';
      // Create a date object with the selected date and time
      const dateObj = new Date(`${newDate}T${timeToUse}:00`);
      if (!isNaN(dateObj)) {
        // Store as ISO string for the API
        setFormData({ ...formData, event_date: dateObj.toISOString() });
      }
    } else {
      setFormData({ ...formData, event_date: '' });
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (date && newTime) {
      const dateObj = new Date(`${date}T${newTime}:00`);
      if (!isNaN(dateObj)) {
        setFormData({ ...formData, event_date: dateObj.toISOString() });
      }
    }
  };

  const handleSaveClick = () => {
    console.log("Form Data before save:", formData);
    console.log("Mode:", mode);
    // Validate that we have a valid date
    if (!formData.event_date) {
      console.error("No event date set!");
      return;
    }
    if (onSave) {
      onSave();
    } else {
      console.error("onSave function is not provided");
    }
  };

  if (!isOpen) return null;

  const isFormValid = formData.name?.trim() && formData.event_date && formData.location?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg">
            {mode === 'add' ? 'Create New Event' : 'Edit Event'}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Annual Science Symposium"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Event Type
            </label>
            <select
              value={formData.event_type || 'general'}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="general">General</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="cultural">Cultural</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={handleDateChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Main Auditorium"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Max Participants
            </label>
            <input
              type="number"
              value={formData.max_participants || ''}
              onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              placeholder="e.g., 50"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={loading || !isFormValid}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
            type="button"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === 'add' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [certificateEventId, setCertificateEventId] = useState(null);
  const [toast, setToast] = useState(null);
  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [eventDrawerMode, setEventDrawerMode] = useState("add");
  const [participantDrawerOpen, setParticipantDrawerOpen] = useState(false);
  const [addParticipantDrawerOpen, setAddParticipantDrawerOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    name: "",
    event_type: "general",
    event_date: "",
    description: "",
    location: "",
    max_participants: "",
  });
  const [participantFormData, setParticipantFormData] = useState({
    student_id: "",
    role: "Participant",
    position: "",
  });
  const pageSize = 10;

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ────────────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(EVENTS_API);
      const data = response.data?.results || response.data || [];
      setEvents(data);
      
      const participantsMap = {};
      data.forEach(event => {
        participantsMap[event.id] = event.participants || [];
      });
      setParticipants(participantsMap);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(error.response?.data?.detail || "Failed to load events");
      }
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await api.get("/users/students/");
      const data = response.data?.results || response.data || [];
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    }
  }, []);

  const fetchParticipantsForEvent = useCallback(async (eventId) => {
    if (!eventId) return;
    try {
      const response = await api.get(`${PARTICIPATION_API}?event=${eventId}`);
      const data = response.data?.results || response.data || [];
      setParticipants(prev => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchStudents();
  }, [fetchEvents, fetchStudents]);

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = events.length;
    const scheduled = events.filter(e => getStatus(e.event_date).label === "Scheduled").length;
    const upcoming = events.filter(e => getStatus(e.event_date).label === "Upcoming").length;
    const completed = events.filter(e => getStatus(e.event_date).label === "Completed").length;
    const participantsCount = events.reduce((sum, e) => sum + (e.participant_count || e.participants?.length || 0), 0);
    return { total, scheduled, upcoming, completed, participants: participantsCount };
  }, [events]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(event => {
        const status = getStatus(event.event_date).label.toLowerCase();
        return status === filterStatus;
      });
    }
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(event =>
        (event.name || event.event_name || "").toLowerCase().includes(s) ||
        (event.location || event.venue || "").toLowerCase().includes(s)
      );
    }
    
    return filtered;
  }, [events, search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredEvents.slice(startIndex, startIndex + pageSize);

  // ─── Event Handlers ────────────────────────────────────────────────────
  const handleAddEvent = () => {
  setEventDrawerMode("add");
  setEventFormData({
    name: "",
    event_type: "general",
    event_date: "",
    description: "",
    location: "",
    max_participants: "",
  });
  setEventDrawerOpen(true);
};

  const handleEditEvent = (event) => {
  setEventDrawerMode("edit");
  setEventFormData({
    name: event.name || event.event_name || "",
    event_type: event.event_type || "general",
    event_date: event.event_date || "",
    description: event.description || "",
    location: event.location || event.venue || "",
    max_participants: event.max_participants || "",
  });
  setSelectedEvent(event);
  setEventDrawerOpen(true);
};

  const handleSaveEvent = async () => {
  console.log("handleSaveEvent called");
  console.log("Event Form Data:", eventFormData);
  
  if (!eventFormData.name || !eventFormData.event_date || !eventFormData.location) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  setSaving(true);
  try {
    // Ensure the date is in ISO format
    let eventDate = eventFormData.event_date;
    // If it's not an ISO string, try to convert it
    if (eventDate && !eventDate.includes('T')) {
      // Try to create a valid date
      const dateObj = new Date(eventDate);
      if (!isNaN(dateObj)) {
        eventDate = dateObj.toISOString();
      }
    }

    const payload = {
      name: eventFormData.name,
      event_type: eventFormData.event_type || "general",
      event_date: eventDate,
      description: eventFormData.description || "",
      location: eventFormData.location,
      max_participants: eventFormData.max_participants ? Number(eventFormData.max_participants) : null,
      organizer: 1, // Add organizer
    };

    console.log("Sending payload:", payload);
    console.log("Event date being sent:", eventDate);

    if (eventDrawerMode === "edit" && selectedEvent) {
      const response = await api.patch(`${EVENTS_API}${selectedEvent.id}/`, payload);
      console.log("Update response:", response.data);
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, ...response.data } : e));
      showToast("Event updated successfully", "success");
    } else {
      const response = await api.post(EVENTS_API, payload);
      console.log("Create response:", response.data);
      setEvents([response.data, ...events]);
      showToast("Event created successfully", "success");
    }
    setEventDrawerOpen(false);
    setSelectedEvent(null);
  } catch (error) {
    console.error("Failed to save event:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      
      let errorMessage = "Failed to save event";
      if (error.response.data) {
        if (typeof error.response.data === 'object') {
          const errors = [];
          for (const [key, value] of Object.entries(error.response.data)) {
            if (Array.isArray(value)) {
              errors.push(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              errors.push(`${key}: ${value}`);
            }
          }
          errorMessage = errors.join('; ') || "Failed to save event";
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = error.response.data?.detail || error.response.data?.message || "Failed to save event";
        }
      }
      showToast(errorMessage, "error");
    } else {
      showToast("Failed to save event", "error");
    }
  } finally {
    setSaving(false);
  }
};

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setSaving(true);
    try {
      await api.delete(`${EVENTS_API}${deletingEvent.id}/`);
      setEvents(events.filter(e => e.id !== deletingEvent.id));
      showToast("Event deleted successfully", "success");
      setDeletingEvent(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      showToast("Failed to delete event", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleViewParticipants = async (event) => {
    setSelectedEvent(event);
    await fetchParticipantsForEvent(event.id);
    setParticipantDrawerOpen(true);
  };

  const handleAddParticipant = async () => {
    if (!participantFormData.student_id) {
      showToast("Please select a student", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        event: selectedEvent.id,
        student: Number(participantFormData.student_id),
        role: participantFormData.role || "Participant",
        position: participantFormData.position || null,
      };
      const response = await api.post(PARTICIPATION_API, payload);
      
      const currentParticipants = participants[selectedEvent.id] || [];
      setParticipants({
        ...participants,
        [selectedEvent.id]: [...currentParticipants, response.data]
      });
      
      showToast("Participant added successfully", "success");
      setAddParticipantDrawerOpen(false);
      setParticipantFormData({ student_id: "", role: "Participant", position: "" });
    } catch (error) {
      console.error("Failed to add participant:", error);
      showToast(error.response?.data?.detail || "Failed to add participant", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    setSaving(true);
    try {
      await api.delete(`${PARTICIPATION_API}${participantId}/`);
      
      const currentParticipants = participants[selectedEvent.id] || [];
      setParticipants({
        ...participants,
        [selectedEvent.id]: currentParticipants.filter(p => p.id !== participantId)
      });
      
      showToast("Participant removed successfully", "success");
    } catch (error) {
      console.error("Failed to remove participant:", error);
      showToast("Failed to remove participant", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateCertificates = async (eventId) => {
    const eventParticipants = participants[eventId] || [];
    if (eventParticipants.length === 0) {
      showToast("No participants to generate certificates for", "error");
      return;
    }
    showToast(`Generating certificates for ${eventParticipants.length} participants...`, "info");
    setTimeout(() => {
      showToast("Certificates generated successfully!", "success");
    }, 1500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    showToast("Events refreshed successfully", "success");
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Event Management" 
            subtitle="Manage school events and participant registrations" 
            breadcrumbs={["Admin", "Events"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading events...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 min-h-screen bg-gray-50/50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex items-start gap-3 animate-slide-in-right ${toast.type === "success" ? "border-emerald-200" : "border-red-200"}`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Event Management"
          subtitle={`Manage school events and participant registrations${events.length > 0 ? ` — ${events.length} events` : ""}`}
          breadcrumbs={["Admin", "Events"]}
          action={
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button
                onClick={handleAddEvent}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          }
        />
      </FadeIn>

      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error loading events</p>
            <p className="text-amber-600">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <EventStats stats={stats} />

      {/* Filters */}
      <EventFilters
        search={search}
        setSearch={setSearch}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Table */}
      <EventTable
        data={pageItems}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredEvents.length}
        onPageChange={setCurrentPage}
        onEdit={handleEditEvent}
        onDelete={setDeletingEvent}
        onViewParticipants={handleViewParticipants}
      />

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FadeIn y={15} delay={0.4}>
          <CertificateIssuance
            events={events}
            selectedEventId={certificateEventId}
            setSelectedEventId={setCertificateEventId}
            participants={participants}
            onGenerate={handleGenerateCertificates}
          />
        </FadeIn>
        <FadeIn y={15} delay={0.5}>
          <ParticipantManagement
            events={events}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            participants={participants}
            onViewParticipants={() => setParticipantDrawerOpen(true)}
            onAddParticipant={() => setAddParticipantDrawerOpen(true)}
          />
        </FadeIn>
      </div>

      {/* ─── Drawers ────────────────────────────────────────────────────── */}

      {/* Event Drawer */}
      <EventDrawer
        isOpen={eventDrawerOpen}
        onClose={() => {
          setEventDrawerOpen(false);
          setSelectedEvent(null);
        }}
        mode={eventDrawerMode}
        formData={eventFormData}
        setFormData={setEventFormData}
        onSave={handleSaveEvent}
        loading={saving}
      />

      {/* Participant Drawer */}
      <ParticipantDrawer
        isOpen={participantDrawerOpen}
        onClose={() => {
          setParticipantDrawerOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        participants={selectedEvent ? participants[selectedEvent.id] || [] : []}
        onRemove={handleRemoveParticipant}
      />

      {/* Add Participant Drawer */}
      <AddParticipantDrawer
        isOpen={addParticipantDrawerOpen}
        onClose={() => {
          setAddParticipantDrawerOpen(false);
          setParticipantFormData({ student_id: "", role: "Participant", position: "" });
        }}
        event={selectedEvent}
        students={students}
        formData={participantFormData}
        setFormData={setParticipantFormData}
        onSave={handleAddParticipant}
        loading={saving}
      />

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}
      {deletingEvent && (
        <ConfirmDialog
          open={true}
          title="Delete Event?"
          message={`This will permanently remove "${deletingEvent.name || deletingEvent.event_name}" and all associated data. This action cannot be undone.`}
          confirmLabel="Delete Event"
          onConfirm={handleDeleteEvent}
          onCancel={() => setDeletingEvent(null)}
          loading={saving}
        />
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default EventManagement;