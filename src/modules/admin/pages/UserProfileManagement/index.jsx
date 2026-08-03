// src/modules/admin/pages/UserProfileManagement/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, Search, Plus, Edit, Trash2, UserX,
  Mail, Phone, Calendar, X, User, Shield, GraduationCap, UserCircle, Briefcase, Clock,
  RefreshCw, AlertCircle, CheckCircle, Loader2
} from "lucide-react";

// Components
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import UserDetailModal from "@/components/admin/UserDetailModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";

// Services
import adminService from "@/modules/admin/services/adminService";

const TABS = [
  { label: "All Users", icon: Users, value: "all" },
  { label: "Students", icon: GraduationCap, value: "student" },
  { label: "Teachers", icon: User, value: "teacher" },
  { label: "Parents", icon: UserCircle, value: "parent" },
  { label: "Staff", icon: Briefcase, value: "staff" },
  { label: "Pending Approvals", icon: Clock, value: "pending" },
];

const STATUS_BADGE = {
  active: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICON = {
  active: <CheckCircle className="w-3 h-3" />,
  pending: <Clock className="w-3 h-3" />,
  inactive: <UserX className="w-3 h-3" />,
  rejected: <AlertCircle className="w-3 h-3" />,
};

const ROLE_BADGE = {
  admin: "bg-purple-100 text-purple-700 border-purple-200",
  teacher: "bg-blue-100 text-blue-700 border-blue-200",
  student: "bg-emerald-100 text-emerald-700 border-emerald-200",
  parent: "bg-amber-100 text-amber-700 border-amber-200",
  staff: "bg-gray-100 text-gray-700 border-gray-200",
};

const ROLE_ICON = {
  admin: Shield,
  teacher: User,
  student: GraduationCap,
  parent: UserCircle,
  staff: Briefcase,
};

const ROLE_LABELS = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  staff: "Staff",
};

const STATUS_LABELS = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  rejected: "Rejected",
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const UserProfileManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    status: "pending",
    phone: "",
    address: "",
    password: "",
  });
  const pageSize = 10;

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const response = await adminService.getUsers();
      const userData = response.results || response || [];
      setUsers(userData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setErrored(true);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => u.role === "student").length;
    const teachers = users.filter(u => u.role === "teacher").length;
    const parents = users.filter(u => u.role === "parent").length;
    const staff = users.filter(u => u.role === "staff").length;
    const pending = users.filter(u => u.status === "pending").length;
    return { total, students, teachers, parents, staff, pending };
  }, [users]);

  const openAdd = () => {
    console.log("Opening add user modal");
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "student",
      status: "pending",
      phone: "",
      address: "",
      password: "",
    });
    setModalOpen(true);
  };
  
  const openEdit = (user) => {
    console.log("Opening edit user modal for:", user);
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      status: user.status || "pending",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
    });
    setModalOpen(true);
  };
  
  const openDetail = (user) => {
    console.log("Opening detail for user:", user);
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with values:", formData);
    setSaving(true);
    try {
      if (editingUser) {
        // Update user
        const response = await adminService.updateUser(editingUser.id, formData);
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...response } : u));
        showToast("User updated successfully", "success");
      } else {
        // Create user
        const response = await adminService.createUser(formData);
        setUsers([response, ...users]);
        showToast("User created successfully", "success");
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
      showToast(error.message || "Failed to save user", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await adminService.deleteUser(deletingUser.id);
      setUsers(users.filter(u => u.id !== deletingUser.id));
      showToast("User deleted successfully", "success");
      setDeletingUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast("Failed to delete user", "error");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  // Filter users based on active tab and search
  const getFilteredUsers = useMemo(() => {
    let filtered = users;
    
    if (activeTab !== "all") {
      if (activeTab === "pending") {
        filtered = users.filter(u => u.status === "pending");
      } else {
        filtered = users.filter(u => u.role === activeTab);
      }
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [users, activeTab, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(getFilteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = getFilteredUsers.slice(startIndex, startIndex + pageSize);
  const hasActiveFilters = searchTerm || activeTab !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setActiveTab("all");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading users...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage all users across the system
              {users.length > 0 && <span className="ml-2 text-blue-600 font-medium">· {users.length} total users</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-200" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              onClick={openAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {errored && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
            Couldn't load users. Please refresh.
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All users</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
            <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
            <p className="text-xs text-gray-400 mt-1">Enrolled</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teachers</p>
            <p className="text-2xl font-bold text-gray-800">{stats.teachers}</p>
            <p className="text-xs text-gray-400 mt-1">Active staff</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
          </Card>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="border-b border-gray-100 overflow-x-auto bg-gray-50/60">
            <div className="flex gap-1 p-1.5 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                const count = tab.value === "all" 
                  ? users.length 
                  : tab.value === "pending"
                    ? users.filter(u => u.status === "pending").length
                    : users.filter(u => u.role === tab.value).length;
                
                return (
                  <button
                    key={tab.label}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <Button variant="outline" className="border-gray-200 px-3 text-gray-500" onClick={clearFilters}>
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          {hasActiveFilters ? "No users match your filters" : "No users found"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {hasActiveFilters ? "Try adjusting your search or filters" : "Add a user to get started"}
                        </p>
                        {hasActiveFilters && (
                          <Button variant="outline" className="border-gray-200 mt-2" onClick={clearFilters}>
                            Clear filters
                          </Button>
                        )}
                        {!hasActiveFilters && (
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 mt-2"
                            onClick={openAdd}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((user) => {
                    const RoleIcon = ROLE_ICON[user.role] || Users;
                    const statusIcon = STATUS_ICON[user.status] || null;
                    return (
                      <tr 
                        key={user.id} 
                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                        onClick={() => openDetail(user)}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 text-sm truncate">{user.name || "—"}</p>
                              {user.phone && (
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-3 h-3 text-gray-400" />
                                  <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-600">{user.email || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${ROLE_BADGE[user.role] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                            <RoleIcon className="w-3 h-3" />
                            {ROLE_LABELS[user.role] || user.role || "User"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={`${STATUS_BADGE[user.status] || "bg-gray-100 text-gray-700 border-gray-200"} text-xs flex items-center gap-1.5 px-2.5 py-1`}>
                            {statusIcon}
                            {STATUS_LABELS[user.status] || user.status || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formatDate(user.joined)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(user);
                              }}
                              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                              aria-label={`Edit ${user.name}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingUser(user);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                              aria-label={`Delete ${user.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              itemsShown={pageItems.length}
              totalItems={getFilteredUsers.length}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      </div>

      {/* User Form Modal - Inline */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role <span className="text-red-500">*</span></label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status <span className="text-red-500">*</span></label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter address"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Password <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="border-gray-200" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editingUser ? "Update User" : "Create User"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingUser && (
        <ConfirmDialog
          open={true}
          title="Delete this user?"
          message={`This permanently removes ${deletingUser.name}'s profile and login. This can't be undone.`}
          confirmLabel="Delete User"
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
          loading={saving}
        />
      )}

      {/* User Detail Modal */}
      {detailModalOpen && selectedUser && (
        <UserDetailModal
          open={detailModalOpen}
          user={selectedUser}
          role={selectedUser.role}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedUser(null);
          }}
          onEdit={() => {
            setDetailModalOpen(false);
            setTimeout(() => {
              openEdit(selectedUser);
            }, 300);
          }}
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

export default UserProfileManagement;