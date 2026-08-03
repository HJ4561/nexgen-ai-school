import React from 'react';
import { Badge } from '@/components/ui/Badge';

const StatusBadge = ({ status, statusMap, className = "" }) => {
  if (!status) return null;
  
  const statusInfo = statusMap?.[status] || { 
    label: status, 
    color: "bg-gray-50 text-gray-700 border-gray-200" 
  };
  
  return (
    <Badge className={`${statusInfo.color} text-xs ${className}`}>
      {statusInfo.label}
    </Badge>
  );
};

export default StatusBadge;
