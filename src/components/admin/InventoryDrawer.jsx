/**
 * ============================================
 * INVENTORY DRAWER COMPONENT
 * ============================================
 * 
 * Purpose: Add or edit inventory items in a modal drawer
 * Features:
 * - Add/Edit mode switching
 * - Item name input
 * - Category selection dropdown
 * - Quantity input with number validation
 * - Assigned room input
 * - Form state management
 * - Loading state for save operation
 * - Cancel and Save actions
 * - Responsive modal layout
 * 
 * Dependencies:
 * - @/components/ui/Modal for modal container
 * - @/components/ui/Button for action buttons
 * - @/components/ui/Input for form fields
 * - @/components/ui/Select for category dropdown
 * 
 * Usage:
 * <InventoryDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   mode={mode}
 *   formData={formData}
 *   setFormData={setFormData}
 *   onSave={handleSave}
 *   loading={isSaving}
 * />
 * ============================================
 */

import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

/**
 * ============================================
 * INVENTORY DRAWER COMPONENT
 * ============================================
 * 
 * Renders a modal drawer for adding/editing inventory items
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function to close the modal
 * @param {string} props.mode - Current mode ('add' | 'edit')
 * @param {Object} props.formData - Form data object containing inventory fields
 * @param {Function} props.setFormData - Setter function for form data
 * @param {Function} props.onSave - Callback function to save the inventory item
 * @param {boolean} props.loading - Loading state for save operation
 * @returns {JSX.Element} Inventory drawer modal UI
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * const [mode, setMode] = useState('add');
 * const [formData, setFormData] = useState({
 *   item_name: '',
 *   category: '',
 *   total_quantity: '',
 *   assigned_to_room: ''
 * });
 * 
 * <InventoryDrawer
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   mode={mode}
 *   formData={formData}
 *   setFormData={setFormData}
 *   onSave={handleSave}
 *   loading={isSaving}
 * />
 * ============================================
 */
const InventoryDrawer = ({ isOpen, onClose, mode, formData, setFormData, onSave, loading }) => {
  /**
   * ============================================
   * CATEGORY OPTIONS
   * ============================================
   * 
   * Available inventory categories for the dropdown
   * 
   * @constant {Array} categories
   */
  const categories = ['Electronics', 'Furniture', 'Supplies', 'Equipment', 'Books', 'Sports', 'Uniform', 'Other'];

  /**
   * ============================================
   * HANDLE FIELD CHANGE
   * ============================================
   * 
   * Updates form data for a specific field
   * 
   * @param {string} field - The field name to update
   * @param {*} value - The new value for the field
   */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={mode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
    >
      <div className="space-y-4">
        {/* ─── Item Name ─── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <Input
            value={formData.item_name || ''}
            onChange={(e) => handleChange('item_name', e.target.value)}
            placeholder="Enter item name"
          />
        </div>

        {/* ─── Category ─── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Select
            value={formData.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>

        {/* ─── Quantity ─── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <Input
            type="number"
            value={formData.total_quantity || ''}
            onChange={(e) => handleChange('total_quantity', e.target.value)}
            placeholder="Enter quantity"
            min="0"
          />
        </div>

        {/* ─── Assigned Room ─── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Room</label>
          <Input
            value={formData.assigned_to_room || ''}
            onChange={(e) => handleChange('assigned_to_room', e.target.value)}
            placeholder="Enter room number"
          />
        </div>

        {/* ─── Footer with Action Buttons ─── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            tone="admin"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Update Item'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryDrawer;