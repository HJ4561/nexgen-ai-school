// src/modules/admin/pages/PendingApprovals/index.jsx
import React, { useState, useEffect } from "react";
import { Search, UserCheck, UserX, Clock, Mail, User, Calendar, X, CheckCircle, XCircle, AlertCircle, Users, Filter } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import adminService from "@/modules/admin/services/adminService";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const ROLE_BADGE = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  teacher: "bg-blue-50 text-blue-700 border-blue-200",
  student: "bg-emerald-50 text-emerald-700 border-emerald-200",
  parent: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-slate-50 text-slate-600 border-slate-200",
};

const ROLE_ICON = {
  admin: User,
  teacher: User,
  student: User,
  parent: User,
  staff: User,
};

const ROLE_COLORS = {
  admin: "from-purple-500 to-pink-500",
  teacher: "from-blue-500 to-cyan-500",
  student: "from-emerald-500 to-teal-500",
  parent: "from-amber-500 to-orange-500",
  staff: "from-slate-500 to-gray-500",
};

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      // Try to get pending users
      let pendingData = [];
      try {
        const response = await adminService.getUsers({ status: "pending" });
        pendingData = response.results || response || [];
      } catch (error) {
        console.log("Failed to fetch pending users, using mock data");
        pendingData = getMockPendingUsers();
      }
      
      // Ensure each user has required fields
      const formattedUsers = pendingData.map((user, index) => ({
        ...user,
        id: user.id || `pending-${index}`,
        name: user.name || user.full_name || `User ${index + 1}`,
        email: user.email || `user${index + 1}@email.com`,
        role: user.role || "user",
        status: user.status || "pending",
        joined: user.created_at || user.joined || new Date().toISOString().split('T')[0],
        requested_at: user.requested_at || user.created_at || new Date().toISOString().split('T')[0],
      }));
      
      setPendingUsers(formattedUsers);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      setPendingUsers(getMockPendingUsers());
    } finally {
      setLoading(false);
    }
  };

  const getMockPendingUsers = () => [
    {
      id: 1,
      name: "Ahmed Khan",
      email: "ahmed.khan@email.com",
      role: "teacher",
      status: "pending",
      joined: "2024-01-15",
      requested_at: "2024-01-15",
      phone: "+92 300 1234567",
      address: "Karachi, Pakistan"
    },
    {
      id: 2,
      name: "Sara Ali",
      email: "sara.ali@email.com",
      role: "student",
      status: "pending",
      joined: "2024-02-10",
      requested_at: "2024-02-10",
      phone: "+92 300 7654321",
      address: "Lahore, Pakistan"
    },
    {
      id: 3,
      name: "Muhammad Usman",
      email: "usman@email.com",
      role: "parent",
      status: "pending",
      joined: "2024-03-05",
      requested_at: "2024-03-05",
      phone: "+92 300 9876543",
      address: "Islamabad, Pakistan"
    }
  ];

  const handleApprove = async () => {
    try {
      await adminService.approveUser(selectedUser.id);
      setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));
      setApproveDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleReject = async () => {
    try {
      await adminService.rejectUser(selectedUser.id);
      setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));
      setRejectDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  const openApproveDialog = (user) => {
    setSelectedUser(user);
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (user) => {
    setSelectedUser(user);
    setRejectDialogOpen(true);
  };

  // Filter pending users based on search
  const getFilteredUsers = () => {
    let filtered = pendingUsers;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading pending approvals...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Pending Approvals" 
          subtitle={`Review and approve pending user requests${pendingUsers.length ? ` — ${pendingUsers.length} pending` : ""}`}
          breadcrumbs={["Admin", "Pending Approvals"]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingUsers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingUsers.filter(u => u.role === 'student').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingUsers.filter(u => u.role === 'teacher').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Parents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pendingUsers.filter(u => u.role === 'parent').length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <User className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Header with search */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search pending requests by name, email, or role..."
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
              
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-amber-700">{pendingUsers.length}</span>
                  <span>pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Users List */}
          <div className="divide-y divide-gray-100">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-sm">✓</span>
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">All caught up!</h3>
                <p className="text-gray-500 mt-2 text-center max-w-sm">
                  {searchTerm ? "No pending requests match your search." : "No pending approval requests to review."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              pageItems.map((user) => {
                const RoleIcon = ROLE_ICON[user.role] || User;
                const roleColor = ROLE_COLORS[user.role] || "from-blue-500 to-purple-500";
                
                return (
                  <div 
                    key={user.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-blue-50/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                      <div className={`w-12 h-12 shrink-0 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-base font-semibold shadow-lg shadow-${user.role}-500/25`}>
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-base">{user.name}</p>
                          <Badge className={`${ROLE_BADGE[user.role] || "bg-gray-50 text-gray-600 border-gray-200"} border font-medium px-2.5 py-0.5 text-xs`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
                          </Badge>
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 border font-medium px-2.5 py-0.5 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email}
                          </span>
                          {user.phone && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-500">
                              <span className="text-gray-300">•</span>
                              {user.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-sm text-gray-400">
                            <span className="text-gray-300">•</span>
                            <Clock className="w-3 h-3" />
                            Requested: {formatDate(user.requested_at || user.joined)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <button
                        onClick={() => openApproveDialog(user)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/40"
                      >
                        <UserCheck className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectDialog(user)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all duration-200"
                      >
                        <UserX className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to{" "}
                <span className="font-medium text-gray-700">
                  {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
                </span>{" "}
                of <span className="font-medium text-gray-700">{filteredUsers.length}</span> requests
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{currentPage}</span>
                  <span className="text-sm text-gray-400">/</span>
                  <span className="text-sm text-gray-500">{totalPages}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Approve Dialog */}
      {approveDialogOpen && selectedUser && (
        <ConfirmDialog
          title="Approve this user?"
          message={`This will approve ${selectedUser.name}'s account. They will be able to log in and access the system immediately.`}
          confirmLabel="Approve User"
          onConfirm={handleApprove}
          onCancel={() => {
            setApproveDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Reject Dialog */}
      {rejectDialogOpen && selectedUser && (
        <ConfirmDialog
          title="Reject this user?"
          message={`This will reject ${selectedUser.name}'s account request. They will not be able to access the system. This action can be undone.`}
          confirmLabel="Reject User"
          onConfirm={handleReject}
          onCancel={() => {
            setRejectDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </FadeIn>
  );
};

export default PendingApprovals;
