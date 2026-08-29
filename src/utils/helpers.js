/**
 * ============================================
 * HELPERS - CENTRALIZED UTILITY FUNCTIONS
 * ============================================
 * 
 * Combined from all module-specific helpers
 * ============================================
 */

// ─── Date Formatting ──────────────────────────────────────────────

export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTimeAgo = (date) => {
  if (!date) return 'N/A';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}mo ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return 'Just now';
};

// ─── Name & Initials ──────────────────────────────────────────────

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ─── Subject Colors ──────────────────────────────────────────────

export const getSubjectColor = (subject) => {
  const colorMap = {
    'Mathematics': 'bg-blue-100 text-blue-700 border-blue-300',
    'Math': 'bg-blue-100 text-blue-700 border-blue-300',
    'English': 'bg-green-100 text-green-700 border-green-300',
    'Urdu': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Science': 'bg-purple-100 text-purple-700 border-purple-300',
    'Physics': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'Chemistry': 'bg-cyan-100 text-cyan-700 border-cyan-300',
    'Biology': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'History': 'bg-amber-100 text-amber-700 border-amber-300',
    'Geography': 'bg-lime-100 text-lime-700 border-lime-300',
    'Art': 'bg-pink-100 text-pink-700 border-pink-300',
    'Music': 'bg-rose-100 text-rose-700 border-rose-300',
    'Physical Education': 'bg-orange-100 text-orange-700 border-orange-300',
    'PE': 'bg-orange-100 text-orange-700 border-orange-300',
    'Computer Science': 'bg-slate-100 text-slate-700 border-slate-300',
    'IT': 'bg-slate-100 text-slate-700 border-slate-300',
    'Economics': 'bg-teal-100 text-teal-700 border-teal-300',
    'Business': 'bg-teal-100 text-teal-700 border-teal-300',
    'Accounting': 'bg-cyan-100 text-cyan-700 border-cyan-300',
    'Statistics': 'bg-blue-100 text-blue-700 border-blue-300',
    'Psychology': 'bg-violet-100 text-violet-700 border-violet-300',
    'Sociology': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
    'Philosophy': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'Islamiat': 'bg-green-100 text-green-700 border-green-300',
    'Pak Studies': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'General': 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return colorMap[subject] || colorMap['General'];
};

// ─── Timetable ──────────────────────────────────────────────────

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00'
];

export const getNextTimeSlot = (time) => {
  if (!time) return '09:00';
  const hours = parseInt(time.split(':')[0]);
  const nextHour = hours + 1;
  return `${String(nextHour).padStart(2, '0')}:00`;
};

export const timesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// ─── Severity ────────────────────────────────────────────────────

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'text-red-700';
    case 'high': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'low': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const getSeverityBadgeClass = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'bg-red-200 text-red-800 border-red-400';
    case 'high': return 'bg-red-100 text-red-700 border-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low': return 'bg-green-100 text-green-700 border-green-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

// ─── Status ──────────────────────────────────────────────────────

export const getStatus = (status) => {
  const statusMap = {
    'available': { label: 'Available', className: 'bg-green-100 text-green-700' },
    'in-use': { label: 'In Use', className: 'bg-yellow-100 text-yellow-700' },
    'maintenance': { label: 'Maintenance', className: 'bg-red-100 text-red-700' },
    'out-of-stock': { label: 'Out of Stock', className: 'bg-gray-100 text-gray-700' },
    'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
    'approved': { label: 'Approved', className: 'bg-green-100 text-green-700' },
    'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700' },
  };
  return statusMap[status?.toLowerCase()] || statusMap['available'];
};

export const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-700 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'overdue': return 'bg-red-100 text-red-700 border-red-300';
    case 'completed': return 'bg-green-100 text-green-700 border-green-300';
    case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'active': return 'bg-green-100 text-green-700 border-green-300';
    case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export const getStatusLabel = (status) => {
  if (!status) return 'N/A';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'submitted': 'bg-blue-100 text-blue-700 border-blue-300',
    'graded': 'bg-green-100 text-green-700 border-green-300',
    'overdue': 'bg-red-100 text-red-700 border-red-300',
    'draft': 'bg-gray-100 text-gray-700 border-gray-300',
    'published': 'bg-purple-100 text-purple-700 border-purple-300',
    'active': 'bg-green-100 text-green-700 border-green-300',
    'closed': 'bg-gray-100 text-gray-700 border-gray-300',
    'completed': 'bg-green-100 text-green-700 border-green-300',
    'cancelled': 'bg-gray-100 text-gray-700 border-gray-300',
    'paid': 'bg-green-100 text-green-700 border-green-300',
    'unpaid': 'bg-red-100 text-red-700 border-red-300',
    'partial': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'approved': 'bg-green-100 text-green-700 border-green-300',
    'rejected': 'bg-red-100 text-red-700 border-red-300',
    'open': 'bg-red-100 text-red-700 border-red-300',
    'resolved': 'bg-green-100 text-green-700 border-green-300',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
  };
  return colorMap[status?.toLowerCase()] || colorMap['pending'];
};

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

