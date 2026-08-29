// src/components/parent/behavior/BehaviorHeader.jsx
import React from 'react';
import { Shield, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const BehaviorHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Behavior Logs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your child's behavior and conduct records
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-700">Active</span>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <Clock className="w-4 h-4 inline mr-1" />
          Filter
        </button>
      </div>
    </div>
  );
};

export default BehaviorHeader;