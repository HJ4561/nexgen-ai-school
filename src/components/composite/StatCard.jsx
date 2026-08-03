// src/components/composite/Statcard.jsx
import React from 'react';
import Card from '@/components/ui/Card';

const StatCard = ({ 
  label, 
  value, 
  tone = "admin", 
  footerText, 
  footerColor, 
  footerIcon 
}) => {
  const toneColors = {
    admin: "border-blue-500 bg-blue-50",
    teacher: "border-purple-500 bg-purple-50",
    student: "border-emerald-500 bg-emerald-50",
    parent: "border-amber-500 bg-amber-50",
  };

  const footerColors = {
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600",
  };

  return (
    <Card className="p-6 border-t-4 border-t-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      {footerText && (
        <div className="flex items-center gap-2 mt-3">
          {footerIcon && (
            <span className={footerColors[footerColor] || 'text-gray-500'}>
              {footerIcon}
            </span>
          )}
          <span className={`text-sm ${footerColors[footerColor] || 'text-gray-500'}`}>
            {footerText}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;