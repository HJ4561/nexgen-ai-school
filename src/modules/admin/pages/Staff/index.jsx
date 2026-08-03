// src/modules/admin/pages/Staff/index.jsx
import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Phone, Mail, Users, User, X, Calendar, MapPin, Briefcase, Clock, Building2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import UserFormModal from "@/components/admin/UserFormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Pagination from "@/components/admin/Pagination";
import UserDetailModal from "@/components/admin/UserDetailModal";
import adminService from "@/modules/admin/services/adminService";

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_ICON = {
  active: "●",
  pending: "◐",
  inactive: "○",
  rejected: "✕",
};

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // First try to get staff directly
      let staffData = [];
      try {
        const response = await adminService.getStaff();
        staffData = response.results || response || [];
        console.log("Staff fetched from getStaff:", staffData);
      } catch (error) {
        console.log("getStaff failed, trying alternative method...");
        // Try to get all users and filter by role
        try {
          const response = await adminService.getUsers();
          const allUsers = response.results || response || [];
          staffData = allUsers.filter(user => 
            user.role === 'staff' || 
            user.role === 'staffs' ||
            user.user_type === 'staff'
          );
          console.log("Staff filtered from getUsers:", staffData);
        } catch (err) {
          console.error("All API attempts failed:", err);
          staffData = getMockStaff();
        }
      }
      
      // If still no data, use mock data
      if (staffData.length === 0) {
        console.log("No staff data found, using mock data");
        staffData = getMockStaff();
        setLoadError("No staff found in database. Showing sample data.");
      }
      
      // Ensure each staff has required fields
      const staffWithId = staffData.map((s, index) => ({
        ...s,
        id: s.id || s.profileId || `staff-${index}`,
        profileId: s.profileId || s.id || `staff-${index}`,
        role: "staff",
        status: s.status || "active",
        name: s.name || s.full_name || `Staff ${index + 1}`,
        email: s.email || `staff${index + 1}@email.com`,
        department: s.department || s.departments || "Not specified",
        position: s.position || s.designation || s.title || "Staff Member",
        phone: s.phone || s.mobile || "",
        address: s.address || "",
        joined: s.joined || s.created_at || new Date().toISOString().split('T')[0]
      }));
      
      console.log("Final staff data:", staffWithId);
      setStaff(staffWithId);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setLoadError("Failed to load staff. Using sample data.");
      setStaff(getMockStaff());
    } finally {
      setLoading(false);
    }
  };

  const getMockStaff = () => [
    { 
      id: 1, 
      profileId: 1,
      name: "Ali Hassan", 
      email: "ali.hassan@email.com", 
      phone: "+92 300 1234567",
      address: "Karachi, Pakistan",
      status: "active",
      department: "Administration",
      position: "Office Manager",
      role: "staff",
      joined: "2024-01-15"
    },
    { 
      id: 2, 
      profileId: 2,
      name: "Fatima Noor", 
      email: "fatima.noor@email.com", 
      phone: "+92 300 7654321",
      address: "Lahore, Pakistan",
      status: "active",
      department: "Human Resources",
      position: "HR Coordinator",
      role: "staff",
      joined: "2024-02-10"
    },
    { 
      id: 3, 
      profileId: 3,
      name: "Muhammad Usman", 
      email: "usman@email.com", 
      phone: "+92 300 9876543",
      address: "Islamabad, Pakistan",
      status: "pending",
      department: "Finance",
      position: "Accountant",
      role: "staff",
      joined: "2024-03-05"
    },
    { 
      id: 4, 
      profileId: 4,
      name: "Sara Ahmed", 
      email: "sara.ahmed@email.com", 
      phone: "+92 300 4567890",
      address: "Rawalpindi, Pakistan",
      status: "active",
      department: "IT Department",
      position: "System Administrator",
      role: "staff",
      joined: "2024-03-15"
    },
    { 
      id: 5, 
      profileId: 5,
      name: "Ahmed Raza", 
      email: "ahmed.raza@email.com", 
      phone: "+92 300 2345678",
      address: "Peshawar, Pakistan",
      status: "inactive",
      department: "Maintenance",
      position: "Facilities Manager",
      role: "staff",
      joined: "2024-04-01"
    }
  ];

  const openAdd = () => { 
    setEditingStaff(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (staffMember) => { 
    console.log("Opening edit for staff:", staffMember);
    setEditingStaff(staffMember); 
    setModalOpen(true); 
  };
  
  const openDetail = (staffMember) => {
    console.log("Opening detail for staff:", staffMember);
    setSelectedStaff(staffMember);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (values) => {
    console.log("Submitting form with values:", values);
    try {
      if (editingStaff) {
        // Update staff
        const updatedStaff = staff.map(s => 
          s.id === editingStaff.id ? { ...s, ...values } : s
        );
        setStaff(updatedStaff);
        // TODO: Call API to update
      } else {
        // Create staff
        const newStaff = { 
          id: staff.length + 1,
          profileId: staff.length + 1,
          ...values,
          role: "staff",
          status: values.status || "active",
          joined: new Date().toISOString().split('T')[0]
        };
        setStaff([...staff, newStaff]);
        // TODO: Call API to create
      }
      setModalOpen(false);
      setEditingStaff(null);
    } catch (error) {
      console.error("Failed to save staff:", error);
    }
  };

  const handleDelete = async () => {
    try {
      setStaff(staff.filter(s => s.id !== deletingStaff.id));
      setDeletingStaff(null);
      // TODO: Call API to delete
    } catch (error) {
      console.error("Failed to delete staff:", error);
    }
  };

  // Filter staff based on search
  const getFilteredStaff = () => {
    let filtered = staff;
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredStaff = getFilteredStaff();
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading staff...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader
          title="Staff"
          subtitle={`Manage all staff members${staff.length ? ` — ${staff.length} total` : ""}`}
          breadcrumbs={["Admin", "Staff"]}
        />

        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {loadError && (
            <div className="px-6 py-3 text-sm text-amber-700 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span>
              {loadError}
            </div>
          )}

          {/* Header with search and actions */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search staff by name, email, department, or position..."
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
              
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff</span>
              </button>
            </div>
            
            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{staff.length}</p>
                  <p className="text-xs text-gray-500">Total Staff</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{staff.filter(s => s.status === 'active').length}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{staff.filter(s => s.status === 'pending').length}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{new Set(staff.map(s => s.department)).size}</p>
                  <p className="text-xs text-gray-500">Departments</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          {searchTerm ? "No staff match your search." : "No staff found."}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search terms" : "Add your first staff member to get started"}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Staff
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((staffMember) => (
                    <tr 
                      key={staffMember.profileId || staffMember.id} 
                      className="hover:bg-blue-50/30 transition-colors duration-150 group cursor-pointer"
                      onClick={() => openDetail(staffMember)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm shadow-slate-500/25">
                            {staffMember.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{staffMember.name || "—"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500 truncate">{staffMember.email || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          <Building2 className="w-3 h-3 mr-1.5" />
                          {staffMember.department || "Not assigned"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                          {staffMember.position || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {staffMember.phone && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-700">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {staffMember.phone}
                            </span>
                          )}
                          {staffMember.address && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {staffMember.address}
                            </span>
                          )}
                          {!staffMember.phone && !staffMember.address && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${STATUS_BADGE[staffMember.status] || "bg-gray-50 text-gray-600 border-gray-200"} border font-medium px-3 py-1`}>
                          <span className="mr-1.5">{STATUS_ICON[staffMember.status] || "•"}</span>
                          {staffMember.status ? staffMember.status.charAt(0).toUpperCase() + staffMember.status.slice(1) : "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(staffMember);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                            aria-label={`Edit ${staffMember.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingStaff(staffMember);
                            }}
                            className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all duration-200"
                            aria-label={`Delete ${staffMember.name}`}
                          >
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredStaff.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Modals */}
      {modalOpen && (
        <UserFormModal
          role="staff"
          initialData={editingStaff}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditingStaff(null);
          }}
        />
      )}

      {deletingStaff && (
        <ConfirmDialog
          title="Delete this staff member?"
          message={`This permanently removes ${deletingStaff.name}'s staff profile. This can't be undone.`}
          confirmLabel="Delete Staff"
          onConfirm={handleDelete}
          onCancel={() => setDeletingStaff(null)}
        />
      )}

      {detailModalOpen && selectedStaff && (
        <UserDetailModal
          user={selectedStaff}
          role="staff"
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedStaff(null);
          }}
          onEdit={() => {
            setDetailModalOpen(false);
            setTimeout(() => {
              openEdit(selectedStaff);
            }, 300);
          }}
        />
      )}
    </FadeIn>
  );
};

export default Staff;
