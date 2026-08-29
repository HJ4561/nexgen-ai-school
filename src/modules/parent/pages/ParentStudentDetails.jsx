/**
 * ============================================
 * PARENT STUDENT DETAILS PAGE
 * ============================================
 * 
 * Purpose: View detailed information about a child
 * Used by: Parent module routes
 * 
 * Features:
 * - Student profile information
 * - Academic details (class, section, admission)
 * - Parent/Guardian information
 * - Contact details
 * - Attendance summary
 * - Fee summary
 * - Quick stats
 * 
 * Dependencies:
 * - react for component
 * - react-redux for state management
 * - lucide-react for icons
 * - @/components/ui/Card for containers
 * - @/components/ui/Badge for status indicators
 * - @/modules/parent/store/parentThunks for data fetching
 * - @/modules/parent/store/parentSlice for selectors
 * 
 * Usage:
 * <Route path="/parent/student-details" element={<ParentStudentDetails />} />
 * ============================================
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  Edit2,
  Camera,
  UserCircle,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  fetchStudentById,
  fetchAttendanceStats,
  fetchFeeSummary,
} from "@/modules/parent/store/parentThunks";
import {
  selectSelectedChild,
  selectChildDetails,
  selectAttendanceStats,
  selectFeeSummary,
  selectParentLoading,
} from "@/modules/parent/store/parentSlice";

const ParentStudentDetails = () => {
  const dispatch = useDispatch();
  const selectedChild = useSelector(selectSelectedChild);
  const childDetails = useSelector(selectChildDetails);
  const attendanceStats = useSelector(selectAttendanceStats);
  const feeSummary = useSelector(selectFeeSummary);
  const loading = useSelector(selectParentLoading);

  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (selectedChild) {
      dispatch(fetchStudentById(selectedChild));
      dispatch(fetchAttendanceStats({ student_id: selectedChild }));
      dispatch(fetchFeeSummary({ student_id: selectedChild }));
    }
  }, [dispatch, selectedChild]);

  const childData = childDetails[selectedChild] || {};

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!selectedChild) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
        <PageHeader
          title="Student Details"
          subtitle="View your child's complete profile and information"
          breadcrumbs={["Parent", "Student Details"]}
          bgColor="bg-parent-light"
        />
        <Card>
          <div className="py-16 text-center px-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No Child Selected</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Please select a child from the dropdown to view their details.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-3 sm:px-4 lg:px-6 max-w-7xl mx-auto">
      <PageHeader
        title="Student Details"
        subtitle="View your child's complete profile and information"
        breadcrumbs={["Parent", "Student Details"]}
        bgColor="bg-parent-light"
      />

      {/* ─── Student Profile Header ────────────────────────────────────── */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                  {childData.user_name?.charAt(0) || childData.name?.charAt(0) || "S"}
                </div>
                <button className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-1.5 text-white shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {childData.user_name || childData.name || "Student"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge color="success">Active</Badge>
                  <span className="text-sm text-text-secondary">
                    {childData.class_name || "N/A"} {childData.section_name ? `- Section ${childData.section_name}` : ""}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Admission: {childData.admission_no || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Quick Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Award size={18} />
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{attendanceStats?.percentage || 0}%</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <Wallet size={18} />
            <p className="text-xs text-gray-500">Fees Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {feeSummary?.paid || 0}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <TrendingUp size={18} />
            <p className="text-xs text-gray-500">Fee Status</p>
          </div>
          <p className="text-2xl font-bold text-amber-600">
            {feeSummary?.pending > 0 ? "Pending" : "Clear"}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <GraduationCap size={18} />
            <p className="text-xs text-gray-500">Class</p>
          </div>
          <p className="text-xl font-bold text-text-primary truncate">
            {childData.class_name || "N/A"}
          </p>
        </Card>
      </div>

      {/* ─── Tab Navigation ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <User size={16} />
            Profile
          </span>
        </button>
        <button
          onClick={() => setActiveTab("academic")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "academic"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} />
            Academic
          </span>
        </button>
        <button
          onClick={() => setActiveTab("contact")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "contact"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <Phone size={16} />
            Contact
          </span>
        </button>
      </div>

      {/* ─── Profile Tab ────────────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium text-text-primary">{childData.user_name || childData.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium text-text-primary">{formatDate(childData.dob)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-medium text-text-primary">{childData.class_name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Section</p>
                  <p className="font-medium text-text-primary">{childData.section_name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Admission No.</p>
                  <p className="font-medium text-text-primary">{childData.admission_no || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Admission Date</p>
                  <p className="font-medium text-text-primary">{formatDate(childData.admission_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-text-primary">{childData.address || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-text-primary">{childData.phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium text-text-primary capitalize">{childData.gender || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-text-primary">{childData.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Parent</p>
                  <p className="font-medium text-text-primary">{childData.parent_name || childData.parent?.name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Academic Tab ────────────────────────────────────────────────── */}
      {activeTab === "academic" && (
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <GraduationCap size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-medium text-text-primary">{childData.class_name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Section</p>
                  <p className="font-medium text-text-primary">{childData.section_name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <Users size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Subjects</p>
                  <p className="font-medium text-text-primary">
                    {childData.subjects?.length > 0 
                      ? childData.subjects.join(", ")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <Calendar size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Academic Year</p>
                  <p className="font-medium text-text-primary">{childData.academic_year || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* ─── Attendance Summary ──────────────────────────────────── */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Attendance Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-600">{attendanceStats?.present || 0}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-rose-50">
                  <p className="text-lg font-bold text-rose-600">{attendanceStats?.absent || 0}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-lg font-bold text-amber-600">{attendanceStats?.late || 0}</p>
                  <p className="text-xs text-gray-500">Late</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-lg font-bold text-blue-600">{attendanceStats?.total || 0}</p>
                  <p className="text-xs text-gray-500">Total Days</p>
                </div>
              </div>
            </div>

            {/* ─── Fee Summary ──────────────────────────────────────────── */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Fee Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-blue-50">
                  <p className="text-lg font-bold text-blue-600">${feeSummary?.total || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-600">${feeSummary?.paid || 0}</p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50">
                  <p className="text-lg font-bold text-amber-600">${feeSummary?.pending || 0}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-rose-50">
                  <p className="text-lg font-bold text-rose-600">${feeSummary?.overdue || 0}</p>
                  <p className="text-xs text-gray-500">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Contact Tab ────────────────────────────────────────────────── */}
      {activeTab === "contact" && (
        <Card>
          <div className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <User size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="font-medium text-text-primary">{childData.user_name || childData.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-text-primary">{childData.phone || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <Mail size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-text-primary">{childData.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium text-text-primary">{childData.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* ─── Parent/Guardian Information ──────────────────────────── */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-text-primary mb-3">Parent/Guardian Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-start gap-3">
                  <Users size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Parent Name</p>
                    <p className="font-medium text-text-primary">{childData.parent_name || childData.parent?.name || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Parent Phone</p>
                    <p className="font-medium text-text-primary">{childData.parent_phone || childData.parent?.phone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <Mail size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Parent Email</p>
                    <p className="font-medium text-text-primary">{childData.parent_email || childData.parent?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Parent Address</p>
                    <p className="font-medium text-text-primary">{childData.parent_address || childData.parent?.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ParentStudentDetails;