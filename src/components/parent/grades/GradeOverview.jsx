/**
 * ============================================
 * GRADE OVERVIEW COMPONENT
 * ============================================
 * 
 * Purpose: Displays grade statistics summary for parent view
 * Features:
 * - Overall average percentage
 * - Number of subjects
 * - Highest score
 * - Lowest score
 * - Marks obtained / total marks
 * - Color-coded stat cards with icons
 * - Role-based theming (parent)
 * - Responsive grid layout (1/2/5 columns)
 * 
 * Dependencies:
 * - lucide-react for icons (Award, BookOpen, TrendingUp, TrendingDown, GraduationCap)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * 
 * Usage:
 * <GradeOverview />
 * ============================================
 */

import { useMemo } from "react";
import { useSelector } from "react-redux";

import Card from '@/components/ui/Card';

import {
  Award,
  BookOpen,
  TrendingUp,
  TrendingDown,
  GraduationCap,
} from "lucide-react";

/**
 * ============================================
 * GRADE OVERVIEW COMPONENT
 * ============================================
 * 
 * Renders grade statistics in a visual card grid
 * 
 * @returns {JSX.Element} Grade overview UI
 * 
 * @example
 * // In parent dashboard
 * <GradeOverview />
 * ============================================
 */
const GradeOverview = () => {
  /**
   * ============================================
   * REDUX STATE
   * ============================================
   * 
   * Retrieves grades, parentLinks, selectedChild, and selectedTerm
   */
  const {
    grades,
    parentLinks,
    selectedChild,
    selectedTerm,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * SELECTED CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Returns undefined if not found
   */
  const currentChild = useMemo(
    () =>
      parentLinks.find(
        (child) => child.student === selectedChild
      ),
    [parentLinks, selectedChild]
  );

  /**
   * ============================================
   * FILTER GRADES
   * ============================================
   * 
   * Filters grades for the selected child and exam type
   * - Filters by student name
   * - Filters by exam type (or shows all if "All" selected)
   */
  const filteredGrades = useMemo(() => {
    if (!currentChild) return [];

    return grades.filter(
      (item) =>
        item.student_name === currentChild.student_name &&
        (selectedTerm === "All" || item.exam_type === selectedTerm)
    );
  }, [grades, currentChild, selectedTerm]);

  /**
   * ============================================
   * STATISTICS
   * ============================================
   * 
   * Calculates grade statistics:
   * - average: Weighted average percentage (obtained/total)
   * - highest: Highest percentage among all grades
   * - lowest: Lowest percentage among all grades
   * - obtained: Total obtained marks
   * - total: Total possible marks
   * - subjects: Number of unique subjects
   * 
   * Returns default values if no grades exist
   */
  const stats = useMemo(() => {
    // Return default values if no filtered grades
    if (!filteredGrades.length) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        obtained: 0,
        total: 0,
        subjects: 0,
      };
    }

    // Calculate percentages for each grade
    const percentages = filteredGrades.map(
      (item) => (Number(item.obtained_marks) / Number(item.total_marks)) * 100
    );

    // Sum obtained marks
    const obtained = filteredGrades.reduce(
      (sum, item) => sum + Number(item.obtained_marks),
      0
    );

    // Sum total marks
    const total = filteredGrades.reduce(
      (sum, item) => sum + Number(item.total_marks),
      0
    );

    return {
      average: (obtained / total) * 100,
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      obtained,
      total,
      subjects: new Set(filteredGrades.map((item) => item.subject_name)).size,
    };
  }, [filteredGrades]);

  /**
   * ============================================
   * STAT CARDS CONFIGURATION
   * ============================================
   * 
   * Defines the configuration for each statistic card
   * 
   * @constant {Array} cards
   * @property {string} title - Display label for the stat
   * @property {string|number} value - The statistic value
   * @property {Component} icon - Lucide icon component
   * @property {string} iconBg - Background color class for the icon container
   * @property {string} iconColor - Text color class for the icon
   */
  const cards = [
    {
      title: "Overall Average",
      value: `${stats.average.toFixed(2)}%`,
      icon: Award,
      iconBg: "bg-parent-primary/10",
      iconColor: "text-parent-primary",
    },
    {
      title: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Highest Score",
      value: `${stats.highest.toFixed(2)}%`,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Lowest Score",
      value: `${stats.lowest.toFixed(2)}%`,
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Marks",
      value: `${stats.obtained.toFixed(2)} / ${stats.total.toFixed(2)}`,
      icon: GraduationCap,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {/* ─── Render each stat card ─── */}
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} hover={false} className="h-full">
            <div className="flex items-center justify-between">
              {/* Stat label and value */}
              <div>
                <p className="text-sm text-text-secondary">
                  {card.title}
                </p>

                <h3 className="mt-2 text-2xl font-bold text-text-primary">
                  {card.value}
                </h3>
              </div>

              {/* Icon container with color coding */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon size={22} className={card.iconColor} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default GradeOverview;