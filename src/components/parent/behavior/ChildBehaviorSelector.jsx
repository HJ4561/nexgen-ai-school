// src/components/parent/behavior/ChildBehaviorSelector.jsx
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Users } from 'lucide-react';
import { setSelectedChild } from '@/modules/parent/store/parentThunks';
import { selectParentLinks, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const ChildBehaviorSelector = () => {
  const dispatch = useDispatch();
  const parentLinks = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);

  const handleChildChange = useCallback((e) => {
    const childId = parseInt(e.target.value);
    dispatch(setSelectedChild(childId));
  }, [dispatch]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Select Child</p>
            <p className="text-xs text-gray-500">Choose a child to view behavior logs</p>
          </div>
        </div>
        
        <div className="flex-1 sm:max-w-xs">
          <div className="relative">
            <select
              value={selectedChild || ''}
              onChange={handleChildChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm pr-10"
            >
              <option value="">Select a child...</option>
              {parentLinks.map((link) => (
                <option key={link.id} value={link.student || link.id}>
                  {link.student_name || link.name || `Child ${link.id}`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildBehaviorSelector;