// src/components/TermSelector.jsx

/**
 * ============================================
 * TERM SELECTOR COMPONENT
 * ============================================
 * 
 * Purpose: Allows filtering grades by term
 * Used by: Parent grades pages
 * 
 * Features:
 * - Dropdown to select academic term
 * - Shows available terms from API data
 * - Displays selected term count
 * 
 * API Fields Used:
 * - term from results data
 * - term_name from results data
 * 
 * IMPORTANT: These fields are READ-ONLY - only appear in responses.
 * Do NOT send them in POST/PATCH request bodies.
 * ============================================
 */

import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar, X, Layers } from "lucide-react";

import { 
  selectGrades, 
  selectSelectedChild,
  selectSelectedTerm,
  setSelectedTerm,
} from "@/modules/parent/store/parentSlice";

// ─── Helper Functions ──────────────────────────────────────────────────

const getTermFromResult = (result) => {
  // Try different possible field names for term
  return result.term || 
         result.term_name || 
         result.exam?.term || 
         result.exam?.term_name || 
         result.exam_type ||
         result.exam?.exam_type ||
         "General";
};

const formatTermDisplay = (term) => {
  if (!term || term === "All Terms") return "All Terms";
  // Format: "2025-26 Term 1" -> "Term 1 (2025-26)"
  const match = term.match(/(\d{4}-\d{2})\s*(.+)/);
  if (match) {
    return `${match[2]} (${match[1]})`;
  }
  // Format: "Term 1" -> "Term 1"
  return term;
};

// ─── Main Component ────────────────────────────────────────────────────

const TermSelector = ({ onTermChange, className = "" }) => {
  const dispatch = useDispatch();
  const grades = useSelector(selectGrades);
  const selectedChild = useSelector(selectSelectedChild);
  const selectedTerm = useSelector(selectSelectedTerm);

  // ─── Get unique terms from grades ──────────────────────────────────
  const availableTerms = useMemo(() => {
    if (!grades || grades.length === 0) {
      return ["All Terms"];
    }

    // Filter by selected child if needed
    const childGrades = selectedChild 
      ? grades.filter(g => g.student === selectedChild || g.student_id === selectedChild)
      : grades;

    // Extract unique terms
    const terms = new Set();
    childGrades.forEach(result => {
      const term = getTermFromResult(result);
      if (term) terms.add(term);
    });

    return ["All Terms", ...Array.from(terms)];
  }, [grades, selectedChild]);

  // ─── Count grades per term ──────────────────────────────────────────
  const termCounts = useMemo(() => {
    const counts = {};
    const childGrades = selectedChild 
      ? grades?.filter(g => g.student === selectedChild || g.student_id === selectedChild)
      : grades;

    childGrades?.forEach(result => {
      const term = getTermFromResult(result);
      counts[term] = (counts[term] || 0) + 1;
    });

    return counts;
  }, [grades, selectedChild]);

  // ─── Handle term change ─────────────────────────────────────────────
  const handleTermChange = (e) => {
    const term = e.target.value;
    const termValue = term === "All Terms" ? null : term;
    dispatch(setSelectedTerm(termValue));
    if (onTermChange) {
      onTermChange(termValue);
    }
  };

  // ─── Clear term filter ──────────────────────────────────────────────
  const handleClearTerm = () => {
    dispatch(setSelectedTerm(null));
    if (onTermChange) {
      onTermChange(null);
    }
  };

  // ─── If no grades, show message ─────────────────────────────────────
  if (!grades || grades.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-400">
          <Layers className="w-4 h-4" />
          <span className="text-sm">No grades available to filter</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* ─── Term Dropdown ──────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-[180px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar className="w-4 h-4" />
          </div>
          <select
            value={selectedTerm || "All Terms"}
            onChange={handleTermChange}
            className="appearance-none bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full cursor-pointer hover:border-indigo-300"
          >
            {availableTerms.map((term) => {
              const count = termCounts[term] || 0;
              const displayName = term === "All Terms" ? "All Terms" : formatTermDisplay(term);
              return (
                <option key={term} value={term}>
                  {displayName} ({count})
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* ─── Clear Filter Button ────────────────────────────────────── */}
        <AnimatePresence>
          {selectedTerm && selectedTerm !== "All Terms" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClearTerm}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-all"
            >
              <X className="w-4 h-4" />
              Clear
            </motion.button>
          )}
        </AnimatePresence>

        {/* ─── Term Count Badge ───────────────────────────────────────── */}
        {selectedTerm && selectedTerm !== "All Terms" && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-medium"
          >
            {termCounts[selectedTerm] || 0} results
          </motion.span>
        )}

        {/* ─── Total Results ──────────────────────────────────────────── */}
        <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          Total: {grades.length} {selectedChild ? '• Selected child' : ''}
        </span>
      </div>
    </motion.div>
  );
};

export default TermSelector;