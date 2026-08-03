/**
 * ============================================
 * PARTICIPATION LIST COMPONENT
 * ============================================
 * 
 * Purpose: Displays and manages event participation history for parent view
 * Features:
 * - Filters participations by search and sort
 * - Displays participations in card format
 * - Child selection from parentLinks
 * - Loading and empty states
 * - Details modal for viewing full participation information
 * - Role-based theming (parent)
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (Trophy)
 * - @/components/ui/Card for container
 * - react-redux for state management
 * - ParticipationCard for individual participation display
 * - ParticipationDetailsModal for detailed view
 * - EventFilters for filter controls
 * 
 * Usage:
 * <ParticipationList />
 * ============================================
 */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { Trophy } from "lucide-react";

import Card from '@/components/ui/Card';

import ParticipationCard from "./ParticipationCard";
import ParticipationDetailsModal from "./ParticipationDetailsModal";
import EventFilters from "./EventFilters";

/**
 * ============================================
 * PARTICIPATION LIST COMPONENT
 * ============================================
 * 
 * Renders a filtered list of event participations with detail view
 * 
 * @returns {JSX.Element} Participation list UI
 * 
 * @example
 * // In parent dashboard
 * <ParticipationList />
 * ============================================
 */
const ParticipationList = () => {
  // ─── Redux State ──────────────────────────────────────────────────────
  const {
    events = [],
    parentLinks = [],
    certificates = [],
    selectedChild,
    loading,
  } = useSelector((state) => state.parent);

  /**
   * ============================================
   * CURRENT CHILD
   * ============================================
   * 
   * Finds the current child from parentLinks
   * Falls back to the first child if selectedChild is not found
   */
  const currentChild = useMemo(() => {
    return (
      parentLinks.find(
        (child) => child.student === selectedChild
      ) || parentLinks[0]
    );
  }, [parentLinks, selectedChild]);

  /**
   * ============================================
   * FILTERS STATE
   * ============================================
   * 
   * Manages filter values for participations
   * - search: Text search for event name, role, or student
   * - sort: Sort order (newest, oldest)
   */
  const [filters, setFilters] = useState({
    search: "",
    sort: "newest",
  });

  /**
   * ============================================
   * SELECTED PARTICIPATION
   * ============================================
   * 
   * Tracks the currently selected participation for detail view
   */
  const [selectedParticipation, setSelectedParticipation] = useState(null);

  /**
   * ============================================
   * HANDLE FILTER CHANGE
   * ============================================
   * 
   * Updates a specific filter field
   * 
   * @param {string} field - The filter field to update
   * @param {*} value - The new filter value
   */
  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * ============================================
   * RESET FILTERS
   * ============================================
   * 
   * Resets all filters to default values
   * Also triggers a refresh of the list
   */
  const handleReset = () => {
    setFilters({
      search: "",
      sort: "newest",
    });
  };

  /**
   * ============================================
   * FILTER EVENTS
   * ============================================
   * 
   * Applies all filters to the events:
   * 1. Filters by selected child
   * 2. Search: Matches event name, role, or student name
   * 3. Sort: Newest or oldest by event date
   * 
   * @returns {Array} Filtered and sorted events
   */
  const filteredEvents = useMemo(() => {
    if (!currentChild) return [];

    // Filter by selected child
    let data = events.filter(
      (event) => event.student_name === currentChild.student_name
    );

    // ─── Search Filter ───
    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(
        (event) =>
          event.event_name.toLowerCase().includes(keyword) ||
          event.role.toLowerCase().includes(keyword) ||
          event.student_name.toLowerCase().includes(keyword)
      );
    }

    // ─── Sort ───
    data.sort((a, b) => {
      const first = new Date(a.event_date);
      const second = new Date(b.event_date);
      return filters.sort === "newest" ? second - first : first - second;
    });

    return data;
  }, [events, currentChild, filters]);

  return (
    <>
      <Card hover={false}>
        {/* ─── Header ────────────────────────────────────────────── */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Participation History
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Review your child's participation in school events.
          </p>
        </div>

        {/* ─── Filters ────────────────────────────────────────────── */}
        <EventFilters
          filters={filters}
          onChange={handleChange}
          onRefresh={handleReset}
        />

        {/* ─── Participation List ────────────────────────────────── */}
        <div className="space-y-4">
          {loading ? (
            // ─── Loading State ───
            <div className="py-12 text-center">
              Loading...
            </div>
          ) : filteredEvents.length === 0 ? (
            // ─── Empty State ───
            <div className="flex flex-col items-center py-16">
              <Trophy size={42} className="text-slate-400" />
              <h3 className="mt-4 text-lg font-semibold">
                No Participation Found
              </h3>
              <p className="mt-2 text-sm text-text-secondary">
                No participation records are available.
              </p>
            </div>
          ) : (
            // ─── Participation Cards ───
            filteredEvents.map((participation) => (
              <ParticipationCard
                key={participation.id}
                participation={participation}
                certificates={certificates}
                onView={setSelectedParticipation}
              />
            ))
          )}
        </div>
      </Card>

      {/* ─── Details Modal ────────────────────────────────────────── */}
      <ParticipationDetailsModal
        open={Boolean(selectedParticipation)}
        participation={selectedParticipation}
        onClose={() => setSelectedParticipation(null)}
      />
    </>
  );
};

export default ParticipationList;