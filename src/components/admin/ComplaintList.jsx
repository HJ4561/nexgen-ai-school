/**
 * ============================================
 * COMPLAINT LIST COMPONENT
 * ============================================
 * 
 * Purpose: Displays and manages a list of complaints with filtering
 * Features:
 * - Fetch complaints from Redux store with role-based filtering
 * - Search by description or complaint type
 * - Status filter (All, Open, In Progress, Resolved, Rejected)
 * - Type filter (Academic, Behavior, Transport, Facilities, Fees, Other)
 * - Sort by newest/oldest
 * - Complaint cards with view details
 * - Details modal for viewing full complaint information
 * - Loading and empty states
 * - Refresh functionality
 * 
 * Dependencies:
 * - react-redux for state management
 * - @/components/ui/Card for container
 * - @/components/admin/ComplaintCard for list items
 * - @/components/admin/ComplaintFilters for filter controls
 * - @/components/admin/ComplaintDetailsModal for detail view
 * - @/modules/common/store/complaintThunks for API calls
 * 
 * Usage:
 * <ComplaintList role="admin" />
 * ============================================
 */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "@/components/ui/Card";

import ComplaintCard from "@/components/admin/ComplaintCard";
import ComplaintFilters from "@/components/admin/ComplaintFilters";
import ComplaintDetailsModal from "@/components/admin/ComplaintDetailsModal";

import { fetchComplaints } from "@/modules/common/store/complaintThunks";

/**
 * ============================================
 * COMPLAINT LIST COMPONENT
 * ============================================
 * 
 * Renders a filtered list of complaints with detail view
 * 
 * @param {Object} props - Component props
 * @param {string} props.role - User role for styling ('admin', 'teacher', 'student', 'parent')
 * @returns {JSX.Element} Complaint list UI
 * 
 * @example
 * // Admin viewing all complaints
 * <ComplaintList role="admin" />
 * 
 * // Student viewing their own complaints
 * <ComplaintList role="student" />
 * ============================================
 */
const ComplaintList = ({ role }) => {
  const dispatch = useDispatch();

  /**
   * ============================================
   * REDUX STATE SELECTION
   * ============================================
   * 
   * Retrieves complaints and loading state from Redux store
   */
  const {
    complaints = [],
    loading,
  } = useSelector(
    (state) => state.complaints
  );

  /**
   * ============================================
   * FILTERS STATE
   * ============================================
   * 
   * Manages filter values for complaint list
   * - search: Text search for description/type
   * - status: Filter by complaint status
   * - type: Filter by complaint type
   * - sort: Sort order (newest/oldest)
   */
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    type: "All",
    sort: "newest",
  });

  /**
   * ============================================
   * SELECTED COMPLAINT STATE
   * ============================================
   * 
   * Tracks the currently selected complaint for detail view
   */
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  /**
   * ============================================
   * FETCH COMPLAINTS
   * ============================================
   * 
   * Fetches complaints from API when component mounts or role changes
   * Dispatches fetchComplaints action with role parameter
   */
  useEffect(() => {
    dispatch(fetchComplaints(role));
  }, [dispatch, role]);

  /**
   * ============================================
   * HANDLE FILTER CHANGE
   * ============================================
   * 
   * Updates filter state when a filter value changes
   * 
   * @param {string} field - The filter field to update
   * @param {*} value - The new filter value
   */
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * ============================================
   * FILTER COMPLAINTS
   * ============================================
   * 
   * Applies all filters to the complaints list
   * - Search: Matches description or complaint type
   * - Status: Exact match on status
   * - Type: Exact match on complaint type
   * - Sort: Newest or oldest by created_at date
   * 
   * @returns {Array} Filtered and sorted complaints
   */
  const filteredComplaints = useMemo(() => {
    let data = [...complaints];

    // ─── Search Filter ───
    if (filters.search.trim()) {
      const keyword = filters.search.toLowerCase();
      data = data.filter(
        (item) =>
          item.description?.toLowerCase().includes(keyword) ||
          item.complaint_type?.toLowerCase().includes(keyword)
      );
    }

    // ─── Status Filter ───
    if (filters.status !== "All") {
      data = data.filter(
        (item) => item.status === filters.status
      );
    }

    // ─── Type Filter ───
    if (filters.type !== "All") {
      data = data.filter(
        (item) => item.complaint_type === filters.type
      );
    }

    // ─── Sort ───
    data.sort((a, b) => {
      const first = new Date(a.created_at);
      const second = new Date(b.created_at);
      return filters.sort === "newest" ? second - first : first - second;
    });

    return data;
  }, [complaints, filters]);

  /**
   * ============================================
   * HANDLE REFRESH
   * ============================================
   * 
   * Refetches complaints from API
   */
  const handleRefresh = () => {
    dispatch(fetchComplaints(role));
  };

  return (
    <>
      <Card hover={false} tone={role}>
        {/* ==========================================
            HEADER SECTION
            Title and description
        ========================================== */}

        <div className="mb-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl md:text-2xl font-semibold px-4 sm:px-6 lg:px-8">
            Complaint History
          </h2>

          <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
            View and track your submitted complaints.
          </p>
        </div>

        {/* ==========================================
            FILTERS SECTION
            Search, status, type, and sort controls
        ========================================== */}

        <ComplaintFilters
          role={role}
          filters={filters}
          onChange={handleFilterChange}
          onRefresh={handleRefresh}
        />

        {/* ==========================================
            COMPLAINT LIST SECTION
            Renders complaint cards or empty state
        ========================================== */}

        <div className="space-y-4 px-4 sm:px-6 lg:px-8">
          {loading ? (
            // ─── Loading State ───
            <div className="py-12 text-center px-4 sm:px-6 lg:px-8">
              Loading complaints...
            </div>
          ) : filteredComplaints.length === 0 ? (
            // ─── Empty State ───
            <div className="py-12 text-center px-4 sm:px-6 lg:px-8">
              No complaints found. Try adjusting your filters or submit a new complaint.
            </div>
          ) : (
            // ─── Complaint Cards ───
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                role={role}
                onView={() => setSelectedComplaint(complaint)}
              />
            ))
          )}
        </div>
      </Card>

      {/* ==========================================
          DETAILS MODAL
          Shows full complaint details when selected
      ========================================== */}

      <ComplaintDetailsModal
        open={Boolean(selectedComplaint)}
        complaint={selectedComplaint}
        role={role}
        onClose={() => setSelectedComplaint(null)}
      />
    </>
  );
};

export default ComplaintList;