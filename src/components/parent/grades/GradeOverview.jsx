// src/components/parent/grades/GradeOverview.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TrendingUp, BookOpen, Award, Star, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { selectGrades, selectSelectedChild } from '@/modules/parent/store/parentSlice';

const GradeOverview = () => {
  const grades = useSelector(selectGrades);
  const selectedChild = useSelector(selectSelectedChild);

  const stats = useMemo(() => {
    // Filter grades by selected child
    let filteredGrades = grades;
    if (selectedChild) {
      filteredGrades = grades.filter(g => g.student === selectedChild || g.student_id === selectedChild);
    }

    if (filteredGrades.length === 0) {
      return {
        average: 0,
        totalSubjects: 0,
        highest: 0,
        lowest: 0,
        totalMarks: 0,
        obtainedMarks: 0,
        percentage: 0,
      };
    }

    const totalMarks = filteredGrades.reduce((sum, g) => sum + (g.total_marks || 0), 0);
    const obtainedMarks = filteredGrades.reduce((sum, g) => sum + (g.marks_obtained || 0), 0);
    const percentages = filteredGrades.map(g => 
      g.total_marks > 0 ? (g.marks_obtained / g.total_marks) * 100 : 0
    );
    
    return {
      average: percentages.length > 0 
        ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) 
        : 0,
      totalSubjects: filteredGrades.length,
      highest: percentages.length > 0 ? Math.round(Math.max(...percentages)) : 0,
      lowest: percentages.length > 0 ? Math.round(Math.min(...percentages)) : 0,
      totalMarks,
      obtainedMarks,
      percentage: totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0,
    };
  }, [grades, selectedChild]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="p-3 md:p-4 border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Average</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800 mt-0.5 md:mt-1">{stats.average}%</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Overall average</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-600 mt-0.5 md:mt-1">{stats.totalSubjects}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Total subjects</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Highest</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600 mt-0.5 md:mt-1">{stats.highest}%</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Best performance</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-4 border-l-4 border-l-amber-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">Lowest</p>
            <p className="text-xl md:text-2xl font-bold text-amber-600 mt-0.5 md:mt-1">{stats.lowest}%</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">Needs improvement</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GradeOverview;