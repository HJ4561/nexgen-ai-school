/**
 * ============================================
 * ROOMS TAB COMPONENT
 * ============================================
 * 
 * Purpose: Manage academic rooms (classrooms, labs, etc.)
 * Used in: Admin - Academic Structure page
 * 
 * Features:
 * - View all rooms with search and pagination
 * - Add new rooms
 * - Edit existing rooms
 * - Delete rooms with confirmation
 * - Responsive table design
 * 
 * Dependencies:
 * - Academics thunks for CRUD operations
 * - UI components (Button, Badge, Drawer, etc.)
 * - Pagination hook
 * ============================================
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Trash2, Search, Plus, AlertCircle } from "lucide-react";

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Drawer from "@/components/admin/Drawer";
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Pagination from '@/components/ui/Pagination';
import { usePagination } from "@/hooks";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import {
  fetchRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/modules/admin/store/academicsThunks";

const ITEMS_PER_PAGE = 10;

/**
 * Format date to readable string
 * @param {string} iso - ISO date string
 * @returns {string} Formatted date or "—" if invalid
 */
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * RoomsTab Component
 * 
 * @component
 * @returns {JSX.Element} Rendered rooms management interface
 * 
 * @example
 * // In AcademicStructure page:
 * <Tabs>
 *   <RoomsTab />
 * </Tabs>
 */
