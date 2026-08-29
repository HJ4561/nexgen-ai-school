/**
 * ============================================
 * CHILD GRADE SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows parent to select a child and view their grades
 * Used by: Parent module pages
 * 
 * Features:
 * - Child selection dropdown
 * - Grade display for selected child
 * - Subject-wise grades
 * - Grade summary
 * 
 * Dependencies:
 * - react for component
 * - react-redux for state management
 * - @/modules/parent/store/parentSlice for actions
 * 
 * Usage:
 * <ChildGradeSelector />
 * ============================================
 */

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, GraduationCap } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { setSelectedChild } from "@/modules/parent/store/parentSlice";

const ChildGradeSelector = () => {
  const dispatch = useDispatch();
  const { parentLinks, selectedChild, grades, loading } = useSelector((state) => state.parent);

  const handleChildChange = (childId) => {
    dispatch(setSelectedChild(childId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!parentLinks || parentLinks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-text-secondary">No children found. Please add your children first.</p>
      </Card>
    );
  }

  const selectedChildData = parentLinks.find(c => c.id === selectedChild || c.student === selectedChild);
  const childGrades = grades.filter(g => g.student === selectedChild || g.student_id === selectedChild);

  return (
    <div className="space-y-6">
      {/* Child Selector */}
      <Card>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-text-primary">Select Child</h3>
            </div>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedChild || ""}
                onChange={(e) => handleChildChange(Number(e.target.value))}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium outline-none transition-colors focus:border-blue-500"
              >
                <option value="">Select a child...</option>
                {parentLinks.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.student_name} - {child.class || "N/A"}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      {/* Child Details */}
      {selectedChildData && (
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold text-text-primary">{selectedChildData.student_name}</h4>
                <p className="text-sm text-text-secondary">
                  {selectedChildData.class} {selectedChildData.section ? `- Section ${selectedChildData.section}` : ""}
                </p>
                <p className="text-xs text-text-secondary">
                  Admission: {selectedChildData.admission_no || "N/A"}
                </p>
              </div>
              <Badge color="success" className="text-sm px-4 py-1.5">
                {selectedChildData.relation || "Child"}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Grades Display */}
      {selectedChild && childGrades && childGrades.length > 0 && (
        <Card>
          <div className="p-4 sm:p-6">
            <h4 className="text-lg font-semibold text-text-primary mb-4">Grades</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {childGrades.map((grade, index) => (
                <div key={index} className="rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-medium text-text-primary">{grade.subject_name || "Subject"}</p>
                  <p className="text-sm text-text-secondary">{grade.exam_type || "Exam"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{grade.marks_obtained || 0}</span>
                    <span className="text-sm text-text-secondary">/ {grade.total_marks || 0}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {grade.grade_letter && (
                      <Badge color="info" className="text-xs">
                        {grade.grade_letter}
                      </Badge>
                    )}
                    {grade.percentage && (
                      <span className="text-xs text-text-secondary">{grade.percentage}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* No Grades Message */}
      {selectedChild && (!childGrades || childGrades.length === 0) && (
        <Card>
          <div className="p-8 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-secondary">No grades available for this child.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChildGradeSelector;