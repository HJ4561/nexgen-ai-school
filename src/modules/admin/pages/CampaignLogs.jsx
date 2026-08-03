/**
 * ============================================
 * CAMPAIGN LOGS PAGE
 * ============================================
 * 
 * Purpose: Admin page for tracking social media campaigns
 * Used by: Admin users only
 * 
 * Features:
 * - View all social media campaigns
 * - Filter by platform (Facebook, Instagram, LinkedIn)
 * - Filter by status (Published, Pending, Failed)
 * - Search by post content
 * - Campaign statistics cards
 * - View campaign details in drawer
 * - Delete campaigns with confirmation
 * - Retry failed campaigns
 * - Pagination
 * 
 * Dependencies:
 * - Campaign mock data
 * - UI components (Button, Select, StatCard, Badge, Drawer)
 * - ConfirmDialog for delete confirmation
 * ============================================
 */

import { useState, useMemo } from 'react';
import {
    Search, Filter,
    Eye, Trash2, RefreshCw, Clock, CheckCircle, AlertCircle,
    Calendar, User, Link as LinkIcon, X, TrendingUp,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

// Reusable Components
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatCard from "@/components/composite/StatCard";
import Badge from '@/components/ui/Badge';
import Drawer from "@/components/admin/Drawer";
import ConfirmDialog from "@/components/layout/ConfirmDialog";

// Mock Data
import {
    MOCK_CAMPAIGNS,
    PLATFORM_CONFIG,
    STATUS_CONFIG,
} from "@/mocks/campaignLogs";

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getTimeAgo = (iso) => {
    if (!iso) return '—';
    const now = new Date();
    const diff = now - new Date(iso);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

// ─── Platform Icon ────────────────────────────────────────────────────────
const PlatformIcon = ({ platform, size = 20 }) => {
    const iconMap = {
        facebook: FaFacebook,
        instagram: FaInstagram,
        linkedin: FaLinkedin,
    };
    const IconComponent = iconMap[platform];
    if (!IconComponent) return null;

    const config = PLATFORM_CONFIG[platform];
    const color = config?.color || '#000000';

    return <IconComponent size={size} color={color} />;
};

const PlatformBadge = ({ platform }) => {
    const config = PLATFORM_CONFIG[platform];
    if (!config) return null;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            <PlatformIcon platform={platform} size={14} />
            {config.label}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
            {status === 'published' && <CheckCircle size={12} />}
            {status === 'pending' && <Clock size={12} />}
            {status === 'failed' && <AlertCircle size={12} />}
            {config.label}
        </span>
    );
};

const ITEMS_PER_PAGE = 6;

// ─── Campaign Card ──────────────────────────────────────────────────────────
function CampaignCard({ campaign, onView, onDelete, onRetry }) {
    const platformConfig = PLATFORM_CONFIG[campaign.platform];

    return (
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-md transition-shadow p-5">
            {/* Header: Platform + Time */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full ${platformConfig?.bg || 'bg-gray-100'} flex items-center justify-center`}>
                        <PlatformIcon platform={campaign.platform} size={18} />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {platformConfig?.label || campaign.platform}
                        </span>
                    </div>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">
                    {getTimeAgo(campaign.created_at)}
                </span>
            </div>

            {/* Content */}
            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                {campaign.post_content}
            </p>

            {/* Hashtags */}
            {campaign.post_content.match(/#\w+/g) && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {campaign.post_content.match(/#\w+/g)?.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-xs text-[var(--color-admin-primary)] font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Post URL */}
            {campaign.post_url && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-[var(--color-surface-dim)] rounded-lg">
                    <LinkIcon size={14} className="text-[var(--color-text-muted)]" />
                    <a
                        href={campaign.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-admin-primary)] hover:underline truncate"
                    >
                        {campaign.post_url}
                    </a>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <User size={14} className="text-[var(--color-text-muted)]" />
                    <span className="text-xs text-[var(--color-text-muted)]">
                        {campaign.created_by}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <StatusBadge status={campaign.status} />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onView(campaign)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
                            title="View Details"
                        >
                            <Eye size={15} />
                        </button>
                        {campaign.status === 'failed' && (
                            <button
                                onClick={() => onRetry(campaign)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-teacher-primary)] hover:bg-[var(--color-teacher-light)] transition-colors"
                                title="Retry"
                            >
                                <RefreshCw size={15} />
                            </button>
                        )}
                        <button
                            onClick={() => onDelete(campaign)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * CampaignLogs Component
 * 
 * @component
 * @returns {JSX.Element} Rendered campaign logs page
 * 
 * @example
 * // In router:
 * <Route path="/admin/campaign-logs" element={<CampaignLogs />} />
 */
export default function CampaignLogs() {
    const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
    const [search, setSearch] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // ── Stats ──────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: campaigns.length,
        published: campaigns.filter(c => c.status === 'published').length,
        pending: campaigns.filter(c => c.status === 'pending').length,
        failed: campaigns.filter(c => c.status === 'failed').length,
    }), [campaigns]);

    // ── Filtered Data ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = campaigns;
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.post_content.toLowerCase().includes(q));
        }
        if (filterPlatform !== 'all') {
            list = list.filter(c => c.platform === filterPlatform);
        }
        if (filterStatus !== 'all') {
            list = list.filter(c => c.status === filterStatus);
        }
        return list;
    }, [campaigns, search, filterPlatform, filterStatus]);

    // ── Pagination ──────────────────────────────────────────────────────────────
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleView = (campaign) => {
        setSelectedCampaign(campaign);
        setIsDrawerOpen(true);
    };

    const handleDelete = (campaign) => {
        setDeleteTarget(campaign);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        setCampaigns(prev => prev.filter(c => c.id !== deleteTarget.id));
        setIsDeleteDialogOpen(false);
        setDeleteTarget(null);
    };

    const handleRetry = (campaign) => {
        alert(`🔄 Retrying post "${campaign.post_content.slice(0, 50)}..."`);
        // In real implementation, this would call API to retry
    };

    // ── Platform Options ──────────────────────────────────────────────────────
    const platformOptions = [
        { value: 'all', label: 'All Platforms' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'linkedin', label: 'LinkedIn' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
    ];

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-6 flex flex-col gap-5 min-h-screen bg-[var(--color-surface-dim)]">

            {/* ── Page Heading ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Campaign Logs</h1>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                        Track all social media campaigns and their status
                    </p>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Posts"
                    value={stats.total}
                    tone="admin"
                    footerText="All time"
                    footerColor="success"
                    footerIcon={<TrendingUp size={14} />}
                />
                <StatCard
                    label="Published"
                    value={stats.published}
                    tone="teacher"
                    footerText={`${Math.round((stats.published / stats.total) * 100)}% of total`}
                    footerColor="success"
                    footerIcon={<CheckCircle size={14} />}
                />
                <StatCard
                    label="Pending"
                    value={stats.pending}
                    tone="student"
                    footerText="Awaiting action"
                    footerColor="warning"
                    footerIcon={<Clock size={14} />}
                />
                <StatCard
                    label="Failed"
                    value={stats.failed}
                    tone="parent"
                    footerText="Need retry"
                    footerColor="danger"
                    footerIcon={<AlertCircle size={14} />}
                />
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                    {/* Filter Label */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Filter size={16} className="text-[var(--color-text-muted)]" />
                        <span className="text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">Filters:</span>
                    </div>

                    {/* Platform Select */}
                    <div className="w-[180px] shrink-0">
                        <Select
                            value={filterPlatform}
                            onChange={(val) => setFilterPlatform(val)}
                            options={platformOptions}
                            tone="admin"
                            size="sm"
                        />
                    </div>

                    {/* Status Select */}
                    <div className="w-[180px] shrink-0">
                        <Select
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val)}
                            options={statusOptions}
                            tone="admin"
                            size="sm"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-[360px] min-w-[140px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by post content..."
                            className="w-full pl-9 pr-4 py-1.5 bg-[var(--color-surface-dim)] border-none rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-admin-primary)]"
                        />
                    </div>
                </div>
            </div>

            {/* ── Campaign Cards Grid ── */}
            {paginated.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-dim)] flex items-center justify-center">
                            <Search size={32} className="text-[var(--color-text-muted)]" />
                        </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">No campaigns found</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {paginated.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onView={handleView}
                            onDelete={handleDelete}
                            onRetry={handleRetry}
                        />
                    ))}
                </div>
            )}

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
                    <span className="text-xs text-[var(--color-text-muted)]">
                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} campaigns
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${currentPage === page
                                        ? 'bg-[var(--color-admin-primary)] text-white'
                                        : 'hover:bg-gray-100 text-[var(--color-text-primary)]'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* ── View Details Drawer ── */}
            <Drawer
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Campaign Details"
                width="max-w-[450px]"
                footer={
                    <Button variant="outline" tone="admin" fullWidth onClick={() => setIsDrawerOpen(false)}>
                        Close
                    </Button>
                }
            >
                {selectedCampaign && (
                    <div className="space-y-5">
                        {/* Platform */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                Platform
                            </label>
                            <PlatformBadge platform={selectedCampaign.platform} />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                Status
                            </label>
                            <StatusBadge status={selectedCampaign.status} />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                Post Content
                            </label>
                            <div className="bg-[var(--color-surface-dim)] p-4 rounded-lg border border-gray-200 text-sm leading-relaxed">
                                {selectedCampaign.post_content}
                            </div>
                        </div>

                        {/* Hashtags */}
                        {selectedCampaign.post_content.match(/#\w+/g) && (
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                    Hashtags
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedCampaign.post_content.match(/#\w+/g)?.map((tag) => (
                                        <span key={tag} className="text-xs text-[var(--color-admin-primary)] font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* URL */}
                        {selectedCampaign.post_url && (
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                    Post URL
                                </label>
                                <a
                                    href={selectedCampaign.post_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[var(--color-admin-primary)] hover:underline break-all"
                                >
                                    {selectedCampaign.post_url}
                                </a>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                    Created By
                                </label>
                                <p className="text-sm text-[var(--color-text-primary)]">{selectedCampaign.created_by}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                                    Created At
                                </label>
                                <p className="text-sm text-[var(--color-text-primary)]">{formatDate(selectedCampaign.created_at)}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>

            {/* ── Confirm Delete Dialog ── */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Confirm Delete"
                message="Are you sure you want to delete this campaign post? This action cannot be undone."
                variant="danger"
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
}

























