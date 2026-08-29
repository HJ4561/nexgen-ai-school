// src/components/admin/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import { X, User, Mail, Lock, UserCheck, Shield, BookOpen, Award, Calendar, MapPin, Phone, GraduationCap, Building2, Save, Plus, Edit2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROLE_CONFIG } from "@/modules/admin/services/adminService";

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "emerald" },
  { value: "pending", label: "Pending", color: "amber" },
  { value: "inactive", label: "Inactive", color: "slate" },
  { value: "rejected", label: "Rejected", color: "rose" },
];

const ROLE_ICONS = {
  teacher: User,
  student: GraduationCap,
  parent: User,
  staff: User,
  admin: Shield,
};

const ROLE_COLORS = {
  teacher: "from-blue-500 to-cyan-500",
  student: "from-emerald-500 to-teal-500",
  parent: "from-amber-500 to-orange-500",
  staff: "from-slate-500 to-gray-500",
  admin: "from-purple-500 to-pink-500",
};

const FIELD_ICONS = {
  subject_specialization: BookOpen,
  qualification: Award,
  experience: Calendar,
  admission_no: Calendar,
  class_obj: Building2,
  phone: Phone,
  address: MapPin,
  gender: User,
  date_of_birth: Calendar,
};

const UserFormModal = ({ role, initialData, onSubmit, onClose }) => {
  const config = ROLE_CONFIG[role];
  const RoleIcon = ROLE_ICONS[role] || User;
  const gradientColor = ROLE_COLORS[role] || "from-blue-500 to-purple-500";
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const empty = { 
        name: "", 
        email: "", 
        password: "", 
        status: "active",
        phone: "",
        address: ""
      };
      if (config && config.fields) {
        config.fields.forEach((field) => {
          empty[field.name] = "";
        });
      }
      setFormData(empty);
    }
  }, [initialData, config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!isEdit && !formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (!isEdit && formData.password?.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.color || "gray";
  };

  if (!config) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${gradientColor} px-6 py-5 relative`}>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
              <circle cx="100" cy="30" r="60" fill="white" />
              <circle cx="130" cy="130" r="40" fill="white" />
            </svg>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-2 ring-white/30">
                {isEdit ? (
                  <Edit2 className="w-6 h-6" />
                ) : (
                  <Plus className="w-6 h-6" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEdit ? `Edit ${config.label}` : `Add New ${config.label}`}
                </h2>
                <p className="text-sm text-white/80 mt-0.5">
                  {isEdit ? `Update ${config.label.toLowerCase()} information` : `Create a new ${config.label.toLowerCase()} account`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-blue-500"></div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Basic Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    Full Name
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 ${
                    errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-rose-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Address
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 ${
                    errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-rose-600">{errors.email}</p>
                )}
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Password
                      <span className="text-rose-500">*</span>
                    </span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50 ${
                      errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : 'border-gray-200'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-rose-600">{errors.password}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-400" />
                    Status
                  </span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status || "active"}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50/50"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {formData.status && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${getStatusColor(formData.status)}-50 text-${getStatusColor(formData.status)}-700`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-${getStatusColor(formData.status)}-500`}></span>
                      Status: {STATUS_OPTIONS.find(opt => opt.value === formData.status)?.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-emerald-500"></div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Contact Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Address
                  </span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {config.fields && config.fields.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-purple-500"></div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <RoleIcon className="w-4 h-4 text-gray-400" />
                    {config.label} Details
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.fields.map((field) => {
                  const FieldIcon = FIELD_ICONS[field.name] || User;
                  
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <span className="flex items-center gap-2">
                          <FieldIcon className="w-4 h-4 text-gray-400" />
                          {field.label}
                          {field.required && <span className="text-rose-500">*</span>}
                        </span>
                      </label>
                      {field.type === "select" ? (
                        <div className="relative">
                          <select
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-gray-50/50"
                          >
                            <option value="">Select {field.label}...</option>
                            {field.options && field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50/50"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r ${gradientColor} rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update' : 'Create'} {config.label}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;