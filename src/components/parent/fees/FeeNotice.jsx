/**
 * ============================================
 * FEE NOTICE COMPONENT
 * ============================================
 * 
 * Purpose: Displays payment reminder and fee policy information
 * Features:
 * - Payment reminder message
 * - Fee policy information
 * - Secure payment processing notice
 * - Icon with color coding
 * - Role-based theming (parent)
 * - Responsive card layout
 * 
 * Dependencies:
 * - lucide-react for icons (Info, Clock3)
 * - @/components/ui/Card for container
 * 
 * Usage:
 * <FeeNotice />
 * ============================================
 */

import {
  Info,
  Clock3,
} from "lucide-react";

import Card from '@/components/ui/Card';

/**
 * ============================================
 * FEE NOTICE COMPONENT
 * ============================================
 * 
 * Renders a fee payment reminder and policy notice
 * 
 * @returns {JSX.Element} Fee notice UI
 * 
 * @example
 * // In parent fee management
 * <FeeNotice />
 * ============================================
 */
const FeeNotice = () => {
  return (
    <Card hover={false}>
      <div className="flex items-start gap-4">
        {/* ─── Icon ────────────────────────────────────────────────── */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-parent-light">
          <Info size={22} className="text-parent-primary" />
        </div>

        {/* ─── Content ────────────────────────────────────────────── */}
        <div className="flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary">
            Payment Reminder
          </h3>

          {/* Description */}
          <p className="mt-2 leading-7 text-text-secondary">
            Please ensure that all outstanding fee invoices are paid before
            their due dates. Late payments may result in additional charges
            according to the school's fee policy.
          </p>

          {/* ─── Payment Security Notice ──────────────────────────── */}
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-parent-border bg-parent-light/30 px-4 py-3">
            <Clock3 size={18} className="text-parent-primary" />
            <span className="text-sm font-medium text-text-primary">
              Payments are processed securely through Stripe.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeeNotice;