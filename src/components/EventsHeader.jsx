/**
 * ============================================
 * EVENTS HEADER COMPONENT
 * ============================================
 * 
 * Purpose: Page header for Events & Activities section
 * Features:
 * - Title and subtitle display
 * - Breadcrumb navigation
 * - Reuses PageHeader component
 * - Parent role context
 * 
 * Dependencies:
 * - @/components/layout/PageHeader for header structure
 * 
 * Usage:
 * <EventsHeader />
 * ============================================
 */

import PageHeader from "@/components/layout/PageHeader";

/**
 * ============================================
 * EVENTS HEADER COMPONENT
 * ============================================
 * 
 * Renders the page header for events and activities
 * 
 * @returns {JSX.Element} Events header UI
 * 
 * @example
 * // In parent dashboard
 * <EventsHeader />
 * ============================================
 */
const EventsHeader = () => {
  return (
    <PageHeader
      title="Events & Activities"
      subtitle="Discover upcoming school events and track your participation history."
      breadcrumbs={[
        "Parent",
        "Events",
      ]}
    />
  );
};

export default EventsHeader;