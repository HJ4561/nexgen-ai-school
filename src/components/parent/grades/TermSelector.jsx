// src/components/parent/grades/TermSelector.jsx
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Filter } from 'lucide-react';
import { setSelectedTerm } from '@/modules/parent/store/parentSlice';
import { selectGrades, selectSelectedTerm } from '@/modules/parent/store/parentSlice';

const TermSelector = () => {
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const selectedTerm = useSelector(selectSelectedTerm);

  // Get unique terms from grades
  const terms = useMemo(() => {
    const termSet = new Set();
    grades.forEach(grade => {
      if (grade.exam_type) {
        termSet.add(grade.exam_type);
      }
    });
    return Array.from(termSet);
  }, [grades]);

  const handleTermChange = useCallback((e) => {
    dispatch(setSelectedTerm(e.target.value));
  }, [dispatch]);

  if (terms.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Filter by Term</p>
            <p className="text-xs text-gray-500">Select an exam type to filter</p>
          </div>
        </div>
        
        <div className="flex-1 sm:max-w-xs">
          <div className="relative">
            <select
              value={selectedTerm || 'all'}
              onChange={handleTermChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm pr-10"
            >
              <option value="all">All Terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term.charAt(0).toUpperCase() + term.slice(1)}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermSelector;