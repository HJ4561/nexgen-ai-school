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
    <Card className="p-4 sm:p-4 sm:p-6 sm:p-4 sm:p-6 border-t-4 border-t-blue-500 bg-white shadow-sm hover:shadow-md transition-shadow px-4 sm:px-6 lg:px-8">
      <p className="text-sm md:text-base md:text-base font-medium text-gray-500 px-4 sm:px-6 lg:px-8">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-2 px-4 sm:px-6 lg:px-8">{value}</p>
      {footerText && (
        <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3 sm:gap-4 sm:gap-5 sm:gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 mt-3 px-4 sm:px-6 lg:px-8">
          {footerIcon && (
            <span className={footerColors[footerColor] || 'text-gray-500'}>
              {footerIcon}
            </span>
          )}
          <span className={`text-sm md:text-base md:text-base ${footerColors[footerColor] || 'text-gray-500'}`}>
            {footerText}
          </span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;