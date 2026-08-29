// src/modules/student/pages/Documents.jsx

/**
 * ============================================
 * STUDENT DOCUMENTS - CLEAN & PROFESSIONAL
 * ============================================
 * 
 * Design Philosophy:
 * - Minimalist, clean, professional
 * - Clear visual hierarchy
 * - Subtle interactions
 * - Focus on content
 * - Accessible and responsive
 * ============================================
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileCheck,
  FileX,
  File,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  Clock,
  User,
  Calendar,
  FolderOpen,
  Plus,
  Upload,
  Trash2,
  Edit,
  Save,
  X as XIcon,
  Loader2,
  ExternalLink,
  Paperclip,
  Info,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import studentService from "@/modules/student/services/studentService";

// ─── Utility Functions ──────────────────────────────────────────────────

const getDocTypeName = (doc) => {
  if (doc.doc_type_name && doc.doc_type_name !== 'null') return doc.doc_type_name;
  if (doc.doc_type) {
    if (typeof doc.doc_type === 'string') return doc.doc_type;
    if (doc.doc_type.name) return doc.doc_type.name;
    if (doc.doc_type.doc_type_name) return doc.doc_type.doc_type_name;
  }
  return "Document";
};

const getUploadedByName = (doc) => {
  if (doc.uploaded_by_name && doc.uploaded_by_name !== 'null') return doc.uploaded_by_name;
  if (doc.uploaded_by) {
    if (typeof doc.uploaded_by === 'string') return doc.uploaded_by;
    if (doc.uploaded_by.name) return doc.uploaded_by.name;
    if (doc.uploaded_by.user_name) return doc.uploaded_by.user_name;
  }
  return "Unknown";
};

const getFileIcon = (typeName) => {
  const type = typeName.toLowerCase();
  if (type.includes("image") || type.includes("photo")) return { icon: File, color: "text-purple-500" };
  if (type.includes("pdf") || type.includes("doc")) return { icon: FileText, color: "text-red-500" };
  if (type.includes("spreadsheet") || type.includes("excel")) return { icon: File, color: "text-emerald-500" };
  if (type.includes("code") || type.includes("script")) return { icon: File, color: "text-blue-500" };
  return { icon: File, color: "text-gray-500" };
};

const getStatusConfig = (status) => {
  const map = {
    uploaded: { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle, label: "Uploaded" },
    pending: { color: "bg-amber-50 text-amber-700", icon: Clock, label: "Pending" },
    rejected: { color: "bg-red-50 text-red-700", icon: AlertTriangle, label: "Rejected" },
    approved: { color: "bg-blue-50 text-blue-700", icon: ShieldCheck, label: "Approved" },
  };
  return map[status?.toLowerCase()] || map.uploaded;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60));
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return "N/A"; }
};

// ─── Toast ──────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600" },
    error: { icon: XCircle, bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
    info: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
  };

  const { icon: Icon, bg, border, text } = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border ${border} ${bg} px-4 py-3 shadow-lg`}
    >
      <Icon className={`h-5 w-5 ${text}`} />
      <span className="text-sm text-gray-800">{message}</span>
    </motion.div>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-gray-500" />
      </div>
    </div>
  </div>
);

// ─── Upload Modal ──────────────────────────────────────────────────────

const UploadModal = ({ isOpen, onClose, onUpload, loading, documentTypes }) => {
  const [formData, setFormData] = useState({ doc_type: "", description: "", file: null });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ doc_type: "", description: "", file: null });
      setPreview(null);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file || !formData.doc_type) return;
    const data = new FormData();
    data.append('doc_type', formData.doc_type);
    if (formData.description) data.append('description', formData.description);
    data.append('file', formData.file);
    onUpload(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.doc_type}
              onChange={(e) => setFormData(prev => ({ ...prev, doc_type: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select type...</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              File <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                formData.file ? "border-emerald-400 bg-emerald-50" : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <div>
                  <FileText className="h-10 w-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-800 mt-1">{formData.file?.name}</p>
                  <p className="text-xs text-gray-500">{(formData.file?.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, file: null })); setPreview(null); }}
                    className="text-xs text-red-500 hover:text-red-600 mt-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Paperclip className="h-10 w-10 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600 mt-1">Click to upload</p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX, TXT, JPG, PNG</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!formData.file || loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Document Card ─────────────────────────────────────────────────────

const DocumentCard = ({ document, onEdit, onDelete, onView }) => {
  const docTypeName = getDocTypeName(document);
  const uploadedByName = getUploadedByName(document);
  const fileIcon = getFileIcon(docTypeName);
  const FileIcon = fileIcon.icon;
  const statusConfig = getStatusConfig(document.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <FileIcon className={`h-5 w-5 ${fileIcon.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">{docTypeName}</h4>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
            <User className="h-3 w-3" />
            {uploadedByName}
            <span className="text-gray-300">•</span>
            <Calendar className="h-3 w-3" />
            {formatDate(document.created_at)}
          </p>
          {document.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{document.description}</p>
          )}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
            {document.file && (
              <a href={document.file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                <Download className="h-3 w-3" /> Download
              </a>
            )}
            <button onClick={() => onView(document)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-auto">
              <Eye className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(document)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(document.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const ITEMS_PER_PAGE = 9;

  // ─── Fetch Data ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, typesRes] = await Promise.all([
        studentService.getDocuments(),
        studentService.getDocumentTypes()
      ]);
      setDocuments(docsRes?.results || docsRes || []);
      setDocumentTypes(typesRes?.results || typesRes || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setToast({ message: 'Failed to load documents', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Stats ────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = documents?.length || 0;
    const approved = documents?.filter(d => d.status?.toLowerCase() === "approved" || d.status?.toLowerCase() === "uploaded").length || 0;
    const pending = documents?.filter(d => d.status?.toLowerCase() === "pending").length || 0;
    const rejected = documents?.filter(d => d.status?.toLowerCase() === "rejected").length || 0;
    return { total, approved, pending, rejected };
  }, [documents]);

  // ─── Filter & Sort ──────────────────────────────────────────────────

  const filteredDocs = useMemo(() => {
    if (!documents) return [];

    let filtered = documents.filter((doc) => {
      const docTypeName = getDocTypeName(doc);
      const status = doc.status?.toLowerCase() || "";
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesType = filterType === "all" || docTypeName === filterType;
      const matchesSearch = searchTerm === "" ||
        docTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getUploadedByName(doc).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return filtered;
  }, [documents, filterStatus, filterType, searchTerm]);

  // ─── Pagination ──────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ─── Type Options ────────────────────────────────────────────────────

  const typeOptions = useMemo(() => {
    const options = new Set();
    documents?.forEach((doc) => {
      const name = getDocTypeName(doc);
      if (name) options.add(name);
    });
    return Array.from(options);
  }, [documents]);

  // ─── CRUD Operations ────────────────────────────────────────────────

  const handleUpload = async (formData) => {
    setSubmitting(true);
    try {
      await studentService.uploadDocument(formData);
      setToast({ message: 'Document uploaded successfully!', type: 'success' });
      setShowUploadModal(false);
      await fetchData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to upload document', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    setSubmitting(true);
    try {
      await studentService.updateDocument(id, data);
      setToast({ message: 'Document updated successfully!', type: 'success' });
      setShowEditModal(false);
      setSelectedDocument(null);
      await fetchData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to update document', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return;
    setSubmitting(true);
    try {
      await studentService.deleteDocument(id);
      setToast({ message: 'Document deleted successfully!', type: 'success' });
      await fetchData();
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete document', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (doc) => {
    setSelectedDocument(doc);
    setShowDetailModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    setToast({ message: "Documents refreshed", type: "info" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterType("all");
    setCurrentPage(1);
  };

  // ─── Loading ─────────────────────────────────────────────────────────

  if (loading && !documents.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <PageHeader
          title="Documents"
          subtitle="Upload, view, and manage your documents"
          breadcrumbs={["Student", "Documents"]}
          bgColor="bg-blue-50"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white/80 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Document</span>
                <span className="sm:hidden">Upload</span>
              </button>
            </div>
          }
        />

        {/* ─── Spacing between PageHeader and Stats ──────────────────── */}
        <div className="mt-6" />

        {/* ─── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} icon={FileText} />
          <StatCard label="Approved" value={stats.approved} icon={ShieldCheck} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} />
          <StatCard label="Rejected" value={stats.rejected} icon={FileX} />
        </div>

        {/* ─── Filters ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters || filterStatus !== "all" || filterType !== "all"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filterStatus !== "all" || filterType !== "all") && (
                <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {(filterStatus !== "all" ? 1 : 0) + (filterType !== "all" ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['all', 'uploaded', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                          key={status}
                          onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                          className={`px-3 py-1 text-xs rounded-lg capitalize transition-colors ${
                            filterStatus === status
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {status === 'all' ? 'All' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => { setFilterType("all"); setCurrentPage(1); }}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          filterType === "all"
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        All
                      </button>
                      {typeOptions.map((type) => (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setCurrentPage(1); }}
                          className={`px-3 py-1 text-xs rounded-lg capitalize transition-colors ${
                            filterType === type
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {(searchTerm || filterStatus !== "all" || filterType !== "all") && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700">
                      Clear filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Results ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800">No documents found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Try adjusting your filters"
                : "Upload your first document"}
            </p>
            {(searchTerm || filterStatus !== "all" || filterType !== "all") && (
              <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onEdit={() => { setSelectedDocument(doc); setShowEditModal(true); }}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        )}

        {/* ─── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Footer ──────────────────────────────────────────────────── */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>© 2024 Smart School Management System • Documents Module</p>
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            onUpload={handleUpload}
            loading={submitting}
            documentTypes={documentTypes}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && selectedDocument && (
          <EditModal
            isOpen={showEditModal}
            document={selectedDocument}
            onClose={() => { setShowEditModal(false); setSelectedDocument(null); }}
            onUpdate={handleUpdate}
            loading={submitting}
            documentTypes={documentTypes}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetailModal && selectedDocument && (
          <DetailModal
            isOpen={showDetailModal}
            document={selectedDocument}
            onClose={() => { setShowDetailModal(false); setSelectedDocument(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Edit Modal ────────────────────────────────────────────────────────

const EditModal = ({ isOpen, document, onClose, onUpdate, loading, documentTypes }) => {
  const [formData, setFormData] = useState({ doc_type: "", description: "" });

  useEffect(() => {
    if (document && isOpen) {
      const docTypeId = typeof document.doc_type === 'object' ? document.doc_type.id : document.doc_type;
      setFormData({
        doc_type: docTypeId || "",
        description: document.description || "",
      });
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Edit Document</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onUpdate(document.id, formData); }} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Document Type *</label>
            <select
              value={formData.doc_type}
              onChange={(e) => setFormData(prev => ({ ...prev, doc_type: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select type...</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              placeholder="Document description..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Detail Modal ──────────────────────────────────────────────────────

const DetailModal = ({ isOpen, document, onClose }) => {
  if (!isOpen || !document) return null;

  const docTypeName = getDocTypeName(document);
  const uploadedByName = getUploadedByName(document);
  const fileIcon = getFileIcon(docTypeName);
  const FileIcon = fileIcon.icon;
  const statusConfig = getStatusConfig(document.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Document Details</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <XIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileIcon className={`h-6 w-6 ${fileIcon.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{docTypeName}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Uploaded By</p>
              <p className="text-sm font-medium text-gray-800 truncate">{uploadedByName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-800">{formatDate(document.created_at)}</p>
            </div>
          </div>

          {document.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-700">{document.description}</p>
            </div>
          )}

          {document.file && (
            <a
              href={document.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Document
            </a>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Documents;