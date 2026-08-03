// src/modules/admin/pages/Transport/index.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, Plus, Edit, Trash2, Bus, MapPin, Users, Calendar,
  X, RefreshCw, AlertCircle, Eye, Filter, ChevronDown,
  Download, UserPlus, UserMinus, Clock, CheckCircle, XCircle,
  Route as RouteIcon, StopCircle, BookOpen, GraduationCap, Shield,
  User, Phone, Mail, Car, DollarSign, CalendarDays
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints - FIXED (removed /api prefix) ──────────────────────
const BUSES_API = "/transport/buses/";
const ROUTES_API = "/transport/routes/";
const BUS_STOPS_API = "/transport/bus-stops/";
const BUS_STUDENTS_API = "/transport/bus-students/";
const TRANSPORT_ATTENDANCE_API = "/transport/transport-attendance/";
const STUDENTS_API = "/users/students/";

// ─── Constants ──────────────────────────────────────────────────────────
const BUS_STATUS = {
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  maintenance: { label: "Maintenance", color: "bg-amber-50 text-amber-700 border-amber-200" },
  inactive: { label: "Inactive", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const ATTENDANCE_STATUS = {
  boarded: { label: "Boarded", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  dropped: { label: "Dropped", color: "bg-blue-50 text-blue-700 border-blue-200" },
  absent: { label: "Absent", color: "bg-red-50 text-red-700 border-red-200" },
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  try {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timeString;
  }
};

const getStatusBadge = (status, statusMap) => {
  const info = statusMap?.[status] || { label: status || "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200" };
  return <Badge className={`${info.color} text-xs`}>{info.label}</Badge>;
};

// ─── Tab Configuration ──────────────────────────────────────────────────
const TABS = [
  { id: "buses", label: "Buses", icon: Bus },
  { id: "routes", label: "Routes", icon: MapPin },
  { id: "bus-stops", label: "Bus Stops", icon: StopCircle },
  { id: "bus-students", label: "Bus Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
];

// ─── Bus Modal ──────────────────────────────────────────────────────────
const BusModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, routes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Bus" : "Edit Bus"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bus Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., BUS-02"
              value={formData.bus_no || ""}
              onChange={(e) => setFormData({ ...formData, bus_no: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Capacity <span className="text-red-500">*</span></label>
            <input
              type="number"
              placeholder="e.g., 40"
              min="1"
              value={formData.capacity || ""}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status || "active"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.bus_no || !formData.capacity} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Bus" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Route Modal ──────────────────────────────────────────────────────────
const RouteModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Route" : "Edit Route"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Route Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Route B"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Route description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Start Point</label>
            <input
              type="text"
              placeholder="e.g., Township"
              value={formData.start_point || ""}
              onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">End Point</label>
            <input
              type="text"
              placeholder="e.g., School"
              value={formData.end_point || ""}
              onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.name} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Route" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Bus Stop Modal ──────────────────────────────────────────────────────
const BusStopModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, routes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <StopCircle className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Bus Stop" : "Edit Bus Stop"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Route <span className="text-red-500">*</span></label>
            <select
              value={formData.route || ""}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select route...</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name || `Route ${route.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Stop Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Main Gate"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Stop Order <span className="text-red-500">*</span></label>
            <input
              type="number"
              placeholder="e.g., 1"
              min="1"
              value={formData.stop_order || ""}
              onChange={(e) => setFormData({ ...formData, stop_order: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.route || !formData.name || !formData.stop_order} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Bus Stop" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Bus Student Modal ──────────────────────────────────────────────────
const BusStudentModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, buses, busStops, students }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Assign Student to Bus" : "Edit Bus Student"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bus <span className="text-red-500">*</span></label>
            <select
              value={formData.bus || ""}
              onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select bus...</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.bus_no || `Bus ${bus.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Student <span className="text-red-500">*</span></label>
            <select
              value={formData.student || ""}
              onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name || student.full_name || `Student ${student.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Pickup Stop</label>
            <select
              value={formData.pickup_stop || ""}
              onChange={(e) => setFormData({ ...formData, pickup_stop: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select pickup stop...</option>
              {busStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name || `Stop ${stop.id}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Drop Stop</label>
            <select
              value={formData.drop_stop || ""}
              onChange={(e) => setFormData({ ...formData, drop_stop: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select drop stop...</option>
              {busStops.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name || `Stop ${stop.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.bus || !formData.student} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Assign Student" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Attendance Modal ──────────────────────────────────────────────────
const AttendanceModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, busStudents }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Transport Attendance" : "Edit Transport Attendance"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bus Student <span className="text-red-500">*</span></label>
            <select
              value={formData.bus_student || ""}
              onChange={(e) => setFormData({ ...formData, bus_student: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select bus student...</option>
              {busStudents.map((bs) => {
                const studentName = bs.student_name || bs.student?.name || `Student ${bs.student}`;
                const busNo = bs.bus_no || bs.bus?.bus_no || `Bus ${bs.bus}`;
                return (
                  <option key={bs.id} value={bs.id}>
                    {studentName} - {busNo}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.date || ""}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Boarded</label>
            <select
              value={formData.boarded ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, boarded: e.target.value === "true" })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Dropped</label>
            <select
              value={formData.dropped ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, dropped: e.target.value === "true" })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Boarding Time</label>
            <input
              type="time"
              value={formData.boarding_time || ""}
              onChange={(e) => setFormData({ ...formData, boarding_time: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.bus_student || !formData.date} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Attendance" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Details Modal ──────────────────────────────────────────────────────
const DetailsModal = ({ isOpen, onClose, data, type }) => {
  if (!isOpen || !data) return null;

  const renderContent = () => {
    switch (type) {
      case "bus":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Bus Number</p><p className="font-medium text-gray-800">{data.bus_no || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Capacity</p><p className="font-medium text-gray-800">{data.capacity || 0}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><div className="mt-1">{getStatusBadge(data.status, BUS_STATUS)}</div></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      case "route":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Route Name</p><p className="font-medium text-gray-800">{data.name || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Description</p><p className="font-medium text-gray-800">{data.description || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Start Point</p><p className="font-medium text-gray-800">{data.start_point || "—"}</p></div>
            <div><p className="text-xs text-gray-500">End Point</p><p className="font-medium text-gray-800">{data.end_point || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      case "bus-stop":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Route</p><p className="font-medium text-gray-800">{data.route_name || data.route || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Stop Name</p><p className="font-medium text-gray-800">{data.name || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Stop Order</p><p className="font-medium text-gray-800">{data.stop_order || 0}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      case "bus-student":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Bus</p><p className="font-medium text-gray-800">{data.bus_no || data.bus || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Student</p><p className="font-medium text-gray-800">{data.student_name || data.student || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Pickup Stop</p><p className="font-medium text-gray-800">{data.pickup_stop_name || data.pickup_stop || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Drop Stop</p><p className="font-medium text-gray-800">{data.drop_stop_name || data.drop_stop || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      case "attendance":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Bus Student</p><p className="font-medium text-gray-800">{data.bus_student_name || data.bus_student || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-800">{formatDate(data.date)}</p></div>
            <div><p className="text-xs text-gray-500">Boarded</p><p className="font-medium text-gray-800">{data.boarded ? "Yes" : "No"}</p></div>
            <div><p className="text-xs text-gray-500">Dropped</p><p className="font-medium text-gray-800">{data.dropped ? "Yes" : "No"}</p></div>
            <div><p className="text-xs text-gray-500">Boarding Time</p><p className="font-medium text-gray-800">{formatTime(data.boarding_time)}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Created At</p><p className="text-gray-600">{formatDateTime(data.created_at)}</p></div>
          </div>
        );
      default:
        return <p>No details available</p>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            {type === "bus" && <Bus className="w-5 h-5 text-blue-600" />}
            {type === "route" && <MapPin className="w-5 h-5 text-blue-600" />}
            {type === "bus-stop" && <StopCircle className="w-5 h-5 text-blue-600" />}
            {type === "bus-student" && <Users className="w-5 h-5 text-blue-600" />}
            {type === "attendance" && <CalendarDays className="w-5 h-5 text-blue-600" />}
            {type === "bus" ? "Bus Details" : 
             type === "route" ? "Route Details" : 
             type === "bus-stop" ? "Bus Stop Details" :
             type === "bus-student" ? "Bus Student Details" : "Attendance Details"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{renderContent()}</div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Transport Component ──────────────────────────────────────────
const Transport = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("buses");
  
  // Data States
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [busStudents, setBusStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selection
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  
  // Delete
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [modalType, setModalType] = useState("bus");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({});
  
  const itemsPerPage = 10;

  // ─── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ─────────────────────────────────────────────────────────
const fetchTransportData = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const [busesRes, routesRes, busStopsRes, busStudentsRes, attendanceRes] = await Promise.all([
      api.get(BUSES_API),           // /transport/buses/
      api.get(ROUTES_API),          // /transport/routes/
      api.get(BUS_STOPS_API),       // /transport/bus-stops/
      api.get(BUS_STUDENTS_API),    // /transport/bus-students/
      api.get(TRANSPORT_ATTENDANCE_API), // /transport/transport-attendance/
    ]);

    const busesData = busesRes.data?.results || busesRes.data || [];
    const routesData = routesRes.data?.results || routesRes.data || [];
    const busStopsData = busStopsRes.data?.results || busStopsRes.data || [];
    const busStudentsData = busStudentsRes.data?.results || busStudentsRes.data || [];
    const attendanceData = attendanceRes.data?.results || attendanceRes.data || [];

    setBuses(busesData);
    setRoutes(routesData);
    setBusStops(busStopsData);
    setBusStudents(busStudentsData);
    setAttendance(attendanceData);
  } catch (error) {
    console.error("Failed to fetch transport data:", error);
    // ... error handling
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  // ─── Fetch Students for Dropdown ──────────────────────────────────────
useEffect(() => {
  const fetchStudents = async () => {
    try {
      // Remove /api from the URL - your api service already adds it
      const response = await api.get(STUDENTS_API);
      const studentsData = response.data?.results || response.data || [];
      setStudents(studentsData);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };
  fetchStudents();
}, []);

  useEffect(() => {
    fetchTransportData();
  }, [fetchTransportData]);

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getRouteName = useCallback((routeId) => {
    if (!routeId) return "—";
    const route = routes.find(r => r.id === routeId);
    return route?.name || "—";
  }, [routes]);

  const getBusNo = useCallback((busId) => {
    if (!busId) return "—";
    const bus = buses.find(b => b.id === busId);
    return bus?.bus_no || "—";
  }, [buses]);

  const getStudentName = useCallback((studentId) => {
    if (!studentId) return "—";
    const student = students.find(s => s.id === studentId);
    return student?.name || student?.full_name || "—";
  }, [students]);

  const getStopName = useCallback((stopId) => {
    if (!stopId) return "—";
    const stop = busStops.find(s => s.id === stopId);
    return stop?.name || "—";
  }, [busStops]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      if (filterStatus !== "all" && bus.status !== filterStatus) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (bus.bus_no?.toLowerCase() || "").includes(search) ||
             (bus.capacity?.toString() || "").includes(search) ||
             (bus.status?.toLowerCase() || "").includes(search);
    });
  }, [buses, searchTerm, filterStatus]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (route.name?.toLowerCase() || "").includes(search) ||
             (route.description?.toLowerCase() || "").includes(search) ||
             (route.start_point?.toLowerCase() || "").includes(search) ||
             (route.end_point?.toLowerCase() || "").includes(search);
    });
  }, [routes, searchTerm]);

  const filteredBusStops = useMemo(() => {
    return busStops.filter(stop => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (stop.name?.toLowerCase() || "").includes(search) ||
             getRouteName(stop.route).toLowerCase().includes(search) ||
             (stop.stop_order?.toString() || "").includes(search);
    });
  }, [busStops, searchTerm, getRouteName]);

  const filteredBusStudents = useMemo(() => {
    return busStudents.filter(bs => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getBusNo(bs.bus).toLowerCase().includes(search) ||
             getStudentName(bs.student).toLowerCase().includes(search) ||
             getStopName(bs.pickup_stop).toLowerCase().includes(search) ||
             getStopName(bs.drop_stop).toLowerCase().includes(search);
    });
  }, [busStudents, searchTerm, getBusNo, getStudentName, getStopName]);

  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => {
      if (filterDate && a.date !== filterDate) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      const busStudent = busStudents.find(bs => bs.id === a.bus_student);
      const studentName = busStudent ? getStudentName(busStudent.student) : "";
      return studentName.toLowerCase().includes(search) ||
             (a.boarded ? "boarded" : "").includes(search) ||
             (a.dropped ? "dropped" : "").includes(search);
    });
  }, [attendance, searchTerm, filterDate, busStudents, getStudentName]);

  // ─── Pagination ────────────────────────────────────────────────────────
  const getPageItems = (items) => {
    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      items: items.slice(startIndex, startIndex + itemsPerPage),
      totalPages,
      startIndex,
    };
  };

  const busPage = getPageItems(filteredBuses);
  const routePage = getPageItems(filteredRoutes);
  const busStopPage = getPageItems(filteredBusStops);
  const busStudentPage = getPageItems(filteredBusStudents);
  const attendancePage = getPageItems(filteredAttendance);

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalBuses = buses.length;
    const activeBuses = buses.filter(b => b.status === "active").length;
    const totalRoutes = routes.length;
    const totalBusStops = busStops.length;
    const totalBusStudents = busStudents.length;
    const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length;
    return { totalBuses, activeBuses, totalRoutes, totalBusStops, totalBusStudents, todayAttendance };
  }, [buses, routes, busStops, busStudents, attendance]);

  // ─── CRUD Operations ────────────────────────────────────────────────────
  
  // ─── Bus CRUD ──────────────────────────────────────────────────────────
  const handleSaveBus = async () => {
    if (!formData.bus_no || !formData.capacity) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bus_no: formData.bus_no,
        capacity: Number(formData.capacity),
        status: formData.status || "active",
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${BUSES_API}${selectedItem.id}/`, payload);
        setBuses(buses.map(b => b.id === selectedItem.id ? { ...b, ...response.data } : b));
        showToast("Bus updated successfully", "success");
      } else {
        const response = await api.post(BUSES_API, payload);
        setBuses([response.data, ...buses]);
        showToast("Bus added successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save bus:", error);
      showToast(error.response?.data?.detail || "Failed to save bus", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBus = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${BUSES_API}${deletingItem.id}/`);
      setBuses(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Bus deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete bus:", error);
      showToast(error.response?.data?.detail || "Failed to delete bus", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Route CRUD ──────────────────────────────────────────────────────────
  const handleSaveRoute = async () => {
    if (!formData.name) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || "",
        start_point: formData.start_point || "",
        end_point: formData.end_point || "",
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${ROUTES_API}${selectedItem.id}/`, payload);
        setRoutes(routes.map(r => r.id === selectedItem.id ? { ...r, ...response.data } : r));
        showToast("Route updated successfully", "success");
      } else {
        const response = await api.post(ROUTES_API, payload);
        setRoutes([response.data, ...routes]);
        showToast("Route added successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save route:", error);
      showToast(error.response?.data?.detail || "Failed to save route", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${ROUTES_API}${deletingItem.id}/`);
      setRoutes(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Route deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete route:", error);
      showToast(error.response?.data?.detail || "Failed to delete route", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Bus Stop CRUD ──────────────────────────────────────────────────────
  const handleSaveBusStop = async () => {
    if (!formData.route || !formData.name || !formData.stop_order) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        route: Number(formData.route),
        name: formData.name,
        stop_order: Number(formData.stop_order),
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${BUS_STOPS_API}${selectedItem.id}/`, payload);
        setBusStops(busStops.map(s => s.id === selectedItem.id ? { ...s, ...response.data } : s));
        showToast("Bus stop updated successfully", "success");
      } else {
        const response = await api.post(BUS_STOPS_API, payload);
        setBusStops([response.data, ...busStops]);
        showToast("Bus stop added successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save bus stop:", error);
      showToast(error.response?.data?.detail || "Failed to save bus stop", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusStop = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${BUS_STOPS_API}${deletingItem.id}/`);
      setBusStops(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Bus stop deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete bus stop:", error);
      showToast(error.response?.data?.detail || "Failed to delete bus stop", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Bus Student CRUD ──────────────────────────────────────────────────
  const handleSaveBusStudent = async () => {
    if (!formData.bus || !formData.student) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bus: Number(formData.bus),
        student: Number(formData.student),
        pickup_stop: formData.pickup_stop ? Number(formData.pickup_stop) : null,
        drop_stop: formData.drop_stop ? Number(formData.drop_stop) : null,
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${BUS_STUDENTS_API}${selectedItem.id}/`, payload);
        setBusStudents(busStudents.map(bs => bs.id === selectedItem.id ? { ...bs, ...response.data } : bs));
        showToast("Bus student updated successfully", "success");
      } else {
        const response = await api.post(BUS_STUDENTS_API, payload);
        setBusStudents([response.data, ...busStudents]);
        showToast("Student assigned to bus successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save bus student:", error);
      showToast(error.response?.data?.detail || "Failed to save bus student", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBusStudent = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${BUS_STUDENTS_API}${deletingItem.id}/`);
      setBusStudents(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Bus student removed successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete bus student:", error);
      showToast(error.response?.data?.detail || "Failed to delete bus student", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Attendance CRUD ──────────────────────────────────────────────────
  const handleSaveAttendance = async () => {
    if (!formData.bus_student || !formData.date) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        bus_student: Number(formData.bus_student),
        date: formData.date,
        boarded: formData.boarded || false,
        dropped: formData.dropped || false,
        boarding_time: formData.boarding_time || null,
      };

      if (modalMode === "edit" && selectedItem) {
        const response = await api.patch(`${TRANSPORT_ATTENDANCE_API}${selectedItem.id}/`, payload);
        setAttendance(attendance.map(a => a.id === selectedItem.id ? { ...a, ...response.data } : a));
        showToast("Attendance updated successfully", "success");
      } else {
        const response = await api.post(TRANSPORT_ATTENDANCE_API, payload);
        setAttendance([response.data, ...attendance]);
        showToast("Attendance added successfully", "success");
      }
      setModalOpen(false);
      setFormData({});
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to save attendance:", error);
      showToast(error.response?.data?.detail || "Failed to save attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendance = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await api.delete(`${TRANSPORT_ATTENDANCE_API}${deletingItem.id}/`);
      setAttendance(prev => prev.filter(item => item.id !== deletingItem.id));
      showToast("Attendance deleted successfully", "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete attendance:", error);
      showToast(error.response?.data?.detail || "Failed to delete attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Open Modal Helper ──────────────────────────────────────────────
  const openModal = (type, mode, item = null) => {
    setModalType(type);
    setModalMode(mode);
    setSelectedItem(item);
    
    let initialFormData = {};
    
    if (type === "bus") {
      initialFormData = { bus_no: "", capacity: "", status: "active" };
    } else if (type === "route") {
      initialFormData = { name: "", description: "", start_point: "", end_point: "" };
    } else if (type === "bus-stop") {
      initialFormData = { route: "", name: "", stop_order: "" };
    } else if (type === "bus-student") {
      initialFormData = { bus: "", student: "", pickup_stop: "", drop_stop: "" };
    } else if (type === "attendance") {
      initialFormData = { bus_student: "", date: "", boarded: false, dropped: false, boarding_time: "" };
    }
    
    if (item && mode === "edit") {
      setFormData({ ...item });
    } else {
      setFormData(initialFormData);
    }
    
    setModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransportData();
    showToast("Transport data refreshed", "success");
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="Transport" subtitle="Manage school transport" breadcrumbs={["Admin", "Transport"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading transport data...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Transport" 
          subtitle={`Manage buses, routes, bus stops, and attendance${buses.length > 0 ? ` — ${buses.length} buses, ${routes.length} routes, ${busStops.length} stops` : ""}`}
          breadcrumbs={["Admin", "Transport"]}
          action={
            <div className="flex items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <button 
                onClick={() => {
                  if (activeTab === "buses") openModal("bus", "add");
                  else if (activeTab === "routes") openModal("route", "add");
                  else if (activeTab === "bus-stops") openModal("bus-stop", "add");
                  else if (activeTab === "bus-students") openModal("bus-student", "add");
                  else if (activeTab === "attendance") openModal("attendance", "add");
                }} 
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> 
                {activeTab === "buses" ? "Add Bus" : 
                 activeTab === "routes" ? "Add Route" : 
                 activeTab === "bus-stops" ? "Add Bus Stop" :
                 activeTab === "bus-students" ? "Assign Student" : "Add Attendance"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading transport</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Buses</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalBuses}</p>
            <p className="text-xs text-gray-400 mt-1">{stats.activeBuses} active</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Buses</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.activeBuses}</p>
            <p className="text-xs text-gray-400 mt-1">In operation</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Routes</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalRoutes}</p>
            <p className="text-xs text-gray-400 mt-1">Active routes</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bus Stops</p>
            <p className="text-2xl font-bold text-amber-600">{stats.totalBusStops}</p>
            <p className="text-xs text-gray-400 mt-1">Total stops</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-cyan-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.totalBusStudents}</p>
            <p className="text-xs text-gray-400 mt-1">Assigned to buses</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "buses" && buses.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{buses.length}</span>
                  )}
                  {tab.id === "routes" && routes.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{routes.length}</span>
                  )}
                  {tab.id === "bus-stops" && busStops.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{busStops.length}</span>
                  )}
                  {tab.id === "bus-students" && busStudents.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{busStudents.length}</span>
                  )}
                  {tab.id === "attendance" && attendance.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{attendance.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ─── Tab Content ────────────────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* ─── Search & Filters ────────────────────────────────────────── */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "buses" ? "Search by bus number or status..." :
                    activeTab === "routes" ? "Search by name, start or end point..." :
                    activeTab === "bus-stops" ? "Search by stop name or route..." :
                    activeTab === "bus-students" ? "Search by bus, student or stop..." :
                    "Search by student or status..."
                  }
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeTab === "buses" && (
                  <>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} 
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    {filterStatus !== "all" && (
                      <button onClick={() => { setFilterStatus("all"); setCurrentPage(1); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </>
                )}
                {activeTab === "attendance" && (
                  <>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                      className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                    {filterDate && (
                      <button onClick={() => { setFilterDate(""); setCurrentPage(1); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── Buses Tab ──────────────────────────────────────────────── */}
          {activeTab === "buses" && (
            <div className="overflow-x-auto">
              {buses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Bus className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Buses Found</p><p className="text-sm text-gray-400 mt-1">Add a bus to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bus Number</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {busPage.items.map((bus) => (
                      <tr key={bus.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{bus.bus_no || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-700">{bus.capacity || 0}</td>
                        <td className="px-4 py-3.5">{getStatusBadge(bus.status, BUS_STATUS)}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatDate(bus.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(bus); setSelectedType("bus"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openModal("bus", "edit", bus)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeletingItem(bus); setDeleteType("bus"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {buses.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={busPage.totalPages} startIndex={busPage.startIndex} itemsShown={busPage.items.length} totalItems={filteredBuses.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Routes Tab ──────────────────────────────────────────────── */}
          {activeTab === "routes" && (
            <div className="overflow-x-auto">
              {routes.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><MapPin className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Routes Found</p><p className="text-sm text-gray-400 mt-1">Add a route to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route Name</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Point</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">End Point</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {routePage.items.map((route) => (
                      <tr key={route.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{route.name || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-700">{route.start_point || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-700">{route.end_point || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatDate(route.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(route); setSelectedType("route"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openModal("route", "edit", route)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeletingItem(route); setDeleteType("route"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {routes.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={routePage.totalPages} startIndex={routePage.startIndex} itemsShown={routePage.items.length} totalItems={filteredRoutes.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Bus Stops Tab ───────────────────────────────────────────── */}
          {activeTab === "bus-stops" && (
            <div className="overflow-x-auto">
              {busStops.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><StopCircle className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Bus Stops Found</p><p className="text-sm text-gray-400 mt-1">Add a bus stop to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop Name</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stop Order</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {busStopPage.items.map((stop) => (
                      <tr key={stop.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{stop.name || "—"}</td>
                        <td className="px-4 py-3.5 text-gray-700">{getRouteName(stop.route)}</td>
                        <td className="px-4 py-3.5 text-gray-700">{stop.stop_order || 0}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatDate(stop.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(stop); setSelectedType("bus-stop"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openModal("bus-stop", "edit", stop)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeletingItem(stop); setDeleteType("bus-stop"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {busStops.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={busStopPage.totalPages} startIndex={busStopPage.startIndex} itemsShown={busStopPage.items.length} totalItems={filteredBusStops.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Bus Students Tab ───────────────────────────────────────── */}
          {activeTab === "bus-students" && (
            <div className="overflow-x-auto">
              {busStudents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Students Assigned to Buses</p><p className="text-sm text-gray-400 mt-1">Assign a student to a bus to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bus</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pickup Stop</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Drop Stop</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {busStudentPage.items.map((bs) => (
                      <tr key={bs.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{getBusNo(bs.bus)}</td>
                        <td className="px-4 py-3.5 text-gray-700">{getStudentName(bs.student)}</td>
                        <td className="px-4 py-3.5 text-gray-700">{getStopName(bs.pickup_stop)}</td>
                        <td className="px-4 py-3.5 text-gray-700">{getStopName(bs.drop_stop)}</td>
                        <td className="px-4 py-3.5 text-gray-600">{formatDate(bs.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(bs); setSelectedType("bus-student"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => openModal("bus-student", "edit", bs)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { setDeletingItem(bs); setDeleteType("bus-student"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {busStudents.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={busStudentPage.totalPages} startIndex={busStudentPage.startIndex} itemsShown={busStudentPage.items.length} totalItems={filteredBusStudents.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Attendance Tab ────────────────────────────────────────── */}
          {activeTab === "attendance" && (
            <div className="overflow-x-auto">
              {attendance.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><CalendarDays className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Attendance Records Found</p><p className="text-sm text-gray-400 mt-1">Add transport attendance to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Boarded</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dropped</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Boarding Time</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendancePage.items.map((a) => {
                      const busStudent = busStudents.find(bs => bs.id === a.bus_student);
                      const studentName = busStudent ? getStudentName(busStudent.student) : "—";
                      return (
                        <tr key={a.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5 font-medium text-gray-900">{studentName}</td>
                          <td className="px-4 py-3.5 text-gray-700">{formatDate(a.date)}</td>
                          <td className="px-4 py-3.5">
                            {a.boarded ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Yes</Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 border-red-200">No</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {a.dropped ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Yes</Badge>
                            ) : (
                              <Badge className="bg-red-50 text-red-700 border-red-200">No</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-700">{formatTime(a.boarding_time)}</td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedItem(a); setSelectedType("attendance"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => openModal("attendance", "edit", a)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => { setDeletingItem(a); setDeleteType("attendance"); }} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {attendance.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={attendancePage.totalPages} startIndex={attendancePage.startIndex} itemsShown={attendancePage.items.length} totalItems={filteredAttendance.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      
      {/* Bus Modal */}
      {modalOpen && modalType === "bus" && (
        <BusModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveBus}
          loading={saving}
          routes={routes}
        />
      )}

      {/* Route Modal */}
      {modalOpen && modalType === "route" && (
        <RouteModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveRoute}
          loading={saving}
        />
      )}

      {/* Bus Stop Modal */}
      {modalOpen && modalType === "bus-stop" && (
        <BusStopModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveBusStop}
          loading={saving}
          routes={routes}
        />
      )}

      {/* Bus Student Modal */}
      {modalOpen && modalType === "bus-student" && (
        <BusStudentModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveBusStudent}
          loading={saving}
          buses={buses}
          busStops={busStops}
          students={students}
        />
      )}

      {/* Attendance Modal */}
      {modalOpen && modalType === "attendance" && (
        <AttendanceModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedItem(null); }}
          mode={modalMode}
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveAttendance}
          loading={saving}
          busStudents={busStudents}
        />
      )}

      {/* Details Modal */}
      <DetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedItem(null); }}
        data={selectedItem}
        type={selectedType}
      />

      {/* ─── Confirm Dialogs ─────────────────────────────────────────────── */}
      {deletingItem && deleteType === "bus" && (
        <ConfirmDialog open={true} title="Delete Bus" message={`Are you sure you want to delete "${deletingItem.bus_no}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteBus} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "route" && (
        <ConfirmDialog open={true} title="Delete Route" message={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteRoute} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "bus-stop" && (
        <ConfirmDialog open={true} title="Delete Bus Stop" message={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteBusStop} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "bus-student" && (
        <ConfirmDialog open={true} title="Remove Student from Bus" message={`Are you sure you want to remove this student from the bus? This action cannot be undone.`} confirmLabel="Remove" onConfirm={handleDeleteBusStudent} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {deletingItem && deleteType === "attendance" && (
        <ConfirmDialog open={true} title="Delete Attendance Record" message={`Are you sure you want to delete this attendance record? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeleteAttendance} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

      {/* ─── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Transport;