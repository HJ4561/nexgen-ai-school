// src/modules/admin/pages/PTM/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, X, RefreshCw, AlertCircle, CheckCircle, 
  Edit, Trash2, Eye, Search, Filter, ChevronDown,
  Calendar, Users, Clock, User, Mail, Phone,
  MapPin, Award, BookOpen, MessageSquare, UserCheck, UserX,
  Handshake, CalendarDays, UserPlus,XCircle
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Constants ──────────────────────────────────────────────────────────
const PTM_API = "/ptm/ptm/";
const PTM_MEETINGS_API = "/ptm/ptm-meetings/";
const PTM_ATTENDEES_API = "/ptm/ptm-attendees/";
const CLASSES_API = "/academics/classes/";
const STUDENTS_API = "/users/students/";
const TEACHERS_API = "/users/teachers/";
const PARENTS_API = "/users/parents/";

// ─── Constants ──────────────────────────────────────────────────────────────
const PTM_TYPES = {
  term_review: { label: "Term Review", color: "bg-blue-50 text-blue-700 border-blue-200" },
  parent_teacher: { label: "Parent-Teacher", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  open_house: { label: "Open House", color: "bg-purple-50 text-purple-700 border-purple-200" },
  orientation: { label: "Orientation", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

const MEETING_STATUS = {
  scheduled: { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" },
  ongoing: { label: "Ongoing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  completed: { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200" },
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "—";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Tab Configuration ──────────────────────────────────────────────────────
const TABS = [
  { id: "ptm", label: "PTM Events", icon: Calendar },
  { id: "meetings", label: "Meetings", icon: CalendarDays },
  { id: "attendees", label: "Attendees", icon: Users },
];

// ─── PTM Modal ──────────────────────────────────────────────────────────────
const PTMModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, classes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Create PTM" : "Edit PTM"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Class <span className="text-red-500">*</span></label>
            <select
              value={formData.class_obj || ""}
              onChange={(e) => setFormData({ ...formData, class_obj: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select class...</option>
              {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">PTM Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Term 2 PTM"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Type <span className="text-red-500">*</span></label>
            <select
              value={formData.type || "term_review"}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {Object.entries(PTM_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
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
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter PTM description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.class_obj || !formData.name || !formData.date} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Create PTM" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Meeting Modal ──────────────────────────────────────────────────────────
const MeetingModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading, ptms, students, teachers }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Schedule Meeting" : "Edit Meeting"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">PTM <span className="text-red-500">*</span></label>
            <select
              value={formData.ptm || ""}
              onChange={(e) => setFormData({ ...formData, ptm: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select PTM...</option>
              {ptms.map(ptm => <option key={ptm.id} value={ptm.id}>{ptm.name}</option>)}
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
              {students.map(s => <option key={s.id} value={s.id}>{s.name || s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Teacher <span className="text-red-500">*</span></label>
            <select
              value={formData.teacher || ""}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name || t.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.meeting_date || ""}
              onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={formData.start_time || ""}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                value={formData.end_time || ""}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g., Room 101"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select
              value={formData.status || "scheduled"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              placeholder="Enter notes..."
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.ptm || !formData.student || !formData.teacher || !formData.meeting_date || !formData.start_time || !formData.end_time} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Schedule Meeting" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Attendee Modal ─────────────────────────────────────────────────────────
const AttendeeModal = ({ isOpen, onClose, formData, setFormData, onSave, loading, meetings, parents }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Add PTM Attendee
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Meeting <span className="text-red-500">*</span></label>
            <select
              value={formData.ptm_meeting || ""}
              onChange={(e) => setFormData({ ...formData, ptm_meeting: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select meeting...</option>
              {meetings.map(m => <option key={m.id} value={m.id}>{m.ptm_name || m.name || `Meeting ${m.id}`}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Parent <span className="text-red-500">*</span></label>
            <select
              value={formData.parent || ""}
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select parent...</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name || p.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Attended</label>
            <select
              value={formData.attended ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, attended: e.target.value === "true" })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.ptm_meeting || !formData.parent} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add Attendee
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main PTM Component ─────────────────────────────────────────────────────
const PTM = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ptm");
  
  // PTM Data
  const [ptms, setPtms] = useState([]);
  const [ptmMeetings, setPtmMeetings] = useState([]);
  const [ptmAttendees, setPtmAttendees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAttended, setFilterAttended] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Selection
  const [selectedPTM, setSelectedPTM] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  
  // Delete
  const [deletingPTM, setDeletingPTM] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);
  const [deletingAttendee, setDeletingAttendee] = useState(null);
  
  // Modals
  const [ptmModalOpen, setPtmModalOpen] = useState(false);
  const [ptmModalMode, setPtmModalMode] = useState("add");
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingModalMode, setMeetingModalMode] = useState("add");
  const [attendeeModalOpen, setAttendeeModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsType, setDetailsType] = useState("ptm");
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Form Data
  const [ptmFormData, setPtmFormData] = useState({
    class_obj: "",
    name: "",
    type: "term_review",
    date: "",
    description: "",
  });
  
  const [meetingFormData, setMeetingFormData] = useState({
    ptm: "",
    student: "",
    teacher: "",
    meeting_date: "",
    start_time: "",
    end_time: "",
    location: "",
    status: "scheduled",
    notes: "",
  });
  
  const [attendeeFormData, setAttendeeFormData] = useState({
    ptm_meeting: "",
    parent: "",
    attended: true,
    joined_at: "",
  });
  
  const itemsPerPage = 10;

  // ─── Toast ──────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ptmsRes, meetingsRes, attendeesRes, classesRes, studentsRes, teachersRes, parentsRes] = await Promise.all([
        api.get(PTM_API),
        api.get(PTM_MEETINGS_API),
        api.get(PTM_ATTENDEES_API),
        api.get(CLASSES_API),
        api.get(STUDENTS_API),
        api.get(TEACHERS_API),
        api.get(PARENTS_API),
      ]);
      setPtms(ptmsRes.data?.results || ptmsRes.data || []);
      setPtmMeetings(meetingsRes.data?.results || meetingsRes.data || []);
      setPtmAttendees(attendeesRes.data?.results || attendeesRes.data || []);
      setClasses(classesRes.data?.results || classesRes.data || []);
      setStudents(studentsRes.data?.results || studentsRes.data || []);
      setTeachers(teachersRes.data?.results || teachersRes.data || []);
      setParents(parentsRes.data?.results || parentsRes.data || []);
    } catch (error) {
      console.error("Failed to fetch PTM data:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(error.response?.data?.detail || "Failed to load PTM data");
      }
      setPtms([]);
      setPtmMeetings([]);
      setPtmAttendees([]);
      setClasses([]);
      setStudents([]);
      setTeachers([]);
      setParents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    showToast("PTM data refreshed", "success");
  };

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getClassName = (classId) => {
    if (!classId) return "—";
    const cls = classes.find(c => c.id === classId);
    return cls?.name || "—";
  };

  const getPTMName = (ptmId) => {
    if (!ptmId) return "—";
    const ptm = ptms.find(p => p.id === ptmId);
    return ptm?.name || "—";
  };

  const getStudentName = (studentId) => {
    if (!studentId) return "—";
    const student = students.find(s => s.id === studentId);
    return student?.name || student?.full_name || "—";
  };

  const getTeacherName = (teacherId) => {
    if (!teacherId) return "—";
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || teacher?.full_name || "—";
  };

  const getParentName = (parentId) => {
    if (!parentId) return "—";
    const parent = parents.find(p => p.id === parentId);
    return parent?.name || parent?.full_name || "—";
  };

  const getMeetingName = (meetingId) => {
    if (!meetingId) return "—";
    const meeting = ptmMeetings.find(m => m.id === meetingId);
    return meeting?.ptm_name || meeting?.name || `Meeting ${meetingId}`;
  };

  const getMeetingCount = (ptmId) => {
    if (!ptmId) return 0;
    return ptmMeetings.filter(m => m.ptm === ptmId).length;
  };

  const getAttendeeCount = (ptmId) => {
    if (!ptmId) return 0;
    const meetings = ptmMeetings.filter(m => m.ptm === ptmId);
    const meetingIds = meetings.map(m => m.id);
    return ptmAttendees.filter(a => meetingIds.includes(a.ptm_meeting)).length;
  };

  // ─── Filtered Data ─────────────────────────────────────────────────────
  const filteredPTMs = useMemo(() => {
    return ptms.filter(ptm => {
      if (filterType !== "all" && ptm.type !== filterType) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (ptm.name?.toLowerCase() || "").includes(search) ||
             getClassName(ptm.class_obj).toLowerCase().includes(search) ||
             (ptm.type?.toLowerCase() || "").includes(search);
    });
  }, [ptms, searchTerm, filterType]);

  const filteredMeetings = useMemo(() => {
    return ptmMeetings.filter(meeting => {
      if (filterStatus !== "all" && meeting.status !== filterStatus) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getPTMName(meeting.ptm).toLowerCase().includes(search) ||
             getStudentName(meeting.student).toLowerCase().includes(search) ||
             getTeacherName(meeting.teacher).toLowerCase().includes(search) ||
             (meeting.location?.toLowerCase() || "").includes(search);
    });
  }, [ptmMeetings, searchTerm, filterStatus]);

  const filteredAttendees = useMemo(() => {
    return ptmAttendees.filter(attendee => {
      if (filterAttended !== "all") {
        const attended = attendee.attended ? "attended" : "not-attended";
        if (filterAttended !== attended) return false;
      }
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getMeetingName(attendee.ptm_meeting).toLowerCase().includes(search) ||
             getParentName(attendee.parent).toLowerCase().includes(search);
    });
  }, [ptmAttendees, searchTerm, filterAttended]);

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

  const ptmPage = getPageItems(filteredPTMs);
  const meetingPage = getPageItems(filteredMeetings);
  const attendeePage = getPageItems(filteredAttendees);

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = ptms.length;
    const upcoming = ptms.filter(p => new Date(p.date) > new Date()).length;
    const completed = ptms.filter(p => new Date(p.date) < new Date()).length;
    const totalMeetings = ptmMeetings.length;
    const totalAttendees = ptmAttendees.filter(a => a.attended).length;
    return { total, upcoming, completed, totalMeetings, totalAttendees };
  }, [ptms, ptmMeetings, ptmAttendees]);

  // ─── CRUD Operations ──────────────────────────────────────────────────
  
  // ─── PTM CRUD ──────────────────────────────────────────────────────────
  const handleSavePTM = async () => {
    if (!ptmFormData.class_obj || !ptmFormData.name || !ptmFormData.date) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        class_obj: Number(ptmFormData.class_obj),
        name: ptmFormData.name,
        type: ptmFormData.type,
        date: ptmFormData.date,
        description: ptmFormData.description || "",
      };

      if (ptmModalMode === "edit" && selectedPTM) {
        const response = await api.patch(`${PTM_API}${selectedPTM.id}/`, payload);
        setPtms(ptms.map(p => p.id === selectedPTM.id ? { ...p, ...response.data } : p));
        showToast("PTM updated successfully", "success");
      } else {
        const response = await api.post(PTM_API, payload);
        setPtms([response.data, ...ptms]);
        showToast("PTM created successfully", "success");
      }
      setPtmModalOpen(false);
      setPtmFormData({ class_obj: "", name: "", type: "term_review", date: "", description: "" });
      setSelectedPTM(null);
    } catch (error) {
      console.error("Failed to save PTM:", error);
      showToast(error.response?.data?.detail || "Failed to save PTM", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePTM = async () => {
    if (!deletingPTM) return;
    setSaving(true);
    try {
      await api.delete(`${PTM_API}${deletingPTM.id}/`);
      setPtms(prev => prev.filter(item => item.id !== deletingPTM.id));
      showToast("PTM deleted successfully", "success");
      setDeletingPTM(null);
    } catch (error) {
      console.error("Failed to delete PTM:", error);
      showToast(error.response?.data?.detail || "Failed to delete PTM", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Meeting CRUD ──────────────────────────────────────────────────────
  const handleSaveMeeting = async () => {
    if (!meetingFormData.ptm || !meetingFormData.student || !meetingFormData.teacher || 
        !meetingFormData.meeting_date || !meetingFormData.start_time || !meetingFormData.end_time) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ptm: Number(meetingFormData.ptm),
        student: Number(meetingFormData.student),
        teacher: Number(meetingFormData.teacher),
        meeting_date: meetingFormData.meeting_date,
        start_time: meetingFormData.start_time,
        end_time: meetingFormData.end_time,
        location: meetingFormData.location || "",
        status: meetingFormData.status || "scheduled",
        notes: meetingFormData.notes || "",
      };

      if (meetingModalMode === "edit" && selectedMeeting) {
        const response = await api.patch(`${PTM_MEETINGS_API}${selectedMeeting.id}/`, payload);
        setPtmMeetings(ptmMeetings.map(m => m.id === selectedMeeting.id ? { ...m, ...response.data } : m));
        showToast("PTM meeting updated successfully", "success");
      } else {
        const response = await api.post(PTM_MEETINGS_API, payload);
        setPtmMeetings([response.data, ...ptmMeetings]);
        showToast("PTM meeting created successfully", "success");
      }
      setMeetingModalOpen(false);
      setMeetingFormData({ ptm: "", student: "", teacher: "", meeting_date: "", start_time: "", end_time: "", location: "", status: "scheduled", notes: "" });
      setSelectedMeeting(null);
    } catch (error) {
      console.error("Failed to save PTM meeting:", error);
      showToast(error.response?.data?.detail || "Failed to save PTM meeting", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!deletingMeeting) return;
    setSaving(true);
    try {
      await api.delete(`${PTM_MEETINGS_API}${deletingMeeting.id}/`);
      setPtmMeetings(prev => prev.filter(item => item.id !== deletingMeeting.id));
      showToast("PTM meeting deleted", "success");
      setDeletingMeeting(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast(error.response?.data?.detail || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Attendee CRUD ─────────────────────────────────────────────────────
  const handleSaveAttendee = async () => {
    if (!attendeeFormData.ptm_meeting || !attendeeFormData.parent) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ptm_meeting: Number(attendeeFormData.ptm_meeting),
        parent: Number(attendeeFormData.parent),
        attended: attendeeFormData.attended,
        joined_at: attendeeFormData.joined_at || new Date().toISOString(),
      };

      const response = await api.post(PTM_ATTENDEES_API, payload);
      setPtmAttendees([response.data, ...ptmAttendees]);
      showToast("PTM attendee added successfully", "success");
      setAttendeeModalOpen(false);
      setAttendeeFormData({ ptm_meeting: "", parent: "", attended: true, joined_at: "" });
    } catch (error) {
      console.error("Failed to add PTM attendee:", error);
      showToast(error.response?.data?.detail || "Failed to add PTM attendee", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAttendance = async (attendeeId, currentStatus) => {
    setSaving(true);
    try {
      const response = await api.patch(`${PTM_ATTENDEES_API}${attendeeId}/`, {
        attended: !currentStatus,
        joined_at: !currentStatus ? new Date().toISOString() : null,
      });
      setPtmAttendees(ptmAttendees.map(a => a.id === attendeeId ? { ...a, ...response.data } : a));
      showToast(`Attendance ${!currentStatus ? "marked" : "unmarked"} successfully`, "success");
    } catch (error) {
      console.error("Failed to update attendance:", error);
      showToast("Failed to update attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAttendee = async () => {
    if (!deletingAttendee) return;
    setSaving(true);
    try {
      await api.delete(`${PTM_ATTENDEES_API}${deletingAttendee.id}/`);
      setPtmAttendees(prev => prev.filter(item => item.id !== deletingAttendee.id));
      showToast("PTM attendee removed", "success");
      setDeletingAttendee(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast(error.response?.data?.detail || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="PTM Management" subtitle="Manage Parent-Teacher Meetings, Schedules & Attendance" breadcrumbs={["Admin", "PTM"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading PTM data...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="PTM Management" 
          subtitle={`Manage Parent-Teacher Meetings, Schedules & Attendance${ptms.length > 0 ? ` — ${ptms.length} PTMs, ${ptmMeetings.length} Meetings, ${ptmAttendees.length} Attendees` : ""}`}
          breadcrumbs={["Admin", "PTM"]}
          action={
            <div className="flex items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              {activeTab === "ptm" && (
                <button onClick={() => { setPtmModalMode("add"); setPtmFormData({ class_obj: "", name: "", type: "term_review", date: "", description: "" }); setPtmModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                  <Plus className="w-4 h-4" /> Create PTM
                </button>
              )}
              {activeTab === "meetings" && (
                <button onClick={() => { setMeetingModalMode("add"); setMeetingFormData({ ptm: "", student: "", teacher: "", meeting_date: "", start_time: "", end_time: "", location: "", status: "scheduled", notes: "" }); setMeetingModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                  <Plus className="w-4 h-4" /> Schedule Meeting
                </button>
              )}
              {activeTab === "attendees" && (
                <button onClick={() => { setAttendeeModalOpen(true); setAttendeeFormData({ ptm_meeting: "", parent: "", attended: true, joined_at: "" }); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                  <Plus className="w-4 h-4" /> Add Attendee
                </button>
              )}
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading PTM data</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total PTMs</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All meetings</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.upcoming}</p>
            <p className="text-xs text-gray-400 mt-1">Scheduled</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-gray-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-600">{stats.completed}</p>
            <p className="text-xs text-gray-400 mt-1">Held</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Meetings</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalMeetings}</p>
            <p className="text-xs text-gray-400 mt-1">Scheduled slots</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</p>
            <p className="text-2xl font-bold text-amber-600">{stats.totalAttendees}</p>
            <p className="text-xs text-gray-400 mt-1">Parents attended</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-1 -mb-px" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "ptm" && ptms.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{ptms.length}</span>
                  )}
                  {tab.id === "meetings" && ptmMeetings.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{ptmMeetings.length}</span>
                  )}
                  {tab.id === "attendees" && ptmAttendees.length > 0 && (
                    <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{ptmAttendees.length}</span>
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
                  placeholder={activeTab === "ptm" ? "Search by name, class, or type..." : activeTab === "meetings" ? "Search by PTM, student, or teacher..." : "Search by meeting or parent..."}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {activeTab === "ptm" && (
                  <>
                    <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Types</option>
                      {Object.entries(PTM_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                    </select>
                    {filterType !== "all" && <button onClick={() => { setFilterType("all"); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
                  </>
                )}
                {activeTab === "meetings" && (
                  <>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {filterStatus !== "all" && <button onClick={() => { setFilterStatus("all"); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
                  </>
                )}
                {activeTab === "attendees" && (
                  <>
                    <select value={filterAttended} onChange={(e) => { setFilterAttended(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                      <option value="all">All Status</option>
                      <option value="attended">Attended</option>
                      <option value="not-attended">Not Attended</option>
                    </select>
                    {filterAttended !== "all" && <button onClick={() => { setFilterAttended("all"); }} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ─── PTM Tab ────────────────────────────────────────────────── */}
          {activeTab === "ptm" && (
            <div className="overflow-x-auto">
              {ptms.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Calendar className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No PTMs Found</p><p className="text-sm text-gray-400 mt-1">Create a PTM to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">PTM Name</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meetings</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendees</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ptmPage.items.map((ptm) => {
                      const typeInfo = PTM_TYPES[ptm.type] || { label: ptm.type, color: "bg-gray-50 text-gray-700 border-gray-200" };
                      const isUpcoming = new Date(ptm.date) > new Date();
                      return (
                        <tr key={ptm.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><Handshake className="w-4 h-4 text-blue-600" /></div>
                              <span className="font-medium text-gray-900">{ptm.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getClassName(ptm.class_obj)}</td>
                          <td className="px-4 py-3.5"><Badge className={`${typeInfo.color} text-xs`}>{typeInfo.label}</Badge></td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-600">{formatDate(ptm.date)}</span>
                              {isUpcoming && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Upcoming</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getMeetingCount(ptm.id)}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getAttendeeCount(ptm.id)}</td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedPTM(ptm); setDetailsType("ptm"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => { setPtmModalMode("edit"); setSelectedPTM(ptm); setPtmFormData({ class_obj: ptm.class_obj || "", name: ptm.name || "", type: ptm.type || "term_review", date: ptm.date || "", description: ptm.description || "" }); setPtmModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit PTM"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => setDeletingPTM(ptm)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete PTM"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {ptms.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={ptmPage.totalPages} startIndex={ptmPage.startIndex} itemsShown={ptmPage.items.length} totalItems={filteredPTMs.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Meetings Tab ───────────────────────────────────────────── */}
          {activeTab === "meetings" && (
            <div className="overflow-x-auto">
              {ptmMeetings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><CalendarDays className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No PTM Meetings Found</p><p className="text-sm text-gray-400 mt-1">Schedule a meeting to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">PTM</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {meetingPage.items.map((meeting) => {
                      const statusInfo = MEETING_STATUS[meeting.status] || { label: meeting.status, color: "bg-gray-50 text-gray-700 border-gray-200" };
                      return (
                        <tr key={meeting.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5 font-medium text-gray-900">{getPTMName(meeting.ptm)}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getStudentName(meeting.student)}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{getTeacherName(meeting.teacher)}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-700">{formatDate(meeting.meeting_date)}</span>
                              <span className="text-xs text-gray-500">{formatTime(meeting.start_time)} - {formatTime(meeting.end_time)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge></td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedMeeting(meeting); setDetailsType("meeting"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => { setMeetingModalMode("edit"); setSelectedMeeting(meeting); setMeetingFormData({ ptm: meeting.ptm || "", student: meeting.student || "", teacher: meeting.teacher || "", meeting_date: meeting.meeting_date || "", start_time: meeting.start_time || "", end_time: meeting.end_time || "", location: meeting.location || "", status: meeting.status || "scheduled", notes: meeting.notes || "" }); setMeetingModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => setDeletingMeeting(meeting)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {ptmMeetings.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={meetingPage.totalPages} startIndex={meetingPage.startIndex} itemsShown={meetingPage.items.length} totalItems={filteredMeetings.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}

          {/* ─── Attendees Tab ──────────────────────────────────────────── */}
          {activeTab === "attendees" && (
            <div className="overflow-x-auto">
              {ptmAttendees.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><Users className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No PTM Attendees Found</p><p className="text-sm text-gray-400 mt-1">Add an attendee to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meeting</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Attended</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined At</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendeePage.items.map((attendee) => (
                      <tr key={attendee.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{getMeetingName(attendee.ptm_meeting)}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{getParentName(attendee.parent)}</td>
                        <td className="px-4 py-3.5">
                          <Badge className={attendee.attended ? "bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1" : "bg-red-50 text-red-700 border-red-200 flex items-center gap-1"}>
                            {attendee.attended ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {attendee.attended ? "Attended" : "Not Attended"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{attendee.joined_at ? formatDateTime(attendee.joined_at) : "—"}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedAttendee(attendee); setDetailsType("attendee"); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleToggleAttendance(attendee.id, attendee.attended)} disabled={saving} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" title="Toggle attendance">
                              {attendee.attended ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setDeletingAttendee(attendee)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {ptmAttendees.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={attendeePage.totalPages} startIndex={attendeePage.startIndex} itemsShown={attendeePage.items.length} totalItems={filteredAttendees.length} onPageChange={setCurrentPage} />
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────── */}
      
      {/* PTM Modal */}
      <PTMModal
        isOpen={ptmModalOpen}
        onClose={() => { setPtmModalOpen(false); setSelectedPTM(null); }}
        mode={ptmModalMode}
        formData={ptmFormData}
        setFormData={setPtmFormData}
        onSave={handleSavePTM}
        loading={saving}
        classes={classes}
      />

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={meetingModalOpen}
        onClose={() => { setMeetingModalOpen(false); setSelectedMeeting(null); }}
        mode={meetingModalMode}
        formData={meetingFormData}
        setFormData={setMeetingFormData}
        onSave={handleSaveMeeting}
        loading={saving}
        ptms={ptms}
        students={students}
        teachers={teachers}
      />

      {/* Attendee Modal */}
      <AttendeeModal
        isOpen={attendeeModalOpen}
        onClose={() => setAttendeeModalOpen(false)}
        formData={attendeeFormData}
        setFormData={setAttendeeFormData}
        onSave={handleSaveAttendee}
        loading={saving}
        meetings={ptmMeetings}
        parents={parents}
      />

      {/* ─── Details Modal ───────────────────────────────────────────────── */}
      {detailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDetailsModalOpen(false); setSelectedPTM(null); setSelectedMeeting(null); setSelectedAttendee(null); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                {detailsType === "ptm" && <Handshake className="w-5 h-5 text-blue-600" />}
                {detailsType === "meeting" && <CalendarDays className="w-5 h-5 text-blue-600" />}
                {detailsType === "attendee" && <Users className="w-5 h-5 text-blue-600" />}
                {detailsType === "ptm" ? "PTM Details" : detailsType === "meeting" ? "Meeting Details" : "Attendee Details"}
              </h3>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedPTM(null); setSelectedMeeting(null); setSelectedAttendee(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {detailsType === "ptm" && selectedPTM && (
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Name</p><p className="font-medium text-gray-800 mt-1">{selectedPTM.name || "—"}</p></div>
                  <div><p className="text-xs text-gray-500">Class</p><p className="font-medium text-gray-800 mt-1">{getClassName(selectedPTM.class_obj)}</p></div>
                  <div><p className="text-xs text-gray-500">Type</p><Badge className={`${PTM_TYPES[selectedPTM.type]?.color || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{PTM_TYPES[selectedPTM.type]?.label || selectedPTM.type}</Badge></div>
                  <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(selectedPTM.date)}</p></div>
                  <div><p className="text-xs text-gray-500">Meetings</p><p className="font-medium text-gray-800 mt-1">{getMeetingCount(selectedPTM.id)}</p></div>
                  <div><p className="text-xs text-gray-500">Attendees</p><p className="font-medium text-gray-800 mt-1">{getAttendeeCount(selectedPTM.id)}</p></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-gray-600 mt-1">{selectedPTM.description || "—"}</p></div>
                </div>
              )}
              {detailsType === "meeting" && selectedMeeting && (
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">PTM</p><p className="font-medium text-gray-800 mt-1">{getPTMName(selectedMeeting.ptm)}</p></div>
                  <div><p className="text-xs text-gray-500">Student</p><p className="font-medium text-gray-800 mt-1">{getStudentName(selectedMeeting.student)}</p></div>
                  <div><p className="text-xs text-gray-500">Teacher</p><p className="font-medium text-gray-800 mt-1">{getTeacherName(selectedMeeting.teacher)}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><Badge className={`${MEETING_STATUS[selectedMeeting.status]?.color || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{MEETING_STATUS[selectedMeeting.status]?.label || selectedMeeting.status}</Badge></div>
                  <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{formatDate(selectedMeeting.meeting_date)}</p></div>
                  <div><p className="text-xs text-gray-500">Time</p><p className="font-medium text-gray-800 mt-1">{formatTime(selectedMeeting.start_time)} - {formatTime(selectedMeeting.end_time)}</p></div>
                  <div><p className="text-xs text-gray-500">Location</p><p className="font-medium text-gray-800 mt-1">{selectedMeeting.location || "—"}</p></div>
                  {selectedMeeting.notes && <div className="col-span-2"><p className="text-xs text-gray-500">Notes</p><p className="text-gray-600 mt-1">{selectedMeeting.notes}</p></div>}
                </div>
              )}
              {detailsType === "attendee" && selectedAttendee && (
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Meeting</p><p className="font-medium text-gray-800 mt-1">{getMeetingName(selectedAttendee.ptm_meeting)}</p></div>
                  <div><p className="text-xs text-gray-500">Parent</p><p className="font-medium text-gray-800 mt-1">{getParentName(selectedAttendee.parent)}</p></div>
                  <div><p className="text-xs text-gray-500">Attended</p><Badge className={selectedAttendee.attended ? "bg-emerald-50 text-emerald-700 border-emerald-200 mt-1" : "bg-red-50 text-red-700 border-red-200 mt-1"}>{selectedAttendee.attended ? "Yes" : "No"}</Badge></div>
                  <div><p className="text-xs text-gray-500">Joined At</p><p className="font-medium text-gray-800 mt-1">{selectedAttendee.joined_at ? formatDateTime(selectedAttendee.joined_at) : "—"}</p></div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setDetailsModalOpen(false); setSelectedPTM(null); setSelectedMeeting(null); setSelectedAttendee(null); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm Dialogs ─────────────────────────────────────────────── */}
      {deletingPTM && (
        <ConfirmDialog open={true} title="Delete PTM" message={`Are you sure you want to delete "${deletingPTM.name}"? This action cannot be undone.`} confirmLabel="Delete" onConfirm={handleDeletePTM} onCancel={() => setDeletingPTM(null)} loading={saving} />
      )}

      {deletingMeeting && (
        <ConfirmDialog open={true} title="Delete Meeting" message={`Are you sure you want to delete this PTM meeting?`} confirmLabel="Delete" onConfirm={handleDeleteMeeting} onCancel={() => setDeletingMeeting(null)} loading={saving} />
      )}

      {deletingAttendee && (
        <ConfirmDialog open={true} title="Remove Attendee" message={`Are you sure you want to remove this PTM attendee?`} confirmLabel="Remove" onConfirm={handleDeleteAttendee} onCancel={() => setDeletingAttendee(null)} loading={saving} />
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

export default PTM;