import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit, Trash2, Calendar, Clock, CheckCircle, XCircle,
  Users, X, Filter, Download, Eye, User, FileText, RefreshCw,
  AlertCircle, ChevronLeft, ChevronRight, Printer, BarChart3,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import adminService from "@/modules/admin/services/adminService";

// Status badge configurations
const STATUS_BADGE = {
  present: "bg-emerald-50 text-emerald-700 border-emerald-200",
  absent: "bg-rose-50 text-rose-700 border-rose-200",
  late: "bg-amber-50 text-amber-700 border-amber-200",
  excused: "bg-blue-50 text-blue-700 border-blue-200",
  holiday: "bg-purple-50 text-purple-700 border-purple-200",
};

const STATUS_ICON = {
  present: <CheckCircle className="w-3 h-3 mr-1" />,
  absent: <XCircle className="w-3 h-3 mr-1" />,
  late: <Clock className="w-3 h-3 mr-1" />,
  excused: <FileText className="w-3 h-3 mr-1" />,
  holiday: <Calendar className="w-3 h-3 mr-1" />,
};

const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
  holiday: "Holiday",
};

const Attendance = () => {
  // ─── State ──────────────────────────────────────────────────────────
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    attendanceRate: 0,
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    date: new Date().toISOString().split('T')[0],
    status: "present",
    time_in: "",
    time_out: "",
    remarks: "",
  });

  // Options for dropdowns
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // ─── Fetch Data ─────────────────────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        date: filterDate || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        class_id: filterClass !== "all" ? filterClass : undefined,
        student_id: filterStudent !== "all" ? filterStudent : undefined,
      };

      const response = await adminService.getAttendance(params);
      const data = response.results || response.data || response || [];
      
      setAttendance(data);
      
      // Update stats if available
      if (response.stats || response.statistics) {
        setStats(response.stats || response.statistics);
      } else {
        calculateStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setError("Failed to load attendance records. Please try again.");
      setAttendance(getMockAttendance());
      calculateStats(getMockAttendance());
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterDate, filterStatus, filterClass, filterStudent]);

  // Fetch students and classes for dropdowns
  const fetchOptions = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        adminService.getStudents({ limit: 100 }),
        adminService.getClasses({ limit: 100 }),
      ]);
      setStudents(studentsRes.results || studentsRes.data || studentsRes || []);
      setClasses(classesRes.results || classesRes.data || classesRes || []);
    } catch (err) {
      console.error("Failed to fetch options:", err);
      setStudents(getMockStudents());
      setClasses(getMockClasses());
    }
  };

  // Calculate stats from data
  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter(r => r.status === "present").length;
    const absent = data.filter(r => r.status === "absent").length;
    const late = data.filter(r => r.status === "late").length;
    const excused = data.filter(r => r.status === "excused").length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({ total, present, absent, late, excused, attendanceRate });
  };

  // ─── Mock Data ──────────────────────────────────────────────────────
  const getMockAttendance = () => [
    {
      id: 1,
      student: "Ali Khan",
      student_id: 1,
      class: "Class 1A",
      class_id: 1,
      date: "2024-02-14",
      status: "present",
      time_in: "08:30 AM",
      time_out: "02:30 PM",
      teacher: "Ms. Sara",
      remarks: "On time",
    },
    {
      id: 2,
      student: "Sara Ahmed",
      student_id: 2,
      class: "Class 1A",
      class_id: 1,
      date: "2024-02-14",
      status: "absent",
      time_in: "-",
      time_out: "-",
      teacher: "Ms. Sara",
      remarks: "Sick leave",
    },
    {
      id: 3,
      student: "Usman Ali",
      student_id: 3,
      class: "Class 1B",
      class_id: 2,
      date: "2024-02-14",
      status: "late",
      time_in: "09:15 AM",
      time_out: "02:30 PM",
      teacher: "Mr. Ahmed",
      remarks: "Traffic delay",
    },
    {
      id: 4,
      student: "Fatima Noor",
      student_id: 4,
      class: "Class 2A",
      class_id: 3,
      date: "2024-02-14",
      status: "present",
      time_in: "08:25 AM",
      time_out: "02:30 PM",
      teacher: "Dr. Fatima",
      remarks: "",
    },
    {
      id: 5,
      student: "Ahmed Raza",
      student_id: 5,
      class: "Class 2A",
      class_id: 3,
      date: "2024-02-14",
      status: "excused",
      time_in: "-",
      time_out: "-",
      teacher: "Dr. Fatima",
      remarks: "Family event",
    },
  ];

  const getMockStudents = () => [
    { id: 1, name: "Ali Khan", email: "ali@email.com" },
    { id: 2, name: "Sara Ahmed", email: "sara@email.com" },
    { id: 3, name: "Usman Ali", email: "usman@email.com" },
  ];

  const getMockClasses = () => [
    { id: 1, name: "Class 1A" },
    { id: 2, name: "Class 1B" },
    { id: 3, name: "Class 2A" },
  ];

  // ─── CRUD Operations ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRecord) {
        await adminService.updateAttendance(editingRecord.id, formData);
      } else {
        await adminService.createAttendance(formData);
      }
      setModalOpen(false);
      setEditingRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error("Failed to save attendance:", err);
      setError("Failed to save attendance record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteAttendance(deletingRecord.id);
      setDeletingRecord(null);
      fetchAttendance();
    } catch (err) {
      console.error("Failed to delete attendance:", err);
      setError("Failed to delete attendance record");
    }
  };

  const openEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id || "",
      class_id: record.class_id || "",
      date: record.date || "",
      status: record.status || "present",
      time_in: record.time_in || "",
      time_out: record.time_out || "",
      remarks: record.remarks || "",
    });
    setModalOpen(true);
  };

  const openDetail = (record) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  // ─── Filter Logic ──────────────────────────────────────────────────────
  const getFilteredData = () => {
    let filtered = attendance;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const studentName = r.student ? String(r.student) : "";
        const className = r.class ? String(r.class) : "";
        const teacherName = r.teacher ? String(r.teacher) : "";
        return studentName.toLowerCase().includes(search) ||
               className.toLowerCase().includes(search) ||
               teacherName.toLowerCase().includes(search);
      });
    }

    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // ─── Helper to safely get student name ────────────────────────────────
  const getStudentName = (student) => {
    if (!student) return "—";
    return String(student);
  };

  const getStudentInitial = (student) => {
    if (!student) return "S";
    const name = String(student);
    return name.charAt(0) || "S";
  };

  // ─── Initial Load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchAttendance();
    fetchOptions();
  }, []);

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && attendance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading attendance records...</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error && attendance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </div>
        <p className="text-gray-600 font-medium">Error loading attendance</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
        <button
          onClick={fetchAttendance}
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
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Attendance Management"
          subtitle={`Track student attendance${attendance.length ? ` — ${stats.total} records` : ""}`}
          breadcrumbs={["Admin", "Attendance"]}
          action={
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingRecord(null);
                  setFormData({
                    student_id: "",
                    class_id: "",
                    date: new Date().toISOString().split('T')[0],
                    status: "present",
                    time_in: "",
                    time_out: "",
                    remarks: "",
                  });
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                <Plus className="w-4 h-4" />
                Mark Attendance
              </button>
              <button
                onClick={fetchAttendance}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Present</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.present}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Absent</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">{stats.absent}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Late</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.late}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Excused</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.excused}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow duration-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Attendance Rate</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.attendanceRate}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student, class, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50"
                >
                  <option value="all">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterStatus("all");
                    setFilterClass("all");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          {searchTerm ? "No attendance records match your search." : "No attendance records found."}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search terms" : "Mark attendance to get started"}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={() => {
                              setEditingRecord(null);
                              setFormData({
                                student_id: "",
                                class_id: "",
                                date: new Date().toISOString().split('T')[0],
                                status: "present",
                                time_in: "",
                                time_out: "",
                                remarks: "",
                              });
                              setModalOpen(true);
                            }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Mark Attendance
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-blue-50/30 transition-colors duration-150 group cursor-pointer"
                      onClick={() => openDetail(record)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                            {getStudentInitial(record.student)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{getStudentName(record.student)}</p>
                            <p className="text-xs text-gray-500">{record.student_id ? `ID: ${record.student_id}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                          {record.class ? String(record.class) : "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {record.date || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">In: {record.time_in || "-"}</span>
                          <span className="text-xs text-gray-400">Out: {record.time_out || "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">{record.teacher ? String(record.teacher) : "—"}</td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${STATUS_BADGE[record.status] || "bg-gray-50 text-gray-700 border-gray-200"} border font-medium px-3 py-1`}>
                          {STATUS_ICON[record.status]}
                          {STATUS_LABELS[record.status] || record.status || "Unknown"}
                        </Badge>
                        {record.remarks && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[120px]">{record.remarks}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(record);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingRecord(record);
                            }}
                            className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(record);
                            }}
                            className="p-2 rounded-lg hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredData.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <AttendanceFormModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingRecord(null);
          }}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          editingRecord={editingRecord}
          students={students}
          classes={classes}
        />
      )}

      {/* Delete Confirmation */}
      {deletingRecord && (
        <ConfirmDialog
          title="Delete Attendance Record?"
          message={`This will permanently remove the attendance record for ${getStudentName(deletingRecord.student)} on ${deletingRecord.date}. This action cannot be undone.`}
          confirmLabel="Delete Record"
          onConfirm={handleDelete}
          onCancel={() => setDeletingRecord(null)}
        />
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedRecord && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedRecord(null);
          }}
          onEdit={() => {
            setDetailModalOpen(false);
            openEdit(selectedRecord);
          }}
        />
      )}
    </FadeIn>
  );
};

