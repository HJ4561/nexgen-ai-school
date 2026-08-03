// src/modules/admin/pages/Documents/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, X, RefreshCw, AlertCircle, CheckCircle, 
  Edit, Trash2, Eye, Search, Filter, ChevronDown,
  FileText, File, Download, Upload, User, Calendar,
  FolderOpen, FileCheck, FileWarning, Link, Copy,
  ExternalLink, Clock, Hash, Tag, FolderTree,
  Grid3x3, List, FileSpreadsheet, FileImage, FileArchive
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// ─── API Endpoints ──────────────────────────────────────────────────────
const DOCUMENTS_API = "/documents/documents/";
const DOCUMENT_TYPES_API = "/documents/document-types/";
const USERS_API = "/users/users/";

// ─── Helper Functions ──────────────────────────────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ⭐ ADD THIS FUNCTION - it was missing
const getFileIcon = (filename) => {
  if (!filename) return FILE_ICONS.default;
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
};

const TYPE_ICONS = {
  certificate: <FileCheck className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
  application: <File className="w-4 h-4" />,
  id: <FileCheck className="w-4 h-4" />,
  transcript: <FileSpreadsheet className="w-4 h-4" />,
  photo: <FileImage className="w-4 h-4" />,
  archive: <FileArchive className="w-4 h-4" />,
  default: <FileText className="w-4 h-4" />,
};

