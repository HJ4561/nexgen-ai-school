// src/modules/admin/pages/TimetableManagement/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Edit, Trash2, Calendar, Clock, BookOpen, User, X,
  RefreshCw, Eye, Save, Building2, Loader2, AlertCircle
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import adminService from "@/modules/admin/services/adminService";

// ─── Constants ──────────────────────────────────────────────────────────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["mon", "tue", "wed", "thu", "fri", "sat"];

const TIME_SLOTS = [
  "08:00", "08:45", "09:30", "10:15", "11:00", "11:45",
  "12:30", "13:15", "14:00", "14:45", "15:30"
];

// ─── Helper to map day short to full name ─────────────────────────────────
const mapDayToFull = (shortDay) => {
  const dayMap = {
    'mon': 'Monday',
    'tue': 'Tuesday',
    'wed': 'Wednesday',
    'thu': 'Thursday',
    'fri': 'Friday',
    'sat': 'Saturday',
    'sun': 'Sunday'
  };
  return dayMap[shortDay?.toLowerCase()] || shortDay;
};

// ─── Helper to format time (remove seconds) ──────────────────────────────
const formatTime = (time) => {
  if (!time) return "00:00";
  // If time has seconds (HH:MM:SS), remove seconds
  if (time.includes(':')) {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

const TimetableManagement = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  
  // Form data
  const [formData, setFormData] = useState({
    day: "Monday",
    start_time: "08:00",
    end_time: "08:45",
    subject: "",
    teacher: "",
    room: "",
    section: "",
    class_obj: "",
    type: "theory",
  });
  
  // Options for dropdowns
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [sections, setSections] = useState([]);

  // ─── Fetch Data ──────────────────────────────────────────────────────────
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedClass) {
        params.class_obj = selectedClass;
      }
      const response = await adminService.getTimetable(params);
      const data = response.results || response || [];
      
      // Map API data to component format
      const mappedData = data.map(item => ({
        id: item.id,
        class_id: item.class_obj,
        class_name: classes.find(c => c.id === item.class_obj)?.name || `Class ${item.class_obj}`,
        section_id: item.section,
        section_name: sections.find(s => s.id === item.section)?.name || `Section ${item.section}`,
        subject_id: item.subject,
        subject_name: subjects.find(s => s.id === item.subject)?.name || `Subject ${item.subject}`,
        teacher_id: item.teacher,
        teacher_name: teachers.find(t => t.id === item.teacher)?.name || `Teacher ${item.teacher}`,
        room_id: item.room,
        room_name: rooms.find(r => r.id === item.room)?.name || `Room ${item.room}`,
        day: mapDayToFull(item.day),
        day_short: item.day,
        start_time: formatTime(item.start_time),
        end_time: formatTime(item.end_time),
        type: item.type || "theory",
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        // Keep original data for reference
        _original: item
      }));
      
      setTimetable(mappedData);
    } catch (err) {
      console.error("Failed to fetch timetable:", err);
      setError(err.message || "Failed to load timetable");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, classes, sections, subjects, teachers, rooms]);

  const fetchOptions = useCallback(async () => {
    try {
      const [classesRes, subjectsRes, teachersRes, roomsRes, sectionsRes] = await Promise.all([
        adminService.getClasses().catch(() => ({ results: [] })),
        adminService.getSubjects().catch(() => ({ results: [] })),
        adminService.getTeachers().catch(() => ({ results: [] })),
        adminService.getRooms ? adminService.getRooms().catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
        adminService.getSections ? adminService.getSections().catch(() => ({ results: [] })) : Promise.resolve({ results: [] }),
      ]);
      setClasses(classesRes.results || classesRes || []);
      setSubjects(subjectsRes.results || subjectsRes || []);
      setTeachers(teachersRes.results || teachersRes || []);
      setRooms(roomsRes.results || roomsRes || []);
      setSections(sectionsRes.results || sectionsRes || []);
    } catch (err) {
      console.error("Failed to fetch options:", err);
    }
  }, []);

  // ─── Initial Load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]?.id);
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable();
    }
  }, [selectedClass, fetchTimetable]);

  // ─── Filter entries by selected class ───────────────────────────────────
  const classEntries = useMemo(() => {
    if (!selectedClass) return timetable;
    return timetable.filter((e) => e.class_id === selectedClass);
  }, [timetable, selectedClass]);

  // ─── Build Grid Data ────────────────────────────────────────────────────
  const gridData = useMemo(() => {
    const grid = {};
    DAYS.forEach(day => {
      grid[day] = {};
      TIME_SLOTS.forEach(time => {
        grid[day][time] = null;
      });
    });

    classEntries.forEach(entry => {
      const startIndex = TIME_SLOTS.indexOf(entry.start_time);
      const endIndex = TIME_SLOTS.indexOf(entry.end_time);
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        for (let i = startIndex; i < endIndex; i++) {
          const time = TIME_SLOTS[i];
          if (i === startIndex) {
            grid[entry.day][time] = { 
              ...entry, 
              isStart: true, 
              span: endIndex - startIndex 
            };
          } else {
            grid[entry.day][time] = { ...entry, isStart: false };
          }
        }
      } else {
        // If time slot not found in TIME_SLOTS, just place it at the start
        const startIdx = TIME_SLOTS.findIndex(t => t >= entry.start_time);
        if (startIdx !== -1) {
          grid[entry.day][TIME_SLOTS[startIdx]] = { ...entry, isStart: true, span: 1 };
        }
      }
    });

    return grid;
  }, [classEntries]);

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = classEntries.length;
    const classesCount = new Set(timetable.map((e) => e.class_name)).size;
    const teachersCount = new Set(classEntries.map((e) => e.teacher_name)).size;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayClasses = classEntries.filter((e) => e.day === today).length;
    return { total, classesCount, teachersCount, todayClasses };
  }, [timetable, classEntries]);

  // ─── Get Names Helper ──────────────────────────────────────────────────
  const getNames = useCallback((payload) => ({
    subject_name: subjects.find(s => s.id === payload.subject)?.name || payload.subject_name || "",
    teacher_name: teachers.find(t => t.id === payload.teacher)?.name || payload.teacher_name || "",
    room_name: rooms.find(r => r.id === payload.room)?.name || payload.room_name || "",
    class_name: classes.find(c => c.id === payload.class_obj)?.name || payload.class_name || "",
    section_name: sections.find(s => s.id === payload.section)?.name || payload.section_name || "",
  }), [subjects, teachers, rooms, classes, sections]);

  // ─── CRUD Operations ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");
    
    try {
      // Convert day to short format for API
      const dayMap = {
        'Monday': 'mon',
        'Tuesday': 'tue',
        'Wednesday': 'wed',
        'Thursday': 'thu',
        'Friday': 'fri',
        'Saturday': 'sat',
        'Sunday': 'sun'
      };

      const payload = {
        class_obj: parseInt(selectedClass),
        section: parseInt(formData.section),
        subject: parseInt(formData.subject),
        teacher: parseInt(formData.teacher),
        room: parseInt(formData.room),
        day: dayMap[formData.day] || formData.day.toLowerCase().slice(0, 3),
        start_time: formData.start_time,
        end_time: formData.end_time,
        type: formData.type || "theory",
      };

      let response;
      if (editingEntry) {
        response = await adminService.updateTimetable(editingEntry.id, payload);
        const updatedData = response.data || response;
        // Refresh timetable after update
        await fetchTimetable();
      } else {
        response = await adminService.createTimetable(payload);
        // Refresh timetable after create
        await fetchTimetable();
      }
      
      setModalOpen(false);
      setEditingEntry(null);
    } catch (err) {
      console.error("Failed to save:", err);
      setModalError(err.response?.data?.message || err.message || "Failed to save timetable entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteTimetable(deletingEntry.id);
      await fetchTimetable();
      setDeletingEntry(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      setError(err.response?.data?.message || "Failed to delete timetable entry");
    }
  };

  const openEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      day: entry.day || "Monday",
      start_time: entry.start_time || "08:00",
      end_time: entry.end_time || "08:45",
      subject: entry.subject_id || "",
      teacher: entry.teacher_id || "",
      room: entry.room_id || "",
      section: entry.section_id || "",
      class_obj: entry.class_id || "",
      type: entry.type || "theory",
    });
    setModalError("");
    setModalOpen(true);
  };

  const openDetail = (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
  };

  const handleAdd = (day, time) => {
    setEditingEntry(null);
    setFormData({
      day: day || "Monday",
      start_time: time || "08:00",
      end_time: time ? getNextTimeSlot(time) : "08:45",
      subject: "",
      teacher: "",
      room: "",
      section: "",
      class_obj: selectedClass || "",
      type: "theory",
    });
    setModalError("");
    setModalOpen(true);
  };

  const getNextTimeSlot = (time) => {
    const index = TIME_SLOTS.indexOf(time);
    return index !== -1 && index < TIME_SLOTS.length - 1 ? TIME_SLOTS[index + 1] : time;
  };

  // ─── Get Type Badge ────────────────────────────────────────────────────
  const getTypeColor = (type) => {
    switch(type) {
      case 'theory': return 'border-blue-300 bg-blue-50';
      case 'lab': return 'border-purple-300 bg-purple-50';
      case 'sports': return 'border-emerald-300 bg-emerald-50';
      case 'break': return 'border-amber-300 bg-amber-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && timetable.length === 0 && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading timetable...</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error && timetable.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <p className="text-gray-600 font-medium">Error loading timetable</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <button
          onClick={fetchTimetable}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Timetable Management"
          subtitle={`Manage class schedules${classEntries.length ? ` — ${classEntries.length} entries` : ""}`}
          breadcrumbs={["Admin", "Timetable"]}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => handleAdd()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
              <button
                onClick={fetchTimetable}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Today's Classes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayClasses}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Classes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.classesCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.teachersCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Class Selector */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Class
              </label>
              <select
                value={selectedClass || ""}
                onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
                className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || cls.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing {classEntries.length} entries {selectedClass ? `for ${classes.find(c => c.id === selectedClass)?.name || 'selected class'}` : "for all classes"}
            </div>
          </div>
        </Card>

        {/* Timetable Grid */}
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-[100px_repeat(6,1fr)] border-b border-gray-200 bg-gray-50/80">
                <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Time
                </div>
                {DAYS.map(day => (
                  <div key={day} className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {TIME_SLOTS.map((time, timeIndex) => (
                <div key={time} className="grid grid-cols-[100px_repeat(6,1fr)] border-b border-gray-100 hover:bg-gray-50/30">
                  <div className="p-3 text-sm text-gray-500 text-center border-r border-gray-100 flex items-center justify-center">
                    <span className="font-medium">{time}</span>
                  </div>

                  {DAYS.map(day => {
                    const cell = gridData[day]?.[time];
                    if (!cell) {
                      return (
                        <div 
                          key={`${day}-${time}`}
                          className="p-1 border-r border-gray-100 min-h-[60px] cursor-pointer hover:bg-blue-50/50 transition-colors"
                          onClick={() => handleAdd(day, time)}
                        >
                          <div className="h-full w-full flex items-center justify-center text-gray-300 hover:text-blue-500 transition-colors">
                            <Plus className="w-4 h-4 opacity-0 hover:opacity-100" />
                          </div>
                        </div>
                      );
                    }

                    if (!cell.isStart) {
                      return (
                        <div 
                          key={`${day}-${time}`}
                          className={`p-1 border-r border-gray-100 ${cell.type === 'break' ? 'bg-amber-50/30' : ''}`}
                        >
                          <div className="h-full w-full bg-gray-50/50 rounded border border-dashed border-gray-200 opacity-30"></div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={`${day}-${time}`}
                        className={`p-1 border-r border-gray-100 cursor-pointer group`}
                        style={{ gridRow: `span ${cell.span || 1}` }}
                        onClick={() => openDetail(cell)}
                      >
                        <div className={`h-full p-2 rounded-lg border-2 ${getTypeColor(cell.type)} hover:shadow-md transition-all`}>
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-semibold text-gray-900 truncate">
                                {cell.subject_name || `Subject ${cell.subject_id}`}
                              </span>
                              <Badge className="text-[10px] bg-white/50 border-0 px-1.5 py-0.5">
                                {cell.type?.charAt(0).toUpperCase() || "T"}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-600 truncate mt-0.5">
                              {cell.teacher_name || `Teacher ${cell.teacher_id}`}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {cell.room_name || `Room ${cell.room_id}`}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              Section: {cell.section_name || cell.section_id}
                            </span>
                            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.stopPropagation(); openEdit(cell); }}
                                className="p-1 rounded hover:bg-blue-100 text-blue-600"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingEntry(cell); }}
                                className="p-1 rounded hover:bg-rose-100 text-rose-600"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); openDetail(cell); }}
                                className="p-1 rounded hover:bg-emerald-100 text-emerald-600"
                                title="View"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingEntry ? "Edit Timetable Entry" : "Add Timetable Entry"}
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {editingEntry ? "Update schedule entry" : "Schedule a new class"}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm border border-rose-200">
                  {modalError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Day <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  >
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="sports">Sports</option>
                    <option value="break">Break</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="">Select Subject...</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name || sub.subject_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Teacher <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="">Select Teacher...</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name || teacher.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Room <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="">Select Room...</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                >
                  <option value="">Select Section...</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>{section.name || section.section_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingEntry ? "Update" : "Save"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingEntry && (
        <ConfirmDialog
          title="Delete Timetable Entry?"
          message={`This will permanently remove the timetable entry for ${deletingEntry.subject_name || `Subject ${deletingEntry.subject_id}`} on ${deletingEntry.day}. This action cannot be undone.`}
          confirmLabel="Delete Entry"
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
        />
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Timetable Details</h2>
                  <p className="text-sm text-white/80 mt-0.5">{selectedEntry.subject_name || `Subject ${selectedEntry.subject_id}`}</p>
                </div>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Class</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.class_name || `Class ${selectedEntry.class_id}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Section</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.section_name || `Section ${selectedEntry.section_id}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Day</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.day}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Time</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.start_time} - {selectedEntry.end_time}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Subject</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.subject_name || `Subject ${selectedEntry.subject_id}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Teacher</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.teacher_name || `Teacher ${selectedEntry.teacher_id}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Room</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedEntry.room_name || `Room ${selectedEntry.room_id}`}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                  <Badge className={
                    selectedEntry.type === 'theory' ? 'bg-blue-50 text-blue-700 border-blue-200 mt-1' :
                    selectedEntry.type === 'lab' ? 'bg-purple-50 text-purple-700 border-purple-200 mt-1' :
                    selectedEntry.type === 'sports' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 mt-1' :
                    'bg-amber-50 text-amber-700 border-amber-200 mt-1'
                  }>
                    {selectedEntry.type ? selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1) : "—"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEdit(selectedEntry);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </FadeIn>
  );
};

export default TimetableManagement;