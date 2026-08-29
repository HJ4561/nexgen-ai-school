// src/components/parent/grades/GradeChart.jsx
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BarChart3, TrendingUp } from 'lucide-react';
import Card from '@/components/ui/Card';
import { selectGrades, selectSelectedChild, selectSelectedTerm } from '@/modules/parent/store/parentSlice';

const GradeChart = () => {
  const grades = useSelector(selectGrades);
  const selectedChild = useSelector(selectSelectedChild);
  const selectedTerm = useSelector(selectSelectedTerm);

  // Process data for chart
  const chartData = useMemo(() => {
    // Filter grades by selected child
    let filteredGrades = grades;
    if (selectedChild) {
      filteredGrades = grades.filter(g => g.student === selectedChild || g.student_id === selectedChild);
    }

    // Filter by selected term
    if (selectedTerm && selectedTerm !== 'all') {
      filteredGrades = filteredGrades.filter(g => g.exam_type === selectedTerm);
    }

    // Group by subject
    const subjectMap = {};
    filteredGrades.forEach(grade => {
      const subjectName = grade.subject_name || 'Unknown Subject';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = [];
      }
      subjectMap[subjectName].push({
        marks: grade.marks_obtained || 0,
        total: grade.total_marks || 0,
        percentage: grade.total_marks > 0 
          ? Math.round((grade.marks_obtained / grade.total_marks) * 100) 
          : 0,
      });
    });

    // Calculate average percentage per subject
    return Object.entries(subjectMap).map(([subject, values]) => {
      const avgPercentage = values.reduce((sum, v) => sum + v.percentage, 0) / values.length;
      return {
        subject,
        percentage: Math.round(avgPercentage),
        count: values.length,
      };
    });
  }, [grades, selectedChild, selectedTerm]);

  const maxPercentage = useMemo(() => {
    if (chartData.length === 0) return 100;
    const max = Math.max(...chartData.map(d => d.percentage));
    return Math.ceil(max / 10) * 10;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="p-6 md:p-8 text-center border border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <BarChart3 className="w-12 h-12 text-gray-300" />
          <p className="text-gray-500 font-medium">No grade data available</p>
          <p className="text-sm text-gray-400">Grades will appear here once available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Subject Performance</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span>Percentage</span>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {chartData.map((item) => (
          <div key={item.subject} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs md:text-sm font-medium text-gray-700 truncate max-w-[120px] md:max-w-[200px]">
                {item.subject}
              </span>
              <span className="text-xs md:text-sm font-semibold text-gray-800">
                {item.percentage}%
              </span>
            </div>
            <div className="relative w-full h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80 ${
                  item.percentage >= 80 ? 'bg-emerald-500' :
                  item.percentage >= 60 ? 'bg-blue-500' :
                  item.percentage >= 40 ? 'bg-amber-500' :
                  'bg-red-500'
                }`}
                style={{ 
                  width: `${(item.percentage / maxPercentage) * 100}%`,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
              {/* Gradient overlay for visual interest */}
              <div 
                className="absolute left-0 top-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))'
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[8px] md:text-[10px] text-gray-400">
                {item.count} exam{item.count > 1 ? 's' : ''}
              </span>
              {item.percentage >= 80 && (
                <span className="text-[8px] md:text-[10px] text-emerald-600 font-medium">Excellent</span>
              )}
              {item.percentage >= 60 && item.percentage < 80 && (
                <span className="text-[8px] md:text-[10px] text-blue-600 font-medium">Good</span>
              )}
              {item.percentage >= 40 && item.percentage < 60 && (
                <span className="text-[8px] md:text-[10px] text-amber-600 font-medium">Average</span>
              )}
              {item.percentage < 40 && (
                <span className="text-[8px] md:text-[10px] text-red-600 font-medium">Needs Improvement</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-[10px] md:text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">Excellent (80%+)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-600">Good (60-79%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-gray-600">Average (40-59%)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Poor (&lt;40%)</span>
          </span>
        </div>
        <div className="text-[10px] md:text-xs text-gray-400">
          {chartData.length} subjects
        </div>
      </div>
    </Card>
  );
};

export default GradeChart;