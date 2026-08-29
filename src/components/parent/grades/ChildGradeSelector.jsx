// src/components/parent/grades/ChildGradeSelector.jsx
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, BookOpen } from 'lucide-react';
import { setSelectedChild } from '@/modules/parent/store/parentSlice';
import { selectParentLinks, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const ChildGradeSelector = () => {
  const dispatch = useDispatch();
  const parentLinks = useSelector(selectParentLinks);
  const selectedChild = useSelector(selectSelectedChild);

  const handleChildChange = useCallback((e) => {
    const childId = parseInt(e.target.value);
    dispatch(setSelectedChild(childId));
  }, [dispatch]);

  if (!parentLinks || parentLinks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-full">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No children linked</p>
          <p className="text-xs text-gray-400 max-w-sm">
            Please contact the school to link your children to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Select Child</p>
            <p className="text-xs text-gray-500">Choose a child to view grades</p>
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

export default ChildGradeSelector;