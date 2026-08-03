/**
 * ============================================
 * BEHAVIOR HEADER COMPONENT
 * ============================================
 * 
 * Purpose: Page header for Behavior Logs section
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
 * <BehaviorHeader />
 * ============================================
 */

import PageHeader from "@/components/layout/PageHeader";

/**
 * ============================================
 * BEHAVIOR HEADER COMPONENT
 * ============================================
 * 
 * Renders the page header for behavior logs
 * 
 * @returns {JSX.Element} Behavior header UI
 * 
 * @example
 * // In parent dashboard
 * <BehaviorHeader />
 * ============================================
 */
const BehaviorHeader = () => {
  return (
    <PageHeader
      title="Behavior Logs"
      subtitle="Monitor your child's behavior records, teacher observations, and disciplinary actions."
      breadcrumbs={[
        "Parent",
        "Behavior Logs",
      ]}
    />
  );
};

export default BehaviorHeader;