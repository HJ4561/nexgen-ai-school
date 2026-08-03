/**
 * ============================================
 * USER APPROVALS PAGE
 * ============================================
 * 
 * Purpose: Admin page for reviewing and managing user registration requests
 * Used by: Admin users only
 * 
 * Features:
 * - View all user registration requests
 * - Filter by status (All, Pending, Approved, Rejected)
 * - Search by name, email, or role
 * - Approve or reject pending requests
 * - View detailed user information in drawer
 * - Statistics cards with counts
 * - Pagination for large datasets
 * 
 * Dependencies:
 * - Admin thunks for user management
 * - UI components (Button, Badge, Drawer, etc.)
 * - Animation components for UI
 * ============================================
 */

import { useState, useEffect, useMemo } from "react";
import { CheckCircle, XCircle, Clock, TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

// ─── Reusable Components ──────────────────────────────────────────────
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/layout/SearchBar";
import StatCard from "@/components/composite/StatCard";
import StatusBadge from "@/components/composite/StatusBadge";
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ResponsiveTable from "@/components/admin/ResponsiveTable";
import Drawer from "@/components/admin/Drawer";

// ─── Animation Components ─────────────────────────────────────────────
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/admin/animations";

// ─── Thunks ─────────────────────────────────────────────────────────────
import { fetchAllUsers, updateApprovalStatus } from "@/modules/admin/store/adminThunks";

// ─── Helpers ───────────────────────────────────────────────────────────
const getInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const ROLE_STYLES = {
  Student: {
    avatar: "bg-[var(--color-student-primary)] text-white",
    tone: "student",
    borderColor: "border-[var(--color-student-primary)]",
  },
  Teacher: {
    avatar: "bg-[var(--color-teacher-primary)] text-white",
    tone: "teacher",
    borderColor: "border-[var(--color-teacher-primary)]",
  },
  Parent: {
    avatar: "bg-[var(--color-parent-primary)] text-white",
    tone: "parent",
    borderColor: "border-[var(--color-parent-primary)]",
  },
};

const TABS = ["All", "Pending", "Approved", "Rejected"];
const ITEMS_PER_PAGE = 10;

// ─── Table columns ────────────────────────────────────────────────────
const buildColumns = (onViewDetails) => [
  {
    key: "full_name",
    label: "Name",
    render: (row) => {
      const style = ROLE_STYLES[row.role_name] ?? ROLE_STYLES.Student;
      return (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${style.avatar}`}>
            {getInitials(row.full_name)}
          </div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {row.full_name}
          </span>
        </div>
      );
    },
    mobile: { role: "title" },
  },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <Badge tone={ROLE_STYLES[row.role]?.tone ?? "brand"}>
        {row.role_name || "Unknown"}
      </Badge>
    ),
    mobile: { role: "badge" },
  },
  {
    key: "email",
    label: "Email",
    render: (row) => (
      <span className="text-sm text-[var(--color-text-secondary)]">{row.email}</span>
    ),
    mobile: { role: "detail", label: "Email" },
  },
  {
    key: "created_at",
    label: "Submitted",
    render: (row) => (
      <span className="text-sm text-[var(--color-text-secondary)]">{formatDate(row.created_at)}</span>
    ),
    mobile: { role: "detail", label: "Submitted" },
  },
  {
    key: "status",
    label: "Status",
    render: (row) => {
      const status = row?.status || "Unknown";
      return <StatusBadge status={status.charAt(0).toUpperCase() + status.slice(1)} />;
    },
    mobile: { role: "detail", label: "Status" },
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="flex justify-start">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            tone="admin"
            onClick={() => onViewDetails(row)}
            className="shadow-sm hover:shadow"
          >
            {row.status === "Pending" ? "View Details" : "View"}
          </Button>
        </motion.div>
      </div>
    ),
    mobile: { role: "hidden" },
  },
];

// ─── Drawer Row Component ─────────────────────────────────────────────
function DrawerRow({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="text-sm text-[var(--color-text-primary)]">{value ?? "—"}</div>
    </div>
  );
}

/**
 * UserDrawerContent Component
 * Displays user details in the drawer
 */
function UserDrawerContent({ user }) {
  const style = ROLE_STYLES[user.role_name] ?? ROLE_STYLES.Student;

  return (
    <div className="space-y-7">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${style.avatar}`}>
          {getInitials(user.full_name)}
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            {user.full_name}
          </p>
          <div className="mt-1.5">
            <Badge tone={style.tone}>
              {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      <div className="space-y-5">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
          Account Info
        </p>
        <DrawerRow label="Full Name" value={user.full_name} />
        <DrawerRow label="Email Address" value={user.email} />
        <DrawerRow label="Submitted On" value={formatDate(user.created_at)} />
        <DrawerRow
          label="Current Status"
          value={
            <StatusBadge
              status={(user?.status || "Unknown").charAt(0).toUpperCase() + (user?.status || "Unknown").slice(1)}
            />
          }
        />
      </div>
    </div>
  );
}

/**
 * UserApprovals Component
 * 
 * @component
 * @returns {JSX.Element} Rendered user approvals page
 * 
 * @example
 * // In router:
 * <Route path="/admin/user-approvals" element={<UserApprovals />} />
 */
export default function UserApprovals() {
  const dispatch = useDispatch();
  const { users: approvals, loading, updating, error } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch Data on Mount ──────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleApprove = (id) => {
    dispatch(updateApprovalStatus({ userId: id, action: "approve" }));
    setSelectedUser(null);
  };

  const handleReject = (id) => {
    dispatch(updateApprovalStatus({ userId: id, action: "reject" }));
    setSelectedUser(null);
  };

  // ─── Statistics ────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: approvals.length,
      pending: approvals.filter((r) => r.status === "Pending").length,
      approved: approvals.filter((r) => r.status === "Active").length,
      rejected: approvals.filter((r) => r.status === "Rejected").length,
    }),
    [approvals]
  );

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = approvals;
    if (activeTab !== "All") {
      const statusMap = { Pending: "Pending", Approved: "Active", Rejected: "Rejected" };
      const backendStatus = statusMap[activeTab];
      if (backendStatus) list = list.filter((r) => r.status === backendStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.role_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [approvals, activeTab, search]);

  // ─── Pagination ────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const columns = buildColumns(setSelectedUser);

  return (
    <div className="p-6 md:p-0 flex flex-col gap-7 min-h-screen bg-gradient-to-br from-[var(--color-surface-dim)] via-[var(--color-surface-dim)] to-[var(--color-admin-light)]">

      {/* ── Page Header ── */}
      <FadeIn y={16} delay={0.1}>
        <PageHeader
          title="User Approvals"
          subtitle="Review and manage registration requests"
          breadcrumbs={["Admin", "User Approvals"]}
          action={
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={(val) => setSearch(val)}
              placeholder="Search by name, email, role…"
              tone="admin"
              size="md"
            />
          }
        />
      </FadeIn>

      {/* ── Stat Cards ── */}
      <StaggerGroup as="section" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem className="rounded-xl overflow-hidden border-t-4 border-t-[var(--color-admin-primary)] transition-transform duration-300 hover:-translate-y-1">
          <StatCard
            label="Total Requests"
            value={stats.total.toLocaleString()}
            tone="admin"
            footerText="+12% this month"
            footerColor="success"
            footerIcon={<TrendingUp size={13} />}
          />
        </StaggerItem>
        <StaggerItem className="rounded-xl overflow-hidden border-t-4 border-t-[var(--color-student-primary)] transition-transform duration-300 hover:-translate-y-1">
          <StatCard
            label="Pending"
            value={stats.pending}
            tone="student"
            footerText="Awaiting review"
            footerColor="warning"
            footerIcon={<Clock size={13} />}
          />
        </StaggerItem>
        <StaggerItem className="rounded-xl overflow-hidden border-t-4 border-t-[var(--color-teacher-primary)] transition-transform duration-300 hover:-translate-y-1">
          <StatCard
            label="Approved"
            value={stats.approved}
            tone="teacher"
            footerText="Active accounts"
            footerColor="success"
            footerIcon={<CheckCircle size={13} />}
          />
        </StaggerItem>
        <StaggerItem className="rounded-xl overflow-hidden border-t-4 border-t-[var(--color-parent-primary)] transition-transform duration-300 hover:-translate-y-1">
          <StatCard
            label="Rejected"
            value={stats.rejected}
            tone="parent"
            footerText="Inactive requests"
            footerColor="danger"
            footerIcon={<XCircle size={13} />}
          />
        </StaggerItem>
      </StaggerGroup>

      {/* ── Tabs + Table ── */}
      <FadeIn>
        <div className="flex flex-col">
          <nav className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide py-1">
            {TABS.map((tab) => {
              const count =
                tab === "Pending"
                  ? stats.pending
                  : tab === "Approved"
                  ? stats.approved
                  : tab === "Rejected"
                  ? stats.rejected
                  : null;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-[var(--color-admin-primary)] text-white shadow-md shadow-[var(--color-admin-primary)]/30"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-100/50"
                  }`}
                >
                  {tab}
                  {count !== null && (
                    <span
                      className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeTab === tab
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 border-t-0 overflow-hidden">
            <ResponsiveTable
              columns={columns}
              data={paginated}
              keyField="id"
              emptyMessage="No requests found."
              mobileActions={(row) => (
                <Button
                  variant="outline"
                  size="sm"
                  tone="admin"
                  fullWidth
                  onClick={() => setSelectedUser(row)}
                  className="shadow-sm hover:shadow"
                >
                  {row.status === "Pending" ? "View Details" : "View"}
                </Button>
              )}
            />

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} requests
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? "bg-[var(--color-admin-primary)] text-white"
                          : "hover:bg-gray-100 text-[var(--color-text-primary)]"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── Drawer ── */}
      <Drawer
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Registration Details"
        footer={
          selectedUser?.status === "Pending" ? (
            <div className="grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  tone="admin"
                  fullWidth
                  leftIcon={<XCircle size={16} />}
                  onClick={() => handleReject(selectedUser.id)}
                  className="shadow-sm hover:shadow"
                >
                  Reject
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="primary"
                  tone="admin"
                  fullWidth
                  leftIcon={<CheckCircle size={16} />}
                  onClick={() => handleApprove(selectedUser.id)}
                  className="shadow-sm hover:shadow"
                >
                  Approve
                </Button>
              </motion.div>
            </div>
          ) : null
        }
      >
        {selectedUser && <UserDrawerContent user={selectedUser} />}
      </Drawer>
    </div>
  );
}

























