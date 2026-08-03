// Helper functions for admin pages

export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
        case 'high': return 'bg-red-100 text-red-700 border-red-300';
        case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'low': return 'bg-green-100 text-green-700 border-green-300';
        default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
};

export const getCategoryStyle = (category) => {
    const styles = {
        'Electronics': 'bg-blue-100 text-blue-700 border-blue-200',
        'Furniture': 'bg-green-100 text-green-700 border-green-200',
        'Stationery': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Equipment': 'bg-purple-100 text-purple-700 border-purple-200',
        'Default': 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[category] || styles.Default;
};

export const getStatus = (status) => {
    const statusMap = {
        'available': { label: 'Available', className: 'bg-green-100 text-green-700' },
        'in-use': { label: 'In Use', className: 'bg-yellow-100 text-yellow-700' },
        'maintenance': { label: 'Maintenance', className: 'bg-red-100 text-red-700' },
        'out-of-stock': { label: 'Out of Stock', className: 'bg-gray-100 text-gray-700' },
    };
    return statusMap[status] || statusMap['available'];
};

export const getNextTimeSlot = (time) => {
    const hours = parseInt(time.split(':')[0]);
    const nextHour = hours + 1;
    return `${String(nextHour).padStart(2, '0')}:00`;
};

export const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