export default function RoomsTab() {
  const dispatch = useDispatch();
  const { rooms, loading, updating } = useSelector((state) => state.academics);

  // ─── State ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("add");
  const [formData, setFormData] = useState({ name: "", location: "", capacity: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drawerError, setDrawerError] = useState("");

  // ─── Fetch Data on Mount ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = rooms;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [rooms, search]);

  // ─── Pagination ────────────────────────────────────────────────────
  const { currentPage, totalPages, paginatedData, goToPage, resetPage, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  // Reset to page 1 when search changes
  useEffect(() => resetPage(), [search]);

  // ─── Handlers ──────────────────────────────────────────────────────
  
  /** Open drawer for adding a new room */
  const handleAdd = () => {
    setSelectedItem(null);
    setDrawerMode("add");
    setFormData({ name: "", location: "", capacity: "" });
    setDrawerError("");
    setIsDrawerOpen(true);
  };

  /** Open drawer for editing a room */
  const handleEdit = (item) => {
    setSelectedItem(item);
    setDrawerMode("edit");
    setFormData({ ...item });
    setDrawerError("");
    setIsDrawerOpen(true);
  };

  /** Open delete confirmation dialog */
  const handleDelete = (item) => {
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  /** Confirm and execute delete */
  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await dispatch(deleteRoom(deleteTarget.id)).unwrap();
        setIsDeleteDialogOpen(false);
        setDeleteTarget(null);
      } catch (error) {
        alert(error.message || "Failed to delete room");
      }
    }
  };

  /** Save room (create or update) */
  const handleSave = async () => {
    setDrawerError(""); // Clear previous error

    const payload = {
      name: formData.name,
      location: formData.location,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
    };

    try {
      if (drawerMode === "add") {
        await dispatch(createRoom(payload)).unwrap();
      } else {
        await dispatch(updateRoom({ id: formData.id, ...payload })).unwrap();
      }
      setIsDrawerOpen(false);
      setFormData({ name: "", location: "", capacity: "" });
    } catch (error) {
      setDrawerError(error.message || "Failed to save room");
    }
  };

  // ─── Table Columns ─────────────────────────────────────────────────
  const columns = [
    {
      key: "name",
      label: "Room Name",
      highlight: true,
      render: (row) => <span className="font-medium px-4 sm:px-6 lg:px-8">{row.name}</span>,
      mobile: { role: "title" },
    },
    {
      key: "location",
      label: "Location",
      render: (row) => <span className="text-sm md:text-base md:text-base text-[var(--color-text-secondary)] px-4 sm:px-6 lg:px-8">{row.location || "—"}</span>,
      mobile: { role: "detail", label: "Location" },
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (row) => (
        <Badge tone="admin" className="text-[10px] px-4 sm:px-6 lg:px-8">
          {row.capacity || "—"} students
        </Badge>
      ),
      mobile: { role: "badge" },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex flex-col md:flex-row justify-start gap-1 px-4 sm:px-6 lg:px-8">
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-[var(--color-admin-primary)] bg-[var(--color-admin-light)] hover:bg-[var(--color-admin-primary)] hover:text-white transition-colors px-4 sm:px-6 lg:px-8"
            title="Edit"
          >
            <Edit size={15} />
          </Button>
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger)] hover:text-white transition-colors px-4 sm:px-6 lg:px-8"
            title="Delete"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
      mobile: { role: "hidden" },
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────
  
  if (loading) {
    return (
      <div className="p-4 sm:p-6 sm:p-8 flex flex-col md:flex-row justify-center items-center px-4 sm:px-6 lg:px-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {/* ─── Controls ──────────────────────────────────────────────── */}
      <div className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 sm:p-4 sm:p-6 flex flex-col md:flex-row-wrap items-center justify-between gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 border-b border-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 flex-1 min-w-[100px] px-4 sm:px-6 lg:px-8">
          <div className="relative flex-1 max-w-xs px-4 sm:px-6 lg:px-8">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] px-4 sm:px-6 lg:px-8" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-surface-dim)] border-none shadow-none outline-none rounded-lg text-sm md:text-base md:text-base focus:ring-2 focus:ring-[var(--color-admin-primary)] px-4 sm:px-6 lg:px-8"
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
          <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="primary" tone="admin" size="sm" leftIcon={<Plus size={14} />} onClick={handleAdd}>
            Add Room
          </Button>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div className="pb-2 px-4 sm:px-6 lg:px-8">
        <ResponsiveTable
          columns={columns}
          data={paginatedData}
          animateRows={true}
          keyField="id"
          emptyMessage="No rooms found"
          mobileActions={(row) => (
            <div className="flex flex-col md:flex-row items-center justify-end gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 pt-2 px-4 sm:px-6 lg:px-8">
              <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={() => handleEdit(row)}
                className="px-3 py-1.5 text-sm md:text-base md:text-base font-medium text-[var(--color-admin-primary)] bg-[var(--color-admin-light)] rounded-lg hover:bg-[var(--color-admin-light)]/70 transition-colors flex flex-col md:flex-row items-center gap-1.5 px-4 sm:px-6 lg:px-8"
              >
                <Edit size={14} />
                Edit
              </Button>
              <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" onClick={() => handleDelete(row)}
                className="px-3 py-1.5 text-sm md:text-base md:text-base font-medium text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg hover:bg-[var(--color-danger-bg)]/70 transition-colors flex flex-col md:flex-row items-center gap-1.5 px-4 sm:px-6 lg:px-8"
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          )}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      {/* ─── Drawer ────────────────────────────────────────────────── */}
      <Drawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setDrawerError("");
        }}
        title={drawerMode === "add" ? "Add New Room" : "Edit Room"}
        width="max-w-[380px]"
        footer={
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 px-4 sm:px-6 lg:px-8">
            <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="outline"
              tone="admin"
              fullWidth
              onClick={() => {
                setIsDrawerOpen(false);
                setDrawerError("");
              }}
            >
              Cancel
            </Button>
            <button className="min-h-11 min-w-11 px-4 sm:px-6 lg:px-8" variant="primary"
              tone="admin"
              fullWidth
              onClick={handleSave}
              disabled={updating}
            >
              {drawerMode === "add" ? "Add" : "Save"}
            </Button>
          </div>
        }
      >
        {/* Error Banner */}
        {drawerError && (
          <div className="mb-4 p-3 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] rounded-lg flex flex-col md:flex-row items-start gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 text-sm md:text-base md:text-base text-[var(--color-danger-text)] px-4 sm:px-6 lg:px-8">
            <AlertCircle size={16} className="shrink-0 mt-0.5 px-4 sm:px-6 lg:px-8" />
            <span>{drawerError}</span>
          </div>
        )}

        <div className="space-y-4 px-4 sm:px-6 lg:px-8">
          {/* Room Name */}
          <div>
            <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
              Room Name <span className="text-[var(--color-danger)] px-4 sm:px-6 lg:px-8">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., R-302"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-[var(--color-admin-primary)] transition-all text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8"
            />
          </div>
          {/* Location */}
          <div>
            <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ""}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Ground Floor"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-[var(--color-admin-primary)] transition-all text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8"
            />
          </div>
          {/* Capacity */}
          <div>
            <label className="block md:hidden text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 px-4 sm:px-6 lg:px-8">
              Capacity
            </label>
            <input
              type="number"
              value={formData.capacity || ""}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || "" })}
              placeholder="e.g., 30"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-admin-primary)] focus:border-[var(--color-admin-primary)] transition-all text-sm md:text-base md:text-base px-4 sm:px-6 lg:px-8"
            />
          </div>
        </div>
      </Drawer>

      {/* ─── Confirm Dialog ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Room?"
        message="This action cannot be undone. Are you sure you want to delete this room?"
        variant="danger"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}



























