// src/modules/admin/pages/Timetable/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Calendar, Clock, BookOpen, User, X,
  Filter, RefreshCw, CheckCircle, AlertCircle, Users, Building2,
  Loader2, ChevronDown, Grid3x3, List, Eye
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import TimetableCards from "@/components/admin/TimetableCards";
import TimetableGrid from "@/components/admin/TimetableGrid";
import TimetableDrawer from "@/components/admin/TimetableDrawer";
import { DAYS, TIME_SLOTS } from "@/utils/helpers";
import api from "@/services/api";

const TIMETABLE_API = "/academics/timetable/";
const CLASSES_API = "/academics/classes/";
const SUBJECTS_API = "/academics/subjects/";
const TEACHERS_API = "/users/teachers/";
const ROOMS_API = "/academics/rooms/";

const Timetable = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [filterClass, setFilterClass] = useState("");
  const [filterDay, setFilterDay] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // ─── Drawer/Modal States ─────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [conflictResult, setConflictResult] = useState(null);
  const [drawerError, setDrawerError] = useState("");
  
  // ─── Form Data ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    class_section: "",
    day: "",
    start_time: "",
    end_time: "",
    subject: "",
    teacher: "",
    room: "",
  });
  
  // ─── Options Data ─────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  // ─── Toast Helper ─────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch All Data ────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setErrored(false);
    setErrorMessage("");
    try {
      // Fetch timetable data
      const timetableRes = await api.get(TIMETABLE_API);
      const timetableData = timetableRes.data?.results || timetableRes.data || [];
      console.log("📋 Timetable data from API:", timetableData);
      setTimetable(timetableData);
      
      // Fetch classes
      const classesRes = await api.get(CLASSES_API);
      const classData = classesRes.data?.results || classesRes.data || [];
      console.log("📋 Classes data:", classData);
      setClasses(classData);
      setClassOptions(classData.map(c => ({ value: c.id, label: c.name || c.class_name })));
      
      // Fetch subjects
      const subjectsRes = await api.get(SUBJECTS_API);
      const subjectData = subjectsRes.data?.results || subjectsRes.data || [];
      console.log("📋 Subjects data:", subjectData);
      setSubjects(subjectData);
      
      // Fetch teachers
      const teachersRes = await api.get(TEACHERS_API);
      const teacherData = teachersRes.data?.results || teachersRes.data || [];
      console.log("📋 Teachers data:", teacherData);
      setTeachers(teacherData);
      setTeacherOptions(teacherData.map(t => ({ 
        value: t.id, 
        label: t.name || t.full_name || t.user?.name || "Teacher"  
      })));
      
      // Fetch rooms
      try {
        const roomsRes = await api.get(ROOMS_API);
        const roomData = roomsRes.data?.results || roomsRes.data || [];
        console.log("📋 Rooms data:", roomData);
        setRooms(roomData);
        setRoomOptions(roomData.map(r => ({ value: r.id, label: r.name || r.room_name })));
      } catch (error) {
        console.warn("Rooms API not available, using empty list");
        setRooms([]);
        setRoomOptions([]);
      }
      
    } catch (error) {
      console.error("Failed to fetch timetable data:", error);
      setErrored(true);
      setErrorMessage(error.response?.data?.detail || error.message || "Failed to load timetable");
      showToast("Failed to load timetable", "error");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Helper Functions ────────────────────────────────────────────────────
  const getClassName = (item) => {
    if (!item) return "—";
    
    // If class_name is directly available
    if (item.class_name) return item.class_name;
    
    // If class_section is an object with name
    if (item.class_section && typeof item.class_section === 'object') {
      return item.class_section.name || item.class_section.class_name || "—";
    }
    
    // If class_section is an ID, look it up
    if (item.class_section && typeof item.class_section === 'number') {
      const cls = classes.find(c => c.id === item.class_section);
      return cls?.name || cls?.class_name || `Class ${item.class_section}`;
    }
    
    // If class_section is a string
    if (typeof item.class_section === 'string') {
      const cls = classes.find(c => c.name === item.class_section || c.class_name === item.class_section);
      return cls?.name || cls?.class_name || item.class_section;
    }
    
    return "—";
  };

  const getSubjectName = (item) => {
    if (!item) return "—";
    
    if (item.subject_name) return item.subject_name;
    
    if (item.subject && typeof item.subject === 'object') {
      return item.subject.name || item.subject.subject_name || "—";
    }
    
    if (item.subject && typeof item.subject === 'number') {
      const subj = subjects.find(s => s.id === item.subject);
      return subj?.name || subj?.subject_name || `Subject ${item.subject}`;
    }
    
    if (typeof item.subject === 'string') {
      const subj = subjects.find(s => s.name === item.subject || s.subject_name === item.subject);
      return subj?.name || subj?.subject_name || item.subject;
    }
    
    return "—";
  };

  const getTeacherName = (item) => {
    if (!item) return "—";
    
    if (item.teacher_name) return item.teacher_name;
    
    if (item.teacher && typeof item.teacher === 'object') {
      return item.teacher.name || item.teacher.full_name || "—";
    }
    
    if (item.teacher && typeof item.teacher === 'number') {
      const teacher = teachers.find(t => t.id === item.teacher);
      return teacher?.name || teacher?.full_name || `Teacher ${item.teacher}`;
    }
    
    if (typeof item.teacher === 'string') {
      const teacher = teachers.find(t => t.name === item.teacher || t.full_name === item.teacher);
      return teacher?.name || teacher?.full_name || item.teacher;
    }
    
    return "—";
  };

  const getRoomName = (item) => {
    if (!item) return "—";
    
    if (item.room_name) return item.room_name;
    
    if (item.room && typeof item.room === 'object') {
      return item.room.name || item.room.room_name || "—";
    }
    
    if (item.room && typeof item.room === 'number') {
      const room = rooms.find(r => r.id === item.room);
      return room?.name || room?.room_name || `Room ${item.room}`;
    }
    
    if (typeof item.room === 'string') {
      const room = rooms.find(r => r.name === item.room || r.room_name === item.room);
      return room?.name || room?.room_name || item.room;
    }
    
    return "—";
  };

  const getDayLabel = (day) => {
    if (!day) return "—";
    const dayMap = {
      'mon': 'Monday', 'monday': 'Monday',
      'tue': 'Tuesday', 'tuesday': 'Tuesday',
      'wed': 'Wednesday', 'wednesday': 'Wednesday',
      'thu': 'Thursday', 'thursday': 'Thursday',
      'fri': 'Friday', 'friday': 'Friday',
      'sat': 'Saturday', 'saturday': 'Saturday',
      'sun': 'Sunday', 'sunday': 'Sunday',
      '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
      '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday'
    };
    const normalizedDay = String(day).toLowerCase();
    return dayMap[normalizedDay] || day;
  };

  // ─── Build Grid Data ────────────────────────────────────────────────────
  const buildGridData = useCallback(() => {
    const grid = {};
    TIME_SLOTS.forEach(time => {
      grid[time] = {};
      DAYS.forEach(day => {
        const entry = timetable.find(e => {
          const dayLabel = getDayLabel(e.day);
          return dayLabel === day && e.start_time?.slice(0, 5) === time;
        });
        if (entry) {
          grid[time][day] = {
            ...entry,
            id: entry.id,
            subject_name: getSubjectName(entry),
            teacher_name: getTeacherName(entry),
            room_name: getRoomName(entry),
            class_name: getClassName(entry),
            colorTone: 'admin'
          };
        }
      });
    });
    return grid;
  }, [timetable, classes, subjects, teachers, rooms]);

  // ─── Open Add/Edit Functions ──────────────────────────────────────────
  const openAddDrawer = (day, time) => {
    setDrawerMode("add");
    setEditingEntry(null);
    const timeSlots = TIME_SLOTS;
    const timeIndex = timeSlots.indexOf(time);
    const nextTime = timeSlots[timeIndex + 1] || "15:30";
    setFormData({
      class_section: filterClass || "",
      day: day,
      start_time: time,
      end_time: nextTime,
      subject: "",
      teacher: "",
      room: "",
    });
    setConflictResult(null);
    setDrawerError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (entry) => {
    setDrawerMode("edit");
    setEditingEntry(entry);
    setFormData({
      class_section: entry.class_section || "",
      day: entry.day || "",
      start_time: entry.start_time || "",
      end_time: entry.end_time || "",
      subject: entry.subject || "",
      teacher: entry.teacher || "",
      room: entry.room || "",
    });
    setConflictResult(null);
    setDrawerError("");
    setDrawerOpen(true);
  };

  const openAdd = () => {
    setDrawerMode("add");
    setEditingEntry(null);
    setFormData({
      class_section: filterClass || "",
      day: DAYS[0] || "",
      start_time: TIME_SLOTS[0] || "",
      end_time: TIME_SLOTS[1] || "",
      subject: "",
      teacher: "",
      room: "",
    });
    setConflictResult(null);
    setDrawerError("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingEntry(null);
    setDrawerError("");
  };

  // ─── Save Entry ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setDrawerError("");
    
    if (!formData.class_section || !formData.subject || !formData.teacher || !formData.room) {
      setDrawerError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        class_section: Number(formData.class_section),
        day: formData.day,
        start_time: formData.start_time,
        end_time: formData.end_time,
        subject: Number(formData.subject),
        teacher: Number(formData.teacher),
        room: Number(formData.room),
      };

      if (drawerMode === "edit" && editingEntry) {
        const response = await api.patch(`${TIMETABLE_API}${editingEntry.id}/`, payload);
        const updatedData = response.data;
        setTimetable(timetable.map(t => t.id === editingEntry.id ? { ...t, ...updatedData } : t));
        showToast("Timetable entry updated successfully", "success");
      } else {
        const response = await api.post(TIMETABLE_API, payload);
        const newData = response.data;
        setTimetable([newData, ...timetable]);
        showToast("Timetable entry created successfully", "success");
      }
      setDrawerOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error("Failed to save timetable entry:", error);
      setDrawerError(error.response?.data?.detail || error.message || "Failed to save timetable entry");
      showToast("Failed to save timetable entry", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete Entry ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`${TIMETABLE_API}${deletingEntry.id}/`);
      setTimetable(timetable.filter(t => t.id !== deletingEntry.id));
      showToast("Timetable entry deleted successfully", "success");
      setDeletingEntry(null);
    } catch (error) {
      console.error("Failed to delete timetable entry:", error);
      showToast("Failed to delete timetable entry", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Filter Logic ──────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let filtered = timetable;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        getClassName(entry).toLowerCase().includes(search) ||
        getSubjectName(entry).toLowerCase().includes(search) ||
        getTeacherName(entry).toLowerCase().includes(search) ||
        getRoomName(entry).toLowerCase().includes(search)
      );
    }
    
    if (filterClass) {
      filtered = filtered.filter(entry => {
        const className = getClassName(entry);
        const cls = classes.find(c => c.id === Number(filterClass));
        return cls && className === (cls.name || cls.class_name);
      });
    }
    
    if (filterDay) {
      filtered = filtered.filter(entry => getDayLabel(entry.day) === filterDay);
    }
    
    if (filterTeacher) {
      filtered = filtered.filter(entry => {
        const teacherName = getTeacherName(entry);
        const teacher = teachers.find(t => t.id === Number(filterTeacher));
        return teacher && teacherName === (teacher.name || teacher.full_name || teacher.user?.name);
      });
    }
    
    return filtered;
  }, [timetable, searchTerm, filterClass, filterDay, filterTeacher, classes, teachers]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredData.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = filterClass || filterDay || filterTeacher || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterClass("");
    setFilterDay("");
    setFilterTeacher("");
  };

  // ─── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = timetable.length;
    const uniqueClasses = new Set(timetable.map(t => getClassName(t))).size;
    const uniqueSubjects = new Set(timetable.map(t => getSubjectName(t))).size;
    const uniqueTeachers = new Set(timetable.map(t => getTeacherName(t))).size;
    return { total, uniqueClasses, uniqueSubjects, uniqueTeachers };
  }, [timetable]);

  const gridData = buildGridData();

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading timetable...</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage class schedules and timetables
              {timetable.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {timetable.length} entries</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-sm transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded-lg text-sm transition-all ${viewMode === "cards" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                title="Cards View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" className="border-gray-200" onClick={fetchAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading timetable</p>
              <p className="text-amber-600">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entries</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All schedule entries</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.uniqueClasses}</p>
            <p className="text-xs text-gray-400 mt-1">Unique classes</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
            <p className="text-2xl font-bold text-purple-600">{stats.uniqueSubjects}</p>
            <p className="text-xs text-gray-400 mt-1">Unique subjects</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</p>
            <p className="text-2xl font-bold text-amber-600">{stats.uniqueTeachers}</p>
            <p className="text-xs text-gray-400 mt-1">Unique teachers</p>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by class, subject, teacher, or room..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterClass}
                  onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name || cls.class_name}</option>)}
                </select>
                <select
                  value={filterDay}
                  onChange={(e) => { setFilterDay(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">All Days</option>
                  {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select
                  value={filterTeacher}
                  onChange={(e) => { setFilterTeacher(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.full_name || teacher.user?.name || "Teacher"}
                    </option>
                  ))}
                </select>
                <Button variant="outline" className="border-gray-200 px-4" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" className="border-gray-200 px-3 text-gray-500" onClick={clearFilters}>
                    <X className="w-3.5 h-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Content - Grid View */}
          {viewMode === "grid" ? (
            <div className="p-4">
              <TimetableGrid
                gridData={gridData}
                onAddSlot={openAddDrawer}
                onEditSlot={openEditDrawer}
              />
            </div>
          ) : viewMode === "cards" ? (
            <div className="p-4">
              <TimetableCards
                entries={filteredData.length > 0 ? filteredData : timetable}
                onEdit={openEditDrawer}
                onAdd={openAddDrawer}
                selectedClass={filterClass || "all"}
                DAYS={DAYS}
              />
            </div>
          ) : (
            // List View
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Teacher</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">No timetable entries found</p>
                          <p className="text-sm text-gray-400">Add a timetable entry to get started</p>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2" onClick={openAdd}>
                            <Plus className="w-4 h-4 mr-2" /> Add Entry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((entry) => (
                      <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => openEditDrawer(entry)}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {getClassName(entry).charAt(0).toUpperCase() || "C"}
                            </div>
                            <span className="font-medium text-gray-800">{getClassName(entry)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2.5 py-1">
                            {getDayLabel(entry.day)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{entry.start_time} - {entry.end_time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs px-2.5 py-1">
                            {getSubjectName(entry)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{getTeacherName(entry)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{getRoomName(entry)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditDrawer(entry)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit entry">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeletingEntry(entry)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete entry">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {timetable.length > 0 && viewMode === "list" && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={filteredData.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* Timetable Drawer for Add/Edit */}
      <TimetableDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        drawerMode={drawerMode}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        isFormValid={formData.class_section && formData.subject && formData.teacher && formData.room}
        conflictResult={conflictResult}
        drawerError={drawerError}
        classOptions={classOptions}
        subjectOptions={subjects.map(s => ({ value: s.id, label: s.name || s.subject_name }))}
        teacherOptions={teacherOptions}
        roomOptions={roomOptions}
        updating={saving}
        subjects={subjects}
      />

      {/* Delete Confirmation */}
      {deletingEntry && (
        <ConfirmDialog
          open={true}
          title="Delete this timetable entry?"
          message={`This removes the ${getSubjectName(deletingEntry)} class for ${getClassName(deletingEntry)} on ${getDayLabel(deletingEntry.day)}.`}
          confirmLabel="Delete Entry"
          onConfirm={handleDelete}
          onCancel={() => setDeletingEntry(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-rose-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Timetable;