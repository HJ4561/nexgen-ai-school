// src/components/parent/grades/SubjectPerformanceTable.jsx
import React, { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Search, X, Eye, Calendar, BookOpen, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Pagination from '@/components/admin/Pagination';
import { selectGrades, selectSelectedChild, selectSelectedTerm } from '@/modules/parent/store/parentSlice';

const ITEMS_PER_PAGE = 8;

const SubjectPerformanceTable = () => {
  const grades = useSelector(selectGrades);
  const selectedChild = useSelector(selectSelectedChild);
  const selectedTerm = useSelector(selectSelectedTerm);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Filter Logic ──────────────────────────────────────────────────
  const filteredGrades = useMemo(() => {
    let filtered = grades;

    // Filter by selected child
    if (selectedChild) {
      filtered = filtered.filter(g => g.student === selectedChild || g.student_id === selectedChild);
    }

    // Filter by selected term
    if (selectedTerm && selectedTerm !== 'all') {
      filtered = filtered.filter(g => g.exam_type === selectedTerm);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.subject_name?.toLowerCase().includes(search) ||
        g.exam_name?.toLowerCase().includes(search) ||
        g.exam_type?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [grades, selectedChild, selectedTerm, searchTerm]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredGrades.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = filteredGrades.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ─── Handlers ──────────────────────────────────────────────────
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // ─── Helper Functions ──────────────────────────────────────────
  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (percentage >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (percentage >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const getGradeLabel = (percentage) => {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  if (filteredGrades.length === 0) {
    return (
      <Card className="p-4 md:p-6 text-center border border-gray-100">
        <div className="flex flex-col items-center gap-2">
          <BookOpen className="w-8 h-8 text-gray-300" />
          <p className="text-sm text-gray-500">No performance data found</p>
          <p className="text-xs text-gray-400">Try adjusting your filters</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gray-50/60">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Subject Performance Details
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:flex-none relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-48 pl-9 pr-4 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs md:text-sm"
                />
              </div>
              {searchTerm && (
                <button onClick={clearSearch} className="px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1">
                  <X className="w-3 h-3 md:w-3.5 md:h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Showing {filteredGrades.length} result{filteredGrades.length > 1 ? 's' : ''}
            {selectedChild && ' for selected child'}
            {selectedTerm && selectedTerm !== 'all' && ` in ${selectedTerm}`}
          </div>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {pageItems.map((grade) => (
            <div key={grade.id} className="p-4 hover:bg-blue-50/30 transition-colors border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{grade.subject_name || 'Subject'}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <Badge className={`${getGradeColor(grade.percentage)} text-[10px]`}>
                      {getGradeLabel(grade.percentage)}
                    </Badge>
                    <span className="text-xs text-gray-500">{grade.exam_type || 'Exam'}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    {grade.marks_obtained || 0}/{grade.total_marks || 0}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800">{grade.percentage || 0}%</span>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 ml-auto">
                    <div
                      className={`h-full rounded-full ${
                        grade.percentage >= 80 ? 'bg-emerald-500' :
                        grade.percentage >= 60 ? 'bg-blue-500' :
                        grade.percentage >= 40 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(grade.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Exam</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Marks</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Percentage</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.map((grade) => (
                <tr key={grade.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-800 truncate max-w-[120px]">
                        {grade.subject_name || 'Subject'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-[120px]">
                    {grade.exam_name || '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                      {grade.exam_type || '—'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800">
                    {grade.marks_obtained || 0}/{grade.total_marks || 0}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{grade.percentage || 0}%</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            grade.percentage >= 80 ? 'bg-emerald-500' :
                            grade.percentage >= 60 ? 'bg-blue-500' :
                            grade.percentage >= 40 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(grade.percentage || 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge className={`${getGradeColor(grade.percentage)} text-xs`}>
                      {getGradeLabel(grade.percentage)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {formatDate(grade.exam_date || grade.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGrades.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          itemsShown={pageItems.length}
          totalItems={filteredGrades.length}
          onPageChange={setCurrentPage}
        />
      )}
    </Card>
  );
};

export default SubjectPerformanceTable;