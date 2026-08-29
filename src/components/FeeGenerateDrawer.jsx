/**
 * ============================================
 * FEE GENERATE DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Generate fee challans for students in a sliding drawer
 * Features:
 * - Fee generation summary with statistics
 * - Month picker for fee period
 * - Class selection (optional, defaults to all classes)
 * - Preview of challans to be generated
 * - Generation summary display
 * - Loading state during generation
 * - Disabled state when no students available
 * - Responsive drawer layout
 * 
 * Dependencies:
 * - lucide-react for icons (Receipt, Users, AlertCircle)
 * - @/components/ui/Button for action buttons
 * - @/components/admin/Drawer for sliding panel
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <FeeGenerateDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   stats={feeStats}
 *   generationSummary={summary}
 *   onGenerate={handleGenerate}
 *   loading={isGenerating}
 * />
 * ============================================
 */

import React, { useState } from 'react';
import { Receipt, Users, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Drawer from "@/components/admin/Drawer";
import { formatCurrency } from "@/utils/helpers";

/**
 * ============================================
 * FEE GENERATE DRAWER COMPONENT
 * ============================================
 * 
 * Renders a drawer for generating fee challans
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Object} props.stats - Fee statistics object
 * @param {number} props.stats.total - Total number of students
 * @param {number} props.stats.pending - Number of students with pending fees
 * @param {number} props.stats.paid - Number of students with paid fees
 * @param {number} props.stats.totalAmount - Total fee amount
 * @param {number} props.stats.pendingAmount - Total pending fee amount
 * @param {Object} props.generationSummary - Summary of challans to be generated
 * @param {Function} props.onGenerate - Callback function to generate challans
 * @param {boolean} props.loading - Loading state for generation operation
 * @returns {JSX.Element} Fee generation drawer UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <FeeGenerateDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   stats={{ total: 50, pending: 20, paid: 30, pendingAmount: 50000 }}
 *   generationSummary={{ total: 20, students: 20 }}
 *   onGenerate={({ classId, month }) => generateChallans(classId, month)}
 *   loading={isGenerating}
 * />
 * ============================================
 */
export default function FeeGenerateDrawer({ 
  isOpen, 
  onClose, 
  stats = { total: 0, pending: 0, paid: 0, totalAmount: 0, pendingAmount: 0 },
  generationSummary, 
  onGenerate, 
  loading 
}) {
  // ─── State Management ───
  const [selectedClass, setSelectedClass] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  /**
   * ============================================
   * HANDLE GENERATE
   * ============================================
   * 
   * Triggers the generation callback with selected class and month
   */
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate({ classId: selectedClass, month });
    }
  };

  // ─── Statistics Extraction ───
  const totalStudents = stats?.total || 0;
  const pendingStudents = stats?.pending || 0;
  const paidStudents = stats?.paid || 0;
  const pendingAmount = stats?.pendingAmount || 0;

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Generate Fee Challans"
      width="max-w-md"
      footer={
        // ─── Drawer Footer with Action Buttons ───
        <div className="flex gap-3">
          <Button
            variant="outline"
            tone="admin"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            tone="admin"
            fullWidth
            onClick={handleGenerate}
            disabled={loading || totalStudents === 0}
            leftIcon={<Receipt size={16} />}
          >
            {loading ? 'Generating...' : 'Generate Challans'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ─── Summary Card ─── */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <AlertCircle size={18} />
            <span className="font-semibold">Generation Summary</span>
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-blue-600">Total Students</p>
              <p className="font-bold text-blue-800">{totalStudents}</p>
            </div>
            <div>
              <p className="text-green-600">Paid</p>
              <p className="font-bold text-green-800">{paidStudents}</p>
            </div>
            <div>
              <p className="text-yellow-600">Pending</p>
              <p className="font-bold text-yellow-800">{pendingStudents}</p>
            </div>
          </div>
          
          {/* Pending Amount */}
          {pendingAmount > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                Pending Amount: <span className="font-bold">{formatCurrency(pendingAmount)}</span>
              </p>
            </div>
          )}
        </div>

        {/* ─── Month Picker ─── */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Month <span className="text-danger">*</span>
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-admin-primary/20 outline-none text-sm"
          />
        </div>

        {/* ─── Class Selector ─── */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Class (Optional)
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-admin-primary/20 outline-none text-sm"
          >
            <option value="">All Classes</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
          </select>
        </div>

        {/* ─── Generation Preview ─── */}
        {generationSummary && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <p className="text-sm text-green-700">
              {generationSummary.total || 0} challans will be generated for {generationSummary.students || 0} students.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}