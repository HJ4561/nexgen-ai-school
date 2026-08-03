/**
 * ============================================
 * STUDENT TAB COMPONENT
 * ============================================
 * 
 * Purpose: Manage student user profiles
 * Used by: Admin - User Profile Management page
 * 
 * Features:
 * - View all students in a responsive table
 * - Search by name, email, or roll number
 * - Filter by class
 * - Filter by scholarship percentage
 * - Edit student profiles (class, scholarship, guardian info)
 * - Delete student accounts
 * - Pagination support
 * - Admin role theming
 * 
 * Dependencies:
 * - Admin thunks for CRUD operations
 * - UI components (LoadingSpinner, SearchBar, ResponsiveTable, Badge, Button, Pagination)
 * - EditDrawer for editing
 * - ConfirmDialog for delete confirmation
 * - Custom pagination hook
 * ============================================
 */

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, History, Search, Filter, Trash2 } from "lucide-react";

import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from "@/components/layout/ConfirmDialog";
import SearchBar from "@/components/layout/SearchBar";
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import EditDrawer from "./EditDrawer";
import Select from '@/components/ui/Select';
import { fetchStudents, updateStudent, deleteStudent, fetchClassSections } from "@/modules/admin/store/adminThunks";
import { usePagination } from "@/hooks";

// ─── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const ITEMS_PER_PAGE = 10;

const SCHOLARSHIP_OPTIONS = [
  { value: 0, label: "0% (No Scholarship)" },
  { value: 50, label: "50%" },
  { value: 100, label: "100% (Full)" },
];

/**
 * StudentTab Component
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.onRowClick - Called when a row is clicked
 * @returns {JSX.Element} Rendered student management tab
 * 
 * @example
 * <StudentTab onRowClick={handleRowClick} />
 */
function StudentTab({ onRowClick }) {
  const dispatch = useDispatch();
  const { students, classes, loading, error } = useSelector((state) => state.admin);

  // ─── State ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterScholarship, setFilterScholarship] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // ─── Fetch Students & Classes ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchClassSections());
  }, [dispatch]);

  // ─── Dynamic Class Options ────────────────────────────────────────────
  const classOptions = useMemo(() => {
    return classes.map((c) => ({
      value: c.id,
      label: `Class ${c.class_name} - ${c.section}`,
    }));
  }, [classes]);

  // ─── Filter Students ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = students;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.roll_number?.toLowerCase().includes(q)
      );
    }

    if (filterClass !== "all") {
      list = list.filter((s) => s.class_section === Number(filterClass));
    }

    if (filterScholarship !== "all") {
      list = list.filter((s) => s.scholarship_percentage === Number(filterScholarship));
    }

    return list;
  }, [students, search, filterClass, filterScholarship]);

  // ─── Pagination ──────────────────────────────────────────────────────────
  const { currentPage, totalPages, paginatedData, goToPage, resetPage, totalItems } =
    usePagination(filtered, ITEMS_PER_PAGE);

  // Reset page on filter change
  useEffect(() => {
    resetPage();
  }, [search, filterClass, filterScholarship]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSave = async (updatedData) => {
    try {
      await dispatch(updateStudent({
        id: updatedData.id,
        data: {
          class_section: updatedData.class_section_id,
          scholarship_percentage: updatedData.scholarship_percentage,
        },
      })).unwrap();
      setSelectedStudent(null);
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await dispatch(deleteStudent(deleteTargetId)).unwrap();
      } catch (error) {
        console.error("Failed to delete student:", error);
      }
    }
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  // ─── Table Columns ───────────────────────────────────────────────────────
  const columns = [
    {
      key: "full_name",
      label: "Name & Details",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-student-light)] text-[var(--color-student-primary)] flex items-center justify-center text-sm font-bold shrink-0">
            {getInitials(row.full_name)}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {row.full_name}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {row.roll_number || "No Roll No"}
            </p>
          </div>
        </div>
      ),
      mobile: { role: "title" },
    },
    {
      key: "email",
      label: "Contact",
      render: (row) => (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)] hidden lg:block">{row.email}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{row.guardian_phone || "—"}</p>
        </div>
      ),
      mobile: { role: "detail", label: "Contact" },
    },
    {
      key: "class_section",
      label: "Class",
      render: (row) => {
        const classLabel = classOptions.find(c => c.value === row.class_section)?.label || row.class_section;
        return <span className="text-sm text-[var(--color-text-primary)]">{classLabel}</span>;
      },
      mobile: { role: "detail", label: "Class" },
    },
    {
      key: "guardian_name",
      label: "Guardian",
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.guardian_name || "—"}
        </span>
      ),
      mobile: { role: "detail", label: "Guardian" },
    },
    {
      key: "scholarship_percentage",
      label: "Scholarship",
      render: (row) => {
        const color =
          row.scholarship_percentage === 100
            ? "text-[var(--color-success)]"
            : row.scholarship_percentage >= 50
            ? "text-[var(--color-warning)]"
            : "text-[var(--color-text-muted)]";
        return (
          <span className={`text-sm font-semibold ${color}`}>
            {row.scholarship_percentage}%
          </span>
        );
      },
      mobile: { role: "badge" },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex justify-start gap-0">
          <Button
            variant="ghost"
            tone="admin"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStudent(row);
            }}
            leftIcon={<Edit size={16} />}
            title="Edit Profile"
          />
          <Button
            variant="danger"
            tone="admin"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row.id);
            }}
            leftIcon={<Trash2 size={16} />}
            title="Delete"
          />
        </div>
      ),
      mobile: { role: "hidden" },
    },
  ];

  // ─── Loading & Error ─────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner size="lg" />;
  if (error) return <div className="text-center text-red-500 py-8">Error: {error}</div>;

  return (
    <>
      {/* ─── Filters ──────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--color-text-muted)]" />
          <span className="text-xs font-medium text-[var(--color-text-muted)]">Filters:</span>
        </div>

        <Select
          value={filterClass}
          onChange={(val) => setFilterClass(val)}
          options={[
            { value: "all", label: "All Classes" },
            ...classOptions.map(c => ({ value: String(c.value), label: c.label }))
          ]}
          tone="admin"
          size="md"
          placeholder="All Classes"
        />

        <Select
          value={filterScholarship}
          onChange={(val) => setFilterScholarship(val)}
          options={[
            { value: "all", label: "All Scholarships" },
            ...SCHOLARSHIP_OPTIONS.map(c => ({ value: String(c.value), label: c.label }))
          ]}
          tone="admin"
          size="md"
          placeholder="All Scholarships"
        />

        <div className="ml-auto text-xs text-[var(--color-text-muted)]">
          Showing {paginatedData.length} of {totalItems} students
        </div>
      </section>

      {/* ─── Table ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        <ResponsiveTable
          columns={columns}
          data={paginatedData}
          onRowClick={onRowClick}
          keyField="id"
          emptyMessage="No students found matching your criteria."
          mobileActions={(row) => (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="primary"
                tone="admin"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStudent(row);
                }}
                leftIcon={<Edit size={14} />}
              />
              <Button
                variant="danger"
                tone="admin"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row.id);
                }}
                leftIcon={<Trash2 size={14} />}
              />
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

      {/* ─── Confirm Dialog ──────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Student?"
        message="This action cannot be undone. Are you sure you want to delete this student?"
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
      />

      {/* ─── Edit Drawer ──────────────────────────────────────────────────── */}
      <EditDrawer
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        user={selectedStudent}
        role="student"
        onSave={handleSave}
        classOptions={classOptions}
        scholarshipOptions={SCHOLARSHIP_OPTIONS}
      />
    </>
  );
}

export default StudentTab;