// ─── Category ────────────────────────────────────────────────────

export const getCategoryStyle = (category) => {
  const styles = {
    'Electronics': 'bg-blue-100 text-blue-700 border-blue-200',
    'Furniture': 'bg-green-100 text-green-700 border-green-200',
    'Stationery': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Equipment': 'bg-purple-100 text-purple-700 border-purple-200',
    'Books': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Supplies': 'bg-orange-100 text-orange-700 border-orange-200',
    'Default': 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return styles[category] || styles.Default;
};

// ─── Currency ────────────────────────────────────────────────────

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'PKR 0';
  return `PKR ${amount.toLocaleString()}`;
};

// ─── Stock ───────────────────────────────────────────────────────

export const LOW_STOCK_THRESHOLD = 5;

// ─── Complaint ──────────────────────────────────────────────────

export const COMPLAINT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' }
];

export const COMPLAINT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'academic', label: 'Academic' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'facility', label: 'Facility' },
  { value: 'behavior', label: 'Behavior' },
  { value: 'other', label: 'Other' }
];

export const statusDisplayMap = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  open: { label: 'Open', color: 'bg-red-100 text-red-700 border-red-300' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-300' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700 border-gray-300' }
};

// ─── Assignment ──────────────────────────────────────────────────

export const getAssignmentStatus = (status) => {
  const statusMap = {
    'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    'submitted': { label: 'Submitted', className: 'bg-blue-100 text-blue-700 border-blue-300' },
    'graded': { label: 'Graded', className: 'bg-green-100 text-green-700 border-green-300' },
    'overdue': { label: 'Overdue', className: 'bg-red-100 text-red-700 border-red-300' },
    'draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    'published': { label: 'Published', className: 'bg-purple-100 text-purple-700 border-purple-300' },
    'active': { label: 'Active', className: 'bg-green-100 text-green-700 border-green-300' },
    'closed': { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  };
  return statusMap[status?.toLowerCase()] || statusMap['pending'];
};

export const getAssignmentStatusColor = (status) => {
  const statusMap = {
    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'submitted': 'bg-blue-100 text-blue-700 border-blue-300',
    'graded': 'bg-green-100 text-green-700 border-green-300',
    'overdue': 'bg-red-100 text-red-700 border-red-300',
    'draft': 'bg-gray-100 text-gray-700 border-gray-300',
    'published': 'bg-purple-100 text-purple-700 border-purple-300',
    'active': 'bg-green-100 text-green-700 border-green-300',
    'closed': 'bg-gray-100 text-gray-700 border-gray-300',
  };
  return statusMap[status?.toLowerCase()] || statusMap['pending'];
};

// ─── Priority ────────────────────────────────────────────────────

export const getPriorityLabel = (priority) => {
  const priorityMap = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent',
  };
  return priorityMap[priority?.toLowerCase()] || priority;
};

export const getPriorityColor = (priority) => {
  const priorityMap = {
    'low': 'bg-green-100 text-green-700 border-green-300',
    'medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'high': 'bg-red-100 text-red-700 border-red-300',
    'urgent': 'bg-red-200 text-red-800 border-red-400',
  };
  return priorityMap[priority?.toLowerCase()] || priorityMap['medium'];
};

export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Stationery', 
  'Equipment',
  'Books',
  'Supplies',
  'Sports',
  'Uniform',
  'Other'
];

export const ITEMS_PER_PAGE = 10;

export default {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  getInitials,
  getSubjectColor,
  DAYS,
  TIME_SLOTS,
  getNextTimeSlot,
  timesOverlap,
  getSeverityColor,
  getSeverityBadgeClass,
  SEVERITY_OPTIONS,
  getStatus,
  getStatusBadge,
  getStatusLabel,
  getStatusColor,
  STATUS_OPTIONS,
  getCategoryStyle,
  formatCurrency,
  LOW_STOCK_THRESHOLD,
  COMPLAINT_STATUS_OPTIONS,
  COMPLAINT_TYPE_OPTIONS,
  statusDisplayMap,
  getAssignmentStatus,
  getAssignmentStatusColor,
  getPriorityLabel,
  getPriorityColor,
  CATEGORIES,
  ITEMS_PER_PAGE,
};