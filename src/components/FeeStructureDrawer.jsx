/**
 * ============================================
 * FEE STRUCTURE DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Displays fee structures in a sliding drawer
 * Features:
 * - List of fee structures with class names
 * - Monthly fee display with currency formatting
 * - Edit button for each structure
 * - Class name lookup from class_section ID
 * - Empty state when no structures exist
 * - Responsive drawer layout
 * - Admin-themed styling
 * 
 * Dependencies:
 * - lucide-react for icons (Edit)
 * - @/components/ui/Button for action buttons
 * - @/components/admin/Drawer for sliding panel
 * - @/utils/helpers for formatting utilities
 * 
 * Usage:
 * <FeeStructureDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   feeStructures={feeStructures}
 *   classes={classList}
 *   onEditStructure={handleEditStructure}
 * />
 * ============================================
 */

import { Edit } from 'lucide-react';
import Button from "@/components/ui/Button";
import Drawer from "@/components/admin/Drawer";
import { formatCurrency } from "@/utils/helpers";

/**
 * ============================================
 * FEE STRUCTURE DRAWER COMPONENT
 * ============================================
 * 
 * Renders a drawer displaying fee structures with edit actions
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls drawer visibility
 * @param {Function} props.onClose - Callback function to close the drawer
 * @param {Array} props.feeStructures - Array of fee structure objects
 * @param {Array} props.classes - Array of class objects for lookup
 * @param {Function} props.onEditStructure - Callback function when edit button is clicked
 * @returns {JSX.Element} Fee structure drawer UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const feeStructures = [
 *   { id: 1, class_section: 1, monthly_fee: 5000 },
 *   { id: 2, class_section: 2, monthly_fee: 6000 }
 * ];
 * const classes = [{ id: 1, class_name: '10', section: 'A' }];
 * 
 * <FeeStructureDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   feeStructures={feeStructures}
 *   classes={classes}
 *   onEditStructure={(structure) => openEditDrawer(structure)}
 * />
 * ============================================
 */
export default function FeeStructureDrawer({
  isOpen,
  onClose,
  feeStructures,
  classes,  
  onEditStructure,
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
    const cls = classes.find((c) => c.id === classSectionId);
    return cls ? `${cls.class_name}-${cls.section}` : `Class ${classSectionId}`;
  };

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Fee Structure"
      width="max-w-[400px]"
      footer={
        // ─── Drawer Footer with Close Button ───
        <Button variant="outline" tone="admin" fullWidth onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-3">
        {feeStructures.length === 0 ? (
          // ─── Empty State ───
          <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
            No fee structures found.
          </p>
        ) : (
          // ─── Fee Structure List ───
          feeStructures.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 bg-[var(--color-surface-dim)] rounded-lg border border-gray-200"
            >
              {/* Class display name */}
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {getClassDisplay(s.class_section)} 
              </span>
              
              {/* Fee amount and edit button */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--color-admin-primary)]">
                  {formatCurrency(s.monthly_fee)}
                </span>
                <button
                  onClick={() => onEditStructure(s)}
                  className="p-1 rounded-lg text-gray-400 hover:text-[var(--color-admin-primary)] hover:bg-[var(--color-admin-light)] transition-colors"
                  title="Edit fee structure"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
}