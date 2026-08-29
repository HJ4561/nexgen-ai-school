// src/modules/admin/pages/Timetable.jsx
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
import { FadeIn } from "@/components/admin/animations/index.jsx";
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
  // --- State --------------------------------------------------------------
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
  
  // --- Drawer/Modal States ---------------------------------------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [conflictResult, setConflictResult] = useState(null);
  const [drawerError, setDrawerError] = useState("");
  
  // --- Form Data ---------------------------------------------------------
  const [formData, setFormData] = useState({
    class_section: "",
    day: "",
    start_time: "",
    end_time: "",
    subject: "",
    teacher: "",
    room: "",
  });
  
  // --- Options Data -----------------------------------------------------
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  // --- Toast Helper -----------------------------------------------------
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch All Data ----------------------------------------------------
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
      setTimetable(timetableData);
      
      // Fetch classes
      const classesRes = await api.get(CLASSES_API);
      const classData = classesRes.data?.results || classesRes.data || [];
      setClasses(classData);
      setClassOptions(classData.map(c => ({ value: c.id, label: c.name || c.class_name })));
      
      // Fetch subjects
      const subjectsRes = await api.get(SUBJECTS_API);
      const subjectData = subjectsRes.data?.results || subjectsRes.data || [];
      setSubjects(subjectData);
      
      // Fetch teachers
      const teachersRes = await api.get(TEACHERS_API);
      const teacherData = teachersRes.data?.results || teachersRes.data || [];
      setTeachers(teacherData);
      setTeacherOptions(teacherData.map(t => ({ 
        value: t.id, 
        label: t.name || t.full_name || t.user?.name || "Teacher"  
      })));
      
      // Fetch rooms
      try {
        const roomsRes = await api.get(ROOMS_API);
        const roomData = roomsRes.data?.results || roomsRes.data || [];
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

  // --- Helper Functions ----------------------------------------------------
  const getClassName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    
    if (item.class_name) return item.class_name;
    
    if (item.class_section && typeof item.class_section === 'object') {
      return item.class_section.name || item.class_section.class_name || "Ã¢â‚¬â€";
    }
    
    if (item.class_section && typeof item.class_section === 'number') {
      const cls = classes.find(c => c.id === item.class_section);
      return cls?.name || cls?.class_name || `Class ${item.class_section}`;
    }
    
    if (typeof item.class_section === 'string') {
      const cls = classes.find(c => c.name === item.class_section || c.class_name === item.class_section);
      return cls?.name || cls?.class_name || item.class_section;
    }
    
    return "Ã¢â‚¬â€";
  };

  const getSubjectName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    
    if (item.subject_name) return item.subject_name;
    
    if (item.subject && typeof item.subject === 'object') {
      return item.subject.name || item.subject.subject_name || "Ã¢â‚¬â€";
    }
    
    if (item.subject && typeof item.subject === 'number') {
      const subj = subjects.find(s => s.id === item.subject);
      return subj?.name || subj?.subject_name || `Subject ${item.subject}`;
    }
    
    if (typeof item.subject === 'string') {
      const subj = subjects.find(s => s.name === item.subject || s.subject_name === item.subject);
      return subj?.name || subj?.subject_name || item.subject;
    }
    
    return "Ã¢â‚¬â€";
  };

  const getTeacherName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    
    if (item.teacher_name) return item.teacher_name;
    
    if (item.teacher && typeof item.teacher === 'object') {
      return item.teacher.name || item.teacher.full_name || "Ã¢â‚¬â€";
    }
    
    if (item.teacher && typeof item.teacher === 'number') {
      const teacher = teachers.find(t => t.id === item.teacher);
      return teacher?.name || teacher?.full_name || `Teacher ${item.teacher}`;
    }
    
    if (typeof item.teacher === 'string') {
      const teacher = teachers.find(t => t.name === item.teacher || t.full_name === item.teacher);
      return teacher?.name || teacher?.full_name || item.teacher;
    }
    
    return "Ã¢â‚¬â€";
  };

  const getRoomName = (item) => {
    if (!item) return "Ã¢â‚¬â€";
    
    if (item.room_name) return item.room_name;
    
    if (item.room && typeof item.room === 'object') {
      return item.room.name || item.room.room_name || "Ã¢â‚¬â€";
    }
    
    if (item.room && typeof item.room === 'number') {
      const room = rooms.find(r => r.id === item.room);
      return room?.name || room?.room_name || `Room ${item.room}`;
    }
    
    if (typeof item.room === 'string') {
      const room = rooms.find(r => r.name === item.room || r.room_name === item.room);
      return room?.name || room?.room_name || item.room;
    }
    
    return "Ã¢â‚¬â€";
  };

  const getDayLabel = (day) => {
    if (!day) return "Ã¢â‚¬â€";
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

  // --- Build Grid Data ----------------------------------------------------
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

  // --- Open Add/Edit Functions ------------------------------------------
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

  // --- Save Entry --------------------------------------------------------
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

  // --- Delete Entry ------------------------------------------------------
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

  // --- Filter Logic ------------------------------------------------------
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

  // --- Stats --------------------------------------------------------------
  const stats = useMemo(() => {
    const total = timetable.length;
    const uniqueClasses = new Set(timetable.map(t => getClassName(t))).size;
    const uniqueSubjects = new Set(timetable.map(t => getSubjectName(t))).size;
    const uniqueTeachers = new Set(timetable.map(t => getTeacherName(t))).size;
    return { total, uniqueClasses, uniqueSubjects, uniqueTeachers };
  }, [timetable]);

  const gridData = buildGridData();

  // --- Loading State ----------------------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="mt-4 text-sm sm:text-base text-gray-500 font-medium">Loading timetable...</p>
      </div>
    );
  }

  // --- Render ----------------------------------------------------------
  return (
    <FadeIn>
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
        <PageHeader
          title="Timetable"
          subtitle="Manage class schedules and timetables"
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm transition-all ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 sm:p-2 rounded-lg text-xs sm:text-sm transition-all ${
                    viewMode === "cards" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                  title="Cards View"
                >
                  <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                disabled={loading}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Refresh</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={openAdd}
                className="min-h-[36px] sm:min-h-[40px]"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span className="hidden xs:inline">Add Entry</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </div>
          }
        />

        {errored && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Error loading timetable</p>
                <p className="text-xs sm:text-sm text-amber-600">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entries</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All schedule entries</p>
          </Card>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.uniqueClasses}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Unique classes</p>
          </Card>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.uniqueSubjects}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Unique subjects</p>
          </Card>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.uniqueTeachers}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Unique teachers</p>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden shadow-sm border border-gray-100">
          {/* Filters */}
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by class, subject, teacher, or room..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <select
                  value={filterClass}
                  onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name || cls.class_name}</option>)}
                </select>
                <select
                  value={filterDay}
                  onChange={(e) => { setFilterDay(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
                >
                  <option value="">All Days</option>
                  {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select
                  value={filterTeacher}
                  onChange={(e) => { setFilterTeacher(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
                >
                  <option value="">All Teachers</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name || teacher.full_name || teacher.user?.name || "Teacher"}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-[42px]"
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Filters</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
                  >
                    <X className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content - Grid View */}
          {viewMode === "grid" ? (
            <div className="p-3 sm:p-4">
              <TimetableGrid
                gridData={gridData}
                onAddSlot={openAddDrawer}
                onEditSlot={openEditDrawer}
              />
            </div>
          ) : viewMode === "cards" ? (
            <div className="p-3 sm:p-4">
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
              <table className="w-full min-w-[700px] sm:min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Time</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Teacher</th>
                    <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Room</th>
                    <th className="text-right px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 sm:px-4 py-8 sm:py-12 text-center">
                        <div className="flex flex-col items-center gap-2 sm:gap-3">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <p className="text-sm sm:text-base font-medium text-gray-500">No timetable entries found</p>
                          <p className="text-xs sm:text-sm text-gray-400">Add a timetable entry to get started</p>
                          <Button variant="primary" size="sm" onClick={openAdd} className="mt-2">
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Add Entry
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((entry) => (
                      <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm lg:text-base font-semibold shadow-sm">
                              {getClassName(entry).charAt(0).toUpperCase() || "C"}
                            </div>
                            <span className="text-sm sm:text-base font-medium text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                              {getClassName(entry)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
                            {getDayLabel(entry.day)}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">{entry.start_time} - {entry.end_time}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1">
                            {getSubjectName(entry)}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px]">
                              {getTeacherName(entry)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">{getRoomName(entry)}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-right">
                          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                            <button
                              onClick={() => openEditDrawer(entry)}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Edit entry"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
        <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 ${
          toast.type === "success" ? "bg-emerald-600" : 
          toast.type === "error" ? "bg-rose-600" : "bg-blue-600"
        } text-white text-sm px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-xl flex items-center gap-2 max-w-[90%] sm:max-w-md`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm">{toast.message}</span>
        </div>
      )}
    </FadeIn>
  );
};

export default Timetable;