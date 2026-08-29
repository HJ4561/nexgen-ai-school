// src/modules/admin/pages/Library.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, Plus, Edit, Trash2, Book, Library as LibraryIcon,
  User, Calendar, X, RefreshCw, AlertCircle, Eye,
  FileText, Filter, ChevronDown, Download, Printer,
  CheckCircle, XCircle, Clock, Users, Hash, Tag,
  History, ArrowLeft, ArrowRight, RotateCcw,
  BookOpen, BookMarked, BookCopy
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { FadeIn } from "@/components/admin/animations/index.jsx";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import api from "@/services/api";

// --- API Endpoints ------------------------------------------------------
const BOOKS_API = "/library/books/";
const BOOK_ISSUES_API = "/library/book-issues/";
const BOOK_ISSUE_HISTORY_API = "/library/book-issue-history/";

// --- Helper Functions --------------------------------------------------
const formatDate = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Ã¢â‚¬â€";
  return new Date(dateString).toLocaleString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ISSUE_STATUS = {
  issued: { label: "Issued", color: "bg-blue-50 text-blue-700 border-blue-200" },
  returned: { label: "Returned", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  overdue: { label: "Overdue", color: "bg-red-50 text-red-700 border-red-200" },
  lost: { label: "Lost", color: "bg-gray-50 text-gray-700 border-gray-200" },
};

const STATUS_COLORS = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  issued: "bg-blue-50 text-blue-700 border-blue-200",
  returned: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-gray-50 text-gray-700 border-gray-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
  available: "Available",
  issued: "Issued",
  returned: "Returned",
  lost: "Lost",
  overdue: "Overdue",
};

