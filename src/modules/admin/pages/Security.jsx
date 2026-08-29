import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, Shield, User, Clock, CheckCircle, XCircle, X, 
  RefreshCw, AlertCircle, Eye, Filter, ChevronDown,
  Calendar, Users, LogIn, LogOut, ShieldAlert, Activity
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ API Endpoints from Documentation ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const ACCESS_LOGS_API = "/security/access-logs/";
const ENTRY_EXIT_LOGS_API = "/security/entry-exit-logs/";
const VISITORS_API = "/security/visitors/";

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helper Functions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const formatDate = (dateString) => {
  if (!dateString) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status) => {
  switch(status?.toLowerCase()) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'failed':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch(status?.toLowerCase()) {
    case 'success':
    case 'approved':
      return <CheckCircle className="w-3.5 h-3.5" />;
    case 'failed':
    case 'rejected':
      return <XCircle className="w-3.5 h-3.5" />;
    case 'pending':
      return <Clock className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

const getStatusLabel = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Tab Components ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

// 1. Access Logs Tab
const AccessLogsTab = ({ 
  logs, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  showFilters, setShowFilters,
  hasActiveFilters, clearFilters,
  totalPages, startIndex, pageItems, filteredLogs
}) => {
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === "success").length,
    failed: logs.filter(l => l.status === "failed").length,
  };

  return (
    <>
      {error && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Error loading access logs</p>
              <p className="text-xs sm:text-sm text-amber-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Logs</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All access logs</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Successful</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{stats.success}</p>
          <p className="text-xs text-gray-400 mt-1">Successful access</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-red-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Failed</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-gray-400 mt-1">Failed attempts</p>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, action, or IP..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base min-h-[38px] sm:min-h-[42px]"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5 sm:gap-2 min-h-[38px] sm:min-h-[42px]"
              >
                <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Filters</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1 min-h-[38px] sm:min-h-[42px]"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-500">No access logs found</p>
                <p className="text-xs sm:text-sm text-gray-400">Access logs will appear here as users interact with the system</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[700px] sm:min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">IP Address</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Device</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Timestamp</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                          {log.user || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                        {log.action || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                      </Badge>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                      <span className="text-xs sm:text-sm text-gray-600 font-mono">{log.ip_address || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden lg:table-cell">
                      <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[100px] block">{log.device || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden sm:table-cell">
                      <span className="text-xs sm:text-sm text-gray-600">{formatDateTime(log.created_at)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <Badge className={`${getStatusBadge(log.status)} text-xs flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1`}>
                        {getStatusIcon(log.status)}
                        {getStatusLabel(log.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 2. Entry Exit Logs Tab
const EntryExitLogsTab = ({ 
  logs, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  totalPages, startIndex, pageItems, filteredLogs
}) => {
  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const today = new Date();
      const logDate = new Date(l.created_at);
      return logDate.getDate() === today.getDate() &&
             logDate.getMonth() === today.getMonth() &&
             logDate.getFullYear() === today.getFullYear();
    }).length,
    students: logs.filter(l => l.student).length,
  };

  return (
    <>
      {error && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Error loading entry/exit logs</p>
              <p className="text-xs sm:text-sm text-amber-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entries</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All entries</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{stats.today}</p>
          <p className="text-xs text-gray-400 mt-1">Today's entries</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-purple-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{stats.students}</p>
          <p className="text-xs text-gray-400 mt-1">Student entries</p>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-500">No entry/exit logs found</p>
                <p className="text-xs sm:text-sm text-gray-400">Logs will appear here as students enter and exit</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[500px] sm:min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Entry Time</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-gray-800 truncate max-w-[120px] sm:max-w-[200px]">
                          {log.student || "Unknown Student"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                        <span className="text-sm text-gray-700">{formatTime(log.entry_time)}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{formatDate(log.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredLogs.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// 3. Visitors Tab
const VisitorsTab = ({ 
  visitors, loading, error, errorMessage,
  searchTerm, setSearchTerm,
  currentPage, setCurrentPage,
  filterStatus, setFilterStatus,
  totalPages, startIndex, pageItems, filteredVisitors
}) => {
  const stats = {
    total: visitors.length,
    approved: visitors.filter(v => v.approved_by).length,
    pending: visitors.filter(v => !v.approved_by).length,
  };

  return (
    <>
      {error && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Error loading visitors</p>
              <p className="text-xs sm:text-sm text-amber-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Visitors</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">All visitors</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">{stats.approved}</p>
          <p className="text-xs text-gray-400 mt-1">Approved visitors</p>
        </Card>
        <Card className="p-3 sm:p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm border border-gray-100">
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, purpose, or phone..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base min-h-[38px] sm:min-h-[42px]"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-500">No visitors found</p>
                <p className="text-xs sm:text-sm text-gray-400">Visitors will appear here when they check in</p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[650px] sm:min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Purpose</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Phone</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">In Time</th>
                  <th className="text-left px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-gray-800 truncate max-w-[80px] sm:max-w-[120px]">
                          {visitor.name || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}
                        </span>
                      </div>
                      {/* Purpose shown below on small screens */}
                      <div className="sm:hidden mt-1 text-xs text-gray-500">
                        <span className="truncate block">{visitor.purpose || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-600 truncate max-w-[100px] block">{visitor.purpose || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{visitor.phone || "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â"}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{formatDateTime(visitor.in_time)}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                      <Badge className={`${visitor.approved_by ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"} text-xs flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1`}>
                        {visitor.approved_by ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {visitor.approved_by ? "Approved" : "Pending"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {visitors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            itemsShown={pageItems.length}
            totalItems={filteredVisitors.length}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>
    </>
  );
};

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main Component ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const Security = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState("access-logs");

  // Access Logs State
  const [accessLogs, setAccessLogs] = useState([]);
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [accessError, setAccessError] = useState(false);
  const [accessErrorMessage, setAccessErrorMessage] = useState("");
  const [accessSearchTerm, setAccessSearchTerm] = useState("");
  const [accessCurrentPage, setAccessCurrentPage] = useState(1);
  const [accessFilterStatus, setAccessFilterStatus] = useState("all");
  const [showAccessFilters, setShowAccessFilters] = useState(false);

  // Entry Exit Logs State
  const [entryExitLogs, setEntryExitLogs] = useState([]);
  const [loadingEntryExit, setLoadingEntryExit] = useState(true);
  const [entryExitError, setEntryExitError] = useState(false);
  const [entryExitErrorMessage, setEntryExitErrorMessage] = useState("");
  const [entryExitSearchTerm, setEntryExitSearchTerm] = useState("");
  const [entryExitCurrentPage, setEntryExitCurrentPage] = useState(1);

  // Visitors State
  const [visitors, setVisitors] = useState([]);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [visitorsError, setVisitorsError] = useState(false);
  const [visitorsErrorMessage, setVisitorsErrorMessage] = useState("");
  const [visitorsSearchTerm, setVisitorsSearchTerm] = useState("");
  const [visitorsCurrentPage, setVisitorsCurrentPage] = useState(1);
  const [visitorsFilterStatus, setVisitorsFilterStatus] = useState("all");

  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const pageSize = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Fetch Functions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const fetchAccessLogs = useCallback(async () => {
    setLoadingAccess(true);
    setAccessError(false);
    setAccessErrorMessage("");
    try {
      const response = await api.get(ACCESS_LOGS_API);
      const data = response.data?.results || response.data || [];
      setAccessLogs(data);
    } catch (error) {
      console.error("Failed to fetch access logs:", error);
      setAccessError(true);
      setAccessErrorMessage(error.response?.data?.detail || "Failed to load access logs");
      setAccessLogs([]);
    } finally {
      setLoadingAccess(false);
    }
  }, []);

  const fetchEntryExitLogs = useCallback(async () => {
    setLoadingEntryExit(true);
    setEntryExitError(false);
    setEntryExitErrorMessage("");
    try {
      const response = await api.get(ENTRY_EXIT_LOGS_API);
      const data = response.data?.results || response.data || [];
      setEntryExitLogs(data);
    } catch (error) {
      console.error("Failed to fetch entry/exit logs:", error);
      setEntryExitError(true);
      setEntryExitErrorMessage(error.response?.data?.detail || "Failed to load entry/exit logs");
      setEntryExitLogs([]);
    } finally {
      setLoadingEntryExit(false);
    }
  }, []);

  const fetchVisitors = useCallback(async () => {
    setLoadingVisitors(true);
    setVisitorsError(false);
    setVisitorsErrorMessage("");
    try {
      const response = await api.get(VISITORS_API);
      const data = response.data?.results || response.data || [];
      setVisitors(data);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      setVisitorsError(true);
      setVisitorsErrorMessage(error.response?.data?.detail || "Failed to load visitors");
      setVisitors([]);
    } finally {
      setLoadingVisitors(false);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAccessLogs(),
      fetchEntryExitLogs(),
      fetchVisitors(),
    ]);
    setRefreshing(false);
  }, [fetchAccessLogs, fetchEntryExitLogs, fetchVisitors]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Filter Logic ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const filteredAccessLogs = useMemo(() => {
    let filtered = accessLogs;
    if (accessFilterStatus !== "all") {
      filtered = filtered.filter(l => l.status === accessFilterStatus);
    }
    if (accessSearchTerm) {
      const search = accessSearchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.user || "").toLowerCase().includes(search) ||
        (l.action || "").toLowerCase().includes(search) ||
        (l.ip_address || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [accessLogs, accessSearchTerm, accessFilterStatus]);

  const filteredEntryExitLogs = useMemo(() => {
    let filtered = entryExitLogs;
    if (entryExitSearchTerm) {
      const search = entryExitSearchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        (l.student || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [entryExitLogs, entryExitSearchTerm]);

  const filteredVisitors = useMemo(() => {
    let filtered = visitors;
    if (visitorsFilterStatus !== "all") {
      filtered = filtered.filter(v => 
        visitorsFilterStatus === "approved" ? v.approved_by : !v.approved_by
      );
    }
    if (visitorsSearchTerm) {
      const search = visitorsSearchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        (v.name || "").toLowerCase().includes(search) ||
        (v.purpose || "").toLowerCase().includes(search) ||
        (v.phone || "").toLowerCase().includes(search)
      );
    }
    return filtered;
  }, [visitors, visitorsSearchTerm, visitorsFilterStatus]);

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Pagination ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const accessTotalPages = Math.max(1, Math.ceil(filteredAccessLogs.length / pageSize));
  const accessStartIndex = (accessCurrentPage - 1) * pageSize;
  const accessPageItems = filteredAccessLogs.slice(accessStartIndex, accessStartIndex + pageSize);

  const entryExitTotalPages = Math.max(1, Math.ceil(filteredEntryExitLogs.length / pageSize));
  const entryExitStartIndex = (entryExitCurrentPage - 1) * pageSize;
  const entryExitPageItems = filteredEntryExitLogs.slice(entryExitStartIndex, entryExitStartIndex + pageSize);

  const visitorsTotalPages = Math.max(1, Math.ceil(filteredVisitors.length / pageSize));
  const visitorsStartIndex = (visitorsCurrentPage - 1) * pageSize;
  const visitorsPageItems = filteredVisitors.slice(visitorsStartIndex, visitorsStartIndex + pageSize);

  const hasActiveFilters = accessFilterStatus !== "all" || accessSearchTerm;

  const clearFilters = () => {
    setAccessSearchTerm("");
    setAccessFilterStatus("all");
  };

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Tabs ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  const tabs = [
    { id: "access-logs", label: "Access Logs", icon: <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, count: accessLogs.length },
    { id: "entry-exit", label: "Entry/Exit", icon: <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, count: entryExitLogs.length },
    { id: "visitors", label: "Visitors", icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />, count: visitors.length },
  ];

  return (
    <FadeIn>
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
        <PageHeader
          title="Security"
          subtitle="Monitor security logs, entry/exit records, and visitors"
          actions={
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchAllData}
              disabled={refreshing}
              className="min-h-[36px] sm:min-h-[40px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-1 sm:gap-2 min-w-max px-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap
                    ${isActive 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                  <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
                  <Badge className={isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "access-logs" && (
          <AccessLogsTab
            logs={accessLogs}
            loading={loadingAccess}
            error={accessError}
            errorMessage={accessErrorMessage}
            searchTerm={accessSearchTerm}
            setSearchTerm={setAccessSearchTerm}
            currentPage={accessCurrentPage}
            setCurrentPage={setAccessCurrentPage}
            filterStatus={accessFilterStatus}
            setFilterStatus={setAccessFilterStatus}
            showFilters={showAccessFilters}
            setShowFilters={setShowAccessFilters}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            totalPages={accessTotalPages}
            startIndex={accessStartIndex}
            pageItems={accessPageItems}
            filteredLogs={filteredAccessLogs}
          />
        )}

        {activeTab === "entry-exit" && (
          <EntryExitLogsTab
            logs={entryExitLogs}
            loading={loadingEntryExit}
            error={entryExitError}
            errorMessage={entryExitErrorMessage}
            searchTerm={entryExitSearchTerm}
            setSearchTerm={setEntryExitSearchTerm}
            currentPage={entryExitCurrentPage}
            setCurrentPage={setEntryExitCurrentPage}
            totalPages={entryExitTotalPages}
            startIndex={entryExitStartIndex}
            pageItems={entryExitPageItems}
            filteredLogs={filteredEntryExitLogs}
          />
        )}

        {activeTab === "visitors" && (
          <VisitorsTab
            visitors={visitors}
            loading={loadingVisitors}
            error={visitorsError}
            errorMessage={visitorsErrorMessage}
            searchTerm={visitorsSearchTerm}
            setSearchTerm={setVisitorsSearchTerm}
            currentPage={visitorsCurrentPage}
            setCurrentPage={setVisitorsCurrentPage}
            filterStatus={visitorsFilterStatus}
            setFilterStatus={setVisitorsFilterStatus}
            totalPages={visitorsTotalPages}
            startIndex={visitorsStartIndex}
            pageItems={visitorsPageItems}
            filteredVisitors={filteredVisitors}
          />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 ${
          toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
        } text-white text-sm px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-xl flex items-center gap-2 max-w-[90%] sm:max-w-md`}>
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          )}
          <span className="text-xs sm:text-sm">{toast.message}</span>
        </div>
      )}
    </FadeIn>
  );
};

export default Security;