/**
 * ============================================
 * BEHAVIOR LOG CARD COMPONENT
 * ============================================
 * 
 * Purpose: Displays a single behavior log in a card format
 * Features:
 * - Severity-based color coding (Low, Medium, High)
 * - Left border accent based on severity
 * - Severity icon and badge
 * - Log ID display
 * - Description with proper line height
 * - Reporter name and date
 * - View Details action button
 * - Role-based theming (parent)
 * - Responsive layout
 * 
 * Dependencies:
 * - lucide-react for icons (CalendarDays, User, Eye, ShieldAlert, ShieldCheck, AlertTriangle)
 * - @/components/ui/Card for container
 * - @/components/ui/Button for action button
 * 
 * Usage:
 * <BehaviorLogCard
 *   log={logData}
 *   onView={handleView}
 * />
 * ============================================
 */

import {
  CalendarDays,
  User,
  Eye,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

/**
 * ============================================
 * SEVERITY CONFIGURATION
 * ============================================
 * 
 * Maps severity levels to visual properties
 * - Low: Green (ShieldCheck)
 * - Medium: Yellow (AlertTriangle)
 * - High: Red (ShieldAlert)
 * 
 * @constant {Object} severityConfig
 * @property {Component} icon - Lucide icon component
 * @property {string} color - Text color class
 * @property {string} bg - Background color class
 * @property {string} badge - Badge color classes
 * @property {string} border - Left border color class
 */
const severityConfig = {
  Low: {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-100",
    badge: "bg-green-100 text-green-700",
    border: "border-l-green-500",
  },
  Medium: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    badge: "bg-yellow-100 text-yellow-700",
    border: "border-l-yellow-500",
  },
  High: {
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-100",
    badge: "bg-red-100 text-red-700",
    border: "border-l-red-500",
  },
};

/**
 * ============================================
 * BEHAVIOR LOG CARD COMPONENT
 * ============================================
 * 
 * Renders a behavior log in a card format with severity theming
 * 
 * @param {Object} props - Component props
 * @param {Object} props.log - Behavior log object
 * @param {number} props.log.id - Log ID
 * @param {string} props.log.severity - Severity level (Low, Medium, High)
 * @param {string} props.log.description - Behavior description
 * @param {string} props.log.reported_by_name - Name of the reporter
 * @param {string} props.log.date - Date of the behavior log
 * @param {Function} props.onView - Callback when View Details is clicked
 * @returns {JSX.Element} Behavior log card UI
 * 
 * @example
 * const log = {
 *   id: 1,
 *   severity: 'High',
 *   description: 'Disruptive behavior in class',
 *   reported_by_name: 'Mr. John Smith',
 *   date: '2024-01-15'
 * };
 * 
 * <BehaviorLogCard
 *   log={log}
 *   onView={(log) => openDetailsModal(log)}
 * />
 * ============================================
 */
const BehaviorLogCard = ({
  log,
  onView,
}) => {
  /**
   * ============================================
   * SEVERITY CONFIGURATION LOOKUP
   * ============================================
   * 
   * Gets the configuration for the log's severity
   * Falls back to Low severity if not found
   */
  const config = severityConfig[log.severity] || severityConfig.Low;
  const Icon = config.icon;

  return (
    <Card
      hover={false}
      className={`border-l-4 ${config.border}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* ============================================
            LEFT SECTION
            Icon, details, and metadata
            ============================================ */}

        <div className="flex flex-1 gap-4">
          {/* ─── Severity Icon ─── */}
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-xl ${config.bg}`}
          >
            <Icon size={24} className={config.color} />
          </div>

          {/* ─── Log Details ─── */}
          <div className="flex-1">
            {/* Header: Severity Badge + ID */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
              >
                {log.severity}
              </span>
              <span className="text-sm text-text-secondary">
                #{log.id}
              </span>
            </div>

            {/* Description */}
            <p className="mt-3 leading-7 text-text-primary">
              {log.description}
            </p>

            {/* Metadata: Reporter + Date */}
            <div className="mt-5 flex flex-wrap gap-5 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <User size={16} />
                {log.reported_by_name}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={16} />
                {new Date(log.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            RIGHT SECTION
            Action button
            ============================================ */}

        <div className="flex flex-col items-end gap-3">
          <Button
            size="sm"
            tone="parent"
            leftIcon={<Eye size={16} />}
            onClick={() => onView(log)}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BehaviorLogCard;