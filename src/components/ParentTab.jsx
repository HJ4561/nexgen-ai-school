/**
 * ============================================
 * PARENT TAB COMPONENT
 * ============================================
 * 
 * Purpose: Manage parent user profiles
 * Used by: Admin - User Profile Management page
 * 
 * Features:
 * - View all parents in a responsive table
 * - Search by name or email
 * - Edit parent profiles (name, email)
 * - Delete parent accounts
 * - Status badges (Active/Inactive)
 * - Pagination support
 * - Admin role theming
 * 
 * Dependencies:
 * - Admin thunks for CRUD operations
 * - UI components (LoadingSpinner, SearchBar, ResponsiveTable, StatusBadge, Pagination)
 * - EditDrawer for editing
 * - ConfirmDialog for delete confirmation
 * - Custom pagination hook
 * ============================================
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Filter, Trash2 } from "lucide-react";

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import SearchBar from "@/components/layout/SearchBar";
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from '@/components/ui/Pagination';
import EditDrawer from "./EditDrawer";
import Select from '@/components/ui/Select';
import { fetchParents, deleteUser, updateUser } from "@/modules/admin/store/adminThunks";
import { usePagination } from "@/hooks";

/**
 * ============================================
 * HELPERS
 * ============================================
 * 
 * Utility functions for the ParentTab component
 */

/**
 * Get initials from a name
 * 
 * @param {string} name - Full name
 * @returns {string} Uppercase initials (max 2 characters)
 * 
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Jane") // "JA"
 */
const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

/**
 * ============================================
 * CONSTANTS
 * ============================================
 * 
 * Configuration constants for the component
 */
const ITEMS_PER_PAGE = 10;

/**
 * ============================================
 * PARENT TAB COMPONENT
 * ============================================
 * 
 * Renders the parent management tab with CRUD operations
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onRowClick - Called when a table row is clicked
 * @returns {JSX.Element} Rendered parent management tab
 * 
 * @example
 * <ParentTab onRowClick={handleRowClick} />
 */
function ParentTab({ onRowClick }) {
  const dispatch = useDispatch();
  const { parents, loading, error } = useSelector((state) => state.admin);

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [search, setSearch] = useState("");
  const [selectedParent, setSelectedParent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  /**
   * ============================================
   * FETCH PARENTS
   * ============================================
   * 
   * Loads parent data from API on component mount
   */
  useEffect(() => {
    dispatch(fetchParents());
  }, [dispatch]);

  /**
   * ============================================
   * FILTER PARENTS
   * ============================================
   * 
   * Filters parent list based on search query
   * Searches by full_name or email
   */
  const filtered = useMemo(() => {
    let list = parents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [parents, search]);

  /**
   * ============================================
   * PAGINATION
   * ============================================
   * 
   * Manages pagination for the filtered parent list
   */
  const { currentPage, totalPages, paginatedData, goToPage, resetPage, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  // Reset pagination when search changes
  useEffect(() => {
    resetPage();
  }, [search]);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * ============================================
   * HANDLE SAVE
   * ============================================
   * 
   * Saves edited parent profile
   * 
   * @param {Object} updatedData - Updated parent data
   * @returns {Promise<void>}
   */
  const handleSave = async (updatedData) => {
    try {
      await dispatch(updateUser({
        id: updatedData.user,
        data: {
          full_name: updatedData.full_name,
          email: updatedData.email,
          role: 4,
        },
      })).unwrap();
      setSelectedParent(null);
    } catch (error) {
      console.error("Failed to update parent:", error);
      alert(`Error: ${error.message}`);
    }
  };

  /**
   * ============================================
   * HANDLE DELETE CLICK
   * ============================================
   * 
   * Opens delete confirmation dialog
   * 
   * @param {number} id - Parent ID to delete
   */
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  /**
   * ============================================
   * HANDLE CONFIRM DELETE
   * ============================================
   * 
   * Executes parent deletion after confirmation
   * 
   * @returns {Promise<void>}
   */
  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      try {
        const parent = parents.find(p => p.id === deleteTargetId);
        if (parent) {
          await dispatch(deleteUser(parent.user)).unwrap();
        }
        dispatch(fetchParents());
      } catch (error) {
        console.error("Failed to delete parent:", error);
        alert(`Error: ${error.message}`);
      }
    }
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // â”€â”€â”€ Table Columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * ============================================
   * TABLE COLUMNS
   * ============================================
   * 
   * Defines the columns for the parent table
   * Includes: Name (with avatar), Email, Status, User ID, Actions
   */
  const columns = [
    /**
     * ============================================
     * NAME COLUMN
     * ============================================
     * 
     * Displays parent name with avatar and ID
     * Acts as title on mobile view
     */
    {
      key: "full_name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-parent-light)] text-[var(--color-parent-primary)] flex items-center justify-center text-sm font-bold shrink-0">
            {getInitials(row.full_name)}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {row.full_name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              ID: {row.id} Â· User: {row.user}
            </p>
          </div>
        </div>
      ),
      mobile: { role: "title" },
    },

    /**
     * ============================================
     * EMAIL COLUMN
     * ============================================
     * 
     * Displays parent email address
     */
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{row.email}</span>
      ),
      mobile: { role: "detail", label: "Email" },
    },

    /**
     * ============================================
     * STATUS COLUMN
     * ============================================
     * 
     * Displays Active/Inactive status badge
     */
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const status = row.is_active !== undefined ? (row.is_active ? "Active" : "Inactive") : "Active";
        return <StatusBadge status={status} />;
      },
      mobile: { role: "badge" },
    },

    /**
     * ============================================
     * USER ID COLUMN
     * ============================================
     * 
     * Displays the user ID associated with the parent
     */
    {
      key: "user",
      label: "User ID",
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{row.user}</span>
      ),
      mobile: { role: "detail", label: "User ID" },
    },

    /**
     * ============================================
     * ACTIONS COLUMN
     * ============================================
     * 
     * Provides Edit and Delete buttons
     * hidden on mobile (handled by mobileActions)
     */
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-start gap-2">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedParent(row);
            }}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Edit size={16} />
          </button>
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.id);
            }}
            className="p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      mobile: { role: "hidden" },
    },
  ];

  // â”€â”€â”€ Loading & Error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-center text-red-500 py-8">Error: {error}</div>;

  return (
    <>
      {/* â”€â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={setSearch}
          placeholder="Search parents by name or email..."
          tone="admin"
          size="sm"
          className="w-60 md:w-80"
        />
        <div className="ml-auto text-xs text-[var(--color-text-muted)]">
          Showing {paginatedData.length} of {totalItems} parents
        </div>
      </div>

      {/* â”€â”€â”€ Table â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <ResponsiveTable
          columns={columns}
          data={paginatedData}
          onRowClick={onRowClick}
          keyField="id"
          emptyMessage="No parents found matching your criteria."
          mobileActions={(row) => (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedParent(row);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-admin-primary)] bg-[var(--color-admin-light)] rounded-lg"
              >
                <Edit size={14} />
                Edit Profile
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row.id);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg"
              >
                <Trash2 size={14} />
                Delete
              </button>
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

      {/* â”€â”€â”€ Confirm Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Parent?"
        message="This action cannot be undone. Are you sure you want to delete this parent?"
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />

      {/* â”€â”€â”€ Edit Drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <EditDrawer
        isOpen={!!selectedParent}
        onClose={() => setSelectedParent(null)}
        user={selectedParent}
        role="parent"
        onSave={handleSave}
      />
    </>
  );
}

export default ParentTab;