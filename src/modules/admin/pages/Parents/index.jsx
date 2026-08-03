// src/modules/admin/pages/Parents/index.jsx
import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Phone, Mail, Users, User, X, Calendar, MapPin, UserCircle } from "lucide-react";
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

const Parents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [deletingParent, setDeletingParent] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      let parentData = [];
      
      // Try multiple methods to get parents
      try {
        // Method 1: Try getParents endpoint
        const response = await adminService.getParents();
        parentData = response.results || response || [];
        console.log("Parents fetched from getParents:", parentData);
      } catch (error) {
        console.log("getParents failed, trying alternative method...");
        
        try {
          // Method 2: Try getUsers with role filter
          const response = await adminService.getUsers({ role: 'parent' });
          const allUsers = response.results || response || [];
          parentData = allUsers.filter(user => user.role === 'parent' || user.role === 'parents');
          console.log("Parents filtered from getUsers with role filter:", parentData);
        } catch (err) {
          console.log("getUsers with filter failed, trying get all users...");
          
          try {
            // Method 3: Get all users and filter
            const response = await adminService.getUsers();
            const allUsers = response.results || response || [];
            parentData = allUsers.filter(user => user.role === 'parent' || user.role === 'parents');
            console.log("Parents filtered from all users:", parentData);
          } catch (err2) {
            console.error("All API attempts failed:", err2);
            // Method 4: Use mock data as fallback
            parentData = getMockParents();
            setLoadError("Using sample data. API connection failed.");
          }
        }
      }
      
      // If still no data, use mock data
      if (!parentData || parentData.length === 0) {
        console.log("No parent data found, using mock data");
        parentData = getMockParents();
        setLoadError("No parents found in database. Showing sample data.");
      }
      
      // Ensure each parent has required fields
      const parentsWithId = parentData.map((p, index) => ({
        ...p,
        id: p.id || p.profileId || `parent-${index}`,
        profileId: p.profileId || p.id || `parent-${index}`,
        role: "parent",
        status: p.status || "active",
        name: p.name || p.full_name || `Parent ${index + 1}`,
        email: p.email || `parent${index + 1}@email.com`,
        children: p.children || p.number_of_children || p.childCount || 0,
        occupation: p.occupation || p.job || p.profession || "Not specified",
        phone: p.phone || p.mobile || p.contact || "",
        address: p.address || p.home_address || "",
        joined: p.joined || p.created_at || p.createdAt || new Date().toISOString().split('T')[0]
      }));
      
      console.log("Final parents data:", parentsWithId);
      setParents(parentsWithId);
    } catch (error) {
      console.error("Failed to fetch parents:", error);
      setLoadError("Failed to load parents. Using sample data.");
      setParents(getMockParents());
    } finally {
      setLoading(false);
    }
  };

  const getMockParents = () => [
    { 
      id: 1, 
      profileId: 1,
      name: "Ahmed Khan", 
      email: "ahmed.khan@email.com", 
      phone: "+92 300 1234567",
      address: "Karachi, Pakistan",
      status: "active",
      children: 2,
      occupation: "Engineer",
      role: "parent",
      joined: "2024-01-15"
    },
    { 
      id: 2, 
      profileId: 2,
      name: "Sara Ali", 
      email: "sara.ali@email.com", 
      phone: "+92 300 7654321",
      address: "Lahore, Pakistan",
      status: "active",
      children: 1,
      occupation: "Doctor",
      role: "parent",
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
      children: 3,
      occupation: "Businessman",
      role: "parent",
      joined: "2024-03-05"
    },
    { 
      id: 4, 
      profileId: 4,
      name: "Fatima Noor", 
      email: "fatima@email.com", 
      phone: "+92 300 4567890",
      address: "Rawalpindi, Pakistan",
      status: "active",
      children: 2,
      occupation: "Teacher",
      role: "parent",
      joined: "2024-03-15"
    },
    { 
      id: 5, 
      profileId: 5,
      name: "Ali Hassan", 
      email: "ali.hassan@email.com", 
      phone: "+92 300 2345678",
      address: "Peshawar, Pakistan",
      status: "inactive",
      children: 1,
      occupation: "Businessman",
      role: "parent",
      joined: "2024-04-01"
    }
  ];

  const openAdd = () => { 
    setEditingParent(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (parent) => { 
    console.log("Opening edit for parent:", parent);
    setEditingParent(parent); 
    setModalOpen(true); 
  };
  
  const openDetail = (parent) => {
    console.log("Opening detail for parent:", parent);
    setSelectedParent(parent);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (values) => {
    console.log("Submitting form with values:", values);
    try {
      if (editingParent) {
        // Update parent
        const updatedParents = parents.map(p => 
          p.id === editingParent.id ? { ...p, ...values } : p
        );
        setParents(updatedParents);
      } else {
        // Create parent
        const newParent = { 
          id: parents.length + 1,
          profileId: parents.length + 1,
          ...values,
          role: "parent",
          status: values.status || "active",
          joined: new Date().toISOString().split('T')[0],
          children: values.children || 0
        };
        setParents([...parents, newParent]);
      }
      setModalOpen(false);
      setEditingParent(null);
    } catch (error) {
      console.error("Failed to save parent:", error);
    }
  };

  const handleDelete = async () => {
    try {
      setParents(parents.filter(p => p.id !== deletingParent.id));
      setDeletingParent(null);
    } catch (error) {
      console.error("Failed to delete parent:", error);
    }
  };

  // Filter parents based on search
  const getFilteredParents = () => {
    let filtered = parents;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredParents = getFilteredParents();
  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredParents.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-blue-50 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-sm text-gray-500 font-medium">Loading parents...</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader
          title="Parents"
          subtitle={`Manage all parents${parents.length ? ` — ${parents.length} total` : ""}`}
          breadcrumbs={["Admin", "Parents"]}
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
                  placeholder="Search parents by name, email, phone, or occupation..."
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
                <span>Add Parent</span>
              </button>
            </div>
            
            {/* Quick stats */}
            <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{parents.length}</p>
                  <p className="text-xs text-gray-500">Total Parents</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{parents.filter(p => p.status === 'active').length}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{parents.filter(p => p.status === 'pending').length}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{parents.reduce((acc, p) => acc + (p.children || 0), 0)}</p>
                  <p className="text-xs text-gray-500">Total Children</p>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Children</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupation</th>
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
                          <UserCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">
                          {searchTerm ? "No parents match your search." : "No parents found."}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? "Try adjusting your search terms" : "Add your first parent to get started"}
                        </p>
                        {!searchTerm && (
                          <button
                            onClick={openAdd}
                            className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add Parent
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((parent) => (
                    <tr 
                      key={parent.profileId || parent.id} 
                      className="hover:bg-blue-50/30 transition-colors duration-150 group cursor-pointer"
                      onClick={() => openDetail(parent)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm shadow-amber-500/25">
                            {parent.name?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">{parent.name || "—"}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-500 truncate">{parent.email || "—"}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {parent.phone && (
                            <span className="flex items-center gap-1.5 text-sm text-gray-700">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {parent.phone}
                            </span>
                          )}
                          {parent.address && (
                            <span className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {parent.address}
                            </span>
                          )}
                          {!parent.phone && !parent.address && (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          <Users className="w-3 h-3 mr-1.5" />
                          {parent.children || 0} {parent.children === 1 ? 'Child' : 'Children'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-700">
                          {parent.occupation || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${STATUS_BADGE[parent.status] || "bg-gray-50 text-gray-600 border-gray-200"} border font-medium px-3 py-1`}>
                          <span className="mr-1.5">{STATUS_ICON[parent.status] || "•"}</span>
                          {parent.status ? parent.status.charAt(0).toUpperCase() + parent.status.slice(1) : "Unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(parent);
                            }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                            aria-label={`Edit ${parent.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingParent(parent);
                            }}
                            className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all duration-200"
                            aria-label={`Delete ${parent.name}`}
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
            totalItems={filteredParents.length}
            onPageChange={setCurrentPage}
          />
        </Card>
      </div>

      {/* Modals */}
      {modalOpen && (
        <UserFormModal
          role="parent"
          initialData={editingParent}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditingParent(null);
          }}
        />
      )}

      {deletingParent && (
        <ConfirmDialog
          title="Delete this parent?"
          message={`This permanently removes ${deletingParent.name}'s parent profile. This can't be undone.`}
          confirmLabel="Delete Parent"
          onConfirm={handleDelete}
          onCancel={() => setDeletingParent(null)}
        />
      )}

      {detailModalOpen && selectedParent && (
        <UserDetailModal
          user={selectedParent}
          role="parent"
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedParent(null);
          }}
          onEdit={() => {
            setDetailModalOpen(false);
            setTimeout(() => {
              openEdit(selectedParent);
            }, 300);
          }}
        />
      )}
    </FadeIn>
  );
};

export default Parents;
