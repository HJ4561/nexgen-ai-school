/**
 * ============================================
 * FEE STATS CARDS COMPONENT
 * ============================================
 * 
 * Purpose: Displays fee statistics in a grid of cards
 * Features:
 * - Payment distribution pie chart with legend
 * - Generate challans card with stats and action
 * - Fee structure management card
 * - Generation result display with success/warning states
 * - Role-based styling
 * - Responsive grid layout
 * - Class name lookup for fee structures
 * 
 * Dependencies:
 * - lucide-react for icons (Receipt, DollarSign, Edit, CheckCircle)
 * - recharts for pie chart visualization
 * - @/components/ui/Button for action buttons
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <FeeStatsCards
 *   stats={feeStats}
 *   chartData={pieChartData}
 *   classes={classList}
 *   feeStructures={feeStructures}
 *   onGenerateClick={handleGenerate}
 *   generationResult={generationResult}
 *   onManageStructureClick={handleManageStructure}
 * />
 * ============================================
 */

import { Receipt, DollarSign, Edit, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/utils/helpers";

/**
 * ============================================
 * FEE STATS CARDS COMPONENT
 * ============================================
 * 
 * Renders fee statistics in a visual card layout
 * 
 * @param {Object} props - Component props
 * @param {Object} props.stats - Fee statistics object
 * @param {number} props.stats.total - Total number of challans
 * @param {number} props.stats.unpaid - Number of unpaid challans
 * @param {Array} props.chartData - Data for payment distribution pie chart
 * @param {Array} props.classes - Array of class objects for lookup
 * @param {Array} props.feeStructures - Array of fee structure objects
 * @param {Function} props.onGenerateClick - Callback for generate challans action
 * @param {Object} props.generationResult - Result of generation operation
 * @param {Function} props.onManageStructureClick - Callback for manage structure action
 * @returns {JSX.Element} Fee stats cards UI
 * 
 * @example
 * const stats = { total: 150, unpaid: 45 };
 * const chartData = [
 *   { name: 'Paid', value: 105, color: '#22c55e' },
 *   { name: 'Unpaid', value: 45, color: '#ef4444' }
 * ];
 * const feeStructures = [{ id: 1, class_section: 1, monthly_fee: 5000 }];
 * 
 * <FeeStatsCards
 *   stats={stats}
 *   chartData={chartData}
 *   classes={classes}
 *   feeStructures={feeStructures}
 *   onGenerateClick={() => openGenerateDrawer()}
 *   generationResult={result}
 *   onManageStructureClick={() => openStructureDrawer()}
 * />
 * ============================================
 */
export default function FeeStatsCards({
  stats,
  chartData,
  classes,
  feeStructures,
  onGenerateClick,
  generationResult,
  onManageStructureClick,
}) {
  /**
   * ============================================
   * GET CLASS DISPLAY NAME
   * ============================================
   * 
   * Looks up class name and section from class_section ID
   * Returns formatted string "Class-Section" or fallback
   * 
   * @param {number} classSectionId - The class section ID
   * @returns {string} Formatted class display name
   */
  const getClassDisplay = (classSectionId) => {
    if (!classSectionId) return 'Unknown';
    const cls = classes?.find((c) => c.id === classSectionId);
    return cls ? `${cls.class_name}-${cls.section}` : `Class ${classSectionId}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* ─── Card 1: Payment Distribution ─── */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
        <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
          Payment Distribution
        </h4>
        <div className="flex items-center gap-4">
          {/* Pie Chart */}
          <div className="w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={22}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${value} students`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[var(--color-text-muted)]">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Card 2: Generate Challans ─── */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={16} className="text-[var(--color-admin-primary)]" />
          <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
            Generate Challans
          </h4>
        </div>

        {/* ─── Generation Result Display ─── */}
        {generationResult ? (
          <div className="space-y-2 bg-[var(--color-success-bg)] p-3 rounded-lg border border-[var(--color-success)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-success)]">
              <CheckCircle size={14} /> Generation Complete
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Created</span>
              <span className="font-bold text-[var(--color-success)]">{generationResult.created}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">Skipped (already existed)</span>
              <span className="font-bold text-[var(--color-warning)]">{generationResult.skipped_existing}</span>
            </div>
          </div>
        ) : (
          /* ─── Statistics Display ─── */
          <div className="space-y-2">
            <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
              <span className="text-[var(--color-text-muted)]">Total Challans</span>
              <span className="font-medium">{stats.total}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-100 pb-1.5">
              <span className="text-[var(--color-text-muted)]">Unpaid</span>
              <span className="font-medium text-[var(--color-danger)]">{stats.unpaid}</span>
            </div>
          </div>
        )}
        
        {/* Generate Button */}
        <Button
          variant="primary"
          tone="admin"
          fullWidth
          size="sm"
          leftIcon={<Receipt size={14} />}
          onClick={onGenerateClick}
          className="mt-3"
        >
          Generate Challans
        </Button>
      </div>

      {/* ─── Card 3: Fee Structure ─── */}
      <div className="bg-white rounded-xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-[var(--color-teacher-primary)]" />
            <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">Fee Structure</h4>
          </div>
          <Button
            variant="outline"
            tone="admin"
            size="sm"
            leftIcon={<Edit size={12} />}
            onClick={onManageStructureClick}
          >
            Manage
          </Button>
        </div>
        
        {/* Fee Structure List */}
        <div className="space-y-1.5">
          {feeStructures.slice(0, 4).map((s) => (
            <div key={s.id} className="flex justify-between text-xs">
              <span className="text-[var(--color-text-muted)]">
                {getClassDisplay(s.class_section)}
              </span>
              <span className="font-medium">{formatCurrency(s.monthly_fee)}</span>
            </div>
          ))}
          {feeStructures.length > 4 && (
            <p className="text-[10px] text-[var(--color-admin-primary)] cursor-pointer hover:underline text-center">
              + {feeStructures.length - 4} more classes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}