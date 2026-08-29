/**
 * ============================================
 * COMPLAINT STATUS GUIDE COMPONENT
 * ============================================
 * 
 * Purpose: Educational component explaining complaint status meanings
 * Features:
 * - Displays three complaint statuses with descriptions
 * - Status badges with color coding
 * - Responsive grid layout (1 column mobile, 3 columns desktop)
 * - Card container with consistent styling
 * - Clean typography with proper hierarchy
 * 
 * Dependencies:
 * - @/components/ui/Card for container
 * - @/components/common/StatusBadge for status indicators
 * 
 * Usage:
 * <ComplaintStatusGuide />
 * ============================================
 */

import Card from '@/components/ui/Card'
import StatusBadge from "@/components/common/StatusBadge"

/**
 * ============================================
 * COMPLAINT STATUS GUIDE COMPONENT
 * ============================================
 * 
 * Renders a guide explaining complaint status meanings
 * 
 * @returns {JSX.Element} Complaint status guide UI
 * 
 * @example
 * // Place in complaint management page
 * <ComplaintStatusGuide />
 * ============================================
 */
const ComplaintStatusGuide = () => {
  /**
   * ============================================
   * STATUS CONFIGURATION
   * ============================================
   * 
   * Defines the complaint statuses and their descriptions
   * 
   * @constant {Array} statuses
   * @property {string} title - Status name (Open, In Progress, Resolved)
   * @property {string} description - Explanation of what the status means
   */
  const statuses = [
    {
      title: "Open",
      description:
        "Your complaint has been submitted and is waiting for review.",
    },
    {
      title: "In Progress",
      description:
        "The administration is currently reviewing your complaint.",
    },
    {
      title: "Resolved",
      description:
        "Your complaint has been resolved successfully.",
    },
  ];

  return (
    <Card>
      {/* â”€â”€â”€ Header Section â”€â”€â”€ */}
      <div className="mb-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl md:text-2xl font-semibold text-text-primary px-4 sm:px-6 lg:px-8">
          Complaint Status Guide
        </h2>

        <p className="mt-1 text-sm md:text-base md:text-base text-text-secondary px-4 sm:px-6 lg:px-8">
          Understand what each complaint status means.
        </p>
      </div>

      {/* â”€â”€â”€ Status Cards Grid â”€â”€â”€ */}
      <div className="grid gap-5 md:grid-cols-3 px-4 sm:px-6 lg:px-8">
        {statuses.map((status) => (
          <div
            key={status.title}
            className="rounded-xl border border-border p-5 px-4 sm:px-6 lg:px-8"
          >
            {/* Status badge with color coding */}
            <StatusBadge status={status.title} />

            {/* Status description */}
            <p className="mt-4 text-sm md:text-base md:text-base leading-6 text-text-secondary px-4 sm:px-6 lg:px-8">
              {status.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ComplaintStatusGuide;