// --- Book Modal ---------------------------------------------------------
const BookModal = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-600" />
            {mode === "add" ? "Add New Book" : "Edit Book"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter book title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Author <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter author name" value={formData.author || ""} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
            <input type="text" placeholder="Enter category" value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">ISBN</label>
            <input type="text" placeholder="Enter ISBN" value={formData.isbn || ""} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Total Copies <span className="text-red-500">*</span></label>
              <input type="number" placeholder="0" min="0" value={formData.total_copies || ""} onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Available Copies</label>
              <input type="number" placeholder="0" min="0" value={formData.available_copies || ""} onChange={(e) => setFormData({ ...formData, available_copies: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea rows={2} placeholder="Enter book description..." value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" onClick={onSave} disabled={loading || !formData.title || !formData.author || !formData.total_copies} className="flex items-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Book className="w-4 h-4" />}
            {mode === "add" ? "Add Book" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Issue Book Modal --------------------------------------------------
const IssueBookModal = ({ isOpen, onClose, book, formData, setFormData, onIssue, loading }) => {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Book className="w-5 h-5 text-amber-600" />Issue Book - {book.title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Student ID <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Enter student ID" value={formData.student || ""} onChange={(e) => setFormData({ ...formData, student: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Due Date <span className="text-red-500">*</span></label>
            <input type="date" value={formData.due_date || ""} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={onIssue} disabled={loading || !formData.student || !formData.due_date} className="flex-1 flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Issue Book
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ----------------------------------------------------
const Library = () => {
  // --- State --------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [bookIssues, setBookIssues] = useState([]);
  const [bookHistory, setBookHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBook, setFilterBook] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookModalMode, setBookModalMode] = useState("add");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: "", author: "", category: "", isbn: "", total_copies: "", available_copies: "", description: ""
  });
  const [issueFormData, setIssueFormData] = useState({ student: "", due_date: "" });
  const itemsPerPage = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // --- Fetch Data ------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksRes, issuesRes, historyRes] = await Promise.all([
        api.get(BOOKS_API),
        api.get(BOOK_ISSUES_API),
        api.get(BOOK_ISSUE_HISTORY_API),
      ]);
      setBooks(booksRes.data?.results || booksRes.data || []);
      setBookIssues(issuesRes.data?.results || issuesRes.data || []);
      setBookHistory(historyRes.data?.results || historyRes.data || []);
    } catch (error) {
      console.error("Failed to fetch library data:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (error.response?.status === 404) {
        setError("Library endpoint not found.");
      } else {
        setError(error.response?.data?.detail || "Failed to load library data");
      }
      setBooks([]);
      setBookIssues([]);
      setBookHistory([]);
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
    showToast("Library data refreshed", "success");
  };

  // --- Helper Functions -------------------------------------------------
  const getBookIssueCount = useCallback((bookId) => {
    if (!bookId) return 0;
    return bookIssues.filter(issue => issue.book === bookId && issue.status === "issued").length;
  }, [bookIssues]);

  const getAvailableCopies = useCallback((book) => {
    if (!book) return 0;
    const issuedCount = getBookIssueCount(book.id);
    const total = book.total_copies || 0;
    return Math.max(0, total - issuedCount);
  }, [getBookIssueCount]);

  const getCategoryName = (category) => {
    if (!category) return "Ã¢â‚¬â€";
    if (typeof category === 'string') return category;
    return category.name || category.title || "Ã¢â‚¬â€";
  };

  const getBookTitle = (bookId) => {
    if (!bookId) return "Ã¢â‚¬â€";
    const book = books.find(b => b.id === bookId);
    return book?.title || "Ã¢â‚¬â€";
  };

  const isOverdue = (issue) => {
    if (issue.status === "returned") return false;
    const dueDate = new Date(issue.due_date);
    return dueDate < new Date();
  };

  const getIssueStatus = (issue) => {
    if (issue.status === "returned") return ISSUE_STATUS.returned;
    if (isOverdue(issue)) return ISSUE_STATUS.overdue;
    if (issue.status === "lost") return ISSUE_STATUS.lost;
    return ISSUE_STATUS.issued;
  };

  // --- Filter Logic -----------------------------------------------------
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (book.title?.toLowerCase() || "").includes(search) ||
             (book.author?.toLowerCase() || "").includes(search) ||
             (book.category?.name?.toLowerCase() || "").includes(search) ||
             (book.isbn?.toLowerCase() || "").includes(search);
    });
  }, [books, searchTerm]);

  const filteredIssues = useMemo(() => {
    return bookIssues.filter(issue => {
      if (filterStatus !== "all") {
        if (filterStatus === "overdue" && !isOverdue(issue)) return false;
        if (filterStatus === "issued" && issue.status !== "issued") return false;
        if (filterStatus === "returned" && issue.status !== "returned") return false;
        if (filterStatus === "lost" && issue.status !== "lost") return false;
      }
      if (filterBook !== "all" && issue.book !== Number(filterBook)) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return getBookTitle(issue.book).toLowerCase().includes(search) ||
             (issue.student || "").toLowerCase().includes(search);
    });
  }, [bookIssues, searchTerm, filterStatus, filterBook]);

  const filteredHistory = useMemo(() => {
    return bookHistory.filter(record => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (record.reason || "").toLowerCase().includes(search) ||
             (record.changed_by || "").toLowerCase().includes(search);
    });
  }, [bookHistory, searchTerm]);

  const getCurrentItems = () => {
    if (activeTab === "books") return filteredBooks;
    if (activeTab === "issues") return filteredIssues;
    return filteredHistory;
  };

  const currentItems = getCurrentItems();
  const totalPages = Math.max(1, Math.ceil(currentItems.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  // --- Stats -------------------------------------------------------------
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const totalIssues = bookIssues.filter(i => i.status === "issued").length;
    const totalCopies = books.reduce((sum, b) => sum + (b.total_copies || 0), 0);
    const availableCopies = books.reduce((sum, b) => sum + getAvailableCopies(b), 0);
    const overdueIssues = bookIssues.filter(i => {
      if (i.status !== "issued") return false;
      const dueDate = new Date(i.due_date);
      return dueDate < new Date();
    }).length;
    const totalHistory = bookHistory.length;
    return { totalBooks, totalIssues, totalCopies, availableCopies, overdueIssues, totalHistory };
  }, [books, bookIssues, bookHistory, getAvailableCopies]);

  // --- CRUD Operations ----------------------------------------------------
  const handleSaveBook = async () => {
    if (!bookFormData.title || !bookFormData.author || !bookFormData.total_copies) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: bookFormData.title,
        author: bookFormData.author,
        category: bookFormData.category || "",
        isbn: bookFormData.isbn || "",
        total_copies: Number(bookFormData.total_copies),
        available_copies: Number(bookFormData.available_copies) || Number(bookFormData.total_copies),
        description: bookFormData.description || "",
      };
      if (bookModalMode === "edit" && selectedBook) {
        const response = await api.patch(`${BOOKS_API}${selectedBook.id}/`, payload);
        setBooks(books.map(b => b.id === selectedBook.id ? { ...b, ...response.data } : b));
        showToast("Book updated", "success");
      } else {
        const response = await api.post(BOOKS_API, payload);
        setBooks([response.data, ...books]);
        showToast("Book added", "success");
      }
      setBookModalOpen(false);
      setBookFormData({ title: "", author: "", category: "", isbn: "", total_copies: "", available_copies: "", description: "" });
      setSelectedBook(null);
    } catch (error) { showToast(error.response?.data?.detail || "Failed to save", "error"); }
    finally { setSaving(false); }
  };

  const handleIssueBook = async () => {
    if (!issueFormData.student || !issueFormData.due_date) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        book: selectedBook.id,
        student: issueFormData.student,
        due_date: issueFormData.due_date,
        status: "issued",
      };
      const response = await api.post(BOOK_ISSUES_API, payload);
      setBookIssues([response.data, ...bookIssues]);
      showToast("Book issued", "success");
      setIssueModalOpen(false);
      setIssueFormData({ student: "", due_date: "" });
      await fetchData();
    } catch (error) { showToast(error.response?.data?.detail || "Failed to issue", "error"); }
    finally { setSaving(false); }
  };

  const handleReturnBook = async (issueId) => {
    setSaving(true);
    try {
      await api.patch(`${BOOK_ISSUES_API}${issueId}/`, { status: "returned", return_date: new Date().toISOString() });
      setBookIssues(bookIssues.map(i => i.id === issueId ? { ...i, status: "returned", return_date: new Date().toISOString() } : i));
      showToast("Book returned", "success");
      await fetchData();
    } catch (error) { showToast(error.response?.data?.detail || "Failed to return", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      if (activeTab === "books") {
        await api.delete(`${BOOKS_API}${deletingItem.id}/`);
        setBooks(prev => prev.filter(item => item.id !== deletingItem.id));
      } else if (activeTab === "issues") {
        await api.delete(`${BOOK_ISSUES_API}${deletingItem.id}/`);
        setBookIssues(prev => prev.filter(item => item.id !== deletingItem.id));
      }
      showToast(`${activeTab === "books" ? "Book" : "Book issue"} deleted`, "success");
      setDeletingItem(null);
    } catch (error) { showToast(error.response?.data?.detail || "Failed to delete", "error"); }
    finally { setSaving(false); }
  };

  const handleExportBooks = () => {
    if (filteredBooks.length === 0) { showToast("No books to export", "error"); return; }
    const headers = ["Title", "Author", "Category", "ISBN", "Total Copies", "Available", "Issued"];
    const rows = filteredBooks.map(book => [
      book.title || "", book.author || "", book.category?.name || book.category || "",
      book.isbn || "", book.total_copies || 0, getAvailableCopies(book), getBookIssueCount(book.id),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `books_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`${filteredBooks.length} books exported`, "success");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterBook("all");
  };

  // --- Tabs -------------------------------------------------------------
  const tabs = [
    { id: "books", label: "Books", icon: <Book className="w-4 h-4" />, count: books.length },
    { id: "issues", label: "Book Issues", icon: <BookMarked className="w-4 h-4" />, count: bookIssues.length },
    { id: "history", label: "History", icon: <History className="w-4 h-4" />, count: bookHistory.length },
  ];

  if (loading) {
    return (
      <FadeIn>
        <div className="space-y-8 px-4 sm:px-6 lg:px-8">
          <PageHeader title="Library Management" subtitle="Manage books, issues, and history" breadcrumbs={["Admin", "Library"]} />
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="mt-6 text-sm text-gray-500 font-medium">Loading library data...</p>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-8 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Library Management" 
          subtitle={`Manage books, issues, and history${books.length > 0 ? ` Ã¢â‚¬â€ ${books.length} books` : ""}`}
          breadcrumbs={["Admin", "Library"]}
          action={
            <div className="flex flex-wrap items-center gap-2.5">
              <button onClick={handleRefresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              {activeTab === "books" && (
                <>
                  <button onClick={handleExportBooks} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    <Download className="w-4 h-4" /> Export
                  </button>
                  <div className="w-px h-6 bg-gray-200" />
                </>
              )}
              <button
                onClick={() => {
                  if (activeTab === "books") {
                    setBookModalMode("add");
                    setBookFormData({ title: "", author: "", category: "", isbn: "", total_copies: "", available_copies: "", description: "" });
                    setBookModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/25 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                {activeTab === "books" ? "Add Book" : "No Action"}
              </button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-medium">Error loading library</p><p className="text-amber-600">{error}</p></div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Books</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalBooks}</p>
            <p className="text-xs text-gray-400 mt-1">In library</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.availableCopies}</p>
            <p className="text-xs text-gray-400 mt-1">Copies available</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</p>
            <p className="text-2xl font-bold text-amber-600">{stats.totalIssues}</p>
            <p className="text-xs text-gray-400 mt-1">Currently issued</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Copies</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalCopies}</p>
            <p className="text-xs text-gray-400 mt-1">All copies</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-red-500">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdueIssues}</p>
            <p className="text-xs text-gray-400 mt-1">Overdue books</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex gap-1 min-w-max" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setSearchTerm(""); setFilterStatus("all"); setFilterBook("all"); }}
                  className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                    isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.icon} {tab.label}
                  <Badge className={isActive ? "bg-blue-100 text-blue-600 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>{tab.count}</Badge>
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
                  placeholder={
                    activeTab === "books" ? "Search by title, author, category, or ISBN..." :
                    activeTab === "issues" ? "Search by book or student..." :
                    "Search by reason or changed by..."
                  }
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              {activeTab === "issues" && (
                <>
                  <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                    <option value="all">All Status</option>
                    <option value="issued">Issued</option>
                    <option value="overdue">Overdue</option>
                    <option value="returned">Returned</option>
                    <option value="lost">Lost</option>
                  </select>
                  <select value={filterBook} onChange={(e) => { setFilterBook(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm">
                    <option value="all">All Books</option>
                    {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
                  </select>
                </>
              )}
              <button onClick={clearFilters} className="px-4 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {pageItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    {activeTab === "books" ? <Book className="w-10 h-10 text-gray-400" /> :
                     activeTab === "issues" ? <BookMarked className="w-10 h-10 text-gray-400" /> :
                     <History className="w-10 h-10 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium text-lg">
                      No {activeTab === "books" ? "Books" : activeTab === "issues" ? "Book Issues" : "History"} Found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchTerm ? "Try adjusting your search terms" :
                       activeTab === "books" ? "Add a book to get started" :
                       activeTab === "issues" ? "No books issued yet" :
                       "History will appear here once books are issued and returned"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {activeTab === "books" && (
                      <>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ISBN</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                    {activeTab === "issues" && (
                      <>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                    {activeTab === "history" && (
                      <>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Change</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Changed By</th>
                        <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="text-right px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageItems.map((item) => {
                    if (activeTab === "books") {
                      const available = getAvailableCopies(item);
                      const isLowStock = available <= 2 && available > 0;
                      const isOutOfStock = available === 0;
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Book className="w-4 h-4 text-amber-600" /></div>
                              <span className="font-medium text-gray-900">{item.title || "Ã¢â‚¬â€"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-700">{item.author || "Ã¢â‚¬â€"}</td>
                          <td className="px-4 py-3.5"><Badge className="bg-purple-50 text-purple-700 border-purple-200">{getCategoryName(item.category)}</Badge></td>
                          <td className="px-4 py-3.5 text-gray-700 font-mono text-xs">{item.isbn || "Ã¢â‚¬â€"}</td>
                          <td className="px-4 py-3.5"><Badge className={isOutOfStock ? 'bg-red-50 text-red-700 border-red-200' : isLowStock ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}>{available}</Badge></td>
                          <td className="px-4 py-3.5 text-gray-700">{item.total_copies || 0}</td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedBook(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View"><Eye className="w-4 h-4" /></button>
                              {available > 0 && <button onClick={() => { setSelectedBook(item); setIssueModalOpen(true); }} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" title="Issue"><User className="w-4 h-4" /></button>}
                              <button onClick={() => { setBookModalMode("edit"); setSelectedBook(item); setBookFormData({ title: item.title || "", author: item.author || "", category: item.category?.name || item.category || "", isbn: item.isbn || "", total_copies: item.total_copies || "", available_copies: item.available_copies || "", description: item.description || "" }); setBookModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (activeTab === "issues") {
                      const status = getIssueStatus(item);
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><Book className="w-4 h-4 text-amber-600" /></div>
                              <span className="font-medium text-gray-900">{getBookTitle(item.book)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{item.student || "Ã¢â‚¬â€"}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span className={`text-sm ${isOverdue(item) && item.status !== "returned" ? "text-red-600 font-medium" : "text-gray-600"}`}>{formatDate(item.due_date)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><Badge className={`${status.color} text-xs`}>{status.label}</Badge></td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              {item.status === "issued" && <button onClick={() => handleReturnBook(item.id)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-all" title="Return"><RotateCcw className="w-4 h-4" /></button>}
                              <button onClick={() => { setSelectedIssue(item); setDetailsModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => setDeletingItem(item)} className="p-2 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      // History tab
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                          <td className="px-4 py-3.5 font-medium text-gray-900">{item.book?.title || getBookTitle(item.book_issue) || "Ã¢â‚¬â€"}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{item.student?.name || "Ã¢â‚¬â€"}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-xs">{STATUS_LABELS[item.status_old] || item.status_old || "Ã¢â‚¬â€"}</Badge>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <Badge className={`${STATUS_COLORS[item.status_new] || "bg-gray-50 text-gray-700 border-gray-200"} text-xs`}>{STATUS_LABELS[item.status_new] || item.status_new || "Ã¢â‚¬â€"}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{item.changed_by || "System"}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{formatDateTime(item.created_at)}</td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => { setSelectedHistory(item); setHistoryModalOpen(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" title="View"><Eye className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            )}
          </div>

          {currentItems.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} startIndex={startIndex} itemsShown={pageItems.length} totalItems={currentItems.length} onPageChange={setCurrentPage} />
          )}
        </Card>
      </div>

      {/* Book Modal */}
      <BookModal isOpen={bookModalOpen} onClose={() => { setBookModalOpen(false); setSelectedBook(null); }} mode={bookModalMode} formData={bookFormData} setFormData={setBookFormData} onSave={handleSaveBook} loading={saving} />

      {/* Issue Book Modal */}
      <IssueBookModal isOpen={issueModalOpen} onClose={() => { setIssueModalOpen(false); setSelectedBook(null); setIssueFormData({ student: "", due_date: "" }); }} book={selectedBook} formData={issueFormData} setFormData={setIssueFormData} onIssue={handleIssueBook} loading={saving} />

      {/* Details Modal */}
      {detailsModalOpen && (selectedBook || selectedIssue) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDetailsModalOpen(false); setSelectedBook(null); setSelectedIssue(null); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Book className="w-5 h-5 text-amber-600" />{selectedBook ? "Book Details" : "Issue Details"}</h3>
              <button onClick={() => { setDetailsModalOpen(false); setSelectedBook(null); setSelectedIssue(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {selectedBook && (
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Title</p><p className="font-medium text-gray-800">{selectedBook.title || "Ã¢â‚¬â€"}</p></div>
                  <div><p className="text-xs text-gray-500">Author</p><p className="font-medium text-gray-800">{selectedBook.author || "Ã¢â‚¬â€"}</p></div>
                  <div><p className="text-xs text-gray-500">Category</p><p className="font-medium text-gray-800">{getCategoryName(selectedBook.category)}</p></div>
                  <div><p className="text-xs text-gray-500">ISBN</p><p className="font-medium text-gray-800 font-mono">{selectedBook.isbn || "Ã¢â‚¬â€"}</p></div>
                  <div><p className="text-xs text-gray-500">Total Copies</p><p className="font-medium text-gray-800">{selectedBook.total_copies || 0}</p></div>
                  <div><p className="text-xs text-gray-500">Available Copies</p><p className="font-medium text-emerald-600">{getAvailableCopies(selectedBook)}</p></div>
                  <div><p className="text-xs text-gray-500">Currently Issued</p><p className="font-medium text-amber-600">{getBookIssueCount(selectedBook.id)}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><Badge className={getAvailableCopies(selectedBook) === 0 ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}>{getAvailableCopies(selectedBook) === 0 ? "Out of Stock" : "Available"}</Badge></div>
                  <div className="col-span-2"><p className="text-xs text-gray-500">Description</p><p className="text-gray-600">{selectedBook.description || "Ã¢â‚¬â€"}</p></div>
                </div>
              )}
              {selectedIssue && (
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-500">Book</p><p className="font-medium text-gray-800">{getBookTitle(selectedIssue.book)}</p></div>
                  <div><p className="text-xs text-gray-500">Student</p><p className="font-medium text-gray-800">{selectedIssue.student || "Ã¢â‚¬â€"}</p></div>
                  <div><p className="text-xs text-gray-500">Due Date</p><p className="font-medium text-gray-800">{formatDate(selectedIssue.due_date)}</p></div>
                  <div><p className="text-xs text-gray-500">Status</p><Badge className={`${getIssueStatus(selectedIssue).color}`}>{getIssueStatus(selectedIssue).label}</Badge></div>
                  {selectedIssue.return_date && <div className="col-span-2"><p className="text-xs text-gray-500">Returned</p><p className="font-medium text-gray-800">{formatDate(selectedIssue.return_date)}</p></div>}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={() => { setDetailsModalOpen(false); setSelectedBook(null); setSelectedIssue(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* History Details Modal */}
      {historyModalOpen && selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setHistoryModalOpen(false); setSelectedHistory(null); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><History className="w-5 h-5 text-blue-600" />History Details</h3>
              <button onClick={() => { setHistoryModalOpen(false); setSelectedHistory(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500">Book</p><p className="font-medium text-gray-800 mt-1">{selectedHistory.book?.title || getBookTitle(selectedHistory.book_issue) || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Student</p><p className="font-medium text-gray-800 mt-1">{selectedHistory.student?.name || "Ã¢â‚¬â€"}</p></div>
                <div><p className="text-xs text-gray-500">Old Status</p><Badge className="bg-gray-50 text-gray-700 border-gray-200 mt-1">{STATUS_LABELS[selectedHistory.status_old] || selectedHistory.status_old || "Ã¢â‚¬â€"}</Badge></div>
                <div><p className="text-xs text-gray-500">New Status</p><Badge className={`${STATUS_COLORS[selectedHistory.status_new] || "bg-gray-50 text-gray-700 border-gray-200"} mt-1`}>{STATUS_LABELS[selectedHistory.status_new] || selectedHistory.status_new || "Ã¢â‚¬â€"}</Badge></div>
                <div><p className="text-xs text-gray-500">Changed By</p><p className="font-medium text-gray-800 mt-1">{selectedHistory.changed_by || "System"}</p></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="font-medium text-gray-800 mt-1">{formatDateTime(selectedHistory.created_at)}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500">Reason</p><p className="text-gray-600 mt-1">{selectedHistory.reason || "Ã¢â‚¬â€"}</p></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-2xl">
              <Button variant="outline" onClick={() => { setHistoryModalOpen(false); setSelectedHistory(null); }}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {deletingItem && (
        <ConfirmDialog open={true} title={`Delete ${activeTab === "books" ? "Book" : "Book Issue"}`} message={activeTab === "books" ? `Are you sure you want to delete "${deletingItem.title}"?` : `Are you sure you want to delete this book issue?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeletingItem(null)} loading={saving} />
      )}

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

export default Library;