const TYPE_COLORS = {
  certificate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  report: "bg-blue-50 text-blue-700 border-blue-200",
  application: "bg-amber-50 text-amber-700 border-amber-200",
  id: "bg-purple-50 text-purple-700 border-purple-200",
  transcript: "bg-indigo-50 text-indigo-700 border-indigo-200",
  photo: "bg-pink-50 text-pink-700 border-pink-200",
  archive: "bg-gray-50 text-gray-700 border-gray-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

const FILE_ICONS = {
  pdf: <FileCheck className="w-4 h-4" />,
  doc: <FileText className="w-4 h-4" />,
  docx: <FileText className="w-4 h-4" />,
  xls: <FileText className="w-4 h-4" />,
  xlsx: <FileText className="w-4 h-4" />,
  ppt: <FileText className="w-4 h-4" />,
  pptx: <FileText className="w-4 h-4" />,
  jpg: <FileImage className="w-4 h-4" />,
  jpeg: <FileImage className="w-4 h-4" />,
  png: <FileImage className="w-4 h-4" />,
  default: <File className="w-4 h-4" />,
};

// ─── Document Type Modal ──────────────────────────────────────────────
const DocumentTypeModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            {mode === "add" ? "Add Document Type" : "Edit Document Type"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Type Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="e.g., Certificate, Report, ID"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Icon</label>
            <select
              value={formData.icon || "default"}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="certificate">Certificate</option>
              <option value="report">Report</option>
              <option value="application">Application</option>
              <option value="id">ID</option>
              <option value="transcript">Transcript</option>
              <option value="photo">Photo</option>
              <option value="archive">Archive</option>
              <option value="default">Default</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.name} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {mode === "add" ? "Add Type" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Document Upload Modal ─────────────────────────────────────────────
const DocumentUploadModal = ({ isOpen, onClose, formData, setFormData, onSave, loading, documentTypes, users, filePreview }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Document
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">User <span className="text-red-500">*</span></label>
            <select
              value={formData.user || ""}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select user...</option>
              {users.map(user => <option key={user.id} value={user.id}>{user.name || user.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Document Type <span className="text-red-500">*</span></label>
            <select
              value={formData.doc_type || ""}
              onChange={(e) => setFormData({ ...formData, doc_type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select type...</option>
              {documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">File <span className="text-red-500">*</span></label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData({ ...formData, file });
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, filePreview: reader.result }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            {filePreview && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 truncate">{formData.file?.name || "File selected"}</span>
                  <button onClick={() => { setFormData({ ...formData, file: null, filePreview: null }); }} className="ml-auto text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="Enter document title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Enter description..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={loading || !formData.user || !formData.doc_type || !formData.file} className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Document Details Modal ────────────────────────────────────────────
const DocumentDetailsModal = ({ isOpen, onClose, document, getTypeName, getUserName, formatDateTime }) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Document Details
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500">Title</p><p className="font-medium text-gray-800 mt-1">{document.title || document.file || "—"}</p></div>
            <div><p className="text-xs text-gray-500">Type</p><p className="font-medium text-gray-800 mt-1">{getTypeName(document.doc_type)}</p></div>
            <div><p className="text-xs text-gray-500">User</p><p className="font-medium text-gray-800 mt-1">{getUserName(document.user)}</p></div>
            <div><p className="text-xs text-gray-500">Uploaded By</p><p className="font-medium text-gray-800 mt-1">{getUserName(document.uploaded_by)}</p></div>
            <div><p className="text-xs text-gray-500">Uploaded</p><p className="font-medium text-gray-800 mt-1">{formatDateTime(document.created_at)}</p></div>
            <div><p className="text-xs text-gray-500">File</p><p className="font-medium text-gray-800 mt-1 text-xs truncate">{document.file || "—"}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-gray-600 mt-1">{document.description || "—"}</p></div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────
const Documents = () => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState("add");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [typeFormData, setTypeFormData] = useState({
    name: "",
    description: "",
    icon: "default",
  });
  const [docFormData, setDocFormData] = useState({
    user: "",
    doc_type: "",
    file: null,
    title: "",
    description: "",
    filePreview: null,
  });
  const itemsPerPage = 10;

  // ─── Toast Helper ──────────────────────────────────────────────────────
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Fetch Data ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [docsRes, typesRes, usersRes] = await Promise.all([
        api.get(DOCUMENTS_API),
        api.get(DOCUMENT_TYPES_API),
        api.get(USERS_API),
      ]);
      setDocuments(docsRes.data?.results || docsRes.data || []);
      setDocumentTypes(typesRes.data?.results || typesRes.data || []);
      setUsers(usersRes.data?.results || usersRes.data || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Documents endpoint not found.");
      } else {
        setError(error.response?.data?.detail || "Failed to load documents");
      }
      setDocuments([]);
      setDocumentTypes([]);
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    showToast("Data refreshed", "success");
  };

  // ─── Helper Functions ─────────────────────────────────────────────────
  const getTypeName = (typeId) => {
    if (!typeId) return "—";
    const type = documentTypes.find(t => t.id === typeId);
    return type?.name || "—";
  };

  const getUserName = (userId) => {
    if (!userId) return "—";
    const user = users.find(u => u.id === userId);
    return user?.name || user?.full_name || "—";
  };

  const getDocumentCount = (typeId) => {
    if (!typeId) return 0;
    return documents.filter(doc => doc.doc_type === typeId).length;
  };

  // ─── Filter Logic ─────────────────────────────────────────────────────
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (filterType !== "all" && doc.doc_type !== Number(filterType)) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (doc.title?.toLowerCase() || "").includes(search) ||
             (doc.description?.toLowerCase() || "").includes(search) ||
             getTypeName(doc.doc_type).toLowerCase().includes(search) ||
             getUserName(doc.user).toLowerCase().includes(search);
    });
  }, [documents, searchTerm, filterType]);

  const filteredTypes = useMemo(() => {
    return documentTypes.filter(type => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (type.name?.toLowerCase() || "").includes(search) ||
             (type.description?.toLowerCase() || "").includes(search);
    });
  }, [documentTypes, searchTerm]);

  const docTotalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const docStartIndex = (currentPage - 1) * itemsPerPage;
  const docPageItems = filteredDocuments.slice(docStartIndex, docStartIndex + itemsPerPage);

  const typeTotalPages = Math.max(1, Math.ceil(filteredTypes.length / itemsPerPage));
  const typeStartIndex = (currentPage - 1) * itemsPerPage;
  const typePageItems = filteredTypes.slice(typeStartIndex, typeStartIndex + itemsPerPage);

  // ─── Stats ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = documents.length;
    const byType = {};
    documents.forEach(doc => {
      const typeName = getTypeName(doc.doc_type);
      byType[typeName] = (byType[typeName] || 0) + 1;
    });
    const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];
    return { total, topType, typesCount: Object.keys(byType).length };
  }, [documents]);

  const typeStats = useMemo(() => {
    const total = documentTypes.length;
    const totalDocs = documents.length;
    const typesWithDocs = documentTypes.filter(t => getDocumentCount(t.id) > 0).length;
    return { total, totalDocs, typesWithDocs };
  }, [documentTypes, documents]);

  // ─── CRUD Operations ────────────────────────────────────────────────────
  
  // Document Types
  const handleSaveType = async () => {
    if (!typeFormData.name) {
      showToast("Please enter a document type name", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: typeFormData.name,
        description: typeFormData.description || "",
        icon: typeFormData.icon || "default",
      };

      if (typeModalMode === "edit" && selectedType) {
        const response = await api.patch(`${DOCUMENT_TYPES_API}${selectedType.id}/`, payload);
        setDocumentTypes(documentTypes.map(t => t.id === selectedType.id ? { ...t, ...response.data } : t));
        showToast("Document type updated successfully", "success");
      } else {
        const response = await api.post(DOCUMENT_TYPES_API, payload);
        setDocumentTypes([response.data, ...documentTypes]);
        showToast("Document type added successfully", "success");
      }
      setTypeModalOpen(false);
      setTypeFormData({ name: "", description: "", icon: "default" });
      setSelectedType(null);
    } catch (error) {
      console.error("Failed to save document type:", error);
      showToast(error.response?.data?.detail || "Failed to save document type", "error");
    } finally {
      setSaving(false);
    }
  };

  // Documents Upload
  const handleUploadDocument = async () => {
    if (!docFormData.user || !docFormData.doc_type || !docFormData.file) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("user", docFormData.user);
      formDataObj.append("doc_type", docFormData.doc_type);
      formDataObj.append("file", docFormData.file);
      if (docFormData.title) formDataObj.append("title", docFormData.title);
      if (docFormData.description) formDataObj.append("description", docFormData.description);

      const response = await api.post(DOCUMENTS_API, formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocuments([response.data, ...documents]);
      showToast("Document uploaded successfully", "success");
      setDocModalOpen(false);
      setDocFormData({ user: "", doc_type: "", file: null, title: "", description: "", filePreview: null });
    } catch (error) {
      console.error("Failed to upload document:", error);
      showToast(error.response?.data?.detail || "Failed to upload document", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      if (activeTab === "documents") {
        await api.delete(`${DOCUMENTS_API}${deletingItem.id}/`);
        setDocuments(prev => prev.filter(item => item.id !== deletingItem.id));
      } else {
        await api.delete(`${DOCUMENT_TYPES_API}${deletingItem.id}/`);
        setDocumentTypes(prev => prev.filter(item => item.id !== deletingItem.id));
      }
      showToast(`${activeTab === "documents" ? "Document" : "Document type"} deleted`, "success");
      setDeletingItem(null);
    } catch (error) {
      console.error("Failed to delete:", error);
      showToast(error.response?.data?.detail || "Failed to delete", "error");
    } finally {
      setSaving(false);
    }
  };

  // Download
  // ─── Download Function - Updated ──────────────────────────────────────
const handleDownload = async (doc) => {
  try {
    // If the document has a file URL, open it directly
    if (doc.file) {
      // Check if it's a full URL or a relative path
      const fileUrl = doc.file.startsWith('http') 
        ? doc.file 
        : `${process.env.REACT_APP_API_URL || ''}${doc.file}`;
      
      // Open in new tab or trigger download
      window.open(fileUrl, '_blank');
      showToast("Download started", "success");
    } else {
      showToast("No file available for download", "error");
    }
  } catch (error) {
    console.error("Failed to download:", error);
    showToast("Failed to download document", "error");
  }
};

  // ─── Clear Filters ─────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
  };

  // ─── Tabs ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: "documents", label: "Documents", icon: <FileText className="w-4 h-4" />, count: documents.length },
    { id: "types", label: "Document Types", icon: <FolderOpen className="w-4 h-4" />, count: documentTypes.length },
  ];

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8">
          <PageHeader title="Documents" subtitle="Manage documents and document types" breadcrumbs={["Admin", "Documents"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading documents...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <FadeIn>
      <div className="space-y-8">
        <PageHeader 
          title="Documents Management" 
          subtitle={`Manage documents and document types${documents.length > 0 ? ` — ${documents.length} documents` : ""}`}
          breadcrumbs={["Admin", "Documents"]}
          action={
            <div className="flex items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <div className="w-px h-6 bg-gray-200" />
              {activeTab === "documents" ? (
                <button onClick={() => { setDocFormData({ user: "", doc_type: "", file: null, title: "", description: "", filePreview: null }); setDocModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                  <Upload className="w-4 h-4" /> Upload Document
                </button>
              ) : (
                <button onClick={() => { setTypeModalMode("add"); setTypeFormData({ name: "", description: "", icon: "default" }); setTypeModalOpen(true); }} className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200">
                  <Plus className="w-4 h-4" /> Add Type
                </button>
              )}
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading data</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        {activeTab === "documents" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Documents</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-xs text-gray-400 mt-1">All documents</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Types Used</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.typesCount}</p>
              <p className="text-xs text-gray-400 mt-1">Active types</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-purple-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Type</p>
              <p className="text-2xl font-bold text-purple-600">{stats.topType || "N/A"}</p>
              <p className="text-xs text-gray-400 mt-1">Most used</p>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Types</p>
              <p className="text-2xl font-bold text-gray-800">{typeStats.total}</p>
              <p className="text-xs text-gray-400 mt-1">Document categories</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</p>
              <p className="text-2xl font-bold text-emerald-600">{typeStats.totalDocs}</p>
              <p className="text-xs text-gray-400 mt-1">Total documents</p>
            </Card>
            <Card className="p-4 border-l-4 border-l-purple-500">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Types</p>
              <p className="text-2xl font-bold text-purple-600">{typeStats.typesWithDocs}</p>
              <p className="text-xs text-gray-400 mt-1">Types with documents</p>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(""); }}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    isActive 
                      ? "border-blue-600 text-blue-600" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <Badge className={isActive ? "bg-blue-100 text-blue-600 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Card */}
        <Card className="p-0 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/60">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === "documents" ? "Search by title, type, or user..." : "Search by name or description..."}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              {activeTab === "documents" && (
                <select
                  value={filterType}
                  onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                >
                  <option value="all">All Types</option>
                  {documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </select>
              )}
              {(searchTerm || filterType !== "all") && (
                <button onClick={clearFilters} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "documents" ? (
              // Documents Table
              docPageItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><FileText className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Documents Found</p><p className="text-sm text-gray-400 mt-1">Upload a document to get started.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / File</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {docPageItems.map((doc) => (
                      <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                              {getFileIcon(doc.file)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{doc.title || doc.file || "—"}</p>
                              {doc.file && <p className="text-xs text-gray-400 truncate max-w-xs">{doc.file}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5"><Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">{getTypeName(doc.doc_type)}</Badge></td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{getUserName(doc.user)}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(doc.created_at)}</td>
                        <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedDocument(doc); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View details"><Eye className="w-4 h-4" /></button>
<button 
  onClick={() => handleDownload(doc)} 
  className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" 
  title="Download"
>
  <Download className="w-4 h-4" />
</button>
                            <button onClick={() => setDeletingItem(doc)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              // Document Types Table
              typePageItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center"><FolderOpen className="w-10 h-10 text-gray-400" /></div>
                    <div><p className="text-gray-500 font-medium text-lg">No Document Types Found</p><p className="text-sm text-gray-400 mt-1">Add a document type to categorize your documents.</p></div>
                  </div>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {typePageItems.map((type) => {
                      const docCount = getDocumentCount(type.id);
                      const Icon = TYPE_ICONS[type.icon] || TYPE_ICONS.default;
                      const colorClass = TYPE_COLORS[type.icon] || TYPE_COLORS.default;
                      return (
                        <tr key={type.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                                {Icon}
                              </div>
                              <span className="font-medium text-gray-900">{type.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-xs">{type.description || "—"}</td>
                          <td className="px-4 py-3.5">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex items-center gap-1">
                              <FileText className="w-3 h-3" /> {docCount}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{formatDate(type.created_at)}</td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedType(type); setTypeModalMode("edit"); setTypeFormData({ name: type.name || "", description: type.description || "", icon: type.icon || "default" }); setTypeModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => setDeletingItem(type)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>

          {(activeTab === "documents" ? documents.length : documentTypes.length) > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={activeTab === "documents" ? docTotalPages : typeTotalPages}
              startIndex={activeTab === "documents" ? docStartIndex : typeStartIndex}
              itemsShown={activeTab === "documents" ? docPageItems.length : typePageItems.length}
              totalItems={activeTab === "documents" ? filteredDocuments.length : filteredTypes.length}
              onPageChange={setCurrentPage}
            />
          )}
        </Card>
      </div>

      {/* Document Type Modal */}
      <DocumentTypeModal
        isOpen={typeModalOpen}
        onClose={() => { setTypeModalOpen(false); setSelectedType(null); }}
        mode={typeModalMode}
        formData={typeFormData}
        setFormData={setTypeFormData}
        onSave={handleSaveType}
        loading={saving}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={docModalOpen}
        onClose={() => { setDocModalOpen(false); setDocFormData({ user: "", doc_type: "", file: null, title: "", description: "", filePreview: null }); }}
        formData={docFormData}
        setFormData={setDocFormData}
        onSave={handleUploadDocument}
        loading={saving}
        documentTypes={documentTypes}
        users={users}
        filePreview={docFormData.filePreview}
      />

      {/* Document Details Modal */}
      <DocumentDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedDocument(null); }}
        document={selectedDocument}
        getTypeName={getTypeName}
        getUserName={getUserName}
        formatDateTime={formatDateTime}
      />

      {/* Delete Confirmation */}
      {deletingItem && (
        <ConfirmDialog
          open={true}
          title={activeTab === "documents" ? "Delete Document" : "Delete Document Type"}
          message={
            activeTab === "documents" 
              ? `Are you sure you want to delete "${deletingItem.title || deletingItem.file}"? This action cannot be undone.`
              : `Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`
          }
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
          loading={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300 flex items-center gap-2`}>
          {toast.type === "success" && <CheckCircle className="w-4 h-4" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}
    </FadeIn>
  );
};

export default Documents;