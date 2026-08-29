// src/components/AttendanceTabs.jsx - Fixed Version

import React, { useState } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendanceTabs = ({ children, activeTab, onTabChange, tabs }) => {
  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 bg-white rounded-t-xl border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === tab.id 
                ? 'bg-teacher-primary text-white shadow-md' 
                : 'text-text-muted hover:bg-gray-100'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`
                ml-1 px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-b-xl p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default AttendanceTabs;