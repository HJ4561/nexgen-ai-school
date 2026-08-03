/**
 * ============================================
 * FEE SUMMARY CARDS COMPONENT (STUDENT VIEW)
 * ============================================
 * 
 * Purpose: Displays fee summary statistics in a grid of metric cards
 * Features:
 * - Total payable amount
 * - Total paid amount with percentage bar
 * - Remaining due amount with percentage bar
 * - Next due date with urgency indicator
 * - Color-coded cards based on urgency
 * - Animated progress bars
 * - Hover effects with ambient glow
 * - Responsive grid layout (1/2/4 columns)
 * - Student role theming
 * 
 * Dependencies:
 * - lucide-react for icons (Wallet, CreditCard, AlertCircle, CalendarClock)
 * 
 * Usage:
 * <FeeSummaryCards fees={feesList} />
 * ============================================
 */

import { useMemo } from "react";
import { Wallet, CreditCard, AlertCircle, CalendarClock } from "lucide-react";

/**
 * ============================================
 * METRIC CARD SUB-COMPONENT
 * ============================================
 * 
 * Renders a single metric card with icon, value, and optional progress bar
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Metric value
 * @param {string} props.footer - Footer text
 * @param {Component} props.icon - Lucide icon component
 * @param {Array} props.colors - Gradient color array
 * @param {number} props.share - Optional progress percentage (0-100)
 * @returns {JSX.Element} Metric card UI
 */
const MetricCard = ({ label, value, footer, icon: Icon, colors, share }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-student-border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
    {/* ─── Ambient Glow ─── */}
    <div
      aria-hidden
      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    />

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-slate-800">{value}</p>
      </div>
      {/* ─── Icon Container ─── */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      >
        <Icon size={20} strokeWidth={2.25} />
      </div>
    </div>

    <div className="relative mt-4 space-y-1.5">
      {/* ─── Progress Bar (optional) ─── */}
      {share !== undefined && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, share))}%`, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }}
          />
        </div>
      )}
      <p className="text-sm font-medium text-slate-500">{footer}</p>
    </div>
  </div>
);

/**
 * ============================================
 * FEE SUMMARY CARDS COMPONENT
 * ============================================
 * 
 * Renders fee summary statistics in a grid of metric cards
 * 
 * @param {Object} props - Component props
 * @param {Array} props.fees - Array of fee objects
 * @returns {JSX.Element} Fee summary cards UI
 * 
 * @example
 * const fees = [
 *   { id: 1, amount: 5000, amount_paid: 5000, status: 'Paid', due_date: '2024-01-31' },
 *   { id: 2, amount: 5000, amount_paid: 0, status: 'Pending', due_date: '2024-02-28' }
 * ];
 * 
 * <FeeSummaryCards fees={fees} />
 * ============================================
 */
function FeeSummaryCards({ fees = [] }) {
  /**
   * ============================================
   * SUMMARY CALCULATIONS
   * ============================================
   * 
   * Calculates fee summary statistics:
   * - totalPayable: Sum of all fee amounts
   * - totalPaid: Sum of all paid amounts
   * - remainingDue: Total payable minus total paid
   * - paidShare: Percentage of total paid
   * - dueShare: Percentage of remaining due
   * - nextDue: The next unpaid fee's due date
   * - daysUntilNextDue: Days until the next due date
   */
  const summary = useMemo(() => {
    // ─── Totals ──────────────────────────────────────────────────
    const totalPayable = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
    const totalPaid = fees.reduce((sum, fee) => sum + Number(fee.amount_paid), 0);
    const remainingDue = totalPayable - totalPaid;

    // ─── Next Due ──────────────────────────────────────────────────
    // Find the next unpaid fee (sorted by due date)
    const nextDueFee = fees
      .filter((fee) => fee.status !== "Paid")
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

    // ─── Percentages ──────────────────────────────────────────────
    const paidShare = totalPayable ? (totalPaid / totalPayable) * 100 : 0;
    const dueShare = totalPayable ? (remainingDue / totalPayable) * 100 : 0;

    // ─── Days Until Next Due ──────────────────────────────────────
    const daysUntilNextDue = nextDueFee
      ? Math.ceil((new Date(nextDueFee.due_date) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      totalPayable,
      totalPaid,
      remainingDue,
      paidShare,
      dueShare,
      daysUntilNextDue,
      nextDue: nextDueFee?.due_date ?? "-",
    };
  }, [fees]);

  /**
   * ============================================
   * DUE URGENCY COLORS
   * ============================================
   * 
   * Determines the color scheme for the "Next Due Date" card
   * based on how many days remain until the next due date:
   * - Overdue: Red
   * - Due within 7 days: Amber
   * - Due in 7+ days: Blue
   * - No pending fees: Blue
   */
  const dueUrgencyColors =
    summary.daysUntilNextDue === null
      ? ["#38BDF8", "#2563EB"] // No pending fees
      : summary.daysUntilNextDue < 0
      ? ["#FB7185", "#E11D48"] // Overdue
      : summary.daysUntilNextDue <= 7
      ? ["#FBBF24", "#D97706"] // Due soon
      : ["#38BDF8", "#2563EB"] // Due later

  /**
   * ============================================
   * DUE FOOTER TEXT
   * ============================================
   * 
   * Generates appropriate footer text based on due date status
   */
  const dueFooter =
    summary.nextDue === "-"
      ? "No pending fees"
      : summary.daysUntilNextDue < 0
      ? `${Math.abs(summary.daysUntilNextDue)}d overdue`
      : summary.daysUntilNextDue === 0
      ? "Due today"
      : `In ${summary.daysUntilNextDue} day(s)`;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {/* ─── Total Payable ─── */}
      <MetricCard
        label="Total Payable"
        value={`Rs. ${summary.totalPayable.toLocaleString()}`}
        footer="Academic Year"
        icon={Wallet}
        colors={["#818CF8", "#6366F1"]}
      />

      {/* ─── Total Paid ─── */}
      <MetricCard
        label="Total Paid"
        value={`Rs. ${summary.totalPaid.toLocaleString()}`}
        footer={`${Math.round(summary.paidShare)}% of total`}
        icon={CreditCard}
        colors={["#34D399", "#0D9488"]}
        share={summary.paidShare}
      />

      {/* ─── Remaining Due ─── */}
      <MetricCard
        label="Remaining Due"
        value={`Rs. ${summary.remainingDue.toLocaleString()}`}
        footer={summary.remainingDue > 0 ? `${Math.round(summary.dueShare)}% outstanding` : "Fully paid"}
        icon={AlertCircle}
        colors={summary.remainingDue > 0 ? ["#FBBF24", "#D97706"] : ["#34D399", "#0D9488"]}
        share={summary.dueShare}
      />

      {/* ─── Next Due Date ─── */}
      <MetricCard
        label="Next Due Date"
        value={
          summary.nextDue === "-"
            ? "-"
            : new Date(summary.nextDue).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
        }
        footer={dueFooter}
        icon={CalendarClock}
        colors={dueUrgencyColors}
      />
    </div>
  );
}

export default FeeSummaryCards;