// src/components/admin/BehaviorLogDetail/index.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Calendar, Clock, User, Tag, AlertCircle, 
  CheckCircle, Clock as ClockIcon, FileText,
  MessageSquare, Shield, AlertTriangle, ShieldAlert,
  Mail, Phone, MapPin, Download, Printer,
  Share2, ChevronRight, ChevronLeft
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate, getSeverityBadgeClass, getStatusBadgeClass } from "@/modules/admin/pages/BehaviorLogs/utils/helpers";

const SEVERITY_ICONS = {
  low: <Shield className="w-4 h-4" />,
  medium: <AlertCircle className="w-4 h-4" />,
  high: <AlertTriangle className="w-4 h-4" />,
  critical: <ShieldAlert className="w-4 h-4" />,
};

const SEVERITY_COLORS = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  high: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200",
};

const STATUS_COLORS = {
  pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
  in_progress: "text-blue-600 bg-blue-50 border-blue-200",
  resolved: "text-green-600 bg-green-50 border-green-200",
  dismissed: "text-gray-600 bg-gray-50 border-gray-200",
};

const BehaviorLogDetail = ({ log, onStatusUpdate, onClose }) => {
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  if (!log) return null;

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    await onStatusUpdate(log.id, status);
    setIsUpdating(false);
  };

  const getStudentName = () => {
    if (!log) return "Unknown Student";
    return log.student_name || log.student?.name || "Unknown Student";
  };

  const getTeacherName = () => {
    if (!log) return "Unknown Teacher";
    return log.teacher_name || log.teacher?.name || "Unknown Teacher";
  };

  const getStudentClass = () => {
    if (!log) return "No Class";
    return log.student?.class_obj || log.class_obj || "No Class";
  };

  const getStudentEmail = () => {
    if (!log) return "No Email";
    return log.student?.email || log.student_email || "No Email";
  };

  const getStudentPhone = () => {
    if (!log) return "No Phone";
    return log.student?.phone || log.student_phone || "No Phone";
  };

  const severityColor = SEVERITY_COLORS[log.severity?.toLowerCase()] || SEVERITY_COLORS.low;
  const statusColor = STATUS_COLORS[log.status?.toLowerCase()] || STATUS_COLORS.pending;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* ─── Header ─── */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-12">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shadow-lg border-2 border-white/30">
                {getStudentName().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate">{getStudentName()}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-white/80">
                    {getStudentClass()} • {log.student?.section || log.section || "No Section"}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                  <span className="text-sm text-white/80">
                    ID: #{log.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge className={`${severityColor} border text-xs font-medium`}>
                    <span className="flex items-center gap-1.5">
                      {SEVERITY_ICONS[log.severity]}
                      {log.severity?.charAt(0).toUpperCase() + log.severity?.slice(1) || "Unknown"}
                    </span>
                  </Badge>
                  <Badge className={`${statusColor} border text-xs font-medium`}>
                    {log.status?.replace("_", " ") || "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Quick Actions Bar ─── */}
          <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <div className="flex-1" />
            <span className="text-xs text-gray-400">
              Reported {formatDate(log.created_at || log.date)}
            </span>
          </div>

          {/* ─── Content ─── */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-gray-100">
              {["details", "timeline", "notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* ─── Tab: Details ─── */}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{log.type || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{log.description || "No description provided"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Action Taken</label>
                    <p className="mt-1 text-sm text-gray-900">{log.action_taken || "No action taken"}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</label>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {getStudentEmail()}
                      </p>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {getStudentPhone()}
                      </p>
                      <p className="text-sm text-gray-900 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        Teacher: {getTeacherName()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(log.date)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Time</label>
                      <p className="mt-1 text-sm text-gray-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {log.time || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Timeline ─── */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Status History</span>
                  <span className="text-xs">• Last updated {formatDate(log.updated_at || log.created_at)}</span>
                </div>
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-8 mt-1.5 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100" />
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm font-medium text-green-700">Current Status: {log.status?.replace("_", " ") || "Pending"}</p>
                      <p className="text-xs text-gray-500 mt-1">Updated {formatDate(log.updated_at || log.created_at)}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-8 mt-1.5 w-4 h-4 rounded-full bg-gray-300" />
                    <div className="bg-gray-50 rounded-xl p-4 opacity-60">
                      <p className="text-sm text-gray-600">Log Created</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Tab: Notes ─── */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    Add Note
                  </label>
                  <textarea
                    className="mt-2 w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows="3"
                    placeholder="Add a note about this behavior log..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button 
                    className="mt-2" 
                    size="sm"
                    disabled={!note.trim()}
                    onClick={() => {
                      console.log("Note added:", note);
                      setNote("");
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Add Note
                  </Button>
                </div>
                <div className="text-center text-sm text-gray-400 py-4">
                  No notes added yet
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {log.status !== "resolved" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate("resolved")}
                    className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate("in_progress")}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                  >
                    <ClockIcon className="w-4 h-4 mr-1.5" />
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={() => handleStatusUpdate("dismissed")}
                    className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-800"
                  >
                    <X className="w-4 h-4 mr-1.5" />
                    Dismiss
                  </Button>
                </>
              )}
              {isUpdating && (
                <span className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2" />
                  Updating...
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                Full Report
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BehaviorLogDetail;
