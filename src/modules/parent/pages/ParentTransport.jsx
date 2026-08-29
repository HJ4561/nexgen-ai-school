/**
 * ============================================
 * PARENT TRANSPORT COMPONENT
 * ============================================
 * 
 * Purpose: View bus routes and transport attendance
 * Used by: Parent module routes
 * 
 * Features:
 * - Page header with title and breadcrumbs
 * - Child selector for filtering by child
 * - Transport statistics
 * - Bus route information
 * - Transport attendance records
 * - Filter by date
 * - View bus details
 * - Responsive design
 * 
 * API Endpoints:
 * - GET /api/transport/buses/ - Get buses
 * - GET /api/transport/routes/ - Get routes
 * - GET /api/transport/bus-stops/ - Get bus stops
 * - GET /api/transport/bus-students/ - Get student bus assignments
 * - GET /api/transport/transport-attendance/ - Get transport attendance
 * 
 * Usage:
 * <Route path="/parent/transport" element={<ParentTransport />} />
 * ============================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bus,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  X,
  Filter,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  User,
  Route as RouteIcon,
  StopCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/admin/Pagination";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations/index.jsx";

import {
  fetchParentLinks,
  fetchBuses,
  fetchTransportAttendance,
} from "@/modules/parent/store/parentThunks";

import {
  selectParentLinks,
  selectSelectedChild,
  selectParentLoading,
  selectParentError,
} from "@/modules/parent/store/parentSlice";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const getStatusBadge = (status) => {
  const config = {
    active: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
    maintenance: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    inactive: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: XCircle },
  };
  const info = config[status] || config.active;
  const Icon = info.icon;
  return (
    <Badge className={`${info.color} text-xs flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Active"}
    </Badge>
  );
};

const getAttendanceBadge = (status) => {
  if (status) {
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Boarded
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs flex items-center gap-1">
      <XCircle className="w-3 h-3" />
      Not Boarded
    </Badge>
  );
};

// ─── Child Selector ──────────────────────────────────────────────────────

const ChildSelector = ({ onSelect, selectedChild, children }) => {
  if (!children || children.length === 0) return null;

  return (
    <div className="relative">
      <select
        value={selectedChild || ""}
        onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs sm:text-sm pr-8 sm:pr-10 min-h-[36px] sm:min-h-[42px]"
      >
        <option value="">All Children</option>
        {children.map((child) => (
          <option key={child.id} value={child.student || child.id}>
            {child.student_name || child.name || `Child ${child.id}`}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

// ─── Bus Detail Drawer ──────────────────────────────────────────────────

const BusDetailDrawer = ({ isOpen, onClose, bus }) => {
  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-[95%] sm:max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Bus Details
          </h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bus Number</label>
            <p className="text-lg font-bold text-gray-800">{bus.bus_no || "—"}</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</label>
            {getStatusBadge(bus.status)}
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Capacity</label>
            <p className="text-sm text-gray-800">{bus.capacity || 0} students</p>
          </div>

          {bus.route && (
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Route</label>
              <p className="text-sm text-gray-800">{bus.route_name || bus.route}</p>
            </div>
          )}

          {bus.driver && (
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Driver</label>
              <p className="text-sm text-gray-800">{bus.driver_name || bus.driver}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Registered</label>
            <p className="text-sm text-gray-600">{formatDate(bus.created_at)}</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
          <Button variant="outline" size="sm" onClick={onClose} className="w-full min-h-[36px] sm:min-h-[40px]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────

const ParentTransport = () => {
  const dispatch = useDispatch();

  // ─── Redux State ──────────────────────────────────────────────────────
  // Use direct state access since selectBuses doesn't exist
  const children = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);
  const buses = useSelector((state) => state.parent.buses || []);
  const attendance = useSelector((state) => state.parent.transportAttendance || []);
  const loading = useSelector(selectParentLoading);
  const error = useSelector(selectParentError);

  // ─── Local State ──────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ─── Refs for Animations ─────────────────────────────────────────────
  const containerRef = useRef(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchParentLinks());
    dispatch(fetchBuses());
    dispatch(fetchTransportAttendance());
  }, [dispatch]);

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredAttendance = useMemo(() => {
    let filtered = attendance;

    if (selectedChild) {
      filtered = filtered.filter(a => a.student === selectedChild || a.student_id === selectedChild);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.student_name?.toLowerCase().includes(search) ||
        a.bus_no?.toLowerCase().includes(search)
      );
    }

    if (filterDate) {
      filtered = filtered.filter(a => a.date === filterDate);
    }

    if (filterStatus === "boarded") {
      filtered = filtered.filter(a => a.boarded);
    } else if (filterStatus === "not_boarded") {
      filtered = filtered.filter(a => !a.boarded);
    }

    return filtered;
  }, [attendance, selectedChild, searchTerm, filterDate, filterStatus]);

  // ─── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredAttendance.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Stats ────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalBuses: buses.length,
    activeBuses: buses.filter(b => b.status === "active").length,
    totalAttendance: attendance.length,
    boardedToday: attendance.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return a.date === today && a.boarded;
    }).length,
  }), [buses, attendance]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleChildSelect = (childId) => {
    // This would dispatch setSelectedChild
    setCurrentPage(1);
  };

  const handleViewBus = (bus) => {
    setSelectedBus(bus);
    setIsDrawerOpen(true);
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterStatus !== "all" || filterDate;

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading && buses.length === 0 && attendance.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <PageHeader title="Transport" subtitle="View bus routes and transport attendance" breadcrumbs={["Parent", "Transport"]} />
        <div className="flex flex-col items-center justify-center h-64 sm:h-96">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium">Loading transport data...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 max-w-[calc(100vw-24px)] sm:max-w-sm w-full bg-white rounded-xl shadow-lg border p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-in slide-in-from-top-4 duration-300 ${
          toast.type === "success" ? "border-emerald-200" : toast.type === "error" ? "border-red-200" : "border-blue-200"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
          )}
          <p className="text-xs sm:text-sm text-gray-800 flex-1">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <FadeIn y={10} duration={0.5}>
        <PageHeader
          title="Transport"
          subtitle="View bus routes and transport attendance"
          breadcrumbs={["Parent", "Transport"]}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <div className="w-full sm:w-48 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base min-h-[36px] sm:min-h-[42px]"
                />
              </div>
            </div>
          }
        />
      </FadeIn>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Error loading transport data</p>
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Buses</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{stats.totalBuses}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">All buses</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Active Buses</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{stats.activeBuses}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">In operation</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Total Records</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.totalAttendance}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Attendance records</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Boarded Today</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">{stats.boardedToday}</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Today's attendance</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Filters */}
      <Card className="p-3 sm:p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelect={handleChildSelect}
          />
          <div className="flex flex-wrap gap-2 sm:gap-3 flex-1">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs sm:text-sm min-h-[36px] sm:min-h-[42px] flex-1 sm:flex-none"
            >
              <option value="all">All Status</option>
              <option value="boarded">Boarded</option>
              <option value="not_boarded">Not Boarded</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[36px] sm:min-h-[42px]"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Buses List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Bus className="w-4 h-4 text-blue-600" />
            Buses ({buses.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {buses.length === 0 ? (
            <div className="text-center py-8">
              <Bus className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No buses found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Bus Number</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Capacity</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {buses.slice(0, 5).map((bus) => (
                  <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <span className="text-sm font-medium text-gray-800">{bus.bus_no || "—"}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{bus.capacity || 0}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      {getStatusBadge(bus.status)}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleViewBus(bus)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Attendance List */}
      <Card className="overflow-hidden border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Transport Attendance ({filteredAttendance.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No attendance records found</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                {pageItems.map((record) => (
                  <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{record.student_name || "Student"}</p>
                        <p className="text-xs text-gray-500">{record.bus_no || "No bus"}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(record.date)}</p>
                      </div>
                      {getAttendanceBadge(record.boarded)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bus</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm font-medium text-gray-800">{record.student_name || "Student"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{record.bus_no || "—"}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5">
                          {getAttendanceBadge(record.boarded)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {filteredAttendance.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredAttendance.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Bus Detail Drawer */}
      <BusDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        bus={selectedBus}
      />
    </div>
  );
};

export default ParentTransport;