// ─── Attendance Form Modal ────────────────────────────────────────────
const AttendanceFormModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  loading,
  editingRecord,
  students,
  classes,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 relative">
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingRecord ? "Edit Attendance" : "Mark Attendance"}
                </h2>
                <p className="text-sm text-white/80 mt-0.5">
                  {editingRecord ? "Update attendance record" : "Record student attendance"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Student <span className="text-rose-500">*</span>
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
              >
                <option value="">Select Student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
              >
                <option value="">Select Class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Time In
                </label>
                <input
                  type="time"
                  name="time_in"
                  value={formData.time_in}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Time Out
                </label>
                <input
                  type="time"
                  name="time_out"
                  value={formData.time_out}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="2"
                placeholder="Add any notes..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  editingRecord ? "Update" : "Save"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── Attendance Detail Modal ──────────────────────────────────────────
const AttendanceDetailModal = ({ record, onClose, onEdit }) => {
  const getStudentName = (student) => {
    if (!student) return "—";
    return String(student);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Attendance Details</h2>
                <p className="text-sm text-white/80 mt-0.5">{getStudentName(record.student)} - {record.date}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Student</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{getStudentName(record.student)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Class</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{record.class ? String(record.class) : "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{record.date || "—"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <Badge className={`${STATUS_BADGE[record.status] || "bg-gray-50 text-gray-700 border-gray-200"} border font-medium px-3 py-1 mt-1`}>
                  {STATUS_ICON[record.status]}
                  {STATUS_LABELS[record.status] || record.status || "Unknown"}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Time In</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{record.time_in || "-"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Time Out</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{record.time_out || "-"}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Teacher</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{record.teacher ? String(record.teacher) : "—"}</p>
              </div>
              {record.remarks && (
                <div className="bg-gray-50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Remarks</p>
                  <p className="text-sm text-gray-900 mt-1">{record.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
              >
                Close
              </button>
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Attendance;