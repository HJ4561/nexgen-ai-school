import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Plus, Edit, Trash2, Megaphone, Calendar, User, X, 
  RefreshCw, AlertCircle, Eye, Filter, ChevronDown,
  Clock, CheckCircle, MessageSquare, Users, Bell
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints from Documentation ──────────────────────────────────
// Events: /api/events/events/
// Event Participation: /api/events/event-participation/

const EVENTS_API = "/events/events/";
const EVENT_PARTICIPATION_API = "/events/event-participation/";

// ─── Helper Functions ──────────────────────────────────────────────────
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

const getPriorityBadge = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getPriorityIcon = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return <AlertCircle className="w-3.5 h-3.5" />;
    case 'medium':
      return <Clock className="w-3.5 h-3.5" />;
    case 'low':
      return <CheckCircle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getPriorityLabel = (priority) => {
  if (!priority) return "Normal";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const getStatusBadge = (status) => {
  switch(status?.toLowerCase()) {
    case 'active':
    case 'upcoming':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'completed':
    case 'past':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

// ─── Stats Cards Component ─────────────────────────────────────────────
const AnnouncementStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 border-l-4 border-l-blue-500">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</p>
        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        <p className="text-xs text-gray-400 mt-1">All announcements</p>
      </Card>
      <Card className="p-4 border-l-4 border-l-emerald-500">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
        <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        <p className="text-xs text-gray-400 mt-1">Active announcements</p>
      </Card>
      <Card className="p-4 border-l-4 border-l-amber-500">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
        <p className="text-2xl font-bold text-amber-600">{stats.upcoming}</p>
        <p className="text-xs text-gray-400 mt-1">Scheduled</p>
      </Card>
      <Card className="p-4 border-l-4 border-l-purple-500">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">High Priority</p>
        <p className="text-2xl font-bold text-purple-600">{stats.highPriority}</p>
        <p className="text-xs text-gray-400 mt-1">Urgent announcements</p>
      </Card>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [eventParticipation, setEventParticipation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    event_type: "announcement",
    event_date: "",
    description: "",
    location: "",
    max_participants: "",
  });
  const itemsPerPage = 10;

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Functions ──────────────────────────────────────────────────
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch events (announcements)
      const response = await api.get(EVENTS_API);
      const data = response.data?.results || response.data || [];
      
      // Filter for announcement type events
      const announcementData = data.filter(item => 
        item.event_type === "announcement" || 
        item.event_type === "general" ||
        !item.event_type // fallback for events without type
      );
      
      setAnnouncements(announcementData);
      
      console.log("📢 Announcements loaded:", announcementData.length);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Announcements endpoint not found. Please check the API configuration.");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view announcements.");
      } else {
        setError(error.response?.data?.detail || "Failed to load announcements");
      }
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchEventParticipation = useCallback(async () => {
    try {
      const response = await api.get(EVENT_PARTICIPATION_API);
      const data = response.data?.results || response.data || [];
      setEventParticipation(data);
    } catch (error) {
      console.error("Failed to fetch event participation:", error);
      setEventParticipation([]);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAnnouncements(),
      fetchEventParticipation(),
    ]);
    setRefreshing(false);
  }, [fetchAnnouncements, fetchEventParticipation]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getParticipantCount = (eventId) => {
    if (!eventId) return 0;
    return eventParticipation.filter(p => p.event === eventId).length;
  };

  const getStatus = (announcement) => {
    if (!announcement) return "unknown";
    const today = new Date();
    const eventDate = new Date(announcement.event_date);
    
    if (announcement.status === "cancelled") return "cancelled";
    if (eventDate < today) return "completed";
    if (eventDate.toDateString() === today.toDateString()) return "active";
    return "upcoming";
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    let filtered = announcements;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.name || "").toLowerCase().includes(search) ||
        (item.description || "").toLowerCase().includes(search) ||
        (item.event_type || "").toLowerCase().includes(search)
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(item => 
        item.priority?.toLowerCase() === filterPriority ||
        (filterPriority === "high" && item.priority === "urgent")
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(item => getStatus(item) === filterStatus);
    }

    return filtered;
  }, [announcements, searchTerm, filterPriority, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage);
  const hasActiveFilters = filterPriority !== "all" || filterStatus !== "all" || searchTerm;

  const clearFilters = () => {
    setSearchTerm("");
    setFilterPriority("all");
    setFilterStatus("all");
  };

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = {
    total: announcements.length,
    active: announcements.filter(a => getStatus(a) === "active").length,
    upcoming: announcements.filter(a => getStatus(a) === "upcoming").length,
    highPriority: announcements.filter(a => 
      a.priority?.toLowerCase() === "high" || 
      a.priority?.toLowerCase() === "urgent"
    ).length,
  };

  // ─── CRUD Operations ──────────────────────────────────────────────────
  const handleAddAnnouncement = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        event_type: "announcement",
        event_date: formData.event_date,
        description: formData.description,
        location: formData.location || "School",
        max_participants: Number(formData.max_participants) || 0,
        organizer: 1, // Default admin ID
      };
      
      const response = await api.post(EVENTS_API, payload);
      setAnnouncements([response.data, ...announcements]);
      showToast("Announcement created successfully", "success");
      setModalOpen(false);
      setFormData({ name: "", event_type: "announcement", event_date: "", description: "", location: "", max_participants: "" });
    } catch (error) {
      console.error("Failed to create announcement:", error);
      showToast(error.response?.data?.detail || "Failed to create announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!deletingAnnouncement) return;
    setSaving(true);
    try {
      await api.delete(`${EVENTS_API}${deletingAnnouncement.id}/`);
      setAnnouncements(announcements.filter(a => a.id !== deletingAnnouncement.id));
      showToast("Announcement deleted successfully", "success");
      setDeletingAnnouncement(null);
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      showToast("Failed to delete announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAllData();
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader 
            title="Announcements" 
            subtitle="Manage school announcements" 
            breadcrumbs={["Admin", "Announcements"]} 
          />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading announcements...</p>
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
          title="Announcements" 
          subtitle={`Manage school announcements${announcements.length > 0 ? ` — ${announcements.length} total` : ""}`}
          breadcrumbs={["Admin", "Announcements"]}
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
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Announcement
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading announcements</p>
              <p className="text-amber-600">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <AnnouncementStats stats={stats} />

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search announcements by title or description..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm text-sm"
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
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterPriority}
                  onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pageItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Megaphone className="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">
                      {searchTerm || hasActiveFilters ? "No announcements match your filters" : "No announcements found"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 max-w-md">
                      {searchTerm || hasActiveFilters 
                        ? "Try adjusting your search or filters" 
                        : "Add an announcement to keep everyone informed."}
                    </p>
                  </div>
                  {!searchTerm && !hasActiveFilters && (
                    <button
                      onClick={() => setModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Announcement
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Participants</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((announcement) => {
                    const status = getStatus(announcement);
                    const participantCount = getParticipantCount(announcement.id);
                    const priority = announcement.priority || "medium";
                    
                    return (
                      <tr 
                        key={announcement.id} 
                        className={`hover:bg-blue-50/30 transition-colors duration-150 group ${status === "active" ? "bg-blue-50/10" : ""}`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                              <Megaphone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{announcement.name || "—"}</span>
                              {announcement.description && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {announcement.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(announcement.event_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${getPriorityBadge(priority)} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                            {getPriorityIcon(priority)}
                            {getPriorityLabel(priority)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${getStatusBadge(status)} text-xs px-2.5 py-1`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>{participantCount}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedAnnouncement(announcement);
                                setDetailModalOpen(true);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Open edit modal
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              title="Edit announcement"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingAnnouncement(announcement)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              title="Delete announcement"
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
            )}
          </div>

          {announcements.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              startIndex={startIndex} 
              itemsShown={pageItems.length} 
              totalItems={filteredAnnouncements.length} 
              onPageChange={setCurrentPage} 
            />
          )}
        </Card>
      </div>

      {/* Add Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Add Announcement</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  placeholder="Enter announcement details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Enter location (optional)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAnnouncement}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Plus className="w-4 h-4" />}
                Add Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">Announcement Details</h3>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="font-medium text-gray-800">{selectedAnnouncement.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{formatDate(selectedAnnouncement.event_date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Priority</p>
                  <Badge className={`${getPriorityBadge(selectedAnnouncement.priority || "medium")}`}>
                    {getPriorityLabel(selectedAnnouncement.priority)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge className={`${getStatusBadge(getStatus(selectedAnnouncement))}`}>
                    {getStatus(selectedAnnouncement).charAt(0).toUpperCase() + getStatus(selectedAnnouncement).slice(1)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Participants</p>
                  <p className="font-medium text-gray-800">{getParticipantCount(selectedAnnouncement.id)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-800">{selectedAnnouncement.location || "—"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedAnnouncement.description || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingAnnouncement && (
        <ConfirmDialog
          open={true}
          title="Delete Announcement"
          message={`Are you sure you want to delete "${deletingAnnouncement.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteAnnouncement}
          onCancel={() => setDeletingAnnouncement(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Announcements;