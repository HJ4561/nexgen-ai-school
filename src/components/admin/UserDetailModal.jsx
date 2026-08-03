// src/components/admin/UserDetailModal.jsx
import React, { useEffect, useState } from "react";
import { 
  X, Mail, Phone, MapPin, Calendar, User, Shield, GraduationCap, 
  UserCircle, Briefcase, Clock, Edit, Award, BookOpen, 
  CalendarDays, Building2, Users, Star, CheckCircle, XCircle,
  AlertCircle, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const STATUS_BADGE = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-slate-50 text-slate-600 border-slate-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_ICON = {
  active: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  pending: <AlertCircle className="w-4 h-4 text-amber-500" />,
  inactive: <XCircle className="w-4 h-4 text-slate-400" />,
  rejected: <XCircle className="w-4 h-4 text-rose-500" />,
};

const ROLE_BADGE = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  teacher: "bg-blue-50 text-blue-700 border-blue-200",
  student: "bg-emerald-50 text-emerald-700 border-emerald-200",
  parent: "bg-amber-50 text-amber-700 border-amber-200",
  staff: "bg-slate-50 text-slate-600 border-slate-200",
};

const ROLE_ICON = {
  admin: Shield,
  teacher: User,
  student: GraduationCap,
  parent: UserCircle,
  staff: Briefcase,
};

const ROLE_COLORS = {
  admin: "from-purple-500 to-pink-500",
  teacher: "from-blue-500 to-cyan-500",
  student: "from-emerald-500 to-teal-500",
  parent: "from-amber-500 to-orange-500",
  staff: "from-slate-500 to-gray-500",
};

const UserDetailModal = ({ user, role, onClose, onEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const RoleIcon = ROLE_ICON[role] || User;
  const gradientColor = ROLE_COLORS[role] || "from-blue-500 to-purple-500";

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleEdit = () => {
    setIsVisible(false);
    setTimeout(() => {
      onEdit();
    }, 300);
  };

  // Get status color for gradient
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'emerald';
      case 'pending': return 'amber';
      case 'inactive': return 'slate';
      case 'rejected': return 'rose';
      default: return 'gray';
    }
  };

  const statusColor = getStatusColor(user?.status);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed inset-0 z-[10000] overflow-y-auto transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden"
          style={{
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className={`bg-gradient-to-r ${gradientColor} px-6 pt-6 pb-8 relative`}>
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 opacity-10">
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                <circle cx="150" cy="50" r="80" fill="white" />
                <circle cx="180" cy="180" r="60" fill="white" />
              </svg>
            </div>
            
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white/30">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <RoleIcon className="w-4 h-4 text-gray-700" />
                  </div>
                </div>
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{user?.name || "Unknown User"}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm font-medium px-3 py-1">
                      <RoleIcon className="w-3 h-3 mr-1.5" />
                      {role?.charAt(0).toUpperCase() + role?.slice(1) || "User"}
                    </Badge>
                    <Badge className={`bg-${statusColor}-100/20 text-white border-white/30 backdrop-blur-sm font-medium px-3 py-1`}>
                      {STATUS_ICON[user?.status]}
                      <span className="ml-1.5">{user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1) || "Unknown"}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm flex-shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Status</p>
                <p className={`text-sm font-semibold mt-0.5 text-${statusColor}-600`}>
                  {user?.status?.charAt(0).toUpperCase() + user?.status?.slice(1) || "Unknown"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Role</p>
                <p className="text-sm font-semibold mt-0.5 text-gray-700">
                  {role?.charAt(0).toUpperCase() + role?.slice(1) || "User"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Joined</p>
                <p className="text-sm font-semibold mt-0.5 text-gray-700">
                  {formatDateShort(user?.joined)}
                </p>
              </div>
            </div>

            {/* Divider with icon */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Profile Details
                </span>
              </div>
            </div>

            {/* User details - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm text-gray-900 mt-0.5 break-all">{user?.email || "—"}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-gray-900 mt-0.5">{user?.phone || "—"}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group md:col-span-2">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                  <MapPin className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                  <p className="text-sm text-gray-900 mt-0.5">{user?.address || "—"}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group md:col-span-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</p>
                  <p className="text-sm text-gray-900 mt-0.5">{formatDate(user?.joined)}</p>
                </div>
              </div>
            </div>

            {/* Additional fields for teachers */}
            {role === "teacher" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Professional Details
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</p>
                      <p className="text-sm text-gray-900 mt-0.5">{user?.subject_specialization || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 transition-colors">
                      <Award className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</p>
                      <p className="text-sm text-gray-900 mt-0.5">{user?.experience ? `${user.experience} years` : "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group md:col-span-2">
                    <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center shrink-0 group-hover:bg-pink-100 transition-colors">
                      <GraduationCap className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</p>
                      <p className="text-sm text-gray-900 mt-0.5">{user?.qualification || "—"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Additional fields for students */}
            {role === "student" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Academic Details
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No.</p>
                      <p className="text-sm text-gray-900 mt-0.5">{user?.admission_no || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                      <Building2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Class</p>
                      <p className="text-sm text-gray-900 mt-0.5">{user?.class_obj ? `Class ${user.class_obj}` : "—"}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailModal;